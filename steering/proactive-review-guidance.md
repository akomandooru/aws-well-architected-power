# Proactive Review Guidance - AWS Well-Architected Framework

## Overview

This steering file guides Kiro on recognizing opportunities to proactively suggest Well-Architected Framework reviews during development workflows. The goal is to help developers catch architecture issues early without being intrusive or disruptive to their flow.

### Core Principles

1. **Context-Aware**: Recognize when users are working with infrastructure code or discussing architecture
2. **Non-Intrusive**: Suggest reviews at natural breakpoints, not during active coding
3. **Value-Focused**: Explain the specific value of a review in the current context
4. **Actionable**: Provide clear next steps when suggesting a review
5. **Respectful**: Accept when users decline and don't repeatedly suggest

## File Pattern Recognition

### Infrastructure as Code Files

Kiro should recognize the following file patterns as opportunities for Well-Architected reviews:

#### Terraform Files
- **Patterns**: `*.tf`, `*.tfvars`, `*.tf.json`
- **Key Indicators**: 
  - `resource "aws_*"` blocks
  - `provider "aws"` configuration
  - `terraform` configuration blocks
- **Context**: Terraform is being used to define AWS infrastructure

#### CloudFormation Templates
- **Patterns**: `*.yaml`, `*.yml`, `*.json` (when containing AWS resources)
- **Key Indicators**:
  - `AWSTemplateFormatVersion` field
  - `Resources:` section with `Type: AWS::*`
  - `Parameters:`, `Outputs:`, `Mappings:` sections typical of CloudFormation
- **Context**: CloudFormation is being used to define AWS infrastructure

#### CDK Applications
- **Patterns**: `cdk.json`, `lib/*.ts`, `lib/*.js`, `lib/*.py` (in CDK projects)
- **Key Indicators**:
  - `import * as cdk from 'aws-cdk-lib'`
  - `import { Stack, App } from 'aws-cdk-lib'`
  - Classes extending `cdk.Stack` or `Stack`
  - `new cdk.App()` or `new App()`
- **Context**: AWS CDK is being used to define infrastructure programmatically

#### AWS SDK Code
- **Patterns**: `*.ts`, `*.js`, `*.py`, `*.java` (when creating infrastructure)
- **Key Indicators**:
  - Imports like `boto3`, `aws-sdk`, `@aws-sdk/*`
  - API calls that create infrastructure: `createBucket`, `createTable`, `runInstances`, `createFunction`
  - Not just read operations like `listBuckets` or `describeInstances`
- **Context**: Application code that provisions AWS resources programmatically

#### Architecture Documentation
- **Patterns**: `architecture.md`, `ARCHITECTURE.md`, `docs/architecture/*`, `ADR-*.md` (Architecture Decision Records)
- **Key Indicators**:
  - Mentions of AWS services (EC2, S3, Lambda, RDS, etc.)
  - Architecture diagrams or descriptions
  - Discussion of scalability, security, reliability, cost
  - Terms like "deployment", "infrastructure", "architecture"
- **Context**: Documentation describing AWS architecture or design decisions

### File Pattern Examples

```
# Terraform
main.tf
variables.tf
terraform.tfvars
modules/vpc/main.tf

# CloudFormation
template.yaml
stack.yml
infrastructure.json

# CDK
cdk.json
lib/my-stack.ts
bin/app.ts

# Architecture Docs
docs/architecture.md
ADR-001-database-selection.md
ARCHITECTURE.md
```

## Contextual Triggers for Suggesting Reviews

### Trigger 1: New Infrastructure Code Created

**When**: User has just created or significantly modified IaC files

**Recognition Signals**:
- New `.tf`, `.yaml`, or CDK files created
- Large additions to existing IaC files (>50 lines)
- New AWS resources added to templates

**Suggestion Timing**: After the user completes the code changes (not during active editing)

