<script lang="ts">
  export let base;

  import "milligram/dist/milligram.min.css";
  import { URL_LOGIN } from "./const";
  import { Battle } from "./battle";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { inspector, auth, source } from "./store";
  import { log } from "./util";

  let battle: Battle;
  let msg = "Welcome to the battlefield!";
  let status = "Select Opponents";

  let ready = false;
  let speed = "10";
  let debug = false;

  let myBot: string = "JsBot";
  let enemyBot: string;
  let fighting = false;
  let editing = false;

  let unsubscribeSource =   source.subscribe((value) => {
      editing = value != "";
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
    if (!(editing || fighting)) splash();
  });

  function selected() {
    let urls = [base + "default/" + myBot, base + enemyBot];
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
    console.log("on mount...");
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    Battle.speed = parseInt(speed);
    battle = new Battle(
      parseInt(canvas.getAttribute("width")),
      parseInt(canvas.getAttribute("height")),
      finish,
      suspended
    );
    window["Battle"] = Battle;
    image.onload = splash;
  });
  onDestroy(unsubscribeSource)
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
          <div class="column column-50">
            <label for="mybot">My Robot</label>
            <select bind:value={myBot} id="enemy">
              <option value="JsBot">Javascript Robot</option>
              <option value="PyBot">Python Robot</option>
              <option value="GoBot">Go Robot</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="column column-50">
            <label for="enemy">Enemy Bot</label>
            <select bind:value={enemyBot} id="enemy">
              <option value="nimbots/BackAndForth">BackAndForth</option>
              <option value="nimbots/LookAround">LookAround</option>
              <option value="nimbots/RandomTurn">RandomTurn</option>
              <option value="nimbots/LookAndShot">LookAndShot</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="column column-25">
            <button id="done" on:click={selected}>Start the Battle</button>
          </div>
          <div class="column column-25">
            {#if $auth != ''}
              <button id="done" on:click={edit}>Edit my Robot</button>
            {:else}
              <button
                id="done"
                on:click={() => {
                  location.href = URL_LOGIN;
                }}>Login to Nimbella to edit Robots</button>
            {/if}
          </div>
        </div>
      {:else}
        <div class="row">
          <div class="column column-20">
            <button id="fight" on:click={toggle}>
              {#if fighting}Suspend{:else}Fight!{/if}
            </button>
          </div>
          <div class="column column-20">
            <label>
              <input type="checkbox" bind:checked={debug} />
              Debug
            </label>
          </div>
          <div class="column column-20"><a href="/">Reset</a></div>
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
              [MyBot] Sent #{$inspector[0][2]}
              <pre>{$inspector[0][0]}</pre>
              [MyBot] Received
              <pre>{$inspector[0][1]}</pre>
            </div>
            <div class="column column-50">
              [Enemy] Sent #{$inspector[1][2]}
              <pre>{$inspector[1][0]}</pre>
              [Ememy] Received
              <pre>{$inspector[1][1]}</pre>
            </div>
          </div>
        {/if}
      {/if}
    </section>
  </nav>
</main>
