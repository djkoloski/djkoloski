var root = null;
var filter = null;
var edited = false;
var movers = null;
var elements = null;
var rainbow = null;

window.onbeforeunload =
	function() {
		if (edited)
			return 'You have unsaved changes to the current XML file which will be discarded if you leave.';
		else
			return null;
	};

$(function() {
	$.widget("custom.colorselectmenu", $.ui.selectmenu, {
		_renderItem: function(ul, item) {
			var li = $('<li class="coloroption"><div style="background-color: ' + item.element.attr('value') + ' !important"></li>');
			return li.appendTo(ul);
		}
	});
	
	root = new Property(null, null, TypeEnum._TAGROOT);
	root.setNotify(
		function() {
			SetEdited(true);
		}
	);
	filter = new Property(null, null, TypeEnum._TAG);
	filter.setNotify(Refilter);
	filter.ui.remove.hide();
	filter.ui.grip.hide();
	
	$('ul#tagroot')
		.append(root.ui.root)
		.sortable({
			axis: 'y',
			containment: 'document',
			handle: '.grip'
		});

	$('ul#filterroot')
		.append(filter.ui.root)
		.sortable({
			axis: 'y',
			containment: 'document',
			handle: '.grip'
		});

	$('ul#sorting').sortable({
		axis: 'x',
		containment: 'document'
	});
	$('button#sort').button().click(Sort);

	$('button#resetfilter').button().click(ResetFilter);
	$('input#onlyinvalid').change(Refilter);
	$('button#refilter').button().click(Refilter);

	$('input#file').change(
		function() {
			Load($(this).prop('files')[0]);
		}
	);
	$('button#load')
		.button()
		.click(
			function() {
				Load($('input#file').prop('files')[0]);
			}
		);
	$('button#save')
		.button()
		.click(
			function() {
				Save($('input#minimal').prop('checked'));
			}
		);

	$('button#edit')
		.button()
		.click(EditSettings);

	$('button#addtype')
		.button()
		.click(
			function() {
				var typeroot = $('<li></li>');
				var removebutton = $('<button class="compact remove"><span class="ui-icon ui-icon-minus"></span></button>');
				removebutton
					.button()
					.click(
						(function(root) {
							return function() {
								root.remove();
							};
						})(typeroot)
					);
				var typename = $('<input type="text" class="typename" placeholder="Type Name" />');

				typeroot.append(removebutton).append(typename);

				$('ul#types').append(typeroot);
			}
		);
	$('ul#types').
		sortable({
			axis: 'y',
			containment: 'document'
		});
	$('button#addcolor')
		.button()
		.click(
			function() {
				var colorroot = $('<li></li>');
				var removebutton = $('<button class="compact remove"><span class="ui-icon ui-icon-minus"></span></button>');
				removebutton
					.button()
					.click(
						(function(root) {
							return function() {
								root.remove();
							};
						})(colorroot)
					);
				var colorcode = $('<input type="text" class="colorcode" placeholder="Color Code" />');

				colorroot.append(removebutton).append(colorcode);

				$('ul#colors').append(colorroot);
			}
		);
	$('ul#colors').
		sortable({
			axis: 'y',
			containment: 'document'
		});

	$(document)
		.on(
			'dragover',
			function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = 'copy';
			}
		)
		.on(
			'dragenter',
			function(e) {
				e.preventDefault();
				e.stopPropagation();
			}
		)
		.on(
			'drop',
			function(e) {
				if (e.originalEvent.dataTransfer) {
					e.preventDefault();
					e.stopPropagation();

					Load(e.originalEvent.dataTransfer.files[0]);
				}
			}
		);

	shortcut.add(
		'Ctrl+S',
		function() {
			Save($('input#minimal').prop('checked'));
		}
	);
	shortcut.add(
		'Ctrl+Shift+S',
		function() {
			Save(true);
		}
	);
	shortcut.add('Ctrl+D', Refilter);
	shortcut.add('Ctrl+Shift+D', ResetFilter);
	shortcut.add(
		'Ctrl+O',
		function() {
			$('input#file').click();
		}
	);
	shortcut.add('Ctrl+Shift+A', Sort);
});

var TypeEnum = {
	DEFAULT: 'any',
	ANY: 'any',
	ARRAY: 'array',
	OBJECT: 'object',
	_TAG: '_tag',
	_TAGROOT: '_tagroot'
};

