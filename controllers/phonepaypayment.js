// const crypto = require("crypto");
// const axios = require("axios");
// require("dotenv").config();

// const newPayment = async (req, res) => {
//   try {
//     const merchantTransactionId = "M" + Date.now();
//     const { user_id, price, phone, name } = req.body;
//     const data = {
//       merchantId: process.env.MERCHANT_ID,
//       merchantTransactionId: merchantTransactionId,
//       merchantUserId: "MUID" + user_id,
//       name: name,
//       amount: price * 100,
//       redirectUrl: `http://localhost:5000/api/phonepe/status/${merchantTransactionId}`,
//       redirectMode: "POST",
//       mobileNumber: phone,
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//     };
//     const payload = JSON.stringify(data);
//     const payloadMain = Buffer.from(payload).toString("base64");
//     const keyIndex = 1;
//     const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
//     const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//     const checksum = sha256 + "###" + keyIndex;
//     const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
//     const options = {
//       method: "POST",
//       url: prod_URL,
//       headers: {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         "X-VERIFY": checksum,
//       },
//       data: {
//         request: payloadMain,
//       },
//     };
//     axios
//       .request(options)
//       .then(function (response) {
//         return res.send({
//           url: response.data.data.instrumentResponse.redirectInfo.url,
//         });
//       })
//       .catch(function (error) {
//         console.error(error);
//       });
//   } catch (error) {
//     res.status(500).send({
//       message: error.message,
//       success: false,
//     });
//   }
// };
// const checkStatus = async (req, res) => {
//   const merchantTransactionId = req.params["txnId"];
//   const merchantId = process.env.MERCHANT_ID;
//   const keyIndex = 1;
//   const string =
//     `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
//     process.env.SALT_KEY;
//   const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//   const checksum = sha256 + "###" + keyIndex;
//   const options = {
//     method: "GET",
//     url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
//     headers: {
//       accept: "application/json",
//       "Content-Type": "application/json",
//       "X-VERIFY": checksum,
//       "X-MERCHANT-ID": `${merchantId}`,
//     },
//   };
//   // CHECK PAYMENT STATUS
//   axios
//     .request(options)
//     .then(async (response) => {
//       if (response.data.success === true) {
//         console.log(response.data);
//         return res
//           .status(200)
//           .send({ success: true, message: "Payment Success" });
//       } else {
//         return res
//           .status(400)
//           .send({ success: false, message: "Payment Failure" });
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send({ msg: err.message });
//     });
// };
// module.exports = {
//   newPayment,
//   checkStatus,
// };





const crypto = require("crypto");
const axios = require("axios");
const User = require("../model/User");
const { createNewUser } = require("../Auth/register.js");
const bcrypt = require("bcryptjs");
// const bcrypt = require("bcrypt");

// function generateTransactionID() {
//   const timestamp = Date.now();
//   const randomNum = Math.floor(Math.random() * 1000000);
//   const merchantPrefix = "T";
//   const transactionID = `${merchantPrefix}${timestamp}${randomNum}`;
//   return transactionID;
// }

async function newPayment(req, res) {
  try {
    const merchantTransactionId = "M" + Date.now();
    const { name, phonenumber, password, email, amount } = req.body;
    console.log(req.body, "body")
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: "MUID2QWQEFW5Q6WSER7",
      name: name,
      amount: amount * 100, // Convert amount to cents
      redirectUrl: `https://demo-lead-hunter-backend.vercel.app/api/phonepe/status/${merchantTransactionId}`,
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
      payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
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
  const merchantTransactionId = req.params["txnId"];

  console.log("Transaction IDddddddd:", merchantTransactionId);

  const merchantId = process.env.MERCHANT_ID;

  console.log("merchant IDdddddddd:", merchantId);

  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY;

  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
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
      if (response.data.data.responseCode === "SUCCESS") {
        const transaction_id = response.data.data.merchantTransactionId;
        const req_data = await User.findOne({ transaction_id });

        console.log('response new', response.data.data);

        console.log("merchant new IDdddddddd:", transaction_id);
        console.log("merchant new data:", req_data);

        if (req_data) {
          // If user is found, update payment status to SUCCESSFUL
          req_data.payment_status = "SUCCESSFUL";
          await req_data.save(); // Save the updated user data
          const url = `https://www.leadhunter.co.in/pay-success/${transaction_id}`;
          return res.redirect(url);
        } else {
          // If user is not found, redirect to a failed payment URL
          const url = `https://www.leadhunter.co.in/register?status=failed`;
          return res.redirect(url);
        }
      } else {
        // If payment status check fails, redirect to a failed payment URL
        const url = `https://www.leadhunter.co.in/register?status=failed`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      // If an error occurs during payment status check, redirect to a failed payment URL
      const url = `https://www.leadhunter.co.in/register?status=failed`;
      return res.redirect(url);
    });
}



module.exports = { newPayment, statusCheck };
