var angles = [];
var lengths = [];
var end = null;
var canvas = null;
var context = null;
var time = new Time();
var arm = new Arm(10);
var mousex = 0;
var mousey = 0;

function Time() {
	this.start = null;
	this.total = 0;
	this.delta = 0;
}
Time.prototype.update = function(timestamp) {
	if (!this.start)
		this.start = timestamp;
	
	var newTotal = timestamp - this.start;
	this.delta = (newTotal - this.total) / 1000.0;
	this.total = newTotal;
};

function Arm(segs) {
	this.segs = segs;
	this.angles = [];
	this.lengths = [];
	this.posx = [];
	this.posy = [];
	this.gradients = [];
	this.speeds = [];
	
	for (var i = 0; i < this.segs; ++i) {
		this.angles.push(0);
		this.lengths.push(0.1);
		this.posx.push(0);
		this.posy.push(0);
		this.gradients.push(0);
		this.speeds.push(0);
	}
}
Arm.prototype.update = function(delta, targetx, targety) {
	var toTipx = 0;
	var toTipy = 0;
	var toTargetx = targetx - this.posx[this.segs - 1];
	var toTargety = targety - this.posy[this.segs - 1];
	var movex = 0;
	var movey = 0;
	var gradient = 0;
	
	for (var i = 0; i < this.segs; ++i) {
		toTipx = this.posx[this.segs - 1] - (i == 0 ? 0 : this.posx[i - 1]);
		toTipy = this.posy[this.segs - 1] - (i == 0 ? 0 : this.posy[i - 1]);
		movex = toTipy;
		movey = -toTipx;
		gradient = movex * toTargetx + movey * toTargety;
		
		if (gradient * this.gradients[i] < 0)
			this.speeds[i] = 0;
		else
			this.speeds[i] -= gradient;
		this.gradients[i] = gradient;
		
		this.angles[i] += this.speeds[i];
	}
};
Arm.prototype.recalculate = function() {
	var x = 0;
	var y = 0;
	for (var i = 0; i < this.segs; ++i) {
		x += Math.cos(this.angles[i]) * this.lengths[i];
		y += Math.sin(this.angles[i]) * this.lengths[i];
		this.posx[i] = x;
		this.posy[i] = y;
	}
};
Arm.prototype.render = function(context) {
	context.beginPath();
	context.moveTo(canvas.width / 2, canvas.height / 2);
	
	var xs = canvas.width / 2;
	var ys = canvas.height / 2;
	
	for (var i = 0; i < this.segs; ++i) {
		context.lineTo(
			this.posx[i] * xs + xs,
			this.posy[i] * ys + ys
		);
	}
	
	context.strokeStyle = '#000';
	context.lineWidth = 3;
	context.stroke();
};

function Main() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	
	document.onmousemove = function(event) {
		mousex = event.clientX;
		mousey = event.clientY;
	};
	
	window.requestAnimationFrame(Update);
}

function Update(timestamp) {
	time.update(timestamp);
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	var rect = canvas.getBoundingClientRect();
	
	arm.update(
		time.delta,
		(mousex - rect.left) / canvas.width * 2 - 1,
		(mousey - rect.top) / canvas.height * 2 - 1
	);
	arm.recalculate();
	arm.render(context);
	
	window.requestAnimationFrame(Update);
}

function Render() {
	end = [0, 0, 0];
	context.beginPath();
	context.strokeStyle = '#000';
	context.lineWidth = 3;
}

window.onload = Main;
