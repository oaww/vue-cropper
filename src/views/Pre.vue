<template>
  <section class="pre-vue">
    <canvas ref="pre"></canvas>
    <canvas ref="pre2"></canvas>
  </section>
</template>

<script>
import { loadImg } from '../../lib/common'
export default {
  data() {
    return {
      url: 'http://cdn.xyxiao.cn/bg1.jpg'
    }
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

      let dx = imgAxis.x - cropAxis.x
      // 图片y轴偏移
      let dy = imgAxis.y - cropAxis.y
      let width = cropLayout.width
      let height = cropLayout.height

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, dx, dy, imgLayout.width, imgLayout.height)
    },

    async showPre2() {
      const img = await loadImg(this.url)
      const canvas = this.$refs.pre2
      const ctx = canvas.getContext('2d')
      const imgLayout = {
        width: img.width,
        height: img.height
      }

      const imgAxis = {
        x: 100,
        y: 100,
        scale: 1,
        rotate: 45
      }

      const cropAxis = {
        x: 200,
        y: 200,
      }

      const cropLayout = {
        width: 500,
        height: 500
      }

      let dx = imgAxis.x - cropAxis.x
      // 图片y轴偏移
      let dy = imgAxis.y - cropAxis.y
      let width = cropLayout.width
      let height = cropLayout.height

      canvas.width = width
      canvas.height = height

      const tx = width / 2
      const ty = height / 2

      ctx.translate(tx, ty)
      ctx.rotate(imgAxis.rotate * Math.PI / 180)

      dx -= tx
      dy -= ty

      ctx.drawImage(img, dx, dy, imgLayout.width, imgLayout.height)
    }
  },
  mounted() {
    this.showPre()
    this.showPre2()
  }
}
</script>

<style lang="scss" scoped>
</style>