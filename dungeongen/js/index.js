var grid;
var generator;
var interval = -1;

window.onload = function() {
	document.getElementById('generate').addEventListener(
		'click',
		function() {
			var width = parseInt(document.getElementById('width').value);
			var height = parseInt(document.getElementById('height').value);
			var rooms = parseInt(document.getElementById('rooms').value);
			var doorChance = parseFloat(document.getElementById('chance').value);
			var speed = parseInt(document.getElementById('speed').value);

			var grid = new Grid(document.getElementById('dungeon'), width, height);

			var generator = new Generator(grid, null, rooms, doorChance);
			if (interval != -1)
				clearInterval(interval);

			interval = setInterval(
				function() {
					if (!generator.step()) {
						if (generator.success) {
							clearInterval(interval);
							interval = -1;
						} else
							generator.reset(null, rooms, doorChance);
					}
					grid.draw();
				},
				speed
			);
		}
	);
};