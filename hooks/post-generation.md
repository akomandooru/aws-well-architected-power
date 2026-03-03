# Post-Generation Hook Template - AWS Well-Architected Review

## Overview

This hook automatically triggers a Well-Architected Framework review **after** Kiro generates infrastructure code. It ensures that AI-generated infrastructure code follows AWS best practices for security, reliability, performance, cost optimization, operational excellence, and sustainability from the moment it's created.

## Hook Configuration

```json
{
  "id": "aws-waf-post-generation",
  "name": "AWS Well-Architected Review After Code Generation",
  "description": "Automatically reviews AI-generated infrastructure code against AWS Well-Architected best practices",
  "eventType": "postToolUse",
  "toolTypes": "write",
  "hookAction": "askAgent",
  "outputPrompt": "Infrastructure code was just generated. Perform an immediate AWS Well-Architected Framework review to ensure the generated code follows best practices:\n\n**REVIEW FOCUS**:\n1. **Security**: Verify encryption, IAM policies, network security, no hardcoded credentials\n2. **Reliability**: Check for multi-AZ deployment, backups, fault tolerance, health checks\n3. **Performance Efficiency**: Validate resource sizing, caching strategies, monitoring\n4. **Cost Optimization**: Ensure right-sizing, auto-scaling, efficient resource usage\n5. **Operational Excellence**: Verify logging, monitoring, automation, documentation\n6. **Sustainability**: Check for energy-efficient configurations, appropriate instance types\n\n**ANALYSIS SCOPE**:\n- Review all newly generated IaC files (*.tf, *.yaml, *.json, *.ts, *.py)\n- Identify any Well-Architected violations or anti-patterns\n- Check for common AI generation issues (over-provisioning, missing security, incomplete configurations)\n- Verify the code is production-ready or clearly marked as a starting point\n\n**OUTPUT FORMAT**:\n- Start with: \"✅ Generated code follows Well-Architected best practices\" or \"⚠️ Generated code needs improvements\"\n- List any issues found with specific file names and line numbers\n- Provide actionable recommendations for each issue\n- Prioritize by risk level (critical, high, medium, low)\n- Suggest improvements that maintain the generated code's intent\n\n**TONE**: Be constructive and educational. Explain why certain patterns are recommended and how to improve the generated code."
}
```

## When This Hook Triggers

This hook activates **after** Kiro generates infrastructure code, specifically when:

- **File creation**: Kiro creates new IaC files (*.tf, *.yaml, *.json, *.ts, *.py)
- **Code generation**: Kiro writes infrastructure code in response to user requests
- **Template expansion**: Kiro generates infrastructure from templates or patterns

## What This Hook Does

When triggered, the hook:

1. **Detects code generation** by monitoring write operations
2. **Identifies infrastructure code** (Terraform, CloudFormation, CDK, Pulumi)
3. **Performs immediate Well-Architected review** of the generated code
4. **Identifies issues and anti-patterns** common in AI-generated code
5. **Provides specific recommendations** to improve the code
6. **Educates on best practices** explaining why certain patterns are recommended

## Benefits

- ✅ **Immediate Quality Check**: Review generated code before you even look at it
- 🛡️ **Security by Default**: Catch security issues in AI-generated code immediately
- 📚 **Learning Tool**: Understand what makes infrastructure code production-ready
- 🚀 **Faster Development**: Start with better code, spend less time fixing issues
- 💰 **Cost Control**: Prevent AI from generating expensive configurations
- ✨ **Best Practices**: Ensure generated code follows AWS recommendations
- 🔄 **Continuous Improvement**: Learn patterns to request better code generation

## Installation

### Option 1: User-Level Installation (All Projects)

Install this hook to review all AI-generated infrastructure code across all your projects:

```bash
# Copy the hook to your user-level Kiro hooks directory
cp aws-well-architected-power/hooks/post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md
```

### Option 2: Workspace-Level Installation (Current Project Only)

Install this hook for the current project only:

```bash
# Copy the hook to your workspace-level Kiro hooks directory
cp aws-well-architected-power/hooks/post-generation.md .kiro/hooks/aws-waf-post-generation.md
```

### Verification

After installation, the hook will automatically activate when Kiro generates infrastructure code. To verify:

