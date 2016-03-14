var Dir = {
	right: 0,
	up: 1,
	left: 2,
	down: 3,
	begin: 0,
	end: 4,
	reverse: [2, 3, 0, 1],
	vector: [
		ivec2.fromValues(1, 0),
		ivec2.fromValues(0, 1),
		ivec2.fromValues(-1, 0),
		ivec2.fromValues(0, -1)
	]
};

// Group 0 means empty
function Tile() {
	this.group = -1;
	this.active = false;
	this.connected = false;
}
Tile.prototype.empty = function() {
	return this.group == -1;
};

function Grid(element, width, height) {
	this.element = element;
	this.context = this.element.getContext('2d');
	this.drawSize = Grid.GetDrawPos(width, height);
	this.element.width = this.drawSize[0];
	this.element.height = this.drawSize[1];
	this.size = ivec2.fromValues(width, height);
	this.area = width * height;
	this.tiles = [];
	for (var i = 0; i < this.area; ++i)
		this.tiles.push(new Tile());
}
Grid.prototype.clear = function() {
	for (var i = 0; i < this.area; ++i)
		this.tiles[i] = new Tile();
};
Grid.CLEAR_COLOR = '#000';
Grid.EMPTY_COLOR = '#444';
Grid.CONNECTED_COLOR = '#ddd';
Grid.TILE_SIZE_X = 8;
Grid.TILE_SIZE_Y = 8;
Grid.TILE_SPACE_X = 2;
Grid.TILE_SPACE_Y = 2;
Grid.prototype.get = function(x, y) {
	if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1])
		return null;
	return this.tiles[x + y * this.size[0]];
};
Grid.GetDrawPos = function(x, y) {
	return ivec2.fromValues(
		Grid.TILE_SPACE_X + (Grid.TILE_SPACE_X + Grid.TILE_SIZE_X) * x,
		Grid.TILE_SPACE_Y + (Grid.TILE_SPACE_Y + Grid.TILE_SIZE_Y) * y
	);
};
Grid.GetGroupColor = function(group) {
	return 'hsl(' + (group * 15 % 360) + ', 50%, 50%)';
};
Grid.prototype.draw = function() {
	this.context.fillStyle = Grid.CLEAR_COLOR;
	this.context.fillRect(0, 0, this.drawSize[0], this.drawSize[1]);
	
	for (var y = 0; y < this.size[1]; ++y) {
		for (var x = 0; x < this.size[0]; ++x) {
			var tile = this.get(x, y);
			var pos = Grid.GetDrawPos(x, y);
			
			if (tile.active)
				this.context.fillStyle = Grid.ACTIVE_COLOR;
			else if (tile.empty())
				this.context.fillStyle = Grid.EMPTY_COLOR;
			else if (tile.connected)
				this.context.fillStyle = Grid.CONNECTED_COLOR;
			else
				this.context.fillStyle = Grid.GetGroupColor(tile.group);
			
			this.context.fillRect(pos[0], pos[1], Grid.TILE_SIZE_X, Grid.TILE_SIZE_Y);
			
			if (!tile.empty()) {
				var fillRight = x < this.size[0] - 1 && this.get(x + 1, y).group == tile.group;
				var fillUp = y < this.size[1] - 1 && this.get(x, y + 1).group == tile.group;
				var fillRU = fillRight && fillUp && this.get(x + 1, y + 1).group == tile.group;
				
				if (fillRight)
					this.context.fillRect(pos[0] + Grid.TILE_SIZE_X, pos[1], Grid.TILE_SPACE_X, Grid.TILE_SIZE_Y);
				if (fillUp)
					this.context.fillRect(pos[0], pos[1] + Grid.TILE_SIZE_Y, Grid.TILE_SIZE_X, Grid.TILE_SPACE_Y);
				if (fillRU)
					this.context.fillRect(pos[0] + Grid.TILE_SIZE_X, pos[1] + Grid.TILE_SIZE_Y, Grid.TILE_SPACE_X, Grid.TILE_SPACE_Y);
			}
		}
	}
};

