import exif from './exif'

import {
  InterfaceLayoutStyle,
  InterfaceModeHandle,
  InterfaceRenderImgLayout,
  InterfaceAxis,
  InterfaceLayout,
  InterfaceImgAxis,
} from './interface'

// 图片方向校验
import Conversion from './conversion'
const conversion = new Conversion()

// 图片布局
import layout from './layoutBox'

// 加载图片方法
export const loadImg = async (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
    // 判断如果不是base64图片 再添加crossOrigin属性，否则会导致iOS低版本(10.2)无法显示图片
    if (url.substr(0, 4) !== 'data') {
      img.crossOrigin = ''
    }
  })
}

// 获取图片的 orientation角度
export const getExif = (img: HTMLImageElement): Promise<any> => {
  return exif.getData(img)
}

// 重置图片
export const resetImg = (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  orientation: number,
): HTMLCanvasElement => {
  return (canvas = conversion.render(img, canvas, orientation))
}

// 给出图片的大小和容器大小 还有布局方式， 返回布局。
export const createImgStyle = (
  imgStyle: InterfaceLayoutStyle,
  layoutStyle: InterfaceLayoutStyle,
  mode: keyof InterfaceModeHandle,
): number => {
  return layout(imgStyle, layoutStyle, mode)
}

export const translateStyle = (style: InterfaceRenderImgLayout, axis?: InterfaceAxis): any => {
  const { scale, imgStyle, layoutStyle, rotate } = style
  const curStyle = {
    width: scale * imgStyle.width,
    height: scale * imgStyle.height,
  }
  // 图片坐标， 如果不传坐标， 默认是居中布局
  let x = (layoutStyle.width - curStyle.width) / 2
  let y = (layoutStyle.height - curStyle.height) / 2

  if (axis) {
    x = axis.x
    y = axis.y
  }

  // 通过坐标轴 计算图片的布局， 默认不旋转的计算
  // const left = x / scale
  // const top = y / scale
  const left = ((curStyle.width - imgStyle.width) / 2 + x) / scale
  const top = ((curStyle.height - imgStyle.height) / 2 + y) / scale

  // console.log(imgStyle, layoutStyle, curStyle, left, top, 'x--y-', x, y)
  return {
    imgExhibitionStyle: {
      width: `${imgStyle.width}px`,
      height: `${imgStyle.height}px`,
      transform: `scale(${scale}, ${scale}) translate3d(${left}px, ${top}px, 0px) rotateZ(${rotate}deg)`,
    },
    // 返回左上角的坐标轴
    imgAxis: {
      x,
      y,
      scale,
      rotate,
    },
  }
}

// 加载文件函数
export const loadFile = async (file: File): Promise<any> => {
  if (!file) {
    return ''
  }

  if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(file.name)) {
    alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
    return ''
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event: Event) => {
      let data: string = ''
      const targetTwo = event.target as FileReader
      if (typeof targetTwo.result === 'object' && targetTwo.result) {
        data = window.URL.createObjectURL(new Blob([targetTwo.result]))
      } else {
        data = targetTwo.result as string
      }
      resolve(data)
    }
    reader.onerror = reject
    // 转化为blob
    reader.readAsArrayBuffer(file)
  })
}

/**
 * #### 获取绘制了图片的 canvas, 不旋转为图片大小，
 * #### 旋转则为 Math.sqrt(width * width + height * height)
 * @param { image, imgLayout, rotate, scale }
 * @return { HTMLCanvasElement }
 */
