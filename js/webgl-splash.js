"use strict";

var WebGLApp = function() {
};
WebGLApp.prototype.createShader = function(type, source) {
	var shader = this.gl.createShader(type);
	this.gl.shaderSource(shader, source);
	this.gl.compileShader(shader);
	var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}
	
	console.log(this.gl.getShaderInfoLog(shader));
	this.gl.deleteShader(shader);
};
WebGLApp.prototype.createProgram = function(vertexShader, fragmentShader) {
	var program = this.gl.createProgram();
	this.gl.attachShader(program, vertexShader);
	this.gl.attachShader(program, fragmentShader);
	this.gl.linkProgram(program);
	var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
	if (success) {
		return program;
	}
	
	console.log(this.gl.getProgramInfoLog(program));
	this.gl.deleteProgram(program);
};
WebGLApp.prototype.start = function(meshes) {
	// GL
	this.canvas = document.getElementById("webgl-splash");
	this.gl = this.canvas.getContext("webgl");
	if (!this.gl) {
		return;
	}
	
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.depthFunc(this.gl.LESS);
	
	var vertexShaderSource = document.getElementById("vertex-shader").text;
	var fragmentShaderSource = document.getElementById("fragment-shader").text;
	
	var vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
	var fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
	
	this.program = this.createProgram(vertexShader, fragmentShader);
	
	this.program.vertexPositionAttribute = this.gl.getAttribLocation(this.program, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
	
	this.program.vertexNormalAttribute = this.gl.getAttribLocation(this.program, "aVertexNormal");
	this.gl.enableVertexAttribArray(this.program.vertexNormalAttribute);
	
	this.program.uniformModelViewProjectionMatrix = this.gl.getUniformLocation(this.program, "uModelViewProjectionMatrix");
	this.program.uniformModelViewMatrix = this.gl.getUniformLocation(this.program, "uModelViewMatrix");
	
	this.meshes = meshes;
	this.mesh = (window.location.pathname == '/' ? this.meshes.dragon : this.meshes.bunny);
	OBJ.initMeshBuffers(this.gl, this.mesh);
	
	// Viewing
	this.eyePosition = vec3.fromValues(0, 0, -10);
	this.focusPosition = vec3.fromValues(0, 0, 0);
	this.upVector = vec3.fromValues(0, 1, 0);
	this.modelViewMatrix = mat4.create();
	this.projectionMatrix = mat4.create();
	
	this.update();
};
WebGLApp.prototype.update = function() {
	var time = performance.now() / 1000.0;
	var speed = 0.1;
	var offset = Math.PI * 0.7;
	var angle = Math.sin(time * speed) * 0.3 + offset;
	var radius = 13;
	vec3.set(
		this.eyePosition,
		Math.cos(angle) * radius,
		5,
		Math.sin(angle) * radius);
	vec3.set(
		this.focusPosition,
		0,
		4.5,
		0);
	
	var modelMatrix = mat4.create();
	mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(1.0, 0.0, 0.0));
	var viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, this.eyePosition, this.focusPosition, this.upVector);
	mat4.mul(this.modelViewMatrix, modelMatrix, viewMatrix);
	mat4.perspective(this.projectionMatrix, 45, this.canvas.width / this.canvas.height, 0.1, 1000);
	
	this.draw();
	
	window.requestAnimationFrame(this.update.bind(this));
};
WebGLApp.prototype.draw = function() {
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	
	this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
	
	this.gl.clearColor(0, 0, 0, 0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.gl.useProgram(this.program);
	
	this.gl.uniformMatrix4fv(
		this.program.uniformModelViewMatrix,
		false,
		this.modelViewMatrix);
	var modelViewProjectionMatrix = mat4.create();
	mat4.mul(
		modelViewProjectionMatrix,
		this.projectionMatrix,
		this.modelViewMatrix);
	this.gl.uniformMatrix4fv(
		this.program.uniformModelViewProjectionMatrix,
		false,
		modelViewProjectionMatrix);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	this.gl.vertexAttribPointer(
		this.program.vertexPositionAttribute,
		this.mesh.vertexBuffer.itemSize,
		this.gl.FLOAT,
		false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mesh.normalBuffer);
	this.gl.vertexAttribPointer(
		this.program.vertexNormalAttribute,
		this.mesh.normalBuffer.itemSize,
		this.gl.FLOAT,
		false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	this.gl.drawElements(
		this.gl.TRIANGLES,
		this.mesh.indexBuffer.numItems,
		this.gl.UNSIGNED_SHORT,
		0);
};

var app = null;
window.WebGLMain = function() {
	app = new WebGLApp();
	OBJ.downloadMeshes({
		dragon: '/models/dragon-lowpoly.obj',
		bunny: '/models/bunny-lowpoly.obj'
	}, app.start.bind(app));
};