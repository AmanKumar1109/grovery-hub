/**
 * SabPaisa PG 3.0 API Integration Utility
 * Implements official SabPaisa PG 3.0 REST API specification (devdocs.sabpaisa.in)
 */

/**
 * Generates HMAC-SHA256 64-character lowercase hex signature
 */
const generateHmacSha256Hex = async (secretKey, message) => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Initiates SabPaisa PG 3.0 Payment Session via REST API POST /api/v2/payments
 * @param {Object} paymentInfo 
 * @param {string} paymentInfo.orderId - Unique order/transaction ID
 * @param {number|string} paymentInfo.amount - Total amount payable in Rupees
 * @param {string} paymentInfo.payerName - Customer name
 * @param {string} paymentInfo.payerEmail - Customer email
 * @param {string} paymentInfo.payerMobile - Customer mobile
 * @param {string} [paymentInfo.callbackUrl] - Optional return URL
 */
export const initiateSubPaisaPayment = async ({
  orderId,
  amount,
  payerName,
  payerEmail,
  payerMobile,
  callbackUrl
}) => {
  const merchantId = (import.meta.env.VITE_SABPAISA_CLIENT_CODE || '').trim();
  const apiKey = (import.meta.env.VITE_SABPAISA_API_KEY || import.meta.env.VITE_SABPAISA_AUTH_KEY || '').trim();
  const secretKey = (import.meta.env.VITE_SABPAISA_SECRET_KEY || import.meta.env.VITE_SABPAISA_AUTH_IV || '').trim();
  const env = (import.meta.env.VITE_SABPAISA_ENV || 'prod').trim().toLowerCase();
  const customUrl = (import.meta.env.VITE_SABPAISA_URL || '').trim();

  if (!merchantId || !apiKey || !secretKey) {
    throw new Error("SabPaisa PG 3.0 credentials missing in environment variables (VITE_SABPAISA_CLIENT_CODE, VITE_SABPAISA_API_KEY, VITE_SABPAISA_SECRET_KEY).");
  }

  // Base URL & CORS Proxy selection
  const isStaging = env === 'stag';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  let endpointUrl;

  if (customUrl) {
    endpointUrl = customUrl.includes('/api/v2/payments')
      ? customUrl
      : `${customUrl.replace(/\/+$/, '')}/api/v2/payments`;
  } else if (isLocalhost) {
    // Use local proxy to completely bypass browser CORS on localhost
    endpointUrl = isStaging ? '/sabpaisa-api-stag/api/v2/payments' : '/sabpaisa-api-prod/api/v2/payments';
  } else {
    // Direct endpoint URL
    endpointUrl = isStaging 
      ? 'https://staging-sb-merchant-api.sabpaisa.in/api/v2/payments' 
      : 'https://merchant-api.sabpaisa.in/api/v2/payments';
  }

  // SabPaisa 3.0 PG Parameters
  const merchantTxnId = orderId;
  const paiseAmount = Math.round(parseFloat(amount) * 100); // Amount in paise (Long)
  const currency = 'INR';
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  const returnUrl = callbackUrl || `${window.location.origin}/payment-callback`;

  const sanitizedMobile = (payerMobile || '').replace(/\D/g, '').slice(-10) || '9999999999';
  const sanitizedEmail = payerEmail || 'customer@groceryhub.com';
  const sanitizedName = (payerName || 'Customer').slice(0, 100);

  // HMAC-SHA256 Checksum = merchantId|merchantTxnId|amount|currency|timestamp
  const checksumMessage = `${merchantId}|${merchantTxnId}|${paiseAmount}|${currency}|${timestamp}`;
  const checksum = await generateHmacSha256Hex(secretKey, checksumMessage);

  const requestPayload = {
    merchantId,
    merchantTxnId,
    amount: paiseAmount,
    currency,
    customerName: sanitizedName,
    customerEmail: sanitizedEmail,
    customerPhone: sanitizedMobile,
    returnUrl,
    checksum,
    timestamp
  };

  let response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(requestPayload)
    });
  } catch (err) {
    if (endpointUrl.startsWith('/')) {
      const fallbackUrl = isStaging 
        ? 'https://staging-sb-merchant-api.sabpaisa.in/api/v2/payments' 
        : 'https://merchant-api.sabpaisa.in/api/v2/payments';
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        },
        body: JSON.stringify(requestPayload)
      });
    } else {
      throw err;
    }
  }

  const responseText = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (parseErr) {
    console.error("SabPaisa API returned non-JSON response:", responseText);
    throw new Error(`SabPaisa response error. Please restart your dev server (npm run dev) to load proxy settings.`);
  }

  if (response.ok && responseData && (responseData.checkoutUrl || (responseData.data && responseData.data.checkoutUrl))) {
    let targetCheckoutUrl = responseData.checkoutUrl || responseData.data.checkoutUrl;
    const clientSecret = responseData.clientSecret || (responseData.data && responseData.data.clientSecret);

    // Append clientSecret parameter to checkoutUrl if returned by SabPaisa
    if (clientSecret && !targetCheckoutUrl.includes('clientSecret')) {
      const separator = targetCheckoutUrl.includes('?') ? '&' : '?';
      targetCheckoutUrl = `${targetCheckoutUrl}${separator}clientSecret=${encodeURIComponent(clientSecret)}`;
    }

    window.location.href = targetCheckoutUrl;
  } else {
    const errorMsg = responseData?.errorMessage || responseData?.message || responseData?.error || 'Failed to create payment session with SabPaisa.';
    throw new Error(errorMsg);
  }
};

/**
 * Parses payment response query parameters from return URL on /payment-callback
 */
export const parseSubPaisaResponse = async () => {
  const params = new URLSearchParams(window.location.search);
  const rawStatus = (params.get('status') || params.get('paymentStatus') || params.get('statusCode') || '').toUpperCase();
  const merchantTxnId = params.get('merchant_txn_id') || params.get('merchantTxnId') || params.get('clientTxnId') || params.get('orderId') || '';
  const sabpaisaTxnId = params.get('transaction_id') || params.get('sabpaisaTxnId') || params.get('paymentId') || params.get('spTxnId') || '';

  const isSuccess = rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === '0000';

  return {
    status: isSuccess ? 'SUCCESS' : (rawStatus || (params.get('encResponse') ? 'SUCCESS' : 'FAILED')),
    statusCode: isSuccess ? '0000' : '9999',
    responseCode: isSuccess ? '0000' : '9999',
    clientTxnId: merchantTxnId,
    merchantTxnId,
    sabpaisaTxnId,
    rawParams: Object.fromEntries(params.entries())
  };
};