var BaseTypes = [
	TypeEnum.ANY,
	TypeEnum.ARRAY,
	TypeEnum.OBJECT
];

var UserTypes = [];

var Types = [
	TypeEnum.ANY,
	TypeEnum.ARRAY,
	TypeEnum.OBJECT
];

/*
	bool
	byte
	sbyte
	char
	double
	float
	int
	uint
	long
	ulong
	short
	ushort
	string
	tag
	tagid
*/

var ColorEnum = {
	DEFAULT: '#ffffff',
	ANY: '#ffffff'
};

var BaseColors = [
	ColorEnum.ANY
];

var UserColors = [];

var Colors = [
	ColorEnum.ANY
];

/*
	#2a363b
	#bf0c43
	#fd8603
	#f9ba15
	#8eac00
	#127a97
	#452b72
*/

function CalcMatrix(axis, angle) {
	var c = Math.cos(angle * Math.PI / 180);
	var s = Math.sin(angle * Math.PI / 180);
	return [
		c + axis.x * axis.x * (1 - c),
		axis.y * axis.x * (1 - c) + axis.z * s,
		axis.x * axis.y * (1 - c) - axis.z * s,
		c + axis.y * axis.y * (1 - c),
		axis.x * axis.z * (1 - c) + axis.y * s,
		axis.y * axis.z * (1 - c) - axis.x * s
	];
}

function SetEdited(edit) {
	edited = edit;
	$('div#edited').text((edited ? 'Edited' : 'Saved'));
}

function Sort() {
	var order = [];
	$('ul#sorting li').each(
		function() {
			order.push($(this).text());
		}
	);
	root.sort(order);
}

function Load(file) {
	if (file == null) {
		$('<p>No file was given to load</p>').dialog({
			modal: true,
			buttons: {
				Ok: function() {
					$(this).dialog('close');
				}
			}
		});
		return;
	}
	if (file.type != 'text/xml') {
		$('<p>The given file is not an XML file</p>').dialog({
			modal: true,
			buttons: {
				Ok: function() {
					$(this).dialog('close');
				}
			}
		});
		return;
	}

	$('input#file').prop('files', null);
	$('input#filename').val(file.name.substr(0, file.name.lastIndexOf('.xml')));

	var reader = new FileReader();

	reader.onload =
		(function(reader) {
			return function() {
				root.parseXML($(reader.result));
				SetEdited(false);
			};
		})(reader);

	reader.readAsText(file);
}

function Save(minimal) {
	root.saveXML(minimal);
	SetEdited(false);
}

function Timestamp(type) {
	var stamp = '';
	var time = new Date();

	if (type == 'date' || type == 'both')
		stamp += (time.getMonth() + 1) + '-' + time.getDay();
	if (type == 'both')
		stamp += '_';
	if (type == 'time' || type == 'both') {
		stamp += (time.getHours() < 10 ? '0' : '') + time.getHours() + '-';
		stamp += (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
	}

	return stamp;
}

function FileName(minimal) {
	return $('input#filename').val() + Timestamp($('select#timestamp').val()) + (minimal ? '_min' : '') + '.xml';
}

function ResetFilter() {
	filter.setColor(ColorEnum.DEFAULT);
	filter.setName('');
	filter.clearProperties();
}

function Refilter() {
	root.filter(filter, $('input#onlyinvalid').prop('checked'));
}

function RefillSelect(select, array) {
	var value = select.val();
	select.children('option').remove();
	for (var i = 0; i < array.length; ++i)
		select.append($('<option value="' + array[i] + '"' + (array[i] == value ? ' selected' : '') + '>' + array[i] + '</option>'));
	return select;
}

function RefreshTypes() {
	Types = BaseTypes.concat(UserTypes);
	$('select.typeselect').each(
		function() {
			RefillSelect($(this), Types);
		}
	);
	root.refresh('type');
}

function RefreshColors() {
	Colors = BaseColors.concat(UserColors);
	$('select.colorselect').each(
		function() {
			RefillSelect($(this), Colors).colorselectmenu('refresh');
		}
	);
	root.refresh('color');
}

function EditSettings() {
	$('ul#types li').remove();
	for (var i = 0; i < UserTypes.length; ++i) {
		var typeroot = $('<li></li>');
		var removebutton = $('<button class="compact remove"><span class="ui-icon ui-icon-minus"></span></button>');
		removebutton
			.button()
			.click(
				(function(root) {
					return function() {
						root.remove();
					};
				})(typeroot)
			);
		var typename = $('<input type="text" class="typename" placeholder="Type Name" value="' + UserTypes[i] + '" />');

		typeroot.append(removebutton).append(typename);

		$('ul#types').append(typeroot);
	}

	$('ul#colors li').remove();
	for (var i = 0; i < UserColors.length; ++i) {
		var colorroot = $('<li></li>');
		var removebutton = $('<button class="compact remove"><span class="ui-icon ui-icon-minus"></span></button>');
		removebutton
			.button()
			.click(
				(function(root) {
					return function() {
						root.remove();
					};
				})(colorroot)
			);
		var colorcode = $('<input type="text" class="colorcode" placeholder="Color Code" value="' + UserColors[i] + '" />');

		colorroot.append(removebutton).append(colorcode);

		$('ul#colors').append(colorroot);
	}
	
	$('div#settingseditor').dialog({
		modal: true,
		width: 400,
		buttons: {
			Ok: function() {
				UserTypes = [];
				$('ul#types li').each(
					function() {
						UserTypes.push($(this).children('input.typename').val());
					}
				);

				UserColors = [];
				$('ul#colors li').each(
					function() {
						UserColors.push($(this).children('input.colorcode').val());
					}
				);

				RefreshTypes();
				RefreshColors();
				
				$(this).dialog('close');
			}
		}
	});
}

function XMLEscape(str) {
	return str.toString().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('\'', '&apos;');
}
function XMLUnescape(str) {
	return str.toString().replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&apos;', '\'');
}

