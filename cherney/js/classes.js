function Question(question, choices) {
	this.question = question;
	
	this.choices = choices;
	this.choices.shuffle();
	
	this.createBind = function(container, uuid, answerCallback) {
		container.append('<p>' + question + '</p><ol class="selectable" id="' + uuid + '"></ol>');
		var set = container.find('ol#' + uuid);
		for (var i = 0; i < this.choices.length; ++i)
		{
			var id = i + '-' + uuid;
			set.append('<li value="' + i + '">' + this.choices[i].question + '</li>');
		}
		set.find('li').only('click', (function(question, callback) {
			if (question.guess == undefined)
				callback();
			question.guess = parseInt($(this).val());
		}).partial(this, answerCallback));
	};
	this.check = function() {
		return (this.choices[this.guess].value == this.worth);
	};
	this.score = function() {
		return this.choices[this.guess].value;
	};
	
	this.worth = 0;
	for (var i in choices)
		if (choices[i].value > this.worth)
			this.worth = choices[i].value;
	
	this.reset = function() {
		this.guess = undefined;
	};
}

function QuizSettings(tpq, qpr, questionPool) {
	this.timePerQuestion = tpq;
	this.questionsPerRound = qpr;
	this.questionPool = questionPool;
	this.usedQuestionPool = [ ];
	this.pointsPerRound = 10;
	this.getRandomSubset = function() {
		if (this.questionPool.length == 0 && this.usedQuestionPool == 0)
			return [ ];
		
		var
			subset = [ ],
			currentUsedSubset = [ ];
		
		for (var i = 0; i < this.questionsPerRound; ++i)
		{
			if (this.questionPool.length == 0)
			{
				this.questionPool = this.usedQuestionPool;
				this.usedQuestionPool = [ ];
				this.reset();
			}
			
			if (this.questionPool.length == 0)
				return [ ];
			
			var n = Math.floor(Math.random() * this.questionPool.length);
			
			currentUsedSubset.push(this.questionPool[n]);
			subset.push(this.questionPool[n]);
			this.questionPool.splice(n, 1);
		}
		
		this.usedQuestionPool = this.usedQuestionPool.concat(currentUsedSubset);
		
		return subset;
	};
	this.reset = function() {
		for (var i = 0; i < this.questionPool.length; ++i)
			this.questionPool[i].reset();
	};
}

