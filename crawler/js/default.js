var WALLS = ['right', 'back', 'left', 'front'];
var DEPTH_NAMES = [
	'Greenhorn Graves',
	'Stomping Grounds',
	'The Frying Pan',
	'The Fire',
	'Slow Burn',
	'Rolling Boil',
	'Toil and Trouble',
	'Inferno',
	'The Ninth Circle',
	'Judecca',
	'Hero\'s Respite'
];

var DIR_X = [1, 0, -1, 0];
var DIR_Y = [0, 1, 0, -1];

var ROOM_SPAWN_CHANCE = 0.85;
var TREASURE_ROOM_CHANCE = 0.1;
var MERCHANT_ROOM_CHANCE = 0.1;

function BOUNDED(a, b, c) {
	return (a >= b && a < c);
}

function DAMAGE_CALC(level, atk, def) {
	return Math.ceil(level * atk / 3.0 / (def + 1.0));
}

function XP_CALC(stats) {
	return Math.ceil(stats.level * (stats.max_hp + stats.atk + stats.def) / 3.0);
}

function GOLD_CALC(stats) {
	return Math.floor((dungeon.depth + 1) * stats.level);
}

function POTION_COST(depth) {
	return Math.ceil((depth + 1) * 1.6);
}

function KEY_COST(depth) {
	return Math.ceil((depth + 1) * 1.2);
}

function ITEM_COST(depth, item) {
	return Math.ceil((depth + 1) * 3 * (Math.abs(item.stats.hp) / 3 + Math.abs(item.stats.atk) + Math.abs(item.stats.def)));
}

function BuyItem(cost, item) {
	return function() {
		if (inventory.gold < cost) {
			display.Write('You don\'t have enough gold to buy a ' + item.name + '.');
		}
		else
		{
			inventory.AddGold(-cost);
			inventory.AddItem(item);
		}
	};
}

function GameOver() {
	alert('YOU HAVE DIED\nThe dungeon beckons...');
	window.onbeforeunload = null;
	location.reload();
}

window.onbeforeunload = function() {
	return 'Are you sure you want to leave? All your progress will be lost!';
}

$(function() {
	display = new Display();
	dungeon = new Dungeon(3, 3);
	inventory = new Inventory();
	stats = new Stats();
	warmonger = new WarMonger();
	dungeon.Generate();
	
	inventory.AddItem(manual_item);
	inventory.AddItem(key_item);
	inventory.AddItem(fists_item);

	stats.ToggleEquip('fists');
	
	dungeon.Display();

	$('html').keydown(function(e) {
		switch (e.keyCode) {
			case 32:
				if (warmonger.battling)
					warmonger.Attack();
				break;
			case 37:
				dungeon.Move('west');
				break;
			case 38:
				dungeon.Move('north');
				break;
			case 39:
				dungeon.Move('east');
				break;
			case 40:
				dungeon.Move('south');
				break;
			case 69:
				var room = dungeon.GetCurRoom();
				if (room.type == 'treasure')
					UseKey();
				else if (room.type == 'exit')
					dungeon.NextLevel();
				break;
			case 80:
				UsePotion();
				break;
			default:
				return;
		}
		e.preventDefault();
	});
});

var display;
var dungeon;
var inventory;
var stats;
var warmonger;

function Display() {
	this.planes = {
		right: $('div.room div.plane.right div.content'),
		back: $('div.room div.plane.back div.content'),
		left: $('div.room div.plane.left div.content'),
		front: $('div.room div.plane.front div.content'),
		bottom: $('div.room div.plane.bottom div.content'),
		mid: $('div.room div.plane.mid div.content'),
		top: $('div.room div.plane.top div.content')
	};
	this.map = $('div.map');
	this.console = $('div.console');
	this.inventory = $('div.inventory');
	this.stats = $('div.stats');
	this.enemystats = $('div.enemystats');
	this.merchant = $('div.merchant');

	this.Write('Popped into existence for the bemusement of humans.');
}
Display.prototype.Write =
	function(text) {
		this.console.append('<div>' + text + '</div>');
		this.console.prop({ scrollTop: this.console.prop("scrollHeight") });
	};
Display.prototype.SetPlanes =
	function(walls, content) {
		for (var i = 0; i < WALLS.length; ++i)
			this.planes[WALLS[i]].html(walls[WALLS[i]]);
		this.planes.bottom.html(content.bottom);
		this.planes.mid.html(content.mid);
		this.planes.top.html(content.top);
	};
