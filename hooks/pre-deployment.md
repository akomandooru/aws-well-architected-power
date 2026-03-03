# Pre-Deployment Hook Template - AWS Well-Architected Review

## Overview

This hook automatically triggers a comprehensive Well-Architected Framework review **before** you deploy infrastructure changes using Terraform or AWS CDK. It acts as a final safety check, ensuring your infrastructure meets security, reliability, performance, cost optimization, and operational excellence standards before changes are applied to your AWS environment.

## Hook Configuration

```json
{
  "id": "aws-waf-pre-deployment",
  "name": "AWS Well-Architected Review Before Deployment",
  "description": "Performs a comprehensive Well-Architected review before terraform apply or cdk deploy commands execute",
  "eventType": "preToolUse",
  "toolTypes": "shell",
  "hookAction": "askAgent",
  "outputPrompt": "A deployment command is about to execute. Before proceeding, perform a comprehensive AWS Well-Architected Framework review of the infrastructure changes:\n\n**CRITICAL CHECKS (Must Pass)**:\n1. **Security**: No hardcoded credentials, encryption enabled, IAM follows least privilege, security groups properly configured\n2. **Reliability**: Multi-AZ where appropriate, backups configured, fault tolerance implemented\n\n**IMPORTANT CHECKS**:\n3. **Performance Efficiency**: Appropriate resource sizing, caching strategies, monitoring enabled\n4. **Cost Optimization**: Right-sizing, auto-scaling configured, no unnecessary resources\n5. **Operational Excellence**: Logging enabled, monitoring configured, automation in place\n6. **Sustainability**: Resource efficiency, appropriate instance types\n\n**REVIEW SCOPE**:\n- Analyze all IaC files in context (*.tf, *.yaml, *.json)\n- Identify high-risk issues that could cause security breaches, outages, or excessive costs\n- Provide specific recommendations with file names and line numbers\n- Prioritize findings by risk level (critical, high, medium, low)\n\n**OUTPUT FORMAT**:\n- Start with a summary: \"✅ Safe to deploy\" or \"⚠️ Issues found - review before deploying\"\n- List critical and high-risk issues first\n- For each issue: describe the problem, impact, and recommended fix\n- End with a clear recommendation: proceed, fix issues first, or needs manual review\n\nIf critical security or reliability issues are found, strongly recommend fixing them before deployment."
}
```

## When This Hook Triggers

This hook activates **before** the following deployment commands execute:

- **Terraform**: `terraform apply`, `terraform apply -auto-approve`
- **AWS CDK**: `cdk deploy`, `cdk deploy --all`
- **Other IaC tools**: Any shell command containing `apply` or `deploy` with infrastructure context

## What This Hook Does

When triggered, the hook:

1. **Pauses the deployment** to perform a review
2. **Analyzes all IaC files** in the current context
3. **Performs comprehensive Well-Architected review** across all six pillars
4. **Identifies critical issues** that could cause security breaches, outages, or excessive costs
5. **Provides clear recommendation**: proceed, fix issues first, or needs manual review
6. **Allows you to decide**: continue with deployment or cancel to fix issues

## Benefits

- 🛡️ **Prevent Security Breaches**: Catch security misconfigurations before they reach production
- 🚨 **Avoid Outages**: Identify reliability issues that could cause downtime
- 💰 **Control Costs**: Catch expensive configurations before they start billing
- ✅ **Compliance**: Ensure deployments meet organizational standards
- 🎯 **Final Safety Check**: Last line of defense before infrastructure changes
- 📚 **Learning**: Understand what makes infrastructure production-ready

## Installation

### Option 1: User-Level Installation (All Projects)

Install this hook to review all deployments across all your projects:

```bash
# Copy the hook to your user-level Kiro hooks directory
cp aws-well-architected-power/hooks/pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
```

### Option 2: Workspace-Level Installation (Current Project Only)

Install this hook for the current project only:

```bash
# Copy the hook to your workspace-level Kiro hooks directory
cp aws-well-architected-power/hooks/pre-deployment.md .kiro/hooks/aws-waf-pre-deployment.md
```

### Verification

After installation, the hook will automatically activate before deployment commands. To verify:

1. Run a deployment command: `terraform apply` or `cdk deploy`
2. Kiro should automatically pause and provide a Well-Architected review
3. You'll see a summary and recommendation before the command executes

## Customization

You can customize this hook to fit your specific needs:

### Customize Deployment Commands

To trigger on specific commands only, modify the hook to use `promptSubmit` event type with command detection:

