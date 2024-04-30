const express = require("express");
const router = express.Router();
const { login   } = require("./login");
const leadController = require("../controllers/leadController");
const remoteleadController = require("../controllers/remoteleadController");
const { adminAuth } = require("../middleware/auth")
// const {newPayment} = require("../Auth/login")
const { addUser } = require("../Auth/register");
const { createNewUser } = require("../Auth/register");


const userRouter = require("express").Router();

// router.route("/register").post(register)
router.route("/login").post(login)

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

// ... //

// POST /remotelead - Create a new remote lead
router.post('/remotelead', remoteleadController.createRemoteLead);

// GET /remotelead - Get all remote leads
router.get('/remotelead', remoteleadController.getAllRemoteLeads);

// DELETE /remotelead/:id - Delete a remote lead by ID
router.delete('/remotelead/:id', remoteleadController.deleteRemoteLeadById);

// GET /remotelead/tag - Fetch remote leads by tag
router.get('/remoteleadstag', remoteleadController.getRemoteLeadsByTag);

// GET /remotelead/platform - Fetch remote leads by platform
router.get('/remotelead/platform', remoteleadController.getRemoteLeadsByPlatform);

// GET /remotelead/platformtag - Fetch remote leads by platform and tag
router.get('/remotelead/platform', remoteleadController.getRemoteLeadsByPlatformAndTag);

// GET /remotelead/search - Search remote leads by tag
router.get('/remotelead/search', remoteleadController.getRemoteLeadSearchByTag);

// GET /remoteleads/technology - Get remote leads by technology
// router.get('remotelead/technology', leadController.getRemoteLeadsByTechnology);


// ... //

router.route("/user").post(addUser)

// router.route('/status').post(statusCheck);

router.route("/register").post(createNewUser)


module.exports = router


module.exports.userRouter = userRouter;