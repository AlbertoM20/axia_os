const params = new URLSearchParams(window.location.search);
const calendarUrl = ""; // Sustituir por el enlace definitivo de Calendly.
const primaryEmail = "direccionc@valiafin.mx";
const copyEmail = "alberto.martinez@vivediam.mx";

["utm_source", "utm_medium", "utm_campaign", "utm_content", "contact_id"].forEach((key) => {
  const element = document.getElementById(key);
  if (element) element.value = params.get(key) || "";
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

function buildMailto(subject, body) {
  return `mailto:${primaryEmail}?cc=${encodeURIComponent(copyEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildCalendarUrl(intent) {
  if (!calendarUrl) return "";
  const url = new URL(calendarUrl);
  url.searchParams.set("utm_source", params.get("utm_source") || "landing");
  url.searchParams.set("utm_medium", params.get("utm_medium") || "web");
  url.searchParams.set("utm_campaign", params.get("utm_campaign") || "ipade_axia_2027");
  url.searchParams.set("utm_content", params.get("utm_content") || intent);
  if (params.get("contact_id")) url.searchParams.set("contact_id", params.get("contact_id"));
  return url.toString();
}

if (params.get("thanks") === "1" && form) {
  const intent = params.get("intent") || "empresa";
  let title;
  let copy;
  let buttonLabel;
  let destination;

  if (intent === "referencia") {
    title = "Gracias. Hagamos la introducción sencilla.";
    copy = "Puedes presentarnos por correo. Nosotros asumimos el seguimiento y tú no necesitas explicar AXIA.";
    buttonLabel = "Presentar una empresa";
    destination = buildMailto(
      "Introducción · AXIA",
      "Alberto / Dirección Comercial VALIA:\n\nLos pongo en contacto con [NOMBRE] de [EMPRESA] porque creo que vale la pena que conozcan AXIA.\n\nLos dejo coordinar directamente."
    );
  } else if (intent === "fondeo") {
    title = "Gracias. Abramos la conversación de fondeo.";
    copy = "Revisaremos el modelo, la estructura de capital y si el perfil de la oportunidad corresponde con tus criterios. El owner inicial es Alberto Martínez.";
    buttonLabel = calendarUrl ? "Elegir horario" : "Solicitar conversación de fondeo";
    destination = buildCalendarUrl("fondeo") || buildMailto(
      "Quiero conocer el fondeo de VALIA",
      "Quiero abrir una conversación sobre el modelo de fondeo de VALIA. Compártanme opciones de horario."
    );
  } else {
    title = "Gracias. Ahora agenda 20 minutos.";
    copy = "Revisaremos si AXIA tiene sentido económico para tu empresa. No es una demo genérica: veremos cómo resuelven hoy ahorro, anticipos y préstamos. La agenda pública será martes a jueves, de 10:00 a 13:00 y de 16:00 a 18:00, con un máximo de cuatro diagnósticos por día.";
    buttonLabel = calendarUrl ? "Elegir horario" : "Solicitar horarios";
    destination = buildCalendarUrl("empresa") || buildMailto(
      "Quiero agendar un Diagnóstico AXIA",
      "Quiero agendar un Diagnóstico AXIA de 20 minutos. Compártanme horarios disponibles."
    );
  }

  form.innerHTML = `
    <div>
      <span class="kicker">SIGUIENTE PASO</span>
      <h2>${title}</h2>
      <p>${copy}</p>
      <a class="btn primary submit" href="${destination}">${buttonLabel}</a>
      <p class="form-note">Reunión de 20 minutos · Microsoft Teams · owner: Alberto Martínez.</p>
    </div>`;
}