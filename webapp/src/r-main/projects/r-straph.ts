//import './straph/s-widget';
import './project-styles';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-straph')
export class RStraph extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>
<div>
  <h1>Introduction</h1>
  <p>
    Straph is a javascript-based technology that allows a remote client to receive streaming
    data from a web server and graph it in real time using the HTML5 canvas element. It was
    originally created to help diagnose problems in robotic sensors/devices that provided a
    HTTP interface to their data. Previously, these problems had to be diagnosed with custom
    visualization software that had to run locally on the machine attached to the sensor, or
    had to be diagnosed by constantly refreshing a statically rendered HTML page with a print
    out of the sensor's data. This technology can be useful whenever streaming data can be
    exposed by a web interface and needs to graphed against time.
  </p>
  <p>
    This technology was created by Robert Toscano in the summer of 2009.
  </p>

  <h1>Overview</h1>
  <p>
    When the start button is pressed, an asynchronous HTTP get request is sent to the server.
    This particular server implementation then streams the data to the client, making sure to
    keep the connection open for as long as it can, pushing data at a controlled rate. As data
    comes in, the client graphs the stream of data in real-time on the canvas element.
  </p>
  <p>
    The framerate and other settings can be configured using the various fields shown in the
    demonstration to control how the data is transferred from server to client:
  </p>
  <ul>
    <li><b>Width</b>: the width of the graph in pixels</li>
    <li><b>Height</b>: the height of the graph in pixels</li>
    <li><b>RestartCount</b>: the number of samples to draw before restarting the connection to the server</li>
    <li><b>Samples/Second</b>: the rate at which samples will be drawn (note that this should be slower than the server can provide)</li>
    <li><b>BufferSize</b>: the number of samples to buffer (on the server side) before sending to the client</li>
  </ul>

  <h1>Resources</h1>
  <table>
    <tr>
      <td style="padding-right:15px; padding-left:15px;"><a href="static/straph-server.py">Server</a></td>
      <td>a python web.py implementation (Python)</td>
    </tr><tr>
      <td style="padding-right:15px; padding-left:15px;"><a href="static/straph-client.zip">Client</a></td>
      <td>a javascript/html implementation using the canvas element (Zip)</td>
    </tr>
  </table>

  <h1>Demonstration</h1>
  <s-widget></s-widget>

  <h1>Implementation</h1>
  <p>
    The client implementation of straph uses looped calls to <tt>setTimeout</tt> to
    control the animation. The reason why <tt>setInterval</tt> is not used is because
    the data need to be drawn in real-time. If, during one of the animation cycles, it
    takes a particularly long time to draw, then, by using a call to <tt>setTimeout</tt>
    with a variable timeout, we can draw many more frames of data in the next animation
    cycle to make up for the current slow cycle.
  </p>
  <p>
    Another optimization that Straph makes use of is a ring buffer (that stores the
    incoming data) to reduce the memory activity of the script. There is still a known
    problem in the Straph implementation concerning memory. As the data streams in from
    the server as a comma-separated list of float values, the <tt>responseText</tt>
    member of the asynchronous request fills up with all of these data. After a while
    of streaming, this string becomes enormous. Straph's solution to this problem is to
    reset the connection after a given number of samples have been processed.
  </p>
</div>`;
  }
}
