// Should be in the range of [0,|PEOPLE|!)
var per = 100414;
var PEOPLE = [
	'Andrew',
	'Catherine',
	'David',
	'Ian',
	'Kyle',
	'Leah',
	'Mary',
	'Taylor E',
	'Taylor M'
];

function factorial(n) {
	if (n == 0)
		return 1;
	return n * factorial(n - 1);
}

function GetTarget(name) {
	var source = PEOPLE.slice();
	var array = [];
	for (var i = 0; i < PEOPLE.length; ++i) {
		pos = Math.floor(per % factorial(PEOPLE.length - i) / factorial(PEOPLE.length - i - 1));
		array.push(source[pos]);
		source.splice(pos, 1);
	}
	
	var you = array.indexOf(name);
	return array[(you + 1) % array.length];
}

function GiveSS() {
	var name = document.getElementById('name').value;
	if (confirm('Are you sure you\'re ' + name + '?'))
		alert(name + ' is giving to ' + GetTarget(name) + '. Don\'t tell anyone!');
}
