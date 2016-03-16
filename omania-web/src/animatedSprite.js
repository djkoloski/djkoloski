function SpritesheetToAnimation(sheetName, frameWidth, frameHeight, delay) {
	var cache = cc.spriteFrameCache;
	var texture = cc.textureCache.getTextureForKey(res[sheetName]);
	if (texture == null)
		texture = cc.textureCache.addImage(res[sheetName]);
	var framesX = Math.floor(texture.width / frameWidth);
	var framesY = Math.floor(texture.height / frameHeight);
	var frameCount = framesX * framesY;
	
	if (cache.getSpriteFrame(sheetName + '_0') == null) {
		for (var i = 0; i < frameCount; ++i) {
			var x = i % framesX;
			var y = Math.floor(i / framesX);
			
			cache.addSpriteFrame(
				new cc.SpriteFrame(
					res[sheetName],
					cc.rect(
						x * frameWidth,
						(framesY - y - 1) * frameHeight,
						frameWidth,
						frameHeight
					)
				),
				sheetName + '_' + i
			);
		}
	}
	
	var frames = [];
	for (var i = 0; i < frameCount; ++i)
		frames.push(cache.getSpriteFrame(sheetName + '_' + i));
	
	return new cc.Animation(frames, delay, 1);
}
