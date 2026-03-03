# Review Workflow Examples

This directory contains example review sessions and reports demonstrating the guided review workflow of the AWS Well-Architected Power.

## Contents

### Review Session Example

**File**: `session-example.json`

A complete review session JSON showing:
- Session configuration and metadata
- Questions and answers across 4 pillars (Security, Reliability, Performance Efficiency, Cost Optimization)
- Identified issues with risk assessments
- Documentation gaps
- Evidence references to IaC files

This example demonstrates a realistic Well-Architected review of an e-commerce web application with 24 questions answered, 5 issues identified, and 3 documentation gaps.

### Report Examples

#### Markdown Report

**File**: `report-example.md`

A comprehensive Markdown report including:
- Executive summary with risk profile
- Pillar scores and status
- Detailed findings by pillar
- Strengths and issues with remediation steps
- Documentation gaps with recommendations
- Remediation roadmap with priorities
- Next steps and recommendations

**Best for**: Documentation repositories, README files, wiki pages, version control

#### JSON Report

**File**: `report-example.json`

A structured JSON report with the same information in machine-readable format:
- Metadata and project information
- Executive summary with metrics
- Pillar scores array
- Issues array with full details
- Documentation gaps array
- Strengths array
- Remediation roadmap
- Recommendations by pillar

**Best for**: Automation, CI/CD pipelines, integration with other tools, programmatic analysis

#### HTML Report

**File**: `report-example.html`

A professionally formatted HTML report with:
- Visual design with AWS branding colors
- Responsive layout
- Tables and cards for organized information
- Color-coded risk badges
- Print-friendly styling
- Interactive sections

**Best for**: Sharing with stakeholders, executive presentations, email distribution, printing

### Workflow Guide

**File**: `workflow-guide.md`

A comprehensive guide to the review workflow including:
- Step-by-step workflow instructions
- Review session structure
- Question types and answering strategies
- Risk assessment methodology
- Report generation options
- Best practices and tips
- Troubleshooting guidance
- Example timeline

## Using These Examples

### 1. Understanding the Workflow

Start by reading `workflow-guide.md` to understand the complete review process from initiation to report generation.

### 2. Reviewing the Session

Open `session-example.json` to see how a review session is structured:
- Configuration options
- Question and answer format
- Evidence references
- Issue identification
- Progress tracking

### 3. Exploring Report Formats

Compare the three report formats to understand their different use cases:

**Markdown** (`report-example.md`):
```bash
# View in terminal
cat report-example.md

# View in VS Code
code report-example.md

# Convert to PDF (requires pandoc)
pandoc report-example.md -o report.pdf
```

**JSON** (`report-example.json`):
```bash
# Pretty print
cat report-example.json | jq

# Extract specific data
cat report-example.json | jq '.issues[] | select(.riskLevel == "high")'

# Count issues by risk level
cat report-example.json | jq '.issues | group_by(.riskLevel) | map({risk: .[0].riskLevel, count: length})'
```

**HTML** (`report-example.html`):
```bash
# Open in browser
open report-example.html  # macOS
xdg-open report-example.html  # Linux
start report-example.html  # Windows

# Or simply double-click the file
```

### 4. Conducting Your Own Review

Use these examples as templates for your own reviews:

1. **Start a review** with the power
2. **Answer questions** following the patterns in the session example
3. **Provide evidence** by referencing your IaC files
4. **Generate reports** in your preferred format(s)
5. **Share findings** with your team

## Example Scenario

The examples in this directory are based on a realistic scenario:

**Project**: E-Commerce Web Application  
**Environment**: Production  
**Architecture**:
- Multi-AZ deployment with Auto Scaling
- Application Load Balancer
- RDS database with automated backups
- S3 for static assets and configuration
- CloudFront CDN
- ElastiCache Redis for caching
- CloudWatch monitoring
- AWS Budgets for cost management

**Review Scope**:
- Security Pillar
- Reliability Pillar
- Performance Efficiency Pillar
- Cost Optimization Pillar

**Key Findings**:
- 1 high-risk issue (IAM wildcard permissions)
- 3 medium-risk issues (internal encryption, backup gaps, instance sizing)
- 1 low-risk issue (manual resource cleanup)
- 3 documentation gaps (IAM procedures, performance testing, disaster recovery)

