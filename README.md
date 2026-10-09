# Daily Sheng Xiao · 每日生肖

An entertainment-focused 12-animal Chinese zodiac reading website based on **calculated** year, solar-term month and day pillars.

## Design
- **Yearly:** current year Earthly Branch versus each animal.
- **Monthly:** current solar-term month Earthly Branch versus each animal.
- **Daily:** current day Earthly Branch versus each animal.
- Each period has independent interpretive prose in `data/yearly.json`, `data/monthly.json`, and `data/daily.json`.
- Branch relations come from `data/relationships.json`; clickable explanations are in `data/knowledge.json`.
- No birth chart, location picker, personalized claims, or randomly generated fortunes.

## Calendar method
The website uses `lunar-javascript@1.7.7`, locally vendored at `vendor/lunar.js` with jsDelivr as a backup. The year pillar changes at **Li Chun (立春)**; the month pillar uses **solar-term 节 boundaries**, not the first of a lunar month; the day pillar uses the library's **midnight-based** exact-day convention. Times use the visitor's local device clock and time zone. The popular birth-animal convention (Chinese New Year) can differ near the year boundary.

Year, month and day are calendar facts. Traditional relationships and interpretive prose are cultural systems, not scientifically established forecasts. Two branches in the same 三合 or 三会 group do **not** constitute the complete three-branch formation. Multi-branch punishments are not inferred from incomplete pairs.

## Fallback / installation
`.github/workflows/vendor-lunar.yml` copies the pinned local version already used by the [Wannianli project](https://github.com/noagrp/wannianli). The library is MIT-licensed; preserve its copyright notice. The workflow commits the vendor file. CDN is only fallback if the local copy fails.

The repo's four existing icons remain unchanged.

## Source
[Github repository](https://github.com/bennessism/dailyshengxiao).
