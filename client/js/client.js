/*
 * Copyright (c) 2015 Sylvain Peyrefitte
 *
 * This file is part of mstsc.js.
 *
 * mstsc.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
	/**
	 * Mouse button mapping
	 * @param button {integer} client button number
	 */
	function mouseButtonMap(button) {
		switch(button) {
		case 0:
			return 1;
		case 2:
			return 2;
		default:
			return 0;
		}
	};
	
	/**
	 * Mstsc client
	 * Input client connection (mouse and keyboard)
	 * bitmap processing
	 * @param canvas {canvas} rendering element
	 */
	function Client(canvas) {
		this.canvas = canvas;
		// create renderer
		this.render = new Mstsc.Canvas.create(this.canvas); 
		this.socket = null;
	}
	
	Client.prototype = {
		/**
		 * connect
		 * @param ip {string} ip target for rdp
		 * @param domain {string} microsoft domain
		 * @param username {string} session username
		 * @param password {string} session password
		 * @param next {function} asynchrone end callback
		 */
		connect : function (ip, domain, username, password, next) {
			// compute socket.io path (cozy cloud integration)
			var parts = document.location.pathname.split('/')
		      , base = parts.slice(0, parts.length - 1).join('/') + '/'
		      , path = base + 'socket.io';
			
			
			// start connection
			var self = this;
			this.socket = io(window.location.protocol + "//" + window.location.host, { "path": path }).on('connect', function() {
				console.log('[mstsc.js] connected');''
				// bind mouse move event
				self.canvas.addEventListener('mousemove', function (e) {
					if (!self.socket) {
						return;
					}
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, 0, false);
					e.preventDefault();
					return false;
				});
				self.canvas.addEventListener('mousedown', function (e) {
					if (!self.socket) {
						return;
					}
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), true);
					e.preventDefault();
					return false;
				});
				self.canvas.addEventListener('mouseup', function (e) {
					if (!self.socket) {
						return;
					}
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), false);
					e.preventDefault();
					return false;
				});
				self.canvas.addEventListener('contextmenu', function (e) {
					if (!self.socket) {
						return;
					}
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), false);
					e.preventDefault();
					return false;
				});
				self.canvas.addEventListener('DOMMouseScroll', function (e) {
					if (!self.socket) {
						return;
					}
					var isHorizontal = false;
					var delta = e.detail;
					var step = Math.round(Math.abs(delta) * 15 / 8);
					
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('wheel', e.clientX - offset.left, e.clientY - offset.top, step, delta > 0, isHorizontal);
					e.preventDefault();
					return false;
				});
				self.canvas.addEventListener('mousewheel', function (e) {
					if (!self.socket) {
						return;
					}
					var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
					var delta = isHorizontal?e.deltaX:e.deltaY;
					var step = Math.round(Math.abs(delta) * 15 / 8);
					
					var offset = Mstsc.elementOffset(self.canvas);
					self.socket.emit('wheel', e.clientX - offset.left, e.clientY - offset.top, step, delta > 0, isHorizontal);
					e.preventDefault();
					return false;
				});
				
				// bind keyboard event
				window.addEventListener('keydown', function (e) {
					if (!self.socket) {
						return;
					}
					if (e.code) {
						self.socket.emit('scancode', Mstsc.keyboard.keyMap[e.code], true);
					}
					else {
						self.socket.emit('unicode', e.keyCode, true);
					}
					e.preventDefault();
					return false;
				});
				window.addEventListener('keyup', function (e) {
					if (!self.socket) {
						return;
					}
					if (e.code) {
						self.socket.emit('scancode', Mstsc.keyboard.keyMap[e.code], false);
					}
					else {
						self.socket.emit('unicode', e.keyCode, false);
					}
					e.preventDefault();
					return false;
				});
			}).on('bitmap', function(bitmap) {
				self.render.update(bitmap);
			}).on('close', function() {
				next(null);
				console.log('[mstsc.js] close');
			}).on('error', function (err) {
				next(err);
				console.log('[mstsc.js] error : ' + err.code + '(' + err.message + ')');
			});
			
			// emit infos event
			this.socket.emit('infos', {ip : ip, port : 3389, screen : { width : this.canvas.width, height : this.canvas.height }, domain : domain, username : username, password : password});
		}
	}
	
	Mstsc.client = {
		create : function (canvas) {
			return new Client(canvas);
		}
	}
})();
