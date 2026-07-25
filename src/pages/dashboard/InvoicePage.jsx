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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date = timestamp;
    if (timestamp.toDate) date = timestamp.toDate();
    else if (typeof timestamp === 'number') date = new Date(timestamp);
    else if (typeof timestamp === 'string') date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = parseFloat(order.totalAmount || order.amount || 0);
  const deliveryFee = parseFloat(order.deliveryFee || 0);
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {/* Hide on print */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link to="/dashboard/orders" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Back to Orders</span>
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Invoice Document */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-12 border-b border-slate-200 pb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-emerald-600 tracking-tight">The Grocery Hub</h1>
            <div className="text-sm font-semibold text-slate-500 mt-2">
              <p>Dadu complex, Near Shitla Mandir,</p>
              <p>Baharagora, 832101</p>
              <p className="mt-1">Phone: 6207462800</p>
              <p>Email: thegroceryhub2025@gmail.com</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest mb-2">INVOICE</h2>
            <p className="text-sm font-bold text-slate-800">Order ID: #{order.id}</p>
            <p className="text-sm font-semibold text-slate-500">Date: {formatDate(order.createdAt)}</p>
            <span className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {order.status || 'Paid'}
            </span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-12">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Billed To:</h3>
          <p className="text-base font-bold text-slate-800">{order.shippingAddress?.fullName || userProfile?.fullName || 'Customer'}</p>
          {order.shippingAddress && (
            <div className="text-sm font-medium text-slate-600 mt-1 max-w-sm">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-12 overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Item Description</th>
                <th className="py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Qty</th>
                <th className="py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Price</th>
                <th className="py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 text-sm font-bold text-slate-800">
                    {item.name}
                    {item.weight && <span className="block text-xs font-medium text-slate-400 mt-0.5">{item.weight}</span>}
                  </td>
                  <td className="py-4 text-sm font-semibold text-slate-600 text-center">{item.quantity || 1}</td>
                  <td className="py-4 text-sm font-semibold text-slate-600 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                  <td className="py-4 text-sm font-bold text-slate-900 text-right">₹{(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <div className="flex justify-between py-2 text-sm font-semibold text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-semibold text-slate-600 border-b border-slate-200">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between py-4 text-lg font-black text-emerald-600">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center print:mt-auto">
          <p className="text-sm font-bold text-slate-800">Thank you for shopping with The Grocery Hub!</p>
          <p className="text-xs font-medium text-slate-500 mt-1">If you have any questions concerning this invoice, contact our support.</p>
        </div>

      </div>
    </div>
  );
}
