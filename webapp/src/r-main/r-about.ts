import { PolymerElement, html } from '@polymer/polymer';
import { customElement } from '@polymer/decorators';

@customElement('r-about')
export class RAbout extends PolymerElement {
  static get template() {
    return html`
<style>
  :host {
    background-color: #333;
    color: white;
  }
  td {
    padding: 16px;
    vertical-align: top;
  }
</style>
<div>
  <table>
    <tr>
      <td>E-mail</td>
      <td><a href="mailto:robert@gombi.net">robert@gombi.net</a></td>
    </tr>
    <tr>
      <td>Location</td>
      <td>San Francisco, California</td>
    </tr>
    <tr>
      <td>Bio</td>
      <td>
        Robert Toscano has a passion for automation and loves the challenge
        that a multi-disciplinary industry like robotics presents. His masters
        thesis (completed in June 2008 at MIT) concerned the design and implementation
        of a semi-autonomous sociable robotic platform for robust interpersonal
        communication. He continued to absorb new technologies and new cultures
        through his research/development position abroad with the Music Technology
        Group at the Universitat Pompeu Fabra, Barcelona. There he contributed to the
        streaming audio processing library known as Essentia which provides
        audio/music researchers efficient, correct, and easy-to-use audio analysis
        algorithms.
      </td>
    </tr>
  </table>
</div>`;
  }
}
