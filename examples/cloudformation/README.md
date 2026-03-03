# CloudFormation Reliability Examples

This directory contains CloudFormation examples demonstrating common reliability anti-patterns and their remediation according to AWS Well-Architected Framework best practices.

## Files

- **reliability-issues.yaml** - Infrastructure template with reliability problems
- **reliability-issues-fixed.yaml** - Remediated version with reliability best practices

## Reliability Issues Demonstrated

### 1. Single-AZ EC2 Instance
**Issue:** EC2 instance deployed in a single availability zone
**Risk:** Single point of failure, no redundancy
**Fix:** Use Auto Scaling Group across multiple AZs

### 2. RDS Without Automated Backups
**Issue:** RDS with `BackupRetentionPeriod: 0` and `MultiAZ: false`
**Risk:** Data loss, no disaster recovery capability
**Fix:** Enable Multi-AZ, set backup retention to 7 days, add read replica

### 3. Load Balancer Without Health Checks
**Issue:** Target group without health check configuration
**Risk:** Traffic routed to unhealthy instances
**Fix:** Configure comprehensive health checks with appropriate thresholds

### 4. No Auto Scaling
**Issue:** Fixed capacity without auto-scaling policies
**Risk:** Cannot handle traffic spikes, wastes resources during low traffic
**Fix:** Implement Auto Scaling Groups with target tracking policies

### 5. S3 Without Versioning or Replication
**Issue:** S3 bucket without versioning or cross-region replication
**Risk:** Accidental deletion, no disaster recovery
**Fix:** Enable versioning, configure replication, add lifecycle policies

### 6. Lambda Without Dead Letter Queue
**Issue:** Lambda function without DLQ or reserved concurrency
**Risk:** Lost failed invocations, potential throttling of other functions
**Fix:** Add DLQ, set reserved concurrency, enable X-Ray tracing

### 7. DynamoDB Without Point-in-Time Recovery
**Issue:** DynamoDB table without PITR enabled
**Risk:** Cannot recover from accidental data corruption
**Fix:** Enable point-in-time recovery, add encryption, consider global tables

### 8. ECS Service Without Auto Scaling
**Issue:** ECS service with fixed desired count
**Risk:** Cannot handle load variations, potential service degradation
**Fix:** Configure service auto scaling with target tracking

## Usage

### Analyze the Issues Template

```bash
# Validate template syntax
aws cloudformation validate-template \
  --template-body file://reliability-issues.yaml

# Create change set (don't execute!)
aws cloudformation create-change-set \
  --stack-name reliability-issues-stack \
  --template-body file://reliability-issues.yaml \
  --change-set-name review-issues

# Use AWS Well-Architected Power to review
# Ask Kiro: "Review this CloudFormation template for reliability issues"
```

### Review the Fixed Version

```bash
# Compare the templates
diff reliability-issues.yaml reliability-issues-fixed.yaml

# Validate fixed template
aws cloudformation validate-template \
  --template-body file://reliability-issues-fixed.yaml

# Review improvements with Kiro
# Ask Kiro: "Explain the reliability improvements in this template"
```

## Key Reliability Best Practices Applied

1. **Multi-AZ Deployments**
   - Auto Scaling Groups across 3 AZs
   - RDS Multi-AZ with automatic failover
   - ECS tasks distributed across AZs
   - Load balancers in multiple AZs

2. **Automated Backups**
   - RDS automated backups with 7-day retention
   - DynamoDB point-in-time recovery
   - S3 versioning enabled
   - Cross-region replication for S3

3. **Health Monitoring**
   - Load balancer health checks
   - ECS container health checks
   - CloudWatch alarms for critical metrics
   - Enhanced monitoring for RDS

4. **Auto Scaling**
   - EC2 Auto Scaling based on CPU
   - ECS service auto scaling
   - Target tracking policies
   - Scheduled scaling for predictable patterns

5. **Fault Tolerance**
   - Circuit breaker for ECS deployments
   - Dead letter queues for Lambda
   - Read replicas for database scaling
   - Graceful degradation patterns

6. **Disaster Recovery**
   - S3 cross-region replication
   - RDS automated backups
   - DynamoDB PITR
   - Deletion protection on critical resources

## Architecture Patterns

### High Availability Pattern
```
Internet
    ↓
Application Load Balancer (Multi-AZ)
    ↓
Auto Scaling Group (3 AZs)
    ↓
RDS Multi-AZ (Primary + Standby)
```

### Disaster Recovery Pattern
```
Primary Region          Backup Region
    ↓                       ↓
S3 Bucket    ------>   S3 Replica
    ↓                       ↓
RDS Primary  ------>   RDS Read Replica
```

## Testing with AWS Well-Architected Power

1. Open `reliability-issues.yaml` in your editor
2. Ask Kiro to review it: "Review this CloudFormation template for Well-Architected reliability issues"
3. Compare findings with the documented issues above
4. Open `reliability-issues-fixed.yaml` to see the remediation
5. Ask Kiro to explain the improvements

## Reliability Metrics to Monitor

- **Availability**: Uptime percentage (target: 99.9% or higher)
- **MTTR**: Mean Time To Recovery (target: < 1 hour)
- **MTBF**: Mean Time Between Failures (target: > 720 hours)
- **RPO**: Recovery Point Objective (target: < 1 hour)
- **RTO**: Recovery Time Objective (target: < 4 hours)

## Learning Resources

- [AWS Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [AWS CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [AWS Reliability Best Practices](https://aws.amazon.com/architecture/reliability/)
- [Disaster Recovery on AWS](https://aws.amazon.com/disaster-recovery/)

## Notes

- These examples are for learning and testing purposes only
- Do not deploy the issues template to production
- Always test disaster recovery procedures regularly
- Consider using AWS Resilience Hub for resilience assessment
- Implement chaos engineering practices to test fault tolerance
