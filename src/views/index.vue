<template>
  <div>
    <p class="title">{{ title }}</p>
  </div>
</template>
<script>
import { defineComponent, ref, onMounted } from "vue";
import trilat from "trilat/index.js";
export default defineComponent({
  name: "index",

  setup() {
    const title = ref("渐进式JavaScript 框架-THREE");
    onMounted(() => {
      console.log("mounted!");
    });

    console.log(trilat, "trilat ");
    let input = [
      [parseInt(256, 10), parseInt(222, 10), parseInt(-54)],
      [parseInt(345, 10), parseInt(288, 10), parseInt(-55)],
      [parseInt(386, 10), parseInt(184, 10), parseInt(-72)],
    ];
    let output = trilat(input);
    console.log(output, "let output = trilat(input);");

    return {
      title,
    };
  },
});
</script>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 48px;
  text-align: center;
}
img {
  max-width: 100%;
}
</style>