---
name: aws-well-architected-power
displayName: AWS Well-Architected Review
description: Context-aware architecture reviews with trade-off analysis. Choose your depth - quick checks (3s), balanced reviews (6s), or comprehensive analysis (9s). Analyzes IaC and application code across all six pillars with quantitative cost-benefit guidance.
keywords: aws, well-architected, security, reliability, performance, cost, operational excellence, sustainability, infrastructure, iac, terraform, cloudformation, cdk, architecture review, best practices, trade-offs, context-aware, mode selection
author: Anand Komandooru
---

# AWS Well-Architected Review Power

A Guided MCP Power that enables continuous, context-aware Well-Architected reviews during development. Get fast prescriptive guidance or comprehensive trade-off analysis - automatically adapted to your context.

## Overview

The AWS Well-Architected Review Power enables continuous architecture reviews integrated directly into your development workflow. Instead of waiting for formal review ceremonies, you can validate your infrastructure against AWS best practices as you build - with the right level of detail for your situation.

### Key Differentiators

**🎯 Context-Aware Trade-Off Guidance**
- Asks about your environment, SLA, budget, and data classification
- Provides conditional recommendations: "For production with 99.9% SLA, Multi-AZ is REQUIRED; for dev, Single-AZ is acceptable"
- Explains what you gain and give up with quantitative data (cost, downtime, performance)
- Compares multiple options with decision matrices

**⚡ Three Review Modes - Choose Your Depth**
- **Simple Mode** (3s): Fast prescriptive checks for CI/CD and quick validation
- **Context-Aware Mode** (6s): Conditional guidance with trade-offs for production reviews
- **Full Analysis Mode** (9s): Comprehensive analysis with decision matrices and ROI calculations
- Automatic mode detection based on file paths, environment, and user requests

**🔍 Multi-Layer Analysis**
- **Infrastructure as Code**: Terraform, CloudFormation, CDK with line-level feedback
- **Application Code**: Python, Java, TypeScript, Go, C#, Ruby with pattern detection
- **All Six Pillars**: Security, Reliability, Performance, Cost, Operational Excellence, Sustainability

**💡 Quantitative Recommendations**
- Specific cost impacts: "$73/month increase for Multi-AZ"
- Availability improvements: "99% → 99.95% (43x less downtime)"
- ROI calculations: "2,005% ROI from downtime prevention"
- Recovery time comparisons: "30-60 min manual → 1-2 min automatic"

### Purpose and Capabilities

This power helps developers:

- **Make Informed Trade-Offs**: Understand what you gain and give up with each architectural decision, with specific numbers
- **Get Context-Appropriate Guidance**: Recommendations adapt to your environment (dev/staging/prod), SLA requirements, budget constraints, and data classification
- **Choose Your Review Depth**: Fast checks for CI/CD (3s), balanced reviews for production (6s), or comprehensive analysis for major decisions (9s)
- **Analyze Infrastructure as Code**: Automatically scan Terraform, CloudFormation, and CDK files for Well-Architected compliance with specific line-level feedback
- **Analyze Application Code**: Review Python, Java, TypeScript, Go, C#, and Ruby code for Well-Architected patterns across all six pillars
- **Compare Architecture Options**: Get decision matrices comparing multiple approaches with cost, reliability, performance, and complexity trade-offs
- **Learn Best Practices**: Access detailed explanations, real-world examples, and anti-patterns for all six Well-Architected pillars
- **Generate Comprehensive Reports**: Create structured review reports in multiple formats (Markdown, JSON, HTML) for team sharing and audit trails
- **Apply Principles Automatically**: Generate infrastructure code with security, reliability, and efficiency built-in from the start

### How It Works

The power integrates with two AWS MCP servers to provide both automated assessments and comprehensive documentation. When MCP servers are unavailable, it gracefully falls back to documentation-based guidance, ensuring you always have access to Well-Architected best practices.

**Context-Aware Recommendations**: Before making recommendations, the power gathers context about your environment (dev, staging, production), availability requirements (SLA targets), budget constraints, and data classification. This ensures recommendations are tailored to your specific situation rather than prescriptive one-size-fits-all advice.

**Trade-Off Analysis**: Architecture is about trade-offs, not absolutes. The power explains what you gain and what you give up with each decision, including specific cost impacts, availability percentages, and performance metrics. For example, "Multi-AZ doubles infrastructure cost but increases availability from 99% to 99.95%."

**Decision Support**: Access decision matrices and scenario libraries to compare options (Multi-AZ vs. Single-AZ, encryption approaches, instance sizing, caching strategies, disaster recovery options, database choices) based on your context.

## MCP Server Integration

This power integrates with two AWS MCP servers to provide comprehensive Well-Architected guidance:

### 1. Security Assessment MCP Server

The Security Assessment server provides operational security monitoring and automated compliance checks:

**Capabilities:**
- **Automated Security Checks**: Run Well-Architected Security Pillar assessments against your AWS environment
- **Service Monitoring**: Monitor AWS security services (GuardDuty, Security Hub, IAM Access Analyzer, etc.)
- **Findings Analysis**: Analyze security findings and map them to Well-Architected best practices
- **Compliance Validation**: Validate compliance with security frameworks and standards
- **Real-Time Assessment**: Check current security posture of deployed resources

