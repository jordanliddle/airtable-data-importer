
var fs = require('fs');
var csv = require("fast-csv");
const low = require('lowdb');
const db = low('db.json');
const pry = require('pryjs')
var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyK7hube384uNDmc'}).base('appNwUk0MQdtk41vZ');

// Set some defaults if your JSON file is empty
db.defaults({ alldata: [] })
  .write()


base('DATA').select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 100,
      view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function(record) {
        db.get('alldata')
          .push({
            primaryId: record.id, partnerId: record.fields["Shopify Partner Id"]})
          .write()
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();

  }, function done(err) {
      if (err) { console.error(err); return; }
  });


var stream = fs.createReadStream("sandbox.csv");
var csvStream = csv()
    .on("data", function(data){
         console.log(data);
    })
    .on("end", function(){
         console.log("done");
    });
stream.pipe(csvStream);

