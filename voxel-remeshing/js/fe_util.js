Fe.Frame = function(funs) {
	if (funs)
		Fe.Frame.queue.push(funs);
	else
		Fe.Frame.callback();
};
Fe.Frame.queue = [];
Fe.Frame.running = 0;
Fe.Frame.callback = function() {
	--Fe.Frame.running;
	if (Fe.Frame.running > 0 || Fe.Frame.queue.length == 0)
		return;
	
	var newArgs = [Fe.Frame.callback];
	for (var i = 0; i < arguments.length; ++i)
		newArgs.push(arguments[i]);
	
	var cur = Fe.Frame.queue.splice(0, 1)[0];
	
	if (cur.constructor != Array) {
		Fe.Frame.running = 1;
		cur.apply(this, newArgs);
	} else {
		Fe.Frame.running = cur.length;
		for (var i = 0; i < cur.length; ++i)
			cur[i].apply(this, newArgs);
	}
};

Fe.Endianness = (function() {
	var buffer = new ArrayBuffer(2);
	new DataView(buffer).setInt16(0, 256, true);
	return new Int16Array(buffer)[0] === 256;
})();

Fe.DefaultTypeValue = function(gl, type, size) {
	if (size) {
		var values = [];
		for (var i = 0; i < size; ++i)
			values.push(Fe.DefaultTypeValue(gl, type));
		return values;
	}
	
	switch (type) {
		case gl.FLOAT:
			return 0;
		case gl.FLOAT_VEC2:
			return vec2.create();
		case gl.FLOAT_VEC3:
			return vec3.create();
		case gl.FLOAT_VEC4:
			return vec4.create();
		
		case gl.BOOL:
			return false;
		case gl.BOOL_VEC2:
			return [false, false];
		case gl.BOOL_VEC3:
			return [false, false, false];
		case gl.BOOL_VEC4:
			return [false, false, false, false];
		
		case gl.INT:
			return 0;
		case gl.INT_VEC2:
			return [0, 0];
		case gl.INT_VEC3:
			return [0, 0, 0];
		case gl.INT_VEC4:
			return [0, 0, 0, 0];
		
		case gl.FLOAT_MAT2:
			return mat2.create();
		case gl.FLOAT_MAT3:
			return mat3.create();
		case gl.FLOAT_MAT4:
			return mat4.create();
		
		case gl.SAMPLER_2D:
			return null;
		case gl.SAMPLER_CUBE:
			return null;
		
		default:
			throw new Error('Fe.DefaultTypeValue: Unknown GL type \'' + type + '\'');
	}
};

Fe.SetUniform = function(gl, location, type, value) {
	switch (type) {
		case gl.FLOAT:
			gl.uniform1fv(location, value);
			break;
		case gl.FLOAT_VEC2:
			gl.uniform2fv(location, value);
			break;
		case gl.FLOAT_VEC3:
			gl.uniform3fv(location, value);
			break;
		case gl.FLOAT_VEC4:
			gl.uniform4fv(location, value);
			break;
		
		case gl.BOOL:
			var data = new Int32Array(1);
			data[0] = (value ? 1 : 0);
			gl.uniform1iv(location, data);
			break;
		case gl.BOOL_VEC2:
			var data = new Int32Array(2);
			data[0] = (value[0] ? 1 : 0);
			data[1] = (value[1] ? 1 : 0);
			gl.uniform2iv(location, data);
			break;
		case gl.BOOL_VEC3:
			var data = new Int32Array(3);
			data[0] = (value[0] ? 1 : 0);
			data[1] = (value[1] ? 1 : 0);
			data[2] = (value[2] ? 1 : 0);
			gl.uniform3iv(location, data);
			break;
		case gl.BOOL_VEC4:
			var data = new Int32Array(4 * size);
			data[0] = (value[0] ? 1 : 0);
			data[1] = (value[1] ? 1 : 0);
			data[2] = (value[2] ? 1 : 0);
			data[3] = (value[3] ? 1 : 0);
			gl.uniform4iv(location, data);
			break;
		
		case gl.INT:
			var data = new Int32Array(1);
			data[0] = value[0];
			gl.uniform1iv(location, data);
			break;
		case gl.INT_VEC2:
			var data = new Int32Array(2);
			data[0] = value[0];
			data[1] = value[1];
			gl.uniform2iv(location, data);
			break;
		case gl.INT_VEC3:
			var data = new Int32Array(3 * size);
			data[0] = value[0];
			data[1] = value[1];
			data[2] = value[2];
			gl.uniform3iv(location, data);
			break;
		case gl.INT_VEC4:
			var data = new Int32Array(4 * size);
			data[0] = value[0];
			data[1] = value[1];
			data[2] = value[2];
			data[3] = value[3];
			gl.uniform4iv(location, data);
			break;
		
		case gl.FLOAT_MAT2:
			gl.uniformMatrix2fv(location, false, value);
			break;
		case gl.FLOAT_MAT3:
			gl.uniformMatrix3fv(location, false, value);
			break;
		case gl.FLOAT_MAT4:
			gl.uniformMatrix4fv(location, false, value);
			break;
		
		case gl.SAMPLER:
		case gl.SAMPLER_CUBE:
			var data = new Int32Array(1);
			data[0] = value[0];
			glUniform1iv(location, data);
			break;
		
		default:
			throw new Error('Fe.SetUniform: Unknown GL type \'' + type + '\'');
	}
};
