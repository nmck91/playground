'use client';

import { useGameStore, useSaveStore } from '../../stores';
import Link from 'next/link';
import { NewsArticle, NewsArticleType, NewsImportance } from '@playground/football-director-engine';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function NewsPage() {
  const gameState = useGameStore((state) => state.gameState);
  const loading = useSaveStore((state) => state.isLoading);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-900 dark:text-dark-text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-600 dark:text-dark-text-secondary">No active game. Start a new game first.</div>
      </div>
    );
  }

  const getTypeIcon = (type: NewsArticleType): string => {
    switch (type) {
      case 'transfer':
        return '💰';
      case 'result':
        return '⚽';
      case 'milestone':
        return '🎯';
      case 'board':
        return '👔';
      case 'standings':
        return '📊';
      case 'development':
        return '📈';
      case 'general':
        return '📰';
      default:
        return '📰';
    }
  };

  const getTypeColor = (type: NewsArticleType): string => {
    switch (type) {
      case 'transfer':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400';
      case 'result':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'milestone':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'board':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'standings':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'development':
        return 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400';
      case 'general':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getImportanceBadge = (importance: NewsImportance): string => {
    switch (importance) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '⚪';
      default:
        return '';
    }
  };

  const handleMarkAllRead = () => {
    // TODO: Implement mark all as read functionality
    // Need to add action to update news feed read status
    console.log('Mark all as read - not yet implemented');
  };

  const unreadCount = gameState.newsFeed.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/more" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">News</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <div className="mb-6">
            <button
              onClick={handleMarkAllRead}
              className="bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              ✓ Mark All as Read
            </button>
          </div>
        )}

        {/* News Articles */}
        {gameState.newsFeed.length === 0 ? (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-dark-border-primary">
            <p className="text-gray-500 dark:text-dark-text-secondary text-lg">
              No news yet. Simulate some weeks to generate news!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gameState.newsFeed.map((article) => (
              <div
                key={article.id}
                className={`bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
                  article.read
                    ? 'border-gray-300 dark:border-gray-600'
                    : 'border-orange-500 dark:border-orange-600'
                } border border-gray-200 dark:border-dark-border-primary`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(article.type)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(article.type)}`}
                        >
                          {article.type.toUpperCase().replace('-', ' ')}
                        </span>
                        <span className="text-sm">{getImportanceBadge(article.importance)}</span>
                        {!article.read && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary">
                        {article.headline}
                      </h2>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500 dark:text-dark-text-secondary">
                    <div>Week {article.week}</div>
                    <div>Season {article.season}/{article.season + 1}</div>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-dark-text-secondary leading-relaxed whitespace-pre-line">
                  {article.body}
                </p>

                {(article.teams || article.players) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border-secondary flex gap-4 text-sm">
                    {article.teams && article.teams.length > 0 && (
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-tertiary">Teams: </span>
                        <span className="text-slate-900 dark:text-dark-text-primary font-medium">
                          {article.teams.join(', ')}
                        </span>
                      </div>
                    )}
                    {article.players && article.players.length > 0 && (
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-tertiary">Players: </span>
                        <span className="text-slate-900 dark:text-dark-text-primary font-medium">
                          {article.players.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
