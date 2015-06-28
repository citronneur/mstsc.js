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

	function Canvas(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
	}
	
	Canvas.prototype = {
		addEventListener : function(name, next) {
			this.canvas.addEventListener(name, next);
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
	
	Mstsc.Canvas = {
		create : function (canvas) {
			return new Canvas(canvas);
		}
	}
})();
