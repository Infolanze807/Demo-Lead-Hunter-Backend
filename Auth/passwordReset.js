const User = require("../model/User");
const Token = require("../model/token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Store the timestamp of the last password reset request for each user
const lastResetRequest = {};

// POST endpoint for initiating password reset
router.post("/", async (req, res) => {
    const { email } = req.body;

    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json(error.details[0].message);

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({message:"User with given email doesn't Exist"});

        // Check if it's been at least one minute since the last password reset request
        if (lastResetRequest[user._id] && Date.now() - lastResetRequest[user._id] < 60000) {
            return res.status(400).json({message:"Please wait at least one minute before requesting another password reset"});
        }

        let token = await Token.findOne({ userId: user._id });
        if (!token || (Date.now() - lastResetRequest[user._id] >= 60000)) {
            // Generate new token if not exists or expired
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            // Update the timestamp of the current password reset request
            lastResetRequest[user._id] = Date.now();

            // Schedule the task to delete the old token after one minute
            setTimeout(async () => {
                await Token.deleteOne({ userId: user._id });
                console.log({message:"Old token deleted."});
            }, 60000);
        }

        // const link = `https://lead-hunter-olive.vercel.app/api/passwordReset/${user._id}/${token.token}`;
        const link = `${process.env.BASE_URL}/api/passwordReset/${user._id}/${token.token}`;
        
        await sendEmail(user.email, "Password reset", "Password reset link:", link, user.email);

        res.send(link);
    } catch (error) {
        res.json({message:"An error occurred"});
        console.log(error);
    }
});

// POST endpoint for resetting password
router.post("/:userId/:token", async (req, res) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json(error.details[0].message);

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).json({message:"Invalid link or expired"});

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).json({message:"Invalid link or expired"});

        // Hash the new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user.password = hashedPassword;
        await user.save();

        // Delete the token
        await token.deleteOne();

        res.json({message:"Password reset successfully."});
    } catch (error) {
        res.json({message:"An error occurred"});
        console.log(error);
    }
});

// GET endpoint for verifying user and token
router.get("/:userId/:token", async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(400).json({status: false, message: "invalid user id"});
        }

        // Find the token for the user
        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) {
            return res.status(400).json({status: false, message: "invalid token or expire"});
        }

        // Both user and token are found and valid, send a success message
        res.json({ status: true, message: "Valid link" });

    } catch (error) {
        res.status(500).json({message:"An error occurred"});
        console.error(error);
    }
});

module.exports = router;


