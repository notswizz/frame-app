// mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(process.env.MONGODB_DB);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
    }
  }
  return db;
}

async function logSelection(fid, matchupIndex, team) {
  const database = await connectDB();
  const selections = database.collection('selections');
  await selections.updateOne(
    { fid, matchupIndex },
    { $set: { team } },
    { upsert: true }
  );
}

async function getSelectionsByFID(fid) {
  const database = await connectDB();
  const selections = database.collection('selections');
  return selections.find({ fid }).sort({ matchupIndex: 1 }).toArray();
}

export { logSelection, getSelectionsByFID };
