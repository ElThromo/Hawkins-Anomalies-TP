# Hawkins Anomalies

Aplicación web ficticia ambientada en el pueblo de Hawkins (inspirada en *Stranger Things*), donde los ciudadanos pueden reportar anomalías paranormales y un equipo de investigadores les da seguimiento hasta resolverlas.

## Idea del proyecto

Un ciudadano crea un **reporte** sobre algo extraño que presenció (una criatura, un fenómeno eléctrico, una desaparición, etc.), indicando zona y categoría. Otros usuarios pueden comentar y reaccionar al reporte. Un **investigador** revisa el caso, cambia su estado a medida que avanza la investigación y, al resolverlo, agrega una **resolución** explicando qué se encontró. Todo el contenido es visible para la comunidad, que además puede explorar un **mapa interactivo** del pueblo con las zonas marcadas según su nivel de peligro. Los admins, además, pueden entrar a un **panel** en el cual tienen acceso a los CRUDs de diversas entidades para editarlas segun sea conveniente para el funcionamiento correcto de la aplicacion.

## Stack técnico

**Backend**
- Node.js + Express
- Prisma ORM + MySQL
- JWT para autenticación
- bcrypt para hash de contraseñas
- Multer para subida de imágenes

**Frontend**
- React + Vite + TypeScript
- React Router
- React Leaflet para el mapa interactivo
- CSS propio, mobile-first, sin frameworks de UI

## Entidades principales

| Entidad | Descripción |
|---|---|
| Usuario | Cuentas del sistema, con rol `USUARIO`, `INVESTIGADOR` o `ADMIN` |
| Zona | Áreas del pueblo, con nivel de peligro y posición en el mapa |
| Categoría | Clasificación temática de los reportes |
| Reporte | El núcleo de la aplicación: lo que reporta un ciudadano |
| Comentario | Respuestas de la comunidad a un reporte |
| Resolución | Cierre de un caso, cargado por un investigador o admin |
| Vigilante | Persona asignada al resguardo de una zona |
| Reacción / Tipo de Reacción | Reacciones rápidas (emoji) a un reporte |

## Roles y permisos

- **Usuario**: crea reportes, comenta, reacciona y edita su propio perfil.
- **Investigador**: además de lo anterior, cambia el estado de los reportes y carga resoluciones.
- **Admin**: acceso completo al panel de administración (usuarios, zonas, categorías, reportes y demás entidades).

## Funcionalidades destacadas

- Autenticación con JWT y rutas protegidas por rol en el backend.
- Panel de administración con CRUD completo para cada entidad.
- Mapa interactivo (React Leaflet) con zonas coloreadas según nivel de peligro y cantidad de reportes.
- Subida de imágenes a reportes y foto de perfil.
- Diseño responsive, desarrollado con metodología mobile-first.
- Script de carga de datos de ejemplo (seed) para probar la aplicación sin cargar todo manualmente.

## Estructura del repositorio

```
hawkins-anomalies/
├── backend/     API REST (Express + Prisma)
├── frontend/    Aplicación web (React + Vite)
└── docs/        Documentación complementaria (diagramas, proposal, tracking, etc.)
```

## Instalación

Ver [instalacion.md](./instalacion.md) para la guía completa: requisitos, configuración del entorno y primeros pasos.

## Equipo

- Ignacio Rosati
- Luca Franceschetti
- Ruf Dzhaparova
