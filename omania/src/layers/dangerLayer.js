var DANGERTYPE = {
	LEFT: 0,
	RIGHT: 1,
	TOP: 2,
	BOTTOM: 3,
	INSIDE: 4,
	OUTSIDE: 5
};

var Danger = cc.Node.extend({
	STATE: {
		INTRO: 0,
		HIT_IN: 1,
		HIT_OUT: 2,
		DONE: 3
	},
	scene: null,
	state: null,
	timer: null,
	elapsedTime: null,
	ctor: function(scene) {
		this._super();
		
		this.scene = scene;
		this.state = null;
		this.timer = 0.0;
		this.elapsedTime = 0.0;
		
		this.scheduleUpdate();
	},
	update: function(dt) {
		if (this.state == Danger.prototype.STATE.DONE)
			return;
		
		this.elapsedTime = Math.min(this.timer, this.elapsedTime + dt);
		
		if (this.elapsedTime >= this.timer)
			this.transitionState(this.state + 1);
	},
	transitionState: function(newState) {
		this.state = newState;
		this.timer = 0.0;
		this.elapsedTime = 0.0;
	},
	getT: function() {
		return this.elapsedTime / this.timer;
	},
	isFinished: function() {
		return this.state == Danger.prototype.STATE.DONE;
	}
});

var VerticalDanger = Danger.extend({
	HIT_IN_TIMER: 0.25,
	HIT_OUT_TIMER: 0.25,
	CURVE_K: -0.5,
	BOUND_LEFT: 290,
	BOUND_RIGHT: 733,
	side: null,
	startPoint: null,
	endPoint: null,
	warningTime: null,
	dangerSprite: null,
	waveSprite: null,
	ctor: function(scene, side, warningTime) {
		this._super(scene);
		
		this.side = side;
		
		var startX = 0.0;
		var endX = 0.0;
		if (side == 'left') {
			startX = -cc.winSize.width / 6;
			endX = cc.winSize.width / 6;
		} else {
			startX = cc.winSize.width * 7 / 6;
			endX = cc.winSize.width * 5 / 6;
		}
		this.startPoint = vec2(startX, cc.winSize.height / 2);
		this.endPoint = vec2(endX, cc.winSize.height / 2);
		
		this.warningTime = warningTime;
		
		this.dangerSprite = new cc.Sprite(res.warnings_vert_png);
		this.addChild(this.dangerSprite);
		this.waveSprite = new cc.Sprite(res.wave_png);
		this.addChild(this.waveSprite);
		
		if (side == 'right')
			this.waveSprite.setFlippedX(true);
		
		this.transitionState(Danger.prototype.STATE.INTRO);
	},
	transitionState: function(newState) {
		this._super(newState);
		
		switch (newState) {
			case Danger.prototype.STATE.INTRO:
				this.timer = this.warningTime;
				this.dangerSprite.setVisible(true);
				this.dangerSprite.setPosition(vec2.point(this.endPoint));
				this.waveSprite.setVisible(false);
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.timer = VerticalDanger.prototype.HIT_IN_TIMER;
				this.dangerSprite.setVisible(false);
				this.waveSprite.setVisible(true);
				this.waveSprite.setPosition(vec2.point(this.startPoint));
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.execute();
				this.timer = VerticalDanger.prototype.HIT_OUT_TIMER;
				this.dangerSprite.setVisible(false);
				this.waveSprite.setVisible(true);
				this.waveSprite.setPosition(vec2.point(this.endPoint));
				break;
			case Danger.prototype.STATE.DONE:
				this.dangerSprite.setVisible(false);
				this.waveSprite.setVisible(false);
				break;
		}
	},
	update: function(dt) {
		this._super(dt);
		
		switch (this.state) {
			case Danger.prototype.STATE.INTRO:
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.waveSprite.setPosition(
					vec2.point(
						vec2.lerp(
							vec2(),
							this.startPoint,
							this.endPoint,
							HalfSigmoid(this.getT(), VerticalDanger.prototype.CURVE_K)
						)
					)
				);
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.waveSprite.setPosition(
					vec2.point(
						vec2.lerp(
							vec2(),
							this.endPoint,
							this.startPoint,
							HalfSigmoid(this.getT(), -VerticalDanger.prototype.CURVE_K)
						)
					)
				);
				break;
			case Danger.prototype.DONE:
				break;
		}
	},
	execute: function() {
		if (this.side == 'left') {
			this.scene.soldierLayer.removeByLambda(
				function(soldier) {
					return soldier.rigidbody.position[0] - Soldier.prototype.RADIUS <= VerticalDanger.prototype.BOUND_LEFT;
				}
			);
		} else {
			this.scene.soldierLayer.removeByLambda(
				function(soldier) {
					return soldier.rigidbody.position[0] + Soldier.prototype.RADIUS >= VerticalDanger.prototype.BOUND_RIGHT;
				}
			);
		}
	}
});