1. Ask Kiro to generate infrastructure code: "Create a Terraform configuration for an S3 bucket"
2. After Kiro generates the code, the hook should automatically trigger
3. You should see a Well-Architected review of the generated code

## Customization

You can customize this hook to fit your specific needs:

### Customize Review Focus

Adjust which pillars to emphasize:

```json
// Security-focused review
"outputPrompt": "Review the generated infrastructure code with heavy focus on Security Pillar. Verify encryption at rest and in transit, IAM policies follow least privilege, security groups are restrictive, no hardcoded credentials, and all security best practices are followed. Flag any security concerns as high priority."

// Cost-conscious review
"outputPrompt": "Review the generated infrastructure code with focus on Cost Optimization. Check for oversized resources, missing auto-scaling, expensive configurations, and opportunities to reduce costs without impacting functionality. AI often over-provisions - identify right-sizing opportunities."

// Production-readiness review
"outputPrompt": "Review the generated infrastructure code for production readiness. Focus on Security and Reliability pillars. Ensure multi-AZ deployment, backups, monitoring, logging, encryption, and fault tolerance are all properly configured. Flag anything that makes this code not production-ready."
```

### Customize Review Depth

Adjust the level of detail:

```json
// Quick review (high-priority issues only)
"outputPrompt": "Quick review of generated infrastructure code. Focus only on critical security issues and major reliability concerns. Keep feedback concise - just the top 3 most important improvements."

// Comprehensive review (all issues, all pillars)
"outputPrompt": "Comprehensive Well-Architected review of generated infrastructure code. Analyze all six pillars in detail. Identify all issues regardless of severity. Provide detailed explanations and remediation guidance. Include examples of improved code."

// Learning mode (detailed explanations)
"outputPrompt": "Educational review of generated infrastructure code. For each issue found, explain: 1) What the issue is, 2) Why it matters, 3) What could go wrong, 4) How to fix it, 5) Example of the improved code. Help the user learn to request better code generation in the future."
```

### Customize File Type Detection

Focus on specific infrastructure code types:

```json
// Terraform only
"outputPrompt": "If Terraform files (*.tf) were generated, review them against Well-Architected best practices..."

// CloudFormation only
"outputPrompt": "If CloudFormation templates (*.yaml, *.json) were generated, review them against Well-Architected best practices..."

// CDK only
"outputPrompt": "If CDK code (*.ts, *.py) was generated, review the infrastructure constructs against Well-Architected best practices..."
```

### Customize for Environment

Adjust standards based on environment:

```json
// Development environment (relaxed)
"outputPrompt": "Review generated code for development environment. Security and reliability can be relaxed for dev/test. Focus on cost optimization - flag expensive resources that aren't necessary for development. Suggest cheaper alternatives."

// Production environment (strict)
"outputPrompt": "Review generated code for PRODUCTION environment. Apply strict Well-Architected standards. Any security misconfiguration, single point of failure, or missing monitoring should be flagged as high priority. Code must be production-ready."

// Compliance environment (security-focused)
"outputPrompt": "Review generated code for compliance requirements (HIPAA/PCI-DSS/SOC2). Verify encryption, access controls, audit logging, and security configurations meet regulatory standards. Flag any compliance concerns."
```

## Use Cases

### Use Case 1: AI-Generated Infrastructure

**Scenario**: You ask Kiro to generate infrastructure code for a new application.

**How It Helps**:
- Immediately reviews the generated code for Well-Architected compliance
- Catches common AI generation issues (over-provisioning, missing security)
- Provides specific improvements before you even review the code
- Helps you learn what to request for better initial generation
- Saves time by starting with higher-quality code

**Best Practice**: Always enable this hook when using AI to generate infrastructure.

