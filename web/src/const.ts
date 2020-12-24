let debug = false;
let size = 10;
let redirect = "https%3A%2F%2Fnimbots-apigcp.nimbella.io%2F";
let namespace = "nimbots";

if(location.hostname == "localhost") {
    redirect = "true&port=5000";
    //redirect="https%3A%2F%2Fnimbots-apigcp.nimbella.io%2F";
    namespace = "githubsc-x98gwr9ujwl"
    debug=true
}

export const VERSION = "0.99"
export const URL_LOGIN = `https://apigcp.nimbella.io/api/v1/web/nimbella/user/login?provider=&redirect=${redirect}`
export const URL_REGISTER = `https://apigcp.nimbella.io/api/v1/web/${namespace}/rumble/register`
export const URL_SUBMIT = `https://apigcp.nimbella.io/api/v1/web/${namespace}/rumble/submit`
export const URL_PUBLIC = `https://apigcp.nimbella.io/api/v1/web/${namespace}/rumble/public`
export const URL_STATUS = `https://apigcp.nimbella.io/api/v1/web/${namespace}/rumble/status`
export const DEBUG = debug;

if(DEBUG) {
    console.log("URL_LOGIN", URL_LOGIN)
    console.log("URL_REGISTER", URL_REGISTER)
    console.log("URL_SUBMIT", URL_SUBMIT)
    console.log("URL_PUBLIC", URL_PUBLIC)
}