/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SupportTicket, SiteSettings } from '../types';
import { Send, MessageCircle, HelpCircle, ShieldAlert, CheckSquare } from 'lucide-react';

interface SupportViewProps {
  username: string;
  settings: SiteSettings;
  onSubmitTicket: (telegram: string, whatsapp: string) => void;
  supportTickets: SupportTicket[];
}

export default function SupportView({
  username,
  settings,
  onSubmitTicket,
  supportTickets,
}: SupportViewProps) {
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationErr, setValidationErr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr('');

    if (!telegram.trim() && !whatsapp.trim()) {
      setValidationErr('Please fill in at least one contact channel (Telegram or WhatsApp).');
      return;
    }

    onSubmitTicket(telegram, whatsapp);
    setSubmitted(true);
    setTelegram('');
    setWhatsapp('');
  };

  const myTickets = supportTickets.filter((t) => t.username === username);

  return (
    <div id="support-view" className="space-y-4">
      {/* Support Heading Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3">
        <div className="flex gap-3 items-center">
          <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl text-blue-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-sm">Customer Helpline Care</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Welcome! Our online customer service acts 24/7.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Support Chat Initiation Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Start Live Consultation</h3>

          {submitted ? (
            <div id="support-submitted-state" className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3.5 text-center">
              <CheckSquare className="h-8 w-8 text-emerald-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Information Submitted Successfully</p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Our customer service agent has logged your credentials and will reach out to you within 30 minutes.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-1.5">
                <a
                  id="link-whatsapp-support"
                  href={`https://wa.me/${settings.whatsapp_number.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  id="link-telegram-support"
                  href={settings.telegram_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Chat on Telegram</span>
                </a>
              </div>
              <button
                id="btn-new-support"
                onClick={() => setSubmitted(false)}
                className="text-[10px] text-gray-400 underline font-semibold mt-1"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form id="support-init-form" onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Authenticated Account ID</label>
                <input
                  id="support-username-display"
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg text-gray-500 focus:outline-none select-none"
                  value={username}
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Telegram Contact URL / Name</label>
                <input
                  id="support-telegram-input"
                  type="text"
                  placeholder="Ex. @kingclub_tele"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  id="support-whatsapp-input"
                  type="text"
                  placeholder="Ex. +91 99999 99999"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              {validationErr && (
                <div className="p-3 bg-red-50 border border-red-105 rounded-lg text-[11px] text-red-800 flex items-center gap-1.5 font-medium">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span>{validationErr}</span>
                </div>
              )}

              <button
                id="btn-start-chatting-submit"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Submit Consultation Request
              </button>
            </form>
          )}
        </div>

        {/* Existing Consultation Tickets */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">My Ticket Log</h3>
          {myTickets.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-6 text-center bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
              No previous support tickets recorded for this profile.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {myTickets.map((t) => (
                <div key={t.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">Support Consultation Ticket</p>
                    <p className="text-[9px] text-gray-400 mt-1 font-mono">
                      Ref: {t.id} · {new Date(t.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-1.5 flex gap-2 text-[9px] font-mono text-gray-500">
                      {t.telegram && <span>Tg: {t.telegram}</span>}
                      {t.whatsapp && <span>Wa: {t.whatsapp}</span>}
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
