# Technology Stack Template

## Overview

This template defines the standard technology stack for building modern web applications with Next.js, TypeScript, Azure AD authentication, SharePoint integration, and document processing capabilities.

---

## Core Technologies

### Language & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.x | Primary programming language providing type safety and better developer experience |
| **Node.js** | 20.x | JavaScript runtime environment for the application |

### Framework

| Framework | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.3 | React-based framework for building the web application with server-side rendering, routing, and optimization |
| **React** | 19.2.3 | JavaScript library for building user interfaces |
| **React DOM** | 19.2.3 | React package for working with the DOM |

---

## Authentication & Authorization

### Microsoft Identity Platform

| Package | Version | Purpose |
|---------|---------|---------|
| **@azure/msal-browser** | ^3.30.0 | Microsoft Authentication Library for browser-based authentication with Azure AD |
| **@azure/msal-react** | ^2.2.0 | React wrapper for MSAL, enabling seamless integration of Microsoft authentication in React components |

**Required Scopes:**
- `User.Read` - Basic user profile information
- `Files.Read.All` - Read files user has access to
- `Sites.Read.All` - Read SharePoint sites user has access to

**Configuration Files:**
- `lib/auth/msalConfig.ts` - MSAL configuration
- `lib/auth/AuthProvider.tsx` - React context provider
- `lib/auth/useGraphPhoto.ts` - Hook for user profile photo

---

## SharePoint Integration

### PnP Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **@pnp/sp** | ^4.17.0 | SharePoint client library providing fluent API for interacting with SharePoint Online |
| **@pnp/nodejs** | ^4.17.0 | Node.js-specific utilities for PnP, enabling server-side SharePoint operations |

### Legacy Authentication (Optional)

| Package | Version | Purpose |
|---------|---------|---------|
| **node-sp-auth** | ^3.0.9 | SharePoint authentication helper for legacy support |

**Implementation Files:**
- `lib/sharepoint/sharepointClient.ts` - SharePoint connection logic
- `lib/sharepoint/excelReader.ts` - Excel file fetching and parsing
- `lib/sharepoint/sharepointValidator.ts` - Data validation against SharePoint

---

## Document Processing

### PDF Processing

| Package | Version | Purpose |
|---------|---------|---------|
| **pdfjs-dist** | ^5.4.530 | Mozilla's PDF.js library for parsing and extracting text from PDF files in the browser |

**Implementation:**
- `lib/pdfProcessor.ts` - PDF text extraction utilities
- Works with text-layer PDFs only (not scanned images)
- Client-side processing (browser-based)

### Excel Processing

| Package | Version | Purpose |
|---------|---------|---------|
| **xlsx** | ^0.18.5 | Library for parsing and writing Excel spreadsheet files (.xlsx, .xls) |

**Implementation:**
- Parse Excel files from SharePoint
- Convert Excel data to JSON format
- Read specific columns and sheets

---

## Styling & UI

### CSS Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | ^4.x | Utility-first CSS framework for rapid UI development |
| **@tailwindcss/postcss** | ^4.x | PostCSS plugin for Tailwind CSS processing |

**Standard Configuration:**
- Custom color palette
- Custom animations (fade-in, float, pulse-slow)
- Custom gradients
- Responsive design utilities
- Dark mode support

**Files:**
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles
- `lib/utils.ts` - Utility functions (cn helper)

---

## Testing

### Testing Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **Jest** | ^30.2.0 | JavaScript testing framework for unit and integration tests |
| **jest-environment-jsdom** | ^30.2.0 | DOM environment for testing React components in Jest |

### React Testing Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **@testing-library/react** | ^16.3.2 | Testing utilities for React components |
| **@testing-library/jest-dom** | ^6.9.1 | Custom Jest matchers for DOM assertions |
| **@testing-library/dom** | ^10.4.1 | Core DOM testing utilities |
| **@testing-library/user-event** | ^14.6.1 | Simulates user interactions for testing |

**Test Structure:**
- `__tests__/` - Unit tests for utilities
- `components/**/*.test.tsx` - Component tests
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test setup and global mocks

---

## Code Quality & Linting

### Linting

| Package | Version | Purpose |
|---------|---------|---------|
| **ESLint** | ^9.x | JavaScript/TypeScript linter for code quality and consistency |
| **eslint-config-next** | 16.1.3 | ESLint configuration optimized for Next.js projects |

**Configuration:**
- `.eslintrc.json` - ESLint rules
- Enforces coding standards
- Catches errors early
- Maintains consistent code style

---

## Type Definitions

### TypeScript Types

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/node** | ^20.x | TypeScript type definitions for Node.js |
| **@types/react** | ^19.x | TypeScript type definitions for React |
| **@types/react-dom** | ^19.x | TypeScript type definitions for React DOM |
| **@types/jest** | ^30.0.0 | TypeScript type definitions for Jest |

---

## Project Structure

```
/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Main page component
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   └── [ComponentName]/
│   │       ├── [ComponentName].tsx
│   │       └── [ComponentName].test.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── msalConfig.ts
│   │   │   ├── AuthProvider.tsx
│   │   │   └── useGraphPhoto.ts
│   │   ├── sharepoint/
│   │   │   ├── sharepointClient.ts
│   │   │   ├── excelReader.ts
│   │   │   └── sharepointValidator.ts
│   │   ├── pdfProcessor.ts
│   │   └── utils.ts
│   ├── public/
│   ├── __tests__/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── jest.config.js
│   └── next.config.ts
├── shared/
│   └── types/
├── docs/
└── README.md
```

---

