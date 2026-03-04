# Mode Selection Examples

## Overview

This document provides comprehensive examples demonstrating the three review modes (Simple, Context-Aware, and Full Analysis), automatic mode detection, explicit mode overrides, and mode switching mid-session. Each example uses realistic infrastructure code and shows how the same issue is handled differently across modes.

## Table of Contents

1. [Simple Mode Example](#simple-mode-example)
2. [Context-Aware Mode Example](#context-aware-mode-example)
3. [Full Analysis Mode Example](#full-analysis-mode-example)
4. [Automatic Mode Detection Examples](#automatic-mode-detection-examples)
5. [Explicit Mode Override Examples](#explicit-mode-override-examples)
6. [Mode Switching Mid-Session Examples](#mode-switching-mid-session-examples)
7. [Expected Outputs Comparison](#expected-outputs-comparison)

---

## Simple Mode Example

### Scenario: Quick Check During Development

**Context:**
- Developer is working on a Lambda function in development environment
- File: `infrastructure/dev/lambda.tf`
- Session: Interactive
- User request: "Quick review of this Lambda config"

**Infrastructure Code:**
```hcl
# infrastructure/dev/lambda.tf
resource "aws_lambda_function" "api_handler" {
  filename      = "lambda.zip"
  function_name = "api-handler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  
  environment {
    variables = {
      DB_HOST = "prod-db.example.com"
      API_KEY = "sk-1234567890abcdef"
    }
  }
}
```


**Simple Mode Output:**

```
🔍 Simple Mode Review (Quick Check)
Analyzing: infrastructure/dev/lambda.tf

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ HIGH RISK: Hardcoded API key in environment variables
Location: lambda.tf:12
Resource: aws_lambda_function.api_handler

Issue: API_KEY contains a hardcoded secret value
Recommendation: Use AWS Secrets Manager or Parameter Store
Remediation:
  1. Store secret in AWS Secrets Manager
  2. Grant Lambda IAM role secretsmanager:GetSecretValue permission
  3. Retrieve secret at runtime using AWS SDK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MEDIUM RISK: Missing timeout configuration
Location: lambda.tf:3
Resource: aws_lambda_function.api_handler

Issue: No timeout specified (defaults to 3 seconds)
Recommendation: Set explicit timeout based on function requirements
Remediation: Add `timeout = 30` (adjust based on your needs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MEDIUM RISK: Missing memory configuration
Location: lambda.tf:3
Resource: aws_lambda_function.api_handler

Issue: No memory_size specified (defaults to 128 MB)
Recommendation: Set explicit memory based on function requirements
Remediation: Add `memory_size = 512` (adjust based on your needs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: 1 high-risk, 2 medium-risk issues found
Review completed in 3.2 seconds
```

**Characteristics:**
- ✅ Fast (3.2 seconds)
- ✅ Prescriptive recommendations
- ✅ No context questions
- ✅ Direct issue identification
- ✅ Clear remediation steps
- ❌ No trade-off discussion
- ❌ No cost analysis

---


## Context-Aware Mode Example

### Scenario: Production RDS Configuration Review

**Context:**
- Developer is reviewing RDS configuration for production
- File: `infrastructure/prod/database.tf`
- Session: Interactive
- User request: "Review this database configuration"

**Infrastructure Code:**
```hcl
# infrastructure/prod/database.tf
resource "aws_db_instance" "main" {
  identifier           = "prod-database"
  engine              = "postgres"
  engine_version      = "14.7"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_type        = "gp2"
  
  db_name  = "myapp"
  username = "admin"
  password = var.db_password
  
  multi_az            = false
  publicly_accessible = false
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "prod-database-final"
  
  tags = {
    Environment = "production"
    Application = "myapp"
  }
}
```

**Context-Aware Mode Output:**

```
🔍 Context-Aware Mode Review
Analyzing: infrastructure/prod/database.tf

I notice this is a production database. Let me gather some context to provide 
appropriate recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Context Questions:

1. What's your availability requirement for this database?
   - 99.9% (43 minutes downtime/month)
   - 99.95% (22 minutes downtime/month)
   - 99.99% (4 minutes downtime/month)

2. What's your budget constraint?
   - Tight (minimize costs)
   - Moderate (balance cost and reliability)
   - Flexible (prioritize reliability)

3. What type of data does this database store?
   - Public data
   - Internal business data
   - Customer PII
   - Financial/health data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```


**User Responses:**
- Availability: 99.9% SLA
- Budget: Moderate
- Data: Customer PII

**Continued Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you! Based on your context:
- Environment: Production
- SLA Target: 99.9% (43 min downtime/month)
- Budget: Moderate
- Data Classification: Customer PII (requires high security)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ HIGH RISK: Single-AZ RDS instance in production
Location: database.tf:14
Resource: aws_db_instance.main

Context-Specific Analysis:
FOR your requirements (99.9% SLA, customer PII, moderate budget):
  Multi-AZ is REQUIRED

Why Multi-AZ is necessary:
  ✅ Reliability: Automatic failover in 1-2 minutes
     - Meets your 99.9% SLA requirement
     - Protects against AZ failures
     - Synchronous replication (no data loss)
  
  ✅ Security: Physical isolation
     - Standby in separate AZ
     - Better disaster recovery for PII data
  
  ⚠️ Cost Impact: 2x database cost
     - Current: ~$73/month (db.t3.medium)
     - With Multi-AZ: ~$146/month
     - Increase: $73/month ($876/year)
     - Acceptable for moderate budget

Trade-Off Analysis:
  Single-AZ Risks:
    - AZ failure = 30-60 min recovery time (violates SLA)
    - Manual intervention required
    - Potential data loss during recovery
    - Unacceptable for customer PII
  
  Multi-AZ Benefits:
    - Automated failover (1-2 min)
    - Zero data loss
    - Meets compliance requirements
    - Worth the cost for your use case

Recommendation: Enable Multi-AZ immediately
Remediation: Set `multi_az = true`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```


```
⚠️ MEDIUM RISK: Storage type could be optimized
Location: database.tf:7
Resource: aws_db_instance.main

Context-Specific Analysis:
Current: gp2 (General Purpose SSD)
Your context: Production with customer PII, moderate budget

Options based on your needs:
  1. gp3 (Recommended for your case)
     ✅ Cost: 20% cheaper than gp2 (~$10/month → ~$8/month)
     ✅ Performance: Better baseline (3000 IOPS vs 300 IOPS)
     ✅ Flexibility: Can adjust IOPS independently
     Trade-off: None (gp3 is better in all aspects)
  
  2. io1/io2 (Not recommended for your case)
     ⚠️ Cost: 3-5x more expensive
     ✅ Performance: Guaranteed IOPS
     Use only if: You need >16,000 IOPS consistently

Recommendation: Switch to gp3 for better performance and lower cost
Remediation: Change `storage_type = "gp3"`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ GOOD: Encryption at rest enabled by default
Location: database.tf:3
Resource: aws_db_instance.main

Note: RDS PostgreSQL enables encryption by default for new instances.
This meets your security requirements for customer PII.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
- 1 high-risk issue (Multi-AZ required for your SLA)
- 1 medium-risk issue (storage optimization opportunity)
- 1 good practice (encryption enabled)

Total cost impact of recommendations: +$63/month
- Multi-AZ: +$73/month
- gp3 storage: -$10/month

Review completed in 6.1 seconds
```

**Characteristics:**
- ✅ Context gathering (3-5 questions)
- ✅ Conditional recommendations based on context
- ✅ Trade-off explanations
- ✅ Cost-benefit analysis
- ✅ Environment-specific guidance
- ✅ Alternative options with pros/cons
- ⏱️ Moderate speed (6.1 seconds)

---


## Full Analysis Mode Example

### Scenario: Major Architecture Decision

**Context:**
- Team is deciding on caching strategy for high-traffic API
- File: `infrastructure/prod/cache.tf`
- Session: Interactive
- User request: "Full analysis of caching options for our API"

**Infrastructure Code:**
```hcl
# infrastructure/prod/cache.tf
resource "aws_elasticache_cluster" "api_cache" {
  cluster_id           = "api-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.cache.name
  security_group_ids = [aws_security_group.cache.id]
}
```

**Full Analysis Mode Output:**

```
🔍 Full Analysis Mode - Comprehensive Review
Analyzing: infrastructure/prod/cache.tf

Loading decision matrices and scenarios...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Comprehensive Context Gathering:

1. What's your current API traffic?
   - Requests per second: 500
   - Peak requests per second: 1,200
   - Average response time: 150ms

2. What's your availability requirement?
   - SLA: 99.95%

3. What's your budget constraint?
   - Monthly infrastructure budget: $8,000
   - Cache budget allocation: ~$500-800/month

4. What's your data access pattern?
   - Cache hit rate target: 80%+
   - Data volatility: Moderate (updates every 5-10 minutes)
   - Read/write ratio: 90% reads, 10% writes

5. What's your growth projection?
   - Expected traffic growth: 3x in next 12 months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 COMPREHENSIVE ANALYSIS: API Caching Strategy

Current Configuration Issues:
❌ Single-node Redis (no high availability)
❌ cache.t3.micro (insufficient for 500 RPS)
❌ No automatic failover
❌ No read replicas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DECISION MATRIX: Caching Architecture Options

| Option | Reliability | Performance | Cost/Month | Complexity | Scalability | Best For |
|--------|------------|-------------|------------|------------|-------------|----------|
| **Single Node** | ⭐⭐ | ⭐⭐⭐ | $15 | ⭐⭐⭐⭐⭐ | ⭐⭐ | Dev/Test |
| **Redis Cluster** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Production |
| **Redis Cluster + Replicas** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High-traffic |
| **DAX (DynamoDB)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $400 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | DynamoDB only |
| **CloudFront** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $50-200 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Static/Edge |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```


```
📈 DETAILED OPTION ANALYSIS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 1: Single Node Redis (Current)
├─ Configuration: 1x cache.t3.micro
├─ Monthly Cost: $15
└─ Analysis:

   Reliability Impact: ⭐⭐ (POOR)
   ❌ No automatic failover
   ❌ Single point of failure
   ❌ Downtime during maintenance
   ❌ Cannot meet 99.95% SLA
   
   Performance Impact: ⭐⭐⭐ (INADEQUATE)
   ⚠️ cache.t3.micro: 0.5 GB memory
   ⚠️ Can handle ~100 RPS (you need 500 RPS)
   ❌ Will experience memory pressure
   ❌ Evictions will reduce cache hit rate
   
   Cost Impact: ⭐⭐⭐⭐⭐ (EXCELLENT)
   ✅ Lowest cost option
   ✅ $15/month
   
   Scalability Impact: ⭐⭐ (POOR)
   ❌ Cannot scale horizontally
   ❌ Limited vertical scaling
   ❌ Cannot handle 3x growth
   
   Verdict: ❌ NOT RECOMMENDED
   Reason: Cannot meet your SLA, performance, or growth requirements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 2: Redis Cluster Mode (3 shards, no replicas)
├─ Configuration: 3x cache.m5.large (6 GB each)
├─ Monthly Cost: $180
└─ Analysis:

   Reliability Impact: ⭐⭐⭐⭐ (GOOD)
   ✅ Automatic failover within cluster
   ✅ Data partitioned across shards
   ⚠️ No read replicas (single point of read failure per shard)
   ⚠️ Can meet 99.9% SLA (not 99.95%)
   
   Performance Impact: ⭐⭐⭐⭐ (GOOD)
   ✅ 18 GB total memory (adequate for 500 RPS)
   ✅ Distributed load across 3 shards
   ✅ Can handle 1,200 RPS peak
   ⚠️ Read performance limited (no replicas)
   
   Cost Impact: ⭐⭐⭐ (MODERATE)
   ✅ Within budget ($180 < $500-800)
   ✅ 12x cost increase justified by requirements
   
   Scalability Impact: ⭐⭐⭐⭐ (GOOD)
   ✅ Can add more shards
   ✅ Can handle 2x growth without changes
   ⚠️ 3x growth may require more shards
   
   Verdict: ✅ GOOD OPTION
   Reason: Meets most requirements, cost-effective

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 3: Redis Cluster + Read Replicas (RECOMMENDED)
├─ Configuration: 3 shards × 2 nodes (primary + replica)
├─ Node Type: cache.m5.large (6 GB)
├─ Monthly Cost: $360
└─ Analysis:

   Reliability Impact: ⭐⭐⭐⭐⭐ (EXCELLENT)
   ✅ Automatic failover (1-2 minutes)
   ✅ Read replicas for redundancy
   ✅ Can meet 99.95% SLA
   ✅ Zero data loss during failover
   ✅ Maintenance with zero downtime
   
   Performance Impact: ⭐⭐⭐⭐⭐ (EXCELLENT)
   ✅ 36 GB total memory (2x capacity)
   ✅ Read load distributed across replicas
   ✅ Can handle 2,400+ RPS (2x your peak)
   ✅ Excellent cache hit rate potential
   ✅ Low latency (<1ms P99)
   
   Cost Impact: ⭐⭐⭐ (MODERATE)
   ✅ Within budget ($360 < $500-800)
   ✅ 2x cost of Option 2
   ✅ Cost justified by SLA requirement
   
   Scalability Impact: ⭐⭐⭐⭐⭐ (EXCELLENT)
   ✅ Can handle 3x growth (1,500 RPS)
   ✅ Can add more shards if needed
   ✅ Can add more replicas for read scaling
   ✅ Future-proof for 12-month projection
   
   Operational Excellence Impact: ⭐⭐⭐⭐⭐ (EXCELLENT)
   ✅ Automated backups
   ✅ Automated failover
   ✅ CloudWatch metrics
   ✅ Minimal operational burden
   
   Verdict: ✅ RECOMMENDED
   Reason: Best balance of reliability, performance, and cost for your requirements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```


```
💰 COST-BENEFIT ANALYSIS:

Current State (Single Node):
├─ Cost: $15/month
├─ Downtime risk: ~4 hours/month (99.5% availability)
├─ Performance issues: Cache evictions, slow responses
└─ Estimated impact: $2,000/hour downtime cost = $8,000/month risk

Recommended State (Cluster + Replicas):
├─ Cost: $360/month
├─ Downtime risk: ~22 minutes/month (99.95% availability)
├─ Performance: Excellent, handles 2x peak load
└─ Estimated impact: $733/month downtime cost

Net Benefit Analysis:
├─ Additional cost: +$345/month
├─ Risk reduction: -$7,267/month
├─ Net benefit: $6,922/month
└─ ROI: 2,005% (20x return on investment)

Payback Period: Immediate (first month)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 MULTI-PILLAR IMPACT ANALYSIS:

┌─────────────────────────────────────────────────────────────────────────────┐
│ Pillar                    │ Current │ Recommended │ Impact                  │
├───────────────────────────┼─────────┼─────────────┼─────────────────────────┤
│ Reliability               │ ⭐⭐     │ ⭐⭐⭐⭐⭐      │ +HIGH (99.5% → 99.95%)  │
│ Performance Efficiency    │ ⭐⭐     │ ⭐⭐⭐⭐⭐      │ +HIGH (5x capacity)     │
│ Security                  │ ⭐⭐⭐⭐   │ ⭐⭐⭐⭐⭐      │ +LOW (encryption at rest)│
│ Cost Optimization         │ ⭐⭐⭐⭐⭐  │ ⭐⭐⭐        │ -MEDIUM (+$345/mo)      │
│ Operational Excellence    │ ⭐⭐⭐    │ ⭐⭐⭐⭐⭐      │ +HIGH (auto failover)   │
│ Sustainability            │ ⭐⭐⭐    │ ⭐⭐⭐⭐       │ +LOW (better efficiency)│
└─────────────────────────────────────────────────────────────────────────────┘

Overall Score: 2.8/5.0 → 4.7/5.0 (+68% improvement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TRADE-OFF SCENARIOS:

Scenario 1: Startup with Tight Budget
├─ Recommendation: Option 2 (Cluster without replicas)
├─ Cost: $180/month
├─ Trade-off: 99.9% SLA instead of 99.95%
├─ Rationale: Acceptable for early stage, upgrade later
└─ Migration path: Add replicas when revenue grows

Scenario 2: Enterprise with Strict SLA (Your Case)
├─ Recommendation: Option 3 (Cluster + Replicas)
├─ Cost: $360/month
├─ Trade-off: Higher cost for reliability
├─ Rationale: SLA requirement is non-negotiable
└─ Justification: Downtime costs exceed infrastructure costs

Scenario 3: Hyper-Growth Startup
├─ Recommendation: Option 3 + Auto-scaling
├─ Cost: $360-600/month (variable)
├─ Trade-off: Higher cost for unlimited scalability
├─ Rationale: Can't predict traffic spikes
└─ Additional: Consider CloudFront for edge caching

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 IMPLEMENTATION ROADMAP:

Phase 1: Immediate (Week 1)
├─ Create Redis Cluster with 3 shards
├─ Configure cache.m5.large nodes
├─ Enable automatic backups
└─ Estimated effort: 4 hours

Phase 2: High Availability (Week 2)
├─ Add read replicas to each shard
├─ Configure automatic failover
├─ Set up CloudWatch alarms
└─ Estimated effort: 6 hours

Phase 3: Optimization (Week 3-4)
├─ Monitor cache hit rate
├─ Tune eviction policies
├─ Optimize connection pooling
└─ Estimated effort: 8 hours

Total Implementation: 18 hours over 4 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FINAL RECOMMENDATION:

Implement Option 3: Redis Cluster + Read Replicas

Configuration:
```hcl
resource "aws_elasticache_replication_group" "api_cache" {
  replication_group_id       = "api-cache-cluster"
  replication_group_description = "API cache with HA"
  engine                     = "redis"
  engine_version            = "7.0"
  node_type                 = "cache.m5.large"
  num_cache_clusters        = 2  # Primary + 1 replica per shard
  num_node_groups           = 3  # 3 shards
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  subnet_group_name = aws_elasticache_subnet_group.cache.name
  security_group_ids = [aws_security_group.cache.id]
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Environment = "production"
    Application = "api-cache"
  }
}
```

Justification:
✅ Meets 99.95% SLA requirement
✅ Handles current load (500 RPS) + peak (1,200 RPS)
✅ Scales to 3x growth (1,500 RPS)
✅ Within budget ($360 < $500-800)
✅ 2,005% ROI from downtime prevention
✅ Excellent operational characteristics

Review completed in 8.7 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Characteristics:**
- ✅ Comprehensive context gathering (8-10 questions)
- ✅ Detailed decision matrix with multiple options
- ✅ Multi-pillar impact analysis
- ✅ Quantitative cost-benefit analysis
- ✅ Trade-off scenarios for different contexts
- ✅ Implementation roadmap
- ✅ Complete code examples
- ⏱️ Slower but thorough (8.7 seconds)

---


## Automatic Mode Detection Examples

### Example 1: File Path Detection - Development Environment

**Scenario:**
- File: `infrastructure/dev/api-gateway.tf`
- Session: Interactive
- User request: "Review this API Gateway config"
- No explicit mode specified

**Detection Logic:**
```
Priority 50: File Path Detection
├─ File path contains "/dev/"
├─ Matches development environment pattern
└─ Result: Simple Mode
```

**Output:**
```
🔍 Automatic Mode Detection
Detected: Simple Mode (development environment)

I'll do a quick review since this is a development environment file.
For production files, I automatically use Context-Aware Mode.

Analyzing: infrastructure/dev/api-gateway.tf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Prescriptive recommendations without context questions...]
```

---

### Example 2: File Path Detection - Production Environment

**Scenario:**
- File: `infrastructure/prod/load-balancer.tf`
- Session: Interactive
- User request: "Check this load balancer"
- No explicit mode specified

**Detection Logic:**
```
Priority 50: File Path Detection
├─ File path contains "/prod/"
├─ Matches production environment pattern
└─ Result: Context-Aware Mode
```

**Output:**
```
🔍 Automatic Mode Detection
Detected: Context-Aware Mode (production environment)

I notice this is a production file. I'll gather some context to provide
appropriate recommendations for your production environment.

Analyzing: infrastructure/prod/load-balancer.tf

📋 Context Questions:
1. What's your availability requirement?
2. What's your expected traffic volume?
3. What's your budget constraint?

[Context-aware analysis with trade-offs...]
```

---

### Example 3: CI/CD Environment Detection

**Scenario:**
- Environment: GitHub Actions CI/CD pipeline
- File: `infrastructure/prod/database.tf`
- Environment variable: `CI=true`
- Automated run (no user interaction)

**Detection Logic:**
```
Priority 90: CI/CD Environment (overrides file path)
├─ Environment variable CI=true detected
├─ Non-interactive session
├─ File path contains "/prod/" (Priority 50)
└─ Result: Simple Mode (CI/CD takes precedence)
```

**Output:**
```
🔍 Automatic Mode Detection
Detected: Simple Mode (CI/CD environment)

Running in CI/CD mode for fast feedback.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzing: infrastructure/prod/database.tf

❌ HIGH RISK: Single-AZ RDS in production
⚠️ MEDIUM RISK: Missing backup configuration
✅ GOOD: Encryption enabled

Summary: 1 high-risk, 1 medium-risk issues
Review completed in 2.8 seconds
```

**Why Simple Mode in CI/CD:**
- Fast feedback (2-3 seconds vs 6-8 seconds)
- No interactive context gathering possible
- Prescriptive recommendations for automated checks
- Lower token consumption (cost optimization)

---


### Example 4: Staging Environment Detection

**Scenario:**
- File: `infrastructure/staging/ecs-cluster.tf`
- Session: Interactive
- User request: "Review this ECS cluster"
- No explicit mode specified

**Detection Logic:**
```
Priority 50: File Path Detection
├─ File path contains "/staging/"
├─ Matches staging environment pattern
└─ Result: Context-Aware Mode
```

**Output:**
```
🔍 Automatic Mode Detection
Detected: Context-Aware Mode (staging environment)

Staging environments often mirror production. I'll gather context to ensure
recommendations align with your staging requirements.

Analyzing: infrastructure/staging/ecs-cluster.tf

📋 Context Questions:
1. Does staging mirror production configuration?
2. What's your staging availability requirement?
3. Is staging used for load testing?

[Context-aware analysis...]
```

---

### Example 5: Multiple File Patterns

**Scenario:**
- Files being reviewed:
  - `src/dev/lambda-handler.py` (application code in dev)
  - `infrastructure/prod/lambda.tf` (infrastructure in prod)
- Session: Interactive
- User request: "Review these Lambda files"

**Detection Logic:**
```
Priority 50: File Path Detection (multiple files)
├─ File 1: src/dev/lambda-handler.py → Simple Mode
├─ File 2: infrastructure/prod/lambda.tf → Context-Aware Mode
├─ Conflict detected
└─ Result: Context-Aware Mode (higher priority for prod)
```

**Output:**
```
🔍 Automatic Mode Detection
Detected: Context-Aware Mode (production file detected)

I notice you have both development and production files. I'll use Context-Aware
Mode since production files are present and require more careful analysis.

Analyzing multiple files:
- src/dev/lambda-handler.py (application code)
- infrastructure/prod/lambda.tf (infrastructure)

📋 Context Questions:
[Context gathering for production environment...]
```

---

## Explicit Mode Override Examples

### Example 1: Override to Simple Mode

**Scenario:**
- File: `infrastructure/prod/s3-bucket.tf`
- Auto-detected mode: Context-Aware (production file)
- User wants quick check

**User Request:**
```
"Quick review of this S3 bucket config"
```

**Detection Logic:**
```
Priority 100: Explicit User Request (highest priority)
├─ User said "quick review"
├─ Overrides file path detection (Priority 50)
└─ Result: Simple Mode
```

**Output:**
```
🔍 Mode Override Detected
Auto-detected: Context-Aware Mode (production file)
User requested: Simple Mode ("quick review")
Using: Simple Mode

Analyzing: infrastructure/prod/s3-bucket.tf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ HIGH RISK: S3 bucket lacks encryption
⚠️ MEDIUM RISK: Versioning not enabled
✅ GOOD: Public access blocked

Summary: 1 high-risk, 1 medium-risk issues
Review completed in 3.1 seconds
```

---


### Example 2: Override to Full Analysis Mode

**Scenario:**
- File: `infrastructure/dev/vpc.tf`
- Auto-detected mode: Simple (development file)
- User wants comprehensive analysis

**User Request:**
```
"I need a full analysis of this VPC design with all trade-offs"
```

**Detection Logic:**
```
Priority 100: Explicit User Request (highest priority)
├─ User said "full analysis"
├─ Overrides file path detection (Priority 50)
└─ Result: Full Analysis Mode
```

**Output:**
```
🔍 Mode Override Detected
Auto-detected: Simple Mode (development file)
User requested: Full Analysis Mode ("full analysis")
Using: Full Analysis Mode

Loading decision matrices and scenarios...

🔍 Full Analysis Mode - Comprehensive Review
Analyzing: infrastructure/dev/vpc.tf

📋 Comprehensive Context Gathering:
[10+ detailed questions about VPC requirements...]

📊 DECISION MATRIX: VPC Architecture Options
[Detailed comparison of VPC designs...]

💰 COST-BENEFIT ANALYSIS:
[Quantitative analysis...]

🎭 MULTI-PILLAR IMPACT ANALYSIS:
[Impact across all six pillars...]

[Complete comprehensive analysis...]

Review completed in 9.2 seconds
```

---

### Example 3: Override in CI/CD

**Scenario:**
- Environment: CI/CD pipeline
- File: `infrastructure/prod/critical-database.tf`
- Auto-detected mode: Simple (CI/CD environment)
- Team wants context-aware analysis for critical resources

**Configuration Override:**
```json
// .kiro/config/well-architected-modes.json
{
  "customDetectionRules": [
    {
      "condition": "filePath.includes('critical')",
      "mode": "context-aware",
      "priority": 95
    }
  ]
}
```

**Detection Logic:**
```
Priority 95: Custom Detection Rule
├─ File path contains "critical"
├─ Custom rule: Use Context-Aware Mode
├─ Overrides CI/CD detection (Priority 90)
└─ Result: Context-Aware Mode
```

**Output:**
```
🔍 Custom Mode Detection
Auto-detected: Simple Mode (CI/CD environment)
Custom rule matched: "critical" in file path
Using: Context-Aware Mode

Note: This is a critical resource. Using Context-Aware Mode even in CI/CD
to ensure thorough analysis. This may take longer than usual CI/CD checks.

Analyzing: infrastructure/prod/critical-database.tf

📋 Context Questions:
[Context gathering with pre-configured answers from CI/CD environment...]
```

---


## Mode Switching Mid-Session Examples

### Example 1: Escalate from Simple to Context-Aware

**Scenario:**
- Started with Simple Mode (quick check)
- User wants more detail on a specific issue

**Initial Request:**
```
User: "Quick review of this RDS config"
```

**Simple Mode Output:**
```
🔍 Simple Mode Review

❌ HIGH RISK: Single-AZ RDS in production
Location: database.tf:14
Recommendation: Enable Multi-AZ
Remediation: Set `multi_az = true`

⚠️ MEDIUM RISK: Storage type not optimized
Location: database.tf:7
Recommendation: Use gp3 instead of gp2
Remediation: Change `storage_type = "gp3"`

Review completed in 3.4 seconds
```

**User Follow-Up:**
```
User: "Why is Multi-AZ high risk? What are the trade-offs?"
```

**Mode Switch:**
```
🔄 Mode Switch Detected
Current mode: Simple Mode
User asked: "What are the trade-offs?"
Switching to: Context-Aware Mode

Preserving context:
✅ Previous findings (Single-AZ, storage type)
✅ File being reviewed (database.tf)
✅ Environment detected (production)

Gathering additional context for trade-off analysis...
```

**Context-Aware Mode Output:**
```
📋 Context Questions (for trade-off analysis):

1. What's your availability requirement?
   [User: 99.9% SLA]

2. What's your budget constraint?
   [User: Moderate]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trade-Off Analysis: Single-AZ vs Multi-AZ

FOR your requirements (99.9% SLA, moderate budget):
  Multi-AZ is REQUIRED

Single-AZ Trade-Offs:
  ✅ Cost: 50% cheaper ($73/month vs $146/month)
  ❌ Reliability: 99.5% availability (violates your SLA)
  ❌ Recovery: 30-60 minutes manual recovery
  ❌ Risk: AZ failure = extended downtime

Multi-AZ Trade-Offs:
  ⚠️ Cost: 2x database cost (+$73/month)
  ✅ Reliability: 99.95% availability (meets your SLA)
  ✅ Recovery: 1-2 minutes automatic failover
  ✅ Risk: AZ failure = minimal impact

Cost-Benefit:
  - Additional cost: $73/month ($876/year)
  - Downtime prevented: ~3.5 hours/month
  - Downtime cost: ~$500/hour (estimated)
  - Savings: ~$1,750/month
  - Net benefit: $1,677/month (positive ROI)

Recommendation: Multi-AZ is worth the cost for your SLA requirement.
```

**Key Points:**
- ✅ Context preserved (previous findings, file, environment)
- ✅ No re-analysis of already identified issues
- ✅ Focused on answering user's specific question
- ✅ Smooth transition without redundancy

---


### Example 2: Escalate from Context-Aware to Full Analysis

**Scenario:**
- Started with Context-Aware Mode
- User wants comprehensive comparison of all options

**Initial Request:**
```
User: "Review this caching strategy"
```

**Context-Aware Mode Output:**
```
🔍 Context-Aware Mode Review

📋 Context Questions:
[User provides: 500 RPS, 99.95% SLA, moderate budget]

⚠️ CONTEXT-DEPENDENT: Single-node Redis insufficient

FOR your requirements (500 RPS, 99.95% SLA):
  Redis Cluster with replicas is RECOMMENDED

Trade-Offs:
  Single Node: $15/month, no HA, can't meet SLA
  Redis Cluster: $360/month, HA, meets SLA

Recommendation: Upgrade to Redis Cluster with replicas
```

**User Follow-Up:**
```
User: "Can you do a full analysis comparing all caching options with detailed costs?"
```

**Mode Switch:**
```
🔄 Mode Switch Detected
Current mode: Context-Aware Mode
User requested: "full analysis comparing all caching options"
Switching to: Full Analysis Mode

Preserving context:
✅ Traffic: 500 RPS
✅ SLA: 99.95%
✅ Budget: Moderate
✅ Previous recommendation: Redis Cluster

Loading decision matrices and scenarios...
```

**Full Analysis Mode Output:**
```
🔍 Full Analysis Mode - Comprehensive Comparison

📊 DECISION MATRIX: All Caching Options

| Option | Reliability | Performance | Cost/Month | Complexity | Best For |
|--------|------------|-------------|------------|------------|----------|
| Single Node | ⭐⭐ | ⭐⭐⭐ | $15 | ⭐⭐⭐⭐⭐ | Dev/Test |
| Redis Cluster | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 | ⭐⭐⭐ | Production |
| Redis + Replicas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 | ⭐⭐⭐ | High-traffic |
| DAX | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $400 | ⭐⭐⭐⭐ | DynamoDB |
| CloudFront | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $50-200 | ⭐⭐⭐⭐⭐ | Static/Edge |
| Memcached | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $150 | ⭐⭐⭐⭐ | Simple cache |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 DETAILED OPTION ANALYSIS:

[Comprehensive analysis of each option with:]
- Reliability impact (with specific metrics)
- Performance impact (with benchmarks)
- Cost impact (with detailed breakdown)
- Scalability impact (with growth projections)
- Operational impact (with maintenance considerations)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 COST-BENEFIT ANALYSIS:

[Detailed financial analysis including:]
- Total cost of ownership (3-year projection)
- Downtime cost calculations
- ROI for each option
- Break-even analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 MULTI-PILLAR IMPACT ANALYSIS:

[Impact across all six pillars for each option]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TRADE-OFF SCENARIOS:

Scenario 1: Startup with tight budget → Memcached or Single Node
Scenario 2: Enterprise with strict SLA → Redis Cluster + Replicas
Scenario 3: Global application → CloudFront + Redis
Scenario 4: DynamoDB-based app → DAX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FINAL RECOMMENDATION: Redis Cluster + Replicas

[Detailed justification with implementation roadmap]

Review completed in 8.9 seconds
```

**Key Points:**
- ✅ All context preserved (no re-asking questions)
- ✅ Expanded analysis with decision matrices
- ✅ Comprehensive comparison of all options
- ✅ Quantitative cost-benefit analysis
- ✅ Scenario-based recommendations

---


### Example 3: Simplify from Full Analysis to Simple

**Scenario:**
- Started with Full Analysis Mode (comprehensive review)
- User wants quick check of another file

**Initial Request:**
```
User: "Full analysis of this VPC architecture"
```

**Full Analysis Mode Output:**
```
🔍 Full Analysis Mode - Comprehensive Review

[Extensive analysis with decision matrices, cost-benefit, scenarios...]

Review completed in 9.5 seconds
```

**User Follow-Up:**
```
User: "Now quick check this security group"
```

**Mode Switch:**
```
🔄 Mode Switch Detected
Current mode: Full Analysis Mode
User requested: "quick check"
Switching to: Simple Mode

Note: Switching to Simple Mode for faster feedback on the security group.
If you need detailed analysis, just ask!
```

**Simple Mode Output:**
```
🔍 Simple Mode Review (Quick Check)

Analyzing: security-group.tf

❌ HIGH RISK: Security group allows 0.0.0.0/0 on port 22
⚠️ MEDIUM RISK: No description for security group rules
✅ GOOD: Egress restricted appropriately

Summary: 1 high-risk, 1 medium-risk issues
Review completed in 2.9 seconds
```

**Key Points:**
- ✅ Fast mode switch for quick checks
- ✅ No unnecessary context gathering
- ✅ Appropriate mode for the task
- ✅ User can escalate again if needed

---

### Example 4: Multiple Files with Different Modes

**Scenario:**
- User reviewing multiple files in sequence
- Different modes appropriate for different files

**Session Flow:**

```
User: "Review these files: dev/lambda.tf, prod/database.tf, prod/cache.tf"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File 1: dev/lambda.tf
Mode: Simple Mode (development file)

[Quick prescriptive review...]
Review completed in 3.1 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File 2: prod/database.tf
Mode: Context-Aware Mode (production file)

📋 Context Questions:
[Gathering context for production database...]

[Context-aware analysis with trade-offs...]
Review completed in 6.3 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File 3: prod/cache.tf
Mode: Context-Aware Mode (production file)

Reusing context from previous production file:
✅ SLA: 99.9%
✅ Budget: Moderate
✅ Environment: Production

[Context-aware analysis using preserved context...]
Review completed in 5.1 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Summary:
- 3 files reviewed
- 2 modes used (Simple for dev, Context-Aware for prod)
- Context preserved across production files
- Total time: 14.5 seconds
```

**Key Points:**
- ✅ Automatic mode selection per file
- ✅ Context preserved within same environment
- ✅ Efficient multi-file review
- ✅ Appropriate depth for each file

---


## Expected Outputs Comparison

### Same Issue Across All Three Modes

**Infrastructure Code:**
```hcl
# infrastructure/prod/s3-bucket.tf
resource "aws_s3_bucket" "data" {
  bucket = "company-customer-data"
  
  tags = {
    Environment = "production"
    DataType    = "customer-pii"
  }
}
```

---

### Simple Mode Output

```
🔍 Simple Mode Review

❌ HIGH RISK: S3 bucket lacks encryption at rest
Location: s3-bucket.tf:2
Resource: aws_s3_bucket.data

Issue: No server-side encryption configured
Recommendation: Enable default encryption
Remediation:
  Add encryption configuration:
  
  resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
    bucket = aws_s3_bucket.data.id
    
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MEDIUM RISK: Versioning not enabled
Location: s3-bucket.tf:2
Recommendation: Enable versioning for data protection
Remediation: Add versioning configuration

⚠️ MEDIUM RISK: No lifecycle policy configured
Recommendation: Configure lifecycle rules for cost optimization

Summary: 1 high-risk, 2 medium-risk issues
Review completed in 2.8 seconds
```

**Characteristics:**
- Direct issue identification
- Prescriptive recommendations
- Code examples for fixes
- No context questions
- No trade-off discussion
- Fast (2.8 seconds)

---

### Context-Aware Mode Output

```
🔍 Context-Aware Mode Review

I notice this bucket stores customer PII in production. Let me gather context
to provide appropriate security recommendations.

📋 Context Questions:

1. What's your data retention requirement?
   [User: 7 years for compliance]

2. What's your data access pattern?
   [User: Write once, read occasionally]

3. What's your compliance requirement?
   [User: GDPR, SOC 2]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ HIGH RISK: S3 bucket lacks encryption at rest
Location: s3-bucket.tf:2
Resource: aws_s3_bucket.data

Context-Specific Analysis:
FOR your requirements (customer PII, GDPR, SOC 2):
  Encryption is MANDATORY (not optional)

Encryption Options:
  1. SSE-S3 (AES256) - Recommended for your case
     ✅ Cost: Free
     ✅ Compliance: Meets GDPR encryption requirements
     ✅ Simplicity: AWS manages keys
     ⚠️ Control: Limited key management
     
  2. SSE-KMS (Customer Managed Key)
     ✅ Control: Full key management and rotation
     ✅ Audit: CloudTrail logs for key usage
     ⚠️ Cost: $1/month per key + $0.03 per 10K requests
     ✅ Compliance: Better for SOC 2 (demonstrates control)

Trade-Off Analysis:
  SSE-S3 vs SSE-KMS:
    - SSE-S3: Simpler, free, meets basic compliance
    - SSE-KMS: Better audit trail, key rotation, +$50-100/month
    - For SOC 2: KMS provides better evidence of controls

Recommendation: Use SSE-KMS for better compliance posture
Cost Impact: ~$75/month (acceptable for compliance requirements)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MEDIUM RISK: Versioning not enabled
Context: 7-year retention requirement

FOR your requirements (7-year retention, GDPR):
  Versioning is REQUIRED

Why versioning matters for your case:
  ✅ Compliance: GDPR right to rectification (need version history)
  ✅ Protection: Prevents accidental deletion
  ✅ Audit: Track all changes to customer data
  
Cost Impact:
  - Storage: ~20% increase (based on typical change rate)
  - Current: $100/month → With versioning: $120/month
  - Acceptable for compliance requirements

Recommendation: Enable versioning immediately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CONTEXT-DEPENDENT: Lifecycle policy needed
Context: 7-year retention, write-once-read-occasionally

Lifecycle Strategy for your case:
  1. Transition to IA after 90 days (rarely accessed)
     Cost savings: ~50% ($50/month → $25/month)
     
  2. Transition to Glacier after 1 year (compliance archive)
     Cost savings: ~90% ($50/month → $5/month)
     
  3. Delete after 7 years (retention requirement)
     Compliance: Automatic deletion for GDPR

Total cost impact: -$45/month savings after transitions

Recommendation: Implement lifecycle policy for cost optimization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
- 1 high-risk issue (encryption mandatory for compliance)
- 2 medium-risk issues (versioning required, lifecycle recommended)

Net cost impact: +$50/month
- Encryption (KMS): +$75/month
- Versioning: +$20/month
- Lifecycle savings: -$45/month

Review completed in 6.7 seconds
```

**Characteristics:**
- Context gathering (3-5 questions)
- Conditional recommendations based on context
- Trade-off explanations (SSE-S3 vs SSE-KMS)
- Cost-benefit analysis
- Compliance-aware guidance
- Moderate speed (6.7 seconds)

---


### Full Analysis Mode Output

```
🔍 Full Analysis Mode - Comprehensive Review

Loading decision matrices and scenarios...

📋 Comprehensive Context Gathering:

1. Data retention requirement: 7 years (compliance)
2. Data access pattern: Write once, read occasionally
3. Compliance requirements: GDPR, SOC 2
4. Data volume: 500 GB currently
5. Growth rate: 20% per year
6. Access frequency: 10 reads/day average
7. Budget: Moderate ($500/month for storage)
8. Recovery time objective: 4 hours
9. Data classification: Customer PII (high sensitivity)
10. Geographic requirements: EU data residency

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 COMPREHENSIVE ANALYSIS: S3 Bucket Security and Lifecycle Strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DECISION MATRIX: Encryption Options

| Option | Security | Compliance | Cost/Month | Complexity | Audit | Best For |
|--------|----------|------------|------------|------------|-------|----------|
| **No Encryption** | ⭐ | ⭐ | $0 | ⭐⭐⭐⭐⭐ | ⭐ | Never |
| **SSE-S3** | ⭐⭐⭐⭐ | ⭐⭐⭐ | $0 | ⭐⭐⭐⭐⭐ | ⭐⭐ | Basic |
| **SSE-KMS (AWS)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $25 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Standard |
| **SSE-KMS (CMK)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $75 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High Security |
| **Client-Side** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0 | ⭐⭐ | ⭐⭐⭐ | Maximum Control |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 DETAILED OPTION ANALYSIS:

Option 1: SSE-S3 (AES256)
├─ Security: ⭐⭐⭐⭐
│  ✅ AES-256 encryption
│  ✅ AWS manages keys
│  ⚠️ No key rotation visibility
│  ⚠️ No access control on keys
│
├─ Compliance: ⭐⭐⭐
│  ✅ Meets GDPR encryption requirement
│  ⚠️ Limited audit trail for SOC 2
│  ⚠️ Cannot demonstrate key management controls
│
├─ Cost: ⭐⭐⭐⭐⭐
│  ✅ Free (no additional cost)
│  ✅ No API request charges
│
├─ Operational: ⭐⭐⭐⭐⭐
│  ✅ Zero configuration
│  ✅ No key management overhead
│  ✅ Automatic encryption
│
└─ Verdict: ⚠️ INSUFFICIENT for your requirements
   Reason: SOC 2 requires demonstrable key management controls

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 2: SSE-KMS with Customer Managed Key (RECOMMENDED)
├─ Security: ⭐⭐⭐⭐⭐
│  ✅ AES-256 encryption
│  ✅ Customer-controlled key
│  ✅ Automatic key rotation
│  ✅ Key usage policies
│  ✅ Cross-account access control
│
├─ Compliance: ⭐⭐⭐⭐⭐
│  ✅ Meets GDPR encryption requirement
│  ✅ CloudTrail logs for all key usage
│  ✅ Demonstrates key management controls (SOC 2)
│  ✅ Key rotation evidence
│  ✅ Access control audit trail
│
├─ Cost: ⭐⭐⭐
│  ⚠️ $1/month per key
│  ⚠️ $0.03 per 10,000 requests
│  📊 Estimated: $75/month
│     - Key: $1/month
│     - Requests: ~250K/month = $74/month
│
├─ Operational: ⭐⭐⭐
│  ⚠️ Requires key management
│  ✅ Automatic rotation available
│  ✅ CloudWatch metrics
│  ⚠️ Need to manage key policies
│
└─ Verdict: ✅ RECOMMENDED
   Reason: Best balance for your compliance requirements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 COMPREHENSIVE COST-BENEFIT ANALYSIS:

Current State (No Encryption):
├─ Storage cost: $100/month (500 GB × $0.023/GB)
├─ Compliance risk: HIGH (GDPR violation)
├─ Potential fine: Up to €20M or 4% of revenue
├─ Audit finding: Certain (SOC 2 failure)
└─ Estimated risk cost: $50,000/month (expected value)

Recommended State (SSE-KMS with CMK):
├─ Storage cost: $100/month (unchanged)
├─ Encryption cost: $75/month
├─ Total cost: $175/month
├─ Compliance risk: LOW (meets all requirements)
├─ Audit finding: None (demonstrates controls)
└─ Estimated risk cost: $500/month (residual risk)

Net Benefit Analysis:
├─ Additional cost: +$75/month
├─ Risk reduction: -$49,500/month
├─ Net benefit: $49,425/month
├─ ROI: 65,900%
└─ Payback period: Immediate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DECISION MATRIX: Storage Class Strategy

| Strategy | Cost/Month | Retrieval | Compliance | Best For |
|----------|-----------|-----------|------------|----------|
| **S3 Standard** | $100 | Instant | ✅ | Active data |
| **S3 IA** | $50 | Instant | ✅ | Infrequent access |
| **S3 Glacier** | $5 | Hours | ✅ | Archive |
| **Intelligent-Tiering** | $55 | Instant | ✅ | Unknown pattern |
| **Lifecycle Mix** | $25 | Varies | ✅ | Predictable pattern |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 LIFECYCLE STRATEGY ANALYSIS:

Recommended: Lifecycle Mix (Tiered Storage)

Phase 1: Active (0-90 days)
├─ Storage class: S3 Standard
├─ Access pattern: 80% of reads occur here
├─ Cost: $100/month for 500 GB
└─ Justification: Fast access for recent data

Phase 2: Infrequent (90 days - 1 year)
├─ Storage class: S3 Standard-IA
├─ Access pattern: 15% of reads occur here
├─ Cost: $50/month for 500 GB
├─ Savings: 50% vs Standard
└─ Justification: Occasional access acceptable

Phase 3: Archive (1-7 years)
├─ Storage class: S3 Glacier Flexible Retrieval
├─ Access pattern: 5% of reads occur here
├─ Cost: $5/month for 500 GB
├─ Savings: 95% vs Standard
├─ Retrieval: 3-5 hours (acceptable for compliance)
└─ Justification: Compliance archive, rarely accessed

Phase 4: Deletion (After 7 years)
├─ Action: Automatic deletion
├─ Compliance: Meets retention requirement
└─ Cost: $0 (no storage)

Cost Projection (3-year):
├─ Year 1: $100/month average (building archive)
├─ Year 2: $60/month average (more in Glacier)
├─ Year 3: $35/month average (most in Glacier)
├─ 3-year total: $2,340
├─ Without lifecycle: $3,600
└─ Savings: $1,260 (35% reduction)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 MULTI-PILLAR IMPACT ANALYSIS:

┌─────────────────────────────────────────────────────────────────────────────┐
│ Pillar                    │ Current │ Recommended │ Impact                  │
├───────────────────────────┼─────────┼─────────────┼─────────────────────────┤
│ Security                  │ ⭐      │ ⭐⭐⭐⭐⭐      │ +CRITICAL (encryption)  │
│ Reliability               │ ⭐⭐⭐    │ ⭐⭐⭐⭐⭐      │ +HIGH (versioning)      │
│ Performance Efficiency    │ ⭐⭐⭐⭐   │ ⭐⭐⭐⭐       │ -LOW (KMS latency)      │
│ Cost Optimization         │ ⭐⭐     │ ⭐⭐⭐⭐⭐      │ +HIGH (lifecycle)       │
│ Operational Excellence    │ ⭐⭐⭐    │ ⭐⭐⭐⭐⭐      │ +HIGH (automation)      │
│ Sustainability            │ ⭐⭐⭐    │ ⭐⭐⭐⭐       │ +MEDIUM (less storage)  │
└─────────────────────────────────────────────────────────────────────────────┘

Overall Score: 2.3/5.0 → 4.7/5.0 (+104% improvement)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TRADE-OFF SCENARIOS:

Scenario 1: Startup with Tight Budget
├─ Recommendation: SSE-S3 + Lifecycle
├─ Cost: $25/month
├─ Trade-off: Limited audit trail
├─ Rationale: Meets basic compliance, defer KMS until Series A
└─ Migration: Upgrade to KMS before SOC 2 audit

Scenario 2: Enterprise with SOC 2 (Your Case)
├─ Recommendation: SSE-KMS (CMK) + Lifecycle + Versioning
├─ Cost: $100/month
├─ Trade-off: Higher cost for compliance
├─ Rationale: Demonstrates controls, passes audit
└─ Justification: Compliance requirement is non-negotiable

Scenario 3: Highly Regulated (HIPAA, PCI-DSS)
├─ Recommendation: SSE-KMS (CMK) + MFA Delete + Object Lock
├─ Cost: $150/month
├─ Trade-off: Highest cost, most complexity
├─ Rationale: Maximum security and compliance
└─ Additional: Consider AWS Backup for compliance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 IMPLEMENTATION ROADMAP:

Phase 1: Security (Week 1) - CRITICAL
├─ Create KMS customer managed key
├─ Enable automatic key rotation
├─ Configure key policy for least privilege
├─ Enable bucket encryption with KMS
├─ Estimated effort: 4 hours
└─ Risk mitigation: Immediate compliance

Phase 2: Data Protection (Week 2) - HIGH
├─ Enable versioning
├─ Configure MFA delete
├─ Set up bucket replication (optional)
├─ Estimated effort: 3 hours
└─ Risk mitigation: Prevent data loss

Phase 3: Cost Optimization (Week 3-4) - MEDIUM
├─ Create lifecycle policy
├─ Test transitions with sample data
├─ Monitor cost savings
├─ Estimated effort: 6 hours
└─ Benefit: 35% cost reduction

Phase 4: Monitoring (Week 4) - MEDIUM
├─ Set up CloudWatch alarms
├─ Configure S3 access logging
├─ Enable CloudTrail for bucket
├─ Create compliance dashboard
├─ Estimated effort: 5 hours
└─ Benefit: Continuous compliance monitoring

Total Implementation: 18 hours over 4 weeks
Total Cost: $100/month ongoing
Total Benefit: $49,425/month risk reduction + $65/month cost savings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FINAL RECOMMENDATION:

Implement SSE-KMS with Customer Managed Key + Lifecycle Policy + Versioning

Complete Terraform Configuration:
```hcl
# KMS key for encryption
resource "aws_kms_key" "s3_key" {
  description             = "KMS key for S3 bucket encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = {
    Environment = "production"
    Compliance  = "GDPR-SOC2"
  }
}

resource "aws_kms_alias" "s3_key_alias" {
  name          = "alias/s3-customer-data"
  target_key_id = aws_kms_key.s3_key.key_id
}

# S3 bucket
resource "aws_s3_bucket" "data" {
  bucket = "company-customer-data"
  
  tags = {
    Environment = "production"
    DataType    = "customer-pii"
    Compliance  = "GDPR-SOC2"
  }
}

# Encryption configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3_key.arn
    }
    bucket_key_enabled = true
  }
}

# Versioning
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  
  versioning_configuration {
    status     = "Enabled"
    mfa_delete = "Enabled"
  }
}

# Lifecycle policy
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
  
  rule {
    id     = "transition-to-glacier"
    status = "Enabled"
    
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
  
  rule {
    id     = "delete-after-retention"
    status = "Enabled"
    
    expiration {
      days = 2555  # 7 years
    }
  }
}

# Public access block
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Logging
resource "aws_s3_bucket_logging" "data" {
  bucket = aws_s3_bucket.data.id
  
  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}
```

Justification Summary:
✅ Meets GDPR encryption requirement (SSE-KMS)
✅ Meets SOC 2 control requirements (key management, audit trail)
✅ Meets 7-year retention requirement (lifecycle + Glacier)
✅ Optimizes costs (35% reduction via lifecycle)
✅ Protects against data loss (versioning)
✅ Provides audit trail (CloudTrail + S3 logging)
✅ Within budget ($100/month < $500 budget)
✅ 65,900% ROI from risk reduction

Review completed in 9.8 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Characteristics:**
- ✅ Comprehensive context gathering (10+ questions)
- ✅ Multiple decision matrices
- ✅ Detailed option analysis for each choice
- ✅ Quantitative cost-benefit analysis with ROI
- ✅ Multi-pillar impact analysis
- ✅ Trade-off scenarios for different contexts
- ✅ Implementation roadmap with timeline
- ✅ Complete production-ready code
- ⏱️ Thorough but slower (9.8 seconds)

---


## Summary: Mode Selection Decision Guide

### Quick Reference Table

| Scenario | Recommended Mode | Rationale |
|----------|-----------------|-----------|
| CI/CD pipeline check | Simple | Fast feedback, no interaction possible |
| Development file review | Simple | Quick validation, lower risk |
| Production file review | Context-Aware | Higher risk, context matters |
| Staging file review | Context-Aware | Pre-production validation |
| Major architecture decision | Full Analysis | Need comprehensive comparison |
| Quick check requested | Simple | User explicitly wants speed |
| "What are trade-offs?" | Context-Aware | User needs conditional guidance |
| "Compare all options" | Full Analysis | User needs decision matrix |
| Pre-commit hook | Simple | Fast feedback loop |
| PR review | Context-Aware | Balance speed and thoroughness |
| Architecture review meeting | Full Analysis | Need detailed justification |

### Mode Characteristics Summary

**Simple Mode:**
- ⏱️ Speed: 2.5-6 seconds
- 💰 Cost: $0.90 per review
- 🎯 Use: Quick checks, CI/CD, development
- ✅ Provides: Prescriptive recommendations
- ❌ Lacks: Context questions, trade-offs

**Context-Aware Mode:**
- ⏱️ Speed: 4-8 seconds
- 💰 Cost: $1.86 per review
- 🎯 Use: Production reviews, interactive sessions
- ✅ Provides: Conditional guidance, trade-offs
- ✅ Includes: Context gathering, alternatives

**Full Analysis Mode:**
- ⏱️ Speed: 5-10 seconds
- 💰 Cost: $3.66 per review
- 🎯 Use: Major decisions, comprehensive analysis
- ✅ Provides: Decision matrices, scenarios, ROI
- ✅ Includes: Multi-pillar analysis, roadmaps

### When to Switch Modes

**Escalate to Context-Aware:**
- User asks "Why?" or "What are the trade-offs?"
- User asks "What are my options?"
- Simple Mode finds high-risk issue in production

**Escalate to Full Analysis:**
- User asks "Compare all options"
- User asks "What's the ROI?"
- User needs to justify decision to stakeholders
- Major architecture decision with budget implications

**Simplify to Simple:**
- User asks for "quick check" after detailed analysis
- Reviewing multiple files (use Simple for less critical ones)
- User wants fast feedback on minor changes

### Cost Optimization Tips

1. **Use Simple Mode by default** for routine checks (10x cheaper than Full Analysis)
2. **Reserve Context-Aware** for production and staging environments
3. **Reserve Full Analysis** for major decisions (1% of reviews)
4. **Enable auto-detection** to use appropriate mode automatically
5. **Configure CI/CD** to always use Simple Mode

**Example Cost Breakdown (100 reviews/month):**
- All Simple: $90/month
- All Context-Aware: $186/month
- All Full Analysis: $366/month
- **Recommended mix (80/15/5): $126/month**
  - 80 Simple reviews: $72
  - 15 Context-Aware: $28
  - 5 Full Analysis: $18
  - Savings: $240/month vs all Full Analysis

---

## Conclusion

This document demonstrates how the three review modes provide different levels of analysis appropriate for different scenarios:

1. **Simple Mode** excels at fast, prescriptive guidance for routine checks
2. **Context-Aware Mode** balances speed with conditional recommendations based on system context
3. **Full Analysis Mode** provides comprehensive decision support with quantitative analysis

The automatic mode detection ensures the right mode is used by default, while explicit overrides and mid-session switching provide flexibility for users to get the level of detail they need.

By choosing the appropriate mode for each scenario, teams can optimize for both cost and effectiveness, using detailed analysis where it matters most while maintaining fast feedback loops for routine checks.

