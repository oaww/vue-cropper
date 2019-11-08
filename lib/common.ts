import exif from './exif'

import {
  InterfaceLayoutStyle,
  InterfaceModeHandle,
  InterfaceRenderImgLayout,
  InterfaceAxis,
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
      // 计算绘制图片的偏移
      let dx = imgAxis.x - cropAxis.x
      // 图片y轴偏移
      let dy = imgAxis.y - cropAxis.y
      let width = cropLayout.width
      let height = cropLayout.height
      // 没有截图框状态
      if (cropLayout.width === 0 || cropLayout.height === 0 || !cropping) {
        width = imgLayout.width * imgAxis.scale
        height = imgLayout.height * imgAxis.scale
        dx = 0
        dy = 0
      }
      canvas.width = width
      canvas.height = height

      // 是否填充背景颜色
      const fillColor = '#fff'
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, width, height)

      // console.log(width, height)
      // console.log(img, dx, dy, imgLayout.width * imgAxis.scale, imgLayout.height * imgAxis.scale)
      ctx.save()
      // 如果图片有角度
      if (imgAxis.rotate !== 0) {
        // 旋转的中心坐标, 实际上图片是绕自己的中心点去旋转的
        const tx = width / 2
        const ty = height / 2
        // 旋转的中心坐标,原点的

        // const tx = (imgAxis.x + imgLayout.width * imgAxis.scale / 2 + cropAxis.x + width / 2) / 2
        // const ty = (imgAxis.y+ imgLayout.height * imgAxis.scale / 2 + cropAxis.y + height / 2) / 2

        console.log(`对图片的角度进行处理, 角度为${imgAxis.rotate}`)
        ctx.translate(tx, ty)
        ctx.rotate((imgAxis.rotate * Math.PI) / 180)
        // 坐标轴的计算
        // 初始的图片坐标
        const ix = imgAxis.x
        const iy = imgAxis.y
        // 初始截图框坐标
        const cx = cropAxis.x
        const cy = cropAxis.y
        console.log(
          `处理之前的坐标轴: 旋转中心(${tx}, ${ty}), 图片坐标(${ix}, ${iy}), 截图框坐标(${cx}, ${cy})`,
        )
        /*
        计算坐标轴， 转化为极坐标方程
        ix = r * cosθ  iy = r * cosθ
        坐标（ix,iy)到（tx,ty)距离为r；则以（tx,ty)为圆心r为半径做圆，可知旋转θ角度后的x，y都在圆上
        点（ix, iy)对应圆方程为：
        ix - tx = r * cosθ1  ;   iy - ty = r * sinθ1  (注意这里圆心为（tx,ty)）
        变化后的点（x，y）对应圆方程为：
        x - tx = r * cos(θ1+ θ) = r * cosθ1 * cosθ -r * sinθ1 * sinθ =  (ix - tx) * cosθ - (iy - ty) * sinθ
        y - ty = r * sin(θ2 + θ) = r * sinθ1 * cosθ + r * cosθ1 * sinθ = (iy - ty) * cosθ + (ix - tx) * sinθ
        */
        const angel = (imgAxis.rotate * Math.PI) / 180
        // const newImgAxis: InterfaceAxis = {
        //   x: (ix - tx) * Math.cos(angel) - (iy - ty) * Math.sin(angel) + tx,
        //   y: (iy - ty) * Math.cos(angel) + (ix - tx) * Math.sin(angel) + ty
        // }

        // const newCropAxis: InterfaceAxis = {
        //   x: (cx - tx) * Math.cos(angel) - (cy - ty) * Math.sin(angel) + tx,
        //   y: (cy - ty) * Math.cos(angel) + (cx - tx) * Math.sin(angel) + ty
        // }
        // console.log(`处理之后的坐标轴: 图片坐标(${newImgAxis.x}, ${newImgAxis.y}), 截图框坐标(${newCropAxis.x}, ${newCropAxis.y})`)
        // const ndx = newImgAxis.x - newCropAxis.x
        // const ndy = newImgAxis.y - newCropAxis.y

        const ndx = (dx - tx) * Math.cos(angel) - (dy - ty) * Math.sin(angel) + tx
        const ndy = (dy - ty) * Math.cos(angel) + (dx - tx) * Math.sin(angel) + ty
        dx -= tx
        dy -= ty
        console.log(
          `正确的 dx ${dx}, 旋转轴计算的 dx ${ndx}, 正确的 dy ${dy}, 旋转轴计算的 dy ${ndy}`,
        )

        // dx = ndx
        // dy = ndy
      }
      // 图片平滑度 low|medium|high
      // ctx.imageSmoothingEnabled = true
      // ctx.imageSmoothingQuality = 'hight'

      // 绘制图片
      ctx.drawImage(img, dx, dy, imgLayout.width * imgAxis.scale, imgLayout.height * imgAxis.scale)
      ctx.restore()
      // 输出图片
      const res = canvas.toDataURL(`image/${outputType}`, 1)
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}
