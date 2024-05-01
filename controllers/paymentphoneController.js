const crypto = require("crypto");
const axios = require("axios");
const User = require("../model/User");
const { createNewUser } = require("../Auth/register.js");
const bcrypt = require("bcryptjs");
// const bcrypt = require("bcrypt");

function generateTransactionID() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const merchantPrefix = "T";
  const transactionID = `${merchantPrefix}${timestamp}${randomNum}`;
  return transactionID;
}

async function newPayment(req, res) {

  try {
    const { name, phonenumber,password,email, amount } = req.body;
    console.log(req.body,"body")
    const data = {
      merchantId: "PGTESTPAYUAT",
      merchantTransactionId: generateTransactionID(),
      merchantUserId: "MUID2QWQEFW5Q6WSER7",
      name: name,
      amount: amount * 100, // Convert amount to cents
      redirectUrl: `${process.env.BASE_URL}/api/phonepe/status/`,
      redirectMode: "POST",
      email: email,
      mobileNumber: phonenumber,
      paymentInstrument: {
        type: "PAY_PAGE",   
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string =
      payloadMain + "/pg/v1/pay" + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const options = {
      method: "POST",
      url: URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        try {
          const user_found = await User.findOne({ email });
          if (user_found) {
            if (user_found.payment_status === "SUCCESSFUL") {
                return res.json({ status:false,msg: "Account already exists" });
            }
            else if (user_found.payment_status === "PENDING") {
                try {
                
                const hashedPassword = await bcrypt.hash(password, 10);
                // Update transaction ID and payment status
                user_found.transaction_id = response.data.data.merchantTransactionId;
                user_found.password = hashedPassword;
                user_found.amount = amount;
                user_found.phonenumber = phonenumber;
                user_found.name = name;
                await user_found.save();
             
                // Redirect to payment page
                return res.status(200).json({
                  url:response.data.data.instrumentResponse.redirectInfo.url,
                  status:true,
                  user_found
                }
                  );
              } catch (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ error: "Internal server error" });
              }
            }
            
          } 
          else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
              transaction_id: response.data.data.merchantTransactionId,
              name: name,
              email:email,
              phonenumber: phonenumber,
              password: hashedPassword, // Assign hashed password to user object
              amount:amount,
            });
            // Save the new user to the database
            await newUser.save();
  
            return res.status(201).json({
              url:response.data.data.instrumentResponse.redirectInfo.url,
              status:true,
              newUser
            })
           }
        } catch (error) {
          console.log("Error querying user:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      })
      .catch(function (error) {
        console.error("Error making payment request:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  } catch (error) {
    console.error("Error processing payment request:", error);
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
}

//end code manish

async function statusCheck(req, res) {
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
  // const string = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT STATUS
  axios
    .request(options)
    .then(async (response) => {
  
      if (response.data.success === true) {
        const transaction_id = response.data.data.merchantTransactionId;
        const req_data = await User.findOne({ transaction_id });

        req_data.payment_status = "SUCCESSFUL";

        await req_data.save();

        // const url = `https://lead-hunter-olive.vercel.app/pay-success/${transaction_id}`;
        const url = `${process.env.BASE_URL}/pay-success/${transaction_id}`;
        return res.redirect(url);
      } else {
        // const url = `https://lead-hunter-olive.vercel.app/register?status=failed`;
        const url = `${process.env.BASE_URL}/register?status=failed`;
        return res.redirect(url);
      } 
    })
    .catch((error) => { 
      console.error("An error occurred:", error);
      // const url = `https://lead-hunter-olive.vercel.app/register?status=failed`;
      const url = `${process.env.BASE_URL}/register?status=failed`;
      return res.redirect(url);
    });
};

module.exports = { newPayment, statusCheck };