YouTube = {
	state: 0,
	queued: null,
	Init: function() {
		if (YouTube.state != 0)
			return;
		
		YouTube.state = 1;
		window.onYouTubeIframeAPIReady = function() {
			YouTube.state = 2;
			if (YouTube.queued)
				YouTube.PlayVideo(YouTube.queued);
			YouTube.queued = null;
		};
		
		var tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	},
	PlayVideo: function(videoId) {
		if (videoId == undefined)
			videoId = 'YVEY24ieq08';
		
		if (YouTube.state != 2) {
			if (YouTube.state == 0)
				YouTube.Init();
			YouTube.queued = videoId;
			return;
		}
		
		var tagid = 'YouTubePlayer';
		
		var playerDiv = document.createElement('div');
		playerDiv.id = tagid;
		document.getElementsByTagName('body')[0].appendChild(playerDiv);
		
		var player = new YT.Player(tagid, {
			width: window.innerWidth,
			height: window.innerHeight,
			videoId: videoId,
			playerVars: {
				'autoplay': 1,
				'controls': 0,
				'modestbranding': 1,
				'iv_load_policy': 3,
				'cc_load_policy': 0,
				'rel': 0,
				'showinfo': 0
			},
			events: {
				'onStateChange': function(event) {
					if (event.data == YT.PlayerState.PLAYING) {
						var iframe = player.f;
						iframe.style.display = 'block';
						iframe.style.position = 'absolute';
						iframe.style.left = '0px';
						iframe.style.top = '0px';
						iframe.style.zIndex = 10;
					} else if (event.data == YT.PlayerState.ENDED) {
						document.getElementsByTagName('body')[0].removeChild(player.f);
					}
				}
			}
		});
		player.f.style.display = 'none';
	}
};
