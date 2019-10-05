<template>
  <div class="home">
    <vue-cropper
      :img="option.img"
      :wrapper="option.wrapper"
      :mode="option.mode"
      :filter="filter"
    ></vue-cropper>
    <div class="control">
      <button class="btn" @click="randomImg">切换图片</button>
      <section>
        <label class="btn" for="uploads">上传图片</label>
        <input type="file" ref="uploads" id="uploads" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="uploadImg($event, 1)">
      </section>
      <button class="btn"  @click="randomFilter">切换滤镜</button>
      <section class="control-item">
        <span>图片默认渲染方式</span>
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
  }


  option =  {
    img: 'http://cdn.xyxiao.cn/bg1.jpg',
    mode: '50%',
    wrapper: {
      width: '70%',
      height: '500px',
    },
  }


  filter: Filter | null = null

  randomFilter() {
    const filters = [
      grayscale,
      oldPhoto,
      blackAndWhite,
      null
    ]
    this.filter = filters[~~(Math.random() * filters.length)] || null
  }

  randomImg() {
    const num = ~~(Math.random() * 9 + 1)
    this.option.img = `http://cdn.xyxiao.cn/bg${num}.jpg`
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
      // 转化为base64
      // reader.readAsDataURL(file)
      // 转化为blob
      reader.readAsArrayBuffer(file)
    }

}
</script>

<style lang="scss">
  .home {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding-top: 50px;
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
</style>