/* VALIA: explicit, user-reviewed handoffs. No background lead submission. */
const VALIADiagnostic = (() => {
 const skip = "Prefiero conversarlo";
 const definitions = {
  capital: [
   {id:"objetivo",title:"¿Qué buscas principalmente?",help:"Elige lo más importante para iniciar la conversación.",options:["Explorar ingresos periódicos","Evaluar crecimiento de mi capital","Entender el modelo antes de decidir","Diversificar lo que ya tengo",skip]},
   {id:"monto",title:"¿Qué rango estás considerando?",help:"Es orientativo; no constituye un compromiso ni confirma disponibilidad.",options:["Menos de $100 mil MXN","$100 mil a $499 mil MXN","$500 mil a $999 mil MXN","$1 millón MXN o más","Todavía no defino un monto",skip]},
   {id:"plazo",title:"¿Qué horizonte quieres evaluar?",help:"La duración disponible debe confirmarse en la operación concreta.",options:["Menos de 12 meses","Entre 12 y 24 meses","Más de 24 meses","Necesito entender las alternativas",skip]},
   {id:"liquidez",title:"¿Cuándo podrías necesitar disponer del dinero?",help:"Esta respuesta ayuda a detectar una condición importante antes de hablar de productos.",options:["Podría necesitarlo en cualquier momento","Puedo planearlo con fechas definidas","Podría mantenerlo durante el plazo acordado","Todavía no lo sé",skip]},
   {id:"experiencia",title:"¿Qué experiencia quieres tomar como referencia?",help:"No necesitamos nombres de instituciones, saldos ni datos de tus cuentas.",options:["Principalmente ahorro bancario o CETES","He utilizado fondos u otros instrumentos","He participado en inversiones privadas","Sería mi primera experiencia de inversión",skip]}
  ],
  empresa: [
   {id:"objetivo",title:"¿Qué quieres mejorar para tus colaboradores?",help:"Empezamos por una necesidad; después evaluamos el módulo.",options:["Construir un esquema de ahorro","Ordenar las solicitudes de anticipos","Explorar acceso a crédito responsable","Reducir trabajo manual de RH o nómina","Entender qué podría aplicar",skip]},
   {id:"poblacion",title:"¿A cuántas personas podría aplicar?",help:"Una aproximación basta. No pedimos nómina en esta etapa.",options:["Menos de 50 colaboradores","Entre 50 y 149","Entre 150 y 299","Entre 300 y 499","500 o más","No tengo el dato todavía",skip]},
   {id:"actual",title:"¿Cómo atienden hoy estas solicitudes?",help:"Nos ayuda a entender el punto de partida, sin asumir que funciona mal.",options:["Con recursos y administración de la empresa","Con un proveedor externo","Cada colaborador lo resuelve por su cuenta","Tenemos varios esquemas","Necesito confirmarlo con el equipo",skip]},
   {id:"decisor",title:"¿Cómo participarías en la evaluación?",help:"Esto orienta a quién conviene sumar, sin atribuir facultades.",options:["Puedo autorizar la decisión","Coordino RH, finanzas o nómina","Puedo presentar al responsable","Estoy explorando por cuenta propia",skip]},
   {id:"momento",title:"¿Cuándo tendría sentido evaluar el siguiente paso?",help:"Una referencia realista sirve más que una fecha apresurada.",options:["Durante este mes","En uno a tres meses","Para la planeación del siguiente año","Solo estoy explorando por ahora",skip]}
  ]
 };
 function questions(route){return definitions[route]||definitions.capital;}
 function validAnswers(route,data){const out={};for(const q of questions(route))if(data&&q.options.includes(data[q.id]))out[q.id]=data[q.id];return out;}
 function complete(route,answers){return questions(route).every(q=>q.options.includes(answers[q.id]));}
 function review(route,answers){
  const omitted=questions(route).filter(q=>answers[q.id]===skip).length;
  let reading=route==="capital"?"Tu resumen ayuda a revisar qué condiciones tendría que cumplir una alternativa para que valga la pena evaluarla.":"Tu resumen ayuda a preparar una evaluación de la necesidad, la operación actual y las personas que deben participar.";
  if(omitted)reading+=" Hay "+omitted+" respuesta"+(omitted===1?" pendiente":"s pendientes")+" para conversar; no impide continuar.";
  const points=route==="capital"?["Qué sociedad recibiría el capital y cuál sería su destino.","Plazo, pagos, liquidez, costos y condiciones documentadas.","Riesgos de la operación y evidencia para evaluarlos."]:["Qué problema concreto conviene atender y cómo se evaluaría el resultado.","Qué módulo podría aplicar y qué requisitos operativos tendría.","Quién debe participar y qué siguiente decisión quieren tomar."];
  if(route==="capital"&&answers.liquidez==="Podría necesitarlo en cualquier momento")points.unshift("Aclarar primero la disponibilidad del dinero: cualquier restricción de retiro es relevante para lo que declaraste.");
  if(route==="capital"&&answers.experiencia==="Sería mi primera experiencia de inversión")points.unshift("Pedir una explicación clara de funcionamiento y riesgos antes de comparar condiciones.");
  return {reading,points};
 }
 function summary(route,answers,name="",product=""){const intro=route==="empresa"?"Quiero evaluar AXIA para mi empresa.":"Quiero conversar sobre capital privado con VALIA.";return "Hola, Alberto."+ (name.trim()?" Soy "+name.trim().slice(0,120)+".":"")+" "+intro+(route==="capital"&&["Capital de Cobertura","Capital Productivo","Capital por Proyecto"].includes(product)?"\nProducto de interés: "+product:"")+"\n\n"+questions(route).map(q=>q.title+"\n"+(answers[q.id]||"Pendiente")).join("\n\n")+"\n\nMe gustaría aclarar las condiciones y el siguiente paso.";}
 function links(text,route,tracking={}){const content=String(text).trim().slice(0,3000),agenda=new URL("https://calendly.com/alberto-martinez-vivediam/30min");agenda.searchParams.set("a1",content);agenda.searchParams.set("utm_source","landing_valia");agenda.searchParams.set("utm_medium","diagnostico");agenda.searchParams.set("utm_campaign",route==="empresa"?"axia":"capital");for(const k of ["utm_source","utm_medium","utm_campaign","utm_content"])if(tracking[k])agenda.searchParams.set(k,String(tracking[k]).slice(0,80));return {whatsapp:"https://wa.me/525610826034?text="+encodeURIComponent(content),calendly:agenda.toString()};}
 function routeFrom(params){const route=(params.get("ruta")||params.get("route")||params.get("interest")||params.get("intent")||"").toLowerCase();return /empresa|axia/.test(route)?"empresa":"capital";}
 return {questions,validAnswers,complete,review,summary,links,routeFrom};
})();
if(typeof document!=="undefined")(()=>{
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),storageKey="valia-diagnostico-v1",tracking={};
 for(const k of ["utm_source","utm_medium","utm_campaign","utm_content"])if(params.get(k))tracking[k]=params.get(k).slice(0,80);
 let route=VALIADiagnostic.routeFrom(params),step=0,drafts={capital:{},empresa:{}},custom=false;
 try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||"null");if(saved)for(const r of ["capital","empresa"])drafts[r]=VALIADiagnostic.validAnswers(r,saved[r]);}catch{}
 function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(drafts));}catch{}}
 function moveFocus(id){$(id).focus({preventScroll:true});}
 function render(focus=true){
  const qs=VALIADiagnostic.questions(route),q=qs[step];$("diagnostic-form").hidden=false;$("diagnostic-result").hidden=true;
  $("step-count").textContent="Pregunta "+(step+1)+" de "+qs.length;$("step-progress").value=step+1;$("step-progress").max=qs.length;
  $("question-title").textContent=q.title;$("question-help").textContent=q.help;$("question-error").hidden=true;
  $("previous").hidden=step===0;$("next-step").textContent=step===qs.length-1?"Ver mi resumen →":"Continuar →";
  const choiceNodes=q.options.map((option,i)=>{const label=document.createElement("label");label.className="diagnostic-choice";const input=document.createElement("input");input.type="radio";input.name="answer";input.value=option;input.id="answer-"+i;input.checked=drafts[route][q.id]===option;input.addEventListener("change",()=>{drafts[route][q.id]=option;save();$("question-error").hidden=true;});const span=document.createElement("span");span.textContent=option;label.append(input,span);return label;});
  $("choices").replaceChildren(...choiceNodes);if(focus)moveFocus("question-title");
 }
 function status(text){$("handoff-status").textContent=text;}
 function refreshLinks(){const text=$("editable-summary").value,urls=VALIADiagnostic.links(text,route,tracking);$("send-whatsapp").href=urls.whatsapp;$("book-calendly").href=urls.calendly;}
 function result(){
  $("diagnostic-form").hidden=true;$("diagnostic-result").hidden=false;
  const reviewed=VALIADiagnostic.review(route,drafts[route]);$("result-reading").textContent=reviewed.reading;
  $("decision-questions").replaceChildren(...reviewed.points.map(p=>{const li=document.createElement("li");li.textContent=p;return li;}));
  const nodes=[];for(const q of VALIADiagnostic.questions(route)){const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=q.title;dd.textContent=drafts[route][q.id]||"Pendiente";nodes.push(dt,dd);}$("answer-summary").replaceChildren(...nodes);
  custom=false;$("editable-summary").value=VALIADiagnostic.summary(route,drafts[route],$("prospect-name").value,$("product-interest").value);$("share-consent").checked=false;status("Aún no has enviado tus respuestas ni reservado una cita.");refreshLinks();moveFocus("result-title");
 }
 function setRoute(next,scroll=false){route=next;step=0;document.querySelectorAll("[data-view]").forEach(el=>el.hidden=el.dataset.view!==route);document.querySelectorAll("[data-route]").forEach(a=>{if(a.dataset.route===route)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});
  $("route-kicker").textContent=route==="empresa"?"AXIA · EMPRESA":"CAPITAL PRIVADO";$("diagnostic-title").textContent=route==="empresa"?"¿Qué quieres mejorar para tu equipo?":"¿Qué buscas para tu dinero?";$("diagnostic-description").textContent=route==="empresa"?"Prepara una conversación sobre necesidad, población, operación actual y siguiente decisión.":"Prepara una conversación sobre objetivo, horizonte, liquidez y las condiciones que necesitas revisar.";
  const base=route==="empresa"?"Hola, Alberto. Quiero evaluar AXIA para mi empresa.":"Hola, Alberto. Quiero conversar sobre capital privado con VALIA.";
  document.querySelectorAll(".direct-wa").forEach(a=>a.href=VALIADiagnostic.links(base,route).whatsapp);render(false);
  if(scroll){const u=new URL(location.href);u.searchParams.set("ruta",route);u.hash="inicio";history.replaceState(null,"",u);$("inicio").scrollIntoView({block:"start"});}
 }
 document.querySelectorAll("[data-route]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setRoute(a.dataset.route,true);}));
 $("diagnostic-form").addEventListener("submit",e=>{e.preventDefault();const q=VALIADiagnostic.questions(route)[step];if(!q.options.includes(drafts[route][q.id])){$("question-error").hidden=false;const first=$("choices").querySelector("input");if(first)first.focus();return;}if(step<VALIADiagnostic.questions(route).length-1){step++;render();}else result();});
 $("previous").addEventListener("click",()=>{if(step>0){step--;render();}});
 $("edit-answers").addEventListener("click",()=>{step=0;render();});
 $("restart").addEventListener("click",()=>{drafts={capital:{},empresa:{}};step=0;$("prospect-name").value="";$("editable-summary").value="";$("share-consent").checked=false;save();render();});
 $("prospect-name").addEventListener("input",()=>{if(!custom){$("editable-summary").value=VALIADiagnostic.summary(route,drafts[route],$("prospect-name").value,$("product-interest").value);refreshLinks();}});
 $("editable-summary").addEventListener("input",()=>{custom=true;refreshLinks();});
 for(const id of ["send-whatsapp","book-calendly"])$(id).addEventListener("click",e=>{if(!$("editable-summary").value.trim()){e.preventDefault();status("El resumen está vacío. Escribe lo que quieres compartir o vuelve a tus respuestas.");$("editable-summary").focus();return;}if(!$("share-consent").checked){e.preventDefault();status("Confirma que quieres compartir el resumen para continuar.");$("share-consent").focus();return;}refreshLinks();status(id==="send-whatsapp"?"Se abrirá WhatsApp con tu resumen. Falta pulsar Enviar ahí.":"Se abrirá Calendly con el resumen precargado. Falta elegir horario y confirmar la reserva.");});
 $("copy-summary").addEventListener("click",async()=>{const text=$("editable-summary").value;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const area=$("editable-summary");area.focus();area.select();if(!document.execCommand("copy"))throw Error("copy");}status("Resumen copiado. Todavía no se ha enviado ni reservado una cita.");}catch{status("Selecciona el resumen para copiarlo manualmente.");$("editable-summary").focus();$("editable-summary").select();}});
 $("product-interest").addEventListener("change",()=>{const area=$("editable-summary"),lines=area.value.replace(/\nProducto de interés: [^\n]*/g,"");area.value=route==="capital"&&$("product-interest").value?lines.replace(/\n\n/,"\nProducto de interés: "+$("product-interest").value+"\n\n"):lines;refreshLinks();});
 setRoute(route);
 const mobileNext=document.querySelector(".mobile-next");
 if(mobileNext&&typeof IntersectionObserver!=="undefined")new IntersectionObserver(entries=>{mobileNext.hidden=entries.some(e=>e.isIntersecting);},{threshold:0}).observe($("diagnostico"));
 if(params.get("thanks")==="1"){$("diagnostic-description").textContent="Si acabas de utilizar el formulario anterior, confirma la recepción directamente con Alberto. También puedes preparar tu contexto aquí.";}
})();
