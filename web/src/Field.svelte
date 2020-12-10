<script lang="ts">
  import fetch from "cross-fetch";
  import type { OpenWhisk } from "./openwhisk";
  import { URL_LOGIN, VERSION } from "./const";
  import { BattleWeb } from "./battleweb";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { inspector, source, submitting } from "./store";
  import { log } from "./robot";
  import { rumblePublic } from "./rumble";
  import Submit from "./Submit.svelte";

  export let base: string;
  export let ow: OpenWhisk;

  let battle: BattleWeb;
  let msg = "Get Ready!";
  let status = "Select Opponents";

  let ready = false;
  let speed = BattleWeb.speed;
  let debug = false;

  let enemyBot: string;
  let fighting = false;
  let editing = false;

  let myBot: string = "JsBot";
  let robotName = "";
  let robotType = "js";

  let myBots: string[] = [];

  let enemyBots: { name: string; url: string }[] = [];

  let robotMap = {
    js: "/src/JsBot.js",
    go: "/src/GoBot.go",
    py: "/src/PyBot.py",
  };
  let regex = /^\w{1,60}$/g;

  async function create(): Promise<boolean> {
    if (!robotName.match(regex)) {
      alert("Invalid Robot Name");
      return false;
    }
    let bot: string;
    return fetch(robotMap[robotType])
      .then((data) => {
        if (data.ok) return data.text();
        throw data.statusText;
      })
      .then((code) => {
        bot = robotName + "." + robotType;
        return ow.save(bot, code, false);
      })
      .then(async (result) => {
        console.log(result);
        if ("error" in result) throw result["error"];
        source.set(bot);
        return true;
      })
      .catch((err) => {
        alert(err);
        return false;
      });
  }

  async function updateBots() {
    if (ow !== undefined) {
      myBots = await ow.list();
      if (myBots.length > 0) myBot = myBots[0];
    }
    enemyBots = await rumblePublic();
  }

  let unsubscribeSource = source.subscribe((value) => {
    editing = value != "";
    updateBots();
  });

  function finish(winner: number) {
    if (winner == -1) {
      msg = "Draw.";
    } else if (winner == 0) {
      msg = "You win!";
    } else {
      msg = "You lose...";
    }
    status = "Select Opponents";
    ready = false;
    fighting = false;
    battle.stop();
    inspector.set([
      { n: 0, req: "", res: "", state: "" },
      { n: 0, req: "", res: "", state: "" },
    ]);
  }

  function trace() {
    status = "Tracing...";
    fighting = false;
    msg = battle.trace();
  }

  function suspended(msg: string, state0: string, state1: string) {
    status = msg;
    fighting = false;
    inspector.update((info) => {
      info[0].state = state0;
      info[1].state = state1;
      return info;
    });
  }

  function edit() {
    console.log(myBot);
    source.set(myBot);
    battle.stop();
    editing = true;
  }

  let image = new Image();
  image.src = "/img/splash.png";

  function splash() {
    //console.log("splash")
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);
    ctx.drawImage(image, 0, 0);
  }

  afterUpdate(() => {
    if (!(editing || ready)) splash();
  });

  function selected() {
    let myBase =
      base + (myBots.length == 0 ? "nimbots" : ow.namespace) + "/default/";
    let urls = [myBase + myBot.split(".")[0], base + enemyBot];
    console.log(urls);
    let canvas = document.getElementById("arena") as HTMLCanvasElement;

    let startAngles = [
      [Math.random() * 360, Math.random() * 360],
      [Math.random() * 360, Math.random() * 360],
    ];

    battle.webinit(canvas.getContext("2d"), urls, startAngles);
    ready = true;
    msg = "Starfighters in position!";
    status = "Ready to fight.";
    battle.draw();
  }

  function toggle() {
    fighting = !fighting;
    if (fighting) {
      status = "Fighting!";
      msg = battle.start();
    } else {
      status = "Suspended...";
      battle.stop();
    }
  }

  onMount(() => {
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    battle = new BattleWeb(
      parseInt(canvas.getAttribute("width")),
      parseInt(canvas.getAttribute("height")),
      finish,
      suspended
    );
    updateBots();
    image.onload = splash;
  });
  onDestroy(unsubscribeSource);
</script>

<style>
  #arena {
    border: 1px solid grey;
    float: left;
  }

  #cyan {
    background-color: rgb(155, 155, 187);
    color: rgb(131, 242, 225);
  }
  #red {
    background-color: lightgrey;
    color: red;
  }
</style>

