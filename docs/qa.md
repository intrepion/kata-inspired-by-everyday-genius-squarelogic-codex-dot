# Verification evidence

11 October 2026, user's Mac, installed Chrome, local production server at 127.0.0.1:5196.

## Numerical coverage

All six shipped puzzles independently have exactly one solution. 123 cells total; cage counts: 8, 8, 8, 11, 12, 12. The independent Python row-permutation verifier checks complete board coverage, cage connectivity and independent constraint semantics. TypeScript domain tests cover all nine rule types (including fixed values), row/column constraints, cage repetition, nonunique fixture, contradictions, notes, repeated entry no-ops, history branching, resets, invalid cell indices and validated partial/corrupt saves. Each shipped puzzle is completed via the hint interface in tests, with every alternative to each hint proved impossible by search.

## Actual visible browser play

Every puzzle was completed through normal visible Mac Chrome controls, in progression order:

| Puzzle | Size / difficulty | Families exercised |
| --- | --- | --- |
| First light | 4×4 / Beginner | fixed values, addition |
| Copper work | 4×4 / Easy | products, addition |
| Balanced wick | 4×4 / Medium | difference, exact quotient, arithmetic |
| Odd hours | 5×5 / Medium | odd/even, arithmetic |
| Little procession | 5×5 / Advanced | unordered straight, arithmetic |
| Night market | 5×5 / Challenge | labelled comparison, straight, parity, arithmetic |

This was **hint-assisted UI play**: one manually reasoned fixed value and 122 entries from visible explained hints, with pointer number buttons and keyboard input. No hidden state injection, solution imports or solver-output bulk fills. Nine visible hints used their explicitly stated exhaustive proof-by-contradiction fallback; the rest used repeated local elimination. `screenshots/visible-hint-play.json` records those visible explanations. All six earned badges and full collection completion survived a normal reload.

Visible interaction checks: tutorial open/close; candidate note add/toggle/remove; notes after reload; note undo/redo; wrong fixed-cage entry; contradiction checking; repeated same value followed by one undo; reset cancellation and Escape; reset confirmation and undo; partial value save/reload; automatic possibilities; selected cage combinations and rule explanation; keyboard arrows, N, Delete, Cmd+Z and Cmd+Shift+Z; page-switch focus restoration; completion next-page action; replay reset preserving badges. Replay leaves Night market empty and the earned badges intact in this Chrome profile; use any page's Reset to replay it.

Desktop, 390×844 and 320×740 responsive screenshots inspected. Tablet 768×1024 checked separately. Narrow layout checks use Chrome viewport emulation, not physical mobile hardware. Desktop screenshot proves final collection completion. Runtime console inspected for errors after the final build. Detached server's HTTP 200 and actual Chrome load verified after launcher exited.

## Independent reviews

Matt Pocock code-review Standards and Spec axes were performed in separate agents against initial documentation commit d8a496c. Both found missing focus restoration after switching puzzles; fixed and browser-verified. Standards also found noninteger cell-index handling; fixed with a targeted regression. Spec found a prose mismatch describing cell-wise instead of row-permutation verification; corrected. Later layouts were tightened so the Advanced puzzle is not completely settled by automatic local elimination at an empty board.

## Limits

This is a compact original interpretation of the documented reference foundations, not all 18 reference varieties. No physical touch device, screen reader, Safari or Firefox testing. No public deployment or sidebar project-registration claim. Exact final commit/CI evidence is reported in the delivery message after GitHub verification.

Final follow-up reviews against implementation commit 88f5702 reported **zero remaining Standards findings and zero remaining Spec findings**. Both reviewers independently reran all 14 domain tests and the Python verifier successfully. Final UI-only change wraps entry controls at widths below 360 pixels; corrected 320-pixel and tablet screenshots were inspected with no horizontal overflow. Captured warnings came from an installed Chrome extension; no application console error was observed.
