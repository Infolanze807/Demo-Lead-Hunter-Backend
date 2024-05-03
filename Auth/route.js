const express = require("express");
const router = express.Router();
const { login   } = require("./login");
const { addUser } = require("../Auth/register");
const { createNewUser } = require("../Auth/register");


const userRouter = require("express").Router();

// router.route("/register").post(register)
router.route("/login").post(login)

router.route("/user").post(addUser)

// router.route('/status').post(statusCheck);

router.route("/register").post(createNewUser)


module.exports = router


module.exports.userRouter = userRouter;



