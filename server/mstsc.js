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

var rdp = require('rdp');

/**
 * Create proxy between rdp layer and socket io
 */
module.exports = function (server) {
	var io = require('socket.io')(server);
	var self = this;
	io.on('connection', function(socket) {
	
		socket.on('infos', function (infos) {
			if (self.rdp) {
				self.rdp.close();
			};
			
			self.rdp = rdp.createClient({ 
				
				domain : infos.domain, 
				userName : infos.username,
				password : infos.password,
				enablePerf : true,
				autoLogin : true,
				screen : infos.screen
				
			}).on('connect', function () {
				
				io.emit('connect');
				
			}).on('bitmap', function(bitmap) {
				
				io.emit('bitmap', bitmap);
				
			}).on('close', function() {
				
				io.emit('close');
				
			}).on('error', function(err) {
				
				io.emit('error', err);
				
			}).connect(infos.ip, infos.port);
			
		}).on('mouse', function (x, y, button, isPressed) {
			if (!self.rdp) {
				return;
			}
			self.rdp.sendPointerEvent(x, y, button, isPressed);
			
		}).on('scancode', function (code, isPressed) {
			if (!self.rdp) {
				return;
			}
			self.rdp.sendKeyEventScancode(code, isPressed);
			
		}).on('unicode', function (code, isPressed) {
			if (!self.rdp) {
				return;
			}
			self.rdp.sendKeyEventUnicode(code, isPressed);
			
		}).on('disconnect', function() {
			if(!self.rdp) {
				return;
			}
			self.rdp.close();
		});
	});
}