# Design Tokens

Colors, typography, spacing, and theming for WorkNest. Define in `tailwind.config.ts`.

---

## Colors

```
primary:     #6366f1  (indigo — brand)
secondary:   #8B5CF6  (purple — secondary actions)
background:  #09090B  (near-black — app background)
surface:     #18181B  (dark gray — cards/panels)
surface-alt: #27272A  (medium gray — elevated surfaces)
border:      #3F3F46  (gray — borders/dividers)
text:        #FAFAFA  (near-white — primary text)
text-muted:  #A1A1AA  (gray — secondary text)
text-dim:    #71717A  (dark gray — disabled/placeholder)
success:     #22C55E  (green)
warning:     #F59E0B  (amber)
error:       #EF4444  (red)
info:        #3B82F6  (blue)
```

## Priority Colors

```
urgent:  #EF4444 (red)
high:    #F97316 (orange)
medium:  #F59E0B (amber)
low:     #3B82F6 (blue)
none:    #71717A (gray)
```

## Status Colors

```
backlog:     #71717A (gray)
todo:        #3B82F6 (blue)
in_progress: #F59E0B (amber)
in_review:   #8B5CF6 (purple)
done:        #22C55E (green)
cancelled:   #EF4444 (red)
```

## Typography

```
Font family: Inter (sans-serif), JetBrains Mono (monospace)
Sizes: xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30)
Weights: normal(400), medium(500), semibold(600), bold(700)
```

## Spacing

Tailwind default scale: 0.5(2px), 1(4px), 2(8px), 3(12px), 4(16px), 6(24px), 8(32px).

## Border Radius

```
sm:  6px  (badges)
md:  8px  (buttons, inputs)
lg:  12px (cards, modals)
xl:  16px (large containers)
```

## Theme

- **Dark theme FIRST** — this is the default
- ALL colors via CSS variables in Tailwind config
- Light theme is a future enhancement — do not implement unless asked
