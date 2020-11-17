<script lang="ts">
  import "normalize.css/normalize.css";
  import { auth } from "./store";
  import Field from "./Field.svelte";
  import Editor from "./Editor.svelte";
  import { source } from "./store";

  // decode login
  let url = new URL(location.href);
  if (url.search.startsWith("?token=")) {
    let parsed = JSON.parse(atob(url.search.substring(7)));
    let cred = parsed["uuid"] + ":" + parsed["key"];
    auth.set(cred);
    console.log(cred);
  }

  // calculate api server location
  let apiserver = location.hostname;
  let path = "/api/";
  if (location.hostname == "localhost") {
    // development namespace
    // change this to your own for development
    apiserver = "apigcp.nimbella.io";
    path = "/api/v1/web/nimbots/";
  }

  let base = "https://" + apiserver + path;
</script>

{#if $source == ''}
  <Field {base} />
{:else}
  <Editor />
{/if}
