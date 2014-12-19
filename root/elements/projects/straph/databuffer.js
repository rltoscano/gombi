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

// Psuedo-linkedlist, turns into a ring buffer when it reachs maxSize. It's
// meant to be iterated over and not random access. Made specifically for my
// app
function DataBuffer(maxSize) {
  var self = this;
  self.maxSize = parseInt(maxSize);
  self.size = 0;
  self.first = null;
  var last = null;

  function Node (val) {
    var self = this;
    self.val = val;
    self.after = null;
  }

  this.append = function (val) {
    if (self.size < self.maxSize) {
      var n = new Node(val);

      if (last == null) {
        self.first = n;
        last = n;
      }
      else {
        last.after = n;
        last = last.after;
      }

      self.size += 1;
    }
    else {
      // Reuse first node
      var temp = self.first;
      temp.val = val;
      self.first = self.first.after;
      temp.after = null;
      last.after = temp;
      last = temp;
    }
  }

  this.clear = function () {
    self.size = 0;
    self.first = null;
    last = null;
  }

  this.debugPrint = function () {
    var str = '';
    var n = self.first;
    while (n != null) {
      str += n.val + ',';
      n = n.after;
    }
    return str;
  }
}
