<div class="column column-50">{@html `
<h1 id="how-to-code-your-robots">How to code your robots</h1>
<p>A robot will invoke an action communicating his state to receive orders. The action is invoke either when something happens (currently when the robot is hit by a bullet (event <code>hit</code>), it spots an enemy (event <code>enemy-spot</code>, it hits a wall (event <code>wall-collide</code>)) or it has notihing to do and asks for orders (event <code>idle</code>).</p>
<h2 id="events">Events</h2>
<p>Your controlling actions to receive orders will receive a message in the following format:</p>
<pre><code>{
  &quot;event&quot;: &quot;idle&quot;,
  &quot;energy&quot;: 5,
  &quot;x&quot;: 110.08943883378159,
  &quot;y&quot;: 240.55490761839846,
  &quot;tank_angle&quot;: 310.0539299299875,
  &quot;turret_angle&quot;: 260.24915928062995,
  &quot;enemy_spot&quot;: {},
  &quot;data&quot;: {}
}</code></pre>
<p>Note that:</p>
<ul>
<li>the <code>event</code> can either <code>idle</code>, <code>enemy-spot</code>, <code>wall-collide</code> or <code>hit</code>.</li>
<li><code>x</code> and <code>y</code> are the position in the battlefiel, <code>tank_angle</code> and <code>turret_angle</code> are the angles of the tank and of the turret degrees.</li>
<li><code>energy</code> is your energy level, starts with 5 and decrease by one each time you are hit. When it reaches <code>0</code> you are dead.</li>
</ul>
<p>When the event is <code>enemy_spot</code> there is also the field <code>enemy_spot</code> in this format:</p>
<pre><code>{
    &quot;x&quot;: 291.17303890072367,
    &quot;y&quot;: 180.26484144952053,
    &quot;angle&quot;: 23.71026376973935,
    &quot;distance&quot;: 202.39847789214505,
    &quot;energy&quot;: 1
}</code></pre>
<p>where <code>x</code> and <code>y</code> are the enemy location, <code>angle</code> its relative angle, <code>distance</code> is its distance and <code>energy</code> the enemy energy level.</p>
<p>Lastly the <code>data</code> field is a field that you can set with your own values with the <code>data</code> command to save a state for further actions.</p>
<h2 id="commands">Commands</h2>
<p>When you receive an event you decide what to do and give orders to the robot.</p>
<p>The commands are a json in the form of an array of maps. For example:</p>
<pre><code>[{
    &quot;move_forwards&quot;: 50,
    &quot;shoot&quot;: true
 },
 {
  &quot;move_backwards&quot;: 50,
  &quot;turn_turret_right&quot;: 180,
  &quot;shoot&quot;: true
}]</code></pre>
<p>Each map must contains one (and only one) key/value entry describing a sequential action. If you specify more than one sequential action, only one will be executed (and we do not tell you which one, so do not do it!).</p>
<p>The sequential actions are:</p>
<ul>
<li><code>move_forwads: &lt;number&gt;</code>: move forward of the given number of pixels</li>
<li><code>move_backwards: &lt;number&gt;</code>: move backwards of the given number of pixels</li>
<li><code>move_opposide: &lt;number&gt;</code>: move in the opposite direction of where you were moving - useful when you hit a wall</li>
<li><code>turn_left: &lt;number&gt;</code>: turn the tanks to the left of the given angle in degrees</li>
<li><code>turn_right: &lt;number&gt;</code>: turn the tanks to the right of the given angle in degrees</li>
</ul>
<p>For each sequential action you can also specify a parallel action, that is done at the same time as the sequential (that is the tank can fire and move the turret while it is moving in a given direction)</p>
<p>The parallel actions are:</p>
<ul>
<li><code>turn_turrent_left: &lt;number&gt;</code>: turn the turrent to the left of the given angle in degrees</li>
<li><code>turn_turrent_right: &lt;number&gt;</code>: turn the turrent to the right of the given angle in degrees</li>
<li><code>shot: true</code>: fires a bullet; note you can fire up to 5 bullets at the same time</li>
<li><code>yell: &lt;string&gt;</code>: yell a message that will be displayed in the battle field</li>
</ul>
`}</div>