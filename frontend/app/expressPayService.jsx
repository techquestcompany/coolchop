import axios from 'axios';

const EXPRESSPAY_API_URL = 'https://expresspaygh.com/api/';
const MERCHANT_ID = 'your_merchant_id';
const API_KEY = 'your_api_key';

export const initiatePayment = async (amount, currency, orderID, phoneNumber, callbackUrl) => {
  try {
    const response = await axios.post(`${EXPRESSPAY_API_URL}tokenize`, {
      merchant_id: MERCHANT_ID,
      api_key: API_KEY,
      amount,
      currency,
      order_id: orderID,
      phone_number: phoneNumber,
      redirect_url: callbackUrl,
    });

    return response.data;
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};
