import { writable } from 'svelte/store';


export const inspector = writable([{n: 0, req: "", res:""},{n: 0, req: "", res:""}])

export const source = writable("")
