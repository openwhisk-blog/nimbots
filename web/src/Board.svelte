<script lang="ts">
  import { URL_STATUS } from "./const";
  import { board } from "./store";
  import { flag, nations } from "./nations";
  import Share from "./Share.svelte";

  let round = "";
  let prefix = "feb";

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
    return fetch(URL_STATUS).then((res) => res.json());
  }

  function battle(): Promise<Match[]> {
    let url = URL_STATUS + "?round=" + round;
    return fetch(url).then((res) => res.json());
  }

  function sortByKeyReverse(groups) {
    return Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));
  }
</script>

<main class="wrapper">
  <nav class="navigation">
    <section class="container">
      <div class="row">
        <div class="column column-center column-offset">
          {#if round == ""}
            {#await groups()}
              <h1>Loading...</h1>
            {:then groups}
              <h1>Rules</h1>
              <li>
                Your fighter must win a round with a score &gt; 0 to get to the
                final round.
              </li>
              <li>
                Battles are run daily so you may need to wait one day to see
                your score.
              </li>
              <li>
                The result of a round is temporary until the round is complete
                with 10 figther partecipants (except the last one, where they
                can be less than 10).
              </li>
              <li>
                If you lose a round you can submit another fighter, up to 5.
              </li>
              <button
                on:click={(v) => {
                  board.set({ show: false, round: "" });
                }}>Battlefield</button
              >
              {#each sortByKeyReverse(groups) as group}
                <h1>Round {prefix}/{group}</h1>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Nation</th>
                    <th>Owner</th>
                    <th>Score</th>
                    <th>Top</th>
                  </tr>
                  {#each groups[group] as champ}
                    <tr>
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
                    {#if champ.top}
                      <tr>
                        <td colspan="6">
                          <Share
                            message="My fighter {champ.name} is Top Fighter on FAAS WARS!"
                            url="https://faaswars.nimbella.com"
                          />
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </table>
                <button
                  on:click={(event) => {
                    round = group;
                    console.log(round);
                    event.preventDefault();
                  }}>Show Battles</button
                >
              {/each}
            {/await}
            <div class="row">
              <div class="column column-center column-offset">
                <h1>Winners</h1>
              </div>
            </div>
            <table>
              <tr>
                <th>Month</th>
                <th>Name</th>
                <th>Owner</th>
                <th>Prize</th>
                <th>Video</th>
              </tr>
              <tr>
                <td>January</td>
                <td><b>Cortex2</b></td>
                <td>cortexbo</td>
                <td><b>$200</td>
                <td
                  ><a href="https://www.youtube.com/watch?v=hL-4c72yFD0"
                    >YouTube</a
                  ></td
                >
              </tr>
              <tr>
                <td>February</td>
                <td><b>To be assigned</b></td>
                <td>-</td>
                <td><b>$400</td>
                <td
                  >TODO</td
                >
              </tr>
              <tr>
                <td>March</td>
                <td><b>To be assigned</b></td>
                <td>-</td>
                <td><b>$800</td>
                <td
                  >TODO</td
                >
              </tr>
            </table>
          {:else}
            {#await battle()}
              <h1>Loading...</h1>
            {:then matches}
              <h1>Results of<br />Round {prefix}/{round}</h1>
              {#if matches.length == 0}
                <p>
                  No matches yet. Battles are run daily. Check later if you do
                  not see yor fighter.
                </p>
              {:else}
                <p />
                <table>
                  <tr>
                    <th>Left</th>
                    <th>Right</th>
                    <th>Result</th>
                  </tr>
                  {#each matches as match}
                    <tr>
                      <td>
                        {flag[match.flag0]}{match.name0}<br /><small
                          >by
                          {match.owner0}
                          ({nations[match.flag0]})</small
                        >
                      </td>
                      <td>
                        {flag[match.flag1]}{match.name1}<br /><small
                          >by
                          {match.owner1}
                          ({nations[match.flag1]})</small
                        >
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
                      <!-- td><button on:click={refight}>Fight!</button></td -->
                    </tr>
                  {/each}
                </table>
                <div class="row">
                  <div class="column column-center column-offset" />
                </div>
              {/if}
            {/await}
            <div class="row">
              <div class="column column-center column-offset">
                <button
                  on:click={(v) => {
                    board.set({ show: false, round: "" });
                  }}>Back to Battlefield</button
                >
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>
  </nav>
</main>

<style>
  table {
    border: 1;
  }
</style>
