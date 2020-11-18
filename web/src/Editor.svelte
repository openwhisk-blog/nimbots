<script lang="ts">
  import Doc from "./Doc.svelte";
  import { onDestroy, onMount } from "svelte";
  import { source, auth } from "./store";
  import { URL_GET } from "./const";

  interface Editor extends Window {
    setValue: (string) => void
    getValue:  () => string
  }
  
  let editor : Editor 

  function warn(err) {
    alert(err);
  }

  async function retrieve(action) {
    if (action == "") return;
    let opts = {
      method: "GET",
      headers: { Authorization: "Basic " + btoa($auth) },
    };
    //console.log(opts);
    fetch(URL_GET + $source, opts)
      .then((resp) => {
        //console.log(resp)
        if (resp.ok) return resp.json();
        return fetch("/" + $source)
          .then((resp) => {
            if (!resp.ok) throw resp.statusText;
            return resp.text();
          })
          .then((text) => {
            return { code: text };
          })
          .catch(warn);
      })
      .then((json) => {
        if (json.code) {
          editor.setValue(json.code)
          return;
        } else {
          console.log(json);
          warn("no code");
        }
      })
      .catch(warn);
  }

  function done() {
    editor.setValue("")
    source.set("");
  }

  onMount(() => {
    editor = window.frames[0] as Editor
  })
  let unsubscribeSource = source.subscribe(retrieve);
  onDestroy(unsubscribeSource);
</script>
<main class="wrapper">
  <section class="container">
    <h2>Edit your Robot</h2>
    <iframe title="editor" id="editor" src="editor.html" style='height: 600px; width: 100%;' frameborder="0" scrolling="no" />
    <div class="row"><button id="done" on:click={done}>Done</button></div>
    <div class="row">
      <Doc/>
    </div> 
  </section>
</main>

