import { URL_REGISTER, URL_PUBLISH, URL_PUBLIC } from './const'

export function rumbleSave(name: string, code: string): Promise<string> {
    let data = {
        key: name,
        value: code
    }
    return fetch(URL_REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((resp)=> resp.text())
    .then((value)=> value)
}

export function rumblePublish(name: string, url: string): Promise<boolean> {
    let data = {
        name: name,
        url: url
    }
    return fetch(URL_PUBLISH, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((resp)=> resp.text())
    .then((value) => true)
    .catch((err) => false) 
}

interface Enemy {
    name: string
    url: string
}

export async function rumblePublic(): Promise<Enemy[]> {
    return fetch(URL_PUBLIC)
    .then((resp)=> resp.json())
    .catch((err)=> [])
}

export function rumbleDelete(name): Promise<string> {
    return fetch(encodeURI(URL_REGISTER+"?key="+name))
    .then((resp) => resp.text())
    .then((value)=> value)
}