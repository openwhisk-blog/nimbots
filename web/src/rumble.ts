import { URL_REGISTER } from './const'

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

export function rumbleDelete(name): Promise<string> {
    return fetch(encodeURI(URL_REGISTER+"?key="+name))
    .then((resp) => resp.text())
    .then((value)=> value)
}