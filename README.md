# LINK status

Public status page for LINK, served by GitHub Pages independent of LINK hosting.

- `incidents.json` is the data (schema: `{updated, incidents:[{id,title,severity SEV1|SEV2,state investigating|identified|monitoring|resolved,started,updates:[{at,text}]}]}`).
- Resolved incidents are shown for 14 days.
- Test: `node --test`
