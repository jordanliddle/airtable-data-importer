require('dotenv').config()

const fs      = require('fs');
const csv     = require("fast-csv");
const redis   = require('redis');

const API_KEY = process.env.API_KEY,
      BASE_NAME = process.env.BASE_NAME,
      BASE_ID = process.env.BASE_ID;

const Airtable = require('airtable');
let base = new Airtable({apiKey: API_KEY}).base(BASE_ID);

const bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);


const client  = redis.createClient();
client.on('connect', function() {
    console.log('connected');
});

function pullAllRecords() {
    base(BASE_NAME).select({
          // ensure the view is correct
          //  maxRecords: 75,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          records.forEach(function(record) {
            // log each requested record
            console.log('Retrieved', record.get('shopify partner id'));
            // save the record to Redis
            client.set(record.fields["shopify partner id"], record.id);
          });
          fetchNextPage();
      }, function done(err) {
          if (err) { console.error(err); return; }
          updateRecords();
      });
}

function updateRecords() {
  let csvstream = csv.fromPath("pleasework.csv", { headers: true })
      .on("data", function (row) {
          csvstream.pause();
          // send API request to update the record in Airtable.
          performUpdate(row)
          .then(delay(100)).then(function(data) {
            // resume the steam once record updates
            csvstream.resume();
          });
      })
      .on("end", function () {
          // log once all records have updated in Airtable
          console.log("All done.")
          // shutdown Redis
          client.quit();
      })
      .on("error", function (error) {
          console.log(error)
      });
}

function delay(delay) {
  return function(data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(data);
      }, delay);
    });
  }
}

function performUpdate(data) {

  // get record primary key in Redis
  return client.getAsync(data['shopify partner id'])
  .then(function(res) {
    let record = {
      "shopify partner id":                                       data["shopify partner id"],
      "internal url":                                             data["internal url"],
      "hubspot_url":                                              data["hubspot_url"],
      "partner url":                                              data["partner url"],
      "partner is current shopify expert":                        data["partner is current shopify expert"],
      "current partner manager":                                  data["current partner manager"],
      "partner country":                                          data["partner country"],
      "partner city":                                             data["partner city"],
      "partner province":                                         data["partner province"],
      "partner created at":                                       data["partner created at"],
      "number of development shops created":                      data["number of development shops created"],
      "net merchant change":                                      data["net merchant change"],
      "net mrr change":                                           data["net mrr change"],
      "number of forum posts":                                    data["number of forum posts"],
      "number of new standard merchants":                         data["number of new standard merchants"],
      "number of standard merchants upgraded to plus merchants":   data["number of standard merchants upgraded to plus merchants"]
    }

    if (res == null) {
      const fn = bluebird.promisify(base(BASE_NAME).create);
      return fn(record);
    } else {
      const fn = bluebird.promisify(base(BASE_NAME).update);
      return fn(res, record);
    }
  }).catch(function(e) {
    console.log(e)
  })
}

// run the program
pullAllRecords();
