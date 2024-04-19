const express = require("express")
const router = express.Router()
const { login , statusCheck  } = require("./login")
const leadController = require("../controllers/leadController")
const { adminAuth } = require("../middleware/auth")
// const {newPayment} = require("../Auth/login")
const { addUser } = require("../Auth/register")
const { createNewUser } = require("../Auth/register")


const userRouter = require("express").Router();

// router.route("/register").post(register)
router.route("/payment").post(login)

// POST /leads - Create a new lead
router.post('/', leadController.createLead);

// GET /leads - Get all leads
router.get('/', leadController.getAllLeads);

// DELETE /leads/:id - Delete a lead by ID
router.delete('/:id', leadController.deleteLeadById);
// router.delete("/:id", adminAuth, leadController.deleteLeadById);

// Route to fetch leads by tag
router.get('/tag', leadController.getLeadsByTag);

// Route to search leads by tag
router.get('/search', leadController.getSearchByTag);

// GET /leads/platform - Get leads by platform
router.get("/platform", leadController.getLeadsByPlatform);

// Define route for getting leads by platform and tag
// router.get("/platformtag", leadController.getLeadsByPlatformAndTag); // Get leads by platform and tag
router.get('/leads/search', leadController.getLeadsByPlatformAndTag);


router.get('/technology', leadController.getTechnology);

router.route("/user").post(addUser)

router.route('/status').post(statusCheck);

router.route("/register").post(createNewUser)


module.exports = router


module.exports.userRouter = userRouter;