**Example**:
```
You: "Create a Terraform configuration for a web application with RDS database"

Kiro: [Generates Terraform code]

Hook triggers automatically:

🔍 Post-Generation Well-Architected Review

Analyzing generated infrastructure code...

⚠️ ISSUES FOUND:

1. main.tf:15 - EC2 instance has no security group (HIGH)
   Why: Instance will be exposed to all network traffic
   Fix: Add aws_security_group resource with restrictive ingress rules

2. database.tf:8 - RDS instance not encrypted (HIGH)
   Why: Data at rest not protected, compliance violation
   Fix: Add `storage_encrypted = true` to aws_db_instance

3. database.tf:12 - Single-AZ RDS deployment (MEDIUM)
   Why: No automatic failover, single point of failure
   Fix: Add `multi_az = true` for production reliability

4. main.tf:22 - Instance type t2.large may be oversized (LOW)
   Why: AI often over-provisions resources
   Fix: Consider t3.medium or t3.small for cost optimization

💡 RECOMMENDATIONS:
- Add security groups before deploying
- Enable encryption for all data stores
- Consider multi-AZ for production workloads
- Right-size instances based on actual requirements

The generated code is a good starting point but needs security and reliability improvements before production use.
```

### Use Case 2: Learning AWS Best Practices

**Scenario**: You're learning AWS and using AI to help generate infrastructure code.

**How It Helps**:
- Teaches you what makes infrastructure code production-ready
- Explains why certain patterns are recommended
- Shows you how to improve AI-generated code
- Helps you learn to request better code generation
- Builds understanding of Well-Architected Framework

**Best Practice**: Use learning mode customization for detailed explanations.

### Use Case 3: Rapid Prototyping

**Scenario**: You're quickly prototyping infrastructure for a new project.

**How It Helps**:
- Ensures even prototype code follows basic best practices
- Catches security issues before they become habits
- Identifies cost optimization opportunities early
- Makes it easier to promote prototype to production later
- Prevents technical debt from accumulating

**Best Practice**: Use balanced review mode - catch critical issues but allow faster iteration.

### Use Case 4: Team Standardization

**Scenario**: Multiple team members use AI to generate infrastructure code.

**How It Helps**:
- Ensures consistent quality across all AI-generated code
- Educates team members on best practices
- Catches issues regardless of who generated the code
- Creates shared understanding of infrastructure standards
- Reduces code review burden

**Best Practice**: Install at workspace level so all team members benefit.

### Use Case 5: Production Infrastructure

**Scenario**: Using AI to generate production infrastructure code.

**How It Helps**:
- Applies strict Well-Architected standards to generated code
- Catches security and reliability issues immediately
- Ensures generated code is production-ready
- Reduces risk of deploying flawed AI-generated code
- Provides confidence in AI-assisted development

**Best Practice**: Use production-readiness customization with strict standards.

### Use Case 6: Cost Control

**Scenario**: Need to prevent AI from generating expensive infrastructure.

**How It Helps**:
- Identifies oversized resources in generated code
- Catches missing auto-scaling or right-sizing
- Flags expensive configurations before deployment
- Teaches AI to generate more cost-effective code
- Prevents cost surprises

**Best Practice**: Customize to focus on Cost Optimization pillar.

## Considerations

### When to Use This Hook

✅ **Use when**:
- Using AI to generate infrastructure code
- Learning AWS best practices
- Need consistent code quality standards
- Working on production infrastructure
- Team uses AI-assisted development
- Cost control is important
- Security and compliance are critical

### When to Disable This Hook

❌ **Consider disabling when**:
- Generating non-infrastructure code
- Making quick experiments or tests
- Very experienced and prefer manual review
- Hook feedback is slowing down iteration
- Working on non-AWS infrastructure

### Performance Impact

- **Minimal**: Reviews typically complete in 2-5 seconds
- **Asynchronous**: Doesn't block your ability to continue working
- **Automatic**: No manual action required
- **Configurable**: Can be disabled temporarily without uninstalling

## Troubleshooting

### Hook Not Triggering

**Problem**: Kiro generates infrastructure code but no review happens.

**Solutions**:
1. Verify the hook file is in the correct location (`~/.kiro/hooks/` or `.kiro/hooks/`)
2. Ensure the hook is enabled in your Kiro configuration
3. Check that the generated files match infrastructure patterns (*.tf, *.yaml, etc.)
4. Verify the `eventType` is set to `postToolUse` and `toolTypes` includes `write`
5. Restart Kiro if you just installed the hook

### Hook Triggers Too Often

**Problem**: The hook triggers on non-infrastructure code generation.

**Solutions**:
1. Refine the file pattern detection in the prompt
2. Add explicit file type checks (only *.tf, *.yaml, etc.)
3. Customize to only trigger on specific file patterns
4. Use workspace-level installation for specific projects only

