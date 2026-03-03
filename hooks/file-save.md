# File-Save Hook Template - AWS Well-Architected Review

## Overview

This hook automatically triggers a Well-Architected Framework review when you save Infrastructure as Code (IaC) files. It provides immediate feedback on security, reliability, performance, cost optimization, and other best practices as you write infrastructure code.

## Hook Configuration

```json
{
  "id": "aws-waf-file-save",
  "name": "AWS Well-Architected Review on File Save",
  "description": "Automatically reviews IaC files against AWS Well-Architected best practices when saved",
  "eventType": "fileEdited",
  "filePatterns": "*.tf,*.tfvars,*.yaml,*.yml,*.json",
  "hookAction": "askAgent",
  "outputPrompt": "Review this Infrastructure as Code file against AWS Well-Architected Framework best practices. Focus on:\n\n1. **Security**: Encryption, IAM policies, network security, data protection\n2. **Reliability**: Multi-AZ deployment, backups, fault tolerance, disaster recovery\n3. **Performance Efficiency**: Resource sizing, caching, monitoring\n4. **Cost Optimization**: Right-sizing, auto-scaling, resource utilization\n5. **Operational Excellence**: Monitoring, logging, automation\n6. **Sustainability**: Energy efficiency, resource optimization\n\nProvide specific, actionable recommendations with line numbers where issues are found. Prioritize high-risk issues that could impact security or reliability."
}
```

## When This Hook Triggers

This hook activates when you **save** any of the following file types:

- **Terraform files**: `*.tf`, `*.tfvars`
- **CloudFormation templates**: `*.yaml`, `*.yml`
- **JSON configuration files**: `*.json` (including CloudFormation and CDK synthesized templates)

## What This Hook Does

When triggered, the hook:

1. **Analyzes the saved file** for AWS resources and configurations
2. **Reviews against all six Well-Architected pillars**:
   - Security
   - Reliability
   - Performance Efficiency
   - Cost Optimization
   - Operational Excellence
   - Sustainability
3. **Identifies specific issues** with line numbers and file references
4. **Provides actionable recommendations** for remediation
5. **Prioritizes findings** by risk level (high, medium, low)

## Benefits

- ✅ **Immediate Feedback**: Catch issues as you write code, not during deployment
- ✅ **Learning Tool**: Understand Well-Architected best practices in real-time
- ✅ **Prevent Issues**: Fix problems before they reach production
- ✅ **Save Time**: Avoid costly rework after deployment
- ✅ **Improve Quality**: Build secure, reliable, and efficient infrastructure from the start

## Installation

### Option 1: User-Level Installation (All Projects)

Install this hook to apply Well-Architected reviews across all your projects:

```bash
# Copy the hook to your user-level Kiro hooks directory
cp aws-well-architected-power/hooks/file-save.md ~/.kiro/hooks/aws-waf-file-save.md
```

### Option 2: Workspace-Level Installation (Current Project Only)

Install this hook for the current project only:

```bash
# Copy the hook to your workspace-level Kiro hooks directory
cp aws-well-architected-power/hooks/file-save.md .kiro/hooks/aws-waf-file-save.md
```

### Verification

After installation, the hook will automatically activate when you save IaC files. To verify:

1. Open or create a Terraform or CloudFormation file
2. Make a change and save the file
3. Kiro should automatically provide a Well-Architected review

## Customization

You can customize this hook to fit your specific needs:

### Customize File Patterns

To review only specific file types, modify the `filePatterns` field:

```json
// Only Terraform files
"filePatterns": "*.tf,*.tfvars"

// Only CloudFormation templates
"filePatterns": "*.yaml,*.yml"

// Specific files only
"filePatterns": "main.tf,infrastructure.yaml"
```

### Customize Focus Areas

To focus on specific Well-Architected pillars, modify the `outputPrompt`:

```json
// Security-focused review
"outputPrompt": "Review this file for Security Pillar compliance. Check encryption at rest and in transit, IAM policies following least privilege, network security configurations, and data protection measures. Provide specific recommendations with line numbers."

// Cost optimization focus
"outputPrompt": "Review this file for Cost Optimization opportunities. Check instance sizing, auto-scaling configurations, storage classes, and resource utilization. Identify opportunities to reduce costs without impacting performance or reliability."

// Reliability focus
"outputPrompt": "Review this file for Reliability best practices. Check multi-AZ deployments, backup configurations, fault tolerance patterns, and disaster recovery capabilities. Ensure the infrastructure can handle failures gracefully."
```

