---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Cost Optimization Pillar - AWS Well-Architected Framework

## Principles

1. Implement cloud financial management (cost awareness, tagging, budgets)
2. Adopt a consumption model (pay for what you use)
3. Measure overall efficiency (cost per business outcome)
4. Stop spending on undifferentiated heavy lifting (use managed services)
5. Analyze and attribute expenditure (cost allocation tags)

## IaC Cost Optimization Checklist

### Financial Management
- [ ] Cost allocation tags on all resources (Environment, Project, CostCenter, Owner)
- [ ] AWS Budgets configured with alerts
- [ ] Cost Anomaly Detection enabled
- [ ] Monthly cost review process established

### Compute Right-Sizing
- [ ] Instance types match workload (compute-optimized, memory-optimized, etc.)
- [ ] Latest generation instances used (c6i/c7g vs c5)
- [ ] Graviton (ARM) instances considered for 20-40% savings
- [ ] Auto Scaling configured to scale down during low demand
- [ ] Dev/test instances stopped outside business hours

### Pricing Models
- [ ] Reserved Instances or Savings Plans for steady-state workloads (up to 72% savings)
- [ ] Spot Instances for fault-tolerant workloads (up to 90% savings)
- [ ] On-Demand only for unpredictable or short-term workloads

### Storage Optimization
- [ ] S3 lifecycle policies (transition to IA after 30 days, Glacier after 90 days)
- [ ] EBS volume types match workload (gp3 vs gp2 — gp3 is 20% cheaper)
- [ ] Unused EBS volumes and snapshots cleaned up
- [ ] S3 Intelligent-Tiering for unpredictable access patterns
- [ ] Log retention periods appropriate (not indefinite)

### Database Optimization
- [ ] RDS instance right-sized (use Performance Insights data)
- [ ] Aurora Serverless v2 considered for variable workloads
- [ ] DynamoDB on-demand for unpredictable, provisioned for steady-state
- [ ] Read replicas instead of scaling up primary
- [ ] Dev databases use smaller instances (db.t4g family)

### Network Optimization
- [ ] VPC endpoints for high-volume AWS service calls (avoid NAT Gateway data charges)
- [ ] CloudFront for static content (reduces origin load and data transfer)
- [ ] Data transfer costs considered in multi-region architecture
- [ ] NAT Gateway usage minimized (S3/DynamoDB gateway endpoints are free)

### Serverless Optimization
- [ ] Lambda memory right-sized (use AWS Lambda Power Tuning)
- [ ] Lambda Provisioned Concurrency only where cold starts matter
- [ ] Step Functions Express Workflows for high-volume, short-duration
- [ ] API Gateway caching enabled for repeated requests

## Application Code Cost Checklist

### Resource Management
- [ ] Connections closed after use (context managers / try-finally)
- [ ] Temporary files deleted
- [ ] Streams closed properly
- [ ] Memory leaks prevented (LRU cache with size limits)

### Efficient Operations
- [ ] API calls batched where possible (DynamoDB batch_writer, S3 batch)
- [ ] Large files streamed, not loaded entirely in memory
- [ ] Efficient algorithms (avoid O(n²) when O(n) exists)
- [ ] Unnecessary iterations removed

## Key Anti-Patterns

| Anti-Pattern | Waste | Fix |
|---|---|---|
| No cost allocation tags | Can't attribute costs | Tag all resources consistently |
| Oversized instances | Paying for unused capacity | Right-size using CloudWatch metrics |
| All On-Demand pricing | Missing 30-72% savings | Reserved Instances / Savings Plans |
| Indefinite log retention | Storage costs grow forever | Lifecycle policies (30/90/365 days) |
| gp2 EBS volumes | 20% more expensive than gp3 | Migrate to gp3 |
| NAT Gateway for S3/DynamoDB | $0.045/GB data processing | Use gateway VPC endpoints (free) |
| Lambda over-provisioned memory | Paying for unused memory | Use Power Tuning tool |
| No Auto Scaling scale-down | Paying for idle capacity | Scale-in policies with cooldown |

## Key Cost Patterns (Reference)

### Cost Allocation Tags
```hcl
locals {
  common_tags = {
    Environment  = var.environment
    Project      = var.project_name
    CostCenter   = var.cost_center
    Owner        = var.owner_email
    ManagedBy    = "Terraform"
  }
}
```

### S3 Lifecycle Policy
```hcl
resource "aws_s3_bucket_lifecycle_configuration" "cost_optimized" {
  bucket = aws_s3_bucket.main.id
  rule {
    id     = "optimize-storage"
    status = "Enabled"
    transition { days = 30; storage_class = "STANDARD_IA" }
    transition { days = 90; storage_class = "GLACIER" }
    expiration { days = 365 }
    noncurrent_version_expiration { noncurrent_days = 30 }
  }
}
```

### Auto Scaling with Scale-Down
```hcl
resource "aws_autoscaling_policy" "scale_down" {
  name                   = "scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.app.name
}
```

### Efficient Batch Operations (Python)
```python
# Batch writes reduce API calls by 25x
with table.batch_writer() as batch:
    for item in items:
        batch.put_item(Item=item)  # Auto-batches in groups of 25
```

## Context-Dependent Guidance

| Aspect | Development | Production |
|---|---|---|
| Instance size | t4g.small/medium | Right-sized per workload |
| Pricing model | On-Demand (short-lived) | Reserved/Savings Plans |
| Multi-AZ | Single-AZ (save 50%) | Multi-AZ (reliability first) |
| Log retention | 7-30 days | 90-365 days |
| Backups | 7 days | 30+ days |
| Auto Scaling | Optional | Required |

## Quick Cost Estimates

| Resource | Dev Monthly | Prod Monthly | Savings Opportunity |
|---|---|---|---|
| RDS db.t4g.medium Single-AZ | ~$60 | — | — |
| RDS db.r6g.large Multi-AZ | — | ~$365 | RI: ~$240 (34% off) |
| NAT Gateway (100GB) | ~$36 | ~$36 | VPC endpoints: $0 for S3/DDB |
| Lambda (1M invocations) | ~$0.20 | ~$0.20 | Power Tuning: up to 40% off |
| S3 (1TB, no lifecycle) | ~$23 | ~$23 | Lifecycle: ~$8 (65% off) |

## Resources
- [AWS Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)
- [AWS Pricing Calculator](https://calculator.aws/)
