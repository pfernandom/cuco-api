const mongo = require("mongodb").MongoClient;

class Collection {
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
    this.collection = this.db.collection(this.collectionName);
  }
  findAll() {
    return new Promise((resolve, reject) => {
      this.collection.find().toArray((err, items) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      });
    });
  }
  insertMany(list) {
    return new Promise((resolve, reject) => {
      this.collection.insertMany(list, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
  insertOne(obj) {
    return new Promise((resolve, reject) => {
      this.collection.insertOne(obj, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports.Collection = Collection;

module.exports.Client = class Client {
  constructor(url) {
    this.dbUrl = url;
  }
  connect(dbName) {
    const options = { useNewUrlParser: true };
    return new Promise((resolve, reject) => {
      mongo.connect(this.dbUrl, options, (err, client) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        const db = client.db(dbName);
        this.db = db;
        this.client = client;
        resolve({ client, db });
      });
    });
  }
  getCollection(collectionName) {
    return new Collection(this.db, collectionName);
  }
};
