<script lang="ts">
  import { onMount } from "svelte";
  import { Battle } from "./battle";
  import { inspector } from "./store";

  let base = "https://apigcp.nimbella.io/api/v1/web/msciabgm-3h6qwxvwpw2/";
  let battle: Battle;

  let msg = "Nimbots Arena";
  let status = "Select Opponents";

  let ready = false;
  let speed = "50";
  let debug = false;

  let myBot: string;
  let enemyBot: string;
  let fighting = false;

  function finish(winner) {
    if (winner == -1) {
      msg = "Draw.";
    } else if (winner == 0) {
      msg = "You win!";
    } else {
      msg = "You lose...";
    }
    status = "Select Opponents";
    ready = false;
    fighting = false
    battle.stop()
  }

  function trace() {
    status = "Running one round...";
    fighting = true;
    battle.trace();
  }

  function suspended(msg: string) {
    status = msg;
    fighting = false
  }

  onMount(() => {
    let canvas: HTMLCanvasElement = document.getElementById(
      "arena"
    ) as HTMLCanvasElement;
    battle = new Battle(
      canvas.getContext("2d"),
      parseInt(canvas.getAttribute("width")),
      parseInt(canvas.getAttribute("height")),
      finish,
      suspended
    );
    window["battle"] = battle;
  });

  function selected() {
    let urls = [base + myBot, base + enemyBot];
    console.log(urls);
    battle.init(urls);
    ready = true;
    msg = "Ready!";
    status = "Make your choice";
  }

  function toggle() {
   fighting = !fighting
    if (fighting) {
      status = "Fighting!";
      battle.start();
    } else {
      status = "Suspended...";
      battle.stop()
    }
  }
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
        <h3>{status}</h3>
      </div>
      {#if !ready}
        <div class="row">
          <div class="column column-25">
            <label for="mybot">My Bot</label>
            <select bind:value={myBot} id="mybot">
              <option value="nimbots/JsBot">JsBot</option>
              <option value="nimbots/PyBot">PyBot</option>
              <option value="nimbots/GoBot">GoBot</option>
            </select>
          </div>
          <div class="column column-25">
            <label for="enemy">Enemy Bot</label>
            <select bind:value={enemyBot} id="enemy">
              <option value="testbots/Stage0">Stage0</option>
              <option value="testbots/Stage1">Stage1</option>
              <option value="testbots/Stage2">Stage2</option>
              <option value="testbots/Stage3">Stage3</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="column column-25">
            <button id="done" on:click={selected}>Start the Battle</button>
          </div>
          <div class="column column-25">
            <label>
              <input type=checkbox bind:checked={debug}>
              Debug
            </label>
          </div>
        </div>
      {:else}
        <div class="row">
          <div class="column column-25">
            <button id="fight" on:click={toggle}>
              {#if fighting}Suspend{:else}Fight to death!{/if}
            </button>
          </div>
          <div class="column column-25">
            <button id="step" on:click={trace}>Fight one round</button>
          </div>
        </div>
        <div class="row">
          <div class="column column-25">
            <label for="enemy">Battle Speed</label>
            <select
              bind:value={speed}
              on:blur={() => {
                Battle.speed = parseInt(speed);
              }}>
              <option value="10">Very Fast</option>
              <option value="25">Fast</option>
              <option value="50">Normal</option>
              <option value="100">Slow</option>
              <option value="200">Very Slow</option>
            </select>
          </div>
          <div class="column column-20">
            If your bot is too fast, the battle can be suspended!
          </div>
        </div>
      {/if}
      {#if debug}
        <div class="row">
          <div class="column column-50">
            [Robot 0] Sent #{$inspector[0][2]}
            <pre>{$inspector[0][0]}</pre>
            [0] Received
            <pre>{$inspector[0][1]}</pre>
          </div>
          <div class="column column-50">
            [1] Sent #{$inspector[1][2]}
            <pre>{$inspector[1][0]}</pre>
            [1] Received
            <pre>{$inspector[1][1]}</pre>
          </div>
        </div>
      {/if}
    </section>
  </nav>
</main>
