var edited = false;

$(document).ready(
	function()
	{
		shortcut.add('Ctrl+S', function() { SaveXML(undefined); });
		shortcut.add('Ctrl+Shift+S', function() { SaveXML(true); });
		shortcut.add('Ctrl+Shift+F', function() { UpdateFilter(); });
		shortcut.add('Ctrl+Shift+R', function() { ClearFilter(); });
		shortcut.add('Ctrl+Shift+A', function() { $('div#editor input#checkbox').click(); });
		shortcut.add('Ctrl+O', function() { $('div#file input#file').click(); });
		shortcut.add('Ctrl+D', function() { $('div#editor input#sorttags').click(); });
		shortcut.add('Ctrl+Shift+D', function() { $('div#editor input#sortproperties').click(); });
		
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
					if (e.originalEvent.dataTransfer.files.length)
					{
						e.preventDefault();
						e.stopPropagation();
						LoadXML(e.originalEvent.dataTransfer.files[0]);
					}
				}
			}
		);

		$('div#file input#file').change(
			function (e)
			{
				if (e.target.files.length > 0)
					LoadXML(e.target.files[0]);
			}
		);
		$('div#file input#save').click(SaveXML);

		$('div#filter input#checkbox').prop('state', 0).prop('indeterminate', true).change(ChangeFilterChecked).change(UpdateFilter);
		$('div#filter input#tagfilter').on('input', UpdateFilter);
		$('div#filter input#propfilter').on('input', UpdateFilter);
		$('div#filter input#validate').click(
			function()
			{
				if (Validate())
					alert('All tags are valid');
			}
		);
		
		$('div#editor input#checkbox').click(ChangeAllChecked);
		$('div#editor input#add').click(SetEdited).click(AddTag);
		$('div#editor input#sort').click(
			function()
			{
				SortTags();
				$('div#tags div.tag').each(
					function()
					{
						SortProperties($(this), ($('div#editor select#sorttype').val() == 'namefirst'));
					}
				);
			}
		);
	}
);

$(window).on(
	'beforeunload',
	function()
	{
		if (edited)
			return 'You have unsaved changes to the current XML file. Discard changes?';
	}
);

function SetEdited()
{
	edited = true;
}

function GetTagCheckbox()
{
	var checkbox = $('<input class="checkbox" type="checkbox" />');
	checkbox.change(ChangeTagChecked);
	return checkbox;
}

function GetTypeSelect()
{
	var select = $('<select class="type">\
		<option value="bool">Bool</option>\
		<option value="byte">Byte</option>\
		<option value="sbyte">SByte</option>\
		<option value="char">Char</option>\
		<option value="double">Double</option>\
		<option value="float">Float</option>\
		<option value="int">Int</option>\
		<option value="uint">UInt</option>\
		<option value="list">List</option>\
		<option value="long">Long</option>\
		<option value="ulong">ULong</option>\
		<option value="object">Object</option>\
		<option value="short">Short</option>\
		<option value="ushort">UShort</option>\
		<option value="string">String</option>\
		<option value="tag">Tag</option>\
		</select>');
	select.change(SetEdited);
	select.change(SetPropertyType);
	return select;
}

function GetTagNameInput()
{
	var input = $('<input class="name" type="text" placeholder="Tag Name" />');
	input.change(SetEdited).blur(ValidateTags);
	return input;
}

function GetPropertyNameInput()
{
	var input = $('<input class="name" type="text" placeholder="Property Name" />');
	input.change(SetEdited).blur(function() { ValidateProps($(this).parent().parent()); });
	return input;
}

function GetPropertyValueInput()
{
	var input = $('<input class="value" type="checkbox" placeholder="Value" />');
	input.change(SetEdited);
	return input;
}

function GetStaticCheckbox()
{
	var input = $('<input class="static" type="checkbox" />');
	input.change(SetStatic);
	return input;
}

