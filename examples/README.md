# AWS Well-Architected Power Examples

This directory contains comprehensive examples demonstrating the AWS Well-Architected Power capabilities, including IaC analysis examples and guided review workflow examples.

## What's Included

- **Mode Selection Examples**: Comprehensive examples demonstrating Simple, Context-Aware, and Full Analysis modes
- **Learning Mode Examples**: Detailed educational examples with explanations, real-world scenarios, anti-patterns, and quizzes
- **IaC Analysis Examples**: Infrastructure as Code files with common Well-Architected issues and their remediation
- **Review Workflow Examples**: Complete review sessions and reports demonstrating the guided review process
- **Trade-Off Scenarios**: Examples of context-aware trade-off analysis and decision-making
- **Decision Matrices**: Examples of decision matrices for comparing architecture options

These examples are useful for:

- Understanding the three review modes and when to use each
- Learning AWS Well-Architected best practices in depth
- Testing the AWS Well-Architected Power
- Learning about common architecture anti-patterns
- Understanding the guided review workflow
- Understanding how to fix Well-Architected issues
- Making context-aware architecture decisions with trade-off analysis
- Training and documentation purposes

## Directory Structure

```
examples/
├── mode-selection-examples.md  # Review mode examples and comparisons
├── trade-off-scenarios.md      # Context-aware trade-off examples
├── decision-matrices.md        # Decision matrix examples
├── learning/                   # Learning mode examples with detailed explanations
├── terraform/                  # Terraform examples (Security Pillar)
├── cloudformation/             # CloudFormation examples (Reliability Pillar)
├── cdk/                       # AWS CDK examples (Cost Optimization Pillar)
├── application-code/          # Application code examples
├── reviews/                   # Review workflow examples and reports
└── README.md                  # This file
```

## Examples Overview

### Mode Selection Examples

**mode-selection-examples.md** - Comprehensive demonstration of the three review modes:
- **Simple Mode**: Fast prescriptive guidance for quick checks and CI/CD
- **Context-Aware Mode**: Conditional recommendations based on system context
- **Full Analysis Mode**: Comprehensive analysis with decision matrices and ROI
- **Automatic Mode Detection**: Examples of file path and CI/CD detection
- **Explicit Mode Overrides**: How to request specific modes
- **Mode Switching**: Mid-session mode changes with context preservation
- **Expected Outputs**: Side-by-side comparison of same issue across all modes

Each mode example includes:
- Real infrastructure code scenarios
- Complete output examples showing different analysis depths
- Performance characteristics (latency, token consumption, cost)
- When to use each mode
- Cost optimization strategies

See [mode-selection-examples.md](mode-selection-examples.md) for the complete guide.

### Trade-Off Scenarios

**trade-off-scenarios.md** - Context-aware decision-making examples:
- Multi-AZ vs Single-AZ trade-offs for different contexts
- Storage class selection based on access patterns
- Compute instance sizing with cost-performance trade-offs
- Caching strategy comparisons
- Security vs convenience trade-offs

See [trade-off-scenarios.md](trade-off-scenarios.md) for detailed scenarios.

### Decision Matrices

**decision-matrices.md** - Architecture option comparison examples:
- Database high availability options
- Caching architecture comparisons
- Compute platform selection
- Storage solution comparisons
- Network architecture options

See [decision-matrices.md](decision-matrices.md) for complete matrices.

### Learning Mode Examples

