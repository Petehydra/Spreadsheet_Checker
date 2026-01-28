# Spreadsheet Checker

A client-side web application for comparing multiple spreadsheets with custom column and row comparisons. All file processing and comparisons happen entirely in your browser for maximum privacy and security.

## Features

- **Multiple Spreadsheet Upload** - Upload any number of .xlsx, .xls, or .csv files
- **Interactive Element Selection** - Select which spreadsheets, sheets, columns, and rows to compare
- **Flexible Comparison Rules** - Build multi-step comparison workflows with 4 comparison methods:
  - **Equals** - Check if values match exactly
  - **Contains** - Check if target contains source values
  - **Lookup** - Find matching values across datasets
  - **Validate** - Validate that source values are non-empty
- **Results Dashboard** - View summary statistics and detailed matches/mismatches
- **100% Client-Side** - Your files never leave your browser - maximum privacy

## Technology Stack

- **Vite + React 18** - Fast, modern frontend framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **xlsx** - Client-side spreadsheet parsing
- **React Context API** - In-memory state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed

### Installation

```sh
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

```sh
cd frontend
npm run build
npm run preview
```

## Usage Guide

### 1. Upload Spreadsheets

- Click "Upload files" or drag and drop files onto the upload zone
- Upload at least 2 spreadsheet files (.xlsx, .xls, or .csv)
- Files are parsed immediately in your browser

### 2. Select Elements

- Click "Select Spreadsheets to Compare"
- Expand each spreadsheet to see its sheets
- Select sheets, columns, and rows you want to compare
- Must select elements from at least 2 different spreadsheets or sheets

### 3. Configure Comparison Rules

- Choose element type (Column or Row)
- Select comparison method (Equals, Contains, Lookup, Validate)
- Pick source spreadsheet, sheet, and element
- Pick target spreadsheet, sheet, and element
- Add multiple rules to build a workflow
- Reorder rules using up/down arrows

### 4. Execute and View Results

- Click "Execute Comparison" to run all rules
- View summary statistics (total, passed, failed)
- Expand each rule to see detailed matches and mismatches

## Security & Privacy

**Your data is 100% safe and private:**

- All file processing happens in your browser using JavaScript
- Files are never uploaded to any server
- No data is stored on any external system
- Data is cleared when you close or refresh the page
- Works offline after initial page load

## Project Structure

```
/
├── frontend/           # Vite + React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   ├── contexts/   # React Context providers
│   │   ├── services/   # Business logic
│   │   └── hooks/      # Custom React hooks
├── shared/             # Shared TypeScript types
└── docs/               # Documentation
```

## Contributing

This project follows standard TypeScript and React best practices. Keep files under 300 lines and maintain clear separation of concerns.

## License

Private project
