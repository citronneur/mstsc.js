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
	function mouseButtonMap(button) {
		switch(button) {
		case 0:
			return 1;
		case 2:
			return 3;
		default:
			return 0;
		}
	};
	
	function Client(render) {
		this.render = render; 
		
		this.socket = null;
		
		var self = this;
		
		// bind mouse move event
		this.render.addEventListener('mousemove', function (e) {
			if (!self.socket) {
				return;
			}
			self.socket.emit('mouse', e.clientX, e.clientY, 0, false);
		});
		
		this.render.addEventListener('mousedown', function (e) {
			if (!self.socket) {
				return;
			}
			self.socket.emit('mouse', e.clientX, e.clientY, mouseButtonMap(e.button), true);
			e.preventDefault();
		});
		
		this.render.addEventListener('mouseup', function (e) {
			if (!self.socket) {
				return;
			}
			self.socket.emit('mouse', e.clientX, e.clientY, mouseButtonMap(e.button), false);
			e.preventDefault();
		});
		
		window.addEventListener('keydown', function (e) {
			if (!self.socket) {
				return;
			}
			//self.socket.emit('key', e.code, true);
		});
		
		window.addEventListener('keyup', function (e) {
			if (!self.socket) {
				return;
			}
			//self.socket.emit('key', e.code, false);
		});
	}
	
	Client.prototype = {
		connect : function(ip, domain, username, password) {
			var self = this;
			this.socket = io('http://localhost:3000').on('connect', function() {
				console.log('[mstsc.js] connected');
			}).on('bitmap', function(bitmap) {
				self.render.update(bitmap);
			}).on('close', function() {
				console.log('[mstsc.js] close');
			}).on('error', function (err) {
				console.log('[mstsc.js] error : ' + err.code + '(' + err.message + ')');
			});
			this.socket.emit('infos', {ip : ip, port : 3389, domain : domain, username : username, password : password});
		}
	}
	
	Mstsc.client = {
		create : function (canvas) {
			return new Client(canvas);
		}
	}
})();
