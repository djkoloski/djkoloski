Fe.Transform = function(entity) {
	this.entity = entity;
	this.position = vec3.create();
	this.rotation = quat.create();
	this.scale = vec3.fromValues(1.0, 1.0, 1.0);
};
Fe.Transform.prototype.getMatrix = function() {
	var scale = mat4.create();
	var rotpos = mat4.create();
	mat4.scale(scale, scale, this.scale);
	mat4.fromRotationTranslation(rotpos, this.rotation, this.position);
	mat4.mul(rotpos, rotpos, scale);
	return rotpos;
};
Fe.Transform.prototype.getLocalToWorldMatrix = function() {
	if (!this.entity.parent)
		return this.getMatrix();
	
	var parentTransform = this.entity.parent.getComponent(Fe.Transform);
	if (!parentTransform)
		return this.getMatrix();
	
	var matrix = parentTransform.localToWorldMatrix();
	mat4.mul(matrix, this.getMatrix());
	return matrix;
};
Fe.Transform.prototype.getWorldToLocalMatrix = function() {
	var matrix = this.getLocalToWorldMatrix();
	mat4.invert(matrix, matrix);
	return matrix;
};
Fe.Transform.prototype.lookAt = function(point, up) {
	if (!up)
		up = vec3.fromValues(0, 1, 0);
	
	var forwardVector = vec3.create();
	vec3.sub(forwardVector, point, this.position);
	vec3.normalize(forwardVector, forwardVector);
	
	var forward = vec3.fromValues(0, 0, -1);
	
	var dot = vec3.dot(forward, forwardVector);
	
	if (Math.abs(dot + 1.0) < 0.0)
		return quat.fromValues(up[0], up[1], up[2], Math.PI);
	
	if (Math.abs(dot - 1.0) < 0.0)
		return quat.create();
	
	var rotAngle = Math.acos(dot);
	var rotAxis = vec3.create();
	vec3.cross(rotAxis, forward, forwardVector);
	vec3.normalize(rotAxis, rotAxis);
	
	quat.setAxisAngle(this.rotation, rotAxis, rotAngle);
};

Fe.MeshRenderer = function(entity) {
	this.entity = entity;
	this.mesh = null;
	this.material = null;
};
Fe.MeshRenderer.prototype.onRender = function(renderInfo) {
	if (this.mesh == null || this.mesh.vertexBuffer == null)
		return;
	
	var gl = renderInfo.gl;
	
	var transform = this.entity.getComponent(Fe.Transform);
	var modelViewMatrix = transform.getLocalToWorldMatrix();
	mat4.mul(modelViewMatrix, renderInfo.viewMatrix, modelViewMatrix);
	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, modelViewMatrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	
	gl.useProgram(this.material.program);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
	
	for (var attribName in this.material.attribs) {
		var attribFormat = this.mesh.vertexFormat.attribs[attribName];
		var attribInfo = this.material.attribs[attribName];
		gl.enableVertexAttribArray(attribInfo.location);
		gl.vertexAttribPointer(attribInfo.location, attribFormat.size, attribFormat.type, attribFormat.normalized, this.mesh.vertexFormat.stride, attribFormat.offset);
	}
	
	var currentTexture = 0;
	for (var uniformName in this.material.uniforms) {
		var uniformInfo = this.material.uniforms[uniformName];
		var uniformValue = null;
		
		switch (uniformName) {
			case 'modelViewMatrix':
				uniformValue = modelViewMatrix;
				break;
			case 'projectionMatrix':
				uniformValue = renderInfo.projectionMatrix;
				break;
			case 'normalMatrix':
				uniformValue = normalMatrix;
				break;
			case 'lightPosition':
				uniformValue = vec4.create();
				var pos = renderInfo.lights[0].entity.getComponent(Fe.Transform).position;
				vec4.transformMat4(uniformValue, vec4.fromValues(pos[0], pos[1], pos[2], 1.0), renderInfo.viewMatrix);
				break;
			default:
				uniformValue = this.material.uniforms[uniformName].value;
				break;
		}
		
		if (uniformInfo.type == gl.SAMPLER || uniformInfo.type == gl.SAMPLER_CUBE) {
			gl.activeTexture(gl.TEXTURE0 + currentTexture);
			gl.bindTexture(gl.TEXTURE_2D, uniformValue);
			Fe.SetUniform(gl, uniformInfo.location, uniformInfo.type, currentTexture);
		} else
			Fe.SetUniform(gl, uniformInfo.location, uniformInfo.type, uniformValue);
	}
	
	gl.drawElements(gl.TRIANGLES, this.mesh.indexFormat.count, this.mesh.indexFormat.type, this.mesh.indexFormat.offset);
	
	for (var attribName in this.material.attribs) {
		var attribInfo = this.material.attribs[attribName];
		gl.disableVertexAttribArray(attribInfo.location);
	}
};

Fe.Camera = function(entity) {
	this.entity = entity;
	this.aspect = 1.0;
	this.backgroundColor = [109, 155, 195, 255];
	this.nearClipPlane = 0.1;
	this.farClipPlane = 1000.0;
	this.fieldOfView = Math.PI / 2.0;
	this.orthographic = false;
	this.orthographicSize = 5;
	this.viewport = {
		left: 0.0,
		right: 1.0,
		bottom: 0.0,
		top: 1.0
	};
};
Fe.Camera.prototype.getViewMatrix = function() {
	var transform = this.entity.getComponent(Fe.Transform);
	if (!transform)
		throw Error('Fe.getViewMatrix: Camera entity missing a transform');
	return transform.getWorldToLocalMatrix();
};
Fe.Camera.prototype.getProjectionMatrix = function() {
	var matrix = mat4.create();
	if (this.orthographic) {
		mat4.ortho(
			matrix,
			-this.aspect * this.orthographicSize,
			this.aspect * this.orthographicSize,
			-this.orthographicSize,
			this.orthographicSize,
			this.nearClipPlane,
			this.farClipPlane
		);
	} else {
		mat4.perspective(
			matrix,
			this.fieldOfView,
			this.aspect,
			this.nearClipPlane,
			this.farClipPlane
		);
	}
	return matrix;
};

Fe.Light = function(entity) {
	this.entity = entity;
};
