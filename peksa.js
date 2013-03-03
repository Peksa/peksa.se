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
		
		mapping: new Array,
		mapIndex: 0,
		coordinates: { top: 0, left: 0 },
		
		init: function() {
			
			this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
			this.camera.position.z = 3000;
			
			this.scene = new THREE.Scene();
			
			this.objectHolder = new THREE.Object3D();
			this.objectHolder.position.set(-1800, -1800, 0);
			this.scene.add(this.objectHolder);
			
			this.light = new THREE.PointLight(0xffffff);
			this.light.position.set(100, 500, 1300);
			this.scene.add(this.light);
				
			this.geometry = new THREE.CubeGeometry(200, 200, 200);
			
			var xpos = 0;
			for (var x = 0; x < 18; x++) {
				var ypos = 0;
				for (var y = 0; y < 18; y++) {
					var mat = new THREE.MeshLambertMaterial({ color: 0x0 });
					var mesh = new THREE.Mesh(this.geometry, mat);
					
					mesh.position.x = xpos;
					mesh.position.y = ypos;
					
					if (x != 0 && x != 17 && y != 0 && y != 17) {
						this.materials.push(mat);
						this.meshes.push(mesh);
					} 
					
					this.objectHolder.add(mesh);
					ypos += 200;
				}
				xpos += 200;
			}
			
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			var main = document.getElementsByTagName("body")[0];
			
			main.insertBefore(this.renderer.domElement, main.firstChild);
		},
		
		animate: function() {
			requestAnimationFrame(this.animate.bind(this));
			this.camera.rotation.z -= 0.02;
			this.camera.rotation.y += Math.cos(this.wobble)/80;
			this.camera.rotation.x += Math.cos(this.wobble)/80;
			this.camera.fov = 75 + Math.sin(this.wobble/10)*10;
			this.camera.updateProjectionMatrix();
			
			var col = this.color/256;
			for (var i = 0; i < 256; i++) {
				var left = this.mapping[i][0];
				var top = this.mapping[i][1];
				var j = left*16+top;
				var l = 0.5;
				
				if (col <= 12/256 && col > 0) 
					l = 0.25;
				else if (col <= 76/256 && col > 64/256)
					l = 0.25;
				else if (col <= 140/256 && col > 128/256) 
					l = 0.25;
				else if (col <= 204/256 && col > 192/256)
					l = 0.25;
				
				this.materials[j].color.setHSL(col, 1.0, l);
				col += 1/256;
				if (col > 1) col -= 1;
			}
			this.color = (this.color + 1) % 256;
			
			this.renderer.render(this.scene, this.camera);
			this.wobble += 0.05;
		},
		
		hilbert: function(level, direction, rotation) {
			if (level == 0)
				return;
			direction = this.right(direction, rotation);
			
			this.hilbert(level - 1, direction, -rotation);
			this.forward(direction);
			
			
			direction = this.left(direction, rotation);
			
			this.hilbert(level - 1, direction, rotation);
			this.forward(direction);
			
			
			this.hilbert(level - 1, direction, rotation);
			
			direction = this.left(direction, rotation);
			this.forward(direction);
			this.hilbert(level - 1, direction, -rotation);
		},
		
		saveMapping: function () {
			this.mapping[this.mapIndex] = [];
			this.mapping[this.mapIndex][0] = this.coordinates.left;
			this.mapping[this.mapIndex][1] = this.coordinates.top;
			this.mapIndex++;
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
				this.coordinates.top--;
				break;
			case 1:
				this.coordinates.left++;
				break;
			case 2:
				this.coordinates.top++;
				break;
			case 3:
				this.coordinates.left--;
				break;
			}
			this.saveMapping();
		}
	    
	};
	
	peksa.init();
	peksa.saveMapping();
	peksa.hilbert(4, 1, 1);
	peksa.animate();
	
})();
