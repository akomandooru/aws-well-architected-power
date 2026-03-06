# Trade-Off Decision Matrix Examples

## Overview

Decision matrices for common AWS architecture decisions. Each matrix shows options, trade-offs, costs, and when to use each option. Use these as templates when the power runs Full Analysis Mode.

---

## Matrix 1: Multi-AZ vs. Single-AZ Deployment

| Option | Cost Impact | Availability | Recovery Time | Best For |
|--------|-------------|--------------|---------------|----------|
| Single-AZ | Baseline | 99% (3.65 days/yr) | 1-2 hours (manual) | Dev/test, internal tools |
| Multi-AZ | 2x cost | 99.95% (4.38 hrs/yr) | 60-120 seconds (auto) | Production with SLA |
| Multi-Region | 3-4x cost | 99.99% (52 min/yr) | 5-15 minutes (auto) | Global apps, DR requirements |

**Decision Rule:**
- Production + SLA ≥ 99.9% → Multi-AZ required
- Production + tight budget → Single-AZ + automated backups + documented recovery
- Dev/staging → Single-AZ acceptable
- Global users or SLA ≥ 99.99% → Multi-Region

**Cost Example (RDS db.r6g.large):**
| Config | Monthly | Annual | Downtime Cost Risk |
|--------|---------|--------|-------------------|
| Single-AZ | $365 | $4,380 | $7K-70K/year |
| Multi-AZ | $730 | $8,760 | $350-3,500/year |
| Multi-Region | $1,460 | $17,520 | $50-500/year |

---

## Matrix 2: Encryption Approach

| Option | Cost | Security | Key Control | Compliance | Best For |
|--------|------|----------|-------------|------------|----------|
| SSE-S3 | Free | Basic | AWS-managed, no audit | Basic only | Public data, non-sensitive |
| SSE-KMS (AWS key) | Free | Good | AWS-managed, auto rotation | Basic requirements | Dev, non-regulated |
| SSE-KMS (CMK) | $1/key/mo + $0.03/10K req | Excellent | Full control, audit trail | Most regulations | Production, PII, regulated |
| Client-Side | App overhead | Maximum | Complete client control | Strictest requirements | Zero-trust, specific compliance |

**Decision Rule:**
- Contains PII/financial/health data → KMS CMK required
- GDPR/HIPAA/PCI-DSS/SOC 2 → KMS CMK required
- Production + confidential data → KMS CMK recommended
- Dev/non-sensitive → SSE-S3 or AWS-managed KMS

**Compliance Minimums:**
| Regulation | Minimum | Recommended |
|------------|---------|-------------|
| GDPR | KMS CMK | CMK + key rotation |
| HIPAA | KMS CMK | CMK + access logging |
| PCI-DSS | KMS CMK | CMK + rotation + audit |
| SOC 2 | KMS CMK | CMK + documented procedures |
| None | SSE-S3 | KMS CMK for production |

---

## Matrix 3: Instance Sizing

| Category | Instance Family | Use Case | Price/Performance |
|----------|----------------|----------|-------------------|
| Burstable | t4g (Graviton) | Variable workloads, dev/test | Best for <40% avg CPU |
| Compute-optimized | c7g (Graviton) | CPU-intensive, batch, HPC | Best CPU per dollar |
| Memory-optimized | r7g (Graviton) | In-memory DBs, caching | Best memory per dollar |
| General purpose | m7g (Graviton) | Balanced workloads | Good all-around |
| Storage-optimized | i4g | High I/O, data warehousing | Best storage throughput |

**Decision Rule:**
- Average CPU <40% → Burstable (t4g) — cheapest
- CPU-bound (>70% sustained) → Compute-optimized (c7g)
- Memory-bound (caching, analytics) → Memory-optimized (r7g)
- Balanced/unknown → General purpose (m7g)
- Always prefer Graviton (ARM) for 20-40% better price-performance

**Right-Sizing Example:**
| Current | Avg CPU | Recommendation | Monthly Savings |
|---------|---------|----------------|----------------|
| m5.xlarge | 15% | t4g.large | $95 (62% off) |
| c5.2xlarge | 35% | c7g.xlarge | $120 (45% off) |
| r5.large | 70% | r7g.large (Graviton) | $35 (20% off) |

