let redirect = "https%3A%2F%2Fnimbots-apigcp.nimbella.io%2F";
if(location.hostname == "localhost")
    redirect = "true&port=5000";

export const VERSION = "0.7-alpha"
export const URL_LOGIN = "https://apigcp.nimbella.io/api/v1/web/nimbella/user/login?provider=&redirect="+redirect
export const URL_REGISTER = "https://apigcp.nimbella.io/api/v1/web/nimbots/rumble/register"