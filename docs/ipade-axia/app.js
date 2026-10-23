const params = new URLSearchParams(window.location.search);
const whatsappNumber = "525610826034";

const whatsappMessages = {
  empresa:
    "Hola Alberto, vi AXIA a través de la comunidad IPADE y quiero evaluar si puede tener sentido para mi empresa. Me gustaría coordinar un Diagnóstico AXIA de 20 minutos.",
  referencia:
    "Hola Alberto, vi AXIA a través de la comunidad IPADE y pensé en una empresa o persona de mi red a quien podría interesarle. Quiero coordinar la introducción contigo.",
  fondeo:
    "Hola Alberto, vi la opción de fondeo de VALIA y quiero conocer cómo funciona Capital Productivo, sus plazos, riesgos y condiciones."
};

["utm_source", "utm_medium", "utm_campaign", "utm_content", "contact_id"].forEach((key) => {
  const element = document.getElementById(key);
  if (element) element.value = params.get(key) || "";
});

function buildWhatsAppUrl(intent = "empresa") {
  let message = whatsappMessages[intent] || whatsappMessages.empresa;
  const contactId = params.get("contact_id");
  if (contactId) message += `\n\nReferencia de campaña: ${contactId}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  const intent = link.dataset.waIntent || "empresa";
  link.href = buildWhatsAppUrl(intent);
  link.target = "_blank";
  link.rel = "noopener";
});

const requestedInterest = params.get("interest");
if (requestedInterest) {
  document.querySelectorAll('input[name="interes"]').forEach((radio) => {
    if (radio.value.toLowerCase().includes(requestedInterest.toLowerCase())) {
      radio.checked = true;
    }
  });
}

const form = document.getElementById("leadForm");
const nextInput = document.getElementById("nextUrl");

if (form && nextInput) {
  form.addEventListener("submit", () => {
    const selected = form.querySelector('input[name="interes"]:checked');
    const selectedValue = selected ? selected.value : "Evaluar AXIA para mi empresa";
    let intent = "empresa";
    if (selectedValue.includes("Referir")) intent = "referencia";
    if (selectedValue.includes("fondeo")) intent = "fondeo";

    const nextUrl = new URL(nextInput.value);
    nextUrl.searchParams.set("intent", intent);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "contact_id"].forEach((key) => {
      const value = params.get(key);
      if (value) nextUrl.searchParams.set(key, value);
    });
    nextInput.value = nextUrl.toString();
  });
}

if (params.get("thanks") === "1" && form) {
  const intent = params.get("intent") || "empresa";
  let kicker = "SIGUIENTE PASO";
  let title = "Gracias. Hablemos por WhatsApp.";
  let copy = "Revisaremos si AXIA tiene sentido económico para tu empresa y coordinaremos una conversación de 20 minutos.";
  let buttonLabel = "Hablar con Alberto";

  if (intent === "referencia") {
    kicker = "REFERENCIA";
    title = "Gracias. Hagamos la introducción sencilla.";
    copy = "Escríbele directamente a Alberto. Él toma el seguimiento y tú no necesitas explicar AXIA.";
    buttonLabel = "Hacer la introducción";
  } else if (intent === "fondeo") {
    kicker = "FONDEO VALIA";
    title = "Gracias. Abramos la conversación de capital.";
    copy = "La conversación será separada del diagnóstico empresarial y se enfocará en Capital Productivo, plazos, estructura y riesgos.";
    buttonLabel = "Hablar de fondeo con Alberto";
  }

  form.innerHTML = `
    <div>
      <span class="kicker">${kicker}</span>
      <h2>${title}</h2>
      <p>${copy}</p>
      <a class="btn primary submit" href="${buildWhatsAppUrl(intent)}" target="_blank" rel="noopener">${buttonLabel}</a>
      <p class="form-note">Te responde directamente Alberto Martínez.</p>
    </div>`;
}