**learning/** - Educational examples with comprehensive explanations:
- **Security Pillar**: IAM best practices with real-world examples and anti-patterns
- **Reliability Pillar**: High availability architecture patterns and failure scenarios
- **Performance Efficiency Pillar**: Compute selection guide with cost comparisons
- **Cost Optimization Pillar**: Right-sizing strategies with ROI calculations
- **Operational Excellence Pillar**: Monitoring and observability patterns

Each learning example includes:
- Detailed explanation of why the best practice matters
- Real-world scenarios with correct implementations
- Common anti-patterns and why they're problematic
- Rationale behind recommendations with data
- Links to official AWS documentation
- Quiz questions to test understanding

See [learning/README.md](learning/README.md) for the complete learning guide.

### Review Workflow Examples

**reviews/** - Complete guided review workflow demonstration:
- Example review session JSON with 24 questions answered
- Markdown report with detailed findings and remediation
- JSON report for automation and integration
- HTML report for stakeholder presentations
- Comprehensive workflow guide

See [reviews/README.md](reviews/README.md) for detailed documentation.

### Terraform Examples (Security Pillar)

**security-issues.tf** - Demonstrates common security violations:
- Unencrypted S3 buckets
- Overly permissive IAM policies
- Security groups allowing unrestricted access
- Missing encryption for EBS volumes
- Public RDS instances

**security-issues-fixed.tf** - Remediated version showing best practices

See [terraform/README.md](terraform/README.md) for detailed documentation.

### CloudFormation Examples (Reliability Pillar)

**reliability-issues.yaml** - Demonstrates reliability anti-patterns:
- Single-AZ deployments
- Missing backup configurations
- No auto-scaling
- Lack of health checks
- Missing disaster recovery

**reliability-issues-fixed.yaml** - Remediated version with reliability improvements

See [cloudformation/README.md](cloudformation/README.md) for detailed documentation.

### CDK Examples (Cost Optimization Pillar)

**cost-optimization-issues.ts** - Demonstrates cost inefficiencies:
- Over-provisioned resources
- Missing auto-scaling
- Lack of lifecycle policies
- Always-on development resources
- No cost allocation tags

**cost-optimization-issues-fixed.ts** - Remediated version with cost optimizations

See [cdk/README.md](cdk/README.md) for detailed documentation and setup instructions.

## Using These Examples

### Mode Selection Examples

1. **Understand the modes**: Read the overview of Simple, Context-Aware, and Full Analysis modes
2. **Review the scenarios**: See how each mode handles the same infrastructure issue
3. **Compare outputs**: Understand the differences in depth and detail
4. **Learn detection rules**: See how automatic mode detection works
5. **Practice mode selection**: Choose the right mode for your use case
6. **Optimize costs**: Use the cost comparison to balance thoroughness with budget

When using the AWS Well-Architected Power, Kiro will automatically select the appropriate mode based on context, or you can explicitly request a specific mode.

### Learning Mode Examples

1. **Start with a pillar**: Choose the pillar most relevant to your current work
2. **Read the explanation**: Understand the "why" behind the best practice
3. **Study the examples**: See how to implement patterns correctly
4. **Learn from anti-patterns**: Recognize common mistakes to avoid
5. **Test your knowledge**: Complete the quiz questions
6. **Follow the links**: Dive deeper with official AWS documentation

When using the AWS Well-Architected Power with learning mode enabled, Kiro will automatically provide these detailed explanations during reviews.

### Review Workflow Examples

1. **Read the workflow guide**: Start with `reviews/workflow-guide.md` to understand the complete review process
2. **Examine the session**: Review `reviews/session-example.json` to see how a review session is structured
3. **Compare report formats**: Look at the Markdown, JSON, and HTML reports to understand different use cases
4. **Conduct your own review**: Use the examples as templates for reviewing your own architecture

### IaC Analysis Examples

### With the AWS Well-Architected Power

1. Open any example file in your editor
2. Ask Kiro to review it: "Review this infrastructure code against AWS Well-Architected best practices"
3. Compare the findings with the documented expected findings below
4. Review the fixed version to understand the remediation

### For Learning

1. Read the issue file and try to identify problems yourself
2. Check the expected findings to see what you missed
3. Study the fixed version to understand the solutions
4. Apply these patterns to your own infrastructure code

## Expected Findings

### Terraform Security Issues (security-issues.tf)

**High Risk Issues:**
1. **Unencrypted S3 Bucket** (Line 2-5)
   - Issue: S3 bucket lacks server-side encryption
   - Pillar: Security
   - Remediation: Enable default encryption with AES256 or KMS

2. **Overly Permissive IAM Policy** (Line 8-20)
   - Issue: IAM policy grants `*` actions on `*` resources
   - Pillar: Security
   - Remediation: Apply least privilege principle with specific actions and resources

3. **Unrestricted Security Group** (Line 23-35)
   - Issue: Security group allows 0.0.0.0/0 on all ports
   - Pillar: Security
   - Remediation: Restrict to specific IPs and required ports only

4. **Unencrypted EBS Volume** (Line 38-43)
   - Issue: EBS volume not encrypted
   - Pillar: Security
   - Remediation: Enable encryption with KMS key

5. **Publicly Accessible RDS** (Line 46-56)
   - Issue: RDS instance is publicly accessible
   - Pillar: Security
   - Remediation: Set publicly_accessible = false, use VPC endpoints

### CloudFormation Reliability Issues (reliability-issues.yaml)

**High Risk Issues:**
1. **Single-AZ EC2 Instance** (Line 5-12)
   - Issue: EC2 instance in single availability zone
   - Pillar: Reliability
   - Remediation: Use Auto Scaling Group across multiple AZs

2. **No Backup Configuration** (Line 14-25)
   - Issue: RDS instance without automated backups
   - Pillar: Reliability
   - Remediation: Enable automated backups with retention period

3. **Missing Health Checks** (Line 27-38)
   - Issue: Load balancer without health checks
   - Pillar: Reliability
   - Remediation: Configure health check with appropriate thresholds

4. **No Auto Scaling** (Line 40-48)
   - Issue: Fixed capacity without auto-scaling
   - Pillar: Reliability
   - Remediation: Implement Auto Scaling based on metrics

5. **Single-AZ RDS** (Line 50-60)
   - Issue: RDS without Multi-AZ deployment
   - Pillar: Reliability
   - Remediation: Enable Multi-AZ for automatic failover

### CDK Cost Optimization Issues (cost-optimization-issues.ts)

**Medium Risk Issues:**
1. **Over-Provisioned EC2** (Line 15-20)
   - Issue: Using c5.4xlarge for development workload
   - Pillar: Cost Optimization
   - Remediation: Right-size to t3.medium or use Spot instances

2. **Missing Auto Scaling** (Line 22-28)
   - Issue: Fixed capacity regardless of demand
   - Pillar: Cost Optimization
   - Remediation: Implement auto-scaling to match demand

3. **No S3 Lifecycle Policy** (Line 30-35)
   - Issue: All objects remain in Standard storage class
   - Pillar: Cost Optimization
   - Remediation: Add lifecycle rules to transition to cheaper storage

4. **Always-On Development Resources** (Line 37-45)
   - Issue: Development database runs 24/7
   - Pillar: Cost Optimization
   - Remediation: Use scheduled scaling or serverless options

5. **Missing Cost Allocation Tags** (Line 47-52)
   - Issue: No tags for cost tracking and allocation
   - Pillar: Cost Optimization
   - Remediation: Add cost center, project, and environment tags

## Contributing

If you have additional examples of Well-Architected issues or improvements to existing examples, please contribute them following the same pattern:
1. Create the issue file with clear anti-patterns
2. Create the fixed version with best practices
3. Document expected findings in this README
4. Add inline comments explaining the issues and fixes
