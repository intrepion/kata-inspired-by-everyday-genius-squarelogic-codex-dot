import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accepts } from '../src/logic.ts';
test('quotients are exact and differences ignore order', () => {
 assert.equal(accepts({op:'/',target:2},[4,2]),true);
 assert.equal(accepts({op:'/',target:2},[3,2]),false);
 assert.equal(accepts({op:'-',target:3},[1,4]),true);
 assert.equal(accepts({op:'-',target:3},[4,1]),true);
});
import { blank, edit, undo, redo, reset, decode } from '../src/state.ts';
test('notes toggle, repeated values do not create history and a branch clears redo',()=>{
 let s=blank(4);s=edit(s,0,2,true);assert.deepEqual(s.now.notes[0],[2]);s=edit(s,0,2,true);assert.deepEqual(s.now.notes[0],[]);
 s=edit(s,0,3,false);const same=edit(s,0,3,false);assert.equal(same,s);
 s=undo(s);assert.equal(s.now.values[0],0);s=redo(s);assert.equal(s.now.values[0],3);
 s=edit(undo(s),0,4,false);assert.equal(s.future.length,0);
 s=undo(reset(s));assert.equal(s.now.values[0],4);
});
test('save validation recovers partial and malformed data',()=>{
 assert.equal(decode('{broken',[]).active,0);
});
import puzzlesData from '../src/puzzles.json';
import { complete, solve, possibilities, hint, tuples, type Puzzle } from '../src/logic.ts';
const puzzles=puzzlesData as Puzzle[];
test('all rule families use explicit known semantics',()=>{
 assert.equal(accepts({op:'+' ,target:6},[2,2,2]),true);
 assert.equal(accepts({op:'×',target:12},[2,2,3]),true);
 assert.equal(accepts({op:'odd'},[1,3,5]),true);
 assert.equal(accepts({op:'odd'},[1,2]),false);
 assert.equal(accepts({op:'even'},[2,4]),true);
 assert.equal(accepts({op:'even'},[2,3]),false);
 assert.equal(accepts({op:'straight'},[4,2,3]),true);
 assert.equal(accepts({op:'straight'},[2,2,3]),false);
 assert.equal(accepts({op:'straight'},[1,3,4]),false);
 assert.equal(accepts({op:'<'},[1,4]),true);
 assert.equal(accepts({op:'<'},[4,1]),false);
 assert.equal(accepts({op:'=' ,target:4},[4]),true);
 assert.equal(accepts({op:'=' ,target:4},[2,2]),false);
});
test('cages allow repeats across rows/columns, but not inside a row',()=>{
 const p: Puzzle={...puzzles[0],size:3,cages:[{op:'+',target:5,cells:[0,1,4]}]};
 assert.ok(tuples(p)[0].some(t=>t.join()==='2,1,2'));
 assert.ok(!tuples(p)[0].some(t=>t.join()==='2,2,1'));
});
test('Latin constraints alone are not unique and contradictory entries have no solutions',()=>{
 const p: Puzzle={...puzzles[0],size:2,cages:[{op:'+',target:3,cells:[0,1]},{op:'+',target:3,cells:[2,3]}]};
 assert.equal(solve(p).length,2);
 assert.equal(solve(p,[1,1,0,0]).length,0);
 assert.equal(complete(p,[1,2,2,1]),true);
 assert.equal(complete(p,[1,1,2,2]),false);
 assert.equal(complete(p,[1,2,2,0]),false);
 assert.equal(solve(p,[0]).length,0);
});
for(const p of puzzles) test(`${p.id}: unique and every explained hint is valid`,()=>{
 const solutions=solve(p);assert.equal(solutions.length,1);
 assert.equal(complete(p,solutions[0]),true);
 let entries=Array(p.size*p.size).fill(0),steps=0;
 while(!complete(p,entries)){
  const h=hint(p,entries);assert.notEqual(h.cell,undefined,h.text);assert.notEqual(h.value,undefined);
  assert.equal(solutions[0][h.cell!],h.value);
  // Excluding the hinted value must eliminate every solution; check each alternative separately.
  for(let v=1;v<=p.size;v++)if(v!==h.value){const alt=[...entries];alt[h.cell!]=v;assert.equal(solve(p,alt,1).length,0);}
  entries[h.cell!]=h.value;assert.ok(++steps<=p.size*p.size);
 }
 const wrong=[...solutions[0]];wrong[0]=wrong[1];assert.equal(solve(p,wrong,1).length,0);
 assert.match(hint(p,wrong).text,/cannot lead/);
 assert.ok(possibilities(p,wrong).some(d=>d.length===0));
});
test('validated saves preserve notes, partial entries, undo/redo and earned replay badges',()=>{
 const p=puzzles[0];let s=blank(p.size);s=edit(s,0,2,true);s=edit(s,1,3,false);s={...undo(s),earned:true};
 const save={version:1,active:2,sessions:{[p.id]:s}};
 const recovered=decode(JSON.stringify(save),puzzles);assert.deepEqual(recovered.sessions[p.id],s);assert.equal(recovered.active,2);
 assert.equal(redo(recovered.sessions[p.id]).now.values[1],3);
 assert.equal(reset(recovered.sessions[p.id]).earned,true);
 const partial=decode(JSON.stringify({version:1,active:99,sessions:{[p.id]:{now:{values:s.now.values,notes:[[2,2,99,'bad']]},past:[{},s.now],future:'bad'}}}),puzzles);
 assert.equal(partial.active,0);assert.deepEqual(partial.sessions[p.id].now.notes[0],[2]);assert.equal(partial.sessions[p.id].past.length,1);assert.equal(partial.sessions[p.id].future.length,0);
 assert.deepEqual(decode(JSON.stringify({version:2}),puzzles).sessions[p.id],blank(p.size));
 const invalid=decode(JSON.stringify({version:1,sessions:{[p.id]:{now:{values:Array(16).fill(9)}}}}),puzzles);assert.deepEqual(invalid.sessions[p.id],blank(4));
});
test('invalid cell indices are rejected for entries and notes',()=>{
 const s=blank(4);for(const index of [NaN,0.5,-1,16,Infinity]){assert.equal(edit(s,index,2,false),s);assert.equal(edit(s,index,2,true),s);}
});
