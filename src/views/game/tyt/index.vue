<template>
  <div id="container">
    <div class="mask"
         v-show="showMask">
      <div class="content">
        <div class="score-container">
          <p class="title">本次得分</p>
          <h1 class="score">{{score}}</h1>
        </div>
        <button class="restart"
                @click="restart">
          重新开始
        </button>
      </div>
    </div>
    <div class="info">
      <div class="gaming-score">
        得分：<span class="current-score">{{score}}</span>
      </div>
    </div>
    <div class="model"></div>
  </div>
</template>
<script>
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import Game from "./tytGame";
export default defineComponent({
  name: "tyt",

  setup() {
    const state = reactive({
      score: 0,
      showMask: false,
    });
    let game = new Game();

    onMounted(() => {
      console.log("mounted!");
      game.init();
      game._addFailedFn(failed);
      game._addSuccessFn(success);
    });

    const failed = () => {
      state.score = game.score;
      state.showMask = true;
    };

    const success = (e) => {
      console.log(e);
      state.score = e;
    };

    const restart = () => {
      state.showMask = false;
      game._restart();
    };

    return {
      ...toRefs(state),
      restart,
    };
  },
});
</script>
<style lang="scss" scoped>
.model{
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: transparent;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.mask {
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 500px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 5px solid rgba(255, 255, 255, 0.05);
}
.score-container {
  color: #ffffff;
  text-align: center;
}
.title {
  font-size: 20px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
}
.score {
  font-size: 100px;
  font-weight: bold;
  margin-top: 20px;
}
button.restart {
  width: 200px;
  height: 40px;
  border-radius: 20px;
  background: white;
  border: none;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
}
button.restart:hover {
  color: #232323;
}
.info {
  margin: 20px 0;
  position: absolute;
  text-align: center;
  opacity: 0.2;
  width: 100%;
}
.gaming-score {
  margin-top: 50px;
  color: #fff;
  font-size: 26px;
}
audio {
  margin-top: 10px;
}
canvas {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>