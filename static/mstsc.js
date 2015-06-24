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
	function Mstsc(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
	}
	
	Mstsc.prototype = {
		connect : function(ip, port) {
			var self = this;
			var socket = io('http://localhost:3000');
			socket.on('connect', function() {
				console.log('rdp client connected');
			}).on('bitmap', function(bitmap) {
				self.update(bitmap);
			});
		},
		
		update : function(bitmap) {
			//console.log('receive bitmap width : ' + bitmap.width + ' height : ' + bitmap.height);
			var output = new Uint8Array(bitmap.width * bitmap.height * 4);
			var input = new Uint8Array(bitmap.data);
//            var res = Module.ccall('bitmap_decompress',
//            		'number',
//            		['array', 'number', 'number', 'number', 'array', 'number'],
//            		[output, bitmap.width, bitmap.height, input, input.length, 2]
//            );
			var res = Module._bitmap_decompress(output, bitmap.width, bitmap.height, input, input.length, 2);
            console.log(output);
            var imageData = this.ctx.createImageData(bitmap.width, bitmap.height);
            imageData.data = output;
            this.ctx.putImageData(imageData, 0, 0);
            
//			var blob = new Blob([ouput], {type: 'image/jpeg'});
//			var img = new Image();
//			img.src = (window.URL).createObjectURL(blob);
//			var self = this;
//			img.onload = function() {
//				console.log('toto');
//			}
		}
	}
	
	this.Mstsc = {
		create : function (canvas) {
			return new Mstsc(canvas);
		}
	}
})();