**When to Use:**
- Reviewing security configurations in existing AWS environments
- Validating security controls are properly configured
- Investigating security findings and recommendations
- Performing operational security assessments

### 2. Knowledge MCP Server

The Knowledge server provides access to AWS documentation and best practices across all pillars:

**Capabilities:**
- **Documentation Access**: Retrieve official AWS documentation for services and best practices
- **Best Practice Guidance**: Access Well-Architected Framework questions and recommendations for all six pillars
- **Service-Specific Guidance**: Get detailed guidance for specific AWS services
- **Cross-Pillar Coverage**: Support for Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability
- **Up-to-Date Information**: Access current AWS best practices and recommendations

**When to Use:**
- Learning about Well-Architected best practices
- Reviewing architecture designs before implementation
- Understanding service-specific recommendations
- Conducting comprehensive multi-pillar reviews

### Graceful Degradation

The power is designed to provide value regardless of MCP server availability:

- **Both Servers Available**: Full automated assessment + comprehensive documentation (optimal experience)
- **Knowledge Server Only**: Documentation-based guidance for all pillars with manual assessment
- **Security Assessment Only**: Automated security checks + fallback documentation for other pillars
- **No Servers Available**: Documentation-based guidance from steering files (still valuable)

This ensures you can always access Well-Architected guidance, even in offline or restricted environments.

## Six Pillars of Well-Architected Framework

The AWS Well-Architected Framework is built on six pillars that represent key areas of architectural excellence:

### 1. Operational Excellence

**Focus**: Running and monitoring systems to deliver business value, and continually improving processes and procedures.

**Key Areas**: 
- Organization and culture
- Operational readiness and change management
- Monitoring and observability
- Incident response and learning from failures
- Automation and infrastructure as code

**Example Questions**: How do you determine what your priorities are? How do you design your workload to understand its state?

### 2. Security

**Focus**: Protecting information, systems, and assets while delivering business value through risk assessments and mitigation strategies.

**Key Areas**:
- Identity and access management
- Detection and response to security events
- Infrastructure protection
- Data protection (encryption, backups)
- Incident response and forensics

**Example Questions**: How do you manage identities for people and machines? How do you protect your data at rest and in transit?

### 3. Reliability

**Focus**: Ensuring a workload performs its intended function correctly and consistently when expected, including the ability to recover from failures.

**Key Areas**:
- Foundations (service limits, network topology)
- Workload architecture (distributed systems, fault isolation)
- Change management (deployment strategies, rollback)
- Failure management (backup, disaster recovery, testing)
- Monitoring and automated recovery

**Example Questions**: How do you monitor workload resources? How do you design your workload to withstand component failures?

### 4. Performance Efficiency

**Focus**: Using computing resources efficiently to meet system requirements and maintaining that efficiency as demand changes and technologies evolve.

**Key Areas**:
- Selection of appropriate resource types and sizes
- Performance monitoring and optimization
- Trade-offs (consistency vs. latency, cost vs. performance)
- Caching and content delivery
- Database and storage optimization

**Example Questions**: How do you select the best performing architecture? How do you monitor your resources to ensure they are performing as expected?

### 5. Cost Optimization

**Focus**: Running systems to deliver business value at the lowest price point while meeting functional requirements.

**Key Areas**:
- Cost-effective resources (right-sizing, purchasing options)
- Matching supply with demand (auto-scaling, serverless)
- Expenditure awareness (cost allocation, budgets)
- Optimizing over time (reviewing and decommissioning)
- Cloud financial management

**Example Questions**: How do you govern usage? How do you monitor usage and cost? How do you decommission resources?

### 6. Sustainability

**Focus**: Minimizing the environmental impacts of running cloud workloads through energy efficiency and resource optimization.

**Key Areas**:
- Region selection (renewable energy availability)
- User behavior patterns (efficient usage)
- Software and architecture patterns (efficient code)
- Data patterns (data lifecycle, storage optimization)
- Hardware patterns (instance selection, utilization)
- Development and deployment process (CI/CD efficiency)

**Example Questions**: How do you select Regions for your workload? How do you take advantage of software and architecture patterns to support your sustainability goals?

---

Each pillar contains specific best practices, questions, and recommendations that guide you toward architectural excellence. This power helps you systematically evaluate your architecture against all six pillars.

## Context-Aware Guidance and Trade-Off Analysis

### Why Context Matters

Architecture is not one-size-fits-all. The "right" architecture for a startup MVP is very different from an enterprise production system. This power provides context-aware recommendations based on your specific situation.

### Context Questions

Before making recommendations, the power gathers context about:

1. **Environment Type**: Development, staging, production, demo, test
2. **Availability Requirements**: SLA targets (99%, 99.9%, 99.99%, 99.999%), RTO, RPO
3. **Budget Constraints**: Tight, moderate, flexible monthly budget
4. **Data Classification**: Public, internal, confidential, restricted (PII, PHI, financial)
5. **Performance Requirements**: Latency targets, throughput needs
6. **Team Size and Maturity**: Operational capabilities and expertise
7. **Compliance Requirements**: GDPR, HIPAA, PCI-DSS, SOC 2, etc.

### Trade-Off Framework

Every architectural decision involves trade-offs. The power explains:

**What You Gain**: Benefits of the recommendation (availability, performance, security)
**What You Give Up**: Costs and trade-offs (infrastructure cost, complexity, operational overhead)
**Specific Numbers**: Cost impacts ($X/month), availability percentages (99% → 99.95%), latency improvements (200ms → 20ms)
**When to Choose**: Context-specific guidance on when each option makes sense

