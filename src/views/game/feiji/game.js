import * as THREE from "three";

class Sea {
  constructor() {
    const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const mat = new THREE.MeshPhongMaterial({
      color: 0x00799e,
      transparent: true,
      opacity: 0.6,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
  }
}

class Cloud {
  constructor() {
    this.mesh = new THREE.Object3D();
    var geom = new THREE.BoxGeometry(20, 20, 20);

    var mat = new THREE.MeshPhongMaterial({
      color: Colors.white,
    });
    var nBlocs = 3 + Math.floor(Math.random() * 3);

    for (i = 0; i < nBlocs; i++) {
      //实现位置随机，大小随机
      var m = new THREE.Mesh(geom, mat);
      m.position.x = i * 15;
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;
      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;
      var s = 0.1 + Math.random() * 0.9;
      m.scale.set(s, s, s);

      m.castShadow = true;
      m.receiveShadow = true;

      this.mesh.add(m);
    }
  }
}

class Sky {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    var stepAngle = (Math.PI * 2) / this.nClouds;
    for (var i = 0; i < this.nClouds; i++) {
      var c = new Cloud();
      var a = stepAngle * i;
      var h = 750 + Math.random() * 200;
      c.mesh.position.y = Math.sin(a) * h;
      c.mesh.position.x = Math.cos(a) * h;
      c.mesh.rotation.z = -Math.PI / 2 + a;
      c.mesh.position.z = -50 - Math.random() * 400;
      var s = 1 + Math.random() * 2;
      c.mesh.scale.set(s, s, s);
      this.mesh.add(c.mesh);
    }
  }
}

export { Sea, Sky };
