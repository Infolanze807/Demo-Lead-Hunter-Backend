const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const User = require("../model/User");

const addUser = async (req, res) => {
  try {
    const data = req.body;
    console.log("user-data", data);

    // Create a new user
    const newUser = await createNewUser(data);

    res.json({
      status: 200,
      success: true,
      data: { user: newUser },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

async function createNewUser(req, res) {
  try {
    const user = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = new User({
      transaction_id: user.transaction_id,
      name: user.name,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      password: hashedPassword, // Assign hashed password to user object
      amount: user.amount,
    });
    // Save the new user to the database
    await newUser.save();
    // res.json(newUser);
    res.status(200).json({
      status: 200,
      success: true,
      message: "data send successfully",
      newUser
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = { createNewUser, addUser };