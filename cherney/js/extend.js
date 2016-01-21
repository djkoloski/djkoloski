Function.prototype.partial = function() {
	var
		fn = this,
		args = Array.prototype.slice.call(arguments);
	
	return function() {
		var arg = 0;
		for (var i = 0; i < args.length && arg < arguments.length; ++i)
			if (args[i] === undefined)
				args[i] = arguments[arg++];
		return fn.apply(this, args);
	};
};

$.prototype.only = function(event, handler) {
	this.off(event).on(event, handler);
};

Array.prototype.shuffle = function() {
	for (var i = this.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
	return this;
}
