/*globals  $: true, getUserMedia: true, alert:true, ccv:true */

/*! getUserMedia demo - v1.0
* for use with https://github.com/addyosmani/getUserMedia.js
* Copyright (c) 2012 addyosmani; Licensed MIT */

 (function () {
	'use strict';

	var App = {

		init: function () {

			// The shim requires options to be supplied for it's configuration,
			// which can be found lower down in this file. Most of the below are
			// demo specific and should be used for reference within this context
			// only
			if ( !!this.options ) {

				this.pos = 0;
				this.cam = null;
				this.filter_on = false;
				this.filter_id = 0;
				this.canvas = document.getElementById("canvas");
				this.ctx = this.canvas.getContext("2d");
				this.img = new Image();
				this.ctx.clearRect(0, 0, this.options.width, this.options.height);
				this.image = this.ctx.getImageData(0, 0, this.options.width, this.options.height);
				this.snapshotBtn = document.getElementById('takeSnapshot');
				this.whiteFlash = document.getElementById('whiteFlash');
				this.photoNum = 4;
				this.photoArr = new Array();

				// Initialize getUserMedia with options
				getUserMedia(this.options, this.success, this.deviceError);

				// Initialize webcam options for fallback
				window.webcam = this.options;

				// Trigger a snapshot
				this.addEvent('click', this.snapshotBtn, this.getSnapshot);

			} else {
				alert('No options were supplied to the shim!');
			}
		},

		addEvent: function (type, obj, fn) {
			if (obj.attachEvent) {
				obj['e' + type + fn] = fn;
				obj[type + fn] = function () {
					obj['e' + type + fn](window.event);
				}
				obj.attachEvent('on' + type, obj[type + fn]);
			} else {
				obj.addEventListener(type, fn, false);
			}
		},

		// options contains the configuration information for the shim
		// it allows us to specify the width and height of the video
		// output we're working with, the location of the fallback swf,
		// events that are triggered onCapture and onSave (for the fallback)
		// and so on.
		options: {
			"audio": false, //OTHERWISE FF nightlxy throws an NOT IMPLEMENTED error
			"video": {
						mandatory: {
							minWidth: 1024,
					        minHeight: 576
					    }
					},
			el: "webcam",

			extern: null,
			append: true,

			// noFallback:true, use if you don't require a fallback

			width: 1024,
			height: 576,

			mode: "callback",
			// callback | save | stream
			swffile: "../dist/fallback/jscam_canvas_only.swf",
			quality: 100,
			context: "",

			debug: function () {},
			onCapture: function () {
				window.webcam.save();
			},
			onTick: function () {},
			onSave: function (data) {

				var col = data.split(";"),
					img = App.image,
					tmp = null,
					w = this.width,
					h = this.height;

				for (var i = 0; i < w; i++) {
					tmp = parseInt(col[i], 10);
					img.data[App.pos + 0] = (tmp >> 16) & 0xff;
					img.data[App.pos + 1] = (tmp >> 8) & 0xff;
					img.data[App.pos + 2] = tmp & 0xff;
					img.data[App.pos + 3] = 0xff;
					App.pos += 4;
				}

				if (App.pos >= 4 * w * h) {
					App.ctx.putImageData(img, 0, 0);
					App.pos = 0;
				}

			},
			onLoad: function () {}
		},

		success: function (stream) {

			App.startCamera();

			if (App.options.context === 'webrtc') {

				var video = App.options.videoEl;

		        if ((typeof MediaStream !== "undefined" && MediaStream !== null) && stream instanceof MediaStream) {

		          video.src = stream;
		          return video.play();
		        } else {
		          var vendorURL = window.URL || window.webkitURL;
		          video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
		        }

				video.onerror = function () {
					stream.stop();
					streamError();
				};

			} else{
				// flash context
			}

		},

		deviceError: function (error) {
			alert('No camera available.');
			console.error('An error occurred: [CODE ' + error.code + ']');
		},

		changeFilter: function () {
			if (this.filter_on) {
				this.filter_id = (this.filter_id + 1) & 7;
			}
		},

		startCamera: function() {
			App.messageManager(100);
			$('#loader').hide();
		},

		getSnapshot: function () {
			// If the current context is WebRTC/getUserMedia (something
			// passed back from the shim to avoid doing further feature
			// detection), we handle getting video/images for our canvas
			// from our HTML5 <video> element.
			if (App.options.context === 'webrtc') {

				var currPhotos = App.photoArr.length;
				App.messageManager(currPhotos);

				if(currPhotos < App.photoNum){
					App.countdown();
				} else {
					App.saveSnapshots();
				}

			// Otherwise, if the context is Flash, we ask the shim to
			// directly call window.webcam, where our shim is located
			// and ask it to capture for us.
			} else if(App.options.context === 'flash'){

				window.webcam.capture();
				App.changeFilter();
			}
			else{
				alert('No context was supplied to getSnapshot()');
			}
		},

		takePhoto: function() {
			var can = App.canvas;
			var ctx = can.getContext('2d');
			var video = document.getElementsByTagName('video')[0];

			can.width = video.videoWidth;
			can.height = video.videoHeight;

			ctx.save();
			ctx.scale(-1, 1);
			ctx.drawImage(video, can.width * -1, 0, can.width, can.height);

			var img = can.toDataURL("image/png");
			App.photoArr.push(img);
			App.getSnapshot();
		},

		saveSnapshots: function() {
			var img1 = App.photoArr[0];
			var img2 = App.photoArr[1];
			var img3 = App.photoArr[2];
			var img4 = App.photoArr[3];
			var imgURL = '';

			$.ajax({
				type: "POST",
				cache: false,
				url: "http://projects.local/photobooth_clean/api/saveImage.php",
				data: { img1: img1, img2: img2, img3: img3, img4: img4 },
				success: function(data) {
					imgURL = data;
				}
			}).done(function( msg ) {
				App.photoArr = new Array();
				window.location = '/photobooth_clean/share.html?id=' + imgURL;
			});
		},

		flash: function() {
			$('#whiteFlash').fadeIn(0).fadeOut('slow');
		},

		messageManager: function(count) {

			// close all other messages

			switch(count)
			{
				case 0:
					// show message 1
					$('#begin').hide();
					$('#msg1').show();
					break;
				case 1:
					// show message 2
					$('#msg1').hide();
					$('#msg2').show();
					break;
				case 2:
					// show message 3
					$('#msg2').hide();
					$('#msg3').show();
					break;
				case 3:
					// show message 4
					$('#msg3').hide();
					$('#msg4').show();
					break;
				case 4:
					// show message 4
					$('#msg4').hide();
					$('#msg5').show();
					break;
				case 100:
					// show message 4
					$('#msg0').hide();
					$('#begin').show();
					break;
			}
		},

		countdown: function() {
			var counter = 3;
			var id;

			id = setInterval(function() {
				if(counter < 0) {
					clearInterval(id);

					$('#countdown').hide();

					App.flash();
					App.takePhoto();
				} else {
					$('#countdown').html(counter);
					$('#countdown').show();
				}
				counter--;
			}, 1000);
		}

	};

	App.init();

})();

