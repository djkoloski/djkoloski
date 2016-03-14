Fe.Mesh = function() {
	this.vertexBuffer = null;
	this.vertexFormat = null;
	this.indexBuffer = null;
	this.indexFormat = null;
};
Fe.Mesh.prototype.Destroy = function(gl) {
	if (this.vertexBuffer != null)
		gl.deleteBuffer(this.vertexBuffer);
	if (this.indexBuffer != null)
		gl.deleteBuffer(this.indexBuffer);
};

Fe.MeshFactory = function() {
	this.vertices = new Fe.Buffer();
	this.vertexCount = 0;
	this.indices = new Fe.Buffer();
	this.indexCount = 0;
};
Fe.MeshFactory.prototype.clear = function() {
	this.vertices = new Fe.Buffer();
	this.vertexCount = 0;
	this.indices = new Fe.Buffer();
	this.indexCount = 0;
};
Fe.MeshFactory.prototype.addVertex = function(vertex) {
	this.vertices.pushPacked(vertex);
	++this.vertexCount;
};
Fe.MeshFactory.prototype.addIndex = function(i) {
	this.indices.pushUint16(i);
	++this.indexCount;
};
Fe.MeshFactory.prototype.addTriangle = function(a, b, c) {
	this.addIndex(a);
	this.addIndex(b);
	this.addIndex(c);
};
Fe.MeshFactory.prototype.addQuad = function(a, b, c, d) {
	this.addTriangle(a, b, c);
	this.addTriangle(c, d, a);
};
Fe.MeshFactory.prototype.buildMesh = function(gl, format) {
	var vertexBuffer = this.vertices.makeRawBuffer();
	var indexBuffer = this.indices.makeRawBuffer();
	
	mesh.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer, gl.STATIC_DRAW);
	
	mesh.vertexFormat = format;
	
	mesh.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);
	
	mesh.indexFormat = {
		count: this.indexCount,
		type: gl.UNSIGNED_SHORT,
		offset: 0
	};
	
	return mesh;
};
Fe.MeshFactory.prototype.recalculateNormals = function(type, smooth) {
	for (var i = 0; i < this.vertexCount; ++i) {
		var v = new type();
		this.vertices.unpackIndex(i, v);
		v.normal = vec3.create();
		this.vertices.packIndex(i, v);
	}
	
	for (var i = 0; i < this.indexCount;) {
		var ia = this.indices.getUint16(2 * i++);
		var ib = this.indices.getUint16(2 * i++);
		var ic = this.indices.getUint16(2 * i++);
		
		var a = new type();
		var b = new type();
		var c = new type();
		
		this.vertices.unpackIndex(ia, a);
		this.vertices.unpackIndex(ib, b);
		this.vertices.unpackIndex(ic, c);
		
		var ba = vec3.create();
		vec3.sub(ba, b.position, a.position);
		var ca = vec3.create();
		vec3.sub(ca, c.position, a.position);
		var normal = vec3.create();
		vec3.cross(normal, ba, ca);
		vec3.normalize(normal, normal);
		
		if (smooth) {
			vec3.add(a.normal, a.normal, normal);
			vec3.add(b.normal, b.normal, normal);
			vec3.add(c.normal, c.normal, normal);
		} else {
			a.normal = normal;
			b.normal = normal;
			c.normal = normal;
		}
		
		this.vertices.packIndex(ia, a);
		this.vertices.packIndex(ib, b);
		this.vertices.packIndex(ic, c);
	}
	
	if (smooth) {
		for (var i = 0; i < this.vertexCount; ++i) {
			var v = new type();
			this.vertices.unpackIndex(i, v);
			vec3.normalize(v.normal, v.normal);
			this.vertices.packIndex(i, v);
		}
	}
};
Fe.MeshFactory.prototype.loadOBJ = function(url, callback) {
	var req = new XMLHttpRequest();
	req.overrideMimeType('text/plain');
	req.open('GET', url, true);
	
	var factory = this;
	req.onload = function() {
		factory.parseOBJ(this.responseText);
		callback();
	};
	
	req.send();
};
Fe.MeshFactory.prototype.parseOBJ = function(text) {
	var lines = text.split(/[\n\r]+/g);
	var vertexPositions = [];
	var vertexUVs = [];
	var vertexNormals = [];
	
	for (var i = 0; i < lines.length; ++i) {
		var line = lines[i];
		
		if (line == '' || line[0] == '#')
			continue;
		
		var pieces = line.split(/\s+/g);
		
		switch (pieces[0]) {
			case 'v':
				vertexPositions.push(vec3.fromValues(parseFloat(pieces[1]), parseFloat(pieces[2]), parseFloat(pieces[3])));
				break;
			case 'vt':
				vertexUVs.push(vec2.fromValues(parseFloat(pieces[1]), parseFloat(pieces[2])));
				break;
			case 'vn':
				vertexNormals.push(vec3.fromValues(parseFloat(pieces[1]), parseFloat(pieces[2]), parseFloat(pieces[3])));
				break;
			case 'f':
				var startIndex = this.vertexCount;
				
				for (var j = 1; j < pieces.length; ++j) {
					var indices = pieces[j].split('/');
					var pos = null;
					var uv = null;
					var normal = null;
					var color = null;
					
					for (var k = 0; k < indices.length; ++k) {
						var index = indices[k];
						if (index == '')
							continue;
						
						switch (k) {
							case 0:
								pos = vertexPositions[parseInt(index) - 1];
								break;
							case 1:
								uv = vertexUVs[parseInt(index) - 1];
								break;
							case 2:
								normal = vertexNormals[parseInt(index) - 1];
								break;
							default:
								throw new Error('Fe.MeshFactory.parseOBJ: More than 3 face indices at line ' + (i + 1) + ' of OBJ.');
						}
					}
					
					this.addVertex(
						new Fe.MeshFactoryVertex(
							(pos ? pos : vec3.create()),
							(normal ? normal : vec3.create()),
							(uv ? uv : vec2.create()),
							[255, 255, 255, 255]
						)
					);
				}
				
				if (pieces.length == 4)
					this.addTriangle(startIndex, startIndex + 1, startIndex + 2);
				else
					this.addQuad(startIndex, startIndex + 1, startIndex + 2, startIndex + 3);
				
				break;
			case 'mtllib':
			case 'usemtl':
			case 'o':
			case 'g':
			case 's':
				break;
			default:
				throw new Error('Fe.MeshFactory.parseOBJ: Unrecognized OBJ command ' + pieces[0] + ' at line ' + (i + 1) + ' of OBJ.');
		}
	}
};

