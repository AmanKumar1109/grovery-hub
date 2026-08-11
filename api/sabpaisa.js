import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers allowing all domains (thegroceryhub.in, www.thegroceryhub.in, vercel.app, localhost)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      orderId,
      amount,
      payerName,
      payerEmail,
      payerMobile,
      callbackUrl
    } = req.body || {};

    if (!orderId || !amount) {
      res.status(400).json({ success: false, error: 'Missing required payment parameters: orderId, amount' });
      return;
    }

    const merchantId = (process.env.VITE_SABPAISA_CLIENT_CODE || process.env.SABPAISA_CLIENT_CODE || 'THEG1').trim();
    const apiKey = (process.env.VITE_SABPAISA_API_KEY || process.env.SABPAISA_API_KEY || 'sp_NG9CX1P_GTie569c-mQmJt4AgH_XgXn_ts-SEObGD8Y').trim();
    const secretKey = (process.env.VITE_SABPAISA_SECRET_KEY || process.env.SABPAISA_SECRET_KEY || 'sec_i2gmRNd2zRPgJwgc1-sp5WWK0jZXZgSq8TxlMHhCKVY').trim();
    const env = (process.env.VITE_SABPAISA_ENV || process.env.SABPAISA_ENV || 'prod').trim().toLowerCase();

    const baseUrl = env === 'stag'
      ? 'https://staging-sb-merchant-api.sabpaisa.in'
      : 'https://merchant-api.sabpaisa.in';

    const paiseAmount = Math.round(parseFloat(amount) * 100);
    const currency = 'INR';
    const timestamp = Math.floor(Date.now() / 1000);
    const sanitizedMobile = (payerMobile || '').replace(/\D/g, '').slice(-10) || '9999999999';
    const sanitizedEmail = payerEmail || 'customer@groceryhub.com';
    const sanitizedName = (payerName || 'Customer').slice(0, 100);
    const returnUrl = callbackUrl || 'https://thegroceryhub.in/payment-callback';

    // HMAC-SHA256 checksum = merchantId|merchantTxnId|amount|currency|timestamp
    const checksumMessage = `${merchantId}|${orderId}|${paiseAmount}|${currency}|${timestamp}`;
    const checksum = crypto
      .createHmac('sha256', secretKey)
      .update(checksumMessage)
      .digest('hex');

    const requestPayload = {
      merchantId,
      merchantTxnId: orderId,
      amount: paiseAmount,
      currency,
      customerName: sanitizedName,
      customerEmail: sanitizedEmail,
      customerPhone: sanitizedMobile,
      returnUrl,
      checksum,
      timestamp
    };

    const response = await fetch(`${baseUrl}/api/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(requestPayload)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("SabPaisa upstream raw response:", responseText);
      res.status(502).json({
        success: false,
        error: `SabPaisa upstream gateway returned non-JSON response (Status ${response.status})`
      });
      return;
    }

    if (response.ok && data && (data.checkoutUrl || data.data?.checkoutUrl)) {
      let checkoutUrl = data.checkoutUrl || data.data.checkoutUrl;
      const clientSecret = data.clientSecret || data.data?.clientSecret;

      if (clientSecret && !checkoutUrl.includes('clientSecret=')) {
        const separator = checkoutUrl.includes('?') ? '&' : '?';
        checkoutUrl = `${checkoutUrl}${separator}clientSecret=${encodeURIComponent(clientSecret)}`;
      }

      res.status(200).json({ success: true, checkoutUrl, clientSecret });
    } else {
      const errorMsg = data?.errorMessage || data?.message || data?.error || 'Failed to create SabPaisa payment session';
      res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (err) {
    console.error("Vercel Serverless Function SabPaisa Error:", err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
