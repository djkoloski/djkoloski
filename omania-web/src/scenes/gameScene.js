var GameScene = cc.Scene.extend({
	STATE: {
		DIALOG: 0,
		GAME: 1
	},
	soldierLayer: null,
	dangerLayer: null,
	dialogLayer: null,
	backgroundLayer: null,
	progressLayer: null,
	state: null,
	currentDialog: null,
	currentDialogIndex: null,
	levelManager: null,
	onEnter: function() {
		this._super();

		this.backgroundLayer = new BackgroundLayer(this);
		this.soldierLayer = new SoldierLayer(this);
		this.dangerLayer = new DangerLayer(this);
		this.dialogLayer = new DialogLayer(this);
		this.progressLayer = new ProgressLayer(this);

		this.addChild(this.backgroundLayer);
		this.addChild(this.soldierLayer);
		this.addChild(this.dangerLayer);
		this.addChild(this.dialogLayer);
		this.addChild(this.progressLayer);
		
		this.state = null;
		this.levelManager = new LevelManager(this);
		
		this.beginDialog(DIALOGS[0]);
		
		this.scheduleUpdate();
	},
	transitionState: function(newState) {
		this.state = newState;
		switch (newState) {
			case GameScene.prototype.STATE.DIALOG:
				break;
			case GameScene.prototype.STATE.GAME:
				if (!this.levelManager.areAllLevelsFinished())
					this.levelManager.advanceLevel();
				else {
					window.g_score = this.soldierLayer.soldiers.length;
					cc.director.runScene(new EndScene());
				}
				break;
		}
	},
	beginDialog: function(dialog) {
		this.transitionState(GameScene.prototype.STATE.DIALOG);
		this.currentDialog = dialog;
		this.currentDialogIndex = 0;
		
		this.runDialog();
	},
	runDialog: function() {
		var speaker = this.currentDialog[this.currentDialogIndex].speaker;
		var image = null;
		var message = null;
		
		if (speaker == 'Aazaad')
			image = res.aazaad_png;
		else if (speaker == 'Talha')
			image = res.talha_png;
		
		this.dialogLayer.openDialog(
			(speaker != null ? speaker + ': ' : '') + this.currentDialog[this.currentDialogIndex].message,
			this.advanceDialog.bind(this),
			image,
			speaker == 'Aazaad'
		);
	},
	advanceDialog: function() {
		++this.currentDialogIndex;
		
		if (this.currentDialogIndex >= this.currentDialog.length)
			this.transitionState(GameScene.prototype.STATE.GAME);
		else
			this.runDialog();
	},
	update: function(dt) {
		this.progressLayer.movePointer(this.levelManager.getTotalT());
		
		switch (this.state) {
			case GameScene.prototype.STATE.DIALOG:
				break;
			case GameScene.prototype.STATE.GAME:
				this.levelManager.update(dt);
				if (this.levelManager.isLevelFinished()) {
					this.beginDialog(DIALOGS[this.levelManager.getLevelIndex() + 1]);
				}
				break;
		}
	}
});