Fe.MeshFactoryVertex = function(position, normal, uv, color) {
	this.position = position;
	this.normal = normal;
	this.uv = uv;
	this.color = color;
};
Fe.MeshFactoryVertex.packedSize = function() {
	return 36;
};
Fe.MeshFactoryVertex.format = function(gl) {
	return {
		stride: Fe.MeshFactoryVertex.packedSize(),
		attribs: {
			position: {
				size: 3,
				type: gl.FLOAT,
				normalized: false,
				offset: 0
			},
			normal: {
				size: 3,
				type: gl.FLOAT,
				normalized: false,
				offset: 12
			},
			uv: {
				size: 2,
				type: gl.FLOAT,
				normalized: false,
				offset: 24
			},
			color: {
				size: 4,
				type: gl.UNSIGNED_BYTE,
				normalized: true,
				offset: 32
			}
		}
	};
};
Fe.MeshFactoryVertex.prototype.packedSize = function() {
	return Fe.MeshFactoryVertex.packedSize();
};
Fe.MeshFactoryVertex.prototype.packBuffer = function(view) {
	view.setFloat32(0, this.position[0], Fe.Endianness);
	view.setFloat32(4, this.position[1], Fe.Endianness);
	view.setFloat32(8, this.position[2], Fe.Endianness);
	
	view.setFloat32(12, this.normal[0], Fe.Endianness);
	view.setFloat32(16, this.normal[1], Fe.Endianness);
	view.setFloat32(20, this.normal[2], Fe.Endianness);
	
	view.setFloat32(24, this.uv[0], Fe.Endianness);
	view.setFloat32(28, this.uv[1], Fe.Endianness);
	
	view.setUint8(32, this.color[0]);
	view.setUint8(33, this.color[1]);
	view.setUint8(34, this.color[2]);
	view.setUint8(35, this.color[3]);
};
Fe.MeshFactoryVertex.prototype.unpackBuffer = function(view) {
	this.position = vec3.fromValues(
		view.getFloat32(0, Fe.Endianness),
		view.getFloat32(4, Fe.Endianness),
		view.getFloat32(8, Fe.Endianness)
	);
	
	this.normal = vec3.fromValues(
		view.getFloat32(12, Fe.Endianness),
		view.getFloat32(16, Fe.Endianness),
		view.getFloat32(20, Fe.Endianness)
	);
	
	this.uv = vec2.fromValues(
		view.getFloat32(24, Fe.Endianness),
		view.getFloat32(28, Fe.Endianness)
	);
	
	this.color = [
		view.getUint8(32),
		view.getUint8(33),
		view.getUint8(34),
		view.getUint8(35)
	];
};