### Reviews Are Too Detailed

**Problem**: The review output is overwhelming or too verbose.

**Solutions**:
1. Use quick review mode (high-priority issues only)
2. Request concise feedback in the prompt
3. Focus on specific pillars instead of all six
4. Limit to top 3-5 most important issues

### Reviews Miss Issues

**Problem**: The review doesn't catch issues you expected.

**Solutions**:
1. Use comprehensive review mode
2. Ensure AWS MCP servers are properly configured
3. Verify the generated code contains actual AWS resources
4. Try manual review to compare results
5. Customize the prompt to focus on specific concerns

### False Positives

**Problem**: The review flags things that aren't actually issues.

**Solutions**:
1. Provide context about your specific requirements
2. Customize the prompt to exclude specific checks
3. Use environment-specific configuration (dev vs. production)
4. Adjust risk thresholds for your use case

## Examples

### Example 1: Terraform S3 Bucket Generation

**Request**: "Create a Terraform configuration for an S3 bucket to store application logs"

**Generated Code**:
```hcl
resource "aws_s3_bucket" "logs" {
  bucket = "my-app-logs"
  
  tags = {
    Name = "Application Logs"
  }
}
```

**Hook Output**:
```
🔍 Post-Generation Well-Architected Review

⚠️ Generated code needs improvements

ISSUES FOUND:

1. Bucket encryption not enabled (HIGH PRIORITY)
   Impact: Log data stored unencrypted, compliance violation
   Fix: Add encryption configuration:
   ```hcl
   resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
     bucket = aws_s3_bucket.logs.id
     rule {
       apply_server_side_encryption_by_default {
         sse_algorithm = "AES256"
       }
     }
   }
   ```

2. No bucket versioning (MEDIUM PRIORITY)
   Impact: Accidental deletions cannot be recovered
   Fix: Add versioning:
   ```hcl
   resource "aws_s3_bucket_versioning" "logs" {
     bucket = aws_s3_bucket.logs.id
     versioning_configuration {
       status = "Enabled"
     }
   }
   ```

3. No lifecycle policy (LOW PRIORITY)
   Impact: Logs stored indefinitely, increasing costs
   Fix: Add lifecycle rule to transition old logs to cheaper storage

4. Public access not explicitly blocked (HIGH PRIORITY)
   Impact: Bucket could be accidentally made public
   Fix: Add public access block:
   ```hcl
   resource "aws_s3_bucket_public_access_block" "logs" {
     bucket = aws_s3_bucket.logs.id
     block_public_acls       = true
     block_public_policy     = true
     ignore_public_acls      = true
     restrict_public_buckets = true
   }
   ```

SUMMARY: The generated code is a good starting point but needs security hardening before use.
```

### Example 2: CloudFormation RDS Database

**Request**: "Create a CloudFormation template for a PostgreSQL RDS database"

**Generated Code**:
```yaml
Resources:
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      Engine: postgres
      EngineVersion: "15.3"
      DBInstanceClass: db.t3.medium
      AllocatedStorage: 100
      MasterUsername: admin
      MasterUserPassword: !Ref DBPassword
```

**Hook Output**:
```
🔍 Post-Generation Well-Architected Review

⚠️ Generated code needs improvements

ISSUES FOUND:

1. Multi-AZ not enabled (HIGH PRIORITY)
   Impact: Single point of failure, no automatic failover
   Fix: Add `MultiAZ: true` to Properties

2. Storage encryption not enabled (HIGH PRIORITY)
   Impact: Database data stored unencrypted
   Fix: Add `StorageEncrypted: true` to Properties

3. No backup retention configured (MEDIUM PRIORITY)
   Impact: No automated backups for disaster recovery
   Fix: Add `BackupRetentionPeriod: 7` (or higher for production)

4. No enhanced monitoring (LOW PRIORITY)
   Impact: Limited visibility into database performance
   Fix: Add `MonitoringInterval: 60` and `MonitoringRoleArn`

5. Public accessibility not explicitly disabled (MEDIUM PRIORITY)
   Impact: Database could be exposed to internet
   Fix: Add `PubliclyAccessible: false` to Properties

POSITIVE ASPECTS:
✅ Password uses parameter reference (not hardcoded)
✅ Appropriate instance size for general workloads
✅ Recent PostgreSQL version

SUMMARY: Add Multi-AZ and encryption before deploying to production.
```

