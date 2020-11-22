<script lang="ts">
  import "milligram/dist/milligram.min.css";
  import type { OpenWhisk } from "./openwhisk";
  import { URL_LOGIN, VERSION } from "./const";
  import { Battle } from "./battle";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { inspector, source } from "./store";
  import { log } from "./util";

  export let base: string;
  export let ow: OpenWhisk;

  let battle: Battle;
  let msg = "Battlefield "+VERSION;
  let status = "Select Opponents";

  let ready = false;
  let speed = "10";
  let debug = false;

  let enemyBot: string;
  let fighting = false;
  let editing = false;

  let myBot: string = "JsBot";
  let robotName = "";
  let robotType = "js";
  let myBots: string[] = [];

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
    let bot: string
    return fetch(robotMap[robotType])
      .then((data) => {
        if (data.ok) return data.text();
        throw data.statusText;
      })
      .then((code) => {
        bot = robotName + "." + robotType
        return ow.save(bot, code, false);
      })
      .then(async (result) => {
        console.log(result);
        if ("error" in result) 
          throw result["error"];
        source.set(bot)
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
      if(myBots.length >0)
        myBot = myBots[0]
    }
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
      ["", "", "0", ""],
      ["", "", "0", ""],
    ]);
  }

  function trace() {
    status = "Fighting for one round...";
    fighting = true;
    msg = battle.trace();
  }

  function suspended(msg: string) {
    status = msg;
    fighting = false;
  }

  function edit() {
    console.log(myBot)
    source.set(myBot);
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
    let enemyBase = base + "nimbots/"
    let myBase = base +  ( myBots.length ==0 ? "nimbots" : ow.namespace) + "/default/"
    let urls = [myBase + myBot.split(".")[0], enemyBase + enemyBot];
    console.log(urls);
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    battle.init(canvas.getContext("2d"), urls);
    ready = true;
    msg = "Nimbots assembled!";
    status = "Ready to fight.";
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
    Battle.speed = parseInt(speed);
    battle = new Battle(
      parseInt(canvas.getAttribute("width")),
      parseInt(canvas.getAttribute("height")),
      finish,
      suspended
    );
    updateBots();
    window["Battle"] = Battle;
    image.onload = splash;
  });
  onDestroy(unsubscribeSource);
</script>

<style>
  #arena {
    border: 1px solid grey;
    float: left;
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
      <div class="row">
        <div class="column column-40 column-offset-5">
          <h3>{status}</h3>
        </div>
      </div>
      {#if !ready}
        <div class="row">
          <div class="column column-25">
            <label for="enemy">Enemy Robot</label>
            <select bind:value={enemyBot} id="enemy">
              <option value="nimbots/BackAndForth">BackAndForth</option>
              <option value="nimbots/LookAround">LookAround</option>
              <option value="nimbots/RandomTurn">RandomTurn</option>
              <option value="nimbots/LookAndShot">LookAndShot</option>
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
              You need to sign up and login to Nimbella to create and edit your robots.
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
                id="logout"
                on:click={() => {
                  location.href = '/';
                }}>Logout</button>
            </div>
            <div class="column column-25">
              <select bind:value={robotType}>
                <option value="js">JavaScript</option>
                <option value="py">Python</option>
                <!--
                <option value="go">Golang</option>
                -->
              </select>
            </div>
          </div>
        {/if}
      {:else}
        <div class="row">
          <div class="column column-20">
            <button id="fight" on:click={toggle}>
              {#if fighting}Suspend{:else}Fight!{/if}
            </button>
          </div>
          <div class="column column-10">
            <label>
              <input type="checkbox" bind:checked={debug} />
              Debug
            </label>
          </div>
          <div class="column column-20">
            <button
              on:click={() => {
                ready = false;
                fighting = false;
                battle.stop();
              }}>Stop</button>
          </div>
        </div>
        {#if debug}
          <div class="row">
            <div class="column column-25">
              <button id="step" on:click={trace}>Fight one round</button>
            </div>
            <div class="column column-25">
              <label for="enemy">Battle Speed</label>
              <select
                bind:value={speed}
                on:blur={() => {
                  Battle.speed = parseInt(speed);
                }}>
                <option value="5">Very Fast</option>
                <option value="10">Fast</option>
                <option value="25">Normal</option>
                <option value="50">Slow</option>
                <option value="100">Very Slow</option>
              </select>
            </div>
          </div>
          <div class="row">
            If your bot plays too fast, the battle will be suspended!
          </div>
          <div class="row">
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
          <div class="row">
            <div class="column column-50">
              <b>[MyBot] Sent #{$inspector[0][2]}</b>
              <pre>{$inspector[0][0]}</pre>
              <b>[MyBot] Received</b>
              <pre>{$inspector[0][1]}</pre>
              <b>[Enemy] Sent #{$inspector[1][2]}</b>
              <pre>{$inspector[1][0]}</pre>
              <b>[Ememy] Received</b>
              <pre>{$inspector[1][1]}</pre>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </nav>
</main>
