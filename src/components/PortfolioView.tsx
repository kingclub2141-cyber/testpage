/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bet, User, Event } from '../types';
import { Briefcase, RefreshCw, Filter, TrendingUp, CheckSquare, XOctagon, Clock } from 'lucide-react';

interface PortfolioViewProps {
  bets: Bet[];
  user: User;
  onRefresh: () => void;
}

export default function PortfolioView({ bets, user, onRefresh }: PortfolioViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
    }, 400);
  };

  // Pending bets
  const pendingBets = bets.filter((b) => b.status === 'pending');
  // Won bets
  const wonBets = bets.filter((b) => b.status === 'won');
  // Lost bets
  const lostBets = bets.filter((b) => b.status === 'lost');

  // Math metrics from PHP spec
  const totalBetValue = pendingBets.reduce((acc, b) => acc + b.gp_amount, 0);
  const totalValue = user.gp_balance + totalBetValue;

  const totalWonPayout = wonBets.reduce((acc, b) => acc + b.payout, 0);
  const totalLostAmount = lostBets.reduce((acc, b) => acc + b.gp_amount, 0);
  const netEarnings = totalWonPayout - totalLostAmount;

  const unrealizedProfit = pendingBets.reduce((acc, b) => acc + (b.potential_win - b.gp_amount), 0);
  const settledProfit = wonBets.reduce((acc, b) => acc + (b.payout - b.gp_amount), 0) - totalLostAmount;

  // Filter bets list
  const filteredBets = bets.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div id="portfolio-view" className="space-y-4">
      {/* Portfolio Value Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Value (GP & Holdings)</span>
          <p className="text-3xl font-extrabold text-blue-600 font-mono mt-0.5">
            {totalValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-3.5 text-xs">
          <div>
            <p className="text-[9px] text-gray-400 font-semibold leading-none">Net profit / loss</p>
            <p className={`font-mono font-extrabold mt-1.5 ${netEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netEarnings >= 0 ? `+${netEarnings.toFixed(1)}` : `${netEarnings.toFixed(1)}`} GP
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-semibold leading-none">Unrealized profit</p>
            <p className="text-gray-800 font-mono font-bold mt-1.5">
              +{unrealizedProfit.toFixed(1)} GP
            </p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-semibold leading-none">Settled Profit</p>
            <p className={`font-mono font-bold mt-1.5 ${settledProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {settledProfit >= 0 ? `+${settledProfit.toFixed(1)}` : `${settledProfit.toFixed(1)}`} GP
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions & Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Prediction Portfolio ({filteredBets.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Status Select dropdown */}
          <select
            id="portfolio-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs bg-white border border-gray-100 rounded-lg py-1.5 px-2.5 text-gray-700 outline-none font-medium"
          >
            <option value="all">All Bets</option>
            <option value="pending">Pending</option>
            <option value="won">Won Only</option>
            <option value="lost">Lost Only</option>
          </select>

          <button
            id="btn-refresh-portfolio"
            onClick={handleRefresh}
            className="p-1.5 bg-white border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bets logs list */}
      {filteredBets.length === 0 ? (
        <div id="portfolio-empty" className="text-center py-16 bg-white border border-gray-100 rounded-2xl p-6 space-y-3 shadow-3xs">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="font-semibold text-gray-800 text-sm">No predictions recorded</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            You haven't placed any predictions matching the current filter category. Jump to 'Home' to start trading.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBets.map((bet) => {
            return (
              <div
                key={bet.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs flex flex-col justify-between"
              >
                {/* Bet Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs lines-clamp-1 leading-snug">
                      {bet.event_title}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      Predicted: <span className="text-blue-600 underline font-bold">{bet.option_label}</span> ·{' '}
                      <span className="font-mono">{bet.multiplier}x</span>
                    </p>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {bet.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 text-[9px] font-bold">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Pending</span>
                      </span>
                    )}
                    {bet.status === 'won' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold">
                        <CheckSquare className="w-2.5 h-2.5" />
                        <span>Won</span>
                      </span>
                    )}
                    {bet.status === 'lost' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold">
                        <XOctagon className="w-2.5 h-2.5" />
                        <span>Lost</span>
                      </span>
                    )}
                    {bet.status === 'refunded' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold">
                        <span>Refunded</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bet telemetry metrics */}
                <div className="flex justify-between items-center border-t border-gray-50 mt-3 pt-3 text-[11px] text-gray-500">
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold block leading-none">Prediction Bet</span>
                    <span className="font-mono font-bold text-gray-800 mt-1 block">
                      {bet.gp_amount.toLocaleString()} GP
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 font-semibold block leading-none">Potential Payout</span>
                    <span className="font-mono font-bold text-gray-900 mt-1 block">
                      {bet.potential_win.toLocaleString()} GP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 font-semibold block leading-none">Resolved Payout</span>
                    <span className={`font-mono font-extrabold mt-1 block ${bet.status === 'won' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {bet.status === 'won' ? `+${bet.payout.toLocaleString()} GP` : `${bet.payout.toLocaleString()} GP`}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[8px] text-gray-300 mt-2 font-mono">
                  Tx-ID: {bet.id} · {new Date(bet.created_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
