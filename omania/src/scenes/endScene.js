var EndGameLayer = cc.Layer.extend({
    BACKGROUND: res.END_SCREEN_png,
    ctor: function(scene) {
        this._super();

        var keyListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(key, event) {
                this.endGame(key);
            }.bind(this)
        });

        this.isKeyboardEnabled = true;
        cc.eventManager.addListener(keyListener, this);

        var background = new cc.Sprite(EndGameLayer.prototype.BACKGROUND);
        background.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        var score = new cc.LabelTTF("Score: " + g_score,"Courier New", 75);
        score.setPosition(cc.winSize.width/2, cc.winSize.height/4);

        this.addChild(background, 4);
        this.addChild(score,5);
    },
    endGame: function(key){
        if (key == cc.KEY.r) {
            window.scene = new StartScene();
            cc.director.runScene(window.scene);
            console.log("Replay");
        }
    }
});

var EndScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new EndGameLayer();
        this.addChild(layer);
    }
});
