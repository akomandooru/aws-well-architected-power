---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Reliability Pillar - AWS Well-Architected Framework

## Principles

1. Automatically recover from failure (monitor KPIs, trigger automation)
2. Test recovery procedures regularly
3. Scale horizontally to increase availability
4. Stop guessing capacity (monitor and auto-scale)
5. Manage change through automation

## IaC Reliability Checklist

### Foundations
- [ ] Service quotas monitored with CloudWatch alarms at 80% utilization
- [ ] Multi-AZ VPC design with subnets in 2+ AZs
- [ ] Redundant network connectivity (multiple NAT Gateways, Transit Gateway)
- [ ] IP address space planned to avoid conflicts

### Workload Architecture
- [ ] Stateless components where possible
- [ ] Loosely coupled services (SQS, SNS, EventBridge between components)
- [ ] Idempotent operations for retry safety
- [ ] Graceful degradation when dependencies fail

### Change Management
- [ ] Auto Scaling configured with appropriate min/max/desired
- [ ] Health checks on ALB target groups
- [ ] Rolling deployments or blue/green for zero-downtime updates
- [ ] CloudWatch alarms for key metrics (CPU, memory, error rate, latency)
- [ ] Composite alarms to reduce alert fatigue

### Failure Management
- [ ] Multi-AZ for databases (RDS, ElastiCache) in production
- [ ] Automated backups with appropriate retention (7 days dev, 30+ days prod)
- [ ] Cross-region backups for disaster recovery (if required)
- [ ] Deletion protection enabled for production databases
- [ ] S3 versioning enabled for critical data
- [ ] RDS: `skip_final_snapshot = false` in production

### Disaster Recovery
- [ ] RTO and RPO defined and documented
- [ ] DR strategy matches requirements (backup/restore, pilot light, warm standby, active-active)
- [ ] DR procedures tested regularly
- [ ] Automated failover where possible

## Application Code Reliability Checklist

### Error Handling
- [ ] All AWS SDK calls wrapped in try-catch
- [ ] Errors logged with context (not sensitive data)
- [ ] Graceful degradation when dependencies fail
- [ ] Non-retryable errors (4xx) distinguished from retryable (5xx, throttling)

### Retry Logic
- [ ] Exponential backoff with jitter for transient failures
- [ ] Maximum retry attempts configured (3-5 typical)
- [ ] AWS SDK retry mode set (`adaptive` recommended)
- [ ] Connection and read timeouts configured

### Circuit Breakers
- [ ] Circuit breakers for external dependencies
- [ ] Failure threshold, timeout, and half-open recovery configured
- [ ] Fallback mechanisms (cached data, default values)

### Timeouts
- [ ] Connection timeout: 5s typical
- [ ] Read/request timeout: 10s typical
- [ ] Overall operation timeout set
- [ ] Timeout errors handled gracefully

## Key Anti-Patterns

| Anti-Pattern | Risk | Fix |
|---|---|---|
| Single-AZ database in production | AZ failure = downtime | Multi-AZ deployment |
| No backup retention | Data loss | Automated backups (30+ days prod) |
| No health checks on ALB | Traffic to unhealthy instances | Configure health check path |
| No Auto Scaling | Can't handle load spikes | ASG with scaling policies |
| No error handling on SDK calls | Unhandled exceptions crash app | Try-catch with retry logic |
| Infinite retry loop | Resource exhaustion | Max retries with backoff |
| No timeouts on external calls | Hanging operations | Connection + read timeouts |
| Tight coupling between services | Cascading failures | SQS/SNS for async communication |

## Key Reliable Patterns (Reference)

### Multi-AZ RDS with Backups
```hcl
resource "aws_db_instance" "main" {
  multi_az                  = true  # Automatic failover
  backup_retention_period   = 30
  deletion_protection       = true
  skip_final_snapshot       = false
  storage_encrypted         = true
  enabled_cloudwatch_logs_exports = ["postgresql"]
}
```

### Auto Scaling Group
```hcl
resource "aws_autoscaling_group" "app" {
  min_size         = 2
  max_size         = 10
  desired_capacity = 2
  health_check_type         = "ELB"
  health_check_grace_period = 300

  instance_refresh {
    strategy = "Rolling"
    preferences { min_healthy_percentage = 50 }
  }
}
```

### Retry with Exponential Backoff (Python)
```python
from botocore.config import Config

config = Config(
    retries={'max_attempts': 5, 'mode': 'adaptive'},
    connect_timeout=5,
    read_timeout=10
)
client = boto3.client('dynamodb', config=config)
```

### Circuit Breaker Pattern (Python)
```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.state = "closed"  # closed → open → half_open → closed

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure >= self.timeout:
                self.state = "half_open"
            else:
                raise Exception("Circuit breaker OPEN")
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception:
            self._on_failure()
            raise
```

## Context-Dependent Guidance

| Aspect | Development | Production |
|---|---|---|
| Multi-AZ | Optional (save 50% cost) | Required for 99.9%+ SLA |
| Backup retention | 7 days | 30+ days |
| Deletion protection | Off | On |
| Auto Scaling | Optional | Required |
| DR strategy | None/backup-restore | Pilot light or warm standby |

## Resources
- [AWS Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
