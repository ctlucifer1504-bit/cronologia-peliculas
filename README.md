[README.md](https://github.com/user-attachments/files/34051369/README.md)
# Cronología de Películas

Sitio de una sola página para explorar cronologías cinematográficas: permite recorrer el orden de las historias, consultar los datos de cada película, buscar, filtrar, cambiar entre orden cronológico y de estreno, y guardar el progreso de visualización en el navegador.

La estética está inspirada en **Spatial UI**: fondos oscuros con profundidad, paneles flotantes, transparencias moderadas, halos de luz y acentos violeta/azul. Todo está construido con HTML, CSS y JavaScript nativos, sin frameworks.

---

## Cómo ejecutar el proyecto

### Opción 1: abrir el archivo directamente

Abre `index.html` en el navegador. El sitio funciona sin servidor porque los scripts son clásicos y las rutas son relativas.

### Opción 2: servidor local (recomendado)

Un servidor local evita restricciones del navegador y reproduce mejor el comportamiento de GitHub Pages.

```bash
# Con Python instalado
python -m http.server 8080
```

Después visita `http://localhost:8080`.

También puedes usar la extensión **Live Server** de VS Code o cualquier servidor estático.

---

## Estructura del proyecto

```
cronologia-peliculas/
│
├── index.html                 # Página principal (single page)
├── privacidad.html            # Política de privacidad
├── README.md
│
├── assets/
│   ├── icons/
│   │   └── logo.svg           # Logo y favicon
│   └── images/
│       └── movies/            # Pósteres de las películas
│
├── css/
│   ├── style.css              # Variables, layout, componentes y utilidades
│   ├── responsive.css         # Media queries mobile-first
│   └── animations.css         # Animaciones y prefers-reduced-motion
│
└── js/
    ├── movies.js              # Datos de la cronología
    ├── main.js                # Render, búsqueda, filtros, progreso y ficha
    ├── navigation.js          # Menú móvil, scroll suave y enlace activo
    └── contact.js             # Validación y envío del formulario
```

### Archivos principales

- **`index.html`**: estructura semántica con `header`, `nav`, `main`, `section`, `article`, `aside`, `dialog` y `footer`.
- **`css/style.css`**: sistema de diseño con variables CSS para color, tipografía, radios, sombras y transiciones. Incluye componentes como botones, tarjetas, línea de tiempo, formulario y pie de página.
- **`css/responsive.css`**: adaptación mobile-first. La línea de tiempo alterna a ambos lados de un eje central a partir de 960 px.
- **`css/animations.css`**: aparición al hacer scroll, flotación de pósteres, pulsos y transiciones. Se desactivan con `prefers-reduced-motion: reduce`.
- **`js/movies.js`**: datos separados de la lógica. El orden del array es el orden de la historia.
- **`js/main.js`**: construye las tarjetas, gestiona búsqueda, filtros, orden, progreso con `localStorage` y la ficha ampliada.
- **`js/navigation.js`**: menú hamburguesa accesible, scroll suave con compensación del header, enlace activo y botón de volver arriba.
- **`js/contact.js`**: validación de campos, contador de caracteres, estados de error y envío mediante endpoint o `mailto`.

---

## Cómo añadir o editar una película

1. Copia el póster en `assets/images/movies/`. Se recomienda una proporción **2:3** (por ejemplo, 500 × 750 px) y formato JPG/WebP.
2. Abre `js/movies.js` y añade un objeto en la posición que ocupa dentro de la historia:

```js
{
    title: "Título de la película",
    date: "2026-01-01",      // Fecha de estreno (AAAA-MM-DD)
    minutes: 120,            // Duración en minutos
    image: "Nombre_del_archivo.jpeg"
}
```

3. Si el archivo de imagen no existe o falla, la interfaz muestra automáticamente un póster de respaldo con el título. No se rompe la maquetación.

> El campo `date` es la fecha de estreno, pero el orden de la línea de tiempo es el orden del array. El botón **Estreno** permite ver la colección ordenada por fecha.

---

## Funcionalidades

- Búsqueda instantánea por título o número, sin distinguir mayúsculas ni tildes.
- Filtros: **Todas**, **Por ver** y **Vistas**.
- Ordenación por **Historia** (orden del array) o **Estreno** (fecha).
- Progreso de visualización guardado en `localStorage` (`cronologia.watched.v1`).
- Ficha ampliada con póster, posición en la historia, estreno, duración y universo.
- Navegación entre películas dentro de la ficha con botones o flechas del teclado.
- Menú móvil accesible, cierre con `Escape`, clic fuera o selección de un enlace.
- Enlaces de navegación suaves y enlace activo según la sección visible.
- Formulario con validación accesible, mensajes de error y notificaciones tipo *toast*.
- Página de política de privacidad.
- Respeto por `prefers-reduced-motion` y foco visible para navegación por teclado.

---

## Formulario de contacto: hacer que los envíos funcionen de verdad

El formulario está preparado para dos modos:

### 1. Modo respaldo: `mailto`

Si no se configura un endpoint, al enviar el formulario se abre el cliente de correo del visitante con el mensaje preparado. **Esto no almacena el mensaje en un servidor**; es un mecanismo de respaldo útil para un sitio estático.

El correo de destino está definido en `js/contact.js`:

```js
const CONTACT_EMAIL = 'contacto@cronologia-peliculas.com';
```

Cámbialo por el correo real del proyecto.

### 2. Modo real: servicio o backend

Para recibir y almacenar los mensajes automáticamente, conecta el formulario a un servicio como [Formspree](https://formspree.io/), [Getform](https://getform.io/), [Basin](https://usebasin.com/) o a tu propio backend.

Define el endpoint antes de cargar `js/contact.js`:

```html
<script>
    window.CRONOLOGIA_CONTACT_ENDPOINT = 'https://formspree.io/f/TU_ID';
</script>
<script src="js/contact.js"></script>
```

O edita la constante directamente en `js/contact.js`:

```js
const CONTACT_ENDPOINT = 'https://formspree.io/f/TU_ID';
```

El formulario envía un `POST` con JSON:

```json
{
    "name": "Nombre",
    "email": "correo@ejemplo.com",
    "message": "Contenido de la sugerencia",
    "privacy": true
}
```

Si el servicio responde con un estado distinto de `2xx`, se muestra un error y se invita a escribir directamente al correo.

> Recuerda revisar la política de privacidad y adaptarla a la normativa aplicable en tu país, especialmente si conectas el formulario a un proveedor externo.

---

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido del proyecto (no es necesario subir `node_modules`; no hay dependencias).
2. Entra en **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/ (root)`.
5. Guarda. GitHub publicará el sitio en una URL similar a:

```
https://tu-usuario.github.io/cronologia-peliculas/
```

Todas las rutas son relativas, por lo que funcionarán tanto en la raíz como en un subdirectorio.

---

## Accesibilidad y rendimiento

- HTML5 semántico con jerarquía de encabezados y regiones identificables.
- Enlace “Saltar al contenido” y foco visible en todos los controles.
- Menú móvil con `aria-expanded`, `aria-controls` y cierre con teclado.
- Formulario con `label` asociado, `aria-describedby`, `aria-invalid` y mensajes `role="alert"`.
- Diálogo nativo `<dialog>` con cierre por `Escape`, botón de cierre y foco gestionado por el navegador.
- Imágenes con `loading="lazy"`, `decoding="async"` y dimensiones declaradas.
- Sin librerías externas; solo se carga la fuente Inter desde Google Fonts con `display=swap`.
- Animaciones desactivadas cuando el usuario prefiere movimiento reducido.

---

## Notas sobre el contenido

- La cronología conserva los títulos, fechas y duraciones del archivo de datos original.
- Se eliminó una entrada duplicada de **Avengers: Doomsday** que existía en los datos iniciales.
- El póster de **Thunderbolts\*** no estaba incluido en `assets/images/movies/`. La interfaz usa el póster de respaldo; si añades el archivo con el nombre `Thunderbolts.jpeg`, aparecerá automáticamente. Se usa ese nombre porque `*` no es un carácter válido en nombres de archivo de Windows.
- La sección **Próximamente** es solo un anuncio de futuras actualizaciones: no incorpora sagas, franquicias ni películas nuevas.

---

## Créditos

Proyecto desarrollado con HTML, CSS y JavaScript nativos. Diseño inspirado en Spatial UI y en la experiencia de explorar una sala de cine a oscuras.
