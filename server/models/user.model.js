import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { required: true, type: String, unique: true },
    credits: { default: 100, type: Number },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
