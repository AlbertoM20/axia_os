const params = new URLSearchParams(window.location.search);
const whatsappNumber = "525610826034";
const messages = {
  empresa: "Hola, Alberto. Vi AXIA a través de tu mensaje a la comunidad IPADE y quiero evaluar si puede tener sentido para mi empresa. Me gustaría coordinar un Diagnóstico AXIA de 20 minutos.",
  referencia: "Hola, Alberto. Vi AXIA a través de la comunidad IPADE y pensé en una empresa o persona de mi red a quien podría interesarle. Quiero coordinar la introducción contigo.",
  fondeo: "Hola, Alberto. Vi la opción de fondeo de VALIA y quiero conocer cómo funciona Capital Productivo, sus plazos, estructura y riesgos."
};
function waUrl(intent="empresa") {
  const tracking=[params.get("utm_source")?`Origen: ${params.get("utm_source")}`:"",params.get("utm_campaign")?`Campaña: ${params.get("utm_campaign")}`:"",params.get("contact_id")?`Referencia: ${params.get("contact_id")}`:""] .filter(Boolean).join(" · ");
  const text=tracking?`${messages[intent]||messages.empresa}\n\n${tracking}`:(messages[intent]||messages.empresa);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
document.querySelectorAll(".whatsapp-link").forEach(a=>{a.href=waUrl(a.dataset.waIntent||"empresa")});
["utm_source","utm_medium","utm_campaign","utm_content","contact_id"].forEach(k=>{const e=document.getElementById(k);if(e)e.value=params.get(k)||""});
const requested=params.get("interest");
if(requested) document.querySelectorAll('input[name="interes"]').forEach(r=>{if(r.value.toLowerCase().includes(requested.toLowerCase()))r.checked=true});
const form=document.getElementById("leadForm"), next=document.getElementById("nextUrl");
if(form&&next){form.addEventListener("submit",()=>{const v=form.querySelector('input[name="interes"]:checked')?.value||"";const intent=v.includes("Referir")?"referencia":v.toLowerCase().includes("fondeo")?"fondeo":"empresa";const u=new URL(next.value);u.searchParams.set("intent",intent);["utm_source","utm_medium","utm_campaign","utm_content","contact_id"].forEach(k=>{if(params.get(k))u.searchParams.set(k,params.get(k))});next.value=u.toString()})}
if(params.get("thanks")==="1"&&form){const intent=params.get("intent")||"empresa";const data={empresa:["SIGUIENTE PASO","Gracias. Coordinemos 20 minutos.","Revisaremos si AXIA tiene sentido económico para tu empresa.","Coordinar por WhatsApp"],referencia:["REFERENCIA","Hagamos la introducción sencilla.","Escríbeme y te paso el texto exacto para presentar a la empresa.","Hacer la introducción"],fondeo:["FONDEO VALIA","Abramos la conversación de capital.","Revisaremos Capital Productivo, destino del recurso, plazos y riesgos.","Hablar de fondeo"]}[intent]||[];form.innerHTML=`<div><span class="kicker">${data[0]}</span><h2>${data[1]}</h2><p>${data[2]}</p><a class="btn primary submit" href="${waUrl(intent)}" target="_blank" rel="noopener">${data[3]}</a><p class="form-note">Te responde directamente Alberto Martínez.</p></div>`}
