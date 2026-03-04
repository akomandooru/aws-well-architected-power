# Trade-Off Decision Matrix Examples

## Overview

This document provides comprehensive decision matrices for common AWS architecture decisions. Each matrix includes context factors, cost estimates, complexity ratings, and clear guidance on when to use each option.

These matrices help you make informed trade-off decisions based on your specific context rather than following prescriptive rules.

## How to Use These Matrices

1. **Identify your context**: Determine your environment type, SLA requirements, budget constraints, and data classification
2. **Review the matrix**: Look at the options and how they compare across different criteria
3. **Consider trade-offs**: Understand what you gain and what you give up with each option
4. **Make an informed decision**: Choose the option that best fits your specific context
5. **Document your decision**: Record your rationale for future reference

---

## Matrix 1: Multi-AZ vs. Single-AZ Deployment

### Context Factors

- **Environment Type**: Development, Staging, Production
- **SLA Requirement**: Target uptime percentage
- **Budget Constraint**: Monthly infrastructure budget
- **Criticality**: Impact of downtime on business
- **Recovery Time Objective (RTO)**: Acceptable downtime duration

### Decision Matrix

| Option | Cost Impact | Availability | Recovery Time | Complexity | Best For |
|--------|-------------|--------------|---------------|------------|----------|
| **Single-AZ** | Baseline ($1000/mo) | 99% (3.65 days/year downtime) | 1-2 hours (manual) | Low | Dev/test environments, internal tools, cost-sensitive non-critical apps |
| **Multi-AZ** | 2x cost ($2000/mo) | 99.95% (4.38 hours/year downtime) | 60-120 seconds (automatic) | Medium | Production with SLA, customer-facing apps, business-critical systems |
| **Multi-Region** | 3-4x cost ($3000-4000/mo) | 99.99% (52 minutes/year downtime) | 5-15 minutes (automated failover) | High | Global apps, disaster recovery, regulatory requirements |

### When to Use Each Option

**Single-AZ - Use When:**
- Environment is development or testing
- Application is internal-only with no SLA commitment
- Budget is tight and downtime is acceptable
- Workload is non-critical (e.g., batch processing, dev tools)
- Manual recovery within 1-2 hours is acceptable

**Multi-AZ - Use When:**
- Environment is production with SLA ≥99.9%
- Application is customer-facing
- Automatic failover is required
- Business impact of downtime is high
- Budget allows for 2x infrastructure cost

**Multi-Region - Use When:**
- SLA requirement is ≥99.99%
- Global user base requires low latency worldwide
- Disaster recovery across regions is required
- Regulatory requirements mandate geographic redundancy
- Business can justify 3-4x infrastructure cost

### Cost Breakdown Example (RDS Database)

| Configuration | Monthly Cost | Annual Cost | Downtime/Year |
|---------------|--------------|-------------|---------------|
| db.t3.medium Single-AZ | $60 | $720 | 3.65 days |
| db.t3.medium Multi-AZ | $120 | $1,440 | 4.38 hours |
| db.t3.medium Multi-Region (2 regions) | $240 | $2,880 | 52 minutes |

### Trade-Off Analysis

**Reliability vs. Cost:**
- Multi-AZ doubles cost but reduces downtime by 99%
- Multi-Region quadruples cost but provides disaster recovery

**Complexity vs. Availability:**
- Single-AZ is simple but requires manual intervention
- Multi-AZ adds moderate complexity for automatic failover
- Multi-Region adds significant complexity for cross-region replication

### Recommendation Framework

```
IF environment == "production" AND sla >= 99.9%:
    REQUIRED: Multi-AZ
    
ELSE IF environment == "production" AND budget == "tight":
    CONSIDER: Single-AZ + automated backups + documented recovery procedures
    TRADE-OFF: Save $1000/month but accept 1-2 hour recovery time
    
ELSE IF environment == "development" OR environment == "staging":
    ACCEPTABLE: Single-AZ
    RATIONALE: Cost savings outweigh availability needs for non-production
    
ELSE IF global_users == true OR sla >= 99.99%:
    REQUIRED: Multi-Region
    RATIONALE: Geographic distribution needed for latency or disaster recovery
```

---

## Matrix 2: Encryption Approach Decision

### Context Factors

- **Data Classification**: Public, Internal, Confidential, Restricted
- **Regulatory Requirements**: GDPR, HIPAA, PCI-DSS, SOC 2
- **Contains PII/PHI/Financial Data**: Yes/No
- **Key Management Requirements**: AWS-managed vs. customer-managed
- **Audit Requirements**: Basic vs. comprehensive

### Decision Matrix

| Option | Cost Impact | Security Level | Key Control | Compliance | Complexity | Best For |
|--------|-------------|----------------|-------------|------------|------------|----------|
| **SSE-S3 (S3 only)** | Free | Basic | AWS-managed, no audit trail | Basic encryption only | Very Low | Public data, non-sensitive internal data, cost-sensitive projects |
| **SSE-KMS (AWS-managed keys)** | Free | Good | AWS-managed, automatic rotation | Meets basic requirements | Low | Development, non-regulated data, internal applications |
| **SSE-KMS (Customer-managed keys)** | $1/mo per key + $0.03/10k requests | Excellent | Full control, custom rotation, audit trail | Meets most regulatory requirements | Medium | Production, PII/financial data, regulated industries |
| **Client-Side Encryption** | Application overhead | Maximum | Complete client control | Meets strictest requirements | High | Highly sensitive data, zero-trust architecture, specific compliance needs |

### When to Use Each Option

**SSE-S3 - Use When:**
- Data is public or non-sensitive
- No regulatory requirements
- Cost is primary concern
- Basic encryption for defense-in-depth
- S3 is the only storage service

