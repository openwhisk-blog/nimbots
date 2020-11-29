echo $'<div class="column column-50">{@html `' >web/src/Doc.svelte
pandoc API.md >>web/src/Doc.svelte
echo $'`}</div>'>>web/src/Doc.svelte