Display.prototype.SetMap =
	function(depth, width, height, rooms, cur_x, cur_y) {
		var content = '<div class="depth">' + depth + ': ' + (depth >= DEPTH_NAMES.length ? '???' : DEPTH_NAMES[depth]) + '</div><table>';
		for (var y = height - 1; y >= 0; --y) {
			content += '<tr>';
			for (var x = 0; x < width; ++x) {
				if (rooms[x][y] == undefined)
					content += '<td class="empty"></td>';
				else if (!rooms[x][y].explored)
					content += '<td class="unexplored"></td>';
				else if (x != cur_x || y != cur_y)
					content += '<td class="explored"></td>';
				else
					content += '<td class="current"></td>';
			}
			content += '</tr>';
		}
		content += '</table>';
		this.map.html(content);
	};
Display.prototype.SetInventory =
	function(gold, items) {
		var content = $('<div class="gold">' + gold + ' gold</div><table></table>');
		var cur_tr = null;
		for (var i = 0; i < items.length; ++i) {
			if (i % 4 == 0)
			{
				cur_tr = $('<tr></tr>');
				content.append(cur_tr);
			}
			var cell = $('<td title="' + items[i].description + '"><div class="sprite">' + items[i].sprite + '</div><div class="name">' + items[i].name + '</div></td>');
			cell.on('click', items[i].action);
			cur_tr.append(cell);
		}
		this.inventory.empty();
		this.inventory.append(content);
	};
Display.prototype.SetStats =
	function(level, xp, next_xp, attack, defense, max_hp, hp, equipment) {
		var content = '<table>';
		content += '<tr><td>Level</td><td>' + level + '</td></tr>';
		content += '<tr><td>HP</td><td>' + hp + ' / ' + max_hp + '</td></tr>';
		content += '<tr><td>XP</td><td>' + xp + ' / ' + next_xp + '</td></tr>';
		content += '<tr><td>Atk</td><td>' + attack + '</td></tr>';
		content += '<tr><td>Def</td><td>' + defense + '</td></tr>';

		for (slot in equipment) {
			content += '<tr><td>' + (slot.charAt(0).toUpperCase() + slot.slice(1)) + '</td><td>' + (equipment[slot] == null ? '--' : equipment[slot].name) + '</td></tr>';
		}

		this.stats.html(content);
	};
Display.prototype.SetEnemy =
	function(enemy) {
		if (enemy == null)
		{
			this.planes.mid.html('');
			this.enemystats.empty();
		}
		else
		{
			this.planes.mid.html(enemy.sprite);
			var content = '<table>';
			content += '<tr><td>Species</td><td>' + enemy.name + '</td></tr>';
			content += '<tr><td>Level</td><td>' + enemy.stats.level + '</td></tr>';
			content += '<tr><td>HP</td><td>' + enemy.stats.hp + ' / ' + enemy.stats.max_hp + '</td></tr>';
			content += '</table>';
			this.enemystats.html(content);
		}
	};
Display.prototype.HideMerchant =
	function() {
		this.merchant.hide();
	};
Display.prototype.ShowMerchant =
	function(depth, item) {
		var content = $('<table></table>');

		var potion_cost = POTION_COST(depth)
		var potion_buy = $('<tr title="Buy a potion (' + potion_cost + ' gold)"><td><div class="sprite">' + potion_sprite + '</div></td><td><div>Buy a potion: ' + potion_cost + ' gold</div></td></tr>');
		potion_buy.on('click', BuyItem(potion_cost, potion_item));
		content.append(potion_buy);

		var key_cost = KEY_COST(depth)
		var key_buy = $('<tr title="Buy a key (' + key_cost + ' gold)"><td><div class="sprite">' + key_sprite + '</div></td><td><div>Buy a key: ' + key_cost + ' gold</div></td></tr>');
		key_buy.on('click', BuyItem(key_cost, key_item));
		content.append(key_buy);

		if (item != null)
		{
			var item_cost = ITEM_COST(depth, item)
			var item_buy = $('<tr title="Buy a ' + item.name + '(' + item_cost + ' gold)"><td><div class="sprite">' + item.sprite + '</div></td><td><div>Buy a ' + item.name + ': ' + item_cost + ' gold</div></td></tr>');
			item_buy.on('click', () => {
				if (inventory.gold < item_cost) {
					display.Write('You don\'t have enough gold to buy a ' + item.name + '.');
				}
				else
				{
					inventory.AddGold(-item_cost);
					inventory.AddItem(item);
					stats.ToggleEquip(item.name);
					dungeon.GetCurRoom().merchantItem = null
					dungeon.Display()
				}
			});
			content.append(item_buy);
		}
		else
		{
			var item_buy = $('<tr title="Sold out!"></tr><td div class="sprite">' + sold_out_sprite + '</div></td><td><div>Sold out!</div></td></tr>');
			content.append(item_buy);
		}

		this.merchant.empty();
		this.merchant.append(content);
		this.merchant.show();
	};

