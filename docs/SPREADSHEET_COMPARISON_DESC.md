# Spreadsheet Column Comparison – Functional Specification

## Overview

The system allows a user to upload multiple spreadsheets and define custom comparison rules between selected columns and rows across the spreadsheets. The comparison logic must support simple one-to-one comparisons as well as multi-step, ordered comparison workflows. All uploaded spreadsheets are registered by the program, including their complete structure (columns and rows), enabling flexible cross-spreadsheet analysis.

---

## User Story

As a user,
I want to upload multiple spreadsheet files and define which columns and rows should be compared,
so that I can validate, match, or cross-check values between the spreadsheets based on custom rules and comparison order.

---

## Core Concepts

- **Multiple spreadsheets** can be uploaded by the user (not limited to two).
- All uploaded spreadsheets are **registered** by the program, including:
  - All columns and their headers
  - All rows and their data
- Users explicitly select which elements to compare:
  - **Column comparisons**: One column from one spreadsheet vs another column from another spreadsheet
  - **Row comparisons**: One row from one spreadsheet vs another row from another spreadsheet
- Comparisons can be:
  - Simple one-to-one comparisons (column-to-column, row-to-row)
  - Multi-step comparisons involving multiple columns or rows with ordered lookups
- Comparison logic is user-defined via the UI.

---

## Functional Requirements

### File Upload

- The user must be able to upload **multiple spreadsheet files** (two or more).
- Supported formats should include common spreadsheet types (e.g. `.xlsx`, `.csv`).
- All uploaded files must be parsed and **registered** by the program, including:
  - All column headers and their structure
  - All rows and their data
- The registered spreadsheet data must be made available to the UI for selection and comparison configuration.

### Element Selection

- The system must display all available elements from all registered spreadsheets:
  - All columns from all spreadsheets
  - All rows from all spreadsheets
- The user must be able to:
  - Select columns from any registered spreadsheet
  - Select rows from any registered spreadsheet
- Selection must support defining **multiple comparison pairs** of any type:
  - Column-to-column comparisons
  - Row-to-row comparisons
- The spreadsheet preview should assist users in making informed selections by clearly showing the available columns and rows.

---

### Comparison Configuration

#### Comparison Type Selection

- After file upload, a **dropdown menu** must allow the user to select:
  - The type of comparison element (column or row)
  - How the comparison should be performed (e.g. equality, contains, lookup-based comparison)

#### Rule Definition

- A **dropdown menu** (or series of menus) must allow the user to define comparison rules, including:
  - Which elements are involved (columns or rows from any registered spreadsheet)
  - The source spreadsheet for each element
  - The order in which elements are evaluated
  - Whether values should be:
    - Directly compared
    - Used as lookup keys
    - Temporarily stored and reused in later steps
- Rules can combine different element types:
  - Column comparisons between spreadsheets
  - Row comparisons between spreadsheets
  - Mixed comparisons (e.g., comparing a column from one spreadsheet against a row from another)

---

### Multi-Step Comparison Logic

The system must support workflows such as:

1. Read a value from Column X in Spreadsheet A
2. Compare it against Column Y in Spreadsheet B
3. Return to Spreadsheet A and read Column Z
4. Use the value from Column Z to validate against Column W in Spreadsheet B

The system must also support row-based workflows:

1. Read a value from Row R in Spreadsheet A
2. Compare it against Row S in Spreadsheet B
3. Return to Spreadsheet A and read Row T
4. Use the value from Row T to validate against Row U in Spreadsheet B

Mixed workflows are also supported:

1. Read a value from Column X in Spreadsheet A
2. Use it to find a matching row in Spreadsheet B
3. Extract data from that row in Spreadsheet B
4. Compare it against a column in Spreadsheet C

The order of these steps must be **explicitly defined by the user**.

---

## UI Behavior Requirements

- Dropdown menus must dynamically populate based on all registered spreadsheets.
- The UI must clearly indicate:

  - Which spreadsheets are registered
  - Available columns and rows for each spreadsheet
- Users must be able to:

  - Add multiple comparison rules
  - Select comparison elements (columns or rows) from any registered spreadsheet
  - Define row comparisons between spreadsheets
  - Define column comparisons between spreadsheets
  - Reorder comparison steps
  - Review the configured comparison logic before execution

---

## Execution

- Once configured, the system must execute the comparison rules in the defined order.
- The system should track intermediate values when required.
- Results should clearly indicate:
  - Matches
  - Mismatches
  - Rule failures

---

## Non-Functional Requirements

- The system must validate that selected columns and rows exist before execution.
- Invalid or incomplete rule configurations must be blocked with clear feedback.
- The comparison logic must be deterministic and repeatable.
- The spreadsheet preview should be performant, handling large spreadsheets efficiently (e.g., pagination or virtualization for very large datasets).

---

## Summary

This system enables flexible, user-defined spreadsheet comparisons by:

- Supporting multiple spreadsheet uploads (not limited to two)
- Registering all uploaded spreadsheets with complete structure (columns and rows)
- Allowing element-level selection (columns and rows)
- Supporting row comparisons between spreadsheets
- Supporting column comparisons between spreadsheets
- Supporting multi-step, ordered comparison rules
- Giving users full control over how and in which sequence data is evaluated across any number of spreadsheets
