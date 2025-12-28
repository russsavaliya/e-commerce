# Premium Typography System - SIYARA Luxury Fashion Brand

## Overview
This typography system is designed for a luxury fashion/saree e-commerce website with brand color `rgb(72,29,111)` (#481d6f).

## Font Families

### 1. **Playfair Display** (Serif)
- **Usage**: Navbar menu items, headings, luxury elements
- **Weights**: 400, 500, 600, 700
- **Style**: Elegant, sophisticated serif font
- **Best for**: Navigation, section headings, brand elements

### 2. **Inter** (Sans-serif)
- **Usage**: Body text, product cards, prices, general content
- **Weights**: 300, 400, 500, 600, 700
- **Style**: Modern, clean, highly readable
- **Best for**: Product titles, descriptions, prices, body text

### 3. **Cormorant Garamond** (Serif - Alternative)
- **Usage**: Special elegant elements, quotes, decorative text
- **Weights**: 300, 400, 500, 600, 700
- **Style**: Classic, refined serif
- **Best for**: Hero sections, special announcements, elegant quotes

## Typography Specifications

### Navbar Menu Items
```css
font-family: "Playfair Display", serif;
font-weight: 500;
font-size: 14px;
letter-spacing: 0.08em;
text-transform: uppercase;
color: rgb(72, 29, 111);
```

**Example Usage:**
```jsx
<Link
  className="text-[rgb(72,29,111)]"
  style={{
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
    fontSize: '14px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }}
>
  HOME
</Link>
```

### Product Card Titles
```css
font-family: "Inter", sans-serif;
font-weight: 600;
font-size: 14px;
letter-spacing: -0.01em;
line-height: 1.4;
color: #111827;
```

**Example Usage:**
```jsx
<h3
  style={{
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '14px',
    letterSpacing: '-0.01em',
    lineHeight: '1.4',
  }}
>
  Product Name
</h3>
```

### Product Prices
```css
font-family: "Inter", sans-serif;
font-weight: 700;
font-size: 16px;
letter-spacing: -0.02em;
line-height: 1.2;
color: #111827;
```

**Example Usage:**
```jsx
<span
  style={{
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
  }}
>
  ₹ 2,999
</span>
```

### Section Headings
```css
font-family: "Playfair Display", serif;
font-weight: 600;
font-size: 32px;
letter-spacing: 0.02em;
color: rgb(72, 29, 111);
```

### Body Text
```css
font-family: "Inter", sans-serif;
font-weight: 400;
font-size: 16px;
line-height: 1.6;
color: #1f2937;
```

## Color Scheme

### Primary Brand Color
- **Purple**: `rgb(72, 29, 111)` / `#481d6f`
- **Usage**: Headings, navbar, brand elements, accents

### Text Colors
- **Primary Text**: `#111827` (dark gray)
- **Secondary Text**: `#6b7280` (medium gray)
- **Muted Text**: `#9ca3af` (light gray)
- **Strikethrough**: `#d1d5db` (for original prices)

### Complementary Colors
- **Pink Accent**: `#F472B6` (for discount badges)
- **Background**: `#faf9f5` (warm off-white)

## Responsive Typography

### Mobile (< 640px)
- Navbar: `14px`
- Product Title: `14px`
- Product Price: `16px`
- Body Text: `14px`

### Tablet (640px - 1024px)
- Navbar: `14px`
- Product Title: `15px`
- Product Price: `18px`
- Body Text: `16px`

### Desktop (> 1024px)
- Navbar: `14px`
- Product Title: `16px`
- Product Price: `20px`
- Body Text: `16px`

## Tailwind CSS Classes

### Custom Font Classes
```jsx
// Luxury heading
<h1 className="font-heading">Title</h1>

// Elegant serif
<p className="font-elegant">Elegant text</p>

// Body text (default)
<p className="font-body">Body text</p>
```

### Using Inline Styles (Recommended)
For precise control, use inline styles as shown in the examples above.

## Typography Best Practices

1. **Letter Spacing**
   - Uppercase text: `0.08em` (navbar)
   - Headings: `0.02em`
   - Body text: `0em` (default)
   - Product titles: `-0.01em` (tighter for modern look)
   - Prices: `-0.02em` (tighter for emphasis)

2. **Font Weights**
   - Light: 300 (rarely used)
   - Regular: 400 (body text)
   - Medium: 500 (navbar)
   - Semibold: 600 (product titles, headings)
   - Bold: 700 (prices, emphasis)

3. **Line Height**
   - Headings: 1.2 - 1.4
   - Body text: 1.6
   - Product titles: 1.4

4. **Text Transform**
   - Navbar: `uppercase`
   - Headings: `none` (or capitalize for special cases)
   - Body: `none`

## Implementation Examples

### Navbar Menu Item
```jsx
<Link
  to="/sale"
  className="text-[rgb(72,29,111)] hover:opacity-80 transition-colors"
  style={{
    fontFamily: '"Playfair Display", serif',
    fontWeight: 500,
    fontSize: '14px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }}
>
  SALE
</Link>
```

### Product Card
```jsx
<div>
  {/* Product Title */}
  <h3
    style={{
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '14px',
      letterSpacing: '-0.01em',
      lineHeight: '1.4',
    }}
  >
    Premium Silk Saree
  </h3>
  
  {/* Price */}
  <span
    style={{
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: '16px',
      letterSpacing: '-0.02em',
    }}
  >
    ₹ 5,999
  </span>
</div>
```

### Section Heading
```jsx
<h2
  className="text-[rgb(72,29,111)]"
  style={{
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: '32px',
    letterSpacing: '0.02em',
  }}
>
  New Arrivals
</h2>
```

## Font Loading

Fonts are loaded via Google Fonts in `index.html`:
- Playfair Display (with italic)
- Inter (all weights)
- Cormorant Garamond (with italic)

All fonts use `display=swap` for optimal loading performance.

## Browser Support

All fonts are web-safe and supported in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Fonts are preconnected for faster loading
- `display=swap` ensures text remains visible during font load
- Only necessary weights are loaded
- Fonts are cached by browser

---

**Last Updated**: Typography system implemented for luxury fashion brand SIYARA