function Generator(grid, tree, rooms, doorChance) {
	this.grid = grid;
	this.reset(tree, rooms, doorChance);
}
Generator.STATE_PREGEN = 0;
Generator.STATE_POSTROOM = 1;
Generator.STATE_POSTMAZE = 2;
Generator.STATE_POSTCONNECT = 3;
Generator.STATE_POSTERODE = 4;
Generator.STATE_POSTRELAX = 5;
Generator.prototype.reset = function(tree, rooms, doorChance) {
	this.tree = tree;
	this.rooms = rooms;
	this.builder = null;
	this.group = 1;
	this.success = false;
	this.doorChance = doorChance;
	this.grid.clear();
	this.state = Generator.STATE_POSTROOM;
};
Generator.prototype.advance = function() {
	++this.state;
	return this.step();
};
Generator.prototype.step = function() {
	switch (this.state) {
		case Generator.STATE_POSTROOM:
			if (this.rooms == 0)
				return this.advance();
			
			var size = ivec2.fromValues(
				3 + 2 * Math.floor(Math.random() * 3),
				3 + 2 * Math.floor(Math.random() * 3)
			);
		
			var candidates = [];
			for (var y = 0; y < this.grid.size[1] - size[1]; y += 2) {
				for (var x = 0; x < this.grid.size[0] - size[0]; x += 2) {
					var empty = true;
					for (var dy = 0; dy < size[1] && empty; ++dy) {
						for (var dx = 0; dx < size[0] && empty; ++dx) {
							var tile = this.grid.get(x + dx, y + dy);
							if (!tile.empty())
								empty = false;
						}
					}
					if (empty)
						candidates.push(ivec2.fromValues(x, y));
				}
			}
		
			if (candidates.length == 0) {
				console.log('Failed!');
				this.success = false;
				return false;
			}
		
			var choice = candidates[Math.floor(Math.random() * candidates.length)];
			for (var dy = 0; dy < size[1]; ++dy)
				for (var dx = 0; dx < size[0]; ++dx)
					this.grid.get(choice[0] + dx, choice[1] + dy).group = this.group;
		
			++this.group;
			--this.rooms;
			
			break;
		case Generator.STATE_POSTMAZE:
			if (this.builder == null) {
				var found = false;
				for (var y = 0; y < this.grid.size[1] && !found; y += 2) {
					for (var x = 0; x < this.grid.size[0] && !found; x += 2) {
						if (this.grid.get(x, y).empty()) {
							this.builder = new MazeBuilder(this.grid, x, y, this.group);
							found = true;
						}
					}
				}
				if (!found)
					return this.advance();
				
				++this.group;
			}
		
			if (!this.builder.step()) {
				this.builder = null;
				return this.step();
			}
			
			break;
		case Generator.STATE_POSTCONNECT:
			var spread = false;
			var connect = false;
			var candidates = [];
			for (var y = 0; y < this.grid.size[1]; ++y) {
				for (var x = 0; x < this.grid.size[0]; ++x) {
					var tile = this.grid.get(x, y);
					
					if (tile.connected) {
						connect = true;
						
						for (var d = Dir.begin; d != Dir.end; ++d) {
							var n = this.grid.get(x + Dir.vector[d][0], y + Dir.vector[d][1]);
							if (n != null && !n.empty() && !n.connected)
								candidates.push(n);
						}
					}
				}
			}
			for (var i = 0; i < candidates.length; ++i)
				candidates[i].connected = true;
			
			if (candidates.length == 0) {
				if (connect) {
					var candidates = [];
					for (var y = 0; y < this.grid.size[1]; ++y) {
						for (var x = 0; x < this.grid.size[0]; ++x) {
							var tile = this.grid.get(x, y);
							
							if (tile.empty()) {
								var hasConnected = false;
								var hasDisconnected = false;
								
								for (var d = Dir.begin; d != Dir.end; ++d) {
									var n = this.grid.get(x + Dir.vector[d][0], y + Dir.vector[d][1]);
									if (n != null && !n.empty() && n.group != 0) {
										if (n.connected)
											hasConnected = true;
										else
											hasDisconnected = true;
									}
								}
								
								if (hasConnected && hasDisconnected)
									candidates.push(ivec2.fromValues(x, y));
							}
						}
					}
					
					if (candidates.length == 0)
						return this.advance();
					
					var index = Math.floor(Math.random() * candidates.length);
					var choice = candidates[index];
					var tile = this.grid.get(choice[0], choice[1]);
					tile.connected = true;
					tile.group = 0;
					
					var targetGroups = [];
					for (var dy = -1; dy <= 1; ++dy) {
						for (var dx = -1; dx <= 1; ++dx) {
							var n = this.grid.get(choice[0] + dx, choice[1] + dy);
							if (n != null && !n.empty() && n.group != 0)
								targetGroups.push(n.group);
						}
					}
					
					candidates = [];
					for (var y = 0; y < this.grid.size[1]; ++y) {
						for (var x = 0; x < this.grid.size[0]; ++x) {
							var tile = this.grid.get(x,y);
							
							if (tile.empty()) {
								var hasConnected = false;
								var hasDisconnected = false;
								
								for (var d = Dir.begin; d != Dir.end; ++d) {
									var n = this.grid.get(x + Dir.vector[d][0], y + Dir.vector[d][1]);
									if (n != null && !n.empty() && n.group != 0) {
										if (n.connected)
											hasConnected = true;
										else if (targetGroups.indexOf(n.group) != -1)
											hasDisconnected = true;
									}
								}
								
								if (hasConnected && hasDisconnected)
									candidates.push(ivec2.fromValues(x, y));
							}
						}
					}
					
					candidates.splice(index, 1);
					
					for (var d = Dir.begin; d != Dir.end; ++d) {
						var exclude = ivec2.fromValues(choice[0] + Dir.vector[d][0], choice[1] + Dir.vector[d][1]);
						for (var i = 0; i < candidates.length; ++i) {
							if (ivec2.equal(candidates[i], exclude)) {
								candidates.splice(i, 1);
								break;
							}
						}
					}
					
					for (var i = 0; i < candidates.length; ++i) {
						if (Math.random() < this.doorChance) {
							var extra = candidates[i];
							var etile = this.grid.get(extra[0], extra[1]);
							etile.connected = true;
							etile.group = 0;
							
							for (var d = Dir.begin; d != Dir.end; ++d) {
								var exclude = ivec2.fromValues(extra[0] + Dir.vector[d][0], extra[1] + Dir.vector[d][1]);
								for (var j = 0; j < candidates.length; ++j) {
									if (ivec2.equal(candidates[j], exclude)) {
										candidates.splice(j, 1);
										--i;
										break;
									}
								}
							}
						}
					}
				} else {
					var found = false;
					for (var y = 0; y < this.grid.size[1] && !found; ++y) {
						for (var x = 0; x < this.grid.size[0] && !found; ++x) {
							var tile = this.grid.get(x, y);
							
							if (tile.group == 1) {
								tile.connected = true;
								found = true;
							}
						}
					}
				}
			}
			
			break;
		case Generator.STATE_POSTERODE:
			var candidates = [];
			for (var y = 0; y < this.grid.size[1]; ++y) {
				for (var x = 0; x < this.grid.size[0]; ++x) {
					var tile = this.grid.get(x, y);
					
					if (!tile.empty()) {
						var neighbors = 0;
						for (var d = Dir.begin; d != Dir.end; ++d) {
							var n = this.grid.get(x + Dir.vector[d][0], y + Dir.vector[d][1]);
							if (n != null && !n.empty())
								++neighbors;
						}
						
						if (neighbors == 1)
							candidates.push(tile);
					}
				}
			}
			
			for (var i = 0; i < candidates.length; ++i) {
				candidates[i].group = -1;
				candidates[i].connected = false;
			}
			
			if (candidates.length == 0)
				return this.advance();
			
			break;
		case Generator.STATE_POSTRELAX:
			var relaxed = false;
			
			for (var y = 0; y < this.grid.size[1] && !relaxed; ++y) {
				for (var x = 0; x < this.grid.size[0] && !relaxed; ++x) {
					var tile = this.grid.get(x, y);
					var group = tile.group;
					
					if (tile.empty())
						continue;
					
					// Look horizontally
					var left = x;
					while (true) {
						--left;
						var ltile = this.grid.get(left, y);
						if (ltile == null || ltile.empty())
							break;
					}
					++left;
					var right = x;
					while (true) {
						++right;
						var rtile = this.grid.get(right, y);
						if (rtile == null || rtile.empty())
							break;
					}
					--right;
					
					var upvalid = true;
					var nup1 = 0;
					var nup2 = 0
					var downvalid = true;
					var ndown1 = 0;
					var ndown2 = 0;
					for (var h = left; h <= right; ++h) {
						var up = this.grid.get(h, y - 1);
						if (up != null && !up.empty()) {
							++nup1;
							if (up.group != group)
								upvalid = false;
						}
						up = this.grid.get(h, y - 2);
						if (up != null && !up.empty())
							++nup2;
						
						var down = this.grid.get(h, y + 1);
						if (down != null && !down.empty()) {
							++ndown1;
							if (down.group != group)
								downvalid = false;
						}
						down = this.grid.get(h, y + 2);
						if (down != null && !down.empty())
							++ndown2;
					}
					
					if ((downvalid && nup1 == 0 && ndown1 == 2 && ndown2 <= 2) || (upvalid && ndown1 == 0 && nup1 == 2 && nup2 <= 2)) {
						var my = (nup1 == 0 ? y + 1 : y - 1);
						for (var h = left; h <= right; ++h) {
							var oldTile = this.grid.get(h, y);
							oldTile.group = -1;
							oldTile.connected = false;
							var newTile = this.grid.get(h, my);
							newTile.group = group;
							newTile.connected = true;
						}
						relaxed = true;
						continue;
					}
					
					// Look vertically
					var bottom = y;
					while (true) {
						++bottom;
						var btile = this.grid.get(x, bottom);
						if (btile == null || btile.empty())
							break;
					}
					--bottom;
					var top = y;
					while (true) {
						--top;
						var ttile = this.grid.get(x, top);
						if (ttile == null || ttile.empty())
							break;
					}
					++top;
					
					var leftvalid = true;
					var nleft1 = 0;
					var nleft2 = 0;
					var rightvalid = true;
					var nright1 = 0;
					var nright2 = 0;
					for (var v = top; v <= bottom; ++v) {
						var left = this.grid.get(x - 1, v);
						if (left != null && !left.empty()) {
							++nleft1;
							if (left.group != group)
								leftvalid = false;
						}
						left = this.grid.get(x - 2, v);
						if (left != null && !left.empty())
							++nleft2;
						
						var right = this.grid.get(x + 1, v);
						if (right != null && !right.empty()) {
							++nright1;
							if (right.group != group)
								rightvalid = false;
						}
						right = this.grid.get(x + 2, v);
						if (right != null && !right.empty())
							++nright2;
					}
					
					if ((rightvalid && nleft1 == 0 && nright1 == 2 && nright2 <= 2) || (leftvalid && nright1 == 0 && nleft1 == 2 && nleft2 <= 2)) {
						var mx = (nleft1 == 0 ? x + 1 : x - 1);
						for (var v = top; v <= bottom; ++v) {
							var oldTile = this.grid.get(x, v);
							oldTile.group = -1;
							oldTile.connected = false;
							var newTile = this.grid.get(mx, v);
							newTile.group = group;
							newTile.connected = true;
						}
						relaxed = true;
						continue;
					}
				}
			}
			
			if (!relaxed)
				return this.advance();
			
			break;
		default:
			console.log('Done generating');
			this.success = true;
			return false;
	}
	
	return true;
};

