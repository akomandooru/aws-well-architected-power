# AWS Well-Architected Power - Hook Templates

## Overview

This directory contains pre-configured hook templates that enable automated Well-Architected Framework reviews during your development workflow. These hooks integrate seamlessly with Kiro to provide continuous, proactive infrastructure code reviews without manual intervention.

## What Are Hooks?

Hooks are automated triggers in Kiro that execute specific actions when certain events occur in your IDE. Think of them as "event listeners" for your development workflow.

### How Hooks Work

1. **Event Occurs**: You perform an action (save file, run command, generate code)
2. **Hook Detects**: The hook system detects the event matches a hook's trigger
3. **Action Executes**: Kiro automatically performs the hook's configured action
4. **Feedback Provided**: You receive immediate feedback without manual intervention

### Benefits

- ✅ Automated reviews - no need to remember to request reviews manually
- ✅ Immediate feedback - catch issues at the moment they're introduced
- ✅ Consistent standards - same review criteria applied every time
- ✅ Learning tool - continuous education on best practices
- ✅ Time savings - prevent issues rather than fix them later
- ✅ Team alignment - shared standards across all team members

## Available Hook Templates

### 1. File-Save Hook (`file-save.md`)

**Triggers**: When you save IaC files (*.tf, *.tfvars, *.yaml, *.yml, *.json)

**Action**: Performs immediate Well-Architected review of the saved file

**Best for**: Active development, learning AWS best practices, catching issues immediately

**Installation**:
```bash
# User-level (all projects)
cp file-save.md ~/.kiro/hooks/aws-waf-file-save.md

# Workspace-level (current project only)
cp file-save.md .kiro/hooks/aws-waf-file-save.md
```

### 2. Pre-Deployment Hook (`pre-deployment.md`)

**Triggers**: Before deployment commands execute (terraform apply, cdk deploy)

**Action**: Comprehensive review before infrastructure changes are deployed

**Best for**: Production deployments, preventing security breaches, cost control

**Installation**:
```bash
# User-level (all projects)
cp pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md

# Workspace-level (current project only)
cp pre-deployment.md .kiro/hooks/aws-waf-pre-deployment.md
```



### 3. Post-Generation Hook (`post-generation.md`)

**Triggers**: After Kiro generates infrastructure code

**Action**: Reviews AI-generated code to ensure Well-Architected best practices

**Best for**: AI-assisted development, ensuring generated code is production-ready

**Installation**:
```bash
# User-level (all projects)
cp post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md

# Workspace-level (current project only)
cp post-generation.md .kiro/hooks/aws-waf-post-generation.md
```

## Installation Guide

### Installation Levels

**User-Level** (`~/.kiro/hooks/`): Applies to all projects on your system
- Use when you want consistent reviews across all AWS projects
- Personal development standards

**Workspace-Level** (`.kiro/hooks/`): Applies only to current project
- Use for project-specific review standards
- Team collaboration (can be committed to git)
- Different requirements per project

### Quick Start

```bash
# Install all three hooks at user level
cp file-save.md ~/.kiro/hooks/aws-waf-file-save.md
cp pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
cp post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md

# Or install at workspace level for team sharing
mkdir -p .kiro/hooks
cp file-save.md .kiro/hooks/aws-waf-file-save.md
cp pre-deployment.md .kiro/hooks/aws-waf-pre-deployment.md
cp post-generation.md .kiro/hooks/aws-waf-post-generation.md
```

### Verification

After installation:

1. **File-Save Hook**: Open a `.tf` or `.yaml` file, make a change, save → should see automatic review
2. **Pre-Deployment Hook**: Run `terraform apply` → should see review before execution
3. **Post-Generation Hook**: Ask Kiro to generate infrastructure code → should see review after generation

## Customization Examples

Each hook can be customized by editing the JSON configuration in the `.md` file.

### Customize File Patterns

```json
// Default: All IaC files
"filePatterns": "*.tf,*.tfvars,*.yaml,*.yml,*.json"

// Only Terraform
"filePatterns": "*.tf,*.tfvars"

// Specific files only
"filePatterns": "main.tf,infrastructure.yaml"
```



### Customize Review Focus

**Security-Focused**:
```json
"outputPrompt": "Review for Security Pillar compliance. Focus on encryption, IAM policies, network security, and data protection."
```

**Cost-Focused**:
```json
"outputPrompt": "Review for Cost Optimization. Check instance sizing, auto-scaling, storage classes, and resource utilization."
```

**Production-Ready**:
```json
"outputPrompt": "Review for production readiness. Focus on Security and Reliability. Ensure encryption, multi-AZ, backups, and monitoring are configured."
```

