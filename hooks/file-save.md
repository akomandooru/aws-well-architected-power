# File-Save Hook — AWS Well-Architected Review

Automatically reviews IaC files against Well-Architected best practices when saved.

## Hook Configuration

```json
{
  "id": "aws-waf-file-save",
  "name": "AWS Well-Architected Review on File Save",
  "description": "Reviews IaC files against AWS Well-Architected best practices when saved",
  "eventType": "fileEdited",
  "filePatterns": "*.tf,*.tfvars,*.yaml,*.yml,*.json",
  "hookAction": "askAgent",
  "outputPrompt": "Review this Infrastructure as Code file against AWS Well-Architected Framework best practices. Focus on:\n1. Security: Encryption, IAM, network security, data protection\n2. Reliability: Multi-AZ, backups, fault tolerance\n3. Performance: Resource sizing, caching, monitoring\n4. Cost: Right-sizing, auto-scaling, resource utilization\n5. Operational Excellence: Logging, monitoring, automation\n6. Sustainability: Energy efficiency, resource optimization\n\nProvide specific recommendations with line numbers. Prioritize high-risk issues."
}
```

## Installation

Copy the JSON configuration block above into a `.kiro.hook` file:

```bash
# User-level (all projects)
~/.kiro/hooks/aws-waf-file-save.kiro.hook

# Workspace-level (current project only)
.kiro/hooks/aws-waf-file-save.kiro.hook
```

> **Note:** The file must use the `.kiro.hook` extension to be recognized by Kiro.

## Customization

Modify `filePatterns` to narrow scope:
```json
"filePatterns": "*.tf,*.tfvars"          // Terraform only
"filePatterns": "*.yaml,*.yml"           // CloudFormation only
"filePatterns": "main.tf,variables.tf"   // Specific files
```

Modify `outputPrompt` to change focus:
```json
// Security only
"outputPrompt": "Review for Security Pillar compliance: encryption, IAM least privilege, network security."

// Quick check (high-priority only)
"outputPrompt": "Quick Well-Architected review: high-risk security and reliability issues only. Keep concise."
```
