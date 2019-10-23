<template>
  <div class="home">
    <vue-cropper
      ref="cropper"
      :img="option.img"
      :wrapper="option.wrapper"
      :mode="option.mode"
      :filter="filter"
      @img-upload="imgUpload"
    ></vue-cropper>
    <div class="control">
      <button class="btn" @click="randomImg">切换图片</button>
      <section>
        <label class="btn" for="uploads">上传图片</label>
        <input type="file" ref="uploads" id="uploads" style="position:absolute; clip:rect(0 0 0 0);" accept="image/*" @change="uploadImg($event, 1)">
      </section>
      <button class="btn" @click="getCrop">生成截图</button>
      <section class="control-item">
        <span>滤镜</span>
        <select v-model="filter">
          <option v-for="item in filters" :key="item.name" :value="item.value">{{ item.name }}</option>
        </select>
      </section>
      <section class="control-item">
        <span>图片渲染方式</span>
        <select v-model="option.mode">
          <option value="contain">contain</option>
          <option value="cover">cover</option>
          <option value="400px auto">400px auto</option>
          <option value="auto 400px">auto 400px</option>
          <option value="50%">50%</option>
          <option value="auto 50%">auto 50%</option>
        </select>
      </section>
    </div>
    <section class="pre" v-if="preImg">
      <span @click="preImg = ''">×</span>
      <img :src="preImg" alt="">
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { VueCropper } from '../../lib/index'
import { grayscale, oldPhoto, blackAndWhite } from '../../lib/filter'

type Filter = (canvas: HTMLCanvasElement) => HTMLCanvasElement


@Component({
  components: {
    VueCropper,
  },
})

export default class Home extends Vue {

  $refs!: {
    uploads: HTMLInputElement
    cropper: any
  }


  option =  {
    img: 'http://cdn.xyxiao.cn/bg1.jpg',
    // img: 'http://cdn.xyxiao.cn/6FC898F0005903969F7C0487928FA097.png',
    mode: 'contain',
    wrapper: {
      width: '900px',
      height: '500px',
    },
  }

  filters: Array<{
    name: string
    value: Filter | null
  }> =  []


  filter: Filter | null = null

  preImg: string = ''

  createFilters() {
    const filters = [
      {
        name: '无',
        value: null
      },
      {
        name: '灰度图',
        value: grayscale
      },
      {
        name: '老照片',
        value: oldPhoto
      },
      {
        name: '黑白',
        value: blackAndWhite
      }
    ]
    this.filters = filters
  }

  randomImg() {
    const imgs = [
      'http://cdn.xyxiao.cn/Landscape_1.jpg',
      'http://cdn.xyxiao.cn/Landscape_2.jpg',
      'http://cdn.xyxiao.cn/Landscape_3.jpg',
      'http://cdn.xyxiao.cn/Landscape_4.jpg',
      'http://cdn.xyxiao.cn/Landscape_5.jpg',
      'http://cdn.xyxiao.cn/Landscape_6.jpg',
      'http://cdn.xyxiao.cn/Landscape_7.jpg',
      'http://cdn.xyxiao.cn/Landscape_8.jpg',
      'http://cdn.xyxiao.cn/Portrait_1.jpg',
      'http://cdn.xyxiao.cn/Portrait_2.jpg',
      'http://cdn.xyxiao.cn/Portrait_3.jpg',
      'http://cdn.xyxiao.cn/Portrait_4.jpg',
      'http://cdn.xyxiao.cn/Portrait_5.jpg',
      'http://cdn.xyxiao.cn/Portrait_6.jpg',
      'http://cdn.xyxiao.cn/Portrait_7.jpg',
      'http://cdn.xyxiao.cn/Portrait_8.jpg',
      'http://cdn.xyxiao.cn/bg1.jpg',
      'http://cdn.xyxiao.cn/bg2.jpg',
      'http://cdn.xyxiao.cn/bg3.jpg',
      'http://cdn.xyxiao.cn/bg4.jpg',
      'http://cdn.xyxiao.cn/bg5.jpg',
      'http://cdn.xyxiao.cn/bg6.jpg',
    ]
    const num = ~~(Math.random() * imgs.length) - 1
    this.option.img = imgs[num]
  }

  uploadImg(e: Event) {
    // 上传图片
    // this.option.img
    const target = e.target as HTMLInputElement
    const file: File = (target.files as FileList)[0]
    if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(target.value)) {
      alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
      return false
    }
    const reader = new FileReader()
    reader.onload = (event: Event) => {
      let data
      const targetTwo = event.target as FileReader
      if (typeof targetTwo.result === 'object' && targetTwo.result) {
        // 把Array Buffer转化为blob 如果是base64不需要
        data = window.URL.createObjectURL(new Blob([targetTwo.result]))
      } else {
        data = targetTwo.result
      }
      if (data) {
        this.option.img = data
      }
      this.$refs.uploads.value = ''
    }
    reader.readAsArrayBuffer(file)
  }

  imgUpload(url: string) {
    this.option.img = url
  }

  getCrop() {
    const cropper = this.$refs.cropper
    cropper.getCropData().then((res: string ) => {
      this.preImg = res
    }).catch((e: Error) => {
      console.log(e)
    })
  }

  mounted() {
    this.createFilters()
  }

}
</script>

<style lang="scss">
  .home {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding-top: 50px;
    background-color: #c0ccda;
    min-height: 100vh;
  }

  .control {
    display: flex;
    justify-content: center;
    width: 100%;
    padding-top: 20px;
    text-align: center;
    align-items: center;

    button {
      margin-right: 20px;
    }

    .control-item {
      display: flex;
      height: 50px;
      align-items: center;
      margin-left: 15px;
    }

    .btn {
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      background: #fff;
      border: 1px solid #c0ccda;
      color: #1f2d3d;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      margin: 0px 10px 0px 0px;
      padding: 9px 15px;
      font-size: 14px;
      border-radius: 4px;
      color: #fff;
      background-color: #50bfff;
      border-color: #50bfff;
      transition: all 0.2s ease;
      text-decoration: none;
      user-select: none;
    }
  }

  .pre {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;


    img {
      max-width: 80%;
      max-height: 80%
    }

    span {
      position: absolute;
      top: 40px;
      right: 40px;
      font-size: 50px;
      color: white;
      cursor: pointer;
    }
  }
</style>