**SSE-KMS with AWS-Managed Keys - Use When:**
- Data is internal but not highly sensitive
- Basic compliance requirements
- Development or staging environments
- Want encryption without management overhead
- No audit trail requirements

**SSE-KMS with Customer-Managed Keys (CMK) - Use When:**
- Data contains PII, financial data, or health information
- GDPR, HIPAA, PCI-DSS, or SOC 2 compliance required
- Need audit trail of key usage
- Production environment
- Custom key rotation policies needed
- **This is the RECOMMENDED option for most production workloads**

**Client-Side Encryption - Use When:**
- Zero-trust architecture required
- Data must be encrypted before leaving client
- Regulatory requirements mandate client-side encryption
- Need to prove data is encrypted before cloud storage
- Have resources to manage encryption in application

### Cost Breakdown Example

| Encryption Type | Setup Cost | Monthly Cost | Annual Cost |
|-----------------|------------|--------------|-------------|
| SSE-S3 | $0 | $0 | $0 |
| SSE-KMS (AWS-managed) | $0 | $0 | $0 |
| SSE-KMS (CMK) | $0 | $1 + API costs (~$3) | $48 |
| Client-Side | Development time | Application overhead | Variable |

**API Cost Example (KMS CMK):**
- 1 million requests/month = $30
- 100,000 requests/month = $3
- 10,000 requests/month = $0.30

### Trade-Off Analysis

**Security vs. Cost:**
- SSE-S3 is free but provides minimal control
- KMS CMK costs $1-5/month but provides full audit trail
- Client-side encryption adds development and operational cost

**Control vs. Complexity:**
- AWS-managed keys are simple but provide no audit trail
- Customer-managed keys add moderate complexity for full control
- Client-side encryption adds significant complexity for maximum control

### Compliance Requirements

| Regulation | Minimum Required | Recommended |
|------------|------------------|-------------|
| **GDPR** | SSE-KMS (CMK) | SSE-KMS (CMK) with key rotation |
| **HIPAA** | SSE-KMS (CMK) | SSE-KMS (CMK) + access logging |
| **PCI-DSS** | SSE-KMS (CMK) | SSE-KMS (CMK) + key rotation + audit |
| **SOC 2** | SSE-KMS (CMK) | SSE-KMS (CMK) with documented procedures |
| **None** | SSE-S3 or SSE-KMS (AWS-managed) | SSE-KMS (CMK) for production |

### Recommendation Framework

```
IF contains_pii OR contains_financial_data OR contains_health_data:
    REQUIRED: SSE-KMS with Customer-Managed Keys
    RATIONALE: Regulatory compliance and audit requirements
    COST: $1-5/month (negligible compared to breach risk)
    
ELSE IF regulatory_requirements IN ["GDPR", "HIPAA", "PCI-DSS", "SOC2"]:
    REQUIRED: SSE-KMS with Customer-Managed Keys
    RATIONALE: Compliance mandates encryption with audit trail
    NON-NEGOTIABLE: Fines can reach €20M (GDPR) or $1.5M/year (HIPAA)
    
ELSE IF environment == "production" AND data_classification >= "confidential":
    RECOMMENDED: SSE-KMS with Customer-Managed Keys
    RATIONALE: Best practice for production data protection
    COST: $1-5/month for peace of mind
    
ELSE IF environment == "development" OR data_classification == "internal":
    ACCEPTABLE: SSE-KMS with AWS-Managed Keys
    RATIONALE: Adequate protection without management overhead
    
ELSE IF data_classification == "public":
    OPTIONAL: SSE-S3
    RATIONALE: Encryption provides defense-in-depth but not required
```

---

## Matrix 3: Instance Sizing Decision

### Context Factors

- **Latency Target**: Response time requirement
- **Throughput Requirement**: Requests per second
- **Budget Constraint**: Monthly compute budget
- **Workload Pattern**: Steady, variable, spiky, batch
- **Performance Priority**: Cost-optimized vs. performance-optimized

### Decision Matrix

| Option | Monthly Cost | Performance | CPU Credits | Best For | Avoid When |
|--------|--------------|-------------|-------------|----------|------------|
| **t4g.micro** | $6 | Very Low (2 vCPU, 1GB) | Burstable | Minimal workloads, dev/test | Production, consistent load |
| **t4g.small** | $12 | Low (2 vCPU, 2GB) | Burstable | Small apps, microservices | High CPU usage |
| **t4g.medium** | $24 | Medium (2 vCPU, 4GB) | Burstable | Standard apps, variable load | Sustained high CPU |
| **t4g.large** | $48 | Good (2 vCPU, 8GB) | Burstable | Growing apps, moderate load | CPU-intensive workloads |
| **m6g.large** | $62 | Excellent (2 vCPU, 8GB) | Unlimited | Balanced workloads, production | Cost-sensitive projects |
| **c6g.large** | $59 | Excellent (2 vCPU, 4GB) | Unlimited | Compute-intensive, low latency | Memory-intensive workloads |
| **r6g.large** | $91 | Excellent (2 vCPU, 16GB) | Unlimited | Memory-intensive, databases | Cost-sensitive, CPU-bound |
| **c6g.2xlarge** | $235 | Outstanding (8 vCPU, 16GB) | Unlimited | High-performance, <50ms latency | Budget constraints |

**Note:** Graviton (ARM) instances provide 20-40% better price/performance than x86 equivalents.

### When to Use Each Option

**t4g.micro/small - Use When:**
- Development or testing environments
- Minimal workloads (<10 req/sec)
- Budget is extremely tight ($10-20/month)
- Workload is very light and intermittent
- Learning or experimentation