var HorizontalDanger = Danger.extend({
	HIT_IN_TIMER: 0.25,
	HIT_OUT_TIMER: 0.25,
	CURVE_K: -0.5,
	BOUND_TOP: 768 - 215,
	BOUND_BOTTOM: 256 - 30,
	side: null,
	startPoint: null,
	endPoint: null,
	warningTime: null,
	dangerSprite: null,
	wallSprite: null,
	ctor: function(scene, side, warningTime) {
		this._super(scene);
		
		this.side = side;
		
		var startY = 0.0;
		var endY = 0.0;
		if (side == 'bottom') {
			startY = -cc.winSize.height / 6;
			endY = cc.winSize.height / 6;
		} else {
			startY = cc.winSize.height * 7 / 6;
			endY = cc.winSize.height * 5 / 6;
		}
		this.startPoint = vec2(cc.winSize.width / 2, startY);
		this.endPoint = vec2(cc.winSize.width / 2, endY);
		
		this.warningTime = warningTime;
		
		this.dangerSprite = new cc.Sprite(res.warnings_horiz_png);
		this.addChild(this.dangerSprite);
		this.wallSprite = new cc.Sprite(res.building_png);
		this.addChild(this.wallSprite);
		
		if (side == 'bottom')
			this.wallSprite.setFlippedY(true);
		
		this.transitionState(Danger.prototype.STATE.INTRO);
	},
	transitionState: function(newState) {
		this._super(newState);
		
		switch (newState) {
			case Danger.prototype.STATE.INTRO:
				this.timer = this.warningTime;
				this.dangerSprite.setVisible(true);
				this.dangerSprite.setPosition(vec2.point(this.endPoint));
				this.wallSprite.setVisible(false);
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.timer = HorizontalDanger.prototype.HIT_IN_TIMER;
				this.dangerSprite.setVisible(false);
				this.wallSprite.setVisible(true);
				this.wallSprite.setPosition(vec2.point(this.startPoint));
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.execute();
				this.timer = HorizontalDanger.prototype.HIT_OUT_TIMER;
				this.dangerSprite.setVisible(false);
				this.wallSprite.setVisible(true);
				this.wallSprite.setPosition(vec2.point(this.endPoint));
				break;
			case Danger.prototype.STATE.DONE:
				this.dangerSprite.setVisible(false);
				this.wallSprite.setVisible(false);
				break;
		}
	},
	update: function(dt) {
		this._super(dt);
		
		switch (this.state) {
			case Danger.prototype.STATE.INTRO:
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.wallSprite.setPosition(
					vec2.point(
						vec2.lerp(
							vec2(),
							this.startPoint,
							this.endPoint,
							HalfSigmoid(this.getT(), HorizontalDanger.prototype.CURVE_K)
						)
					)
				);
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.wallSprite.opacity = Math.floor(255 * (1.0 - this.getT()));
				break;
			case Danger.prototype.DONE:
				break;
		}
	},
	execute: function() {
		if (this.side == 'bottom') {
			this.scene.soldierLayer.removeByLambda(
				function(soldier) {
					return soldier.rigidbody.position[1] - Soldier.prototype.RADIUS <= HorizontalDanger.prototype.BOUND_BOTTOM;
				}
			);
		} else {
			this.scene.soldierLayer.removeByLambda(
				function(soldier) {
					return soldier.rigidbody.position[1] + Soldier.prototype.RADIUS >= HorizontalDanger.prototype.BOUND_TOP;
				}
			);
		}
	}
});

