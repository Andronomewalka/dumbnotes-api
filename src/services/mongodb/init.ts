import { MongoClient } from 'mongodb';

const connectionURI = process.env.MONGODB_URI;

if (!connectionURI) {
  throw new Error('Please add your Mongo URI to .env');
}

export const initMongoDb = async () => {
  const mongoClient = await new MongoClient(connectionURI).connect();
  const onAppExit = () => {
    try {
      console.log('on exit');
      mongoClient.close();
    } finally {
      process.off('exit', onAppExit);
    }
  };
  process.on('exit', onAppExit);
  return await mongoClient.db(process.env.MONGODB_DB);
};
