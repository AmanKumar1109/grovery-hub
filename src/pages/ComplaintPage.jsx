import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import TopHeader from '../components/header/TopHeader';
import Footer from '../components/shop/Footer';

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    orderId: '',
    issueType: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        phone: '',
        orderId: '',
        issueType: '',
        description: '',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <TopHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-slate-100">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Lodge a Complaint
            </h1>
            <p className="text-slate-500 text-sm">
              We're sorry you're facing an issue. Please fill out the form below and our support team will get back to you within 24 hours.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Complaint Submitted!</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Thank you for reaching out. We have received your complaint and our team will resolve it at the earliest.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all"
                >
                  Submit Another Issue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-bold text-slate-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Order ID */}
                  <div className="space-y-1.5">
                    <label htmlFor="orderId" className="text-sm font-bold text-slate-700">
                      Order ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleChange}
                      placeholder="e.g. ORD-12345"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
                    />
                  </div>

                  {/* Issue Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="issueType" className="text-sm font-bold text-slate-700">
                      Issue Type *
                    </label>
                    <select
                      id="issueType"
                      name="issueType"
                      required
                      value={formData.issueType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm bg-white"
                    >
                      <option value="" disabled>Select the type of issue</option>
                      <option value="delivery">Delayed/Missing Delivery</option>
                      <option value="quality">Bad Product Quality</option>
                      <option value="missing">Missing Items in Order</option>
                      <option value="payment">Payment/Refund Issue</option>
                      <option value="app_bug">App Not Working Properly</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-bold text-slate-700">
                    Describe your issue *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please explain the problem you faced in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm resize-y"
                  />
                </div>

                <div className="bg-blue-50/80 rounded-xl p-4 flex gap-3 items-start border border-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    By submitting this form, you agree that our support executives might call you on your registered phone number to resolve this issue.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-slate-900 transition-all flex items-center justify-center gap-2 ${
                    isSubmitting 
                      ? 'bg-amber-400/50 cursor-not-allowed' 
                      : 'bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
