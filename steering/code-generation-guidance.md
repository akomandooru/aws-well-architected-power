---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Code Generation Guidance - AWS Well-Architected Framework

## Purpose

When generating infrastructure code, proactively apply Well-Architected best practices. Always gather context first, then generate environment-appropriate code with inline comments explaining trade-offs.

## Context Gathering (Before Generating)

Ask these before generating IaC:
1. **Environment**: dev / staging / prod?
2. **SLA**: Availability requirement? (if prod)
3. **Budget**: Tight / moderate / flexible?
4. **Data sensitivity**: PII, financial, health data?
5. **Performance**: Specific latency or throughput needs?

## Environment-Specific Defaults

### Development
- Single-AZ (save 50% cost)
- Smaller instances (t4g family)
- AWS-managed encryption keys (free)
- 7-day backup retention
- `deletion_protection = false`
- Basic monitoring

### Production
- Multi-AZ required
- Right-sized instances per workload
- Customer-managed KMS keys with rotation
- 30+ day backup retention
- `deletion_protection = true`
- Comprehensive monitoring + alerting

## Code Generation Checklist

Every generated resource should include:

### Security (Always)
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enforced (HTTPS/TLS)
- [ ] Least privilege IAM (specific actions + resources)
- [ ] No hardcoded secrets
- [ ] Private subnets for databases
- [ ] Public access blocked (S3, RDS)

### Reliability (Context-Dependent)
- [ ] Multi-AZ for production databases and caches
- [ ] Auto Scaling for compute
- [ ] Health checks configured
- [ ] Backup retention appropriate for environment
- [ ] Deletion protection for production

### Cost (Always)
- [ ] Cost allocation tags on every resource
- [ ] Latest generation instances
- [ ] Appropriate storage types (gp3 > gp2)
- [ ] Lifecycle policies for storage
- [ ] Comments with cost estimates

### Observability (Always)
- [ ] CloudWatch logging enabled
- [ ] Key metrics monitored
- [ ] Log retention configured (not indefinite)

## Inline Comment Style

```hcl
resource "aws_db_instance" "main" {
  instance_class = "db.t4g.medium"  # Dev: $60/month (prod: use r6g.large at $365/month)
  multi_az       = false             # Dev: Single-AZ saves $60/month. Prod: set to true
  backup_retention_period = 7        # Dev: 7 days. Prod: 30+ days
  storage_encrypted       = true     # Always encrypt — no cost impact
  deletion_protection     = false    # Dev only. Prod: set to true
}
```

## Resources
- See `examples/` directory for complete working examples per IaC format
- See pillar steering files for detailed checklists per area
