# Common Trade-Off Scenario Library

## Overview

Real-world architecture scenarios with specific constraints, recommended patterns, cost estimates, and trade-off rationale. Find the scenario closest to your context and adapt.

---

## Scenario 1: Startup MVP

**Context:** Production (early stage) | 2-5 people | $500-2,000/month | No formal SLA | No PII
**Priority:** Speed to market > Cost > Reliability > Performance

| Layer | Choice | Cost/Month | Rationale |
|-------|--------|-----------|-----------|
| Compute | 2x t4g.small, Single-AZ, ASG (1-4) | $24 | Start small, scale horizontally |
| Database | RDS PostgreSQL db.t3.medium, Single-AZ | $60 | Managed service, 7-day backups |
| Storage | S3 Standard, SSE-S3 | $5-20 | Pay per use, basic encryption |
| Cache | Application-level in-memory | $0 | Free, sufficient for low traffic |
| Monitoring | CloudWatch free tier + basic alarms | $0-10 | Essential coverage only |
| **Total** | | **$110-150** | |

**Key Trade-Offs:**
- Single-AZ saves ~$100/month but accepts 99% availability (3.65 days downtime/year)
- Burstable instances (t4g) may throttle under sustained load
- Basic encryption (SSE-S3) — upgrade to KMS CMK when handling PII ($1-5/month)

**Evolution Path:** First paying customers → add Multi-AZ DB (+$60) → 10K users → add ElastiCache (+$35) → SLA commitments → Multi-AZ compute + monitoring (+$200)

---

## Scenario 2: Enterprise Production

**Context:** Production (established) | 20+ people | $10K-50K/month | 99.99% SLA | PII + financial | GDPR/SOC 2
**Priority:** Reliability > Security > Performance > Cost

| Layer | Choice | Cost/Month | Rationale |
|-------|--------|-----------|-----------|
| Compute | m6g.large Multi-AZ, ASG (4-20) across 3 AZs, RIs | $248 | HA + 35% RI savings |
| Database | Aurora PostgreSQL r6g.xlarge Multi-AZ + 2 read replicas | $2,190 | 99.99% SLA, <30s failover |
| Cache | ElastiCache Redis m6g.large Multi-AZ cluster | $292 | 80-90% DB load reduction |
| Storage | S3 Intelligent-Tiering, KMS CMK, cross-region replication | $50-200 | Compliance audit trail |
| Security | WAF + GuardDuty + Security Hub + KMS | $200-500 | Defense-in-depth, compliance |
| Monitoring | CloudWatch + X-Ray + third-party APM | $800-2,500 | Comprehensive observability |
| DR | Warm standby in secondary region | $2K-5K | Meet 99.99% SLA |
| **Total** | | **$15K-30K** | |

**Key Trade-Offs:**
- 3-4x cost vs single-region for 99.99% availability
- 1-hour outage could cost $100K-1M — infrastructure cost is justified
- Premium APM ($1K-3K/month) prevents outages costing 100x more
- GDPR fines up to €20M — security investment is non-negotiable

---

## Scenario 3: Prototype/POC

**Context:** Dev/Demo | 1-3 people | $50-300/month | No SLA | Test data only
**Priority:** Cost > Speed > Everything else

| Layer | Choice | Cost/Month |
|-------|--------|-----------|
| **Option A: EC2** | t4g.micro + RDS t3.micro + S3 | $20-50 |
| **Option B: Serverless** | API Gateway + Lambda + DynamoDB + S3 | $0-10 |

**Key Trade-Offs:**
- No reliability, no monitoring, no security beyond basics
- Single point of failure everywhere — acceptable for POC
- **If POC succeeds: rebuild from scratch with proper architecture**

**Cost Tips:** Use Free Tier, stop instances nights/weekends (save 70%), set billing alarms, delete everything after POC.

---

## Scenario 4: Cost-Sensitive Production

**Context:** Production | 6-15 people | $2K-5K/month | 99.5% SLA | No PII
**Priority:** Cost > Reliability > Performance