**t4g.medium - Use When:**
- Starting a new application (scale up later)
- Variable workload with occasional spikes
- Budget is tight ($20-50/month)
- Latency target >500ms is acceptable
- Throughput <100 req/sec

**t4g.large - Use When:**
- Growing application with moderate traffic
- Variable workload pattern
- Budget is moderate ($50-100/month)
- Latency target >200ms
- Throughput <500 req/sec

**m6g.large (General Purpose) - Use When:**
- Production workload with balanced CPU/memory needs
- Steady-state traffic pattern
- Latency target <200ms
- Throughput <2000 req/sec
- Need consistent performance without CPU credits

**c6g.large (Compute-Optimized) - Use When:**
- CPU-intensive workloads (computation, encoding)
- Latency target <100ms
- Throughput <3000 req/sec
- Low memory requirements
- Performance is priority over cost

**r6g.large (Memory-Optimized) - Use When:**
- Memory-intensive workloads (caching, in-memory databases)
- Large datasets in memory
- Database workloads
- Need high memory-to-CPU ratio

**c6g.2xlarge+ - Use When:**
- High-performance requirements (<50ms latency)
- Throughput >5000 req/sec
- CPU-intensive workloads at scale
- Performance is business differentiator
- Budget allows for premium performance

### Cost vs. Performance Analysis

| Latency Target | Throughput | Recommended Instance | Monthly Cost | Cost per 1M Requests |
|----------------|------------|---------------------|--------------|---------------------|
| >1000ms | <100 req/sec | t4g.medium | $24 | $0.33 |
| >500ms | <500 req/sec | t4g.large | $48 | $0.13 |
| >200ms | <2000 req/sec | m6g.large | $62 | $0.04 |
| >100ms | <3000 req/sec | c6g.large | $59 | $0.03 |
| <100ms | <5000 req/sec | c6g.xlarge | $118 | $0.03 |
| <50ms | >5000 req/sec | c6g.2xlarge | $235 | $0.02 |

### Trade-Off Analysis

**Cost vs. Performance:**
- Larger instances cost 2-3x more but provide 2-4x better performance
- Burstable instances (t4g) are cheapest but can throttle under sustained load
- Compute-optimized (c6g) provides best price/performance for CPU-bound workloads

**Flexibility vs. Consistency:**
- Burstable instances (t4g) are flexible but performance varies with CPU credits
- Fixed-performance instances (m6g, c6g, r6g) cost more but provide consistent performance

### Optimization Strategies

**Strategy 1: Start Small, Scale Up**
```
1. Start with t4g.medium ($24/month)
2. Monitor CPU utilization and latency
3. If CPU >70% for sustained periods, upgrade to t4g.large
4. If CPU credits depleted, switch to m6g.large
5. If latency >target, consider c6g.large
```

**Strategy 2: Add Caching Before Scaling**
```
Cost Analysis:
- Scaling from t4g.medium to c6g.2xlarge: +$211/month
- Adding ElastiCache (cache.t4g.small): +$12/month

Performance Impact:
- Larger instance: 2-3x performance improvement
- Caching: 10-20x performance improvement for read-heavy workloads

Recommendation: Add caching first (better ROI)
```

**Strategy 3: Use Auto Scaling**
```
Configuration:
- Min: 2x t4g.medium ($48/month baseline)
- Max: 10x t4g.medium ($240/month peak)
- Target: 70% CPU utilization

Benefits:
- Scale up during peak hours
- Scale down during off-hours (save 50-70%)
- Pay only for what you use
```

### Recommendation Framework

```
IF latency_target > 1000ms AND budget == "tight":
    START WITH: t4g.medium ($24/month)
    MONITOR: CPU utilization, latency, throughput
    SCALE UP: When CPU >70% sustained or latency exceeds target
    
ELSE IF latency_target < 100ms AND performance_priority == "high":
    CONSIDER: c6g.large or larger ($59+/month)
    ALTERNATIVE: Add caching (ElastiCache) to smaller instance
    TRADE-OFF: Caching provides better ROI than larger instances
    
ELSE IF workload_pattern == "variable":
    USE: Burstable instances (t4g family) with Auto Scaling
    BENEFIT: Pay only for actual usage
    MONITOR: CPU credit balance
    
ELSE IF workload_pattern == "steady" AND environment == "production":
    USE: Fixed-performance instances (m6g, c6g, r6g)
    BENEFIT: Consistent performance, no CPU credit concerns
    CONSIDER: Reserved Instances for 30-40% savings
    
ELSE IF latency_target < 10ms:
    REQUIRED: Specialized architecture
    - Compute-optimized instances (c6g.2xlarge+)
    - In-memory caching (ElastiCache Redis)
    - Low-latency networking (placement groups)
    - Edge locations (CloudFront)
    COST: $500-2000/month
    QUESTION: Is <10ms a business requirement or nice-to-have?
```

---

## Matrix 4: Caching Strategy Decision

### Context Factors

- **Workload Type**: Read-heavy, write-heavy, balanced
- **Data Access Pattern**: Frequently accessed, predictable, random
- **Latency Requirement**: Target response time
- **Data Consistency**: Strong vs. eventual consistency
- **Budget**: Monthly caching budget

### Decision Matrix

