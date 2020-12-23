<script lang="ts">
  import { URL_STATUS, GROUP_SIZE } from "./const";
  import { board } from "./store";
  import { flag, nations } from "./nations";

  let round = "";

  interface Champ {
    name: string;
    owner: string;
    flag: number;
    top: boolean;
    score?: number;
  }

  type Groups = Record<string, Champ[]>;

  interface Match {
    flag0: number;
    owner0: string;
    name0: string;
    flag1: number;
    owner1: string;
    name1: string;
    result: number;
  }

  function groups(): Promise<Groups> {
    return fetch(URL_STATUS+"?size="+GROUP_SIZE).then((res) => res.json());
  }

  function battle(): Promise<Match[]> {
    let url = URL_STATUS + "?round=" + round+"&size="+GROUP_SIZE;
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
        <div class="column column-center column-offset">
          {#if round == ''}
            {#await groups()}
              <h1>Loading...</h1>
            {:then groups}
              {#each Object.keys(groups).sort( ) as group}
                <h1>Round {group}</h1>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Nation</th>
                    <th>Owner</th>
                    <th>Score</th>
                    <th>Passed</th>
                  </tr>
                  {#each groups[group] as champ}
                    <tr class={champ.top ? 'winner' : 'loser'}>
                      <td>
                        {#if champ.top}
                          <b>{champ.name}</b>
                        {:else}{champ.name}{/if}
                      </td>
                      <td>{flag[champ.flag]}{nations[champ.flag]}</td>
                      <td>{champ.owner}</td>
                      <td>{champ.score}</td>
                      <td>
                        {#if champ.top}<b>Yes</b>{:else}No{/if}
                      </td>
                    </tr>
                  {/each}
                </table>
                <button
                  on:click={(event) => {
                    round = group;
                    console.log(round)
                    event.preventDefault();
                  }}>Show Battles</button>
              {/each}
            {/await}
          {:else}
            {#await battle()}
              <h1>Loading...</h1>
            {:then matches}
              <h1>Battles</h1>
              <table>
                <tr>
                  <th>Left</th>
                  <th>Right</th>
                  <th>Result</th>
                </tr>
                {#each matches as match}
                  <tr>
                    <td>
                      {flag[match.flag0]}{match.name0}<br /><small>by
                        {match.owner0}
                        ({nations[match.flag0]})</small>
                    </td>
                    <td>
                      {flag[match.flag1]}{match.name1}<br /><small>by
                        {match.owner1}
                        ({nations[match.flag1]})</small>
                    </td>
                    <th>
                      {#if match.result == 0}
                        Winner:
                        {match.name0}
                      {:else if match.result == 1}
                        Winner:
                        {match.name1}
                      {:else if match.result == -1}
                        Draw
                      {:else if match.result == -2}TO DO{/if}
                    </th>
                  </tr>
                {/each}
              </table>
            {/await}
          {/if}
        </div>
      </div>
      <div class="row">
        <div class="column column-center column-offset">
          <button
            on:click={(v) => {
              board.set({ show: false, round: '' });
            }}>Battlefield</button>
        </div>
      </div>
    </section>
  </nav>
</main>
