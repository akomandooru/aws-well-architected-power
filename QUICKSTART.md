# Quick Start Guide: AWS Well-Architected Power

Get started with the AWS Well-Architected Power in under 5 minutes. This guide will walk you through installation, your first review, and optional automation setup.

## Prerequisites

- Kiro IDE installed and running
- AWS infrastructure code (Terraform, CloudFormation, or CDK) - optional but recommended for testing
- AWS application code (Python, Java, TypeScript, Go, C#, or Ruby) - optional but recommended for testing
- Python and uv (for AWS MCP servers - optional, see [uv installation](https://docs.astral.sh/uv/getting-started/installation/))

## Installation (2 minutes)

### Step 1: Install the Power

**Option A: Install from Local Folder** (for testing/development):

1. Clone or download the power:
   ```bash
   git clone https://github.com/your-org/aws-well-architected-power.git
   ```

2. In Kiro, open the Powers panel:
   - Command Palette → "Powers: Configure"
   - Or ask: "Open powers configuration"

3. Click "Add Custom Power"

4. Select "Import from folder"

5. Navigate to and select the `aws-well-architected-power` folder

**Option B: Install from URL** (for published powers):

1. In Kiro, open the Powers panel

2. Click "Add Custom Power"

3. Select "Import from URL"

4. Enter: `https://github.com/your-org/aws-well-architected-power`

### Step 2: Verify Installation

The power should now appear in your installed powers list. You can verify by asking:

```
"List available powers"
```

You should see "aws-well-architected-power" in the list.

### Step 3: MCP Servers (Optional - Disabled by Default)

The power includes two AWS MCP servers that are **disabled by default**:
- **aws-well-architected-security**: Automated security checks and compliance validation
- **aws-documentation**: AWS documentation, API references, and best practices

**The power works fully without these servers** using fallback documentation from steering files.

**To enable the MCP servers** (for enhanced capabilities):

1. **Enable in Kiro**:
   - Click "Open powers config" in the MCP Configuration section, OR
   - Open your MCP settings file: `~/.kiro/settings/mcp.json` or `.kiro/settings/mcp.json`
   - Find the power's MCP servers (they'll be under a `powers` section)
   - Change `"disabled": true` to `"disabled": false` for the servers you want to enable
   - Restart Kiro

The MCP servers will be automatically downloaded and installed on first use.

**Benefits of enabling MCP servers:**
- Automated security assessments
- Real-time AWS documentation access
- Up-to-date best practices

**Note**: The MCP servers require `uv` (Python package manager). Install uv from [https://docs.astral.sh/uv/getting-started/installation/](https://docs.astral.sh/uv/getting-started/installation/).

## Your First Review (3 minutes)

### Understanding Review Modes

The power offers **three review modes** optimized for different situations:

**🚀 Simple Mode** - Fast prescriptive guidance (2.5-6 seconds)
- Direct recommendations without context questions
- Perfect for quick checks and CI/CD pipelines
- Example: "Enable encryption" - no trade-off discussion

**🎯 Context-Aware Mode** - Balanced analysis (4-8 seconds)
- Asks about your environment, SLA, and budget
- Explains trade-offs for key decisions
- Example: "For production with 99.9% SLA, Multi-AZ is required (costs 2x but prevents downtime)"

**📊 Full Analysis Mode** - Comprehensive review (5-10 seconds)
- Decision matrices comparing multiple options
- Detailed cost-benefit analysis
- Multi-pillar impact assessment
- Use for major architecture decisions

**The power automatically selects the right mode** based on your context, or you can request a specific mode.

### Choosing the Right Mode

**Use Simple Mode when:**
- You want quick feedback during development
- Running automated checks in CI/CD
- Reviewing development/test environments
- You need fast, prescriptive guidance

**Use Context-Aware Mode when:**
- Reviewing production or staging environments
- Context matters for your decisions
- You want to understand trade-offs
- Working interactively with Kiro

**Use Full Analysis Mode when:**
- Making major architecture decisions
- Comparing multiple design options
- Need cost justification for stakeholders
- Want comprehensive multi-pillar analysis

### How to Request Specific Modes

**Automatic Mode Selection (Default):**
The power automatically detects the right mode based on:
- File path (dev/ → Simple, prod/ → Context-Aware)
- Environment (CI/CD → Simple, Interactive → Context-Aware)
- Your request keywords

**Request Simple Mode:**
```
"Quick review of this Lambda config"
"Fast check of my S3 bucket"
"Simple review of this infrastructure"
```

**Request Context-Aware Mode:**
```
"Review this database configuration"
"Check my production RDS setup"
"Review with context"
```

**Request Full Analysis Mode:**
```
"Full analysis of caching options"
"Comprehensive review with trade-offs"
"Compare Multi-AZ vs Single-AZ options"
"Detailed analysis of this architecture"
```

### Mode Examples

#### Simple Mode Example

```
You: "Quick review of this Lambda config"

Kiro: 🔍 Simple Mode Review (Quick Check)
      
      ❌ HIGH RISK: Hardcoded API key in environment variables
      Location: lambda.tf:12
      Recommendation: Use AWS Secrets Manager
      
      ⚠️ MEDIUM RISK: Missing timeout configuration
      Location: lambda.tf:3
      Recommendation: Add timeout = 30
      
      Review completed in 3.2 seconds
```

**What you get:**
- Fast results (2.5-6 seconds)
- Direct issue identification
- Clear remediation steps
- No context questions

#### Context-Aware Mode Example

```
You: "Review my production database configuration"

Kiro: 🔍 Context-Aware Mode Review
      
      I notice this is a production database. Let me gather context:
      
      1. What's your availability requirement? (99.9%, 99.95%, 99.99%)
      2. What's your budget constraint? (tight/moderate/flexible)
      3. What type of data? (public/internal/PII/financial)

You: "99.9% SLA, moderate budget, customer PII"

Kiro: ❌ HIGH RISK: Single-AZ RDS in production
      
      FOR your requirements (99.9% SLA, customer PII, moderate budget):
      Multi-AZ is REQUIRED
      
      Why Multi-AZ is necessary:
      ✅ Reliability: Automatic failover in 1-2 minutes
         - Meets your 99.9% SLA requirement
         - Protects against AZ failures
      
      ⚠️ Cost Impact: 2x database cost
         - Current: ~$73/month
         - With Multi-AZ: ~$146/month
         - Increase: $73/month
         - Acceptable for moderate budget
      
      Trade-Off Analysis:
      Single-AZ Risks: 30-60 min recovery, violates SLA
      Multi-AZ Benefits: Automated failover, zero data loss
      
      Review completed in 6.1 seconds
```

**What you get:**
- Context questions (3-5 questions)
- Conditional recommendations
- Trade-off explanations
- Cost-benefit analysis
- Environment-specific guidance

#### Full Analysis Mode Example

```
You: "Full analysis of caching options for my API"

Kiro: 🔍 Full Analysis Mode - Comprehensive Review
      
      Loading decision matrices and scenarios...
      
      📋 Comprehensive Context Gathering:
      1. Current API traffic? (500 RPS, peak 1,200 RPS)
      2. Availability requirement? (99.95% SLA)
      3. Budget? ($500-800/month for caching)
      4. Growth projection? (3x in 12 months)
      
      📊 DECISION MATRIX: Caching Architecture Options
      
      | Option | Reliability | Performance | Cost/Month | Scalability |
      |--------|------------|-------------|------------|-------------|
      | Single Node | ⭐⭐ | ⭐⭐⭐ | $15 | ⭐⭐ |
      | Redis Cluster | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 | ⭐⭐⭐⭐ |
      | Cluster + Replicas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 | ⭐⭐⭐⭐⭐ |
      
      💰 COST-BENEFIT ANALYSIS:
      
      Recommended: Redis Cluster + Replicas ($360/month)
      
      Current State (Single Node):
      - Cost: $15/month
      - Downtime risk: ~4 hours/month
      - Estimated impact: $8,000/month risk
      
      Recommended State:
      - Cost: $360/month
      - Downtime risk: ~22 minutes/month
      - Risk reduction: -$7,267/month
      - Net benefit: $6,922/month
      - ROI: 2,005%
      
      🎭 MULTI-PILLAR IMPACT ANALYSIS:
      
      Reliability: ⭐⭐ → ⭐⭐⭐⭐⭐ (+HIGH)
      Performance: ⭐⭐ → ⭐⭐⭐⭐⭐ (+HIGH)
      Cost: ⭐⭐⭐⭐⭐ → ⭐⭐⭐ (-MEDIUM)
      
      Overall Score: 2.8/5.0 → 4.7/5.0 (+68% improvement)
      
      Review completed in 8.7 seconds
```

**What you get:**
- Comprehensive context gathering (8-10 questions)
- Decision matrices with multiple options
- Quantitative cost-benefit analysis
- Multi-pillar impact assessment
- Implementation roadmap
- Complete code examples

### Understanding Context-Aware Guidance

The power provides **context-aware recommendations** based on your specific situation. Before making recommendations, it may ask about:

- **Environment type**: Development, staging, production, demo, test
- **Availability requirements**: SLA targets, acceptable downtime
- **Budget constraints**: Monthly budget, cost sensitivity
- **Data classification**: Public, internal, confidential, restricted (PII/PHI/financial)

**Why context matters**: A Multi-AZ database costs 2x more but provides automatic failover. For production with 99.9% SLA, it's required. For development, single-AZ is acceptable to save costs.

### Example: Context-Aware Review

```
You: "Review my RDS database configuration"

Kiro: "I'll review your RDS configuration. To provide context-aware recommendations:
       - What environment is this for? (development/staging/production)
       - What's your availability requirement? (SLA target or acceptable downtime)
       - Do you have budget constraints?"

You: "This is for development, no SLA requirement, tight budget"

Kiro: [Analyzes configuration]
      "Your RDS instance is configured as Multi-AZ ($120/month).
      
      RECOMMENDATION: For development environments with no SLA requirement,
      Single-AZ is acceptable and would save $60/month (50% cost reduction).
      
      TRADE-OFF:
      - What you gain: $60/month savings ($720/year)
      - What you give up: Automatic failover (manual recovery takes 15-30 minutes)
      - Acceptable because: Development environment, no SLA commitment
      
      ALTERNATIVE: If you need higher availability for dev, consider:
      - Multi-AZ for staging/production only
      - Automated backups + documented recovery procedures for dev"
```

Compare with production context:

```
You: "Review my RDS database configuration"

Kiro: "I'll review your RDS configuration. To provide context-aware recommendations:
       - What environment is this for? (development/staging/production)
       - What's your availability requirement? (SLA target or acceptable downtime)
       - Do you have budget constraints?"

You: "This is for production with 99.9% SLA requirement"

Kiro: [Analyzes configuration]
      "Your RDS instance is configured as Single-AZ ($60/month).
      
      CRITICAL ISSUE: For production with 99.9% SLA (8.76 hours downtime/year allowed),
      Single-AZ is INSUFFICIENT. Single-AZ provides ~99% availability (3.65 days downtime/year).
      
      REQUIRED: Multi-AZ deployment
      
      TRADE-OFF:
      - Cost impact: +$60/month (2x cost)
      - Availability improvement: 99% → 99.95% (43x less downtime)
      - Recovery time: 1-2 hours manual → 60-120 seconds automatic
      - Business impact: Meet SLA commitment, avoid SLA penalties
      
      RATIONALE: The $60/month cost is negligible compared to:
      - SLA penalty costs
      - Revenue loss during outages
      - Customer trust and reputation"
```

### Option A: Analyze Existing IaC Files

If you have Terraform, CloudFormation, or CDK files:

```
You: "Review my infrastructure code against AWS Well-Architected best practices"

Kiro: [Analyzes your IaC files, identifies issues with specific line numbers, 
       provides risk levels, and suggests remediation steps]
```

**What to expect:**
- Specific issues identified with file names and line numbers
- Risk level for each issue (High, Medium, Low)
- Detailed remediation steps
- Pillar classification (Security, Reliability, etc.)

### Option B: Analyze Application Code

If you have Python, Java, TypeScript, Go, C#, or Ruby application code:

```
You: "Review my Python Lambda function for Well-Architected best practices"

Kiro: [Analyzes your application code, identifies missing error handling,
       retry logic, logging, and other Well-Architected patterns]
```

**What to expect:**
- Missing reliability patterns (error handling, retries, timeouts)
- Missing performance patterns (caching, connection pooling, async operations)
- Missing security patterns (hardcoded secrets, missing authentication)
- Missing operational patterns (logging, monitoring, health checks)
- Language-specific recommendations

### Option C: Multi-Layer Analysis

Analyze both infrastructure and application code together:

```
You: "Review my Terraform configuration and Python Lambda code together"

Kiro: [Performs comprehensive analysis across both layers, identifies
       issues in infrastructure setup and application implementation]
```

**What to expect:**
- Infrastructure issues (IaC layer)
- Application code issues (code layer)
- Cross-layer recommendations (e.g., Lambda timeout vs. application retry logic)
- Comprehensive risk assessment across all layers

### Option D: Try Example Files

Use the included example files to see the power in action:

**IaC Examples:**
```
You: "Review the file aws-well-architected-power/examples/terraform/security-issues.tf"

Kiro: [Identifies 5 security issues including unencrypted S3 buckets, 
       overly permissive IAM policies, and unrestricted security groups]
```

**Application Code Examples:**
```
You: "Review the file aws-well-architected-power/examples/application-code/python-lambda-issues.py"

Kiro: [Identifies missing error handling, hardcoded secrets, missing retry logic,
       and missing logging instrumentation]
```

Compare with the fixed versions to see best practices:

```
You: "Show me the differences between python-lambda-issues.py and python-lambda-fixed.py"

Kiro: [Highlights the remediation changes with explanations]
```

### Option E: Guided Review Session

Start an interactive review session:

```
You: "I want to conduct a Well-Architected review focusing on Security and Reliability"

Kiro: [Guides you through relevant questions, provides immediate feedback,
       identifies gaps, and generates a comprehensive report]
```

**What to expect:**
- Structured questions about your architecture
- Immediate feedback on your answers
- Documentation gap identification
- Final report with prioritized recommendations

## Common Use Cases

### 1. Review Before Deployment

```
You: "I'm about to deploy this infrastructure. Can you review it first?"

Kiro: [Performs comprehensive review, flags critical issues that should 
       be fixed before deployment]
```

### 2. Review Application Code

```
You: "Review my Python Lambda function for reliability and performance issues"

Kiro: [Analyzes code for error handling, retry logic, timeouts, caching,
       connection pooling, and other Well-Architected patterns]
```

### 3. Multi-Layer Review

```
You: "Review my entire serverless application - both the CDK infrastructure and TypeScript Lambda code"

Kiro: [Analyzes infrastructure configuration and application code together,
       provides comprehensive recommendations across all layers]
```

### 4. Generate Well-Architected Code

**Infrastructure Code:**
```
You: "Generate a Terraform configuration for an S3 bucket following AWS best practices"

Kiro: [Generates code with encryption enabled, versioning configured, 
       lifecycle policies, and inline comments explaining decisions]
```

**Application Code:**
```
You: "Generate a Python Lambda handler that calls DynamoDB following AWS best practices"

Kiro: [Generates code with error handling, retry logic, exponential backoff,
       logging, and connection pooling]
```

### 5. Learn Best Practices

**Infrastructure:**
```
You: "Explain Security Pillar best practices for RDS databases"

Kiro: [Provides detailed explanations, real-world examples, anti-patterns,
       and links to AWS documentation]
```

**Application Code:**
```
You: "Explain reliability patterns for Python applications using AWS services"

Kiro: [Provides error handling patterns, retry logic examples, timeout configurations,
       and circuit breaker implementations]
```

### 6. Get Specific Guidance

**Infrastructure:**
```
You: "How should I configure IAM policies for a Lambda function accessing S3 and DynamoDB?"

Kiro: [Provides least-privilege IAM policy example with explanations]
```

**Application Code:**
```
You: "How should I implement retry logic for DynamoDB calls in Java?"

Kiro: [Provides Java code example with AWS SDK retry configuration and exponential backoff]
```

### 7. Use Decision Matrices for Architecture Choices

When facing architecture decisions, ask for decision matrices:

```
You: "Should I use Multi-AZ or Single-AZ for my database?"

Kiro: [Provides decision matrix comparing options]
      
      | Option | Cost | Availability | Recovery Time | Best For |
      |--------|------|--------------|---------------|----------|
      | Single-AZ | $60/mo | 99% | 1-2 hours | Dev/test, tight budget |
      | Multi-AZ | $120/mo | 99.95% | 60-120 sec | Production, SLA required |
      | Multi-Region | $240/mo | 99.99% | 5-15 min | Global, DR required |
      
      Based on your context (production, 99.9% SLA), Multi-AZ is REQUIRED.
```

See `examples/decision-matrices.md` for comprehensive decision matrices covering:
- Multi-AZ vs. Single-AZ deployment
- Encryption approaches (SSE-S3, SSE-KMS, client-side)
- Instance sizing (cost vs. performance)
- Caching strategies (ElastiCache, DAX, CloudFront)
- Disaster recovery options (backup, pilot light, warm standby, hot standby)
- Database choices (RDS, Aurora, DynamoDB)

### 8. Explore Common Trade-Off Scenarios

Learn from real-world scenarios in `examples/trade-off-scenarios.md`:

```
You: "Show me architecture recommendations for a startup MVP"

Kiro: [Provides complete scenario]
      
      SCENARIO: Startup MVP
      - Budget: $110-150/month
      - Priority: Speed to market > Cost > Reliability
      - Acceptable: Some downtime during validation
      
      RECOMMENDED ARCHITECTURE:
      - Compute: 2x t4g.small ($24/mo) - start small, scale up
      - Database: RDS t3.medium Single-AZ ($60/mo) - managed, sufficient
      - Storage: S3 Standard with SSE-S3 ($5-20/mo) - pay as you go
      - Caching: Application-level ($0) - free, simple
      - Monitoring: CloudWatch free tier ($0-10/mo)
      
      TRADE-OFFS:
      - Single-AZ saves $60/mo but accept potential downtime
      - Burstable instances save cost but may throttle under load
      - Basic monitoring saves $500/mo but less visibility
      
      EVOLUTION PATH: As you grow, upgrade to Multi-AZ, add caching, 
      comprehensive monitoring when you have paying customers and SLA commitments.
```

Available scenarios:
- **Startup MVP**: $110-150/month, rapid iteration, acceptable downtime
- **Enterprise Production**: $15k-30k/month, 99.99% SLA, compliance required
- **Prototype/POC**: $20-50/month, short-lived, minimal cost
- **Cost-Sensitive Production**: $2.5k-4k/month, balance cost and reliability
- **Performance-Critical**: $8k-18k/month, <100ms latency required
- **Regulated Industry**: $8k-30k/month, HIPAA/PCI-DSS compliance
- **Global Scale**: $25k-80k/month, multi-region, high availability
- **Internal Tools**: $500-2k/month, moderate availability, limited users

## Understanding Review Results

### Risk Levels

- **High Risk**: Critical issues that could lead to security breaches, data loss, or significant downtime
- **Medium Risk**: Important issues that reduce reliability, increase costs, or create technical debt
- **Low Risk**: Minor improvements that enhance best practice compliance

### Pillar Classification

Issues are organized by the six Well-Architected pillars:

1. **Operational Excellence**: Monitoring, logging, automation
2. **Security**: Encryption, IAM, network security, data protection
3. **Reliability**: Multi-AZ, backups, fault tolerance, disaster recovery
4. **Performance Efficiency**: Instance sizing, caching, database optimization
5. **Cost Optimization**: Right-sizing, auto-scaling, lifecycle policies
6. **Sustainability**: Energy efficiency, resource optimization

### Report Formats

Generate reports in multiple formats:

```
You: "Generate a review report in Markdown format"
You: "Generate a review report in JSON format for automation"
You: "Generate a review report in HTML format for stakeholders"
```

## Optional: Install Automation Hooks (1 minute)

Automate reviews with pre-configured hooks. The hooks are in the power's `hooks/` directory.

### File-Save Hook
Automatically review IaC files when you save them:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/file-save.md ~/.kiro/hooks/aws-waf-file-save.md
```

**Test it**: Open a `.tf` or `.yaml` file, make a change, save → automatic review

### Pre-Deployment Hook
Review infrastructure before deployment commands:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
```

**Test it**: Run `terraform apply` → review happens before execution

### Post-Generation Hook
Review AI-generated infrastructure code:

```bash
cp ~/.kiro/powers/installed/aws-well-architected-power/hooks/post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md
```

**Test it**: Ask Kiro to generate infrastructure code → automatic review after generation

See `hooks/README.md` for detailed installation and customization instructions.

## Troubleshooting

### Power Not Found

**Problem**: Kiro doesn't recognize the power

**Solutions**:
- Verify installation path: `~/.kiro/powers/aws-well-architected-power/` or `.kiro/powers/aws-well-architected-power/`
- Check that `POWER.md` and `mcp.json` exist in the power directory
- Restart Kiro to reload powers
- Check Kiro logs for errors

### No Issues Found

**Problem**: Review completes but finds no issues

**Possible reasons**:
- Your infrastructure already follows best practices (great!)
- File format not recognized (check file extensions)
- MCP servers not configured (some checks require MCP servers)

**Solutions**:
- Try reviewing the example files to verify the power works
- Ask for specific pillar reviews: "Review for Security Pillar compliance"
- Enable learning mode for detailed explanations even without issues

### Reviews Are Too Slow

**Problem**: Reviews take too long

**Solutions**:
- Focus on specific pillars: "Review Security and Cost Optimization only"
- Request quick reviews: "Quick review - top 3 critical issues only"
- Check MCP server configuration and network connectivity
- Use file-specific reviews instead of workspace-wide scans

### MCP Server Errors

**Problem**: Errors about MCP servers being unavailable

**Solutions**:
- The power works without MCP servers using fallback documentation
- Configure MCP servers in Kiro settings for enhanced capabilities
- Check AWS credentials if using Security Assessment MCP server
- Verify network connectivity to AWS services

### Hook Not Triggering

**Problem**: Installed hook doesn't trigger automatically

**Solutions**:
- Verify hook file location: `~/.kiro/hooks/` or `.kiro/hooks/`
- Check file extension matches hook patterns (`.tf`, `.yaml`, `.json`)
- Restart Kiro to load new hooks
- Check hook file permissions: `chmod 644 ~/.kiro/hooks/aws-waf-*.md`

### Mode Selection Issues

**Problem**: Wrong mode is being used

**Solutions**:
- Check file path - dev/ triggers Simple Mode, prod/ triggers Context-Aware Mode
- Use explicit mode request: "quick review" for Simple, "full analysis" for Full Analysis
- Verify you're not in CI/CD environment (automatically uses Simple Mode)
- Check for custom mode detection rules in `.kiro/config/well-architected-modes.json`

**Problem**: Mode is too slow

**Solutions**:
- Use Simple Mode for faster results: "quick review of this file"
- Simple Mode completes in 2.5-6 seconds vs 4-8 seconds for Context-Aware
- For CI/CD, ensure environment variable `CI=true` is set to auto-select Simple Mode
- Disable Full Analysis Mode if accidentally triggered

**Problem**: Not getting trade-off analysis

**Solutions**:
- Request Context-Aware Mode explicitly: "review with context"
- Ensure you're reviewing production/staging files (auto-triggers Context-Aware)
- For comprehensive analysis, request Full Analysis Mode: "full analysis with trade-offs"
- Simple Mode doesn't include trade-offs by design (for speed)

**Problem**: Too many context questions

**Solutions**:
- Use Simple Mode for prescriptive guidance without questions: "quick review"
- Context-Aware Mode asks 3-5 questions, Full Analysis asks 8-10 questions
- Answer questions to get context-specific recommendations
- Pre-configure context in `.kiro/config/well-architected-context.json` to skip questions

## Next Steps

### Explore Examples

Check out comprehensive examples in the `examples/` directory:

- **Mode Selection Examples** (`examples/mode-selection-examples.md`): Detailed examples of all three review modes with realistic scenarios
- **Learning Mode Examples** (`examples/learning/`): Detailed educational content with quizzes
- **IaC Analysis Examples** (`examples/terraform/`, `examples/cloudformation/`, `examples/cdk/`): Common issues and fixes
- **Application Code Examples** (`examples/application-code/`): Python, Java, and TypeScript examples with issues and fixes
- **Review Workflow Examples** (`examples/reviews/`): Complete review sessions and reports

See `examples/README.md` for detailed documentation.

### Deep Dive into Pillars

Explore pillar-specific guidance in the `steering/` directory:

**Infrastructure Guidance:**
- `steering/security.md` - Security best practices and patterns
- `steering/reliability.md` - Fault tolerance and resilience patterns
- `steering/performance.md` - Performance optimization guidance
- `steering/cost-optimization.md` - Cost-effective architecture patterns
- `steering/operational-excellence.md` - Monitoring and operational procedures
- `steering/sustainability.md` - Energy-efficient architecture patterns

**Application Code Guidance:**
- `steering/security-application-code.md` - Application security patterns (secrets management, authentication)
- `steering/reliability-application-code.md` - Application reliability patterns (error handling, retries, timeouts)
- `steering/performance-application-code.md` - Application performance patterns (caching, connection pooling, async)
- `steering/cost-optimization-application-code.md` - Application cost patterns (resource cleanup, efficiency)
- `steering/operational-excellence-application-code.md` - Application operational patterns (logging, monitoring, tracing)

### Customize Your Workflow

- **Configure Review Scope**: Focus on pillars most relevant to your project
- **Customize Hooks**: Adjust file patterns and review depth in hook configurations
- **Create Templates**: Save common review configurations for different project types
- **Integrate with CI/CD**: Use JSON reports in automated pipelines

### Learn More

- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
- **AWS Well-Architected Tool**: https://aws.amazon.com/well-architected-tool/
- **AWS Architecture Center**: https://aws.amazon.com/architecture/
- **Power Documentation**: See `POWER.md` for complete feature documentation

## Quick Reference

### Common Commands

```bash
# Installation
cp -r aws-well-architected-power ~/.kiro/powers/

# Install all hooks
cp aws-well-architected-power/hooks/*.md ~/.kiro/hooks/

# Disable a hook temporarily
mv ~/.kiro/hooks/aws-waf-file-save.md ~/.kiro/hooks/aws-waf-file-save.md.disabled

# Re-enable a hook
mv ~/.kiro/hooks/aws-waf-file-save.md.disabled ~/.kiro/hooks/aws-waf-file-save.md
```

### Common Prompts

```
# General review
"Review my infrastructure against AWS Well-Architected best practices"
"Review my Python application code for Well-Architected compliance"
"Review both my Terraform and application code together"

# Mode selection
"Quick review of this Lambda config"  # Simple Mode
"Review this database with context"   # Context-Aware Mode
"Full analysis of caching options"    # Full Analysis Mode

# Pillar-specific review
"Review for Security Pillar compliance"
"Review for Cost Optimization opportunities"
"Review my application code for reliability patterns"

# Language-specific review
"Review my Python Lambda function for best practices"
"Review my Java application for performance issues"
"Review my TypeScript API code for security patterns"

# Quick review
"Quick review - top 3 critical issues only"

# Learning mode
"Explain Reliability Pillar best practices for this architecture"
"Explain error handling patterns for Python AWS applications"

# Code generation
"Generate a Terraform module for [resource] following AWS best practices"
"Generate a Python Lambda handler with proper error handling and retry logic"

# Report generation
"Generate a review report in Markdown format"
```

## Support

For issues, questions, or contributions:

1. Check this Quick Start Guide for common solutions
2. Review `POWER.md` for complete documentation
3. Check `hooks/README.md` for hook-specific troubleshooting
4. Review `examples/README.md` for usage examples
5. Open an issue in the power repository

---

**Congratulations!** You're now ready to conduct continuous Well-Architected reviews during development. Start with a simple review and gradually explore more advanced features as you become comfortable with the power.

**Time to First Review**: Under 5 minutes ✓

