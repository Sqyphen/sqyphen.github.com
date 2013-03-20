/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */

 (function () {
	'use strict';

	var App = {

		init: function () {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

			if (navigator.getUserMedia && window.URL) {
				var video = document.getElementById('my_camera');

				navigator.getUserMedia({
					"audio": false,
					video: {
						mandatory: {
							minWidth: 1024,
					        minHeight: 576
					    }
					}
				},
				function(stream) {
					// got access, attach stream to video
					video.src = window.URL.createObjectURL( stream ) || stream;
				});
			}
			else {
				alert("getUserMedia not supported on your machine!");
			}
		}

	}

	App.init();

})();

