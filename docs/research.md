# SquareLogic research — 11 October 2026

Primary sources inspected:
- Creator: https://truethought.com/games/ — confirms colored numerical cages, sizes 4–9, in-game tutorial, resumable puzzles, and progressive hints.
- Creator/publisher's Steam listing: https://store.steampowered.com/app/32150/Everyday_Genius_SquareLogic/ — confirms arithmetic, automatic possibilities, comparisons, sequences, hidden cages, and linked boards. It does not define all operator semantics. No standalone official manual was located.

Secondary corroboration for rules absent from primary prose:
- Contemporary review: https://jayisgames.com/review/everyday-genius-squarelogic-1.php — describes 1…N once per row/column; sum, difference, product and division cages; odd/even; unordered consecutive sets; repeats allowed within cages. Also describes pointer entry and candidate elimination.
- Player account: https://steamcommunity.com/id/FlyingShisno/recommended/32150/ — corroborates candidate pruning and cage-combination display. Treated as a player source, not creator documentation.

Implementation choices: preserve Latin row/column and arithmetic-cage foundations, optional manual notes, automatic local possibilities and combination lists. Add original writing, title, layouts, lantern art and progression. Comparisons have labelled A1/A2 reading order; straights are unordered consecutive distinct sets. Restrict difference/quotient to two cells and define quotient as exact larger divided by smaller. No claim of complete SquareLogic fidelity: hidden cages, double boards and its 18 varieties are outside this collection. Difficulty labels reflect increasing size and rule composition, not calibrated human difficulty scores.

Skill sources inspected locally and official repository pages:
https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md
Dependencies read: grilling, domain-modeling (+formats), tdd, code-review. Delegated decisions override interview/confirmation prompts. Tests at user-requested domain seams. Separate review agents required by code-review; baseline documentation commit is selected as the natural greenfield fixed point.
