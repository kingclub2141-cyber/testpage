/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, SiteSettings } from '../types';
import { Award, Copy, Share, UserCheck, RefreshCw, Smartphone, Palette, LogOut, Check } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  settings: SiteSettings;
  referralCount: number;
  onClaimBonus: () => { success: boolean; message: string };
  onUpdateDisplaySize: (size: 'compact' | 'medium' | 'bold' | 'prominent') => void;
  onClaimCommission: () => { success: boolean; message: string };
  onResetApp: () => void;
}

export default function ProfileView({
  user,
  settings,
  referralCount,
  onClaimBonus,
  onUpdateDisplaySize,
  onClaimCommission,
  onResetApp,
}: ProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const [bonusFeedback, setBonusFeedback] = useState<string>('');
  const [bonusErr, setBonusErr] = useState<string>('');
  const [commissionFeedback, setCommissionFeedback] = useState<string>('');

  const refUrl = `${window.location.origin}/register?ref=${user.refer_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimBonus = () => {
    setBonusErr('');
    setBonusFeedback('');
    const res = onClaimBonus();
    if (res.success) {
      setBonusFeedback(res.message);
    } else {
      setBonusErr(res.message);
    }
  };

  const handleClaimCommission = () => {
    setCommissionFeedback('');
    const res = onClaimCommission();
    setCommissionFeedback(res.message);
  };

  // Silver threshold check
  const silverRefsNeeded = settings.referral_silver_refs;
  const silverGpNeeded = settings.referral_silver_gp;
  const refsMet = Math.min(referralCount, silverRefsNeeded);
  const earningsMet = Math.min(user.total_earned, silverGpNeeded);

  // Compute percentage calculations for progressive indicators
  const refsPct = (refsMet / silverRefsNeeded) * 100;
  const earningsPct = (earningsMet / silverGpNeeded) * 100;

  return (
    <div id="profile-view" className="space-y-4">
      {/* Account Profile Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold font-mono">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-gray-900 text-base leading-snug">@{user.username}</h2>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400">
              Tier:
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-150">
              🥉 Bronze Participant
            </span>
          </div>
        </div>
      </div>

      {/* Play Welcome Claim Bonus box */}
      {!user.bonus_claimed && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 space-y-3 shadow-3xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wide block">
                ⭐ Promo Play Gift
              </span>
              <p className="text-xs text-blue-900 font-medium mt-1">
                Claim your fresh starter bonus of <span className="font-bold underline">100 GP</span> instantly!
              </p>
            </div>
            <span className="text-2xl animate-bounce leading-none">🎁</span>
          </div>
          <button
            id="btn-claim-bonus"
            onClick={handleClaimBonus}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Claim 100 GP Play Bonus
          </button>
          {bonusFeedback && <p className="text-[10px] text-emerald-600 font-bold text-center mt-1">✔ {bonusFeedback}</p>}
          {bonusErr && <p className="text-[10px] text-rose-500 font-bold text-center mt-1">⚠ {bonusErr}</p>}
        </div>
      )}

      {/* Referral Program Segment */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
            <Award className="h-4 w-4 text-blue-600" />
            <span>Referrals Nodes</span>
          </h3>
          <span className="text-[10px] font-bold text-gray-400">0.5% commission on trades</span>
        </div>

        {/* Milestone progressive markers */}
        <div className="space-y-3.5 border-t border-gray-50 pt-3.5 text-xs text-gray-600 font-medium">
          <div className="flex justify-between items-center text-[11px] text-gray-400">
            <span>Progress to Silver Tier</span>
            <span className="font-bold text-gray-850">🥉 Bronze</span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>Invitations Submitted:</span>
              <span className="font-mono font-bold text-gray-950">
                {referralCount}/{silverRefsNeeded}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${refsPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>Commissions Accumulated:</span>
              <span className="font-mono font-bold text-gray-950">
                {user.total_earned.toFixed(1)}/{silverGpNeeded} GP
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${earningsPct}%` }} />
            </div>
          </div>
        </div>

        {/* Dynamic Static Generated Invitation Codes */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center gap-3">
          <div className="bg-white p-2 border border-gray-100 rounded-lg shadow-3xs flex items-center justify-center">
            {/* Standard representation of visual referral coordinates */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-gray-100 rounded opacity-80" title="Invitation Node QR" style={{ width: 100, height: 100 }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 7 === 0 ? 'bg-gray-900' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>

          <div className="w-full space-y-1.5 text-center">
            <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none">Your Invitation Link</span>
            <p className="text-xs font-mono font-semibold text-gray-600 truncate px-2">{refUrl}</p>

            <div className="flex gap-2 pt-1 justify-center">
              <button
                id="btn-copy-ref"
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-100/60 text-xs font-bold rounded-lg text-gray-700 flex items-center gap-1.5 shadow-3xs transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                id="btn-whatsapp-share-ref"
                href={`https://api.whatsapp.com/send?text=Predict%20real-world%20outcomes%20and%20win%2521%20Join%20using%20my%20link:%20${encodeURIComponent(refUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs font-bold rounded-lg text-emerald-700 flex items-center gap-1.5 shadow-3xs transition-all"
              >
                <Share className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Claims metrics widgets */}
        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Pending Commissions</span>
            <span className="font-mono font-bold text-gray-900">
              {user.pending_earn.toFixed(2)} GP
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Claimed Payouts</span>
            <span className="font-mono font-bold text-gray-500">
              {user.claimed_earn.toFixed(2)} GP
            </span>
          </div>

          <button
            id="btn-claim-commission"
            onClick={handleClaimCommission}
            disabled={user.pending_earn < 100}
            className="w-full mt-2 py-2 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl disabled:bg-gray-200 transition-colors"
          >
            Claim Commission (Min 100 GP)
          </button>
          {commissionFeedback && (
            <p className="text-[9px] text-emerald-600 font-bold text-center mt-1">✔ {commissionFeedback}</p>
          )}
        </div>
      </div>

      {/* Visual layout customizer settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-blue-600" />
          <span>Aesthetic Sizing Customizer</span>
        </h3>
        <p className="text-[11px] text-gray-400">Modify global application layout density preference.</p>

        <div className="grid grid-cols-4 gap-1.5">
          {(['compact', 'medium', 'bold', 'prominent'] as const).map((size) => {
            const isSel = user.display_size === size;
            return (
              <button
                key={size}
                id={`btn-display-size-${size}`}
                onClick={() => onUpdateDisplaySize(size)}
                className={`py-1.5 border capitalize text-[10px] font-bold rounded-md ${
                  isSel ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator System controls */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs space-y-3">
        <div>
          <span className="font-bold text-rose-900 flex items-center gap-1">
            <Smartphone className="h-4 w-4" /> Reset Portal Simulator
          </span>
          <p className="text-[11px] text-rose-700 mt-1">
            Reset database, empty logs and restore play coin starter sets back to factory values.
          </p>
        </div>
        <button
          id="btn-system-reset"
          onClick={() => {
            if (confirm('Restore to default state? All mock history will be wiped.')) {
              onResetApp();
            }
          }}
          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Factory Reset Portal Data</span>
        </button>
      </div>
    </div>
  );
}
