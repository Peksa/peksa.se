(function() {
  var peksa = {
    camera: undefined,
    scene: undefined,
    light: undefined,
    renderer: undefined,
    geometry: undefined,
    objectHolder: undefined,
    materials: [],
    meshes: [],
    color: 0,
    wobble: 0,

    mapping: [],
    mapIndex: 0,
    coordinates: { top: 0, left: 0 },

    init: function() {
      peksa.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      peksa.camera.position.z = 3000;

      peksa.scene = new THREE.Scene();

      peksa.objectHolder = new THREE.Object3D();
      peksa.objectHolder.position.set(-1800, -1800, 0);
      peksa.scene.add(peksa.objectHolder);

      peksa.light = new THREE.PointLight(0xffffff);
      peksa.light.position.set(100, 500, 1300);
      peksa.scene.add(peksa.light);

      peksa.geometry = new THREE.CubeGeometry(200, 200, 200);

      var xpos = 0;
      for (var x = 0; x < 18; x++) {
        var ypos = 0;
        for (var y = 0; y < 18; y++) {
          var mat = new THREE.MeshLambertMaterial({ color: 0x0 });
          var mesh = new THREE.Mesh(peksa.geometry, mat);

          mesh.position.x = xpos;
          mesh.position.y = ypos;

          if (x != 0 && x != 17 && y != 0 && y != 17) {
            peksa.materials.push(mat);
            peksa.meshes.push(mesh);
          }

          peksa.objectHolder.add(mesh);
          ypos += 200;
        }
        xpos += 200;
      }

      peksa.renderer = new THREE.WebGLRenderer();
      peksa.renderer.setSize(window.innerWidth, window.innerHeight);
      var main = document.getElementsByTagName("body")[0];

      main.insertBefore(peksa.renderer.domElement, main.firstChild);
    },

    animate: function() {
      requestAnimationFrame(peksa.animate);
      peksa.camera.rotation.z -= 0.02;
      peksa.camera.rotation.y += Math.cos(peksa.wobble) / 80;
      peksa.camera.rotation.x += Math.cos(peksa.wobble) / 80;
      peksa.camera.fov = 75 + Math.sin(peksa.wobble / 10) * 10;
      peksa.camera.updateProjectionMatrix();

      var col = peksa.color / 256;
      for (var i = 0; i < 256; i++) {
        var left = peksa.mapping[i][0];
        var top = peksa.mapping[i][1];
        var j = left * 16 + top;
        var l = 0.5;

        if (col <= 12 / 256 && col > 0)
          l = 0.25;
        else if (col <= 76 / 256 && col > 64 / 256)
          l = 0.25;
        else if (col <= 140 / 256 && col > 128 / 256)
          l = 0.25;
        else if (col <= 204 / 256 && col > 192 / 256)
          l = 0.25;

        peksa.materials[j].color.setHSL(col, 1.0, l);
        col += 1 / 256;
        if (col > 1) col -= 1;
      }
      peksa.color = (peksa.color + 1) % 256;

      peksa.renderer.render(peksa.scene, peksa.camera);
      peksa.wobble += 0.05;
    },

    hilbert: function(level, direction, rotation) {
      if (level == 0)
        return;
      direction = peksa.right(direction, rotation);
      peksa.hilbert(level - 1, direction, -rotation);
      peksa.forward(direction);
      direction = peksa.left(direction, rotation);
      peksa.hilbert(level - 1, direction, rotation);
      peksa.forward(direction);
      peksa.hilbert(level - 1, direction, rotation);
      direction = peksa.left(direction, rotation);
      peksa.forward(direction);
      peksa.hilbert(level - 1, direction, -rotation);
    },

    saveMapping: function() {
      peksa.mapping[peksa.mapIndex] = [];
      peksa.mapping[peksa.mapIndex][0] = peksa.coordinates.left;
      peksa.mapping[peksa.mapIndex][1] = peksa.coordinates.top;
      peksa.mapIndex++;
    },

    left: function(direction, rotation) {
      return (direction + rotation + 2) % 4;
    },

    right: function(direction, rotation) {
      return (direction - rotation + 2) % 4;
    },

    forward: function(direction) {
      switch (direction) {
        case 0:
          peksa.coordinates.top--;
          break;
        case 1:
          peksa.coordinates.left++;
          break;
        case 2:
          peksa.coordinates.top++;
          break;
        case 3:
          peksa.coordinates.left--;
          break;
      }
      peksa.saveMapping();
    }
  };

  peksa.init();
  peksa.saveMapping();
  peksa.hilbert(4, 1, 1);
  peksa.animate();

})();
