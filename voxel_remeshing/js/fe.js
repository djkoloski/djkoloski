var Fe = {};

Fe.Engine = function() {
	this.canvas = null;
	this.gl = null;
	this.scene = null;
	this.time = 0.0;
};
Fe.Engine.prototype.init = function(canvas) {
	this.canvas = canvas;
	try {
		this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
		this.viewportWidth = this.canvas.width;
		this.viewportHeight = this.canvas.height;
	} catch (e) {
		throw new Error('Fe.Engine.init: An error occurred while getting a WebGL context: \'' + e.toString() + '\'');
	}
	
	this.sceneRoot = new Fe.Entity('SceneRoot');
	
	this.gl.clearColor(0, 0, 0, 1);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.frontFace(this.gl.CCW);
	this.gl.enable(this.gl.CULL_FACE);
};
Fe.Engine.prototype.awake = function() {
	this.sceneRoot.broadcastEvent('awake');
};
Fe.Engine.prototype.update = function(deltaTime) {
	this.sceneRoot.broadcastEvent('update', [deltaTime]);
};
Fe.Engine.prototype.render = function() {
	var cameras = this.sceneRoot.getComponentsInChildren(Fe.Camera);
	var lights = this.sceneRoot.getComponentsInChildren(Fe.Light);
	
	for (var i = 0; i < cameras.length; ++i) {
		var camera = cameras[i];
		var transform = cameras[i].entity.getComponent(Fe.Transform);
		if (!transform) {
			console.warn('Fe.Engine.render: Entity with camera component but no transform component in scene, skipping rendering');
			continue;
		}
		
		var renderInfo = new Fe.RenderInfo(this.gl, camera, lights);
		
		this.gl.clearColor(camera.backgroundColor[0] / 255.0, camera.backgroundColor[1] / 255.0, camera.backgroundColor[2] / 255.0, camera.backgroundColor[3] / 255.0);
		this.gl.viewport(
			this.viewportWidth * camera.viewport.left,
			this.viewportHeight * camera.viewport.bottom,
			this.viewportWidth * (camera.viewport.right - camera.viewport.left),
			this.viewportHeight * (camera.viewport.top - camera.viewport.bottom)
		);
		this.gl.scissor(
			this.viewportWidth * camera.viewport.left,
			this.viewportHeight * camera.viewport.bottom,
			this.viewportWidth * (camera.viewport.right - camera.viewport.left),
			this.viewportHeight * (camera.viewport.top - camera.viewport.bottom)
		);
		this.gl.enable(this.gl.SCISSOR_TEST);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		this.sceneRoot.broadcastEvent('onRender', [renderInfo]);
	}
};
Fe.Engine.prototype.run = function() {
	this.awake();
	
	requestAnimationFrame(this.main.bind(this));
};
Fe.Engine.prototype.main = function(currentTime) {
	var deltaTime = currentTime - this.time;
	
	this.update(deltaTime);
	this.render();
	
	this.time = currentTime;
	requestAnimationFrame(this.main.bind(this));
};
