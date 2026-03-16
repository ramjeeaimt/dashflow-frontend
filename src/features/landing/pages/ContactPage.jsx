import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-12 bg-blue-600 text-white md:w-1/3">
            <h2 className="text-2xl font-bold mb-6">Contact Info</h2>
            <div className="space-y-8 mt-10">
              <div className="flex items-center gap-4"><Mail /> support@difmo.com</div>
              <div className="flex items-center gap-4"><Phone /> +91 0000-000-000</div>
              <div className="flex items-center gap-4"><MapPin /> Lucknow, Uttar Pradesh</div>
            </div>
          </div>
          <div className="p-12 flex-1">
            <h2 className="text-2xl font-bold mb-8">Send a Message</h2>
            <form className="space-y-6">
              <input type="text" placeholder="Your Name" className="w-full border-b border-gray-200 py-3 focus:border-blue-600 outline-none transition" />
              <input type="email" placeholder="Work Email" className="w-full border-b border-gray-200 py-3 focus:border-blue-600 outline-none transition" />
              <textarea placeholder="How can we help?" rows="4" className="w-full border-b border-gray-200 py-3 focus:border-blue-600 outline-none transition"></textarea>
              <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg transition">Send Request</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;