/**
 * News Engine Factory
 *
 * Factory functions for creating NewsEngine instances.
 * Provides both production and test/mock instances.
 */

import { INewsEngine } from '../interfaces/news-engine.interface';
import { NewsEngine } from '../news-engine';
import {
  NewsArticle,
  MatchResult,
  LeagueTable,
  TransferListing,
  Player,
  Injury,
  PlayerContract,
  Achievement,
  BoardStatus,
  DevelopmentReport,
  CupResult,
  CupCompetition,
} from '../types';

/**
 * Create a production NewsEngine instance
 */
export function createNewsEngine(): INewsEngine {
  return new NewsEngine();
}

/**
 * Create a mock NewsEngine for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockNewsEngine(
  overrides?: Partial<INewsEngine>
): INewsEngine {
  const mockArticle: NewsArticle = {
    id: 'news-1',
    date: new Date('2024-01-01'),
    week: 1,
    season: 2024,
    type: 'general',
    headline: 'Test Headline',
    body: 'Test body content',
    importance: 'medium',
    read: false,
  };

  const mock: INewsEngine = {
    generateMatchNews: (_results: MatchResult[], _playerTeamName: string, _leagueTable: LeagueTable[], _week: number, _season: number): NewsArticle[] => [mockArticle],
    generateCupMatchNews: (_results: CupResult[], _playerTeamName: string, _cupCompetition: CupCompetition, _week: number, _season: number): NewsArticle[] => [mockArticle],
    generateTransferNews: (_listing: TransferListing, _buyerTeamName: string, _week: number, _season: number, _isSale?: boolean): NewsArticle => mockArticle,
    generateMilestoneNews: (_player: Player, _teamName: string, _week: number, _season: number): NewsArticle[] => [mockArticle],
    generateInjuryNews: (_player: Player, _injury: Injury, _teamName: string, _week: number, _season: number): NewsArticle => mockArticle,
    generateContractNews: (_player: Player, _contract: PlayerContract, _teamName: string, _week: number, _season: number, _newsType: 'signing' | 'renewal' | 'expiring'): NewsArticle => mockArticle,
    generateAchievementNews: (_achievement: Achievement, _week: number, _season: number): NewsArticle => mockArticle,
    generateBoardNews: (_boardStatus: BoardStatus, _teamName: string, _position: number, _week: number, _season: number): NewsArticle | null => mockArticle,
    generateStandingsNews: (_oldTable: LeagueTable[], _newTable: LeagueTable[], _week: number, _season: number): NewsArticle[] => [mockArticle],
    generateDevelopmentNews: (_reports: DevelopmentReport[], _teamName: string, _week: number, _season: number): NewsArticle[] => [mockArticle],
    generateYouthAcademyNews: (_newPlayers: Player[], _teamName: string, _week: number, _season: number): NewsArticle => mockArticle,
    generateWelcomeNews: (_teamName: string, _season: number): NewsArticle => mockArticle,
    generateSeasonEndNews: (_finalPosition: number, _teamName: string, _season: number, _leagueTable: LeagueTable): NewsArticle => mockArticle,
    generateRandomNews: (_week: number, _season: number): NewsArticle | null => mockArticle,
    pruneOldNews: (_newsFeed: NewsArticle[], _currentSeason: number): NewsArticle[] => [],
    ...overrides,
  };
  return mock;
}
