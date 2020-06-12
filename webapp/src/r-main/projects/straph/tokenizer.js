// Copyright 2009 Robert Toscano
//
// This file is part of Straph.
//
// Straph is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// Straph is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Straph. If not, see <http://www.gnu.org/licenses/>.

// Requires: lib.js
// Requires: math.js


// Tokenizer - helps parse incoming data from server. Data is separated
// by the 'sep' string.
function Tokenizer (sep) {
  var self = this;
  self.index = 0;
  self.count = 0;

  this.reset = function () {
    self.index = 0;
    self.count = 0;
  }

  this.getNextToken = function(strbuf) {
    if (self.index == strbuf.length) {
      return '';
    }

    var recent = strbuf.substring(self.index, strbuf.length);
    var endOfToken = recent.indexOf(sep);
    if (endOfToken == -1) {
      return '';
    }

    self.count += 1;
    self.index += endOfToken+1;
    return recent.substring(0, endOfToken);
  }
}