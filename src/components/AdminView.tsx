/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Event,
  EventOption,
  Category,
  DepositRequest,
  WithdrawalRequest,
  User,
  SiteSettings,
} from '../types';
import {
  Plus,
  Coins,
  Settings,
  X,
  CreditCard,
  UserCheck,
  TrendingUp,
  Layout,
  AlertTriangle,
  Activity,
  Check,
  Trash,
} from 'lucide-react';

interface AdminViewProps {
  categories: Category[];
  events: Event[];
  options: EventOption[];
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  users: User[];
  settings: SiteSettings;
  onAddCategory: (name: string, icon: string, color: string) => void;
  onAddEvent: (eventData: Partial<Event>, optionsData: { label: string; color: string; initial_mult: number }[]) => void;
  onSettleEvent: (eventId: string, winningOptionId: string) => void;
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string) => void;
  onApproveWithdrawal: (withdrawalId: string) => void;
  onRejectWithdrawal: (withdrawalId: string) => void;
  onAdjustUserBalance: (userId: string, amount: number) => void;
  onToggleUserStatus: (userId: string) => void;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onDeleteEvent: (eventId: string) => void;
}

export default function AdminView({
  categories,
  events,
  options,
  depositRequests,
  withdrawalRequests,
  users,
  settings,
  onAddCategory,
  onAddEvent,
  onSettleEvent,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onAdjustUserBalance,
  onToggleUserStatus,
  onUpdateSettings,
  onDeleteEvent,
}: AdminViewProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'events' | 'finance' | 'users' | 'settings'>('stats');

  // Event Forms
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[1]?.id || 'others');
  const [newDesc, setNewDesc] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('⚽');
  const [newEventType, setNewEventType] = useState<'yes_no' | 'match' | 'multi_outcome'>('yes_no');
  const [newEndTime, setNewEndTime] = useState(new Date(Date.now() + 48 * 3600 * 1000).toISOString().substring(0, 16));
  const [newOptionsList, setNewOptionsList] = useState<{ label: string; color: string; multiplier: number }[]>([
    { label: 'YES', color: '#4CAF50', multiplier: 1.95 },
    { label: 'NO', color: '#F44336', multiplier: 1.85 },
  ]);

  // Settle form
  const [selectedEventToSettle, setSelectedEventToSettle] = useState('');
  const [winningOptionId, setWinningOptionId] = useState('');

  // Category addition
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('⚽');
  const [catColor, setCatColor] = useState('#2196F3');

  // Settings
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });

  // User Balance Adjust
  const [selectedUserForBalance, setSelectedUserForBalance] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);

  // Success Feedbacks
  const [successBanner, setSuccessBanner] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory(catName, catIcon, catColor);
    setSuccessBanner('Category added successfully!');
    setCatName('');
    setTimeout(() => setSuccessBanner(''), 2500);
  };

  const handleAddOptionItem = () => {
    setNewOptionsList([...newOptionsList, { label: `Outcome #${newOptionsList.length + 1}`, color: '#9E9E9E', multiplier: 2.0 }]);
  };

  const handleRemoveOptionItem = (index: number) => {
    const nextArr = [...newOptionsList];
    nextArr.splice(index, 1);
    setNewOptionsList(nextArr);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newOptionsList.length < 2) {
      alert('Event must have a title and at least 2 prospective outcomes.');
      return;
    }

    const eventParams: Partial<Event> = {
      category_id: newCategory,
      title: newTitle,
      slug: newTitle.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-'),
      description: newDesc,
      thumbnail: newThumbnail,
      event_type: newEventType,
      status: 'open',
      start_time: new Date().toISOString(),
      end_time: new Date(newEndTime).toISOString(),
      is_live: newCategory === 'btc-5min',
      is_featured: false,
    };

    const optParams = newOptionsList.map((o) => ({
      label: o.label,
      color: o.color,
      initial_mult: o.multiplier,
    }));

    onAddEvent(eventParams, optParams);
    setSuccessBanner('Event successfully drafted and opened for prediction betting!');
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setTimeout(() => setSuccessBanner(''), 2500);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventToSettle || !winningOptionId) return;

    onSettleEvent(selectedEventToSettle, winningOptionId);
    setSuccessBanner('Event successfully settled! Proportional GP play payouts issued to winning accounts.');
    setSelectedEventToSettle('');
    setWinningOptionId('');
    setTimeout(() => setSuccessBanner(''), 2500);
  };

  const handleUpdateSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSuccessBanner('Platform system parameters updated successfully!');
    setTimeout(() => setSuccessBanner(''), 2500);
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance || adjustAmount === 0) return;
    onAdjustUserBalance(selectedUserForBalance, adjustAmount);
    setSuccessBanner('User balance manually credited/adjusted successfully!');
    setSelectedUserForBalance('');
    setTimeout(() => setSuccessBanner(''), 2500);
  };

  const openEvents = events.filter((e) => e.status === 'open');
  const settleOptions = options.filter((o) => o.event_id === selectedEventToSettle);

  // Statistics calculation helpers
  const pendingDeposits = depositRequests.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');
  const sumGPVolume = events.reduce((acc, e) => acc + e.total_volume, 0);

  return (
    <div id="admin-view" className="space-y-4">
      {/* Admin Title Bar */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
          <Activity className="h-4 w-4" />
          <span>Operator Command Cabin</span>
        </h2>
        <p className="text-[11px] text-gray-400">
          Simulate owner mechanics—confirm UPI deposits, settle prediction matches, and manage local database settings.
        </p>
      </div>

      {successBanner && (
        <div id="admin-success" className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Operator Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-gray-100">
        {(['stats', 'events', 'finance', 'users', 'settings'] as const).map((tab) => {
          const isSel = activeAdminTab === tab;
          return (
            <button
              key={tab}
              id={`btn-admin-tab-${tab}`}
              onClick={() => setActiveAdminTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize transition-all ${
                isSel ? 'bg-blue-600 text-white shadow-3xs' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'stats' && 'Performance Info'}
              {tab === 'events' && 'Write Event'}
              {tab === 'finance' && `Finance Queue (${pendingDeposits.length + pendingWithdrawals.length})`}
              {tab === 'users' && 'Manage Users'}
              {tab === 'settings' && 'Platform Settings'}
            </button>
          );
        })}
      </div>

      {/* SUBVIEW 1: Stats & Visual Dashboards */}
      {activeAdminTab === 'stats' && (
        <div id="admin-stats-tab" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-3xs text-center">
              <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">GP Volume</span>
              <p className="text-base font-extrabold text-blue-600 font-mono mt-2">{sumGPVolume.toLocaleString()} GP</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-3xs text-center">
              <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">Open Matches</span>
              <p className="text-base font-extrabold text-gray-900 font-mono mt-2">{openEvents.length} Active</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-3xs text-center">
              <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">Pending Deposits</span>
              <p className="text-base font-extrabold text-amber-600 font-mono mt-2">{pendingDeposits.length} Requests</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-3xs text-center">
              <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">Accounts Listed</span>
              <p className="text-base font-extrabold text-gray-800 font-mono mt-2">{users.length} Users</p>
            </div>
          </div>

          {/* Quick Active Events Inspector */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Inspection Panel ({events.length})</span>
            </h3>
            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="pb-2">Thumbnail</th>
                    <th className="pb-2">Prediction Market</th>
                    <th className="pb-2">Vol (GP)</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                      <td className="py-2.5 text-base">{ev.thumbnail}</td>
                      <td className="py-2.5 text-gray-900 font-semibold">{ev.title}</td>
                      <td className="py-2.5 font-mono font-bold text-gray-650">{ev.total_volume}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          ev.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onDeleteEvent(ev.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Wipe this event from database"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Drafting Events & Managing Pools */}
      {activeAdminTab === 'events' && (
        <div id="admin-events-tab" className="space-y-4">
          {/* Create Category Modal-inline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <Layout className="h-4 w-4 text-blue-600" />
              <span>Register Custom Category</span>
            </h3>

            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  id="cat-name-input"
                  type="text"
                  placeholder="Category title (e.g. Olympics)"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  id="cat-icon-input"
                  type="text"
                  placeholder="Emoji Icon (🏅)"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg text-center"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>
              <button
                id="btn-cat-add-submit"
                type="submit"
                className="py-2 bg-gray-900 border border-gray-900 text-white rounded-lg text-xs font-bold"
              >
                Insert Channel
              </button>
            </form>
          </div>

          {/* Settle Events Terminal */}
          {openEvents.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>Declare Outcome Settlement</span>
              </h3>

              <form onSubmit={handleSettleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Select Open Market</label>
                    <select
                      id="settle-event-selector"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-205 rounded-xl font-medium outline-none text-gray-800"
                      value={selectedEventToSettle}
                      onChange={(e) => {
                        setSelectedEventToSettle(e.target.value);
                        setWinningOptionId('');
                      }}
                      required
                    >
                      <option value="">-- Choose active events --</option>
                      {openEvents.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEventToSettle && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Winning Resolution</label>
                      <select
                        id="settle-outcome-selector"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-205 rounded-xl font-medium outline-none text-gray-800"
                        value={winningOptionId}
                        onChange={(e) => setWinningOptionId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose correct option --</option>
                        {settleOptions.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label} (Initial mult: {o.initial_mult}x)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedEventToSettle && winningOptionId && (
                  <button
                    id="btn-confirm-settlement"
                    type="submit"
                    className="w-full py-2.5 bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-yellow-700 transition"
                  >
                    Confirm Correct Resolution & Distribute Payouts
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Add custom event Drafting */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-blue-600" />
              <span>Draft a New Trading Prediction</span>
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Market Question Headline</label>
                  <input
                    id="admin-new-title-input"
                    type="text"
                    placeholder="e.g. Will USA secure more than 10 gold medals?"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category Channel</label>
                  <select
                    id="admin-new-cat-select"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {categories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Icon (Emoji)</label>
                  <input
                    id="admin-new-thumb-input"
                    type="text"
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg text-center"
                    value={newThumbnail}
                    onChange={(e) => setNewThumbnail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Settling Countdown Deadline</label>
                  <input
                    id="admin-new-endtime-input"
                    type="datetime-local"
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg text-center"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Historical Contest Context / description</label>
                <textarea
                  id="admin-new-desc-textarea"
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg text-gray-700 font-medium"
                  placeholder="Explain baseline specifications or rules under which results are confirmed."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              {/* Dynamic options addition list */}
              <div className="border border-gray-50 bg-gray-50/20 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">Prospective Outcomes ({newOptionsList.length})</span>
                  <button
                    id="btn-admin-add-option-pill"
                    type="button"
                    onClick={handleAddOptionItem}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-150 rounded text-[10px] font-bold text-gray-700 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Option</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newOptionsList.map((o, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label (e.g. India Team)"
                        className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-gray-100 rounded focus:outline-none"
                        value={o.label}
                        onChange={(e) => {
                          const nextOptions = [...newOptionsList];
                          nextOptions[index].label = e.target.value;
                          setNewOptionsList(nextOptions);
                        }}
                        required
                      />
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          className="h-8 w-11 border-0 bg-transparent"
                          value={o.color}
                          onChange={(e) => {
                            const nextOptions = [...newOptionsList];
                            nextOptions[index].color = e.target.value;
                            setNewOptionsList(nextOptions);
                          }}
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Multiplier"
                          className="w-full px-2 py-1 text-xs bg-white border border-gray-100 rounded text-center font-mono font-bold"
                          value={o.multiplier}
                          onChange={(e) => {
                            const nextOptions = [...newOptionsList];
                            nextOptions[index].multiplier = parseFloat(e.target.value) || 1.0;
                            setNewOptionsList(nextOptions);
                          }}
                          required
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionItem(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          disabled={newOptionsList.length <= 2}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id="btn-admin-submit-new-market"
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform"
              >
                Draft Market Prediction Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Deposit / Withdrawal Requests Queue Management */}
      {activeAdminTab === 'finance' && (
        <div id="admin-finance-tab" className="space-y-4">
          {/* Deposit approval lists */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Pending Deposits Verification ({pendingDeposits.length})</span>
            </h3>

            {pendingDeposits.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center bg-gray-50/50 rounded-xl">
                No depositors awaiting bank verification.
              </p>
            ) : (
              <div className="space-y-3.5">
                {pendingDeposits.map((dep) => (
                  <div key={dep.id} className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">User: @{dep.username}</span>
                      <p className="text-[11px] text-gray-500 mt-1">Method ID: {dep.payment_method}</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-mono">Reference: <span className="font-bold underline text-emerald-800">{dep.utr_number}</span></p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-sm font-bold font-mono text-emerald-700">+{dep.gp_amount} GP</span>
                        <p className="text-[9px] text-gray-400">{new Date(dep.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          id={`btn-approve-deposit-${dep.id}`}
                          onClick={() => onApproveDeposit(dep.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Approve
                        </button>
                        <button
                          id={`btn-reject-deposit-${dep.id}`}
                          onClick={() => onRejectDeposit(dep.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal approval list */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-rose-500" />
              <span>Pending Withdrawals Queue ({pendingWithdrawals.length})</span>
            </h3>

            {pendingWithdrawals.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center bg-gray-50/50 rounded-xl">
                No withdrawals in pending status queue.
              </p>
            ) : (
              <div className="space-y-3.5">
                {pendingWithdrawals.map((wit) => (
                  <div key={wit.id} className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">User: @{wit.username}</span>
                      <p className="text-[11px] text-rose-800 font-bold mt-1 uppercase">Method: {wit.method}</p>
                      <p className="text-[11px] text-gray-500 mt-1 italic max-w-sm">Details: {wit.account_details}</p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-sm font-bold font-mono text-rose-600">-{wit.gp_amount} GP</span>
                        <p className="text-[9px] text-gray-400">{new Date(wit.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          id={`btn-approve-withdrawal-${wit.id}`}
                          onClick={() => onApproveWithdrawal(wit.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                        >
                          Complete Transfer
                        </button>
                        <button
                          id={`btn-reject-withdrawal-${wit.id}`}
                          onClick={() => onRejectWithdrawal(wit.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[10px] font-bold"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 4: User Accounts Command Grid */}
      {activeAdminTab === 'users' && (
        <div id="admin-users-tab" className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-blue-600" />
              <span>Adjust User Balances manually</span>
            </h3>

            <form onSubmit={handleAdjustBalanceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Account ID</label>
                <select
                  id="balance-adjust-user-selector"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none font-medium"
                  value={selectedUserForBalance}
                  onChange={(e) => setSelectedUserForBalance(e.target.value)}
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} (Bal: {u.gp_balance.toFixed(1)} GP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Amount GP (Negative to deduct)</label>
                <input
                  id="balance-adjust-amount-input"
                  type="number"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg font-mono focus:outline-none"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <button
                id="btn-confirm-balance-patch"
                type="submit"
                className="py-2.5 bg-gray-950 text-white rounded-lg text-xs font-bold hover:bg-black transition"
              >
                Alter Ledger balance
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-3.5">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Operator accounts listing</h3>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900 select-all">@{u.username}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Email address: {u.email}</p>
                    <p className="text-[10px] text-blue-600 mt-1 font-bold">Balance sum: {u.gp_balance.toFixed(2)} GP</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id={`btn-toggle-ban-${u.id}`}
                      onClick={() => onToggleUserStatus(u.id)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'active' ? 'Ban Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 5: Platform system configuration parameters */}
      {activeAdminTab === 'settings' && (
        <div id="admin-settings-tab" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-blue-600" />
            <span>Operational Parameter Set</span>
          </h3>

          <form onSubmit={handleUpdateSettingsSubmit} className="space-y-4 text-xs font-medium text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">VPA merchant gateway address (UPI ID)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none"
                  value={localSettings.upi_id}
                  onChange={(e) => setLocalSettings({ ...localSettings, upi_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">Signup Bonus default GP</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-mono"
                  value={localSettings.signup_bonus_gp}
                  onChange={(e) => setLocalSettings({ ...localSettings, signup_bonus_gp: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">Min deposit GP</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-mono"
                  value={localSettings.min_deposit_gp}
                  onChange={(e) => setLocalSettings({ ...localSettings, min_deposit_gp: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">Min withdraw GP</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-mono"
                  value={localSettings.min_withdraw_gp}
                  onChange={(e) => setLocalSettings({ ...localSettings, min_withdraw_gp: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">Telegram support Link</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none"
                  value={localSettings.telegram_link}
                  onChange={(e) => setLocalSettings({ ...localSettings, telegram_link: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-1.5 text-gray-500 font-semibold">WhatsApp support Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-mono"
                  value={localSettings.whatsapp_number}
                  onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              id="btn-admin-submit-all-settings"
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Update System Parameters
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
