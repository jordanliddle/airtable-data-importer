# Airtable Importer App

Simple and lightweight Airtable data importer tool for Shopify Partnerships.

## Requirements

* [Airtable Developer Account]()

* [Node](https://nodejs.org/en/)

* [Redis](https://redis.io/)

## Credentials

Follow [this guide](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-) to obtain your Airtable API key.

This importer tool use a `.env` file to store your API key. After cloning the repository, you will need to rename the `.sample-env` file to `.env` and copy the value of the Airtable API Key to the `.env` file in the following format:

```
API_KEY=YOUR_API_KEY
```

where `YOUR_API_KEY` is the value of your Airtable API key respectively.


You will also need to substitute your `BASE_ID` and `BASE_NAME` in your `.env` with the correct values which can be found [here](http://help.grow.com/connecting-your-data/airtable/airtable-setup-and-finding-your-base-id-and-base-name).

Once you've configured your environment variables, you will need to add the CSV file you wish to import to the project directory.

Finally replace the csv file path in the app where needed. 

## Running the app

`$ redis-server`

`$ node app.js`
