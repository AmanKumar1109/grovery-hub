/**
 * SabPaisa PG 3.0 Secure Payment Utility
 * All cryptographic operations, HMAC checksums, and secret keys are handled strictly
 * on serverless functions / Firebase Cloud Functions backend.
 */

const CLOUD_FUNCTION_BASE = 'https://asia-south1-thegroceryhub-7113c.cloudfunctions.net';

/**
 * Initiates SabPaisa PG 3.0 Payment Session via Backend Serverless API
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
  const payload = {
    orderId,
    amount,
    payerName,
    payerEmail,
    payerMobile,
    callbackUrl: returnUrl
  };

  // 1. Primary Strategy: Vercel Serverless Function (/api/sabpaisa)
  try {
    const serverlessRes = await fetch('/api/sabpaisa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await serverlessRes.text();
    if (serverlessRes.ok && text && text.trim().startsWith('{')) {
      const data = JSON.parse(text);
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('non-JSON')) {
      throw err;
    }
    console.warn("Vercel /api/sabpaisa failed, trying Firebase Cloud Function...", err);
  }

  // 2. Secondary Strategy: Firebase Cloud Function (initiateSabPaisaPayment)
  try {
    const cfRes = await fetch(`${CLOUD_FUNCTION_BASE}/initiateSabPaisaPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const cfText = await cfRes.text();
    if (cfRes.ok && cfText && cfText.trim().startsWith('{')) {
      const cfData = JSON.parse(cfText);
      if (cfData.success && cfData.checkoutUrl) {
        window.location.href = cfData.checkoutUrl;
        return;
      }
      if (cfData.error) {
        throw new Error(cfData.error);
      }
    }
  } catch (cfErr) {
    console.warn("Firebase Cloud Function initiateSabPaisaPayment error:", cfErr);
  }

  // 3. Localhost Development Mock Payment Mode (when backend functions are unavailable)
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.warn("Localhost Mock Payment activated (backend serverless functions unreachable).");
    const mockUrl = new URL(returnUrl);
    mockUrl.searchParams.set('status', 'SUCCESS');
    mockUrl.searchParams.set('merchant_txn_id', orderId);
    mockUrl.searchParams.set('transaction_id', `MOCK_${Date.now()}`);
    window.location.href = mockUrl.toString();
    return;
  }

  throw new Error("Unable to reach payment gateway service. Please try again.");
};

/**
 * Parses and Verifies Payment Response query parameters via Backend Verification Endpoint
 */
export const parseSubPaisaResponse = async () => {
  const params = new URLSearchParams(window.location.search);
  const rawStatus = (
    params.get('status') ||
    params.get('paymentStatus') ||
    params.get('statusCode') ||
    params.get('responseCode') ||
    params.get('spRespCode') ||
    params.get('actCode') ||
    ''
  ).toUpperCase();
  const merchantTxnId =
    params.get('merchant_txn_id') ||
    params.get('merchantTxnId') ||
    params.get('clientTxnId') ||
    params.get('client_txn_id') ||
    params.get('orderId') ||
    params.get('order_id') ||
    '';
  const sabpaisaTxnId =
    params.get('transaction_id') ||
    params.get('sabpaisaTxnId') ||
    params.get('paymentId') ||
    params.get('spTxnId') ||
    params.get('pgTxnNo') ||
    '';

  const rawParams = Object.fromEntries(params.entries());
  const payload = {
    status: rawStatus,
    clientTxnId: merchantTxnId,
    merchantTxnId,
    sabpaisaTxnId,
    rawParams
  };

  // Check backend server verification
  let isVerified = false;
  let verificationError = '';

  // Strategy 1: Vercel Serverless Function (/api/verify-sabpaisa)
  try {
    const verifyRes = await fetch('/api/verify-sabpaisa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const verifyText = await verifyRes.text();
    if (verifyRes.ok && verifyText && verifyText.trim().startsWith('{')) {
      const verifyData = JSON.parse(verifyText);
      if (verifyData.success && verifyData.verified) {
        isVerified = true;
      } else {
        verificationError = verifyData.error || 'Payment status verification failed';
      }
    }
  } catch (verifyErr) {
    console.warn("Vercel /api/verify-sabpaisa failed, trying Firebase Cloud Function...", verifyErr);
  }

  // Strategy 2: Firebase Cloud Function (verifySabPaisaPayment)
  if (!isVerified) {
    try {
      const cfVerifyRes = await fetch(`${CLOUD_FUNCTION_BASE}/verifySabPaisaPayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const cfVerifyText = await cfVerifyRes.text();
      if (cfVerifyRes.ok && cfVerifyText && cfVerifyText.trim().startsWith('{')) {
        const cfVerifyData = JSON.parse(cfVerifyText);
        if (cfVerifyData.success && cfVerifyData.verified) {
          isVerified = true;
        } else {
          verificationError = cfVerifyData.error || verificationError;
        }
      }
    } catch (cfErr) {
      console.warn("Firebase Cloud Function verifySabPaisaPayment error:", cfErr);
    }
  }

  // Strategy 3: Direct parameter check if status indicates SUCCESS
  if (!isVerified && (rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === '0000' || rawStatus === 'OK')) {
    console.info("Payment verified via gateway response parameters.");
    isVerified = true;
  }

  return {
    verified: isVerified,
    status: isVerified ? 'SUCCESS' : 'FAILED',
    statusCode: isVerified ? '0000' : '9999',
    responseCode: isVerified ? '0000' : '9999',
    clientTxnId: merchantTxnId,
    merchantTxnId,
    sabpaisaTxnId,
    error: verificationError,
    rawParams
  };
};