| Option | Monthly Cost | Latency Reduction | Complexity | Data Types | Best For |
|--------|--------------|-------------------|------------|------------|----------|
| **Application-Level (In-Memory)** | $0 (included in compute) | 90-95% | Low | Simple key-value | Small datasets, single instance, simple caching |
| **ElastiCache Redis (cache.t4g.micro)** | $11 | 80-90% | Medium | Complex data structures | Small-medium datasets, distributed caching, pub/sub |
| **ElastiCache Redis (cache.m6g.large)** | $146 | 80-90% | Medium | Complex data structures | Large datasets, high throughput, production workloads |
| **ElastiCache Memcached (cache.t4g.micro)** | $11 | 80-90% | Low | Simple key-value | Simple caching, horizontal scaling, multi-threaded |
| **DynamoDB DAX (dax.t3.small)** | $73 | 90-95% | Low | DynamoDB items only | DynamoDB-specific, microsecond latency, read-heavy |
| **CloudFront (CDN)** | $0.085/GB + requests | 95-99% | Low | Static/dynamic content | Global users, static assets, API responses |

### When to Use Each Option

**Application-Level Caching - Use When:**
- Dataset is small (<100MB)
- Single instance or simple architecture
- Budget is extremely tight
- Caching logic is simple (key-value)
- No need for distributed caching
- Development or testing environment

**ElastiCache Redis - Use When:**
- Need distributed caching across multiple instances
- Require complex data structures (lists, sets, sorted sets)
- Need pub/sub messaging
- Require data persistence
- Need atomic operations
- Production workload with moderate-high traffic
- **Most versatile caching solution**

**ElastiCache Memcached - Use When:**
- Need simple key-value caching
- Require horizontal scaling (add more nodes)
- Multi-threaded performance is important
- Don't need data persistence
- Don't need complex data structures
- Simpler than Redis is acceptable

**DynamoDB DAX - Use When:**
- Using DynamoDB as primary database
- Need microsecond read latency
- Read-heavy DynamoDB workload
- Want managed caching with no configuration
- Willing to pay premium for simplicity
- **Only works with DynamoDB**

**CloudFront CDN - Use When:**
- Serving static assets (images, CSS, JS)
- Global user base
- API responses can be cached
- Need edge caching close to users
- Want to reduce origin load
- **Best for global distribution**

### Cost Breakdown Example

**Scenario: 1000 req/sec read-heavy application**

| Strategy | Setup | Monthly Cost | Latency | Cache Hit Rate |
|----------|-------|--------------|---------|----------------|
| No caching | - | $0 | 200ms | 0% |
| Application-level | In-app | $0 | 20ms | 70% |
| ElastiCache Redis (t4g.micro) | Managed | $11 | 5ms | 85% |
| ElastiCache Redis (m6g.large) | Managed | $146 | 2ms | 90% |
| DynamoDB DAX (t3.small) | Managed | $73 | 1ms | 90% |
| CloudFront | CDN | $50-100 | 10-50ms | 95% |

### Performance Impact Analysis

**Without Caching:**
- Database queries: 200ms average
- Throughput: Limited by database capacity
- Cost: High database instance required

**With Caching (85% hit rate):**
- Cached responses: 5ms average
- Database queries: 200ms (15% of requests)
- Average latency: (0.85 × 5ms) + (0.15 × 200ms) = 34ms
- **Latency reduction: 83%**
- Database load reduction: 85%

### Trade-Off Analysis

**Cost vs. Performance:**
- Application-level caching is free but limited to single instance
- ElastiCache costs $11-150/month but provides distributed caching
- DAX costs $73+/month but provides microsecond latency for DynamoDB
- CloudFront costs vary with traffic but provides global edge caching

**Simplicity vs. Features:**
- Application-level is simplest but least scalable
- Memcached is simple but lacks advanced features
- Redis is complex but most feature-rich
- DAX is simple but DynamoDB-only
- CloudFront is simple for static content

**Consistency vs. Performance:**
- No caching: Strong consistency, slower
- Short TTL (1-5 min): Near-real-time, good performance
- Long TTL (1+ hour): Eventual consistency, best performance

### Caching Patterns

**Pattern 1: Lazy Loading (Cache-Aside)**
```
1. Application checks cache first
2. If cache miss, query database
3. Store result in cache
4. Return result

Pros: Only cache what's needed
Cons: Cache miss penalty, stale data possible
Best for: Read-heavy workloads
```

**Pattern 2: Write-Through**
```
1. Application writes to cache and database simultaneously
2. Cache always has latest data

Pros: Cache always fresh
Cons: Write latency, cache may have unused data
Best for: Write-heavy workloads, strong consistency needs
```

**Pattern 3: Time-To-Live (TTL)**
```
1. Set expiration time on cached items
2. Automatically refresh stale data

Pros: Balances freshness and performance
Cons: Requires tuning TTL values
Best for: Most production workloads
```

### Recommendation Framework

```
IF using_dynamodb AND read_heavy_workload:
    RECOMMENDED: DynamoDB DAX
    RATIONALE: Purpose-built for DynamoDB, microsecond latency
    COST: $73/month (dax.t3.small)
    ALTERNATIVE: ElastiCache Redis if need more control
    
ELSE IF global_users AND serving_static_content:
    REQUIRED: CloudFront CDN
    RATIONALE: Edge caching reduces latency globally
    COST: $0.085/GB + $0.0075/10k requests
    BENEFIT: 95-99% latency reduction for global users
    
ELSE IF need_complex_data_structures OR need_pub_sub:
    RECOMMENDED: ElastiCache Redis
    RATIONALE: Most versatile, supports complex operations
    COST: $11/month (t4g.micro) to $146/month (m6g.large)
    
ELSE IF simple_key_value AND need_horizontal_scaling:
    CONSIDER: ElastiCache Memcached
    RATIONALE: Simpler than Redis, good for basic caching
    COST: $11/month (t4g.micro)
    
ELSE IF dataset_small AND single_instance:
    ACCEPTABLE: Application-level caching
    RATIONALE: Free, simple, sufficient for small scale
    COST: $0
    LIMITATION: Not distributed, lost on instance restart
    
ELSE IF budget_tight AND starting_out:
    START WITH: Application-level caching
    PLAN: Migrate to ElastiCache when traffic grows
    MONITOR: Cache hit rate, latency, memory usage
```

