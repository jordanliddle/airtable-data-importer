
var fs = require('fs');
var csv = require("fast-csv");
var redis = require('redis');
var client = redis.createClient();
const pry = require('pryjs')
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyK7hube384uNDmc'}).base('appNwUk0MQdtk41vZ');
var bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on('connect', function() {
    console.log('connected');
});

function pullRecords() {
  return new Promise(function (resolve, reject) {
    base('DATA').select({
          // Selecting the first 3 records in Grid view:
          maxRecords: 10,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function(record) {
            console.log('Retrieved', record.get('Shopify Partner Id'));
            client.set(record.fields["Shopify Partner Id"], record.id);
          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();

      }, function done(err) {
          resolve(updateRecords())
          if (err) { console.error(err); return; }
      });
  })
}

function updateRecords() {
  let csvstream = csv.fromPath("sandbox.csv", { headers: true })
      .on("data", function (row) {
          csvstream.pause();
          client.getAsync(row['Shopify Partner Id']).then(function(res) {
            console.log(res); // => 'bar'
          });
          csvstream.resume();
      })
      .on("end", function () {
          console.log("We are done!")
      })
      .on("error", function (error) {
          console.log(error)
      });
}

pullRecords();


// base('DATA').replace(res, {
//   "Shopify Partner Id": row["Shopify Partner Id"],
//   "Partner Company Name": [
//     row["Partner Company Name"]
//   ],
//   "partner url": row["partner url"],
//   "Partner Is Current Shopify Expert": row["Partner Is Current Shopify Expert"],
//   "Partner Email": row["Partner Email"],
//   "Partner Contact First Name": row["Partner Contact First Name"],
//   "Partner Contact Last Name": row["Partner Contact Last Name"],
//   "Current Partner Manager": row["Current Partner Manager"],
//   "Partner Country": row["Partner Country"],
//   "Partner City": row["Partner City"],
//   "Partner Province": row["Partner Province"],
//   "Partner Created At (Est)": row["Partner Created At (Est)"],
//   "number of development shops created": row["number of development shops created"],
//   "Number Of New Leads": row["Number Of New Leads"],
//   "net customers change": row["net customers change"],
//   "Net Mrr Change": row["Net Mrr Change"],
//   "Shopify Partner Id 2": row["Shopify Partner Id 2"],
//   "Shopify Partner Id 3": row["Shopify Partner Id 3"]
// }, function(err, record) {
//     if (err) { console.error(err); return; }
//     console.log(record.get('Shopify Partner Id'));
// });