import '@polymer/paper-card';
import '@polymer/paper-styles/default-theme';

import {customElement, observe, property} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

import {ProjectDesc} from './types';

@customElement('r-project-card')
export class RProjectCard extends PolymerElement {
  @property({type: Object}) project: ProjectDesc|null = null;

  static get template() {
    return html`
<style is="custom-style" include="paper-material-styles">
  :host {
    --highlight: #ffffff;
    --imgPadding: 24px;
  }
  #supporting-text {
    padding: 8px;
    font-size: 80%;
    height: 30px;
    background-color: #f9f9f9;
    color: rgba(0,0,0,.6);
  }
</style>
<paper-card heading="[[project.title]]" image="/rsc/[[project.img]]">
  <div id="supporting-text"><slot></slot></div>
</paper-card>
        `;
  }

  @observe('project')
  projectChanged() {
    this.updateStyles(
      {
        '--highlight': this.project.highlight,
        '--imgPadding': this.project.padding,
      }
    );
  }
}
