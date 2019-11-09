<template>
  <section class="pre-vue">
    <canvas ref="pre"></canvas>
    <canvas ref="pre2"></canvas>
    <section class="slider">
      <vue-slider v-model="rotate" tooltip="always" :min="0" :max="360"></vue-slider>
    </section>
  </section>
</template>

<script>
import { loadImg } from '../../lib/common'
import VueSlider from 'vue-slider-component'

export default {
  data() {
    return {
      url: 'http://cdn.xyxiao.cn/bg3.jpg',
      rotate: 0,
      set: '',
      finish: true
    }
  },
  watch: {
    rotate() {
      this.showPre2()
    }
  },
  components: {
    VueSlider
  },
  methods: {
    async showPre() {
      const img = await loadImg(this.url)
      const canvas = this.$refs.pre
      const ctx = canvas.getContext('2d')
      const imgLayout = {
        width: img.width,
        height: img.height
      }

      const imgAxis = {
        x: 100,
        y: 100,
        scale: 1,
        rotate: 0
      }

      const cropAxis = {
        x: 200,
        y: 200,
      }

      const cropLayout = {
        width: 500,
        height: 500
      }

      const dx = imgAxis.x - cropAxis.x
      // 图片y轴偏移
      const dy = imgAxis.y - cropAxis.y
      const width = cropLayout.width
      const height = cropLayout.height

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, dx, dy, imgLayout.width, imgLayout.height)
    },

    async showPre2() {
      const img = await loadImg(this.url)
      const canvas = this.$refs.pre2
      const ctx = canvas.getContext('2d')
      const rotate = this.rotate
      const scale = 0.25
      const imgLayout = {
        width: img.width,
        height: img.height
      }

      const width = imgLayout.width * scale
      const height = imgLayout.height * scale

      // 补充超过容器的位置
      const max = Math.ceil(Math.sqrt(width * width + height * height))

      canvas.width = max
      canvas.height = max

      // ctx.fillStyle = 'transparent'
      ctx.fillStyle = '#eee'
      ctx.fillRect(0, 0, max, max)
      ctx.translate(max / 2, max / 2)
      ctx.rotate(rotate * Math.PI / 180)
      ctx.imageSmoothingEnabled = true

      const dx = - max / 2 + (max - width) / 2
      const dy = - max / 2 + (max - height) / 2
      ctx.drawImage(img, dx, dy, width, height)
      ctx.restore()
      this.finish = true
    }
  },
  mounted() {
    // this.showPre()
    this.showPre2()
    // this.set = setInterval(() => {
    //   if (!this.finish) return
    //   this.finish = false
    //   let rotate = this.rotate
    //   rotate++
    //   rotate = rotate < 360 ? rotate : rotate - 360
    //   this.rotate = rotate
    // }, 1000 / 60)
  },
  destroyed() {
    // clearInterval(this.set)
  }
}
</script>

<style lang="scss" scoped>
</style>