const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'Archive';
const client = new MongoClient(url, {
    useNewUrlParser: true
});

const insertOne = (document) => {
    client.connect((err) => {
        if (err) {
            console.error(err);
            return;
        }
        
        const db = client.db(dbName);
        db.collection('Archive').insertOne(document);
    });
}

const read = (collect, callback) => {

    client.connect((err) => {
        if (err) {
            console.error(err);
            return;
        }

        const db = client.db(dbName);
        const collection = db.collection('Archive');
        collection.find({}).toArray((err, res) => {
            callback(res);
        });
    });
}

const update = (filter, action) => {
    client.connect((err) => {
        const db = client.db(dbName);
        const collection = db.collection('Archive');
        collection.updateMany(filter, action);
    });
}

const del = (filter) => {
    client.connect((err) => {
        const db = client.db(dbName);
        const collection = db.collection('Archive');
        collection.deleteMany(filter);
    });
}
const close = () => {
    client.close();
}

module.exports = {
    init,
    insertOne,
    read,
    update,
    delete: del,
    close
}
