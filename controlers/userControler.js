import { connectToMongoDB, disconnectMongoDB } from '../middlewares/mongo-connect-middleware.js';


const getUsers = async (req, res, next) => {
    const { client, db, coll } = await connectToMongoDB();
    const cursor = await coll.find({}).toArray();
    res.send(cursor);
    await disconnectMongoDB(client);
}

const getUserById = async (req, res, next) => {
    const { client, db, coll } = await connectToMongoDB();
    console.log("id in getUserById: " + req.params.id);

    const cursor = await coll.findOne({ _id: req.params.id });
    console.log("cursor:", cursor);

    res.send(cursor);
    await disconnectMongoDB(client);
}

const getUserByFullName = async (req, res, next) => {
    console.log("in getUserByFullName");
    console.log(req.query);
    const { client, db, coll } = await connectToMongoDB();
    const { fullname } = req.query;
    console.log("fullName in getUserByFullName: " + fullname);

    const cursor = await coll.find({ full_name_search: { $regex: fullname } }).toArray();
    cursor.forEach(user => {
        console.log(user.full_name_search.split("").reverse().join(""));

    });

    res.send(cursor);
    await disconnectMongoDB(client);
}

export { getUsers, getUserById, getUserByFullName }