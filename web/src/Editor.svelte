<script lang="ts">
  import Doc from "./Doc.svelte";
  import { onDestroy, onMount } from "svelte";
  import { source } from "./store";
  import type { OpenWhisk } from "./openwhisk";
  import { rumbleSave, rumbleDelete } from './rumble'

  export let ow: OpenWhisk;

  interface Editor extends Window {
    setValue: (filename: string, code: string) => void;
    getValue: () => string;
  }

  let editor: Editor = undefined;

  async function init() {
    editor = window.frames[0] as Editor;
    let filename = $source;
    let code = await ow.load(filename);
    editor.setValue(filename, code);
  }

  function warn(err) {
    alert(err);
  }

  function cancel() {
    if (confirm("Are you sure you want to lose your changes?")) {
      editor.setValue("", "");
      source.set("");
    }
  }

  async function del() {
    if (confirm("Are you sure you want to delete this Robot?")) {
      ow.del($source).then(() => {
        editor.setValue("", "");
        source.set("");
      });
      await rumbleDelete(`${ow.namespace}:${$source}`)
    }
  }

  async function save() {
    let code = await editor.getValue();
    //console.log(code);
    ow.save($source, code, true).then(() => {
      source.set("");
    });
    await rumbleSave(`${ow.namespace}:${$source}`, code)
  }
</script>

<main class="wrapper">
  <section class="container">
    <div class="row">
      <iframe
        on:load={init}
        title="editor"
        id="editor"
        src="editor.html"
        style="height: 500px; width: 100%;"
        frameborder="0"
        scrolling="no" />
    </div>
    <br />
    <div class="clearfix">
      <!-- Float either directions -->
      <div class="float-left">
        <button id="done" on:click={save}>Save</button>
        &nbsp;
        <button id="done" on:click={cancel}>Cancel</button>
        &nbsp;
        <button id="done" on:click={del}>Delete</button>
      </div>
      <div class="float-right">
        <h3>
          <tt>{$source}</tt>
        </h3>
      </div>
    </div>
    <div class="row">
      <Doc />
    </div>
  </section>
</main>
