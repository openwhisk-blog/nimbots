<script lang="ts">
  import { DEBUG } from "./const";
  import { submitting, source } from "./store";
  import { flags, nations } from "./nations";
  import type { OpenWhisk } from "./openwhisk";
  import { rumbleSubmit } from "./rumble";
  export let ow: OpenWhisk;

  let msg = "";
  let disabled = true;
  let pick = "25:0";
  let n = 25;
  let m = 0;
  let flag = "";
  let flagn = 0;

  $: {
    n = parseInt(pick.split(":")[0]);
    m = parseInt(pick.split(":")[1]);
    flag = n < 25 ? flags[n][m] : "";
    disabled = flag == "";
    msg = disabled
      ? "Select your country."
      : `Please confirm submitting ${flag} ${$submitting}`;
    flagn = n * 25 + m;
    if (DEBUG) {
      console.log(pick);
      console.log(flagn);
      console.log(nations[flagn]);
    }
  }

  async function submit() {
    let namespace = ow.namespace;
    let prefix = namespace.split("-")[0];
    let name = $submitting.split(".").slice(0, -1).join(".");
    let data = "" + flagn + ":default/" + name;

    if (confirm("Are you sure you want to submit your fighter?")) {
      let url = `${ow.namespace}/default/${name}`;
      rumbleSubmit(namespace, data)
      .then( (res) => {
         msg = res["message"] ||  "Cannot submit your fighter. Please report in the community."
      })
    }
  }
</script>

<div class="row">
  <h3>{msg}</h3>
</div>
<!-- 
<div class="row">
  <div class="column column-60 column-offset">
    {#each flags as group, i}
      <div>
        {#each group as flag, j}
          <span
            class={n == i && m == j ? 'flag-border' : 'flag'}
            id={i + ':' + j}
            on:click={(event) => {
              console.log(event);
              pick = event.currentTarget.id;
            }}>{flag}</span>
        {/each}
      </div>
    {/each}
  </div>
</div>
-->
<div class="row">
  <div class="column column-20 column-offset">
    <select bind:value={pick}>
      <option value="25:0">- Select -</option>
      {#each nations as nation, i}
        <option value={'' + Math.floor(i / 25) + ':' + (i % 25)}>
          {nation}
        </option>
      {/each}
    </select>
  </div>
  <div>
    <button {disabled} on:click={submit}>Submit</button>
    &nbsp;
    <button
      on:click={() => {
        submitting.set('');
      }}>Back</button>
  </div>
</div>
<div class="row">
  <div class="column column-center column-offset">
    <h4>You can submit up to 5 fighters. Use a different name for each fighter.</h4>
  </div>
</div>