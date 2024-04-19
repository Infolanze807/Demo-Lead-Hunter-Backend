const crypto = require("crypto");
const axios = require("axios");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Function to generate a unique transaction ID
// function generateTransactionID() {
//   const timestamp = Date.now();
//   const randomNum = Math.floor(Math.random() * 1000000);
//   const merchantPrefix = "T";
//   const transactionID = `${merchantPrefix}${timestamp}${randomNum}`;
//   return transactionID;
// }

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password not present" });
    }

    // Retrieve user from the database
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({user:false, message: "User not found" });
    }

    // Compare passwords
    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      return res.status(400).json({ user:false,message: "Incorrect password" });
    }

    // Check payment status
    if (user.payment_status === "SUCCESSFUL") {
      // Generate JWT token
      const maxAge = 2 * 60; // 3hrs in minutes
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWTSECRET,
        { expiresIn: maxAge } // 3hrs in sec
      );

      // Set token in cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000, // 3hrs in ms
      });

      // Send success response
      return res.status(200).json({
        message: "User successfully logged in",
        user: true,
        _id: user._id,
        email: user.email,
        role: user.role,
        payment_status: user.payment_status,
        token: token
      });
    } else if (user.payment_status === "PENDING") {
        return res.json({payment_status:"PENDING", message:"PLEASE SIGN UP AGAIN AND COMPLETE PAYMENT"})
    } else {
      // Handle other payment statuses
      return res.status(400).json({ message: "Login not successful" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}



module.exports = { login };