var InsideDanger = Danger.extend({
	HIT_IN_TIMER: 0.25,
	HIT_OUT_TIMER: 0.25,
	CURVE_K: 0.5,
	RADIUS: 100,
	OFFSET_X: 0,
	OFFSET_Y: 400,
	startPoint: null,
	endPoint: null,
	warningTime: null,
	dangerSprite: null,
	boulderSprite: null,
	ctor: function(scene, warningTime) {
		this._super(scene);
		
		this.startPoint = vec2(cc.winSize.width / 2 + InsideDanger.prototype.OFFSET_X, cc.winSize.height / 2 + InsideDanger.prototype.OFFSET_Y);
		this.endPoint = vec2(cc.winSize.width / 2, cc.winSize.height / 2);
		
		this.warningTime = warningTime;
		
		this.dangerSprite = new cc.Sprite(res.warnings_inside_png);
		this.addChild(this.dangerSprite);
		this.boulderSprite = new cc.Sprite(res.boulder_png);
		this.addChild(this.boulderSprite);
		
		this.transitionState(Danger.prototype.STATE.INTRO);
	},
	transitionState: function(newState) {
		this._super(newState);
		
		switch (newState) {
			case Danger.prototype.STATE.INTRO:
				this.timer = this.warningTime;
				this.dangerSprite.setVisible(true);
				this.dangerSprite.setPosition(vec2.point(this.endPoint));
				this.boulderSprite.setVisible(false);
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.timer = InsideDanger.prototype.HIT_IN_TIMER;
				this.dangerSprite.setVisible(false);
				this.boulderSprite.setVisible(true);
				this.boulderSprite.setPosition(vec2.point(this.startPoint));
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.execute();
				this.timer = InsideDanger.prototype.HIT_OUT_TIMER;
				this.dangerSprite.setVisible(false);
				this.boulderSprite.setVisible(true);
				this.boulderSprite.setPosition(vec2.point(this.endPoint));
				break;
			case Danger.prototype.STATE.DONE:
				this.dangerSprite.setVisible(false);
				this.boulderSprite.setVisible(false);
				break;
		}
	},
	update: function(dt) {
		this._super(dt);
		
		switch (this.state) {
			case Danger.prototype.STATE.INTRO:
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.boulderSprite.setPosition(
					vec2.point(
						vec2.lerp(
							vec2(),
							this.startPoint,
							this.endPoint,
							HalfSigmoid(this.getT(), InsideDanger.prototype.CURVE_K)
						)
					)
				);
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.boulderSprite.opacity = Math.floor(255 * (1.0 - this.getT()));
				break;
			case Danger.prototype.DONE:
				break;
		}
	},
	execute: function() {
		this.scene.soldierLayer.removeByLambda(
			function(soldier) {
				var dist = vec2.dist(soldier.rigidbody.position, vec2(cc.winSize.width / 2, cc.winSize.height / 2));
				return dist < InsideDanger.prototype.RADIUS + Soldier.prototype.RADIUS;
			}
		);
	}
});