function GetTagRemoveButton()
{
	var button = $('<input class="remove" type="button" value="-" />');
	button.click(SetEdited).click(RemoveObject).click(ValidateTags);
	return button;
}

function GetPropertyRemoveButton()
{
	var button = $('<input class="remove" type="button" value="-" />');
	button.click(
		function()
		{
			SetEdited();
			var root = $(this).parent().parent();
			RemoveObject.call(this);
			ValidateProps(root);
		}
	);
	return button;
}

function GetAddButton()
{
	var button = $('<input class="add" type="button" value="+" />');
	button.click(SetEdited);
	button.click(AddProperty);
	return button;
}

function GetNewProperty()
{
	var prop = $('<div class="property"></div>');
	prop.append(GetStaticCheckbox());
	prop.append(GetPropertyRemoveButton());
	prop.append(GetPropertyNameInput());
	prop.append(GetTypeSelect());
	prop.append(GetPropertyValueInput());
	return prop;
}

function GetNewTag()
{
	var tag = $('<div class="tag"></div>');
	tag.append(GetTagCheckbox());
	tag.append(GetTagRemoveButton());
	tag.append(GetTagNameInput());
	tag.append(GetAddButton());
	return tag;
}

function ChangeTagChecked()
{
	var target = $(this);
	var tag = target.parent();

	if (tag.hasClass('checked') && !target.prop('checked'))
		tag.removeClass('checked');
	else if (!tag.hasClass('checked') && target.prop('checked'))
		tag.addClass('checked');

	UpdateAllChecked();
}

function AddProperty()
{
	var target = $(this);
	var parent = target.parent();
	var isStatic = (parent.hasClass('property') && parent.children('input.static').prop('checked'));
	var newProperty = GetNewProperty();
	parent.append(newProperty);
	if (isStatic)
		newProperty.children('input.static').prop('checked', true).change();
	ValidateProps(parent);
}

function RemoveObject()
{
	var target = $(this);
	var prop = target.parent();
	prop.remove();
}

function ClearFilter()
{
	$('div#filter input#checkbox').prop('state', 0).prop('indeterminate', true);
	$('div#filter input#tagfilter').val('');
	$('div#filter input#propfilter').val('');
	UpdateFilter();
}

function AddTag()
{
	var tag = GetNewTag();
	$('div#tags').append(tag);
	tag.children('input.name').val($('div#editor input#tagname').val());
	$('div#editor input#tagname').val();
	ValidateTags();
	UpdateFilter();
}

