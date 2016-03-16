function LevelManager(scene) {
	this.scene = scene;
	this.levelIndex = -1;
	LevelManager.TOTAL_TIME = 0.0;
	for (var i = 0; i < LevelManager.LEVELS.length; ++i)
		LevelManager.TOTAL_TIME += LevelManager.LEVELS[i].runTime;
}
LevelManager.LEVELS = [
	{
		isTutorial: true,
		runTime: 5.0,
		frequencyStart: 3.0,
		frequencyEnd: 3.0,
		timingStart: 10.0,
		timingEnd: 10.0,
		intelligenceStart: -1.0,
		intelligenceEnd: -1.0
	},
	{
		runTime: 20.0,
		frequencyStart: 3.0,
		frequencyEnd: 2.0,
		timingStart: 1.5,
		timingEnd: 1.25,
		intelligenceStart: 0.0,
		intelligenceEnd: 0.2
	},
	{
		runTime: 25.0,
		frequencyStart: 2.0,
		frequencyEnd: 1.5,
		timingStart: 1.25,
		timingEnd: 1.0,
		intelligenceStart: 0.2,
		intelligenceEnd: 0.25
	},
	{
		runTime: 30.0,
		frequencyStart: 1.5,
		frequencyEnd: 1.0,
		timingStart: 1.0,
		timingEnd: 0.8,
		intelligenceStart: 0.25,
		intelligenceEnd: 0.35
	},
	{
		runTime: 40.0,
		frequencyStart: 1.0,
		frequencyEnd: 0.5,
		timingStart: 0.8,
		timingEnd: 0.6,
		intelligenceStart: 0.35,
		intelligenceEnd: 0.4
	}
];
LevelManager.prototype.getLevelIndex = function() {
	return this.levelIndex;
};
LevelManager.prototype.setLevel = function(index) {
	this.levelIndex = index;
	this.level = LevelManager.LEVELS[this.levelIndex];
	if (g_skipWaves)
		this.time = 0.0;
	else
		this.time = this.level.runTime;
	this.elapsedTime = 0.0;
	this.resetSpawn();
};
LevelManager.prototype.advanceLevel = function() {
	this.setLevel(this.levelIndex + 1);
};
LevelManager.prototype.resetSpawn = function() {
	this.spawnTime = this.getFrequency();
	this.elapsedSpawnTime = 0.0;
};
LevelManager.prototype.isLevelFinished = function() {
	return this.elapsedTime >= this.time;
};
LevelManager.prototype.areAllLevelsFinished = function() {
	return this.levelIndex == LevelManager.LEVELS.length - 1;
};
LevelManager.prototype.getT = function() {
	return this.elapsedTime / this.time;
};
LevelManager.prototype.getTotalT = function() {
	var et = this.elapsedTime;
	for (var i = 0; i < this.levelIndex; ++i)
		et += LevelManager.LEVELS[i].runTime;
	return et / LevelManager.TOTAL_TIME;
};
LevelManager.prototype.lerpT = function(a, b) {
	return (1.0 - this.getT()) * a + this.getT() * b;
};
LevelManager.prototype.getFrequency = function() {
	return this.lerpT(this.level.frequencyStart, this.level.frequencyEnd);
};
LevelManager.prototype.getTiming = function() {
	return this.lerpT(this.level.timingStart, this.level.timingEnd);
};
LevelManager.prototype.getIntelligence = function() {
	return this.lerpT(this.level.intelligenceStart, this.level.intelligenceEnd);
};
LevelManager.prototype.update = function(dt) {
	if (this.isLevelFinished())
		return;
	
	this.elapsedTime = Math.min(this.time, this.elapsedTime + dt);
	this.elapsedSpawnTime = Math.min(this.spawnTime, this.elapsedSpawnTime + dt);
	
	if (this.elapsedSpawnTime >= this.spawnTime) {
		this.spawn();
		this.resetSpawn();
	}
};
LevelManager.prototype.spawn = function() {
	var which = Math.floor(Math.random() * 6);
	if (Math.random() <= this.getIntelligence())
		which = this.scene.soldierLayer.formation;
	if (this.level.isTutorial == true)
		which = DANGERTYPE.OUTSIDE;
	
	this.scene.dangerLayer.spawn(which, this.getTiming());
};
