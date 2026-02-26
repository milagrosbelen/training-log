# 📱 MiLogit - Resumen Conceptual del Sistema

## 🎯 ¿Qué es MiLogit?

MiLogit es una aplicación web para registrar y llevar un seguimiento de tus entrenamientos. Permite guardar información sobre cada sesión de ejercicio: qué ejercicios hiciste, cuánto peso levantaste, cuántas repeticiones, y cuánto tiempo duró tu entrenamiento.

---

## 🏗️ Arquitectura del Sistema

El sistema está dividido en **tres partes principales** que trabajan juntas:

1. **Frontend** - Lo que ve y usa el usuario
2. **Backend** - El servidor que procesa las peticiones
3. **Base de Datos** - Donde se guarda toda la información

---

## 🖥️ CÓMO FUNCIONA EL FRONTEND

### ¿Qué es el Frontend?

El frontend es la parte de la aplicación que el usuario ve y con la que interactúa. Es como la "cara" de la aplicación que aparece en el navegador web o en el celular.

### Componentes Principales

**1. Calendario Visual**
- Muestra los días del mes
- Permite seleccionar un día para ver o crear un entrenamiento
- Marca visualmente los días que tienen entrenamientos guardados

**2. Formulario de Entrenamiento**
- Permite ingresar el título del entrenamiento (ej: "Piernas + glúteos")
- Permite seleccionar ejercicios de una lista predefinida organizada por grupos musculares
- Permite agregar peso, repeticiones y series para cada ejercicio
- Permite registrar la duración del entrenamiento (horas y minutos)

**3. Vista de Resumen**
- Muestra los entrenamientos guardados de un día específico
- Permite editar o eliminar entrenamientos existentes

**4. Gráficos de Progreso**
- Muestra estadísticas y gráficos sobre los entrenamientos realizados
- Ayuda a visualizar el progreso a lo largo del tiempo

### ¿Cómo Funciona Internamente?

El frontend usa **React**, que es una tecnología que permite crear interfaces interactivas. Funciona de la siguiente manera:

1. **Estado de la Aplicación**: El frontend mantiene en memoria una lista de todos los entrenamientos que el usuario ha creado. Esta lista se actualiza constantemente.

2. **Interacción del Usuario**: Cuando el usuario hace clic en un botón, selecciona una fecha, o completa un formulario, el frontend reacciona inmediatamente mostrando cambios en la pantalla.

3. **Comunicación con el Backend**: Cuando el usuario guarda un entrenamiento, el frontend no lo guarda directamente. En su lugar, envía los datos al backend para que los procese y los guarde en la base de datos.

4. **Actualización Automática**: Después de guardar un entrenamiento, el frontend pide automáticamente al backend la lista completa actualizada de entrenamientos, y actualiza la pantalla sin necesidad de recargar la página.

---

## ⚙️ CÓMO FUNCIONA EL BACKEND

### ¿Qué es el Backend?

El backend es como un "mesero" en un restaurante. El usuario (frontend) hace pedidos, y el backend los procesa, va a la cocina (base de datos), trae lo que se necesita, y se lo entrega al usuario.

### Funciones Principales

**1. Recibir Peticiones**
- El backend está siempre "escuchando" en el puerto 3000, esperando que lleguen peticiones del frontend
- Cuando llega una petición, la analiza y decide qué hacer

**2. Validar Datos**
- Antes de guardar cualquier información, el backend verifica que los datos sean correctos
- Verifica que todos los campos obligatorios estén presentes
- Verifica que los datos tengan el formato correcto (por ejemplo, que la fecha sea válida)
- Verifica que los números sean números válidos
- Si algo está mal, devuelve un mensaje de error claro al frontend

**3. Comunicarse con la Base de Datos**
- Una vez que los datos están validados, el backend se conecta a PostgreSQL
- Ejecuta comandos SQL para guardar o recuperar información
- Usa un "pool de conexiones" para manejar múltiples peticiones de forma eficiente

