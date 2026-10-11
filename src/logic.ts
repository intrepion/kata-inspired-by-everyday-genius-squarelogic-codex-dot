export type Op = '=' | '+' | '×' | '-' | '/' | 'odd' | 'even' | 'straight' | '<';
export interface Rule { op: Op; target?: number }
export interface Cage extends Rule { cells: number[] }
export interface Puzzle { id: string; title: string; size: number; difficulty: string; subtitle: string; lesson: string; cages: Cage[] }
export function accepts(rule: Rule, values: number[]): boolean {
 const {op,target} = rule;
 if (values.length === 0 || values.some(v => !Number.isInteger(v) || v < 1)) return false;
 switch(op) {
  case '=': return values.length === 1 && values[0] === target;
  case '+': return values.reduce((a,b)=>a+b,0) === target;
  case '×': return values.reduce((a,b)=>a*b,1) === target;
  case '-': return values.length === 2 && Math.abs(values[0]-values[1]) === target;
  case '/': return values.length === 2 && Math.max(...values) === Math.min(...values) * (target ?? 0);
  case 'odd': return values.every(v=>v%2===1);
  case 'even': return values.every(v=>v%2===0);
  case 'straight': return new Set(values).size === values.length && Math.max(...values)-Math.min(...values) === values.length-1;
  case '<': return values.length === 2 && values[0]<values[1];
 }
}
export const label = (c: Rule) => ['odd','even','straight'].includes(c.op) ? ({odd:'ODD',even:'EVEN',straight:'RUN'} as Record<string,string>)[c.op] : c.op==='<' ? '1 < 2' : `${c.target}${c.op==='/'?'÷':c.op==='-'?'−':c.op}`;
export function explain(c: Cage): string {
 switch(c.op) {
 case '=': return `This single cell equals ${c.target}.`;
 case '+': return `All ${c.cells.length} numbers add to ${c.target}. Repeats are allowed unless they share a row or column.`;
 case '×': return `Multiply all ${c.cells.length} numbers to get ${c.target}. Repeats are allowed unless they share a row or column.`;
 case '-': return `The larger number minus the smaller equals ${c.target}. Either order is allowed.`;
 case '/': return `The larger number divided by the smaller equals exactly ${c.target}. Either order is allowed.`;
 case 'odd': return 'Every cell in this cage is odd (1, 3, or 5 on a five-wide board).';
 case 'even': return 'Every cell in this cage is even (2 or 4 on a five-wide board).';
 case 'straight': return `These ${c.cells.length} numbers form a consecutive set, in any order, without repeats. For example 2, 3, 4.`;
 case '<': return 'The cell marked 1 is smaller than the cell marked 2. The numbers need not be consecutive.';
 }
}
export function peers(a: number,b: number,n: number): boolean { return Math.floor(a/n)===Math.floor(b/n) || a%n===b%n; }
// Ordered tuples respect internal row/column relationships, not a blanket cage no-repeat rule.
const tupleCache = new WeakMap<Puzzle,number[][][]>();
export function tuples(p: Puzzle): number[][][] {
 const cached=tupleCache.get(p); if(cached) return cached;
 const result=p.cages.map(c=>{
  const found:number[][]=[]; const row:number[]=[];
  function visit() {
   if(row.length===c.cells.length) { if(accepts(c,row)) found.push([...row]); return; }
   const pos=row.length;
   for(let v=1;v<=p.size;v++) {
    if(row.some((x,j)=>x===v && peers(c.cells[j],c.cells[pos],p.size))) continue;
    row.push(v); visit(); row.pop();
   }
  }
  visit(); return found;
 });
 tupleCache.set(p,result); return result;
}
export function possibilities(p: Puzzle, entries: number[]): number[][] {
 const ds=entries.map((v,i)=>v ? [v] : Array.from({length:p.size},(_,j)=>j+1).filter(x=>!entries.some((w,k)=>k!==i && w===x && peers(i,k,p.size))));
 if(entries.some((v,i)=>v && entries.some((w,k)=>k!==i && w===v && peers(i,k,p.size)))) return ds.map(()=>[]);
 let changed=true;
 while(changed) {
  changed=false;
  p.cages.forEach((c,ci)=>{
   const supported=tuples(p)[ci].filter(t=>t.every((v,j)=>ds[c.cells[j]].includes(v)));
   c.cells.forEach((cell,j)=>{const next=ds[cell].filter(v=>supported.some(t=>t[j]===v)); if(next.length!==ds[cell].length){ds[cell]=next;changed=true;}});
  });
  for(let a=0;a<ds.length;a++) if(ds[a].length===1) for(let b=0;b<ds.length;b++) {
   if(a===b || !peers(a,b,p.size)) continue;
   const next=ds[b].filter(v=>v!==ds[a][0]);
   if(next.length!==ds[b].length){ds[b]=next;changed=true;}
  }
 }
 return ds;
}
export function solve(p: Puzzle, entries: number[]=Array(p.size*p.size).fill(0), limit=2): number[][] {
 const solutions:number[][]=[];
 if(entries.length!==p.size*p.size || entries.some(v=>!Number.isInteger(v)||v<0||v>p.size)) return solutions;
 function search(board:number[]) {
  const ds=possibilities(p,board); if(ds.some(d=>!d.length)) return;
  const next=board.map((v,i)=>v || (ds[i].length===1?ds[i][0]:0));
  if(next.every(Boolean)){if(complete(p,next)) solutions.push(next);return;}
  const cell=ds.reduce((best,d,i)=>!next[i] && (best<0||d.length<ds[best].length)?i:best,-1);
  for(const v of ds[cell]) {const branch=[...next];branch[cell]=v;search(branch);if(solutions.length>=limit)return;}
 }
 search([...entries]); return solutions;
}
export function complete(p: Puzzle, entries: number[]): boolean {
 return entries.length===p.size*p.size && entries.every((v,i)=>Number.isInteger(v)&&v>=1&&v<=p.size&&!entries.some((w,k)=>i!==k&&v===w&&peers(i,k,p.size))) && p.cages.every(c=>accepts(c,c.cells.map(i=>entries[i])));
}
export interface Hint {cell?: number; value?:number; text:string}
export function hint(p: Puzzle, entries: number[]): Hint {
 if(!solve(p,entries,1).length) return {text:'These entries cannot lead to a valid board. Undo or erase a recent entry; notes are not treated as facts.'};
 if(complete(p,entries)) return {text:'Every row, column and cage agrees. This lantern is lit!'};
 const ds=possibilities(p,entries);
 const single=ds.findIndex((d,i)=>!entries[i]&&d.length===1);
 if(single>=0) return {cell:single,value:ds[single][0],text:`Row ${Math.floor(single/p.size)+1}, column ${single%p.size+1}: only ${ds[single][0]} survives repeated row, column and cage elimination. Inspect its cage combinations below. Enter it when you are ready.`};
 for(let i=0;i<entries.length;i++) if(!entries[i]) {
  const viable=ds[i].filter(v=>{const b=[...entries];b[i]=v;return solve(p,b,1).length>0;});
  if(viable.length===1) return {cell:i,value:viable[0],text:`Row ${Math.floor(i/p.size)+1}, column ${i%p.size+1}: ${viable[0]} is forced. Exhaustive constraint search found no valid completion for the alternatives (${ds[i].filter(v=>v!==viable[0]).join(', ')}). This is a proof by contradiction, not a local single.`};
 }
 return {text:'No forced entry found. Explore the selected cage’s combinations and compare them with its rows and columns.'};
}
