//<link rel="import" href="../../../bower_components/core-ajax/core-ajax.html">
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js'
import './s-oscilloscope.js'
//import '/_ah/channel/jsapi'
import './lib.js'
import './databuffer.js'
import './math.js'
import './queue.js'
import './tokenizer.js'

const MIN_DELAY = .01;

export class SWidget extends PolymerElement {
  constructor() {
    super();
    this.width = 700;
    this.height = 200;
    this.sps = 15;
    this.restartCount = 1000;
    this.bufferSize = 5;
  }

  static get properties() {
    return {
      width: Number,
      height: Number,
      sps: Number,
      restartCount: Number,
      bufferSize: Number,
    };
  }

  static get template() {
    return html`
<table>
  <tr>
    <td><button id="startBtn" on-tap="{{start}}">Start</button></td>
    <td rowspan="2">
      <select id="datasource">
        <option value="sine">Sine Wave</option>
        <option value="microphone">Microphone</option>
      </select>
    </td>
    <td>Width</td>
    <td><input type="text" id="width" value="{{width}}" size="5"/></td>
    <td>RestartCount</td>
    <td><input type="text" id="restartCount" value="{{restartCount}}" size="6"/></td>
    <td>Samples / Second</td>
    <td><input type="text" id="sps" value="{{sps}}" size="2"/></td>
  </tr>
  <tr>
    <td><button id="stopBtn" disabled="true" on-tap="{{stop}}">Stop</button></td>
    <td>Height</td>
    <td><input type="text" id="height" value="{{height}}" size="5"/></td>
    <td>BufferSize</td>
    <td><input type="text" id="bufferSize" value="{{bufferSize}}" size="3"/></td>
    <td></td>
    <td></td>
  </tr>
</table>

<table>
  <tr>
    <td align="right">Samples Drawn / Second</td>
    <td><input type="text" value="{{actualSps}}"/></td>
  </tr>
  <tr>
    <td align="right">Points Per Draw</td>
    <td><input type="text" value="{{pointsPerDraw}}"/></td>
  </tr>
  <tr>
    <td align="right">Time To Draw</td>
    <td><input type="text" value="{{timeToDraw}}"/></td>
  </tr>
  <tr>
    <td align="right">Delay</td>
    <td><input type="text" value="{{delay}}"/></td>
  </tr>
  <tr>
    <td align="right">Time Btw Draws</td>
    <td><input type="text" id="timeBtwDraws"/></td>
  </tr>
  <tr>
    <td align="right">Time In Draw Frame</td>
    <td><input type="text" value="{{timeInDrawFrame}}"/></td>
  </tr>
</table>

<s-oscilloscope id="oscilloscope"
                width="{{width}}" height="{{height}}"
                maxy="1" miny="-1"
                sampleRate="{{sps}}"
                secondWidth="50"></s-oscilloscope>

<core-ajax id="createChannelAjax"
           url="/straph/createchannel"
           handleAs="json"
           response="{{createChannelResponse}}"></core-ajax>
<core-ajax id="startStreamAjax"
           url="/straph/startstream"
           handleAs="json"
           response="{{startStreamResponse}}"></core-ajax>`;
  }

  ready() {
    this.curReq = null;
    this.isStopped = false;
    this.delay = MIN_DELAY;
    this.firstTick = true;
    this.actualSpsAverager = new Averager(5);
    this.averager = new Averager(5);
    this.timeBtwDrawsAvg = new Averager(10);
    this.drawStopWatch = new StopWatch();
    this.drawFrameStopWatch = new StopWatch();
    this.btwDrawsStopWatch = new StopWatch();
    this.pointsPerDraw = 1;
    this.pointsAdded = 0;
    this.serverPingStopWatch = new StopWatch();
    this.dataQueue = new Queue();
    this.tokenizer = new Tokenizer(",");
  }

  start() {
    this.$.startBtn.disabled = true;
    this.$.datasource.disabled = true;
    this.$.width.disabled = true;
    this.$.height.disabled = true;
    this.$.restartCount.disabled = true;
    this.$.bufferSize.disabled = true;
    this.$.sps.disabled = true;
    this.$.stopBtn.disabled = false;

    this.isStopped = false;
    this.firstTick = true;
    this.delay = MIN_DELAY;
    this.actualSpsAverager.reset();
    this.averager.reset();
    this.timeBtwDrawsAvg.reset();
    this.dataQueue.clear()

    var datasrc = this.$.datasource.options[this.$.datasource.selectedIndex].value;

    this.serverPingStopWatch.start();
    setTimeout(this.drawFrame.bind(this), 2000);
    this.$.createChannelAjax.go();
  }