### Example: Multi-AZ Decision

**Context-Dependent Recommendation:**

```
IF environment == "production" AND sla >= 99.9%:
    REQUIRED: Multi-AZ deployment
    COST: 2x infrastructure cost ($1000/month → $2000/month)
    BENEFIT: Availability increases from 99% to 99.95%
    RATIONALE: SLA commitment requires automatic failover
    
ELSE IF environment == "development":
    ACCEPTABLE: Single-AZ deployment
    COST SAVINGS: 50% ($1000/month vs $2000/month)
    TRADE-OFF: Accept potential downtime for cost savings
    RATIONALE: Dev environments don't need production-level availability
```

### Decision Matrices

The power provides decision matrices for common architecture decisions:

- **Multi-AZ vs. Single-AZ**: Availability vs. cost trade-offs
- **Encryption Approaches**: KMS, SSE-S3, client-side with compliance requirements
- **Instance Sizing**: Cost vs. performance with latency targets
- **Caching Strategies**: ElastiCache, DAX, application-level, CloudFront
- **Disaster Recovery**: Backup/Restore, Pilot Light, Warm Standby, Hot Standby
- **Database Choices**: RDS, Aurora, DynamoDB, DocumentDB, ElastiCache

See `examples/decision-matrices.md` for comprehensive decision frameworks.

### Trade-Off Scenarios

The power includes 8 common scenarios with recommended architectures:

1. **Startup MVP**: Cost-sensitive, rapid iteration ($110-150/month)
2. **Enterprise Production**: High availability, compliance ($15k-30k/month)
3. **Prototype/POC**: Minimal cost, short-lived ($20-50/month)
4. **Cost-Sensitive Production**: Tight budget, moderate availability ($2.5k-4k/month)
5. **Performance-Critical**: Low latency required ($8k-18k/month)
6. **Regulated Industry**: HIPAA/PCI-DSS compliance ($12k-25k/month)
7. **Global Scale**: Multi-region active-active ($25k-80k/month)
8. **Internal Tools**: Cost-conscious, limited users ($60-100/month)

See `examples/trade-off-scenarios.md` for detailed scenario guidance.

### Key Principles

1. **Context Drives Decisions**: Environment, SLA, budget, and data classification determine the right approach
2. **Trade-Offs Are Inevitable**: Every choice involves giving something up to gain something else
3. **Quantify When Possible**: Use specific numbers (cost, latency, availability) to compare options
4. **Start Simple, Scale Up**: Don't over-engineer before product-market fit
5. **Security and Compliance Are Non-Negotiable**: When handling sensitive data or operating in regulated industries
6. **Document Decisions**: Record your rationale for future reference

## Review Modes

The power supports three review modes optimized for different use cases, balancing thoroughness with performance and cost. The appropriate mode is automatically detected based on context, or you can explicitly request a specific mode.

### Three Review Modes

#### 1. Simple Mode - Fast Prescriptive Guidance

**Best For:** Quick checks, CI/CD pipelines, development environments, routine compliance checks

**Characteristics:**
- **Speed:** 2.5-6 seconds (typically 4 seconds)
- **Token Usage:** 17-25K tokens (~$0.90 per review)
- **Approach:** Direct, prescriptive recommendations based on Well-Architected best practices
- **Context Gathering:** None - assumes standard best practices apply
- **Trade-Off Analysis:** None - provides clear "do this" guidance

**What You Get:**
- Direct identification of Well-Architected violations
- Prescriptive recommendations (e.g., "Enable encryption at rest")
- Risk level assignments (High, Medium, Low)
- Specific remediation steps with code examples
- Line numbers and file references for issues

**Example Output:**
```
❌ HIGH RISK: S3 bucket lacks encryption at rest
Location: main.tf:45
Recommendation: Add server_side_encryption_configuration block
Remediation: Enable AES256 or aws:kms encryption
```

**When to Use:**
- Pre-commit hooks and CI/CD checks
- Quick validation during active development
- Development environment reviews
- Fast feedback loops
- Routine compliance scanning

#### 2. Context-Aware Mode - Conditional Guidance

**Best For:** Interactive sessions, production reviews, staging environments, architecture decisions

**Characteristics:**
- **Speed:** 4-8 seconds (typically 6 seconds)
- **Token Usage:** 35-50K tokens (~$1.86 per review)
- **Approach:** Conditional guidance based on your specific context
- **Context Gathering:** Yes - asks 3-5 key questions about environment, SLA, budget, data classification
- **Trade-Off Analysis:** Yes - explains trade-offs for major recommendations

**What You Get:**
- Context questions to understand your requirements
- Conditional recommendations based on your answers
- Trade-off explanations for key decisions
- Environment-specific guidance (dev vs staging vs production)
- Cost-benefit analysis for major changes
- Alternative approaches with pros and cons