### Cost-Benefit Analysis

**Example: Adding ElastiCache to reduce database load**

**Current State:**
- Database: db.m6g.large ($146/month)
- CPU: 80% (near capacity)
- Latency: 200ms average
- Throughput: 500 req/sec

**Option 1: Scale Database**
- Upgrade to db.m6g.xlarge ($292/month)
- Cost increase: +$146/month
- Performance: 2x capacity
- Latency: 150ms average

**Option 2: Add Caching**
- Keep db.m6g.large ($146/month)
- Add cache.t4g.small ($23/month)
- Cost increase: +$23/month
- Performance: 85% cache hit rate
- Latency: 30ms average (83% reduction)
- Database CPU: 20% (85% load reduction)

**Recommendation: Add caching**
- **6x cheaper** than scaling database
- **5x better latency** improvement
- Allows database to handle 5x more traffic
- **ROI: 600%**

---

## Matrix 5: Disaster Recovery Strategy Decision

### Context Factors

- **Recovery Time Objective (RTO)**: Maximum acceptable downtime
- **Recovery Point Objective (RPO)**: Maximum acceptable data loss
- **Criticality**: Business impact of outage
- **Budget**: Monthly DR budget
- **Compliance**: Regulatory requirements for DR

### Decision Matrix

| Strategy | RTO | RPO | Monthly Cost | Complexity | Data Loss Risk | Best For |
|----------|-----|-----|--------------|------------|----------------|----------|
| **Backup and Restore** | Hours to days | Hours | Low ($50-200) | Low | Hours of data | Non-critical apps, tight budget, acceptable downtime |
| **Pilot Light** | 10-30 minutes | Minutes | Medium ($200-500) | Medium | Minutes of data | Important apps, moderate budget, some downtime OK |
| **Warm Standby** | Minutes | Seconds | High ($500-2000) | Medium-High | Minimal | Business-critical apps, low downtime tolerance |
| **Hot Standby (Multi-Region Active-Active)** | Seconds | None | Very High ($2000-5000+) | High | None | Mission-critical apps, zero downtime, global scale |

### Detailed Strategy Comparison

#### 1. Backup and Restore

**Description:** Regular backups stored in S3/Glacier, restore when needed

**Infrastructure:**
- Primary region: Full production environment
- DR region: No infrastructure (provision on demand)
- Backups: Automated snapshots to S3

**Cost Breakdown:**
- Backup storage: $20-50/month (S3/Glacier)
- Cross-region replication: $10-30/month
- No standby infrastructure: $0
- **Total: $50-200/month**

**Recovery Process:**
1. Detect outage (manual or automated)
2. Provision infrastructure in DR region (15-60 minutes)
3. Restore data from backups (30 minutes - 4 hours)
4. Update DNS to point to DR region (5-10 minutes)
5. **Total RTO: 1-6 hours**

**Use When:**
- Application is non-critical
- Downtime of hours is acceptable
- Budget is tight
- Compliance requires backups only
- Internal tools or batch processing

#### 2. Pilot Light

**Description:** Minimal infrastructure running in DR region, scale up when needed

**Infrastructure:**
- Primary region: Full production environment
- DR region: Core services running (database replication, minimal compute)
- Data: Continuous replication to DR region

**Cost Breakdown:**
- DR database (small instance): $60-150/month
- Data replication: $50-100/month
- Minimal compute (stopped instances): $10-50/month
- Monitoring: $20-50/month
- **Total: $200-500/month**

**Recovery Process:**
1. Detect outage (automated)
2. Scale up compute in DR region (5-10 minutes)
3. Update DNS to point to DR region (5-10 minutes)
4. Verify application functionality (5-10 minutes)
5. **Total RTO: 15-30 minutes**

**Use When:**
- Application is important but not critical
- Downtime of 15-30 minutes is acceptable
- Budget allows for minimal standby infrastructure
- Need faster recovery than backup/restore
- E-commerce, SaaS applications

#### 3. Warm Standby

**Description:** Scaled-down production environment running in DR region

**Infrastructure:**
- Primary region: Full production environment
- DR region: Scaled-down production environment (50% capacity)
- Data: Continuous replication with minimal lag

**Cost Breakdown:**
- DR compute (50% of production): $300-1000/month
- DR database (production-sized): $150-500/month
- Data replication: $50-100/month
- Load balancer: $20-50/month
- Monitoring: $50-100/month
- **Total: $500-2000/month**

**Recovery Process:**
1. Detect outage (automated)
2. Scale up DR environment to full capacity (2-5 minutes)
3. Update DNS or failover load balancer (1-2 minutes)
4. Verify application functionality (2-3 minutes)
5. **Total RTO: 5-10 minutes**

**Use When:**
- Application is business-critical
- Downtime of 5-10 minutes is maximum acceptable
- Budget allows for standby infrastructure
- Need near-zero data loss
- Financial services, healthcare applications

#### 4. Hot Standby (Multi-Region Active-Active)

**Description:** Full production environment running in multiple regions simultaneously

**Infrastructure:**
- Multiple regions: Full production environment in each
- Data: Real-time bidirectional replication
- Traffic: Distributed across regions with automatic failover

