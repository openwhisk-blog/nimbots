
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
