import App from './App.svelte';
import 'normalize.css/normalize.css';
import 'milligram/dist/milligram.min.css';

// calculate api server location 
let apiserver = location.hostname
let path = "/api/"
if(location.hostname == "localhost")  {
  // development namespace 
  // change this to your own for development
  apiserver = "apigcp.nimbella.io"
  path = "/api/v1/web/msciabgm-3h6qwxvwpw2/"
} 

const app = new App({
	target: document.body,
	props: { "base": "https://"+apiserver+path }
});

//export default app;