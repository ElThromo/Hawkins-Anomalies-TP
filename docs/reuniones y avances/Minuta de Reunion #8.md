## 📋 Minuta de Reunión N.º8

**Fecha:** 27/09/2026
**Horario:** 18:00 a 19:00
**Modalidad:** Virtual - Discord
**Participantes:** Ignacio Rosati, Luca Franceschetti y Ruf Dzhaparova

### Temas tratados
1. Desarrollo de editar perfil
2. Asignacion de tareas
3. Agregado de imagenes
4. Ajustes de diseño y agregado de funciones a Detalle Reporte

### Decisiones tomadas
- Se decidió agregar la libreria multer para imagenes
- Se decidió que el panel de editar perfil se podra editar la foto, nombre y contraseña
- Se decidió agregar la posibilidad de agregar imagenes al reporte y reajustar el diseño de los comentarios
- Se definió como funcionaria el agregado de resoluciones a los reportes por parte de los investigadores o admins

### Avances
Dias anteriores a la reunion:
- Ignacio creó el panel de admin agregando los iconos correspondientes para cada CRUD e integro los CRUDs de Reporte y Usuario. Ademas protegió todas las rutas con un middleware de rol y realizó varios ajustes de diseño.
- Ruf creó el diseño e interfaz base para los listados y modals para cada CRUD del panel de admin y tambien agrego los CRUDs de Resolucion y Vigilante al mismo.
- Luca ajustó la entidad de Reaccion dando la posibilidad de crear nuevos tipos de reacciones e integro los CRUDs de Zona y TipoReaccion al panel de admin.