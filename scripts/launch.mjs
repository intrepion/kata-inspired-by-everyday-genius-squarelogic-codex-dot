import {spawn} from 'node:child_process';
import {openSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:net';
import {resolve} from 'node:path';
const cwd=resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT??5196);
const probe=createServer();
probe.on('error',()=>{console.error(`Port ${port} is in use. Existing servers were left intact.`);process.exitCode=1;});
probe.listen(port,'127.0.0.1',()=>probe.close(()=>{
 const log=openSync(resolve(cwd,'.server.log'),'a');
 const child=spawn(process.execPath,[resolve(cwd,'scripts/serve.mjs')],{cwd,detached:true,stdio:['ignore',log,log],env:{...process.env,PORT:String(port)}});
 child.unref();writeFileSync(resolve(cwd,'.server.pid'),String(child.pid));
 console.log(`Started session-only server PID ${child.pid}: http://127.0.0.1:${port}`);
}));