## Package.json Template

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8080",
    "build": "next build",
    "start": "next start -p 8080",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@azure/msal-browser": "^3.30.0",
    "@azure/msal-react": "^2.2.0",
    "@pnp/nodejs": "^4.17.0",
    "@pnp/sp": "^4.17.0",
    "next": "16.1.3",
    "node-sp-auth": "^3.0.9",
    "pdfjs-dist": "^5.4.530",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.3",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Environment Variables Template

```env
# Azure AD Authentication
NEXT_PUBLIC_AZURE_CLIENT_ID=<your-client-id>
NEXT_PUBLIC_AZURE_TENANT_ID=<your-tenant-id>
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:8080

# SharePoint Configuration
SHAREPOINT_SITE_URL=https://yourcompany.sharepoint.com/sites/your-site
SHAREPOINT_EXCEL_PATH=Shared Documents/your-file.xlsx
SHAREPOINT_SHEET_NAME=Sheet1
SHAREPOINT_A9B_COLUMN=A
SHAREPOINT_BOM_ECN_COLUMN=B
```

---

## Standard Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate test coverage report
npm test:coverage
```

---

## Architecture Pattern

### Authentication Flow

1. User clicks login button
2. MSAL redirects to Microsoft login page
3. User authenticates with Microsoft credentials
4. Microsoft redirects back with access token
5. Token stored in session storage
6. Token used for subsequent Graph API calls

### Data Processing Flow

```
User Upload → File Processing → Data Extraction 
→ SharePoint Fetch → Validation → Results Display
```

### API Routes Structure

```
/api
├── validate-pairs       # Validation endpoint
└── [other-endpoints]    # Additional API routes
```

---

## Security Best Practices

### Authentication Security

- Use delegated permissions (not app-only)
- Store tokens in session storage (cleared on browser close)
- Request minimal required scopes
- Implement token refresh logic

### Data Security

- Process files client-side when possible
- Don't store uploaded files on server
- Respect user's existing SharePoint permissions
- Implement server-side validation

### Production Hardening

- Enable HTTPS only
- Configure security headers in `next.config.ts`
- Implement rate limiting
- Add audit logging
- Configure Conditional Access policies in Azure AD
- Restrict Azure App Registration to organization only

---

## Browser Compatibility

### Supported Browsers

- Chrome (Latest 2 versions)
- Firefox (Latest 2 versions)
- Safari (Latest 2 versions)
- Edge (Latest 2 versions)

### Required Features

- ES6+ JavaScript support
- Fetch API
- Web Workers (for PDF.js)
- Local Storage (for MSAL token cache)

---

## Installation Steps

### 1. Create Next.js Project

```bash
npx create-next-app@latest project-name --typescript --tailwind --app
cd project-name
```

### 2. Install Dependencies

```bash
npm install @azure/msal-browser @azure/msal-react @pnp/sp @pnp/nodejs pdfjs-dist xlsx
```

### 3. Install Dev Dependencies

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom
```

### 4. Configure Azure AD

1. Go to Azure Portal → Azure Active Directory → App Registrations
2. Create new registration
3. Add redirect URI: `http://localhost:8080`
4. Add API permissions: User.Read, Files.Read.All, Sites.Read.All
5. Grant admin consent (if required)

### 5. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in values from Azure App Registration.

### 6. Configure Tailwind CSS

Update `tailwind.config.ts` with custom colors, animations, and theme extensions.

### 7. Configure Jest

Create `jest.config.js` and `jest.setup.js` for testing configuration.

---

## TypeScript Configuration

### tsconfig.json Standard Settings

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Deployment Considerations

### Build Requirements

- Node.js 20.x or higher
- npm 9.x or higher
- Environment variables configured

### Deployment Platforms

- **Vercel** - Recommended for Next.js (automatic)
- **Azure Static Web Apps** - Good for Microsoft ecosystem integration
- **Docker** - For containerized deployments
- **Self-hosted** - Using PM2 or similar process manager

### Environment Variables for Production

Update redirect URI to production domain:
```env
NEXT_PUBLIC_AZURE_REDIRECT_URI=https://yourdomain.com
```

---

## Common Use Cases

This stack is ideal for applications that need:

- ✅ Microsoft 365 authentication (Azure AD)
- ✅ SharePoint document integration
- ✅ PDF document processing
- ✅ Excel file parsing
- ✅ Modern React UI with TypeScript
- ✅ Server-side rendering (SSR)
- ✅ Enterprise security requirements

---

## Version Management

### Semantic Versioning

- **^** (caret) - Allows updates that don't change the leftmost non-zero digit
- **~** (tilde) - Allows patch-level updates only

### Update Strategy

- Check for security patches monthly
- Test major version updates thoroughly before upgrading
- Use `package-lock.json` to ensure consistent installs
- Run `npm audit` regularly for security vulnerabilities

---

## Package Sources

All packages are from the official npm registry:
- [https://www.npmjs.com/](https://www.npmjs.com/)

### Key Package Repositories

- **Next.js:** [https://github.com/vercel/next.js](https://github.com/vercel/next.js)
- **MSAL:** [https://github.com/AzureAD/microsoft-authentication-library-for-js](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- **PnPjs:** [https://github.com/pnp/pnpjs](https://github.com/pnp/pnpjs)
- **PDF.js:** [https://github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)
- **SheetJS:** [https://github.com/SheetJS/sheetjs](https://github.com/SheetJS/sheetjs)

---

## License Information

This template uses open-source packages with permissive licenses:
- MIT License (most packages)
- Apache 2.0 (Microsoft packages)

Check individual package licenses for specific terms.
