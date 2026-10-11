import type { Puzzle } from './logic';
export interface Board {values:number[];notes:number[][]}
export interface Session {now:Board;past:Board[];future:Board[];earned:boolean}
export interface Save {version:1;active:number;sessions:Record<string,Session>}
export const blank=(n:number):Session=>({now:{values:Array(n*n).fill(0),notes:Array.from({length:n*n},()=>[])},past:[],future:[],earned:false});
function push(s:Session,next:Board):Session {return {...s,now:next,past:[...s.past,s.now].slice(-100),future:[]};}
export function edit(s:Session,cell:number,value:number,note:boolean):Session {
 if(cell<0||cell>=s.now.values.length||!Number.isInteger(value)||value<0||value>Math.sqrt(s.now.values.length))return s;
 const next=structuredClone(s.now);
 if(note&&value){if(next.values[cell])return s;const ns=next.notes[cell];next.notes[cell]=ns.includes(value)?ns.filter(v=>v!==value):[...ns,value].sort();}
 else {if(next.values[cell]===value && (value!==0||!next.notes[cell].length))return s;next.values[cell]=value;next.notes[cell]=[];}
 return push(s,next);
}
export const undo=(s:Session):Session=>s.past.length?{...s,now:s.past.at(-1)!,past:s.past.slice(0,-1),future:[s.now,...s.future].slice(0,100)}:s;
export const redo=(s:Session):Session=>s.future.length?{...s,now:s.future[0],past:[...s.past,s.now].slice(-100),future:s.future.slice(1)}:s;
export const reset=(s:Session):Session=>s.now.values.some(Boolean)||s.now.notes.some(x=>x.length)?push(s,blank(Math.sqrt(s.now.values.length)).now):s;
function board(value:unknown,n:number):Board|null {
 if(!value||typeof value!=='object')return null;
 const x=value as Record<string,unknown>;
 if(!Array.isArray(x.values)||x.values.length!==n*n||x.values.some(v=>!Number.isInteger(v)||v<0||v>n))return null;
 const notes=Array.from({length:n*n},(_,i)=>{
  const list=Array.isArray(x.notes)?x.notes[i]:null;
  return x.values instanceof Array && x.values[i]?[]:Array.isArray(list)?[...new Set<number>(list.filter(v=>Number.isInteger(v)&&v>=1&&v<=n))].sort():[];
 });
 return {values:[...x.values],notes};
}
export function decode(raw:string|null,puzzles:Puzzle[]):Save {
 const fallback:Save={version:1,active:0,sessions:Object.fromEntries(puzzles.map(p=>[p.id,blank(p.size)]))};
 try {
  const data=JSON.parse(raw??'null'); if(data?.version!==1)return fallback;
  if(Number.isInteger(data.active)&&data.active>=0&&data.active<puzzles.length)fallback.active=data.active;
  puzzles.forEach(p=>{
   const x=data.sessions?.[p.id];const now=board(x?.now,p.size);if(!now)return;
   const history=(v:unknown):Board[]=>Array.isArray(v)?v.slice(0,100).map(x=>board(x,p.size)).filter((b):b is Board=>b!==null):[];
   fallback.sessions[p.id]={now,past:history(x.past),future:history(x.future),earned:x.earned===true};
  });
 }catch{/* A corrupt save must not prevent play. */}
 return fallback;
}
