import '@polymer/paper-button';
import './project-styles';
import '../r-screenshot';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-flashbrain')
export class RFlashbrain extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>
<h1>Description</h1>
<p>
  One of the hardest parts in learning a new language is practicing the vocabulary of
  new words you've learned. In order for vocabulary words to come to mind when you need
  them, the association between the abstract concept and the word itself needs to be
  created in your brain and strengthened through recall repetition. This problem has
  traditionally been solved with flash cards: the word in one language is written on
  one side of the card, and the word in another language is written on the other side.
  But carrying around hundreds of flash cards limits when and where you can study.
  Searching for a specific word takes a long time. And putting the cards in the best
  order requires constant sorting. The best order changes depending on which words you
  know well and which words you don't.
</p>
<p>
  Flashbrain is an app that helps you manage your flash cards and with a little help
  from you, automatically puts them in an order that maximizes learning. Studying can
  take place on your smart phone, laptop, or desktop. All that's needed is a web
  browser. Flashbrain uses a
  <a href="http://en.wikipedia.org/wiki/Spaced_repetition">spaced-repetition algorithm</a>
  to make sure you spend most of
  your time practicing cards you don't know well, and less of your time practicing words
  you do know well. The app's search functionality lets you find a card instantly. Cards
  can be organized by topics like "Food" or "Travel" for focussed studying. Adding new
  cards or editing existing ones is streamlined and simple.
</p>
<p>
  The app is currently built for learning Hungarian by native English speakers but is
  planned to be generalized for any language pair. Other things that are planned are
  adding audio playback of words to help practice pronunciation and integration into
  other platforms like smart watches.
</p>

<h1>Screenshots</h1>
<div horizontal layout start wrap center-justified>
  <r-screenshot imgname="flashbrain-screenshot-desktop-collections.png" width="590px">
    The app's visual layout adapts seamlessly between different screen form factors.
  </r-screenshot>
  <r-screenshot imgname="flashbrain-screenshot-mobile-collections.png">
    Cards can be organized by topic.
  </r-screenshot>
  <r-screenshot imgname="flashbrain-screenshot-mobile-unflipped.png">
    A card is presented for the user to practice recalling the translation.
  </r-screenshot>
  <r-screenshot imgname="flashbrain-screenshot-mobile-flipped.png">
    The user indicates a successful or unsuccessful recall to recalculate a confidence
    score for the card.
  </r-screenshot>
  <r-screenshot imgname="flashbrain-screenshot-mobile-search.png">
    Searching for a word is simple.
  </r-screenshot>
  <r-screenshot imgname="flashbrain-screenshot-mobile-edit.png">
    Editing or creating new words is a breeze.
  </r-screenshot>
</div>

<h1>Implementation</h1>
<p>
  The Flashbrain service provides a RESTful API to the vocabulary cards to make a user's
  data available to any device. The service is written in Go and deployed on Google's
  AppEngine. It makes use of AppEngine's Datastore indexing for fast searches.
</p>
<p>
  The Flashbrain client is a single-page web app built on the
  <a href="https://www.polymer-project.org">Polymer framework</a> and uses
  Google's material design philosophy/tools. The app heavily relies on Polymer's
  data-binding feature to minimize the app's procedural code and focus on the declarative
  code. One highlight is that the app uses an array data model to simultaneously represent
  card transitions and buffer the next card to show. The UI layout is flexible and adapts
  easily between smart phone displays and laptop displays. The app leverages the flash
  card metaphor in the UI by using styling and 3D animations.
</p>

<h1>Spaced-Repetition Algorithm</h1>
<p>
  After the app presents a card to the user, the user indicates that it has recalled the
  word by tapping the card. The card flips over to reveal the same word in the other
  language and two buttons that let the user indicate whether or not they've recalled
  the word correctly. Using this signal plus several others (e.g. time since previous
  recall), the card is assigned a score that represents how well the user remembers that
  word. Every so often, the cards are resorted according to this score to maximize the
  learning process.
</p>

<paper-button raised style="background-color: #3F51B5; color: rgba(255,255,255,0.87)">Demo (Coming soon)</paper-button>`;
  }
}
