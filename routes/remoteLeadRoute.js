const express = require("express");
const router = express.Router();
const remoteleadController = require("../controllers/remoteleadController");

// POST /remotelead - Create a new remote lead
router.post('/remotelead', remoteleadController.createRemoteLead);

// GET /remotelead - Get all remote leads
router.get('/remotelead', remoteleadController.getAllRemoteLeads);

// DELETE /remotelead/:id - Delete a remote lead by ID
router.delete('/remote/:id', remoteleadController.deleteRemoteLeadById);
router.put('/remote/:id', remoteleadController.updateRemoteLead);

// GET /remotelead/tag - Fetch remote leads by tag
router.get('/remoteleadstag', remoteleadController.getRemoteLeadsByTag);

// GET /remotelead/platform - Fetch remote leads by platform
router.get('/remotelead/platform', remoteleadController.getRemoteLeadsByPlatform);

// GET /remotelead/platformtag - Fetch remote leads by platform and tag
router.get('/remotelead/platform', remoteleadController.getRemoteLeadsByPlatformAndTag);

// GET /remotelead/search - Search remote leads by tag
router.get('/remotelead/search', remoteleadController.getRemoteLeadSearchByTag);


module.exports = router

// module.exports.userRouter = userRouter;
