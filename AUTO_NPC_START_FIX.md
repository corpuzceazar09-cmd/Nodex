# NODEX auto NPC launch fix

The bedroom now automatically starts the guide's dialogue on every bedroom page load, including when the player already has a completed tutorial flag. A saved player profile is still loaded and can prefill name/gender selection. The replay button remains for testing after the guide departs, but is no longer needed to start the NPC.

To test: run `npm run dev` and open the root URL or `/bedroom`. The guide and dialogue should appear without pressing Replay. When the NPC finishes leaving, movement is enabled as before.

Note: A web page cannot reliably detect an `npm run dev` server restart. This change uses browser page entry/load as the trigger, so refreshing `/bedroom` or returning to it will also replay the NPC guide. This is intentional for the requested behavior.
