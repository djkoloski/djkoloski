var BackgroundLayer = cc.Layer.extend({
    BACKGROUND: res.background_beach_png,
    tiles:null,
    ctor: function(scene) {
        this._super();

        var size = cc.winSize;

        var tile1 = new cc.Sprite(BackgroundLayer.prototype.BACKGROUND);
        var tile2 = new cc.Sprite(BackgroundLayer.prototype.BACKGROUND);
        var tile3 = new cc.Sprite(BackgroundLayer.prototype.BACKGROUND);
        var tile4 = new cc.Sprite(BackgroundLayer.prototype.BACKGROUND);
        tile1.setPosition(size.width/2, size.height);
        tile2.setPosition(size.width/2, size.height/2);
        tile3.setPosition(size.width/2,0);
        tile4.setPosition(size.width/2, 3*size.height/2);

        this.tiles = [tile1, tile2, tile3, tile4];

        this.addChild(tile1);
        this.addChild(tile2);
        this.addChild(tile3);
        this.addChild(tile4);

        this.scheduleUpdate();
    },
    update: function() {
        for (var i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].y -= 2;
            if (this.tiles[i].y <= -cc.winSize.height/2) {
                this.tiles[i].y = 3*cc.winSize.height/2;
            }
        }
    }
});