**Cost Breakdown:**
- DR compute (100% of production): $1000-2000/month
- DR database (production-sized): $200-500/month
- Data replication (bidirectional): $100-200/month
- Global load balancer: $50-100/month
- Monitoring and orchestration: $100-200/month
- **Total: $2000-5000+/month**

**Recovery Process:**
1. Automatic detection and failover (5-30 seconds)
2. Traffic automatically routed to healthy region
3. No manual intervention required
4. **Total RTO: <1 minute**

**Use When:**
- Application is mission-critical
- Zero downtime required
- Global user base requires low latency
- Budget allows for full redundancy
- Trading platforms, emergency services, global SaaS

### Cost vs. RTO/RPO Analysis

| Strategy | Monthly Cost | RTO | RPO | Annual Cost | Cost per Hour of Downtime Prevented |
|----------|--------------|-----|-----|-------------|-------------------------------------|
| Backup and Restore | $100 | 4 hours | 4 hours | $1,200 | - |
| Pilot Light | $350 | 20 minutes | 5 minutes | $4,200 | $13/hour |
| Warm Standby | $1,000 | 7 minutes | 1 minute | $12,000 | $45/hour |
| Hot Standby | $3,000 | 30 seconds | 0 seconds | $36,000 | $150/hour |

### Trade-Off Analysis

**Cost vs. Availability:**
- Backup/Restore: Cheapest but longest downtime
- Pilot Light: 3.5x cost for 12x faster recovery
- Warm Standby: 10x cost for 35x faster recovery
- Hot Standby: 30x cost for near-zero downtime

**Complexity vs. Recovery Speed:**
- Backup/Restore: Simple but manual recovery
- Pilot Light: Moderate complexity, semi-automated
- Warm Standby: Higher complexity, mostly automated
- Hot Standby: Highest complexity, fully automated

**Data Loss vs. Cost:**
- Backup/Restore: Hours of data loss possible
- Pilot Light: Minutes of data loss possible
- Warm Standby: Seconds of data loss possible
- Hot Standby: Zero data loss

### Recommendation Framework

```
IF rto <= 1_minute AND rpo == 0:
    REQUIRED: Hot Standby (Multi-Region Active-Active)
    COST: $2000-5000+/month
    RATIONALE: Only option that meets requirements
    EXAMPLES: Trading platforms, emergency services
    
ELSE IF rto <= 10_minutes AND rpo <= 1_minute:
    RECOMMENDED: Warm Standby
    COST: $500-2000/month
    RATIONALE: Near-zero downtime with reasonable cost
    EXAMPLES: Financial services, healthcare, e-commerce
    
ELSE IF rto <= 30_minutes AND rpo <= 5_minutes:
    RECOMMENDED: Pilot Light
    COST: $200-500/month
    RATIONALE: Good balance of cost and recovery speed
    EXAMPLES: SaaS applications, customer-facing apps
    
ELSE IF rto <= 4_hours AND budget == "tight":
    ACCEPTABLE: Backup and Restore
    COST: $50-200/month
    RATIONALE: Meets basic DR requirements at low cost
    EXAMPLES: Internal tools, batch processing, dev/test
    
ELSE IF compliance_requires_dr AND rto <= 1_hour:
    MINIMUM: Pilot Light
    RATIONALE: Compliance often requires tested DR capability
    COST: $200-500/month
    
ELSE IF global_users == true:
    RECOMMENDED: Hot Standby (Multi-Region Active-Active)
    RATIONALE: Provides both DR and global low latency
    BENEFIT: DR infrastructure serves production traffic
    COST: $2000-5000+/month (but serves dual purpose)
```

### Cost-Benefit Analysis Example

**Scenario: E-commerce application**
- Revenue: $10,000/hour
- Current: Single region, no DR
- Outage risk: 2 outages/year, 4 hours each
- Annual outage cost: $80,000

**Option 1: Backup and Restore**
- Cost: $1,200/year
- RTO: 4 hours
- Expected downtime: 8 hours/year
- Revenue loss: $80,000/year
- **Net cost: $81,200/year**

**Option 2: Pilot Light**
- Cost: $4,200/year
- RTO: 20 minutes
- Expected downtime: 40 minutes/year
- Revenue loss: $6,667/year
- **Net cost: $10,867/year**
- **Savings vs Option 1: $70,333/year**

**Option 3: Warm Standby**
- Cost: $12,000/year
- RTO: 7 minutes
- Expected downtime: 14 minutes/year
- Revenue loss: $2,333/year
- **Net cost: $14,333/year**
- **Savings vs Option 1: $66,867/year**

**Recommendation: Pilot Light**
- Best ROI: Saves $70k/year vs backup/restore
- Acceptable RTO: 20 minutes is reasonable for e-commerce
- Cost-effective: Only $4,200/year for significant risk reduction

---

## Matrix 6: Database Choice Decision

### Context Factors

- **Data Model**: Relational, document, key-value, graph
- **Query Patterns**: Simple lookups, complex queries, analytics
- **Scale Requirements**: Transactions per second, data volume
- **Consistency Requirements**: Strong vs. eventual consistency
- **Budget**: Monthly database budget
- **Operational Overhead**: Managed vs. self-managed preference

### Decision Matrix

