/*
 * Copyright (c) 2015 Sylvain Peyrefitte
 *
 * This file is part of mstsc.js.
 *
 * node-rdp is free software: you can redistribute it and/or modify
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
	
	function Mstsc(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.socket = null;
		
		var self = this;
		
		// bind mouse move event
		this.canvas.addEventListener('mousemove', function (e) {
			if (!self.socket) {
				return;
			}
			self.socket.emit('mouse', e.clientX, e.clientY, 0, false);
		});
		
		this.canvas.addEventListener('mousedown', function (e) {
			if (!self.socket) {
				return;
			}
			self.socket.emit('mouse', e.clientX, e.clientY, mouseButtonMap(e.button), true);
			e.preventDefault();
		});
		
		this.canvas.addEventListener('mouseup', function (e) {
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
			console.log('code ' + e.code);
			self.socket.emit('key', e.code, true);
		});
		
		window.addEventListener('keyup', function (e) {
			if (!self.socket) {
				return;
			}
			console.log('code ' + e.keyCode);
			self.socket.emit('key', e.code, false);
		});
	}
	
	Mstsc.prototype = {
		connect : function(ip, domain, username, password) {
			var self = this;
			this.socket = io('http://localhost:3000').on('connect', function() {
				console.log('[mstsc.js] connected');
			}).on('bitmap', function(bitmap) {
				self.update(bitmap);
			}).on('close', function() {
				console.log('[mstsc.js] close');
			}).on('error', function (err) {
				console.log('[mstsc.js] error : ' + err.code + '(' + err.message + ')');
			});
			this.socket.emit('infos', {ip : ip, port : 3389, domain : domain, username : username, password : password});
		},
		
		update : function(bitmap) {
			var input = new Uint8Array(bitmap.data);
			var inputPtr = Module._malloc(input.length);
			var inputHeap = new Uint8Array(Module.HEAPU8.buffer, inputPtr, input.length);
			inputHeap.set(input);
			
			var ouputSize = bitmap.width * bitmap.height * 4;
			var outputPtr = Module._malloc(ouputSize);

			var outputHeap = new Uint8Array(Module.HEAPU8.buffer, outputPtr, ouputSize);


			var res = Module.ccall('bitmap_decompress',
				'number',
				['number', 'number', 'number', 'number', 'number', 'number'],
				[outputHeap.byteOffset, bitmap.width, bitmap.height, inputHeap.byteOffset, input.length, 2]
			);
			var output = new Uint8ClampedArray(outputHeap.buffer, outputHeap.byteOffset, ouputSize);
			var imageData = this.ctx.createImageData(bitmap.width, bitmap.height);
			imageData.data.set(output);
			this.ctx.putImageData(imageData, bitmap.destLeft, bitmap.destTop);
			
			Module._free(inputPtr);
			Module._free(outputPtr);
		}
	}
	
	this.Mstsc = {
		create : function (canvas) {
			return new Mstsc(canvas);
		}
	}
})();
