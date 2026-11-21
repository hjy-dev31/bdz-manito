import http from 'node:http';
import {readFile} from 'node:fs/promises';
import worker from './worker.mjs';
const origin = 'http://127.0.0.1:4173';
const files = {'/':'index.html','/game.js':'game.js','/login.js':'login.js','/style.css':'style.css','/fonts/Galmuri11-Bold.woff2':'fonts/Galmuri11-Bold.woff2'};
http.createServer(async (req,res)=>{
  try {
    if (req.url === '/login' && req.method === 'POST') {
      const parts = [];
      for await (const part of req) parts.push(part);
      const response = await worker.fetch(new Request(origin+'/login',{method:'POST',body:Buffer.concat(parts)}),{
        SITE_ORIGIN:origin, PARTICIPANTS_CSV:await readFile(new URL('./participants.csv',import.meta.url),'utf8')
      });
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(await response.text());
    } else if (Object.hasOwn(files,req.url)) {
      const file = files[req.url];
      res.setHeader('Content-Type',file.endsWith('.woff2')?'font/woff2':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
      res.end(await readFile(new URL(file,import.meta.url)));
    } else res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
}).listen(4173,'127.0.0.1',()=>console.log(origin));
