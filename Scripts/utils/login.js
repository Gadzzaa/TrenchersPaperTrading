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

async function decryptData(encryptedData) {
  const bytes = crypto.AES.decrypt(encryptedData, process.env.ENCRK);
  const decrypted = bytes.toString(crypto.enc.Utf8);
  return JSON.parse(decrypted);
}

async function login({ username, password }) {
  try {
    if (!mongoDBClient) await connectToMongoDB();
    const db = await getDatabase();
    const usersCollection = db.collection('loginInfo'); 

    const user = await usersCollection.findOne({ username });
    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    const decryptedStoredPassword = await decryptData(user.password);
    if (decryptedStoredPassword !== password) {
      console.log('❌ Invalid password');
      return false;
    }

    console.log('✅ Login successful');
    return user;

  } catch (err) {
    console.error('❌ Login error:', err);
    return false;
  }
}

module.exports = {
  login
}


// (async () => {
//   const result = await login({
//     username: 'newUser',
//     password: 'newPassword123',
//   });

//   if (result) {
//     console.log('User:', result);
//   } else {
//     console.log('Login failed');
//   }

// })();
