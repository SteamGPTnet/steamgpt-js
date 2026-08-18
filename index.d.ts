// steamgpt - typed client for the free SteamGPT Steam data API (https://steamgpt.net)
// Full response schemas: https://steamgpt.net/types.d.ts
// Conventions: optional (?) fields are ABSENT (undefined) when unknown; `| null` fields are always present.

export type SteamgptId = string; // steamid64, STEAM_1:0:x, [U:1:x], steamcommunity.com link or vanity name

export interface Ids {
    steamid64: string;
    steamid: string | null;
    steamid3: string | null;
}

/** Raw Steam GetPlayerSummaries player object, field names unmodified. */
export interface SteamPlayer {
    steamid: string;
    personaname?: string;
    profileurl?: string;
    avatarfull?: string;
    personastate?: number;
    communityvisibilitystate?: number;
    timecreated?: number;
    lastlogoff?: number;
    gameextrainfo?: string;
    loccountrycode?: string;
    [key: string]: unknown;
}

/** Raw Steam GetPlayerBans object. */
export interface SteamBans {
    SteamId: string;
    CommunityBanned: boolean;
    VACBanned: boolean;
    NumberOfVACBans: number;
    DaysSinceLastBan: number;
    NumberOfGameBans: number;
    EconomyBan: string; // 'none' | 'probation' | 'banned'
}

export interface SourceProvenance {
    source: string;
    retrieved_at: number | null;
    age_seconds: number | null;
    fresh: boolean;
    cache_ttl: number | null;
    refreshed_with?: string;
}

export type SourceStatus = 'ok' | 'empty' | 'unavailable' | 'excluded';

export interface ProfileData {
    steamid64: string;
    ids: Ids;
    steam: SteamPlayer | null;
    canonical: { steamid64: string; url: string };
    provenance: { steam: SourceProvenance | null };
}

export interface SummaryData extends ProfileData {
    faceit?: Record<string, unknown> | null;
    faceit_bans?: Array<Record<string, unknown>>;
    friends?: { count: number; friends: unknown[] };
    steam_bans?: SteamBans | null;
    sources: { steam: SourceStatus; faceit: SourceStatus; friends: SourceStatus; bans: SourceStatus };
    partial: boolean;
    provenance: { steam: SourceProvenance | null; faceit?: SourceProvenance | null; steam_bans?: SourceProvenance | null };
}

export interface BansData {
    steamid64: string;
    bans: SteamBans;
    provenance: { steam_bans: SourceProvenance };
}

export interface FaceitData {
    steamid64: string;
    faceit: Record<string, unknown> | null;
    bans: Array<Record<string, unknown>>;
    provenance: { faceit: SourceProvenance };
}

export interface FriendsData {
    count: number;
    friends: unknown[]; // shape depends on detail: short = string[], medium = {steamid64, personaname}[], full = {steamid64, steam}[]
}

export interface IdentityData {
    steamid64: string;
    steamid: string | null;
    steamid3: string | null;
    steam_hex: string | null;
    vanity: string | null;
    profile_url: string;
    resolved: true;
}

export interface BatchData {
    count: number;
    players: Array<{ steamid64: string; ids: Ids; steam: SteamPlayer | null; faceit?: Record<string, unknown> | null; faceit_bans?: Array<Record<string, unknown>>; steam_bans?: SteamBans | null }>;
    not_found: string[];
    invalid: string[];
}

export interface CompareData {
    a: SummaryData;
    b: SummaryData;
    shared_friends: { count: number; friends: Array<{ steamid64: string; personaname: string | null }> };
}

export interface SummaryOptions {
    include?: Array<'steam' | 'faceit' | 'friends' | 'bans'>;
    preset?: 'identity' | 'competitive' | 'full';
    friends_limit?: number;
    friends_detail?: 'short' | 'medium' | 'full';
}

export interface FriendsOptions {
    detail?: 'short' | 'medium' | 'full';
    limit?: number;
}

/** Errors thrown by every function carry the HTTP status and the machine-readable slug. */
export interface SteamgptError extends Error {
    code: number;  // HTTP status, e.g. 404
    slug: string;  // 'player_not_found' | 'no_faceit_data' | 'rate_limited' | ...
}

export function summary( player: SteamgptId, opts?: SummaryOptions ): Promise<SummaryData>;
export function profile( player: SteamgptId ): Promise<ProfileData>;
export function bans( player: SteamgptId ): Promise<BansData>;
export function faceit( player: SteamgptId ): Promise<FaceitData>;
export function friends( player: SteamgptId, opts?: FriendsOptions ): Promise<FriendsData>;
export function identity( player: SteamgptId ): Promise<IdentityData>;
export function compare( player_a: SteamgptId, player_b: SteamgptId ): Promise<CompareData>;
export function batch( steamids64: string[], opts?: { include?: Array<'faceit' | 'bans'> } ): Promise<BatchData>;
