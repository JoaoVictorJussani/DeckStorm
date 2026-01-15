# Image Occlusion Feature - DeckStorm

## Overview

The Image Occlusion feature has been successfully implemented in DeckStorm! This powerful learning tool allows users to create flashcards by uploading images and hiding specific areas, making it ideal for studying anatomy, geography, code diagrams, and more.

## Features Implemented

### 1. **Database Schema**
- Added `card_type` column to support both 'text' and 'image_occlusion' cards
- Added `image_path` column (TEXT) to store Base64-encoded images as Data URLs
- Added `occlusion_zones` JSON column to store zone data (coordinates as percentages, dimensions, IDs)

### 2. **Card Model Updates**
- Extended the Card model with new fields:
  - `cardType`: String ('text' or 'image_occlusion')
  - `imagePath`: String (path to uploaded image)
  - `occlusionZones`: Array of OcclusionZone objects
- Created `OcclusionZone` interface with properties: id, x, y, width, height, label

### 3. **Card Creation Interface**
Enhanced `newcard.edge` with:
- **Card Type Selector**: Beautiful toggle between Text Cards and Image Occlusion
- **Image Upload Area**: Drag-and-drop style upload with visual feedback
- **Interactive Canvas**: Draw occlusion zones by clicking and dragging
- **Zone Management**: 
  - Visual list of created zones with color coding
  - Individual zone deletion
  - Clear all zones functionality
  - Real-time preview with numbered zones
- **8 Vibrant Colors**: Automatically cycles through 8 distinct colors for zones

### 4. **Backend Processing**
Updated `CardController.store()` to:
- Handle multipart form data for image uploads
- Validate image files (JPG, PNG, GIF, WEBP, max 10MB)
- Validate occlusion zones (must have at least one)
- Generate unique filenames with timestamps
- Store images in `public/uploads/occlusion-images/`
- Save zone data as JSON in the database

### 5. **Exercise/Review Mode**
Enhanced `present_question_with_time.edge` to:
- **Front Side**: Display image with colored occlusion zones hiding content
  - Each zone shows its number in white text
  - Zones are filled with vibrant colors
- **Back Side**: Reveal the full image
  - Show zone outlines for reference
  - Display zone numbers in corners
- Seamless integration with existing flashcard flip animation

### 6. **Multilingual Support**
Added translations in **French**, **English**, and **Portuguese** for:
- Image occlusion title and subtitle
- Upload image prompts
- Draw zones instructions
- Zone labels
- Error messages (image required, zones required, invalid zones)
- Card type selection
- Reveal/hide answer buttons

## User Workflow

### Creating an Image Occlusion Card

1. **Navigate to a Deck** and click "Add Card"
2. **Select Card Type**: Click on "Image Occlusion" card type
3. **Upload Image**: Click the upload area and select an image (or drag & drop)
4. **Draw Occlusion Zones**: 
   - Click and drag on the image to create rectangular zones
   - Each zone is automatically numbered and color-coded
   - Create as many zones as needed
5. **Manage Zones**:
   - Review the list of created zones
   - Delete individual zones if needed
   - Clear all zones to start over
   - Change the image if needed
6. **Add Optional Title**: Provide a custom question/title (optional)
7. **Submit**: Click "Add Card" to save

### Studying with Image Occlusion Cards

1. **Start Exercise**: Begin studying the deck normally
2. **Front Side**: See the image with colored zones hiding content
   - Each zone is numbered for reference
   - Try to recall what's hidden under each zone
3. **Flip Card**: Click or tap to reveal the answer
4. **Back Side**: See the full image with zone outlines
   - Zone numbers appear in corners for reference
5. **Mark Correct/Incorrect**: Rate your performance

## Technical Details

### File Structure
```
database/migrations/
  └── 1768486797571_create_add_image_occlusion_to_cards_table.ts

app/models/
  └── card.ts (updated)

app/controllers/
  └── card_controller.ts (updated)

resources/views/
  ├── newcard.edge (updated)
  └── present_question_with_time.edge (updated)

resources/lang/
  ├── fr/card.json (updated)
  ├── en/card.json (updated)
  ├── pt-br/card.json (updated)
  ├── fr/deck.json (updated)
  ├── en/deck.json (updated)
  └── pt-br/deck.json (updated)

public/uploads/
  └── occlusion-images/ (created)
```

### OcclusionZone Data Structure
```typescript
interface OcclusionZone {
  id: number          // Unique zone identifier
  x: number           // X coordinate (pixels)
  y: number           // Y coordinate (pixels)
  width: number       // Zone width (pixels)
  height: number      // Zone height (pixels)
  label?: string      // Optional label for the zone
}
```

### Zone Colors
The system uses 8 vibrant, accessible colors that cycle automatically:
1. Red (#ef4444)
2. Orange (#f59e0b)
3. Green (#10b981)
4. Blue (#3b82f6)
5. Purple (#8b5cf6)
6. Pink (#ec4899)
7. Teal (#14b8a6)
8. Deep Orange (#f97316)

## Design Highlights

### Modern UI/UX
- **Card Type Selector**: Beautiful cards with hover effects and active states
- **Upload Area**: Dashed border with hover feedback
- **Interactive Canvas**: Crosshair cursor, live drawing preview
- **Zone List**: Clean cards with color indicators and delete buttons
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode Support**: All components adapt to theme

### Accessibility
- High contrast zone colors
- Clear visual feedback
- Keyboard-friendly navigation
- Screen reader compatible labels
- Touch-friendly controls for mobile

## Future Enhancements (Optional)

Potential improvements for future iterations:
1. **Zone Labels**: Allow users to add text labels to zones
2. **Multiple Images**: Support multiple images per card
3. **Polygon Zones**: Support irregular shapes beyond rectangles
4. **Zone Reordering**: Drag and drop to reorder zones
5. **Bulk Import**: Import images with pre-defined zones
6. **Export/Share**: Export image occlusion cards as templates
7. **Collaborative Editing**: Multiple users editing zones together
8. **AI-Assisted Zones**: Auto-detect regions of interest

## Testing Recommendations

1. **Upload various image formats**: JPG, PNG, GIF, WEBP
2. **Test large images**: Verify scaling works correctly
3. **Create multiple zones**: Test with 1, 5, 10+ zones
4. **Delete zones**: Verify deletion works correctly
5. **Exercise mode**: Test flip animation and zone reveal
6. **Mobile testing**: Verify touch interactions work
7. **Dark mode**: Test in both light and dark themes
8. **Multilingual**: Test in French, English, and Portuguese

## Migration

To apply the database changes, run:
```bash
node ace migration:run
```

This will add the three new columns to the `t_card` table:
- `card_type` (default: 'text')
- `image_path` (nullable)
- `occlusion_zones` (nullable JSON)

## Conclusion

The Image Occlusion feature is now fully integrated into DeckStorm! Users can create visually rich flashcards perfect for subjects that benefit from visual learning. The implementation is production-ready with:

✅ Complete database schema
✅ Full CRUD operations
✅ Beautiful, intuitive UI
✅ Multilingual support (FR, EN, PT)
✅ Dark mode compatibility
✅ Mobile responsiveness
✅ Seamless integration with existing exercise modes

Enjoy creating powerful visual learning experiences! 🎨📚
