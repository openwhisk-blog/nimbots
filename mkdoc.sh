echo $'<div class="column column-center column-offset">{@html `' >web/src/Doc.svelte
pandoc API.md >>web/src/Doc.svelte
echo $'`}</div>'>>web/src/Doc.svelte
