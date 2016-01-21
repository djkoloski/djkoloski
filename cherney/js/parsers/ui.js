parser.addParser(function(content) {
	var tabs = content.find('.tabs, .tabs-vertical');
	
	tabs.each(function() {
		var tab = $(this);
		
		tab.removeClass('tabs').tabs();
		
		if (tab.hasClass('tabs-vertical'))
		{
			tab.removeClass('tabs-vertical').addClass('ui-tabs-vertical ui-helper-clearfix');
			tab.children('ul').children('li').removeClass('ui-corner-top').addClass('ui-corner-left');
		}
	});
	
	var buttons = content.find('.button');
	
	buttons.button();
	
	var radiosets = content.find('.radioset');
	
	radiosets.buttonset();
	
	var selectables = content.find('.selectable');
	
	selectables.find('li').each(function() {
		var option = $(this);
		option.prepend('<span class="ui-icon"></span>');
	});
	
	selectables.selectable();
	
	var progressbars = content.find('.progress-bar');
	
	progressbars.progressbar();
});