export const getImgCanvas = (
  img: HTMLImageElement,
  imgLayout: InterfaceLayoutStyle,
  rotate: number = 0,
  scale: number = 1,
): HTMLCanvasElement => {
  // 图片放在外部加载 这里不处理图片加载
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  let { width, height } = imgLayout
  let dx = 0
  let dy = 0
  let max = 0

  width = width * scale
  height = height * scale

  canvas.width = width
  canvas.height = height

  if (rotate) {
    // 坐标  nx = (x - cx) * cos A - (y - cy) * sinA   ny = (y - cy) * cosA + (x - cx) * sinA
    // 表示存在角度
    max = Math.ceil(Math.sqrt(width * width + height * height))
    canvas.width = max
    canvas.height = max
    ctx.translate(max / 2, max / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    dx = -max / 2 + (max - width) / 2
    dy = -max / 2 + (max - height) / 2
  }

  ctx.drawImage(img, dx, dy, width, height)
  ctx.restore()
  // console.log(canvas, dx, dy)
  // document.body.append(canvas)
  return canvas
}

/**
 * 生成最终截图函数
 * @param options
 */
export const getCropImgData = async (options: any): Promise<string> => {
  const { url, imgLayout, imgAxis, cropAxis, cropLayout, outputType, cropping } = options
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  // 加载图片
  let img: HTMLImageElement
  try {
    img = await loadImg(url)
  } catch (e) {
    console.log(e)
    img = new Image()
  }
  return new Promise((resolve, reject) => {
    try {
      // 从这里开始对图片进行处理
      const imgCanvas = getImgCanvas(img, imgLayout, imgAxis.rotate, imgAxis.scale)
      // 计算绘制图片的偏移
      let dx = imgAxis.x - cropAxis.x
      // 图片y轴偏移
      let dy = imgAxis.y - cropAxis.y
      let width = cropLayout.width
      let height = cropLayout.height

      if (!cropping) {
        // 没有截图框
        width = imgCanvas.width
        height = imgCanvas.height
        dx = 0
        dy = 0
      }

      if (imgAxis.rotate && cropping) {
        // 表示有旋转 同时是截图, 因为 canvas 是放大了的 ，那么 x 轴和  y 轴需要偏移
        dx -= (imgCanvas.width - imgLayout.width * imgAxis.scale) / 2
        dy -= (imgCanvas.height - imgLayout.height * imgAxis.scale) / 2
      }

      canvas.width = width
      canvas.height = height

      // 是否填充背景颜色 transparent
      const fillColor = 'transparent'
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, width, height)

      // 绘制图片
      ctx.drawImage(imgCanvas, dx, dy, imgCanvas.width, imgCanvas.height)
      ctx.restore()
      // 输出图片
      const res = canvas.toDataURL(`image/${outputType}`, 1)
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 边界计算函数 -> 返回图片应该要放大到多少，以及各个方向的最大坐标点
 * @param  { cropAxis, cropLayout, imgAxis, imgLayout}
 * @return { top, right, bottom, left, scale}
 */
export const boundaryCalculation = (
  cropAxis: InterfaceAxis,
  cropLayout: InterfaceLayoutStyle,
  imgAxis: InterfaceImgAxis,
  imgLayout: InterfaceLayoutStyle,
) => {
  console.log(cropAxis, cropLayout, imgAxis, imgLayout)
}

/**
 * 边界校验函数, 截图框应该被包裹在容器里面
 * @param  { cropAxis, cropLayout, imgAxis, imgLayout}
 * 返回参数 包括是否在边界内， 以及需要往哪个方向进行回弹
 * 如果判断图片够不够大，是否进行放大处理， 即宽度 高度要比截图框大
 * 截图的 x 小于 图片的 x  那么图片需要往左移动
 * 截图框的 x + w  大于 图片的 x + w 那么图片需要右移
 * 截图 y 小于 图片的 y  那么图片上移
 * 截图的 y + h 大于 图片的 y + h 图片需要下移
 * @return
 */

export const detectionBoundary = (
  cropAxis: InterfaceAxis,
  cropLayout: InterfaceLayoutStyle,
  imgAxis: InterfaceImgAxis,
  imgLayout: InterfaceLayoutStyle,
) => {
  const imgWidth = imgLayout.width * imgAxis.scale
  const imgHeight = imgLayout.height * imgAxis.scale
  // 横向的方向
  let landscape = ''
  // 纵向的方向
  let portrait = ''
  // 判断横向
  if (cropAxis.x < imgAxis.x) {
    // 图片需要左移
    landscape = 'left'
  }

  if (cropAxis.x + cropLayout.width > imgAxis.x + imgWidth) {
    // 图片需要右移
    landscape = 'right'
  }

  if (cropAxis.y < imgAxis.y) {
    // 图片需上
    portrait = 'top'
  }

  if (cropAxis.y + cropLayout.height > imgAxis.y + imgHeight) {
    // 图片需下
    portrait = 'bottom'
  }
  return {
    landscape,
    portrait,
  }
}
