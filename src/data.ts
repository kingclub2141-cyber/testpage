/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Event, EventOption, SiteSettings, User } from './types';

export const INITIAL_SETTINGS: SiteSettings = {
  site_name: 'PredictWin',
  site_tagline: 'Predict. Win. Repeat.',
  signup_bonus_gp: 100,
  min_deposit_gp: 100,
  min_withdraw_gp: 500,
  commission_pct: 0.5,
  upi_id: 'predictwin@upi',
  telegram_link: 'https://t.me/predictwin_support',
  whatsapp_number: '+919999999999',
  referral_silver_refs: 5,
  referral_silver_gp: 2500,
  referral_gold_refs: 20,
  referral_gold_gp: 10000,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All', slug: 'all', icon: '🌐', color: '#4A90E2', sort_order: 0, is_live: false },
  { id: 'btc-5min', name: '5-Min BTC Live', slug: 'btc-5min', icon: '₿', color: '#F7931A', sort_order: 1, is_live: true },
  { id: 'fifa-world-cup-2026', name: 'World Cup 2026', slug: 'fifa-world-cup-2026', icon: '🏆', color: '#FFD700', sort_order: 2, is_live: false },
  { id: 'cricket', name: 'Cricket', slug: 'cricket', icon: '🏏', color: '#00C853', sort_order: 3, is_live: false },
  { id: 'soccer', name: 'Soccer', slug: 'soccer', icon: '⚽', color: '#2196F3', sort_order: 4, is_live: false },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', icon: '🎬', color: '#E91E63', sort_order: 5, is_live: false },
  { id: 'others', name: 'Others', slug: 'others', icon: '🎯', color: '#607D8B', sort_order: 6, is_live: false },
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev-1',
    category_id: 'soccer',
    title: 'Denmark vs. Ukraine',
    slug: 'denmark-vs-ukraine',
    description: 'An international friendly matchup between Denmark and Ukraine at Parken Stadium. Denmark comes as favorites but Ukraine has shown exceptional counter-attacks in recent qualifiers.',
    thumbnail: '⚽',
    event_type: 'match',
    status: 'open',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    is_live: false,
    is_featured: true,
    total_volume: 484.7,
    participants: 42,
    views: 124,
    sort_order: 1,
  },
  {
    id: 'ev-2',
    category_id: 'btc-5min',
    title: 'BTC Price Over/Under Interval Prediction',
    slug: 'btc-live-interval',
    description: 'Predict whether Bitcoin (BTC) price will end higher (Up) or lower (Down) at the end of the current 5-minute trading cycle based on live tick feeds.',
    thumbnail: '₿',
    event_type: 'yes_no',
    status: 'open',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Ticking countdown
    is_live: true,
    is_featured: true,
    total_volume: 12450.0,
    participants: 184,
    views: 1042,
    sort_order: 0,
  },
  {
    id: 'ev-3',
    category_id: 'cricket',
    title: 'Royal Challengers Bengaluru vs. Gujarat Titans',
    slug: 'rcb-vs-gt-t20',
    description: 'Indian T20 high-stakes league clash at the M. Chinnaswamy Stadium. High altitude and short boundaries promise a high-scoring cricket saga.',
    thumbnail: '🏏',
    event_type: 'match',
    status: 'open',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    is_live: false,
    is_featured: true,
    total_volume: 8219.0,
    participants: 298,
    views: 1250,
    sort_order: 2,
  },
  {
    id: 'ev-4',
    category_id: 'entertainment',
    title: 'Will Dhurandhar Box Office cross 2000 Crores?',
    slug: 'dhurandhar-box-office',
    description: 'The upcoming action thriller "Dhurandhar" starring superstar elite cast is projected to break records. Will it achieve global collections over 2000 Crore rupees?',
    thumbnail: '🎬',
    event_type: 'yes_no',
    status: 'open',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    is_live: false,
    is_featured: false,
    total_volume: 3120.0,
    participants: 94,
    views: 310,
    sort_order: 3,
  },
  {
    id: 'ev-5',
    category_id: 'fifa-world-cup-2026',
    title: 'Will USA qualify for Knockout Stages in FIFA 2026?',
    slug: 'usa-qualification-2026',
    description: 'Unified co-hosts USA are in an aggressive group phase. Will stellar home ground advantage propel them straight into the knockout Round of 32?',
    thumbnail: '🏆',
    event_type: 'yes_no',
    status: 'open',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    is_live: false,
    is_featured: false,
    total_volume: 18450.0,
    participants: 512,
    views: 2011,
    sort_order: 4,
  },
];

