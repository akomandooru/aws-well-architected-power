---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/cdk.json"
---

# Trade-Off Guidance for Well-Architected Reviews

## Core Principles

### 1. Context is King
Never provide prescriptive recommendations without understanding context.
- ❌ "You should use Multi-AZ deployment."
- ✅ "For production with 99.9% SLA, Multi-AZ is required. For dev, single-AZ saves 50%."

### 2. Always Explain Trade-Offs
Format: "[Recommendation] improves [Pillar] but [trade-off] [Other Pillar]"
- "Multi-AZ improves Reliability but doubles Cost"
- "Larger instances improve Performance but increase Cost (3x expense for 2x performance)"

### 3. Must-Have vs. Context-Dependent

**Must-Have (Non-Negotiable):**
- Encryption for PII, financial, health data
- Compliance requirements (GDPR, HIPAA, PCI-DSS)
- No hardcoded secrets, least-privilege IAM

**Context-Dependent:**
- Multi-AZ (depends on SLA and environment)
- Instance sizing (depends on performance needs and budget)
- Backup retention (depends on RPO and compliance)
- Monitoring depth (depends on criticality)

### 4. Environment-Specific Standards

| Aspect | Development | Staging | Production |
|---|---|---|---|
| Multi-AZ | Optional | Recommended | Required |
| Encryption | Basic (SSE-S3) | Production-like (KMS) | Required (KMS + CMK) |
| Backups | Minimal (7 days) | Production-like | Comprehensive (30+ days) |
| Monitoring | Basic | Comprehensive | Comprehensive + alerting |
| Cost Priority | High (minimize) | Medium | Low (reliability first) |

## Common Trade-Off Scenarios

### Reliability vs. Cost: Multi-AZ
```
FOR development:
  Single-AZ is ACCEPTABLE. Save ~$60-500/month.
  Trade-off: Manual recovery (15-30 min) if AZ fails.

FOR production with 99.9% SLA:
  Multi-AZ is REQUIRED.
  Cost: +$60-500/month. Benefit: Automatic failover (60-120s).
  99% → 99.95% uptime (3.65 days → 4.38 hours downtime/year).
```

### Security vs. Cost: Encryption
```
FOR public data:
  SSE-S3 (free) is ACCEPTABLE.

FOR confidential/regulated data:
  KMS with CMK is REQUIRED.
  Cost: ~$1/key/month + $0.03/10K requests.
  Benefit: Key rotation, audit trail, compliance alignment.
```

### Performance vs. Cost: Caching
```
FOR low-traffic applications:
  No caching needed. Direct DB queries acceptable.

FOR high-traffic with repeated reads:
  ElastiCache recommended.
  Cost: $15-180/month. Benefit: <1ms reads vs 5-50ms DB queries.
  ROI: Reduces DB load by 80-95%.
```

### Performance vs. Reliability: Instance Sizing
```
FOR cost-sensitive workloads:
  Smaller instance + Auto Scaling.
  Trade-off: Brief scaling lag during spikes.

FOR latency-sensitive workloads:
  Larger instance with headroom.
  Trade-off: Higher baseline cost for consistent performance.
```

## Decision Matrix Format

When comparing options, use this structure:

| Option | Reliability | Performance | Cost/Month | Best For |
|---|---|---|---|---|
| Option A | ⭐⭐ | ⭐⭐⭐ | $X | [scenario] |
| Option B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $Y | [scenario] |
| Option C | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $Z | [scenario] |

See `examples/decision-matrices.md` and `examples/trade-off-scenarios.md` for comprehensive examples.