function GameState(board, controls, settings) {
	this.red = {
		score: 0,
		action: 0,
		damage: 0
	};
	this.blue = {
		score: 0,
		action: 0,
		damage: 0
	};
	this.maxDamage = 2;
	this.turn = 'red';
	this.getTurn = function() {
		return this[this.turn];
	};
	this.board = board;
	this.controls = controls;
	this.quizSettings = settings;
	this.currentHandler = undefined;
	this.createHandler = function(unit) {
		var
			tile = this.board.getActiveTile(),
			base = this.board.getUnits('base', this.turn),
			dist = {x: tile.getCoords().x - base.getCoords().x, y: tile.getCoords().y - base.getCoords().y};
		
		if (Math.max(Math.abs(dist.x), Math.abs(dist.y)) != 1)
		{
			alert('You must make units within one tile of your base!');
		}
		else
		{
			if (tile.getUnit() != 'undefined')
				alert('You must make units in an empty tile!');
			else
			{
				tile.set(unit, this.turn);
				tile.setMoved(true);
				this.addPoints(-this.prices[unit]);
				this.controls.exitSelect();
			}
		}
	};
	this.moveHandler = function(fromtile) {
		var
			totile = this.board.getActiveTile(),
			dist = {x: totile.getCoords().x - fromtile.getCoords().x, y: totile.getCoords().y - fromtile.getCoords().y},
			range = 1;
		
		if (fromtile.getUnit() == 'ship' && fromtile.nearby(this.board, 'zephyr'))
		{
			range = 2;
		}
		
		if (dist.x == 0 && dist.y == 0)
		{
			alert('Units must move at least 1 tile!');
			return undefined;
		}
		
		if (Math.max(Math.abs(dist.x), Math.abs(dist.y)) > range)
		{
			alert('That unit can move at most ' + range + ' tile(s)!');
		}
		else
		{
			if (totile.getUnit() != 'undefined')
				alert('You must move units to an empty tile!');
			else
			{
				totile.set(fromtile.getUnit(), fromtile.getSide());
				fromtile.reset();
				totile.setMoved(true);
				this.controls.exitSelect();
			}
		}
	};
	this.attackHandler = function(fromtile) {
		var
			totile = this.board.getActiveTile(),
			dist = {x: totile.getCoords().x - fromtile.getCoords().x, y: totile.getCoords().y - fromtile.getCoords().y},
			range = 1;
		
		if (fromtile.getUnit() == 'serpent')
		{
			if (fromtile.nearby(board, 'crab'))
				range = 2;
		}
		
		if (Math.abs(dist.x) + Math.abs(dist.y) > range)
		{
			alert('You must attack directly to the top, right, bottom, or left!');
		}
		else
		{
			if (totile.getUnit() == 'undefined')
				alert('You must attack a unit!');
			else
			{
				if (totile.getSide() == fromtile.getSide())
					alert('You cannot attack your own unit!');
				else
				{
					if (totile.getUnit() == 'base')
					{
						fromtile.reset();
						this.addPoints(-1);
						this.controls.exitSelect();
						if (this.turn == 'red')
						{
							++this.blue.damage;
							if (this.blue.damage >= this.maxDamage)
								this.endGame('Red');
						}
						else
						{
							++this.red.damage;
							if (this.red.damage >= this.maxDamage)
								this.endGame('Blue');
						}
						return undefined;
					}
					switch (fromtile.getUnit()) {
						case 'ship':
							switch (totile.getUnit()) {
								case 'ship':
									alert('Stalemate! There\'s no point in attacking.');
									break;
								case 'zephyr':
								case 'crab':
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'octopus':
								case 'serpent':
									alert('You\'ll be destroyed if you do!');
									break;
								default:
									break;
							}
							break;
						case 'zephyr':
							switch (totile.getUnit()) {
								case 'zephyr':
									alert('Stalemate! There\'s no point in attacking.');
									break;
								case 'octopus':
								case 'serpent':
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'ship':
								case 'crab':
									alert('You\'ll be destroyed if you do!');
									break;
								default:
									break;
							}
							break;
						case 'octopus':
							switch (totile.getUnit()) {
								case 'octopus':
									alert('Stalemate! There\'s no point in attacking.');
									break;
								case 'ship':
								case 'crab':
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'serpent':
								case 'zephyr':
									alert('You\'ll be destroyed if you do!');
									break;
								default:
									break;
							}
							break;
						case 'crab':
							switch (totile.getUnit()) {
								case 'crab':
									alert('Stalemate! There\'s no point in attacking.');
									break;
								case 'serpent':
								case 'zephyr':
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'ship':
								case 'octopus':
									alert('You\'ll be destroyed if you do!');
									break;
								default:
									break;
							}
							break;
						case 'serpent':
							switch (totile.getUnit()) {
								case 'serpent':
									alert('Stalemate! There\'s no point in attacking.');
									break;
								case 'ship':
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'octopus':
									if (totile.nearby(this.board, 'ship'))
									{
										alert('That octopus has protection from a nearby ship!');
										break;
									}
									totile.reset();
									this.addPoints(-1);
									this.controls.exitSelect();
									break;
								case 'zephyr':
								case 'crab':
									alert('You\'ll be destroyed if you do!');
									break;
								default:
									break;
							}
							break;
						default:
							break;
					}
				}
			}
		}
	};
	this.handler = function(cmd) {
		switch (cmd) {
			case 'create':
				if (this.getTurn().action < this.prices.least)
					alert('You need at least ' + this.prices.least + ' points to build.');
				else
				{
					this.selectUnit();
					this.controls.enterSelect();
				}
				break;
			case 'move':
				if (this.board.getActiveTile().getSide() != this.turn)
				{
					alert('You can only move your own units!');
					break;
				}
				if (this.board.getActiveTile().getUnit() == 'undefined')
				{
					alert('No unit is selected!');
					break;
				}
				if (this.board.getActiveTile().getUnit() == 'base')
				{
					alert('Bases cannot move!');
					break;
				}
				if (this.board.getActiveTile().getMoved())
				{
					alert('The selected unit has already moved!');
					break;
				}
				this.currentHandler = this.moveHandler.partial(this.board.getActiveTile());
				this.controls.enterSelect();
				break;
			case 'attack':
				if (this.board.getActiveTile().getSide() != this.turn)
				{
					alert('You can only attack with your own units!');
					break;
				}
				if (this.board.getActiveTile().getUnit() == 'undefined')
				{
					alert('No unit is selected!');
					break;
				}
				if (this.board.getActiveTile().getUnit() == 'base')
				{
					alert('Bases cannot attack unless provoked!');
					break;
				}
				if (this.getTurn().action < 1)
				{
					alert('You need at least one point to attack.');
					break;
				}
				this.currentHandler = this.attackHandler.partial(this.board.getActiveTile());
				this.controls.enterSelect();
				break;
			case 'finish':
				this.currentHandler = undefined;
				this.controls.exitSelect();
				this.endTurn();
				break;
			case 'target':
				this.currentHandler();
				break;
			case 'cancel':
				this.currentHandler = undefined;
				this.controls.exitSelect();
				break;
			default:
				break;
		}
	};
	this.quiz = function() {
		beginQuiz(this);
	};
	this.beginTurn = function() {
		this.updateStats();
		for (i in this.prices)
			this.board.getUnits(i, this.turn).setMoved(false);
		this.red.damage = 0;
		this.blue.damage = 0;
		this.quiz();
	};
	this.endTurn = function() {
		switch (this.turn) {
			case 'red':
				this.turn = 'blue';
				break;
			case 'blue':
				this.turn = 'red';
				break;
			default:
				break;
		}
		this.beginTurn();
	};
	this.endGame = function(winner) {
		alert(winner + ' wins!');
		location.reload();
	};
	this.addPoints = function(points) {
		this.getTurn().action += points;
		this.updateStats();
	};
	
	this.selectUnit = function() {
		var dialog = $('#unit-dialog');
		
		dialog.find('td').only('click', (function(state) {
			state.currentHandler = state.createHandler.partial($(this).attr('value'));
			$('#unit-dialog').dialog('close');
		}).partial(this));
		
		dialog.find('td').show();
		
		if (this.getTurn().action < this.prices.ship)
			dialog.find('td#unit-ship').hide();
		
		if (this.getTurn().action < this.prices.serpent)
			dialog.find('td#unit-serpent').hide();
		
		if (this.getTurn().action < this.prices.zephyr)
			dialog.find('td#unit-zephyr').hide();
		
		if (this.getTurn().action < this.prices.octopus)
			dialog.find('td#unit-octopus').hide();
		
		if (this.getTurn().action < this.prices.crab)
			dialog.find('td#unit-crab').hide();
		
		dialog.dialog('open');
	};
	this.updateStats = function() {
		$('#stats').html('<h2 style="color: ' + (this.turn == 'red' ? '#f00' : '#00f') + '">' + (this.turn == 'red' ? 'Red' : 'Blue') + '\'s Turn</h3><p>' + this.getTurn().action + ' points</p>');
	};
	
	this.controls.setCallback(this.handler.bind(this));
	
	this.prices = {
		least: 3,
		ship: 3,
		serpent: 6,
		zephyr: 6,
		octopus: 8,
		crab: 8
	};
	for (i in this.prices)
	{
		$('td#unit-' + i + '-price').text(this.prices[i] + ' points');
	}
}

