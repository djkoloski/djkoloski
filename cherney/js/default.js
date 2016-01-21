function ContentParser() {
	this.parsers = [ ];
	this.addParser = function(parser) {
		this.parsers.push(parser);
	};
	this.prepare = function(content) {
		for (var i = 0; i < this.parsers.length; ++i) {
			this.parsers[i](content);
		}
	};
	this.loadList = [
		'js/extend.js',
		'js/classes.js',
		'js/functions.js',
		'js/parsers/ui.js'
	];
	this.loadStatus = [ ];
	this.successCount = 0;
	this.notify = function(scriptUrl, jqxhr, scriptSuccess) {
		this.loadStatus.push({ success: scriptSuccess, url: scriptUrl, status: jqxhr});
		if (scriptSuccess)
			++this.successCount;
		if (this.loadStatus.length == this.loadList.length)
			this.initCallback();
	};
	this.initParsers = function(callback) {
		/*this.initCallback = callback;
		for (var i = 0; i < this.loadList.length; ++i) {
			$.ajax({
				async: false,
				url: this.loadList[i],
				dataType: 'script',
				context: { parser: this, url: this.loadList[i] }
			}).done(function(data, status, jqxhr) {
				this.parser.notify(this.url, jqxhr, true);
			}).fail(function(jqxhr, status, error) {
				this.parser.notify(this.url, jqxhr, false);
			});
		}*/
		callback();
	};
};

var
	parser = new ContentParser(),
	init = function() { };

$(function() {
	parser.initParsers(function() {
		parser.prepare($(document.documentElement));
		init();
	});
});
