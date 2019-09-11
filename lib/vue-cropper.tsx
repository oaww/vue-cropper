import { Component, Model, Prop, Watch, Vue, Emit } from 'vue-property-decorator'

import { loadImg, getExif, resetImg } from './common'

import './style/index.scss'

import { InterfaceLayout, InterfaceImgload } from './interface'

@Component
export default class VueCropper extends Vue {
  // 高清屏的问题
  ratio: number = window.devicePixelRatio

  // 渲染图片的地址
  imgs: string = ''

  // 是否处于加载中
  isLoading: boolean = true

  canvas: HTMLCanvasElement | null = null

  $refs!: {
    canvas: HTMLCanvasElement
  }

  // 图片属性
  @Prop({ default: '' })
  readonly img!: string

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
  readonly filter!: (canvas: HTMLCanvasElement) => HTMLCanvasElement | null

  @Prop({ default: 'png' })
  readonly outputType!: string

  @Watch('img')
  onImgChanged(val: string) {
    if (val) {
      this.checkedImg(val)
    }
  }

  @Watch('filter')
  onFilterChanged(val: any) {
    if (val) {
      this.isLoading = true
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
    this.isLoading = true
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
      this.isLoading = false
      return false
    }
    console.log(`图片初次加载成功, time is ${~~window.performance.now()}`)
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
    const orientation = result.orientation || 1
    console.log(`图片加载成功,orientation为${orientation}, time is ${~~window.performance.now()}`)

    let canvas: HTMLCanvasElement = document.createElement('canvas')
    try {
      canvas = await resetImg(img, canvas, orientation)
    } catch (error) {
      console.log(error)
    }

    this.canvas = canvas

    this.renderFilter()
  }

  // 滤镜渲染
  renderFilter() {
    if (!this.canvas) {
      return
    }
    let canvas = this.canvas
    if (this.filter) {
      canvas = this.filter(canvas) || canvas
      this.canvas = canvas
      console.log(`图片滤镜渲染成功, time is ${~~window.performance.now()}`)
    }
    this.createImg()
  }

  // 生成新图片
  createImg() {
    if (!this.canvas) {
      return
    }
    this.canvas.toBlob(
      blob => {
        if (blob) {
          this.imgs = URL.createObjectURL(blob)
          console.log(`新图片渲染成功, time is ${~~window.performance.now()}`)
          this.isLoading = false
        } else {
          this.imgs = ''
          this.isLoading = false
        }
      },
      `image/${this.outputType}`,
      1,
    )
  }

  render() {
    return (
      <section class="vue-cropper" style={this.wrapper}>
        {this.imgs ? <img src={this.imgs} alt="vue-cropper" /> : ''}

        {/* 加载动画 */}
        {this.isLoading ? (
          <section class="cropper-loading">
            <p class="loading-spin">
              <i>
                <svg
                  viewBox="0 0 1024 1024"
                  focusable="false"
                  class="anticon-spin"
                  data-icon="loading"
                  width="1.5em"
                  height="1.5em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" />
                </svg>
              </i>
              <span />
            </p>
          </section>
        ) : (
          ''
        )}
      </section>
    )
  }
}
