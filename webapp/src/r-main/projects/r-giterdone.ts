import '../r-screenshot';
import './project-styles';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-giterdone')
export class RGiterdone extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>

<p><i>A VCS repository manager and File Browser Plug-in overlay</i>

<p>If you use giterdone, please subscribe to the
  <a href="http://groups.google.com/group/giterdone-users/">giterdone-users</a>
  google group.

<p>This Gedit plug-in visualizes the state of the HEAD of your version-controlled
  repositories right in the File Browser side-panel-plug-in (which comes with
  Gedit by default). Emblems composited on each file or folder icon show if the
  item is staged, modified, new, or committed. Various VCS actions are easily
  accessible via the File Browser's right-click context menu: add, diff, commit,
  reset. Giterdone also comes with a Repository Manager that allows repository-level
  visualization and action. Currently, only the git and svn version control systems
  are supported.

<h1>Requirements</h1>
<p>Giterdone requires Gedit version 2.27.5+ (Ubuntu's Karmic) for full
  functionality, but it can work with 2.27.4 without the File Browser's context
  menu support.

<p>There is a possibility in the future that Giterdone will be able to work
  with the Embedded Terminal plug-in to show the user any errors that occur
  while pushing/commiting/anything. The Embedded Terminal plug-in comes with
  the gedit-plugins (Ubuntu) package.

<p>This version of giterdone has currently only been tested in Ubuntu Lucid,
  Jaunty and Karmic.

<h1>Screenshots</h1>
<div class="horizontal wrap layout">
  <r-screenshot imgname="screenshot-giterdone-overlay.png">
    This shows the emblems overlayed on the file icons and the context menu items.
  </r-screenshot>

  <r-screenshot imgname="screenshot-giterdone-repo-manager.png">
    This shows the Repository Manager side-panel. From here you can perform
    repository-level actions like committing and fetching.
  </r-screenshot>

  <r-screenshot imgname="screenshot-giterdone-commit-msg.png">
    Commit messages can even be created/edited directly from Gedit. Close
    the tab to commit the changes.
  </r-screenshot>

  <r-screenshot imgname="screenshot-giterdone-diff.png">
    Diffs can also be viewed in Gedit.
  </r-screenshot>
</div>

<h1>Resources</h1>
<table>
  <tr>
    <td><a href="../images/giterdone-1.2.3.zip">Giterdone 1.2.3</a></td>
    <td>Latest version of Giterdone (zip)</td>
  </tr>
  <tr>
    <td><a href="http://gitorious.org/giterdone">Source Code</a></td>
    <td>Source code of Giterdone (Gitorious)</td>
  </tr>
</table>`;
  }
}
