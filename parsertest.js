var fs = require('fs');
var csv = require("fast-csv");
var redis = require('redis');
var client = redis.createClient();
const pry = require('pryjs')
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyK7hube384uNDmc'}).base('appV10bsiCglxld1x');
var bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on('connect', function() {
    console.log('connected');
});

function pullRecords() {
  return new Promise(function (resolve, reject) {
    base('Imported table').select({
          // Selecting the first 3 records in Grid view:
          maxRecords: 100,
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
  let csvstream = csv.fromPath("grid.csv", { headers: true })
      .on("data", function (row) {
          csvstream.pause();
          performUpdate(row, csvstream.resume());
      })
      .on("end", function () {
          console.log("We are done!")
      })
      .on("error", function (error) {
          console.log(error)
      });
}

pullRecords();

function performUpdate(data, fn) {
  return new Promise(function (resolve, reject) {
    client.getAsync(data['Shopify Partner Id']).then(function(res) {
      base('Imported table').replace(res, {
        "Shopify Partner Id": data["Shopify Partner Id"],
        "Partner Company Name": data["Partner Company Name"],
        "partner url": data["partner url"],
        "Partner Is Current Shopify Expert": data["Partner Is Current Shopify Expert"],
        "Partner Email": data["Partner Email"],
        "Partner Contact First Name": data["Partner Contact First Name"],
        "Partner Contact Last Name": data["Partner Contact Last Name"],
        "Current Partner Manager": data["Current Partner Manager"],
        "Partner Country": data["Partner Country"],
        "Partner City": data["Partner City"],
        "Partner Province": data["Partner Province"],
        "Partner Created At (Est)": data["Partner Created At (Est)"],
        "number of development shops created": data["number of development shops created"],
        "Number Of New Leads": data["Number Of New Leads"],
        "net customers change": data["net customers change"],
        "Net Mrr Change": data["Net Mrr Change"],
        "Shopify Partner Id 2": data["Shopify Partner Id 2"],
        "Shopify Partner Id 3": data["Shopify Partner Id 3"]
      }, function(err, record) {
          if (err) { console.error(err); return; }
          resolve(fn);
          eval(pry.it);
          console.log(record.get('Shopify Partner Id'));
      });
    })
  })
}