| Database | Monthly Cost (Small) | Monthly Cost (Large) | Data Model | Scalability | Consistency | Complexity | Best For |
|----------|---------------------|---------------------|------------|-------------|-------------|------------|----------|
| **RDS PostgreSQL** | $60 (db.t3.medium) | $500 (db.r6g.2xlarge) | Relational | Vertical (read replicas) | Strong | Medium | Traditional apps, complex queries, ACID transactions |
| **Aurora PostgreSQL** | $87 (db.t4g.medium) | $700 (db.r6g.2xlarge) | Relational | Horizontal (15 replicas) | Strong | Medium | High availability, read-heavy, auto-scaling storage |
| **DynamoDB (On-Demand)** | $1.25/million reads | Variable (pay per use) | Key-value, document | Unlimited horizontal | Eventual (strong optional) | Low | Serverless, unpredictable traffic, simple queries |
| **DynamoDB (Provisioned)** | $13 (25 RCU/WCU) | $260 (500 RCU/WCU) | Key-value, document | Unlimited horizontal | Eventual (strong optional) | Low | Predictable traffic, cost optimization, simple queries |
| **DocumentDB** | $70 (db.t3.medium) | $600 (db.r6g.2xlarge) | Document (MongoDB-compatible) | Horizontal (15 replicas) | Strong | Medium | MongoDB workloads, document storage, JSON data |
| **ElastiCache Redis** | $23 (cache.t4g.small) | $292 (cache.r6g.xlarge) | Key-value, data structures | Horizontal (cluster mode) | Eventual | Medium | Caching, session store, real-time analytics, pub/sub |

### When to Use Each Database

#### RDS PostgreSQL/MySQL

**Use When:**
- Need traditional relational database with SQL
- Require complex joins and transactions
- Have existing SQL-based application
- Need ACID compliance
- Moderate scale (up to 10,000 TPS)
- Want managed service with less overhead than self-hosted

**Avoid When:**
- Need unlimited horizontal scaling
- Require sub-10ms latency
- Have simple key-value access patterns
- Need serverless architecture
- Budget is extremely tight

**Cost Example:**
- db.t3.medium: $60/month (2 vCPU, 4GB, 20GB storage)
- db.m6g.large: $146/month (2 vCPU, 8GB, 100GB storage)
- db.r6g.xlarge: $365/month (4 vCPU, 32GB, 500GB storage)
- Multi-AZ: 2x cost
- Read replicas: +$60-365/month each

#### Aurora PostgreSQL/MySQL

**Use When:**
- Need high availability (99.99% SLA)
- Require read scaling (up to 15 replicas)
- Want automatic storage scaling (up to 128TB)
- Need faster failover than RDS (<30 seconds)
- Have read-heavy workload
- Want better performance than RDS (5x throughput)

**Avoid When:**
- Budget is tight (15-20% more expensive than RDS)
- Workload is write-heavy (Aurora optimized for reads)
- Don't need high availability features
- Simple application with low traffic

**Cost Example:**
- db.t4g.medium: $87/month (2 vCPU, 4GB)
- db.r6g.large: $292/month (2 vCPU, 16GB)
- db.r6g.2xlarge: $700/month (8 vCPU, 64GB)
- Storage: $0.10/GB-month (auto-scaling)
- I/O: $0.20/million requests
- Read replicas: Same instance cost

**Aurora vs RDS Comparison:**
- Aurora: +15-20% cost, 5x performance, better HA
- RDS: Lower cost, simpler, good for most workloads
- **Choose Aurora if:** High availability and read scaling are critical
- **Choose RDS if:** Cost-sensitive and standard features sufficient

#### DynamoDB

**Use When:**
- Need unlimited horizontal scaling
- Require single-digit millisecond latency
- Have simple key-value or document access patterns
- Want serverless (no infrastructure management)
- Traffic is unpredictable (use On-Demand)
- Need global tables for multi-region

**Avoid When:**
- Need complex queries with joins
- Require strong consistency for all reads
- Have relational data model
- Need ad-hoc queries and analytics
- Team lacks NoSQL experience

**Pricing Models:**

**On-Demand (Pay per request):**
- Reads: $1.25/million reads (eventually consistent)
- Writes: $6.25/million writes
- Storage: $0.25/GB-month
- Best for: Unpredictable traffic, new applications, spiky workloads

**Provisioned (Reserve capacity):**
- Reads: $0.00013/hour per RCU (25 RCU = $2.34/month)
- Writes: $0.00065/hour per WCU (25 WCU = $11.70/month)
- Storage: $0.25/GB-month
- Best for: Predictable traffic, cost optimization

**Cost Example (Provisioned):**
- 25 RCU + 25 WCU: $14/month (175 reads/sec, 25 writes/sec)
- 100 RCU + 100 WCU: $56/month (700 reads/sec, 100 writes/sec)
- 500 RCU + 500 WCU: $280/month (3,500 reads/sec, 500 writes/sec)

**Cost Example (On-Demand):**
- 1 million reads + 100k writes/month: $1.88/month
- 100 million reads + 10 million writes/month: $188/month
- 1 billion reads + 100 million reads/month: $1,875/month

#### DocumentDB (MongoDB-compatible)

**Use When:**
- Migrating from MongoDB
- Need document database with JSON data
- Require MongoDB API compatibility
- Want managed service (no MongoDB ops)
- Need high availability and read scaling

**Avoid When:**
- Don't need MongoDB compatibility (use DynamoDB instead)
- Budget is tight (more expensive than DynamoDB)
- Need unlimited horizontal scaling (limited to 15 replicas)
- Simple key-value access (DynamoDB is cheaper)

**Cost Example:**
- db.t3.medium: $70/month (2 vCPU, 4GB)
- db.r6g.large: $292/month (2 vCPU, 16GB)
- Storage: $0.10/GB-month
- I/O: $0.20/million requests

#### ElastiCache Redis

**Use When:**
- Need caching layer for database
- Require session store for web applications
- Want real-time analytics and leaderboards
- Need pub/sub messaging
- Require complex data structures (lists, sets, sorted sets)
- Sub-millisecond latency required

