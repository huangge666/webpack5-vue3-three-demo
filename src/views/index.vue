<template>
  <div>
    <p class="title">{{ title }}</p>
  </div>
</template>
<script>
import { defineComponent, ref, onMounted } from "vue";
export default defineComponent({
  name: "index",

  setup() {
    const title = ref("渐进式JavaScript 框架-THREE");
    onMounted(() => {
      console.log("mounted!");
    });

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