function SetPropertyType()
{
	var target = $(this);
	var prop = target.parent();
			prop.children('input.static').prop('checked', false).change();
	var value = prop.children('input.value');
	value.remove();
	value = GetPropertyValueInput();
	prop.append(value);

	prop.children('div.property').remove();

	switch (target.val())
	{
		case 'bool':
			value.attr('type', 'checkbox');
			break;
		case 'byte':
			value.attr('type', 'number');
			value.attr('min', '0');
			value.attr('max', '255');
			value.attr('step', '1');
			break;
		case 'sbyte':
			value.attr('type', 'number');
			value.attr('min', '-128');
			value.attr('max', '127');
			value.attr('step', '1');
			break;
		case 'char':
			value.attr('type', 'text');
			value.attr('maxlength', '1');
			break;
		case 'double':
			value.attr('type', 'number');
			break;
		case 'float':
			value.attr('type', 'number');
			break;
		case 'int':
			value.attr('type', 'number');
			value.attr('min', '-2147483648');
			value.attr('max', '2147483647');
			value.attr('step', '1');
			break;
		case 'uint':
			value.attr('type', 'number');
			value.attr('min', '0');
			value.attr('min', '4294967295');
			value.attr('step', '1');
			break;
		case 'list':
			value.attr('type', 'button');
			value.attr('value', '+');
			value.click(AddProperty);
			prop.children('input.static').prop('checked', false).change();
			break;
		case 'long':
			value.attr('type', 'number');
			value.attr('min', '–9223372036854775808');
			value.attr('max', '9223372036854775807');
			value.attr('step', '1');
			break;
		case 'ulong':
			value.attr('type', 'number');
			value.attr('min', '0');
			value.attr('max', '18446744073709551615');
			value.attr('step', '1');
			break;
		case 'object':
			value.attr('type', 'button');
			value.attr('value', '+');
			value.click(AddProperty);
			break;
		case 'short':
			value.attr('type', 'number');
			value.attr('min', '-32768');
			value.attr('max', '32767');
			value.attr('step', '1');
			break;
		case 'ushort':
			value.attr('type', 'number');
			value.attr('min', '0');
			value.attr('max', '65535');
			value.attr('step', '1');
			break;
		case 'string':
			value.attr('type', 'text');
			break;
		case 'tag':
			value.attr('type', 'hidden');
			prop.children('input.static').prop('checked', false).change();
			break;
		default:
			alert('Invalid property type \'' + target.val() + '\'');
			break;
	}
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

XMLBuilder.prototype.addIndents = function()
{
	for (var i = 0; i < this.indent; ++i)
		this.text += '\t';
};
XMLBuilder.prototype.single = function(tagname, props)
{
	if (props == undefined)
		props = null;
	
	this.addIndents();
	this.text += '<' + tagname;
	for (propname in props)
		this.text += ' ' + XMLEscape(propname) + '="' + XMLEscape(props[propname]) + '"';
	this.text += '/>\n';
};
XMLBuilder.prototype.open = function(tagname, props)
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
XMLBuilder.prototype.close = function(tagname)
{
	--this.indent;
	this.addIndents();
	this.text += '</' + tagname + '>\n';
};

function BuildXML(onlyChecked)
{
	var builder = new XMLBuilder();
	var tags = $('div#tags div.tag');

	builder.open('data');

	builder.single('meta', {count: tags.length});

	builder.open('tags');
	var index = 1;
	tags.each(
		function()
		{
			var tag = $(this);

			if (onlyChecked == true && !tag.children('input.checkbox').prop('checked'))
				return;

			builder.open('tag', {name: tag.children('input.name').val(), id: index++});
			tag.children('div.property').each(
				function()
				{
					BuildProperty.call(this, builder);
				}
			);
			builder.close('tag');
		}
	);
	builder.close('tags');

	builder.close('data');

	return builder.text;
}

function BuildProperty(builder)
{
	var prop = $(this);
	var type = prop.children('select.type').val();
	var isStatic = prop.children('input.static').prop('checked');

	if (type != 'object' && type != 'list' && type != 'tag')
	{
		var args =
			{
				name: prop.children('input.name').val(),
				'type': type,
				value: (type == 'bool' ? prop.children('input.value').prop('checked') : prop.children('input.value').val())
			};
		if (isStatic)
			args['static'] = true;
		builder.single(
			'property',
			args
		);
	}
	else
	{
		var args =
			{
				name: prop.children('input.name').val(),
				type: type
			};
		if (isStatic)
			args['static'] = true;
		builder.open(
			'property',
			args
		);
		prop.children('div.property').each(
			function()
			{
				BuildProperty.call(this, builder);
			}
		);
		builder.close('property');
	}
}

function SaveXML(onlyChecked)
{
	if (onlyChecked == undefined)
		onlyChecked = $('div#file input#onlychecked').prop('checked');
	
	window.open('data:text/xml,' + encodeURIComponent(BuildXML(onlyChecked)));
	edited = false;
}

function LoadXML(file)
{
	if (file.type != 'text/xml')
	{
		alert('The given file is not an XML file!');
		return;
	}
	
	if (edited)
		if (!window.confirm('You have unsaved changes to the current XML file. Discard changes?'))
			return;

	$('div#tags').empty();

	var reader = new FileReader();

	reader.onload =
		function()
		{
			ParseXML(reader.result);
			edited = false;
		}

	reader.readAsText(file);
}

function ParseProperty(parent, xprop)
{
	var prop = GetNewProperty();
	parent.append(prop);

	var type = xprop.attr('type');

	prop.children('input.name').val(xprop.attr('name'));
	prop.children('select.type').val(type).change();
	prop.children('input.static').prop('checked', xprop.attr('static') == 'true').change();

	if (type != 'object' && type != 'list')
	{
		if (type == 'bool')
			prop.children('input.value').prop('checked', xprop.attr('value') == 'true');
		else
			prop.children('input.value').val(xprop.attr('value'));
	}
	else
	{
		xprop.children('property').each(
			function()
			{
				ParseProperty(prop, $(this));
			}
		);
	}
}

function ParseXML(raw)
{
	var xml = $(raw);
	var xtags = xml.children('tags').children('tag');

	xtags.each(
		function()
		{
			var xtag = $(this);
			var tag = GetNewTag();
			$('div#tags').append(tag);
			tag.children('input.name').val(xtag.attr('name'));

			xtag.children('property').each(
				function()
				{
					ParseProperty(tag, $(this));
				}
			);
		}
	);
}

function ChangeFilterChecked()
{
	var check = $(this);

	switch (check.prop('state'))
	{
		case -1:
			check.prop('state', 0);
			check.prop('indeterminate', true);
			check.prop('checked', false);
			break;
		case 1:
			check.prop('state', -1);
			check.prop('indeterminate', false);
			check.prop('checked', false);
			break;
		default:
			check.prop('state', 1);
			check.prop('indeterminate', false);
			check.prop('checked', true);
			break;
	}
}

function UpdateFilter()
{
	var check_require = $('div#filter input#checkbox').prop('state');
	var tagfilter = $('div#filter input#tagfilter').val();
	var propfilter = $('div#filter input#propfilter').val();
	var tags = $('div#tags div.tag');

	var require_checked = (check_require == 1);
	var require_unchecked = (check_require == -1);

	tags.each(
		function()
		{
			var tag = $(this);
			var checked = tag.children('input.checkbox').prop('checked');
			var name = tag.children('input.name').val();

			if (name.search(tagfilter) == -1 || (!checked && require_checked) || (checked && require_unchecked))
				tag.hide();
			else
			{
				tag.show();
				var props = tag.children('div.property');

				props.each(
					function()
					{
						var prop = $(this);
						var name = prop.children('input.name').val();

						if (name.search(propfilter) == -1)
							prop.hide();
						else
							prop.show();
					}
				);
			}
		}
	);

	UpdateAllChecked();
}

function UpdateAllChecked()
{
	var tags = $('div#tags div.tag');
	var state = 0;

	tags.each(
		function()
		{
			var tag = $(this);
			var checked = tag.children('input.checkbox').prop('checked');

			if (!tag.is(':hidden'))
			{
				switch (state)
				{
					case 0:
						state = (checked ? 1 : -1);
						break;
					case 1:
						if (!checked)
							state = 2;
						break;
					case -1:
						if (checked)
							state = 2;
						break;
					default:
						break;
				}
			}
		}
	);

	switch (state)
	{
		case 0:
		case 2:
			$('div#editor input#checkbox').prop('checked', false).prop('indeterminate', true);
			break;
		case 1:
			$('div#editor input#checkbox').prop('checked', true).prop('indeterminate', false);
			break;
		case -1:
			$('div#editor input#checkbox').prop('checked', false).prop('indeterminate', false);
			break;
	}
}

function ChangeAllChecked()
{
	var checked = !$('div#editor input#checkbox').prop('checked');
	$('div#editor input#checkbox').prop('checked', checked);
	var tags = $('div#tags div.tag');

	tags.each(
		function()
		{
			var tag = $(this);

			if (tag.is(':hidden'))
				return;

			tag.children('input.checkbox').prop('checked', checked).change();
		}
	);
}

function SetStatic()
{
	var checkbox = $(this);
	var prop = checkbox.parent();
	var isStatic = checkbox.prop('checked');

	if (!isStatic)
	{
		prop = prop.parent();
		while (!prop.hasClass('tag'))
		{
			if (prop.children('input.static').prop('checked'))
			{
				checkbox.prop('checked', true).change();
				return;
			}
			prop = prop.parent();
		}
		checkbox.parent().removeClass('static');
	}
	else
	{
		var type = prop.children('select.type').val();
		if (type == 'list' || type == 'tag')
		{
			checkbox.prop('checked', false).change();
			return;
		}
		prop.addClass('static');
		prop.children('div.property').each(
			function()
			{
				prop.children('div.property').children('input.static').prop('checked', true).change();
			}
		);
	}
}

function SortTags()
{
	var tags = $('div#tags div.tag');

	tags.sort(
		function(a, b)
		{
			var an = $(a).children('input.name').val();
			var bn = $(b).children('input.name').val();

			if (an > bn)
				return 1;
			if (an < bn)
				return -1;
			return 0;
		}
	);

	tags.detach().appendTo($('div#tags'));
}

function SortProperties(prop, namefirst)
{
	var props = prop.children('div.property');

	props.sort(
		function(a, b)
		{
			var as = $(a).children('input.static').prop('checked');
			var bs = $(b).children('input.static').prop('checked');

			if (as != bs)
				return (as ? -1 : 1);

			var at = $(a).children('select.type').val();
			var bt = $(b).children('select.type').val();
			var an = $(a).children('input.name').val();
			var bn = $(b).children('input.name').val();

			if (namefirst)
			{
				if (an > bn)
					return 1;
				if (an < bn)
					return -1;
				if (at > bt)
					return 1;
				if (at < bt)
					return -1;
				return 0;
			}
			else
			{
				if (at > bt)
					return 1;
				if (at < bt)
					return -1;
				if (an > bn)
					return 1;
				if (an < bn)
					return -1;
				return 0;
			}
		}
	);

	props.detach().appendTo(prop);
	props.each(
		function()
		{
			SortProperties($(this), namefirst);
		}
	);
}

function Validate(group, breadcrumbs)
{
	if (group == undefined)
		group = $('div#tags div.tag');

	if (breadcrumbs == undefined)
		breadcrumbs = '';

	names = { };

	for (var i = 0; i < group.length; ++i)
	{
		var name = $(group[i]).children('input.name').val();
		if (names[name] == true)
		{
			if (breadcrumbs == '')
				alert('Duplicate tag name \'' + name + '\'');
			else
				alert('Duplicate property name \'' + name + '\' at \'' + breadcrumbs + '\'');
			return false;
		}
		else
			names[name] = true;
	}

	for (var i = 0; i < group.length; ++i)
	{
		var name = $(group[i]).children('input.name').val();

		if (!Validate($(group[i]).children('div.property'), breadcrumbs + name + '/'))
			return false;
	}

	return true;
}

function ValidateTags()
{
	tags = $('div#tags div.tag');
	names = [];

	tags.each(
		function()
		{
			var tag = $(this);
			var name = tag.children('input.name').val();
			
			if (name == '' || names.indexOf(name) != -1)
				tag.addClass('invalid');
			else
			{
				tag.removeClass('invalid');
				names.push(name);
			}
		}
	);
}

function ValidateProps(parent)
{
	props = parent.children('div.property');
	names = [];

	props.each(
		function()
		{
			var prop = $(this);
			var name = prop.children('input.name').val();

			if (name == '' || names.indexOf(name) != -1)
				prop.addClass('invalid');
			else
			{
				prop.removeClass('invalid');
				names.push(name);
			}
		}
	);
}
