---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Sustainability Pillar - AWS Well-Architected Framework

## Principles

1. Understand your impact (measure and monitor environmental footprint)
2. Establish sustainability goals (set targets, model ROI)
3. Maximize utilization (right-size, efficient design patterns)
4. Anticipate and adopt more efficient offerings (Graviton, serverless)
5. Use managed services (shared resources = higher efficiency)
6. Reduce downstream impact (minimize energy for end users)

## Sustainability Checklist

### Region Selection
- [ ] Regions with high renewable energy considered (us-west-2, eu-north-1, eu-west-1)
- [ ] Edge computing (CloudFront, Lambda@Edge) to reduce network transmission
- [ ] Unnecessary cross-region data replication avoided

### Compute Efficiency
- [ ] Graviton (ARM) instances used where possible (better performance per watt)
- [ ] Auto Scaling configured to match demand (no idle over-provisioning)
- [ ] Serverless (Lambda, Fargate) for variable workloads
- [ ] Spot Instances for fault-tolerant batch workloads
- [ ] Dev/test instances stopped outside business hours

### Storage Efficiency
- [ ] S3 lifecycle policies move data to efficient tiers
- [ ] Unused EBS volumes and snapshots deleted
- [ ] S3 Intelligent-Tiering for unpredictable access
- [ ] Data compression enabled where applicable
- [ ] Duplicate data eliminated

### Data and Network Efficiency
- [ ] Data transfer minimized (VPC endpoints, same-region access)
- [ ] Caching reduces redundant computation and data retrieval
- [ ] Efficient serialization formats (Protocol Buffers, MessagePack vs JSON/XML)
- [ ] Pagination for large result sets
- [ ] Batch operations to reduce API call overhead

### Application Code Efficiency
- [ ] Efficient algorithms (O(n) vs O(n²))
- [ ] Memory-efficient processing (streaming vs loading all in memory)
- [ ] Connection pooling and resource reuse
- [ ] Unnecessary processing eliminated
- [ ] Lambda memory right-sized (Power Tuning)

## Key Anti-Patterns

| Anti-Pattern | Impact | Fix |
|---|---|---|
| Over-provisioned instances running 24/7 | Wasted energy and compute | Auto Scaling + scheduling |
| x86 instances where ARM works | Higher energy per operation | Graviton instances |
| No storage lifecycle policies | Data stored at highest tier forever | Lifecycle transitions |
| Redundant cross-region replication | Unnecessary data transfer energy | Replicate only what's needed |
| Inefficient algorithms in hot paths | Excess CPU cycles | Optimize critical code paths |
| No caching | Redundant computation | ElastiCache/CloudFront |

## Key Sustainability Patterns (Reference)

### Graviton + Auto Scaling
```hcl
resource "aws_launch_template" "sustainable" {
  instance_type = "c7g.large"  # Graviton: up to 60% better energy efficiency

  tag_specifications {
    resource_type = "instance"
    tags = { SustainabilityOptimized = "true" }
  }
}

resource "aws_autoscaling_group" "app" {
  min_size = 1
  max_size = 10
  # Scales to zero impact when not needed
}
```

### Instance Scheduling (Dev/Test)
```hcl
resource "aws_autoscaling_schedule" "stop_nights" {
  scheduled_action_name  = "stop-outside-hours"
  min_size               = 0
  max_size               = 0
  desired_capacity       = 0
  recurrence             = "0 20 * * MON-FRI"  # Stop at 8 PM
  autoscaling_group_name = aws_autoscaling_group.dev.name
}

resource "aws_autoscaling_schedule" "start_mornings" {
  scheduled_action_name  = "start-business-hours"
  min_size               = 1
  max_size               = 4
  desired_capacity       = 2
  recurrence             = "0 8 * * MON-FRI"  # Start at 8 AM
  autoscaling_group_name = aws_autoscaling_group.dev.name
}
```

## Sustainable Region Reference

| Region | Renewable Energy | Carbon Intensity |
|---|---|---|
| eu-north-1 (Stockholm) | ~98% | Very Low |
| us-west-2 (Oregon) | ~95% | Low |
| eu-west-1 (Ireland) | ~90% | Low |
| ca-central-1 (Canada) | ~85% | Low |

## Resources
- [AWS Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/)
- [AWS Customer Carbon Footprint Tool](https://aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/)
