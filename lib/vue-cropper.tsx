import { Component, Model, Prop, Watch, Vue, Emit } from 'vue-property-decorator'

import { loadImg, getExif, resetImg, createImgStyle } from './common'

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

  imgLayout = {
    width: 0,
    height: 0,
  }

  imgStyle = {}

  $refs!: {
    canvas: HTMLCanvasElement
    cropper: HTMLElement
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

  // 输出的图片格式
  @Prop({ default: 'png' })
  readonly outputType!: string

  /*
      图片布局方式 mode 实现和css背景一样的效果
      contain  居中布局 默认不会缩放 保证图片在容器里面 mode: 'contain'
      cover    拉伸布局 填充整个容器  mode: 'cover'
      如果仅有一个数值被给定，这个数值将作为宽度值大小，高度值将被设定为auto。 mode: '50px'
      如果有两个数值被给定，第一个将作为宽度值大小，第二个作为高度值大小。 mode: '50px 60px'
  */
  @Prop({ default: 'contain' })
  readonly mode!: string

  @Watch('img')
  onImgChanged(val: string) {
    if (val) {
      this.checkedImg(val)
    }
  }

  @Watch('filter')
  onFilterChanged() {
    this.isLoading = true
    this.checkedImg(this.img)
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
    this.imgs = ''
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
      async blob => {
        if (blob) {
          console.log(`新图片渲染成功, time is ${~~window.performance.now()}`)
          URL.revokeObjectURL(this.imgs)
          const url = URL.createObjectURL(blob)
          try {
            await this.renderImgLayout(url)
          } catch (error) {
            console.log(error)
          }
          this.imgs = url
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

  // 渲染图片布局
  async renderImgLayout(url: string) {
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
    this.imgLayout = {
      width: img.width,
      height: img.height,
    }
    const wrapper = {
      width: 0,
      height: 0,
    }
    wrapper.width = Number(
      (window.getComputedStyle(this.$refs.cropper).width || '').replace('px', ''),
    )
    wrapper.height = Number(
      (window.getComputedStyle(this.$refs.cropper).height || '').replace('px', ''),
    )
    return createImgStyle({ ...this.imgLayout }, wrapper, this.mode)
  }

  render() {
    return (
      <section class="vue-cropper" style={this.wrapper} ref="cropper">
        {this.imgs ? (
          <section class="cropper-content">
            <section class="cropper-img" style={this.imgStyle}>
              <img src={this.imgs} alt="vue-cropper" />
            </section>
          </section>
        ) : (
          ''
        )}

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