function MazeBuilder(grid, x, y, group) {
	this.grid = grid;
	this.pos = ivec2.fromValues(x, y);
	this.group = group;
	this.moves = [];
	
	this.setGroup(this.group);
	this.setActive(true);
}
MazeBuilder.prototype.setGroup = function(group) {
	this.grid.get(this.pos[0], this.pos[1]).group = group;
};
MazeBuilder.prototype.setActive = function(active) {
	this.grid.get(this.pos[0], this.pos[1]).active = active;
};
MazeBuilder.prototype.move = function(dir) {
	this.setActive(false);
	for (var i = 0; i < 2; ++i) {
		ivec2.add(this.pos, this.pos, Dir.vector[dir]);
		this.setGroup(this.group);
	}
	this.setActive(true);
};
MazeBuilder.prototype.step = function() {
	var options = [];
	for (var d = Dir.begin; d != Dir.end; ++d) {
		var tile = this.grid.get(this.pos[0] + Dir.vector[d][0] * 2, this.pos[1] + Dir.vector[d][1] * 2);
		if (tile != null && tile.empty())
			options.push(d);
	}
	if (options.length == 0) {
		if (this.moves.length == 0) {
			this.setActive(false);
			return false;
		} else {
			this.move(Dir.reverse[this.moves.pop()]);
			return this.step();
		}
	} else {
		var choice = options[Math.floor(Math.random() * options.length)];
		this.move(choice);
		this.moves.push(choice);
	}
	
	return true;
};
