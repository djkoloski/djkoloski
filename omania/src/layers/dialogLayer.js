var DialogLayer = cc.Layer.extend({
	DIALOG_BACKGROUND_ORDER: 100,
	DIALOG_TEXT_ORDER: 102,
	DIALOG_SPEAKERSPRITE_ORDER: 101,
	STATE: {
		OPENING: 0,
		OPEN: 1,
		PAUSED: 2,
		CLOSING: 3,
		CLOSED: 4
	},
	OPENING_TIME: 0.5,
	NEXT_CHAR_TIME: 0.02,
	PAUSE_TIME: 1.0,
	CLOSING_TIME: 0.5,
	CLOSED_OFFSET_Y: -100,
	OPEN_OFFSET_Y: 100,
	LINE_LENGTH: 50,
	LINES_PER_DIALOG: 4,
	SPEAKER_SPRITE_OFFSET_X: 300,
	SPEAKER_SPRITE_OFFSET_Y: -10,
	scene: null,
	state: null,
	dialogs: null,
	currentDialog: null,
	currentIndex: null,
	timer: null,
	label: null,
	background: null,
	dialogSpriteOnLeft: true,
	ctor: function(scene) {
		this._super();
		
		this.scene = scene;
		
		this.state = DialogLayer.prototype.STATE.CLOSED;
		this.dialogs = [];
		this.currentDialog = 0;
		this.currentIndex = 0;
		this.timer = 0.0;
		this.label = new cc.LabelTTF('', 'Arial', 20);
		this.label.setColor(0,0,0,0);
		this.background = new cc.Sprite(res.castle_textbox_png);
		this.setYOffset(DialogLayer.prototype.CLOSED_OFFSET_Y);
		this.callback = null;
		this.speakerSprite = null;
		
		this.addChild(this.label, DialogLayer.prototype.DIALOG_TEXT_ORDER);
		this.addChild(this.background, DialogLayer.prototype.DIALOG_BACKGROUND_ORDER);
		
		this.scheduleUpdate();
	},
	transitionState: function(newState) {
		this.state = newState;
		switch (newState) {
			case DialogLayer.prototype.STATE.OPENING:
				this.setLabelText('');
				this.timer = DialogLayer.prototype.OPENING_TIME;
				this.setYOffset(DialogLayer.prototype.CLOSED_OFFSET_Y);
				break;
			case DialogLayer.prototype.STATE.OPEN:
				this.setLabelText('');
				this.timer = 0.0;
				this.currentIndex = 0;
				this.setYOffset(DialogLayer.prototype.OPEN_OFFSET_Y);
				break;
			case this.STATE.PAUSED:
				this.timer = DialogLayer.prototype.PAUSE_TIME;
				break;
			case this.STATE.CLOSING:
				this.timer = DialogLayer.prototype.CLOSING_TIME;
				break;
			case this.STATE.CLOSED:
				this.setLabelText('');
				this.timer = 0.0;
				this.setYOffset(DialogLayer.prototype.CLOSED_OFFSET_Y);
				if (this.callback != null)
					this.callback();
				break;
			default:
				throw new Error('Invalid transition state');
				break;
		}
	},
	openDialog: function(string, callbackFunc, picture, onLeft) {
		this.dialogs = [];
		var lines = [];
		var line = '';
		var index = 0;
		var toomany = 0;
		this.callback = callbackFunc;
		
		if (this.speakerSprite)
			this.removeChild(this.speakerSprite);
		
		if (picture != null) {
			this.speakerSprite = new cc.Sprite(picture);
			this.addChild(this.speakerSprite, DialogLayer.prototype.DIALOG_SPEAKERSPRITE_ORDER);
			this.dialogSpriteOnLeft = onLeft;
		}
		
		while (index < string.length) {
			var nextSpace = string.indexOf(' ', index);
			var nextNewline = string.indexOf('\n', index);
			
			var chop = 0;
			var endDialog = false;
			if (nextSpace != -1 && (nextSpace < nextNewline || nextNewline == -1))
				chop = nextSpace;
			else {
				chop = nextNewline;
				endDialog = true;
			}
			if (chop == -1) {
				chop = string.length;
				endDialog = true;
			} else
				chop += 1;
			
			var delta = chop - index;
			
			if (line.length + delta > DialogLayer.prototype.LINE_LENGTH) {
				lines.push(line);
				line = '';
			}
			line = (line + string.substring(index, chop)).replace('\n', '');
			if (endDialog) {
				lines.push(line);
				line = '';
			}
			if (endDialog || lines.length >= DialogLayer.prototype.LINES_PER_DIALOG)
				this.dialogs.push(lines.splice(0, DialogLayer.prototype.LINES_PER_DIALOG).join('\n'));
			index = chop;
			
			++toomany;
			if (toomany > 1000)
				break;
		}
		
		while (lines.length != 0)
			this.dialogs.push(lines.splice(0, DialogLayer.prototype.LINES_PER_DIALOG).join('\n'));
		
		this.currentDialog = 0;
		this.currentIndex = 0;
		this.transitionState(DialogLayer.prototype.STATE.OPENING);
	},
	closeDialog: function() {
		this.transitionState(DialogLayer.prototype.STATE.CLOSING);
	},
	getCurrentDialog: function() {
		return this.dialogs[this.currentDialog];
	},
	setLabelText: function(string) {
		this.label.setString(string);
	},
	setYOffset: function(y) {
		var position = cc.p(cc.winSize.width / 2, y);
		this.label.setPosition(position);
		this.background.setPosition(position);
		var speakerOffset;
		
		if (this.dialogSpriteOnLeft)
			speakerOffset = -DialogLayer.prototype.SPEAKER_SPRITE_OFFSET_X;
		else
			speakerOffset = DialogLayer.prototype.SPEAKER_SPRITE_OFFSET_X;
		
		if (this.speakerSprite != null)
			this.speakerSprite.setPosition(cc.winSize.width / 2 + speakerOffset, y + DialogLayer.prototype.SPEAKER_SPRITE_OFFSET_Y);
	},
	update: function(dt) {
		this.timer -= dt;
		if (this.timer < 0) {
			switch (this.state) {
				case DialogLayer.prototype.STATE.OPENING:
					this.transitionState(DialogLayer.prototype.STATE.OPEN);
					break;
				case DialogLayer.prototype.STATE.OPEN:
					if (this.currentIndex >= this.getCurrentDialog().length)
						this.transitionState(DialogLayer.prototype.STATE.PAUSED);
					else {
						++this.currentIndex;
						this.setLabelText(this.getCurrentDialog().substr(0, this.currentIndex));
						this.timer = DialogLayer.prototype.NEXT_CHAR_TIME;
					}
					break;
				case DialogLayer.prototype.STATE.PAUSED:
					if (this.currentDialog >= this.dialogs.length)
						this.transitionState(DialogLayer.prototype.STATE.CLOSING);
					else {
						if (this.currentDialog < this.dialogs.length - 1) {
							++this.currentDialog;
							this.currentIndex = 0;
							this.transitionState(DialogLayer.prototype.STATE.OPEN);
						} else
							this.transitionState(DialogLayer.prototype.STATE.CLOSING);
					}
					break;
				case DialogLayer.prototype.STATE.CLOSING:
					this.transitionState(DialogLayer.prototype.STATE.CLOSED);
					break;
				case DialogLayer.prototype.STATE.CLOSED:
					break;
				default:
					throw new Error('Invalid state');
			}
		} else {
			var t = this.timer / DialogLayer.prototype.OPENING_TIME;
			switch (this.state) {
				case DialogLayer.prototype.STATE.OPENING:
					this.setYOffset(t * DialogLayer.prototype.CLOSED_OFFSET_Y + (1.0 - t) * DialogLayer.prototype.OPEN_OFFSET_Y);
					break;
				case DialogLayer.prototype.STATE.CLOSING:
					this.setYOffset(t * DialogLayer.prototype.OPEN_OFFSET_Y + (1.0 - t) * DialogLayer.prototype.CLOSED_OFFSET_Y);
					break;
				default:
					break;
			}
		}
	}
});
