<div class="column column-center column-offset">{@html `
<h1 id="how-to-code-your-fighter">How to code your fighter</h1>
<p>This document is a quick recap of the API. You can also <a href="https://nimbella.com/blog/faas-wars-serverless-virtual-robot-competition?utm_source=subdomain&amp;utm_medium=landing&amp;utm_campaign=faaswars">read this tutorial</a>.</p>
<p>You control your fighter writing a serverless action. <a href="https://github.com/openwhisk-blog/nimbots/tree/master/packages/default">Check here the source code of the sample fighters</a>. You can use the integrated editor to code your fighter but you need to setup an account in Nimbella to play.</p>
<p>A serverless action is a function, written in either Javascript, Python or Go, that receive as input a json document and returns its answer in json. In each programming language the json is serialized and deserialized first in a data structure appropriate for you programming language. When you create a fighter a suitable example is provided.</p>
<p>Each fighter will communicate with the action to receive orders. The action is invoked when an event occurr. In response to an event you return a list of orders, in the format described below.</p>
<p>The fighter has an energy level that starts at 5 and decrease by one each time you are hit. When it reaches <code>0</code> you lose. You lose also if your controlling actions returns an error, so be careful in your coding.</p>
<h2 id="events">Events</h2>
<p>The fighter receive a message in the following format:</p>
<pre><code>{
  &quot;event&quot;: &quot;idle&quot;,
  &quot;energy&quot;: 5,
  &quot;x&quot;: 110,
  &quot;y&quot;: 240,
  &quot;angle&quot;: 23
  &quot;tank_angle&quot;: 232,
  &quot;turret_angle&quot;: 150,
  &quot;enemy_spot&quot;: {},
  &quot;data&quot;: {}
}</code></pre>
<ul>
<li>The <code>event</code> can be:
<ul>
<li><code>idle</code>: the fighter has its order queue empty and and asks for new orders</li>
<li><code>enemy-spot</code>: the fighter has spotted the enemy and can hit him firing</li>
<li><code>hit</code>: the fighter was hit by an enemy bullet</li>
<li><code>wall-collide</code>: the fighter collided with a wall</li>
</ul></li>
<li><code>x</code> and <code>y</code> are the position in the battlefiel,</li>
<li><code>tank_angle</code> and <code>turret_angle</code> are the angles of the tank and of the turret in degrees.</li>
<li><code>angle</code> is the sum of the angle of the turret and the tank, modulo 360</li>
<li><code>energy</code> is your energy level,</li>
</ul>
<p>When the event is <code>enemy_spot</code> there is also the field <code>enemy_spot</code> in this format:</p>
<pre><code>{
    &quot;id&quot;: 1,
    &quot;x&quot;: 291,
    &quot;y&quot;: 180,
    &quot;angle&quot;: 23,
    &quot;distance&quot;: 202,
    &quot;energy&quot;: 1
}</code></pre>
<p>where <code>x</code> and <code>y</code> are the enemy location, <code>angle</code> is the absolute angle to fire him, <code>distance</code> is its distance and <code>energy</code> the enemy energy level.</p>
<p>Lastly the <code>data</code> field is a field that you can set with your own values with the <code>data</code> command, to save a state for further actions.</p>
<h2 id="commands">Commands</h2>
<p>When you receive an event you decide what to do and give orders to the fighter.</p>
<p>The commands are an array of maps. For example:</p>
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
<p>For each sequential action you can also specify a parallel action, that is done at the same time as the sequential (that is: the tank can fire and move the turret while it is moving in a given direction)</p>
<p>The parallel actions are:</p>
<ul>
<li><code>turn_turret_left: &lt;number&gt;</code>: turn the turret to the left of the given angle in degrees</li>
<li><code>turn_turret_right: &lt;number&gt;</code>: turn the turret to the right of the given angle in degrees</li>
<li><code>shot: true</code>: fires a bullet; note you can fire up to 5 bullets at the same time</li>
<li><code>yell: &lt;string&gt;</code>: yell a message that will be displayed in the battle field</li>
</ul>
`}</div>
