---
name: aws-well-architected-power
displayName: AWS Well-Architected Review
description: Conduct continuous, lightweight Well-Architected reviews during development with automated security checks and comprehensive documentation across all six pillars
keywords: aws, well-architected, security, reliability, performance, cost, operational excellence, sustainability, infrastructure, iac, terraform, cloudformation, cdk, architecture review, best practices
author: Anand Komandooru
---

# AWS Well-Architected Review Power

A Guided MCP Power that enables continuous, lightweight Well-Architected reviews during development. Integrates with AWS MCP servers to provide automated security assessments and comprehensive documentation access across all six pillars.

## Overview

The AWS Well-Architected Review Power enables continuous, lightweight architecture reviews integrated directly into your development workflow. Instead of waiting for formal review ceremonies, you can validate your infrastructure against AWS best practices as you build.

### Purpose and Capabilities

This power helps developers:

- **Conduct Proactive Reviews**: Perform architecture assessments during active development, catching issues early before they reach production
- **Analyze Infrastructure as Code**: Automatically scan Terraform, CloudFormation, and CDK files for Well-Architected compliance with specific line-level feedback
- **Learn Best Practices**: Access detailed explanations, real-world examples, and anti-patterns for all six Well-Architected pillars
- **Generate Comprehensive Reports**: Create structured review reports in multiple formats (Markdown, JSON, HTML) for team sharing and audit trails
- **Apply Principles Automatically**: Generate infrastructure code with security, reliability, and efficiency built-in from the start
- **Track Improvements**: Monitor architecture quality over time with incremental reviews and change tracking

### How It Works

The power integrates with two AWS MCP servers to provide both automated assessments and comprehensive documentation. When MCP servers are unavailable, it gracefully falls back to documentation-based guidance, ensuring you always have access to Well-Architected best practices.

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
2. **Offer Value**: "I can review this against AWS Well-Architected best practices to identify potential improvements."
3. **Be Non-Intrusive**: Suggestions are helpful but not pushy - you can decline or defer reviews.
4. **Provide Specific Guidance**: Reviews focus on the specific files, services, and pillars relevant to your context.
5. **Explain Recommendations**: Each finding includes rationale, risk level, and specific remediation steps.

The goal is to make Well-Architected reviews a natural, continuous part of development rather than a separate, formal process.

## Available Steering Files

Detailed guidance for each pillar is available in the `steering/` directory:

### Infrastructure Guidance
- `security.md` - Security best practices and patterns
- `reliability.md` - Fault tolerance and resilience patterns
- `performance.md` - Performance optimization guidance
- `cost-optimization.md` - Cost-effective architecture patterns
- `operational-excellence.md` - Monitoring and operational procedures
- `sustainability.md` - Energy-efficient architecture patterns

### Application Code Guidance
- `security-application-code.md` - Application security patterns (secrets, auth, input validation)
- `reliability-application-code.md` - Application reliability patterns (retries, timeouts, circuit breakers)
- `performance-application-code.md` - Application performance patterns (caching, connection pooling, async)
- `cost-optimization-application-code.md` - Application cost patterns (resource cleanup, efficient algorithms)
- `operational-excellence-application-code.md` - Application observability patterns (logging, tracing, metrics)

Additional guidance files:

- `proactive-review-guidance.md` - When and how to suggest reviews
- `code-generation-guidance.md` - Applying Well-Architected principles in generated code

## Usage Examples

### Example 1: Guided Review Session

```
User: "I want to review my architecture against the Security and Reliability pillars"

Kiro: [Uses this power to guide through Well-Architected questions, 
       leveraging MCP servers for automated checks and documentation]
```

### Example 2: IaC Analysis

```
User: "Review this Terraform configuration for Well-Architected compliance"

Kiro: [Analyzes the .tf files, identifies violations with line numbers,
       provides specific remediation steps]
```

### Example 3: Proactive Code Generation

```
User: "Generate a Terraform configuration for an S3 bucket"

Kiro: [Generates code with encryption enabled, versioning configured,
       lifecycle policies, and inline comments explaining decisions]
```

### Example 4: Learning Mode

```
User: "Explain Security Pillar best practices for S3"

Kiro: [Provides detailed explanations, real-world examples, anti-patterns,
       and links to AWS documentation]
```

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

Pre-configured hook templates are available in the `hooks/` directory:

- `file-save.md` - Trigger reviews when IaC files are saved
- `pre-deployment.md` - Trigger reviews before deployment commands
- `post-generation.md` - Trigger reviews after code generation

See `hooks/README.md` for installation and customization instructions.

## Installation

This power works immediately after installation with documentation-based guidance. For enhanced capabilities with automated security checks and real-time AWS documentation, optionally configure the MCP servers below.

### Optional: Configure MCP Servers

The power provides full value without MCP servers, but they add automated security assessments and real-time documentation access.

**To enable MCP servers, add to your Kiro MCP configuration:**

User-level (`~/.kiro/settings/mcp.json`) or workspace-level (`.kiro/settings/mcp.json`):

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

**Prerequisites for MCP servers:**
- Python and uv installed ([installation guide](https://docs.astral.sh/uv/getting-started/installation/))
- AWS credentials configured (for security assessment server)

**What you get with MCP servers:**
- ✅ Automated security checks against your AWS environment
- ✅ Real-time AWS documentation and best practices
- ✅ Live compliance validation
- ✅ Service-specific guidance

**What you get without MCP servers:**
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
