/**
 * AXIA ACI intake API — Cloudflare Worker + D1.
 * Private recipient and API key MUST be set in Cloudflare secrets.
 * No secret, sensitive data or real contact list goes into GitHub.
 */
const json=(obj,status=200,headers={})=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const cors=(origin,env)=>origin===env.PUBLIC_ORIGIN?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'content-type,authorization','vary':'Origin'}:{};
const xss=s=>String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=(value,max)=>String(value||'').trim().slice(0,max);
const num=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const productSet=new Set(['safe','advance','credit_waitlist']);
const states=new Set(['recibida','en_validacion','pendiente_informacion','aprobada','rechazada','desembolsada','cerrada']);
const uuidOk=s=>typeof s==='string'&&/^[a-f0-9-]{36}$/i.test(s);
function check(body){
 if(!body||!productSet.has(body.product))return 'Producto inválido';
 if(!body.consent)return 'Se requiere consentimiento';
 if(!uuidOk(body.requestId))return 'Identificador inválido';
 if(!/^[\p{L}\p{M}\s.'-]{3,90}$/u.test(String(body.name||'')))return 'Nombre inválido';
 if(!/^\d{10}$/.test(String(body.phone||'')))return 'Teléfono inválido';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email||''))||String(body.email).length>120)return 'Correo inválido';
 if(String(body.employeeReference||'').length>35)return 'Referencia inválida';
 if(!/^AXIA_ACI_20261125$/.test(String(body.source||'')))return 'Origen inválido';
 if(body.product!=='credit_waitlist'){
  const s=body.simulation;
  if(!s||typeof s!=='object')return 'Falta simulación';
  if(body.product==='safe'&&(!num(s.amount,150,100000)||![24,52].includes(s.frequency)||!num(s.years,1,3)))return 'Simulación de ahorro inválida';
  if(body.product==='advance'&&(!num(s.salary,0,1000000)||!num(s.days,0,30)||!num(s.want,1,1000000)||!num(s.cap,0,1000000)||s.want>s.cap))return 'Simulación de anticipo inválida';
 }
 return null;
}
async function notify(row,env){
 if(!env.NOTIFY_EMAIL||!env.RESEND_API_KEY||!env.MAIL_FROM)return {ok:false,error:'not_configured'};
 const body=['Nueva solicitud AXIA / ACI','Folio: '+row.folio,'Producto: '+row.product,'Nombre: '+row.name,'Telefono: '+row.phone,'Correo: '+row.email,'Referencia: '+(row.employee_reference||'—'),'Simulacion: '+row.simulation_json,'Registro: '+row.created_at].join('\n');
 try{
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[env.NOTIFY_EMAIL],subject:'AXIA ACI | Nueva solicitud '+row.folio,text:body})});
 const payload=await r.json().catch(()=>({}));
 return {ok:r.ok,error:r.ok?'':String(payload.message||r.status)};
 }catch(e){return {ok:false,error:'transport_error'}}
}
const csvCell=value=>{let s=String(value??'').replace(/^[\s]*[=+\-@]/,"'&");return '"'+s.replace(/"/g,'""')+'"'};
async function adminAuth(req,env){
 const auth=req.headers.get('authorization')||'';
 if(!env.ADMIN_TOKEN||!auth.startsWith('Bearer '))return false;
 const value=auth.slice(7);
 if(value.length!==env.ADMIN_TOKEN.length)return false;
 // Constant-time comparison is supplied by WebCrypto.
 const a=new TextEncoder().encode(value),b=new TextEncoder().encode(env.ADMIN_TOKEN);
 return crypto.subtle.timingSafeEqual?crypto.subtle.timingSafeEqual(a,b):a.every((x,i)=>x===b[i]);
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),origin=request.headers.get('Origin')||'',headers=cors(origin,env),method=request.method.toUpperCase();
 if(method==='OPTIONS')return origin===env.PUBLIC_ORIGIN?new Response(null,{status:204,headers}):json({error:'Origen no autorizado'},403);
 if(origin&&origin!==env.PUBLIC_ORIGIN)return json({error:'Origen no autorizado'},403);
 if(url.pathname==='/health')return json({service:'axia-aci-intake',ok:!!env.DB,configured:{notifications:!!(env.NOTIFY_EMAIL&&env.RESEND_API_KEY&&env.MAIL_FROM)}},200,headers);
 if(!env.DB)return json({error:'Base de datos no configurada'},503,headers);
 if(url.pathname==='/api/intake'&&method==='POST'){
   if(Number(request.headers.get('content-length')||0)>14000)return json({error:'Solicitud demasiado grande'},413,headers);
   let body;try{body=await request.json()}catch(e){return json({error:'JSON inválido'},400,headers)}
   const err=check(body);if(err)return json({error:err},400,headers);
   const name=clean(body.name,90),phone=body.phone,email=clean(body.email,120).toLowerCase(),reference=clean(body.employeeReference,35);
   const existing=await env.DB.prepare('SELECT folio FROM requests WHERE request_id=?').bind(body.requestId).first();
   if(existing)return json({folio:existing.folio,duplicate:true},200,headers);
   // Rate limit by contact/email+source, without recording IP.
   const rate=await env.DB.prepare("SELECT COUNT(*) AS count FROM requests WHERE email=? AND created_at > datetime('now','-15 minutes')").bind(email).first();
   if((rate?.count||0)>=3)return json({error:'Límite de intentos. Contacta a RH'},429,headers);
   const folio='ACI-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
   try{await env.DB.prepare("INSERT INTO requests(request_id,folio,product,name,phone,email,employee_reference,simulation_json,source,consent_at,state,mail_status) VALUES(?,?,?,?,?,?,?,?,?,datetime('now'),'recibida','pendiente')").bind(body.requestId,folio,body.product,name,phone,email,reference,JSON.stringify(body.simulation||{}),body.source).run();}
   catch(e){return json({error:'No se pudo guardar la solicitud'},503,headers)}
   const row=await env.DB.prepare('SELECT * FROM requests WHERE folio=?').bind(folio).first();
   const emailResult=await notify(row,env);
   await env.DB.prepare("UPDATE requests SET mail_status=?, mail_error=? WHERE folio=?").bind(emailResult.ok?'aceptado_por_proveedor':'pendiente_reenvio',emailResult.error,folio).run();
   return json({folio,received:true,mailStatus:emailResult.ok?'aceptado_por_proveedor':'pendiente_reenvio'},201,headers);
 }
 if(url.pathname.startsWith('/api/admin/')){
   if(!(await adminAuth(request,env)))return json({error:'No autorizado'},401,headers);
   if(url.pathname==='/api/admin/requests'&&method==='GET'){
     const list=await env.DB.prepare('SELECT folio,product,name,phone,email,employee_reference,simulation_json,created_at,state,assignee,mail_status,updated_at FROM requests ORDER BY id DESC LIMIT 1000').all();
     return json({rows:list.results},200,headers)
   }
   if(url.pathname==='/api/admin/export'&&method==='GET'){
     const list=await env.DB.prepare('SELECT folio,product,name,phone,email,employee_reference,created_at,state,assignee,mail_status FROM requests ORDER BY id DESC LIMIT 3000').all();
     const cols=['folio','product','name','phone','email','employee_reference','created_at','state','assignee','mail_status'];
     const csv='\uFEFF'+[cols.join(','),...(list.results||[]).map(row=>cols.map(c=>csvCell(row[c])).join(','))].join('\r\n');
     return new Response(csv,{status:200,headers:{...headers,'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="AXIA_ACI_solicitudes.csv"','cache-control':'no-store'}});
   }
   const match=url.pathname.match(/^\/api\/admin\/requests\/(ACI-[A-Z0-9-]+)$/);
   if(match&&method==='PATCH'){
     let body;try{body=await request.json()}catch(e){return json({error:'JSON inválido'},400,headers)}
     if(!states.has(body.state)||String(body.assignee||'').length>80)return json({error:'Estado o responsable inválidos'},400,headers);
     const upd=await env.DB.prepare("UPDATE requests SET state=?,assignee=?,updated_at=datetime('now') WHERE folio=?").bind(body.state,clean(body.assignee,80),match[1]).run();
     return json({updated:upd.meta.changes>0},200,headers)
   }
   const retry=url.pathname.match(/^\/api\/admin\/retry-email\/(ACI-[A-Z0-9-]+)$/);
   if(retry&&method==='POST'){
     const row=await env.DB.prepare('SELECT * FROM requests WHERE folio=?').bind(retry[1]).first();
     if(!row)return json({error:'No encontrado'},404,headers);
     const result=await notify(row,env);
     await env.DB.prepare("UPDATE requests SET mail_status=?,mail_error=? WHERE folio=?").bind(result.ok?'aceptado_por_proveedor':'pendiente_reenvio',result.error,row.folio).run();
     return json({accepted:result.ok},result.ok?200:503,headers);
   }
 }
 return json({error:'Ruta no encontrada'},404,headers)
}};
