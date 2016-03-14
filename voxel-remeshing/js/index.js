window.onload = init;

function LightController(entity) {
	this.entity = entity;
	this.time = 0.0;
	this.transform = null;
}
LightController.prototype.awake = function() {
	this.transform = this.entity.getComponent(Fe.Transform);
};
LightController.prototype.update = function(deltaTime) {
	this.time += deltaTime;
	var theta = this.time / 1000.0;
	
	// Just have the light follow the camera around
	var radius = 40.0;
	this.transform.position = vec3.fromValues(radius * Math.cos(theta * 0.5), 0, radius * Math.sin(theta * 0.5));
};

function CameraController(entity) {
	this.entity = entity;
	this.time = 0.0;
	this.transform = null;
}
CameraController.prototype.awake = function() {
	this.transform = this.entity.getComponent(Fe.Transform);
	this.entity.getComponent(Fe.Camera).aspect = 1024 / 768;
};
CameraController.prototype.update = function(deltaTime) {
	this.time += deltaTime;
	var theta = this.time / 1000.0;
	
	var radius = 40.0;
	this.transform.position = vec3.fromValues(radius * Math.cos(theta * 0.5), 0, radius * Math.sin(theta * 0.5));
	this.transform.lookAt(vec3.fromValues(0, 0, 0));
};

function GenerateSphere(grid, radius, quantize) {
	for (var z = 0; z < grid.size.z; ++z) {
		for (var y = 0; y < grid.size.y; ++y) {
			for (var x = 0; x < grid.size.x; ++x) {
				var dist = Math.sqrt(Math.pow(x - grid.size.x / 2, 2) + Math.pow(y - grid.size.y / 2, 2) + Math.pow(z - grid.size.z / 2, 2));
				if (quantize)
					grid.set(x, y, z, (radius - dist > 0 ? 1.0 : 0.0));
				else
					grid.set(x, y, z, radius - dist);
			}
		}
	}
}

function GenerateTorus(grid, innerRadius, outerRadius, quantize) {
	for (var z = 0; z < grid.size.z; ++z) {
		for (var y = 0; y < grid.size.y; ++y) {
			for (var x = 0; x < grid.size.x; ++x) {
				var dist = Math.sqrt(Math.pow(outerRadius - Math.sqrt(Math.pow(x - grid.size.x / 2, 2) + Math.pow(y - grid.size.y / 2, 2)), 2) + Math.pow(z - grid.size.z / 2, 2));
				if (quantize)
					grid.set(x, y, z, (innerRadius - dist > 0 ? 1.0 : 0.0));
				else
					grid.set(x, y, z, innerRadius - dist);
			}
		}
	}
}

function GenerateHexPrism(grid, hx, hy, quantize) {
	for (var z = 0; z < grid.size.z; ++z) {
		for (var y = 0; y < grid.size.y; ++y) {
			for (var x = 0; x < grid.size.x; ++x) {
				var qx = Math.abs(x - grid.size.x / 2);
				var qy = Math.abs(y - grid.size.y / 2);
				var qz = Math.abs(z - grid.size.z / 2);
				var dist = Math.max(qz - hy, Math.max((qx * 0.866025 + qy * 0.5), qy) - hx);
				if (quantize)
					grid.set(x, y, z, (1.0 - dist > 0 ? 1.0 : 0.0));
				else
					grid.set(x, y, z, 1.0 - dist);
			}
		}
	}
}

function GenerateCone(grid, cx, cy, quantize) {
	var cl = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));
	cx /= cl;
	cy /= cl;
	for (var z = 0; z < grid.size.z; ++z) {
		for (var y = 0; y < grid.size.y; ++y) {
			for (var x = 0; x < grid.size.x; ++x) {
				var qx = Math.abs(x - grid.size.x / 2);
				var qy = Math.abs(y - grid.size.y / 2);
				var qz = Math.abs(z - grid.size.z / 2);
				var dist = (cx * Math.sqrt(Math.pow(qx, 2) + Math.pow(qy, 2)) + cy * qz);
				if (quantize)
					grid.set(x, y, z, (cl - dist > 0 ? 1.0 : 0.0));
				else
					grid.set(x, y, z, cl - dist);
			}
		}
	}
}

