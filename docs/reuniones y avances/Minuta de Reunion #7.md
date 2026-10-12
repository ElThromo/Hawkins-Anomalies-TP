## 📋 Minuta de Reunión N.º7

**Fecha:** 17/09/2026
**Horario:** 15:00 a 17:00
**Modalidad:** Virtual - Discord
**Participantes:** Ignacio Rosati, Luca Franceschetti y Ruf Dzhaparova

### Temas tratados
1. Desarrollo del panel de admin
2. Asignacion de tareas
3. Funcionalidades y permisos en cuanto admin e investigadores.

### Decisiones tomadas
- Se decidió que en el panel de admin se incluiran los CRUDs de Usuario, Reporte, Categoria, Zona, Tipo de Reaccion y Vigilante (cada uno realiza el CRUD de la entidad que desarrollo en el backend)
- Se decidió que los admins tengan acceso a todos los CRUDs y realizen ademas trabajos de moderacion
- Se decidió que los investigadores solo puedan realizar resoluciones a los reportes y cambiar el estado de los mismos.

### Avances
Dias anteriores a la reunion:
- Ignacio creo la entidad de Reporte, conectandolo con el frontend y realizando la pagina de Detalle Reporte en donde se puede ver toda la informacion de cada reporte. Ademas hizo la sidebar colapsable y agrego la navbar.
- Ruf creo las entidades de Resolucion y Vigilante en el backend.
- Luca creo las entidades de Comentario y Reaccion, ambas conectadas al frontend de Detalle Reporte dando la posibilidad de comentar y reaccionar cualquier reporte y que se vea reflejado en la pantalla.