# LINK status

BACKUP status page for LINK, served by GitHub Pages independent of LINK hosting. The primary status page is Better Stack: https://linkxdaedalus.betteruptime.com/ — use this one only if Better Stack is unavailable (update `incidents.json` by hand).

- `incidents.json` is the data (schema: `{updated, incidents:[{id,title,severity SEV1|SEV2,state investigating|identified|monitoring|resolved,started,updates:[{at,text}]}]}`).
- Resolved incidents are shown for 14 days.
- Test: `node --test tests/render.test.mjs` (Node 24 rejects a bare `tests/` directory argument)
