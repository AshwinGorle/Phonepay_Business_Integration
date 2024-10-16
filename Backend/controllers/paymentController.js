const axios = require("axios");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const sha256 = require("sha256");
const {
  SALT_KEY,
  MERCHANT_ID,
  MERCHANT_BASE_URL,
  MERCHANT_STATUS_URL,
  redirectUrl,
  successUrl,
  failureUrl,
} = require("../utils/phonePeUtils.js");

// Create Order Controller
exports.createOrder = async (req, res) => {
  try {
    console.log("Payment initiated ....", req.body.transactionID);
    const { name, mobileNumber, amount, transactionID } = req.body;

    // Validate request body
    if (!name || !mobileNumber || !amount) {
      return res.status(400).json({
        error: "Missing required fields: name, mobileNumber, amount",
      });
    }

    const MUID = "MUID" + uuidv4();

    const paymentPayload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionID,
      merchantUserId: MUID,
      mobileNumber,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${redirectUrl}/${transactionID}`,
      redirectMode: "POST",
      paymentInstrument: { type: "PAY_PAGE" },
    };

    // Convert the payload to base64 and generate checksum
    const payload = Buffer.from(JSON.stringify(paymentPayload), "utf8").toString("base64");
    console.log("Payment payload : ", payload);
    const keyIndex = 1;
    const stringToHash = payload + "/pg/v1/pay" + SALT_KEY;
    const xVerify = sha256(payload + "/pg/v1/pay" + SALT_KEY) + "###" + keyIndex;
    console.log("xVerify ", xVerify);

    // Set the request options
    const options = {
      method: "POST",
      url: MERCHANT_BASE_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      data: { request: payload },
    };

    // Make the request to PhonePe API
    const response = await axios.request(options);

    // If successful, return the redirect URL
    if (response.data?.data?.instrumentResponse) {
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
      console.log("Redirect URL : ", redirectUrl);
      return res.status(200).json({ msg: "OK", url: redirectUrl });
    } else {
      throw new Error("Unexpected response structure from payment gateway");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    // Handle Axios errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: `Payment Gateway Error: ${error.response.data?.message || "Unexpected error"}`,
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: `Failed to initiate payment: ${error.message || "Internal Server Error"}`,
    });
  }
};

// Status Controller
exports.paymentStatus = async (req, res) => {
  try {
    const merchantTransactionId = req.params.id;
    const merchantId = MERCHANT_ID;
    console.log("merchantTransactionId-->>", merchantTransactionId);
    console.log("merchantId-->", merchantId);

    // Validate merchantTransactionId
    if (!merchantTransactionId || !merchantId) {
      return res.status(400).json({ error: "Missing merchant transaction ID or merchant ID" });
    }

    // Generate the checksum for the status request
    const keyIndex = 1;
    const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    // Set the request options
    const options = {
      method: "GET",
      url: `${MERCHANT_STATUS_URL}/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    // Make the request to PhonePe API
    const response = await axios.request(options);

    // Handle success or failure based on the response
    if (response.data?.success) {
      return res.redirect(successUrl);
    } else {
      return res.redirect(failureUrl);
    }
  } catch (error) {
    // console.error("Error fetching payment status:", error);
    console.error("Error fetching payment status:");
    console.error("Error creating order:", error.response ? error.response.data : error.message);

    // Handle Axios errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: `Payment Gateway Error: ${error.response.data?.message || "Unexpected error"}`,
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: `Failed to fetch payment status: ${error.message || "Internal Server Error"}`,
    });
  }
};
