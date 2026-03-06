# Validate Examples Hook

Runs the power against all 6 example `-issues` files and checks whether expected findings are detected. Good for verifying the power works after installation.

## What It Does

1. Reads `examples/test-manifest.json` for test cases
2. Reviews each `-issues` file in Simple mode
3. Checks output for expected finding keywords
4. Prints a pass/fail summary table

## Hook Configuration

```json
{
  "name": "Validate Well-Architected Examples",
  "version": "1.0.0",
  "description": "Validates the power catches expected issues in all example files.",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Run the AWS Well-Architected Power example validation suite. For each test case in examples/test-manifest.json:\n\n1. Read the test manifest to get all test cases\n2. For each test case, open the file and perform a quick Well-Architected review (Simple mode)\n3. After each review, check whether the review output mentions at least `minFindings` of the `expectedFindings` keywords (case-insensitive partial match)\n4. Track results as PASS (met minFindings threshold) or FAIL (missed too many)\n\nAfter all test cases, print a summary table:\n\n| File | Pillar | Expected | Found | Result |\n|------|--------|----------|-------|--------|\n\nThen print the overall result: X/Y passed.\n\nIf any test case FAILs, list the specific expected findings that were NOT detected so we know what the power missed."
  }
}
```

## Installation

Copy the JSON configuration block above into a `.kiro.hook` file:

```bash
# Workspace-level
.kiro/hooks/validate-examples.kiro.hook

# Or user-level
~/.kiro/hooks/validate-examples.kiro.hook
```

> **Note:** The file must use the `.kiro.hook` extension to be recognized by Kiro.

Trigger from the Agent Hooks panel in Kiro.
