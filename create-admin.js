const mongoose = require("mongoose");
require("dotenv").config();

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  verified: { type: Boolean, default: false },
  urlsCreated: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = process.argv[2];
    if (!email) {
      console.log("Usage: node create-admin.js <email>");
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update role to admin
    user.role = "admin";
    await user.save();

    console.log(`✅ Successfully made ${email} an admin user`);
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createAdmin();
