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

After uploading spreadsheets, you'll see them listed in the "Selected Files" section on the home page. Each file has selection controls integrated directly into its row.

### Selecting a Spreadsheet

1. Check the checkbox next to the file name to select it for comparison
2. Once selected, the dropdown menus become enabled

### Selecting Sheets

1. Click the "Select Sheet" dropdown for the selected spreadsheet
2. A list of all sheets in that spreadsheet will appear
3. Select one sheet (only one sheet can be selected at a time)
4. The selected sheet name will appear in the dropdown button

### Selecting Columns

1. After selecting a sheet, click the "Select Columns" dropdown
2. You'll see a list of Excel column letters (A, B, C, D, etc.) representing columns that contain data
3. Only columns with actual content are shown (empty columns are automatically excluded)
4. Check the columns you want to compare
5. Use "Deselect all" to clear your column selections
6. The dropdown shows how many columns you've selected

**Note:** Column selection displays Excel column letters (A, B, C) rather than header names, making it easy to identify columns regardless of whether headers exist.

### Requirements

- Must select at least 2 spreadsheets (checkboxes must be checked)
- Each spreadsheet must have at least one sheet selected
- Column selection is optional but recommended for precise comparisons

### Removing Files

Click the trash icon on the right side of any file row to remove it from the selection.

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
- Check the checkbox next to the file name to enable selection dropdowns
- Select a sheet from the "Select Sheet" dropdown before selecting columns
- Check that spreadsheets have actual data (not empty)
- Only columns with data will appear in the column selection dropdown
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
2. **Column Letters** - Columns are identified by Excel letters (A, B, C), making selection easy even without headers
3. **Check Selections** - Verify sheet/column selections before configuring rules
4. **Review Rule Order** - Multi-step workflows depend on execution sequence
5. **Understand Methods** - Choose the right comparison method for your use case
6. **Empty Columns** - Columns with no data are automatically excluded from selection

## Support

For questions or issues:
- Check this user guide
- Review the technical documentation in `/docs/`
- Contact the development team

## Version History

- **v1.1.0** - UI improvements and column detection enhancements
  - Integrated selection controls directly into file list
  - Removed header detection requirement for column selection
  - Column selection now displays Excel column letters (A, B, C)
  - Improved column detection to find all columns with data
  - Automatic exclusion of empty columns

- **v1.0.0** - Initial release with full comparison functionality
  - Multiple spreadsheet upload
  - Element selection UI
  - Four comparison methods
  - Results dashboard