function GameControls() {
	this.callback = undefined;
	this.ref = undefined;
	this.bind = function(container) {
		container.empty();
		var buttons = $('<table class="gamecontrols" />');
		
		function appendButton(control, id) {
			var
				row = $('<tr />'),
				button = $('<td id="gamecontrols-' + id + '" value="' + id + '" />');
			button.only('click', (function(control) {
				control.callback($(this).attr('value'));
			}).partial(control));
			row.append(button);
			buttons.append(row);
		};
		
		appendButton(this, 'create');
		appendButton(this, 'move');
		appendButton(this, 'attack');
		appendButton(this, 'finish');
		appendButton(this, 'target');
		appendButton(this, 'cancel');
		
		this.ref = buttons;
		container.append(this.ref);
		
		this.exitSelect();
	};
	this.enterSelect = function() {
		function hide(control, name) {
			control.ref.find('#gamecontrols-' + name).hide();
		}
		function show(control, name) {
			control.ref.find('#gamecontrols-' + name).show();
		}
		hide(this, 'create');
		hide(this, 'move');
		hide(this, 'attack');
		hide(this, 'finish');
		show(this, 'target');
		show(this, 'cancel');
	};
	this.exitSelect = function() {
		function hide(control, name) {
			control.ref.find('#gamecontrols-' + name).hide();
		}
		function show(control, name) {
			control.ref.find('#gamecontrols-' + name).show();
		}
		show(this, 'create');
		show(this, 'move');
		show(this, 'attack');
		show(this, 'finish');
		hide(this, 'target');
		hide(this, 'cancel');
	};
	this.setCallback = function(cb) {
		this.callback = cb;
	};
}

