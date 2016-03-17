function WriteNavigation() {
	document.write('<div id="navigation">');
	var pathname = window.location.pathname;
	if (pathname.substr(pathname.length - 1) == '/')
		pathname = pathname.substr(0, pathname.length - 1);

	for (var i = 0; i < navigation.length; ++i) {
		var navClass = 'nav' + (navigation[i].extra ? ' extra' : '') + (pathname == navigation[i].url ? ' active' : '');
		document.write('<a href="' + navigation[i].url + '" class="' + navClass + '">');
		document.write('<span>' + navigation[i].title + '</span>');
		document.write('</a>');
	}

	document.write('</div>');

	document.write('<div id="navigation-foldout">');
	document.write('<span class="dots"></span>');
	document.write('<ul id="navigation-foldout-list">');

	for (var i = 0; i < navigation.length; ++i) {
		if (!navigation[i].extra)
			continue;

		document.write('<li>');
		document.write('<a class="foldout-nav" href="' + navigation[i].url + '">');
		document.write('<span>' + navigation[i].title + '</span>');
		document.write('</a>');
		document.write('</li>');
	}

	document.write('</ul>');
	document.write('</div>');
}

function WriteShowcase(projectNames) {
	var years = [];

	for (var i = 0; i < projectNames.length; ++i) {
		var project = projects[projectNames[i]];

		if (years.indexOf(project.year) == -1)
			years.push(project.year);
	}

	years.sort();
	years.reverse();

	var currentYear = (new Date()).getFullYear();

	for (var i = 0; i < years.length; ++i) {
		var isCurrent = (years[i] >= currentYear - 1);
		var isOld = (years[i] == -1);

		var className = 'date-range' + (isCurrent ? ' current' : '') + (isOld ? ' old' : '');
		var title = (!isOld ? years[i] : 'Time Immemorial');

		document.write('<div class="' + className + '">');
		document.write('<div class="tag">' + title + '</div>');

		for (var j = 0; j < projectNames.length; ++j) {
			var project = projects[projectNames[j]];

			if (project.year != years[i])
				continue;

			WriteShowcaseEntry(project);
		}

		document.write('</div>');
	}
}

function WriteShowcaseEntry(project) {
	document.write('<div class="showcase-entry">');
	document.write('<a href="' + project.url + '">');
	document.write('<div class="title">' + project.title + '</div>');
	document.write('<img class="thumbnail" alt="' + project.title + '" src="' + project.thumbnail + '" />');
	document.write('</a>');
	document.write('<div class="desc">' + project.description + '</div>');
	document.write('</div>');
}

function ToggleActive() {
	if (this.className.indexOf('active') == -1)
		this.className = this.className + ' active';
	else
		this.className = this.className.replace('active', '').replace('  ', ' ');
}

function Initialize() {
	document.getElementById('navigation-foldout').onclick = ToggleActive;
}

window.onload = Initialize;

var navigation = [
	{
		"title": "About",
		"url": "/about",
		"extra": false
	},
	{
		"title": "Blog",
		"url": "/blog",
		"extra": true
	},
	{
		"title": "Games",
		"url": "/games",
		"extra": true
	},
	{
		"title": "Resume",
		"url": "/resume",
		"extra": false
	},
	{
		"title": "Portfolio",
		"url": "/portfolio",
		"extra": false
	},
];

