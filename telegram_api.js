const request = require('https');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express');
const app = express();

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
var db;
const dbName = 'Archive';

// Create a new MongoClient
const client = new MongoClient(url);

//Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db = client.db(dbName);
    setInterval(getUpdates, 5000);  //alle 5 Sekunden in Datenbank speichern

})
            
function getUpdates() {
    request.get('https://api.telegram.org/bot861420868:AAF8exAJl1IZCGDxNGJd9w_EqQ0fEOH0sWA/getUpdates', (response) => {
        let data = '';

        response.on('data', (chunk) => {    //empfängt die einzelnen Packages und fasst sie in einer Variable zusammen
            data += chunk;
        })

        response.on('end', () => {
            let update = JSON.parse(data); //parse into JSON to access specific fields
            var nachricht;
            update.result.forEach(message => {      //takes the chat name, message-id,-user,-date and -text out of the JSON file and puts it into 'nachricht'
                nachricht = {
                    chat_name: message.message.chat.title,
                    msg_id: message.message.message_id,
                    msg_user: message.message.from.username,
                    msg_date: new Date(1000 * message.message.date),
                    msg_text: message.message.text
                };
                db.collection('Messages').insertOne(JSON.parse(JSON.stringify(nachricht))); //nachricht gets saved into Database
            })
        })
    })
}



app.get('/', function(request, response){
    page = '<html> <head><title> ChatOrganizerBot </title>  <meta charset="utf-8"> <link rel="stylesheet" type="text/css" href="style.css"></head><body><h3> Chat Log </h3><section> ';
    db.read.forEach(message => {      //takes the chat name, message-id,-user,-date and -text out of the JSON file and puts it into 'nachricht'
    page += 'chat name: ' + message.chat_name +
        'message id: ' + message.message_id +
        'message user: ' + message.msg_user +
        'message date: ' + message.msg_date +
        'message text: ' + message.msg_text;
    })
    page += '</section> </body> </html>';
    response.write(page);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
