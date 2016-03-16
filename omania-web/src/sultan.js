var Sultan = cc.Sprite.extend ({
    ctor:function() {
        this._super(res.Player.png);


        cc.eventManager.addListener (
            cc.EventListener.create ({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (keyCode, event) {
                    var model = event.getCurrentTarget();
                    if (keyCode == 119) {
                        model.position
                    }
                }
            }),this);

    }
})
