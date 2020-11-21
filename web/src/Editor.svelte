<script lang="ts">
  import Doc from "./Doc.svelte";
  import { onDestroy, onMount } from "svelte";
  import { source } from "./store";
  import { URL_GET } from "./const";
  import type { OpenWhisk } from "./openwhisk";

  export let ow: OpenWhisk;

  interface Editor extends Window {
    setValue: (filename: string, code: string) => void;
    getValue: () => string;
  }

  let editor: Editor;

  function warn(err) {
    alert(err);
  }

  function cancel() {
    if (confirm("Are you sure you want to lose your changes?")) {
      editor.setValue("", "");
      source.set("");
    }
  }

  function del() {
    if (confirm("Are you sure you want to delete this Robot?")) {
      ow.del($source).then(() => {
        editor.setValue("", "");
        source.set("");
      });
    }
  }

  async function  save() {
    let code = await editor.getValue()
    console.log(code)
    ow.save($source, code, true).then(() => {
      source.set("");
    });
  }

  onMount(() => {
    editor = window.frames[0] as Editor;
  });

  let unsubscribeSource = source.subscribe(async (filename) => {
    console.log("loading " + filename);
    let code = await ow.load(filename);
    editor.setValue(filename, code);
  });

  onDestroy(unsubscribeSource);
</script>

<main class="wrapper">
  <section class="container">
    <h2>{$source}</h2>
    <iframe
      title="editor"
      id="editor"
      src="editor.html"
      style="height: 500px; width: 100%;"
      frameborder="0"
      scrolling="no" />
    <div class="row">
      <button id="done" on:click={save}>Save</button>
      &nbsp;
      <button id="done" on:click={cancel}>Cancel</button>
      &nbsp;
      <button id="done" on:click={del}>Delete</button>
    </div>
    <div class="row">
      <Doc />
    </div>
  </section>
</main>