```json
// Alternative: Trigger on specific command patterns
{
  "eventType": "promptSubmit",
  "hookAction": "askAgent",
  "outputPrompt": "If the user's prompt contains 'terraform apply' or 'cdk deploy', perform a pre-deployment Well-Architected review before executing the command..."
}
```

### Customize Review Depth

Adjust the level of scrutiny:

```json
// Quick review (critical issues only)
"outputPrompt": "Quick pre-deployment check: Scan for critical security issues (hardcoded credentials, public access, missing encryption) and high-risk reliability issues (single points of failure, no backups). Keep feedback concise - only block deployment for critical issues."

// Comprehensive review (all issues)
"outputPrompt": "Comprehensive pre-deployment review: Analyze all six Well-Architected pillars in detail. Identify all issues regardless of severity. Provide detailed remediation guidance for each finding. Recommend deployment only if no high or critical issues exist."

// Security-focused review
"outputPrompt": "Security-focused pre-deployment review: Thoroughly analyze security configurations including IAM policies, encryption, network security, data protection, and compliance. Block deployment if any security issues are found."
```

### Customize Risk Thresholds

Define when to block deployments:

```json
// Strict mode (block on any high-risk issue)
"outputPrompt": "...If ANY high or critical risk issues are found, strongly recommend canceling deployment and fixing issues first. Only allow deployment if all issues are low or medium risk."

// Balanced mode (block only on critical issues)
"outputPrompt": "...If critical risk issues are found, strongly recommend canceling deployment. High-risk issues should be noted but can proceed with acknowledgment. Medium and low-risk issues are informational."

// Permissive mode (informational only)
"outputPrompt": "...Provide a comprehensive review but allow deployment to proceed. Present findings as recommendations for future improvements rather than blockers."
```

### Customize Focus Areas

Focus on specific pillars or concerns:

```json
// Production deployments (security + reliability focus)
"outputPrompt": "Pre-deployment review for PRODUCTION environment. Focus heavily on Security and Reliability pillars. Any security misconfiguration or single point of failure should block deployment. Cost and performance are secondary concerns."

// Development deployments (cost focus)
"outputPrompt": "Pre-deployment review for DEVELOPMENT environment. Focus on Cost Optimization - flag expensive resources that aren't necessary for dev/test. Security and reliability can be more relaxed for non-production."

// Compliance-focused (security + operational excellence)
"outputPrompt": "Pre-deployment compliance review. Verify security controls, logging, monitoring, and audit trails are properly configured. Ensure deployment meets regulatory requirements (HIPAA, PCI-DSS, SOC2, etc.)."
```

## Use Cases

### Use Case 1: Production Deployments

**Scenario**: You're deploying infrastructure changes to production.

**How It Helps**:
- Catches critical security issues before they reach production
- Identifies reliability risks that could cause outages
- Prevents expensive misconfigurations from going live
- Provides final safety check before changes are applied
- Creates audit trail of pre-deployment reviews

**Best Practice**: Use strict mode - block deployment on any high or critical issues.

**Example**:
```bash
$ terraform apply

# Hook triggers automatically
⚠️ Pre-Deployment Review Required

Analyzing infrastructure changes...

🚨 CRITICAL ISSUES FOUND:
1. database.tf:15 - Hardcoded database password (CRITICAL)
   Impact: Credentials exposed in code, security breach risk
   Fix: Use AWS Secrets Manager or SSM Parameter Store

2. storage.tf:8 - S3 bucket encryption disabled (HIGH)
   Impact: Data at rest not encrypted, compliance violation
   Fix: Add server_side_encryption_configuration block

⚠️ HIGH RISK ISSUES:
3. compute.tf:22 - Single EC2 instance, no auto-scaling (HIGH)
   Impact: Single point of failure, no fault tolerance
   Fix: Implement Auto Scaling Group with min 2 instances

RECOMMENDATION: ⛔ DO NOT DEPLOY
Fix critical and high-risk issues before proceeding.

Proceed with deployment anyway? [y/N]
```

### Use Case 2: Team Deployments

**Scenario**: Multiple team members deploy infrastructure changes.

**How It Helps**:
- Ensures consistent review standards across team
- Catches issues regardless of who's deploying
- Educates junior team members on best practices
- Prevents "quick fixes" that skip proper review
- Creates shared understanding of deployment standards

**Best Practice**: Install at workspace level so all team members use it.

### Use Case 3: CI/CD Pipeline Integration

**Scenario**: Automated deployments from CI/CD pipelines.

**How It Helps**:
- Provides automated gate before production deployments
- Catches issues that passed code review but violate best practices
- Creates audit trail for compliance
- Can fail pipeline if critical issues found
- Reduces manual review burden

