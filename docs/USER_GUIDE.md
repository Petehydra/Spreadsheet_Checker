# Spreadsheet Checker - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Uploading Spreadsheets](#uploading-spreadsheets)
4. [Selecting Elements](#selecting-elements)
5. [Configuring Comparison Rules](#configuring-comparison-rules)
6. [Understanding Comparison Methods](#understanding-comparison-methods)
7. [Interpreting Results](#interpreting-results)
8. [Privacy & Security](#privacy--security)

## Introduction

The Spreadsheet Checker is a powerful tool for comparing multiple spreadsheet files. Whether you need to compare columns, rows, or build complex multi-step comparison workflows, this tool provides an intuitive interface for defining and executing your comparison logic.

**Key Benefits:**
- Compare unlimited spreadsheet files
- Choose exactly which sheets, columns, and rows to compare
- Build multi-step comparison workflows
- View detailed results with matches and mismatches
- 100% client-side - your data never leaves your browser

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- JavaScript enabled
- No installation required - runs entirely in your browser

### Accessing the Application

Simply navigate to the application URL in your browser. No login or registration required.

## Uploading Spreadsheets

### Step 1: Upload Files

1. On the home page, click the yellow "Upload files →" button
2. Alternatively, drag and drop files onto the "Drag and drop here" zone
3. Select one or more spreadsheet files (.xlsx, .xls, or .csv)

### Supported File Formats

- Excel 2007+ (.xlsx)
- Excel 97-2003 (.xls)
- CSV (.csv)

### What Happens During Upload?

- Files are read directly in your browser (never uploaded to a server)
- Each file is parsed to extract sheets, columns, and rows
- Spreadsheets are registered with a unique ID
- You'll see a success notification for each file processed

## Selecting Elements

After uploading at least 2 spreadsheets, click "Select Spreadsheets to Compare →"

### Selecting Sheets

1. Expand a spreadsheet card by clicking on it
2. Each sheet shows: [Checkbox] Sheet Name [Rows × Columns badge]
3. Check the sheets you want to include in comparisons

### Selecting Columns

1. Expand a sheet to see all its columns
2. Column names are displayed as checkboxes
3. Select the specific columns you want to compare
4. You can select columns from different sheets and spreadsheets

### Selecting Rows

1. Under each sheet, you'll see row indices (1, 2, 3, ...)
2. Select specific rows you want to compare
3. First 20 rows are shown; indicator displays if more exist

### Requirements

- Must select elements from at least 2 different spreadsheets or sheets
- Can mix selections (e.g., columns from one file, rows from another)

Click "Continue to Comparison Configuration →" when ready.

## Configuring Comparison Rules

Comparison rules define how your selected elements will be compared.

### Building a Rule

Each rule consists of:

1. **Element Type** - Column or Row
2. **Comparison Method** - How to compare (see next section)
3. **Source** - Which spreadsheet, sheet, and element to compare from
4. **Target** - Which spreadsheet, sheet, and element to compare to
5. **Store Result** (optional) - Save result for use in subsequent rules

### Adding Rules

1. Select element type (Column or Row)
2. Choose comparison method
3. Use the "Source" dropdown to select: Spreadsheet → Sheet → Element
4. Use the "Target" dropdown to select: Spreadsheet → Sheet → Element
5. Check "Store result" if needed for multi-step workflows
6. Click "Add Rule"

### Managing Rules

- **Reorder** - Use ↑↓ arrow buttons to change execution order
- **Delete** - Click trash icon to remove a rule
- **View Summary** - Each rule shows a human-readable summary

### Multi-Step Workflows

Rules execute in order (Step 1, Step 2, etc.). You can:
- Build sequential comparisons
- Use results from one step in another
- Create complex validation workflows

Click "Execute Comparison" when all rules are configured.

## Understanding Comparison Methods

### Equals

Checks if source values exactly match target values.

**Example:** Column A from File1 equals Column B from File2
- Compares element-by-element
- Case-insensitive matching
- Whitespace is trimmed

**Result:** Each source value is checked against its corresponding target value.

### Contains

Checks if any target value contains the source value.

**Example:** Column A from File1 contains in Column B from File2
- Searches for source values within target dataset
- Useful for finding substrings or partial matches

**Result:** Lists which source values are found in the target.

### Lookup

Finds matching values across datasets using a lookup map.

**Example:** Row 5 from File1 lookup in Row 3 from File2
- Creates an index of target values
- Searches for exact matches
- Can find multiple matches for a single source value

**Result:** Shows all matches found through lookup.

### Validate

Validates that source values are non-empty and valid.

**Example:** Validate Column A from File1
- Checks if values are not null, undefined, or empty string
- Doesn't require a target
- Useful for data quality checks

**Result:** Lists valid and invalid values.

## Interpreting Results

### Summary Statistics

The results page shows three key metrics:

- **Total Rules** - Number of rules executed
- **Passed** - Rules with zero mismatches
- **Failed** - Rules with one or more mismatches

### Detailed Results

Click on any rule to expand and see:

- **Match Count** - Number of successful matches
- **Mismatch Count** - Number of failed matches
- **Matches Table** - Shows source value, location, target value, and location
- **Mismatches Table** - Same as matches, plus reason for mismatch

### Understanding Match/Mismatch

**Match:** Source and target values satisfy the comparison method
**Mismatch:** Source and target values fail the comparison, with reason provided

### Exporting Results

Currently, results are displayed on-screen only. To save results:
- Take screenshots
- Copy table data
- (Future feature: Export to Excel/CSV)

## Privacy & Security

### How Your Data is Protected

**No Server Upload:**
- Files are processed using the FileReader API in your browser
- Data is parsed using the xlsx library (JavaScript)
- No network requests are made for file processing

**No Storage:**
- Data is stored in React state (browser memory only)
- Closing or refreshing the page clears all data
- No cookies, localStorage, or databases used

**Maximum Privacy:**
- Sensitive spreadsheets never leave your computer
- Works offline after initial page load
- Safe for confidential business data

### What Data is Stored?

**During Your Session:**
- Parsed spreadsheet data (in browser memory)
- Your comparison rules configuration
- Comparison results

**After You Leave:**
- All data is immediately cleared
- Nothing is persisted
- No traces left behind

## Troubleshooting

### File Won't Upload

- Check file extension (.xlsx, .xls, .csv only)
- Ensure file is not corrupted
- Try a smaller file (large files may take longer)

### Can't Select Elements

- Ensure you've uploaded at least 2 spreadsheets
- Check that spreadsheets have actual data (not empty)
- Refresh page and re-upload if needed

### Comparison Results Look Wrong

- Verify you selected the correct sheets/columns/rows
- Check that comparison method matches your intent
- Review source and target in rule summary

### Performance Issues

- Large spreadsheets (>10,000 rows) may be slow
- Consider selecting specific rows/columns instead of entire sheets
- Close other browser tabs to free up memory

## Tips & Best Practices

1. **Start Simple** - Test with a single rule before building complex workflows
2. **Use Descriptive Names** - Column headers should be clear and consistent
3. **Check Selections** - Verify sheet/column/row selections before configuring rules
4. **Review Rule Order** - Multi-step workflows depend on execution sequence
5. **Understand Methods** - Choose the right comparison method for your use case

## Support

For questions or issues:
- Check this user guide
- Review the technical documentation in `/docs/`
- Contact the development team

## Version History

- **v1.0.0** - Initial release with full comparison functionality
  - Multiple spreadsheet upload
  - Element selection UI
  - Four comparison methods
  - Results dashboard
