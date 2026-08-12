/**
 * SabPaisa PG 3.0 API Integration Utility
 * Implements official SabPaisa PG 3.0 REST API specification (devdocs.sabpaisa.in)
 * Supports localhost, Vercel Serverless Functions (/api/sabpaisa), and direct API connection
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
 * Initiates SabPaisa PG 3.0 Payment Session
 * First calls Vercel Serverless Function (/api/sabpaisa) to bypass browser CORS on all live domains.
 * Falls back to client-side proxy / direct fetch if Serverless API is unavailable.
 * 
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
  const returnUrl = callbackUrl || `${window.location.origin}/payment-callback`;

  // 1. Primary Strategy: Serverless Function (/api/sabpaisa) - Eliminates CORS across all domains
  try {
    const serverlessRes = await fetch('/api/sabpaisa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId,
        amount,
        payerName,
        payerEmail,
        payerMobile,
        callbackUrl: returnUrl
      })
    });

    const text = await serverlessRes.text();
    if (serverlessRes.ok && text && text.trim().startsWith('{')) {
      const serverlessData = JSON.parse(text);
      if (serverlessData.success && serverlessData.checkoutUrl) {
        window.location.href = serverlessData.checkoutUrl;
        return;
      }
      if (serverlessData.error) {
        throw new Error(serverlessData.error);
      }
    }
  } catch (serverlessErr) {
    if (serverlessErr.message && !serverlessErr.message.includes('fetch') && !serverlessErr.message.includes('non-JSON')) {
      throw serverlessErr;
    }
    console.warn("Serverless API /api/sabpaisa unavailable or non-200, attempting client-side proxy...", serverlessErr);
  }

  // 2. Fallback Strategy: Client-side HMAC & proxy/direct fetch
  const merchantId = (import.meta.env.VITE_SABPAISA_CLIENT_CODE || '').trim();
  const apiKey = (import.meta.env.VITE_SABPAISA_API_KEY || import.meta.env.VITE_SABPAISA_AUTH_KEY || '').trim();
  const secretKey = (import.meta.env.VITE_SABPAISA_SECRET_KEY || import.meta.env.VITE_SABPAISA_AUTH_IV || '').trim();
  const env = (import.meta.env.VITE_SABPAISA_ENV || 'prod').trim().toLowerCase();
  const customUrl = (import.meta.env.VITE_SABPAISA_URL || '').trim();

  if (!merchantId || !apiKey || !secretKey) {
    throw new Error("SabPaisa PG 3.0 credentials missing in environment variables.");
  }

  const isStaging = env === 'stag';
  const directUrl = isStaging 
    ? 'https://staging-sb-merchant-api.sabpaisa.in/api/v2/payments' 
    : 'https://merchant-api.sabpaisa.in/api/v2/payments';

  let primaryUrl = directUrl;
  if (customUrl) {
    primaryUrl = customUrl.includes('/api/v2/payments')
      ? customUrl
      : `${customUrl.replace(/\/+$/, '')}/api/v2/payments`;
  } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    primaryUrl = isStaging ? '/sabpaisa-api-stag/api/v2/payments' : '/sabpaisa-api-prod/api/v2/payments';
  }

  const merchantTxnId = orderId;
  const paiseAmount = Math.round(parseFloat(amount) * 100);
  const currency = 'INR';
  const timestamp = Math.floor(Date.now() / 1000);

  const sanitizedMobile = (payerMobile || '').replace(/\D/g, '').slice(-10) || '9999999999';
  const sanitizedEmail = payerEmail || 'customer@groceryhub.com';
  const sanitizedName = (payerName || 'Customer').slice(0, 100);

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
  let responseText = '';

  try {
    response = await fetch(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(requestPayload)
    });
    responseText = await response.text();
  } catch (e) {
    console.warn("Primary API endpoint fetch failed, trying direct endpoint:", e);
  }

  if (!responseText || !responseText.trim().startsWith('{')) {
    if (primaryUrl !== directUrl) {
      try {
        response = await fetch(directUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey
          },
          body: JSON.stringify(requestPayload)
        });
        responseText = await response.text();
      } catch (err) {
        console.error("Direct SabPaisa API fetch error:", err);
      }
    }
  }

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (parseErr) {
    console.error("SabPaisa raw API response:", responseText);
    throw new Error(`SabPaisa API Response Error (Status ${response?.status || 'Unknown'}).`);
  }

  if (response && response.ok && responseData && (responseData.checkoutUrl || (responseData.data && responseData.data.checkoutUrl))) {
    let targetCheckoutUrl = responseData.checkoutUrl || responseData.data.checkoutUrl;
    const clientSecret = responseData.clientSecret || (responseData.data && responseData.data.clientSecret);

    if (clientSecret && !targetCheckoutUrl.includes('clientSecret')) {
      const separator = targetCheckoutUrl.includes('?') ? '&' : '?';
      targetCheckoutUrl = `${targetCheckoutUrl}${separator}clientSecret=${encodeURIComponent(clientSecret)}`;
    }

    window.location.href = targetCheckoutUrl;
  } else {
    const errorMsg = responseData?.errorMessage || responseData?.message || responseData?.error || `Payment session creation failed.`;
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
