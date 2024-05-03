const express = require("express")
const { newPayment, statusCheck } = require("../controllers/paymentphoneController.js");
// const{newPayment,checkStatus}= require("../controllers/phonepaypayment")

const router = express.Router()

// router.route("/payment").post(newPayment)
// router.route('/status').post(statusCheck);

router.post('/payment', newPayment);
router.post('/status/:txnId', statusCheck);

// router.route("/payment").post(newPayment);
// router.route("/status").post((req, res) => checkStatus(req, res, req.body.payloadMain));

module.exports = router;