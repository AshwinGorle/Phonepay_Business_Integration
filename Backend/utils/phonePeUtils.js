// const SALT_KEY = "48b460bd-1463-497b-a621-8f9f73e193cd"; // production
// const MERCHANT_ID = "M22MU4WHSIF5F";  //production

const MERCHANT_ID = "M22MU4WHSIF5FUAT";  //test
const SALT_KEY = "da58300b-d34a-4f80-86bd-80142e7d9336" // test


 
// const MERCHANT_BASE_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"; // production
const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"; // test

const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status"; // test
// const redirectUrl = "https://phone-pe-payment-gateway-integration.vercel.app/api/payment/status";
// const failureUrl = "https://phone-pe-payment-gateway-integration.vercel.app/api/payment/payment-failure";
// const successUrl = "https://phone-pe-payment-gateway-integration.vercel.app/api/payment/payment-success";
const redirectUrl = "http://localhost:8000/api/payment/status";
const successUrl = "http://localhost:8000/api/payment/payment-success";
const failureUrl = "http://localhost:8000/api/payment/payment-failure";


module.exports = {
  SALT_KEY,
  MERCHANT_ID,
  MERCHANT_BASE_URL,
  MERCHANT_STATUS_URL,
  redirectUrl,
  successUrl,
  failureUrl,
};
    