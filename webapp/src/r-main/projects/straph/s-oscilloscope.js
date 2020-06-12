import {PolymerElement, html} from '@polymer/polymer/polymer-element.js'
import './databuffer.js'
import './lib.js'
import './queue.js'

/** Wrapper around a canvas element to make it behave like a real-time graph. */
export class SOscilloscope extends PolymerElement {
  static get properties() {
    return {
      width: Number,
      height: Number,
      maxy: Number,
      miny: Number,
      sampleRate: Number,
      secondWidth: Number,
    };
  }

  static get template() {
    return html`<canvas id="c" width="{{width}}" height="{{height}}"></canvas>`;
  }

  ready() {
    this.yrange = this.maxy - this.miny;
    this.samplesPerPixel = parseFloat(this.secondWidth) / parseFloat(this.sampleRate);
    this.buffer = new DataBuffer(this.width / this.samplesPerPixel);

    // clear the canvas
    var ctx = this.$.c.getContext('2d');
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  getYCoord(y) {
    var yCoordEucl = (y - this.miny) / this.yrange * this.height;
    return this.height - yCoordEucl;
  }

  addValue(y) {
    // add value in canvas/pixel space to the buffer
    this.buffer.append(this.getYCoord(y));
  }

  draw() {
    var ctx = this.$.c.getContext('2d');

    // clear the canvas
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, this.width, this.height);

    // draw buffer data to canvas
    var curNode = this.buffer.first;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(130,202,250)';
    var x = 0;
    ctx.beginPath();
    ctx.moveTo(x, curNode.val);
    while (curNode.after != null) {
      curNode = curNode.after;
      x += this.samplesPerPixel ;
      ctx.lineTo(x, curNode.val);
    }
    ctx.stroke();
  }
}
customElements.define('s-oscilloscope', SOscilloscope);
