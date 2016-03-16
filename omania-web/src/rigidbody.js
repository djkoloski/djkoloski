var Rigidbody = function() {
	this.mass = 1.0;
	this.position = vec2();
	this.velocity = vec2();
	this.acceleration = vec2();
};
Rigidbody.prototype.setMass = function(mass) {
	this.mass = mass;
};
Rigidbody.prototype.setPosition = function(position) {
	vec2.set(this.position, position);
};
Rigidbody.prototype.setVelocity = function(velocity) {
	vec2.set(this.velocity, velocity);
};
Rigidbody.prototype.setAcceleration = function(acceleration) {
	vec2.set(this.acceleration, acceleration);
};
Rigidbody.prototype.addForce = function(force) {
	vec2.add(this.acceleration, this.acceleration, vec2.scale(vec2(), force, 1.0 / this.mass));
};
Rigidbody.prototype.addSpringForce = function(target, springConstant, damping) {
	var fromTarget = vec2.sub(vec2(), this.position, target);
	var dist = vec2.len(fromTarget);
	var dir = vec2.normalize(vec2(), fromTarget);
	var c = damping * 2.0 * Math.sqrt(this.mass * springConstant);
	
	this.addForce(
		vec2.add(
			vec2(),
			vec2.scale(
				vec2(),
				dir,
				-springConstant * dist
			),
			vec2.scale(
				vec2(),
				this.velocity,
				-c
			)
		)
	);
};
Rigidbody.prototype.update = function(dt) {
	vec2.add(
		this.velocity,
		this.velocity,
		vec2.scale(
			vec2(),
			this.acceleration,
			dt
		)
	);
	vec2.add(
		this.position,
		this.position,
		vec2.scale(
			vec2(),
			this.velocity,
			dt
		)
	);
	vec2.set(this.acceleration, 0, 0);
};
