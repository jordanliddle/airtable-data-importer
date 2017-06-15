
var fs = require('fs');
var csv = require("fast-csv");
var redis = require('redis');
var client = redis.createClient();
const pry = require('pryjs')
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyK7hube384uNDmc'}).base('appNwUk0MQdtk41vZ');

client.on('connect', function() {
    console.log('connected');
});


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
      if (err) { console.error(err); return; }
  });


let csvstream = csv.fromPath("sandbox.csv", { headers: true })
    .on("data", function (row) {
        csvstream.pause();
        client.get(row['shopify partner id'], function(err, reply) {
          console.log(reply);
        });
        csvstream.resume();
    })
    .on("end", function () {
        console.log("We are done!")
    })
    .on("error", function (error) {
        console.log(error)
    });