function Room() {
	this.explored = false;
	this.type = null;
	this.content = {
		bottom: null,
		mid: null,
		top: null
	};
}
Room.prototype.SetType =
	function(type) {
		this.type = type;
		switch (type) {
			case 'start':
				this.explored = true;
				this.content.bottom = brick_floor_rug;
				this.content.mid = null;
				this.content.top = brick_ceiling_trapdoor;
				break;
			case 'exit':
				this.content.bottom = brick_floor_trapdoor;
				this.content.mid = null;
				this.content.top = brick_ceiling;
				break;
			case 'treasure':
				this.content.bottom = brick_floor;
				this.content.mid = chest_closed;
				this.content.top = brick_ceiling;
				break;
			case 'treasure_used':
				this.content.bottom = brick_floor;
				this.content.mid = chest_open;
				this.content.top = brick_ceiling;
				break;
			case 'merchant':
				this.content.bottom = brick_floor_rug;
				this.content.mid = merchant_sprite;
				this.content.top = brick_ceiling;
				this.merchantItem = level_items[dungeon.depth][Math.floor(Math.random() * level_items[dungeon.depth].length)];
				break;
			default:
				this.content.bottom = brick_floor;
				this.content.mid = null;
				this.content.top = brick_ceiling;
				break;
		}
	};

function Dungeon(width, height) {
	this.depth = 0;
	this.width = width;
	this.height = height;
	this.cur_x = Math.floor(width / 2);
	this.cur_y = Math.floor(height / 2);
}
Dungeon.prototype.Generate =
	function() {
		this.rooms = new Array(this.width);
		for (var i = 0; i < this.rooms.length; ++i)
			this.rooms[i] = new Array(this.height);

		var queue = [{x: this.cur_x, y: this.cur_y}];
		var spots = [];

		while (queue.length > 0) {
			var top = queue[0];
			queue.splice(0, 1);

			if (!BOUNDED(top.x, 0, this.width) || !BOUNDED(top.y, 0, this.height))
				continue;

			if (spots.length != 0 && this.rooms[top.x][top.y] != undefined)
				continue;

			var free_sides = 0;
			var open_spots = [];

			for (var d = 0; d < 4; ++d) {
				var cur = {x: top.x + DIR_X[d], y: top.y + DIR_Y[d]};

				if (!BOUNDED(cur.x, 0, this.width) || !BOUNDED(cur.y, 0, this.height))
					++free_sides;
				else if (this.rooms[cur.x][cur.y] == undefined)
				{
					++free_sides;
					open_spots.push(cur);
				}
			}

			if (free_sides < 3)
				continue;

			spots.push(top);

			this.rooms[top.x][top.y] = new Room();

			for (var i = 0; i < open_spots.length; ++i)
				if (spots.length == 1 || Math.random() < ROOM_SPAWN_CHANCE)
					queue.push(open_spots[i]);
		}

		for (var i = 0; i < spots.length; ++i)
		{
			var type = 'room';
			if (i == 0)
				type = 'start';
			else if (i == spots.length - 1)
				type = 'exit';
			else
			{
				if (Math.random() < TREASURE_ROOM_CHANCE)
					type = 'treasure';
				else if (Math.random() < MERCHANT_ROOM_CHANCE)
					type = 'merchant';
			}

			this.rooms[spots[i].x][spots[i].y].SetType(type);
		}
	};
Dungeon.prototype.GetCurRoom =
	function() {
		return this.rooms[this.cur_x][this.cur_y];
	};
