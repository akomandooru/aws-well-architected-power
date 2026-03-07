---
name: aws-well-architected-power
displayName: AWS Well-Architected Review
description: Context-aware architecture reviews with trade-off analysis. Choose your depth — quick checks, balanced reviews, or comprehensive analysis. Analyzes IaC and application code across all six pillars with quantitative cost-benefit guidance.
keywords: aws, well-architected, security, reliability, performance, cost, operational excellence, sustainability, infrastructure, iac, terraform, cloudformation, cdk, architecture review, best practices, trade-offs, context-aware, mode selection
author: Anand Komandooru
---

# AWS Well-Architected Review Power

Continuous, context-aware Well-Architected reviews during development. Fast prescriptive guidance or comprehensive trade-off analysis — automatically adapted to your context.

## What This Power Does

- Reviews IaC (Terraform, CloudFormation, CDK) and application code (Python, Java, TypeScript, Go, C#, Ruby) against all six Well-Architected pillars
- Gathers context (environment, SLA, budget, data classification) before recommending
- Provides quantitative trade-offs: "$73/month for Multi-AZ, 99% → 99.95% availability"
- Three review modes: Simple, Context-Aware, Full Analysis — auto-detected
- Decision matrices for comparing architecture options
- Complete code examples for every recommendation

## Review Modes

| Mode | Speed | Best For | Trigger |
|------|-------|----------|---------|
| Simple | Fastest | CI/CD, quick checks, dev | "quick review", dev files, CI=true |
| Context-Aware | Moderate | Production reviews, interactive | prod files, interactive sessions |
| Full Analysis | Most thorough | Major architecture decisions | "full analysis", explicit request |

Auto-detection priority: explicit user request > CI/CD environment > file path > session type.
Modes can escalate mid-session (Simple → Context-Aware → Full Analysis) with context preserved.

See `steering/review-mode-selection.md` for details.

## MCP Server Integration

Two optional MCP servers enhance the power:

| Server | Purpose | Required? |
|--------|---------|-----------|
| Security Assessment | Automated security checks, GuardDuty/Security Hub monitoring, compliance validation | No |
| AWS Documentation | Real-time AWS docs, best practice guidance across all pillars | No |

The power works fully without MCP servers using steering file guidance. With servers enabled, you get automated assessments and live documentation access.

## Supported File Types

### Infrastructure as Code
| Format | Patterns |
|--------|----------|
| Terraform | `*.tf`, `*.tfvars` |
| CloudFormation | `*.yaml`, `*.yml`, `*.json` |
| CDK | `*.ts`, `*.js`, `cdk.json` |

### Application Code
| Language | Patterns | Focus Areas |
|----------|----------|-------------|
| Python | `*.py` | boto3 patterns, error handling, retry logic, secrets |
| Java | `*.java` | AWS SDK v2, async clients, connection management |
| TypeScript/JS | `*.ts`, `*.js` | AWS SDK v3, async/await patterns |
| Go | `*.go` | Context usage, error handling, goroutines |
| C# | `*.cs` | Async/await, disposal, AWS SDK for .NET |
| Ruby | `*.rb` | AWS SDK patterns, resource management |

## Context-Aware Guidance

Before recommending, the power gathers:
1. Environment type (dev/staging/prod)
2. Availability requirements (SLA, RTO, RPO)
3. Budget constraints
4. Data classification (public → restricted)
5. Compliance requirements (HIPAA, PCI-DSS, SOC 2, GDPR)

Then provides conditional recommendations:
```
FOR production with 99.9% SLA: Multi-AZ is REQUIRED
  Cost: +$73/month | Availability: 99% → 99.95%

FOR development: Single-AZ is ACCEPTABLE
  Savings: $73/month | Trade-off: Manual recovery (15-30 min)
```

See `steering/context-questions.md` and `steering/trade-off-guidance.md`.

## Available Steering Files

| File | Scope | Triggers On |
|------|-------|-------------|
| `security.md` | Security pillar checklist + patterns | IaC and application code files |
| `reliability.md` | Reliability pillar checklist + patterns | IaC and application code files |
| `performance.md` | Performance pillar checklist + patterns | IaC and application code files |
| `cost-optimization.md` | Cost pillar checklist + patterns | IaC and application code files |
| `operational-excellence.md` | Ops pillar checklist + patterns | IaC and application code files |
| `sustainability.md` | Sustainability pillar checklist + patterns | IaC and application code files |
| `context-questions.md` | Context gathering templates | IaC and application code files |
| `trade-off-guidance.md` | Trade-off analysis framework | IaC and application code files |
| `review-mode-selection.md` | Mode auto-detection rules | IaC and application code files |
| `proactive-review-guidance.md` | When to suggest reviews | Always |
| `code-generation-guidance.md` | Well-Architected code generation | IaC and application code files |

Only `proactive-review-guidance.md` (~50 lines) is always loaded — it enables Kiro to recognize review opportunities. All other files use conditional inclusion (`fileMatch`) and load when relevant code files enter context.

## Getting Started

1. Install the power via Kiro's Command Palette → "Powers: Configure"
2. Open any IaC or application code file
3. Ask: "Review this file against AWS Well-Architected best practices"

The power auto-selects review depth. Use "quick review" for fast checks or "full analysis" for comprehensive guidance.


## License and Support

This power integrates with two optional MCP servers from AWS Labs:

### AWS Well-Architected Security Assessment MCP Server
- **License**: Apache-2.0
- **Repository**: [awslabs/mcp](https://github.com/awslabs/mcp)
- **Privacy Policy**: [AWS Privacy Notice](https://aws.amazon.com/privacy/)
- **Support**: [GitHub Issues](https://github.com/awslabs/mcp/issues)

### AWS Documentation MCP Server
- **License**: Apache-2.0
- **Repository**: [awslabs/mcp](https://github.com/awslabs/mcp)
- **Privacy Policy**: [AWS Privacy Notice](https://aws.amazon.com/privacy/)
- **Support**: [GitHub Issues](https://github.com/awslabs/mcp/issues)

Both servers are part of the official AWS Labs MCP server collection and are optional — this power works fully without them using steering file guidance.
