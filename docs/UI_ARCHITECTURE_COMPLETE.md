# Spreadsheet Checker – UI Architecture & Design Specification

## Overview

This document provides the complete structure, layout, and visual specifications for the Spreadsheet Checker UI. This is a **single-page web application** designed as a clean, modern productivity tool for comparing spreadsheets.

The interface consists of:
- A **header section** with company branding
- A **hero section** with headline, description, and file upload
- A **visual illustration panel** with spreadsheet imagery
- **Additional sections** for uploaded files

The design follows a **clean enterprise aesthetic**, optimized for internal productivity tools with emphasis on clarity and usability.

---

## High-Level Layout Structure

The page is divided into **main vertical sections**:

1. **Header / Branding Area**
2. **Hero Content Area (two-column layout)**
3. **Uploaded Files List** (appears after upload)

Visual Structure:
```
┌─────────────────────────────────────────────────┐
│  Logo                                           │
├─────────────────────────────────────────────────┤
│  Left: Text + Upload   |  Right: Illustration   │
├─────────────────────────────────────────────────┤
│  Uploaded Files List                            │
└─────────────────────────────────────────────────┘
```

---

## Page Background & Overall Styling

**Background:**
- The page has a **warm white background** (#FAFAF9) that fills the entire screen
- This creates a calm, professional atmosphere

**General Styling:**
- Rounded corners throughout the interface
- Consistent shadows on interactive elements
- Hover effects that provide clear feedback (slight scale-up, shadow enhancement)
- Modern, clean aesthetic with generous whitespace

---

## Page Width and Dimensions

### Maximum Content Width
The entire application uses a consistent maximum width container of approximately **1280 pixels** (80rem). This is applied throughout all major sections:
- Header
- Hero section
- Uploaded files list

### Horizontal Spacing
- **32 pixels of padding** on both left and right sides
- This ensures content never touches the browser edges on any screen size
- All content is horizontally centered on the page

### Responsive Behavior

**On large screens (wider than 1280 pixels):**
- Content stays at 1280 pixels wide
- Equal margins appear on both sides
- Content remains centered

**On medium to small screens (less than 1280 pixels):**
- Content fills the available width
- Maintains 32-pixel padding on each side
- Content scales down proportionally

**Hero Section Column Layout:**
- Two-column grid on large screens (50% each column)
- Switches to single column stack on smaller screens
- Comfortable spacing (gap) between columns on large displays

### Vertical Spacing
- **Header:** Moderate padding top and bottom (24px / 1.5rem)
- **Hero section:** Large padding at top (128px / 8rem on large screens), moderate at bottom (48px / 3rem)
- **Content sections:** Moderate padding (48px / 3rem top and bottom)
- **Section gaps:** 32px / 2rem between major sections

---

## 1. Header Section

### Purpose
Establish product ownership and branding

### Structure
The header sits at the very top and contains one element positioned on the left side.

### Elements

**HydraSpecma Logo:**
- Positioned top-left
- Image file: `docs/assets/HydraSpecma_RespectArea_RGB.png`
- Compact size (approximately 150px width)
- High contrast against light background

### Visual Styling
- **Bottom border:** Thin gray line (#E5E7EB) running along the bottom edge for subtle separation
- **Padding:** Moderate spacing (24px vertical, 32px horizontal)
- **Background:** White or transparent

### Implementation
```jsx
<header className="border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-8 py-6">
    <img src="docs/assets/HydraSpecma_RespectArea_RGB.png" alt="HydraSpecma Logo" />
  </div>
</header>
```

---

## 2. Hero Section

This is the **primary interaction area** and main visual focus of the page.

### Layout
Below the header is the main hero section, which takes up a good portion of the upper screen. This section is centered on the page with comfortable spacing on both the left and right edges.

The hero area is **split into two equal columns** on larger screens, but **stacks vertically** on smaller devices.

### 2.1 Left Column – Text & Call-to-Action

**Components (top to bottom):**

1. **Headline**
   - Text: **"Spreadsheet Checker"**
   - Large, bold, sans-serif font
   - Font size: 36-48px (responsive)
   - Color: Near black (#171717)
   - Primary visual anchor

2. **Description Paragraph**
   - Text: **"The Spreadsheet Checker Tool helps you quickly compare spreadsheets whether it's columns or rows."**
   - Smaller, muted text
   - Font size: 16-18px
   - Color: Gray (#6B7280)
   - Line height: Comfortable for readability (1.6-1.8)

3. **Interactive Elements (side by side)**
   
   At the bottom are two interactive elements sitting **side by side** in a horizontal flex layout:
   
   **a) Upload Button**
   - Text: **"Upload files →"** (with arrow)
   - Bright yellow background (#FFCC00)
   - Text color: Dark (#000000)
   - Rounded edges (fully rounded pill shape)
   - Font: 14px, semi-bold
   - Padding: 16px horizontal, 12px vertical
   - Hover effects: Slight scale (1.05), shadow enhancement
   
   **b) Drag-and-Drop Zone**
   - Subtle background (rgba(255, 204, 0, 0.2) - light yellow)
   - Rounded pill shape to match button
   - Text: **"Drag and drop here"**
   - Same height as upload button
   - Expands to fill remaining space (flex: 1)
   - Minimum width: ~200px

### Typography Hierarchy

| Element     | Style                                    |
| ----------- | ---------------------------------------- |
| Headline    | 36-48px, bold, responsive, near-black    |
| Description | 16-18px, regular, gray (#6B7280)         |
| Button text | 14px, semi-bold, line-height 20px, black |

### Button Design Details

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| Background         | Brand yellow (#FFCC00)               |
| Text color         | Dark (#000000)                       |
| Border radius      | Fully rounded (9999px / pill)        |
| Padding            | 32px horizontal, 16px vertical       |
| Hover              | Opacity 0.8, shadow-lg, scale(1.05)  |
| Shadow             | Medium shadow at rest                |
| Transition         | All 200ms                            |

---

### 2.2 Right Column – Illustration Card

**Purpose:**
Visual metaphor for spreadsheets and data processing.

**Structure:**
- A **dark green rounded rectangle container** serving as a decorative card
- Inside: The image **"docs/assets/Spreadsheet_image.png"**
- The image has a subtle shadow effect

**Visual Characteristics:**

| Property          | Value                              |
| ----------------- | ---------------------------------- |
| Container color   | Dark green (#1B5E20)               |
| Border radius     | Large (24px / 1.5rem - card style) |
| Padding           | 32-48px (2-3rem)                   |
| Shadow            | Soft, blurred, downward (shadow-lg)|
| Image             | Centered, rounded corners          |
| Min height        | 350-450px (responsive)             |

**Image Details:**
- File: `docs/assets/Spreadsheet_image.png`
- Centered within the green card
- Rounded corners (12px / 0.75rem)
- Object-fit: contain (maintains aspect ratio)
- Shadow: Extra large for floating effect

---

## 3. Uploaded Files List Section

**Appears after:** User uploads one or more files

### Purpose
Display all uploaded spreadsheets with metadata and removal options

### Structure
- Section heading: **"Uploaded Files (X)"** where X is the count
- List of file cards, one per uploaded spreadsheet

### File Card Design

**Layout:**
- White background
- Rounded corners (12px / 0.75rem)
- Border: Light gray (#E5E7EB)
- Padding: 16px
- Hover: Shadow enhancement

**Content:**
- **File icon** (left side, green color)
- **File name** (bold, primary text)
- **Metadata** (rows × columns count, gray text)
- **Remove button** (right side, trash icon, red on hover)

---

## 4. Color System

### Primary Colors

| Usage               | Color Description        | Hex Code |
| ------------------- | ------------------------ | -------- |
| Background (page)   | Warm white               | #FAFAF9  |
| Background (cards)  | Pure white               | #FFFFFF  |
| CTA Button          | Brand yellow             | #FFCC00  |
| Illustration card   | Dark green               | #1B5E20  |
| Text (primary)      | Near black               | #171717  |
| Text (secondary)    | Muted gray               | #6B7280  |
| Borders             | Light gray               | #E5E7EB  |
| Drag-drop area      | Light yellow transparent | rgba(255, 204, 0, 0.2) |

### Color Philosophy
The palette balances:
- **Warm productivity** (yellow CTA, warm white background)
- **Enterprise seriousness** (dark green, gray text)
- **Clear call-to-action visibility** (high contrast yellow button)

---

## 5. Spacing & Visual Rhythm

### Consistent Spacing Scale
- **Extra small:** 8px / 0.5rem
- **Small:** 12px / 0.75rem
- **Medium:** 16px / 1rem
- **Large:** 24px / 1.5rem
- **Extra large:** 32px / 2rem
- **XXL:** 48px / 3rem

### Application
- **Component padding:** 16-32px (medium to extra large)
- **Section gaps:** 32-48px (extra large to XXL)
- **Card margins:** 12-16px (small to medium)
- **Element gaps:** 12-24px (small to large)

This creates:
- Easy-to-scan interface
- Calm, non-cluttered appearance
- Clear visual hierarchy
- Professional aesthetic

---

## 6. Typography

### Font Family
- Primary: Arial, Helvetica, sans-serif
- Clean, highly readable, universally available

### Font Sizes

| Element            | Size         | Weight    | Color        |
| ------------------ | ------------ | --------- | ------------ |
| Page headline      | 36-48px      | Bold      | Near black   |
| Section headings   | 24-28px      | Bold      | Near black   |
| Subsection heading | 18-20px      | Semi-bold | Near black   |
| Body text          | 16-18px      | Regular   | Gray         |
| Button text        | 14px         | Semi-bold | Black/White  |
| Small text         | 12-14px      | Regular   | Light gray   |

### Line Heights
- Headlines: 1.2-1.3
- Body text: 1.6-1.8
- Compact elements: 1.4-1.5

---

## 7. Interactive Elements & Behavior

### Upload Button
- **Trigger:** Opens file picker dialog
- **Accepts:** .xlsx, .xls, .csv files
- **Multiple:** Yes (can select multiple files at once)
- **Feedback:** Loading state during file parsing

### Drag-and-Drop Zone
- **Trigger:** File drop event
- **Visual feedback:** Background darkens on drag-over
- **Accepts:** Same file types as upload button
- **Behavior:** Files are immediately parsed and added to list

### File Removal
- **Trigger:** Click trash icon on file card
- **Confirmation:** None (immediate removal)
- **Result:** File removed from list and storage

---

## 8. Responsive Breakpoints

### Desktop (> 1024px)
- Two-column hero layout
- Full visibility of uploaded files list

### Tablet (768px - 1024px)
- Two-column hero layout (may be narrower)
- Stacked file cards

### Mobile (< 768px)
- Single column hero (text above illustration)
- Fully stacked file cards
- Upload button and drag-drop zone may stack vertically

---

## 9. Suggested Component Structure

```
App
├── Header
│   └── Logo
├── HeroSection
│   ├── TextBlock
│   │   ├── Headline
│   │   ├── Description
│   │   └── UploadControls
│   │       ├── UploadButton
│   │       └── DragDropZone
│   └── IllustrationCard
│       └── SpreadsheetImage
├── UploadedFilesList
│   └── FileCard (repeating)
│       ├── FileIcon
│       ├── FileInfo
│       └── RemoveButton
├── ComparisonConfig
│   ├── RuleBuilder
│   │   ├── TypeSelector
│   │   ├── MethodSelector
│   │   ├── SourceSelector
│   │   ├── TargetSelector
│   │   └── AddRuleButton
│   ├── RuleList
│   │   └── RuleCard (repeating)
│   └── ExecuteButton
```

This structure maps cleanly to:
- React (recommended for this project)
- Next.js framework
- Component-based architecture
- Tailwind CSS for styling

---

## 10. Assets Required

### Images
1. **HydraSpecma_RespectArea_RGB.png**
   - Location: `docs/assets/`
   - Usage: Header logo
   - Size: ~150px width

2. **Spreadsheet_image.png**
   - Location: `docs/assets/`
   - Usage: Hero illustration
   - Size: 400x350px (approximate, responsive)

### Icons
- File icon (for uploaded files list)
- Trash/delete icon (for remove actions)
- Upload icon/arrow (for button)

---

## 11. Implementation Notes for Developers

### Priority Guidelines
1. **Prioritize layout and spacing** over pixel perfection
2. **Maintain strong visual hierarchy** (headline → description → CTA)
3. **Keep the CTA visually dominant** (bright yellow, prominent placement)
4. **Use semantic HTML** (header, main, section, article)
5. **Implement accessibility** (ARIA labels, keyboard navigation)

### Technology Stack
- **Framework:** Next.js 16+ with React 19+
- **Styling:** Tailwind CSS 4.x
- **Language:** TypeScript
- **File parsing:** xlsx library
- **State management:** React Context API

### Performance Considerations
- Debounce file processing
- Optimize image loading (Next.js Image component)
- Efficient file parsing with xlsx library

### Accessibility
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast ratios meet WCAG AA standards

---

## 12. Final Design Philosophy

This UI is **intentionally simple, scalable, and user-driven** — ideal for internal productivity tools.

Key principles:
- **Clarity over complexity**
- **Functionality over decoration**
- **User control and feedback**
- **Professional yet approachable**
- **Responsive and accessible**

The design creates a calm, focused environment where users can efficiently upload and manage spreadsheet files without distraction or confusion.