var OutsideDanger = Danger.extend({
	HIT_IN_TIMER: 0.25,
	HIT_OUT_TIMER: 0.25,
	CURVE_K: 0.5,
	RADIUS: 375,
	OFFSET_X: 0,
	OFFSET_Y: 400,
	startPoint: null,
	endPoint: null,
	warningTime: null,
	dangerSprite: null,
	arrowsSprite: null,
	ctor: function(scene, warningTime) {
		this._super(scene);
		
		this.startPoint = vec2(cc.winSize.width / 2 + OutsideDanger.prototype.OFFSET_X, cc.winSize.height / 2 + OutsideDanger.prototype.OFFSET_Y);
		this.endPoint = vec2(cc.winSize.width / 2, cc.winSize.height / 2);
		
		this.warningTime = warningTime;
		
		this.dangerSprite = new cc.Sprite(res.warnings_outside_png);
		this.addChild(this.dangerSprite);
		this.arrowsSprite = new cc.Sprite(res.arrows_png);
		this.addChild(this.arrowsSprite);
		
		this.transitionState(Danger.prototype.STATE.INTRO);
	},
	transitionState: function(newState) {
		this._super(newState);
		
		switch (newState) {
			case Danger.prototype.STATE.INTRO:
				this.timer = this.warningTime;
				this.dangerSprite.setVisible(true);
				this.dangerSprite.setPosition(vec2.point(this.endPoint));
				this.arrowsSprite.setVisible(false);
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.timer = OutsideDanger.prototype.HIT_IN_TIMER;
				this.dangerSprite.setVisible(false);
				this.arrowsSprite.setVisible(true);
				this.arrowsSprite.setPosition(vec2.point(this.startPoint));
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.execute();
				this.timer = OutsideDanger.prototype.HIT_OUT_TIMER;
				this.dangerSprite.setVisible(false);
				this.arrowsSprite.setVisible(true);
				this.arrowsSprite.setPosition(vec2.point(this.endPoint));
				break;
			case Danger.prototype.STATE.DONE:
				this.dangerSprite.setVisible(false);
				this.arrowsSprite.setVisible(false);
				break;
		}
	},
	update: function(dt) {
		this._super(dt);
		
		switch (this.state) {
			case Danger.prototype.STATE.INTRO:
				break;
			case Danger.prototype.STATE.HIT_IN:
				this.arrowsSprite.setPosition(
					vec2.point(
						vec2.lerp(
							vec2(),
							this.startPoint,
							this.endPoint,
							HalfSigmoid(this.getT(), OutsideDanger.prototype.CURVE_K)
						)
					)
				);
				break;
			case Danger.prototype.STATE.HIT_OUT:
				this.arrowsSprite.opacity = Math.floor(255 * (1.0 - this.getT()));
				break;
			case Danger.prototype.DONE:
				break;
		}
	},
	execute: function() {
		this.scene.soldierLayer.removeByLambda(
			function(soldier) {
				var dist = vec2.dist(soldier.rigidbody.position, vec2(cc.winSize.width / 2, cc.winSize.height / 2));
				return dist > OutsideDanger.prototype.RADIUS - Soldier.prototype.RADIUS;
			}
		);
	}
});

var DangerLayer = cc.Layer.extend({
	DANGER_ORDER: 10,
	scene: null,
	dangers: null,
	ctor: function(scene) {
		this._super();
		
		this.scene = scene;
		this.dangers = [];
		
		this.scheduleUpdate();
	},
	update: function(dt) {
		for (var i = 0; i < this.dangers.length; ++i) {
			if (this.dangers[i].isFinished()) {
				this.removeChild(this.dangers[i]);
				this.dangers.splice(i, 1);
				--i;
			}
		}
	},
	spawn: function(type, timer) {
		var danger = null;
		switch (type) {
			case DANGERTYPE.LEFT:
				danger = new VerticalDanger(this.scene, 'left', timer);
				break;
			case DANGERTYPE.RIGHT:
				danger = new VerticalDanger(this.scene, 'right', timer);
				break;
			case DANGERTYPE.BOTTOM:
				danger = new HorizontalDanger(this.scene, 'bottom', timer);
				break;
			case DANGERTYPE.TOP:
				danger = new HorizontalDanger(this.scene, 'top', timer);
				break;
			case DANGERTYPE.INSIDE:
				danger = new InsideDanger(this.scene, timer);
				break;
			case DANGERTYPE.OUTSIDE:
				danger = new OutsideDanger(this.scene, timer);
				break;
			default:
				break;
		}
		this.dangers.push(danger);
		this.addChild(danger);
	}
});
