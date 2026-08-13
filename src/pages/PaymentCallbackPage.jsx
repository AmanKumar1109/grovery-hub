import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { parseSubPaisaResponse } from '../utils/sabpaisa';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { useCart } from '../context/CartContext';

export default function PaymentCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'failed' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [orderId, setOrderId] = useState('');

  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const response = await parseSubPaisaResponse();
        console.log("SubPaisa Response:", response);
        setPaymentData(response);

        const txnId = response.clientTxnId || response.txnId || response.spTxnId;
        setOrderId(txnId || '');

        const isSuccessful =
          response.verified === true && (
            response.status === 'SUCCESS' ||
            response.status === '0000' ||
            response.responseCode === '0000' ||
            response.statusCode === '0000' ||
            response.paymentStatus === 'SUCCESS'
          );

        if (isSuccessful && txnId) {
          // Read pending order from localStorage or Firestore
          const pendingOrderRaw = localStorage.getItem('pendingSubPaisaOrder');
          let orderData = pendingOrderRaw ? JSON.parse(pendingOrderRaw) : null;

          if (!orderData) {
            const orderDoc = await getDoc(doc(db, 'orders', txnId));
            if (orderDoc.exists()) {
              orderData = orderDoc.data();
            }
          }

          if (orderData) {
            // Update order status to paid
            const updatedOrder = {
              ...orderData,
              paymentStatus: 'Paid (SubPaisa)',
              paymentMethod: 'Online Payment (SubPaisa)',
              status: 'Order Received',
              sabpaisaTxnId: response.sabpaisaTxnId || response.pgTxnNo || response.spTxnId || '',
              paymentResponse: response,
              updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'orders', txnId), updatedOrder, { merge: true });

            // Send Confirmation Email
            if (orderData.customerEmail) {
              try {
                const notifDoc = await getDoc(doc(db, 'settings', 'notifications'));
                let template = null;

                if (notifDoc.exists()) {
                  template = notifDoc.data().templates?.Pending;
                }

                if (template) {
                  const formatMoney = (amt) => Number(amt).toFixed(2);
                  const formatAddress = (addr) => typeof addr === 'string' ? addr : (addr ? `${addr.street || ''}, ${addr.locality || ''}, ${addr.city || ''} - ${addr.pincode || ''}` : 'N/A');
                  const formatTime = (ts) => ts ? new Date(ts).toLocaleString() : 'N/A';
                  const formatOrderItems = (items, totalAmount, address) => {
                    if (!items || items.length === 0) return '';
                    let html = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">`;
                    html += `<tr><th style="background: #f8fafc; padding: 12px 15px; text-align: left; font-size: 13px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Item</th><th style="background: #f8fafc; padding: 12px 15px; text-align: right; font-size: 13px; color: #64748b; border-bottom: 2px solid #e2e8f0;">Total</th></tr>`;
                    items.forEach(item => {
                      const qty = item.quantity || item.qty || 1;
                      const name = item.name || 'Item';
                      const price = item.finalPrice || item.price || 0;
                      const total = (price * qty).toFixed(2);
                      html += `<tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;"><strong>${qty}x</strong> ${name}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; text-align: right; font-weight: 600;">₹${total}</td>
                      </tr>`;
                    });

                    if (totalAmount !== undefined) {
                      html += `<tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 15px; font-weight: 800; text-align: right;">Total</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #059669; font-size: 16px; text-align: right; font-weight: 800;">₹${parseFloat(totalAmount).toFixed(2)}</td>
                      </tr>`;
                    }

                    if (address) {
                      html += `<tr>
                        <td colspan="2" style="padding: 15px; background: #f8fafc; color: #475569; font-size: 13px; line-height: 1.5;">
                          <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Delivery Address:</strong>
                          ${address}
                        </td>
                      </tr>`;
                    }

                    html += `</table>`;
                    return html.replace(/\n/g, '');
                  };

                  const rawBody = template.body || '';
                  let replacedHtmlBody = rawBody.replace(/\n/g, '<br>');
                  replacedHtmlBody = replacedHtmlBody
                    .replace(/\[Customer Name\]/gi, orderData.customerName || 'Customer')
                    .replace(/\[Order ID\]/gi, txnId)
                    .replace(/\[Amount\]/gi, formatMoney(orderData.totalAmount))
                    .replace(/\[Address\]/gi, formatAddress(orderData.address))
                    .replace(/\[Time\]/gi, formatTime(orderData.createdAt))
                    .replace(/\[Cancel Reason\]/gi, 'N/A')
                    .replace(/\[Order Items?\]/gi, formatOrderItems(orderData.items, orderData.totalAmount, formatAddress(orderData.address)));

                  const emailSubject = template.subject.replace(/\[Order ID\]/g, txnId);

                  const htmlWithWrapper = `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>body{font-family:'Inter',sans-serif;background-color:#f4fdf8;margin:0;padding:0;color:#334155;line-height:1.6;}.container{max-width:600px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:linear-gradient(135deg, #059669 0%, #10b981 100%);padding:30px 20px;text-align:center;}.header h1{color:#ffffff;margin:0;font-size:28px;font-weight:800;}.content{padding:40px 30px;font-size:16px;}.content p{margin-top:0;margin-bottom:20px;}.highlight{background:#ecfdf5;padding:15px 20px;border-radius:12px;border-left:4px solid #10b981;margin-bottom:20px;}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:13px;color:#64748b;border-top:1px solid #f1f5f9;}</style>
</head><body><div class="container"><div class="header"><h1>The Grocery Hub 🛒</h1></div><div class="content">${replacedHtmlBody}</div><div class="footer"><p>Thank you for shopping with us!<br><strong>The Grocery Hub</strong> - Fresh • Quality • Trust</p></div></div></body></html>`;

                  await addDoc(collection(db, 'mail'), {
                    to: orderData.customerEmail,
                    from: '"The Grocery Hub" <ghoshabhijit1295@gmail.com>',
                    message: {
                      subject: emailSubject,
                      html: htmlWithWrapper
                    }
                  });
                }
              } catch (mailErr) {
                console.error("Failed to send order email:", mailErr);
              }
            }

            // Update recent buyers
            if (orderData.items && Array.isArray(orderData.items)) {
              for (const item of orderData.items) {
                if (item.id) {
                  try {
                    await updateDoc(doc(db, 'items', item.id), {
                      recentBuyers: increment(item.quantity || 1)
                    });
                  } catch (err) {
                    console.error("Error updating recent buyers:", err);
                  }
                }
              }
            }

            // Deactivate coupon
            if (orderData.appliedCouponId && orderData.userId && orderData.userId !== 'guest') {
              try {
                await updateDoc(doc(db, 'users', orderData.userId), {
                  usedCoupons: arrayUnion(orderData.appliedCouponId)
                });
              } catch (err) {
                console.error("Error updating used coupons:", err);
              }
            }
          }

          clearCart();
          localStorage.removeItem('pendingSubPaisaOrder');
          setStatus('success');
        } else {
          // Payment Failed or Cancelled
          localStorage.removeItem('pendingSubPaisaOrder');
          if (txnId) {
            try {
              const orderDoc = await getDoc(doc(db, 'orders', txnId));
              if (orderDoc.exists()) {
                await updateDoc(doc(db, 'orders', txnId), {
                  paymentStatus: 'Failed',
                  status: 'Payment Failed',
                  paymentResponse: response,
                  updatedAt: new Date().toISOString()
                });
              }
            } catch (err) {
              console.warn("No existing order to update for failed payment:", err);
            }
          }

          setErrorMessage(response.statusMessage || response.message || 'Payment processing was cancelled or failed.');
          setStatus('failed');
        }

      } catch (err) {
        console.error("Callback processing error:", err);
        setErrorMessage(err.message || 'Failed to verify payment response.');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full space-y-4">
          <div className="w-14 h-14 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-black text-slate-900">Verifying Payment...</h2>
          <p className="text-sm font-medium text-slate-500">Please wait while we confirm your transaction with SubPaisa.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-xs font-bold text-emerald-600 mb-4 uppercase tracking-widest">Order ID: {orderId}</p>
          <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
            Your online payment via SubPaisa was verified successfully. Your fresh groceries are being prepared for delivery!
          </p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-rose-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Failed</h2>
        {orderId && <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Order ID: {orderId}</p>}
        <p className="text-slate-600 font-medium mb-8 text-sm leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-200">
          {errorMessage || 'The transaction could not be completed.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Payment Again</span>
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Return to Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