### Customize Review Depth

Adjust the level of detail in reviews:

```json
// Quick review (high-priority issues only)
"outputPrompt": "Perform a quick Well-Architected review focusing only on high-risk security and reliability issues. Keep feedback concise."

// Comprehensive review (all pillars, all issues)
"outputPrompt": "Perform a comprehensive Well-Architected review covering all six pillars. Identify all issues regardless of severity and provide detailed remediation guidance."

// Learning mode (detailed explanations)
"outputPrompt": "Review this file against Well-Architected best practices in learning mode. For each issue found, explain why it's a problem, the potential impact, and how to fix it. Include examples of good patterns."
```

## Use Cases

### Use Case 1: Active Development

**Scenario**: You're actively writing Terraform code for a new application infrastructure.

**How It Helps**: 
- Provides immediate feedback as you save each file
- Catches security misconfigurations before they're committed
- Helps you learn best practices while coding
- Prevents accumulation of technical debt

**Best Practice**: Keep the hook enabled during development to catch issues early.

### Use Case 2: Code Review Preparation

**Scenario**: You're preparing infrastructure code for team review.

**How It Helps**:
- Identifies issues before your teammates see them
- Ensures code meets Well-Architected standards
- Reduces back-and-forth during code review
- Demonstrates quality and attention to best practices

**Best Practice**: Run through all IaC files before submitting for review.

### Use Case 3: Learning AWS Best Practices

**Scenario**: You're new to AWS or learning Well-Architected Framework.

**How It Helps**:
- Provides real-time education on best practices
- Explains why certain patterns are recommended
- Shows examples of secure, reliable configurations
- Builds muscle memory for good architecture patterns

**Best Practice**: Use learning mode customization for detailed explanations.

### Use Case 4: Security Compliance

**Scenario**: Your organization has strict security requirements.

**How It Helps**:
- Catches security misconfigurations immediately
- Ensures encryption, IAM, and network security are properly configured
- Provides audit trail of security reviews
- Prevents security issues from reaching production

**Best Practice**: Customize to focus on Security Pillar with strict enforcement.

### Use Case 5: Cost Control

**Scenario**: You need to optimize infrastructure costs.

**How It Helps**:
- Identifies oversized resources before deployment
- Suggests cost-effective alternatives
- Catches expensive configurations early
- Helps maintain cost discipline

**Best Practice**: Customize to focus on Cost Optimization Pillar.

## Considerations

### When to Use This Hook

✅ **Use when**:
- Actively developing infrastructure code
- Learning AWS best practices
- Working on production infrastructure
- Security and compliance are critical
- Cost optimization is a priority

### When to Disable This Hook

❌ **Consider disabling when**:
- Making rapid, experimental changes
- Working on non-AWS infrastructure
- The review feedback is slowing you down
- You're very experienced and prefer manual reviews
- Working in a time-sensitive situation

### Performance Impact

- **Minimal**: Reviews typically complete in 1-3 seconds
- **Asynchronous**: Doesn't block your ability to continue working
- **Configurable**: Can be disabled temporarily without uninstalling

## Troubleshooting

### Hook Not Triggering

**Problem**: You save an IaC file but no review happens.

**Solutions**:
1. Verify the hook file is in the correct location (`~/.kiro/hooks/` or `.kiro/hooks/`)
2. Check that the file extension matches the `filePatterns` (e.g., `.tf`, `.yaml`)
3. Ensure the hook is enabled in your Kiro configuration
4. Restart Kiro if you just installed the hook

### Hook Triggering Too Often

**Problem**: The hook triggers on every save, disrupting your workflow.

**Solutions**:
1. Narrow the `filePatterns` to specific files: `"filePatterns": "main.tf,variables.tf"`
2. Temporarily disable the hook: Move it out of the hooks directory
3. Use workspace-level installation for specific projects only
4. Adjust your save frequency (save less often during active editing)

