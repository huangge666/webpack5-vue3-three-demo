<template>
  <div id="container">
  </div>
</template>
<script>
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { Sea, Sky } from "./game";
export default defineComponent({
  name: "fj",

  setup() {
    const state = reactive({
      controls: null,
      gui: null,
      scene: null,
      camera: null,
      renderer: null,
    });

    onMounted(() => {
      console.log("mounted!");
      init();
    });

    const init = () => {
      console.log("初始化");
      setGui();
      createScene();
      createLights();

      createSea();
      createSky();
    };

    const setGui = () => {
      state.controls = new (function () {
        this.ambientLightColor = "#dc8874";
      })();

      state.gui = new GUI();
      state.gui
        .addColor(state.controls, "ambientLightColor")
        .onChange(function (e) {
          ambientLight.color = new THREE.Color(e); //
        });
    };

    const createScene = () => {
      const HEIGHT = window.innerHeight;
      const WIDTH = window.innerWidth;

      state.scene = new THREE.Scene();
      state.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950); // 雾化

      const axes = new THREE.AxisHelper(200); // 三维坐标系
      state.scene.add(axes);

      const aspectRatio = WIDTH / HEIGHT; //宽高比设置为窗口大小，避免图案的变形
      state.camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 10000); //使用一个透视相机使物体具有3d的效果
      state.camera.position.x = 0; //相机的位置和视点将影响观察到的物体
      state.camera.position.z = 200;
      state.camera.position.y = 100; //待优化

      //声明一个webgl的渲染器，这个渲染器就如同html中的canvas
      state.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      state.renderer.setSize(WIDTH, HEIGHT);
      state.renderer.shadowMap.enabled = true; // 开启接收阴影

      // 加载渲染器到html
      document
        .querySelector("#container")
        .appendChild(state.renderer.domElement);
    };

    const createLights = () => {
      // 半球灯
      const hemisphereLight = new THREE.HemisphereLight(
        0xbbbbbb,
        0x000000,
        0.9
      );

      // 环境灯
      const ambientLight = new THREE.AmbientLight(
        state.controls.ambientLightColor
      );

      // 平行灯
      const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
      shadowLight.castShadow = true;
      shadowLight.shadow.camera.left = -400;
      shadowLight.shadow.camera.right = 400;
      shadowLight.shadow.camera.top = 400;
      shadowLight.shadow.camera.bottom = -400;
      shadowLight.shadow.camera.near = 1;
      shadowLight.shadow.camera.far = 1000;
      shadowLight.shadow.mapSize.width = 2048;
      shadowLight.shadow.mapSize.height = 2048;

      //每次设置完灯光都需要把他添加到场景中
      state.scene.add(hemisphereLight);
      state.scene.add(shadowLight);
      state.scene.add(ambientLight);
    };

    const createSea = () => {
      const sea = new Sea();
      sea.mesh.position.y = -600;
      state.scene.add(sea);
    };

    const createSky = () => {
      const sky = new Sky();
      sky.mesh.position.y = -600;
      state.scene.add(sky.mesh);
    };

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style lang="scss" scoped>
</style>