### Example 3: CDK Application Stack

**Request**: "Create a CDK stack for a containerized web application"

**Generated Code** (TypeScript):
```typescript
export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: new ec2.Vpc(this, 'VPC')
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('my-app:latest'),
      },
    });
  }
}
```

**Hook Output**:
```
🔍 Post-Generation Well-Architected Review

✅ Generated code follows many Well-Architected best practices

POSITIVE ASPECTS:
✅ Uses Fargate (serverless, no server management)
✅ Application Load Balancer for high availability
✅ VPC isolation for network security
✅ Good starting structure for containerized app

RECOMMENDED IMPROVEMENTS:

1. VPC configuration could be more explicit (MEDIUM)
   Current: Uses default VPC configuration
   Better: Specify multi-AZ, private subnets for containers
   ```typescript
   const vpc = new ec2.Vpc(this, 'VPC', {
     maxAzs: 3,
     natGateways: 2,
   });
   ```

2. No health check configuration (MEDIUM)
   Impact: Service may route traffic to unhealthy containers
   Fix: Add health check to task definition

3. No auto-scaling configured (MEDIUM)
   Impact: Fixed capacity, cannot handle traffic spikes
   Fix: Add auto-scaling policies based on CPU/memory

4. Container image uses 'latest' tag (LOW)
   Impact: Unpredictable deployments, hard to rollback
   Fix: Use specific version tags

5. No monitoring/alarms configured (LOW)
   Impact: Limited visibility into application health
   Fix: Add CloudWatch alarms for key metrics

SUMMARY: Excellent starting point! The generated code uses modern AWS patterns. Add the improvements above for production readiness.
```

## Best Practices

1. **Always Enable for AI Generation**: Make this hook standard when using AI to generate infrastructure
2. **Review Immediately**: Look at the hook's feedback right after code generation
3. **Iterate with AI**: Use the feedback to request improved code generation
4. **Learn Patterns**: Pay attention to recurring issues and adjust your requests
5. **Combine with Other Hooks**: Use post-generation for initial review, file-save for modifications, pre-deployment for final check
6. **Customize for Context**: Adjust review focus based on environment (dev vs. production)
7. **Share with Team**: Install at workspace level so everyone benefits
8. **Document Decisions**: If you intentionally keep AI-generated code as-is despite issues, document why
9. **Teach the AI**: Use feedback to improve future generation requests
10. **Balance Speed and Quality**: Use quick review for prototypes, comprehensive for production

## Integration with Other Hooks

This hook works well in combination with other Well-Architected hooks:

- **Post-Generation Hook** (this hook): Reviews AI-generated code immediately
- **File-Save Hook**: Catches issues when you modify the generated code
- **Pre-Deployment Hook**: Final safety check before deployment

**Recommended Workflow**:
1. Request infrastructure code from AI → **Post-Generation Hook** reviews generated code
2. Modify the code based on feedback → **File-Save Hook** reviews your changes
3. Ready to deploy → **Pre-Deployment Hook** performs final safety check

## Related Resources

- **Main Power Documentation**: `../POWER.md`
- **File-Save Hook**: `./file-save.md` (for development-time reviews)
- **Pre-Deployment Hook**: `./pre-deployment.md` (for pre-deployment reviews)
- **Code Generation Guidance**: `../steering/code-generation-guidance.md`
- **Pillar-Specific Guidance**: `../steering/`
  - Security: `../steering/security.md`
  - Reliability: `../steering/reliability.md`
  - Performance: `../steering/performance.md`
  - Cost Optimization: `../steering/cost-optimization.md`
  - Operational Excellence: `../steering/operational-excellence.md`
  - Sustainability: `../steering/sustainability.md`
- **Proactive Review Guidance**: `../steering/proactive-review-guidance.md`
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main power documentation (`../POWER.md`)
3. Check Kiro documentation for hook system details
4. Open an issue in the power repository

---

**Note**: This hook is optional and requires explicit installation. It will not activate until you copy it to your Kiro hooks directory. This hook is designed to improve AI-generated code quality but should not replace proper code review and testing processes.
