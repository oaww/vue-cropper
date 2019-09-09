<template>
  <div class="home">
    <vue-cropper
      :img="option.img"
      :wrapper="option.wrapper"
      :filter="filter"
    ></vue-cropper>
    <button @click="randomFilter">切换滤镜</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { VueCropper } from '../../lib/index'
import { grayscale, oldPhoto, blackAndWhite } from '../../lib/filter'

@Component({
  components: {
    VueCropper,
  },
})

export default class Home extends Vue {
  option =  {
    img: 'http://cdn.xyxiao.cn/Portrait_8.jpg',
    wrapper: {
      width: '500px',
      height: '500px',
    },
  }

  filter = grayscale

  randomFilter() {
    const filters = [
      grayscale,
      oldPhoto,
      blackAndWhite
    ]
    this.filter = filters[~~(Math.random() * filters.length)]
  }
}
</script>