**4. Responder al Frontend**
- Después de procesar la petición, el backend envía una respuesta al frontend
- La respuesta puede ser exitosa (con los datos solicitados) o un error (con un mensaje explicando qué salió mal)

### Endpoints Disponibles

El backend tiene "direcciones" específicas (llamadas endpoints) para diferentes acciones:

- **GET /health**: Verifica que el servidor esté funcionando
- **POST /trainings**: Crea un nuevo entrenamiento en la base de datos
- **GET /trainings**: Obtiene todos los entrenamientos guardados, ordenados por fecha (más recientes primero)

---

## 🔌 CÓMO SE CONECTAN FRONTEND Y BACKEND

### La Comunicación HTTP

El frontend y el backend se comunican usando el protocolo HTTP, que es el mismo que usa tu navegador para cargar páginas web.

### Flujo de Comunicación

**1. Cuando el Usuario Guarda un Entrenamiento:**

```
Usuario completa formulario → Frontend prepara los datos → Frontend envía POST al backend
→ Backend valida los datos → Backend guarda en base de datos → Backend responde "éxito"
→ Frontend pide lista actualizada (GET) → Backend devuelve lista completa → Frontend actualiza pantalla
```

**2. Cuando la Aplicación se Inicia:**

```
Aplicación se carga → Frontend pide lista de entrenamientos (GET) → Backend consulta base de datos
→ Backend devuelve lista → Frontend muestra entrenamientos en el calendario
```

### Transformación de Datos

El frontend y el backend usan formatos ligeramente diferentes para los datos:

- **Frontend usa**: `date`, `type`, `duration`, `exercises`
- **Backend espera**: `fecha`, `user_id`, `duracion_minutos`, `notas`

Por eso existe una capa de "transformación" que convierte los datos de un formato al otro cuando se envían o reciben.

### CORS (Permisos de Acceso)

El backend tiene configurado CORS, que es como un "permiso" que le dice al navegador: "Está bien que el frontend (que puede estar en otro puerto o dominio) se comunique conmigo". Sin esto, el navegador bloquearía las peticiones por seguridad.

---

## 💾 CÓMO SE GUARDA Y RECUPERA LA INFORMACIÓN

### La Base de Datos PostgreSQL

PostgreSQL es como un archivero digital muy organizado. En lugar de tener carpetas físicas, tiene "tablas" que son como hojas de cálculo donde se guarda la información de forma estructurada.

### Estructura de la Base de Datos

**Tabla: `users`**
- Guarda información de los usuarios (id, nombre, email)
- Por ahora se usa un usuario por defecto (user_id = 1)

**Tabla: `trainings`**
- Guarda cada entrenamiento realizado
- Campos principales:
  - `id`: Identificador único (se genera automáticamente)
  - `user_id`: A qué usuario pertenece este entrenamiento
  - `fecha`: Fecha del entrenamiento (formato YYYY-MM-DD)
  - `duracion_minutos`: Cuánto duró el entrenamiento
  - `notas`: Información adicional en formato JSON (título del entrenamiento y lista de ejercicios)

### Proceso de Guardado

**1. El Usuario Guarda un Entrenamiento:**
- El frontend envía los datos al backend
- El backend valida que todo esté correcto
- El backend crea un comando SQL: `INSERT INTO trainings ...`
- PostgreSQL ejecuta el comando y guarda una nueva fila en la tabla
- PostgreSQL devuelve el registro completo guardado (incluyendo el ID generado)
- El backend envía esta confirmación al frontend

### Proceso de Recuperación

**1. El Usuario Ve sus Entrenamientos:**
- El frontend pide la lista al backend
- El backend crea un comando SQL: `SELECT * FROM trainings ORDER BY fecha DESC`
- PostgreSQL busca todas las filas en la tabla
- PostgreSQL devuelve todos los registros ordenados por fecha (más recientes primero)
- El backend transforma los datos al formato del frontend
- El frontend recibe la lista y la muestra en el calendario

### Pool de Conexiones