### Customize Review Depth

**Quick Review**:
```json
"outputPrompt": "Quick review: Top 3 critical issues only. Keep feedback concise."
```

**Comprehensive Review**:
```json
"outputPrompt": "Comprehensive review covering all six pillars. Identify all issues regardless of severity with detailed remediation guidance."
```

**Learning Mode**:
```json
"outputPrompt": "Educational review: For each issue, explain what's wrong, why it matters, what could go wrong, and how to fix it with examples."
```

### Environment-Specific

**Development**:
```json
"outputPrompt": "Review for DEVELOPMENT environment. Security and reliability can be relaxed. Focus on cost optimization."
```

**Production**:
```json
"outputPrompt": "Review for PRODUCTION environment. Apply strict standards. Flag any security misconfiguration or single point of failure as high priority."
```

## When to Use Each Hook

| Scenario | File-Save | Pre-Deployment | Post-Generation |
|----------|-----------|----------------|-----------------|
| Active IaC development | ✅ Recommended | Optional | Not needed |
| AI-assisted development | ✅ Recommended | ✅ Recommended | ✅ **Essential** |
| Production deployments | Optional | ✅ **Essential** | Optional |
| Learning AWS | ✅ **Essential** | ✅ Recommended | ✅ Recommended |
| Team collaboration | ✅ Recommended | ✅ Recommended | ✅ Recommended |
| Cost-sensitive projects | ✅ Recommended | ✅ **Essential** | ✅ Recommended |
| Compliance requirements | ✅ Recommended | ✅ **Essential** | ✅ Recommended |

### When to Disable Hooks

**File-Save Hook** - Disable when:
- Making rapid experimental changes
- Refactoring code (many saves in quick succession)
- Very experienced and prefer manual reviews

**Pre-Deployment Hook** - Disable when:
- Deploying to personal development environments
- Making emergency hotfixes (time-critical)
- You've already done thorough manual review

**Post-Generation Hook** - Disable when:
- Not using AI to generate infrastructure code
- Generating non-infrastructure code



## Troubleshooting

### Hook Not Triggering

**Symptoms**: You save a file or run a command, but no review happens.

