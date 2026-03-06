# Post-Generation Hook — AWS Well-Architected Review

Automatically reviews AI-generated infrastructure code against Well-Architected best practices.

## Hook Configuration

```json
{
  "id": "aws-waf-post-generation",
  "name": "AWS Well-Architected Review After Code Generation",
  "description": "Reviews AI-generated infrastructure code against AWS Well-Architected best practices",
  "eventType": "postToolUse",
  "toolTypes": "write",
  "hookAction": "askAgent",
  "outputPrompt": "Infrastructure code was just generated. Perform an AWS Well-Architected review:\n\n1. Security: Encryption, IAM least privilege, no hardcoded credentials\n2. Reliability: Multi-AZ where appropriate, backups, fault tolerance\n3. Performance: Resource sizing, caching, monitoring\n4. Cost: Right-sizing, auto-scaling, efficient resources\n5. Operational Excellence: Logging, monitoring, automation\n6. Sustainability: Energy-efficient configurations\n\nCheck for common AI generation issues: over-provisioning, missing security, incomplete configs.\nStart with '✅ Follows best practices' or '⚠️ Needs improvements'.\nList issues with file names, line numbers, and fixes. Prioritize by risk."
}
```

## Installation

Copy the JSON configuration block above into a `.kiro.hook` file:

```bash
# User-level (all projects)
~/.kiro/hooks/aws-waf-post-generation.kiro.hook

# Workspace-level (current project only)
.kiro/hooks/aws-waf-post-generation.kiro.hook
```

> **Note:** The file must use the `.kiro.hook` extension to be recognized by Kiro.

## When It Triggers

Activates after Kiro writes infrastructure code (*.tf, *.yaml, *.json, *.ts, *.py) — whether creating new files, generating from templates, or expanding patterns.
