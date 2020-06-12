import '@polymer/app-layout';
import '@polymer/iron-icons';
import '@polymer/iron-pages';
import '@polymer/paper-icon-button';
import '@polymer/paper-tabs';
import '@polymer/paper-tabs';
import '@polymer/paper-toolbar';
import './r-about';
import './r-contributions';
import './r-showcase';

import { customElement, observe, property } from '@polymer/decorators';
import { PolymerElement, html } from '@polymer/polymer';

import { ProjectDesc } from './types';

const projects: ProjectDesc[] = [
  {
    title: 'Flashbrain',
    img: 'flashbrain-icon.png',
    highlight: '#3f51b5',
    titlefont: 'light',
    desc: 'Foreign language learning with flash cards and spaced-repetition.'
  },
  {
    title: 'Door',
    titlefont: 'dark',
    desc: 'Electrical installation to open automatically open an apartment door.'
  },
  {
    title: 'Grhungary',
    img: 'bird.png',
    padding: '16px',
    highlight: '#93242b',
    titlefont: 'light',
    desc: 'Website I designed and built for our wedding with a Dart-based frontend.'
  },
  {
    title: 'Harbinger',
    titlefont: 'dark',
    desc: 'A home-made robot that animates as my commute home completes.'
  },
  {
    title: 'Giterdone',
    img: 'giterdone-icon.png',
    highlight: '#f05033',
    titlefont: 'light',
    desc: 'A Gedit plug-in that provides vcs visualization and management.'
  },
  {
    title: 'Ubislideshow',
    img: 'slide-projector.png',
    padding: '16px',
    highlight: '#6b9bb7',
    titlefont: 'light',
    desc: 'A synchronized and distributed photo slideshow.'
  },
  {
    title: 'Straph',
    img: 'straph-icon.png',
    highlight: 'rgb(130,202,250)',
    titlefont: 'dark',
    desc: 'A web app that graphs real-time streaming data.'
  },
  {
    title: 'PhotoWeb',
    titlefont: 'dark',
    desc: 'A zen-simplistic photo album viewer that supports video files.'
  },
  {
    title: 'Phrygian',
    titlefont: 'dark',
    desc: 'A web-based music player and library manager.'
  },
  {
    title: 'HAGA',
    img: 'haga-icon.png',
    highlight: '#ffafaf',
    titlefont: 'dark',
    desc: 'A smart global sequence aligner UI tool.'
  },
  {
    title: 'Huggable',
    img: 'huggable.jpg',
    highlight: '#f8bf34',
    titlefont: 'dark',
    desc: 'A new type of therapeutic robotic companion.'
  },
  {
    title: 'Tangible Color Palette',
    img: 'tcp-icon.png',
    highlight: '#01826c',
    titlefont: 'light',
    desc: 'A tangible interface to a color palette.'
  },
];

@customElement('r-main')
export class RMain extends PolymerElement {
  @property({ type: String }) page = 'showcase';
  @property({ type: Object }) project: ProjectDesc | null = null;
  @property({ type: Array }) projects: ProjectDesc[] = projects;

  static get template() {
    return html`
        <style>
          :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            --highlight: #ffffff;
            --titleColor: white;
            background-color: #333;
          }
          app-toolbar {
            background-color: var(--highlight);
            color: var(--titleColor);
          }
          #pages > * {
            flex: 1;
          }
          .stretchColumn {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
          }
        </style>
        <app-header-layout class="stretchColumn">
          <app-header slot="header" reveals shadow>
            <app-toolbar style="display: flex; flex-direction: rows">
              <paper-icon-button
                  icon="arrow-back"
                  on-tap="onBack"
                  hidden$="[[!project]]"></paper-icon-button>
              <div style="flex: 1">[[getTitle(project)]]</div>
              <div hidden$="[[truthy(project)]]">
                <paper-tabs selected="{{page}}" attr-for-selected="name">
                  <paper-tab name="showcase">Showcase</paper-tab>
                  <paper-tab name="contributions">Contributions</paper-tab>
                  <paper-tab name="about">About</paper-tab>
                </paper-tabs>
              </div>
            </app-toolbar>
          </app-header>
          <iron-pages id="pages" class="stretchColumn" selected="[[page]]" attr-for-selected="name">
            <r-showcase name="showcase" projects="[[projects]]" project="{{project}}"></r-showcase>
            <r-contributions name="contributions"></r-contributions>
            <r-about name="about"></r-about>
          </iron-pages>
        </app-header-layout>`;
  }

  protected getTitle(project: ProjectDesc | null): string {
    return project?.title ?? 'Robert Toscano';
  }

  protected truthy(val: Object): boolean {
    return !!val;
  }

  protected onBack() {
    this.project = null;
  }

  @observe('project')
  projectChanged() {
    this.updateStyles(
      {
        '--highlight': this.project ? this.project.highlight : '#666',
        '--titleColor': (this.project && this.project.titlefont == 'dark') ? 'black' : 'white',
      }
    );
  }
}
