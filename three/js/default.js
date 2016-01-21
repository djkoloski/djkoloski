var
	playercount = 0,
	boardsize = { 'x': 0, 'y': 0 },
	inarow = 0,
	tokens = [],
	turn = 0,
	squaresFilled = 0,
	randomizeOrder = false;

$(document).ready(
	prepareSettings
);

function prepareSettings()
{
	playercount = 0;
	boardsize = { 'x': 0, 'y': 0 };
	inarow = 0;
	tokens = [];
	turn = 0;
	squaresFilled = 0;
	randomizeOrder = false;
	
	$('input#playerbutton').on(
		'click',
		function()
		{
			playercount = $('input#playercount').val();
			boardsize.x = $('input#boardwidth').val();
			boardsize.y = $('input#boardheight').val();
			inarow = $('input#inarow').val();
			randomizeOrder = $('input#randomize').prop('checked');
			tokens = [];
			
			for (var i = 0; i < playercount; ++i)
				tokens.push(
					{ 'pname': 'Player ' + (i + 1), 'token': (i + 1), 'color': 'ffffff' }
				);
			
			$('div#settingsframe').fadeOut(
				'fast',
				preparePlayers
			);
		}
	);
	
	$('div#settingsframe').fadeIn('fast');
}

function preparePlayers()
{
	var players = '<table id="playertokens">';
	
	for (var i = 0; i < playercount; ++i)
	{
		players +=
			'<tr><td>Player ' +
			(i + 1) +
			':<table class="tokenselector form">' +
			'<tr><td>Name:</td><td><input type="text" class="playername" value="' + tokens[i].pname + '" /></td></tr>' +
			'<tr><td>Token:</td><td><input type="text" class="tokenname" value="' + tokens[i].token + '" /></td></tr>' +
			'<tr><td>Color:</td><td><input type="text" class="colorname" value="' + tokens[i].color + '" /></td></tr>' +
			'</table></td></tr>';
	}
	
	players += '</table>';
	
	$('div#playerselectors').html(players);
	
	$('input#startbutton').on(
		'click',
		function()
		{
			tokens = [];
			
			var tokenlist = $('table.tokenselector');
			
			for (var i = 0; i < playercount; ++i)
			{
				tokens.push(
					{
						'pname': $(tokenlist[i]).find('input.playername').val(),
						'token': $(tokenlist[i]).find('input.tokenname').val(),
						'color': $(tokenlist[i]).find('input.colorname').val(),
					}
				);
			}
			
			$('div#playerframe').fadeOut(
				'fast',
				prepareGame
			);
		}
	);
	
	$('div#playerframe').fadeIn('fast');
}

function prepareGame()
{
	startGame();
	
	$('div#gameframe').fadeIn('fast');
}

function shufflePlayers()
{
	var newtokens = [tokens[turn]];
	tokens.splice(turn, 1);
	
	while (tokens.length > 0)
	{
		var index = Math.floor(Math.random() * tokens.length);
		newtokens.push(tokens[index]);
		tokens.splice(index, 1);
	}
	
	tokens = newtokens;
}

function startGame()
{
	if (playercount > 2 && randomizeOrder)
		shufflePlayers();
	
	generateBoard();
	$('div#gameframe').prepend('<h2 id="playerturn"></h2>');
	updatePlayerTurn();
}

function endGame(msg)
{
	$('div#gameframe table#gameboard td.empty').off('click');
	$('div#gameframe').append('<h1>' + msg + '</h1><input type="button" value="Play again" id="playagain" /><input type="button" id="playerbutton" value="Select tokens" /><input type="button" id="configurebutton" value="Configure game" />');
	$('div#gameframe input#playagain').on(
		'click',
		function()
		{
			turn = (turn - squaresFilled % playercount + 2) % playercount;
			startGame();
		}
	);
	$('div#gameframe input#playerbutton').on(
		'click',
		function()
		{
			$('div#gameframe').fadeOut(
				'fast',
				preparePlayers
			);
		}
	);
	$('div#gameframe input#configurebutton').on(
		'click',
		function()
		{
			$('div#gameframe').fadeOut(
				'fast',
				function()
				{
					$('div#settingsframe').fadeIn('fast');
				}
			);
		}
	);
}