El backend usa un "pool de conexiones" para comunicarse con PostgreSQL. Es como tener varios teléfonos disponibles para llamar a la base de datos. En lugar de crear una nueva conexión cada vez (que es lento), el backend reutiliza conexiones existentes, lo que hace todo más rápido y eficiente.

---

## 🔄 FLUJO COMPLETO: Ejemplo Real

Imaginemos que un usuario quiere guardar un entrenamiento del día de hoy:

### Paso 1: Usuario Interactúa con el Frontend
- El usuario abre la aplicación en su navegador
- Selecciona el día de hoy en el calendario
- Completa el formulario: título "Piernas", agrega ejercicios, marca 60 minutos de duración
- Hace clic en "Guardar"

### Paso 2: Frontend Prepara los Datos
- El frontend toma todos los datos del formulario
- Los transforma al formato que el backend espera
- Prepara una petición HTTP POST con estos datos

### Paso 3: Frontend Envía al Backend
- El frontend envía la petición a `http://localhost:3000/trainings`
- El navegador permite esta petición gracias a CORS configurado en el backend

### Paso 4: Backend Recibe y Valida
- El backend recibe la petición
- Verifica que `user_id`, `fecha` y `duracion_minutos` estén presentes
- Verifica que `user_id` sea un número válido
- Verifica que la fecha tenga el formato correcto (YYYY-MM-DD)
- Verifica que la fecha no sea futura
- Verifica que el `user_id` exista en la tabla `users`

### Paso 5: Backend Guarda en Base de Datos
- Si todo está bien, el backend se conecta a PostgreSQL usando el pool de conexiones
- Ejecuta: `INSERT INTO trainings (user_id, fecha, duracion_minutos, notas) VALUES (...)`
- PostgreSQL guarda el nuevo registro y genera un ID automáticamente
- PostgreSQL devuelve el registro completo guardado

### Paso 6: Backend Responde al Frontend
- El backend envía una respuesta exitosa (código 201) con los datos del entrenamiento guardado

### Paso 7: Frontend Actualiza la Lista
- El frontend recibe la confirmación
- Inmediatamente hace una nueva petición GET para obtener todos los entrenamientos actualizados
- El backend consulta PostgreSQL: `SELECT * FROM trainings ORDER BY fecha DESC`
- El backend devuelve la lista completa actualizada

### Paso 8: Frontend Actualiza la Pantalla
- El frontend recibe la lista actualizada
- Actualiza su estado interno con los nuevos datos
- La pantalla se actualiza automáticamente mostrando el nuevo entrenamiento en el calendario
- Se muestra un mensaje de éxito al usuario
- Todo esto sucede sin recargar la página

---

## 🎯 Resumen en 3 Puntos

1. **Frontend**: Es lo que el usuario ve y usa. Reacciona a las acciones del usuario y se comunica con el backend para guardar o recuperar información.

2. **Backend**: Es el servidor que procesa las peticiones, valida los datos, y se comunica con la base de datos. Actúa como intermediario entre el frontend y la base de datos.

3. **Base de Datos**: Es donde se guarda permanentemente toda la información. PostgreSQL organiza los datos en tablas y permite guardar y recuperar información de forma rápida y segura.

---

## 🔐 Seguridad y Validación

- **Validación en el Backend**: Todos los datos se validan antes de guardarse. Esto previene errores y protege la integridad de la información.

- **Manejo de Errores**: Si algo sale mal en cualquier paso, el sistema devuelve mensajes de error claros que ayudan a entender qué pasó.

- **CORS**: Permite que el frontend y el backend se comuniquen de forma segura, incluso si están en diferentes puertos o dominios.

---

## 📝 Notas Finales

- El sistema está diseñado para ser **escalable**: Puede manejar múltiples usuarios y muchos entrenamientos sin problemas.

- El sistema es **modular**: Cada parte (frontend, backend, base de datos) puede funcionar de forma independiente, lo que facilita el mantenimiento y las mejoras futuras.

- El sistema es **reactivo**: Los cambios se reflejan inmediatamente en la pantalla sin necesidad de recargar la página, proporcionando una experiencia de usuario fluida.





