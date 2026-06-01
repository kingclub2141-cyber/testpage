/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Event, EventOption, User } from '../types';
import { ArrowLeft, Coins, Share2, Eye, ShieldAlert, CheckCircle2, TrendingUp, History } from 'lucide-react';

interface EventDetailViewProps {
  event: Event;
  options: EventOption[];
  user: User;
  onPlaceBet: (optionId: string, amount: number) => { success: boolean; message: string };
  onBack: () => void;
  btcPrice: number;
}

export default function EventDetailView({
  event,
  options,
  user,
  onPlaceBet,
  onBack,
  btcPrice,
}: EventDetailViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState<boolean>(false);
  const [timerString, setTimerString] = useState<string>('');

  const eventOpts = options.filter((o) => o.event_id === event.id);
  const selectedOption = eventOpts.find((o) => o.id === selectedOptionId);
  const isLtc = event.category_id === 'btc-5min';

  // Live timer countdown
  useEffect(() => {
    const updateTimer = () => {
      const totalMs = new Date(event.end_time).getTime() - Date.now();
      if (totalMs <= 0) {
        setTimerString(isLtc ? '00:00' : 'Settlement Pending');
        return;
      }
      const totalSecs = Math.floor(totalMs / 1000);
      if (isLtc) {
        const min = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const sec = (totalSecs % 60).toString().padStart(2, '0');
        setTimerString(`${min}:${sec}`);
      } else {
        const days = Math.floor(totalSecs / (24 * 3600));
        const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        if (days > 0) {
          setTimerString(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimerString(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.end_time, isLtc]);

  // Set default selected option
  useEffect(() => {
    if (eventOpts.length > 0 && !selectedOptionId) {
      setSelectedOptionId(eventOpts[0].id);
    }
  }, [eventOpts, selectedOptionId]);

  const handleQuickSelect = (amount: number | 'max') => {
    setErrorMsg('');
    setSuccessMsg('');
    if (amount === 'max') {
      setBetAmount(Math.floor(user.gp_balance));
    } else {
      setBetAmount(amount);
    }
  };

  const handleSubmitBet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedOptionId) {
      setErrorMsg('Please select a prediction outcome first.');
      return;
    }
    if (betAmount <= 0) {
      setErrorMsg('Prediction value must be greater than 0 GP.');
      return;
    }
    if (betAmount > user.gp_balance) {
      setErrorMsg(`Insufficient GP balance. You need ${betAmount} GP but only have ${user.gp_balance.toFixed(2)} GP.`);
      return;
    }

    setIsPlacing(true);
    // Simulate minor network delay for premium feel
    setTimeout(() => {
      const result = onPlaceBet(selectedOptionId, betAmount);
      setIsPlacing(false);
      if (result.success) {
        setSuccessMsg(result.message);
      } else {
        setErrorMsg(result.message);
      }
    }, 450);
  };

  // Mock secondary activity feed data inside details page
  const mockActivity = [
    { name: 'Kunal_Raj', action: 'predicted', label: eventOpts[0]?.label || 'YES', sum: '150 GP', time: '1m ago' },
    { name: 'Sidharth_S', action: 'predicted', label: eventOpts[1]?.label || 'NO', sum: '250 GP', time: '3m ago' },
    { name: 'Nisha_P', action: 'claimed referral', label: '100 GP', sum: '', time: '12m ago' },
  ];

  return (
    <div id="event-detail-view" className="space-y-4">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-home"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-3xs hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Events</span>
        </button>
        <button
          id="btn-share-event"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Event link copied to clipboard!');
          }}
          className="p-1.5 bg-white border border-gray-100 hover:border-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-all shadow-3xs"
          title="Share this event"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main Metadata Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-3xl">
            {event.thumbnail ? event.thumbnail : '🎯'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 tracking-wider">PRED-ID: {event.id}</span>
              {event.is_live && (
                <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-[9px] font-bold tracking-tight uppercase animate-pulse">
                  ● LIVE TRADING
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-gray-900 leading-tight mt-1">{event.title}</h1>
          </div>
        </div>

        {/* Informative description block (no over-engineering visual jargon) */}
        <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
          {event.description}
        </p>

        {isLtc && (
          <div className="flex justify-between items-center bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-xs">
            <span className="font-semibold text-amber-800 flex items-center gap-1.5">
              <span>📊</span> Live Index price:
            </span>
            <span className="font-mono font-bold text-amber-900 bg-white border border-amber-200/60 px-2 py-0.5 rounded">
              ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Quantitative event telemetry tags (clean borders, no status sliders in margins) */}
        <div className="grid grid-cols-3 gap-3 border-t border-gray-50 pt-4 text-center">
          <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100/50">
            <p className="text-[10px] text-gray-400 font-semibold leading-none">Total Volume</p>
            <p className="text-sm font-bold text-gray-900 font-mono mt-1.5">{event.total_volume.toLocaleString()} GP</p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100/50">
            <p className="text-[10px] text-gray-400 font-semibold leading-none">Participants</p>
            <p className="text-sm font-bold text-gray-900 font-mono mt-1.5">{event.participants} Accounts</p>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-2.5 border border-gray-100/50 flex flex-col justify-between">
            <p className="text-[10px] text-gray-400 font-semibold leading-none">Remaining</p>
            <p className="text-xs font-bold text-red-600 font-mono mt-1.5 whitespace-nowrap overflow-ellipsis">
              {timerString}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Betting Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-3xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span>Place Your Prediction</span>
        </h2>

        {/* Option Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {eventOpts.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                id={`btn-select-option-${opt.id}`}
                type="button"
                onClick={() => {
                  setSelectedOptionId(opt.id);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex flex-col justify-between p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
                disabled={event.status !== 'open'}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: opt.color || '#4A90E2' }}
                    />
                    <span className="font-semibold text-gray-900 text-xs">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between w-full">
                  <span className="text-[10px] text-gray-400 font-medium">Multiplier:</span>
                  <span className="text-sm font-bold text-blue-600 font-mono">{opt.current_mult}x</span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${opt.percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {event.status === 'open' ? (
          <form id="bet-placement-form" onSubmit={handleSubmitBet} className="space-y-4 border-t border-gray-50 pt-4">
            {/* Input & Quick Selects */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-gray-700">Enter GP Value</label>
                <span className="text-gray-400 font-medium">
                  Balance:{' '}
                  <span className="text-gray-900 font-bold font-mono">
                    {user.gp_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} GP
                  </span>
                </span>
              </div>
              <div className="relative">
                <input
                  id="bet-amount-input"
                  type="number"
                  min="1"
                  step="1"
                  value={betAmount || ''}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  className="w-full pl-3 pr-14 py-2.5 font-mono text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0 GP"
                  required
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-gray-400 font-mono">GP</span>
              </div>

              {/* Quick selectors */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    id={`btn-quick-gp-${amt}`}
                    type="button"
                    onClick={() => handleQuickSelect(amt)}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-100/60 rounded-lg text-[11px] font-bold text-gray-600 transition-colors"
                  >
                    +{amt} GP
                  </button>
                ))}
                <button
                  id="btn-quick-gp-max"
                  type="button"
                  onClick={() => handleQuickSelect('max')}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-100/50 rounded-lg text-[11px] font-bold text-blue-700 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Potential Win Visualizer */}
            {selectedOption && betAmount > 0 && (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs">
                <div className="text-emerald-800">
                  <span className="font-semibold">Selected:</span> {selectedOption.label} ·{' '}
                  <span className="font-bold underline">{selectedOption.current_mult}x</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase leading-none">Est. Payout</p>
                  <p className="text-sm font-bold text-emerald-700 font-mono mt-1">
                    +{(betAmount * selectedOption.current_mult).toFixed(1)} GP
                  </p>
                </div>
              </div>
            )}

            {/* Error & Success Feedback banners */}
            {errorMsg && (
              <div id="bet-error bg" className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div id="bet-success border" className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-submit-prediction"
              type="submit"
              disabled={isPlacing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              <Coins className="h-4 w-4" />
              <span>{isPlacing ? 'Processing Prediction...' : 'Place Prediction'}</span>
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-500 border border-gray-100">
            <p className="font-semibold">🔮 Prediction Closed</p>
            <p className="mt-1">This event is currently checking results or has been settled by the admin.</p>
          </div>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3.5 shadow-3xs">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
          <History className="h-4 w-4 text-gray-400" />
          <span>PredictWin Live Activity Tracker</span>
        </h3>
        <div className="space-y-2.5">
          {mockActivity.map((act, index) => (
            <div key={index} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center font-bold font-mono text-gray-600">
                  {act.name[0]}
                </div>
                <div>
                  <span className="font-bold text-gray-800">@{act.name}</span>{' '}
                  <span className="text-gray-400">{act.action}</span>{' '}
                  <span className="font-semibold text-gray-700">{act.label}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-mono text-emerald-600 font-bold">{act.sum}</span>
                <span className="text-[9px] text-gray-300">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
