var Soldier = cc.Node.extend({
	MASS: 1,
	SPRINGCONSTANT: 300,
	DAMPING: 0.5,
	RADIUS: 17,
	scene: null,
	target: null,
	sprite: null,
	spriteAnimation: null,
	rigidbody: null,
	ctor: function(scene) {
		this._super();
		
		this.scene = scene;
		this.target = vec2();
		
		this.sprite = new cc.Sprite();
		this.spriteAnimation = new cc.Animate(res.SpriteSheets_spritesheet_soldiers_png_anim);
		this.sprite.runAction(new cc.RepeatForever(this.spriteAnimation));
		this.addChild(this.sprite, 0);
		
		this.rigidbody = new Rigidbody();
		this.rigidbody.setMass(Soldier.prototype.MASS);
		// TODO set initial position
		
		this.scheduleUpdate();
		
		return true;
	},
	setTarget: function(target) {
		vec2.copy(this.target, target);
	},
	update: function(dt) {
		this.rigidbody.addSpringForce(this.target, Soldier.prototype.SPRINGCONSTANT, Soldier.prototype.DAMPING);
		
		this.rigidbody.update(dt);
		this.sprite.setPosition(vec2.point(this.rigidbody.position));
	}
});
