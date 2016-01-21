Fe.Entity = function(name) {
	this.name = name;
	this.parent = null;
	this.children = [];
	this.components = [];
};
Fe.Entity.prototype.getComponent = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponent: Type of component to get null or undefined');
	
	for (var i = 0; i < this.components.length; ++i)
		if (this.components[i] instanceof type)
			return this.components[i];
	return null;
};
Fe.Entity.prototype.getComponentInChildren = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponentInChildren: Type of component to get null or undefined');
	
	for (var i = 0; i < this.children.length; ++i)
	{
		var comp = this.children[i].getComponent(type);
		if (!comp)
			comp = this.children[i].getComponentInChildren(type);
		if (comp)
			return comp;
	}
	return null;
};
Fe.Entity.prototype.getComponentInParent = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponentInParent: Type of component to get null or undefined');
	if (!this.parent)
		return null;
	
	var comp = this.parent.getComponent(type);
	if (!comp)
		comp = this.parent.getComponentInParent(type);
	
	return comp;
};
Fe.Entity.prototype.getComponents = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponents: Type of components to get null or undefined');
	
	var matches = [];
	for (var i = 0; i < this.components.length; ++i)
		if (this.components[i] instanceof type)
			matches.push(this.components[i]);
	return matches;
};
Fe.Entity.prototype.getComponentsInChildren = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponentsInChildren: Type of components to get null or undefined');
	
	var matches = [];
	for (var i = 0; i < this.children.length; ++i)
		matches = matches.concat(this.children[i].getComponents(type), this.children[i].getComponentsInChildren(type));
	
	return matches;
};
Fe.Entity.prototype.getComponentsInParent = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponentsInParent: Type of components to get null or undefined.');
	
	var matches = [];
	if (this.parent)
		matches = matches.concat(this.parent.getComponents(type), this.parent.getComponentsInParent(type));
	
	return matches;
};
Fe.Entity.prototype.addComponent = function(type) {
	if (!type)
		throw new Error('Fe.Entity.getComponent: Type of component to get null or undefined');
	
	var component = new type(this);
	this.components.push(component);
	return component;
};
Fe.Entity.prototype.removeComponent = function(type) {
	if (!type)
		throw new Error('Fe.Entity.removeComponent: Type of component to remove null or undefined');
	
	for (var i = 0; i < this.components.length; ++i) {
		if (this.components[i] instanceof type) {
			this.components.splice(i, 1);
			return true;
		}
	}
	
	return false;
};
Fe.Entity.prototype.addChild = function(entity) {
	if (this.children.indexOf(entity) != -1)
		throw new Error('Fe.Entity.addChild: Entity to be added as a child is already a child');
	
	this.children.push(entity);
	entity.parent = this;
};
Fe.Entity.prototype.removeChild = function(entity) {
	var i = this.children.indexOf(entity);
	if (i == -1)
		throw new Error('Fe.Entity.removeChild: Entity to be removed as a child is not a child');
	
	this.children.splice(i, 1);
	entity.parent = null;
};
Fe.Entity.prototype.getChild = function(path) {
	if (!path || path == '')
		return this;
	
	var slash = path.indexOf('/');
	var name = path.substr(0, slash);
	var rest = path.substr(slash + 1);
	
	for (var i = 0; i < this.children.length; ++i)
		if (this.children[i].name == name)
			return this.children[i].getChild(rest);
	
	return null;
};
Fe.Entity.prototype.broadcastEvent = function(eventName, args) {
	for (var i = 0; i < this.components.length; ++i)
		if (this.components[i][eventName])
			this.components[i][eventName].apply(this.components[i], args);
	
	for (var i = 0; i < this.children.length; ++i)
		this.children[i].broadcastEvent(eventName, args);
};
