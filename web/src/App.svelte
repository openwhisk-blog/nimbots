<script lang="ts">
	import { onMount } from 'svelte'
	import { Battle } from './battle'
	let battle: Battle
	let url = "https://apigcp.nimbella.io/api/v1/web/msciabgm-3h6qwxvwpw2/testbots/Stage0"
	onMount(() => {
		let canvas: HTMLCanvasElement = document.getElementById("arena") as HTMLCanvasElement
		battle = new Battle(
			canvas.getContext("2d"),
			parseInt(canvas.getAttribute("width")),
			parseInt(canvas.getAttribute("height")),
			[url, url])
		window["battle"] = battle
	})
	function single() {
		battle.single()
	}
	function toggle() {
		Battle.waiting = !Battle.waiting
		if(!Battle.waiting)
			battle.start()
	}
</script>
<style>
#arena {
    border: 1px solid grey;
    float:left;
}
</style>
<main class="wrapper">
	<nav class="navigation">
	  <section class="container">
		<h1>Nimbots Arena</h1>
		<div class="row">
		  <canvas id="arena" width="500" height="500"></canvas>
		</div>
		<div class="row">
		 <span id="message">Click Fight to start</span>
		</div>
		<div class="row">
		  <div class="column column-20">
			<label for="mybot">My Bot</label>
			<select id="mybot">
			  <option>JsBot</option>
			  <option>PyBot</option>
			  <option>GoBot</option>
			</select>
		  </div>
		  <div class="column column-20">
			<label for="opponent">Opponent</label>
			<select id="opponent">
			  <option>Stage0</option>
			  <option>Stage1</option>
			  <option>Stage2</option>
			  <option>Stage3</option>
			</select>
		  </div>
		</div>
		<div class="row">
		  <div class="column column-20">
			  <button id="step"  on:click={single}>One Step</button>
		  </div>
		  <div class="column column-20">
			  <button id="fight" on:click={toggle}>
				{#if Battle.waiting}
				  Fight!
				{:else}
				  Pause!
				{/if}
			  </button>
		  </div>
		</div>
	  </section>
	</nav>
  </main>



