"""Independent verifier: row-permutation search, no application imports or answers."""
import json, itertools, math
from pathlib import Path

def rule(c, values):
    op, target = c['op'], c.get('target')
    if op == '=': return len(values) == 1 and values[0] == target
    if op == '+': return sum(values) == target
    if op == '×': return math.prod(values) == target
    if op == '-': return len(values) == 2 and abs(values[0]-values[1]) == target
    if op == '/': return len(values) == 2 and max(values)/min(values) == target
    if op == 'odd': return all(x % 2 for x in values)
    if op == 'even': return all(not x % 2 for x in values)
    if op == 'straight':
        ordered = sorted(values)
        return all(b == a + 1 for a,b in zip(ordered, ordered[1:]))
    if op == '<': return len(values) == 2 and values[0] < values[1]
    raise ValueError(op)

def count(p, limit=2):
    n = p['size']; grid = []; found = []
    # Enumerate row permutations; cage support is independently computed from Cartesian products.
    support = []
    for c in p['cages']:
        valid = [v for v in itertools.product(range(1,n+1),repeat=len(c['cells'])) if rule(c,v)]
        support.append(valid)
    rows = list(itertools.permutations(range(1,n+1)))
    def search():
        if len(grid) == n*n:
            found.append(grid.copy()); return
        for row in rows:
            if any(row[col] in grid[col::n] for col in range(n)): continue
            grid.extend(row)
            possible = all(any(all(cell>=len(grid) or grid[cell]==v[j] for j,cell in enumerate(c['cells'])) for v in vs) for c,vs in zip(p['cages'],support))
            if possible: search()
            del grid[-n:]
            if len(found)>=limit: return
    search(); return found

def validate(p):
    n=p['size']; cells=[i for c in p['cages'] for i in c['cells']]
    assert sorted(cells)==list(range(n*n)), 'cages must partition the board'
    for c in p['cages']:
        reachable={c['cells'][0]}
        while True:
            old=len(reachable)
            reachable |= {i for i in c['cells'] if any(abs(i//n-j//n)+abs(i%n-j%n)==1 for j in reachable)}
            if len(reachable)==old: break
        assert reachable==set(c['cells']), 'disconnected cage'
        assert c['op'] not in ['-','/','<'] or len(c['cells'])==2
    solutions=count(p)
    assert len(solutions)==1, f"{p['id']} has {len(solutions)} solutions (capped at 2)"
    return solutions[0]

if __name__ == '__main__':
    puzzles=json.loads(Path('src/puzzles.json').read_text())
    report=[]
    for p in puzzles:
        solution=validate(p)
        print(f"{p['id']}: exactly one solution; {p['size']}×{p['size']}; {len(p['cages'])} connected cages")
        report.append({'id':p['id'],'solution':solution,'unique':True})
    print('All shipped puzzles verified independently.')
