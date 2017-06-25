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
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          records.forEach(function(record) {
            // log each requested record
            console.log('Retrieved', record.get('Shopify Partner Id'));
            // save the record to Redis
            client.set(record.fields["Shopify Partner Id"], record.id);
          });
          fetchNextPage();
      }, function done(err) {
          if (err) { console.error(err); return; }
          updateRecords();
      });
}

function updateRecords() {
  let csvstream = csv.fromPath("sample.csv", { headers: true })
      .on("data", function (row) {
          // pause the stream
          csvstream.pause();
          // send API request to update the record in Airtable
          performUpdate(row)
          .then(function() {
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

function cleanUpRemainingRecords() {

}

function performUpdate(data) {

  // get record primary key in Redis
  return client.getAsync(data['Shopify Partner Id'])
  .then(function(res) {
    let record = {
      "Shopify Partner Id":                   data["Shopify Partner Id"],
      "Partner Company Name":                 data["Partner Company Name"],
      "partner url":                          data["partner url"],
      "Partner Is Current Shopify Expert":    data["Partner Is Current Shopify Expert"],
      "Partner Email":                        data["Partner Email"],
      "Partner Contact First Name":           data["Partner Contact First Name"],
      "Partner Contact Last Name":            data["Partner Contact Last Name"],
      "Current Partner Manager":              data["Current Partner Manager"],
      "Partner Country":                      data["Partner Country"],
      "Partner City":                         data["Partner City"],
      "Partner Province":                     data["Partner Province"],
      "Partner Created At (Est)":             data["Partner Created At (Est)"],
      "number of development shops created":  data["number of development shops created"],
      "Number Of New Leads":                  data["Number Of New Leads"],
      "net customers change":                 data["net customers change"],
      "Net Mrr Change":                       data["Net Mrr Change"],
      "Shopify Partner Id 2":                 data["Shopify Partner Id 2"],
      "Shopify Partner Id 3":                 data["Shopify Partner Id 3"]
    }

    if (res == null) {
      const fn = bluebird.promisify(base(BASE_NAME).create);
      return fn(record)
    } else {
      const fn = bluebird.promisify(base(BASE_NAME).replace);
      return fn(res, record)
    }
  }).catch(function(e) {
    console.log(e)
  })
}

// run the program
pullAllRecords();
