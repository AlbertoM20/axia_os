# AXIA / ACI - Instalacion y cierre de pruebas
Estado: front-end y backend codificados; no hay prueba de despliegue ni de recepcion.

## Componentes
- index.html: simulador SAFE/Advance/Credit, formulario para el colaborador
- operaciones.html: bandeja interna con folio, responsable, estado, exportacion CSV
- logo-valia.svg: logotipo original VALIA
- backend/src/worker.js: API, persistencia D1, correo oculto via Resend
- backend/schema.sql y backend/wrangler.json: definicion de base y despliegue
- .github/workflows/kickoff-aci-pages.yml: publica sitio en /kickoff-aci/

## Parametros
SAFE: $150 por semana o $300 por quincena; 24 quincenas por ano. Ejemplo $500 x 24 = $12,000 sin rendimientos.
Advance: 60% del bruto ya devengado menos pendientes. El colaborador recibe completo el importe nominal; comision 7% mas IVA se descuenta al corte. $3,000 solicitados = $3,000 entregados; $3,243.60 descuento al corte.
Credit: apertura 3% mas IVA y administracion editable 0% por defecto; ambas se descuentan del capital. Credit informativo, no solicita creditos en primera fase.

## Proceso de habilitacion
1. Crear D1 axia-aci-intake; ejecutar backend/schema.sql; escribir su database_id en backend/wrangler.json.
2. Configurar secretos Cloudflare: ADMIN_TOKEN, RESEND_API_KEY, NOTIFY_EMAIL (aun no proporcionado), MAIL_FROM (dominio verificado). Fijar PUBLIC_ORIGIN a https://albertom20.github.io.
3. Publicar backend/src/worker.js con Wrangler. Consultar GET /health: DB verdadera y notificaciones configuradas.
4. Registrar URL HTTPS real del Worker en el objeto config de index.html; nunca poner correo ni token en el frontend.
5. Incorporar aviso de privacidad del responsable antes de capturar datos personales.
6. Probar solicitud de prueba: HTTP 201, folio, registro D1, correo entregado al receptor; no basta estado aceptado por proveedor. Probar sin consentimiento, monto Advance excedido, duplicado y error de correo.
7. Probar operaciones.html con token, lista, actualizacion, seguimiento y CSV. Mantener token fuera del equipo de colaboradores.
8. Verificar URL Pages real en dos telefonos antes de crear y exhibir QR.

## Canales hacia un solo folio
Web: ?canal=web
QR: ?canal=qr
Atencion presencial por AXIA: ?canal=presencial
WhatsApp: no habilitado; falta numero corporativo y adaptador. No anunciarlo.
Correo: salida servidor a cuenta interna oculta; no correo visible al usuario.
No crear un chat grupal para recibir datos bancarios o recibos de nomina.

## Bloqueos actuales
Correo receptor y dominio remitente no suministrados; infraestructura Cloudflare sin provisionar ni probar; aviso de privacidad por integrar; URL publica Pages sin verificar; WhatsApp sin numero.
Sin capacidad de fondeo autorizada, registrar interes no es prometer desembolso.