import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DBNAME}`);
    console.log(`\nMongoDb Connected !! DB HOST : ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error("MONGODB CONNECTION ERROR => ", err);
    process.exit(1);
  }
}

export default connectDB;