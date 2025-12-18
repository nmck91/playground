/**
 * Football Director - News Ticker Widget
 * Dashboard widget showing recent news headlines
 */

'use client';

import { NewsArticle } from '@playground/football-director-engine';

interface NewsTickerWidgetProps {
  news: NewsArticle[];
  onNewsClick: () => void;
}

export function NewsTickerWidget({ news, onNewsClick }: NewsTickerWidgetProps) {
  const recentNews = news.slice(0, 3);

  if (recentNews.length === 0) {
    return null;
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'result':
        return '⚽';
      case 'transfer':
        return '💰';
      case 'milestone':
        return '🎖️';
      case 'board':
        return '📋';
      case 'standings':
        return '📊';
      case 'development':
        return '📈';
      default:
        return '📰';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          📰 Latest News
        </h2>
        <button
          onClick={onNewsClick}
          className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-normal"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {recentNews.map((article) => (
          <div
            key={article.id}
            className={`p-4 rounded-lg border-2 transition-normal hover:shadow-sm cursor-pointer ${getImportanceColor(article.importance)} ${!article.read ? 'font-semibold' : ''}`}
            onClick={onNewsClick}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{getTypeIcon(article.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500">Week {article.week}</span>
                  {!article.read && (
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm leading-snug">{article.headline}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
