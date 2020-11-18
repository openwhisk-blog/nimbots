<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { source, auth } from "./store";
  import { URL_GET } from "./const";
  import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
  let editor: monaco.editor.IStandaloneCodeEditor;
  
  let unsubscribeSource

  function warn(err) {
    alert(err);
  }

  async function retrieve(action) {
    if(action == "")
     return
    let opts = {
      method: "GET",
      headers: { Authorization: "Basic " + btoa($auth) },
    };
    //console.log(opts);
    fetch(URL_GET + $source, opts)
    .then((resp) => {
        //console.log(resp)
        if(resp.ok)
          return resp.json()
        return fetch("/"+$source)
        .then((resp) => {
          if(!resp.ok) 
            throw resp.statusText
          return resp.text()
        })
        .then((text) => {
          return { "code": text }
        })
        .catch(warn)
      })
    .then((json) => {
        if (json.code) {
          //console.log(json.code);
          editor.setValue(json.code);
          return;
        } else {
          console.log(json)
          warn("no code")
        }
      })
      .catch(warn);
  }

  function done() {
    editor.setValue("")
    source.set("");
  }

  onMount(() => {
    console.log("onMount editor");
    editor = monaco.editor.create(document.getElementById("editor"), {
      language: "javascript",
    });
    unsubscribeSource = source.subscribe(retrieve)
  });
  onDestroy(unsubscribeSource)

</script>

<button id="done" on:click={done}>Done</button>
<div id="editor" style="height: 600px" />
