# Airtable Importer App

Simple and lightweight data importer tool for Shopify Partnerships.

## Requirements

* [Node](https://nodejs.org/en/)
* [Redis](https://redis.io/)

## Credentials

Follow [this guide](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-) to obtain your Airtable API key.

This importer tool use a `.env` file to store your API key. After cloning the repository, you will need to create a rename the `.sample-env` file to `.env` and copy the value of the Airtable API Key to the `.env` file in the following format:

```
API_KEY=YOUR_API_KEY
```

where `YOUR_API_KEY` is the value of your Airtable API key respectively. 

## Running the app

`$ node app.js`

