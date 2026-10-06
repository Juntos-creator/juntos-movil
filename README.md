# JUNTOS – App móvil nativa (Android + iOS)

App React Native (Expo) que reproduce el modelo de la plataforma JUNTOS (solicitud en 9 pasos, servicios,
código de llegada/salida, chat, calificación) con una interfaz pensada para adultos mayores y personas con dificultades.
Usa el **mismo Supabase** que la plataforma web.

## Accesibilidad incluida
- Una sola tarea por pantalla, botones de 68 px o más, texto grande (3 tamaños) y lenguaje simple.
- Alto contraste (negro sobre blanco) y botón "🔊 Escuchar esta pantalla" en cada pantalla.
- Compatible con TalkBack / VoiceOver (roles y etiquetas) y con el tamaño de letra del sistema.
- Confirmación antes de llamar al 911 o a un contacto.

## Cómo ejecutarla
```bash
npm install
npx expo install --fix        # alinea versiones con el SDK de Expo instalado
cp .env.example .env          # y pega la URL y la anon key de Supabase
npx expo start                # escanea el QR con Expo Go (Android/iOS)
```
> La app no se pudo compilar ni probar en el entorno donde se generó. Haz una primera ejecución y corrige
> lo que salga antes de publicar.

## Generar instaladores
```bash
npm i -g eas-cli && eas login && eas build:configure
eas build -p android --profile production   # .aab para Play Store
eas build -p ios --profile production       # requiere cuenta Apple Developer (no necesitas Mac)
```
Identificador de ambas apps: `com.juntos.app` (igual que tu proyecto Capacitor).

## Base de datos
Usa `profiles`, `service_requests`, `payments`, `service_messages`, `service_reviews` y `audit_logs`.
Ejecuta `supabase/chat_policies.sql` para que el chat funcione entre cliente y acompañante.

### Inconsistencias detectadas en la plataforma web (conviene corregirlas)
- `sr_status` en la base es minúscula (`assigned`, `in_progress`…), pero `api/services/checkin` escribe `ASSIGNED`/`IN_PROGRESS`:
  Postgres lo rechazaría. La app móvil usa minúsculas.
- El chat web intenta tres tablas distintas (`service_chat_messages`, `service_chats`, `service_messages`) con `service_id`;
  la app usa solo `service_messages.service_request_id`.
- Revisa que las políticas RLS `sr_select`/`sr_update` permitan a la acompañante asignada leer y actualizar su servicio.

## Fuera de esta versión
Pago en línea (Azul/Stripe), KYC y registro de acompañantes, Mesa de Operaciones, facturas NCF y notificaciones push/WhatsApp.
Los pagos quedan `PENDING` y el monto incluye ITBIS 18 % (RD$900/h, mínimo 2 h).

## Seguridad
No incluí `.env.local`, `juntos-release-key.jks` ni `key.properties` de tu proyecto original. No los compartas ni los subas a Git.
