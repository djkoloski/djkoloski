function registerClick(state, tile)
{
	if (tile.attr('data-tile') == 'none')
		return;
	
	switch (state.clickMode)
	{
		case 'select_black':
		case 'select_white':
			if (tile.attr('data-marker') != 'none')
			{
				alert('That tile is already claimed!');
			}
			else
			{
				if (state.clickMode == 'select_black')
				{
					tile.attr('data-marker', 'black');
					state.clickMode = 'select_white';
					state.notify.text('White to place');
				}
				else
				{
					tile.attr('data-marker', 'white');
					state.clickMode = 'select_black';
					state.notify.text('Black to place');
				}
				
				--state.tilesToClaim;
				
				if (state.tilesToClaim == 0)
				{
					if (state.clickMode == 'select_black')
					{
						state.clickMode = 'white_roll';
						state.notify.text('White\'s roll');
					}
					else
					{
						state.clickMode = 'black_roll';
						state.notify.text('Black\'s roll');
					}
				}
			}
			break;
		case 'black_roll':
		case 'white_roll':
			var
				roll = Math.floor(Math.random() * 6),
				names = ['rosette', 'eye', 'die', 'fate', 'isle', 'star'];
			
			alert((state.clickMode == 'black_roll' ? 'Black' : 'White') + ' rolled ' + names[roll] + 's!');
			
			state.flip(names[roll]);
			
			if (state.tiles.filter('[data-marker="black"]').length >= 15)
			{
				alert('Black Wins!');
				state.clickMode = 'gameover';
				state.notify.text('Black wins!');
				return;
			}
			
			if (state.tiles.filter('[data-marker="white"]').length >= 15)
			{
				alert('White Wins!');
				state.clickMode = 'gameover';
				state.notify.text('White wins!');
				return;
			}
			
			if (state.clickMode == 'black_roll')
			{
				state.clickMode = 'black_swap';
				state.notify.text('Black\'s swap');
			}
			else
			{
				state.clickMode = 'white_swap';
				state.notify.text('White\'s swap');
			}
			
			break;
		case 'black_swap':
		case 'white_swap':
			if (state.swap1)
			{
				state.swap2 = tile;
				
				if (state.swap1.attr('data-marker') == state.swap2.attr('data-marker'))
				{
					alert("You must choose a markers of different colors!");
					state.swap1.removeClass('selected');
					state.swap1 = undefined;
					state.swap2 = undefined;
					break;
				}
				
				if (Math.abs(parseInt(state.swap1.attr('data-x')) - parseInt(state.swap2.attr('data-x'))) + Math.abs(parseInt(state.swap1.attr('data-y')) - parseInt(state.swap2.attr('data-y'))) != 1)
				{
					alert("You must swap markers next to each other!");
					state.swap1.removeClass('selected');
					state.swap1 = undefined;
					state.swap2 = undefined;
				}
				
				state.swap1.removeClass('selected');
				state.swap();
				
				if (state.clickMode == 'black_swap')
				{
					state.clickMode = 'white_roll';
					state.notify.text('White\'s roll');
				}
				else
				{
					state.clickMode = 'black_roll';
					state.notify.text('Black\'s roll');
				}
				
				state.swap1 = undefined;
				state.swap2 = undefined;
			}
			else
			{
				state.swap1 = tile;
				tile.addClass('selected');
			}
			
			break;
		default:
			break;
	}
}

function gameState(boardElement, notifyElement)
{
	this.board = boardElement;
	this.notify = notifyElement;
	this.tiles = this.board.find('td');
	
	var callback = registerClick.bind(undefined, this);
	
	var
		curx = 0,
		cury = 0;
	
	this.tiles.each(
		function()
		{
			$(this).on('click', callback.bind(undefined, $(this)));
			$(this).attr('data-marker', 'none');
			
			if (curx == 8)
			{
				curx = 0;
				++cury;
			}
			
			$(this).attr('data-x', curx);
			$(this).attr('data-y', cury);
			
			++curx;
		}
	);
	
	this.flip =
		function(name)
		{
			var targets = this.tiles.filter('[data-tile="' + name + '"]');
			
			var blacks = 0;
			
			targets.each(
				function()
				{
					if ($(this).attr('data-marker') == 'black')
						++blacks;
				}
			);
			
			switch (targets.length)
			{
				case 1:
					var
						newtarget,
						flag = true;
					
					while (flag)
					{
						newtarget = window.prompt((blacks > 0 ? "Black" : "White") + ": What would you like instead?");
						
						switch (newtarget)
						{
							case 'rosette':
							case 'eye':
							case 'die':
							case 'isle':
							case 'star':
							case 'fate':
								flag = false;
								break;
						}
						
						if (flag)
							alert('You must enter a valid tile!');
					}
					
					var tempturn = this.clickMode;
					this.clickMode = (blacks > 0 ? 'black_roll' : 'white_roll');
					this.flip(newtarget);
					this.clickMode = tempturn;
					break;
				case 2:
					if (blacks == 1)
					{
						if (this.clickMode == 'black_roll')
							targets.each(function() { $(this).attr('data-marker', 'black');});
						else
							targets.each(function() { $(this).attr('data-marker', 'white');});
					}
					
					break;
				case 5:
					if (blacks >= 3)
						targets.each(function() { $(this).attr('data-marker', 'black');});
					else
						targets.each(function() { $(this).attr('data-marker', 'white');});
					
					break;
				default:
					alert(targets.length);
					break;
			}
		};
	
	this.tilesToClaim = 20;
	
	this.swap1 = undefined;
	this.swap2 = undefined;
	
	this.swap =
		function()
		{
			var marker = this.swap1.attr('data-marker');
			this.swap1.attr('data-marker', this.swap2.attr('data-marker'));
			this.swap2.attr('data-marker', marker);
		};
	
	if (Math.random() > 0.5)
	{
		this.clickMode = 'select_black';
		
		this.notify.text('Black to place');
	}
	else
	{
		this.clickMode = 'select_white';
		
		this.notify.text('White to place');
	}
}

function initBoard()
{
	var state = new gameState($('table#board'), $('div#notify'));
}

$(document).ready(
	function()
	{
		initBoard();
	}
);
