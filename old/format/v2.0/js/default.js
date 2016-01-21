var TypeEnum =
	{
		DEFAULT: "bool",
		BOOL: "bool",
		BYTE: "byte",
		SBYTE: "sbyte",
		CHAR: "char",
		DOUBLE: "double",
		FLOAT: "float",
		INT: "int",
		UINT: "uint",
		LIST: "list",
		LONG: "long",
		ULONG: "ulong",
		OBJECT: "object",
		SHORT: "short",
		USHORT: "ushort",
		STRING: "string",
		TAGID: "tagid",
		each:
			[
				"bool",
				"byte",
				"sbyte",
				"char",
				"double",
				"float",
				"int",
				"uint",
				"list",
				"long",
				"ulong",
				"object",
				"short",
				"ushort",
				"string",
				"tagid"
			]
	};
var tags = [];

function defaultValue(type)
{
	switch (type)
	{
		case TypeEnum.BOOL:
			return new Reference(false);
		case TypeEnum.BYTE:
			return new Reference(0);
		case TypeEnum.SBYTE:
			return new Reference(0);
		case TypeEnum.CHAR:
			return new Reference('?');
		case TypeEnum.DOUBLE:
			return new Reference(0.0);
		case TypeEnum.FLOAT:
			return new Reference(0.0);
		case TypeEnum.INT:
			return new Reference(0);
		case TypeEnum.UINT:
			return new Reference(0);
		case TypeEnum.LIST:
			return [];
		case TypeEnum.LONG:
			return new Reference(0);
		case TypeEnum.ULONG:
			return new Reference(0);
		case TypeEnum.OBJECT:
			return {};
		case TypeEnum.SHORT:
			return new Reference(0);
		case TypeEnum.USHORT:
			return new Reference(0);
		case TypeEnum.STRING:
			return new Reference('?');
		case TypeEnum.TAGID:
			return new Reference(0);
		default:
			return null;
	}
}

function spliceRemoveGUI(array, element, gui)
{
	return function()
		{
			gui.remove();
			array.splice(array.indexOf(element), 1);
			$(this).remove();
		};
}

function addStaticLength(obj, isStatic, length)
{
	if (isStatic)
	{
		obj['static'] = isStatic;
		if (length != undefined)
			obj['length'] = length;
	}
}

function isArray(obj)
{
	return (typeof(obj) == "object" && Object.prototype.toString.call(newVal) === '[object Array]');
}

function Reference(value)
{
	if (value == undefined)
		value = null;
	this.value = value;
}

function Property(name, type, isStatic)
{
	if (name == undefined)
		name = '';
	if (type == undefined)
		type = TypeEnum.DEFAULT;
	if (isStatic != true)
		isStatic = false;

	this.changeName(name);
	this.changeType(type);
	this.changeStatic(isStatic);
}
Property.prototype.changeName =
	function(name)
	{
		this.name = name;
	};
Property.prototype.changeType =
	function(type)
	{
		this.type = type;

		if (type == TypeEnum.LIST)
			this.prop = new Property();
		else if (type == TypeEnum.OBJECT)
			this.prop = [];
		else
			this.prop = null;

		this.data = defaultValue(this.type);
	};
Property.prototype.changeStatic =
	function(makeStatic)
	{
		this.isStatic = makeStatic;

		if (this.data == null)
			this.data = defaultValue(this.type);
	};