function updatePlayerTurn()
{
	$('div#gameframe h2#playerturn').html('<span style="color: #' + tokens[turn].color + '">' + tokens[turn].pname + '</span>\'s turn (<span style="color: #' + tokens[turn].color + '">' + tokens[turn].token + '</span>)');
}

function generateBoard()
{
	var board = '<table id="gameboard">';
	
	for (var i = 0; i < boardsize.y; ++i)
	{
		board += '<tr>'
		for (var j = 0; j < boardsize.x; ++j)
		{
			board += '<td class="empty"><input type="hidden" id="x" value="' + j + '" /><input type="hidden" id="y" value="' + i + '" /></td>';
		}
		board += '</tr>';
	}
	
	board += '</table>';
	
	$('div#gameframe').html(board);
	
	$('div#gameframe table#gameboard td.empty').on(
		'click',
		fillSquare
	);
	
	squaresFilled = 0;
}

function fillSquare()
{
	var
		t = tokens[turn],
		coord = { 'x': parseInt($(this).children('input#x').val()), 'y': parseInt($(this).children('input#y').val()) };
	
	$(this).removeClass('empty').off('click').css({'color': '#' + t.color}).html('<input type="hidden" id="pid" value="' + turn + '" />' + t.token);
	++squaresFilled;
	
	if (checkWin(coord))
		endGame('<span style="color: #' + t.color + '">' + t.pname + '</span> (<span style="color: #' + t.color + '">' + t.token + '</span>) wins!');
	else
	{
		if (squaresFilled < boardsize.x * boardsize.y)
		{
			turn = (turn + 1) % playercount;
			updatePlayerTurn();
		}
		else
			endGame('Cats game!');
	}
}

function checkWin(coord)
{
	// Horiz crawl
	if (
		crawl(
			crawl(
				coord,
				{ 'x': -1, 'y': 0 }
			),
			{ 'x': 1, 'y': 0 }
		).run >= inarow
	)
		return true;
	
	// Vert crawl
	if (
		crawl(
			crawl(
				coord,
				{ 'x': 0, 'y': -1 }
			),
			{ 'x': 0, 'y': 1 }
		).run >= inarow
	)
		return true;
	
	// Diag DL crawl
	if (
		crawl(
			crawl(
				coord,
				{ 'x': 1, 'y': -1 }
			),
			{ 'x': -1, 'y': 1 }
		).run >= inarow
	)
		return true;
	
	// Diag DR crawl
	if (
		crawl(
			crawl(
				coord,
				{ 'x': -1, 'y': -1 }
			),
			{ 'x': 1, 'y': 1 }
		).run >= inarow
	)
		return true;
	
	return false;
}

function crawl(coord, vec)
{
	var
		spaces = $('table#gameboard td'),
		x = coord.x,
		y = coord.y,
		token = $(spaces[y * boardsize.x + x]).find('input#pid').val(),
		run = 0;
	
	while (true)
	{
		var space = $(spaces[y * boardsize.x + x]);
		
		if (space.hasClass('empty') || space.find('input#pid').val() != token)
			return { 'x': x - vec.x, 'y': y - vec.y, 'run': run };
		
		++run;
		
		if (
			(vec.x < 0 && x == 0) ||
			(vec.y < 0 && y == 0) ||
			(vec.x > 0 && x == boardsize.x - 1) ||
			(vec.y > 0 && y == boardsize.y - 1)
		)
			return { 'x': x, 'y': y, 'run': run };
		
		x += vec.x;
		y += vec.y;
	}
	
	return { 'x': 0, 'y': 0 };
}
