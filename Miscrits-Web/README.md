# Miscrits Field Station

A separate browser client with its own Node.js backend. It connects directly to the official Miscrits service. It does **not** launch, embed, or control Miscrits.exe.

Double-click **Launch Miscrits Website.cmd** in the parent folder, then open <http://127.0.0.1:4318>. Finish any active battle and close the native game before signing in with your Miscrits username/email and password. The backend must stay running while you use it. **Stop Miscrits Website.cmd** stops only this website backend.

## Available controls

- Workflow: live current/next search object and per-target reasons; optional wild healing with a virtue budget; up to 20 saved profiles; recent alerts and optional browser notifications; session counters. See `docs/WEB-WORKFLOW.md` in the parent package for exact rules and validation.
- Collection: open **Collection** in the sidebar for tier progress, current owned/missing families, best ratings, copy counts and level-30 completion. Search species, evolutions or nicknames; combine tier, ownership, rating and completion filters. Sort by tier/name, best rating or highest level. Each family has an expandable copy list; pages contain up to 24 families. This view is read-only and preserves hunt/team settings.
- Hunt & capture: select names using the existing mapping catalog; choose fighting, targeted/any/rated capture, or pause on a target for a manual battle. Supports normal object cooldowns and fleeing unwanted encounters.
- Live battle: server HP, available abilities, teammate switches, one free capture attempt, keep a captured Miscrit, and flee. Automatic captures keep the Miscrit. There is no paid capture retry or release button.
- Campaign: unlocked next-stage battles, confirmed victory count and a configurable 1–10 victory limit. Heals with 10 virtue when two active teammates have fainted. Stops on defeat, attempts exhausted, insufficient virtue, or a server failure.
- Team: separate replacement list; replaces level-35 teammates in slots 2–4 with the highest-rated eligible owned copy below 35. Keeps slot 1 and batches updates.
- Auto level-up: **Your team > Auto level-up > Level up with earned XP**. Enable it, save training settings, then Start automation. Trains active teammates between hunting/campaign battles, one earned-XP level at a time up to level 35. Defaults off. Team cards show current XP and readiness. The next cycle applies enabled level-35 replacements.
- Collection capture: choose **Capture species I do not own** in Hunt & capture. Compares species families against your current owned roster, including evolved copies. Captures new families at the configured free-capture threshold. Your hunt list supplies search locations.
- Selected-copy training: add species to the separate replacement list, then enable **Train best 17+ copies to level 30** in Your team. Keeps slot 1; fills slots 2–4 with one highest-rated qualifying copy per species. Priority is Exotic, Rare, Common, Epic, then Legendary, with a minimum rating of 17. Completed best copies are not replaced by inferior duplicates. Ties prefer the higher level, then lower individual ID. Stops each trainee at 30 and moves to the next eligible species. Takes priority over level-35 replacement; general auto level-up can still train the lead to 35.
- History: capped saved battle/capture records and recent in-memory activity.

Save changes before pressing Start. Pause also leaves manual battle controls available. F8 in the browser uses the same Start/Pause button. Search cooldown and spawn randomness remain server controlled.

**Clear all targets** in Hunt & capture empties the hunt list in one click. Press Save hunt settings to apply (pause automation first if running). Separate tier training selections remain intact, including their upgrade searches. The button is disabled when the hunt list is already empty.

Selected-copy training uses earned XP even when the general auto level-up switch is off. If a listed species has no rating-17+ copy, it is skipped for team selection and queued for capture in wild hunts; qualifying captures can upgrade an already-owned lower-rated species. Their mapped searches come first, Exotic first, followed by your hunt route (or the replacement list when the hunt list is empty). Use Collection capture for this workflow. Owned encounters are fought for XP while selected trainees remain; afterward the configured run/fight rule applies. Captures, upgrades and selections are checked again after each battle. The game still determines encounter and capture chances.

Normal item-drop and cooldown responses keep the hunt running. Other rejected requests pause with the request name, search location and any server explanation in the activity log. If no explanation was supplied, the log says so. After updating/restarting the backend, sign in again; any active server battle is restored.

Automatic team selection is grouped into **Exotic, Rare, Common, Epic and Legendary**, in that priority order. Each tier has **Add owned 17+**, **Add mapped capture targets**, and **Clear tier** buttons. Existing manual selections appear within their tier. Bulk actions add each family once and require a loaded account index; save team settings afterward.

Tier buttons update when account/index data loads even if settings have unsaved edits. The tier section explains any sign-in, reconnection or index prerequisite and offers the relevant account action. Clear tier stays disabled when that tier has no selected species.

**Add mapped capture targets** adds matching species to both the tier list and **Your next great find**, preserving existing hunt choices and avoiding duplicates. For tier targets selected earlier, use **Add mapped tier targets** in the hunt card, then save hunt settings. Completed families, qualifying owned copies and unmapped species are excluded from this import. A batch exceeding the hunt list's 100-target limit is rejected without partially changing either list.

In Hunt & capture, **Allow target captures below rating 17** permits lower-rated selected hunt targets and queued tier targets. It defaults off. Collection mode still skips already-owned families unless they need a selected training upgrade. Capture chance, turn ownership and one-free-attempt limits still apply. Low-rated captures remain ineligible for 17+ automatic team training, and completed-family duplicate protection remains active.