Property.prototype.validate =
	function(value)
	{
		if (value == undefined || value == null)
			return false;
		
		switch (this.type)
		{
			case TypeEnum.BOOL:
				if (typeof(value) != "boolean")
					return false;
				break;
			case TypeEnum.BYTE:
				if (typeof(value) != "number" || value % 1 != 0 || value < 0 || value > 255)
					return false;
				break;
			case TypeEnum.SBYTE:
				if (typeof(value) != "number" || value % 1 != 0 || value < -128 || value > 127)
					return false;
				break;
			case TypeEnum.CHAR:
				if (typeof(value) != "string" || value.length != 1)
					return false;
				break;
			case TypeEnum.DOUBLE:
				if (typeof(value) != "number")
					return false;
				break;
			case TypeEnum.FLOAT:
				if (typeof(value) != "number")
					return false;
				break;
			case TypeEnum.INT:
				if (typeof(value) != "number" || value % 1 != 0 || value < -2147483648 || value > 2147483647)
					return false;
				break;
			case TypeEnum.UINT:
				if (typeof(value) != "number" || value % 1 != 0 || value < 0 || value > 4294967295)
					return false;
				break;
			case TypeEnum.LIST:
				if (typeof(value) != "object" || !isArray(value))
					return false;
				
				for (var i = 0; i < value.length; ++i)
					if (!this.prop.validate(value[i]))
						return false;
				
				break;
			case TypeEnum.LONG:
				if (typeof(value) != "number" || value % 1 != 0 || value < -9223372036854775808 || value > 9223372036854775807)
					return false;
				break;
			case TypeEnum.ULONG:
				if (typeof(value) != "number" || value % 1 != 0 || value < 0 || value > 18446744073709551615)
					return false;
				break;
			case TypeEnum.OBJECT:
				if (typeof(value) != "object" || isArray(value))
					return false;

				for (var i = 0; i < this.prop.length; ++i)
				{
					if (!(this.prop[i].name in value))
						return false;
					
					if (!this.prop[i].validate(value[this.prop[i].name]))
						return false;
				}
				
				break;
			case TypeEnum.SHORT:
				if (typeof(value) != "number" || value % 1 != 0 || value < -32768 || value > 32767)
					return false;
				break;
			case TypeEnum.USHORT:
				if (typeof(value) != "number" || value % 1 != 0 || value < 0 || value > 65535)
					return false;
				break;
			case TypeEnum.STRING:
				if (typeof(value) != "string")
					return false;
				break;
			case TypeEnum.TAGID:
				if (typeof(value) != "number" || value % 1 != 0 || value < 0)
					return false;
				break;
			default:
				return false;
		}

		return true;
	};
Property.prototype.addTypeSpecificGUI =
	function(div)
	{
		switch (this.type)
		{
			case TypeEnum.LIST:
				var tsgui = $('<div class="typespecific"></div>');
				var propgui = this.prop.getGUI();
				tsgui.append(propgui);
				div.append(tsgui);
				break;
			case TypeEnum.OBJECT:
				var tsgui = $('<div class="typespecific"></div>');
				
				var addButton = $('<input class="add typespecific" type="button" value="+" />');
				addButton.click(
					(function(property)
					{
						return function()
							{
								var button = $(this);
								var parent = button.parent();

								var newprop = new Property();

								property.prop.push(newprop);

								var newpropgui = newprop.getGUI();
								newpropgui.addClass('typespecific');

								var removeButton = $('<input class="remove typespecific" type="button" value="-" />');
								removeButton.click(
									spliceRemoveGUI(property.prop, newprop, newpropgui)
								);

								parent.append(removeButton).append(newpropgui);
							}
					})(this)
				);

				for (var i = 0; i < this.prop.length; ++i)
				{
					var curprop = this.prop[i];
					var propgui = curprop.getGUI();
					propgui.addClass('typespecific');

					var removeButton = $('<input class="remove typespecific" type="button" value="-" />');
					removeButton.click(
						spliceRemoveGUI(this.prop, this.prop[i], propgui)
					);

					tsgui.append(removeButton).append(propgui);
				}

				div.append(addButton).append(tsgui);
				break;
			default:
				break;
		}
	};
