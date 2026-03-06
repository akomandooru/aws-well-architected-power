# AWS Well-Architected Framework Review Power

> Context-aware architecture reviews with trade-off analysis. Choose your depth — quick checks, balanced reviews, or comprehensive analysis.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-org/aws-well-architected-power)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Kiro Power](https://img.shields.io/badge/Kiro-Power-purple.svg)](https://kiro.ai)

## The Problem This Solves

Your AI code reviewer is smart, but it's not an AWS architect. It might catch bugs, but it can miss critical architecture gaps that could cost you:

- Security vulnerabilities that pass code review (like missing HTTPS enforcement on SNS topics)
- Reliability issues that only surface in production (single-AZ databases with 99.9% SLA requirements)
- Cost inefficiencies that compound over time ($180/year per misconfigured resource)

This power gives your AI reviewer an AWS Well-Architected checklist, so it catches what generic reviews miss.

## What You Get

**Without this power:** Generic code review that might miss AWS-specific architecture issues

**With this power:**
- Catches security gaps like missing encryption or overly permissive IAM policies
- Identifies reliability risks like single-AZ deployments in production
- Spots cost optimization opportunities (right-sizing, lifecycle policies)
- Explains trade-offs with actual numbers ("Multi-AZ costs $60/month more but prevents $7K/month in downtime")

**Speed:** Seconds per review depending on depth needed

### Key Capabilities

- 🎯 **Context-Aware Trade-Offs**: Understand what you gain and give up with quantitative data
- ⚡ **Automatic Review Depth**: Fast checks for CI/CD, balanced reviews for production, comprehensive analysis for major decisions
- 📋 **IaC Analysis**: Scan Terraform, CloudFormation, and CDK files with line-level feedback
- 💻 **Application Code Analysis**: Analyze Python, Java, TypeScript, Go, C#, and Ruby code
- 🔄 **Multi-Layer Analysis**: Review infrastructure and application code together
- 📊 **Decision Matrices**: Compare architecture options with cost-benefit analysis
- 🤖 **Optional Automation**: Pre-configured hooks for continuous compliance

## Installation

### Install the Power

**From Git URL** (recommended):

1. In Kiro: Command Palette → "Powers: Configure"
2. Click "Add Custom Power" → "Import from URL"
3. Enter: `https://github.com/your-org/aws-well-architected-power`

**From Local Folder** (for development/testing):

1. Clone: `git clone https://github.com/your-org/aws-well-architected-power.git`
2. In Kiro: Command Palette → "Powers: Configure"
3. Click "Add Custom Power" → "Import from folder"
4. Select the `aws-well-architected-power` folder

### Verify Installation

Restart Kiro and ask:

```
"List available powers"
```

You should see "aws-well-architected-power" in the list. Try it:

```
"Review my infrastructure against AWS Well-Architected best practices"
```

### Run the Validation Suite (Requires Repo Clone)

The validation hook and example files are not included when installing via Kiro — they're only available in the cloned repo.

1. Clone: `git clone https://github.com/your-org/aws-well-architected-power.git`
2. Open the cloned repo folder in Kiro as your workspace
3. Install the power via Command Palette → "Powers: Configure"
4. Copy `hooks/validate-examples.md` JSON config into a `.kiro.hook` file in `.kiro/hooks/` (must be workspace-level since it references files in this repo)
5. Open the Agent Hooks panel and click the trigger button next to "Validate Well-Architected Examples"

The hook reviews all 6 example `-issues` files (Terraform, CloudFormation, CDK, Python, Java, TypeScript) and reports which expected findings were detected. See [examples/test-manifest.json](examples/test-manifest.json) for the test cases.

### MCP Servers (Optional)

The power works fully without MCP servers. Enabling them adds automated security assessments and real-time AWS documentation access.

To enable:
1. Click "Open powers config" in the power's MCP Configuration section
2. Set `"disabled": false` for the servers you want to enable
3. Restart Kiro

Requires `uv` — see [uv installation](https://docs.astral.sh/uv/getting-started/installation/).

## Usage

### Quick Review (Simple Mode)

```
You: "Quick review of this Lambda configuration"

Kiro: ❌ HIGH RISK: Hardcoded API key in environment variables
      ⚠️ MEDIUM RISK: Missing timeout configuration
      [3.2 seconds, prescriptive fixes, no context questions]
```

### Production Review (Context-Aware Mode)

```
You: "Review this production database configuration"

Kiro: I notice this is a production database. Let me gather context...
      - What's your availability requirement?
      - What's your budget constraint?
      - What type of data?

      ❌ HIGH RISK: Single-AZ RDS in production
      FOR your requirements (99.9% SLA, customer PII):
        Multi-AZ is REQUIRED
      Trade-Off: +$73/month for automatic failover (99% → 99.95%)
      [6.1 seconds, context-aware recommendations]
```

### Architecture Decision (Full Analysis Mode)

```
You: "Full analysis of caching options for our API"

Kiro: 📊 DECISION MATRIX: Caching Architecture Options

      | Option | Reliability | Performance | Cost/Month |
      |--------|------------|-------------|------------|
      | Single Node | ⭐⭐ | ⭐⭐⭐ | $15 |
      | Redis Cluster | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 |
      | Cluster + Replicas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 |

      Net benefit: $6,922/month | ROI: 2,005%
      [8.7 seconds, decision matrices + cost-benefit]
```

### Other Things You Can Do

```bash
# Analyze IaC files
"Review my Terraform configuration for Well-Architected compliance"

# Analyze application code
"Review my Python Lambda function for reliability and performance issues"

# Multi-layer analysis
"Review my CDK infrastructure and TypeScript Lambda code together"

# Generate Well-Architected code
"Generate a Terraform configuration for an S3 bucket following best practices"

# Learn best practices
"Explain Security Pillar best practices for S3"

# Generate reports
"Generate a review report in Markdown format"
```

## Features

### Multi-Pillar Coverage

| Pillar | Focus Areas |
|--------|-------------|
| **Operational Excellence** | Monitoring, logging, automation |
| **Security** | Encryption, IAM, compliance |
| **Reliability** | Fault tolerance, backups, multi-AZ |
| **Performance Efficiency** | Instance sizing, caching, optimization |
| **Cost Optimization** | Right-sizing, auto-scaling, lifecycle |
| **Sustainability** | Energy efficiency, resource optimization |

### IaC Analysis

| Format | File Types |
|--------|-----------|
| **Terraform** | `*.tf`, `*.tfvars` |
| **CloudFormation** | `*.yaml`, `*.json` |
| **CDK** | `*.ts`, `*.js`, `cdk.json` |

### Application Code Analysis

| Language | File Types |
|----------|-----------|
| **Python** | `*.py` — boto3 patterns, error handling, retry logic, secrets management |
| **Java** | `*.java` — AWS SDK v2, async clients, connection management |
| **TypeScript/Node.js** | `*.ts`, `*.js` — AWS SDK v3, async/await patterns |
| **Go** | `*.go` — Context usage, error handling, goroutines |
| **C#** | `*.cs` — Async/await, disposal, AWS SDK for .NET |
| **Ruby** | `*.rb` — AWS SDK patterns, resource management |

### Context-Aware Trade-Off Guidance

The power gathers context before recommending:

- **Environment Type**: Development, staging, production
- **Availability Requirements**: SLA targets, RTO/RPO
- **Budget Constraints**: Monthly budget, cost sensitivity
- **Data Classification**: Public, internal, confidential, restricted
- **Compliance Requirements**: GDPR, HIPAA, PCI-DSS, SOC 2

Then provides trade-off analysis with specific numbers:

```
FOR production with 99.9% SLA: Multi-AZ is REQUIRED
  Cost: +$60/month | Availability: 99% → 99.95% | Recovery: 60-120 seconds

FOR development: Single-AZ is ACCEPTABLE
  Savings: $60/month | Trade-off: Manual recovery (15-30 minutes)
```

See [examples/decision-matrices.md](examples/decision-matrices.md) and [examples/trade-off-scenarios.md](examples/trade-off-scenarios.md) for comprehensive guidance.

## Review Modes

The power automatically selects the right mode, or you can request one explicitly:

| Mode | Speed | Best For | Trigger |
|------|-------|----------|---------|
| **Simple** | Fastest | CI/CD, quick checks, dev workflow | "quick review", dev files, CI/CD |
| **Context-Aware** | Moderate | Production reviews, interactive sessions | prod files, interactive |
| **Full Analysis** | Most thorough | Major architecture decisions | "full analysis", explicit request |

```bash
"Quick review of this Lambda config"          # → Simple Mode
"Review this production database"             # → Context-Aware Mode
"Full analysis of caching options"            # → Full Analysis Mode
```

See [steering/review-mode-selection.md](steering/review-mode-selection.md) for details.

## Optional: Automation Hooks (Requires Repo Clone)

Pre-configured hooks for continuous compliance. These are only available in the cloned repo, not when installing the power via Kiro.

| Hook | Trigger | Use Case |
|------|---------|----------|
| **File-Save** | When IaC files are saved | Immediate feedback during development |
| **Pre-Deployment** | Before `terraform apply`, `cdk deploy` | Final validation before changes |
| **Post-Generation** | After Kiro generates code | Ensure AI-generated code is production-ready |
| **Validate Examples** | Manual trigger | Verify the power catches expected issues across all 6 example files |

Install by copying the JSON config from the repo's `hooks/` directory into a `.kiro.hook` file:
- `.kiro/hooks/` — workspace-level (this project only)
- `~/.kiro/hooks/` — user-level (all projects)

The validate-examples hook must be workspace-level since it references example files in this repo.

See [hooks/README.md](hooks/README.md) for details.

## Troubleshooting

**Power not found:** Verify `POWER.md` exists in the power directory. Restart Kiro.

**MCP servers not available:** The power works without them. To enable, check your MCP config and ensure `uv` is installed. See [MCP Servers](#mcp-servers-optional) above.

**No issues found:** Your code may already follow best practices. Try the example files to verify: `"Review the file examples/terraform/security-issues.tf"`

**Wrong review mode:** Use explicit keywords — "quick review" for Simple, "full analysis" for Full Analysis. The power auto-detects based on file paths and context.

## Examples (Requires Repo Clone)

The `examples/` directory is only available in the cloned repo. It includes:

- **Terraform** (`examples/terraform/`) — Security issues and fixes
- **CloudFormation** (`examples/cloudformation/`) — Reliability issues and fixes
- **CDK** (`examples/cdk/`) — Cost optimization issues and fixes
- **Application Code** (`examples/application-code/`) — Python, Java, TypeScript issues and fixes
- **Decision Matrices** (`examples/decision-matrices.md`) — Multi-AZ, encryption, caching, DR options
- **Trade-Off Scenarios** (`examples/trade-off-scenarios.md`) — Startup MVP to enterprise production
- **Review Workflows** (`examples/reviews/`) — Complete review sessions and reports

## Learn More

- [POWER.md](POWER.md) — Complete power documentation
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Well-Architected Labs](https://wellarchitectedlabs.com/)

---

**Ready to build better AWS infrastructure?** Install the power and start your first review in under 3 minutes! 🚀