---

## Matrix 4: Caching Strategy

| Option | Latency | Cost/Month | Complexity | Best For |
|--------|---------|-----------|------------|----------|
| No cache | 5-50ms (DB direct) | $0 | None | Low traffic, simple apps |
| Application-level (LRU) | 0.1ms (in-process) | $0 | Low | Single instance, small datasets |
| ElastiCache Redis (single) | 1-5ms | $15-50 | Low | Moderate traffic, cost-sensitive |
| ElastiCache Redis (cluster) | 1-5ms | $180-600 | Medium | Production, HA required |
| DAX | 1-5ms | $400+ | Low | DynamoDB-only workloads |
| CloudFront | 10-50ms (edge) | $50-500 | Low | Static content, global users |

**Decision Rule:**
- <100 req/sec, single service → No cache or application-level
- 100-1000 req/sec, cost-sensitive → ElastiCache single node
- Production with SLA → ElastiCache cluster (Multi-AZ)
- DynamoDB backend → DAX
- Static content or global users → CloudFront
- High traffic → Multi-layer (CloudFront + ElastiCache + DB)

**Multi-Layer Caching Flow:**
```
CloudFront (95% hit, 10-50ms) → ElastiCache (90% hit, 1-5ms) → DB replicas (10-20ms) → DB primary (writes)
Result: 95% of requests served in <50ms
```

---

## Matrix 5: Disaster Recovery Strategy

| Strategy | RTO | RPO | Cost | Complexity | Best For |
|----------|-----|-----|------|------------|----------|
| Backup & Restore | 24 hours | 24 hours | $ (storage only) | Low | Dev, non-critical |
| Pilot Light | 1-4 hours | Minutes | $$ (minimal infra) | Medium | Important but not critical |
| Warm Standby | 15-60 min | Seconds | $$$ (scaled-down infra) | Medium-High | Production with SLA |
| Active-Active | Near-zero | Near-zero | $$$$ (full duplicate) | High | Mission-critical, global |

**Decision Rule:**
- RTO > 24 hours acceptable → Backup & Restore
- RTO 1-4 hours → Pilot Light
- RTO < 1 hour → Warm Standby
- RTO near-zero → Active-Active
- Budget drives the choice when multiple strategies meet RTO/RPO

**Cost Example (for $5K/month primary infrastructure):**
| Strategy | DR Cost/Month | Total | % Increase |
|----------|--------------|-------|------------|
| Backup & Restore | $50-100 | $5,100 | 2% |
| Pilot Light | $500-1,000 | $6,000 | 20% |
| Warm Standby | $2,500-3,500 | $8,500 | 70% |
| Active-Active | $5,000+ | $10,000+ | 100% |

---

## Matrix 6: Database Choice

| Database | Type | Best For | Scaling | Cost Range |
|----------|------|----------|---------|-----------|
| RDS PostgreSQL | Relational | General purpose, complex queries | Vertical + read replicas | $60-730/mo |
| Aurora PostgreSQL | Relational | High performance, HA | Auto-scaling storage, 15 replicas | $200-2,000/mo |
| DynamoDB | Key-value/Document | High throughput, simple access | Unlimited horizontal | $0-1,000+/mo |
| ElastiCache Redis | In-memory | Caching, sessions, real-time | Cluster mode | $15-600/mo |
| Neptune | Graph | Relationships, social networks | Read replicas | $200-1,000/mo |
| Timestream | Time-series | IoT, metrics, logs | Automatic | $50-500/mo |

**Decision Rule:**
- Complex queries + joins → RDS or Aurora PostgreSQL
- Simple key-value access at scale → DynamoDB
- Need <1ms reads → ElastiCache Redis
- Relationship queries → Neptune
- Time-series data → Timestream
- Need 99.99% SLA → Aurora (built-in HA)
- Budget-sensitive → RDS (cheaper) or DynamoDB on-demand (pay per request)

---

## How to Use These Matrices

1. Identify which matrix applies to your decision
2. Find your context (environment, SLA, budget, data classification)
3. Follow the decision rule
4. Review the cost impact
5. Document your decision and rationale
