var GameOverLayer = cc.Layer.extend({
    BACKGROUND: res.boulder_png,
    ctor: function(scene) {
        this._super();

        var keyListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(key, event) {
                this.gameOver(key);
            }.bind(this)
        });

        this.isKeyboardEnabled = true;
        cc.eventManager.addListener(keyListener, this);

        var background = new cc.Sprite(GameOverLayer.prototype.BACKGROUND);
        background.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        var text = new cc.LabelTTF("GAME OVER", "Courier New", 144);
        text.setColor(cc.color(255,230,225,1));
        text.setPosition(cc.winSize.width/2, 3*cc.winSize.height/4);
        var gameOverLabel = new cc.LabelTTF("Press R to Restart", "Arial", 38);
        gameOverLabel.setPosition(cc.winSize.width/2, cc.winSize.height/4);

        this.addChild(background, 4);
        this.addChild(text,5);
        this.addChild(gameOverLabel, 6);
    },
    gameOver: function(key){
        if (key == cc.KEY.r) {
            window.scene = new StartScene();
            cc.director.runScene(window.scene);
            console.log("Restart");
        }
    }
});

var GameOverScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameOverLayer();
        this.addChild(layer);
    }
});