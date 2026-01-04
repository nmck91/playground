/**
 * News Engine Interface
 *
 * Defines the contract for generating game news articles.
 */

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
} from '../types';

export interface INewsEngine {
  // Match-related news
  generateMatchNews(
    results: MatchResult[],
    playerTeamName: string,
    leagueTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[];

  // Transfer news
  generateTransferNews(
    listing: TransferListing,
    buyerTeamName: string,
    week: number,
    season: number,
    isSale?: boolean
  ): NewsArticle;

  // Player milestone news
  generateMilestoneNews(
    player: Player,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[];

  // Injury news
  generateInjuryNews(
    player: Player,
    injury: Injury,
    teamName: string,
    week: number,
    season: number
  ): NewsArticle;

  // Contract news
  generateContractNews(
    player: Player,
    contract: PlayerContract,
    teamName: string,
    week: number,
    season: number,
    newsType: 'signing' | 'renewal' | 'expiring'
  ): NewsArticle;

  // Achievement news
  generateAchievementNews(
    achievement: Achievement,
    week: number,
    season: number
  ): NewsArticle;

  // Board status news
  generateBoardNews(
    boardStatus: BoardStatus,
    teamName: string,
    position: number,
    week: number,
    season: number
  ): NewsArticle | null;

  // League standings news
  generateStandingsNews(
    oldTable: LeagueTable[],
    newTable: LeagueTable[],
    week: number,
    season: number
  ): NewsArticle[];

  // Player development news
  generateDevelopmentNews(
    reports: DevelopmentReport[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle[];

  // Youth academy news
  generateYouthAcademyNews(
    newPlayers: Player[],
    teamName: string,
    week: number,
    season: number
  ): NewsArticle;

  // Season start/end news
  generateWelcomeNews(teamName: string, season: number): NewsArticle;
  generateSeasonEndNews(
    finalPosition: number,
    teamName: string,
    season: number,
    leagueTable: LeagueTable
  ): NewsArticle;

  // Background flavor news
  generateRandomNews(week: number, season: number): NewsArticle | null;

  // Utility
  pruneOldNews(newsFeed: NewsArticle[], currentSeason: number): NewsArticle[];
}
