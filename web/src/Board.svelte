<script lang="ts">
  import { URL_STATUS } from "./const";
  import { onMount } from "svelte";
  import { board } from "./store";
  import { flag, nations } from "./nations";

  interface Champ {
    name: string;
    owner: string;
    flag: number;
    score?: number;
  }

  interface Match {
    id: string;
    round: number;
    outcome?: number;
    owner0: string;
    bot0: string;
    flag0: number;
    owner1: string;
    bot1: string;
    flag1: number;
  }

  interface Battles {
    battles: string[];
    champs: Champ[];
  }

  interface Battle {
    battle: Match[];
    score: Champ[];
  }

  function battles(): Promise<Battles> {
    let url = URL_STATUS;
    return fetch(url).then((res) => res.json());
  }

  function battle(): Promise<Battle> {
    let date = $board.date;
    let url = URL_STATUS + "?battle=" + date;
    return fetch(url).then((res) => res.json());
  }
</script>

<style>
  table {
    border: 1;
  }
</style>

<main class="wrapper">
  <nav class="navigation">
    <section class="container">
      <div class="row">
        <div class="column column-50">
          {#if $board.date == ''}
            {#await battles()}
              <h1>Loading...</h1>
            {:then battles}
              <h1>Fighters</h1>
              <table>
                <tr>
                  <th>Name</th>
                  <th>Nation</th>
                  <th>Owner</th>
                </tr>
                {#each battles.champs as champ}
                  <tr>
                    <td><b>{champ.name.split('/')[1]}</b></td>
                    <td>{flag[champ.flag]}{nations[champ.flag]}</td>
                    <td>{champ.name.split('/')[0]}</td>
                  </tr>
                {/each}
              </table>
              {#if battles.battles.length == 0}
                <h3>Watch here for the first grouping.</h3>
              {:else}
                <h1>Battles</h1>
                <ul>
                  {#each battles.battles as date, i}
                    <li>
                      <!-- svelte-ignore a11y-missing-attribute -->
                      <a
                        on:click={(event) => {
                          date = battles.battles[i];
                          console.log(date);
                          event.preventDefault();
                        }}>{date}</a>
                    </li>
                  {/each}
                </ul>
              {/if}
            {/await}
          {:else}
            {#await battle()}
              <h1>Loading...</h1>
            {:then battle}
              <h1>Battles</h1>
              <table>
                {#each battle.battle as match}
                  <tr>
                    <td>{match.round}</td>
                    <td>{match.flag0} {match.bot0}</td>
                    <td>{match.flag1} {match.bot1}</td>
                    <td>{match.outcome}</td>
                  </tr>
                {/each}
              </table>
              <h1>Scores</h1>
              <table>
                {#each battle.score as score}
                  <tr>
                    <td>{score.flag}</td>
                    <td>{score.name}</td>
                    <td>{score.score}</td>
                  </tr>
                {/each}
              </table>
            {/await}
          {/if}
        </div>
      </div>
      <button
        on:click={(v) => {
          board.set({ show: false, date: '' });
        }}>Battlefield</button>
    </section>
  </nav>
</main>
