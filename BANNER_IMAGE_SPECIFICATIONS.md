# Banner Image Specifications

## Recommended Dimensions

### Option 1: Standard Web Banner (Recommended)
- **Width:** 1920px
- **Height:** 1080px
- **Aspect Ratio:** 16:9
- **File Format:** JPG or WebP
- **File Size:** Under 500KB (optimized)

### Option 2: High-Resolution Banner (For Large Screens)
- **Width:** 2560px
- **Height:** 1440px
- **Aspect Ratio:** 16:9
- **File Format:** JPG or WebP
- **File Size:** Under 800KB (optimized)

### Option 3: Ultra-Wide Banner (For Wide Screens)
- **Width:** 1920px
- **Height:** 800px
- **Aspect Ratio:** 2.4:1
- **File Format:** JPG or WebP
- **File Size:** Under 400KB (optimized)

## Current Responsive Heights
Based on your website's responsive design:
- **Mobile:** 400px height
- **Small Tablets:** 500px height
- **Medium Screens:** 600px height
- **Large Screens:** 700px height
- **Extra Large Screens:** 800px height

## Best Practice Recommendation
**Use: 1920px × 1080px (16:9 ratio)**

### Why This Size?
1. ✅ Works perfectly on all screen sizes
2. ✅ Standard web banner size
3. ✅ Good balance between quality and file size
4. ✅ Displays well on mobile (scales down)
5. ✅ Looks great on large screens (scales up)
6. ✅ Compatible with most image editing tools

## Image Guidelines

### Important Areas (Safe Zone)
- Keep important content (text, faces, products) in the **center 70%** of the image
- Avoid placing critical elements near the edges (top/bottom 15% and sides 15%)
- This ensures content isn't cut off on different screen sizes

### Image Quality Tips
1. **Resolution:** Minimum 1920px width for best quality
2. **Format:** 
   - JPG for photos with many colors
   - WebP for better compression (if supported)
   - PNG only if transparency needed
3. **Compression:** 
   - Optimize images before upload
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Target file size: 200-500KB
4. **Color Space:** sRGB (standard for web)

### Content Placement
```
┌─────────────────────────────────┐
│  Avoid Important Content Here  │ ← Top 15% (may be behind navbar)
├─────────────────────────────────┤
│                                 │
│   SAFE ZONE - Place Important  │ ← Center 70%
│   Content Here (Text, Faces,   │
│   Products, Call-to-Action)   │
│                                 │
├─────────────────────────────────┤
│  Avoid Important Content Here  │ ← Bottom 15% (may be cut on mobile)
└─────────────────────────────────┘
```

## Upload Checklist
- [ ] Image size: 1920px × 1080px (or recommended size)
- [ ] File size: Under 500KB (optimized)
- [ ] Format: JPG or WebP
- [ ] Important content in center 70%
- [ ] Image is sharp and clear
- [ ] Colors are vibrant but not oversaturated
- [ ] Text (if any) is readable at different sizes

## Example Use Cases

### For Product Showcase Banners
- Use 1920px × 1080px
- Place products/models in center
- Keep text/CTA in center area
- Use high-quality product photos

### For Promotional Banners
- Use 1920px × 1080px
- Place sale text in center
- Keep discount info visible
- Use bold, readable fonts

## Technical Notes
- Images are automatically scaled using `object-cover`
- Images maintain aspect ratio
- Center positioning ensures important content stays visible
- Images are responsive and adapt to all screen sizes

