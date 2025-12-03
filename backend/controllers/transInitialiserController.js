import https from 'https';

export const initializeTransaction = async (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount) {
    return res.status(400).json({ error: 'Email and amount are required.' });
  }

  const payload = JSON.stringify({ email, amount: amount.toString() });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const reqPaystack = https.request(options, (paystackRes) => {
    let data = '';
    paystackRes.on('data', (chunk) => { data += chunk; });
    paystackRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(response)
        if (response.status && response.data) {
          const { authorization_url, reference, access_code } = response.data;
          return res.json({ authorization_url, reference, access_code });
        }
        return res.status(502).json({ error: 'Paystack init failed', details: response });
      } catch (err) {
        return res.status(500).json({ error: 'Response parsing error', details: err.message });
      }
    });
  });

  reqPaystack.on('error', (error) => {
    return res.status(500).json({ error: 'Request error', details: error.message });
  });

  reqPaystack.write(payload);
  reqPaystack.end();
};
