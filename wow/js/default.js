function Theme(
	fonts,
	backgrounds,
	phrases,
	colors,
	phrase_update,
	phrase_change,
	background_update,
	background_change
	)
{
	this.fonts = fonts;
	this.backgrounds = backgrounds;
	this.phrases = phrases;
	this.colors = colors;
	this.phrase_update = phrase_update;
	this.phrase_change = phrase_change;
	this.background_update = background_update;
	this.background_change = background_change;
	
	this.intervals = [];
}

Theme.prototype.set = function()
{
	var
		up = updatePhrases.bind(undefined, this),
		cp = changePhrases.bind(undefined, this),
		ub = updateBackground.bind(undefined, this),
		cb = changeBackground.bind(undefined, this);
	
	up();
	cp();
	ub();
	cb();
	
	this.intervals.push(setInterval(up, this.phrase_update));
	this.intervals.push(setInterval(cp, this.phrase_change));
	this.intervals.push(setInterval(ub, this.background_update));
	this.intervals.push(setInterval(cb, this.background_change));
};

Theme.prototype.unset = function()
{
	for (var i = 0; i < this.intervals.length; ++i)
		clearInterval(this.intervals[i]);
}

function rotateProperty(obj, prop, set)
{
	var current = set.indexOf(obj.attr(prop));
	
	if (current == -1)
		current = Math.floor(Math.random() * set.length);
	
	var next = set[(current + 1) % set.length];
	
	obj.attr(prop, next);
	
	return next;
}

function randomizeProperty(obj, prop, set)
{
	var current = set.indexOf(obj.attr(prop));
	
	if (current == -1)
		current = Math.floor(Math.random() * set.length);
	
	var
		offset = Math.floor(Math.random() * (set.length - 1)) + 1,
		next = set[(current + offset) % set.length];
	
	obj.attr(prop, next);
	return next;
}

function rangeRandom(range, base)
{
	return base + Math.floor(Math.random() * range) - range / 2.0;
}

function randomizeBackgroundPosition(obj, range, base)
{
	obj.css({
		'background-position': rangeRandom(range, base) + '% ' + rangeRandom(range, base) + '%'
	});
}

function randomizePosition(obj, range, base)
{
	obj.css({
		'left': rangeRandom(range, base) + '%',
		'top': rangeRandom(range, base) + '%'
	});
}

function randomizeFontSize(obj, range, base)
{
	obj.css({
		'font-size': rangeRandom(range, base)
	});
}

function randomizeColor(obj, colors)
{
	if (colors == undefined)
	{
		obj.css({
			'color': 'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)'
		});
	}
	else
	{
		obj.css({
			'color': randomizeProperty(obj, 'data-color', colors)
		});
	}
}

function updatePhrases(theme)
{
	$('.phrase').each(
		function()
		{
			$(this).css({
				'font-family': randomizeProperty($(this), 'data-font', theme.fonts)
			});
			randomizeColor($(this), theme.colors);
		}
	);
}

function changePhrases(theme)
{
	$('.phrase').each(
		function()
		{
			$(this).text(randomizeProperty($(this), 'data-phrase', theme.phrases));
			randomizePosition($(this), 80, 40);
			randomizeFontSize($(this), 80, 120);
		}
	);
}

function updateBackground(theme)
{
	randomizeBackgroundPosition($('body'), 5.0, 50);
}

function changeBackground(theme)
{
	$('body').css({
		'background-image': 'url(\'' + rotateProperty($('body'), 'data-background', theme.backgrounds) + '\')'
	});
}

function spawnPhrases(count)
{
	for (var i = 0; i < count; ++i)
		$('body').append('<div class="phrase"></div>');
}

function selectMode(mode)
{
	switch (mode)
	{
		case 'shirley':
			return new Theme(
				['Times New Roman'],
				['img/jackson1.png', 'img/jackson2.png', 'img/jackson3.png', 'img/jackson4.png'],
				['adequate', 'such college', 'very ivy', 'presedent', 'weather', 'much tuition', 'visionary', 'class', '1984'],
				['#FF0000', '#FFFFFF'],
				100,
				300,
				50,
				250
			);
			break;
		case 'pokemon':
			return new Theme(
				['Pokemon'],
				['img/pokemon_1.png', 'img/pokemon_2.png'],
				['HYPE TRAIN', 'OMEGA RUBY', 'ALPHA SAPPHIRE', 'GEN III REMAKES', 'REGI', '3DS', 'NOVEMBER', 'CHILDHOOD', 'HOENN CONFIRMED', 'RAYQUAZA', 'DEOXYS', 'LATIOS', 'LATIAS', 'KYOGRE', 'GROUDON', 'HALF-LIFE 3 CONFIRMED'],
				undefined,
				100,
				500,
				50,
				500
			);
		case 'pokemon7':
			return new Theme(
				['Pokemon'],
				['img/pokemonmoon.png', 'img/pokemonsun.png'],
				['HYPE TRAIN', 'MOON', 'SUN', 'GEN I', 'GEN 7', 'HOLIDAY SEASON', 'NEW POKEMON', 'ZYGARDE', '9 LANGUAGES', 'MEGA SOLROCK', 'MEGA LUNATONE', 'ITALY', 'SPAIN', '2016', 'GEN 6.5', 'POKEBANK', '3DS', 'CHILDHOOD', 'HALF-LIFE 3 CONFIRMED'],
				undefined,
				100,
				500,
				50,
				500
			);
		case 'doge':
		default:
			return new Theme(
				['Comic Sans', 'Papyrus', 'Brush Script', 'Arial', 'Times New Roman', 'Joker'],
				['img/doge.png', 'img/doge2.png'],
				['wow', 'such web', 'very page', 'plz', 'omg', 'much good', 'indy levl=100', 'amaze', 'do want'],
				undefined,
				100,
				500,
				50,
				500
			);
			break;
	}
}

var current_theme = undefined;
function changeTheme(name)
{
	if (current_theme != undefined)
		current_theme.unset();
	
	current_theme = selectMode(name);
	
	current_theme.set();
}

function start()
{
	spawnPhrases(18);
	
	changeTheme('pokemon7');
}

$(document).ready(
	function()
	{
		$('input#startbutton').on(
			'click',
			function()
			{
				$('div.overlay').hide();
				$('select#theme').show();
				start();
			}
		);
	}
);
