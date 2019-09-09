import { Component, Model, Prop, Watch, Vue, Emit } from 'vue-property-decorator'

import { loadImg, getExif, resetImg } from './common'

import './style/index.scss'

import { InterfaceLayout, InterfaceImgload } from './interface'

@Component
export default class VueCropper extends Vue {
  // 高清屏的问题
  ratio = window.devicePixelRatio

  // 渲染图片的地址
  imgs = ''

  $refs!: {
    canvas: HTMLCanvasElement
  }

  // 图片属性
  @Prop({ default: '' }) img!: string

  // 外层容器宽高
  @Prop({
    default: () => ({
      width: '200px',
      height: '200px',
    }),
  })
  wrapper!: InterfaceLayout

  // 截图框主题色
  @Prop({ default: '#fff' })
  readonly color!: string

  // 滤镜函数
  @Prop({ default: null })
  readonly filter!: [Function, null]

  @Prop({ default: 'png' })
  readonly outputType!: string

  @Watch('img')
  onImgChanged(val: string) {
    if (val) {
      this.checkedImg(val)
    }
  }

  @Watch('filter')
  onFilterChanged(val: Function | null) {
    if (val) {
      this.checkedImg(this.img)
    }
  }

  // 消息通知
  @Emit('img-load')
  imgLoad(obj: InterfaceImgload): InterfaceImgload {
    return obj
  }

  created(): void {
    if (this.img) {
      this.checkedImg(this.img)
    } else {
      this.imgs = ''
    }
  }

  // 检查图片, 修改图片为正确角度
  async checkedImg(url: string) {
    let img: HTMLImageElement
    try {
      img = await loadImg(url)
      this.imgLoad({
        type: 'success',
        message: '图片加载成功',
      })
    } catch (error) {
      this.imgLoad({
        type: 'error',
        message: `图片加载失败${error}`,
      })
      return false
    }
    // console.log('图片加载成功')
    // 图片加载成功之后的操作 获取图片旋转角度
    let result = {
      orientation: 1,
    }
    try {
      result = await getExif(img)
    } catch (error) {
      console.log(error)
      result.orientation = 1
    }
    const orientation = result.orientation
    console.log(`图片加载成功,orientation为${orientation}`)

    let canvas: HTMLCanvasElement = document.createElement('canvas')
    try {
      canvas = await resetImg(img, canvas, orientation)
    } catch (error) {
      console.log(error)
    }

    if (this.filter) {
      canvas = this.filter(canvas)
    }

    canvas.toBlob(
      blob => {
        if (blob) {
          this.imgs = URL.createObjectURL(blob)
        } else {
          this.imgs = ''
        }
      },
      `image/${this.outputType}`,
      1,
    )
  }

  render() {
    return (
      <section class="vue-cropper">
        {this.imgs ? <img src={this.imgs} alt="vue-cropper" /> : ''}
      </section>
    )
  }
}
