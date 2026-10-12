
## Tabla de seguimiento

| N.º | Tipo | Título | Descripción breve | Prioridad | Estado | Responsable | Fecha resolución |
|---|---|---|---|---|---|---|---|
| 1 | Feature | Pagina login y home | Creacion basica sin funcionamiento de las paginas login, register y home | Media | Realizado | Ignacio Rosati | 27/06/26 |
| 2 | Feature | Sidebar | Implementa sidebar con navegacion entre las paginas | Media | Realizado | Ignacio Rosati | 04/07/26 |
| 3 | Feature | Pagina register | Creacion basica sin funcionamiento de la pagina de register | Media | Realizado | Ruf Dzhaparova | 05/07/26 |
| 4 | Feature | Base de datos | Creacion de base de datos e integracion de Prisma al proyecto | Alta | Realizado | Luca Franceschetti | 12/08/26 |
| 5 | Feature | CRUD Zona | Desarrollo de CRUD Zona en backend | Alta | Realizado | Luca Franceschetti | 12/08/26 |
| 6 | Fix | Configuracion de paquetes | Se añadio configuracion faltante y corrigio otras que provocaba errores en el funcionamiento del backend | Alta | Realizado | Ignacio Rosati | 12/08/26 |
| 7 | Feature | CRUD Categoria | Desarrollo de CRUD Categoria en backend | Alta | Realizado | Ruf Dzhaparova | 12/08/26 |
| 8 | Feature | CRUD Usuario | Desarrollo de CRUD Usuario en backend | Alta | Realizado | Ignacio Rosati | 12/08/26 |
| 9 | Feature | Auth login y register | Realiza login y register funcional implementando auth con JWT. | Alta | Realizado | Ignacio Rosati | 12/08/26 |
| 10 | Feature | Modulo Reporte y pagina Crear reporte | Desarrollo del modulo Reporte en backend y pagina para crear reportes | Alta | Realizado | Ignacio Rosati | 14/09/26 |
| 11 | Feature | Modulo Comentario | Desarrollo de modulo Comentario en backend | Alta | Realizado | Luca Franceschetti | 15/08/26 |
| 12 | Feature? | Sidebar colapsable | Implementacion de sidebar colapsable para mejorar vista mobile | Alta | Realizado | Ignacio Rosati | 15/09/26 |
| 13 | Fix | Config MariaDB y carga .env| Corrige inicializacion de BDD (remplaza valores hardcodeados por ENV) y asegura carga de .env como primera instruccion | Alta | Realizado | Ruf Dzhaparova | 15/09/26 |
| 14 | Feature | Detalle Reporte | Implementa pagina de detalle Reporte y su diseño basico | Alta | Realizado | Ignacio Rosati | 16/08/26 |
| 15 | Feature | Modulo Resolucion y Vigilante | Desarrollo de modulos Resolucion y Vigilante en backend | Alta | Realizado | Ignacio Rosati | 16/09/26 |
| 16 | Feature | Navbar | Implementa navbar, en la cual ahora se encuentran los botones de crear reporte, se puede visualizar el usuario logueado y cerrar sesion | Alta | Realizado | Ignacio Rosati | 16/09/26 |
| 17 | Feature | Comentarios | Implementa la posibilidad de realizar comentarios a los reportes desde la pagina Detalle Reporte | Alta | Realizado | Luca Franceschetti | 17/09/26 |
| 18 | Feature | Panel de admin | Implementa panel de admin con acceso desde la sidebar, tambien middleware de rol y protege las rutas relacionadas al panel| Alta | Realizado | Ignacio Rosati | 17/09/26 |
| 19 | Feature | Modulo Reaccion y TipoReaccion | Desarrollo del modulo Reaccion y TipoReaccion en backend | Alta | Realizado | Luca Franceschetti | 20/09/26 |
| 20 | Feature | CRUD TipoReaccion | Implementa pagina CRUD TipoReaccion al panel de admin | Alta | Realizado | Luca Franceschetti | 20/09/26 |
| 21 | Feature | Diseño de listados | Crea diseño e interfaz base para los listados del panel de admin | Alta | Realizado | Ruf Dzhaparova | 23/09/26 |
| 22 | Feature | CRUD Usuario y Reporte en panel | Implementa listados de CRUD Usuario y Reportes al panel de admin | Alta | Realizado | Ignacio Rosati | 25/09/26 |
| 23 | Feature | Autenticacion y permisos| Implementa autenticacion de admin para acceso a las secciones del panel y ajusta permisos en variso modulos para POST, PUT, GET y DELETE | Alta | Realizado | Ignacio Rosati | 25/09/26 |
| 24 | Feature | CRUDs Categoria y Vigilante en panel | Implementa listados de CRUDs Categoria y Vigilante al panel de admin | Alta | Realizado | Ruf Dzhaparova | 27/09/26 |
| 25 | Feature | Pagina editar perfil | Implementa pagina editar perfil (avatar y nombre) pudiendose acceder desde la navbar haciendo click en el usuario | Alta | Realizado | Ignacio Rosati | 27/09/26 |
| 26 | Feature | Subida de imagenes | Implementa libreria Multer al proyecto, agregando la posibilidad de subir imagenes a los reportes y subir foto de perfil| Alta | Realizado | Ignacio Rosati | 28/09/26 |
| 27 | Feature | Resoluciones en Detalle Reporte| Implementa la posibilidad de que los investigadores y los admins realicen resoluciones a los reportes | Alta | Realizado | Luca Franceschetti | 30/09/26 |
| 28 | Fix | Imagenes ahora aparecen en los reportes | Las imagenes no podian visualizarse en todos los Detalle Reporte | Alta | Realizado | Luca Franceschetti | 30/09/26 |
| 29 | Feature | Mapa Interactivo | Implementa libreria React Leaflet al proyecto, agregando el mapa de Hawkins en la pagina mapa donde se pueden visualizar las distintas zonas con su informacion correspondiente | Alta | Realizado | Ignacio Rosati | 01/10/26 |
| 30 | Feature | Filtro para listados | Implementa filtros a los listados y CRUDs del panel de admin| Alta | Realizado | Ruf Dzhaparova | 03/10/26 |
| 31 | Feature | Panel de investigador | Implementa pagina de panel de investigador con acceso desde la sidebar | Alta | Realizado | Ruf Dzhaparova | 04/10/26 |
| 32 | Fix | Cambio de estado en panel de investigador | Se verifica si hay resolucion o no antes de poder cambiar el estado y obliga a realizar resolucion antes de cambiar a resuelto | Alta | Realizado | Luca Franceschetti | 05/10/26 |
| 33 | Feature | Nueva pagina de inicio | Nuevo diseño de pagina de inicio, agregando logo y mas informacion sobre los reportes | Alta | Realizado | Luca Franceschetti | 07/10/26 |
| 34 | Fix | Avatar | Avatar desaparece de la navbar al cerrar sesion | Alta | Realizado | Ignacio Rosati | 07/10/26 |
| 35 | Feature | Detalle Zona | Implementa detalle Zona, accesible mediante mapa y listado de zonas en panel de admin | Alta | Realizado | Ruf Dzhaparova | 07/10/26 |
| 36 | Fix | Lupa en sidebar | Arregla el icono de lupa en la sidebar para investigadores, el cual no se podia visualizar correctamente | Alta | Realizado | Ruf Dzhaparova | 08/10/26 |
| 37 | Feature | Seed para instalacion | Implementa seed para agregar datos de ejemplo en la instalacion del proyecto | Alta | Realizado | Ignacio Rosati | 11/10/26 |