Dungeon.prototype.SetRoom =
	function(new_x, new_y) {
		this.cur_x = new_x;
		this.cur_y = new_y;

		var explored = this.rooms[this.cur_x][this.cur_y].explored;
		
		this.rooms[this.cur_x][this.cur_y].explored = true;

		this.Display();

		var room = this.rooms[this.cur_x][this.cur_y];

		if (!explored && room.type == 'room') {
			var enemy = level_enemies[this.depth][Math.floor(Math.random() * level_enemies[this.depth].length)];
			var level = Math.max(1, Math.floor(this.depth + 1 + Math.random() * this.depth - 0.5));
			warmonger.Encounter(enemy.Instance(level));
		}
	};
Dungeon.prototype.Display =
	function() {
		var walls = {};

		for (var d = 0; d < 4; ++d)
		{
			var cur = {x: this.cur_x + DIR_X[d], y: this.cur_y + DIR_Y[d]};

			if (!BOUNDED(cur.x, 0, this.width) || !BOUNDED(cur.y, 0, this.height) || this.rooms[cur.x][cur.y] == undefined)
				walls[WALLS[d]] = brick_wall;
			else
				if (!this.rooms[cur.x][cur.y].explored)
					walls[WALLS[d]] = brick_wall_door_shut;
				else
					walls[WALLS[d]] = brick_wall_door_open;
		}

		display.SetPlanes(walls, this.rooms[this.cur_x][this.cur_y].content);

		display.SetMap(this.depth, this.width, this.height, this.rooms, this.cur_x, this.cur_y);

		var room = this.GetCurRoom();

		if (room.type == 'merchant') {
			display.ShowMerchant(this.depth, room.merchantItem);
		}
		else
			display.HideMerchant();
	};
Dungeon.prototype.Move =
	function(dir) {
		if (warmonger.battling)
		{
			display.Write('Running is tantamount to losing! Preserve your dignity!');
			return;
		}
		
		var new_x = this.cur_x;
		var new_y = this.cur_y;
		switch (dir) {
			case 'forward':
			case 'forth':
			case 'north':
				++new_y;
				break;
			case 'back':
			case 'backward':
			case 'south':
				--new_y;
				break;
			case 'left':
			case 'west':
				--new_x;
				break;
			case 'right':
			case 'east':
				++new_x;
				break;
			default:
				break;
		}
		if (BOUNDED(new_x, 0, this.width) && BOUNDED(new_y, 0, this.height)) {
			if (this.rooms[new_x][new_y] != undefined) {
				display.Write('Moved ' + dir);
				this.SetRoom(new_x, new_y);
			}
		}
	};
Dungeon.prototype.TeleportToType =
	function(type) {
		for (var x = 0; x < this.width; ++x) {
			for (var y = 0; y < this.height; ++y) {
				if (this.rooms[x][y] != undefined && this.rooms[x][y].type == type) {
					this.SetRoom(x, y);
					return true;
				}
			}
		}
		return false;
	};
Dungeon.prototype.NextLevel =
	function() {
		++this.width;
		++this.height;
		++this.depth;
		this.Generate();
		this.Display();
		display.Write('Jumping down the hatch, they continued to the next floor.');
	};

function Inventory() {
	this.gold = 5;
	this.items = [];
}
Inventory.prototype.AddGold =
	function(gold) {
		this.gold += gold;
		this.Display();
	};
Inventory.prototype.AddItem =
	function(item) {
		this.items.push(item);
		this.Display();
	};
Inventory.prototype.HasItem =
	function(name) {
		for (var i = 0; i < this.items.length; ++i)
			if (this.items[i].name.toLowerCase() == name.toLowerCase())
				return true;
		return false;
	};
Inventory.prototype.RemoveItem =
	function(name) {
		var removed = null;
		for (var i = 0; i < this.items.length; ++i) {
			if (this.items[i].name.toLowerCase() == name.toLowerCase()) {
				removed = this.items.splice(i, 1)[0];
				break;
			}
		}
		this.Display();
		return removed;
	};
Inventory.prototype.Display =
	function() {
		display.SetInventory(this.gold, this.items);
	};

