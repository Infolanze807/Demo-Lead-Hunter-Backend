const crypto = require('crypto');
const axios = require('axios');
require("dotenv").config();
function generateTransactionID() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const merchantPrefix = "T";
    const transactionID = `${merchantPrefix}${timestamp}${randomNum}`;
    return transactionID;
  }
const newPayment = async (req, res) => {
 try {
 const merchantTransactionId = generateTransactionID();
 console.log(merchantTransactionId)
 const {user_id, price, phone, name} = req.body;
 const data = {
 merchantId: "PGTESTPAYUAT",
 merchantTransactionId: merchantTransactionId,
 merchantUserId: 'MUID2QWQEFW5Q6WSER7',
 name: name,
 amount: price * 100,
 redirectUrl: `http://localhost:3001/api/phonepe/status/${merchantTransactionId}`,
 redirectMode: 'POST',
 mobileNumber: phone,
 paymentInstrument: {
 type: 'PAY_PAGE'
 }
 };
 const payload = JSON.stringify(data);
 const payloadMain = Buffer.from(payload).toString('base64');
 const keyIndex = 2;
 const string = payloadMain + "/pg/v1/pay" + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
 const sha256 = crypto.createHash('sha256').update(string).digest('hex');
 const checksum = sha256 + '###' + keyIndex;
// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
 const options = {
 method: 'POST',
 url: prod_URL,
 headers: {
 accept: 'application/json',
 'Content-Type': 'application/json',
 'X-VERIFY': checksum
 },
 data: {
 request: payloadMain
 }
 };
axios.request(options).then(function (response) {
 return res.redirect(response.data)
 })
 .catch(function (error) {
 console.error(error);
 });
} catch (error) {
 res.status(500).send({
 message: error.message,
 success: false
 })
 }
}
const checkStatus = async(req, res) => {
    const merchantTransactionId = res.req.body.transactionId;
    const merchantId = res.req.body.merchantId;
 const keyIndex = 1;
 //const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;
 const string = payloadMain + "/pg/v1/pay" + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
 const sha256 = crypto.createHash('sha256').update(string).digest('hex');
 const checksum = sha256 + "###" + keyIndex;
const options = {
 method: 'GET',
 url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
 headers: {
 accept: 'application/json',
 'Content-Type': 'application/json',
 'X-VERIFY': checksum,
 'X-MERCHANT-ID': `${merchantId}`
 }
 };
// CHECK PAYMENT STATUS
 axios.request(options).then(async(response) => {
 if (response.data.success === true) {
 console.log(response.data)
 return res.status(200).send({success: true, message:"Payment Success"});
 } else {
 return res.status(400).send({success: false, message:"Payment Failure"});
 }
 })
 .catch((err) => {
 console.error(err);
 res.status(500).send({msg: err.message});
 });
};
module.exports = {
 newPayment,
 checkStatus
}   