function GenerateCylinder(grid, cx, cy, cz, quantize) {
	for (var z = 0; z < grid.size.z; ++z) {
		for (var y = 0; y < grid.size.y; ++y) {
			for (var x = 0; x < grid.size.x; ++x) {
				var qx = Math.abs(x - grid.size.x / 2);
				var qy = Math.abs(y - grid.size.y / 2);
				var qz = Math.abs(z - grid.size.z / 2);
				var dist = Math.sqrt(Math.pow(qx - cx, 2) + Math.pow(qz - cy, 2)) - cz;
				if (quantize)
					grid.set(x, y, z, (1.0 - dist > 0 ? 1.0 : 0.0));
				else
					grid.set(x, y, z, 1.0 - dist);
			}
		}
	}
}

function init() {
	var engine = new Fe.Engine();
	engine.init(document.getElementById('canvas'));
	
	var material = null;
	
	var materialFactory = new Fe.MaterialFactory();
	
	var meshRenderer = null;
	var modelTransform = null;
	
	document.getElementById('rerender').addEventListener(
		'click',
		function() {
			var meshFactory = new Fe.MeshFactory();
			var grid = new Fe.Grid3(50, 50, 50);
			var meshE = document.getElementById('mesh');
			var meshType = meshE.options[meshE.selectedIndex].value;
			var quantize = document.getElementById('quantize').checked;
			var blur = document.getElementById('blur').checked;
			var threshold = document.getElementById('threshold').value;
			var methodE = document.getElementById('method');
			var method = methodE.options[methodE.selectedIndex].value;
			
			if (meshType == 'sphere')
				GenerateSphere(grid, 15, quantize);
			else if (meshType == 'torus')
				GenerateTorus(grid, 5, 15, quantize);
			else if (meshType == 'hexprism')
				GenerateHexPrism(grid, 15, 15, quantize);
			else if (meshType == 'cone')
				GenerateCone(grid, 10, 10, quantize);
			else if (meshType == 'cylinder')
				GenerateCylinder(grid, 10, 10, 5, quantize);
			else
				throw new Error('Unable to generate mesh \'' + meshType + '\'');
			
			if (blur) {
				for (var i = 0; i < 3; ++i)
					grid.boxBlur();
				grid.filter(function(value) { return value - threshold; });
			}
			
			if (method == 'voxel')
				grid.buildVoxel(meshFactory);
			else
				grid.buildMarchingCubes(meshFactory);
			
			meshFactory.recalculateNormals(Fe.MeshFactoryVertex, true);
			var mesh = meshFactory.buildMesh(engine.gl, Fe.MeshFactoryVertex.format(engine.gl));
			
			modelTransform.position = vec3.fromValues(-grid.size.x / 2, -grid.size.y / 2, -grid.size.z / 2);
			meshRenderer.mesh = mesh;
			meshRenderer.material = material;
		}
	);
	
	Fe.Frame([
		function(next) {
			materialFactory.loadVertexShaderSource('data/vertex.glsl', next);
		},
		function(next) {
			materialFactory.loadFragmentShaderSource('data/fragment.glsl', next);
		}
	]);
	Fe.Frame(function(next) {
		materialFactory.mapShaderUniform('modelViewMatrix');
		materialFactory.mapShaderUniform('projectionMatrix');
		materialFactory.mapShaderUniform('normalMatrix');
		materialFactory.mapShaderUniform('lightPosition');
		
		materialFactory.mapShaderAttrib('position');
		materialFactory.mapShaderAttrib('normal');
		materialFactory.mapShaderAttrib('uv');
		materialFactory.mapShaderAttrib('color');
		
		material = materialFactory.buildMaterial(engine.gl);
		
		// Set up entities
		
		modelEntity = new Fe.Entity('model');
		modelTransform = modelEntity.addComponent(Fe.Transform);
		meshRenderer = modelEntity.addComponent(Fe.MeshRenderer);
		meshRenderer.mesh = mesh;
		meshRenderer.material = material;
		engine.sceneRoot.addChild(modelEntity);
		
		cameraEntity = new Fe.Entity('camera');
		var cameraTransform = cameraEntity.addComponent(Fe.Transform);
		var camera = cameraEntity.addComponent(Fe.Camera);
		cameraEntity.addComponent(CameraController);
		engine.sceneRoot.addChild(cameraEntity);
		
		lightEntity = new Fe.Entity('light');
		var lightTransform = lightEntity.addComponent(Fe.Transform);
		var light = lightEntity.addComponent(Fe.Light);
		lightEntity.addComponent(LightController);
		engine.sceneRoot.addChild(lightEntity);
		
		// Start main loop
		engine.run();
		
		next();
	});
	Fe.Frame();
};
