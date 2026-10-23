# Guía de instalación — Hawkins Anomalies

Aplicación web para reportar y dar seguimiento a anomalías en Hawkins. Está compuesta por un **backend** (Node.js + Express + Prisma + MySQL) y un **frontend** (React + Vite).

## Requisitos previos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 20 o superior | El proyecto fue desarrollado con la versión 24. Incluye `npm`. |
| MySQL | 8 | Debe estar instalado y en ejecución. MySQL Workbench es opcional. |
| Git | cualquiera | Solo para clonar el repositorio. |

## 1. Obtener el proyecto

```bash
git clone https://github.com/ElThromo/Hawkins-Anomalies-tp.git
cd Hawkins-Anomalies-tp
```

## 2. Backend

### 2.1. Instalar dependencias

```bash
cd backend
npm install
```

### 2.2. Configurar las variables de entorno

Crear el archivo `backend/.env` a partir del ejemplo incluido:

```bash
# Windows (PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Abrir `.env` y completar los valores:

```
// Datos BDD
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE"
DB_PASSWORD=contraseña_del_usuario

// Contraseña JWT
JWT_SECRET=cualquier_texto_largo_y_aleatorio
```

### 2.3. Elegir el usuario de MySQL

**Opción A — usar `root` (la más simple).** No hace falta ninguna preparación: poner en DATABASE_URL="mysql://root:contra@localhost:3306/hawkins_anomalies" y completar su contraseña. Prisma crea la base de datos automáticamente.

**Opción B — usar otro usuario.** Crearlo antes desde MySQL Workbench o la consola de MySQL, ejecutando como `root`:

```sql
CREATE USER 'hawkins'@'localhost' IDENTIFIED BY 'una_clave';
GRANT ALL PRIVILEGES ON *.* TO 'hawkins'@'localhost';
FLUSH PRIVILEGES;
```

Y luego indicarlo en el `.env` ajustando los datos en la URL.

> Los permisos globales (`*.*`) son necesarios porque `prisma migrate dev` crea una base temporal auxiliar para comparar migraciones, además de la base del proyecto. Es una configuración pensada para un entorno local de desarrollo.

### 2.4. Crear las tablas

```bash
npx prisma migrate dev
npx prisma generate
```

El primer comando crea la base de datos (si no existe) y aplica todas las migraciones. El segundo genera el cliente de Prisma que usa el código.

### 2.5. Iniciar el servidor

```bash
node src/app.js
```

Debe aparecer el mensaje `Servidor funcionando en puerto 3000`. Dejar esta terminal abierta.

## 3. Frontend

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador la dirección que indica la terminal (normalmente `http://localhost:5173`).

> El frontend se comunica con el backend en `http://localhost:3000`, por lo que el backend debe estar en ejecución para que la aplicación funcione.

## 4. Cargar datos de ejemplo

La base de datos se crea vacía. En vez de completarla a mano, se puede ejecutar un script que carga usuarios, zonas, categorías, vigilantes y reportes de prueba (incluyendo avatares e imágenes). Se ejecuta una sola vez, parado en `backend/`, con el servidor apagado o encendido (es indistinto):

```bash
npm run seed
```

El script se puede correr más de una vez sin duplicar datos: si un registro ya existe, lo deja como está.

Al finalizar, la terminal muestra las cuentas disponibles para iniciar sesión:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `dustin.henderson@st.com` | `hola1234` |
| Investigador | `steve.harrington@st.com` | `hola1234` |
| Investigador | `jim.hopper@st.com` | `hola1234` |
| Usuario | `alan.wake@st.com` | `hola1234` |
| Usuario | `jimmy.hopkins@st.com` | `hola1234` |
| Usuario | `casper.darling@st.com` | `hola1234` |

Con eso ya hay reportes en distintos estados (resueltos, en investigación y sin verificar), zonas, categorías y vigilantes cargados para navegar la aplicación sin necesidad de crear nada manualmente. Las zonas se cargan con posición y radio ya definidos para mostrarse en el mapa.

> Si se prefiere arrancar sin estos datos y cargar todo manualmente, se puede omitir este paso: ver la sección siguiente.

### Alternativa: primer uso sin datos de ejemplo

1. Entrar a `/register` y crear una cuenta.
2. Convertirla en administrador ejecutando en MySQL:
   ```sql
   USE hawkins_anomalies;
   UPDATE Usuario SET rol = 'ADMIN' WHERE email = 'el_email_registrado';
   ```
   Otra opcion sencilla es ejecutar
   ```
   npx prisma studio;
   ```
   parado en el `backend/` y desde la tabla de usuarios cambiar el rol manualmente.
3. **Cerrar sesión y volver a iniciarla.** El rol viaja dentro de la sesión, por lo que no se actualiza hasta iniciar sesión de nuevo.
4. Aparece la opción **Admin panel** al final de la barra lateral. Desde ahí cargar primero las **categorías** y las **zonas** (las zonas tienen posición y radio para mostrarse en el mapa). Con eso ya se pueden crear reportes desde **+ Crear reporte**.

### Roles del sistema

| Rol | Permisos |
|---|---|
| `USUARIO` | Crear reportes, comentar y editar su propio perfil. |
| `INVESTIGADOR` | Lo anterior, más cambiar el estado de los reportes y cargar resoluciones. |
| `ADMIN` | Gestión completa: usuarios, zonas, categorías, reportes y demás entidades. |

Los usuarios nuevos se crean siempre como `USUARIO`; el rol se cambia desde el Admin panel (o con SQL, como en el paso 4).


## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `pool timeout: failed to retrieve a connection` | MySQL apagado, o `DB_USER` / `DB_PASSWORD` incorrectos | Verificar que MySQL esté en ejecución y revisar el `.env`. Reiniciar el backend después de editarlo. |
| `Access denied for user` | Credenciales incorrectas | Revisar `DB_USER` y `DB_PASSWORD`. |
| `Cannot read properties of undefined (reading 'create')` | El cliente de Prisma no está generado | Ejecutar `npx prisma generate` y reiniciar el backend. |
| `EADDRINUSE: address already in use :::3000` | El puerto 3000 ya está ocupado | Cerrar el otro proceso que lo usa (por ejemplo, otra instancia del backend). |
| El frontend muestra "No se pudo conectar con el servidor" | El backend no está en ejecución | Iniciar el backend (paso 2.5). |
| No aparece el Admin panel | La sesión se abrió antes de cambiar el rol | Cerrar sesión y volver a iniciarla. |
| No conecta a la base de datos | Caracter especial en la contraseña | Cambiar ese caracter en la URL por su codificacion porcentual. EJ: # = %23 |
