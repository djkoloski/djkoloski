var vec2 = cc.extend(
	function(x, y) {
		return new Float32Array([x || 0, y || 0]);
	},
	{
		add: function(out, a, b) {
			out[0] = a[0] + b[0];
			out[1] = a[1] + b[1];
			return out;
		},
		clone: function(a) {
			return vec2.create(a[0], a[1]);
		},
		copy: function(out, a) {
			out[0] = a[0];
			out[1] = a[1];
			return out;
		},
		create: function() {
			return vec2(0, 0);
		},
		dist: function(a, b) {
			return Math.sqrt(vec2.sqrDist(a, b));
		},
		div: function(out, a, b) {
			out[0] = a[0] / b[0];
			out[1] = a[1] / b[1];
			return out;
		},
		dot: function(a, b) {
			return a[0] * b[0] + a[1] * b[1];
		},
		eq: function(a, b) {
			return (a[0] == b[0] && a[1] == b[1]);
		},
		len: function(a) {
			return Math.sqrt(vec2.sqrLen(a));
		},
		lerp: function(out, a, b, t) {
			out[0] = a[0] * (1.0 - t) + b[0] * t;
			out[1] = a[1] * (1.0 - t) + b[1] * t;
			return out;
		},
		max: function(out, a, b) {
			out[0] = Math.max(a[0], b[0]);
			out[1] = Math.max(a[1], b[1]);
			return out;
		},
		min: function(out, a, b) {
			out[0] = Math.min(a[0], b[0]);
			out[1] = Math.min(a[1], b[1]);
			return out;
		},
		mul: function(out, a, b) {
			out[0] = a[0] * b[0];
			out[1] = a[1] * b[1];
			return out;
		},
		negate: function(out, a) {
			out[0] = -a[0];
			out[1] = -a[1];
			return out;
		},
		normalize: function(out, a) {
			var l = vec2.len(a);
			if (l != 0)
				vec2.scale(out, a, 1.0 / l);
			else
				vec2.copy(out, a);
			return out;
		},
		random: function(out, scale) {
			var a = Math.random() * 2.0 * Math.PI;
			out[0] = a[0] * scale;
			out[1] = a[1] * scale;
			return out;
		},
		scale: function(out, a, b) {
			out[0] = a[0] * b;
			out[1] = a[1] * b;
			return out;
		},
		scaleAndAdd: function(out, a, b, scale) {
			out[0] = a[0] + b[0] * scale;
			out[1] = a[1] + b[1] * scale;
			return out;
		},
		set: function(out, x, y) {
			out[0] = x;
			out[1] = y;
			return out;
		},
		sqrDist: function(a, b) {
			return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
		},
		sqrLen: function(a) {
			return Math.pow(a[0], 2) + Math.pow(a[1], 2);
		},
		str: function(a) {
			return '(' + a[0] + ',' + a[1] + ')';
		},
		sub: function(out, a, b) {
			out[0] = a[0] - b[0];
			out[1] = a[1] - b[1];
			return out;
		},
		point: function(a) {
			return cc.p(a[0], a[1]);
		}
	}
);