**Solutions**:
1. Verify hook file is in correct location (`~/.kiro/hooks/` or `.kiro/hooks/`)
2. Check file extension matches `filePatterns` (e.g., `.tf`, `.yaml`)
3. Ensure hook is enabled (file name doesn't end in `.disabled`)
4. Restart Kiro to load new hooks
5. Check Kiro logs for errors

**Debugging**:
```bash
# Verify hook file exists
ls -la ~/.kiro/hooks/aws-waf-*.md
ls -la .kiro/hooks/aws-waf-*.md

# Check file permissions
chmod 644 ~/.kiro/hooks/aws-waf-*.md
```

### Hook Triggering Too Often

**Symptoms**: Hook triggers on every save or for unwanted files.

**Solutions**:
1. Narrow file patterns: `"filePatterns": "main.tf,variables.tf"`
2. Disable auto-save or increase auto-save interval
3. Remove duplicate hooks (check both user and workspace level)
4. Add file type checks in prompt

### Reviews Are Too Slow

**Symptoms**: Hook reviews take too long, disrupting workflow.

**Solutions**:
1. Use quick review mode (high-priority issues only)
2. Focus on 1-2 critical pillars instead of all six
3. Check MCP server configuration and network
4. Reduce review frequency with specific file patterns

**Optimization**:
```json
// Quick mode
"outputPrompt": "Quick review: Check only critical security and high-risk reliability issues. Top 3 issues only."

// Focus pillars
"outputPrompt": "Review Security and Reliability only. Skip other pillars."
```

### Too Many False Positives

**Symptoms**: Hook flags issues that aren't actually problems.

**Solutions**:
1. Add context to prompt about your specific requirements
2. Use environment-specific configuration (dev vs. production)
3. Document intentional exceptions in code comments
4. Adjust risk thresholds

**Example**:
```json
"outputPrompt": "Review for DEVELOPMENT environment. Single-AZ and smaller instances are acceptable. Focus on security issues only."
```

### Hook Blocks Legitimate Deployments

**Symptoms**: Pre-deployment hook prevents deployments that should be allowed.

**Solutions**:
1. Adjust to block only on critical/high-risk issues
2. Document exceptions and adjust prompt
3. Temporarily disable hook for emergency deployments

**Balanced Mode**:
```json
"outputPrompt": "Block deployment only if CRITICAL issues found. High-risk issues can proceed with acknowledgment."
```

**Temporary Disable**:
```bash
mv ~/.kiro/hooks/aws-waf-pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md.disabled
# Run deployment
mv ~/.kiro/hooks/aws-waf-pre-deployment.md.disabled ~/.kiro/hooks/aws-waf-pre-deployment.md
```



### Reviews Miss Important Issues

**Symptoms**: Hook doesn't catch issues you expected.

**Solutions**:
1. Use comprehensive review mode
2. Ensure AWS MCP servers are properly configured
3. Review all six pillars instead of subset
4. Verify file is recognized as IaC

**Comprehensive Mode**:
```json
"outputPrompt": "Comprehensive review covering ALL six pillars. Identify ALL issues regardless of severity."
```

### Hook Configuration Errors

**Symptoms**: Hook file exists but Kiro reports errors.

**Solutions**:
1. Validate JSON syntax in configuration block
2. Ensure all required fields present (id, name, eventType, hookAction)
3. Use valid event types (fileEdited, preToolUse, postToolUse)
4. Check Kiro logs for specific error messages

## Best Practices

### Development Workflow

1. **Start Small**: Install file-save hook first, get comfortable, then add others
2. **Customize for Context**: Adjust hooks based on environment (dev vs. production)
3. **Review Immediately**: Address hook feedback right away while context is fresh
4. **Learn Patterns**: Pay attention to recurring issues and learn to avoid them
5. **Document Exceptions**: If you intentionally violate a best practice, document why
6. **Share with Team**: Use workspace-level hooks for consistent team standards
7. **Combine with Manual Reviews**: Hooks complement but don't replace human judgment

### Hook Configuration

1. **Be Specific**: Narrow file patterns to reduce false triggers
2. **Focus on Critical**: Prioritize security and reliability over nice-to-haves
3. **Keep Prompts Concise**: Shorter prompts = faster reviews
4. **Version Control**: Commit workspace-level hooks to git for team sharing
5. **Test Before Deploying**: Test hook configuration in development first
6. **Regular Review**: Periodically review and update hook configurations

### Team Collaboration

1. **Standardize Hooks**: Use same hooks across team for consistency
2. **Workspace-Level for Teams**: Install at workspace level and commit to git
3. **Document Standards**: Explain team's Well-Architected standards and exceptions
4. **Onboarding Tool**: Use hooks to educate new team members
5. **Continuous Improvement**: Refine hooks based on what issues they catch

## Integration with Development Workflow

### Recommended Workflow

```
1. CODE GENERATION (AI-Assisted)
   Ask Kiro: "Create Terraform for S3 bucket"
   ↓
   🔍 POST-GENERATION HOOK → Reviews generated code
   ↓

2. CODE DEVELOPMENT (Manual Editing)
   Edit and save main.tf
   ↓
   🔍 FILE-SAVE HOOK → Reviews your changes
   ↓

3. DEPLOYMENT (Production)
   Run: terraform apply
   ↓
   🔍 PRE-DEPLOYMENT HOOK → Final safety check
   ↓
   Infrastructure created in AWS
```

### With Version Control

```bash
# Workspace-level hooks can be committed to git
git add .kiro/hooks/
git commit -m "Add Well-Architected review hooks"
git push

# Team members get hooks automatically
git pull
```



## Configuration Examples

### Example 1: Security-Focused Team

```bash
# File-save hook - security focus
cat > .kiro/hooks/aws-waf-file-save.md << 'EOF'
{
  "id": "aws-waf-security-save",
  "name": "Security Review on Save",
  "eventType": "fileEdited",
  "filePatterns": "*.tf,*.yaml,*.json",
  "hookAction": "askAgent",
  "outputPrompt": "Review for Security Pillar compliance. Verify: 1) Encryption at rest and in transit, 2) IAM follows least privilege, 3) No hardcoded credentials, 4) Security groups properly configured, 5) No public access unless required."
}
EOF

# Pre-deployment hook - strict security gate
cat > .kiro/hooks/aws-waf-pre-deployment.md << 'EOF'
{
  "id": "aws-waf-security-deploy",
  "name": "Security Gate Before Deployment",
  "eventType": "preToolUse",
  "toolTypes": "shell",
  "hookAction": "askAgent",
  "outputPrompt": "SECURITY GATE: Block deployment if ANY security issues found. Check encryption, IAM policies, network security, and data protection. Provide pass/fail for each requirement."
}
EOF
```

### Example 2: Cost-Conscious Startup

```bash
# File-save hook - cost focus
cat > .kiro/hooks/aws-waf-file-save.md << 'EOF'
{
  "id": "aws-waf-cost-save",
  "name": "Cost Review on Save",
  "eventType": "fileEdited",
  "filePatterns": "*.tf,*.yaml",
  "hookAction": "askAgent",
  "outputPrompt": "Review for cost optimization. Flag: 1) Oversized instances, 2) Missing auto-scaling, 3) Expensive storage classes, 4) Unnecessary resources. Also check critical security issues."
}
EOF
```

### Example 3: Learning Environment

```bash
# File-save hook - educational
cat > .kiro/hooks/aws-waf-file-save.md << 'EOF'
{
  "id": "aws-waf-learning-save",
  "name": "Educational Review on Save",
  "eventType": "fileEdited",
  "filePatterns": "*.tf,*.yaml",
  "hookAction": "askAgent",
  "outputPrompt": "LEARNING MODE: For each issue found, explain: 1) What's wrong, 2) Why it matters, 3) What could go wrong, 4) How to fix it with code example. Focus on Security and Reliability."
}
EOF
```

## Frequently Asked Questions

**Q: Are hooks required to use the AWS Well-Architected Power?**
A: No, hooks are completely optional. You can use the power manually by asking Kiro for reviews.

**Q: Can I use some hooks but not others?**
A: Yes! Install only the hooks that fit your workflow.

**Q: Will hooks slow down my development?**
A: Reviews typically take 1-5 seconds. You can customize for faster "quick reviews" or disable temporarily.

**Q: What's the difference between user-level and workspace-level?**
A: User-level applies to all your projects. Workspace-level applies only to current project and can be shared via git.

**Q: Can I customize the review criteria?**
A: Yes! Edit the `outputPrompt` field to focus on specific pillars, adjust depth, or change standards.

**Q: Can I temporarily disable a hook?**
A: Yes! Rename the hook file (add `.disabled` extension) or move it out of the hooks directory.

**Q: Do hooks work with all IaC tools?**
A: Yes! Hooks work with Terraform, CloudFormation, CDK, Pulumi, and any other IaC tool that creates text files.



## Related Resources

### Hook Template Files
- **file-save.md**: Complete documentation and configuration for file-save hook
- **pre-deployment.md**: Complete documentation and configuration for pre-deployment hook
- **post-generation.md**: Complete documentation and configuration for post-generation hook

### Power Documentation
- **../POWER.md**: Main power documentation with overview and usage
- **../mcp.json**: MCP server configuration for AWS integrations

### Pillar-Specific Guidance
- **../steering/security.md**: Security Pillar best practices
- **../steering/reliability.md**: Reliability Pillar best practices
- **../steering/performance.md**: Performance Efficiency best practices
- **../steering/cost-optimization.md**: Cost Optimization best practices
- **../steering/operational-excellence.md**: Operational Excellence best practices
- **../steering/sustainability.md**: Sustainability Pillar best practices

### Workflow Guidance
- **../steering/proactive-review-guidance.md**: How Kiro recognizes review opportunities
- **../steering/code-generation-guidance.md**: How to generate Well-Architected infrastructure code

### External Resources
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
- **AWS Well-Architected Tool**: https://aws.amazon.com/well-architected-tool/
- **AWS Architecture Center**: https://aws.amazon.com/architecture/
- **AWS Security Best Practices**: https://aws.amazon.com/security/best-practices/

## Support

For issues or questions:
1. Check this README for troubleshooting steps
2. Review the specific hook's `.md` file for detailed information
3. Check main power documentation (`../POWER.md`)
4. Review Kiro documentation for hook system details
5. Open an issue in the power repository

## Quick Reference

### Installation Commands

```bash
# User-level (all projects)
cp file-save.md ~/.kiro/hooks/aws-waf-file-save.md
cp pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
cp post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md

# Workspace-level (current project)
cp file-save.md .kiro/hooks/aws-waf-file-save.md
cp pre-deployment.md .kiro/hooks/aws-waf-pre-deployment.md
cp post-generation.md .kiro/hooks/aws-waf-post-generation.md
```

### Disable/Enable Commands

```bash
# Disable hook
mv ~/.kiro/hooks/aws-waf-file-save.md ~/.kiro/hooks/aws-waf-file-save.md.disabled

# Enable hook
mv ~/.kiro/hooks/aws-waf-file-save.md.disabled ~/.kiro/hooks/aws-waf-file-save.md
```

### Common Customizations

```json
// Quick review
"outputPrompt": "Quick review: Top 3 critical issues only."

// Security focus
"outputPrompt": "Review for Security Pillar compliance only."

// Cost focus
"outputPrompt": "Review for Cost Optimization opportunities."

// Learning mode
"outputPrompt": "Educational review: Explain each issue in detail."

// Production strict
"outputPrompt": "Production review: Block on any high/critical issues."
```

---

**Version**: 1.0.0  
**Last Updated**: 2024

For questions, issues, or contributions, please visit the power repository.

