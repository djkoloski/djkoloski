function Item(sprite, name, description, action, stats) {
	this.sprite = sprite;
	this.name = name;
	this.description = description;
	this.action = action;
	this.stats = stats;
}

function ItemStats(slot, hpmult, hpadd, atkmult, atkadd, defmult, defadd) {
	this.slot = slot;
	this.hpmult = hpmult;
	this.hpadd = hpadd;
	this.atkmult = atkmult;
	this.atkadd = atkadd;
	this.defmult = defmult;
	this.defadd = defadd;
}

function ToggleEquip(name) {
	return function() {
		stats.ToggleEquip(name);
	};
}

var manual_item = new Item(
	manual_sprite,
	'Manual',
	'The universe\'s big secrets are written in here. In gibberish.',
	function() {
		window.open('howto.html');
	},
	null);

var TREASURE_POTION_CHANCE = 0.5;
var TREASURE_GOLD_CHANCE = 0.5;
var TREASURE_KEYS_CHANCE = 0.5;
var TREASURE_JOKER_CHANCE = 0.5;

function UseKey() {
	if (!inventory.HasItem('Key'))
		return;
	
	var room = dungeon.GetCurRoom();
	if (room.type == 'treasure') {
		inventory.RemoveItem('Key');
		room.SetType('treasure_used');
		dungeon.Display();

		var treasure = 'nothing';

		if (Math.random() < TREASURE_POTION_CHANCE)
			treasure = 'potion';
		else if (Math.random() < TREASURE_GOLD_CHANCE)
			treasure = 'gold';
		else if (Math.random() < TREASURE_KEYS_CHANCE)
			treasure = 'keys';
		else if (Math.random() < TREASURE_JOKER_CHANCE)
			treasure = 'joker';

		switch (treasure)
		{
			case 'potion':
				var num_potions = Math.floor(Math.random() * 3.0) + 1;
				treasure = (num_potions == 1 ? 'a potion' : num_potions + ' potions');
				for (var i = 0; i < num_potions; ++i)
					inventory.AddItem(potion_item);
				break;
			case 'gold':
				var gold = Math.floor(Math.random() * (dungeon.depth + 1) * 10) + 1;
				treasure = gold + ' gold';
				inventory.AddGold(gold);
				break;
			case 'keys':
				var num_keys = Math.floor(Math.random() * 2.0) + 1;
				treasure = (num_keys == 1 ? 'a key' : num_keys + ' keys');
				for (var i = 0; i < num_keys; ++i)
					inventory.AddItem(key_item);
				break;
			case 'joker':
				treasure = 'a joker';
				inventory.AddItem(joker_item);
				break;
			default:
				break;
		}
		
		display.Write('Opened a chest with a key and found ' + treasure + '.');
	}
	else
		display.Write('No treasure to open in this room');
}

function UsePotion() {
	inventory.RemoveItem('Potion');
	stats.AddHP(stats.max_hp - stats.hp);
	display.Write('Drank a potion and refilled their HP.');
	if (warmonger.battling)
		warmonger.Pass();
}

var key_item = new Item(
	key_sprite,
	'Key',
	'Unlocks chests, what else?',
	UseKey,
	null);

var potion_item = new Item(
	potion_sprite,
	'Potion',
	'Restores all of your health.',
	UsePotion,
	null);

var joker_item = new Item(
	joker_sprite,
	'Joker',
	'Teleports you directly to the exit.',
	function() {
		warmonger.Escape();
		inventory.RemoveItem('Joker');
		dungeon.TeleportToType('exit');
		display.Write('Teleported directly to the exit.');
	},
	null);

var stick_item = new Item(
	stick_sprite,
	'Stick',
	'The best weapon you\'ve got, every time.',
	ToggleEquip('stick'),
	new ItemStats('weapon', 1, 0, 1, 1, 1, 0));

var throwing_stick_item = new Item(
	throwing_stick_sprite,
	'Throwing Stick',
	'The throwable best weapon you know and love.',
	ToggleEquip('throwing stick'),
	new ItemStats('weapon', 1, 0, 1, 1.5, 1, 0));

var bigger_stick_item = new Item(
	bigger_stick_sprite,
	'Bigger Stick',
	'Bigger is better.',
	ToggleEquip('bigger stick'),
	new ItemStats('weapon', 1, 0, 1.1, 0, 1, 0));

var gloves_item = new Item(
	gloves_sprite,
	'Gloves',
	'Cut off the fingers and become a Pokemon trainer.',
	ToggleEquip('gloves'),
	new ItemStats('hands', 1, 0, 1, 0, 1, 1));

var thimble_item = new Item(
	thimble_sprite,
	'Thimble',
	'Best for dealing with little pricks.',
	ToggleEquip('thimble'),
	new ItemStats('jewelry', 1, 0, 1, 0, 1, 1));

var steel_toes_item = new Item(
	steel_toes_sprite,
	'Steel Toes',
	'The classic choice of foot protection.',
	ToggleEquip('steel toes'),
	new ItemStats('feet', 1, 1, 1, 0, 1, 2));

var pendant_item = new Item(
	pendant_sprite,
	'Pendant',
	'Not magical, just a regular old pendant.',
	ToggleEquip('pendant'),
	new ItemStats('jewelry', 1, 0, 1, 2, 1, 0));



var level_items = [
	[ stick_item ],
	[ stick_item, throwing_stick_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ],
	[ throwing_stick_item, bigger_stick_item, gloves_item, thimble_item, steel_toes_item, pendant_item ]
];
