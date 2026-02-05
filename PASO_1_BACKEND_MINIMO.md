# Paso 1: Backend Mínimo - MiLogit

## ¿Qué es un Backend?

Imagina que tu aplicación web es como un restaurante:
- **Frontend** = El comedor donde los clientes (usuarios) ven el menú y piden comida
- **Backend** = La cocina donde se prepara la comida y se gestiona todo

El backend es la parte "invisible" de tu aplicación que:
- Recibe peticiones del frontend
- Procesa información
- Envía respuestas de vuelta

## ¿Qué es Node.js?

**Node.js** es un programa que te permite ejecutar JavaScript fuera del navegador. Normalmente JavaScript solo funciona en el navegador (como Chrome o Firefox), pero Node.js lo hace funcionar en tu computadora como un servidor.

Es como tener un intérprete que entiende JavaScript y puede hacer cosas como:
- Escuchar peticiones de internet
- Leer archivos
- Conectarse a bases de datos

## ¿Qué es Express?

**Express** es una librería (un conjunto de herramientas) para Node.js que hace MUY fácil crear servidores web.

Sin Express, crear un servidor sería complicado y tendrías que escribir mucho código. Express te da funciones listas para usar, como:
- Crear rutas (endpoints)
- Recibir datos
- Enviar respuestas

Es como tener un asistente que ya sabe cómo hacer las cosas comunes de un servidor.

## ¿Qué es un Endpoint?

Un **endpoint** es como una "dirección" en tu servidor. Es una URL específica que hace algo cuando la visitas.

Piensa en tu servidor como un edificio con muchas puertas:
- Cada puerta es un endpoint
- Cada puerta tiene un número (la URL)
- Cuando tocas una puerta (haces una petición), el servidor te responde

Por ejemplo:
- `http://localhost:3000/health` → Es la puerta "health"
- Cuando visitas esa URL, el servidor te responde con `{ "status": "ok" }`

## Estructura del Proyecto

```
registro-entrenamiento/
├── index.js                    ← Nuestro servidor backend
├── package.json                ← Configuración del proyecto
└── node_modules/               ← Librerías instaladas (Express, etc.)
```

## Archivos Creados

### 1. `index.js` - El Servidor

Este es el archivo principal del backend. Contiene todo el código del servidor.

**¿Qué hace cada parte?**

```javascript
import express from 'express';
```
- **Para qué sirve**: Importa la librería Express para poder usarla
- **Analogía**: Es como decir "quiero usar las herramientas de Express"

```javascript
const app = express();
```
- **Para qué sirve**: Crea una aplicación Express (nuestro servidor)
- **Analogía**: Es como "encender" el servidor, pero todavía no está escuchando

```javascript
const PORT = 3000;
```
- **Para qué sirve**: Define en qué puerto (número) escuchará el servidor
- **Analogía**: Es como elegir el número de puerta de tu casa. El puerto 3000 es común para desarrollo

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```
- **Para qué sirve**: Crea el endpoint `/health`
- **Desglose**:
  - `app.get()` = Crea una ruta que responde a peticiones GET (como visitar una página)
  - `'/health'` = La dirección/URL del endpoint
  - `(req, res) => {}` = Una función que se ejecuta cuando alguien visita esa URL
    - `req` = La petición que llega (request)
    - `res` = La respuesta que enviamos (response)
  - `res.json()` = Envía una respuesta en formato JSON

```javascript
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
```
- **Para qué sirve**: Hace que el servidor empiece a escuchar peticiones
- **Analogía**: Es como "abrir la puerta" del servidor para que empiece a funcionar

### 2. `package.json` - Configuración

Este archivo ya existía, pero le agregamos un script nuevo:

```json
"server": "node index.js"
```

- **Para qué sirve**: Crea un comando corto para ejecutar el servidor
- **Cómo funciona**: En lugar de escribir `node index.js`, puedes escribir `npm run server`

## Cómo Levantar el Servidor

### Paso 1: Abrir la Terminal

Abre la terminal en la carpeta del proyecto (`registro-entrenamiento`).

### Paso 2: Ejecutar el Servidor

Escribe este comando:

```bash
npm run server
```

O si prefieres el comando completo:

```bash
node index.js
```

### Paso 3: Verificar que Funciona

Deberías ver en la terminal:

```
Servidor funcionando en http://localhost:3000
Prueba el endpoint: http://localhost:3000/health
```

¡El servidor está funcionando! 🎉

**Nota**: El servidor seguirá corriendo hasta que lo detengas. Para detenerlo, presiona `Ctrl + C` en la terminal.

## Cómo Probar el Endpoint `/health`

Hay varias formas de probar que el endpoint funciona:

### Opción 1: Desde el Navegador (Más Fácil)

1. Asegúrate de que el servidor esté corriendo (`npm run server`)
2. Abre tu navegador (Chrome, Firefox, etc.)
3. Ve a esta dirección: `http://localhost:3000/health`
4. Deberías ver: `{"status":"ok"}`

### Opción 2: Desde la Terminal (Más Técnico)

Si tienes `curl` instalado (viene en Mac y Linux, en Windows puede necesitar instalarse):

```bash
curl http://localhost:3000/health
```

Deberías ver: `{"status":"ok"}`

### Opción 3: Desde el Navegador con Herramientas de Desarrollador

1. Abre el navegador
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña "Network" (Red)
4. Visita `http://localhost:3000/health`
5. Verás la petición y la respuesta

## ¿Qué Significa "localhost"?

**localhost** es una palabra especial que significa "esta computadora". 

- `localhost` = tu propia computadora
- `localhost:3000` = tu computadora en el puerto 3000

Es como decir "mi casa" en lugar de dar la dirección completa. Solo funciona en tu computadora, no desde internet.

## Resumen de lo que Hicimos

1. ✅ Instalamos Express (`npm install express`)
2. ✅ Creamos `index.js` con un servidor básico
3. ✅ Agregamos un endpoint `/health` que responde `{ "status": "ok" }`
4. ✅ Agregamos un script en `package.json` para ejecutar el servidor fácilmente
5. ✅ Probamos que funciona desde el navegador

## Siguiente Paso

Una vez que hayas verificado que el servidor funciona correctamente y puedas ver la respuesta `{"status":"ok"}` en el navegador, estarás listo para el siguiente paso.

## Preguntas Frecuentes

**P: ¿Por qué el servidor no se detiene?**
R: Es normal. El servidor está "escuchando" peticiones todo el tiempo. Para detenerlo, presiona `Ctrl + C`.

**P: ¿Qué pasa si el puerto 3000 está ocupado?**
R: Cambia el número `3000` en `index.js` por otro número (por ejemplo, `3001` o `8080`).

**P: ¿Puedo tener el frontend y el backend corriendo al mismo tiempo?**
R: Sí, pero en terminales diferentes. Una terminal para `npm run dev` (frontend) y otra para `npm run server` (backend).

**P: ¿Qué es JSON?**
R: JSON es un formato para enviar datos. Se ve como JavaScript pero es texto. Ejemplo: `{"status":"ok"}` es JSON.





