import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected.");
  } catch (error) {
    console.error("Error connecting DB: ", error);
  }
};

export default connectDb;
