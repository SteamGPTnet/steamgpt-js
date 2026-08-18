# steamgpt

Typed client for [steamgpt.net](https://steamgpt.net) - a free Steam data API for humans, applications and AI agents. Steam profiles, SteamID conversion, VAC / game / community / trade bans, FACEIT stats, public friend graph, batch lookups and player comparison. No API key, no registration, no tracking. Zero dependencies, Node.js >= 18 (uses global fetch).

```bash
npm install steamgpt
```

## Quick start

```js
import { profile, bans, identity, batch } from 'steamgpt'

// any id form works: steamid64, STEAM_1:0:x, [U:1:x], steamcommunity link or vanity name
const player = await profile('76561197960287930')
console.log(player.steam?.personaname, player.ids.steamid) // Rabscuttle STEAM_1:0:11101

const b = await bans('76561197960287930')
console.log(b.bans.VACBanned, b.bans.NumberOfGameBans) // false 0

const who = await identity('STEAM_1:0:11101')
console.log(who.steamid64) // 76561197960287930

// checking many players? ALWAYS batch - up to 100 ids in ONE request
const roster = await batch(['76561197960287930', '76561197960265731'], { include: ['bans'] })
console.log(roster.count, roster.players[0].steam_bans)
```

CommonJS works too: `const { profile } = require('steamgpt')`.

## API

| Function | Endpoint | Returns |
| --- | --- | --- |
| `summary(id, opts?)` | `/summary` | everything: Steam + bans + FACEIT + friends; trim with `opts.include` or `opts.preset` (`identity` / `competitive`) |
| `profile(id)` | `/profile` | raw Steam summary only (cheapest) |
| `bans(id)` | `/bans` | VAC, game, community, economy bans exactly as Steam returns them |
| `faceit(id)` | `/faceit` | FACEIT player object + FACEIT bans |
| `friends(id, opts?)` | `/friends` | public friend graph; `opts.detail: 'short'` = bare steamid64 array |
| `identity(id)` | `/identity` | all SteamID forms + vanity, no profile data |
| `batch(ids, opts?)` | `POST /batch` | up to 100 steamid64 strings per call |
| `compare(idA, idB)` | `/compare` | two players side by side + shared friends |

## Errors

Every function throws an `Error` with machine-readable fields - switch on `slug`, not on message text:

```js
try {
    await profile('no-such-player-xyz')
} catch (e) {
    console.log(e.code, e.slug) // 404 player_not_found
}
```

Slugs: `player_not_found`, `no_faceit_data`, `no_bans_data`, `batch_too_large`, `batch_no_valid_ids`, `bad_request`, `rate_limited` (honor 60s), `internal`.

## Trust the data

JSON responses carry `provenance` per source (`retrieved_at`, `age_seconds`, `fresh`) and `/summary` adds `sources` + `partial`: `unavailable` means the upstream did not answer - it is NOT evidence of absence. Full semantics: [steamgpt.net/docs.md](https://steamgpt.net/docs.md).

- Full TypeScript schemas: [steamgpt.net/types.d.ts](https://steamgpt.net/types.d.ts) (bundled `index.d.ts` covers the same shapes)
- For AI agents (MCP server, .md/.ai formats, token prices): [steamgpt.net/ai](https://steamgpt.net/ai)
- Env override: `STEAMGPT_API_URL` (default `https://steamgpt.net`)
- Fair use: soft limit 120 requests/min per IP; responses are cached

SteamGPT is an independent service and is not affiliated with Valve Corporation or Steam.

MIT (c) SteamGPT - [steamgpt.net](https://steamgpt.net)