### Reviews Are Too Detailed

**Problem**: The review output is overwhelming or too verbose.

**Solutions**:
1. Customize the prompt to focus on high-priority issues only
2. Request concise feedback in the prompt
3. Focus on specific pillars instead of all six
4. Use quick review mode instead of comprehensive mode

### Reviews Miss Issues

**Problem**: The review doesn't catch issues you expected.

**Solutions**:
1. Ensure you're using comprehensive review mode
2. Check that the AWS MCP servers are properly configured
3. Verify the file contains actual AWS resources (not just variables)
4. Try a manual review to compare results

### False Positives

**Problem**: The review flags things that aren't actually issues.

**Solutions**:
1. Provide context in your code comments explaining intentional decisions
2. Customize the prompt to exclude specific checks
3. Use workspace-specific configuration for special cases
4. Provide feedback to improve the review logic

## Examples

### Example 1: Terraform EC2 Instance Review

**File**: `main.tf`
```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "web-server"
  }
}
```

**Hook Triggers**: When you save `main.tf`

**Expected Feedback**:
- ⚠️ **Security**: Instance has no security group defined (high risk)
- ⚠️ **Security**: No encryption specified for EBS volumes (medium risk)
- ⚠️ **Reliability**: Single instance with no auto-scaling (medium risk)
- ⚠️ **Operational Excellence**: No monitoring or logging configured (low risk)
- ✅ **Cost**: t2.micro is cost-effective for small workloads

### Example 2: CloudFormation S3 Bucket Review

**File**: `storage.yaml`
```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-data
```

**Hook Triggers**: When you save `storage.yaml`

**Expected Feedback**:
- ⚠️ **Security**: Bucket encryption not enabled (high risk)
- ⚠️ **Security**: No bucket policy or public access block (high risk)
- ⚠️ **Reliability**: Versioning not enabled (medium risk)
- ⚠️ **Reliability**: No lifecycle policies for backup/archival (low risk)
- ⚠️ **Cost**: No lifecycle rules to transition to cheaper storage classes (low risk)

### Example 3: Terraform RDS Database Review

**File**: `database.tf`
```hcl
resource "aws_db_instance" "main" {
  identifier           = "mydb"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = "admin"
  password            = "password123"
}
```

**Hook Triggers**: When you save `database.tf`

**Expected Feedback**:
- 🚨 **Security**: Hardcoded password in code (critical risk)
- ⚠️ **Security**: Encryption at rest not enabled (high risk)
- ⚠️ **Reliability**: Multi-AZ not enabled (high risk)
- ⚠️ **Reliability**: No backup retention configured (medium risk)
- ⚠️ **Operational Excellence**: No enhanced monitoring (low risk)
- ✅ **Cost**: db.t3.micro is cost-effective for development

## Best Practices

1. **Keep It Enabled**: Leave the hook active during development for continuous feedback
2. **Review Immediately**: Address findings right away while context is fresh
3. **Learn Patterns**: Pay attention to recurring issues and learn to avoid them
4. **Customize for Context**: Adjust focus areas based on project requirements
5. **Combine with Manual Reviews**: Use automated reviews as a first pass, not a replacement for human judgment
6. **Document Exceptions**: If you intentionally violate a best practice, document why in comments
7. **Share with Team**: Install at workspace level so the whole team benefits
8. **Iterate**: Refine the hook configuration based on what works for your workflow

## Related Resources

- **Main Power Documentation**: `../POWER.md`
- **Pillar-Specific Guidance**: `../steering/`
  - Security: `../steering/security.md`
  - Reliability: `../steering/reliability.md`
  - Performance: `../steering/performance.md`
  - Cost Optimization: `../steering/cost-optimization.md`
  - Operational Excellence: `../steering/operational-excellence.md`
  - Sustainability: `../steering/sustainability.md`
- **Proactive Review Guidance**: `../steering/proactive-review-guidance.md`
- **Code Generation Guidance**: `../steering/code-generation-guidance.md`
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main power documentation (`../POWER.md`)
3. Check Kiro documentation for hook system details
4. Open an issue in the power repository

---

**Note**: This hook is optional and requires explicit installation. It will not activate until you copy it to your Kiro hooks directory.
