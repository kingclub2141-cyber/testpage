/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  gp_balance: number;
  bonus_claimed: boolean;
  refer_code: string;
  referred_by?: string;
  total_earned: number; // For referral commission
  pending_earn: number;
  claimed_earn: number;
  referral_tier: 'bronze' | 'silver' | 'gold';
  display_size: 'compact' | 'medium' | 'bold' | 'prominent';
  status: 'active' | 'banned';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
  is_live: boolean;
}

export interface EventOption {
  id: string;
  event_id: string;
  label: string;
  color: string;
  initial_mult: number;
  current_mult: number;
  total_bet_gp: number;
  percentage: number;
}

export interface Event {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string; // Dynamic colors or icons
  event_type: 'yes_no' | 'multi_outcome' | 'match';
  status: 'open' | 'closed' | 'settled' | 'cancelled';
  result_option_id?: string; // Winning option ID
  start_time: string;
  end_time: string;
  is_live: boolean;
  is_featured: boolean;
  total_volume: number;
  participants: number;
  views: number;
  sort_order: number;
}

export interface Bet {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  option_id: string;
  option_label: string;
  gp_amount: number;
  multiplier: number;
  potential_win: number;
  status: 'pending' | 'won' | 'lost' | 'refunded';
  settled_at?: string;
  payout: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund' | 'bonus' | 'commission';
  gp_amount: number;
  balance_before: number;
  balance_after: number;
  reference_id?: string;
  note: string;
  created_at: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  username: string;
  gp_amount: number;
  payment_method: string;
  utr_number: string;
  screenshot?: string; // Static or placeholder link
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  username: string;
  gp_amount: number;
  method: 'bank' | 'upi' | 'usdt';
  account_details: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

export interface SupportTicket {
  id: string;
  username: string;
  telegram?: string;
  whatsapp?: string;
  status: 'pending' | 'replied';
  created_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  signup_bonus_gp: number;
  min_deposit_gp: number;
  min_withdraw_gp: number;
  commission_pct: number;
  upi_id: string;
  telegram_link: string;
  whatsapp_number: string;
  referral_silver_refs: number;
  referral_silver_gp: number;
  referral_gold_refs: number;
  referral_gold_gp: number;
}
