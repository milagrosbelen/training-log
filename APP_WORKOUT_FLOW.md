# FitnessLog - Documentación de Funcionamiento

## 1. Introducción

### ¿Qué es FitnessLog?

FitnessLog es una aplicación web diseñada para registrar y gestionar entrenamientos de gimnasio de forma clara y profesional. Permite a los usuarios llevar un registro detallado de sus sesiones de entrenamiento, incluyendo ejercicios, series, repeticiones, pesos y duración.

### Público objetivo

La aplicación está pensada para personas que entrenan regularmente, tanto principiantes como avanzados, que buscan:

- Registrar sus entrenamientos de forma organizada
- Llevar un seguimiento de su progreso
- Mantener constancia en su rutina de ejercicio
- Tener un historial claro de sus sesiones de entrenamiento

### Objetivo principal

El objetivo principal de FitnessLog es proporcionar una herramienta simple pero completa para:

- Registrar entrenamientos de forma rápida y clara
- Visualizar el historial de entrenamientos guardados
- Facilitar la repetición de rutinas anteriores
- Mantener un registro permanente y editable de cada sesión

---

## 2. Flujo General de Uso

### Paso 1: Selección de un día en el calendario

Al abrir la aplicación, el usuario se encuentra con un calendario mensual interactivo. Para comenzar a registrar un entrenamiento:

1. Navegar por los meses usando las flechas de navegación
2. Hacer clic en el día deseado del calendario
3. El día seleccionado se resalta visualmente
4. Si el día tiene un entrenamiento guardado, se muestra automáticamente en modo lectura
5. Si el día está vacío, se muestra el formulario para crear un nuevo entrenamiento

### Paso 2: Crear un entrenamiento nuevo o copiar uno anterior

#### Crear entrenamiento nuevo

Cuando se selecciona un día vacío:

1. Si existen entrenamientos anteriores guardados, aparece automáticamente un modal preguntando si se desea copiar un entrenamiento anterior
2. El usuario puede elegir copiar un entrenamiento o crear uno nuevo desde cero
3. Si se cierra el modal sin seleccionar, se puede crear un entrenamiento nuevo manualmente

#### Copiar entrenamiento anterior

1. El modal muestra los últimos 10 entrenamientos guardados, ordenados por fecha (más reciente primero)
2. Cada opción muestra:
   - Nombre del entrenamiento
   - Fecha original del entrenamiento
   - Cantidad de ejercicios y total de series
3. Al seleccionar un entrenamiento, se copia automáticamente al día seleccionado
4. El entrenamiento copiado se carga en modo edición, permitiendo modificar cualquier dato antes de guardar

### Paso 3: Registrar ejercicios, series, pesos y repeticiones

Una vez que se tiene el formulario de entrenamiento abierto:

1. **Tipo de entrenamiento**: Se escribe libremente el tipo de entrenamiento (ejemplo: "Glúteos + Isquios", "Piernas (foco cuádriceps)", "Hombros + Core")
2. **Duración**: Se registra el tiempo total de la sesión en horas y minutos
3. **Ejercicios**: Para cada ejercicio se registra:
   - Nombre del ejercicio
   - Peso utilizado (en kilogramos)
   - Número de repeticiones
   - Número de series
4. Se pueden agregar múltiples ejercicios usando el botón "Añadir Ejercicio"
5. Cada ejercicio puede ser eliminado individualmente si es necesario

### Paso 4: Guardar entrenamiento

Al completar el registro:

1. Se valida que el tipo de entrenamiento no esté vacío
2. Se hace clic en el botón "GUARDAR ENTRENAMIENTO"
3. El entrenamiento se guarda permanentemente con la fecha seleccionada
4. El entrenamiento queda en modo "guardado" (locked), lo que significa que se muestra como registro permanente
5. La vista cambia automáticamente a modo lectura, mostrando el resumen del entrenamiento guardado

### Paso 5: Visualizar entrenamiento guardado

Una vez guardado, el entrenamiento se muestra en modo lectura con:

- Título del entrenamiento (el tipo escrito por el usuario)
- Fecha completa formateada
- Duración total de la sesión
- Lista completa de ejercicios con sus respectivos pesos, repeticiones y series
- Botones para modificar o eliminar el entrenamiento

---

## 3. Gestión de Entrenamientos

### Cómo se guarda un entrenamiento

Cuando un usuario guarda un entrenamiento:

1. Todos los datos ingresados se validan
2. El entrenamiento se guarda con un estado `locked: true`, que indica que es un registro permanente
3. Los datos se almacenan en el almacenamiento local del navegador (localStorage)
4. El entrenamiento queda asociado a la fecha exacta seleccionada en el calendario

