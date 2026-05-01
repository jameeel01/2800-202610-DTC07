const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

async function testUserSchema() {
  try {
    // Connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const testUser = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword123",
    });

    await testUser.save();
    console.log("Test user created successfully:", testUser);

    const foundUser = await User.findOne({ email: "john@example.com" });
    console.log("User found:", foundUser);

    // Update the user
    foundUser.name = "Jane Doe";
    await foundUser.save();
    console.log("User updated successfully:", foundUser);

    // Delete the user
    await User.deleteOne({ email: "john@example.com" });
    console.log("Test user deleted successfully");

    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    console.log("\nAll tests passed!");
  } catch (error) {
    console.error("Test failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testUserSchema();
