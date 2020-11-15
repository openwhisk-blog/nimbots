<script lang="ts">
  import CodeMirror from "svelte-codemirror";
  import "codemirror/lib/codemirror.css";
  import { editing } from './store'

  export let source = "";
  
  function done() {
    editing.set(false)
  }
</script>

<div class="row">
  <div class="column column-25">
    <button id="done" on:click={done}>Done</button>
  </div>
</div>

<CodeMirror value={source} />
