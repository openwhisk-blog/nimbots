import App from './App.svelte';
import FinalApp from './FinalApp.svelte';

let final = location.search.startsWith("?final=")
console.log(final)

const app = final ?
	new FinalApp({
		target: document.body
	})
	: new App({
		target: document.body
	});

export default app;