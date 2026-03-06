# Pre-Deployment Hook — AWS Well-Architected Review

Performs a Well-Architected review before `terraform apply` or `cdk deploy` executes.

## Hook Configuration

```json
{
  "id": "aws-waf-pre-deployment",
  "name": "AWS Well-Architected Review Before Deployment",
  "description": "Reviews infrastructure before terraform apply or cdk deploy",
  "eventType": "preToolUse",
  "toolTypes": "shell",
  "hookAction": "askAgent",
  "outputPrompt": "A deployment command is about to execute. Perform a Well-Architected review:\n\nCRITICAL (must pass):\n1. Security: No hardcoded credentials, encryption enabled, IAM least privilege\n2. Reliability: Multi-AZ where appropriate, backups configured\n\nIMPORTANT:\n3. Performance: Appropriate resource sizing, monitoring enabled\n4. Cost: Right-sizing, auto-scaling, no unnecessary resources\n5. Operational Excellence: Logging, monitoring, automation\n6. Sustainability: Resource efficiency\n\nAnalyze all IaC files in context. Start with '✅ Safe to deploy' or '⚠️ Issues found'.\nList critical/high issues first with file names, line numbers, and fixes.\nEnd with clear recommendation: proceed, fix first, or needs manual review."
}
```

## Installation

Copy the JSON configuration block above into a `.kiro.hook` file:

```bash
# User-level (all projects)
~/.kiro/hooks/aws-waf-pre-deployment.kiro.hook

# Workspace-level (current project only)
.kiro/hooks/aws-waf-pre-deployment.kiro.hook
```

> **Note:** The file must use the `.kiro.hook` extension to be recognized by Kiro.

## When It Triggers

Activates before shell commands containing `terraform apply`, `cdk deploy`, or similar deployment commands. Pauses deployment to perform the review, then lets you decide whether to proceed.