**Best Practice**: Configure to fail pipeline on critical/high issues.

### Use Case 4: Learning and Training

**Scenario**: Team is learning AWS best practices.

**How It Helps**:
- Provides real-time education before deployments
- Explains why certain configurations are risky
- Shows examples of proper patterns
- Builds team knowledge over time
- Reduces reliance on senior engineers for reviews

**Best Practice**: Use comprehensive review mode with detailed explanations.

### Use Case 5: Cost Control

**Scenario**: Need to prevent expensive infrastructure from being deployed.

**How It Helps**:
- Catches oversized resources before they start billing
- Identifies missing auto-scaling or right-sizing
- Flags unnecessary resources
- Prevents cost surprises
- Enforces cost discipline

**Best Practice**: Customize to focus on Cost Optimization pillar.

### Use Case 6: Compliance and Audit

**Scenario**: Organization has strict compliance requirements (HIPAA, PCI-DSS, SOC2).

**How It Helps**:
- Verifies security controls before deployment
- Ensures logging and monitoring are configured
- Creates audit trail of pre-deployment reviews
- Catches compliance violations early
- Reduces audit findings

**Best Practice**: Focus on Security and Operational Excellence pillars.

## Considerations

### When to Use This Hook

✅ **Use when**:
- Deploying to production environments
- Security and compliance are critical
- Team needs consistent deployment standards
- Learning AWS best practices
- Cost control is important
- Multiple people deploy infrastructure

### When to Disable This Hook

❌ **Consider disabling when**:
- Deploying to personal development environments
- Making emergency hotfixes (time-critical)
- Very experienced team with strong review processes
- Deploying non-AWS infrastructure
- Hook reviews are too slow for your workflow

### Performance Impact

- **Moderate**: Reviews typically take 5-15 seconds depending on infrastructure size
- **Blocking**: Pauses deployment until review completes
- **Configurable**: Can be disabled temporarily without uninstalling
- **Skippable**: You can proceed with deployment even if issues are found

## Troubleshooting

### Hook Not Triggering

**Problem**: You run `terraform apply` but no review happens.

**Solutions**:
1. Verify the hook file is in the correct location (`~/.kiro/hooks/` or `.kiro/hooks/`)
2. Ensure the hook is enabled in your Kiro configuration
3. Check that you're running the command through Kiro (not directly in terminal)
4. Verify the `eventType` and `toolTypes` match your use case
5. Restart Kiro if you just installed the hook

### Hook Triggers Too Often

**Problem**: The hook triggers on non-deployment commands.

**Solutions**:
1. Refine the `toolTypes` to be more specific
2. Use `promptSubmit` event type with command pattern matching
3. Customize to only trigger on specific commands
4. Temporarily disable for non-deployment work

### Reviews Are Too Slow

**Problem**: Pre-deployment reviews take too long.

**Solutions**:
1. Use quick review mode (critical issues only)
2. Reduce the number of pillars checked
3. Focus on specific high-priority concerns
4. Consider using file-save hook instead for faster feedback
5. Disable for development environments

### Too Many False Positives

**Problem**: Hook flags issues that aren't actually problems.

**Solutions**:
1. Adjust risk thresholds to be less strict
2. Customize focus areas to match your requirements
3. Document intentional exceptions in code comments
4. Use workspace-specific configuration for special cases
5. Provide feedback to improve review logic

### Blocking Legitimate Deployments

**Problem**: Hook prevents deployments that should be allowed.

**Solutions**:
1. Use balanced or permissive mode instead of strict mode
2. Adjust what constitutes a "blocking" issue
3. Add override mechanism for emergency deployments
4. Review and fix the flagged issues (they may be legitimate concerns)
5. Temporarily disable hook for urgent deployments

## Examples

### Example 1: Terraform Deployment with Issues

**Command**: `terraform apply`

**Hook Output**:
```
🔍 Pre-Deployment Well-Architected Review

Analyzing infrastructure changes in:
- main.tf (12 resources)
- database.tf (3 resources)
- networking.tf (8 resources)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL ISSUES (Must Fix):

1. database.tf:15 - Hardcoded database password
   Severity: CRITICAL
   Impact: Credentials exposed in version control, immediate security breach risk
   Fix: Use AWS Secrets Manager:
   ```hcl
   resource "aws_secretsmanager_secret" "db_password" {
     name = "db-password"
   }
   password = data.aws_secretsmanager_secret_version.db_password.secret_string
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ HIGH RISK ISSUES:

2. main.tf:45 - EC2 instance has no security group
   Severity: HIGH
   Impact: Instance exposed to all network traffic, potential unauthorized access
   Fix: Add security group with restrictive ingress rules

