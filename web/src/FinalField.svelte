<script lang="ts">
  import type { OpenWhisk } from "./openwhisk";
  import { BattleWeb } from "./battleweb";
  import { AssetsLoader } from "./util";
  import { onMount, afterUpdate } from "svelte";
  import { inspector } from "./store";
  import { rumbleWinners } from "./rumble";
  import type { Battle } from "./battle";
  import { flag } from "./nations";

  export let base: string;
  export let ow: OpenWhisk;

  let battle: BattleWeb;
  let msg = ow === undefined ? "final round" : "Choose opponents";
  let status = "Select Opponents";

  let ready = false;

  let myBot: string;
  let enemyBot: string;

  let fighting = false;
  let editing = false;

  function suspended(msg: string, state0: string, state1: string) {
    status = msg;
    fighting = false;
    inspector.update((info) => {
      info[0].state = state0;
      info[1].state = state1;
      return info;
    });
  }

  let image = ow === undefined ? "splash" : "ready";
  let Images = new AssetsLoader({
    splash: "img/splash.png",
    ready: "img/ready.png",
    lose: "img/lose.png",
    won: "img/won.png",
    draw: "img/draw.png",
  });

  function splash() {
    //console.log("splash")
    let canvas = document.getElementById("arena") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);
    ctx.drawImage(Images.get(image), 0, 0);
  }

  afterUpdate(() => {
    if (!(editing || ready)) splash();
  });

  function fight(champName, champUrl, enemyName, enemyUrl) {
    myBot = champName;
    enemyBot = enemyName;

    let urls = [base + champUrl, base + enemyUrl];
    let canvas = document.getElementById("arena") as HTMLCanvasElement;

    let startAngles = [
      [Math.random() * 360, Math.random() * 360],
      [Math.random() * 360, Math.random() * 360],
    ];

    battle.webinit(canvas.getContext("2d"), urls, startAngles);
    ready = true;
    msg = "FAASfighters in position!";
    status = "Ready to fight.";
    battle.draw();
    toggle()
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
    Images.loadAll(() => splash());
    prepare();
  });

  // ------

  let ranking = [];
  let battles = [];
  let completed = {};

  function save() {
    localStorage.setItem("ranking", JSON.stringify(ranking));
    localStorage.setItem("battles", JSON.stringify(battles));
    localStorage.setItem("completed", JSON.stringify(completed));
  }

  window["clean"] = function () {
    localStorage.removeItem("ranking");
    localStorage.removeItem("battles");
    localStorage.removeItem("completed");
  };

  async function prepare() {
    let t = localStorage.getItem("ranking");
    if (t) {
      ranking = JSON.parse(t);
    } else {
      ranking = await rumbleWinners();
      for (let i in ranking) {
        ranking[i].score = 0;
      }
    }

    t = localStorage.getItem("battles");
    if (t) {
      battles = JSON.parse(t);
      completed = JSON.parse(localStorage.getItem("completed"));
    } else {
      battles = [];
      for (let i of ranking) {
        for (let j of ranking) {
          if (i !== j) {
            battles.push([i, j]);
          }
        }
      }
      battles.sort(() => Math.random() - 0.5);
      completed = {};
    }
    save();
  }

  function updateScore(winner, incr) {
    for (let i in ranking) {
      if (ranking[i].name == winner) {
        ranking[i].score += incr;
      }
    }
    ranking.sort((a, b) => b.score - a.score);
    console.log(ranking);
  }

  function finish(winner: number) {
    msg = "Game over";
    image = "ready";
    if (winner == -2) {
    } else if (winner == -1) {
      updateScore(myBot, 1);
      updateScore(enemyBot, 1);
      msg = "Draw! " + myBot.split("/").pop() + " " + enemyBot.split("/").pop();
    } else if (winner == 0) {
      updateScore(myBot, 3);
      msg = "Winner: " + myBot.split("/").pop();
    } else {
      msg = "Winner: " + enemyBot.split("/").pop();
      updateScore(enemyBot, 3);
    }
    status = "Select Opponents";
    ready = false;
    fighting = false;
    battle.stop();
    completed[myBot + ":" + enemyBot] = 1;
    save();
  }
</script>

<main class="wrapper">
  <section class="container">
    <h1>{msg}</h1>
    <div class="row"><canvas id="arena" width="500" height="500" /></div>

    {#if !ready}
      <div class="row">
        <div class="column column-center column-offset">
          <h1>Ranking</h1>
          <table>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
            {#each ranking as champ}
              <tr>
                <td>
                  {flag[champ.flag]}
                  {#if champ.top}
                    <b>{champ.name}</b>
                  {:else}{champ.name}{/if}
                </td>
                <td>{champ.score}</td>
              </tr>
            {/each}
          </table>
        </div>
      </div>

      <div class="row">
        <div class="column column-center column-offset">
          <h1>Battles</h1>
          <table>
            {#each battles as battle}
              {#if !completed[battle[0].name + ":" + battle[1].name]}
                <tr>
                  <td>{battle[0].name}</td>
                  <td>{battle[1].name}</td>
                  <td>
                    <button
                      on:click={() =>
                        fight(
                          battle[0].name,
                          battle[0].url,
                          battle[1].name,
                          battle[1].url
                        )}>Fight</button
                    >
                  </td>
                </tr>
              {/if}
            {/each}
          </table>
        </div>
      </div>
    {:else}
      <div class="row">
        <h3>{status}</h3>
      </div>
      <div class="row">
        <h4>
          You:
          <span id="cyan">{battle.robotName(0)}</span><br />
          Enemy:
          <span id="red">{battle.robotName(1)}</span>
        </h4>
      </div>
      <div class="row">
        <div class="column column-left column-offset">
          <br />
          <button id="fight" on:click={toggle}>
            {#if fighting}Suspend{:else}Fight!{/if}
          </button>
          <br />
          <br />
        </div>
        <div class="column column-right">
          <br />
          <button
            on:click={() => {
              ready = false;
              fighting = false;
              battle.terminate();
            }}>Stop</button
          >
          <button
          on:click={() => {
            ready = false;
            fighting = false;
            battle.terminate();
            finish(-1)
          }}>Draw</button
        >
        </div>
      </div>
    {/if}
  </section>
</main>

<style>
  #arena {
    border: 1px solid grey;
    float: left;
  }

  #cyan {
    color: rgb(66, 168, 205);
  }
  #red {
    color: rgb(211, 19, 19);
  }
</style>