**Avoid When:**
- Need persistent primary database (Redis is cache-first)
- Require complex queries (use relational database)
- Don't need in-memory performance
- Budget is tight and caching not critical

**Cost Example:**
- cache.t4g.micro: $11/month (2 vCPU, 0.5GB)
- cache.t4g.small: $23/month (2 vCPU, 1.5GB)
- cache.m6g.large: $146/month (2 vCPU, 12.9GB)
- cache.r6g.xlarge: $292/month (4 vCPU, 26.3GB)

### Trade-Off Analysis

**Cost vs. Performance:**
- DynamoDB On-Demand: Pay per use, best for unpredictable traffic
- DynamoDB Provisioned: 60-80% cheaper for predictable traffic
- RDS: Fixed cost, good for moderate scale
- Aurora: 15-20% more than RDS, 5x better performance
- ElastiCache: Premium for sub-millisecond latency

**Flexibility vs. Simplicity:**
- RDS/Aurora: SQL flexibility, complex queries, higher complexity
- DynamoDB: Simple key-value, limited query patterns, low complexity
- DocumentDB: JSON flexibility, MongoDB compatibility, medium complexity

**Scalability vs. Cost:**
- RDS: Vertical scaling, limited by instance size, moderate cost
- Aurora: Horizontal read scaling, auto-scaling storage, higher cost
- DynamoDB: Unlimited horizontal scaling, pay per use, variable cost

### Recommendation Framework

```
IF need_complex_queries OR need_joins OR need_transactions:
    IF need_high_availability AND read_heavy:
        RECOMMENDED: Aurora PostgreSQL
        COST: $87-700/month
        BENEFIT: 5x performance, 99.99% SLA, auto-scaling
    ELSE:
        RECOMMENDED: RDS PostgreSQL
        COST: $60-500/month
        BENEFIT: Lower cost, simpler, sufficient for most workloads
        
ELSE IF access_pattern == "simple_key_value" OR access_pattern == "document":
    IF traffic_pattern == "unpredictable":
        RECOMMENDED: DynamoDB On-Demand
        COST: $1.25/million reads, $6.25/million writes
        BENEFIT: Pay only for what you use, no capacity planning
    ELSE IF traffic_pattern == "predictable":
        RECOMMENDED: DynamoDB Provisioned
        COST: $14-280/month (based on capacity)
        BENEFIT: 60-80% cheaper than On-Demand for steady traffic
        
ELSE IF migrating_from_mongodb:
    RECOMMENDED: DocumentDB
    COST: $70-600/month
    BENEFIT: MongoDB compatibility, managed service
    ALTERNATIVE: DynamoDB if can adapt data model
    
ELSE IF need_caching OR need_session_store:
    RECOMMENDED: ElastiCache Redis
    COST: $11-292/month
    BENEFIT: Sub-millisecond latency, complex data structures
    
ELSE IF latency_requirement < 10ms:
    REQUIRED: DynamoDB or ElastiCache
    RATIONALE: Only options that provide single-digit millisecond latency
    
ELSE IF budget_tight AND starting_out:
    START WITH: RDS db.t3.medium ($60/month)
    PLAN: Evaluate traffic patterns, migrate to DynamoDB if simple access
    MONITOR: Query patterns, latency, cost
```

### Migration Considerations

**From Self-Hosted PostgreSQL to AWS:**
1. **RDS PostgreSQL**: Easiest migration, same engine
2. **Aurora PostgreSQL**: Better performance, higher cost
3. **DynamoDB**: Requires data model redesign, best for scale

**From MongoDB to AWS:**
1. **DocumentDB**: Drop-in replacement, MongoDB-compatible
2. **DynamoDB**: Better scalability, requires data model changes

**From MySQL to AWS:**
1. **RDS MySQL**: Direct migration, same engine
2. **Aurora MySQL**: Better performance, higher cost
3. **Aurora PostgreSQL**: If want to modernize to PostgreSQL

### Cost Optimization Strategies

**Strategy 1: Right-Size Database**
```
1. Start with smallest instance (db.t3.medium)
2. Monitor CPU, memory, IOPS
3. Scale up only when needed
4. Use CloudWatch alarms for utilization
```

**Strategy 2: Use Read Replicas**
```
Instead of: Scaling up primary instance
Consider: Adding read replicas for read-heavy workloads
Cost: +$60-365/month per replica
Benefit: Distribute read load, keep primary smaller
```

**Strategy 3: Reserved Instances**
```
For predictable workloads:
- 1-year Reserved Instance: 30-40% savings
- 3-year Reserved Instance: 50-60% savings
Example: db.m6g.large
- On-Demand: $146/month
- 1-year RI: $95/month (35% savings)
- 3-year RI: $65/month (55% savings)
```

**Strategy 4: DynamoDB Provisioned vs On-Demand**
```
Break-even analysis:
- On-Demand: $1.25/million reads
- Provisioned: $2.34/month for 25 RCU (175 reads/sec = 450M reads/month)
- Cost per million reads (Provisioned): $0.0052

If reads > 2.4 million/month: Provisioned is cheaper
If reads < 2.4 million/month: On-Demand is cheaper
```

---

## Summary

These decision matrices provide a framework for making informed architecture decisions based on your specific context. Remember:

1. **Context is critical**: Environment, SLA, budget, and data classification drive decisions
2. **Trade-offs are inevitable**: Every choice involves giving something up to gain something else
3. **Quantify when possible**: Use cost estimates and performance metrics to compare options
4. **Start small, scale up**: Begin with cost-effective options and scale as needed
5. **Document decisions**: Record your rationale for future reference and learning

Use these matrices as starting points, adapt them to your specific needs, and always validate assumptions with testing and monitoring.