**Example Output:**
```
⚠️ CONTEXT-DEPENDENT: Single-AZ RDS instance detected
Location: database.tf:23

Context Questions:
- What environment is this? (development/staging/production)
- What's your availability requirement? (SLA target)
- What's your budget constraint? (tight/moderate/flexible)

Conditional Guidance:
- FOR production with 99.9% SLA: Multi-AZ is REQUIRED
  - Improves Reliability: Automatic failover, 99.95% availability
  - Cost Impact: 2x database cost (~$200/month → ~$400/month)
  
- FOR development/test: Single-AZ is ACCEPTABLE
  - Cost Savings: 50% reduction in database costs
  - Trade-off: No automatic failover, manual recovery needed
  - Acceptable because: Non-critical environment, downtime tolerable
```

**When to Use:**
- Production and staging environment reviews
- Interactive review sessions where you can answer questions
- When context matters for recommendations
- When you need to understand trade-offs
- Architecture decision reviews

#### 3. Full Analysis Mode - Comprehensive Deep Dive

**Best For:** Major architecture decisions, complex trade-off scenarios, architecture review meetings

**Characteristics:**
- **Speed:** 5-10 seconds (typically 7.5 seconds)
- **Token Usage:** 70-95K tokens (~$3.66 per review)
- **Approach:** Comprehensive analysis with decision matrices and quantitative estimates
- **Context Gathering:** Yes - comprehensive (8-10 questions)
- **Trade-Off Analysis:** Yes - detailed across all six pillars

**What You Get:**
- Comprehensive context gathering
- Detailed decision matrices comparing multiple options
- Multi-pillar impact analysis (all six pillars)
- Quantitative cost-benefit estimates with ROI calculations
- Scenario matching with real-world examples
- Implementation roadmap with phases
- Long-term implications discussion

**Example Output:**
```
🔍 COMPREHENSIVE ANALYSIS: Database High Availability Strategy

Decision Matrix: Database HA Options
| Option | Reliability | Cost | Complexity | Recovery Time | Best For |
|--------|------------|------|------------|---------------|----------|
| Single-AZ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 30-60 min | Dev/Test |
| Multi-AZ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 1-2 min | Production |
| Aurora Global | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | <1 min | Global Apps |

Multi-Pillar Impact Analysis:
✅ Reliability: +HIGH (99.5% → 99.95%)
⚠️ Cost: +MEDIUM (+$250/month)
✅ Operational Excellence: +HIGH (automated failover)

Cost-Benefit Analysis:
- Downtime Cost: $500/hour
- Multi-AZ prevents: ~40 minutes/month downtime
- Net benefit: $83/month positive ROI
```

**When to Use:**
- Major architecture decisions with significant impact
- Explicit request for comprehensive analysis
- Complex trade-off scenarios requiring detailed comparison
- Architecture review meetings requiring justification
- When cost justification is needed for stakeholders

### Automatic Mode Detection

The power automatically selects the appropriate mode based on context:

**Priority 1 (Highest): Explicit User Requests**
- "quick review", "simple review", "fast check" → Simple Mode
- "review with context", "explain trade-offs" → Context-Aware Mode
- "full analysis", "comprehensive review", "compare options" → Full Analysis Mode

**Priority 2: CI/CD Environment**
- Environment variables `CI=true`, `GITHUB_ACTIONS=true`, etc. → Simple Mode
- Rationale: Fast feedback without interactive context gathering

**Priority 3: File Path Detection**
- File path contains `/dev/`, `-dev.`, `development/` → Simple Mode
- File path contains `/prod/`, `/staging/`, `-prod.` → Context-Aware Mode
- Rationale: Production files warrant context-aware analysis

**Priority 4: Session Type**
- Interactive session with user present → Context-Aware Mode
- Non-interactive or automated → Simple Mode

**Default Fallback:** Context-Aware Mode (balanced for most use cases)

### Performance Comparison

| Mode | Speed | Tokens | Cost per Review | Best For |
|------|-------|--------|-----------------|----------|
| Simple | 2.5-6s | 17-25K | $0.90 | CI/CD, quick checks |
| Context-Aware | 4-8s | 35-50K | $1.86 | Production reviews |
| Full Analysis | 5-10s | 70-95K | $3.66 | Major decisions |

**Cost Estimates:** Based on GPT-4 pricing ($0.03/1K input, $0.06/1K output)

**Cost Optimization Tips:**
- Use Simple Mode for routine checks (90% of reviews) - 4x cheaper than Full Analysis
- Reserve Context-Aware Mode for production reviews (9% of reviews)
- Reserve Full Analysis for major decisions (1% of reviews)
- Enable auto-detection to use appropriate mode automatically

### Explicit Mode Selection

You can explicitly request a specific mode regardless of auto-detection:

**Request Simple Mode:**
```
"Quick review of this Lambda config"
"Fast check of this S3 bucket"
"Simple review without context questions"
```

**Request Context-Aware Mode:**
```
"Review this with context"
"Explain the trade-offs for this architecture"
"Context-aware review of this database"
```

**Request Full Analysis Mode:**
```
"Full analysis of this caching strategy"
"Comprehensive review with all options"
"Compare all approaches with cost-benefit analysis"
```

### Mode Switching Mid-Session

You can switch modes during a review session:

**Escalate from Simple to Context-Aware:**
```
User: "Quick review of this RDS config"
[Simple Mode provides prescriptive recommendations]

User: "Why is Multi-AZ high risk? What are the trade-offs?"
[Switches to Context-Aware Mode, preserves previous findings]
```

**Escalate to Full Analysis:**
```
User: "Can you do a full analysis with cost comparison?"
[Switches to Full Analysis Mode, loads decision matrices]
```

