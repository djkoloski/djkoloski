var StartLayer = cc.Layer.extend({
    BACKGROUND: res.StartScreen_start_bckgrnd_png,
    BUTTON: res.StartScreen_Oman_title_start_png,
    TITLE: res.StartScreen_omania_title_png,
    ctor: function(scene) {
        this._super();

        var keyListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(key, event) {
                this.startGame(key);
            }.bind(this)
        });

        this.isKeyboardEnabled = true;
        cc.eventManager.addListener(keyListener, this);

        var background = new cc.Sprite(StartLayer.prototype.BACKGROUND);
        background.setPosition(cc.winSize.width/2,cc.winSize.height/2);
        var title = new cc.Sprite(StartLayer.prototype.TITLE);
        title.setPosition(512,3*cc.winSize.height/4);
        var startButton = new cc.Sprite(StartLayer.prototype.BUTTON);
        startButton.setPosition(cc.winSize.width/2, cc.winSize.height/4);

        this.addChild(background, 4);
        this.addChild(title,5);
        this.addChild(startButton, 6);
    },
    startGame: function(key){
        if (key == cc.KEY.space) {
            cc.director.runScene(new GameScene());
            console.log("Start");
        }
    }
});

var StartScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);
    }
});
