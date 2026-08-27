# Fase 4.1 — Rediseño de la interfaz (estilo Kódigo Fuente)

Rediseño del frontend aplicando la skill **interface-design**, con la identidad visual de
[kodigofuente.com](https://kodigofuente.com/).

## Paleta (extraída del CSS real del sitio — tema SB Admin Pro)
| Rol | Hex |
|-----|-----|
| Primary (azul) | `#0061f2` · hover `#004ec2` |
| Secondary (púrpura) | `#6900c7` |
| Success | `#00ac69` · Warning `#f4a100` · Danger `#e81500` · Info `#00cfd5` |
| Navy (texto) | `#212832` · Lienzo `#f2f6fc` · Muted `#69707a` |

**Signature**: header con **gradiente azul→púrpura** (`bg-gradient-primary-to-secondary`,
rasgo característico del tema de Kódigo). **Tipografía**: Manrope (Google Fonts) con fallback
de sistema.

## Cambios

### Sistema de diseño — `src/index.css` (reescritura)
- Tokens `:root`: color de marca/semánticos, superficies, bordes `rgba`, focus-ring
  `rgba(0,97,242,.25)` (el mismo del sitio), radios (6/10/14px), sombras suaves en 2 niveles.
- Tema claro, acento azul como recurso escaso (~60/30/10). Profundidad por sombras, no bordes.
- `tabular-nums` en cifras, tracking negativo en títulos, `prefers-reduced-motion` respetado.

### Componentes
- **`App.tsx`**: topbar con gradiente de marca (logo + título + subtítulo), estado de **carga**,
  la lista dentro de una card con contador.
- **`components/icons.tsx`** (nuevo): set de iconos SVG inline (sin dependencias).
- **`SummaryCards.tsx`**: stat cards con icono + número focal (`tabular-nums`) + etiqueta y
  acento de color por estado (Programada=ámbar, Activa=verde, Finalizada=gris, Vigentes=azul).
- **`PromotionList.tsx`**: tabla con hover de fila, badges de estado con color semántico y
  botones de acción con icono y estados hover/active.
- **`PromotionForm.tsx`**: card con encabezado, inputs con focus-ring de marca, botón primario
  con icono.
- **`index.html`**: `<link>` a Manrope.

### Ajustes de layout tras verificación visual
- `min-width: 0` en los hijos del grid para que la tabla haga scroll en vez de desbordar.
- Contenedor `max-width: 1320px` y columna de formulario `320px` para que la tabla (6 columnas)
  entre completa —incluida la columna **Acciones**— sin scroll en desktop.

## Verificación (capturas con Chrome headless)
| Vista | Resultado |
|-------|-----------|
| Desktop 1440 | ✅ tabla completa, acciones visibles, stat cards con acento por estado |
| Móvil 390 | ✅ tarjetas apiladas, formulario full-width, tabla con scroll horizontal |
| `npm run build` + `npm run lint` | ✅ en verde |

> Sin romper funcionalidad: validaciones, máquina de estados y acciones intactas.

## Estado
✅ Completado. Siguiente: **Fase 7 — Documentación y entrega** (`README.md`, `DECISIONS.md`).