**Remove targets after a kept capture** defaults on. A confirmed keep removes that species family from Your next great find and saves the hunt list, including a below-17 capture. Failed attempts and a capture awaiting keep confirmation do not remove it. Its separate tier/replacement entry stays selected, so training can keep seeking a 17+ upgrade. A failed settings write pauses automation. Visible removals also update unsaved drafts while preserving unrelated edits. When no hunt targets, trainees, or upgrade goals remain, automation stops cleanly.

Duplicate prevention checks both your owned roster and the official Miscrits index (`get_player_seen`). Any owned copy at level 30+, or a captured fourth evolution in the index, completes that family even if the old copy was released or a higher-rated duplicate is caught later. Such families are excluded from selected training and its upgrade-capture queue. An evolution that was only seen does not mark the family complete. An unavailable index pauses selected training before a team save or level-up. The native index carries evolution capture flags, not historical rating information; completion is conservatively based on reaching level 30 regardless of that old copy's rating.

## Data and operation

In **Workflow**, wild healing defaults off, with a 30-virtue session budget when enabled. It heals fainted teammates between wild encounters using the normal 10-virtue endpoint. Insufficient virtue, budget exhaustion, rejected healing or unconfirmed HP stop automation. Counter reset and profile changes do not reset budget usage; a fresh sign-in/backend restart does. Campaign retains its existing two-fainted healing rule.

Profiles save only validated preferences in `data/profiles.json`; they contain no game session or credentials. Save the current form under a name, then pause/finish any battle before loading another profile. Loading saves settings but never starts automation. Saving the same name replaces its profile. In-app alerts cover kept 17+ captures, completed training, stops and connection failures. Browser notifications need an explicit button click/permission and an open page; after closing it, recent alerts remain available from the backend but no desktop push is sent. Session stats count submitted search requests, observed encounters, free capture requests, confirmed keeps/duplicates, wins, flees, earned-XP levels, server-awarded team XP and confirmed heal expenditure. Elapsed time includes pauses. Counts reset at sign-in/backend restart or via Reset counters while paused and outside battle.

Collection completion checks every owned copy and the loaded official index: a level-30+ copy or captured fourth evolution marks its family complete, including a released old copy. Missing means absent from the current owned roster, so a family can be missing and historically complete. If the index is unavailable, historical completion is labeled unconfirmed. Data comes from the latest account snapshot and updates when the backend reloads the roster after gameplay. No account data is invented while signed out. Filters remain set while data updates. This frontend update needs only a browser refresh; it does not require restarting the backend or signing out.

The backend binds to `127.0.0.1` on this PC. This release is a local website, not a hosted public domain. A hosted version needs a separate persistent server capable of running Node and maintaining the game socket; static website hosting alone cannot run this backend.

Storage limits are separate: this browser project may use up to **10 GB**; the original script package (excluding `Miscrits-Web`) remains capped at **2 GB**. The release verifier measures and enforces both limits.

Passwords are forwarded only to the official HTTPS authentication endpoint and never written to files, logs, or browser storage. Game sessions remain in backend memory. The first browser session owns the local backend until it restarts. Sign out clears the game connection. Settings and capped history use `data/settings.json` and `data/history.json`. Native game settings are imported once as preferences and are never overwritten.

The Node 22 runtime is included, with its official license and verified checksum. The small `ws` WebSocket library is bundled in `vendor/ws`, with its license and verified npm integrity record; no npm installation is needed. Source: `server.mjs`, `lib/`, and `dist/`. The mapping catalog is read from the sibling installer source. Keep this directory in the supplied package.

Connections use WebSocket control-frame ping/pong, matching the native client. JSON ping messages are not sent: live tests showed that the game closes those connections. A short disconnect triggers up to three reconnection attempts using the in-memory refresh token and the current official server address. Player data and an active battle are loaded again from the server. Automation stays paused; unresolved game mutations are never resent. Expired sessions expose a working Sign in button; exhausted recovery attempts expose Reconnect. Signing out clears the session and cancels recovery.

Tests: `runtime\node.exe --test test/*.test.mjs` from this directory. Tests use isolated mock accounts and servers; they do not log in to the user's game account or spend currency.

## Verification limits

All 118 offline protocol, connection, policy, HTTP, frontend wiring and state-machine tests pass. The user confirmed login and manual browser controls. Live checks with the authorized dummy account also verified stable connection/recovery, a fresh wild search, weakening/capturing/keeping Cubsprout at the normal 70% threshold, fleeing after a failed free capture, and one campaign stage victory whose progress appeared in the next login. These gameplay tests spent no virtue or platinum. See `docs/WEB-GAMEPLAY-FIX.md` and `docs/validation/web-gameplay-*.json`.

The dummy team's levels were 30 and 1, with no fainted members, so level-35 replacement and two-fainted-teammate virtue healing were tested with mocks rather than forced live mutations. Other campaign stages and special ability combinations still need live coverage. Browser automation was unavailable in the coding session, so rendered desktop/mobile layout has not yet been visually verified.

Source updates are loaded when the backend starts. Use Stop Miscrits Website.cmd followed by Launch Miscrits Website.cmd after an update. Sign in once after restarting the backend; temporary network recovery does not require entering the password again while the refresh token remains valid.

This version focuses on hunting, battles, campaign, earned-XP training, and replacements. It does not port the native game's full animated world, shop, inventory management, paid/token training, platinum bonus upgrades, Google/Apple/Steam sign-in, or every special ability effect. Unexpected or unsupported battle responses pause automation instead of repeating requests. A timed-out mutation blocks restart until sign-out/sign-in checks server state.
