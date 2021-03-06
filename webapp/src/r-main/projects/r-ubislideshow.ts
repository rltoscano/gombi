import './project-styles';
import '../r-screenshot';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-ubislideshow')
export class RUbislideshow extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>

<p><i>A synchronized and distributed photo slideshow.</i></p>

<p>Ubislideshow is a system that shares and receives photos to be displayed in a
  slideshow that is synchronized across all computers in a local network.
  Ubislideshow is appropriate when a physical space is occupied by several computers
  (preferably with displays, but not always) that each contain different photos. In
  this environment, configure-less daemons present on each of the computers communicate
  via a mix of UDP broadcasting and TCP streaming to make their respective photos
  available on the local network. Client programs (the actual slideshow application)
  then listen to this network traffic and download images from the daemons and
  synchronously display them. The result is a ubiquitous slideshow synchronized
  across all displays in the physical space.</p>

<h1>Overview</h1>
<p>The Ubislideshow system can be decomposed into two parts: the daemon and the
  viewer. Each is its own application and can be run separately.</p>

<h2>Coordinator</h2>
<p>The daemon is known as the Coordinator. The Coordinator acts as a server and
  client. When it is started on a computer, it broadcasts its presence on the local
  subnet. Concurrently, it listens for other Coordinators on the subnet. Through a
  custom protocol, the Coordinators decide on a active Coordinator which is
  responsible for controlling the synchronization across all Coordinators and
  viewers. This active Coordinator then receives lists of photos from each of the
  Coordinators and compiles a master list. This master list is then accessible by
  the viewers to find photos in the Ubislideshow system.</p>

<h2>Viewer</h2>
<p>The Viewer is responsible for discovering the active Coordinator and querying
  it for the current slideshow photo. It also listens for "tick" broadcasts sent
  by the active Coordinator to synchronize when to display the photo corresponding
  to the tick. The Viewer also acts as a graphical display showing each photo with
  some transition and constant effects.</p>

<h1>Details</h1>
<p>Ubislideshow is implemented entirely with
  <a href="http://www.qtsoftware.com/">Qt4</a> and is built using the
  <a href="http://code.google.com/p/waf/">waf</a> build system. It is compatible
  with all platforms that Qt4 supports. It is intended to be released as open source
  software under the GPL license, but is pending some minor cleanups and testing.</p>

<h1>Screenshots</h1>
<div>
  <r-screenshot imgname="ubislideshow-settings-screenshot.png" width="480px">
    The various settings of Ubislideshow.
  </r-screenshot>

  <r-screenshot imgname="ubislideshow-notfarea-screenshot.png" width="320px">
    Ubislideshow includes a notification area icon to display when the Coordinator
    is running.
  </r-screenshot>

  <r-screenshot imgname="ubislideshow-screenshot-viewer.jpg" width="480px">
    The Viewer actually displays the photos from the local network adding some
    Ken Burns effects.
  </r-screenshot>

  <r-screenshot imgname="ubislideshow-screenshot-add-pictures.png" width="480px">
    Here you can choose which photo folders to share.
  </r-screenshot>
</div>`;
  }
}
