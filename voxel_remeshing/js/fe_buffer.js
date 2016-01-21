Fe.Buffer = function() {
	this.size = 0;
	this.alloc = 0;
	this.buffer = null;
	this.view = null;
};
Fe.Buffer.prototype.clear = function() {
	this.size = 0;
	this.alloc = 0;
	this.buffer = null;
	this.view = null;
};
Fe.Buffer.prototype.reserve = function(bytes) {
	if (bytes <= this.alloc && bytes >= this.alloc / 2)
		return;
	var newBuf = new ArrayBuffer(bytes);
	var newView = new DataView(newBuf);
	if (this.view)
		for (var i = 0; i < Math.min(bytes, this.size); ++i)
			newView.setUint8(i, this.view.getUint8(i));
	this.buffer = newBuf;
	this.view = newView;
	this.alloc = bytes;
};
Fe.Buffer.prototype.pushBytes = function(bytes) {
	if (this.size + bytes > this.alloc)
		this.reserve(Math.max(this.size + bytes, this.alloc * 2));
	this.size += bytes;
};
Fe.Buffer.prototype.popBytes = function(bytes) {
	this.reserve(Math.max(0, this.size - bytes));
	this.size -= bytes;
};
Fe.Buffer.prototype.resize = function(bytes) {
	this.reserve(bytes);
	this.size = bytes;
};
Fe.Buffer.prototype.makeRawBuffer = function() {
	var newBuf = new ArrayBuffer(this.size);
	var newView = new DataView(newBuf);
	for (var i = 0; i < this.size; ++i)
		newView.setUint8(i, this.view.getUint8(i));
	return newBuf;
};
// Getters
Fe.Buffer.prototype.getInt8 = function(byteOffset) {
	return this.view.getInt8(byteOffset);
};
Fe.Buffer.prototype.getUint8 = function(byteOffset) {
	return this.view.getUint8(byteOffset);
};
Fe.Buffer.prototype.getInt16 = function(byteOffset) {
	return this.view.getInt16(byteOffset, Fe.Endianness);
};
Fe.Buffer.prototype.getUint16 = function(byteOffset) {
	return this.view.getUint16(byteOffset, Fe.Endianness);
};
Fe.Buffer.prototype.getInt32 = function(byteOffset) {
	return this.view.getInt32(byteOffset, Fe.Endianness);
};
Fe.Buffer.prototype.getUint32 = function(byteOffset) {
	return this.view.getUint32(byteOffset, Fe.Endianness);
};
Fe.Buffer.prototype.getFloat32 = function(byteOffset) {
	return this.view.getFloat32(byteOffset, Fe.Endianness);
};
Fe.Buffer.prototype.getFloat64 = function(byteOffset) {
	return this.view.getFloat64(byteOffset, Fe.Endianness);
};
// Setters
Fe.Buffer.prototype.setInt8 = function(byteOffset, value) {
	this.view.setInt8(byteOffset, value);
};
Fe.Buffer.prototype.setUint8 = function(byteOffset, value) {
	this.view.setUint8(byteOffset, value);
};
Fe.Buffer.prototype.setInt16 = function(byteOffset, value) {
	this.view.setInt16(byteOffset, value, Fe.Endianness);
};
Fe.Buffer.prototype.setUint16 = function(byteOffset, value) {
	this.view.setUint16(byteOffset, value, Fe.Endianness);
};
Fe.Buffer.prototype.setInt32 = function(byteOffset, value) {
	this.view.setInt32(byteOffset, value, Fe.Endianness);
};
Fe.Buffer.prototype.setUint32 = function(byteOffset, value) {
	this.view.setUint32(byteOffset, value, Fe.Endianness);
};
Fe.Buffer.prototype.setFloat32 = function(byteOffset, value) {
	this.view.setFloat32(byteOffset, value, Fe.Endianness);
};
Fe.Buffer.prototype.setFloat64 = function(byteOffset, value) {
	this.view.setFloat64(byteOffset, value, Fe.Endianness);
};
// Pushers
Fe.Buffer.prototype.pushInt8 = function(int8) {
	this.pushBytes(1);
	this.view.setInt8(this.size - 1, int8);
};
Fe.Buffer.prototype.pushUint8 = function(uint8) {
	this.pushBytes(1);
	this.view.setUint8(this.size - 1, uint8);
};
Fe.Buffer.prototype.pushInt16 = function(int16) {
	this.pushBytes(2);
	this.view.setInt16(this.size - 2, int16, Fe.Endianness);
};
Fe.Buffer.prototype.pushUint16 = function(uint16) {
	this.pushBytes(2);
	this.view.setUint16(this.size - 2, uint16, Fe.Endianness);
};
Fe.Buffer.prototype.pushInt32 = function(int32) {
	this.pushBytes(4);
	this.view.setInt32(this.size - 4, int32, Fe.Endianness);
};
Fe.Buffer.prototype.pushUint32 = function(uint32) {
	this.pushBytes(4);
	this.view.setUint32(this.size - 4, uint32, Fe.Endianness);
};
Fe.Buffer.prototype.pushFloat32 = function(float32) {
	this.pushBytes(4);
	this.view.setFloat32(this.size - 4, float32, Fe.Endianness);
};
Fe.Buffer.prototype.pushFloat64 = function(float64) {
	this.pushBytes(8);
	this.view.setFloat64(this.size - 8, float64, Fe.Endianness);
};
// Poppers
Fe.Buffer.prototype.popInt8 = function() {
	this.popBytes(1);
};
Fe.Buffer.prototype.popUint8 = function() {
	this.popBytes(1);
};
Fe.Buffer.prototype.popInt16 = function() {
	this.popBytes(2);
};
Fe.Buffer.prototype.popUint16 = function() {
	this.popBytes(2);
};
Fe.Buffer.prototype.popInt32 = function() {
	this.popBytes(4);
};
Fe.Buffer.prototype.popUint32 = function() {
	this.popBytes(4);
};
Fe.Buffer.prototype.popFloat32 = function() {
	this.popBytes(4);
};
Fe.Buffer.prototype.popFloat64 = function() {
	this.popBytes(8);
};
// Pack/Unpack objects
Fe.Buffer.prototype.packOffset = function(byteOffset, object) {
	object.packBuffer(new DataView(this.buffer, byteOffset));
};
Fe.Buffer.prototype.packIndex = function(index, object) {
	object.packBuffer(new DataView(this.buffer, object.packedSize() * index));
};
Fe.Buffer.prototype.unpackOffset = function(byteOffset, object) {
	object.unpackBuffer(new DataView(this.buffer, byteOffset));
};
Fe.Buffer.prototype.unpackIndex = function(index, object) {
	object.unpackBuffer(new DataView(this.buffer, object.packedSize() * index));
};
Fe.Buffer.prototype.pushPacked = function(object) {
	var bytes = object.packedSize();
	this.pushBytes(bytes);
	object.packBuffer(new DataView(this.buffer, this.size - bytes));
};
Fe.Buffer.prototype.popPacked = function(type) {
	this.popBytes(type.prototype.packedSize());
};
