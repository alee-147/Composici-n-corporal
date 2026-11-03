# antropometria

App web instalable (PWA) para evaluación antropométrica según protocolo ISAK.

- Perfil restringido y completo, con control de 3ª toma (>5 % pliegues, >1 % resto)
- Somatotipo Heath-Carter y somatocarta
- % grasa: Durnin & Womersley, Withers (hombres deportistas), Slaughter (8–18 años)
- Masa muscular esquelética (Lee 2000) y fraccionamiento en 5 componentes (Kerr 1988)
- Comparación con bioimpedancia y Bland-Altman acumulado
- Informe PDF profesional por evaluación (con tus datos, logo, somatocarta y evolución)
- Guía ilustrada de puntos anatómicos, pliegues, perímetros y diámetros
- Funciona sin conexión una vez abierta por primera vez

## Publicar en GitHub Pages

1. Crea un repositorio en github.com (por ejemplo `antropometria`), público.
2. "Add file" → "Upload files" y sube **todos** estos archivos (sueltos, no el .zip):
   `index.html`, `informe.js`, `jspdf.umd.min.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `icon.svg`, `README.md`.
3. Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `(root)` → Save.
4. En 1–2 minutos estará en `https://TU-USUARIO.github.io/antropometria/`.

## Instalar en el celular

- **iPhone:** abre la dirección en Safari → Compartir → "Agregar a inicio".
- **Android:** abre en Chrome → menú ⋮ → "Instalar app" (o "Agregar a pantalla principal").

## Datos y privacidad

Las evaluaciones se guardan **solo en el navegador del dispositivo**; nunca se suben a GitHub. El repositorio contiene únicamente el código. Descarga respaldos (pestaña Historial) periódicamente: si se borran los datos del navegador o cambias de teléfono, se pierden si no tienes respaldo.

## Actualizar la app

Reemplaza `index.html` en el repositorio y, en `sw.js`, sube el número de versión (`antropometria-v2` → `antropometria-v3`, etc.) (y así sucesivamente) para que los celulares descarguen la nueva versión.

## Advertencia

Verifica los coeficientes con tu manual ISAK antes de uso clínico o en publicaciones.