## Report Highlights

### Executive Summary

- **Total Questions**: 24
- **Completion Rate**: 100%
- **Total Issues**: 5 (1 high, 3 medium, 1 low)
- **Documentation Gaps**: 3

### Pillar Scores

| Pillar | Score | Status |
|--------|-------|--------|
| Security | 75/100 | ⚠️ Needs Improvement |
| Reliability | 85/100 | ✅ Good |
| Performance Efficiency | 70/100 | ⚠️ Needs Improvement |
| Cost Optimization | 90/100 | ✅ Good |

### Critical Issue

**IAM Policies Contain Wildcard Permissions** (High Risk)
- Violates least privilege principle
- Potential for privilege escalation
- Located in `terraform/iam.tf:15`
- Remediation: Replace wildcards with specific resource ARNs

## Customizing for Your Project

### Adapting the Session Format

Modify `session-example.json` for your project:

1. Update `projectName` and `environment` in metadata
2. Select relevant pillars in config
3. Add your custom questions if needed
4. Reference your actual IaC files in evidence
5. Adjust focus areas to match your architecture

### Customizing Report Templates

The report examples can be customized:

**Markdown**: Edit sections, add your branding, adjust formatting  
**JSON**: Modify schema to include additional fields  
**HTML**: Update CSS for your brand colors and styling

## Integration Examples

### CI/CD Pipeline

```yaml
# .github/workflows/well-architected-review.yml
name: Well-Architected Review

on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'cloudformation/**'

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Well-Architected Review
        run: |
          # Trigger review via Kiro
          # Parse JSON report
          # Comment on PR with findings
```

### Automated Reporting

```python
# generate_report.py
import json
from datetime import datetime

def generate_weekly_report():
    # Load latest review session
    with open('session.json') as f:
        session = json.load(f)
    
    # Generate report
    # Send to stakeholders
    # Track metrics over time
```

### Dashboard Integration

```javascript
// dashboard.js
fetch('report-example.json')
  .then(response => response.json())
  .then(data => {
    // Display pillar scores
    // Show high-risk issues
    // Track remediation progress
  });
```

## Best Practices

### For Review Sessions

1. **Be thorough**: Provide detailed answers with evidence
2. **Be honest**: Accurate answers lead to better recommendations
3. **Document everything**: Reference specific files and line numbers
4. **Involve the team**: Get input from security, ops, and dev teams
5. **Save progress**: Use session IDs to resume long reviews

### For Reports

1. **Generate multiple formats**: Markdown for docs, JSON for automation, HTML for stakeholders
2. **Version control**: Store reports in Git to track improvements over time
3. **Share widely**: Distribute to all relevant teams and stakeholders
4. **Act on findings**: Create tickets for remediation items
5. **Schedule follow-ups**: Review progress in 3-6 months

### For Remediation

1. **Prioritize by risk**: Address high-risk issues first
2. **Set realistic timelines**: Use the remediation roadmap
3. **Assign owners**: Make teams accountable for specific issues
4. **Track progress**: Update reports as issues are resolved
5. **Validate fixes**: Re-run reviews to confirm remediation

## Troubleshooting

### Session File Issues

**Problem**: Session file won't load  
**Solution**: Validate JSON syntax with `jq` or a JSON validator

**Problem**: Missing fields in session  
**Solution**: Check against the schema in `session-example.json`

### Report Generation Issues

**Problem**: Report missing information  
**Solution**: Ensure all questions are answered in the session

**Problem**: HTML report not displaying correctly  
**Solution**: Open in a modern browser (Chrome, Firefox, Safari, Edge)

### Workflow Issues

**Problem**: Don't know how to answer a question  
**Solution**: Mark as documentation gap and skip, or consult the workflow guide

**Problem**: Disagree with risk assessment  
**Solution**: Risk levels can be adjusted based on your context and risk tolerance

## Additional Resources

- [Workflow Guide](workflow-guide.md) - Detailed workflow instructions
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [IaC Examples](../terraform/) - Example IaC files with issues

## Contributing

Found an issue or have a suggestion for improving these examples?

1. Review the examples thoroughly
2. Identify specific improvements
3. Submit feedback or pull requests
4. Help others learn from your experience

---

**Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Power Version**: 1.0.0
