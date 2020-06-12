import '@polymer/iron-pages';
import '@polymer/iron-selector/iron-selector';
import '@polymer/paper-icon-button';
import './projects/r-flashbrain';
import './projects/r-giterdone';
import './projects/r-grhungary';
import './projects/r-haga';
import './projects/r-straph';
import './projects/r-tcp';
import './projects/r-ubislideshow';
import './r-project-card';
import './r-screenshot';

import {customElement, property} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

import {ProjectDesc} from './types';

@customElement('r-showcase')
export class RShowcase extends PolymerElement {
  @property({type: Object, notify: true}) project: ProjectDesc|null = null;
  @property({type: Array}) projects: ProjectDesc[] = [];

  static get template() {
    return html`
<style>
  :host {
    background-color: #333;
    color: white;
    flex: 1;
    display: flex;
  }
  #sections {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  #projectList {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  r-project-card {
    margin: 32px;
  }
  #projectDetail {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #projectDetail > * {
    flex: 1;
    width: 30em;
  }
</style>

<iron-pages id="sections" selected="[[getPage(project)]]" attr-for-selected="id">
  <iron-selector id="projectList" selected="{{project}}" attr-for-selected="project">
    <template is="dom-repeat" items="[[projects]]">
      <r-project-card project="[[item]]">[[item.desc]]</r-project-card>
    </template>
  </iron-selector>

  <iron-pages id="projectDetail" selected="[[project.title]]" attr-for-selected="name">
    <r-flashbrain name="Flashbrain"></r-flashbrain>
    <div name="Door"></div>
    <div name="Harbinger"></div>
    <r-grhungary name="Grhungary"></r-grhungary>
    <r-straph name="Straph"></r-straph>
    <div name="Photoweb"></div>
    <div name="Phrygian"></div>
    <r-haga name="HAGA"></r-haga>
    <r-tcp name="Tangible Color Palette"></r-tcp>
    <div name="Huggable"></div>
    <r-ubislideshow name="Ubislideshow"></r-ubislideshow>
    <r-giterdone name="Giterdone"></r-giterdone>
  </iron-pages>

</iron-pages>
        `;
  }

  protected getPage(project: ProjectDesc|null): string {
    return project ? 'projectDetail' : 'projectList';
  }
}
