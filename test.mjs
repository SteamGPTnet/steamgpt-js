// Live smoke test against steamgpt.net: npm test
// Covers all 8 functions, both modules (ESM/CJS) and machine-readable errors

import { createRequire } from 'node:module'
import { summary, profile, bans, faceit, friends, identity, compare, batch } from './index.mjs'

let fails = 0

function check( name, cond ) {
    console.log( ( cond ? 'OK   ' : 'FAIL ' ) + name )
    if( ! cond ) fails++
}

const SEED = '76561197960287930'

const prof = await profile( SEED )

check( 'profile: steamid64 + all id forms', prof['steamid64'] == SEED && prof['ids']['steamid'] == 'STEAM_1:0:11101' && prof['ids']['steamid3'] == '[U:1:22202]' )

const who = await identity('STEAM_1:0:11101')

check( 'identity: resolves STEAM_1 form', who['steamid64'] == SEED && who['resolved'] === true )

const b = await bans( SEED )

check( 'bans: raw GetPlayerBans + provenance', typeof b['bans']['VACBanned'] == 'boolean' && typeof b['provenance']['steam_bans']['fresh'] == 'boolean' )

const sum = await summary( SEED, { "preset": 'competitive' } )

check( 'summary preset=competitive: no friends, has sources', typeof sum['friends'] == 'undefined' && typeof sum['sources'] == 'object' )

const fc = await faceit( SEED ).catch( ( e ) => e )

check( 'faceit: data or clean no_faceit_data error', typeof fc['faceit'] !== 'undefined' || fc['slug'] == 'no_faceit_data' )

const fr = await friends( SEED, { "detail": 'short', "limit": 5 } )

check( 'friends detail=short: bare id array', Array.isArray( fr['friends'] ) && ( fr['friends'].length == 0 || typeof fr['friends'][0] == 'string' ) )

const roster = await batch( [ SEED, '76561197960265731' ], { "include": [ 'bans' ] } )

check( 'batch POST: both players with bans block', roster['count'] == 2 && typeof roster['players'][0]['steam_bans'] !== 'undefined' )

const cmp = await compare( SEED, '76561197960265731' )

check( 'compare: both sides + shared_friends', cmp['a']['steamid64'] == SEED && typeof cmp['shared_friends']['count'] == 'number' )

let error_caught = null

try {
    await profile('zzz-no-such-user-xyz-000')
} catch ( e ) {
    error_caught = e
}

check( 'errors: code + slug fields', error_caught !== null && error_caught['code'] == 404 && error_caught['slug'] == 'player_not_found' )

const require = createRequire( import.meta.url )
const sdk_cjs = require('./index.cjs')

const who_cjs = await sdk_cjs.identity( SEED )

check( 'cjs mirror: require() works', who_cjs['steamid3'] == '[U:1:22202]' )

console.log( fails == 0 ? '\nALL GREEN' : '\nFAILED: ' + fails )
process.exit( fails == 0 ? 0 : 1 )