Property.prototype.getTypeGUI =
	function()
	{
		var div = $('<div class="type"></div>');

		var nameInput = $('<input class="nameinput" type="text" placeholder="Property Name" value="' + this.name + '" />');
		nameInput.on(
			'input',
			(function(prop)
			{
				return function()
					{
						var input = $(this);
						prop.changeName(input.val());
					};
			})(this)
		);
		
		var typeSelect = $('<select class="typeselect"></select>');
		
		for (var i = 0; i < TypeEnum.each.length; ++i)
			typeSelect.append($('<' + (TypeEnum.each[i] == this.type ? 'option selected' : 'option') + '>' + TypeEnum.each[i] + '</option>'));

		typeSelect.change(
			(function(prop)
			{
				return function()
					{
						var select = $(this);
						var parent = select.parent();

						prop.changeType(select.val());

						parent.children('.typespecific').remove();
						prop.addTypeSpecificGUI(parent);
					};
			})(this)
		);

		div.append(nameInput).append(typeSelect);

		this.addTypeSpecificGUI(div);

		return div;
	};
Property.prototype.getDataGUI =
	function(data, ignoreStatic)
	{
		if (data == undefined)
			data = this.data;
		
		if (this.isStatic && ignoreStatic == true)
			return $();
		
		var div = $('<div class="data"><div class="datalabel">' + this.name + ' : ' + this.type + '</div></div>');

		var boolValidator =
			function(prop, data)
			{
				return function()
					{
						var input = $(this).prop('checked');
						if (prop.validate(input))
							$(this).removeClass('invalid');
						else
							$(this).addClass('invalid');
						data.value = input;
					};
			};
		var intValidator =
			function(prop, data)
			{
				return function()
					{
						var input = parseInt($(this).val());
						if (prop.validate(input))
							$(this).removeClass('invalid');
						else
							$(this).addClass('invalid');
						data.value = input;
					};
			};
		var floatValidator =
			function(prop, data)
			{
				return function()
					{
						var input = parseFloat($(this).val());
						if (prop.validate(input))
							$(this).removeClass('invalid');
						else
							$(this).addClass('invalid');
						data.value = input;
					};
			};
		var stringValidator =
			function(prop, data)
			{
				return function()
					{
						var input = $(this).val();
						if (prop.validate(input))
							$(this).removeClass('invalid');
						else
							$(this).addClass('invalid');
						data.value = input;
					};
			};

		var valuefield = null;
		switch (this.type)
		{
			case TypeEnum.BOOL:
				valuefield = $('<input class="valuefield" type="checkbox"' + (data.value ? ' checked' : '') + ' />');
				valuefield.change(boolValidator(this, data));
				break;
			case TypeEnum.BYTE:
				valuefield = $('<input class="valuefield" type="number" min="0" max="255" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.SBYTE:
				valuefield = $('<input class="valuefield" type="number" min="-128" max="127" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.CHAR:
				valuefield = $('<input class="valuefield" type="text" maxlength="1" value="' + data.value + '" />');
				valuefield.on('input', stringValidator(this, data));
				break;
			case TypeEnum.DOUBLE:
				valuefield = $('<input class="valuefield" type="number" value="' + data.value + '" />');
				valuefield.on('input', floatValidator(this, data));
				break;
			case TypeEnum.FLOAT:
				valuefield = $('<input class="valuefield" type="number" value="' + data.value + '" />');
				valuefield.on('input', floatValidator(this, data));
				break;
			case TypeEnum.INT:
				valuefield = $('<input class="valuefield" type="number" min="-2147483648" max="2147483647" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.UINT:
				valuefield = $('<input class="valuefield" type="number" min="0" max="4294967295" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.LIST:
				valuefield = $('<div class="listvaluefield"></div>');
				var addButton = $('<input class="add" type="button" value="+" />');
				addButton.click(
					(function(prop, valuefield)
					{
						return function()
							{
								var button = $(this);
								var newdata = defaultValue(prop.prop.type);

								data.push(newdata);

								var olddata = prop.prop.data;
								prop.prop.data = newdata;
								var newgui = prop.prop.getDataGUI(newdata, true);
								prop.prop.data = olddata;

								var removeButton = $('<input class="remove" type="button" value="-" />');
								removeButton.click(
									spliceRemoveGUI(data, newdata, newgui)
								);

								valuefield.append(removeButton).append(newgui);
							};
					})(this, valuefield)
				);
				div.append(addButton);

				for (var i = 0; i < data.length; ++i)
				{
					var propdata = data[i];

					var olddata = this.prop.data;
					this.prop.data = propdata;
					var propgui = this.prop.getDataGUI(propdata, true);
					this.prop.data = olddata;

					var removeButton = $('<input class="remove" type="button" value="-" />');
					removeButton.click(
						spliceRemoveGUI(data, propdata, propgui)
					);

					valuefield.append(removeButton).append(propgui);
				}

				break;
			case TypeEnum.LONG:
				valuefield = $('<input class="valuefield" type="number" min="-9223372036854775808" max="9223372036854775807" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.ULONG:
				valuefield = $('<input class="valuefield" type="number" min="0" max="18446744073709551615" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.OBJECT:
				valuefield = $('<div class="objectvaluefield"></div>');

				for (var i = 0; i < this.prop.length; ++i)
				{
					if (!(this.prop[i].name in data))
						data[this.prop[i].name] = defaultValue(this.prop[i].type);

					var propdata = data[this.prop[i].name];

					var olddata = this.prop[i].data;
					this.prop[i].data = propdata;
					var propgui = this.prop[i].getDataGUI(propdata, true);
					this.prop[i].data = olddata;

					valuefield.append(propgui);
				}

				break;
			case TypeEnum.SHORT:
					var selects = type.find('select').not(type.find('div.property.static select'));
				valuefield = $('<input class="valuefield" type="number" min="-32768" max="32767" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.USHORT:
				valuefield = $('<input class="valuefield" type="number" min="0" max="65535" step="1" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			case TypeEnum.STRING:
				valuefield = $('<input class="valuefield" type="text" value="' + data.value + '" />');
				valuefield.on('input', stringValidator(this, data));
				break;
			case TypeEnum.TAGID:
				valuefield = $('<input class="valuefield" type="number" value="' + data.value + '" />');
				valuefield.on('input', intValidator(this, data));
				break;
			default:
				valuefield = $('<div class="error">INVALID SOMETHING THIS IS BAD</div>');
				break;
		}

		div.append(valuefield);

		return div;
	};
Property.prototype.getGUI =
	function()
	{
		var div = $('<div class="' + (this.isStatic ? 'static property' : 'property') + '"></div>');

		var staticCheckbox = $('<input class="staticcheckbox" type="checkbox"' + (this.isStatic ? ' checked' : '') + ' />');
		staticCheckbox.change(
			(function(prop)
			{
				return function()
					{
						var checkbox = $(this);
						var parent = checkbox.parent();
				
						prop.changeStatic(checkbox.prop('checked'));

						if (prop.isStatic)
							parent.addClass('static').append(prop.getDataGUI());
						else
							parent.removeClass('static').children('div.data').remove();
					};
			})(this)
		);

		div.append(staticCheckbox).append(this.getTypeGUI());

		if (this.isStatic)
			div.addClass('static').append(this.getDataGUI());

		return div;
	};

function Tag(name, properties)
{
	if (name == undefined)
		name = '';
	if (properties == undefined || !isArray(properties))
		properties = [];

	this.name = name;
	this.properties = properties;
}
Tag.prototype.getGUI =
	function()
	{
		var div = $('<div class="tag"></div>');

		var nameInput = $('<input class="nameinput" type="text" placeholder="Tag Name" value="' + this.name + '" />');
		nameInput.on(
			'input',
			(function(tag)
			{
				return function()
					{
						var input = $(this);
						tag.name = input.val();
					};
			})(this)
		);

		var addButton = $('<input class="add" type="button" value="+" />');
		addButton.click(
			(function(tag)
			{
				return function()
					{
						var button = $(this);
						var parent = button.parent().parent();

						var newprop = new Property();
						tag.properties.push(newprop);

						var newpropgui = newprop.getGUI();

						var removeButton = $('<input class="remove" type="button" value="-" />');
						removeButton.click(
							spliceRemoveGUI(tag.properties, newprop, newpropgui)
						);

						parent.append(removeButton).append(newpropgui);
					};
			})(this)
		);
		var controlDiv = $('<div class="control"></div>');
		controlDiv.append(nameInput).append(addButton);
		div.append(controlDiv);

		for (var i = 0; i < this.properties.length; ++i)
		{
			var propgui = this.properties[i].getGUI();
			var removeButton = $('<input class="remove" type="button" value="-" />');
			removeButton.click(
				spliceRemoveGUI(this.properties, this.properties[i], propgui)
			);
			div.append(removeButton).append(this.properties[i].getGUI());
		}

		return div;
	};

function AddTag(tag)
{
	var taggui = tag.getGUI();
	
	var removeButton = $('<input class="remove" type="button" value="-" />');
	removeButton.click(
		spliceRemoveGUI(tags, tag, taggui)
	);

	$('div#taggui').append(removeButton).append(taggui);
}

function XMLEscape(str)
{
	return str.toString().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('\'', '&apos;');
}

function XMLUnescape(str)
{
	return str.toString().replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&apos;', '\'');
}

function XMLBuilder()
{
	this.text = '<?xml version="1.0" encoding="UTF-8"?>\n';
	this.indent = 0;
}
XMLBuilder.prototype.addIndents =
	function()
	{
		for (var i = 0; i < this.indent; ++i)
			this.text += '\t';
	};
XMLBuilder.prototype.single =
	function(tagname, props)
	{
		if (props == undefined)
			props = null;
	
		this.addIndents();
		this.text += '<' + tagname;
		for (propname in props)
			this.text += ' ' + XMLEscape(propname) + '="' + XMLEscape(props[propname]) + '"';
		this.text += '/>\n';
	};
XMLBuilder.prototype.open =
	function(tagname, props)
	{
		if (props == undefined)
			props = null;
	
		this.addIndents();
		this.text += '<' + tagname;
		for (propname in props)
			this.text += ' ' + XMLEscape(propname) + '="' + XMLEscape(props[propname]) + '"';
		this.text += '>\n';
		++this.indent;
	};
XMLBuilder.prototype.close =
	function(tagname)
	{
		--this.indent;
		this.addIndents();
		this.text += '</' + tagname + '>\n';
	};

function BuildStaticValueXML(builder, prop, data, ignoreStatic)
{
	if (ignoreStatic == true && prop.isStatic)
		return;
	
	switch (prop.type)
	{
		case TypeEnum.BOOL:
		case TypeEnum.BYTE:
		case TypeEnum.SBYTE:
		case TypeEnum.CHAR:
		case TypeEnum.DOUBLE:
		case TypeEnum.FLOAT:
		case TypeEnum.INT:
		case TypeEnum.UINT:
		case TypeEnum.LONG:
		case TypeEnum.ULONG:
		case TypeEnum.SHORT:
		case TypeEnum.USHORT:
		case TypeEnum.STRING:
		case TypeEnum.TAGID:
			builder.single('static', {value: data.value});
			break;
		case TypeEnum.LIST:
			builder.single('static', {value: data.length});
			for (var i = 0; i < data.length; ++i)
				BuildStaticValueXML(builder, prop.prop, data[i], true);
			break;
		case TypeEnum.OBJECT:
			for (var i = 0; i < prop.prop.length; ++i)
				BuildStaticValueXML(builder, prop.prop[i], data[prop.prop[i].name], true);
			break;
		default:
			break;
	}
}

function BuildPropertyXML(builder, prop)
{
	switch (prop.type)
	{
		case TypeEnum.BOOL:
		case TypeEnum.BYTE:
		case TypeEnum.SBYTE:
		case TypeEnum.CHAR:
		case TypeEnum.DOUBLE:
		case TypeEnum.FLOAT:
		case TypeEnum.INT:
		case TypeEnum.UINT:
		case TypeEnum.LONG:
		case TypeEnum.ULONG:
		case TypeEnum.SHORT:
		case TypeEnum.USHORT:
		case TypeEnum.STRING:
		case TypeEnum.TAGID:
			console.log('Building property ' + prop.name);
			builder.single(
				'property',
				(function(obj, isStatic, data)
				{
					if (isStatic)
					{
						obj['static'] = true;
						obj['value'] = data['value'];
					}
					return obj;
				})({name: prop.name, type: prop.type}, prop.isStatic, prop.data)
			);
			break;
		case TypeEnum.LIST:
			builder.open(
				'property',
				(function(obj, isStatic)
				{
					if (isStatic)
					{
						obj['static'] = true;
					}
					return obj;
				})({name: prop.name, type: prop.type}, prop.isStatic)
			);

			BuildPropertyXML(builder, prop.prop);

			if (prop.isStatic)
				BuildStaticValueXML(builder, prop, prop.data);

			builder.close('property');

			break;
		case TypeEnum.OBJECT:
			builder.open(
				'property',
				(function(obj, isStatic)
				{
					if (isStatic)
						obj['static'] = true;
					return obj;
				})({name: prop.name, type: prop.type}, prop.isStatic)
			);

			for (var i = 0; i < prop.prop.length; ++i)
				BuildPropertyXML(builder, prop.prop[i]);

			if (prop.isStatic)
				BuildStaticValueXML(builder, prop, prop.data);

			builder.close('property');

			break;
		default:
			break;
	}
}

function BuildXML()
{
	var builder = new XMLBuilder();

	builder.open('data');

	builder.single('meta', {length: tags.length});

	for (var i = 0; i < tags.length; ++i)
	{
		var curtag = tags[i];

		builder.open('tag', {name: curtag.name});

		for (var j = 0; j < curtag.properties.length; ++j)
			BuildPropertyXML(builder, curtag.properties[j]);

		builder.close('tag');
	}

	builder.close('data');

	return builder.text;
}

function ParseStaticXML(prop, staticsRef)
{
	if (prop.isStatic)
		return null;

	var statics = staticsRef.value;

	switch (prop.type)
	{
		case TypeEnum.BOOL:
			var value = $(statics[0]).attr('value');
			staticsRef.value = statics.not($(statics[0]));
			return new Reference(value == 'true');
		case TypeEnum.CHAR:
		case TypeEnum.STRING:
			var value = $(statics[0]).attr('value');
			staticsRef.value = statics.not($(statics[0]));
			return new Reference(value);
		case TypeEnum.BYTE:
		case TypeEnum.SBYTE:
		case TypeEnum.INT:
		case TypeEnum.UINT:
		case TypeEnum.LONG:
		case TypeEnum.ULONG:
		case TypeEnum.SHORT:
		case TypeEnum.USHORT:
		case TypeEnum.TAGID:
			var value = $(statics[0]).attr('value');
			staticsRef.value = statics.not($(statics[0]));
			return new Reference(parseInt(value));
		case TypeEnum.DOUBLE:
		case TypeEnum.FLOAT:
			var value = $(statics[0]).attr('value');
			staticsRef.value = statics.not($(statics[0]));
			return new Reference(parseFloat(value));
		case TypeEnum.LIST:
			var data = [];
			var length = $(statics[0]).attr('value');
			staticsRef.value = statics.not($(statics[0]));
			for (var i = 0; i < length; ++i)
				data.push(ParseStaticXML(prop.prop, staticsRef));
			return data;
		case TypeEnum.OBJECT:
			var data = {};
			for (var i = 0; i < prop.prop.length; ++i)
				data[prop.prop[i].name] = ParseStaticXML(prop.prop[i], staticsRef);
			return data;
		default:
			return null;
	}
}

function ParsePropertyXML(xprop)
{
	var prop = new Property(xprop.attr('name'), xprop.attr('type'), xprop.attr('static') != undefined);
	var length = null;

	if (prop.type == TypeEnum.LIST)
	{
		var xtype = xprop.children('property');
		prop.prop = ParsePropertyXML(xtype);
	}
	else if (prop.type == TypeEnum.OBJECT)
	{
		var xtypes = xprop.children('property');
		prop.prop = [];
		xtypes.each(
			function()
			{
				prop.prop.push(ParsePropertyXML($(this)));
			}
		);
	}

	if (prop.isStatic)
	{
		var value = xprop.attr('value');
		switch (prop.type)
		{
			case TypeEnum.BOOL:
				prop.data = new Reference(value == 'true');
				break;
			case TypeEnum.CHAR:
			case TypeEnum.STRING:
				prop.data = new Reference(value);
				break;
			case TypeEnum.BYTE:
			case TypeEnum.SBYTE:
			case TypeEnum.INT:
			case TypeEnum.UINT:
			case TypeEnum.LONG:
			case TypeEnum.ULONG:
			case TypeEnum.SHORT:
			case TypeEnum.USHORT:
			case TypeEnum.TAGID:
				prop.data = new Reference(parseInt(value));
				break;
			case TypeEnum.DOUBLE:
			case TypeEnum.FLOAT:
				prop.data = new Reference(parseFloat(value));
				break;
			case TypeEnum.LIST:
				var statics = xprop.children('static');
				var length = parseInt($(statics[0]).attr('value'));
				statics = statics.not($(statics[0]));
				var staticsRef = new Reference(statics);
				prop.data = [];
				for (var i = 0; i < length; ++i)
					prop.data.push(ParseStaticXML(prop.prop, staticsRef));
				break;
			case TypeEnum.OBJECT:
				var staticsRef = new Reference(xprop.children('static'));
				prop.data = {};
				for (var i = 0; i < prop.prop.length; ++i)
					prop.data[prop.prop[i].name] = ParseStaticXML(prop.prop[i], staticsRef);
				break;
			default:
				break;
		}
	}

	return prop;
}

function ParseXML(raw)
{
	var xml = $(raw);
	var xtags = xml.children('tag');

	tags = [];

	xtags.each(
		function()
		{
			var xtag = $(this);
			var props = xtag.children('property');

			var tag = new Tag(xtag.attr('name'));

			props.each(
				function()
				{
					tag.properties.push(ParsePropertyXML($(this)));
				}
			);

			tags.push(tag);
		}
	);

	$('div#taggui').empty();

	for (var i = 0; i < tags.length; ++i)
		AddTag(tags[i]);
}

function SaveXML()
{
	window.open('data:text/xml,' + encodeURIComponent(BuildXML()));
}

$(document).ready(
	function()
	{
		$(document).on(
			'dragover',
			function(e)
			{
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = 'copy';
			}
		);
		$(document).on(
			'dragenter',
			function(e)
			{
				e.preventDefault();
				e.stopPropagation();
			}
		);
		$(document).on(
			'drop',
			function(e)
			{
				if (e.originalEvent.dataTransfer)
				{
					if (e.originalEvent.dataTransfer.files.length > 0)
					{
						e.preventDefault();
						e.stopPropagation();

						var file = e.originalEvent.dataTransfer.files[0];

						if (file.type != 'text/xml')
						{
							alert('The given file is not an XML file');
							return;
						}

						var reader = new FileReader();

						reader.onload =
							(function(reader)
							{
								return function()
									{
										ParseXML(reader.result);
									};
							})(reader);

						reader.readAsText(file);
					}
				}
			}
		);
		
		shortcut.add('Ctrl+S', SaveXML);
		
		$('input#addtag').click(
			function()
			{
				var newtag = new Tag();
				tags.push(newtag);

				AddTag(newtag);
			}
		);
	}
);
