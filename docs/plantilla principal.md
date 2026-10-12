# Plantilla de Minutas y Registro de Avances — Hawkins Anomalies

Esta plantilla tiene dos secciones separadas:
1. **Minuta de reunión** — se completa cada vez que el equipo se junta (presencial o virtual) a discutir el proyecto.
2. **Registro de avances** — se completa periódicamente (por ejemplo, cada semana o al cierre de cada bloque de trabajo) para dejar constancia de qué se hizo, independientemente de si hubo una reunión formal ese día.

Podés usar un solo archivo por reunión/avance (copiando la plantilla cada vez), o ir agregando entradas nuevas abajo del mismo documento a medida que pasa el tiempo. Lo segundo suele ser más práctico para una materia, porque queda todo el historial en un solo lugar.

---

## 📋 Minuta de Reunión N.º1

**Fecha:** 18/04/2026
**Horario:** 17:00 a 18:30
**Modalidad:** Virtual - Discord
**Participantes:** Ignacio Rosati, Luca Franceschetti y Ruf Dzhaparova

### Temas tratados
Lista breve de los puntos que se discutieron, en el orden en que surgieron:
1. Tema principal del proyecto
2. CRUDs principales y extras del proyecto
3. Funciones y servicios principales de la pagina

### Decisiones tomadas
- Se decidió que la pagina estaria basada en los reportes de los usuarios y las resoluciones, osea que no seria un foro ni red social como era probable.
- Se definieron los CRUDs dependientes principales (Usuario, Categoria, Zona) y los dependientes (Comentario, Reporte)


### Pendientes de reuniones anteriores — seguimiento
Repasar qué pasó con las tareas que habían quedado pendientes la vez anterior.
| Tarea pendiente | Responsable | Estado |
|---|---|---|
| Ej: Migrar nivelPeligro a enum | Nombre | ✅ Resuelto |
| Ej: Conectar Categorías a la BDD | Nombre | 🔄 En curso |

### Tareas asignadas para la próxima etapa
| Tarea | Responsable | Fecha estimada |
|---|---|---|
| | | |
| | | |

### Problemas o bloqueos identificados
Cualquier obstáculo técnico, de coordinación, o de tiempo que esté frenando el avance.
- Ej: falta definir cómo se van a manejar los permisos de investigador sobre reportes

### Próxima reunión
**Fecha propuesta:** DD/MM/AAAA
**Temas a tratar:**
-

---

## 📈 Registro de Avances — Semana del DD/MM al DD/MM

**Integrante:** Nombre (completar una sección por persona, o una combinada si trabajaron junto)

### Qué se hizo
Descripción breve, en lenguaje claro (no hace falta detalle técnico exhaustivo, esto no es un commit log):
- Se implementó el CRUD completo de Usuario (backend: modelo, migración, 5 capas; frontend: conexión con login/register)
- Se agregó autenticación JWT con middleware de verificación de token
- Se ajustó el diseño responsive de la barra lateral para mobile

### Dificultades encontradas
Breve mención de qué costó más o qué hubo que resolver (sirve como registro de aprendizaje, y para justificar tiempo invertido si algo llevó más de lo esperado):
- Hubo que resolver un conflicto de nombres de clases CSS entre componentes que causaba un bug visual

### Qué queda pendiente / próximos pasos
- Conectar el CRUD de Vigilante a la base de datos
- Agregar validación de permisos por rol en las rutas de administración

### Capturas o evidencia (opcional)
Si querés, podés linkear o adjuntar capturas de pantalla del avance visual, o el link al commit/Pull Request correspondiente en GitHub.
- PR: #7 — feature/admin-usuarios-y-reportes

---

## 💡 Notas de uso de esta plantilla

- **Minutas:** completalas idealmente durante o inmediatamente después de cada reunión del equipo, mientras los temas están frescos. No hace falta que sean extensas — lo importante es que quede constancia de qué se decidió y quién se compromete a qué.
- **Registro de avances:** sirve como respaldo individual de trabajo, útil si la cátedra pide evidencia de aporte por integrante, y también como recordatorio propio de qué se hizo cada semana cuando el proyecto se extiende varias semanas.
- Si la cátedra pide un formato específico (por ejemplo, un Google Doc compartido o una planilla), podés usar esta misma estructura de secciones adentro de esa herramienta — el contenido es lo importante, el formato de archivo es secundario.
- Mantené un **historial acumulado**: no borres entradas viejas, simplemente agregá las nuevas arriba o abajo del documento, para tener trazabilidad de todo el proyecto cuando llegue el momento de la entrega final.
