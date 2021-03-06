import { customElement } from '@polymer/decorators';
import { PolymerElement, html } from '@polymer/polymer';

@customElement('r-contributions')
export class RContributions extends PolymerElement {
  static get template() {
    return html`
<style>
  :host {
    background-color: #333;
    color: white;
  }
  h1 {
    font-size: 14pt;
  }
  #content {
    padding: 16px;
  }
</style>
<div>
  <div id="content">
    <h1>Publications</h1>
    <p>Robert Toscano, <a href="../images/thesis.pdf">Building a Semi-Autonomous
      Sociable Robot Platform for Robust Interpersonal Telecommunication</a>, May
      2008, M.Eng. Department of Electrical Engineering and Computer Science
      Thesis.</p>

    <p>J.K. Lee, R. Toscano, D. Stiehl, C. Breazeal (2008). "The Design of a
      Semi-Autonomous Robot Avatar for Family Communication and Education".
      Proceedings of the 17th IEEE International Symposium on Robot and Human
      Interactive Communication (RO-MAN-08). Munich, Germany.</p>

    <p>Stiehl, W. D., Breazeal, C., Han, K., Lieberman, J., Lalla, L., Maymin, A.,
      Salinas, J., Fuentes, D., Toscano, R., Tong, C. H., and Kishore, A. (2006).
      The huggable: a new type of therapeutic robotic companion. In ACM SIGGRAPH 2006
      Sketches (Boston, Massachusetts, July 30 – August 03, 2006). SIGGRAPH '06. ACM
      Press, New York, NY, 14.</p>

    <p>H. Knight, R. Toscano, W. D. Stiehl, A. Chang, Y. Wang, and C. Breazeal (2009).
      "Real-time Social Touch Gesture Recognition for Sensate Robots." To appear in
      proceedings of IEEE/RSJ International Conference on Intelligent Robots and Systems
      (IROS09), St. Louis, Missouri, USA, 2009.</p>

    <p>H. Knight, A. Chang, W. D. Stiehl, R. Toscano, Y. Wang, C. Breazeal (2009).
      "Robot Design Rubrics for Social Gesture Categorization and User Studies with
      Children" Human-Robot Interaction Conference (HRI 2009): Societal Impact: How
      Socially Accepted Robots Can Be Integrated in Our Society Workshop. San Diego,
      California, 2009.</p>

    <h1>Talks</h1>
    <p>"The Huggable": project presentation at
      <a href="http://www.dorkbotbarcelona.org/tiki/tiki-index.php?page=DorkbotBarcelonaInEnglish">Dorkbot Barcelona 2009</a>,
      Hangar, Barcelona, Spain, Jan. 15, 2009.</p>

    <p>"The Design of a Semi-Autonomous Robot Avatar for Family Communication and
      Education": conference paper presentation at the 17th IEEE International
      Symposium on Robot and Human Interactive Communication,
      <a href="http://www.lsr.ei.tum.de/ro-man2008/topics.htm">IEEE RO-MAN 2008</a>,
      Münich, Germany, Aug. 2nd, 2008.</p>

    <h1>Exhibitions</h1>
    <p>"The Huggable": Interactive Demonstration of Second Generation Prototype at
      the "Our Cyborg Future?" Exhibition as part of the Designs of the Time 2007
      Festival, Newcastle, UK, October 19th, 2007</p>

    <p>"The Huggable": Interactive Demonstration of Second Generation Prototype at
      the AARP Life@50+ Conference, Boston, MA, September 6th-8th, 2007</p>

    <p>"The Huggable": Interactive Demonstration of Second Generation Prototype
      during Microsoft Keynote at RoboBusiness 2007, Boston, MA, May 16th, 2007.</p>

    <h1>Patents</h1>
    <p>W. D. Stiehl, C. Breazeal, J. K. Lee, A. Z. Maymin, H. Knight, R. L. Toscano,
      I. M. Cheung (2008), <a href="http://www.faqs.org/patents/app/20090055019">"Interactive
      Systems Employing Robotic Companions"</a> pending</p>
  </div>
</div>
    `;
  }
}
