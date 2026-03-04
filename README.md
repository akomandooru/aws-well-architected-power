# AWS Well-Architected Framework Review Power

> Context-aware architecture reviews with trade-off analysis. Choose your depth - quick checks (3s), balanced reviews (6s), or comprehensive analysis (9s).

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

**Speed:** 3-10 seconds per review depending on depth needed

## Try It in 60 Seconds (No Installation Required)

Want to see it in action first? Ask Kiro to review one of the example files:

**Infrastructure (Terraform):**
```
Review the file aws-well-architected-power/examples/terraform/security-issues.tf
```

**Application Code (Python):**
```
Review the file aws-well-architected-power/examples/application-code/python-lambda-issues.py
```

You'll see it catch security issues, missing error handling, hardcoded secrets, and more - with specific line numbers and fixes.

**Ready to use it on your own code?** See [Installation](#installation) below.

## Overview

The AWS Well-Architected Framework Review Power transforms how you build AWS infrastructure and applications by bringing context-aware architecture reviews directly into your development workflow. Get the right level of detail for your situation - from fast CI/CD checks to comprehensive trade-off analysis for major decisions.

### Key Capabilities

- 🎯 **Context-Aware Trade-Offs**: Understand what you gain and give up with quantitative data (cost, downtime, performance)
- ⚡ **Automatic Review Depth**: Fast checks (3s) for CI/CD, balanced reviews (6s) for production, comprehensive analysis (9s) for major decisions
- 📋 **IaC Analysis**: Scan Terraform, CloudFormation, and CDK files with line-level feedback
- 💻 **Application Code Analysis**: Analyze Python, Java, TypeScript, Go, C#, and Ruby code for Well-Architected patterns
- 🔄 **Multi-Layer Analysis**: Review infrastructure and application code together for comprehensive compliance
- 📊 **Decision Matrices**: Compare multiple architecture options with cost-benefit analysis
- 📚 **Learn Best Practices**: Access detailed explanations, examples, and anti-patterns
- 📈 **Generate Reports**: Create structured reports in Markdown, JSON, or HTML
- ⚡ **Smart Code Generation**: Generate infrastructure and application code with security, reliability, and efficiency built-in
- 🤖 **Optional Automation**: Enable automated reviews with pre-configured hooks

### Quick Start

```bash
# 1. Install from Git URL
# Command Palette → "Powers: Configure" → "Add Custom Power" → "Import from URL"
# Enter: https://github.com/your-org/aws-well-architected-power

# 2. Try it immediately
"Review my infrastructure against AWS Well-Architected best practices"

# 3. See results in seconds with specific line numbers and fixes
```

That's it. The power automatically selects the right review depth for your context.

## Features

### 🎯 Multi-Pillar Coverage

Comprehensive guidance across all six Well-Architected pillars:

| Pillar | Focus Areas | Key Benefits |
|--------|-------------|--------------|
| **Operational Excellence** | Monitoring, logging, automation | Improve operational procedures and incident response |
| **Security** | Encryption, IAM, compliance | Protect data and systems from threats |
| **Reliability** | Fault tolerance, backups, multi-AZ | Ensure workloads perform consistently |
| **Performance Efficiency** | Instance sizing, caching, optimization | Use resources efficiently as demand changes |
| **Cost Optimization** | Right-sizing, auto-scaling, lifecycle | Deliver value at the lowest price point |
| **Sustainability** | Energy efficiency, resource optimization | Minimize environmental impact |

### 🔌 MCP Server Integration

Seamless integration with AWS MCP servers for enhanced capabilities:

- **Well-Architected Security Assessment MCP Server**: Automated security checks and compliance validation
- **AWS Documentation MCP Server**: Real-time access to AWS documentation and best practices
- **Graceful Degradation**: Full functionality even when MCP servers are unavailable

### 📝 IaC Analysis

Comprehensive Infrastructure as Code analysis with actionable feedback:

| Format | File Types | Capabilities |
|--------|-----------|--------------|
| **Terraform** | `*.tf`, `*.tfvars` | Resource analysis, module validation, variable checking |
| **CloudFormation** | `*.yaml`, `*.json` | Template validation, resource compliance, parameter review |
| **CDK** | `*.ts`, `*.js`, `cdk.json` | Construct analysis, synthesized template review |

**What You Get:**
- Line-level issue identification with file names and line numbers
- Risk level classification (High, Medium, Low)
- Specific remediation steps with code examples
- Pillar classification for each issue
- Before/after comparisons

### 💻 Application Code Analysis

Comprehensive application code analysis across multiple programming languages:

| Language | File Types | Capabilities |
|----------|-----------|--------------|
| **Python** | `*.py` | boto3 patterns, error handling, retry logic, secrets management |
| **Java** | `*.java` | AWS SDK for Java v2, async clients, connection management |
| **TypeScript/Node.js** | `*.ts`, `*.js` | AWS SDK v3, promise-based patterns, async/await |
| **Go** | `*.go` | Context usage, error handling, goroutines |
| **C#** | `*.cs` | Async/await patterns, disposal, AWS SDK for .NET |
| **Ruby** | `*.rb` | AWS SDK patterns, resource management |

**Patterns Detected:**
- **Security**: Hardcoded secrets, input validation, authentication, authorization
- **Reliability**: Error handling, retry logic, timeouts, circuit breakers
- **Performance**: Caching, connection pooling, async operations, efficient queries
- **Cost Optimization**: Resource cleanup, memory management, efficient algorithms
- **Operational Excellence**: Structured logging, tracing, metrics, health checks

### 🎓 Learning Mode

Transform reviews into learning opportunities:

- **Detailed Explanations**: Understand the "why" behind each best practice
- **Real-World Examples**: See correct implementations in context
- **Anti-Patterns**: Learn what to avoid and why
- **Rationale**: Understand the reasoning with data and research
- **Documentation Links**: Direct access to official AWS resources
- **Interactive Quizzes**: Test your understanding

### 🎯 Context-Aware Trade-Off Guidance

Make informed architecture decisions based on your specific context:

**Context Gathering:**
- **Environment Type**: Development, staging, production, demo, test
- **Availability Requirements**: SLA targets, RTO/RPO, acceptable downtime
- **Budget Constraints**: Monthly budget, cost sensitivity, business priorities
- **Data Classification**: Public, internal, confidential, restricted (PII/PHI/financial)
- **Compliance Requirements**: GDPR, HIPAA, PCI-DSS, SOC 2, industry-specific

**Trade-Off Analysis:**
- **What You Gain**: Specific benefits with quantitative estimates
- **What You Give Up**: Specific costs and limitations
- **When to Choose**: Clear guidance based on your context
- **Cost Impact**: Actual dollar amounts and percentages
- **Business Rationale**: Why the trade-off makes sense for your situation

**Decision Matrices:**
- Multi-AZ vs. Single-AZ deployment (cost vs. availability)
- Encryption approaches (SSE-S3, SSE-KMS, client-side)
- Instance sizing (cost vs. performance)
- Caching strategies (ElastiCache, DAX, CloudFront, application-level)
- Disaster recovery options (backup, pilot light, warm standby, hot standby)
- Database choices (RDS, Aurora, DynamoDB)

**Common Scenarios:**
- **Startup MVP**: $110-150/month, rapid iteration, acceptable downtime
- **Enterprise Production**: $15k-30k/month, 99.99% SLA, compliance required
- **Prototype/POC**: $20-50/month, short-lived, minimal cost
- **Cost-Sensitive Production**: $2.5k-4k/month, balance cost and reliability
- **Performance-Critical**: $8k-18k/month, <100ms latency required
- **Regulated Industry**: $8k-30k/month, HIPAA/PCI-DSS compliance
- **Global Scale**: $25k-80k/month, multi-region, high availability
- **Internal Tools**: $500-2k/month, moderate availability, limited users

**Example Trade-Off Guidance:**

```
You: "Should I use Multi-AZ for my RDS database?"

Kiro: "To provide context-aware guidance, I need to understand your situation:
       - What environment is this for? (development/staging/production)
       - What's your availability requirement? (SLA target or acceptable downtime)
       - Do you have budget constraints?"

You: "Production with 99.9% SLA requirement"

Kiro: "For production with 99.9% SLA (8.76 hours downtime/year allowed):
      
      REQUIRED: Multi-AZ deployment
      
      TRADE-OFF ANALYSIS:
      - Cost Impact: +$60/month (2x cost: $60 → $120)
      - Availability: 99% → 99.95% (43x less downtime)
      - Recovery Time: 1-2 hours manual → 60-120 seconds automatic
      - Business Impact: Meet SLA commitment, avoid penalties
      
      RATIONALE: The $60/month cost is negligible compared to:
      - SLA penalty costs (typically 10-25% of monthly fees)
      - Revenue loss during outages ($1000s per hour for many businesses)
      - Customer trust and reputation damage
      
      RECOMMENDATION: Multi-AZ is NON-NEGOTIABLE for your context."
```

See [examples/decision-matrices.md](examples/decision-matrices.md) and [examples/trade-off-scenarios.md](examples/trade-off-scenarios.md) for comprehensive guidance.

### 🤖 Proactive Guidance

Kiro automatically recognizes review opportunities:

- **File Pattern Recognition**: Detects IaC and application code files automatically
- **Context-Aware Suggestions**: Offers reviews at the right moment
- **Architecture Discussions**: Recognizes when to provide guidance
- **Pre-Deployment Checks**: Suggests reviews before infrastructure changes
- **Non-Intrusive**: Helpful suggestions without disrupting workflow

### ⚙️ Optional Automation

Pre-configured hooks for continuous compliance:

| Hook | Trigger | Use Case |
|------|---------|----------|
| **File-Save** | When IaC files are saved | Immediate feedback during development |
| **Pre-Deployment** | Before `terraform apply`, `cdk deploy` | Final validation before changes |
| **Post-Generation** | After Kiro generates code | Ensure AI-generated code is production-ready |

See [hooks/README.md](hooks/README.md) for installation and customization.

## Installation

### Prerequisites

- ✅ Kiro IDE installed and configured
- ✅ AWS infrastructure code (Terraform, CloudFormation, or CDK) - optional but recommended
- ✅ AWS application code (Python, Java, TypeScript, Go, C#, or Ruby) - optional but recommended
- ✅ Python and uv (for AWS MCP servers - optional, see [uv installation](https://docs.astral.sh/uv/getting-started/installation/))
- ✅ AWS credentials configured (optional, for MCP server features)

### Install the Power

**Method 1: Install from Git URL** (recommended):

1. In Kiro: Command Palette → "Powers: Configure"
2. Click "Add Custom Power" → "Import from URL"
3. Enter: `https://github.com/your-org/aws-well-architected-power`
4. Kiro will download and install automatically

**Method 2: Install from Local Folder** (for development/testing):

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/aws-well-architected-power.git
   ```
2. In Kiro: Command Palette → "Powers: Configure"
3. Click "Add Custom Power" → "Import from folder"
4. Select the `aws-well-architected-power` folder

### Verify Installation

Restart Kiro and verify the power is available:

```
"List available powers"
```

You should see "aws-well-architected-power" in the list.

The power works without MCP servers using fallback documentation, but MCP servers provide:
- ✅ Automated security assessments
- ✅ Real-time AWS documentation access
- ✅ Up-to-date best practices
- ✅ Service-specific guidance

**Add to your Kiro MCP configuration:**

For user-level configuration (`~/.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "aws-well-architected-security": {
      "command": "uvx",
      "args": [
        "--from",
        "awslabs.well-architected-security-mcp-server",
        "well-architected-security-mcp-server"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "aws-documentation": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

For workspace-level configuration (`.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "aws-well-architected-security": {
      "command": "uvx",
      "args": [
        "--from",
        "awslabs.well-architected-security-mcp-server",
        "well-architected-security-mcp-server"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "aws-documentation": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

### Configure AWS MCP Servers (Optional but Recommended)

For automated reviews, install hook templates. The hooks are located in the power's `hooks/` directory.

**To install hooks:**

1. Locate the installed power directory:
   - User level: `~/.kiro/powers/installed/aws-well-architected-power/hooks/`
   - Or from your local clone if you have it

2. Copy hook files to your hooks directory:

```bash
# Install all hooks at user level (available in all projects)
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/file-save.md ~/.kiro/hooks/aws-waf-file-save.md
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md

# Or install at workspace level for team sharing
mkdir -p .kiro/hooks
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/file-save.md .kiro/hooks/aws-waf-file-save.md
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/pre-deployment.md .kiro/hooks/aws-waf-pre-deployment.md
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/post-generation.md .kiro/hooks/aws-waf-post-generation.md
```

See [hooks/README.md](hooks/README.md) for detailed hook documentation and customization.

### Installation Complete! 🎉

You're ready to start conducting Well-Architected reviews. Try it now:

```
"Review my infrastructure against AWS Well-Architected best practices"
```

## Usage Guide

### 🚀 Quick Examples

#### Example 1: Quick Review (Simple Mode)

```
You: "Quick review of this Lambda configuration"

Kiro: [Uses Simple Mode - 3.2 seconds]
      ❌ HIGH RISK: Hardcoded API key in environment variables
      ⚠️ MEDIUM RISK: Missing timeout configuration
      Summary: 1 high-risk, 2 medium-risk issues
```

**What happens:**
- Fast prescriptive recommendations (2.5-6 seconds)
- No context questions
- Direct issue identification with clear fixes
- Perfect for CI/CD and development workflow

#### Example 2: Production Review (Context-Aware Mode)

```
You: "Review this production database configuration"

Kiro: [Uses Context-Aware Mode - 6.1 seconds]
      I notice this is a production database. Let me gather context...
      
      📋 Context Questions:
      - What's your availability requirement? (99.9% SLA)
      - What's your budget constraint? (Moderate)
      - What type of data? (Customer PII)
      
      ❌ HIGH RISK: Single-AZ RDS in production
      FOR your requirements (99.9% SLA, customer PII):
        Multi-AZ is REQUIRED
        
      Trade-Off Analysis:
      - Cost Impact: +$73/month (2x cost)
      - Reliability: 99% → 99.95% (43x less downtime)
      - Worth it for your SLA requirement
```

**What happens:**
- Context gathering (3-5 questions)
- Conditional recommendations based on your situation
- Trade-off explanations with cost impact
- Environment-specific guidance

#### Example 3: Architecture Decision (Full Analysis Mode)

```
You: "Full analysis of caching options for our API"

Kiro: [Uses Full Analysis Mode - 8.7 seconds]
      Loading decision matrices and scenarios...
      
      📊 DECISION MATRIX: Caching Architecture Options
      
      | Option | Reliability | Performance | Cost/Month | Best For |
      |--------|------------|-------------|------------|----------|
      | Single Node | ⭐⭐ | ⭐⭐⭐ | $15 | Dev/Test |
      | Redis Cluster | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 | Production |
      | Cluster + Replicas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 | High-traffic |
      
      💰 COST-BENEFIT ANALYSIS:
      - Additional cost: +$345/month
      - Risk reduction: -$7,267/month
      - Net benefit: $6,922/month
      - ROI: 2,005%
      
      ✅ RECOMMENDED: Cluster + Replicas
```

**What happens:**
- Comprehensive context gathering (8-10 questions)
- Decision matrices comparing multiple options
- Quantitative cost-benefit analysis
- Multi-pillar impact analysis
- Implementation roadmap

#### Example 4: Review Your Architecture

```
You: "I want to review my architecture against the Security and Reliability pillars"

Kiro: [Activates the power and guides you through Well-Architected questions,
       leveraging MCP servers for automated checks and documentation]
```

**What happens:**
1. Kiro asks targeted questions about your architecture
2. You provide answers with evidence (code, documentation, etc.)
3. Kiro identifies gaps and assigns risk levels
4. You receive specific remediation recommendations
5. A comprehensive report is generated

#### Example 2: Analyze IaC Files

```
You: "Review my Terraform configuration for Well-Architected compliance"

Kiro: [Analyzes your .tf files, identifies violations with line numbers,
       and provides specific remediation steps]
```

**Sample output:**
```
Found 5 issues in infrastructure.tf:

HIGH RISK - Line 23: S3 bucket lacks server-side encryption
  Pillar: Security
  Risk: Sensitive data could be exposed if bucket is compromised
  Fix: Add server_side_encryption_configuration block with AES256 or KMS

MEDIUM RISK - Line 45: EC2 instance in single availability zone
  Pillar: Reliability
  Risk: Service disruption if AZ fails
  Fix: Use Auto Scaling Group across multiple AZs
```

#### Example 3: Generate Well-Architected Code

```
You: "Generate a Terraform configuration for an S3 bucket"

Kiro: [Generates code with encryption enabled, versioning configured,
       lifecycle policies, and inline comments explaining Well-Architected decisions]
```

**Generated code includes:**
- ✅ Server-side encryption (Security)
- ✅ Versioning enabled (Reliability)
- ✅ Lifecycle policies (Cost Optimization)
- ✅ Access logging (Operational Excellence)
- ✅ Inline comments explaining each decision

#### Example 4: Learn Best Practices

```
You: "Explain Security Pillar best practices for S3"

Kiro: [Provides detailed explanations, real-world examples, anti-patterns,
       and links to AWS documentation]
```

**Learning mode provides:**
- Why the best practice matters
- Real-world scenarios and consequences
- Common mistakes to avoid
- Step-by-step implementation guidance
- Links to official AWS documentation

### 📋 Detailed Workflows

#### Guided Review Session

Perfect for comprehensive architecture assessments:

1. **Initiate Review**
   ```
   "Start a Well-Architected review for my application"
   ```

2. **Select Scope**
   - Choose pillars to assess (or all six)
   - Define focus areas (e.g., "encryption", "multi-AZ")
   - Enable learning mode for detailed explanations

3. **Answer Questions**
   - Kiro presents questions one at a time
   - Provide answers with evidence
   - Skip questions to return to later
   - Request clarification or examples

4. **Review Findings**
   - Issues organized by pillar and risk level
   - Specific remediation steps for each issue
   - Documentation gaps identified
   - Overall risk score per pillar

5. **Generate Report**
   ```
   "Generate a review report in Markdown format"
   ```

#### IaC Analysis Workflow

Perfect for validating infrastructure code:

1. **Open IaC Files**
   - Terraform: `*.tf`, `*.tfvars`
   - CloudFormation: `*.yaml`, `*.json`
   - CDK: `lib/*.ts`, `bin/*.ts`

2. **Request Analysis**
   ```
   "Review this infrastructure code for Well-Architected compliance"
   ```

3. **Review Results**
   - Issues with file names and line numbers
   - Risk level for each issue
   - Specific code changes needed
   - Before/after examples

4. **Apply Fixes**
   - Implement recommended changes
   - Re-run analysis to verify fixes
   - Generate report for documentation

#### Proactive Code Generation

Perfect for starting new infrastructure:

1. **Request Infrastructure Code**
   ```
   "Generate a Terraform module for a highly available web application"
   ```

2. **Automatic Best Practices**
   - Security: Encryption, least-privilege IAM
   - Reliability: Multi-AZ, health checks, auto-scaling
   - Performance: Appropriate instance sizing, caching
   - Cost: Right-sizing, lifecycle policies

3. **Review Generated Code**
   - Inline comments explain decisions
   - Optional immediate review
   - Customize for specific needs

4. **Deploy with Confidence**
   - Production-ready from the start
   - Best practices built-in
   - Documented architecture decisions

### 🎓 Learning Mode

Enable learning mode for educational reviews:

```
"Enable learning mode and explain Reliability Pillar best practices"
```

**Learning mode provides:**

- **Detailed Explanations**: Understand the reasoning behind each recommendation
- **Real-World Examples**: See how companies implement best practices
- **Anti-Patterns**: Learn what to avoid and why it matters
- **Impact Analysis**: Understand consequences of not following best practices
- **Implementation Guidance**: Step-by-step instructions with code examples
- **Quiz Questions**: Test your understanding interactively

**Example learning mode output:**
```
Best Practice: Enable Multi-AZ for RDS databases

Why it matters:
Multi-AZ deployments provide automatic failover capability, ensuring your
database remains available even if an entire availability zone fails.

Real-world scenario:
In 2021, an AWS availability zone outage affected multiple services. Companies
with Multi-AZ RDS deployments experienced automatic failover with minimal
disruption (typically 60-120 seconds). Single-AZ deployments were offline for
several hours.

Anti-pattern:
Using a single-AZ RDS instance for production workloads to save costs (~2x price).

What could go wrong:
- Extended downtime during AZ failures (hours)
- Data loss if backups aren't current
- Revenue loss and customer impact
- Violation of SLA commitments

How to implement:
[Code example with explanation]

Quiz: What is the typical failover time for Multi-AZ RDS? (Answer: 60-120 seconds)
```

## Review Mode Selection

Choose the right review mode for your needs - optimize for speed, depth, or balance:

| Mode | Speed | Token Usage | Best For | Key Features |
|------|-------|-------------|----------|--------------|
| **Simple Mode** | 2.5-6s | 17-25K | CI/CD, quick checks, dev workflow | Prescriptive recommendations, no context questions |
| **Context-Aware Mode** | 4-8s | 35-50K | Production reviews, interactive sessions | Context gathering, trade-off analysis, conditional guidance |
| **Full Analysis Mode** | 5-10s | 70-95K | Major architecture decisions | Decision matrices, cost-benefit analysis, comprehensive scenarios |

**Automatic Mode Detection:**
The power automatically selects the appropriate mode based on:
- **Environment detection**: CI/CD → Simple, Production files → Context-Aware
- **File path patterns**: `/dev/` → Simple, `/prod/` or `/staging/` → Context-Aware
- **User requests**: "quick review" → Simple, "full analysis" → Full Analysis
- **Session type**: Interactive → Context-Aware, Automated → Simple

**Performance Comparison:**

```
Simple Mode (CI/CD Pipeline):
├─ Latency: 2.5-6 seconds
├─ Token Usage: 17-25K tokens
├─ Cost per Review: ~$0.90
└─ Output: Direct issue identification with prescriptive fixes

Context-Aware Mode (Production Review):
├─ Latency: 4-8 seconds
├─ Token Usage: 35-50K tokens
├─ Cost per Review: ~$1.86
└─ Output: Context questions + conditional recommendations + trade-offs

Full Analysis Mode (Architecture Decision):
├─ Latency: 5-10 seconds
├─ Token Usage: 70-95K tokens
├─ Cost per Review: ~$3.66
└─ Output: Decision matrices + cost-benefit + multi-pillar impact
```

**Use Cases by Mode:**

**Simple Mode** - Fast feedback for routine checks:
- ✅ Pre-commit hooks and CI/CD pipelines
- ✅ Development environment reviews
- ✅ Quick validation during active coding
- ✅ Routine compliance checks
- ❌ Not for: Production architecture decisions

**Context-Aware Mode** - Balanced analysis with context:
- ✅ Production and staging environment reviews
- ✅ Interactive review sessions
- ✅ When trade-offs need explanation
- ✅ Environment-specific guidance needed
- ❌ Not for: Time-critical CI/CD checks

**Full Analysis Mode** - Comprehensive decision support:
- ✅ Major architecture decisions (database HA, caching strategy)
- ✅ Multi-option comparisons with cost justification
- ✅ Architecture review meetings
- ✅ When quantitative analysis is needed
- ❌ Not for: Routine checks or CI/CD

**Example: Automatic Mode Detection**

```bash
# Development file - automatically uses Simple Mode
"Review infrastructure/dev/lambda.tf"
→ Simple Mode (3.2s, prescriptive recommendations)

# Production file - automatically uses Context-Aware Mode
"Review infrastructure/prod/database.tf"
→ Context-Aware Mode (6.1s, context questions + trade-offs)

# Explicit request - overrides automatic detection
"Quick review of infrastructure/prod/database.tf"
→ Simple Mode (3.4s, fast check even for prod file)

# Comprehensive analysis request
"Full analysis of caching options"
→ Full Analysis Mode (8.7s, decision matrices + cost-benefit)
```

**Configuration Options:**

Customize mode behavior in `.kiro/config/well-architected-modes.json`:

```json
{
  "defaultMode": "context-aware",
  "autoDetectMode": true,
  "modeOverrides": {
    "development": "simple",
    "production": "context-aware"
  },
  "customDetectionRules": [
    {
      "condition": "filePath.includes('critical')",
      "mode": "context-aware",
      "priority": 95
    }
  ]
}
```

**Cost Optimization:**
- Use Simple Mode for 90% of reviews (routine checks)
- Use Context-Aware Mode for 9% of reviews (production)
- Use Full Analysis Mode for 1% of reviews (major decisions)
- **Result:** 10x cost reduction vs. always using Full Analysis

See [steering/review-mode-selection.md](steering/review-mode-selection.md) for complete mode selection guide and [examples/mode-selection-examples.md](examples/mode-selection-examples.md) for detailed examples.

## File Patterns and Recognition

The power automatically recognizes these file patterns for proactive reviews:

### Terraform

| Pattern | Description | Example |
|---------|-------------|---------|
| `*.tf` | Terraform configuration files | `main.tf`, `variables.tf` |
| `*.tfvars` | Terraform variable files | `prod.tfvars`, `dev.tfvars` |
| `terraform.tfstate` | State files (review only) | `terraform.tfstate` |

### CloudFormation

| Pattern | Description | Example |
|---------|-------------|---------|
| `*.yaml`, `*.yml` | YAML templates with AWS resources | `template.yaml`, `stack.yml` |
| `*.json` | JSON templates with AWS resources | `template.json`, `cfn-stack.json` |

**Detection**: Files containing `AWS::*` resource types

### CDK (Cloud Development Kit)

| Pattern | Description | Example |
|---------|-------------|---------|
| `cdk.json` | CDK project configuration | `cdk.json` |
| `lib/*.ts`, `lib/*.js` | CDK construct definitions | `lib/my-stack.ts` |
| `bin/*.ts`, `bin/*.js` | CDK app entry points | `bin/app.ts` |

**Detection**: Files importing from `aws-cdk-lib` or `@aws-cdk/*`

### AWS SDK Code

| Pattern | Description | Example |
|---------|-------------|---------|
| Python | Files importing `boto3` | `deploy.py` |
| JavaScript/TypeScript | Files importing `aws-sdk` or `@aws-sdk/*` | `infrastructure.ts` |

### Architecture Documentation

| Pattern | Description | Example |
|---------|-------------|---------|
| Architecture docs | Files describing AWS deployments | `architecture.md`, `DESIGN.md` |
| ADRs | Architecture Decision Records | `adr-001-database-choice.md` |

## Documentation and Resources

### Power Documentation

- **[POWER.md](POWER.md)** - Complete power documentation with overview, MCP integration, and usage
- **[mcp.json](mcp.json)** - MCP server configuration reference

### Pillar-Specific Guidance

Detailed steering files for each Well-Architected pillar:

**Infrastructure Guidance:**
- **[steering/security.md](steering/security.md)** - Security best practices, encryption, IAM, compliance
- **[steering/reliability.md](steering/reliability.md)** - Fault tolerance, backups, multi-AZ, disaster recovery
- **[steering/performance.md](steering/performance.md)** - Instance sizing, caching, database optimization
- **[steering/cost-optimization.md](steering/cost-optimization.md)** - Right-sizing, auto-scaling, lifecycle policies
- **[steering/operational-excellence.md](steering/operational-excellence.md)** - Monitoring, logging, automation
- **[steering/sustainability.md](steering/sustainability.md)** - Energy efficiency, resource optimization

**Application Code Guidance:**
- **[steering/security-application-code.md](steering/security-application-code.md)** - Application security patterns (secrets management, authentication)
- **[steering/reliability-application-code.md](steering/reliability-application-code.md)** - Application reliability patterns (error handling, retries, timeouts)
- **[steering/performance-application-code.md](steering/performance-application-code.md)** - Application performance patterns (caching, connection pooling, async)
- **[steering/cost-optimization-application-code.md](steering/cost-optimization-application-code.md)** - Application cost patterns (resource cleanup, efficiency)
- **[steering/operational-excellence-application-code.md](steering/operational-excellence-application-code.md)** - Application operational patterns (logging, monitoring, tracing)

### Workflow Guidance

- **[steering/proactive-review-guidance.md](steering/proactive-review-guidance.md)** - When and how Kiro suggests reviews
- **[steering/code-generation-guidance.md](steering/code-generation-guidance.md)** - Applying Well-Architected principles in generated code
- **[steering/review-mode-selection.md](steering/review-mode-selection.md)** - Complete guide to Simple, Context-Aware, and Full Analysis modes
- **[steering/context-questions.md](steering/context-questions.md)** - Context gathering templates for environment, availability, budget, and data classification
- **[steering/trade-off-guidance.md](steering/trade-off-guidance.md)** - Trade-off analysis framework and decision-making guidance

### Examples

- **[examples/README.md](examples/README.md)** - Complete examples overview
- **[examples/mode-selection-examples.md](examples/mode-selection-examples.md)** - Detailed examples of Simple, Context-Aware, and Full Analysis modes
- **[examples/learning/](examples/learning/)** - Educational examples with quizzes
- **[examples/terraform/](examples/terraform/)** - Terraform security examples
- **[examples/cloudformation/](examples/cloudformation/)** - CloudFormation reliability examples
- **[examples/cdk/](examples/cdk/)** - CDK cost optimization examples
- **[examples/application-code/](examples/application-code/)** - Python, Java, and TypeScript application code examples
- **[examples/reviews/](examples/reviews/)** - Review workflow examples and reports
- **[examples/decision-matrices.md](examples/decision-matrices.md)** - Comprehensive decision matrices for common architecture choices
- **[examples/trade-off-scenarios.md](examples/trade-off-scenarios.md)** - Real-world scenarios with recommended architectures and trade-off analysis

### Hooks

- **[hooks/README.md](hooks/README.md)** - Complete hook documentation and troubleshooting
- **[hooks/file-save.md](hooks/file-save.md)** - File-save hook template
- **[hooks/pre-deployment.md](hooks/pre-deployment.md)** - Pre-deployment hook template
- **[hooks/post-generation.md](hooks/post-generation.md)** - Post-generation hook template

## Configuration and Customization

### Custom Review Profiles

Create custom review profiles for different project types or compliance requirements:

```json
{
  "name": "production-review",
  "description": "Comprehensive review for production workloads",
  "pillars": ["security", "reliability", "operational-excellence"],
  "focusAreas": ["encryption", "multi-az", "monitoring", "backup"],
  "learningMode": false,
  "riskThresholds": {
    "highRiskScore": 80,
    "mediumRiskScore": 50
  }
}
```

**Use cases:**
- **Production Profile**: Focus on Security, Reliability, Operational Excellence
- **Development Profile**: Focus on Cost Optimization, allow single-AZ
- **Compliance Profile**: Add organization-specific requirements
- **Learning Profile**: Enable learning mode, cover all pillars

### Risk Thresholds

Customize risk level thresholds and scoring weights:

```json
{
  "highRiskScore": 80,
  "mediumRiskScore": 50,
  "pillarWeights": {
    "security": 1.5,
    "reliability": 1.2,
    "performance-efficiency": 1.0,
    "cost-optimization": 0.8,
    "operational-excellence": 1.0,
    "sustainability": 0.7
  }
}
```

**Pillar weights:**
- Higher weight = more important to your organization
- Affects overall risk scoring
- Customize based on business priorities

### Custom Questions

Add organization-specific questions to reviews:

```json
{
  "customQuestions": [
    {
      "id": "custom-1",
      "pillar": "security",
      "text": "Does the infrastructure comply with our internal security policy XYZ?",
      "bestPractices": [
        "Implement company-specific security controls",
        "Document compliance in architecture docs"
      ]
    }
  ]
}
```

### Environment-Specific Configuration

Different configurations for different environments:

**Development:**
```json
{
  "name": "dev-review",
  "pillars": ["security", "cost-optimization"],
  "allowances": {
    "singleAZ": true,
    "smallerInstances": true,
    "reducedBackups": true
  }
}
```

**Production:**
```json
{
  "name": "prod-review",
  "pillars": ["security", "reliability", "operational-excellence"],
  "requirements": {
    "multiAZ": true,
    "encryption": "required",
    "backups": "required",
    "monitoring": "required"
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Power Not Found

**Symptom**: Kiro doesn't recognize the power when you try to use it

**Solutions:**
1. Verify installation path:
   ```bash
   ls -la ~/.kiro/powers/aws-well-architected-power/
   # Should show POWER.md, mcp.json, steering/, hooks/, examples/
   ```
2. Check that `POWER.md` exists and has proper frontmatter
3. Restart Kiro to reload powers
4. Check Kiro logs for errors: `~/.kiro/logs/`

#### MCP Servers Not Available

**Symptom**: Power works but doesn't provide automated security checks or real-time documentation

**Solutions:**
1. Verify MCP servers are configured in `~/.kiro/settings/mcp.json` or `.kiro/settings/mcp.json`
2. Test MCP server connection:
   ```bash
   uvx --from awslabs.well-architected-security-mcp-server well-architected-security-mcp-server
   uvx awslabs.aws-documentation-mcp-server@latest
   ```
3. Check AWS credentials are configured:
   ```bash
   aws sts get-caller-identity
   ```
4. **Note**: The power works without MCP servers using fallback documentation

**Graceful degradation:**
- Without MCP servers: Documentation-based guidance (still valuable)
- With MCP servers: Automated assessments + real-time documentation (optimal)

#### File Pattern Not Recognized

**Symptom**: Power doesn't recognize your IaC files automatically

**Solutions:**
1. Verify file extensions match supported patterns:
   - Terraform: `*.tf`, `*.tfvars`
   - CloudFormation: `*.yaml`, `*.yml`, `*.json` (with `AWS::*` resources)
   - CDK: `cdk.json`, `lib/*.ts`, `bin/*.ts`
2. For CloudFormation JSON, ensure it contains `AWS::` resource types
3. For CDK, ensure `cdk.json` is present in the project root
4. Explicitly ask Kiro to review the file:
   ```
   "Review the file infrastructure.tf for Well-Architected compliance"
   ```

#### No Issues Found

**Symptom**: Review completes but finds no issues

**Possible reasons:**
- ✅ Your infrastructure already follows best practices (great!)
- ❌ File format not recognized (check file extensions)
- ❌ MCP servers not configured (some checks require MCP servers)
- ❌ Review scope too narrow (only checking one pillar)

**Solutions:**
1. Try reviewing the example files to verify the power works:
   ```
   "Review the file ~/.kiro/powers/aws-well-architected-power/examples/terraform/security-issues.tf"
   ```
2. Request specific pillar reviews:
   ```
   "Review for Security Pillar compliance"
   ```
3. Enable learning mode for detailed explanations even without issues:
   ```
   "Enable learning mode and explain best practices for this infrastructure"
   ```

#### Reviews Are Too Slow

**Symptom**: Reviews take too long and disrupt workflow

**Solutions:**
1. Focus on specific pillars:
   ```
   "Review Security and Cost Optimization only"
   ```
2. Request quick reviews:
   ```
   "Quick review - top 3 critical issues only"
   ```
3. Check MCP server configuration and network connectivity
4. Use file-specific reviews instead of workspace-wide scans:
   ```
   "Review only main.tf"
   ```
5. Consider using hooks for background reviews

#### Hook Not Triggering

**Symptom**: Installed hook doesn't activate automatically

**Solutions:**
1. Verify hook file location:
   ```bash
   ls -la ~/.kiro/hooks/aws-waf-*.md
   # OR
   ls -la .kiro/hooks/aws-waf-*.md
   ```
2. Check file patterns in hook configuration match your files
3. Ensure hook file doesn't have `.disabled` extension
4. Restart Kiro to load new hooks
5. Check file permissions:
   ```bash
   chmod 644 ~/.kiro/hooks/aws-waf-*.md
   ```
6. See [hooks/README.md](hooks/README.md) for detailed troubleshooting

#### Too Many False Positives

**Symptom**: Hook or review flags issues that aren't actually problems

**Solutions:**
1. Add context to your review request:
   ```
   "Review for DEVELOPMENT environment. Single-AZ and smaller instances are acceptable."
   ```
2. Use environment-specific configuration profiles
3. Document intentional exceptions in code comments:
   ```hcl
   # Single-AZ acceptable for dev environment - cost optimization
   resource "aws_instance" "dev_server" {
     availability_zone = "us-east-1a"
   }
   ```
4. Adjust risk thresholds in configuration
5. Create custom review profiles for different environments

#### Generated Code Doesn't Match Requirements

**Symptom**: AI-generated infrastructure code doesn't meet your specific needs

**Solutions:**
1. Provide more specific requirements:
   ```
   "Generate a Terraform module for an S3 bucket with:
   - KMS encryption with customer-managed key
   - Versioning enabled
   - Lifecycle policy to transition to Glacier after 90 days
   - Access logging to separate bucket"
   ```
2. Request specific pillar focus:
   ```
   "Generate with focus on Security and Cost Optimization"
   ```
3. Review and customize generated code
4. Use generated code as a starting point, not final solution

### Getting Help

If you're still experiencing issues:

1. **Check Documentation**:
   - [POWER.md](POWER.md) - Complete power documentation
   - [hooks/README.md](hooks/README.md) - Hook troubleshooting
   - [examples/README.md](examples/README.md) - Usage examples

2. **Review Examples**:
   - Try the example files to verify the power works
   - Compare your files to the examples
   - Check expected findings documentation

3. **Check Kiro Logs**:
   ```bash
   tail -f ~/.kiro/logs/kiro.log
   ```

4. **Open an Issue**:
   - Provide Kiro version
   - Describe the issue with steps to reproduce
   - Include relevant log excerpts (remove sensitive data)
   - Mention MCP server configuration status

5. **Community Support**:
   - Check existing issues in the repository
   - Ask in Kiro community forums
   - Share your use case for better assistance

## Best Practices

### When to Use This Power

#### ✅ Recommended Use Cases

1. **Active Development**
   - Review infrastructure as you build
   - Catch issues immediately with file-save hooks
   - Learn best practices continuously

2. **Pre-Deployment Validation**
   - Final check before `terraform apply` or `cdk deploy`
   - Prevent security breaches and reliability issues
   - Ensure compliance with organizational standards

3. **AI-Assisted Development**
   - Validate AI-generated infrastructure code
   - Ensure generated code is production-ready
   - Learn from Well-Architected examples

4. **Learning and Training**
   - Enable learning mode for detailed explanations
   - Study examples and anti-patterns
   - Test understanding with quizzes

5. **Architecture Reviews**
   - Conduct lightweight reviews during development
   - Generate reports for stakeholders
   - Track improvements over time

6. **Team Collaboration**
   - Share review profiles and configurations
   - Maintain consistent standards across team
   - Document architecture decisions

#### ❌ Not Recommended For

1. **Formal Compliance Audits** - Use AWS Well-Architected Tool for official audits
2. **Real-Time Production Monitoring** - Use AWS Security Hub, GuardDuty, etc.
3. **Automated Remediation** - This power identifies issues but doesn't auto-fix
4. **Non-AWS Infrastructure** - Focused on AWS Well-Architected Framework

### Review Strategy

#### Start with Critical Pillars

For production workloads, prioritize:

1. **Security** (highest priority)
   - Encryption at rest and in transit
   - Least-privilege IAM policies
   - Network security and isolation
   - Data protection and compliance

2. **Reliability** (high priority)
   - Multi-AZ deployments
   - Automated backups
   - Fault tolerance and recovery
   - Health checks and monitoring

3. **Operational Excellence** (medium priority)
   - Monitoring and alerting
   - Logging and tracing
   - Incident response procedures
   - Automation and IaC

4. **Performance Efficiency** (medium priority)
   - Appropriate instance sizing
   - Caching strategies
   - Database optimization
   - Content delivery

5. **Cost Optimization** (ongoing)
   - Right-sizing resources
   - Auto-scaling configuration
   - Lifecycle policies
   - Cost allocation tags

6. **Sustainability** (nice to have)
   - Energy-efficient instance types
   - Resource utilization
   - Region selection

#### Iterative Improvement

Don't try to fix everything at once:

1. **First Pass**: Address all HIGH risk issues
2. **Second Pass**: Address MEDIUM risk issues
3. **Third Pass**: Address LOW risk issues and improvements
4. **Ongoing**: Continuous reviews with hooks

#### Environment-Specific Standards

Different standards for different environments:

**Development:**
- Single-AZ acceptable (cost savings)
- Smaller instances acceptable
- Reduced backup retention
- Focus: Security basics, cost optimization

**Staging:**
- Production-like configuration
- Multi-AZ recommended
- Full monitoring and logging
- Focus: Security, reliability testing

**Production:**
- Multi-AZ required
- Encryption required
- Full backups and DR
- Comprehensive monitoring
- Focus: All pillars, especially security and reliability

### Automation Strategy

#### Hook Installation Recommendations

| Environment | File-Save | Pre-Deployment | Post-Generation |
|-------------|-----------|----------------|-----------------|
| **Development** | ✅ Yes | Optional | ✅ Yes |
| **Staging** | Optional | ✅ Yes | ✅ Yes |
| **Production** | No | ✅ **Required** | ✅ Yes |

**Rationale:**
- **File-Save**: Great for learning and catching issues early in dev
- **Pre-Deployment**: Essential for production, prevents bad deployments
- **Post-Generation**: Ensures AI-generated code is production-ready

#### Hook Customization

Customize hooks for different workflows:

**Development (Learning Focus):**
```json
"outputPrompt": "Educational review: Explain each issue, why it matters, and how to fix it. Include examples."
```

**Production (Security Focus):**
```json
"outputPrompt": "Security-focused review: Check encryption, IAM policies, network security. Block deployment if HIGH risk issues found."
```

**Cost-Sensitive Projects:**
```json
"outputPrompt": "Cost optimization review: Check instance sizing, auto-scaling, storage classes, lifecycle policies."
```

### Documentation Strategy

#### Generate Reports Regularly

1. **Initial Architecture Review**
   - Generate comprehensive report
   - Document all findings
   - Create remediation plan
   - Share with stakeholders

2. **Pre-Deployment Reviews**
   - Generate report before major changes
   - Compare with previous reports
   - Track improvements over time
   - Document new risks

3. **Quarterly Reviews**
   - Comprehensive review of all pillars
   - Update architecture documentation
   - Identify technical debt
   - Plan improvements

#### Report Formats

Choose format based on audience:

- **Markdown**: For developers, version control, documentation
- **JSON**: For automation, CI/CD integration, tracking
- **HTML**: For stakeholders, presentations, sharing

### Team Collaboration

#### Shared Configuration

Commit configuration to version control:

```bash
# Create workspace-level configuration
mkdir -p .kiro/powers/aws-well-architected-power/config/
# Add team-specific review profiles
# Commit to git for team sharing
```

#### Review Standards

Establish team standards:

1. **Required Reviews**:
   - All infrastructure changes must be reviewed
   - Pre-deployment review required for production
   - HIGH risk issues must be addressed before deployment

2. **Review Frequency**:
   - Continuous: File-save hooks in development
   - Pre-deployment: Before every production deployment
   - Quarterly: Comprehensive architecture review

3. **Documentation**:
   - Review reports committed to repository
   - Architecture decisions documented
   - Exceptions documented with rationale

#### Learning Culture

Use the power to build expertise:

1. **Onboarding**: New team members use learning mode
2. **Knowledge Sharing**: Share interesting findings in team meetings
3. **Continuous Learning**: Regular reviews expose team to best practices
4. **Mentorship**: Senior engineers review findings with junior engineers

## Examples and Learning Resources

### Example Files

The `examples/` directory contains comprehensive examples for learning and testing:

#### Learning Mode Examples (`examples/learning/`)

Educational examples with detailed explanations, real-world scenarios, and quizzes:

- **Security Pillar**: IAM best practices with real-world breach examples
- **Reliability Pillar**: High availability patterns with failure scenarios
- **Performance Efficiency**: Compute selection guide with cost comparisons
- **Cost Optimization**: Right-sizing strategies with ROI calculations
- **Operational Excellence**: Monitoring and observability patterns

Each example includes:
- ✅ Detailed explanation of why the best practice matters
- ✅ Real-world scenarios with correct implementations
- ✅ Common anti-patterns and why they're problematic
- ✅ Rationale behind recommendations with data
- ✅ Links to official AWS documentation
- ✅ Quiz questions to test understanding

#### IaC Analysis Examples

**Terraform Security Examples** (`examples/terraform/`):
- `security-issues.tf` - 5 common security violations
- `security-issues-fixed.tf` - Remediated version with best practices

**CloudFormation Reliability Examples** (`examples/cloudformation/`):
- `reliability-issues.yaml` - 5 reliability anti-patterns
- `reliability-issues-fixed.yaml` - Remediated version with HA/DR

**CDK Cost Optimization Examples** (`examples/cdk/`):
- `cost-optimization-issues.ts` - 5 cost inefficiencies
- `cost-optimization-issues-fixed.ts` - Remediated version with optimizations

#### Application Code Analysis Examples (`examples/application-code/`)

**Python Lambda Examples**:
- `python-lambda-issues.py` - Missing error handling, hardcoded secrets, no retry logic
- `python-lambda-fixed.py` - Proper error handling, secrets manager, retry with exponential backoff

**Java Service Examples**:
- `java-service-issues.java` - Missing async patterns, resource leaks, no monitoring
- `java-service-fixed.java` - Async clients, proper resource management, comprehensive monitoring

**TypeScript API Examples**:
- `typescript-api-issues.ts` - Missing error handling, hardcoded credentials, no health checks
- `typescript-api-fixed.ts` - Proper error handling, environment variables, health check endpoints

#### Review Workflow Examples (`examples/reviews/`)

Complete guided review demonstration:
- `session-example.json` - Example review session with 24 questions
- `report-example.md` - Markdown report with findings
- `report-example.json` - JSON report for automation
- `report-example.html` - HTML report for stakeholders
- `workflow-guide.md` - Step-by-step workflow documentation

### Try the Examples

#### Test IaC Analysis

```bash
# Review the security issues example
"Review the file ~/.kiro/powers/aws-well-architected-power/examples/terraform/security-issues.tf"

# Compare with the fixed version
"Show me the differences between security-issues.tf and security-issues-fixed.tf"
```

**Expected findings:**
- HIGH RISK: Unencrypted S3 bucket (line 2-5)
- HIGH RISK: Overly permissive IAM policy (line 8-20)
- HIGH RISK: Unrestricted security group (line 23-35)
- HIGH RISK: Unencrypted EBS volume (line 38-43)
- HIGH RISK: Publicly accessible RDS (line 46-56)

#### Test Application Code Analysis

```bash
# Review the Python Lambda issues example
"Review the file ~/.kiro/powers/aws-well-architected-power/examples/application-code/python-lambda-issues.py"

# Compare with the fixed version
"Show me the differences between python-lambda-issues.py and python-lambda-fixed.py"
```

**Expected findings:**
- HIGH RISK: Hardcoded AWS credentials (line 5-6)
- HIGH RISK: Missing error handling around DynamoDB calls (line 15-20)
- MEDIUM RISK: No retry logic for AWS service calls (line 15-20)
- MEDIUM RISK: Missing logging instrumentation (throughout)
- LOW RISK: No timeout configuration for Lambda context

#### Explore Learning Mode

```bash
"Show me the Security Pillar learning example for IAM best practices"
```

**What you'll learn:**
- Why least-privilege IAM matters
- Real-world breach examples
- Common IAM anti-patterns
- Step-by-step implementation
- Quiz to test understanding

#### Review Workflow Example

```bash
"Show me an example of a complete Well-Architected review session"
```

**What you'll see:**
- Complete review session structure
- Questions and answers
- Risk assessment and scoring
- Remediation recommendations
- Multiple report formats

### Additional Resources

#### AWS Official Resources

- **[AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)** - Official framework documentation
- **[AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)** - Official review tool
- **[AWS Architecture Center](https://aws.amazon.com/architecture/)** - Reference architectures and best practices
- **[AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)** - Security guidance
- **[AWS Well-Architected Labs](https://wellarchitectedlabs.com/)** - Hands-on labs

#### Pillar-Specific Resources

- **[Security Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)**
- **[Reliability Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)**
- **[Performance Efficiency Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)**
- **[Cost Optimization Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)**
- **[Operational Excellence Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)**
- **[Sustainability Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/welcome.html)**

#### Kiro Resources

- **[Kiro Documentation](https://kiro.ai/docs)** - General Kiro usage
- **[Kiro Powers Guide](https://kiro.ai/docs/powers)** - Power system documentation
- **[Kiro Hooks Guide](https://kiro.ai/docs/hooks)** - Hook system documentation

## Contributing

We welcome contributions to improve the AWS Well-Architected Power! Here's how you can help:

### Types of Contributions

#### 1. Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Kiro version and MCP server configuration
- Relevant log excerpts (remove sensitive data)

#### 2. Feature Requests

Have an idea for improvement? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Example of how it would work
- Any relevant examples or mockups

#### 3. Documentation Improvements

Help improve documentation:
- Fix typos or unclear explanations
- Add more examples
- Improve troubleshooting guides
- Translate documentation

#### 4. Code Contributions

Contribute code improvements:
- Bug fixes
- New features
- Performance improvements
- Test coverage

#### 5. Example Contributions

Add new examples:
- IaC files with common issues
- Learning mode examples
- Review workflow examples
- Custom configuration examples

### Contribution Process

1. **Fork the Repository**
   ```bash
   git clone <your-fork-url>
   cd aws-well-architected-power
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # OR
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # OR
   git commit -m "fix: fix bug description"
   ```

   **Commit message format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test additions or changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots if applicable
   - Ensure all tests pass

### Contribution Guidelines

#### Code Style

- Follow existing code formatting
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

#### Documentation

- Update README.md for user-facing changes
- Update POWER.md for power functionality changes
- Add examples for new features
- Update steering files for pillar-specific changes

#### Testing

- Add tests for new functionality
- Ensure existing tests pass
- Test with and without MCP servers
- Test across different IaC formats

#### Examples

When adding example files:
1. Create both "issues" and "fixed" versions
2. Document expected findings in examples/README.md
3. Add inline comments explaining issues and fixes
4. Follow existing example structure

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd aws-well-architected-power

# Install in development mode
ln -s $(pwd) ~/.kiro/powers/aws-well-architected-power

# Configure MCP servers for testing
# Edit ~/.kiro/mcp.json

# Test your changes
# Restart Kiro and test functionality
```

### Areas Needing Contribution

We especially welcome contributions in these areas:

1. **Additional Examples**
   - More IaC examples for different AWS services
   - Industry-specific examples (healthcare, finance, etc.)
   - Multi-region and global architecture examples

2. **Learning Content**
   - More detailed explanations for each pillar
   - Real-world case studies
   - Video tutorials or walkthroughs

3. **Hook Templates**
   - Additional hook templates for different workflows
   - CI/CD integration examples
   - Custom hook examples

4. **Configuration Profiles**
   - Industry-specific compliance profiles
   - Organization-specific templates
   - Different project type profiles

5. **Documentation**
   - Translations to other languages
   - More troubleshooting scenarios
   - Video tutorials

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help create a welcoming community

### Questions?

- Open an issue for questions
- Check existing issues and discussions
- Review documentation first
- Be specific and provide context

### Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section
- Release notes for significant contributions

Thank you for contributing to make this power better for everyone! 🎉

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

This power integrates with AWS MCP servers:
- **AWS Security Assessment MCP Server**: Licensed by AWS
- **AWS Knowledge MCP Server**: Licensed by AWS

See respective package documentation for license details.

## Support and Community

### Getting Help

1. **Documentation**
   - Review [POWER.md](POWER.md) for complete documentation
   - Check [hooks/README.md](hooks/README.md) for hook troubleshooting
   - See [examples/README.md](examples/README.md) for usage examples

2. **Troubleshooting**
   - Review the [Troubleshooting](#troubleshooting) section above
   - Check existing issues in the repository
   - Review Kiro logs: `~/.kiro/logs/kiro.log`

3. **Community Support**
   - Open an issue for bugs or feature requests
   - Join Kiro community forums
   - Share your use cases and learnings

4. **Professional Support**
   - Contact Kiro support for enterprise assistance
   - AWS support for MCP server issues
   - Consulting services for architecture reviews

### Reporting Issues

When reporting issues, please include:

- **Environment Information**:
  - Kiro version
  - Operating system
  - Node.js version
  - MCP server configuration status

- **Issue Description**:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs. actual behavior
  - Error messages or logs (remove sensitive data)

- **Context**:
  - What you were trying to do
  - IaC format (Terraform, CloudFormation, CDK)
  - Relevant file patterns
  - Hook configuration (if applicable)

### Feature Requests

We welcome feature requests! Please include:

- Clear description of the feature
- Use case and benefits
- Example of how it would work
- Any relevant examples or mockups
- Priority level (nice-to-have vs. critical)

### Community Guidelines

- Be respectful and constructive
- Help others when you can
- Share your learnings and use cases
- Provide feedback on features and documentation
- Contribute examples and improvements

## Changelog

### Version 1.0.0 (Initial Release)

**Features:**
- ✅ Multi-pillar Well-Architected Framework support (all 6 pillars)
- ✅ MCP server integration (Security Assessment and Knowledge)
- ✅ IaC analysis for Terraform, CloudFormation, and CDK
- ✅ Proactive review guidance with file pattern recognition
- ✅ Code generation with Well-Architected principles built-in
- ✅ Learning mode with detailed explanations and examples
- ✅ Optional hook templates for automation (file-save, pre-deployment, post-generation)
- ✅ Comprehensive documentation and examples
- ✅ Report generation in multiple formats (Markdown, JSON, HTML)
- ✅ Graceful degradation when MCP servers unavailable

**Documentation:**
- ✅ Complete POWER.md with overview and usage
- ✅ Pillar-specific steering files (6 pillars)
- ✅ Workflow guidance (proactive reviews, code generation)
- ✅ Hook templates with detailed README
- ✅ Comprehensive examples (learning, IaC analysis, review workflows)

**Examples:**
- ✅ Learning mode examples for all pillars
- ✅ Terraform security examples
- ✅ CloudFormation reliability examples
- ✅ CDK cost optimization examples
- ✅ Complete review workflow examples

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## Acknowledgments

### AWS Resources

- **AWS Well-Architected Framework Team** - For the comprehensive best practices framework
- **AWS MCP Server Teams** - For the Security Assessment and Knowledge MCP servers
- **AWS Documentation Team** - For excellent documentation and whitepapers

### Kiro

- **Kiro Team** - For the power framework and MCP integration capabilities
- **Kiro AI** - This power was built with assistance from Kiro AI
- **Kiro Community** - For feedback and contributions

### Contributors

Thank you to all contributors who have helped improve this power!

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for a complete list of contributors.

## Roadmap

### Planned Features

- **Enhanced MCP Integration**: Deeper integration with AWS services
- **Additional Examples**: More industry-specific examples
- **CI/CD Integration**: Pre-built CI/CD pipeline examples
- **Custom Checks**: Framework for organization-specific checks
- **Multi-Cloud Support**: Extend to other cloud providers
- **Visual Reports**: Enhanced HTML reports with charts and graphs
- **Automated Remediation**: Suggestions for automated fixes
- **Compliance Frameworks**: Pre-built profiles for common compliance requirements

### Community Requests

We track community feature requests in GitHub issues. Vote on features you'd like to see!

## Quick Reference

### Installation Commands

```bash
# Install power (use Kiro Powers UI - recommended)
# 1. Open Powers panel: Command Palette → "Powers: Configure"
# 2. Click "Add Custom Power" → "Import from folder"
# 3. Select aws-well-architected-power directory

# Install all hooks (after power is installed)
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/*.md ~/.kiro/hooks/

# Configure MCP servers (add to ~/.kiro/settings/mcp.json or .kiro/settings/mcp.json)
```

### Common Prompts

```bash
# General review (auto-detects mode based on context)
"Review my infrastructure against AWS Well-Architected best practices"

# Mode-specific reviews
"Quick review of this Lambda function"  # → Simple Mode (2.5-6s)
"Review this production database"  # → Context-Aware Mode (4-8s)
"Full analysis of caching options"  # → Full Analysis Mode (5-10s)

# Pillar-specific
"Review for Security Pillar compliance"
"Review for Cost Optimization opportunities"

# Learning mode
"Enable learning mode and explain Reliability best practices"

# Code generation
"Generate a Terraform module for [resource] following AWS best practices"

# Report generation
"Generate a review report in Markdown format"
```

### File Patterns

- Terraform: `*.tf`, `*.tfvars`
- CloudFormation: `*.yaml`, `*.yml`, `*.json` (with AWS::* resources)
- CDK: `cdk.json`, `lib/*.ts`, `bin/*.ts`

### Hook Commands

```bash
# Disable hook temporarily
mv ~/.kiro/hooks/aws-waf-file-save.md ~/.kiro/hooks/aws-waf-file-save.md.disabled

# Re-enable hook
mv ~/.kiro/hooks/aws-waf-file-save.md.disabled ~/.kiro/hooks/aws-waf-file-save.md
```

---

**Ready to build better AWS infrastructure?** Install the power and start your first review in under 3 minutes! 🚀
