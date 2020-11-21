export class OpenWhisk {

    base: string
    auth: string
    namespace: string

    constructor(apihost, key, namespace) {
        this.base = apihost + "/api/v1/namespaces/_/"
        this.auth = "Basic " + btoa(key)
        this.namespace = namespace
    }

    // handle a request
    // accepts: <method>:<action>
    // compose a request with authentication, methods and body
    // handle errors and rew
    async call(action: string, body?: object): Promise<object> {
        let a = action.split(":")
        let url = this.base + a.pop()
        let req = {
            method: a.length == 0 ? 'GET' : a[0],
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.auth
            }
        }
        if (body)
            req["body"] = JSON.stringify(body)
        return await fetch(url, req)
            .then((resp) => {
                if (resp.ok)
                    return resp.json()
                return {
                    "error": resp.statusText,
                    "code": resp.status
                }
            })
            .catch((err) => {
                return {
                    "error": err,
                    "code": "999"
                }
            })
    }

    async list() {
        let res = []
        let actions = await this.call("actions") as object[]
        //console.log(actions)
        for (let action of actions) {
            for (let ann of action["annotations"] as object[]) {
                if (ann["key"] == "nimbot") {
                    res.push(action["name"] + "." + ann["value"])
                }
            }
        }
        return res
    }

    async load(filename: string): Promise<string> {
        let name = filename.split(".")[0]
        let data = await this.call("actions/" + name + "?code=true")
        //console.log(data)
        return data["exec"]["code"]
    }

    async del(filename: string): Promise<object> {
        let name = filename.split(".")[0]
        return await this.call("DELETE:actions/" + name)
    }

    ext2kind = {
        "go": "go:1.12",
        "js": "nodejs:10",
        "py": "python:3"
    }

    async save(file: string, code: string, update: boolean): Promise<object> {
        let [name, ext] = file.split(".")
        let action = "PUT:actions/" + name + (update ? "?overwrite=true" : "")
        return await this.call(action, {
            namespace: "_",
            name: name,
            publish: true,
            exec: {
                kind: this.ext2kind[ext],
                binary: false,
                code: code
            },
            annotations: [{
                key: "nimbot",
                value: ext
            }, {
                key: "web-export",
                value: true
            }]
        })
    }
}