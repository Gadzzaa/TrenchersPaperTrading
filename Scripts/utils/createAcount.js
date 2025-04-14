require('dotenv').config();
const { MongoClient } = require('mongodb');
const crypto = require('crypto-js');

let mongoDBClient;

async function connectToMongoDB() {
  mongoDBClient = new MongoClient(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await mongoDBClient.connect();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    throw err;
  }
}
const dbName = 'PaperTrade';

async function getDatabase() {
  return mongoDBClient.db(dbName);
}

async function encryptData(data) {
  return crypto.AES.encrypt(JSON.stringify(data), process.env.ENCRK).toString();
}

async function createAccount({ username, password }) {
  try {
    if (!mongoDBClient) await connectToMongoDB();
    const db = await getDatabase();
    const usersCollection = db.collection('loginInfo');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      console.log('Username already taken');
      return false;
    }

    const encryptedPassword = await encryptData(password);

    const userData = {
      username,
      password: encryptedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(userData);
    console.log('Account created:', result.insertedId);
    return true;

  } catch (err) {
    console.error(' Error creating account:', err);
    return false;
  }
}

module.exports = {
    createAccount
}

  // (async () => {
//   const result = await createAccount({
//     username: 'newUser',
//     password: 'newPassword123',
//   });

//   if (result) {
//     console.log('Account creation successful');
//   } else {
//     console.log(' Failed to create account');
//   }


// })();