  createChannelResponseChanged(oldResponse, newResponse) {
    if (newResponse == null) {
      return;
    }
    this.channel = new goog.appengine.Channel(newResponse.token);
    this.socket = this.channel.open();
    this.socket.onmessage = this.onMessage.bind(this);
    this.$.startStreamAjax.go();
  }

  onMessage(msg) {
    console.log(msg.data);
    var parts = msg.data.split(",");
    for (var i = 0; i < parts.length; i++) {
      console.log(parts[i]);
      this.dataQueue.enqueue(parseFloat(parts[i]));
    }
    //this.tokenizer.reset();
    //var val = this.tokenizer.getNextToken(msg.data);
    //while (val) {
    //  this.dataQueue.enqueue(parseFloat(val));
    //  console.log(val);
    //  val = this.tokenizer.getNextToken(msg.data);
    //}
  }

  drawFrame() {
    if (this.firstTick) {
      this.btwDrawsStopWatch.start();
      this.firstTick = false;
    }

    this.drawFrameStopWatch.reset();
    this.drawFrameStopWatch.start();

    if (this.isStopped) {
      return;
    }

    while (this.pointsAdded < this.pointsPerDraw) {
      if (this.dataQueue.isEmpty()) { // ran out of points!
        setTimeout(this.drawFrame.bind(this), 1000);
        this.firstTick = true;
        return;
      }

      this.$.oscilloscope.addValue(this.dataQueue.dequeue());
      this.pointsAdded++;
    }
    this.pointsAdded = 0;

    // draw and measure the draw time
    this.drawStopWatch.reset();
    this.drawStopWatch.start();
    this.$.oscilloscope.draw();
    this.drawStopWatch.stop();

    this.btwDrawsStopWatch.stop();
    var timeBtwDrawsInst = this.btwDrawsStopWatch.timeElapsed('s');
    this.timeBtwDrawsAvg.add(timeBtwDrawsInst);
    this.timeBtwDraws = this.timeBtwDrawsAvg.average();
    this.btwDrawsStopWatch.reset();
    this.btwDrawsStopWatch.start();

    var actualSpsInst = this.pointsPerDraw / this.timeBtwDraws;
    this.actualSpsAverager.add(actualSpsInst);
    this.actualSps = this.actualSpsAverager.average();

    // smooth out the draw time
    var timeToDrawInst = this.drawStopWatch.timeElapsed('s');
    this.averager.add(timeToDrawInst);
    this.timeToDraw = this.averager.average();

    var desiredSps = this.sps;
    if (this.actualSps < desiredSps) {
      if (1.0/desiredSps - (this.timeBtwDraws+10) < 0) { // we're going to need to increase pointsPerDraw
        this.pointsPerDraw = Math.ceil(desiredSps * this.timeBtwDraws);
        this.delay = MIN_DELAY;
      }
      else { // we can throttle down the sleep time to match the sps
        this.delay = Math.max(MIN_DELAY, 1.0/desiredSps - this.timeToDraw);
      }
    }
    else {
      this.pointsPerDraw = 1;
      this.delay = Math.max(MIN_DELAY, 1.0/desiredSps - this.timeToDraw);
    }

    this.drawFrameStopWatch.stop();
    this.timeInDrawFrame = this.drawFrameStopWatch.timeElapsed('s');

    setTimeout(this.drawFrame.bind(this), this.delay * 1000);
  }

  stop() {
    this.isStopped = true;
    this.$.stopBtn.disabled = true;
    this.socket.close();
  }

  stopCompleteCb() {
    this.$.datasource.disabled = false;
    this.$.width.disabled = false;
    this.$.height.disabled = false;
    this.$.startBtn.disabled = false;
    this.$.restartCount.disabled = false;
    this.$.bufferSize.disabled = false;
    this.$.sps.disabled = false;

    this.isStopped = true;
  }
}
customElements.define('s-widget', SWidget);
