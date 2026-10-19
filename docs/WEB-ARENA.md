# Auto arena battles

Open **Arena** in the local website. Select **Battle Arena**, **Platinum Arena**, or **Random Arena**, set a completed-battle limit, and save arena settings. Press Start while on the Arena tab. The default is 10 completed battles and stop after a defeat. Pausing/resuming retains the current run counters; Start after reaching the limit starts a fresh run. Sign-in/backend restart resets the run. Loading a profile preserves the selected arena/settings but does not start matchmaking.

## Native rules and matchmaking

- Battle Arena uses matchmaker type `Default`; four teammates of four different species are required, with at least one alive.
- Platinum Arena uses `Platinum`; additionally all four must be level 35 and their total rarity points must be at most 12. Common = 1, Rare = 2, Epic = 3, Exotic = 4, Legendary = 5. These points are separate from each copy's 0–18 stat rating. By default, a fainted teammate blocks joining; the explicit Platinum toggle permits joining with fainted members if another teammate is alive.
- Random Arena uses `Random` and supplies a separate drafted team. The owned collection team is unchanged. A server arena ban stops matchmaking.

Before each queue, the browser reloads the player, calls the corresponding `get_battle_arena`, `get_platinum_arena`, or `get_random_arena` RPC and applies its authoritative team HP. It submits the same Nakama `matchmaker_add` shape as the native client: query `*`, min/max count 2, string property `type`. It receives `matchmaker_matched` events. Default/Platinum remove their queue ticket after the native 91-second BOT_TIMEOUT and accept the native bot notification (code 42 with `matchId`). This does not create a custom bot battle. Searches stop after 120 seconds rather than queuing repeatedly.

Pause removes an outstanding queue ticket, including tickets arriving after a late Pause. If assignment races with cancellation, the assigned match is joined while automation stays paused for manual play. A confirmed cancellation cannot prevent a match that the server had already assigned. Unknown queue/cancellation results block starting until the server state is checked by a fresh sign-in. Account reconnect stays paused. Arena queue/draft state is held in backend memory, with game session tokens never persisted.

## Random Arena draft

The native draft has a separate match ID and opcode set: READY 0, START 1, BAN 2, PICK 3, TERMINATE 4, UPDATE 5, MATCH 7, PREPARE 8, RESTART 9. The client joins and sends READY, takes the server's species pool, bans exactly six, then chooses exactly four unbanned species. Choices rank abilities/stat profiles; picks also consider element coverage. This is not a win guarantee. Repeated START/UPDATE messages never repeat a submitted selection. RESTART refreshes a stalled/reconnected draft without replaying submitted bans/picks. MATCH moves to its separate battle ID.

While paused, choose species with the checkboxes in Arena and submit six bans or four picks manually. Banned choices cannot be picked, IDs must belong to the server's pool, and submitted choices cannot be resent. The game timer continues during Pause or with the page closed. Automation can continue the draft with the page closed while the backend stays running. Changing settings/profiles is blocked during a draft. Termination or unsupported state stops with an Arena report; fresh sign-in or backend restart does not retain a manual draft selection.

## Battles and limits

Arena combat uses the existing battle engine: act on the legal turn, follow authoritative status, faint and forced-switch events, and apply PvP cooldown rules. Smart strategy compares matchup, accuracy, hit count, relative stat profiles, HP, observed damage, useful control/healing and conservative switches. Basic highest-AP strategy remains selectable. Random Arena applies native ability enchantments to its generated team. Capture/run-from-unwanted rules do not apply to arena opponents. Live battle controls remain available after Pause. See [records and strategy details](ARENA-STRATEGY.md) for exact scope and verification limits.

The account record is separate from current-run counters: lifetime wins/losses when supplied, weekly Battle Arena wins, monthly Random Arena wins, and Platinum current/best streak. Records refresh while idle, before queueing and after finished arena matches. Missing server values remain unknown. Run win rate is displayed separately and does not imply a measured Smart-versus-Basic advantage.

Current team and HP are used; this feature does not automatically heal with platinum, spend virtue, buy items, replace teammates, or train them between arena matches. Hunt/team preferences remain saved and resume when those activities are selected again. Server errors, bans, invalid teams, uncertain requests and battle/draft timeouts stop automation. The configured battle limit counts completed arena matches rather than searches or draft attempts. Losses stop by default; disable that switch to continue until the battle limit or another stop condition.

## Validation and source

172 automated tests pass. Arena coverage includes native queue envelopes/types, eligibility and rarity limits, HP refresh, no training/healing side effects, one outstanding queue, late Pause/cancellation/assignment races, ticket correlation, bot notification routing, queue timeout, uncertain-result guards, complete draft-to-battle transitions, duplicate frames, invalid manual draft choices, draft recovery without replay, PvP cooldowns/enchantments, counters/loss/battle limits, authenticated HTTP draft actions and frontend draft selection across polls.

Protocol was read directly from the packaged native 2.23.0 resources: `scenes/arenas/battle_arena.gd`, `platinum_arena.gd`, `random_arena.gd`, `random_arena_stage.gd`, `singletons/notifications.gd`, `models/Player.gd`, `models/PlayerMiscrit.gd`, `scenes/battle/battle.gd` and `BattleMiscrit.gd`. `maintenance/extract-arena-protocol.ps1` reproduces read-only headless source/constant extraction in a task-specific temporary directory; it does not sign in or modify the Steam executable. The extracted constants are in `Miscrits-Web/data/arena-protocol.json`.

Live arena matchmaking, draft and PvP were not run against the account in this update. The website was already signed in; testing did not open a competing account session. Browser automation exposed no apps/tabs, so desktop/mobile layout remains visually unverified. These are the current verification limits, separate from earlier live hunting/campaign checks.
