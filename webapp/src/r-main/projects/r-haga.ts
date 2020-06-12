import '../r-screenshot';
import './project-styles';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-haga')
export class RScreenshot extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>

<p><i>Human-Assisted Global Alignment (HAGA)</i></p>

<p>HAGA is a computer program written in Java that helps biologists and other
  genomic researchers in the complicated process of
  <a href="http://en.wikipedia.org/wiki/Sequence_alignment">genome alignment</a>.
  Most global alignment algorithms are akin to
  <a href="http://en.wikipedia.org/wiki/Edit_distance">edit-distance</a>
  algorithms and weight each
  nucleotide to perform the alignment. HAGA allows the user to intervene with the
  alignment--hand labeling specific nucleotide groups. This intervention is
  observed by the HAGA program which learns from this information to perform
  better future alignments.</p>

<p>This program was a class project at MIT for "Introduction to Computational
  Biology" in Fall of 2007. The authors are Shanon Iyo and Robert Toscano.</p>

<h1>Overview</h1>
<p>The architecture is broken into three modular components. The user interface
  allows a human to view alignments and define labels on the sequences. The
  labeler is responsible for learning the labels specified by the user, and
  applying these labels to unlabeled sequence regions. Our labeler implementation
  uses a HMM. The aligner performs global sequence alignment on two labeled
  sequences. Our system uses the
  <a href="http://en.wikipedia.org/wiki/Needleman-Wunsch">Needleman-Wunsch</a>
  algorithm, modified to favor
  bases with the same label. HAGA is designed so that any of these components
  may be interchanged, as long as the replacement follows the same interface.
  For example, human label definitions could be replaced or augmented with an
  mRNA recognizer, or an HMM labeler implementation could be replaced with a
  neural net solution.</p>

<p>The alignment process follows the steps below:</p>
<ul>
  <li>User (or other pattern recognizer) applies labels to sequences
  <li>Labeler is trained on defined labels
  <li>Labeler applies labels to unlabeled sequence regions
  <li>Aligner performs alignment on the labeled sequences
  <li>User interface is updated to display the new alignment
</ul>

<h1>Screenshots</h1>
<div horizontal wrap layout>
  <r-screenshot imgname="haga-screenshot-overview.png" width="540px">
    The different components of the HAGA user interface.
  </r-screenshot>

  <r-screenshot imgname="haga-screenshot-before.png" width="600px">
    A sequence before performing global alignment.
  </r-screenshot>

  <r-screenshot imgname="haga-screenshot-after.png" width="600px">
    A sequence after performing global alignment with HAGA.
  </r-screenshot>
</div>

<h1>Resources</h1>
<table>
  <tr>
    <td><a href="../../images/haga-proposal.pdf">Proposal</a></td>
    <td>A description of what we proposed to build for our class project (PDF)</td>
  </tr>
  <tr>
    <td><a href="../../images/haga.pdf">Final Paper</a></td>
    <td>Contains a complete description of HAGA: its design and implementation as
      well as some evaluation results of aligning real genomic data (PDF)</td>
  </tr>
  <tr>
    <td><a href="../../images/haga.odp">Presentation</a></td>
    <td>A concise presentation of HAGA (OpenOffice)</td>
  </tr>
  <tr>
    <td><a href="http://github.com/rltoscano/haga">Source Code</a></td>
    <td>The source code of HAGA (GitHub)</td>
  </tr>
  <tr>
    <td><a href="../../images/haga.jar">Executable</a></td>
    <td>Runnable compiled program</td>
  </tr>
</table>`;
  }
}
