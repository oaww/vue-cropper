<template>
  <section class="show-img">
    <img v-for="item in imgsList" :key="item" :src="item">
  </section>
</template>

<script>
export default {
  data() {
    return {
      imgsList: [
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
        'http://cdn.xyxiao.cn/Portrait_8.jpg'
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
  img {
    width: 400px;
    margin: 30px;
    image-orientation: from-image;
  }
</style>