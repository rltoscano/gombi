import '@polymer/paper-styles/default-theme';

import {customElement, observe, property} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-screenshot')
export class RScreenshot extends PolymerElement {
  @property({type: String}) imgname: string|null = null;
  @property({type: String}) width = '240px';

  static get template() {
    return html`
<style is="custom-style" include="paper-material-styles">
  :host {
    display: inline-block
    --width: 240px;
    max-width: var(--width);
    background-color: #f9f9f9;
    margin: 16px;
  }
  #caption {
    text-align: center;
    padding: 20px 8px 8px 8px;
    font-size: 80%;
  }
  #img {
    width: 100%;
    margin-bottom: -4px;
  }
</style>
<div class="paper-material">
  <img id="img" src="/rsc/[[imgname]]">
</div>
<div id="caption"><slot></slot></div>`;
  }

  @observe('width')
  widthChanged() {
    this.updateStyles({ '--width': this.width });
  }
}