function XMLBuilder() {
	this.text = '<?xml version="1.0" encoding="UTF-8"?>\n';
	this.indent = 0;
}
XMLBuilder.prototype.addIndents =
	function() {
		for (var i = 0; i < this.indent; ++i)
			this.text += '\t';
	};
XMLBuilder.prototype.single =
	function(tagname, props) {
		if (props == undefined)
			props = null;
	
		this.addIndents();
		this.text += '<' + tagname;
		for (propname in props)
			this.text += ' ' + XMLEscape(propname) + '="' + XMLEscape(props[propname]) + '"';
		this.text += '/>\n';
	};
XMLBuilder.prototype.open =
	function(tagname, props) {
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
	function(tagname) {
		--this.indent;
		this.addIndents();
		this.text += '</' + tagname + '>\n';
	};

function Property(parent, name, type, color) {
	if (parent === undefined)
		throw 'Property created without parent';
	if (name == undefined)
		name = '';
	if (type == undefined)
		type = TypeEnum.DEFAULT;
	if (color == undefined)
		color = ColorEnum.DEFAULT;

	this.invalid = {
		emptyName: false,
		duplicateName: false,
		type: false,
		color: false
	};
	this.parent = parent;
	this.properties = [];

	this.initUI();

	this.setName(name);
	this.setType(type);
	this.setColor(color);
}
Property.prototype.remove =
	function() {
		if (this.parent != null)
			this.parent.removeProperty(this);
	};
Property.prototype.notifyParent =
	function(change, from) {
		if (this.notify != null)
			this.notify();

		if (from != null && change != null) {
			if (change == 'name' || change == 'property') {
				var names = {};
				for (var i = 0; i < this.properties.length; ++i) {
					if (names[this.properties[i].name] == undefined)
						names[this.properties[i].name] = [this.properties[i]];
					else
						names[this.properties[i].name].push(this.properties[i]);
				}

				for (propname in names) {
					for (var i = 0; i < names[propname].length; ++i)
						names[propname][i].setInvalid('duplicateName', names[propname].length > 1);
				}
			}
			
			change = 'propagate';
		}
		
		if (this.parent != null)
			this.parent.notifyParent(change, this);
	};
Property.prototype.setInvalid =
	function(attrib, invalid) {
		this.invalid[attrib] = invalid;

		if (this.type != TypeEnum._TAGROOT && this.isInvalid())
			this.ui.root.addClass('invalid');
		else
			this.ui.root.removeClass('invalid');
	};
Property.prototype.isInvalid =
	function() {
		for (prop in this.invalid)
			if (this.invalid[prop] == true)
				return true;
		return false;
	};
Property.prototype.setNotify =
	function(notify) {
		this.notify = notify;
	};
Property.prototype.refresh =
	function(prop) {
		switch (prop) {
			case 'type':
				if (this.type != TypeEnum._TAGROOT && this.type != TypeEnum._TAG && Types.indexOf(this.type) == -1)
					this.setType(TypeEnum.DEFAULT);
				break;
			case 'color':
				if (Colors.indexOf(this.color) == -1)
					this.setColor(ColorEnum.DEFAULT);
				break;
			default:
				break;
		}
		for (var i = 0; i < this.properties.length; ++i)
			this.properties[i].refresh(prop);
	};
Property.prototype.setName =
	function(name) {
		this.name = name;
		this.ui.name.val(name);
		this.setInvalid('emptyName', this.name == '');
		this.notifyParent('name');
	};
Property.prototype.setType =
	function(type) {
		if (type == this.type)
			return;

		this.clearProperties();
		
		this.type = type;
		this.ui.type.val(this.type);

		this.setInvalid('type', this.type == TypeEnum.ANY);

		this.ui.add.hide();

		switch (this.type) {
			case TypeEnum.OBJECT:
				this.ui.add.show();
				break;
			case TypeEnum.ARRAY:
				var prop = new Property(this, 'array');
				prop.ui.colorbar.hide();
				prop.ui.grip.hide();
				prop.ui.remove.hide();
				prop.ui.color.hide();
				prop.ui.name.hide();
				this.addProperty(prop);
				break;
			case TypeEnum._TAG:
				this.ui.name.attr('placeholder', 'Tag Name');
				this.ui.type.hide();
				this.ui.add.show();
				break;
			case TypeEnum._TAGROOT:
				this.ui.grip.hide();
				this.ui.remove.hide();
				this.ui.colorbar.hide();
				this.ui.color.hide();
				this.ui.name.attr('placeholder', 'Tag Name');
				this.ui.type.hide();
				this.ui.add.show();
				break;
			default:
				this.ui.add.hide();
				break;
		}
		this.notifyParent('type');
	};
Property.prototype.setColor =
	function(color) {
		this.color = color;
		this.ui.color.css({'background': color});
		this.ui.colorbar.css({'background-color': color});
		this.notifyParent('color');
	};
Property.prototype.addProperty =
	function(prop) {
		this.properties.push(prop);
		this.ui.properties
			.append(prop.ui.root)
			.sortable('refresh');
		prop.notifyParent('property');
	};
Property.prototype.removeProperty =
	function(prop) {
		this.properties.splice(this.properties.indexOf(prop), 1);
		prop.ui.root.remove();
		prop.notifyParent('property');
	};
Property.prototype.clearProperties =
	function() {
		for (var i = 0; i < this.properties.length; ++i)
			this.properties[i].ui.root.remove();
		this.properties = [];
		this.notifyParent('propagate');
	};
Property.prototype.getPropertyByUI =
	function(propui) {
		for (var i = 0; i < this.properties.length; ++i)
			if (this.properties[i].ui.root.is(propui))
				return this.properties[i];
		return null;
	};
Property.prototype.reorder =
	function(prop, index) {
		this.properties.splice(this.properties.indexOf(prop), 1);
		this.properties.splice(index, 0, prop);
		prop.ui.root.detach();

		if (index == 0)
			this.ui.properties.prepend(prop.ui.root);
		else
			prop.ui.root.insertAfter($(this.ui.properties.children('li')[index - 1]));
		
		prop.notifyParent('reorder');
	};
Property.prototype.initUI =
	function() {
		this.ui = {};
		
		this.ui.root = $('<li class="propertyroot ui-state-default"></li>');

		// color bar
		this.ui.colorbar = $('<div class="colorbar"></div>');
		this.ui.root.append(this.ui.colorbar);

		// grip
		this.ui.grip = $('<div class="grip"><span class="ui-icon ui-icon-grip-dotted-vertical"></span></div>');
		this.ui.root.append(this.ui.grip);

		// remove button
		this.ui.remove = $('<button class="remove compact"><span class="ui-icon ui-icon-minus"></span></button>');
		this.ui.root.append(this.ui.remove);
		this.ui.remove
			.button()
			.click(
				(function(prop) {
					return function() {
						prop.remove();
					};
				})(this)
			);

		// color
		this.ui.colorinput = RefillSelect($('<select class="colorselect"></select>'), Colors);
		this.ui.root.append(this.ui.colorinput);
		this.ui.colorinput
			.colorselectmenu({
				appendTo: this.ui.root,
				change:
					(function(prop) {
						return function() {
							prop.setColor($(this).val());
						}
					})(this)
			});
		this.ui.color = this.ui.colorinput.colorselectmenu('widget');
		this.ui.color.addClass('color');

		// name
		this.ui.name = $('<input type="text" class="nameinput" placeholder="Property Name" value="' + this.name + '" />');
		this.ui.root.append(this.ui.name);
		this.ui.name
			.on(
				'input',
				(function(prop) {
					return function() {
						prop.setName($(this).val());
					};
				})(this)
			);

		// type
		this.ui.type = RefillSelect($('<select class="typeselect"></select>'), Types);
		this.ui.root.append(this.ui.type);
		this.ui.type.change(
			(function(prop) {
				return function() {
					prop.setType($(this).val());
				};
			})(this)
		);

		// add button
		this.ui.add = $('<button class="add compact"><span class="ui-icon ui-icon-plus"></span></button>');
		this.ui.root.append(this.ui.add);
		this.ui.add
			.button()
			.click(
				(function(prop) {
					return function() {
						if (prop.type == TypeEnum._TAGROOT)
							prop.addProperty(new Property(prop, prop.name, TypeEnum._TAG));
						else
							prop.addProperty(new Property(prop));
					}
				})(this)
			);

		// properties
		this.ui.properties = $('<ul class="properties"></ul>');
		this.ui.root.append(this.ui.properties);
		this.ui.properties
			.sortable({
				axis: 'y',
				containment: 'document',
				handle: '.grip'
			})
			.on(
				'sortupdate',
				(function(prop) {
					return function(event, ui) {
						prop.reorder(
							prop.getPropertyByUI(ui.item),
							prop.ui.properties.children('li').index(ui.item)
						);
					};
				})(this)
			);
	};
Property.prototype.buildTypeXML =
	function(builder, minimal) {
		if (this.type != TypeEnum._TAGROOT && minimal == true && this.isInvalid())
			return false;

		switch (this.type) {
			case TypeEnum.ARRAY:
				builder.open('property', {type: this.type});
				if (!this.properties[0].buildTypeXML(builder, minimal))
					return false;

				builder.close('property');
				break;
			case TypeEnum.OBJECT:
				builder.open('property', {type: this.type});

				for (var i = 0; i < this.properties.length; ++i)
					if (!this.properties[i].buildXML(builder, minimal))
						return false;

				builder.close('property');
				break;
			default:
				var attribs = {type: this.type};
				builder.single('property', attribs);
				break;
		}

		return true;
	};
Property.prototype.buildXML =
	function(builder, minimal) {
		if (this.type != TypeEnum._TAGROOT && minimal == true && this.isInvalid())
			return false;
		
		switch (this.type) {
			case TypeEnum._TAGROOT:
				minimal = builder;
				if (minimal != true)
					minimal = false;
				 
				builder = new XMLBuilder();

				builder.open('data', {tags: this.properties.length});

				if (!minimal) {
					for (var i = 0; i < UserTypes.length; ++i)
						builder.single('type', {name: UserTypes[i]});

					for (var i = 0; i < UserColors.length; ++i)
						builder.single('color', {code: UserColors[i]});
				}

				for (var i = 0; i < this.properties.length; ++i)
					if (!this.properties[i].buildXML(builder, minimal))
						return null;

				builder.close('data');
				return builder.text;
			case TypeEnum._TAG:
				var attribs = {name: this.name, id: this.parent.properties.indexOf(this) + 1};
				if (!minimal)
					attribs['color'] = this.color;
				builder.open('tag', attribs);

				for (var i = 0; i < this.properties.length; ++i)
					if (!this.properties[i].buildXML(builder, minimal))
						return false;

				builder.close('tag');
				break;
			case TypeEnum.ARRAY:
				var attribs = {name: this.name, type: this.type};
				if (!minimal)
					attribs['color'] = this.color;
				builder.open('property', attribs);

				if (!this.properties[0].buildTypeXML(builder, minimal))
					return false;

				builder.close('property');
				break;
			case TypeEnum.OBJECT:
				var attribs = {name: this.name, type: this.type};
				if (!minimal)
					attribs['color'] = this.color;
				builder.open('property', attribs);

				for (var i = 0; i < this.properties.length; ++i)
					if (!this.properties[i].buildXML(builder, minimal))
						return false;

				builder.close('property');
				break;
			default:
				var attribs = {name: this.name, type: this.type};
				if (!minimal)
					attribs['color'] = this.color;
				builder.single('property', attribs);
				break;
		}

		return true;
	};
Property.prototype.saveXML =
	function(minimal) {
		var xml = this.buildXML(minimal);
		if (xml == null)
			$('<p>There are one or more invalid tags in this definition which may not be saved.</p>').dialog({
				modal: true,
				buttons: {
					Ok: function() {
						$(this).dialog('close')
					}
				}
			});
		else {
			var blob = new Blob([xml], {type: 'text/xml;charset=utf-8'});
			window.saveAs(blob, FileName(minimal));
		}
	};
Property.prototype.parseXML =
	function(xml) {
		switch (this.type) {
			case TypeEnum._TAGROOT:
				this.clearProperties();
				xml.find('type').each(
					function() {
						UserTypes.push($(this).attr('name'));
					}
				);
				RefreshTypes();
				xml.find('color').each(
					function() {
						UserColors.push($(this).attr('code'));
					}
				);
				RefreshColors();
				xml.find('tag').each(
					(function(root) {
						return function() {
							root.addProperty((new Property(root, null, TypeEnum._TAG)).parseXML($(this)));
						};
					})(this)
				);
				break;
			case TypeEnum._TAG:
				this.setName(xml.attr('name'));
				if (xml.attr('color') != undefined)
					this.setColor(xml.attr('color'));
				xml.children('property').each(
					(function(tag) {
						return function() {
							tag.addProperty((new Property(tag)).parseXML($(this)));
						};
					})(this)
				);
				break;
			default:
				this.setName(xml.attr('name'));
				this.setType(xml.attr('type'));
				if (xml.attr('color') != undefined)
					this.setColor(xml.attr('color'));

				if (this.type == TypeEnum.ARRAY) {
					this.properties[0].parseXML(xml.children('property'));
				} else {
					xml.children('property').each(
						(function(prop) {
							return function() {
								prop.addProperty((new Property(prop)).parseXML($(this)));
							};
						})(this)
					);
				}
				break;
		}

		return this;
	};
Property.prototype.validate =
	function(other) {
		if (other.type != TypeEnum.ANY && this.type != other.type)
			return false;

		if (other.color != ColorEnum.ANY && this.color != other.color)
			return false;

		if (this.name.indexOf(other.name) == -1)
			return false;

		return true;
	};
Property.prototype.filter =
	function(props, onlyInvalid, hasInvalidAncestor) {
		if (onlyInvalid == undefined)
			onlyInvalid = false;
		if (hasInvalidAncestor == undefined)
			hasInvalidAncestor = false;
		
		if (this.type == TypeEnum._TAGROOT) {
			for (var i = 0; i < this.properties.length; ++i)
				this.properties[i].filter([props], onlyInvalid);
		} else {
			var like = [];
			var childprops = [];
			var matches = true;
			var hasInvalid = hasInvalidAncestor || this.isInvalid();

			for (var i = 0; i < props.length; ++i)
				if (this.validate(props[i]))
					like.push(props[i]);

			if (like.length > 0) {
				for (var i = 0; i < like.length; ++i)
					for (var j = 0; j < like[i].properties.length; ++j)
						childprops.push(like[i].properties[j]);
				if (childprops.length != 0 && this.properties.length == 0)
					matches = false;
			} else if (props.length != 0)
				matches = false;

			for (var i = 0; i < this.properties.length; ++i)
				hasInvalid = hasInvalid || this.properties[i].filter(childprops, onlyInvalid, hasInvalid);

			var show = matches && (!onlyInvalid || hasInvalid);
			if (show)
				this.ui.root.show();
			else
				this.ui.root.hide();

			return hasInvalid;
		}
	};
Property.prototype.sort =
	function(order) {
		var orderedProps = this.properties.slice(0);
		orderedProps.sort(
			function(a, b) {
				for (var i = 0; i < order.length; ++i) {
					var prop = order[i];
					if (a[prop] > b[prop])
						return -1;
					else if (a[prop] < b[prop])
						return 1;
				}
				return 0;
			}
		);

		for (var i = 0; i < orderedProps.length; ++i)
			this.reorder(orderedProps[i], 0);

		for (var i = 0; i < this.properties.length; ++i)
			this.properties[i].sort(order);
	};