### Qué significa que quede guardado

Un entrenamiento guardado (`locked: true`) significa:

- Es un registro permanente e histórico
- Se muestra en modo solo lectura por defecto
- Aparece marcado en el calendario con un indicador visual (candado)
- No se puede editar directamente sin activar explícitamente el modo edición
- Se mantiene en el historial para futuras referencias o copias

### Qué se puede editar y qué no

**Datos editables:**
- Tipo de entrenamiento (nombre)
- Duración de la sesión
- Lista completa de ejercicios (agregar, eliminar, modificar)
- Peso, repeticiones y series de cada ejercicio

**Datos no editables directamente:**
- La fecha del entrenamiento (está fija al día seleccionado en el calendario)
- El estado de "guardado" (una vez guardado, siempre queda como registro permanente)

### Cómo funciona la edición de un entrenamiento ya guardado

Para editar un entrenamiento guardado:

1. Se selecciona el día en el calendario que contiene el entrenamiento
2. Se visualiza el resumen del entrenamiento en modo lectura
3. Se hace clic en el botón "Modificar"
4. El entrenamiento se carga en modo edición con todos sus datos
5. Se pueden modificar todos los campos (tipo, duración, ejercicios)
6. Al guardar nuevamente, se actualiza el entrenamiento existente
7. El entrenamiento vuelve a quedar en modo guardado (`locked: true`)

---

## 4. Copiar Entrenamiento Anterior

### Qué hace esta funcionalidad

La funcionalidad de copiar entrenamiento permite duplicar un entrenamiento anterior y aplicarlo a un día nuevo, facilitando la repetición de rutinas.

### Qué datos se copian

Cuando se copia un entrenamiento, se duplican:

- El tipo de entrenamiento (nombre)
- La duración de la sesión
- Todos los ejercicios con sus respectivos:
  - Nombres
  - Pesos
  - Repeticiones
  - Series

### Qué datos no se copian

Los siguientes datos NO se copian del entrenamiento original:

- La fecha original (se usa la fecha del día seleccionado)
- El estado de guardado (el entrenamiento copiado inicia como editable)
- Los IDs de los ejercicios (se generan nuevos IDs únicos para evitar conflictos)

### Por qué es útil para el usuario

Esta funcionalidad es especialmente útil para:

- Repetir rutinas que funcionaron bien
- Mantener consistencia en entrenamientos similares
- Ahorrar tiempo al no tener que ingresar manualmente todos los ejercicios
- Probar variaciones de un entrenamiento anterior (copiar y luego modificar pesos o ejercicios)
- Seguir programas de entrenamiento estructurados

### Flujo de copia

1. Usuario selecciona un día vacío en el calendario
2. Si hay entrenamientos anteriores, aparece automáticamente el modal de copia
3. El modal muestra los últimos 10 entrenamientos guardados, ordenados por fecha (más reciente primero)
4. Cada opción muestra información resumida del entrenamiento
5. Al seleccionar uno, se copia al día seleccionado
6. El entrenamiento copiado se carga en modo edición
7. El usuario puede modificar cualquier dato antes de guardar
8. Al guardar, se crea un nuevo entrenamiento con la fecha seleccionada

---

## 5. Manejo de Fechas

### Cómo se guardan las fechas

Las fechas se guardan en formato estándar `YYYY-MM-DD` (año-mes-día). Por ejemplo:
- 21 de enero de 2026 se guarda como: `2026-01-21`
- 15 de marzo de 2026 se guarda como: `2026-03-15`

Este formato garantiza:
- Ordenamiento correcto cronológico
- Compatibilidad con sistemas de fecha estándar
- Sin ambigüedades en la interpretación

### Garantía de exactitud de fechas

La aplicación utiliza un sistema de manejo de fechas que garantiza:

- La fecha mostrada es exactamente la fecha seleccionada en el calendario
- No hay corrimientos de días por problemas de zona horaria
- La fecha guardada coincide con la fecha mostrada
- El calendario refleja correctamente el calendario real del año

### Uso del calendario real

El calendario de la aplicación:

- Muestra los días del mes correctamente según el calendario gregoriano
- Respeta los días de la semana reales
- Permite navegar entre meses y años
- Marca visualmente el día actual
- Muestra indicadores visuales para días con entrenamientos guardados

### Indicadores visuales en el calendario

- **Día seleccionado**: Se resalta con color destacado
- **Día actual**: Tiene un borde especial para identificarlo
- **Día con entrenamiento guardado**: Muestra un candado en la parte inferior
- **Día con entrenamiento no guardado**: Muestra un punto pequeño