**Context Preservation:** When switching modes, the power preserves:
- System context already gathered (environment, SLA, budget)
- Previous findings and issues identified
- User preferences and constraints
- Session history and decisions made

### Configuration Options

Customize mode behavior via `.kiro/config/well-architected-modes.json`:

```json
{
  "defaultMode": "context-aware",
  "autoDetectMode": true,
  "modeOverrides": {
    "development": "simple",
    "staging": "context-aware",
    "production": "context-aware"
  },
  "customDetectionRules": [
    {
      "condition": "filePath.includes('critical')",
      "mode": "full-analysis",
      "priority": 80
    }
  ]
}
```

**Configuration Options:**
- `defaultMode`: Mode to use when no detection rules match
- `autoDetectMode`: Enable/disable automatic mode detection
- `modeOverrides`: Force specific modes for specific environments
- `customDetectionRules`: User-defined detection rules with priority

### Troubleshooting Mode Selection

**Issue: Wrong mode detected**
- **Solution:** Explicitly request desired mode ("quick review" or "full analysis")
- **Solution:** Check file path contains dev/prod/staging for auto-detection
- **Solution:** Add custom detection rule in configuration

**Issue: Mode too slow for CI/CD**
- **Solution:** Ensure `CI=true` environment variable is set
- **Solution:** Explicitly request "quick review" in CI/CD scripts
- **Solution:** Configure `modeOverrides` to force Simple Mode in CI/CD

**Issue: Not enough detail in recommendations**
- **Solution:** Request Context-Aware or Full Analysis Mode explicitly
- **Solution:** Ask follow-up questions: "What are the trade-offs?"
- **Solution:** Provide context upfront: "This is production with 99.9% SLA"

**Issue: Too many context questions**
- **Solution:** Use Simple Mode for quick checks without questions
- **Solution:** Provide context upfront in your request
- **Solution:** Answer once per session - context is preserved

### When to Use Each Mode

**Use Simple Mode When:**
- ✅ Running pre-commit hooks or CI/CD checks
- ✅ Doing quick validation during active development
- ✅ Reviewing development environment files
- ✅ You need fast feedback (< 5 seconds)
- ✅ You want prescriptive "just tell me what's wrong" guidance

**Use Context-Aware Mode When:**
- ✅ Reviewing production or staging environments
- ✅ You can answer 3-5 context questions
- ✅ You need to understand trade-offs
- ✅ Context matters for recommendations (SLA, budget, data classification)
- ✅ You're making architecture decisions

**Use Full Analysis Mode When:**
- ✅ Making major architecture decisions with significant impact
- ✅ You need to compare multiple options with quantitative analysis
- ✅ You need cost justification for stakeholders
- ✅ You're in an architecture review meeting
- ✅ You want comprehensive multi-pillar impact analysis

### Examples

For detailed examples of each mode in action, see:
- `steering/review-mode-selection.md` - Complete mode selection guide
- `examples/mode-selection-examples.md` - Comprehensive examples with realistic scenarios

## When to Use This Power

### Proactive Review Opportunities

Kiro will proactively recognize opportunities for Well-Architected reviews in the following scenarios:

#### 1. IaC Files Present in Context

When Infrastructure as Code files are visible in the conversation or workspace, Kiro can automatically suggest reviews:

- **Terraform Files**: `*.tf`, `*.tfvars` files containing resource definitions
- **CloudFormation Templates**: `*.yaml`, `*.json` files with `AWS::*` resource types
- **CDK Applications**: `cdk.json`, `lib/*.ts` files with CDK construct imports
- **AWS SDK Code**: Application code that creates or modifies AWS infrastructure

**Example Trigger**: User opens a Terraform file or asks about infrastructure configuration.

#### 2. Architecture Discussions

During conversations about system design and infrastructure:

- Discussing deployment strategies or architecture patterns
- Planning new features that require infrastructure changes
- Evaluating technology choices for AWS services
- Designing system components and their interactions
- Discussing scalability, availability, or disaster recovery

**Example Trigger**: "How should I architect a highly available web application on AWS?"

#### 3. Code Generation Requests

When generating infrastructure code, Kiro automatically applies Well-Architected principles:

- Creating new Terraform modules or resources
- Generating CloudFormation templates
- Writing CDK constructs or stacks
- Scaffolding infrastructure projects

**Example Trigger**: "Generate a Terraform configuration for an RDS database."

#### 4. Security and Compliance Questions

When security or compliance topics arise:

- Discussing IAM policies and access control
- Questions about encryption, secrets management, or data protection
- Compliance requirements (HIPAA, PCI-DSS, SOC 2, etc.)
- Security findings or vulnerability remediation
- Network security and isolation

**Example Trigger**: "How do I secure my S3 bucket?" or "What IAM permissions does this Lambda need?"

#### 5. Pre-Deployment Validation

Before running deployment commands:

- Before `terraform apply` or `terraform plan`
- Before `cdk deploy` or `cdk synth`
- Before `aws cloudformation create-stack` or update commands
- Before CI/CD pipeline execution

**Example Trigger**: User is about to run a deployment command (can be automated with hooks).

#### 6. Post-Deployment Review

After infrastructure changes are deployed:

- Reviewing what was deployed
- Validating configuration against best practices
- Identifying improvement opportunities
- Documenting architecture decisions

**Example Trigger**: "I just deployed this infrastructure, can you review it?"

### File Patterns That Trigger Reviews

The power recognizes these file patterns as indicators for Well-Architected reviews:

#### Terraform
- `*.tf` - Terraform configuration files
- `*.tfvars` - Terraform variable files
- `terraform.tfstate` - State files (for review, not modification)
- `*.tf.json` - JSON-formatted Terraform

#### CloudFormation
- `*.yaml`, `*.yml` - YAML templates (when containing `AWS::` resources)
- `*.json` - JSON templates (when containing `AWS::` resources)
- `template.yaml`, `template.json` - Common template names
- `*-stack.yaml`, `*-stack.json` - Stack definition files

#### CDK (Cloud Development Kit)
- `cdk.json` - CDK project configuration
- `lib/*.ts`, `lib/*.js` - CDK construct definitions
- `bin/*.ts`, `bin/*.js` - CDK app entry points
- `*.ts`, `*.js` - Files importing from `aws-cdk-lib` or `@aws-cdk/*`

#### AWS SDK and Infrastructure Code
- Files importing `boto3` (Python AWS SDK)
- Files importing `aws-sdk` (JavaScript/TypeScript AWS SDK)
- Files importing `@aws-sdk/*` (AWS SDK v3)
- Code creating AWS resources programmatically

#### Application Code Files
- `*.py` - Python application code
- `*.java` - Java application code
- `*.ts`, `*.js` - TypeScript/JavaScript application code
- `*.go` - Go application code
- `*.cs` - C# application code
- `*.rb` - Ruby application code
- Files using AWS SDKs (boto3, AWS SDK for Java, AWS SDK for JavaScript, etc.)

#### Architecture Documentation
- `architecture.md`, `ARCHITECTURE.md`
- `design.md`, `DESIGN.md`
- Files containing AWS service names and architecture diagrams
- ADR (Architecture Decision Records) mentioning AWS

## Application Code Analysis

In addition to Infrastructure as Code, this power analyzes application code for Well-Architected patterns across multiple programming languages.

### Supported Languages

- **Python**: boto3 patterns, error handling, retry logic, secrets management
- **Java**: AWS SDK for Java v2 patterns, async clients, connection management
- **TypeScript/Node.js**: AWS SDK v3 patterns, promise-based error handling
- **Go**: Context-based patterns, error handling, goroutines
- **C#**: Async/await patterns, disposal, AWS SDK for .NET
- **Ruby**: AWS SDK patterns, resource management

### Application-Level Patterns Detected

#### Security Patterns
- Hardcoded credentials and secrets detection
- Secrets Manager and Parameter Store usage
- Input validation and sanitization
- Authentication and authorization checks
- Secure error handling (no sensitive data exposure)

#### Reliability Patterns
- Error handling (try-catch blocks)
- Retry logic with exponential backoff
- Timeout configuration for AWS SDK calls
- Circuit breaker implementations
- Fallback mechanisms

#### Performance Patterns
- Caching implementations (ElastiCache, DAX, in-memory)
- Connection pooling for databases and services
- Async/await patterns for non-blocking I/O
- Batch operations to reduce API calls
- Efficient database query patterns

#### Cost Optimization Patterns
- Resource cleanup and disposal
- Memory management and leak prevention
- Efficient algorithms and data structures
- Batch operations to minimize API calls
- Lambda optimization patterns

#### Operational Excellence Patterns
- Structured logging (JSON format)
- Distributed tracing (X-Ray instrumentation)
- Custom metrics collection (CloudWatch)
- Health check endpoints
- Correlation IDs for request tracking

### Multi-Layer Analysis

The power can analyze both infrastructure and application code together, providing comprehensive Well-Architected compliance across all layers:

- **Infrastructure Layer**: Terraform/CloudFormation/CDK for resource provisioning
- **Application Layer**: Python/Java/TypeScript/Go/C#/Ruby for business logic
- **Integrated View**: How infrastructure configuration affects application reliability, performance, and security

### How Kiro Uses This Power

When Kiro recognizes a review opportunity, it will:

1. **Acknowledge the Context**: "I notice you're working with Terraform configuration for AWS infrastructure."
2. **Gather Context**: Ask about environment type, SLA requirements, budget constraints, and data classification to provide tailored recommendations.
3. **Offer Value**: "I can review this against AWS Well-Architected best practices and explain trade-offs based on your specific context."
4. **Be Non-Intrusive**: Suggestions are helpful but not pushy - you can decline or defer reviews.
5. **Provide Specific Guidance**: Reviews focus on the specific files, services, and pillars relevant to your context.
6. **Explain Trade-Offs**: Each recommendation includes what you gain, what you give up, specific cost/performance impacts, and when to choose each option.
7. **Explain Recommendations**: Each finding includes rationale, risk level, and specific remediation steps with context-aware guidance.

The goal is to make Well-Architected reviews a natural, continuous part of development rather than a separate, formal process, with recommendations tailored to your specific situation.

## Available Steering Files

Detailed guidance for each pillar is available in the `steering/` directory:

### Infrastructure Guidance
- `security.md` - Security best practices and patterns with context-aware trade-off guidance
- `reliability.md` - Fault tolerance and resilience patterns with availability vs. cost trade-offs
- `performance.md` - Performance optimization guidance with latency targets and cost impacts
- `cost-optimization.md` - Cost-effective architecture patterns with trade-offs between cost and other pillars
- `operational-excellence.md` - Monitoring and operational procedures with team size-based recommendations
- `sustainability.md` - Energy-efficient architecture patterns with ROI calculations

### Application Code Guidance
- `security-application-code.md` - Application security patterns (secrets, auth, input validation)
- `reliability-application-code.md` - Application reliability patterns (retries, timeouts, circuit breakers)
- `performance-application-code.md` - Application performance patterns (caching, connection pooling, async)
- `cost-optimization-application-code.md` - Application cost patterns (resource cleanup, efficient algorithms)
- `operational-excellence-application-code.md` - Application observability patterns (logging, tracing, metrics)

### Context-Aware Guidance
- `context-questions.md` - Templates for gathering context (environment, SLA, budget, data classification)
- `trade-off-guidance.md` - Framework for explaining trade-offs and making context-aware recommendations
- `review-mode-selection.md` - Guide for selecting and using Simple, Context-Aware, and Full Analysis modes
- `proactive-review-guidance.md` - When and how to suggest reviews with context awareness
- `code-generation-guidance.md` - Applying Well-Architected principles in generated code with trade-off explanations

## Usage Examples

### Example 1: Context-Aware Review

```
User: "I want to review my architecture for a production e-commerce application"

Kiro: "I'll help you with a Well-Architected review. First, let me gather some context:
       - What's your SLA target? (99%, 99.9%, 99.99%)
       - What's your monthly infrastructure budget?
       - Do you handle payment card data or PII?
       - What are your latency requirements?"

User: "99.9% SLA, $5k/month budget, yes we handle payment data, <200ms latency"

Kiro: [Provides context-aware recommendations:
       - Multi-AZ required for 99.9% SLA
       - KMS with CMK required for PCI-DSS compliance
       - ElastiCache recommended for <200ms latency
       - Explains cost impacts and trade-offs for each recommendation]
```

### Example 2: Trade-Off Explanation

```
User: "Should I use Multi-AZ for my RDS database?"

Kiro: "That depends on your context. Let me explain the trade-offs:

       Multi-AZ:
       - Cost: 2x ($120/month vs $60/month for db.t3.medium)
       - Availability: 99.95% (4.38 hours downtime/year)
       - Recovery: Automatic failover in 60-120 seconds
       - Best for: Production with SLA ≥99.9%, customer-facing apps
       
       Single-AZ:
       - Cost: Baseline ($60/month)
       - Availability: 99% (3.65 days downtime/year)
       - Recovery: Manual restart in 1-2 hours
       - Best for: Dev/test, internal tools, cost-sensitive non-critical apps
       
       What's your environment and SLA requirement?"
```

### Example 3: Guided Review Session

```
User: "I want to review my architecture against the Security and Reliability pillars"

Kiro: [Uses this power to guide through Well-Architected questions, 
       leveraging MCP servers for automated checks and documentation,
       gathering context to provide tailored recommendations]
```

### Example 4: IaC Analysis

```
User: "Review this Terraform configuration for Well-Architected compliance"

Kiro: [Analyzes the .tf files, identifies violations with line numbers,
       provides specific remediation steps with trade-off explanations]
```

### Example 5: Proactive Code Generation

```
User: "Generate a Terraform configuration for an RDS database"

Kiro: "I'll generate the configuration. First, what environment is this for?
       - Development: Single-AZ, smaller instance, basic backups
       - Production: Multi-AZ, appropriate sizing, comprehensive backups"

User: "Production with 99.9% SLA"

Kiro: [Generates code with Multi-AZ enabled, encryption with KMS CMK,
       automated backups, and inline comments explaining trade-offs]
```

### Example 6: Learning Mode

```
User: "Explain Security Pillar best practices for S3"

Kiro: [Provides detailed explanations, real-world examples, anti-patterns,
       trade-offs between encryption options, and links to AWS documentation]
```

## Example Resources

The `examples/` directory contains comprehensive resources for understanding Well-Architected trade-offs and decision-making:

### Decision Matrices (`examples/decision-matrices.md`)

Comprehensive decision matrices for common architecture decisions:
- Multi-AZ vs. Single-AZ deployment with cost and availability analysis
- Encryption approach decision (KMS, SSE-S3, client-side) with compliance requirements
- Instance sizing decision with cost vs. performance trade-offs
- Caching strategy decision (ElastiCache, DAX, application-level, CloudFront)
- Disaster recovery strategy (Backup/Restore, Pilot Light, Warm Standby, Hot Standby)
- Database choice decision (RDS, Aurora, DynamoDB, DocumentDB, ElastiCache)

Each matrix includes context factors, cost estimates, complexity ratings, and when to use each option.

### Trade-Off Scenarios (`examples/trade-off-scenarios.md`)

8 common scenarios with recommended architectures and detailed trade-off analysis:
1. Startup MVP ($110-150/month) - Cost-sensitive, rapid iteration
2. Enterprise Production ($15k-30k/month) - High availability, compliance
3. Prototype/POC ($20-50/month) - Minimal cost, short-lived
4. Cost-Sensitive Production ($2.5k-4k/month) - Tight budget, moderate availability
5. Performance-Critical ($8k-18k/month) - Low latency required
6. Regulated Industry ($12k-25k/month) - HIPAA/PCI-DSS compliance
7. Global Scale ($25k-80k/month) - Multi-region active-active
8. Internal Tools ($60-100/month) - Cost-conscious, limited users

Each scenario includes context, constraints, recommended architecture, cost estimates, and trade-off rationale.

### Mode Selection Examples (`examples/mode-selection-examples.md`)

Comprehensive examples demonstrating the three review modes:
- Simple Mode examples with fast prescriptive guidance
- Context-Aware Mode examples with conditional recommendations
- Full Analysis Mode examples with comprehensive decision matrices
- Automatic mode detection scenarios
- Explicit mode override examples
- Mode switching mid-session examples
- Expected output comparisons across modes

## Example IaC Files

The `examples/` directory contains sample Infrastructure as Code files demonstrating common Well-Architected issues and their remediation:

### Terraform Examples (Security Pillar)
- `examples/terraform/security-issues.tf` - Common security anti-patterns
- `examples/terraform/security-issues-fixed.tf` - Remediated version with best practices

### CloudFormation Examples (Reliability Pillar)
- `examples/cloudformation/reliability-issues.yaml` - Reliability anti-patterns
- `examples/cloudformation/reliability-issues-fixed.yaml` - Remediated version with HA/DR

### CDK Examples (Cost Optimization Pillar)
- `examples/cdk/cost-optimization-issues.ts` - Cost inefficiencies
- `examples/cdk/cost-optimization-issues-fixed.ts` - Remediated version with cost optimizations

These examples are useful for:
- Testing the power's IaC analysis capabilities
- Learning about common architecture anti-patterns
- Understanding how to fix Well-Architected issues
- Training and documentation purposes

See `examples/README.md` for detailed documentation of all issues and fixes.

## Optional Hook Templates

Pre-configured hook templates are available in the `hooks/` directory for automated reviews.

### Available Hooks

- `file-save.md` - Trigger reviews when IaC files are saved
- `pre-deployment.md` - Trigger reviews before deployment commands
- `post-generation.md` - Trigger reviews after code generation

### How to Use Hooks

**Option 1: Ask Kiro to Install Them**

Simply ask Kiro:
```
"Install the Well-Architected hooks from this power"
```

Kiro can read the hook templates from the power's `hooks/` directory and install them for you.

**Option 2: Manual Installation**

If you cloned the repository or want to customize:

1. Navigate to the power's hooks directory (usually in `~/.kiro/powers/installed/aws-well-architected-power/hooks/`)
2. Copy hook files to your hooks directory:
   ```bash
   # User-level (all projects)
   cp file-save.md ~/.kiro/hooks/aws-waf-file-save.md
   
   # Workspace-level (current project only)
   cp file-save.md .kiro/hooks/aws-waf-file-save.md
   ```

**Option 3: Access from GitHub**

Download hooks directly from the GitHub repository:
- Visit the repository's `hooks/` directory
- Download the hook files you want
- Place them in `~/.kiro/hooks/` or `.kiro/hooks/`

See `hooks/README.md` in the repository for detailed documentation and customization options.

## Installation

This power works immediately after installation with documentation-based guidance. For enhanced capabilities with automated security checks and real-time AWS documentation, optionally enable the included MCP servers.

### Optional: Enable MCP Servers

The power provides full value without MCP servers, but they add automated security assessments and real-time documentation access.

**The MCP servers are already configured with this power - just enable them:**

1. In the power's detail page in Kiro, click the **"Open powers config"** button under "MCP Configuration"
2. This opens the MCP configuration file with two tabs: User Config and Workspace Config
3. Find the two MCP servers from this power (they start with `power-aws-well-architected-power-`):
   - `power-aws-well-architected-power-aws-well-architected-security`
   - `power-aws-well-architected-power-aws-documentation`
4. For each server, change `"disabled": true` to `"disabled": false`
5. Save the file (Ctrl+S or Cmd+S)
6. The servers will connect automatically

**Prerequisites for MCP servers:**
- Python and uv installed ([installation guide](https://docs.astral.sh/uv/getting-started/installation/))
- AWS credentials (only for security assessment server - documentation server doesn't need credentials):
  - The security assessment MCP server uses the standard AWS credential chain
  - Most common: Run `aws configure` to set up credentials in `~/.aws/credentials`
  - Or use environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - Or use AWS SSO: `aws sso login`
  - Test with: `aws sts get-caller-identity`
  - Note: The documentation server accesses public AWS docs and doesn't require credentials

**What you get with MCP servers enabled:**
- ✅ Automated security checks against your AWS environment
- ✅ Real-time AWS documentation and best practices
- ✅ Live compliance validation
- ✅ Service-specific guidance

**What you get without MCP servers (default):**
- ✅ IaC code analysis (Terraform, CloudFormation, CDK)
- ✅ Application code analysis (Python, Java, TypeScript, etc.)
- ✅ Comprehensive Well-Architected documentation
- ✅ Code generation with best practices
- ✅ Learning mode and examples

Most users don't need MCP servers - the power is highly valuable for code review and generation without them.

## Getting Started

1. The power works immediately - no additional setup required
2. (Optional) Configure AWS MCP servers for automated security checks - see Installation section above
3. Start using: "Review my infrastructure against AWS Well-Architected best practices"
4. (Optional) Install hook templates from the `hooks/` directory for automated reviews

For detailed workflows and examples, see the sections below.
