<script lang="ts">
  import "normalize.css/normalize.css";
  import "milligram/dist/milligram.min.css";
  import "./style.css";

  import FinalField from "./FinalField.svelte";
  import { OpenWhisk } from "./openwhisk";

  // decode login
  let url = new URL(location.href);
  let ow: OpenWhisk = undefined;

  if (url.hash.length > 1) {
    console.log(url.hash);
    localStorage.setItem("referrer", url.hash.substring(1));
    url.hash = "";
    location.href = url.href;
  }

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

<FinalField {base} {ow} />
