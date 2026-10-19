# Browser connection recovery

The original browser backend sent a JSON `{ping:{}}` message every 15 seconds. A live test with the user-authorized dummy account reproduced a clean server close (code 1000) shortly after that message. Sending an immediate JSON ping also closed the connection before the player request completed. An otherwise identical connection with no JSON ping remained connected for 60 seconds.

The installed native Nakama socket adapter uses WebSocket protocol control frames rather than JSON ping requests. The browser backend now uses the bundled `ws` 8.22.0 client, with native-compatible control-frame ping/pong. Its npm tarball was verified against registry SHA-512 integrity; the package origin and license are retained in `Miscrits-Web/vendor/ws`.

The updated transport remained connected for 60 seconds in a live test, refreshed its session token successfully, and reconnected to the same account after a deliberate close. These tests only authenticated, read player information, refreshed sessions and closed/reopened sockets. They did not search, fight, capture, heal, replace a team, or purchase anything.

Recovery coalesces concurrent requests and uses at most three attempts. It reloads the official server address, refreshes the in-memory session, and restores player/active battle state. Automation stays paused. Unknown pending mutations remain blocked and are never replayed. Delayed close events from old sockets cannot close a new socket or overwrite Sign out. A failed connection handshake rejects promptly. Expired sessions provide Sign in, and a recoverable offline account provides Reconnect.

There are 27 passing offline tests, including control-frame acknowledgements against a local WebSocket server, no JSON ping, old-socket races, sign-out cancellation, refresh results arriving after sign-out, recovery to an authoritative battle and unknown-action protection. See `docs/validation/web-client-tests.log` and the credential-free live report `docs/validation/web-connection-live.json`.

Storage checks now enforce independent caps: 10,000,000,000 bytes for `Miscrits-Web`, and 2,000,000,000 bytes for the original script package excluding that folder. No native game executable or settings were changed for this fix.
