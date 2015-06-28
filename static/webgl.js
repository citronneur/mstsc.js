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

	function WebGl(canvas) {
		this.canvas = canvas;
		//this.ctx = canvas.getContext("2d");
		this.gl = canvas.getContext("webgl");
	}
	
	WebGl.prototype = {
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
			var output = new Uint8Array(outputHeap.buffer, outputHeap.byteOffset, ouputSize);
			
			Module._free(inputPtr);
			Module._free(outputPtr);
			
			// Create a texture object that will contain the image.
			var texture = this.gl.createTexture();

			// Bind the texture the target (TEXTURE_2D) of the active texture unit.
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

			// Flip the image's Y axis to match the WebGL texture coordinate space.
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
			    
			// Set the parameters so we can render any size image.        
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE); 
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

			  // Upload the resized canvas image into the texture.
//			    Note: a canvas is used here but can be replaced by an image object. 
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, output);
		}
	}
	
	Mstsc.WebGl = {
		create : function (canvas) {
			return new WebGl(canvas);
		}
	}
})();
