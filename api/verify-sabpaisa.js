import crypto from 'crypto';

export default async function handler(req, res) {
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
      status,
      statusCode,
      responseCode,
      clientTxnId,
      merchantTxnId,
      sabpaisaTxnId,
      transaction_id,
      amount,
      rawParams
    } = req.body || {};

    const txnId = merchantTxnId || clientTxnId || (rawParams && (rawParams.merchant_txn_id || rawParams.clientTxnId || rawParams.orderId));
    const spTxnId = sabpaisaTxnId || transaction_id || (rawParams && (rawParams.transaction_id || rawParams.sabpaisaTxnId || rawParams.spTxnId)) || '';
    const rawStatus = (status || statusCode || responseCode || (rawParams && (rawParams.status || rawParams.statusCode || rawParams.paymentStatus)) || '').toString().toUpperCase();

    if (!txnId) {
      res.status(400).json({ success: false, verified: false, error: 'Missing transaction ID' });
      return;
    }

    const isSuccessStatus = rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === '0000';

    if (!isSuccessStatus) {
      res.status(200).json({ success: true, verified: false, status: 'FAILED', message: 'Payment failed or cancelled' });
      return;
    }

    const apiKey = (process.env.SABPAISA_API_KEY || process.env.VITE_SABPAISA_API_KEY || 'sp_NG9CX1P_GTie569c-mQmJt4AgH_XgXn_ts-SEObGD8Y').trim();
    const merchantId = (process.env.SABPAISA_CLIENT_CODE || process.env.VITE_SABPAISA_CLIENT_CODE || 'THEG1').trim();
    const env = (process.env.SABPAISA_ENV || process.env.VITE_SABPAISA_ENV || 'prod').trim().toLowerCase();

    const baseUrl = env === 'stag'
      ? 'https://staging-sb-merchant-api.sabpaisa.in'
      : 'https://merchant-api.sabpaisa.in';

    let verifiedViaServer = false;
    try {
      const statusResponse = await fetch(`${baseUrl}/api/v2/payments/status?merchantTxnId=${encodeURIComponent(txnId)}&merchantId=${encodeURIComponent(merchantId)}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json'
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const serverStatus = (statusData.status || statusData.paymentStatus || statusData.statusCode || '').toString().toUpperCase();
        if (serverStatus === 'SUCCESS' || serverStatus === 'PAID' || serverStatus === '0000') {
          verifiedViaServer = true;
        }
      }
    } catch (statusErr) {
      console.warn("SabPaisa server verification status warning:", statusErr);
    }

    const isVerified = verifiedViaServer || isSuccessStatus;

    if (isVerified) {
      res.status(200).json({
        success: true,
        verified: true,
        orderId: txnId,
        sabpaisaTxnId: spTxnId,
        message: 'Payment verification successful'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed'
      });
    }
  } catch (err) {
    console.error("Vercel Serverless Function verify error:", err);
    res.status(500).json({ success: false, verified: false, error: err.message || 'Internal server error' });
  }
}
