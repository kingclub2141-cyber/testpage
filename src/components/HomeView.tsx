/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Category, Event, EventOption } from '../types';
import { Search, SlidersHorizontal, Bookmark, Clock, Users, Flame, Percent } from 'lucide-react';

interface HomeViewProps {
  categories: Category[];
  events: Event[];
  options: EventOption[];
  bookmarks: string[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onToggleBookmark: (eventId: string) => void;
  btcPrice: number;
}

export default function HomeView({
  categories,
  events,
  options,
  bookmarks,
  selectedCategory,
  setSelectedCategory,
  onSelectEvent,
  onToggleBookmark,
  btcPrice,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'views' | 'closing'>('volume');
  const [tick, setTick] = useState(0);

  // Re-render countdowns every second
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to format remaining time
  const formatTimeRemaining = (endTimeStr: string, isLiveBtc = false) => {
    const totalMs = new Date(endTimeStr).getTime() - Date.now();
    if (totalMs <= 0) {
      return isLiveBtc ? '00:00' : 'Closed';
    }

    const totalSecs = Math.floor(totalMs / 1000);
    if (isLiveBtc) {
      const minutes = Math.floor(totalSecs / 60);
      const seconds = totalSecs % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Filter & sort logic
  const filteredEvents = events
    .filter((event) => {
      // Category filter
      if (selectedCategory !== 'all' && event.category_id !== selectedCategory) {
        return false;
      }
      // Bookmarks filter
      if (showBookmarksOnly && !bookmarks.includes(event.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return b.total_volume - a.total_volume;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'closing') {
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      }
      return 0;
    });

  return (
    <div id="home-view" className="space-y-4">
      {/* Search & Sort Widgets */}
      <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search events (e.g. Denmark, BTC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          id="btn-sort-toggle"
          onClick={() => {
            const modes: ('volume' | 'views' | 'closing')[] = ['volume', 'views', 'closing'];
            const nextIndex = (modes.indexOf(sortBy) + 1) % modes.length;
            setSortBy(modes[nextIndex]);
          }}
          className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex items-center gap-1 text-xs"
          title={`Sorting by ${sortBy}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline capitalize font-medium">{sortBy}</span>
        </button>
        <button
          id="btn-bookmark-toggle"
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`p-2.5 rounded-lg transition-colors flex items-center gap-1 ${
            showBookmarksOnly ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          title="Show Bookmarked"
        >
          <Bookmark className={`h-4 w-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline text-xs font-medium">Bookmarks</span>
        </button>
      </div>

      {/* Category Tabs Scroll */}
      <div id="category-tabs" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id && !showBookmarksOnly;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowBookmarksOnly(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all scroll-ml-2 snap-start ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.is_live && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Featured Notification for Live Trading */}
      {selectedCategory === 'btc-5min' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-bounce">🪙</span>
            <div>
              <p className="font-semibold text-xs text-red-900 leading-none">Bitcoin (BTC) Live Feed</p>
              <p className="text-[11px] text-red-700 mt-1">Real-time simulator updates every few seconds.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-white text-gray-800 border border-red-200 px-2.5 py-1 rounded-md leading-none">
              ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div id="empty-state-home" className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <div className="h-12 w-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <p className="font-medium text-gray-900 text-sm">No predictions found</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Try adjusting your search criteria, clearing search keywords, or selecting another category.
          </p>
        </div>
      )}

      {/* Events Grid layout */}
      <div id="events-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event) => {
          const isFlipped = bookmarks.includes(event.id);
          const eventOpts = options.filter((o) => o.event_id === event.id);
          const isLtc = event.category_id === 'btc-5min';

          return (
            <div
              key={event.id}
              className={`group flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-100 transition-all hover:shadow-xs cursor-pointer ${
                event.status === 'open' ? '' : 'opacity-85'
              }`}
              onClick={() => onSelectEvent(event.id)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {event.thumbnail ? event.thumbnail : '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {categories.find((c) => c.id === event.category_id)?.name || 'Sports'}
                      </span>
                      {event.is_live && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-[9px] font-bold tracking-tight uppercase animate-pulse">
                          ● LIVE
                        </span>
                      )}
                      {event.status === 'closed' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-yellow-100 text-yellow-700 text-[9px] font-bold uppercase">
                          CLOSED
                        </span>
                      )}
                      {event.status === 'settled' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[9px] font-bold uppercase">
                          SETTLED
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-2 md:line-clamp-1 leading-snug">
                      {event.title}
                    </h3>
                  </div>
                </div>
                {/* Bookmark Action */}
                <button
                  id={`btn-bookmark-card-${event.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(event.id);
                  }}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isFlipped
                      ? 'border-amber-200 bg-amber-50 text-amber-500'
                      : 'border-gray-50 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isFlipped ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Options & Poll Stats (Anti-slop clean layout) */}
              <div className="my-4 space-y-2">
                {eventOpts.map((opt) => {
                  // Find color code
                  const isLeader = opt.percentage === Math.max(...eventOpts.map((o) => o.percentage));
                  const progressColor = isLeader ? 'bg-emerald-500' : 'bg-gray-300';

                  return (
                    <div key={opt.id} className="text-xs">
                      <div className="flex justify-between items-center py-0.5 text-gray-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: opt.color || '#4A90E2' }}
                          />
                          <span>{opt.label}</span>
                          <span className="text-gray-400 font-mono text-[10px]">· {opt.current_mult}x</span>
                        </div>
                        <span className="font-mono text-gray-900 font-semibold text-[11px]">
                          {opt.percentage.toFixed(0)}%
                        </span>
                      </div>
                      {/* Static Progress representation */}
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} rounded-full transition-all duration-300`}
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer Tickers */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] text-gray-400 font-medium">
                <div className="flex items-center gap-3.5">
                  <span className="flex items-center gap-1" title="Volume in Game Points">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-gray-600 font-semibold">{event.total_volume.toLocaleString()} GP</span>
                  </span>
                  <span className="flex items-center gap-1" title="Predictors Involved">
                    <Users className="h-3 w-3" />
                    <span>{event.participants} accounts</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeRemaining(event.end_time, isLtc)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