**Suggestion Phrasing**:
> "I noticed you've created new AWS infrastructure code. Would you like me to review it against Well-Architected best practices? I can check for security, reliability, and cost optimization opportunities."

**Why This Works**: The user has just finished defining infrastructure, making it a natural time to validate the design before deployment.

### Trigger 2: Pre-Deployment Discussion

**When**: User mentions deploying, applying, or launching infrastructure

**Recognition Signals**:
- User says: "deploy", "apply", "launch", "provision", "create stack"
- User asks about deployment commands: "how do I deploy this?", "should I run terraform apply?"
- User is about to run deployment commands

**Suggestion Timing**: Before the deployment command is executed

**Suggestion Phrasing**:
> "Before deploying, would you like a quick Well-Architected review? I can identify potential issues with security, reliability, or cost that are easier to fix now than after deployment."

**Why This Works**: Pre-deployment is a critical checkpoint where catching issues prevents costly rework and potential security vulnerabilities in production.

### Trigger 3: Architecture Discussion

**When**: User is discussing or asking about architecture decisions

**Recognition Signals**:
- Questions about service selection: "should I use RDS or DynamoDB?"
- Questions about architecture patterns: "how should I structure my VPC?"
- Discussions of scalability, security, or reliability
- Mentions of specific AWS services in design context

**Suggestion Timing**: After understanding the user's requirements, before providing recommendations

**Suggestion Phrasing**:
> "This is a great architecture question. Would you like me to evaluate your options using the Well-Architected Framework? I can assess each approach across security, reliability, performance, and cost dimensions."

**Why This Works**: Architecture decisions benefit from structured evaluation, and the Well-Architected Framework provides a comprehensive lens for comparison.

### Trigger 4: Security-Related Questions

**When**: User asks about security, permissions, or compliance

**Recognition Signals**:
- Questions about IAM policies, security groups, encryption
- Mentions of compliance requirements (HIPAA, PCI-DSS, SOC 2)
- Security concerns: "is this secure?", "how do I protect this?"
- Questions about access control or authentication

**Suggestion Timing**: When providing security guidance

**Suggestion Phrasing**:
> "I can help with that security question. Would you also like me to run a comprehensive Security Pillar review? I can check your infrastructure against AWS security best practices and identify any gaps."

**Why This Works**: Security questions indicate the user cares about security, making them receptive to a thorough security assessment.

### Trigger 5: Cost or Performance Questions

**When**: User asks about costs, performance, or optimization

**Recognition Signals**:
- Questions about pricing: "how much will this cost?"
- Performance concerns: "will this be fast enough?", "how do I optimize this?"
- Mentions of cost optimization or right-sizing
- Questions about auto-scaling or resource sizing

**Suggestion Timing**: When discussing optimization strategies

**Suggestion Phrasing**:
> "I can help optimize for cost/performance. Would you like a Well-Architected review focused on the Cost Optimization and Performance Efficiency pillars? I can identify specific opportunities to improve efficiency."

**Why This Works**: Users asking about cost or performance are actively looking for optimization, making them receptive to structured recommendations.

### Trigger 6: Multi-Service Architecture

**When**: User is working with multiple AWS services in a complex architecture

**Recognition Signals**:
- IaC files defining 5+ different AWS resource types
- Integration between multiple services (API Gateway + Lambda + DynamoDB)
- Microservices or distributed system patterns
- Multiple tiers (web, app, data)

**Suggestion Timing**: After the architecture is defined but before deployment

**Suggestion Phrasing**:
> "You're building a multi-service architecture. Would you like me to review how these services work together against Well-Architected best practices? I can check for reliability, security, and operational excellence across the system."

**Why This Works**: Complex architectures have more potential issues, and users benefit from holistic review of service interactions.

### Trigger 7: Post-Error or Issue

**When**: User encounters an error or issue with their infrastructure

**Recognition Signals**:
- Deployment failures or errors
- Security findings or alerts
- Performance issues or outages
- User says: "this isn't working", "I'm getting an error"

