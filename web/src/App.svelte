<script lang="ts">
  import "normalize.css/normalize.css";
  import Field from "./Field.svelte";
  import Editor from "./Editor.svelte";
  import { source } from "./store";
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
  let apiserver = location.hostname;
  let path = "/api/";
  if (location.hostname == "localhost") {
    // development namespace
    // change this to your own for development
    apiserver = "apigcp.nimbella.io";
    path = "/api/v1/web/";
  }

  let base = "https://" + apiserver + path;
</script>

{#if $source == ''}
  <Field {base} {ow} />
{:else}
  <Editor {ow} />
{/if}
