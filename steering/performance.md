---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Performance Efficiency Pillar - AWS Well-Architected Framework

## Principles

1. Democratize advanced technologies (use managed services)
2. Go global in minutes (multi-region for lower latency)
3. Use serverless architectures (automatic scaling, no server management)
4. Experiment more often (test configurations quickly)
5. Consider mechanical sympathy (match service to workload)

## IaC Performance Checklist

### Compute Selection
- [ ] Instance type matches workload (compute/memory/storage/GPU optimized)
- [ ] Latest generation instances (c7g, m7g, r7g — Graviton for best price-performance)
- [ ] Auto Scaling configured for variable workloads
- [ ] Placement groups for low-latency communication between instances
- [ ] Enhanced networking enabled

### Storage Selection
- [ ] EBS volume type matches IOPS needs (gp3 for general, io2 for high IOPS)
- [ ] gp3 baseline: 3,000 IOPS, 125 MB/s (configurable independently)
- [ ] S3 Transfer Acceleration for long-distance uploads
- [ ] EFS performance mode matches workload (General Purpose vs Max I/O)

### Database Performance
- [ ] Database engine matches use case (relational vs NoSQL vs in-memory)
- [ ] Read replicas for read-heavy workloads
- [ ] ElastiCache/DAX for caching frequently accessed data
- [ ] DynamoDB: partition key design avoids hot partitions
- [ ] RDS: Performance Insights enabled for query analysis
- [ ] Connection pooling configured (RDS Proxy for Lambda)

### Network Performance
- [ ] CloudFront for static content and API caching
- [ ] VPC endpoints reduce latency for AWS service calls
- [ ] Global Accelerator for global applications
- [ ] Appropriate ALB/NLB selection (NLB for TCP/UDP, ultra-low latency)

### Monitoring
- [ ] CloudWatch alarms for latency, throughput, error rate
- [ ] Anomaly detection for adaptive thresholds (vs static thresholds)
- [ ] X-Ray tracing for identifying bottlenecks
- [ ] Performance baselines established

## Application Code Performance Checklist

### Caching
- [ ] Frequently accessed data cached (ElastiCache/DAX/in-memory)
- [ ] Cache TTL configured appropriately
- [ ] Cache invalidation strategy implemented
- [ ] Cache hit/miss ratio monitored

### Connection Management
- [ ] Connection pooling enabled for databases
- [ ] AWS SDK clients created once, reused across requests
- [ ] Pool size configured for workload
- [ ] Connection health checks and recycling enabled

### Async Operations
- [ ] I/O-bound operations use async/await
- [ ] Concurrent operations batched (Promise.all / asyncio.gather)
- [ ] Async operations have timeouts

### Database Queries
- [ ] Queries use indexes
- [ ] Result sets limited (LIMIT clause)
- [ ] N+1 queries avoided (use JOINs or batch gets)
- [ ] Batch operations used where possible

## Key Anti-Patterns

| Anti-Pattern | Impact | Fix |
|---|---|---|
| Previous-gen instances (c5 vs c7g) | 20-40% worse price-performance | Upgrade to latest generation |
| Static thresholds (CPU > 80%) | False alarms or missed issues | CloudWatch Anomaly Detection |
| No caching layer | Every request hits database | ElastiCache/DAX for hot data |
| New DB client per request | Connection overhead per call | Connection pooling / client reuse |
| N+1 queries | N extra DB round trips | JOINs or batch operations |
| gp2 EBS volumes | Can't tune IOPS independently | gp3 with configurable IOPS |
| Lambda without RDS Proxy | Connection exhaustion | RDS Proxy for connection pooling |
| No CDN for static content | Higher latency, more origin load | CloudFront distribution |

## Key Performance Patterns (Reference)

### Right-Sized Compute with Auto Scaling
```hcl
resource "aws_launch_template" "app" {
  instance_type = "c7g.xlarge"  # Graviton: best price-performance
}

resource "aws_autoscaling_policy" "target_tracking" {
  policy_type = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 60.0  # Scale at 60% to handle spikes
  }
}
```

### Caching with ElastiCache (Python)
```python
import redis

redis_client = redis.Redis(
    host='cluster.cache.amazonaws.com',
    port=6379,
    max_connections=50,
    socket_connect_timeout=5
)

def get_cached(key, fetch_fn, ttl=300):
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    result = fetch_fn()
    redis_client.setex(key, ttl, json.dumps(result))
    return result
```

### Connection Pooling (Python)
```python
from sqlalchemy import create_engine
engine = create_engine(
    'postgresql://...',
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
```

### CloudWatch Anomaly Detection
```hcl
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "api-latency-anomaly"
  comparison_operator = "GreaterThanUpperThreshold"
  evaluation_periods  = 2
  threshold_metric_id = "ad1"

  metric_query {
    id          = "ad1"
    expression  = "ANOMALY_DETECTION_BAND(m1, 2)"
    label       = "Latency (expected)"
    return_data = true
  }
  metric_query {
    id = "m1"
    metric {
      metric_name = "Latency"
      namespace   = "AWS/ApiGateway"
      period      = 300
      stat        = "p99"
    }
  }
}
```

## Context-Dependent Guidance

| Aspect | Development | Production |
|---|---|---|
| Instance type | t4g (burstable, cheap) | c7g/m7g/r7g (right-sized) |
| Caching | Optional | Required for hot paths |
| CDN | Optional | Required for static content |
| Monitoring | Basic CloudWatch | Anomaly detection + X-Ray |
| DB connections | Direct | Connection pooling / RDS Proxy |

## Resources
- [AWS Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/)
- [AWS Graviton Getting Started](https://aws.amazon.com/ec2/graviton/)
