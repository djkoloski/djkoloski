function Enemy(sprite, name, description, stats) {
	this.sprite = sprite;
	this.name = name;
	this.description = description;
	this.stats = stats;
}
Enemy.prototype.Instance =
	function(level) {
		return new Enemy(this.sprite, this.name, this.description, new EnemyStats(level, this.stats.hp, this.stats.atk, this.stats.def));
	};

function EnemyStats(level, hp, atk, def) {
	this.level = level;
	this.max_hp = hp * level;
	this.hp = this.max_hp;
	this.atk = atk * level;
	this.def = def * level;
}

var slime_enemy = new Enemy(
	slime_sprite,
	'Slime',
	'Mostly gelatinous and mostly harmless.',
	new EnemyStats(1, 2, 0, 0));

var goblin_enemy = new Enemy(
	goblin_sprite,
	'Goblin',
	'Always grumpy, especially if you disturb their gardening.',
	new EnemyStats(1, 2, 1, 0));

var bat_enemy = new Enemy(
	bat_sprite,
	'Bat',
	'Usually quiet, they only ever attack if disturbed.',
	new EnemyStats(1, 1, 1, 1));

var imp_enemy = new Enemy(
	imp_sprite,
	'Imp',
	'Who knows what these ugly little things are? They look like toads.',
	new EnemyStats(1, 1.5, 1.5, 1));

var ghost_enemy = new Enemy(
	ghost_sprite,
	'Ghost',
	'They\'re not remotely spooky, and because of this, they haunt people until they get fed up with them.',
	new EnemyStats(1, 2, 1, 1));

var megaslime_enemy = new Enemy(
	megaslime_sprite,
	'Mega-Slime',
	'It\'s really more like 6 individual slimes smushed into one.',
	new EnemyStats(1, 3, 2, 0));

var level_enemies = [
	[ slime_enemy, bat_enemy ],
	[ slime_enemy, bat_enemy, goblin_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ],
	[ bat_enemy, goblin_enemy, imp_enemy, ghost_enemy, megaslime_enemy ]
];
