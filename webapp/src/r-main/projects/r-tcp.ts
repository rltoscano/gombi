import './project-styles';

import {customElement} from '@polymer/decorators';
import {PolymerElement, html} from '@polymer/polymer';

@customElement('r-tcp')
export class RTcp extends PolymerElement {
  static get template() {
    return html`
<style include="project-styles"></style>

<p>The Tangible Color Palette is a tangible computing interface for creating
  colors in an intuitive way. The user employs a mixing bowl to combine various
  primary colors or custom colors to create a new color. The color shaker is a
  physical device that is used to store as well as transfer a color to the mixing
  bowl. The user shakes the color shaker (in the same manner as one would shake
  a salt shaker) to transfer color from the device to the mixing bowl. With each
  shake, more color is additively mixed with the color in the mixing bowl. The
  user can also store a newly created color in a color brick for later recall.
  Colors can be loaded into the color shaker from these color bricks or from the
  color wheel (another physical device that provides a tangible interface for
  loading primary colors). Multiple mixing bowls can be linked together to allow
  collaboration between remote participants.</p>

<p>This program was a class project at the MIT Media Lab for "Tangible Interfaces"
  in Fall of 2007. The authors are Nashid Nabian and Robert Toscano.</p>

<h1>Overview</h1>
<p>For our class project, we used the Wii's Wiimote as the color shaker. We made
  use of the Wiimote's infrared camera to identify the various color bricks as
  well as the primary colors on the color wheel by reading the spatial configuration
  of infrared LEDs placed on the various physical devices. Mixing bowls are linked
  together using a tcp connection across a local network.</p>

<h1>Color Shaker</h1>
<p>To access the sensors on the Wiimote (such as the infrared camera, accelorometer,
  and buttons), we used ?? TODO ??'s WiimoteLib written for the .NET platform. The
  derivative readings of the accelorometer were classified using a threshold value
  to detect when a shake was performed by the user. With each shake, a signal was
  sent to a local computer via Bluetooth. The local computer actually stored all of
  the state information for each color shaker.</p>

<p>When a designated button was pressed, the readings of the infrared camera were
  sent to the local computer. Since WiimoteLib only allows for the reading of two
  infrared light sources, the number of indentifiers created were limited to 2 bits
  of information as well as the differences between their spatial arrangement (which
  was limited to the desired percision of the spatial measurements).</p>

<p>Although it was never implemented, we considered providing aural and/or tactile
  feedback via the Wiimote's speaker and vibration unit. Even some of the indicator
  lights on the Wiimote could have been used to convey the state of the color shaker.</p>

<h1>Color Wheel</h1>
<p>We constructed the color wheel out of LEGOs and soldered in a couple of infrared
  LEDs. The LEDs were positioned so that as the wheel turned, one of the LEDs remained
  stationary, and the other spun about the center. Based on where the movable LED was
  located, the appropriate primary color was chosen when the user pointed the Wiimote
  to the color wheel and pressed the designated button.</p>

<p>The identification of the color on the color wheel depended heavily on the orientation
  and angle that the Wiimote was presented to the color wheel. We solved this by
  restricting the position and orientation that the Wiimote could be presented to the
  color wheel by forcing the Wiimote through a slot before the LEDs could be seen.</p>

<h1>Color Bricks</h1>
<p>The color bricks are the simplest of the physical devices in Tangible Color Palette
  and consist of nothing more than a brick-like structure made of LEGOs with a
  specifically position infrared LED inside. The color shaker computes the identifier
  of the color brick in much the same way as it identifies a color in the color wheel.</p>

<h1>Mixing Bowl</h1>
<p>Due to time constraints, the mixing bowl was not a physical device at all. It was
  merely a GUI on the local computer's screen. Due to the lack of sensors on the computer,
  it was difficult to manifest the analogy of the salt shaker because the color shaker
  could be shook anywhere (being above the mixing bowl was not required).</p>`;
  }
}