function GameBoard() {
	this.width = 7;
	this.height = 7;
	this.callback = undefined;
	this.ref = undefined;
	this.bind = function(container) {
		container.empty();
		var table = $('<table class="gametable" />');
		for (var i = 0; i < this.height; ++i) {
			var row = $('<tr />');
			for (var j = 0; j < this.width; ++j) {
				row.append('<td class="gamecell" data-x="' + j + '" data-y="' + i + '" data-unit="undefined" data-moved="undefined" data-side="undefined"></td>');
			}
			table.append(row);
		}
		table.find('td.gamecell').only('click', function() {
			var cell = $(this);
			cell.parent().parent().find('td.gamecell.selected').removeClass('selected');
			cell.addClass('selected');
		});
		this.ref = table;
		container.append(this.ref);
		
		var redbase = this.getTile(0, Math.floor(this.height / 2));
		redbase.set('base', 'red');
		redbase.setMoved(true);
		var bluebase = this.getTile(this.width - 1, Math.floor(this.height / 2));
		bluebase.set('base', 'blue');
		bluebase.setMoved(true);
	};
	this.getTile = function(x, y) {
		return new Unit(this.ref.find('td[data-x=' + x + '][data-y=' + y + ']'));
	};
	this.getUnits = function(unit, side) {
		return new Unit(this.ref.find('td[data-unit=' + unit + '][data-side=' + side + ']'));
	};
	this.getActiveTile = function() {
		return new Unit(this.ref.find('td.selected'));
	};
}

function Unit(source) {
	this.src = source;
	this.getSide = function() {
		return this.src.attr('data-side');
	};
	this.setSide = function(side) {
		this.src.attr('data-side', side);
	};
	this.getUnit = function() {
		return this.src.attr('data-unit');
	};
	this.setUnit = function(unit) {
		this.src.attr('data-unit', unit);
	};
	this.getCoords = function() {
		return {x: parseInt(this.src.attr('data-x')), y: parseInt(this.src.attr('data-y'))};
	};
	this.getMoved = function() {
		return (this.src.attr('data-moved') == 'true');
	};
	this.setMoved = function(moved) {
		this.src.attr('data-moved', (moved ? 'true' : 'false'));
	};
	this.set = function(unit, side) {
		this.setUnit(unit);
		this.setSide(side);
	};
	this.reset = function() {
		this.setUnit('undefined');
		this.setSide('undefined');
		this.src.attr('data-moved', 'undefined');
	};
	this.nearby = function(board, unit) {
		for (var i = -1; i < 2; ++i) {
			for (var j = -1; j < 2; ++j) {
				var
					x = this.getCoords().x + i,
					y = this.getCoords().y + j;
				
				if (x < 0 || x >= board.width || y < 0 || y >= board.height)
					continue;
				
				var target = board.getTile(x, y);
				
				if (target.getUnit() == unit && target.getSide() == this.getSide())
					return true;
			}
		}
		
		return false;
	};
}
