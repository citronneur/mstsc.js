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

	Mstsc = function () {
	}
	
	Mstsc.prototype = {
		$ : function (id) {
			return document.getElementById(id);
		},
		getOffset : function (el) {
		    var x = 0;
		    var y = 0;
		    while (el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop )) {
		        x += el.offsetLeft - el.scrollLeft;
		        y += el.offsetTop - el.scrollTop;
		        el = el.offsetParent;
		    }
		    return { top: y, left: x };
		}
	}
	
})();

this.Mstsc = new Mstsc();