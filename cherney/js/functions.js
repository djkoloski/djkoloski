init = function() {
	$('#question-dialog').dialog({
		closeOnEscape: false,
		open: function(event, ui) {
			$('#question-dialog').parent().find('.ui-dialog-titlebar-close').hide();
		},
		autoOpen: false,
		show: {
			effect: 'fade',
			duration: 300
		},
		hide: {
			effect: 'explode',
			duration: 300
		},
		width: 700,
		modal: true
	});
	$('#score-dialog').dialog({
		closeOnEscape: false,
		open: function(event, ui) {
			$('#score-dialog').parent().find('.ui-dialog-titlebar-close').hide();
		},
		autoOpen: false,
		show: {
			effect: 'explode',
			duration: 300
		},
		hide: {
			effect: 'fade',
			duration: 300
		},
		width: 500,
		modal: true
	});
	$('#setup-dialog').dialog({
		closeOnEscape: false,
		open: function(event, ui) {
			$('#setup-dialog').parent().find('.ui-dialog-titlebar-close').hide();
		},
		autoOpen: false,
		show: {
			effect: 'fade',
			duration: 300
		},
		hide: {
			effect: 'fade',
			duration: 300
		},
		width: 500,
		modal: true
	});
	$('#unit-dialog').dialog({
		closeOnEscape: false,
		open: function(event, ui) {
			$('#unit-dialog').parent().find('.ui-dialog-titlebar-close').hide();
		},
		autoOpen: false,
		show: {
			effect: 'explode',
			duration: 300
		},
		hide: {
			effect: 'explode',
			duration: 300
		},
		width: 500,
		modal: true
	});
	
	beginQuizSettings(function(settings) {
		var gs = new GameState(generateGameboard(), generateControls(), settings);
		
		$('#change-settings').only('click', (function(gs) {
			beginQuizSettings((function(gs, settings) {
				gs.quizSettings = settings;
			}).partial(gs, undefined));
		}).partial(gs));
		
		gs.beginTurn();
	});
}

function beginQuizSettings(cb)
{
	$('#setup-dialog').dialog('open');
	
	var settings = new QuizSettings(40, 5, [ ]);
	
	if ($('#time-per-question').val() == '')
		$('#time-per-question').val(settings.timePerQuestion);
	
	if ($('#questions-per-round').val() == '')
		$('#questions-per-round').val(settings.questionsPerRound);
	
	if ($('#question-file').val() == '')
		$('#setup-finish-button').button({disabled: true});
	
	$('#setup-finish-button').only('click', endQuizSettings.partial(settings, cb));
	
	$('#question-file').only('change', function() {
		if ($(this).val() != '')
			$('#setup-finish-button').button({disabled: false});
		else
			$('#setup-finish-button').button({disabled: true});
	});
}

function endQuizSettings(settings, cb)
{
	settings.timePerQuestion = parseInt($('#time-per-question').val());
	settings.questionsPerRound  = parseInt($('#questions-per-round').val());
	loadQuiz((function(cb) {
		$('#setup-dialog').dialog('close');
		cb(settings);
	}).partial(cb), settings, $('#question-file')[0]);
}

function loadQuiz(cb, settings, element) {
	var
		f = element.files[0],
		reader = new FileReader();
	
	reader.onload = (function(event, file, callback) {
		var xml = $(event.target.result);
		
		xml.find('question').each(function() {
			var
				q = $(this),
				text = q.attr('text'),
				c = q.find('choice'),
				choices = [ ];
			
			c.each(function() {
				var tc = $(this);
				choices.push({question: tc.text(), value: parseInt(tc.attr('value'))});
			});
			
			settings.questionPool.push(new Question(text, choices));
		});
		
		callback();
	}).partial(undefined, f, cb);
	
	reader.readAsText(f);
}

function beginCountdown(progressBar, seconds, callbackFunc) {
	progressBar.progressbar({value: 100});
	progressBar.find('.progress-label').text(seconds);
	var
		countData = {bar: progressBar, count: seconds, total: seconds, callback: callbackFunc},
		countFunc = (function() {
			--this.count;
			this.bar.progressbar('option', {value: Math.floor(this.count / this.total * 100)});
			this.bar.find('.progress-label').text(this.count);
			if (this.count <= 0)
			{
				clearInterval(jQuery.data(this.bar, 'id'));
				this.callback();
			}
		}).bind(countData);
	
	var interval = setInterval(countFunc, 1000);
	progressBar.data('id', interval);
}

function endCountdown(progressBar) {
	clearInterval(progressBar.data('id'));
}

function createQuizItems(questions) {
	var container = $('#question-content');
	container.empty();
	
	container.append('<div class="tabs-vertical"><ul id="question-list"></ul></div>');
	
	var
		content = container.find('div'),
		list = container.find('#question-list'),
		answerobj = {answered: 0, total: questions.length, button: $('#question-finish-button')};
	
	var answered = (function(answers) {
		++answers.answered;
		if (answers.answered == answers.total)
			answers.button.button({disabled: false});
	}).partial(answerobj);
	
	for (var i = 0; i < questions.length; ++i)
	{
		list.append('<li><a href="#q' + i + '">' + (i + 1) + '</a></li>');
		content.append('<div id="q' + i + '"></div>');
		questions[i].createBind(content.find('div#q' + i), i, answered);
	}
	
	parser.prepare(container);
}

function beginQuiz(gs) {
	var
		seconds = gs.quizSettings.timePerQuestion * gs.quizSettings.questionsPerRound,
		questions = gs.quizSettings.getRandomSubset();
	
	createQuizItems(questions);
	
	var finishQuiz = endQuiz.partial(gs, questions);
	
	$('#question-dialog').dialog('open');
	$('#question-finish-button').button({disabled: true});
	beginCountdown($('#question-dialog').find('.progress-bar'), seconds, function() { setTimeout(finishQuiz, 300); });
	$('#question-finish-button').only('click', finishQuiz);
}

function endQuiz(gs, questions) {
	$('#question-dialog').dialog('close');
	endCountdown($('#question-dialog').find('.progress-bar'));
	
	var
		points = 0,
		totalpoints = 0,
		right = 0,
		totalquestions = questions.length;
	
	for (var i = 0; i < questions.length; ++i)
	{
		if (questions[i].check())
			++right;
		
		points += questions[i].score();
		totalpoints += questions[i].worth;
	}
	
	var score = Math.floor(gs.quizSettings.pointsPerRound * points / totalpoints);
	
	gs.addPoints(score);
	
	$('#score-count').empty().html('<p>' + right + ' / ' + totalquestions + ' questions</p><p>' + score + ' points</p>');
	$('#score-dialog').dialog('open');
	$('#score-close-button').only('click', function() {
		$('#score-dialog').dialog('close');
	});
}

function generateGameboard()
{
	var gb = new GameBoard();
	
	gb.bind($('div#gameboard'));
	
	return gb;
}

function generateControls()
{
	var con = new GameControls();
	
	con.bind($('div#actionbar'));
	
	return con;
}