**Suggestion Timing**: After helping resolve the immediate issue

**Suggestion Phrasing**:
> "I've helped resolve that issue. Would you like me to review your infrastructure more broadly to identify similar issues before they occur? A Well-Architected review can help prevent future problems."

**Why This Works**: After experiencing a problem, users are motivated to prevent similar issues, making them receptive to proactive review.

## Non-Intrusive Suggestion Phrasing

### Principles for Suggestions

1. **Ask, Don't Tell**: Frame as an offer, not a requirement
2. **Explain Value**: Briefly state what the user will gain
3. **Be Specific**: Mention relevant pillars or focus areas
4. **Respect Decline**: Accept "no" gracefully without repeating
5. **Keep It Brief**: One or two sentences maximum

### Good Suggestion Examples

✅ **Good**: "Would you like me to review this for security best practices? I can check encryption, IAM policies, and network security."

✅ **Good**: "I can run a quick Well-Architected review on this infrastructure. It'll take a minute and might catch issues before deployment."

✅ **Good**: "Since you're working with sensitive data, would a Security Pillar review be helpful? I can verify encryption and access controls."

✅ **Good**: "Before you deploy, want me to check this against AWS best practices? I can focus on the areas you care most about."

### Poor Suggestion Examples

❌ **Too Pushy**: "You MUST run a Well-Architected review before deploying this infrastructure."

