/**
 * Football Director - News Feed Component
 * Modal displaying all news articles with filtering
 */

'use client';

import { NewsArticle, NewsArticleType } from '@playground/football-director-engine';
import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface NewsFeedProps {
  news: NewsArticle[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export function NewsFeed({ news, isOpen, onClose, onMarkAllRead }: NewsFeedProps) {
  const [filterType, setFilterType] = useState<NewsArticleType | 'all'>('all');

  const filters: { value: NewsArticleType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📰' },
    { value: 'result', label: 'Results', icon: '⚽' },
    { value: 'transfer', label: 'Transfers', icon: '💰' },
    { value: 'milestone', label: 'Milestones', icon: '🎖️' },
    { value: 'board', label: 'Board', icon: '📋' },
    { value: 'standings', label: 'Standings', icon: '📊' },
    { value: 'development', label: 'Development', icon: '📈' },
  ];

  const filteredNews = news.filter(
    (article) => filterType === 'all' || article.type === filterType
  );

  const unreadCount = news.filter(article => !article.read).length;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'result':
        return 'bg-green-100 text-green-800';
      case 'transfer':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-800';
      case 'board':
        return 'bg-red-100 text-red-800';
      case 'standings':
        return 'bg-blue-100 text-blue-800';
      case 'development':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📰 News Feed">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">{unreadCount}</span> unread articles
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-normal"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-normal flex items-center gap-2 ${
                filterType === filter.value
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNews.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">📰</div>
              <p>No news articles yet</p>
              <p className="text-sm mt-2">Play through the season to see news updates!</p>
            </div>
          )}

          {filteredNews.map((article) => (
            <div
              key={article.id}
              className={`bg-white rounded-lg p-4 border-l-4 shadow-sm ${getImportanceColor(article.importance)} ${!article.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(article.type)}`}>
                    {article.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    Season {article.season}, Week {article.week}
                  </span>
                  {!article.read && (
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(article.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className={`text-base font-semibold mb-2 ${!article.read ? 'text-slate-900' : 'text-slate-700'}`}>
                {article.headline}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {article.body}
              </p>

              {/* Teams/Players involved */}
              {(article.teams || article.players) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {article.teams?.map((team, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {team}
                    </span>
                  ))}
                  {article.players?.map((player, idx) => (
                    <span key={idx} className="bg-teal-100 text-teal-700 px-2 py-1 rounded">
                      {player}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
