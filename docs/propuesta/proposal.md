# Hawkins Anomalies

## Grupo
### Integrantes
* 54827 - Rosati, Ignacio Jesús
* 54824 - Franceschetti, Luca
* 53668 - Dzhaparova, Ruf

### Repositorios
* [frontend app](http://hyperlinkToGihubOrGitlab)
* [backend app](http://hyperlinkToGihubOrGitlab)

## Tema
### Descripción
Aplicación web que simula un sistema de reportes en el pueblo de Hawkins perteneciente al universo de Stranger Things, donde los habitantes pueden reportar eventos extraños y anomalias. Los reportes incluyen información relevante como descripción, categoría y ubicación, y pueden ser comentados por otros usuarios. Además, un grupo de investigadores pueden ir a la ubicacion del hecho para investigar y luego actualizar el estado de los reportes acompañados de una resolucion, de esta manera se facilita la comprensión colectiva de los fenómenos.

### Modelo
<iframe width="100%" height="500px" style="box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); border-radius:15px; filter: invert(1)" allowtransparency="true" allowfullscreen="true" scrolling="no" title="Embedded DrawSQL IFrame" frameborder="0" src="https://drawsql.app/teams/elthromo/diagrams/hawkins-anomalies/embed"></iframe>


## Alcance Funcional 

### Alcance Mínimo



Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoria<br>3. CRUD Zona |
|CRUD dependiente|1. CRUD Vigilante {depende de} CRUD Zona<br>2. CRUD Comentario {depende de} CRUD Usuario y Reporte|
|Listado<br>+<br>detalle| 1. Listado de reportes, muestra título, categoria y usuario con filtros por zona, categoria y estado => detalle muestra contenido completo y comentarios <br>2. Listado de zonas con filtro por nivel de peligro => detalle muestra contenido completo: nombre, descripcion, nivel de peligro, vigilante y reportes|
|CUU/Epic|1. Realizar reporte de anomalia<br>2. Comentar o reaccionar al reporte de otro usuario|


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Usuario<br>2. CRUD Categoria<br>3. CRUD Zona<br>4. CRUD Comentario<br>5. CRUD Vigilante<br>6. CRUD Reaccion<br>7. CRUD Resolucion|
|CUU/Epic|1. Validar y cambiar el estado de un reporte (No verificado, En investigacion, Verificado) <br>2. Agregar una resolución a un reporte luego de la investigación realizada por un investigador|


### Alcance Adicional Voluntario
|Req|Detalle|
|:-|:-|
|Listados |1. Listado de categorias, vigilantes y tipos de reaccion. <br>2. Listado de usuarios => detalle con sus reportes|
|Otros|1. Notificaciones: notificar al usuario cuando alguien comenta o reacciona a su reporte.|

