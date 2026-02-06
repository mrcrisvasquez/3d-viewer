

# About Button + Carousel Slider for About Page

## Overview
Add an "About" button to the main viewer page and restructure the About page content into a carousel/slider that allows users to navigate through different sections.

---

## Changes Summary

### 1. Add About Button to Main Viewer

**File to modify:** `src/pages/Index.tsx`

Add a new "About" button positioned near the other floating buttons (feedback and toggle panels). The button will:
- Use the `Info` icon from lucide-react
- Be positioned in the bottom-right area (above or next to the toggle panels button)
- Link to `/about` using react-router's `Link` component
- Match the glassmorphism style of other floating buttons

**Implementation:**
```tsx
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

// In the JSX, add near TogglePanelsButton:
<Link to="/about">
  <Button
    size="icon"
    variant="ghost"
    className="fixed bottom-20 right-4 z-30 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent/80 transition-all"
    title="About"
  >
    <Info className="h-5 w-5" />
  </Button>
</Link>
```

---

### 2. Convert About Page to Carousel Layout

**File to modify:** `src/pages/About.tsx`

Transform the current vertical scroll layout into a horizontal carousel with 4 slides:

| Slide | Content |
|-------|---------|
| 1. Hero | Title "How It Works" + description + navigation dots |
| 2. Architecture | Interactive SVG diagram with component explanations |
| 3. Features | 6 feature cards in a grid layout |
| 4. Technology Stack | Technology badges + footer with CTA |

**Components used:**
- `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` from existing `@/components/ui/carousel`
- Add slide indicators (dots) to show current position

**Layout structure:**
```tsx
<Carousel className="w-full h-[calc(100vh-80px)]">
  <CarouselContent>
    <CarouselItem>
      {/* Slide 1: Hero */}
    </CarouselItem>
    <CarouselItem>
      {/* Slide 2: Architecture Diagram */}
    </CarouselItem>
    <CarouselItem>
      {/* Slide 3: Features Grid */}
    </CarouselItem>
    <CarouselItem>
      {/* Slide 4: Tech Stack + CTA */}
    </CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

**Additional features:**
- Dot indicators at the bottom showing current slide
- Each slide fills the viewport height (minus header)
- Content centered vertically within each slide
- Smooth transitions between slides
- Keyboard navigation (left/right arrows) - already built into Carousel

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add Link import, add About button component |
| `src/pages/About.tsx` | Restructure content into Carousel slides with indicators |

### New Imports for Index.tsx
```tsx
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
```

### Carousel Slide Indicators Component
Add a custom dot indicator component within About.tsx:
```tsx
const SlideIndicators = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          i === current ? "bg-primary" : "bg-muted-foreground/30"
        )}
      />
    ))}
  </div>
);
```

### Responsive Considerations
- On mobile: slides scroll horizontally with touch gestures
- Navigation arrows positioned outside content area
- Each slide has proper padding and scrollable content if needed

---

## Visual Layout

```text
+----------------------------------------------------------+
| Header: [Back to Viewer]  |  3D Model Viewer             |
+----------------------------------------------------------+
|                                                          |
|    [<]                                            [>]    |
|                                                          |
|           +--------------------------------+              |
|           |                                |              |
|           |     Slide Content Area         |              |
|           |     (Architecture/Features/    |              |
|           |      Tech Stack)               |              |
|           |                                |              |
|           +--------------------------------+              |
|                                                          |
|                     o  o  o  o  (indicators)             |
|                                                          |
+----------------------------------------------------------+
```

---

## User Experience

1. User clicks the Info button on the main viewer
2. Navigates to `/about` with carousel view
3. First slide shows hero content with "How It Works" title
4. User can navigate using:
   - Left/Right arrow buttons
   - Keyboard arrows
   - Touch swipe on mobile
5. Dot indicators show current position
6. "Back to Viewer" button always visible in header

