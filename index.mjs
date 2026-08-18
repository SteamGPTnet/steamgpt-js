// steamgpt: typed client for the free Steam data API at steamgpt.net.
// No keys, no registration; {id} accepts steamid64, STEAM_1:0:x, [U:1:x],
// a steamcommunity.com link or a vanity name. Errors carry code and slug fields

const API_URL = process.env.STEAMGPT_API_URL || 'https://steamgpt.net'

function buildQuery( opts ) {

    let params = new URLSearchParams()

    if( Array.isArray( opts?.include ) && opts.include.length > 0 ) params.set('include', opts.include.join(','))
    if( opts?.preset ) params.set('preset', String( opts.preset ))
    if( opts?.friends_limit ) params.set('friends_limit', String( opts.friends_limit ))
    if( opts?.friends_detail ) params.set('friends_detail', String( opts.friends_detail ))
    if( opts?.detail ) params.set('detail', String( opts.detail ))
    if( opts?.limit ) params.set('limit', String( opts.limit ))

    let tail = params.toString()

    return tail == '' ? '' : '?' + tail
}

async function requestJson( path, options = {} ) {

    let response = await fetch( API_URL + path, {
        "method":  options.method || 'GET',
        "headers": { "Accept": 'application/json', ...( options.body ? {"Content-Type": 'application/json'} : {} ) },
        ...( options.body ? {"body": JSON.stringify( options.body )} : {} ),
    })

    let data = await response.json()

    if( data?.result != 'success' ) {

        let error = new Error( data?.message || 'steamgpt: request failed (HTTP ' + response.status + ')' )

        error.code = data?.code ?? response.status
        error.slug = data?.error ?? 'unknown'

        throw error
    }

    return data['data']
}

const id = ( value ) => encodeURIComponent( String( value ).trim() )

export const summary  = ( player, opts = {} ) => requestJson( '/summary/' + id( player ) + '.json' + buildQuery( opts ) )
export const profile  = ( player )           => requestJson( '/profile/' + id( player ) + '.json' )
export const bans     = ( player )           => requestJson( '/bans/' + id( player ) + '.json' )
export const faceit   = ( player )           => requestJson( '/faceit/' + id( player ) + '.json' )
export const friends  = ( player, opts = {} ) => requestJson( '/friends/' + id( player ) + '.json' + buildQuery( opts ) )
export const identity = ( player )           => requestJson( '/identity/' + id( player ) + '.json' )
export const compare  = ( player_a, player_b ) => requestJson( '/compare/' + id( player_a ) + '/' + id( player_b ) + '.json' )

// batch: up to 100 steamid64 STRINGS per request - always cheaper than per-player calls
export const batch = ( steamids64, opts = {} ) => requestJson( '/batch', {
    "method": 'POST',
    "body":   { "ids": steamids64.map( ( value ) => String( value ) ), ...( Array.isArray( opts?.include ) ? {"include": opts.include} : {} ) },
})
