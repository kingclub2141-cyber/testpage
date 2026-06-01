/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Transaction, DepositRequest, WithdrawalRequest, SiteSettings } from '../types';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Wallet, History, AlertCircle, CheckCircle2, QrCode, UploadCloud } from 'lucide-react';

interface WalletViewProps {
  user: User;
  transactions: Transaction[];
  settings: SiteSettings;
  depositRequests: DepositRequest[];
  withdrawalRequests: WithdrawalRequest[];
  onSubmitDeposit: (amount: number, method: string, utr: string, base64Image?: string) => void;
  onSubmitWithdrawal: (amount: number, method: 'bank' | 'upi' | 'usdt', accountDetails: string) => { success: boolean; message: string };
}

export default function WalletView({
  user,
  transactions,
  settings,
  depositRequests,
  withdrawalRequests,
  onSubmitDeposit,
  onSubmitWithdrawal,
}: WalletViewProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'none'>('none');
  const [depositAmount, setDepositAmount] = useState<number>(settings.min_deposit_gp);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');

  const [withdrawAmount, setWithdrawAmount] = useState<number>(settings.min_withdraw_gp);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'upi' | 'usdt'>('upi');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');

  // Handle fake payment receipt loading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    if (depositAmount < settings.min_deposit_gp) {
      setDepositError(`Minimum deposit size is ${settings.min_deposit_gp} GP.`);
      return;
    }
    if (!utrNumber.trim()) {
      setDepositError('Please enter a valid Reference / UTR transaction code.');
      return;
    }

    onSubmitDeposit(depositAmount, paymentMethod, utrNumber, uploadedBase64);
    setDepositSuccess('Deposit request submitted! Once approved by an administrator, GP play credits will reflect in your wallet.');
    setUtrNumber('');
    setUploadedFileName('');
    setUploadedBase64('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (withdrawAmount < settings.min_withdraw_gp) {
      setWithdrawError(`Minimum payout size is ${settings.min_withdraw_gp} GP.`);
      return;
    }
    if (withdrawAmount > user.gp_balance) {
      setWithdrawError('Insufficient balance to complete withdrawal.');
      return;
    }
    if (!accountDetails.trim()) {
      setWithdrawError('Account identifier details cannot be blank.');
      return;
    }

    const res = onSubmitWithdrawal(withdrawAmount, withdrawMethod, accountDetails);
    if (res.success) {
      setWithdrawSuccess(res.message);
      setAccountDetails('');
    } else {
      setWithdrawError(res.message);
    }
  };

  // Filter user's individual requests
  const myDeposits = depositRequests.filter((d) => d.user_id === user.id);
  const myWithdrawals = withdrawalRequests.filter((w) => w.user_id === user.id);

  return (
    <div id="wallet-view" className="space-y-4">
      {/* Wallet Balance Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Play balance</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Wallet className="h-5 w-5 text-gray-400" />
              <p className="text-3xl font-extrabold text-gray-900 font-mono">
                {user.gp_balance.toLocaleString(undefined, { minimumFractionDigits: 1 })}
              </p>
              <span className="text-xs font-bold text-gray-400 font-mono mt-2">GP</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Game Points
          </span>
        </div>

        {/* Deposit / Withdraw Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            id="btn-wallet-tab-deposit"
            onClick={() => {
              setActiveTab(activeTab === 'deposit' ? 'none' : 'deposit');
              setDepositError('');
              setDepositSuccess('');
            }}
            className={`py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
              activeTab === 'deposit'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-emerald-700'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>Deposit GP</span>
          </button>
          <button
            id="btn-wallet-tab-withdraw"
            onClick={() => {
              setActiveTab(activeTab === 'withdraw' ? 'none' : 'withdraw');
              setWithdrawError('');
              setWithdrawSuccess('');
            }}
            className={`py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 text-blue-700'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdraw GP</span>
          </button>
        </div>
      </div>

      {/* Interactive Deposit Section */}
      {activeTab === 'deposit' && (
        <div id="deposit-expansion-card" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4 transition-all">
          <h2 className="text-sm font-bold text-gray-900">Add Play Funds</h2>

          {/* UPI Static Showcase (authentic style, clean) */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 border-dashed space-y-3">
            <div className="flex gap-3 justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Merchant UPI Identifier</p>
                <p className="text-xs font-mono font-bold text-gray-900 mt-1 select-all">{settings.upi_id}</p>
                <p className="text-[10px] text-gray-400 mt-1">Copy UPI code above or scan the visual address.</p>
              </div>
              <div className="h-14 w-14 bg-white border border-gray-100 rounded-lg flex items-center justify-center shadow-3xs">
                <QrCode className="h-9 w-9 text-gray-800" />
              </div>
            </div>

            {/* Custom Interactive visual prompt instructions */}
            <div className="text-[10px] text-gray-500 bg-white p-2.5 rounded-lg border border-gray-100 space-y-1">
              <span className="font-bold text-gray-700">Steps to Crediting GP:</span>
              <ol className="list-decimal list-inside pl-1 space-y-0.5 text-gray-400">
                <li>Send funds via GPay, PhonePe or Binance to target UPI address.</li>
                <li>Write down or copy the 12-digit UTR block reference ID.</li>
                <li>Fill the details below to request administrator confirmation.</li>
              </ol>
            </div>
          </div>

          <form id="deposit-request-form" onSubmit={handleDepositSubmit} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">GP Deposit Sum</label>
                <span className="text-gray-400 text-[10px]">Min: {settings.min_deposit_gp} GP</span>
              </div>
              <input
                id="deposit-amount-input"
                type="number"
                min={settings.min_deposit_gp}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Method Gateway</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    paymentMethod === 'upi' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}
                >
                  🇮🇳 UPI App (GPAY, VPA)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('usdt')}
                  className={`py-2 rounded-lg text-xs font-bold border ${
                    paymentMethod === 'usdt' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}
                >
                  🪙 Cryptos (USDT TRC20)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">12-Digit Reference / UTR ID</label>
              <input
                id="deposit-utr-input"
                type="text"
                placeholder="Ex. 402921583291"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                required
              />
            </div>

            {/* Custom drag-drop upload simulation as per guidelines */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Screenshot proof (Optional)</label>
              <div className="border border-gray-150 border-dashed rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input
                  id="screenshot-uploader"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-[11px] text-gray-600 font-bold">
                  {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Select screenshot image file'}
                </p>
                <p className="text-[9px] text-gray-400">Supports PNG, JPG (Max 5MB)</p>
              </div>
            </div>

            {depositError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="font-medium">{depositError}</span>
              </div>
            )}

            {depositSuccess && (
              <div id="deposit-success" className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium">{depositSuccess}</span>
              </div>
            )}

            <button
              id="btn-confirm-deposit"
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Confirm Bank Deposit Requests
            </button>
          </form>
        </div>
      )}

      {/* Interactive Withdrawal Section */}
      {activeTab === 'withdraw' && (
        <div id="withdraw-expansion-card" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Request GP Withdrawal</h2>

          <form id="withdrawal-request-form" onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-gray-700">GP Withdraw Sum</label>
                <span className="text-gray-400 text-[10px]">
                  Min: <span className="font-mono">{settings.min_withdraw_gp} GP</span>
                </span>
              </div>
              <input
                id="withdraw-amount-input"
                type="number"
                min={settings.min_withdraw_gp}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transfer Pathway</label>
              <div className="grid grid-cols-3 gap-2">
                {(['upi', 'bank', 'usdt'] as const).map((method) => {
                  const isSel = withdrawMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setWithdrawMethod(method)}
                      className={`py-2 rounded-lg text-xs font-bold border uppercase ${
                        isSel ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account Details Verification</label>
              <textarea
                id="withdraw-account-details-textarea"
                rows={3}
                placeholder={
                  withdrawMethod === 'upi'
                    ? 'Enter UPI ID (e.g., alex123@okaxis)'
                    : withdrawMethod === 'bank'
                    ? 'Enter Bank Name, Account Holder Name, Account Number and IFSC Code'
                    : 'Enter USDT TRC-20 Wallet Address identifier'
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium text-gray-700"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                required
              />
            </div>

            {withdrawError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="font-medium">{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div id="withdraw-success" className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium">{withdrawSuccess}</span>
              </div>
            )}

            <button
              id="btn-confirm-withdrawal"
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Initiate Bank Payout Request
            </button>
          </form>
        </div>
      )}

      {/* Transactions History Header */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5 pt-1">
          <History className="h-4 w-4 text-gray-400" />
          <span>Wallet Activity & Pending Settlements</span>
        </h3>

        {/* Dynamic lists matching Deposit / Withdraw status records (very clean visual depth) */}
        {(myDeposits.length > 0 || myWithdrawals.length > 0) && (
          <div className="space-y-2">
            {myDeposits.map((dep) => (
              <div key={dep.id} className="bg-amber-50/40 border border-amber-100 rounded-lg p-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-900">Deposit Requested</span>
                  <p className="text-[10px] text-amber-700 mt-1 font-mono">UTR: {dep.utr_number}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-800 block font-mono">+{dep.gp_amount} GP</span>
                  <span className="text-[9px] font-bold text-yellow-600 uppercase border border-yellow-250 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {dep.status}
                  </span>
                </div>
              </div>
            ))}
            {myWithdrawals.map((wit) => (
              <div key={wit.id} className="bg-blue-50/30 border border-blue-100 rounded-lg p-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-900">Withdrawal Requested</span>
                  <p className="text-[10px] text-blue-700 mt-1 uppercase">Method: {wit.method}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-800 block font-mono">-{wit.gp_amount} GP</span>
                  <span className={`text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded mt-1 inline-block ${
                    wit.status === 'pending' ? 'text-yellow-600 border-yellow-250 bg-white' : 'text-emerald-600 border-emerald-250 bg-white'
                  }`}>
                    {wit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Base Transactions Log */}
        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl p-6 text-gray-400 text-xs shadow-3xs">
            No transactions found for the previous week.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isPlus = ['win', 'deposit', 'bonus', 'commission', 'refund'].includes(tx.type);
              return (
                <div key={tx.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-3xs flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold leading-none shrink-0 ${
                      isPlus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isPlus ? '+' : '-'}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-xs block leading-tight">{tx.note}</span>
                      <span className="text-[9px] text-gray-400 capitalize font-medium">{tx.type} · {new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs ${isPlus ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPlus ? '+' : '-'}{tx.gp_amount.toLocaleString(undefined, { minimumFractionDigits: 1 })} GP
                    </span>
                    <span className="text-[9px] text-gray-300 block mt-0.5 font-mono">Bal: {tx.balance_after.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
