# Alta de un gimnasio nuevo (cliente)

Checklist para dar de alta un cliente nuevo de GestorGym + PULSO. Un solo código fuente sirve a todos los clientes — no se clona ni se forkea el repo. Cada cliente es un **deploy independiente** (su propia base de datos, sus propios proyectos de Vercel), conectado al mismo repo de GitHub. Un push a `master`/`vercel` (GestorGym) o `main` (PULSO) actualiza a todos los clientes a la vez.

## 1. Base de datos

Crear un proyecto/base nueva en [Neon](https://neon.tech) (Postgres). Copiar la connection string — va a ser el `DATABASE_URL` del cliente.

## 2. Proyecto Vercel — GestorGym

Importar el repo de GitHub (`GestorGym-Repositorie`) como un proyecto Vercel **nuevo**, rama de producción `vercel`. Variables de entorno:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | connection string de la base Neon del paso 1 |
| `AUTH_SECRET` | generar uno nuevo (`openssl rand -base64 32` o similar) — **nunca reusar el de otro cliente** |
| `BLOB_READ_WRITE_TOKEN` | token del Vercel Blob store de este proyecto (fotos de socios, logo del gimnasio) |
| `PULSO_URL` | se completa en el paso 4, después de crear el proyecto de PULSO |
| `REVALIDATE_SECRET` | generar uno nuevo — tiene que coincidir exactamente con el mismo valor en el proyecto PULSO del paso 3 |

## 3. Proyecto Vercel — PULSO

Importar el repo de GitHub (`gym-repositorie`) como un proyecto Vercel **nuevo**, rama `main`. Variables de entorno:

| Variable | Valor |
|---|---|
| `GESTOR_API_URL` | URL pública del proyecto GestorGym del paso 2 |
| `REVALIDATE_SECRET` | mismo valor que se puso en el paso 2 |

## 4. Cerrar el círculo

Volver al proyecto GestorGym (paso 2) y completar `PULSO_URL` con la URL del proyecto PULSO recién creado (paso 3).

## 5. Primer deploy

El build de GestorGym corre `prisma migrate deploy` automáticamente (está en el script `build` de `package.json`), así que la base nueva queda con el esquema al día sin pasos manuales — solo hace falta que el deploy corra una vez (se dispara solo al conectar el repo).

## 6. Alta inicial (dueño + datos del gimnasio)

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

## 7. Dominio propio (opcional)

Conectar el dominio del cliente en ambos proyectos de Vercel (GestorGym y PULSO), si lo tiene.

## 8. Avisar al cliente

Pasarle la URL de su panel (`https://<proyecto-gestorgym>.vercel.app` o su dominio propio) y su email. Como el usuario se crea con `mustChangePassword: true`, en el primer login el sistema le va a pedir elegir su propia contraseña — la temporal del paso 6 es de un solo uso.