var projects = {
	"anima": {
		"title": "Anima",
		"year": 2016,
		"url": "/anima",
		"thumbnail": "/img/showcase/anima.png",
		"description": "A parody of minimalist puzzle games created solo in 24 hours. <a href=\"/projects/anima.zip\">Standalone executable here</a>",
	},
	"guitarherolive": {
		"title": "Guitar Hero Live",
		"year": 2015,
		"url": "https://www.guitarhero.com",
		"thumbnail": "/img/showcase/ghlive.png",
		"description":
			"I programmed for Guitar Hero Live at Vicarious Visions in association with FreeStyleGames" +
			"<div class=\"note\">" +
				"<div>Look for my name in the credits!</div>" +
				"<div>(especially on the iOS port)</div>" +
			"</div>"
	},
	"justthreewords": {
		"title": "Just Three Words",
		"year": 2015,
		"url": "/projects/justthreewords.zip",
		"thumbnail": "/img/showcase/justthreewords.png",
		"description":
			"An action platformer made in three weeks that tells the tale of a young psychic house-sitter who forgets to do something..." +
			"<div class=\"note\">" +
				"Space to advance through cutscenes. WASD to move, 'e' to pick up, shift to charge and throw, 'f' to dash" +
			"</div>"
	},
	"ers": {
		"title": "ERS: Eternal Revenue Services",
		"year": 2015,
		"url": "https://drive.google.com/file/d/0B7QSWewlK9cPcVBSWWxTSzFGaHc/view?usp=sharing",
		"thumbnail": "/img/showcase/ers.png",
		"description":
			"A surrealist puzzle-platformer made in three weeks where anything can happen" +
			"<div class=\"note\">" +
				"Use WASD/space to move/jump, interact with 'e'" +
			"</div>"
	},
	"omania": {
		"title": "OMania",
		"year": 2015,
		"url": "/omania",
		"thumbnail": "/img/showcase/omania.png",
		"description":
			"A fast-paced game where changing the formations of your soldiers means the difference between survival and destruction" +
			"<div class=\"note\">" +
				"Use the arrow keys to enter different formations" +
			"</div>"
	},
	"transfer": {
		"title": "Transfer",
		"year": 2015,
		"url": "/transfer",
		"thumbnail": "/img/showcase/transfer.png",
		"description":
			"A puzzle-platformer revolving around the ability to swap the properties of objects" +
			"<div class=\"note\">" +
				"Move and jump with WASD and space, right click to begin swap then click to swap with an object. <a href=\"/projects/transfer.zip\">Standalone executable here</a>" +
			"</div>"
	},
	"thumbsup": {
		"title": "ThumbsUp",
		"year": 2015,
		"url": "https://djkoloski.github.io/thumbsup",
		"thumbnail": "/img/showcase/thumbsup.png",
		"description": "A tool for turning letters and words into bitmap graphics composed entirely of thumbs-up's in Facebook Messenger"
	},
	"chemistry-solvers": {
		"title": "Chemistry Solvers",
		"year": 2015,
		"url": "/chemistry-solvers",
		"thumbnail": "/img/showcase/chemistry-solvers.png",
		"description": "A few simple solvers for chemistry-related maths"
	},
	"game-ai": {
		"title": "Game AI",
		"year": 2015,
		"url": "/game-ai",
		"thumbnail": "/img/showcase/game-ai.png",
		"description": "A collection of projects done for RPI's Game AI course"
	},
	"youtubejs": {
		"title": "YouTubeJS",
		"year": 2015,
		"url": "https://github.com/djkoloski/youtubejs",
		"thumbnail": "/img/showcase-placeholder.png",
		"description": "A dead simple full-screen YouTube video JavaScript API"
	},
	"2d-dungeon-gen": {
		"title": "2D Dungeon Generation",
		"year": 2015,
		"url": "/2d-dungeon-gen",
		"thumbnail": "/img/showcase/2d-dungeon-gen.png",
		"description": "Animated 2D backwards dungeon generation on a tile-based grid"
	},
	"voxel-remeshing": {
		"title": "3D Voxel Remeshing",
		"year": 2015,
		"url": "/voxel-remeshing",
		"thumbnail": "/img/showcase/voxel-remeshing.png",
		"description": "Approximating source voxel data from quantized input using 3D box blurs"
	},
	"jam_02": {
		"title": "JAM_02",
		"year": 2015,
		"url": "/projects/jam_02.zip",
		"thumbnail": "/img/showcase/jam_02.png",
		"description":
			"A two-player color-changing twin-stick bullet hell made in three hours" +
			"<div class=\"note\">" +
				"Requires two game controllers to play. Use left analog stick to move, right to aim, R2 to shoot, and L1/L2 to change colors" +
			"</div>"
	},
	"pokescrape": {
		"title": "Pok&eacute;scrape",
		"year": 2014,
		"url": "https://github.com/djkoloski/pokescrape",
		"thumbnail": "/img/showcase-placeholder.png",
		"description": "A Pok&eacute;dex builder that scrapes information directly from Serebii"
	},
	"crawler": {
		"title": "CRAWLER",
		"year": 2014,
		"url": "/crawler",
		"thumbnail": "/img/showcase/crawler.png",
		"description":
			"A web-based text-only dungeon crawler written in 24 hours" +
			"<div class=\"note\">" +
				"Use the arrow keys to move, space to fight, and 'e' to climb down hatches" +
			"</div>"
	},
	"pb": {
		"title": "Pb: Lead",
		"year": 2014,
		"url": "https://github.com/djkoloski/pb",
		"thumbnail": "/img/showcase/pb-lead.png",
		"description": "An open-source toolkit that aims to simplify, standardize, and streamline using C# with the Unity game engine"
	},
	"aim-rubiks": {
		"title": "AIM: Rubiks Cubes",
		"year": 2014,
		"url": "/projects/aim-rubiks.zip",
		"thumbnail": "/img/showcase/aim-rubiks.png",
		"description":
			"Some cool 3D effects using Rubiks cubes" +
			"<div class=\"note\">" +
				"<a href=\"https://processing.org/\">Processing</a> is required to run" +
			"</div>"
	},
	"aim-buzzfeed": {
		"title": "AIM: Poopface",
		"year": 2014,
		"url": "/projects/aim-buzzfeed.zip",
		"thumbnail": "/img/showcase/aim-poopface.png",
		"description":
			"A Buzzfeed simulator, complete with fake Facebook interface" +
			"<div class=\"note\">" +
				"<a href=\"https://processing.org/\">Processing</a> is required to run" +
			"</div>"
	},
	"spacewasp": {
		"title": "SpaceWasp",
		"year": 2014,
		"url": "/projects/spacewasp.zip",
		"thumbnail": "/img/showcase/spacewasp.png",
		"description":
			"A two-player twin-stick shooter where you control your position and your opponent's gun" +
			"<div class=\"note\">" +
				"Requires two game controllers to play. Use left analog stick to move, right to aim and shoot, R1 to use powerup" +
			"</div>"
	},
	"wow": {
		"title": "WOW",
		"year": 2013,
		"url": "/wow",
		"thumbnail": "/img/showcase/wow.png",
		"description":
			"The original homepage" +
			"<div class=\"note\">" +
				"Photosensitivity warning!" +
			"</div>"
	},
	"starminer": {
		"title": "STARMINER",
		"year": 2013,
		"url": "/projects/starminer.zip",
		"thumbnail": "/img/showcase/starminer.png",
		"description":
			"A space shooter with a twist and a turn" +
			"<div class=\"note\">" +
				"Unzip and run <pre>python main.py</pre> Use the arrow keys to move and space to shoot. Requires <a href=\"http://pygame.org\">pygame</a>." +
			"</div>"
	},
	"royal-game-of-ur": {
		"title": "Ur",
		"year": 2013,
		"url": "/royal-game-of-ur",
		"thumbnail": "/img/showcase/ur.png",
		"description":
			"A reimagining of the Royal Game of Ur" +
			"<div class=\"note\">" +
				"Click the tiles to claim them, then click the board to roll. When a tile is rolled, the owner of the majority of those tiles gets all of them. Ties go to the roller, claim most of the tiles to win!" +
			"</div>"
	},
	"box": {
		"title": "BOX",
		"year": 2013,
		"url": "/projects/box.zip",
		"thumbnail": "/img/showcase/box.png",
		"description":
			"A game where you play as a box and make yourself out of various materials to solve puzzles made in 24 hours" +
			"<div class=\"note\">" +
				"Arrow keys to move, press down over cardboard or jelly to make yourself out of it. Cardboard burns in fire and jelly breaks after a long fall." +
			"</div>"
	},
	"cherney": {
		"title": "Cherney",
		"year": -1,
		"url": "/cherney",
		"thumbnail": "/img/showcase/cherney.png",
		"description":
			"Trivia review game turned tactical turn-based combat" +
			"<div class=\"note\">" +
				"Questions are specified in an XML format. <a href=\"/cherney/romeojuliet.xml\">These</a> are sample literature questions using Romeo and Juliet, refer to <a href=\"/cherney/README.txt\">the rules</a> for how to play." +
			"</div>"
	},
	"three": {
		"title": "Three",
		"year": -1,
		"url": "/three",
		"thumbnail": "/img/showcase/three.png",
		"description": "Tic-tac-toe taken to a whole new level"
	},
	"aotd2": {
		"title": "AOTD2",
		"year": -1,
		"url": "/projects/AOTD2.zip",
		"thumbnail": "/img/showcase/aotd2.png",
		"description": "A 2D game inspired by <a href=\"http://onemanleft.com/games/tilttolive/\">Tilt to Live</a> and written in C++ using OpenGL"
	},
	"apex": {
		"title": "APEX",
		"year": -1,
		"url": "/projects/APEX.zip",
		"thumbnail": "/img/showcase/APEX.png",
		"description": "A 2.5D platformer written in C++ using OpenGL. One of my first adventures into game development!"
	}
};
