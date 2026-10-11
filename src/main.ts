import './style.css';
import rawPuzzles from './puzzles.json';
import { complete, explain, hint, label, possibilities, solve, tuples, type Puzzle } from './logic';
import { blank, decode, edit, redo, reset, undo, type Session } from './state';
const puzzles=rawPuzzles as Puzzle[];
const key='lantern-ledger-v1';
let storageMessage='Saved on this device';
let raw:string|null=null;
try{raw=localStorage.getItem(key);}catch{storageMessage='Storage unavailable • progress lasts only this visit';}
let save=decode(raw,puzzles);
let selected=0,notesMode=false,message='',showPossibilities=false;
const app=document.querySelector<HTMLDivElement>('#app')!;
const lantern=`<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M29 17 Q40 -1 51 17 M23 25 L57 25 L64 39 L58 78 L22 78 L16 39 Z M23 25 L20 19 L60 19 L57 25 M22 78 L18 86 L62 86 L58 78 M16 39 L64 39 M28 39 L30 78 M52 39 L50 78" fill="none" stroke="currentColor" stroke-width="3"/><path d="M40 47 C22 69 38 76 45 67 C53 60 42 56 40 47" fill="currentColor"/></svg>`;
function persist(){try{localStorage.setItem(key,JSON.stringify(save));storageMessage='Saved on this device';}catch{storageMessage='Could not save • keep this tab open';}}
function current(){return save.sessions[puzzles[save.active].id]??blank(puzzles[save.active].size);}
function change(s:Session){const p=puzzles[save.active];if(complete(p,s.now.values))s={...s,earned:true};save.sessions[p.id]=s;message='';persist();render();focusCell();}
function focusCell(){document.querySelector<HTMLButtonElement>(`[data-cell="${selected}"]`)?.focus({preventScroll:true});}
function choose(i:number){save.active=i;selected=0;message='';notesMode=false;persist();render();focusCell();}
function enter(value:number){change(edit(current(),selected,value,notesMode));}
function render(){
 const p=puzzles[save.active],s=current(),values=s.now.values,ds=possibilities(p,values);
 const done=complete(p,values),filled=values.filter(Boolean).length;
 const contradiction=!solve(p,values,1).length;
 const cageIndex=p.cages.findIndex(c=>c.cells.includes(selected)),cage=p.cages[cageIndex];
 const cageName=String.fromCharCode(65+cageIndex);
 const combinations=tuples(p)[cageIndex].filter(t=>t.every((v,j)=>ds[cage.cells[j]].includes(v)));
 const lit=puzzles.filter(q=>save.sessions[q.id].earned).length;
 app.innerHTML=`<header class="masthead"><a href="#" id="brand" aria-label="Lantern Ledger home"><span class="brand-art">${lantern}</span><span>Lantern Ledger<small>A LITTLE LIGHT, A LITTLE LOGIC</small></span></a><button id="guide" class="quiet">How to play <span>↗</span></button></header>
 <main><aside class="journey"><div class="eyebrow">THE LANTERN MAKER'S COLLECTION</div><h1>Make room <br>for a bright idea.</h1><p class="intro">Six small puzzles. A handful of numbers. <br>Take your time and find the light.</p><div class="journey-count"><span>${lit} / 6 lanterns lit</span><div class="progress"><i style="width:${lit/6*100}%"></i></div></div><nav aria-label="Puzzle collection">${puzzles.map((q,i)=>`<button class="chapter ${i===save.active?'active':''}" data-puzzle="${i}" ${i===save.active?'aria-current="step"':''}><span class="chapter-no">${save.sessions[q.id].earned?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${q.title}</strong><small>${q.size} × ${q.size} · ${q.difficulty}</small></span><span class="chapter-arrow">${i===save.active?'↗':'·'}</span></button>`).join('')}</nav><div class="margin-note">${lantern}<p>“A well-made lantern begins<br>with a little patience.”<small>FROM THE WORKSHOP LEDGER</small></p></div></aside>
 <section class="workbench" aria-label="Puzzle workbench"><div class="puzzle-heading"><div><div class="eyebrow">PAGE ${String(save.active+1).padStart(2,'0')} <span> / </span> ${p.difficulty.toUpperCase()}</div><h2>${p.title}</h2><p>${p.subtitle}</p></div><span class="size-stamp">${p.size}×${p.size}<small>USE 1–${p.size}</small></span></div>
 <div class="board-meta"><span>${filled} of ${p.size*p.size} cells filled</span><span class="save-status">${storageMessage}</span></div>
 <div class="board ${contradiction?'contradiction':''}" style="--size:${p.size}" role="group" aria-label="${p.title}, ${p.size} by ${p.size} puzzle">${values.map((value,i)=>{
  const ci=p.cages.findIndex(c=>c.cells.includes(i)),c=p.cages[ci];
  const edges=[i<p.size||!c.cells.includes(i-p.size),i%p.size===p.size-1||!c.cells.includes(i+1),i>=p.size*(p.size-1)||!c.cells.includes(i+p.size),i%p.size===0||!c.cells.includes(i-1)];
  const name=String.fromCharCode(65+ci);
  const mark=c.op==='<'?`<span class="order">${c.cells.indexOf(i)+1}</span>`:'';
  return `<button data-cell="${i}" tabindex="${i===selected?0:-1}" aria-label="Row ${Math.floor(i/p.size)+1}, column ${i%p.size+1}, cage ${name} ${label(c)}, ${value?'value '+value:'empty'}${s.now.notes[i].length?', notes '+s.now.notes[i].join(', '):''}" aria-pressed="${i===selected}" class="cell tone-${ci%8} ${ci===cageIndex?'in-cage':''} ${i===selected?'selected':''}" style="border-width:${edges.map(x=>x?'2px':'1px').join(' ')};border-color:${edges.map(x=>x?'var(--ink)':'#153f3b18').join(' ')}">${i===c.cells[0]?`<span class="clue">${name} <b>${label(c)}</b></span>`:''}${mark}${value?`<span class="value">${value}</span>`:`<span class="cell-notes">${Array.from({length:p.size},(_,j)=>`<span class="${s.now.notes[i].includes(j+1)?'pencilled':''} ${showPossibilities&&ds[i].includes(j+1)?'possible':''}">${s.now.notes[i].includes(j+1)||showPossibilities&&ds[i].includes(j+1)?j+1:''}</span>`).join('')}</span>`}</button>`;
 }).join('')}</div>
 <div class="entry-tools"><button id="notes" class="mode ${notesMode?'on':''}" aria-pressed="${notesMode}">✎ Notes ${notesMode?'on':'off'}</button><div class="digits" aria-label="Enter a number">${Array.from({length:p.size},(_,i)=>`<button data-value="${i+1}" aria-label="${notesMode?'Toggle note':'Enter'} ${i+1}">${i+1}</button>`).join('')}<button data-value="0" aria-label="Erase selected cell" title="Erase">⌫</button></div></div>
 <div class="actions"><button id="undo" ${!s.past.length?'disabled':''}>↶ Undo</button><button id="redo" ${!s.future.length?'disabled':''}>↷ Redo</button><button id="check">Check</button><button id="hint">✧ Hint</button><button id="reset" class="reset">Reset</button></div>
 <div class="feedback ${done?'success':contradiction?'warning':''}" role="status" aria-live="polite">${message|| (done?lit===6?'The collection is complete. All six lanterns are lit. Replay any page whenever you like.':'Lantern lit! Every row, column and cage agrees.':contradiction?'A contradiction has appeared. Check or undo your recent entries.':'Follow the clues. Every row and column uses each number exactly once.')}</div>
 ${done&&save.active<5?'<button id="next" class="primary">Light the next lantern →</button>':''}
 <p class="keyboard">ARROWS to move · 1–${p.size} to enter · N for notes · DELETE to erase</p></section>
 <aside class="field-guide"><div class="guide-card"><div class="eyebrow">A NOTE FROM THE WORKSHOP</div><h3>${save.active===0?'Start with what you know.':'Let the clues work together.'}</h3><p>${p.lesson}</p><button id="possible" class="toggle" aria-pressed="${showPossibilities}">${showPossibilities?'Hide':'Show'} automatic possibilities</button><small class="fine">Possibilities use cage, row and column elimination. Pencil notes are yours; they never change the rules.</small></div>
 <div class="cage-card"><div class="eyebrow">SELECTED CAGE <span class="cage-chip">${cageName}</span></div><div class="cage-rule">${label(cage)}</div><p>${explain(cage)}</p><h4>${combinations.length} supported combination${combinations.length===1?'':'s'}</h4><p class="fine">Ordered by cells: ${cage.cells.map((i,j)=>`${cageName}${j+1} = r${Math.floor(i/p.size)+1}c${i%p.size+1}`).join(' · ')}. Local support does not guarantee a whole-board completion.</p><div class="combinations">${combinations.slice(0,12).map(t=>`<span>${t.join(' · ')}</span>`).join('')||'<span>No local combination remains.</span>'}</div>${combinations.length>12?`<p class="fine">Showing 12 of ${combinations.length}.</p>`:''}</div><div class="rule-reminder"><span>01</span><p>Every row and column:<br><strong>one of each number.</strong></p><span>02</span><p>Every outlined cage:<br><strong>one shared rule.</strong></p></div></aside></main><footer>MADE FOR QUIET MOMENTS <span>Original puzzles · No timers · No penalties</span></footer>
 <dialog id="tutorial" aria-labelledby="tutorial-title"><button id="close-guide" class="dialog-close" aria-label="Close tutorial">×</button><div class="eyebrow">WELCOME TO THE WORKSHOP</div><h2 id="tutorial-title">A little light,<br>a little logic.</h2><p>Fill a ${p.size}×${p.size} board with <strong>1–${p.size}</strong>. Each number appears exactly once in every row and column. There are no Sudoku boxes.</p><ol><li><strong>Read the cages.</strong> Thick outlines and letters group cells. 5+ means the cage numbers add to 5; 8× means their product is 8; 3= is a fixed value.</li><li><strong>Mind the operation.</strong> Two-cell 2− means larger minus smaller is 2; 2÷ means larger divided by smaller is exactly 2. Either order is allowed.</li><li><strong>Explore new rules.</strong> ODD/EVEN constrain every cage cell. RUN means distinct consecutive numbers in any order. 1 &lt; 2 compares the cells marked 1 and 2.</li><li><strong>Keep possibilities.</strong> Select a cell, then enter a number. Notes mode toggles pencil marks. Automatic possibilities and selected-cage combinations help you reason. Repeats are allowed inside a cage if its rule permits and they do not share a row or column.</li><li><strong>Take your time.</strong> Hints explain forced entries without filling them. Check detects contradictions, not just duplicates. Undo/redo includes notes and resets. Progress saves after every edit; all pages are open for replay.</li></ol><button id="begin" class="primary">Back to the ledger →</button></dialog>
 <dialog id="reset-dialog" aria-labelledby="reset-title"><h2 id="reset-title">Begin this page again?</h2><p>Clear entries and pencil notes on <strong>${p.title}</strong>. Your earned lantern stays lit. You can undo the reset.</p><div class="dialog-actions"><button id="cancel-reset">Keep my work</button><button id="confirm-reset" class="primary">Reset this page</button></div></dialog>`;
 bind();
}
function bind(){
 app.querySelectorAll<HTMLButtonElement>('[data-puzzle]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.puzzle)));
 app.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.cell);render();focusCell();});
 app.querySelectorAll<HTMLButtonElement>('[data-value]').forEach(b=>b.onclick=()=>enter(Number(b.dataset.value)));
 const click=(id:string,fn:()=>void)=>{const b=document.getElementById(id);if(b)b.onclick=fn;};
 click('brand',()=>choose(0));
 click('notes',()=>{notesMode=!notesMode;render();focusCell();});
 click('possible',()=>{showPossibilities=!showPossibilities;render();document.getElementById('possible')?.focus();});
 click('undo',()=>change(undo(current())));click('redo',()=>change(redo(current())));
 click('check',()=>{message=solve(puzzles[save.active],current().now.values,1).length?'These entries can be extended to a valid solution. Keep going; pencil notes were not checked.':'These entries contradict the puzzle rules. Erase or undo a recent entry. Pencil notes were not checked.';render();document.getElementById('check')?.focus();});
 click('hint',()=>{const h=hint(puzzles[save.active],current().now.values);message=h.text;if(h.cell!==undefined)selected=h.cell;render();focusCell();});
 click('next',()=>choose(save.active+1));
 const tutorial=document.querySelector<HTMLDialogElement>('#tutorial')!,resetDialog=document.querySelector<HTMLDialogElement>('#reset-dialog')!;
 click('guide',()=>tutorial.showModal());
 click('close-guide',()=>tutorial.close());click('begin',()=>tutorial.close());
 click('reset',()=>resetDialog.showModal());click('cancel-reset',()=>resetDialog.close());click('confirm-reset',()=>change(reset(current())));
}
document.addEventListener('keydown',event=>{
 if(document.querySelector('dialog[open]')||event.altKey)return;
 const p=puzzles[save.active];
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();change(event.shiftKey?redo(current()):undo(current()));return;}
 if(event.ctrlKey||event.metaKey)return;
 if(event.repeat)return;
 if(/^[1-9]$/.test(event.key)&&Number(event.key)<=p.size){event.preventDefault();enter(Number(event.key));return;}
 if(event.key.toLowerCase()==='n'){event.preventDefault();notesMode=!notesMode;render();focusCell();return;}
 if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();enter(0);return;}
 if((event.target as HTMLElement).matches('[data-cell]')&&event.key.startsWith('Arrow')){
  event.preventDefault();const row=Math.floor(selected/p.size),col=selected%p.size;
  if(event.key==='ArrowLeft'&&col>0)selected--;
  if(event.key==='ArrowRight'&&col<p.size-1)selected++;
  if(event.key==='ArrowUp'&&row>0)selected-=p.size;
  if(event.key==='ArrowDown'&&row<p.size-1)selected+=p.size;
  render();focusCell();
 }
});
render();
