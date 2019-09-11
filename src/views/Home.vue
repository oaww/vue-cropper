<template>
  <div class="home">
    <vue-cropper
      :img="option.img"
      :wrapper="option.wrapper"
      :filter="filter"
    ></vue-cropper>
    <div class="control">
      <button @click="randomFilter">切换滤镜</button>
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
  option =  {
    img: 'http://cdn.xyxiao.cn/bg1.jpg',
    wrapper: {
      width: '500px',
      height: '500px',
    },
  }


  filter: Filter | null = null

  randomFilter() {
    const filters = [
      grayscale,
      oldPhoto,
      blackAndWhite
    ]
    this.filter = filters[~~(Math.random() * filters.length)] || null
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
    width: 100%;
    padding-top: 20px;
    text-align: center;
  }
</style>