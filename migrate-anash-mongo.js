import { MongoClient } from 'mongodb';
import 'dotenv/config';
import fs from 'fs';

const uri = process.env.MONGODB_URI || "mongodb://ayshor123_db_user:eXjKRJuXOgDnGCtV@ac-wvdtiyc-shard-00-00.ymlmtyf.mongodb.net:27017,ac-wvdtiyc-shard-00-01.ymlmtyf.mongodb.net:27017,ac-wvdtiyc-shard-00-02.ymlmtyf.mongodb.net:27017/users?replicaSet=atlas-bi86eh-shard-0&authSource=admin&tls=true";

async function fillDBWithAnash() {
    const anash = fs.readFileSync('public/jsons/anash.json', 'utf-8');
    const users = JSON.parse(anash);
    const { client, db, coll } = await connectToMongoDB();
    await coll.insertMany(users);
    const cursor = await coll.find({}).toArray();
    console.log(cursor.length);
    client.close();
}

// fillDBWithAnash();



async function test() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 7000 });
  console.log('Attempting connection...');
  try {
    await client.connect();
    console.log('✅ Connected!');
    await client.db('users').command({ ping: 1 });
    console.log('Ping succeeded');
  } catch (e) {
    console.error('❌ Connection error:', e);
  } finally {
    await client.close();
    console.log('Closed');
  }
}

// test();

async function connectToMongoDB() {
    let client;
    try {
        client = new MongoClient(uri, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('Using URI:', uri);
        await client.connect();               // ← async connection
        console.log("✅ Connected to MongoDB!");
        const db = client.db("users");
        const coll = db.collection("users");
        return { client, db, coll };
    } catch (err) {
        throw new Error("Error connecting to MongoDB");
    }
}




// Migration: set each document's _id to the value of its id field (safe replacement)
async function migrateIds() {
  const { client, db, coll } = await connectToMongoDB();
  try {
    const cursor = coll.find({});
    let migrated = 0;
    for await (const doc of cursor) {
      if (doc.id && doc.id !== doc._id) {
        const newDoc = { ...doc, _id: doc.id };
        // Insert new document with new _id
        await coll.insertOne(newDoc);
        // Delete old document
        await coll.deleteOne({ _id: doc._id });
        migrated++;
      }
    }
    console.log(`Migrated ${migrated} documents`);
  } finally {
    await client.close();
    console.log('Migration completed and connection closed');
  }
}

// Execute migration
migrateIds();


