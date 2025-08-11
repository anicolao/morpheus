import * as sdk from 'matrix-js-sdk';

const homeserverUrl = process.env.HOMESERVER_URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

if (!homeserverUrl || !username || !password) {
    console.error("HOMESERVER_URL, USERNAME, and PASSWORD environment variables are required.");
    process.exit(1);
}

async function getToken() {
    const client = sdk.createClient({
        baseUrl: homeserverUrl,
    });

    try {
        const loginResult = await client.loginWithPassword(username, password);
        console.log(loginResult.access_token);
    } catch (error: any) {
        console.error("Failed to get access token:", error.message);
        process.exit(1);
    }
}

getToken();