function Stats() {
	this.level = 1;
	this.xp = 0;
	this.attack = 0;
	this.defense = 0;
	this.base_max_hp = 13;
	this.max_hp = this.base_max_hp + this.level;
	this.hp = this.max_hp;
	this.equipment = {
		hands: null,
		weapon: null,
		feet: null,
		jewelry: null
	};
}
Stats.prototype.AddHP =
	function(hp) {
		this.hp += hp;
		this.Display();
		if (stats.hp <= 0.0)
			GameOver();
	};
Stats.prototype.AddXP =
	function(xp) {
		this.xp += xp;
		while (this.xp >= this.NextXP())
		{
			this.xp -= this.NextXP();
			++this.level;
			display.Write('Leveled up to level ' + this.level + '!');
		}
		this.Recalc();
	};
Stats.prototype.NextXP =
	function() {
		return this.level * this.level;
	};
Stats.prototype.ToggleEquip =
	function(name) {
		for (var i = 0; i < inventory.items.length; ++i) {
			if (inventory.items[i].name.toLowerCase() == name.toLowerCase()) {
				var item = inventory.items[i];
				if (item.stats == null)
					return;
				if (this.equipment[item.stats.slot] != null) {
					if (this.equipment[item.stats.slot].name.toLowerCase() == name.toLowerCase()) {
						this.equipment[item.stats.slot] = null;
						display.Write('Removed a ' + name + '.');
					}
					else
					{
						display.Write('Equipped a ' + name + ' by removing a ' + this.equipment[item.stats.slot].name + '.');
						this.equipment[item.stats.slot] = item;
					}
				}
				else
				{
					this.equipment[item.stats.slot] = item;
					display.Write('Equipped a ' + name + '.');
				}
				this.Recalc();
				this.Display();
			}
		}
	};
Stats.prototype.Recalc =
	function() {
		this.attack = 0;
		this.defense = 0;
		this.max_hp = this.base_max_hp + this.level;

		for (key in this.equipment) {
			if (this.equipment[key] == null)
				continue;
			this.max_hp += this.equipment[key].stats.hp;
			this.attack += this.equipment[key].stats.atk;
			this.defense += this.equipment[key].stats.def;
		}

		this.Display();
	};
Stats.prototype.Display =
	function() {
		display.SetStats(this.level, this.xp, this.NextXP(), this.attack, this.defense, this.max_hp, this.hp, this.equipment);
	};

function WarMonger() {
	this.battling = false;
	this.enemy = null;
}
WarMonger.prototype.Encounter =
	function(enemy) {
		this.battling = true;
		this.enemy = enemy;
		this.Display();
	};
WarMonger.prototype.Display =
	function() {
		display.SetEnemy(this.enemy);
	};
WarMonger.prototype.Escape =
	function() {
		this.battling = false;
		this.enemy = null;
		this.Display();
	};
WarMonger.prototype.Attack =
	function() {
		var player_dmg = DAMAGE_CALC(stats.level, stats.attack, this.enemy.stats.def);
		this.enemy.stats.hp -= player_dmg;
		this.Display();
		display.Write('Dealt ' + player_dmg + ' damage to the ' + this.enemy.name + '.');
		if (this.enemy.stats.hp <= 0.0)
			this.FinishBattle();
		else
		{
			var enemy_dmg = DAMAGE_CALC(this.enemy.stats.level, this.enemy.stats.atk, stats.defense);
			stats.AddHP(-enemy_dmg);
			display.Write('The ' + this.enemy.name + ' dealt ' + enemy_dmg + ' damage back.');
		}
	};
WarMonger.prototype.Pass =
	function() {
		if (this.enemy.stats.hp <= 0.0)
			this.FinishBattle();
		else
		{
			var enemy_dmg = DAMAGE_CALC(this.enemy.stats.level, this.enemy.stats.atk, stats.defense);
			stats.AddHP(-enemy_dmg);
			display.Write('The ' + this.enemy.name + ' dealt ' + enemy_dmg + ' damage back.');
		}
		this.Display();
	};
WarMonger.prototype.FinishBattle =
	function() {
		this.battling = false;
		var xp = XP_CALC(this.enemy.stats);
		var gold = GOLD_CALC(this.enemy.stats);
		display.Write('Defeated the ' + this.enemy.name + ', gained ' + xp + 'xp, and found ' + gold + ' gold.');
		dungeon.Display();
		stats.AddXP(xp);
		inventory.AddGold(gold);
		this.enemy = null;
		this.Display();
	};
