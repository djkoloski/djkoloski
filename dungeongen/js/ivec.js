var ivec2 = {
	add: function(out, a, b) {
		out.set([a[0] + b[0], a[1] + b[1]]);
	},
	clone: function(a) {
		return new Int32Array(a);
	},
	copy: function(out, a) {
		out.set(a);
	},
	create: function() {
		return new Int32Array(2);
	},
	dist: function(a, b) {
		return Math.sqrt(ivec2.sqrDist(a, b));
	},
	div: function(out, a, b) {
		out.set([a[0] / b[0], a[1] / b[1]]);
	},
	dot: function(a, b) {
		return a[0] * b[0] + a[1] * b[1];
	},
	equal: function(a, b) {
		return a[0] == b[0] && a[1] == b[1];
	},
	fromValues: function(x, y) {
		return new Int32Array([x, y]);
	},
	len: function(a) {
		return Math.sqrt(ivec2.sqrLen(a));
	},
	lerp: function(out, a, b, t) {
		out.set([a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t]);
	},
	max: function(out, a, b) {
		out.set([(a[0] > b[0] ? a[0] : b[0]), (a[1] > b[1] ? a[1] : b[1])]);
	},
	min: function(out, a, b) {
		out.set([(a[0] < b[0] ? a[0] : b[0]), (a[1] < b[1] ? a[1] : b[1])]);
	},
	mul: function(out, a, b) {
		out.set([a[0] * b[0], a[1] * b[1]]);
	},
	negate: function(out, a) {
		out.set([-a[0], -a[1]]);
	},
	scale: function(out, a, b) {
		out.set([a[0] * b, a[1] * b]);
	},
	scaleAndAdd: function(out, a, b, scale) {
		out.set([a[0] + b[0] * scale, a[1] + b[1] * scale]);
	},
	set: function(out, x, y) {
		out.set([x, y]);
	},
	sqrDist: function(a, b) {
		var d0 = b[0] - a[0];
		var d1 = b[1] - a[1];
		return d0 * d0 + d1 * d1;
	},
	sqrLen: function(a) {
		return a[0] * a[0] + a[1] * a[1];
	},
	str: function(vec) {
		return '(' + vec[0] + ',' + vec[1] + ')';
	},
	sub: function(out, a, b) {
		out.set([a[0] - b[0], a[1] - b[1]]);
	}
};
