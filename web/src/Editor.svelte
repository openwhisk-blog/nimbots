<script lang="ts">
  //import CodeMirror from "svelte-codemirror";
  //import "codemirror/lib/codemirror.css";
  //import * as monaco from "monaco-editor";
  import { onMount } from "svelte";
  import { source, auth } from "./store";
  import { URL_GET } from "./const";
  import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
  let editor: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    console.log("onMount editor");
    editor = monaco.editor.create(document.getElementById("editor"), {
      language: "javascript",
    });
    console.log(editor);
  });

  function warn(err) {
    alert("Cannot load source code");
  }

  source.subscribe(async (action) => {
    let opts = {
      method: "GET",
      headers: { Authorization: "Basic " + btoa($auth) },
    };
    console.log(opts);
    fetch(URL_GET + $source, opts)
      .then((data) => data.json())
      .then((json) => {
        if (json.code) {
          console.log(json.code);
          editor.setValue(json.code);
          //console.log(json.code)
          return;
        }
        fetch("/" + $source)
          .then((data) => data.text())
          .then((text) => editor.setValue(text))
          .catch(warn);
      })
      .catch(warn);
  });

  let text = source;

  function done() {
    source.set("");
  }
</script>

<button id="done" on:click={done}>Done</button>
<button
  id="show"
  on:click={() => {
    alert(text);
  }}>Show</button>
<div id="editor" style="height: 600px" />
