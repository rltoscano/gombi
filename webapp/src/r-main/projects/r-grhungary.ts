import './project-styles';
import '../r-screenshot';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer'

@customElement('r-grhungary')
export class RGrhungary extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>

<p><i>An exploration into a Dart-based frontend.</i></p>

<h1>Description</h1>

<p>Before I married in 2013, I built a website for our invited guests with
  information about the wedding, photo galleries and a page to RSVP as well as
  a page to donate for our honeymoon. Other than building a web app where our
  guests could find info about the wedding and RSVP, my goal was to familiarize
  myself with the offerings of Google's Dart programming platform.</p>

<p>The site is built as a service on AppEngine written in Go with a client
  frontend written in Dart. It very much uses the Single Page App (SPA) model
  and uses templating to get localization right. Compared with building traditional
  javascript based SPAs, my productivity in Dart was increased 10 fold. The IDE,
  compiler checking, strong types, and auto-completion made the frontend development
  experience so much nicer. It's probably one of my more production quality sites
  since I built it with cross-browser support in mind (some of our family was still
  using IE at the time).</p>

<p>The only API the service part of the app offers is an RSVP creation API that
  automatically sends me an email when someone RSVPs and dumps their info into a
  database.</p>

<h1>Resources</h1>
<table>
  <tr>
    <td><a href="https://gombi-grhungary.appspot.com">Grhungary</a></td>
    <td>Live website</td>
  </tr>
  <tr>
    <td><a href="https://github.com/rltoscano/grhungary">Source Code</a></td>
    <td>Source code of Grhungary (GitHub)</td>
  </tr>
</table>`;
  }
}
