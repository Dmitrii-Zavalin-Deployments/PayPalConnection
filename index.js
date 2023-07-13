// Import the libraries
const pantry = require('pantry-node');
const fetch = require("node-fetch");

// Create a new pantry client with your ID from environment variable
const pantryID = process.env.PANTRYID;
const pantryClient = new pantry(pantryID);
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Set the options for parsing JSON
const options = { parseJSON: true };

main()
async function main() {
    const GetIDs = await GetIDsFunction();
    await RefreshIDsFunction();
    const IDsArray = await Object.values(GetIDs)[0];
    console.log(IDsArray);
    await SendReceiptsPayPal(IDsArray);
}

async function GetIDsFunction() {
    return new Promise((resolve) => {
        pantryClient.basket
            .get(process.env.NAME, options)
            .then((contents) => resolve(contents))
    })
}

async function RefreshIDsFunction() {
    const payload = {
        id: []
    }
    pantryClient.basket
        .create(process.env.NAME, payload)
        .then((response) => console.log(response))
}

let callback = (element, index, array) => {
    fetch(
        `https://api-m.sandbox.paypal.com/v1/notifications/transaction-notifications/${element}`, // Use sandbox endpoint for testing
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
            },
            body: JSON.stringify({}),
        }
    )
        .then((response) => {
            //console.log(response);
            console.log("Receipt is sent");
        })
        .catch((error) => {
            console.log(error);
        });
};

async function SendReceiptsPayPal(IDsArray) {
    IDsArray.forEach(callback);
}