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
const datenbank = require('./DbUtils');

// Create a new MongoClient
const client = new MongoClient(url);

//Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db = client.db(dbName);
    setInterval(getUpdates, 300000);  //alle 5 Sekunden in Datenbank speichern

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
                db.collection('Messages').insertOne(JSON.parse(JSON.stringify(nachricht)));
            })
            client.close();
        })
    })
}



app.get('/', function(request, response){
    var page = '';
    page = '<h3> Chat Log </h3><section> ';
    datenbank.read({chat_name: 'Bot_Test.png'}, (data) => {
        data.forEach(message => {      
        page += 'chat name: ' + message.chat_name +
        ' message id: ' + message.msg_id +
        ' message user: ' + message.msg_user +
        ' message date: ' + message.msg_date +
        ' message text: ' + message.msg_text;
        })
      })
    page += '</section>';
    console.log(page);
    response.setHeader('Content-Type', 'text/html');
    response.write(page);
    response.end();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });