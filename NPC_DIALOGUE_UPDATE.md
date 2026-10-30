# NPC Introduction Update

- New players start the NPC conversation directly inside the bedroom.
- Gender choice and name entry are part of the same in-game dialogue box; no separate setup form.
- Name limited to 16 characters, trimmed, and confirmed before tutorial content.
- After confirmation the player profile is saved as `nodex_player_profile` in localStorage.
- The tutorial then covers NODEX, movement, interaction, and the computer.
- After final dialogue the NPC performs its existing departure animation and free movement resumes.
- Returning players still skip the introduction when `nodex_tutorial_completed` is `true`.
- Existing bedroom art and educational modules were not redesigned in this update.

Testing: dependencies are not installed in this archive; run `npm install` then `npm run dev` to test in browser. To test first-time setup again, clear `nodex_tutorial_completed` and `nodex_player_profile` in localStorage.