<main class="wrapper">
  <nav class="navigation">
    <section class="container">
      <h1><b>{msg}</b></h1>
      <div class="row">
        <div class="column column-60">
          <canvas id="arena" width="500" height="500" />
        </div>
      </div>
      {#if $submitting != ''}
        <Submit {ow} />
      {:else if !ready}
        <div class="row">
          <div class="column column-50 column-offset-5">
            <h3>{status}</h3>
          </div>
        </div>
        <div class="row">
          <div class="column column-25">
            <label for="enemy">Enemy Robot</label>
            <select bind:value={enemyBot} id="enemy">
              <option value="nimbots/default/Terminator">
                sample/Terminator
              </option>
              <option value="nimbots/default/LookAndShot">
                sample/LookAndShot
              </option>
              <option value="nimbots/default/RandomTurn">
                sample/RandomTurn
              </option>
              <option value="nimbots/default/BackAndForth">
                sample/BackAndForth
              </option>
              <option value="nimbots/default/LookAround">
                sample/LookAround
              </option>
              {#each enemyBots as enemy}
                <option value={enemy.url}>{enemy.name}</option>
              {/each}
            </select>
          </div>
          <div class="column column-25">
            <label for="mybot">My Robot</label>
            <select bind:value={myBot} id="enemy">
              {#if myBots.length == 0}
                <option value="JsBot">Sample Javascript Robot</option>
                <option value="PyBot">Sample Python Robot</option>
                <option value="GoBot">Sample Go Robot</option>
              {:else}
                {#each myBots as bot}
                  <option value={bot}>{bot.split('.')[0]}</option>
                {/each}
              {/if}
            </select>
          </div>
        </div>
        <div class="row">
          <div class="column column-25">
            <button id="done" on:click={selected}>Start the Battle</button>
          </div>
          <div class="column column-25">
            {#if ow === undefined}
              <button
                id="login"
                on:click={() => {
                  location.href = URL_LOGIN;
                }}>Login to Nimbella</button>
            {:else}
              <div class="column column-25">
                <button
                  id="edit"
                  on:click={edit}
                  disabled={myBots.length == 0}>Edit my Robot</button>
              </div>
            {/if}
          </div>
        </div>
        {#if ow === undefined}
          <div class="row">
            <p class="column column-50">
              Welcome to
              <b>FAAS Wars</b>
              v{VERSION}. Please sign up and login to
              <b><a href="https://www.nimbella.com">Nimbella</a></b>
              to create and edit your starfighters.<br />
            </p>
          </div>
        {:else}
          <div class="row">
            <div class="column column-25">
              <button id="create" on:click={create}>Create New Robot</button>
            </div>
            <div class="column column-25">
              <input
                type="text"
                bind:value={robotName}
                placeholder="robot name"
                id="botname" />
            </div>
          </div>
          <div class="row">
            <div class="column column-25">
              <button
                id="submit"
                on:click={() => {
                  submitting.set(myBot);
                }}>Submit to FAAS WARS</button>
            </div>
            <div class="column column-25">
              <select bind:value={robotType}>
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
                <option value="go">Golang</option>
              </select>
            </div>
          </div>
          <p><b>NOTE:</b> only one robot per user can be submitted.</p>
        {/if}
      {:else}
        <div class="row">
          <div class="column column-20">
            <br />
            <button id="fight" on:click={toggle}>
              {#if fighting}Suspend{:else}Fight!{/if}
            </button>
            <br />
            <button
              on:click={() => {
                ready = false;
                fighting = false;
                battle.stop();
              }}>Stop</button><br />
            <button
              id="edit"
              on:click={edit}
              disabled={myBots.length == 0}>Edit</button>
          </div>
          <div class="column column-20">
            <tt>
              Champ:&nbsp;<span id="cyan">&nbsp;cyan&nbsp;robot&nbsp;</span>
            </tt><br />
            <tt>
              Enemy:&nbsp;<span id="red">&nbsp;red&nbsp;&nbsp;robot&nbsp;</span>
            </tt>
          </div>
          <div class="column column-10">
            <label>
              <input type="checkbox" bind:checked={debug} />
              Debug<br />
              <a
                href="https://apigcp.nimbella.io/wb/?command=activation+list"
                target="workbench">Logs</a>
            </label>
          </div>
        </div>
        {#if debug}
          <div class="row">
            <div class="column column-25">
              <button id="step" on:click={trace}>Trace</button>
            </div>
            <div class="column column-25">
              Trace:&nbsp;
              <label>
                <input type="checkbox" bind:checked={log.eventOn} />
                Events&nbsp;
              </label>
              <label>
                <input type="checkbox" bind:checked={log.requestOn} />
                Requests&nbsp;
              </label>
              <label>
                <input type="checkbox" bind:checked={log.actionOn} />
                Actions&nbsp;
              </label>
              (open console)
            </div>
          </div>
          <div class="row">
            <div class="column column-50">
              <b>[Me] {$inspector[0].state}</b><br />
              Request/<b>Response</b>
              #{$inspector[0].n}
              <pre>{$inspector[0].req}<br /><b>{$inspector[0].res}</b>
              </pre>
              <b>[Emeny] {$inspector[1].state}</b><br />
              Request/<b>Response</b>
              #{$inspector[1].n}
              <pre>{$inspector[1].req}<br /><b>{$inspector[1].res}</b>
              </pre>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </nav>
</main>
