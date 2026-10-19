# Workflow features 2–6

Open Workflow in the sidebar. Controls use the existing local authenticated backend, with the same owner-cookie, CSRF and origin restrictions. Save changes before Start. A backend restart is needed to load this release; existing settings and history remain intact.

## Live target queue

Shows the current encounter or last searched object, next available mapped object, and target family status. The queue derives its order from the same saved settings, selected-training plan, route planner, cursor and cooldown map as the engine. It does not advance the cursor or send game requests. Targets explain training upgrades, cooldown waits, unavailable daily routes/map access and completed families. Campaign selection is labeled separately. The next object predicts the search destination, not which random encounter will spawn.

## Wild-hunt healing

Opt-in, off by default. When at least one active teammate has fainted, heal before another wild search. Uses the native `heal_team` endpoint for 10 virtue. The default budget is 30 virtue per sign-in session, configurable from 0 to 1000. A budget below 10 permits no automatic heal. Living injured teammates alone do not trigger healing.

Reserve the budget before submitting a heal. An explicit rejection releases the reservation and pauses; an uncertain result retains it and blocks restart until authoritative sign-in recovery. Accepted healing reloads the player and must confirm the same team and positive HP for every member. No paid platinum heal or automatic mutation replay is used. Resetting counters, pausing/resuming or loading a profile does not refill budget usage. New sign-in/backend restart begins a new budget. The campaign's existing two-fainted rule remains independent of this wild budget.

## Profiles

Save the current form as a named profile (1–48 characters), up to 20 profiles. Names match case-insensitively when replacing a profile. Saving does not apply the form or start automation. Loading requires a paused, settled engine with no active battle; it validates and saves the profile as current settings without starting. Unsaved form edits must be saved before using Load. Delete removes only the named profile.

Only validated hunt, capture, training, replacement, healing and notification preferences persist to `Miscrits-Web/data/profiles.json`. Tokens, passwords and account IDs are not included. Profiles use atomic writes and survive backend restart. Invalid stored profiles are skipped; failed writes leave the in-memory profile list unchanged. Profiles are excluded from the source manifest and cannot be fetched as static files.

## Notifications

Recent in-app alerts are held by the backend (up to 100): confirmed kept captures rated 17+, training reaching its configured completion level, automation stops/errors and disconnections. The panel displays the latest 20. A saved notification switch controls new events. Initial page load does not replay historical alerts as popups; polling shows each new ID once.

Browser alerts are optional and require clicking Enable browser alerts and granting permission. Permission is never requested merely by polling. This page must stay open for desktop notifications; no service worker or push backend is provided. With the page closed, backend automation and recent in-app alert collection continue while the backend/PC remain running. Browser alerts must be enabled again after a page reload.

## Session statistics

Counters reset on sign-in/backend restart, or manually while paused outside battle. Elapsed time includes pauses. Searches count submitted wild requests, not guaranteed encounters. Encounter START, capture keep acknowledgements and battle finishes are deduplicated per battle. Capture attempts count submitted free-capture actions; captures count confirmed keeps. Duplicate captures are already-owned species families at keep time. Levels count confirmed earned-XP training. Team XP sums only own-team ID entries from the native summary's `updates` payload under the current player's key, matching `BattleSummary.set_hp`; it is server-awarded XP, not an estimate from current XP bars. Missing summaries contribute no invented XP. Healing stats record accepted heals, while the separate wild budget also retains uncertain reservations.

## Validation

118 automated checks pass. Workflow coverage includes optional healing, insufficient virtue/budget, one request in flight, late pause, uncertain/rejected results, unchanged team/HP verification, profile validation/replacement/reload/failure cases, queue prediction versus actual search payload, native XP accounting, notification deduplication and opt-in browser delivery, counters and virtue budget separation, authenticated HTTP actions and workflow rendering.

A read-only live check with the authorized dummy account loaded `get_player` and `get_player_seen`, produced a next object in Forest and an empty set of gameplay counters, with wild healing disabled. It sent no searches, team mutations or heals and spent no virtue. Report: `validation/web-workflow-live.json`. Actual healing was not forced by deliberately fainting teammates. Desktop notification delivery and rendered desktop/mobile layout could not be visually verified because computer-use/browser automation surfaces were unavailable in this session. Existing native gameplay validation remains separate.
