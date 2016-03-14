Fe.RenderInfo = function(gl, camera, lights) {
	this.gl = gl;
	this.camera = camera;
	this.projectionMatrix = camera.getProjectionMatrix();
	this.viewMatrix = camera.getViewMatrix();
	this.lights = lights;
};
