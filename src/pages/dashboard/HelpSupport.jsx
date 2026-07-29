import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  PhoneCall,
  AlertCircle,
  Mail,
  Clock,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);

  const whatsappNumber = '916207462800';
  const displayPhone = '+91 6207462800';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I need help with my grocery order.')}`;

  const faqs = [
    {
      question: 'How do I track my active order status?',
      answer: 'You can track your order in real time by navigating to "My Orders" in your dashboard and clicking "Track Order" next to any active order.'
    },
    {
      question: 'What if I receive spoiled or bad quality groceries?',
      answer: 'We guarantee 100% freshness! If you receive unsatisfactory items, click "Lodge a Complaint" below or contact us on WhatsApp with photos for instant replacement or refund.'
    },
    {
      question: 'How do refunds work for cancelled orders?',
      answer: 'Refunds for online payments are processed back to your original payment method within 24-48 hours. For COD orders, refund credits are added to your wallet.'
    },
    {
      question: 'What are the customer support operating hours?',
      answer: 'Our WhatsApp and phone support team is active 7 days a week from 8:00 AM to 10:00 PM IST.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-slate-950/10 backdrop-blur-md text-slate-950 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3 border border-slate-950/10">
            24/7 Assistance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Help & Support Center
          </h1>
          <p className="text-slate-900/90 text-sm font-medium leading-relaxed">
            Need help with an order, item issue, or delivery? Reach out to our dedicated support team directly.
          </p>
        </div>
        <HelpCircle className="w-48 h-48 text-white/10 absolute -right-6 -bottom-10 pointer-events-none stroke-[1.5]" />
      </div>

      {/* Main Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Lodge a Complaint Card */}
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Lodge a Complaint</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Facing an issue with quality, missing items, or delayed delivery? File an official complaint and our manager will address it immediately.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/complaint"
              className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-amber-300/30 transition-all active:scale-[0.98]"
            >
              Lodge a Complaint Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* WhatsApp Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <MessageCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Official WhatsApp
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">WhatsApp Chat Support</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Connect instantly with our customer support team on WhatsApp for fast assistance and order updates.
            </p>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              📱 Phone / WhatsApp: <span className="text-emerald-700 font-extrabold">{displayPhone}</span>
            </p>
          </div>

          <div className="pt-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Chat on WhatsApp ({displayPhone}) <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Call Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <PhoneCall className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Direct Phone Call</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Speak directly with our support executive for urgent order cancellations or address updates.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Clock className="w-4 h-4 text-blue-500" /> Mon - Sun: 8:00 AM - 10:00 PM
            </div>
          </div>

          <div className="pt-6">
            <a
              href={`tel:${whatsappNumber}`}
              className="w-full py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Call {displayPhone}
            </a>
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
              <Mail className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Email Inquiry</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              For corporate orders, vendor inquiries, or feedback, send us an email and we'll reply within 24 hours.
            </p>
            <p className="text-xs font-bold text-slate-800">
              ✉️ support@groceryhub.com
            </p>
          </div>

          <div className="pt-6">
            <a
              href="mailto:support@groceryhub.com"
              className="w-full py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Send Email Inquiry
            </a>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Frequently Asked Questions</h3>
          <p className="text-slate-500 text-xs">Quick answers to common questions regarding orders, quality, and refunds.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-100 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 pt-3 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