❌ **Too Vague**: "Would you like a review?" (doesn't explain what or why)

❌ **Too Long**: "The AWS Well-Architected Framework is a comprehensive set of best practices across six pillars including security, reliability, performance efficiency, cost optimization, operational excellence, and sustainability, and I can review your infrastructure against all of these pillars to identify gaps and provide recommendations for improvement. Would you like me to do that?"

❌ **Repetitive**: Suggesting the same review multiple times after the user has declined

### Handling User Responses

**If User Accepts**:
- Proceed with the review immediately
- Ask which pillars they want to focus on (or review all if they're unsure)
- Provide actionable findings with specific remediation steps

**If User Declines**:
- Respond gracefully: "No problem! Let me know if you'd like a review later."
- Don't suggest again in the same conversation unless context significantly changes
- Remember the decline and don't be repetitive

**If User Asks "What's that?"**:
- Briefly explain: "The Well-Architected Framework is AWS's set of best practices for building secure, reliable, and efficient infrastructure. I can check your code against these practices and suggest improvements."
- Then ask if they'd like to proceed

## Examples of Proactive Review Opportunities

### Example 1: New Terraform Infrastructure

**Context**: User creates a new `main.tf` file with EC2, RDS, and S3 resources

**User Action**: Finishes writing the Terraform code

**Kiro Recognition**: 
- New `.tf` file created
- Multiple AWS resources defined
- No deployment command run yet

**Kiro Suggestion**:
> "I see you've defined EC2, RDS, and S3 infrastructure in Terraform. Would you like me to review it against Well-Architected best practices before you deploy? I can check security configurations, reliability patterns, and cost optimization opportunities."

**If User Accepts**: Run IaC analysis focusing on Security (encryption, IAM, security groups), Reliability (multi-AZ, backups), and Cost Optimization (instance sizing, storage classes)

### Example 2: CloudFormation Template for Web Application

**Context**: User creates a CloudFormation template with ALB, ECS, and RDS

**User Action**: Asks "Does this look good?"

**Kiro Recognition**:
- CloudFormation template with multi-tier architecture
- User is seeking validation
- Good opportunity for structured review

**Kiro Suggestion**:
> "I can give you a comprehensive answer by reviewing this against the Well-Architected Framework. Would you like me to check security, reliability, and performance aspects of your ALB + ECS + RDS architecture?"

**If User Accepts**: Review the template focusing on:
- Security: ALB HTTPS, ECS task IAM roles, RDS encryption
- Reliability: Multi-AZ deployment, health checks, auto-scaling
- Performance: ECS task sizing, RDS instance class, caching

### Example 3: Architecture Decision Discussion

**Context**: User asks "Should I use Lambda or ECS for my API?"

**User Action**: Seeking architecture guidance

**Kiro Recognition**:
- Architecture decision question
- Comparing service options
- Opportunity for structured evaluation

**Kiro Suggestion**:
> "Great question! Would you like me to evaluate both options using the Well-Architected Framework? I can compare Lambda vs ECS across cost, performance, operational complexity, and scalability to help you decide."

**If User Accepts**: Provide structured comparison:
- Cost: Lambda pay-per-invocation vs ECS continuous running
- Performance: Lambda cold starts vs ECS consistent latency
- Operational Excellence: Lambda serverless vs ECS container management
- Scalability: Lambda automatic vs ECS auto-scaling configuration

### Example 4: Pre-Deployment Check

**Context**: User says "I'm ready to run terraform apply"

**User Action**: About to deploy infrastructure

**Kiro Recognition**:
- Deployment command mentioned
- Critical checkpoint before production changes
- High-value opportunity for review

**Kiro Suggestion**:
> "Before you apply, would you like a quick Well-Architected review? I can identify any security or reliability issues that are easier to fix now than after deployment. It'll just take a minute."

**If User Accepts**: Run focused review on:
- Security: Encryption, IAM policies, network security
- Reliability: Backup configurations, multi-AZ, fault tolerance
- High-risk issues that could cause production problems

### Example 5: Security Question

**Context**: User asks "How do I secure my S3 bucket?"

**User Action**: Asking about security best practices

**Kiro Recognition**:
- Security-focused question
- User cares about security
- Opportunity for comprehensive security review

**Kiro Suggestion**:
> "I can help secure your S3 bucket. Would you also like me to review your entire infrastructure for security best practices? I can check encryption, IAM policies, network security, and more across all your AWS resources."

**If User Accepts**: Run Security Pillar review covering:
- S3: Encryption, bucket policies, public access blocks, versioning
- IAM: Least privilege, no hardcoded credentials, role usage
- Network: Security groups, NACLs, VPC configuration
- Data Protection: Encryption at rest and in transit

### Example 6: Post-Code-Generation

**Context**: User asks Kiro to generate Terraform code for a VPC with public and private subnets

**User Action**: Kiro generates the infrastructure code

**Kiro Recognition**:
- Kiro just generated infrastructure code
- Natural checkpoint after generation
- User may not know if generated code follows best practices

**Kiro Suggestion**:
> "I've generated your VPC infrastructure code. Would you like me to verify it follows Well-Architected best practices? I can check that security groups, network ACLs, and subnet configurations are properly secured."

**If User Accepts**: Review the generated code for:
- Security: Proper network segmentation, security group rules, no overly permissive access
- Reliability: Multi-AZ subnets, proper routing
- Operational Excellence: Proper tagging, naming conventions

### Example 7: Complex Multi-Service Architecture

**Context**: User has created a CDK app with API Gateway, Lambda, DynamoDB, S3, and CloudFront

**User Action**: Completes the CDK code

**Kiro Recognition**:
- Complex architecture with 5+ services
- Service integration points
- High value from holistic review

**Kiro Suggestion**:
> "You've built a comprehensive architecture with API Gateway, Lambda, DynamoDB, S3, and CloudFront. Would you like me to review how these services work together against Well-Architected best practices? I can check security, reliability, and performance across the entire system."

**If User Accepts**: Review the architecture holistically:
- Security: API Gateway authentication, Lambda IAM roles, DynamoDB encryption, S3 bucket policies, CloudFront HTTPS
- Reliability: DynamoDB backups, S3 versioning, Lambda error handling, API Gateway throttling
- Performance: CloudFront caching, DynamoDB capacity, Lambda memory configuration
- Cost: DynamoDB on-demand vs provisioned, S3 storage classes, CloudFront pricing

## When NOT to Suggest Reviews

### Avoid Suggestions When:

1. **User Just Declined**: Don't suggest again in the same conversation unless context significantly changes
2. **User Is Actively Coding**: Wait for a natural breakpoint, don't interrupt flow
3. **User Is Troubleshooting Urgent Issue**: Focus on resolving the immediate problem first
4. **Non-Infrastructure Work**: User is working on application logic, not infrastructure
5. **Read-Only Operations**: User is just reading/listing AWS resources, not creating them
6. **Already Reviewed**: Don't suggest reviewing the same code multiple times without changes
7. **User Is in a Hurry**: If user indicates urgency, don't slow them down with suggestions

### Examples of When NOT to Suggest

❌ **Don't Suggest**: User is writing application code that uses AWS SDK to read from S3
- **Why**: This is application logic, not infrastructure provisioning

❌ **Don't Suggest**: User just said "no thanks" to a review suggestion
- **Why**: Respect the user's decision, don't be pushy

❌ **Don't Suggest**: User is debugging a production outage
- **Why**: Focus on resolving the urgent issue first, suggest review after resolution

❌ **Don't Suggest**: User is in the middle of typing a Terraform resource block
- **Why**: Don't interrupt active coding, wait for completion

❌ **Don't Suggest**: User is running `aws s3 ls` to list buckets
- **Why**: Read-only operation, not infrastructure changes

## Integration with Development Workflows

### Natural Breakpoints for Suggestions

1. **After Code Completion**: User finishes writing IaC code
2. **Before Deployment**: User mentions deploying or asks about deployment
3. **During Architecture Discussion**: User asks architecture questions
4. **After Code Generation**: Kiro generates infrastructure code
5. **After Issue Resolution**: User's problem is solved, good time for proactive review
6. **During Code Review**: User asks for feedback on their code

### Workflow Integration Examples

**Workflow 1: Development → Review → Deploy**
1. User writes Terraform code
2. User says "I think I'm done"
3. Kiro suggests: "Would you like me to review this before deployment?"
4. User accepts
5. Kiro runs review, provides findings
6. User fixes issues
7. User deploys with confidence

**Workflow 2: Question → Answer → Proactive Review**
1. User asks: "How do I make my RDS database highly available?"
2. Kiro answers: "Enable Multi-AZ deployment..."
3. Kiro suggests: "Would you like me to review your entire database configuration for reliability and security?"
4. User accepts
5. Kiro identifies additional improvements (encryption, backup retention, etc.)

**Workflow 3: Generation → Validation → Deployment**
1. User asks: "Generate Terraform code for a secure S3 bucket"
2. Kiro generates code with encryption, public access blocks, etc.
3. Kiro suggests: "I've generated the code. Would you like me to verify it follows all security best practices?"
4. User accepts
5. Kiro validates and confirms the code is secure
6. User deploys with confidence

## Measuring Effectiveness

### Success Indicators

- **Acceptance Rate**: Percentage of suggestions that users accept
- **Issue Prevention**: Number of issues caught before deployment
- **User Satisfaction**: Users find suggestions helpful, not annoying
- **Timing**: Suggestions come at natural breakpoints, not interruptions

### Adjusting Based on Feedback

- If users frequently decline, suggestions may be too frequent or poorly timed
- If users say "not now", respect that and wait for better timing
- If users ask "what's that?", provide better context in future suggestions
- If users accept and find value, continue with similar patterns

## Summary

Proactive Well-Architected review suggestions should be:

1. **Context-Aware**: Recognize IaC files and architecture discussions
2. **Well-Timed**: Suggest at natural breakpoints, not during active work
3. **Value-Focused**: Explain specific benefits in current context
4. **Non-Intrusive**: Ask, don't demand; respect declines
5. **Actionable**: Lead to concrete improvements when accepted

By following these guidelines, Kiro can help developers catch architecture issues early while respecting their workflow and maintaining a positive, helpful presence.