---

## 6. Ejercicios y Series

### Cómo se registran

Para registrar un ejercicio:

1. Se hace clic en "Añadir Ejercicio"
2. Aparece una nueva tarjeta de ejercicio
3. Se completa la información:
   - **Nombre**: Texto libre (ejemplo: "Sentadilla", "Press banca", "Remo con barra")
   - **Peso**: Número en kilogramos (puede incluir decimales)
   - **Repeticiones**: Número entero
   - **Series**: Número entero (mínimo 1)
4. Los cambios se guardan automáticamente mientras se escribe
5. Se puede eliminar un ejercicio en cualquier momento usando el botón de eliminar

### Cómo se muestran una vez guardados

En el resumen del entrenamiento guardado, los ejercicios se muestran en tarjetas individuales con:

- Nombre del ejercicio destacado
- Información organizada en tres columnas:
  - Peso (en kilogramos)
  - Repeticiones
  - Series
- Diseño limpio y fácil de leer

### Estructura visual

La aplicación utiliza un diseño basado en tarjetas (cards) para:

- **Formulario de edición**: Cada ejercicio tiene su propia tarjeta editable
- **Vista de resumen**: Cada ejercicio tiene su propia tarjeta de solo lectura
- **Modal de copia**: Cada entrenamiento se muestra como una tarjeta seleccionable

Este diseño proporciona:
- Claridad visual
- Separación clara de información
- Facilidad de lectura
- Consistencia en toda la aplicación

---

## 7. Edición y Correcciones

### Opción de modificar un entrenamiento guardado

Cualquier entrenamiento guardado puede ser modificado en cualquier momento:

1. Seleccionar el día del entrenamiento en el calendario
2. Visualizar el resumen del entrenamiento
3. Hacer clic en el botón "Modificar"
4. El entrenamiento se carga en modo edición
5. Realizar los cambios necesarios
6. Guardar para actualizar el entrenamiento

### Cuándo usar la edición

La edición es útil para:

- Corregir errores de tipeo o datos incorrectos
- Actualizar pesos o repeticiones si se recuerda información adicional
- Agregar ejercicios que se olvidaron registrar
- Eliminar ejercicios que se registraron por error
- Modificar el nombre del entrenamiento para mayor claridad

### Cómo se refleja el cambio en la vista

Al guardar cambios:

1. El entrenamiento se actualiza inmediatamente
2. La vista cambia automáticamente de modo edición a modo lectura
3. El resumen actualizado se muestra con los nuevos datos
4. Los cambios quedan guardados permanentemente
5. El entrenamiento mantiene su fecha original (no cambia)

### Eliminación de entrenamientos

Los entrenamientos también pueden ser eliminados:

1. Seleccionar el día del entrenamiento
2. Visualizar el resumen
3. Hacer clic en el botón "Eliminar"
4. Confirmar la eliminación
5. El entrenamiento se elimina permanentemente del historial

---

## 8. Experiencia de Usuario (UX)

### Estados visuales

La aplicación utiliza diferentes estados visuales para indicar el estado de los elementos:

**Día en calendario:**
- Normal: Fondo gris semitransparente
- Seleccionado: Fondo destacado con color teal
- Día actual: Borde especial para identificación
- Con entrenamiento guardado: Indicador de candado

**Entrenamiento:**
- Modo lectura: Vista de solo lectura con información organizada
- Modo edición: Formulario interactivo con campos editables
- Guardado: Estado permanente con indicador visual

**Botones:**
- Hover: Efecto visual al pasar el cursor
- Activo: Estado destacado para acciones principales
- Deshabilitado: Estado visual para acciones no disponibles

### Mensajes de confirmación

La aplicación utiliza mensajes de confirmación para acciones importantes:

- **Eliminar entrenamiento**: Solicita confirmación antes de eliminar permanentemente
- **Guardar sin tipo**: Muestra alerta si se intenta guardar sin tipo de entrenamiento
- **Validaciones**: Informa al usuario sobre campos requeridos o datos inválidos

### Diseño enfocado en claridad

El diseño de la aplicación prioriza:

- **Claridad**: Información organizada y fácil de entender
- **Simplicidad**: Flujos intuitivos sin pasos innecesarios
- **Consistencia**: Mismos patrones visuales en toda la aplicación
- **Legibilidad**: Tipografía clara y contraste adecuado
- **Responsividad**: Funciona correctamente en diferentes tamaños de pantalla

### Navegación

La aplicación tiene dos vistas principales:

1. **Vista de Entrenamientos**: Calendario y registro de entrenamientos
2. **Vista de Progreso**: Resumen mensual con estadísticas

La navegación entre vistas se realiza mediante botones en el header, manteniendo siempre visible la opción de cambiar de vista.

---

## 9. Almacenamiento de Datos

### Dónde se guardan los datos

Los datos se almacenan localmente en el navegador del usuario utilizando la tecnología `localStorage` del navegador web. Esto significa:

- Los datos permanecen en el dispositivo del usuario
- No se envían a ningún servidor externo
- Los datos persisten entre sesiones del navegador
- Cada usuario tiene su propio conjunto de datos independiente

### Qué tipo de información se persiste

Se guarda la siguiente información para cada entrenamiento:

- **Fecha**: En formato YYYY-MM-DD
- **Tipo de entrenamiento**: Texto libre escrito por el usuario
- **Duración**: Tiempo total en minutos
- **Estado de guardado**: Indicador booleano (locked)
- **Ejercicios**: Array con información de cada ejercicio:
  - ID único del ejercicio
  - Nombre del ejercicio
  - Peso (en kilogramos)
  - Repeticiones
  - Series

### Limitaciones actuales

Las limitaciones del almacenamiento local incluyen:

- **Capacidad**: Limitado por el espacio disponible en localStorage (generalmente 5-10 MB)
- **Dispositivo específico**: Los datos solo están disponibles en el navegador donde se guardaron
- **Sin sincronización**: No hay sincronización automática entre dispositivos
- **Sin respaldo automático**: El usuario debe hacer respaldos manuales si desea preservar los datos
- **Dependencia del navegador**: Si se limpia el almacenamiento del navegador, se pierden los datos

### Persistencia de datos

Los datos se guardan automáticamente cada vez que:

- Se guarda un nuevo entrenamiento
- Se modifica un entrenamiento existente
- Se elimina un entrenamiento

No es necesario realizar ninguna acción adicional para guardar los datos; el proceso es automático e inmediato.

---

## 10. Alcance Actual y Mejoras Futuras

### Funcionalidades actuales

La aplicación actualmente incluye:

1. **Calendario interactivo**: Navegación por meses y selección de días
2. **Registro de entrenamientos**: Formulario completo para registrar sesiones
3. **Vista de resumen**: Visualización de entrenamientos guardados
4. **Edición de entrenamientos**: Modificación de entrenamientos existentes
5. **Eliminación de entrenamientos**: Borrado permanente de registros
6. **Copia de entrenamientos**: Duplicación de rutinas anteriores
7. **Resumen mensual**: Vista de estadísticas y progreso del mes
8. **Almacenamiento local**: Persistencia de datos en el navegador
9. **Manejo preciso de fechas**: Sin errores de zona horaria
10. **Tipo de entrenamiento libre**: Sin restricciones en el nombre

### Mejoras futuras contempladas

Aunque no están implementadas actualmente, se contemplan las siguientes mejoras:

**Análisis de progreso:**
- Gráficos de evolución de pesos
- Comparación de entrenamientos similares
- Estadísticas de volumen total
- Tendencias de mejora

**Funcionalidades sociales:**
- Compartir entrenamientos
- Exportar datos
- Importar rutinas

**Mejoras técnicas:**
- Sincronización con servidor (backend)
- Respaldo en la nube
- Aplicación móvil nativa
- Notificaciones y recordatorios

**Funcionalidades avanzadas:**
- Plantillas de entrenamiento
- Programas de entrenamiento estructurados
- Seguimiento de objetivos
- Integración con dispositivos de fitness

**Mejoras de UX:**
- Búsqueda de entrenamientos
- Filtros por tipo de entrenamiento
- Vista de lista de todos los entrenamientos
- Exportación a PDF o Excel

### Estado del proyecto

La aplicación se encuentra en un estado funcional y completo para el uso básico de registro de entrenamientos. Todas las funcionalidades principales están implementadas y probadas. El código está estructurado de forma que facilite la adición de nuevas funcionalidades en el futuro.

---

## Conclusión

FitnessLog es una herramienta completa y profesional para el registro de entrenamientos, diseñada con un enfoque en la simplicidad y la claridad. Proporciona todas las funcionalidades necesarias para mantener un registro detallado y organizado de las sesiones de entrenamiento, con la flexibilidad de editar, copiar y gestionar los datos según las necesidades del usuario.

La aplicación prioriza la experiencia del usuario, garantizando que el proceso de registro sea rápido, intuitivo y libre de errores, especialmente en el manejo de fechas y datos. El diseño visual limpio y profesional facilita la lectura y comprensión de la información registrada.












