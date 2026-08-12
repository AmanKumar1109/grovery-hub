import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading Invoice...</div>;
  if (!order) return <div className="p-8 text-center font-black text-red-500">Invoice not found!</div>;

  const formatDateShort = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date = timestamp;
    if (timestamp.toDate) date = timestamp.toDate();
    else if (typeof timestamp === 'number') date = new Date(timestamp);
    else if (typeof timestamp === 'string') date = new Date(timestamp);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num) => {
    if (num === 0) return 'Zero Only';
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '','Twenty ','Thirty ','Forty ','Fifty ','Sixty ','Seventy ','Eighty ','Ninety '];
    const n = ('000000000' + Math.floor(num)).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + a[n[5][1]]) : '';
    return str.trim() + ' Only';
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500';
    if (s === 'cancelled') return 'bg-red-500';
    return 'bg-amber-500'; // processing / paid / etc
  };

  let totalQty = 0;
  let totalMrp = 0;
  let itemsTotal = 0;
  
  order.items?.forEach(item => {
    const qty = parseFloat(item.quantity || 1);
    totalQty += qty;
    const price = parseFloat(item.price || 0);
    const mrp = parseFloat(item.mrp || item.price || 0);
    itemsTotal += (price * qty);
    totalMrp += (mrp * qty);
  });

  const deliveryFee = parseFloat(order.deliveryFee || 0);
  const discountAmount = parseFloat(order.discountAmount || 0);
  const netPayable = parseFloat(order.totalAmount || (itemsTotal + deliveryFee - discountAmount));
  const customerName = order.customerName || order.shippingAddress?.fullName || userProfile?.fullName || 'Cash';
  const customerPhone = order.customerPhone || order.shippingAddress?.phone || userProfile?.phone || '';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen print:bg-white print:p-0 print:m-0">
      <style>
        {`
          @media print {
            @page {
              margin: 0 !important;
              size: 80mm auto;
            }
            html, body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 80mm !important;
              color: black;
            }
            .thermal-print-container {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 4mm !important;
              box-shadow: none !important;
              border: none !important;
              font-family: 'Courier New', Courier, monospace !important;
              transform: none !important;
            }
          }
        `}
      </style>
      
      {/* Hide on print - Top Nav */}
      <div className="mb-6 print:hidden">
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start print:m-0 print:p-0 print:gap-0 print:block print:w-[80mm] print:mx-0">
        
        {/* Left/Main Column: Thermal Receipt */}
        <div className="thermal-print-container w-full max-w-[380px] bg-white shadow-xl p-6 font-mono text-[12px] leading-tight text-black print:shadow-none print:w-[80mm] print:max-w-[80mm] print:p-2 print:mx-0 print:ml-0">
          
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold uppercase mb-1">The Grocery Hub</h1>
            <p>DADU COMPLEX, NEAR SHITLA MANDIR</p>
            <p>BAHARAGORA, JHARKHAND-832101</p>
            <p>MOB: 6207462800, 6203341481</p>
            <p>GSTIN: 20AAYFT4502E1ZC</p>
          </div>
          
          <div className="border-t border-b border-dashed border-black py-1 text-center font-bold mb-2">
            TAX INVOICE
          </div>
          
          {/* Info */}
          <div className="mb-2 space-y-1">
            <div className="flex justify-between">
              <span>Inv No: {order.id?.slice(0, 8)}</span>
              <span>Date: {formatDateShort(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Name: {customerName?.slice(0, 15)}</span>
              <span>Mob: {customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Pay: {order.paymentMethod?.toLowerCase().includes('online') || order.paymentMethod === 'ONLINE' ? 'Online' : 'COD'}</span>
              <span>Status: {order.status || 'Received'}</span>
            </div>
          </div>
          
          <div className="border-t border-black border-dashed mb-2"></div>
          
          {/* Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black border-dashed">
                <th className="py-1 font-normal w-[46%]">Item</th>
                <th className="py-1 font-normal text-center w-[14%]">Qty</th>
                <th className="py-1 font-normal text-right w-[20%] pr-2">Rate</th>
                <th className="py-1 font-normal text-right w-[20%]">Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => {
                const qty = parseFloat(item.quantity || 1);
                const price = parseFloat(item.price || 0);
                const amt = price * qty;
                return (
                  <tr key={idx} className="align-top">
                    <td className="py-1 pr-1">
                      {idx + 1}. {item.name} {item.weight ? `(${item.weight})` : ''}
                    </td>
                    <td className="py-1 text-center">{qty}</td>
                    <td className="py-1 text-right pr-2">{price.toFixed(2)}</td>
                    <td className="py-1 text-right">{amt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="border-t border-black border-dashed mt-2 py-2">
            <div className="flex justify-between font-bold">
              <span>Total Items: {totalQty.toFixed(2)}</span>
              <div className="flex items-center gap-2">
                <span>Total:</span>
                <span className="text-right">{itemsTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Tax & Summary */}
          <div className="border-t border-black border-dashed py-2 space-y-1">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span>: {totalMrp.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>: {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {order.couponApplied && (
              <div className="flex justify-between">
                <span>Coupon ({order.couponApplied})</span>
                <span>: -{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[14px] mt-1">
              <span>NET PAYABLE</span>
              <span>: Rs. {netPayable.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-black border-dashed mt-2 pt-2 text-center text-[10px]">
            <p>Rupees {numberToWords(netPayable)}</p>
          </div>

          <div className="border-t border-black border-dashed mt-2 pt-2 text-center">
            <p className="font-bold">Thank You, Visit Again!</p>
          </div>
          
        </div>

        {/* Right Column: Status & Actions (Hidden on Print) */}
        <div className="w-full md:w-80 shrink-0 space-y-6 print:hidden">
          
          {/* Order Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-800 mb-4">Order Status</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-10 h-10 rounded-full opacity-20 ${getStatusColor(order.status)} animate-ping`}></div>
                <div className={`relative w-4 h-4 rounded-full ${getStatusColor(order.status)} ring-4 ring-white shadow-sm`}></div>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg capitalize">{order.status || 'Processing'}</p>
                <p className="text-sm text-slate-500 font-medium">Order ID: {order.id?.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Actions</h2>
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm"
            >
              <Printer className="w-5 h-5" />
              <span>Print Receipt</span>
            </button>
            <p className="text-xs text-slate-500 text-center mt-3 font-medium">
              Uses thermal receipt layout. Select "80mm Roll Paper" or similar when printing.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

