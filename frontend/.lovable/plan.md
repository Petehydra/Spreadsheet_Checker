
# Spreadsheet Checker UI Rebuild Plan

## Summary
This plan outlines the restructuring of the front-end to match the detailed UI Architecture specification. The changes focus on updating the visual design, adding new interactive components (drag-and-drop upload zone, uploaded files list), and aligning colors, spacing, and typography with the specification.

---

## What Will Change

### Visual Updates
- **Page background**: Change from pure white to warm white (#FAFAF9)
- **Header**: reduce logo size to ~150px
- **Hero section**: Add proper padding (128px top on large screens), update description text, add drag-and-drop zone alongside the upload button
- **Illustration card**: Update to dark green container (#1B5E20) with padded, rounded image inside
- **Upload button**: Fully rounded pill shape with enhanced hover effects (scale 1.05, shadow)

### New Components
- **DragDropZone**: A pill-shaped drop area for file uploads
- **UploadedFilesList**: Section showing uploaded files with file cards
- **FileCard**: Individual file display with icon, name, metadata, and remove button

### Interactive Features
- File upload via button click (opens file picker)
- Drag-and-drop file upload with visual feedback
- File removal from the uploaded list

---

## Component Structure

```text
Home
├── Header
│   └── Logo (150px width, border-b separation)
├── HeroSection
│   ├── Left Column
│   │   ├── Headline ("Spreadsheet Checker")
│   │   ├── Description (updated text)
│   │   └── UploadControls (flex row)
│   │       ├── UploadButton (yellow pill, opens picker)
│   │       └── DragDropZone (light yellow pill)
│   └── Right Column
│       └── IllustrationCard (dark green container with image)
└── UploadedFilesList (appears after upload)
    └── FileCard (repeating)
        ├── FileIcon
        ├── FileInfo (name + metadata)
        └── RemoveButton
```

---

## Implementation Steps

### Step 1: Update Global Styles
Update `src/styles/globals.css`:
- Change background color to warm white (#FAFAF9 → HSL: 40, 9%, 98%)
- Update font family to Arial/Helvetica stack
- Remove gradient-blob utility (no longer needed per spec)

### Step 2: Update Tailwind Configuration
Update `tailwind.config.ts`:
- Set max-width container to 1280px (80rem)
- Update horizontal padding to 32px
- Add dark green color (#1B5E20) for illustration card
- Add drag-drop background color (rgba yellow)

### Step 3: Rebuild Header Component
Update `src/components/Header/Header.tsx`:
- Set logo to ~150px width
- Use max-w-7xl container with px-8 py-6 spacing

### Step 4: Rebuild HeroSection Component
Update `src/components/HeroSection/HeroSection.tsx`:
- Remove gradient blobs
- Update padding (128px top on large screens, 48px bottom)
- Update description text to match spec
- Add flex container for UploadButton + DragDropZone side by side

### Step 5: Update Upload Button
Update `src/components/ui/button.tsx`:
- Modify hero variant to use fully rounded pill shape (`rounded-full`)
- Add scale transform on hover (scale-105)
- Add shadow-lg on hover with 200ms transition

### Step 6: Create DragDropZone Component
Create `src/components/DragDropZone/DragDropZone.tsx`:
- Light yellow background (rgba(255, 204, 0, 0.2))
- Pill shape matching button height
- Flex-grow to fill remaining space
- Text: "Drag and drop here"
- Visual feedback on drag-over (darker background)

### Step 7: Create IllustrationCard Component
Create `src/components/IllustrationCard/IllustrationCard.tsx`:
- Dark green background container (#1B5E20)
- Large rounded corners (24px)
- Internal padding (32-48px)
- Image with rounded corners and shadow
- Minimum height 350-450px

### Step 8: Create UploadedFilesList Component
Create `src/components/UploadedFilesList/UploadedFilesList.tsx`:
- Section heading: "Uploaded Files (X)"
- Maps over uploaded files to render FileCard components
- Only visible when files are uploaded

### Step 9: Create FileCard Component
Create `src/components/FileCard/FileCard.tsx`:
- White background with light gray border
- Rounded corners (12px)
- File icon (green), file name, metadata (rows × columns)
- Remove button with trash icon (red on hover)

### Step 10: Add Upload State Management
Create `src/hooks/useFileUpload.ts`:
- State for uploaded files array
- Add file function (from button or drag-drop)
- Remove file function
- File validation (accepts .xlsx, .xls, .csv)

### Step 11: Wire Up Components
Update `src/pages/Home/Home.tsx`:
- Import useFileUpload hook
- Pass upload handlers to HeroSection
- Conditionally render UploadedFilesList when files exist

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/styles/globals.css` | Update (colors, fonts, remove blobs) |
| `tailwind.config.ts` | Update (container, colors) |
| `src/components/Header/Header.tsx` | Rebuild (sizing) |
| `src/components/HeroSection/HeroSection.tsx` | Rebuild (layout, content) |
| `src/components/ui/button.tsx` | Update (hero variant styling) |
| `src/components/DragDropZone/DragDropZone.tsx` | Create new |
| `src/components/DragDropZone/index.ts` | Create new |
| `src/components/IllustrationCard/IllustrationCard.tsx` | Create new |
| `src/components/IllustrationCard/index.ts` | Create new |
| `src/components/UploadedFilesList/UploadedFilesList.tsx` | Create new |
| `src/components/UploadedFilesList/index.ts` | Create new |
| `src/components/FileCard/FileCard.tsx` | Create new |
| `src/components/FileCard/index.ts` | Create new |
| `src/hooks/useFileUpload.ts` | Create new |
| `src/pages/Home/Home.tsx` | Update (integrate state) |
| `shared/types/index.ts` | Update (add UploadedFile type) |

---

## Technical Details

### Color System (HSL values for CSS variables)
| Usage | Hex | HSL |
|-------|-----|-----|
| Page background | #FAFAF9 | 40 9% 98% |
| Button/CTA | #FFCC00 | 48 100% 50% |
| Illustration card | #1B5E20 | 123 54% 24% |
| Primary text | #171717 | 0 0% 9% |
| Secondary text | #6B7280 | 220 9% 46% |
| Drag-drop bg | rgba(255, 204, 0, 0.2) | - |

### Typography
- Headlines: 36-48px, bold, near-black
- Description: 16-18px, regular, gray
- Button text: 14px, semi-bold, black

### Spacing
- Container max-width: 1280px (80rem)
- Horizontal padding: 32px (2rem)
- Hero top padding: 128px (8rem) on large screens
- Section gaps: 32px (2rem)

### File Upload Types
- Accepted: `.xlsx`, `.xls`, `.csv`
- Multiple files: Yes
