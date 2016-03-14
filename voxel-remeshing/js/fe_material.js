Fe.Material = function() {
	this.program = null;
	this.attribs = null;
	this.uniforms = null;
};

Fe.MaterialFactory = function() {
	this.vertexShaderSource = '';
	this.fragmentShaderSource = '';
	this.attribMap = {};
	this.uniformMap = {};
};
Fe.MaterialFactory.prototype.clear = function() {
	this.vertexShaderSource = '';
	this.fragmentShaderSource = '';
	this.attribMap = {};
	this.uniformMap = {};
};
Fe.MaterialFactory.prototype.setVertexShaderSource = function(source) {
	this.vertexShaderSource = source;
};
Fe.MaterialFactory.prototype.setFragmentShaderSource = function(source) {
	this.fragmentShaderSource = source;
};
Fe.MaterialFactory.prototype.loadVertexShaderSource = function(url, callback) {
	var req = new XMLHttpRequest();
	req.overrideMimeType('text/plain');
	req.open('GET', url, true);
	
	var factory = this;
	req.onload = function() {
		factory.setVertexShaderSource(this.responseText);
		callback();
	};
	
	req.send();
};
Fe.MaterialFactory.prototype.loadFragmentShaderSource = function(url, callback) {
	var req = new XMLHttpRequest();
	req.overrideMimeType('text/plain');
	req.open('GET', url, true);
	
	var factory = this;
	req.onload = function() {
		factory.setFragmentShaderSource(this.responseText);
		callback();
	};
	
	req.send();
};
Fe.MaterialFactory.prototype.mapShaderAttrib = function(shaderName, localName) {
	if (!localName)
		localName = shaderName;
	this.attribMap[shaderName] = localName;
};
Fe.MaterialFactory.prototype.mapShaderUniform = function(shaderName, localName) {
	if (!localName)
		localName = shaderName;
	this.uniformMap[shaderName] = localName;
};
Fe.MaterialFactory.prototype.buildMaterial = function(gl) {
	var material = new Fe.Material();
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, this.vertexShaderSource);
	gl.compileShader(vertexShader);
	
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, this.fragmentShaderSource);
	gl.compileShader(fragmentShader);
	
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
		throw new Error('Fe.MaterialFactory.buildMaterial: Vertex shader source failed to compile with message \'' + gl.getShaderInfoLog(vertexShader) + '\'');
	
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
		throw new Error('Fe.MaterialFactory.buildMaterial: Fragment shader source failed to compile with message \'' + gl.getShaderInfoLog(fragmentShader) + '\'');
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
		throw new Error('Fe.MaterialFactory.buildMaterial: Shader program failed to link with link status \'' + gl.getProgramInfoLog(program) + '\'');
	
	var attribs = {};
	var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for (var i = 0; i < attribCount; ++i) {
		var info = gl.getActiveAttrib(program, i);
		if (!this.attribMap[info.name])
			continue;
		
		var location = gl.getAttribLocation(program, info.name);
		var localName = this.attribMap[info.name];
		
		attribs[localName] = {
			type: info.type,
			size: info.size,
			location: location
		};
	}
	
	var uniforms = {};
	var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (var i = 0; i < uniformCount; ++i) {
		var info = gl.getActiveUniform(program, i);
		if (!this.uniformMap[info.name]) {
			console.log('unused uniform \'' + info.name + '\'');
			continue;
		}
		
		var location = gl.getUniformLocation(program, info.name);
		var localName = this.uniformMap[info.name];
		
		uniforms[localName] = {
			type: info.type,
			size: info.size,
			location: location
		};
	}
	
	material.program = program;
	material.attribs = attribs;
	material.uniforms = uniforms;
	
	return material;
};
