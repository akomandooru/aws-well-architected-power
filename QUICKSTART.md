# Quick Start Guide: AWS Well-Architected Power

Get started with the AWS Well-Architected Power in under 5 minutes. This guide will walk you through installation, your first review, and optional automation setup.

## Prerequisites

- Kiro IDE installed and running
- AWS infrastructure code (Terraform, CloudFormation, or CDK) - optional but recommended for testing
- Python and uv (for AWS MCP servers - optional, see [uv installation](https://docs.astral.sh/uv/getting-started/installation/))

## Installation (2 minutes)

### Step 1: Install the Power

**Option A: Install from Local Folder** (for testing/development):

1. Clone or download the power:
   ```bash
   git clone https://github.com/your-org/aws-well-architected-power.git
   ```

2. In Kiro, open the Powers panel:
   - Command Palette → "Powers: Configure"
   - Or ask: "Open powers configuration"

3. Click "Add Custom Power"

4. Select "Import from folder"

5. Navigate to and select the `aws-well-architected-power` folder

**Option B: Install from URL** (for published powers):

1. In Kiro, open the Powers panel

2. Click "Add Custom Power"

3. Select "Import from URL"

4. Enter: `https://github.com/your-org/aws-well-architected-power`

### Step 2: Verify Installation

The power should now appear in your installed powers list. You can verify by asking:

```
"List available powers"
```

You should see "aws-well-architected-power" in the list.

### Step 3: MCP Servers (Optional - Disabled by Default)

The power includes two AWS MCP servers that are **disabled by default**:
- **aws-well-architected-security**: Automated security checks and compliance validation
- **aws-documentation**: AWS documentation, API references, and best practices

**The power works fully without these servers** using fallback documentation from steering files.

**To enable the MCP servers** (for enhanced capabilities):

1. **Enable in Kiro**:
   - Click "Open powers config" in the MCP Configuration section, OR
   - Open your MCP settings file: `~/.kiro/settings/mcp.json` or `.kiro/settings/mcp.json`
   - Find the power's MCP servers (they'll be under a `powers` section)
   - Change `"disabled": true` to `"disabled": false` for the servers you want to enable
   - Restart Kiro

The MCP servers will be automatically downloaded and installed on first use.

**Benefits of enabling MCP servers:**
- Automated security assessments
- Real-time AWS documentation access
- Up-to-date best practices

**Note**: The MCP servers require `uv` (Python package manager). Install uv from [https://docs.astral.sh/uv/getting-started/installation/](https://docs.astral.sh/uv/getting-started/installation/).

## Your First Review (3 minutes)

### Option A: Analyze Existing IaC Files

If you have Terraform, CloudFormation, or CDK files:

```
You: "Review my infrastructure code against AWS Well-Architected best practices"

Kiro: [Analyzes your IaC files, identifies issues with specific line numbers, 
       provides risk levels, and suggests remediation steps]
```

**What to expect:**
- Specific issues identified with file names and line numbers
- Risk level for each issue (High, Medium, Low)
- Detailed remediation steps
- Pillar classification (Security, Reliability, etc.)

### Option B: Try Example Files

Use the included example files to see the power in action:

```
You: "Review the file aws-well-architected-power/examples/terraform/security-issues.tf"

Kiro: [Identifies 5 security issues including unencrypted S3 buckets, 
       overly permissive IAM policies, and unrestricted security groups]
```

Compare with the fixed version to see best practices:

```
You: "Show me the differences between security-issues.tf and security-issues-fixed.tf"

Kiro: [Highlights the remediation changes]
```

### Option C: Guided Review Session

Start an interactive review session:

```
You: "I want to conduct a Well-Architected review focusing on Security and Reliability"

Kiro: [Guides you through relevant questions, provides immediate feedback,
       identifies gaps, and generates a comprehensive report]
```

**What to expect:**
- Structured questions about your architecture
- Immediate feedback on your answers
- Documentation gap identification
- Final report with prioritized recommendations

## Common Use Cases

### 1. Review Before Deployment

```
You: "I'm about to deploy this infrastructure. Can you review it first?"

Kiro: [Performs comprehensive review, flags critical issues that should 
       be fixed before deployment]
```

### 2. Generate Well-Architected Code

```
You: "Generate a Terraform configuration for an S3 bucket following AWS best practices"

Kiro: [Generates code with encryption enabled, versioning configured, 
       lifecycle policies, and inline comments explaining decisions]
```

### 3. Learn Best Practices

```
You: "Explain Security Pillar best practices for RDS databases"

Kiro: [Provides detailed explanations, real-world examples, anti-patterns,
       and links to AWS documentation]
```

### 4. Get Specific Guidance

```
You: "How should I configure IAM policies for a Lambda function accessing S3 and DynamoDB?"

Kiro: [Provides least-privilege IAM policy example with explanations]
```

## Understanding Review Results

### Risk Levels

- **High Risk**: Critical issues that could lead to security breaches, data loss, or significant downtime
- **Medium Risk**: Important issues that reduce reliability, increase costs, or create technical debt
- **Low Risk**: Minor improvements that enhance best practice compliance

### Pillar Classification

Issues are organized by the six Well-Architected pillars:

1. **Operational Excellence**: Monitoring, logging, automation
2. **Security**: Encryption, IAM, network security, data protection
3. **Reliability**: Multi-AZ, backups, fault tolerance, disaster recovery
4. **Performance Efficiency**: Instance sizing, caching, database optimization
5. **Cost Optimization**: Right-sizing, auto-scaling, lifecycle policies
6. **Sustainability**: Energy efficiency, resource optimization

### Report Formats

Generate reports in multiple formats:

```
You: "Generate a review report in Markdown format"
You: "Generate a review report in JSON format for automation"
You: "Generate a review report in HTML format for stakeholders"
```

## Optional: Install Automation Hooks (1 minute)

Automate reviews with pre-configured hooks. The hooks are in the power's `hooks/` directory.

### File-Save Hook
Automatically review IaC files when you save them:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/file-save.md ~/.kiro/hooks/aws-waf-file-save.md
```

**Test it**: Open a `.tf` or `.yaml` file, make a change, save → automatic review

### Pre-Deployment Hook
Review infrastructure before deployment commands:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
```

**Test it**: Run `terraform apply` → review happens before execution

### Post-Generation Hook
Review AI-generated infrastructure code:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md
```

**Test it**: Ask Kiro to generate infrastructure code → automatic review after generation

See `hooks/README.md` for detailed installation and customization instructions.

## Troubleshooting

### Power Not Found

**Problem**: Kiro doesn't recognize the power

**Solutions**:
- Verify installation path: `~/.kiro/powers/aws-well-architected-power/` or `.kiro/powers/aws-well-architected-power/`
- Check that `POWER.md` and `mcp.json` exist in the power directory
- Restart Kiro to reload powers
- Check Kiro logs for errors

### No Issues Found

**Problem**: Review completes but finds no issues

**Possible reasons**:
- Your infrastructure already follows best practices (great!)
- File format not recognized (check file extensions)
- MCP servers not configured (some checks require MCP servers)

**Solutions**:
- Try reviewing the example files to verify the power works
- Ask for specific pillar reviews: "Review for Security Pillar compliance"
- Enable learning mode for detailed explanations even without issues

### Reviews Are Too Slow

**Problem**: Reviews take too long

**Solutions**:
- Focus on specific pillars: "Review Security and Cost Optimization only"
- Request quick reviews: "Quick review - top 3 critical issues only"
- Check MCP server configuration and network connectivity
- Use file-specific reviews instead of workspace-wide scans

### MCP Server Errors

**Problem**: Errors about MCP servers being unavailable

**Solutions**:
- The power works without MCP servers using fallback documentation
- Configure MCP servers in Kiro settings for enhanced capabilities
- Check AWS credentials if using Security Assessment MCP server
- Verify network connectivity to AWS services

### Hook Not Triggering

**Problem**: Installed hook doesn't trigger automatically

**Solutions**:
- Verify hook file location: `~/.kiro/hooks/` or `.kiro/hooks/`
- Check file extension matches hook patterns (`.tf`, `.yaml`, `.json`)
- Restart Kiro to load new hooks
- Check hook file permissions: `chmod 644 ~/.kiro/hooks/aws-waf-*.md`

## Next Steps

### Explore Examples

Check out comprehensive examples in the `examples/` directory:

- **Learning Mode Examples** (`examples/learning/`): Detailed educational content with quizzes
- **IaC Analysis Examples** (`examples/terraform/`, `examples/cloudformation/`, `examples/cdk/`): Common issues and fixes
- **Review Workflow Examples** (`examples/reviews/`): Complete review sessions and reports

See `examples/README.md` for detailed documentation.

### Deep Dive into Pillars

Explore pillar-specific guidance in the `steering/` directory:

- `steering/security.md` - Security best practices and patterns
- `steering/reliability.md` - Fault tolerance and resilience patterns
- `steering/performance.md` - Performance optimization guidance
- `steering/cost-optimization.md` - Cost-effective architecture patterns
- `steering/operational-excellence.md` - Monitoring and operational procedures
- `steering/sustainability.md` - Energy-efficient architecture patterns

### Customize Your Workflow

- **Configure Review Scope**: Focus on pillars most relevant to your project
- **Customize Hooks**: Adjust file patterns and review depth in hook configurations
- **Create Templates**: Save common review configurations for different project types
- **Integrate with CI/CD**: Use JSON reports in automated pipelines

### Learn More

- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
- **AWS Well-Architected Tool**: https://aws.amazon.com/well-architected-tool/
- **AWS Architecture Center**: https://aws.amazon.com/architecture/
- **Power Documentation**: See `POWER.md` for complete feature documentation

## Quick Reference

### Common Commands

```bash
# Installation
cp -r aws-well-architected-power ~/.kiro/powers/

# Install all hooks
cp aws-well-architected-power/hooks/*.md ~/.kiro/hooks/

# Disable a hook temporarily
mv ~/.kiro/hooks/aws-waf-file-save.md ~/.kiro/hooks/aws-waf-file-save.md.disabled

# Re-enable a hook
mv ~/.kiro/hooks/aws-waf-file-save.md.disabled ~/.kiro/hooks/aws-waf-file-save.md
```

### Common Prompts

```
# General review
"Review my infrastructure against AWS Well-Architected best practices"

# Pillar-specific review
"Review for Security Pillar compliance"
"Review for Cost Optimization opportunities"

# Quick review
"Quick review - top 3 critical issues only"

# Learning mode
"Explain Reliability Pillar best practices for this architecture"

# Code generation
"Generate a Terraform module for [resource] following AWS best practices"

# Report generation
"Generate a review report in Markdown format"
```

## Support

For issues, questions, or contributions:

1. Check this Quick Start Guide for common solutions
2. Review `POWER.md` for complete documentation
3. Check `hooks/README.md` for hook-specific troubleshooting
4. Review `examples/README.md` for usage examples
5. Open an issue in the power repository

---

**Congratulations!** You're now ready to conduct continuous Well-Architected reviews during development. Start with a simple review and gradually explore more advanced features as you become comfortable with the power.

**Time to First Review**: Under 5 minutes ✓

