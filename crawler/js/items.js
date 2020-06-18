function Item(sprite, name, description, action, stats) {
	this.sprite = sprite;
	this.name = name;
	this.description = description;
	this.action = action;
	this.stats = stats;
}

function ItemStats(slot, hp, atk, def) {
	this.slot = slot;
	this.hp = hp;
	this.atk = atk;
	this.def = def;
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
var TREASURE_ITEM_CHANCE = 0.5;

function UseKey() {
	if (!inventory.HasItem('Key') && !inventory.HasItem('Skeleton Key'))
		return;

	var room = dungeon.GetCurRoom();
	if (room.type == 'treasure') {
		if (!inventory.HasItem('Skeleton Key'))
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
		else if (Math.random() < TREASURE_ITEM_CHANCE)
		{
			var JOKER_CHANCE = 0.3;
			var TRUMP_CARD_CHANCE = 0.6;
			var BUSINESS_CARD_CHANCE = 0.9;
			
			var roll = Math.random();
			if (roll < JOKER_CHANCE)
				treasure = 'a joker';
			else if (roll < TRUMP_CARD_CHANCE)
				treasure = 'a trump card';
			else if (roll < BUSINESS_CARD_CHANCE)
				treasure = 'a business card';
			else
				treasure = 'a skeleton key';
		}
		else
			treasure = 'nothing';

		switch (treasure)
		{
			case 'potion':
				var num_potions = Math.floor(Math.random() * 3.0) + 1;
				treasure = (num_potions == 1 ? 'a potion' : num_potions + ' potions');
				for (var i = 0; i < num_potions; ++i)
					inventory.AddItem(potion_item);
				break;
			case 'gold':
				var gold = Math.floor(Math.random() * (dungeon.depth + 1) * 15) + 1;
				treasure = gold + ' gold';
				inventory.AddGold(gold);
				break;
			case 'keys':
				var num_keys = Math.floor(Math.random() * 2.0) + 1;
				treasure = (num_keys == 1 ? 'a key' : num_keys + ' keys');
				for (var i = 0; i < num_keys; ++i)
					inventory.AddItem(key_item);
				break;
			case 'a joker':
				inventory.AddItem(joker_item);
				break;
			case 'a trump card':
				inventory.AddItem(trump_card_item);
				break;
			case 'a business card':
				inventory.AddItem(business_card_item);
				break;
			case 'a skeleton key':
				inventory.AddItem(skeleton_key_item);
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
	if (!inventory.HasItem('Potion'))
		return;

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

var skeleton_key_item = new Item(
	skeleton_key_sprite,
	'Skeleton Key',
	'Unlocks chests without getting used up',
	UseKey,
	null);

var potion_item = new Item(
	potion_sprite,
	'Potion',
	'Restores all of your health',
	UsePotion,
	null);

var joker_item = new Item(
	joker_sprite,
	'Joker',
	'Teleports you directly to the exit',
	function() {
		warmonger.Escape();
		inventory.RemoveItem('Joker');
		dungeon.TeleportToType('exit')
		display.Write('Teleported directly to the exit.');
	},
	null);

var trump_card_item = new Item(
	trump_card_sprite,
	'Trump Card',
	'Defeats the current enemy',
	function() {
		if (warmonger.battling) {
			warmonger.FinishBattle();
			inventory.RemoveItem('Trump Card');
			display.Write('Played a trump card.')
		}
	},
	null);

var business_card_item = new Item(
	business_card_sprite,
	'Business Card',
	'Teleports you directly to a merchant',
	function() {
		if (warmonger.battling) {
			warmonger.Escape();
			inventory.RemoveItem('Business Card');
			if (dungeon.TeleportToType('merchant')) {
				display.Write('Teleported directly to a merchant.');
			} else {
				display.Write('Escaped from battle, but couldn\'t find a merchant to teleport to');
			}
		} else {
			if (dungeon.TeleportToType('merchant')) {
				inventory.RemoveItem('Business Card');
				display.Write('Teleported directly to a merchant.');
			}
		}
	},
	null);

var fists_item = new Item(
	fists_sprite,
	'Fists',
	'All-purpose enemy remover',
	ToggleEquip('fists'),
	new ItemStats('weapon', 0, 1, 0));

var stick_item = new Item(
	stick_sprite,
	'Stick',
	'What\'s brown and sticky?',
	ToggleEquip('stick'),
	new ItemStats('weapon', 0, 1, 1));

var throwing_stick_item = new Item(
	throwing_stick_sprite,
	'Throwing Stick',
	'Can I pet the dog?',
	ToggleEquip('throwing stick'),
	new ItemStats('weapon', 3, 1, 1));

var bigger_stick_item = new Item(
	bigger_stick_sprite,
	'Bigger Stick',
	'Bigger is better',
	ToggleEquip('bigger stick'),
	new ItemStats('weapon', 0, 2, 1));

var gloves_item = new Item(
	gloves_sprite,
	'Gloves',
	'Great for handling sticky things',
	ToggleEquip('gloves'),
	new ItemStats('hands', 0, 0, 1));

var brass_knuckles_item = new Item(
	brass_knuckles_sprite,
	'Brass Knuckles',
	'The more offensive defensive option',
	ToggleEquip('brass knuckles'),
	new ItemStats('hands', 0, 1, 1));

var gauntlets_item = new Item(
	gauntlets_sprite,
	'Gauntlets',
	'Better gloves for added protection',
	ToggleEquip('gauntlets'),
	new ItemStats('hands', 0, 0, 2));

var running_shoes_item = new Item(
	running_shoes_sprite,
	'Running Shoes',
	'You still can\'t run away',
	ToggleEquip('running shoes'),
	new ItemStats('feet', 0, 0, 1));

var cleats_item = new Item(
	cleats_sprite,
	'Cleats',
	'A running shoe with some offense',
	ToggleEquip('cleats'),
	new ItemStats('feet', 0, 1, 1));

var steel_toes_item = new Item(
	steel_toes_sprite,
	'Steel Toes',
	'The best choice for workplace safety',
	ToggleEquip('steel toes'),
	new ItemStats('feet', 6, 0, 1));

var thimble_item = new Item(
	thimble_sprite,
	'Thimble',
	'Best for dealing with little pricks',
	ToggleEquip('thimble'),
	new ItemStats('jewelry', 0, 0, 1));

var pendant_item = new Item(
	pendant_sprite,
	'Pendant',
	'Not magical, just a regular old pendant',
	ToggleEquip('pendant'),
	new ItemStats('jewelry', 3, 0, 1));

var cursed_ring_item = new Item(
	cursed_ring_sprite,
	'Cursed Ring',
	'A burden to wear',
	ToggleEquip('cursed ring'),
	new ItemStats('jewelry', -6, 2, 0));


var level_items = [
	[ stick_item ],
	[ stick_item, gloves_item, running_shoes_item, thimble_item ],
	[ stick_item, gloves_item, running_shoes_item, thimble_item ],
	[ stick_item, gloves_item, running_shoes_item, thimble_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ],
	[ throwing_stick_item, bigger_stick_item, brass_knuckles_item, gauntlets_item, cleats_item, steel_toes_item, pendant_item, cursed_ring_item ]
];
