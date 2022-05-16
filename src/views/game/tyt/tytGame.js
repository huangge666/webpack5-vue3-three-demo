// 引入Three.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;

export default class Game {
  // 构造器
  constructor() {
    // 基础信息 属性
    this.config = {
      background: 0x282828,
      ground: -1, // 地面负一
      // 方块信息
      cubeColor: 0xbebebe,
      cubeWidth: 4,
      cubeHeight: 2,
      cubeDeep: 4,
      // 跳块颜色
      jumperColor: 0x232323,
      jumperWidth: 1,
      jumperHeight: 2,
      jumperDeep: 1,
    };
    this.score = 0; // 初始化分数

    // 场景
    this.scene = new THREE.Scene();

    // 正交相机
    this.camera = new THREE.OrthographicCamera(
      w / -50,
      w / 50,
      h / 50,
      h / -50,
      0,
      5000
    );
    this.cameraPros = {
      current: new THREE.Vector3(0, 0, 0), // 当前位置
      next: new THREE.Vector3(0, 0, 0), // 落下位置
    };

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿
    });

    this.size = {
      width: w,
      height: h,
    };

    // 方块
    this.cubes = [];
    // 方块方向
    this.cubeStat = {
      nextDir: "",
    };

    this.jumperStat = {
      //鼠标按下速度
      ready: false,
      xSpeed: 0,
      ySpeed: 0,
    };

    this.fallState = {
      location: -1, //落在哪里 当前块块上
      distance: 0, //距离是否倒下
    };

    this.fallingStat = {
      //有没有落到点
      end: false,
      speed: 0.2,
    };
  }

  // 初始化
  init() {
    this._setCamera();
    this._setRenderer();
    // this._setControls();
    this._setLight();
    // 创建两次方块
    this._createCube();
    this._createCube();
    this._createJumper();
    this._updateCamera();
    this._handleWindowResize();
    window.addEventListener("resize", () => {
      this._handleWindowResize(); //绑定窗口大小
    });
    // let canvas = document.querySelector("canvas");
    let canvas = document.querySelector(".model");
    canvas.addEventListener("pointerdown", () => {
      //鼠标按下状态
      this._handleMouseDown();
    });
    canvas.addEventListener("pointerup", () => {
      //鼠标松开状态
      this._handleMouseUp();
    });
  }

  // 成功后回调
  _addSuccessFn(fn) {
    this.successCallback = fn;
  }

  // 失败后回调
  _addFailedFn(fn) {
    this.failedCallback = fn;
  }

  // 绑定窗口大小改变
  _handleWindowResize() {
    this._setSize(); // 从新计算

    // 从新计算相机位置
    this.camera.left = this.size.width / -80;
    this.camera.right = this.size.width / 80;
    this.camera.top = this.size.height / 80;
    this.camera.bottom = this.size.height / -80;
    this.camera.updateProjectionMatrix(); //从新更新相机位置发生的改变
    this.renderer.setSize(this.size.width, this.size.height);
    this._render();
  }

  // 鼠标按下状态
  _handleMouseDown() {
    if (!this.jumperStat.ready && this.jumper.scale.y > 0.02) {
      this.jumper.scale.y -= 0.01; // 压缩跳块
      this.jumperStat.xSpeed += 0.004;
      this.jumperStat.ySpeed += 0.008;
      this._render();
      requestAnimationFrame(() => {
        this._handleMouseDown();
      });
    }
  }

  //鼠标松开谈起状态
  _handleMouseUp() {
    this.jumperStat.ready = true;
    if (this.jumper.position.y >= 1) {
      // 压缩状态小于1就+
      if (this.jumper.scale.y < 1) {
        this.jumper.scale.y += 0.1;
      }

      //挑起盒子落在哪里
      if (this.cubeStat.nextDir == "left") {
        this.jumper.position.x -= this.jumperStat.xSpeed;
      } else {
        this.jumper.position.z -= this.jumperStat.xSpeed;
      }

      this.jumper.position.y += this.jumperStat.ySpeed;
      this.jumperStat.ySpeed -= 0.01; // 上升落下状态
      this._render();
      requestAnimationFrame(() => {
        //循环执行
        this._handleMouseUp();
      });
    } else {
      // 落下
      this.jumperStat.ready = false;
      this.jumperStat.xSpeed = 0;
      this.jumperStat.ySpeed = 0;
      this.jumper.position.y = 1;
      this.jumper.scale.y = 1;
      this._checkInCube(); // 检测落在哪里

      if (this.fallState.location == 1) {
        // 下落后等于1，+分数
        this.score++;
        this._createCube();
        this._updateCamera();
        if (this.successCallback) {
          //否则失败
          this.successCallback(this.score);
        }
      } else {
        this._falling();
      }
    }
  }

  //检测落在哪里
  //-1   -10从当前盒子掉落
  //1 下一个盒子上 10从下一个盒子上掉落
  //0没有落在盒子上
  _checkInCube() {
    // 当前盒子距离  下一个盒子距离
    let distanceCur, distanceNext;

    let should = (this.config.jumperWidth + this.config.cubeWidth) / 2;
    if (this.cubeStat.nextDir == "left") {
      //往左走了
      distanceCur = Math.abs(
        this.jumper.position.x - this.cubes[this.cubes.length - 2].position.x
      );
      distanceNext = Math.abs(
        this.jumper.position.x - this.cubes[this.cubes.length - 1].position.x
      );
    } else {
      //往右走了
      distanceCur = Math.abs(
        this.jumper.position.z - this.cubes[this.cubes.length - 2].position.z
      );
      distanceNext = Math.abs(
        this.jumper.position.z - this.cubes[this.cubes.length - 1].position.z
      );
    }

    if (distanceCur < should) {
      //落在当前块
      this.fallState.distance = distanceCur;
      this.fallState.location =
        distanceCur < this.config.cubeWidth / 2 ? -1 : -10;
    } else if (distanceNext < should) {
      //落在下一个块上
      this.fallState.distance = distanceNext;
      this.fallState.location =
        distanceNext < this.config.cubeWidth / 2 ? 1 : 10;
    } else {
      //落在中间
      this.fallState.location = 0;
    }
  }

  // 下落过程
  _falling() {
    if (this.fallState.location == 10) {
      // 从下一个盒子落下
      if (this.cubeStat.nextDir == "left") {
        if (
          this.jumper.position.x > this.cubes[this.cubes.length - 1].position.x
        ) {
          this._fallingRotate("leftBottom");
        } else {
          this._fallingRotate("leftTop");
        }
      } else {
        if (
          this.jumper.position.z > this.cubes[this.cubes.length - 1].position.z
        ) {
          this._fallingRotate("rightBottom");
        } else {
          this._fallingRotate("rightTop");
        }
      }
    } else if (this.fallState.location == -10) {
      // 从当前盒子落下
      if (this.cubeStat.nextDir == "left") {
        this._fallingRotate("leftTop");
      } else {
        this._fallingRotate("rightTop");
      }
    } else if (this.fallState.location == 0) {
      this._fallingRotate("none");
    }
  }

  //落下旋转
  _fallingRotate(dir) {
    let offset = this.fallState.distance - this.config.cubeWidth / 2; //中间
    let rotateAxis = dir.includes("left") ? "z" : "x"; //以什么轴转
    let rotateAdd = this.jumper.rotation[rotateAxis] + 0.1;
    let rotateTo = this.jumper.rotation[rotateAxis] < Math.PI / 2;
    let fallingTo = this.config.ground + this.config.jumperWidth / 2 + offset;

    if (dir === "rightTop") {
      rotateAdd = this.jumper.rotation[rotateAxis] - 0.1;
      rotateTo = this.jumper.rotation[rotateAxis] > -Math.PI / 2;
    } else if (dir === "rightBottom") {
      rotateAdd = this.jumper.rotation[rotateAxis] + 0.1;
      rotateTo = this.jumper.rotation[rotateAxis] < Math.PI / 2;
    } else if (dir === "leftBottom") {
      rotateAdd = this.jumper.rotation[rotateAxis] - 0.1;
      rotateTo = this.jumper.rotation[rotateAxis] > -Math.PI / 2;
    } else if (dir === "leftTop") {
      rotateAdd = this.jumper.rotation[rotateAxis] + 0.1;
      rotateTo = this.jumper.rotation[rotateAxis] < Math.PI / 2;
    } else if (dir === "none") {
      rotateTo = false;
      fallingTo = this.config.ground;
    } else {
      throw Error("Arguments Error");
    }
    if (!this.fallingStat.end) {
      if (rotateTo) {
        this.jumper.rotation[rotateAxis] = rotateAdd;
      } else if (this.jumper.position.y > fallingTo) {
        this.jumper.position.y -= 0.2;
      } else {
        this.fallingStat.end = true;
      }
      this._render();
      requestAnimationFrame(() => {
        this._falling();
      });
    } else {
      if (this.failedCallback) {
        this.failedCallback();
      }
    }
  }

  // 设置相机位置
  _setCamera() {
    this.camera.position.set(100, 100, 100);
    this.camera.lookAt(this.cameraPros.current);
  }

  // 设置渲染器
  _setRenderer() {
    this.renderer.setSize(this.size.width, this.size.height); // 画布宽高
    this.renderer.setClearColor(this.config.background);
    document.querySelector("#container").appendChild(this.renderer.domElement); // 渲染的画布放到container容器里面
  }

  _setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  // 设置灯光
  _setLight() {
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.1); // 平行光 （颜色，强度）
    directionalLight.position.set(2, 10, 5); //平行光位置
    this.scene.add(directionalLight); // 在场景中加入平行光
    let light = new THREE.AmbientLight(0xffffff, 0.3); //环境光 光的材质
    this.scene.add(light); // 把环境光添加到场景
  }

  // 创建方块
  _createCube() {
    const { cubeWidth, cubeHeight, cubeDeep, cubeColor } = this.config;
    // 创建一个几何体对象（宽，高，深度）
    let geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeDeep);
    // 材质,对象包含了颜色、透明度等属性，
    let material = new THREE.MeshLambertMaterial({
      color: cubeColor,
    });
    let cube = new THREE.Mesh(geometry, material);

    // 从第二块开始随机左右方向出现
    if (this.cubes.length) {
      cube.position.x = this.cubes[this.cubes.length - 1].position.x;
      cube.position.y = this.cubes[this.cubes.length - 1].position.y;
      cube.position.z = this.cubes[this.cubes.length - 1].position.z;
      this.cubeStat.nextDir = Math.random() > 0.5 ? "left" : "right"; // 随机左边或者右边

      // 左边改变x轴否则z轴
      if (this.cubeStat.nextDir === "left") {
        cube.position.x = cube.position.x - Math.round(Math.random() * 4 + 6);
      } else {
        cube.position.z = cube.position.z - Math.round(Math.random() * 4 + 6);
      }
    }
    this.cubes.push(cube); // 统一添加
    // 页面最多添加5个方块，超过移除最前面的
    if (this.cubes.length > 5) {
      this.scene.remove(this.cubes.shift());
    }
    this.scene.add(cube); // 方块添加到场景
    if (this.cubes.length > 1) {
      // 更新镜头位置
      this._updateCameraPros();
    }
  }

  // 跳块
  _createJumper() {
    const { jumperWidth, jumperHeight, jumperDeep, jumperColor } = this.config;
    let geometry = new THREE.BoxGeometry(jumperWidth, jumperHeight, jumperDeep);
    let material = new THREE.MeshLambertMaterial({
      color: jumperColor,
    });
    this.jumper = new THREE.Mesh(geometry, material);
    this.jumper.position.y = 1; // 显示跳块
    geometry.translate(0, 1, 0); // 平移
    this.scene.add(this.jumper);
  }

  // 改变相机的镜头
  _updateCamera() {
    const { current, next } = this.cameraPros;
    // 当前位置
    let cur = {
      x: current.x,
      y: current.y,
      z: current.z,
    };
    // 下次的位置
    let n = {
      x: next.x,
      y: next.y,
      z: next.z,
    };

    // 满足改变条件
    if (cur.x > n.x || cur.z > n.z) {
      current.x -= 0.1;
      current.z -= 0.1;

      if (current.x - next.x < 0.05) {
        current.x = next.x;
      } else if (current.z - next.z < 0.05) {
        current.z = next.z;
      }
    }

    this.camera.lookAt(new THREE.Vector3(cur.x, 0, cur.z)); //镜头的点
    this._render();
    requestAnimationFrame(() => {
      // 不断执行
      this._updateCamera();
    });
  }

  //更新镜头位置
  _updateCameraPros() {
    let lastIndex = this.cubes.length - 1;
    let pointA = {
      //当前块
      x: this.cubes[lastIndex].position.x,
      z: this.cubes[lastIndex].position.z,
    };
    let pointB = {
      //下一个块
      x: this.cubes[lastIndex - 1].position.x,
      z: this.cubes[lastIndex - 1].position.z,
    };
    this.cameraPros.next = new THREE.Vector3(
      (pointA.x + pointB.x) / 2,
      0,
      (pointA.z + pointB.z) / 2
    );
    //当前块跟下一个块除以2得出中间位置
  }

  //设置size
  _setSize() {
    this.size.width = window.innerWidth;
    this.size.height = window.innerHeight;
  }

  //渲染render
  _render() {
    this.renderer.render(this.scene, this.camera);
    //把当前场景相机放进来
  }

  _restart() {
    this.cameraPros = {
      current: new THREE.Vector3(0, 0, 0),
      next: new THREE.Vector3(),
    };
    this.fallingStat = {
      end: false,
      speed: 0.2,
    };
    let length = this.cubes.length;
    this.scene.remove(this.jumper);
    for (let i = 0; i < length; i++) {
      this.scene.remove(this.cubes.shift());
    }
    this.score = 0;
    this.successCallback(this.score);
    this._createCube();
    this._createCube();
    this._createJumper();
    this._updateCamera();
  }
}
