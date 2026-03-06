---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/cdk.json,**/architecture.md,**/ARCHITECTURE.md,**/ADR-*.md"
---

# Proactive Review Guidance

## Purpose

Recognize opportunities to suggest Well-Architected reviews during development. Be helpful, not intrusive.

## File Pattern Recognition

### Infrastructure as Code
| Format | Patterns | Key Indicators |
|---|---|---|
| Terraform | `*.tf`, `*.tfvars` | `resource "aws_*"`, `provider "aws"` |
| CloudFormation | `*.yaml`, `*.yml`, `*.json` | `AWSTemplateFormatVersion`, `Type: AWS::*` |
| CDK | `cdk.json`, `lib/*.ts` | `import * as cdk from 'aws-cdk-lib'`, extends `Stack` |

### Application Code with AWS SDK
| Language | Indicators |
|---|---|
| Python | `import boto3`, `boto3.client(`, `boto3.resource(` |
| TypeScript/JS | `@aws-sdk/*`, `new S3Client(` |
| Java | `software.amazon.awssdk.*` |
| Go | `github.com/aws/aws-sdk-go-v2` |

### Architecture Documentation
- `architecture.md`, `ARCHITECTURE.md`, `ADR-*.md`
- Mentions of AWS services, scalability, security, reliability

## Context Inference from File Paths

| Path Pattern | Inferred Environment | Recommendation Adjustments |
|---|---|---|
| `dev/`, `development/` | Development | Cost-focused, simpler configs |
| `staging/`, `stg/`, `qa/` | Staging | Production-like recommendations |
| `prod/`, `production/` | Production | Full reliability + security |
| `modules/` | Reusable | Ask about target environment |

## When to Suggest Reviews

**Good moments:**
- After user creates or significantly modifies IaC files
- When user asks about AWS architecture decisions
- Before deployment commands (`terraform apply`, `cdk deploy`)
- When reviewing PR with infrastructure changes

**Bad moments:**
- During active coding (wait for a pause)
- After user already declined a review
- For minor changes (variable rename, comment update)

## Suggestion Format

Keep it brief and value-focused:

```
"I notice you're working on [resource type]. Want me to run a quick
Well-Architected check? It takes about 3 seconds and can catch
common issues like [relevant example for this resource type]."
```

For production files:
```
"This looks like production infrastructure. A context-aware review
(~6 seconds) can check for reliability and security patterns
specific to your SLA and data requirements."
```
