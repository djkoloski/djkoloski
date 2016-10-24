var inputs = {
	stb: null,
	sts: null,
	stx: null,
	stt: null,
	tst: null,
	tsx: null,
	tsb: null,
	tss: null
};

var zton = function(z) {
	return (z < 0 ? -2 * z - 1 : 2 * z);
};
var ntoz = function(n) {
	return (n % 2 == 0 ? n / 2 : -(n + 1) / 2);
};
var pair = function(x, y) {
	return (x + y) * (x + y + 1) / 2 + y;
};
var unpair = function(z) {
	var w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
	var t = (w * w + w) / 2;
	var y = z - t;
	var x = w - y;
	return {"x": x, "y": y};
};

var updateST = function() {
	var b = parseInt(inputs.stb.value);
	var s = parseInt(inputs.sts.value);

	var t = pair(zton(b), zton(s));
	var x = b + s * t;

	inputs.stx.value = x;
	inputs.stt.value = t;
};

var updateTS = function() {
	var t = parseInt(inputs.tst.value);

	var sub = unpair(t);
	var b = ntoz(sub.x);
	var s = ntoz(sub.y);
	var x = b + s * t;

	inputs.tsx.value = x;
	inputs.tsb.value = b;
	inputs.tss.value = s;
};

window.onload = function() {
	for (input in inputs) {
		inputs[input] = document.getElementById(input);
	}
	
	inputs.stb.oninput = updateST;
	inputs.sts.oninput = updateST;
	inputs.tst.oninput = updateTS;
};
