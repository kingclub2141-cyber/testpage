/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Category,
  Event,
  EventOption,
  Bet,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  SupportTicket,
  SiteSettings,
} from './types';
import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
  INITIAL_EVENTS,
  INITIAL_OPTIONS,
  INITIAL_SETTINGS,
} from './data';
import HomeView from './components/HomeView';
import EventDetailView from './components/EventDetailView';
import PortfolioView from './components/PortfolioView';
import WalletView from './components/WalletView';
import ProfileView from './components/ProfileView';
import SupportView from './components/SupportView';
import AdminView from './components/AdminView';
import { Info, Smartphone, Globe, MessageCircle, Settings, ShieldAlert } from 'lucide-react';

export default function App() {
  // Navigation & View controllers
  const [activeTab, setActiveTab] = useState<'home' | 'mine' | 'wallet' | 'support' | 'profile' | 'admin'>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Core Entity States
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('pw_user');
    return raw ? JSON.parse(raw) : INITIAL_USER;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = localStorage.getItem('pw_categories');
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const raw = localStorage.getItem('pw_events');
    return raw ? JSON.parse(raw) : INITIAL_EVENTS;
  });

  const [options, setOptions] = useState<EventOption[]>(() => {
    const raw = localStorage.getItem('pw_options');
    return raw ? JSON.parse(raw) : INITIAL_OPTIONS;
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const raw = localStorage.getItem('pw_bets');
    return raw ? JSON.parse(raw) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const raw = localStorage.getItem('pw_transactions');
    return raw ? JSON.parse(raw) : [];
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const raw = localStorage.getItem('pw_deposit_requests');
    return raw ? JSON.parse(raw) : [];
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const raw = localStorage.getItem('pw_withdrawal_requests');
    return raw ? JSON.parse(raw) : [];
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const raw = localStorage.getItem('pw_support_tickets');
    return raw ? JSON.parse(raw) : [];
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const raw = localStorage.getItem('pw_settings');
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const raw = localStorage.getItem('pw_bookmarks');
    return raw ? JSON.parse(raw) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const raw = localStorage.getItem('pw_users_list');
    if (raw) return JSON.parse(raw);
    return [
      INITIAL_USER,
      {
        id: 'usr-ronaldo',
        username: 'Ronaldo7',
        email: 'cr7_fan@predictwin.app',
        gp_balance: 500,
        bonus_claimed: true,
        refer_code: 'RONALDO7',
        referred_by: 'usr-king', // Referred by Kingclub
        total_earned: 0,
        pending_earn: 0,
        claimed_earn: 0,
        referral_tier: 'bronze',
        display_size: 'compact',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Live Simulated Rates
  const [btcPrice, setBtcPrice] = useState(98450.25);

  // Persist State Changes back to local cache
  useEffect(() => {
    localStorage.setItem('pw_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pw_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pw_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('pw_options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('pw_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('pw_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pw_deposit_requests', JSON.stringify(depositRequests));
  }, [depositRequests]);

  useEffect(() => {
    localStorage.setItem('pw_withdrawal_requests', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('pw_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('pw_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pw_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('pw_users_list', JSON.stringify(users));
  }, [users]);

  // Simulated live prices updating
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.49) * 35; // Slight upward trend simulator
        return prev + delta;
      });
    }, 4000);
    return () => clearInterval(priceInterval);
  }, []);

  // Live Countdown & Automated Settle loops for BTC 5-Min cycle
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      let changed = false;
      const nextEvents = events.map((ev) => {
        if (ev.category_id === 'btc-5min' && ev.status === 'open') {
          const expirationMs = new Date(ev.end_time).getTime() - Date.now();
          if (expirationMs <= 0) {
            changed = true;
            // Cycle Ended! Handle automated settlement
            setTimeout(() => {
              autoResolveBtcEvent(ev.id);
            }, 50);
            return { ...ev, status: 'closed' as const };
          }
        }
        return ev;
      });

      if (changed) {
        setEvents(nextEvents);
      }
    }, 1000);

    return () => clearInterval(cycleInterval);
  }, [events, options, bets, users, user]);

  // Automated resolver for 5-Min BTC
  const autoResolveBtcEvent = (eventId: string) => {
    // 1. Randomly decide YES (Up) or NO (Down)
    const btcOpts = options.filter((o) => o.event_id === eventId);
    if (btcOpts.length < 2) return;
    const winningIndex = Math.random() > 0.5 ? 0 : 1;
    const winningOpt = btcOpts[winningIndex];

    settleEventCore(eventId, winningOpt.id);

    // 2. Draft standard new round cycle starting immediately
    const nextRoundId = `ev-btc-${Date.now()}`;
    const roundDurationMins = 5;
    const nextEndTime = new Date(Date.now() + roundDurationMins * 60 * 1000).toISOString();

    const newEv: Event = {
      id: nextRoundId,
      category_id: 'btc-5min',
      title: `BTC Index Over/Under Cycle #${Math.floor(Date.now() / 10000) % 1000}`,
      slug: `btc-live-${Date.now()}`,
      description: 'Continuous 5-minute interval outcome prediction. Decide Green (Up) or Red (Down) depending on live feed updates.',
      thumbnail: '₿',
      event_type: 'yes_no',
      status: 'open',
      start_time: new Date().toISOString(),
      end_time: nextEndTime,
      is_live: true,
      is_featured: true,
      total_volume: 120,
      participants: 5,
      views: 12,
      sort_order: 0,
    };

    const newOpts: EventOption[] = [
      { id: `opt-${nextRoundId}-1`, event_id: nextRoundId, label: 'Green (Up)', color: '#4CAF50', initial_mult: 1.90, current_mult: 1.90, total_bet_gp: 60, percentage: 50 },
      { id: `opt-${nextRoundId}-2`, event_id: nextRoundId, label: 'Red (Down)', color: '#F44336', initial_mult: 1.90, current_mult: 1.90, total_bet_gp: 60, percentage: 50 },
    ];

    setEvents((prev) => [newEv, ...prev]);
    setOptions((prev) => [...prev, ...newOpts]);
    if (selectedEventId === eventId) {
      setSelectedEventId(nextRoundId);
    }
  };

  // Shared Settle logic (called by Auto-BTC or manual operator actions)
  const settleEventCore = (eventId: string, winningOutcomeId: string) => {
    // Update Event status
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === eventId
          ? { ...e, status: 'settled' as const, result_option_id: winningOutcomeId }
          : e
      )
    );

    // Locate and resolve correspond bets
    setBets((prevBets) => {
      const updatedBets = prevBets.map((b) => {
        if (b.event_id === eventId && b.status === 'pending') {
          const isWinner = b.option_id === winningOutcomeId;
          const wonPayout = isWinner ? b.gp_amount * b.multiplier : 0;
          const updatedStatus = isWinner ? ('won' as const) : ('lost' as const);

          // Update corresponding user ledger
          adjustUserFundsAndCommissions(b.user_id, wonPayout, b.gp_amount, isWinner, b);

          return {
            ...b,
            status: updatedStatus,
            payout: wonPayout,
            settled_at: new Date().toISOString(),
          };
        }
        return b;
      });
      return updatedBets;
    });
  };

  // Adjust balance, record wins/losses transactions, and apply multi-tier referral overrides
  const adjustUserFundsAndCommissions = (
    userId: string,
    payoutSum: number,
    wagerSum: number,
    isWinner: boolean,
    betDetails: Bet
  ) => {
    // Locate specific profile in our listings
    setUsers((prevUsers) => {
      return prevUsers.map((u) => {
        if (u.id === userId) {
          let updatedBal = u.gp_balance;
          if (isWinner) {
            updatedBal += payoutSum;
            // Record win transaction
            recordTx(
              userId,
              'win',
              payoutSum,
              u.gp_balance,
              updatedBal,
              betDetails.id,
              `Won Prediction on ${betDetails.event_title}`
            );
          } else {
            // Bet loses, balance remains deducted from initial wagering
            recordTx(
              userId,
              'bet',
              wagerSum,
              u.gp_balance,
              u.gp_balance, // Already deducted
              betDetails.id,
              `Prediction Resolved Lost: ${betDetails.event_title}`
            );
          }

          // Trigger referral commissions (Only if winning payouts occur)
          if (isWinner && payoutSum > 0 && u.referred_by) {
            const commissionSum = payoutSum * (settings.commission_pct / 100);
            applyCommissionToReferrer(u.referred_by, commissionSum, u.username, betDetails.id);
          }

          const nextUser = { ...u, gp_balance: updatedBal };
          if (userId === user.id) {
            setUser(nextUser);
          }
          return nextUser;
        }
        return u;
      });
    });
  };

  // Apply commissions to referrer user
  const applyCommissionToReferrer = (
    referrerUserId: string,
    commissionGp: number,
    fromUsername: string,
    betId: string
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === referrerUserId) {
          const updatedBal = u.gp_balance + commissionGp;
          const nextEarnedTotal = u.total_earned + commissionGp;
          const nextPending = u.pending_earn + commissionGp;

          recordTx(
            referrerUserId,
            'commission',
            commissionGp,
            u.gp_balance,
            updatedBal,
            betId,
            `Commission earned from @${fromUsername} winning trade`
          );

          const updatedReferrer = {
            ...u,
            gp_balance: updatedBal,
            total_earned: nextEarnedTotal,
            pending_earn: nextPending,
          };

          if (referrerUserId === user.id) {
            setUser(updatedReferrer);
          }
          return updatedReferrer;
        }
        return u;
      })
    );
  };

  // Record standard Transaction Ledger
  const recordTx = (
    uId: string,
    type: Transaction['type'],
    amount: number,
    before: number,
    after: number,
    refId?: string,
    noteText = ''
  ) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: uId,
      type,
      gp_amount: amount,
      balance_before: before,
      balance_after: after,
      reference_id: refId,
      note: noteText,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // Handlers for placing bets
  const handlePlaceBet = (optionId: string, amount: number) => {
    if (user.status === 'banned') {
      return { success: false, message: 'Your account is banned. Operations forbidden.' };
    }

    const linkedOption = options.find((o) => o.id === optionId);
    const linkedEvent = events.find((e) => e.id === (linkedOption ? linkedOption.event_id : ''));

    if (!linkedOption || !linkedEvent) {
      return { success: false, message: 'Invalid outcome options selected.' };
    }
    if (linkedEvent.status !== 'open') {
      return { success: false, message: 'Target market prediction closed.' };
    }
    if (user.gp_balance < amount) {
      return { success: false, message: 'Insufficient play funds balance size.' };
    }

    // 1. Process balance deduction
    const balanceBefore = user.gp_balance;
    const balanceAfter = user.gp_balance - amount;

    const nextUser = { ...user, gp_balance: balanceAfter };
    setUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? nextUser : u)));

    // 2. Record index bet
    const betId = `bet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newBet: Bet = {
      id: betId,
      user_id: user.id,
      event_id: linkedEvent.id,
      event_title: linkedEvent.title,
      option_id: optionId,
      option_label: linkedOption.label,
      gp_amount: amount,
      multiplier: linkedOption.current_mult,
      potential_win: amount * linkedOption.current_mult,
      status: 'pending',
      payout: 0,
      created_at: new Date().toISOString(),
    };

    setBets((prev) => [newBet, ...prev]);

    // 3. Record Transactions ledgers
    recordTx(
      user.id,
      'bet',
      amount,
      balanceBefore,
      balanceAfter,
      betId,
      `Prediction Placed on: ${linkedOption.label} (${linkedOption.current_mult}x)`
    );

    // 4. Recalculate event pool metrics (volume multiplier dynamics)
    setOptions((prevOpts) => {
      const nextOpts = prevOpts.map((o) => {
        if (o.event_id === linkedEvent.id) {
          const isTarget = o.id === optionId;
          const optBetBefore = o.total_bet_gp;
          const optBetAfter = isTarget ? optBetBefore + amount : optBetBefore;
          return { ...o, total_bet_gp: optBetAfter };
        }
        return o;
      });

      // Compute revised percentage multipliers
      const eventSum = nextOpts
        .filter((o) => o.event_id === linkedEvent.id)
        .reduce((sum, o) => sum + o.total_bet_gp, 0);

      return nextOpts.map((o) => {
        if (o.event_id === linkedEvent.id) {
          const pct = eventSum > 0 ? (o.total_bet_gp / eventSum) * 100 : 50;
          // Dynamically adjust multipliers depending on crowdsourced backing pool
          let mult = o.initial_mult;
          if (pct > 0) {
            // More support = smaller multiplier, less support = high multipliers
            mult = parseFloat(Math.max(1.15, (0.95 / (pct / 100))).toFixed(2));
          }
          return { ...o, percentage: pct, current_mult: mult };
        }
        return o;
      });
    });

    // 5. Increment event participants Views & Volume counters
    setEvents((prevEvs) =>
      prevEvs.map((e) =>
        e.id === linkedEvent.id
          ? {
              ...e,
              total_volume: parseFloat((e.total_volume + amount).toFixed(1)),
              participants: e.participants + 1,
            }
          : e
      )
    );

    return { success: true, message: 'Prediction successfully locked!' };
  };

  // Claim Starter Bonus
  const handleClaimBonus = () => {
    if (user.bonus_claimed) {
      return { success: false, message: 'Bonus points already claimed check holdings.' };
    }

    const previousBal = user.gp_balance;
    const nextBal = previousBal + settings.signup_bonus_gp;

    const nextUser = { ...user, gp_balance: nextBal, bonus_claimed: true };
    setUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? nextUser : u)));

    recordTx(user.id, 'bonus', settings.signup_bonus_gp, previousBal, nextBal, undefined, 'Signup bonus play funds');

    return { success: true, message: `Congrats! ${settings.signup_bonus_gp} GP Play Points added to wallet.` };
  };

  // Dynamic layout font size change handler
  const handleUpdateDisplaySize = (size: 'compact' | 'medium' | 'bold' | 'prominent') => {
    const nextUser = { ...user, display_size: size };
    setUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? nextUser : u)));
  };

  // Claim Referral accumulation earnings
  const handleClaimCommission = () => {
    if (user.pending_earn < 100) {
      return { success: false, message: 'Referral commission requires minimum 100 GP block size to claim.' };
    }

    const claimAmt = user.pending_earn;
    const previousBal = user.gp_balance;
    const nextBal = previousBal + claimAmt;

    const nextUser = {
      ...user,
      gp_balance: nextBal,
      pending_earn: 0,
      claimed_earn: user.claimed_earn + claimAmt,
    };

    setUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? nextUser : u)));

    recordTx(user.id, 'commission', claimAmt, previousBal, nextBal, undefined, 'Wrote claimed referral commission');

    return { success: true, message: `Commission claimed! +${claimAmt.toFixed(1)} GP added to wallet balance.` };
  };

  // Submit UPI Deposit Request
  const handleSubmitDeposit = (amount: number, method: string, utr: string) => {
    const newReq: DepositRequest = {
      id: `dep-${Date.now()}`,
      user_id: user.id,
      username: user.username,
      gp_amount: amount,
      payment_method: method,
      utr_number: utr,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setDepositRequests((prev) => [newReq, ...prev]);
  };

  // Submit Withdrawal request
  const handleSubmitWithdrawal = (amount: number, method: 'bank' | 'upi' | 'usdt', accountDetails: string) => {
    if (amount > user.gp_balance) {
      return { success: false, message: 'Insufficient play funds balance sizes.' };
    }

    const previousBal = user.gp_balance;
    const nextBal = previousBal - amount;

    // Deduct immediate ledger
    const nextUser = { ...user, gp_balance: nextBal };
    setUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? nextUser : u)));

    recordTx(
      user.id,
      'withdrawal',
      amount,
      previousBal,
      nextBal,
      undefined,
      `Deducted Withdrawal Request: via ${method.toUpperCase()}`
    );

    const newReq: WithdrawalRequest = {
      id: `wit-${Date.now()}`,
      user_id: user.id,
      username: user.username,
      gp_amount: amount,
      method,
      account_details: accountDetails,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setWithdrawalRequests((prev) => [newReq, ...prev]);
    return { success: true, message: 'Withdrawal payout logged! Review queue for confirmation details.' };
  };

  // Submit Support ticket Form
  const handleSubmitSupportTicket = (telegram: string, whatsapp: string) => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      username: user.username,
      telegram,
      whatsapp,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
  };

  // OPERATOR - Create custom category
  const handleAddCategory = (name: string, icon: string, color: string) => {
    const nextCat: Category = {
      id: name.toLowerCase().trim().replace(/[^a-z0-0]/g, '-'),
      name,
      slug: name.toLowerCase().trim().replace(/[^a-z0-0]/g, '-'),
      icon,
      color,
      sort_order: categories.length + 1,
      is_live: false,
    };
    setCategories((prev) => [...prev, nextCat]);
  };

  // OPERATOR - Adding manual Event
  const handleAddEvent = (
    eventData: Partial<Event>,
    optionsData: { label: string; color: string; initial_mult: number }[]
  ) => {
    const eventId = `ev-admin-${Date.now()}`;
    const nextEv: Event = {
      id: eventId,
      category_id: eventData.category_id || 'others',
      title: eventData.title || 'Contest',
      slug: eventData.slug || `contest-${Date.now()}`,
      description: eventData.description || 'Global opinion market prediction',
      thumbnail: eventData.thumbnail || '🎯',
      event_type: eventData.event_type || 'yes_no',
      status: 'open',
      start_time: new Date().toISOString(),
      end_time: eventData.end_time || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      is_live: eventData.is_live || false,
      is_featured: eventData.is_featured || false,
      total_volume: 0,
      participants: 0,
      views: 1,
      sort_order: events.length + 1,
    };

    const nextOpts: EventOption[] = optionsData.map((o, idx) => ({
      id: `opt-${eventId}-${idx}`,
      event_id: eventId,
      label: o.label,
      color: o.color,
      initial_mult: o.initial_mult,
      current_mult: o.initial_mult,
      total_bet_gp: 0,
      percentage: 100 / optionsData.length,
    }));

    setEvents((prev) => [nextEv, ...prev]);
    setOptions((prev) => [...prev, ...nextOpts]);
  };

  // OPERATOR - Deleting an event manual
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setOptions((prev) => prev.filter((o) => o.event_id !== eventId));
    setBets((prev) => prev.filter((b) => b.event_id !== eventId));
  };

  // OPERATOR - Approve Deposit requests
  const handleApproveDeposit = (depositId: string) => {
    setDepositRequests((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'approved' as const, reviewed_at: new Date().toISOString() } : d))
    );

    const req = depositRequests.find((d) => d.id === depositId);
    if (!req) return;

    // Credit user GP balance
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === req.user_id) {
          const previousBal = u.gp_balance;
          const nextBal = previousBal + req.gp_amount;

          recordTx(
            req.user_id,
            'deposit',
            req.gp_amount,
            previousBal,
            nextBal,
            req.id,
            'Bank Deposit Gateway confirmed'
          );

          const updatedUser = { ...u, gp_balance: nextBal };
          if (u.id === user.id) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  // OPERATOR - Reject Deposit requests
  const handleRejectDeposit = (depositId: string) => {
    setDepositRequests((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'rejected' as const, reviewed_at: new Date().toISOString() } : d))
    );
  };

  // OPERATOR - Approve withdrawal transfers
  const handleApproveWithdrawal = (withdrawalId: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'approved' as const, reviewed_at: new Date().toISOString() } : w))
    );
  };

  // OPERATOR - Reject/Decline payout requests
  const handleRejectWithdrawal = (withdrawalId: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'rejected' as const, reviewed_at: new Date().toISOString() } : w))
    );

    const req = withdrawalRequests.find((w) => w.id === withdrawalId);
    if (!req) return;

    // Refund deducted funds
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === req.user_id) {
          const previousBal = u.gp_balance;
          const nextBal = previousBal + req.gp_amount;

          recordTx(
            req.user_id,
            'refund',
            req.gp_amount,
            previousBal,
            nextBal,
            req.id,
            'Refunded denied payout withdrawal'
          );

          const updatedUser = { ...u, gp_balance: nextBal };
          if (u.id === user.id) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  // OPERATOR - Adjust manual balance sums
  const handleAdjustUserBalance = (userId: string, amount: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const previousBal = u.gp_balance;
          const nextBal = previousBal + amount;

          recordTx(
            userId,
            amount >= 0 ? 'deposit' : 'withdrawal',
            Math.abs(amount),
            previousBal,
            nextBal,
            undefined,
            'Manual operator system balance adjust adjustments'
          );

          const updatedUser = { ...u, gp_balance: nextBal };
          if (userId === user.id) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  // OPERATOR - Ban/Unban user status toggles
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? ('banned' as const) : ('active' as const);
          const updatedUser = { ...u, status: nextStatus };
          if (userId === user.id) {
            setUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  // Reset entire application data
  const handleResetApp = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setCategories(INITIAL_CATEGORIES);
    setEvents(INITIAL_EVENTS);
    setOptions(INITIAL_OPTIONS);
    setBets([]);
    setTransactions([]);
    setDepositRequests([]);
    setWithdrawalRequests([]);
    setSupportTickets([]);
    setSettings(INITIAL_SETTINGS);
    setBookmarks([]);
    setUsers([
      INITIAL_USER,
      {
        id: 'usr-ronaldo',
        username: 'Ronaldo7',
        email: 'cr7_fan@predictwin.app',
        gp_balance: 500,
        bonus_claimed: true,
        refer_code: 'RONALDO7',
        referred_by: 'usr-king',
        total_earned: 0,
        pending_earn: 0,
        claimed_earn: 0,
        referral_tier: 'bronze',
        display_size: 'compact',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ]);
    setSelectedEventId(null);
    setActiveTab('home');
  };

  // Bookmark toggler
  const handleToggleBookmark = (eventId: string) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(eventId);
      if (isBookmarked) {
        return prev.filter((id) => id !== eventId);
      }
      return [...prev, eventId];
    });
  };

  // Single event view selection
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    // Increment views local counter in event object
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, views: e.views + 1 } : e)));
  };

  // Filter display size font sizing adjustments
  const getSizingClass = () => {
    if (user.display_size === 'compact') return 'text-xs';
    if (user.display_size === 'medium') return 'text-sm';
    if (user.display_size === 'bold') return 'text-base font-medium';
    return 'text-lg font-semibold';
  };

  const referralUsersCount = users.filter((u) => u.referred_by === user.id).length;

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-start ${getSizingClass()}`}>
      <div className="w-full max-w-lg min-h-screen bg-white flex flex-col shadow-xs relative pb-24 border-x border-gray-100">
        
        {/* Top Navbar Title frame */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 pb-2.5 flex items-center justify-between shadow-3xs">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">🔮</span>
            <div>
              <span className="text-sm font-black text-gray-900 tracking-tight block">PredictWin</span>
              <span className="text-[9px] font-bold text-blue-600 tracking-wide block uppercase leading-none mt-0.5">
                {settings.site_tagline}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="top-nav-admin-toggle"
              onClick={() => {
                setActiveTab(activeTab === 'admin' ? 'home' : 'admin');
                setSelectedEventId(null);
              }}
              className={`p-2.5 rounded-full flex items-center gap-1 transition-all ${
                activeTab === 'admin'
                  ? 'bg-rose-100 text-rose-800 font-extrabold border-rose-200 border'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700'
              }`}
              title="Access Command Cabin"
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-[10px] font-bold leading-none hidden sm:inline">Operator</span>
            </button>
            <div className="bg-gray-50 border border-gray-100/50 px-3 py-2 rounded-full flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-700 font-mono">
                {user.gp_balance.toLocaleString(undefined, { maximumFractionDigits: 1 })} GP
              </span>
            </div>
          </div>
        </header>

        {/* Promo Code Top warning banner if user account is banned */}
        {user.status === 'banned' && (
          <div className="bg-rose-600 text-white text-center text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-sm font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>Operational Restricted: Account Banned! Contact support consult.</span>
          </div>
        )}

        {/* Primary View content body portals */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'admin' ? (
            <AdminView
              categories={categories}
              events={events}
              options={options}
              depositRequests={depositRequests}
              withdrawalRequests={withdrawalRequests}
              users={users}
              settings={settings}
              onAddCategory={handleAddCategory}
              onAddEvent={handleAddEvent}
              onSettleEvent={settleEventCore}
              onApproveDeposit={handleApproveDeposit}
              onRejectDeposit={handleRejectDeposit}
              onApproveWithdrawal={handleApproveWithdrawal}
              onRejectWithdrawal={handleRejectWithdrawal}
              onAdjustUserBalance={handleAdjustUserBalance}
              onToggleUserStatus={handleToggleUserStatus}
              onUpdateSettings={setSettings}
              onDeleteEvent={handleDeleteEvent}
            />
          ) : selectedEventId ? (
            (() => {
              const ev = events.find((e) => e.id === selectedEventId);
              if (ev) {
                return (
                  <EventDetailView
                    event={ev}
                    options={options}
                    user={user}
                    onPlaceBet={handlePlaceBet}
                    onBack={() => setSelectedEventId(null)}
                    btcPrice={btcPrice}
                  />
                );
              }
              setSelectedEventId(null);
              return null;
            })()
          ) : activeTab === 'home' ? (
            <HomeView
              categories={categories}
              events={events}
              options={options}
              bookmarks={bookmarks}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectEvent={handleSelectEvent}
              onToggleBookmark={handleToggleBookmark}
              btcPrice={btcPrice}
            />
          ) : activeTab === 'mine' ? (
            <PortfolioView bets={bets} user={user} onRefresh={() => {}} />
          ) : activeTab === 'wallet' ? (
            <WalletView
              user={user}
              transactions={transactions}
              settings={settings}
              depositRequests={depositRequests}
              withdrawalRequests={withdrawalRequests}
              onSubmitDeposit={handleSubmitDeposit}
              onSubmitWithdrawal={handleSubmitWithdrawal}
            />
          ) : activeTab === 'support' ? (
            <SupportView
              username={user.username}
              settings={settings}
              onSubmitTicket={handleSubmitSupportTicket}
              supportTickets={supportTickets}
            />
          ) : activeTab === 'profile' ? (
            <ProfileView
              user={user}
              settings={settings}
              referralCount={referralUsersCount}
              onClaimBonus={handleClaimBonus}
              onUpdateDisplaySize={handleUpdateDisplaySize}
              onClaimCommission={handleClaimCommission}
              onResetApp={handleResetApp}
            />
          ) : null}
        </main>

        {/* Dynamic Static Promo Footer instructions card */}
        <div className="bg-gray-50 border-t border-gray-150 p-4 text-center text-[10px] text-gray-500 font-medium">
          <p>© 2026 {settings.site_name} Limited • Prediction opinion simulator for sports indexes.</p>
          <p className="mt-1">Built to comply with clean, flat modern anti-slop guidelines. Not a real gambling app.</p>
        </div>

        {/* Fixed PWA style persistent Bottom Tabbar Navigation panel */}
        <footer className="fixed bottom-0 left-50 -translate-x-50 w-full max-w-lg bg-white border-t border-gray-150 py-1.5 flex justify-around items-center px-2 z-50 shadow-sm rounded-t-xl h-18">
          <button
            id="nav-tab-home"
            onClick={() => {
              setActiveTab('home');
              setSelectedCategory('all');
              setSelectedEventId(null);
            }}
            className={`flex flex-col items-center flex-1 py-1 transition-colors ${
              activeTab === 'home' && !selectedEventId ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-[9px] mt-0.5">Home</span>
          </button>

          <button
            id="nav-tab-mine"
            onClick={() => {
              setActiveTab('mine');
              setSelectedEventId(null);
            }}
            className={`flex flex-col items-center flex-1 py-1 transition-colors ${
              activeTab === 'mine' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'
            }`}
          >
            <span className="text-xl">💼</span>
            <span className="text-[9px] mt-0.5">Mine</span>
          </button>

          <button
            id="nav-tab-wallet"
            onClick={() => {
              setActiveTab('wallet');
              setSelectedEventId(null);
            }}
            className={`flex flex-col items-center flex-1 py-1 transition-colors ${
              activeTab === 'wallet' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'
            }`}
          >
            <span className="text-xl">💳</span>
            <span className="text-[9px] mt-0.5">Wallet</span>
          </button>

          <button
            id="nav-tab-support"
            onClick={() => {
              setActiveTab('support');
              setSelectedEventId(null);
            }}
            className={`flex flex-col items-center flex-1 py-1 transition-colors ${
              activeTab === 'support' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'
            }`}
          >
            <span className="text-xl">🎧</span>
            <span className="text-[9px] mt-0.5">Support</span>
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => {
              setActiveTab('profile');
              setSelectedEventId(null);
            }}
            className={`flex flex-col items-center flex-1 py-1 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-[9px] mt-0.5">Profile</span>
          </button>
        </footer>

      </div>
    </div>
  );
}