| Layer | Choice | Cost/Month | Rationale |
|-------|--------|-----------|-----------|
| Compute | 3x t4g.medium Multi-AZ, ASG (2-8), 1yr RI | $47 | 35% RI savings |
| Database | RDS PostgreSQL t3.large Multi-AZ | $240 | Reliability for real users |
| Cache | ElastiCache Redis t4g.small, single node | $23 | Reduce DB load, accept SPOF |
| Storage | S3 with lifecycle to Glacier | $20-50 | 70-90% storage savings |
| Monitoring | CloudWatch basic + critical alarms | $30-80 | Essential only |
| **Total** | | **$2,500-4,000** | |

**Key Trade-Offs:**
- Single-node cache is SPOF — failure degrades performance but doesn't cause outage
- Burstable instances with RIs: variable performance but 35% savings
- Basic monitoring: slower troubleshooting but saves $500-2K/month vs premium APM
- S3 lifecycle: 70-90% storage savings but 3-5 hour retrieval for archived data

**Cost Strategies:** RIs (35% off), Auto Scaling schedule (30-40% off nights/weekends), Spot for batch jobs (70-90% off), right-sizing via Compute Optimizer.

---

## Scenario 5: Performance-Critical Production

**Context:** Production | 10-30 people | $5K-20K/month | 99.9% SLA, <100ms p95 | Real-time apps
**Priority:** Performance > Reliability > Cost

| Layer | Choice | Cost/Month | Rationale |
|-------|--------|-----------|-----------|
| Compute | c6g.xlarge compute-optimized, cluster placement | $472 | CPU-optimized, low latency |
| Database | Aurora r6g.2xlarge + 3 read replicas | $5,840 | Max performance, read scaling |
| Cache | ElastiCache Redis r6g.xlarge Multi-AZ cluster | $584 | Sub-millisecond latency |
| CDN | CloudFront global | $100-500 | 80-95% latency reduction |
| Monitoring | CloudWatch detailed + X-Ray + APM with RUM | $1,300-3,600 | Deep performance insights |
| **Total** | | **$8K-18K** | |

**Key Trade-Offs:**
- 3-5x cost for 5-10x performance improvement
- Multi-layer caching: 95% of requests served in <50ms
- Premium APM ($1K-3K/month) identifies bottlenecks 10x faster
- 100ms latency improvement ≈ 1% conversion increase

**Performance Strategy:** CloudFront (95% hit, 10-50ms) → ElastiCache (90% hit, 1-5ms) → Aurora replicas (10-20ms) → Aurora primary (writes only, 20-50ms)

---

## Scenario 6: Regulated Industry (Healthcare/Finance)

**Context:** Production | 15-50 people | $8K-30K/month | 99.95% SLA | PHI/financial data | HIPAA/PCI-DSS
**Priority:** Compliance > Security > Reliability > Cost

| Layer | Choice | Cost/Month | Rationale |
|-------|--------|-----------|-----------|
| Compute | m6g.large Multi-AZ, CIS hardened, immutable | $248 | Documented security controls |
| Database | Aurora r6g.xlarge Multi-AZ, KMS CMK, 90-day backups | $730 | Encryption + audit trail |
| Storage | S3 KMS CMK, versioning, MFA delete, access logging | $50-200 | Comprehensive audit trail |
| Security | KMS + WAF + GuardDuty + Security Hub + Macie | $280-830 | Defense-in-depth, compliance |
| Audit | CloudTrail all regions, 365-day retention, immutable | $200-500 | Regulatory requirement |
| **Total** | | **$8K-25K** | |

**Key Trade-Offs:**
- Compliance adds 30-50% to infrastructure cost — but breach penalties are millions
- Extensive audit logging adds storage costs — required by regulation
- Customer-managed KMS keys add complexity — required for compliance audit trail
- Regular compliance audits require documented controls — invest in automation

**Non-Negotiable:** Encryption everywhere (at rest + in transit), audit trails for all data access, access logging, key rotation, incident response procedures.

---

## Quick Comparison

| Scenario | Monthly Cost | SLA | Team | Key Priority |
|----------|-------------|-----|------|-------------|
| Prototype/POC | $0-50 | None | 1-3 | Cost |
| Startup MVP | $110-150 | None | 2-5 | Speed |
| Cost-Sensitive Prod | $2.5K-4K | 99.5% | 6-15 | Cost |
| Performance-Critical | $8K-18K | 99.9% | 10-30 | Performance |
| Regulated Industry | $8K-25K | 99.95% | 15-50 | Compliance |
| Enterprise | $15K-30K | 99.99% | 20+ | Reliability |
