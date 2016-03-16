var ProgressLayer = cc.Layer.extend({
	BAR_LENGTH: 585,
	PROGRESS_POS_ON_SCREEN_Y: 700,
	scene: null,
	state: null,
	//currentPointerPos: null,
	tanBarImage: null,
	greenBarImage: null,
	pointerImage: null,
	dialogueSpriteOnLeft: true,
	ctor: function(scene) {
		this._super();
		
		this.scene = scene;

		this.tanBarImage = new cc.Sprite(res.progressbar_left_png);
		this.greenBarImage = new cc.Sprite(res.progressbar_done_png);
		this.pointerImage = new cc.Sprite(res.progressbar_thumb_png);

		this.tanBarImage.setPosition(cc.winSize.width / 2,this.PROGRESS_POS_ON_SCREEN_Y);
		this.greenBarImage.setPosition(this.tanBarImage.x,this.tanBarImage.y);
		this.pointerImage.setPosition(this.tanBarImage.x-this.tanBarImage.width / 2 + 115,
									this.tanBarImage.y - 20);

		this.addChild(this.tanBarImage, 0);
		this.addChild(this.greenBarImage, 1);
		this.addChild(this.pointerImage, 2);
		
		this.scheduleUpdate();
	},
	movePointer: function(number) {
		//number is between 0.0 and 1.0
		
		if (number != null) {
			var offset=this.BAR_LENGTH*number;
			this.pointerImage.setPosition(this.tanBarImage.x - this.tanBarImage.width / 2
				+110 + offset, this.tanBarImage.y - 20);

			this.removeChild(this.greenBarImage);
			this.greenBarImage= new cc.Sprite(res.progressbar_done_png,
				cc.rect(0,0,585 * number +110, this.greenBarImage.height));
			this.greenBarImage.setAnchorPoint(0,0);
			this.greenBarImage.setPosition(this.tanBarImage.x - this.tanBarImage.width/2,
				this.tanBarImage.y - this.tanBarImage.height / 2);
			this.addChild(this.greenBarImage, 1);

		}
	},
	update: function(dt) {
	}
});
