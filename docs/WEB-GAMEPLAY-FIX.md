# Browser gameplay validation

Live testing found that Nakama omits the zero operation code from a battle START frame. The browser previously converted that missing field to NaN and rejected the battle before loading player/foe data. The transport now applies the protobuf default of zero. A regression test covers the exact omitted-field shape. An informational READY without actions may also arrive while joining and is accepted before START.

Server location names can be display labels such as `Forest`. The search controller now compares the numeric map ID, falling back to a normalized name, instead of comparing that label directly with `forest`. This avoids unnecessary location updates within the same area.

Manual-target handoff now pauses as soon as the selected opponent is received, including an opponent-first encounter. Sleep, confuse and paralysis durations restore from START and expire on their owner's turn; cleanse and switch update the same control flags. Native `Special` informational effects are accepted. Each new wild opponent gets its own weakening budget and ongoing-damage guard.

Capture damage planning now uses guarded measurements from compatible attacks and cannot fall through from an unsafe measured hit to an unmeasured stronger move. The server capture chance remains authoritative; capture is not guaranteed.

## Live results

Using the explicitly authorized dummy account, with an isolated engine and no changes to website/native preferences:

- Restored the wild encounter from the failed START test, attempted one free capture, then successfully fled after the attempt failed.
- Cleared campaign stage 1 with an automated attack and a server victory. A subsequent independent login reported campaign progress at stage 1 and one attempt used.
- Performed a fresh wild search, encountered Cubsprout, weakened it, captured it using the normal 70% threshold, kept it and returned from battle. The server reported no active battle afterward.
- No virtue or platinum was spent by these gameplay tests. The successful capture added Cubsprout to the dummy collection; the campaign test used one daily attempt.

Reports: `docs/validation/web-gameplay-wild.json`, `web-gameplay-campaign.json` and `web-gameplay-capture.json`. They contain gameplay states and diagnostic field names, with credentials and player identifiers omitted. The test helper accepts credentials through hidden stdin and never saves them.

There are 118 passing offline checks. The dummy active team was level 30 and level 1 with neither fainted, so the level-35 replacement and two-fainted-teammate heal triggers remain mock-tested. Those conditions were not forced merely to obtain a live result. Full campaign content and every special ability combination are not covered by this one-stage run.

## Search stops after victory

The reported activity log shows a successful Flameling capture and victory followed by a generic rejection. The old transport discarded the failed RPC's name and response data, so the exact reason for that past request cannot be recovered from that log.

Native `readable/singletons/world_manager.gd`, `setup_battle`, establishes that `create_battle` can return `success:false` for item drops and search cooldowns. These are normal search outcomes. The browser now handles those definitive responses without stopping automation, reserves the object's normal cooldown, and continues with available objects. Disabled objects, daily limits, unknown rejections, and uncertain requests still pause. The log identifies the RPC and search location, plus a bounded, redacted server message when provided. Rejected travel also identifies the intended location and cannot proceed to search there.

Four added regression checks cover ordinary outcomes immediately after victory, cooldown reservation without immediate retries, genuine failures and rejected travel, and bounded rejection details. These changes were verified offline against native response semantics; no second live login was opened during the user's connected browser session. Backend health version 4 identifies the updated release. Restarting it requires signing in again; active server battles are restored on login.
