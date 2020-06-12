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

function Averager (size) {
    var count = 0;
    var index = 0;
    var buffer = new Array(size);
    var avg = 0;

    this.add = function(val) {
        val = val;

        buffer[index] = val;
        index = (index + 1) % size;
        if (count < size) count++;

        // just average the first 'count' number of elements in 'buffer'
        var i, sum = 0.0;
        for (i=0; i<count; i++) {
            sum += buffer[i];
        }
        avg = sum / count;
    }

    this.average = function() {
        return avg;
    }

    this.reset = function() {
        count = 0;
        index = 0;
        avg = 0;
    }
}
