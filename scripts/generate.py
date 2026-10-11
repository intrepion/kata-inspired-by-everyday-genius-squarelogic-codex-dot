"""Offline deterministic authoring; never runs in the browser."""
import random, json
from pathlib import Path
from verify import count
rng=random.Random(731059)
settings=[
 ('first-light','First light',4,'Beginner','A small spark is enough.','Start with the fixed-value cages, then make every row and column contain 1–4.', ['+']),
 ('copper-work','Copper work',4,'Easy','Give each number a little weight.','Product cages narrow your choices. 8× on two cells means 2 and 4.', ['+','×']),
 ('balanced-wick','Balanced wick',4,'Medium','A measured difference.','Difference and quotient cages work in either order. Look for what the row can still hold.', ['+','×','-','/']),
 ('odd-hours','Odd hours',5,'Medium','Some lights follow a different rhythm.','Odd cages allow 1, 3, 5; even cages allow 2, 4. The row and column rules still apply.', ['+','×','-','/','odd','even']),
 ('little-procession','Little procession',5,'Advanced','A line of lights, in any order.','RUN cages hold consecutive, distinct numbers. A set such as 2, 3, 4 may appear in any order.', ['+','×','-','/','straight']),
 ('night-market','Night market',5,'Challenge','Six lanterns. One last quiet thought.','Compare the numbered cells in the 1 < 2 cage. Combine that ordering with everything you have learned.', ['+','×','-','/','straight','odd','even','<'])]
for index,(id,title,n,difficulty,subtitle,lesson,ops) in enumerate(settings):
    for attempt in range(10000):
        rs=list(range(n));cs=list(range(n));vs=list(range(1,n+1));rng.shuffle(rs);rng.shuffle(cs);rng.shuffle(vs)
        board=[vs[(rs[r]+cs[c])%n] for r in range(n) for c in range(n)]
        free=set(range(n*n)); cages=[]
        while free:
            first=min(free); group=[first];free.remove(first)
            wanted=rng.choices([1,2,3],[1 if index==0 else .15,5,2])[0]
            for _ in range(wanted-1):
                adjacent=[i for i in sorted(free) if any(abs(i//n-j//n)+abs(i%n-j%n)==1 for j in group)]
                if not adjacent:break
                x=rng.choice(adjacent);group.append(x);free.remove(x)
            group.sort();v=[board[i] for i in group]
            available=[]
            for op in ops:
                if op in ['+','×']: available.append(op)
                if op=='-' and len(v)==2:available.append(op)
                if op=='/' and len(v)==2 and max(v)%min(v)==0 and max(v)!=min(v):available.append(op)
                if op=='odd' and all(x%2 for x in v):available.extend([op]*4)
                if op=='even' and all(not x%2 for x in v):available.extend([op]*4)
                if op=='straight' and len(set(v))==len(v) and max(v)-min(v)==len(v)-1:available.extend([op]*4)
                if op=='<' and len(v)==2 and v[0]<v[1]:available.extend([op]*5)
            op='=' if len(group)==1 else rng.choice(available)
            cage={'cells':group,'op':op}
            if op=='=':cage['target']=v[0]
            elif op=='+':cage['target']=sum(v)
            elif op=='×':
                import math
                cage['target']=math.prod(v)
            elif op=='-':cage['target']=abs(v[0]-v[1])
            elif op=='/':cage['target']=max(v)//min(v)
            cages.append(cage)
        if sum(c['op']=='=' for c in cages)>(4 if index==0 else 0 if index==4 else 2):continue
        present={c['op'] for c in cages}
        needed= [{'+'},{'×'},{'-','/'},{'odd','even'},{'straight'},{'<','straight','odd','even'}][index]
        if not needed<=present:continue
        p={'id':id,'title':title,'size':n,'difficulty':difficulty,'subtitle':subtitle,'lesson':lesson,'cages':cages}
        if len(count(p))==1:
            if index==4:
                import subprocess
                probe = subprocess.run(['node','--import','tsx','--input-type=module','-e', "import {readFileSync} from 'node:fs';import {possibilities} from './src/logic.ts';let p=JSON.parse(readFileSync(0,'utf8'));console.log(possibilities(p,Array(p.size*p.size).fill(0)).every(d=>d.length===1));"],input=json.dumps(p),text=True,capture_output=True,check=True)
                if probe.stdout.strip()=='true': continue
            break
    else:raise Exception('Unable to author puzzle')
    if index==0:result=[]
    result.append(p); print(id,attempt,len(cages))
Path('src/puzzles.json').write_text(json.dumps(result,indent=2)+'\n')