3. database.tf:8 - RDS instance not in Multi-AZ
   Severity: HIGH
   Impact: Single point of failure, no automatic failover
   Fix: Add `multi_az = true` to aws_db_instance resource

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SUMMARY:
- Total Issues: 5 (1 critical, 2 high, 2 medium)
- Security Issues: 2
- Reliability Issues: 2
- Cost Issues: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⛔ RECOMMENDATION: DO NOT DEPLOY

Critical and high-risk issues must be addressed before deployment.
These issues could result in:
- Security breaches and data exposure
- Service outages and downtime
- Compliance violations

Fix the issues above and run terraform apply again.

Proceed with deployment anyway? [y/N]
```

### Example 2: CDK Deployment - Clean

**Command**: `cdk deploy`

**Hook Output**:
```
🔍 Pre-Deployment Well-Architected Review

Analyzing CDK infrastructure...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SECURITY: Excellent
- Encryption enabled for all data stores
- IAM policies follow least privilege
- Security groups properly configured
- No hardcoded credentials

✅ RELIABILITY: Good
- Multi-AZ deployment configured
- Auto-scaling enabled
- Backup retention configured
- Health checks implemented

✅ PERFORMANCE: Good
- Appropriate instance sizing
- Caching configured
- CloudWatch monitoring enabled

✅ COST OPTIMIZATION: Good
- Right-sized resources
- Auto-scaling will optimize costs
- Lifecycle policies configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 MINOR RECOMMENDATIONS:

1. Consider adding CloudWatch Logs retention policy (currently unlimited)
2. Consider using Graviton instances for better price-performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RECOMMENDATION: SAFE TO DEPLOY

No critical or high-risk issues found. Infrastructure follows Well-Architected
best practices. Minor recommendations above are optional improvements.

Proceed with deployment? [Y/n]
```

### Example 3: Emergency Hotfix

**Command**: `terraform apply -auto-approve`

**Hook Output**:
```
🔍 Pre-Deployment Well-Architected Review

⚠️ NOTICE: Auto-approve flag detected - this appears to be an urgent deployment

Performing quick security scan...

✅ No critical security issues detected
✅ No hardcoded credentials
✅ Encryption configurations intact

⚠️ Note: Full Well-Architected review skipped due to auto-approve flag.
Consider running a comprehensive review after the emergency is resolved.

Proceeding with deployment...
```

## Best Practices

1. **Always Enable for Production**: Make this hook mandatory for production deployments
2. **Review Findings Carefully**: Don't skip reviews just to deploy faster
3. **Fix Issues Before Deploying**: Resist the temptation to "fix it later"
4. **Document Exceptions**: If you must deploy with known issues, document why
5. **Adjust for Environment**: Use strict mode for production, relaxed for development
6. **Learn from Reviews**: Pay attention to recurring issues and prevent them
7. **Combine with Other Hooks**: Use file-save hook during development, pre-deployment before apply
8. **Create Audit Trail**: Keep records of pre-deployment reviews for compliance
9. **Share with Team**: Ensure all team members use the same hook configuration
10. **Iterate and Improve**: Refine the hook based on what works for your team

## Integration with Other Hooks

This hook works well in combination with other Well-Architected hooks:

- **File-Save Hook**: Catches issues during development
- **Pre-Deployment Hook** (this hook): Final check before deployment
- **Post-Generation Hook**: Reviews AI-generated infrastructure code

**Recommended Workflow**:
1. Write infrastructure code → **File-Save Hook** provides immediate feedback
2. Generate code with AI → **Post-Generation Hook** reviews generated code
3. Ready to deploy → **Pre-Deployment Hook** performs final safety check

## Related Resources

- **Main Power Documentation**: `../POWER.md`
- **File-Save Hook**: `./file-save.md` (for development-time reviews)
- **Post-Generation Hook**: `./post-generation.md` (for AI-generated code reviews)
- **Pillar-Specific Guidance**: `../steering/`
  - Security: `../steering/security.md`
  - Reliability: `../steering/reliability.md`
  - Performance: `../steering/performance.md`
  - Cost Optimization: `../steering/cost-optimization.md`
  - Operational Excellence: `../steering/operational-excellence.md`
  - Sustainability: `../steering/sustainability.md`
- **Proactive Review Guidance**: `../steering/proactive-review-guidance.md`
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main power documentation (`../POWER.md`)
3. Check Kiro documentation for hook system details
4. Open an issue in the power repository

---

**Note**: This hook is optional and requires explicit installation. It will not activate until you copy it to your Kiro hooks directory. This hook provides a safety check but should not replace proper code review and testing processes.
