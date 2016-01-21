var dict = null;

$(function() {
	$('div.container').hide();
	
	$.getJSON(
		'js/dict.json',
		function(data, status, xhr) {
			dict = data;
			$('div.loading').hide();
			$('div.container').show();
		}
	);
	
	$('button#go').on(
		'click',
		function() {
			Undial($('input#phonenumber').val());
		}
	);
});

function Undial(number) {
	var excludeLetters = $('input#excludeLetters').prop('checked');
	
	var spots = [];
	
	for (var i = 0; i < number.length; ++i)
		spots.push([]);
	
	var oneletterwhitelist = 'uirnbd';
	
	for (var i = 0; i < number.length; ++i) {
		for (word in dict) {
			if ((excludeLetters && word.length == 1 && oneletterwhitelist.indexOf(word) == -1) || word.length > number.length - i)
				continue;
			
			var fits = true;
			for (var j = 0; j < word.length && fits; ++j) {
				var n = word[j];
				var m = number[i + j]
				
				if (n != m) {
					switch (word[j]) {
						case 'a':
						case 'b':
						case 'c':
							n = '2';
							break;
						case 'd':
						case 'e':
						case 'f':
							n = '3';
							break;
						case 'g':
						case 'h':
						case 'i':
							n = '4';
							break;
						case 'j':
						case 'k':
						case 'l':
							n = '5';
							break;
						case 'm':
						case 'n':
						case 'o':
							n = '6';
							break;
						case 'p':
						case 'q':
						case 'r':
						case 's':
							n = '7';
							break;
						case 't':
						case 'u':
						case 'b':
							n = '8';
							break;
						case 'w':
						case 'x':
						case 'y':
						case 'z':
							n = '9';
							break;
						default:
							break;
					}
				}
				
				if (n != m)
					fits = false;
			}
			
			if (fits)
				spots[i].push(word);
		}
	}
	
	console.log(spots);
	
	PrintSpots(number, spots);
}

function PrintSpots(number, spots) {
	var results = [];
	
	for (var i = 0; i < number.length; ++i)
		BuildRecursive(number, number.substr(0, i), i, spots, results);
	
	$('div#results').html('<p>' + results.join('</p><p>') + '</p>');
}

function BuildRecursive(number, partial, index, spots, results) {
	if (index >= spots.length)
		results.push(partial);
	else if (spots[index].length == 0)
		BuildRecursive(number, partial + ' ' + number.substr(index, 1), index + 1, spots, results);
	else {
		for (var i = 0; i < spots[index].length; ++i)
			BuildRecursive(number, partial + ' ' + spots[index][i].toUpperCase(), index + spots[index][i].length, spots, results);
	}
}
