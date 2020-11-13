export function degrees2radians(degrees: number): number {
    return degrees * (Math.PI/180)
}

export function radians2degrees(radians: number): number {
    return radians * (180/Math.PI)
}

export function euclidDistance(x1:number, y1:number, x2:number, y2:number): number {
 return  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

export function inRect(x1:number, y1:number, x2:number, y2:number, width: number, height: number) {
    return (x2+width) > x1 && x1 > x2 && (y2+height) > y1 && y1 > y2
}

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