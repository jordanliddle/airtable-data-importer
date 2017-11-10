require('dotenv').config()

const fs      = require('fs');
const csv     = require("fast-csv");
const redis   = require('redis');

const API_KEY = process.env.API_KEY,
      BASE_NAME = process.env.BASE_NAME,
      BASE_ID = process.env.BASE_ID;

const Airtable = require('airtable');
let base = new Airtable({apiKey: API_KEY}).base('appxGOGhkQ6ueTKjI');

const bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);


const client  = redis.createClient();
client.on('connect', function() {
    console.log('connected');
});

function pullAllRecords() {
    base(BASE_NAME).select({
          // ensure the view is correct
           maxRecords: 50,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          records.forEach(function(record) {
            // log each requested record
            console.log('Retrieved', record.get('app id'));
            // save the record to Redis
            client.set(record.fields["app id"], record.id);
            // client.set(record.fields["re"], record.app_relationship)
          });
          fetchNextPage();
      }, function done(err) {
          if (err) { console.error(err); return; }
          updateRecords();
      });
}

function updateRecords() {
  let csvstream = csv.fromPath("example.csv", { headers: true })
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
  return client.getAsync(data['app id'])
  .then(function(res) {
    let record = {
      "app name":   data["app name"]
      "app name (app id) no commas"                                                 data["app name"],
      "handle":                                             data["handle"],
      "app_store_slug":                                              data["app_store_slug"],
      "recommendable":                                              data["recommendable"],
      "active installs":                        data["active installs"],
      "net_installs_last_30_days":                                  data["net_installs_last_30_days"],
      "billings_last_30_days":                                          data["billings_last_30_days"],
      "average_rating":                                             data["average_rating"],
      "number_of_reviews_in_average":                                         data["number_of_reviews_in_average"],
      "first published":                                       data["first published"],
      "country":                      data["country"],
      "continent":                                      data["continent"],
      "self reported pricing":                                           data["self reported pricing"],
      "app category":                                    data["app category"]
    }

    if (res == null) {
      const fn = bluebird.promisify(base('Imported table').create);
      return fn(record);
    } else {
      const fn = bluebird.promisify(base('Imported table').update);
      return fn(res, record);
    }
  }).catch(function(e) {
    console.log(e)
  })
}

// run the program
pullAllRecords();