export const INITIAL_OPTIONS: EventOption[] = [
  // Options for ev-1 (Denmark vs Ukraine)
  { id: 'opt-1-1', event_id: 'ev-1', label: 'Denmark Win', color: '#4CAF50', initial_mult: 1.86, current_mult: 1.86, total_bet_gp: 261.7, percentage: 54 },
  { id: 'opt-1-2', event_id: 'ev-1', label: 'Draw', color: '#9E9E9E', initial_mult: 2.16, current_mult: 2.16, total_bet_gp: 135.0, percentage: 28 },
  { id: 'opt-1-3', event_id: 'ev-1', label: 'Ukraine Win', color: '#F44336', initial_mult: 2.74, current_mult: 2.74, total_bet_gp: 88.0, percentage: 18 },

  // Options for ev-2 (BTC Over/Under)
  { id: 'opt-2-1', event_id: 'ev-2', label: 'Green (Up)', color: '#4CAF50', initial_mult: 1.92, current_mult: 1.92, total_bet_gp: 6450.0, percentage: 51.8 },
  { id: 'opt-2-2', event_id: 'ev-2', label: 'Red (Down)', color: '#F44336', initial_mult: 1.88, current_mult: 1.88, total_bet_gp: 6000.0, percentage: 48.2 },

  // Options for ev-3 (RCB vs GT)
  { id: 'opt-3-1', event_id: 'ev-3', label: 'RCB Triumph', color: '#2196F3', initial_mult: 1.75, current_mult: 1.75, total_bet_gp: 5219.0, percentage: 63.5 },
  { id: 'opt-3-2', event_id: 'ev-3', label: 'GT Triumph', color: '#FF9800', initial_mult: 2.15, current_mult: 2.15, total_bet_gp: 3000.0, percentage: 36.5 },

  // Options for ev-4 (Dhurandhar box office)
  { id: 'opt-4-1', event_id: 'ev-4', label: 'YES (Crosses 2000C)', color: '#2196F3', initial_mult: 2.40, current_mult: 2.40, total_bet_gp: 1120.0, percentage: 35.8 },
  { id: 'opt-4-2', event_id: 'ev-4', label: 'NO (Under 2000C)', color: '#F44336', initial_mult: 1.50, current_mult: 1.50, total_bet_gp: 2000.0, percentage: 64.2 },

  // Options for ev-5 (USA qualifiers)
  { id: 'opt-5-1', event_id: 'ev-5', label: 'USA Qualifies', color: '#4CAF50', initial_mult: 1.65, current_mult: 1.65, total_bet_gp: 12000.0, percentage: 65.0 },
  { id: 'opt-5-2', event_id: 'ev-5', label: 'Knocked Out', color: '#F44336', initial_mult: 2.20, current_mult: 2.20, total_bet_gp: 6450.0, percentage: 35.0 },
];

export const INITIAL_USER: User = {
  id: 'usr-king',
  username: 'Kingclub',
  email: 'kingclub@predictwin.app',
  gp_balance: 100, // Starts with 100 GP signup bonus (or can claim)
  bonus_claimed: false, // Let them claim the extra 100 GP!
  refer_code: 'XSHLABMW',
  referred_by: undefined,
  total_earned: 0,
  pending_earn: 0,
  claimed_earn: 0,
  referral_tier: 'bronze',
  display_size: 'compact',
  status: 'active',
  created_at: new Date().toISOString(),
};
