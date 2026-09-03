# Alta de un gimnasio nuevo (cliente)

Checklist para dar de alta un cliente nuevo de GestorGym. Un solo código fuente sirve a todos los clientes — no se clona ni se forkea el repo. Cada cliente es un **deploy independiente** (su propia base de datos, su propio proyecto de Vercel), conectado al mismo repo de GitHub. Un push a `master`/`vercel` actualiza a todos los clientes a la vez.

Por defecto se da de alta **solo el panel (GestorGym)**. La web pública (PULSO) es opcional — armarla solo si el cliente la pide explícitamente (ver el apéndice al final).

Probado de punta a punta el 02/09/2026 con un gimnasio de prueba real (Neon + Vercel), incluyendo los dos problemas de configuración que no son obvios y están marcados abajo.

## 1. Base de datos

Crear un proyecto/base nueva en [Neon](https://neon.tech) (Postgres). Copiar la connection string — va a ser el `DATABASE_URL` del cliente.

## 2. Proyecto Vercel — GestorGym

Crear un proyecto Vercel **nuevo** conectado al repo de GitHub (`GestorGym-Repositorie`), rama de producción `vercel`. Variables de entorno:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | connection string de la base Neon del paso 1 |
| `AUTH_SECRET` | generar uno nuevo (`openssl rand -base64 32` o similar) — **nunca reusar el de otro cliente** |
| `BLOB_READ_WRITE_TOKEN` | token del Vercel Blob store de este proyecto (fotos de socios, logo del gimnasio) — no es obligatorio para arrancar, solo para poder subir fotos |

## 3. Dos ajustes que Vercel no pone bien solo

Estos dos rompen el panel si se saltean — no son evidentes, así que van marcados aparte:

- **Framework Preset**: si el proyecto se creó por API/CLI (no importando desde el dashboard), Vercel a veces lo deja en "Other" en vez de detectar Next.js. Con eso, todas las páginas tiran 404 aunque el build compile bien. Arreglarlo en **Settings → General → Framework Preset → Next.js**.
- **Vercel Authentication (SSO)**: los proyectos nuevos vienen con el propio muro de login de Vercel activado por defecto para dominios `.vercel.app`. Esto no molesta la primera pantalla, pero corta a mitad de camino acciones del panel (por ejemplo, cambiar la contraseña en el primer ingreso tira "Algo salió mal"). Desactivarlo en **Settings → Deployment Protection → Vercel Authentication → Disabled**.

## 4. Primer deploy

El build corre `prisma migrate deploy` automáticamente (está en el script `build` de `package.json`), así que la base nueva queda con el esquema al día sin pasos manuales — solo hace falta que el deploy corra una vez.

## 5. Alta inicial (dueño + datos del gimnasio)

Correr, apuntando `DATABASE_URL` a la base del cliente nuevo:

```bash
ONBOARD_GYM_NAME="Nombre del gimnasio" \
ONBOARD_GYM_ADDRESS="Dirección (opcional)" \
ONBOARD_OWNER_NAME="Nombre del dueño" \
ONBOARD_OWNER_EMAIL="email@delcliente.com" \
ONBOARD_OWNER_PASSWORD="contraseña-temporal-de-al-menos-6-caracteres" \
npm run seed:onboarding
```

Este script (`prisma/seed-onboarding.ts`) — a diferencia de `seed.ts`, que es solo para desarrollo y llena la base con datos de prueba falsos — no borra nada y no crea nada de prueba: solo la fila de configuración del gimnasio y el usuario dueño. Si la base ya tiene un gimnasio configurado, el script se niega a correr (para no pisar datos reales por error).

Antes de que el dueño pueda cargar socios, alguien tiene que crear al menos un **Plan** desde el panel (Planes → Nuevo plan) — el alta de un socio requiere elegir uno.

## 6. Dominio propio (opcional)

Conectar el dominio del cliente en el proyecto de Vercel, si lo tiene.

## 7. Avisar al cliente

Pasarle la URL de su panel (`https://<proyecto>.vercel.app` o su dominio propio) y su email. Como el usuario se crea con `mustChangePassword: true`, en el primer login el sistema le va a pedir elegir su propia contraseña — la temporal del paso 5 es de un solo uso.

---

## Apéndice — Web pública (PULSO), solo si el cliente la pide

Repetir el mismo patrón con el otro repo (`gym-repositorie`), rama `main`:

| Variable | Valor |
|---|---|
| `GESTOR_API_URL` | URL pública del proyecto GestorGym de este cliente |
| `REVALIDATE_SECRET` | generar uno nuevo, y cargar el mismo valor también en el proyecto GestorGym (variable `REVALIDATE_SECRET`) |

Aplican los mismos dos ajustes del paso 3 (Framework Preset → Next.js, Vercel Authentication → Disabled).
