---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Operational Excellence Pillar - AWS Well-Architected Framework

## Principles

1. Perform operations as code (IaC, automated deployments)
2. Make frequent, small, reversible changes
3. Refine operations procedures frequently
4. Anticipate failure (pre-mortem exercises)
5. Learn from all operational events and failures

## IaC Operational Excellence Checklist

### Organization
- [ ] Infrastructure defined as code (Terraform, CloudFormation, CDK)
- [ ] Remote state with locking for team collaboration
- [ ] Environment management via workspaces or separate state files
- [ ] Architecture decisions documented (ADRs)

### Deployment
- [ ] CI/CD pipeline for infrastructure changes
- [ ] Rolling or blue/green deployments for zero-downtime
- [ ] Automated rollback on failure
- [ ] Change sets / plan reviewed before apply
- [ ] Feature flags for gradual rollouts

### Monitoring and Observability
- [ ] CloudWatch dashboards for key metrics
- [ ] Alarms for error rate, latency, throughput, saturation
- [ ] Composite alarms to reduce alert fatigue
- [ ] Log aggregation in centralized location
- [ ] Log retention policies configured (not indefinite)
- [ ] X-Ray tracing enabled for distributed systems

### Incident Management
- [ ] Runbooks for common operational scenarios
- [ ] Automated remediation for known issues (EventBridge + Lambda)
- [ ] SNS notifications for critical alarms
- [ ] Post-incident review process established
- [ ] On-call rotation defined

## Application Code Operational Excellence Checklist

### Structured Logging
- [ ] JSON format for CloudWatch Logs Insights queries
- [ ] Log levels used appropriately (DEBUG, INFO, WARN, ERROR)
- [ ] Correlation/request IDs included in all logs
- [ ] Sensitive data excluded from logs
- [ ] Context included (user ID, operation, duration)

### Distributed Tracing
- [ ] X-Ray tracing enabled
- [ ] Subsegments for key operations (DB calls, external APIs)
- [ ] Annotations for filtering (request type, user tier)
- [ ] Metadata for debugging

### Custom Metrics
- [ ] Business KPIs tracked (orders processed, revenue, etc.)
- [ ] Technical metrics (latency, error rate, throughput)
- [ ] Metrics have appropriate dimensions
- [ ] Metrics batched and flushed efficiently

### Health Checks
- [ ] Health check endpoint implemented (/health)
- [ ] Database and dependency connectivity verified
- [ ] Appropriate HTTP status codes (200 healthy, 503 unhealthy)
- [ ] Load balancer configured to use health check

## Key Anti-Patterns

| Anti-Pattern | Impact | Fix |
|---|---|---|
| No IaC (manual console changes) | Drift, inconsistency, no audit trail | Terraform/CloudFormation/CDK |
| No monitoring dashboards | Blind to system health | CloudWatch dashboards |
| Unstructured logging | Can't query or analyze logs | JSON structured logging |
| No correlation IDs | Can't trace requests across services | Pass request ID through all calls |
| Indefinite log retention | Growing storage costs | Lifecycle policies |
| No runbooks | Slow incident response | Document common procedures |
| Alert on every metric | Alert fatigue | Composite alarms, actionable alerts only |
| No health checks | Traffic sent to unhealthy instances | /health endpoint + ALB health check |

## Key Operational Patterns (Reference)

### Structured Logging (Python)
```python
import json, logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'request_id': getattr(record, 'request_id', None),
        })

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.handlers[0].setFormatter(JSONFormatter())
```

### Structured Logging (TypeScript — Lambda Powertools)
```typescript
import { Logger } from '@aws-lambda-powertools/logger';
const logger = new Logger({ serviceName: 'my-service' });

export const handler = async (event, context) => {
    logger.addPersistentLogAttributes({ requestId: context.requestId });
    logger.info('Processing request', { userId: event.userId });
};
```

### Composite Alarm
```hcl
resource "aws_cloudwatch_composite_alarm" "system_health" {
  alarm_name = "system-critical"
  alarm_rule = "ALARM(lambda_errors) OR ALARM(aurora_cpu)"
}
```

### CloudWatch Dashboard
```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "app-operations"
  dashboard_body = jsonencode({
    widgets = [
      { type = "metric", properties = { metrics = [["AWS/Lambda", "Errors"]], period = 300 } },
      { type = "metric", properties = { metrics = [["AWS/RDS", "CPUUtilization"]], period = 300 } }
    ]
  })
}
```

## Context-Dependent Guidance

| Aspect | Development | Production |
|---|---|---|
| Monitoring | Basic CloudWatch | Dashboards + alarms + X-Ray |
| Logging | Console output | Structured JSON to CloudWatch |
| Alerting | Optional | Required with on-call rotation |
| Runbooks | Optional | Required for all critical paths |
| Deployments | Direct apply | CI/CD with approval gates |

## Resources
- [AWS Operational Excellence Pillar](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/)
- [AWS Lambda Powertools](https://docs.powertools.aws.dev/lambda/)
