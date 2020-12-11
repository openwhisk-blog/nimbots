<script lang="ts">
  import "normalize.css/normalize.css";
  import "milligram/dist/milligram.min.css";
  import "./style.css";

  import Field from "./Field.svelte";
  import Editor from "./Editor.svelte";
  import Board from "./Board.svelte";

  import { source, board } from "./store";
  import { OpenWhisk } from "./openwhisk";

  // decode login
  let url = new URL(location.href);
  let ow: OpenWhisk = undefined;

  if (url.search.startsWith("?token=")) {
    let parsed = JSON.parse(atob(url.search.substring(7)));
    ow = new OpenWhisk(
      parsed["apihost"],
      parsed["uuid"] + ":" + parsed["key"],
      parsed["namespace"]
    );
    window["ow"] = ow;
    console.log("logged on", ow.namespace);
  }

  // calculate api server location
  let apiserver = "apigcp.nimbella.io";
  let path = "/api/v1/web/";
  let base = "https://" + apiserver + path;
</script>

{#if $board.show}
  <Board/>
{:else if $source == ''}
  <Field {base} {ow} />
{:else}
  <Editor {ow} />
{/if}
