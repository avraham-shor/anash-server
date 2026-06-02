import { MongoClient } from 'mongodb';
import 'dotenv/config';



const uri = process.env.MONGODB_URI || "mongodb://ayshor123_db_user:eXjKRJuXOgDnGCtV@ac-wvdtiyc-shard-00-00.ymlmtyf.mongodb.net:27017,ac-wvdtiyc-shard-00-01.ymlmtyf.mongodb.net:27017,ac-wvdtiyc-shard-00-02.ymlmtyf.mongodb.net:27017/users?replicaSet=atlas-bi86eh-shard-0&authSource=admin&tls=true";

export async function connectToMongoDB() {
    try {
        const client = new MongoClient(uri, {
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

export async function disconnectMongoDB(client){
    await client.close();
}