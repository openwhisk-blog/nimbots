
export class AssetsLoader {

    assets: object = {}
    loaded = 0
    total = 0
    sources: object

    constructor(sources: object) {
        this.sources = sources
    }

    get(name: string): HTMLImageElement {
        return this.assets[name]
    }

    loadAll(callback: () => void) {
        for(let name in this.sources) {
            this.assets[name] = new Image()
            this.assets[name].src = this.sources[name]
            ++this.total
        }
        for(let name in this.assets) {
            this.assets[name].onload = () => {
                ++this.loaded
                if(this.total==this.loaded)
                    callback()
            }
        }
    }
}

class Logger {

    requestOn: false
    request(...args: any[]) {
        if(this.requestOn)
            console.log("request:", ...args)
    }

    actionOn: false
    action(...args: any[]) {
        if(this.actionOn)
            console.log("action:", ...args)
    }

    eventOn: false
    event(...args: any[]) {

        if(this.eventOn)
            console.log("event:", ...args)
    }
}

export let log = new Logger()