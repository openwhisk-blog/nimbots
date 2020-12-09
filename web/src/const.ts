let redirect = "https%3A%2F%2Fnimbots-apigcp.nimbella.io%2F";
if(location.hostname == "localhost")
    redirect = "true&port=5000";

export const VERSION = "0.9"
export const URL_LOGIN = "https://apigcp.nimbella.io/api/v1/web/nimbella/user/login?provider=&redirect="+redirect
export const URL_REGISTER = "https://apigcp.nimbella.io/api/v1/web/nimbots/rumble/register"
export const URL_PUBLISH = "https://apigcp.nimbella.io/api/v1/web/nimbots/rumble/publish"
export const URL_PUBLIC = "https://apigcp.nimbella.io/api/v1/web/nimbots/rumble/public"
