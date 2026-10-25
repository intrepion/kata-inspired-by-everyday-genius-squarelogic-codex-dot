# Lantern Ledger

An original, quiet arithmetic-cage puzzle collection inspired by Everyday Genius: SquareLogic. Six uniquely solvable puzzles, three 4×4 and three 5×5, introduce addition, products, difference/quotient, parity, unordered consecutive sets and labelled comparisons. Every row and column uses 1…N exactly once. Original SVG lantern art, writing and layouts; no reference game assets or puzzle copies.

Select a cell and use the number buttons or keyboard. Notes, automatic possibilities, cage combinations, explained hints, contradiction checking, undo/redo and saved progress support a relaxed solve. Earned badges survive replay resets. All six pages are open. Local browser storage is per origin/browser profile; storage failures are displayed. No timer, analytics, remote assets, paid services, or public deployment.

## Run on this Mac

```sh
cd /Users/intrepion/Documents/Codex/2026-10-11/task-12/kata-inspired-by-everyday-genius-squarelogic-codex-dot
npm ci
npm run build
npm run start:detached
```

Play at **http://127.0.0.1:5196**. This is a production build on a detached, loopback-only Node process. The launcher checks the port and refuses to replace an existing server. It writes `.server.pid` and `.server.log`; there is no boot/login service. If already running, simply open the play URL. To restart this game's server only, inspect `.server.pid` and verify that PID runs this repository's `scripts/serve.mjs`, terminate that verified process, then run `npm run start:detached`. Never kill a process just because it uses the port. A different free port can be selected with `PORT=5197 npm run start:detached`; its browser save is a separate origin.

For development: `npm run dev` uses the same port, so use an explicit free port (for example `npm run dev -- --port 5197`) while the production play server is running.

## Verification

```sh
npm test
npm run verify
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

The TypeScript solver enumerates solutions up to two. The independent Python verifier enumerates row permutations and checks separately implemented cage predicates; neither reads a stored answer. Python also verifies cage coverage and connectivity. Domain tests prove each hinted value by excluding every alternative and searching for a completion. Notes never constrain those proofs. See [research](docs/research.md), [specification](docs/spec.md), [QA evidence](docs/qa.md), [glossary](GLOSSARY.md), and [architectural decision](docs/adr/0001-verifiable-compact-collection.md).

Difficulty labels describe progression in size/rule composition, not a calibrated human solving score. The collection deliberately omits hidden cages and linked boards. Browser testing was hint-assisted and covers every shipped puzzle; it is distinct from independent numerical validation. No claim of physical mobile or screen-reader hardware testing.

## Play online

[Play the hosted game](https://intrepion.github.io/kata-inspired-by-everyday-genius-squarelogic-codex-dot/)
