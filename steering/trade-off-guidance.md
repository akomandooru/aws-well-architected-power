# Trade-Off Guidance for Well-Architected Reviews

## Purpose

This file guides Kiro on providing context-aware trade-off guidance for AWS Well-Architected recommendations. Architecture is about making informed trade-offs, not following prescriptive rules. This guidance helps users understand the implications of their decisions and choose the right architecture for their specific situation.

## Core Principles

### 1. Context is King

**Never provide prescriptive recommendations without understanding context.**

❌ Bad: "You should use Multi-AZ deployment."
✅ Good: "For production with 99.9% SLA, Multi-AZ is required. For development, single-AZ is acceptable to save 50% cost."

### 2. Explain Trade-Offs

**Always explain what you gain and what you give up.**

Format: "[Recommendation] improves [Pillar] but [trade-off] [Other Pillar]"

Examples:
- "Multi-AZ improves Reliability but doubles Cost (2x infrastructure expense)"
- "Larger instances improve Performance but increase Cost (3x expense for 2x performance)"
- "Comprehensive monitoring improves Operational Excellence but adds Cost ($50-200/month) and Complexity"

### 3. Distinguish Must-Have vs. Context-Dependent

**Security and compliance requirements are must-have. Most other recommendations are context-dependent.**

**Must-Have (Non-Negotiable)**:
- Encryption for PII, financial data, health data
- Compliance requirements (GDPR, HIPAA, PCI-DSS, etc.)
- Security fundamentals (no hardcoded secrets, least-privilege IAM)
- Data protection and privacy

**Context-Dependent (Situational)**:
- Multi-AZ (depends on SLA and environment)
- Instance sizing (depends on performance requirements and budget)
- Backup retention (depends on RPO and compliance)
- Monitoring depth (depends on operational maturity and criticality)

### 4. Provide Decision Frameworks

**Help users make informed decisions with structured comparisons.**

Use decision matrices showing:
- Options available
- Pros and cons of each
- Cost impact
- Complexity impact
- When to choose each option

### 5. Environment-Specific Guidance

**Different environments have different standards.**

| Aspect | Development | Staging | Production |
|--------|-------------|---------|------------|
| Multi-AZ | Optional (cost savings) | Recommended (testing) | Required (SLA) |
| Encryption | Basic (SSE-S3) | Production-like (KMS) | Required (KMS + CMK) |
| Backups | Minimal (daily) | Production-like | Comprehensive (hourly + cross-region) |
| Monitoring | Basic | Comprehensive | Comprehensive + alerting |
| Cost Priority | High (minimize) | Medium | Low (reliability first) |

## Trade-Off Templates

### Template 1: Reliability vs. Cost

**Scenario**: Multi-AZ deployment recommendation

**Context Questions**:
- What environment is this? (dev/staging/prod)
- What's your SLA requirement?
- What's your budget constraint?

**Conditional Guidance**:

```
IF environment == "development":
  "For development, single-AZ is ACCEPTABLE to reduce costs by 50%.
   Multi-AZ is not required for dev environments.
   
   Trade-off: Save ~$500/month but accept potential downtime during AZ failures.
   Recovery: Manual restart in another AZ (15-30 minutes)"

IF environment == "production" AND sla >= 99.9:
  "For production with 99.9% SLA, Multi-AZ is REQUIRED.
   Single-AZ cannot meet your availability target.
   
   Trade-off: Multi-AZ doubles infrastructure cost (~$1000/month additional)
   but ensures automatic failover (60-120 seconds) and meets SLA commitment.
   
   Cost breakdown:
   - Single-AZ: $1000/month, 99% uptime (3.65 days downtime/year)
   - Multi-AZ: $2000/month, 99.95% uptime (4.38 hours downtime/year)"

IF environment == "production" AND budget == "tight":
  "For production with tight budget, you have options:
   
   Option 1: Multi-AZ (RECOMMENDED)
   - Cost: $2000/month (2x single-AZ)
   - Availability: 99.95% (automatic failover in 60-120 seconds)
   - Best for: Customer-facing apps, SLA commitments
   
   Option 2: Single-AZ + Automated Backups
   - Cost: $1100/month (single-AZ + backup storage)
   - Availability: 99% (manual recovery in 1-2 hours)
   - Best for: Internal tools, acceptable downtime
   
   Trade-off: Save $900/month but accept longer recovery time and lower availability.
   
   Recommendation: If you have ANY SLA commitment, choose Multi-AZ. 
   The cost of downtime usually exceeds the infrastructure savings."
```

### Template 2: Security vs. Cost

**Scenario**: Encryption recommendation

**Context Questions**:
- What type of data? (public/internal/confidential/restricted)
- Does it contain PII, financial data, or health data?
- What regulatory requirements apply?

**Conditional Guidance**:

```
IF data_level == "public":
  "For public data, encryption at rest is OPTIONAL.
   
   Recommendation: Consider encryption for defense-in-depth, but it's not required.
   
   Trade-off: Encryption adds minimal cost ($1/month for KMS key) and 
   negligible performance overhead (<5%) for additional security layer."

IF contains_pii OR contains_financial_data OR contains_health_data:
  "For [PII/financial/health] data, encryption at rest is REQUIRED.
   
   This is a MUST-HAVE, not a trade-off decision.
   
   Options:
   
   Option 1: AWS KMS with Customer-Managed Keys (RECOMMENDED)
   - Cost: $1/month per key + $0.03 per 10,000 requests
   - Control: Full key rotation, access control, audit trail
   - Compliance: Meets most regulatory requirements
   - Best for: Production, regulated data
   
   Option 2: AWS KMS with AWS-Managed Keys
   - Cost: Free
   - Control: AWS manages keys, automatic rotation
   - Compliance: Meets basic requirements
   - Best for: Development, non-regulated data
   
   Option 3: SSE-S3 (S3 only)
   - Cost: Free
   - Control: AWS-managed, no audit trail
   - Compliance: Basic encryption only
   - Best for: Non-sensitive data, cost-sensitive projects
   
   Recommendation for your [PII/financial/health] data: Use Option 1 (KMS with CMK).
   The $1/month cost is negligible compared to breach risk and compliance penalties."

IF regulatory_requirements INCLUDES "GDPR" OR "HIPAA" OR "PCI-DSS":
  "For [GDPR/HIPAA/PCI-DSS] compliance, encryption is REQUIRED with specific controls:
   
   REQUIRED:
   - Encryption at rest (KMS with customer-managed keys)
   - Encryption in transit (TLS 1.2+)
   - Key rotation (automatic or manual)
   - Access logging and audit trail
   - Documented key management procedures
   
   This is NON-NEGOTIABLE for compliance.
   
   Cost: ~$1-5/month per key + audit logging costs
   Complexity: Medium (key management, rotation, access control)
   
   Non-compliance cost: Fines up to €20M (GDPR) or $1.5M/year (HIPAA)"
```

### Template 3: Performance vs. Cost

**Scenario**: Instance sizing recommendation

**Context Questions**:
- What's your latency target?
- What's your throughput requirement?
- What's your budget constraint?

**Conditional Guidance**:

```
IF latency_target > 1000ms AND budget == "tight":
  "For latency target >1s with tight budget, start with smaller instances:
   
   Option 1: t3.medium (RECOMMENDED for starting)
   - Cost: $30/month
   - Performance: Good for <100 req/sec, <1s latency
   - Burstable: Handles occasional spikes
   - Best for: Starting point, cost-sensitive projects
   
   Option 2: t3.large
   - Cost: $60/month (2x cost)
   - Performance: Good for <500 req/sec, <500ms latency
   - Best for: Growing applications
   
   Trade-off: Start small and scale up based on actual usage.
   Over-provisioning wastes money; under-provisioning affects user experience.
   
   Recommendation: Start with t3.medium, monitor performance, scale up if needed.
   Use CloudWatch alarms to alert when CPU >70% for 5 minutes."

IF latency_target < 100ms AND performance_priority == "high":
  "For latency target <100ms with high performance priority:
   
   Option 1: c6i.2xlarge (Compute-Optimized)
   - Cost: $245/month
   - Performance: Excellent for <5000 req/sec, <50ms latency
   - Best for: CPU-intensive workloads
   
   Option 2: r6i.2xlarge (Memory-Optimized)
   - Cost: $302/month
   - Performance: Excellent for memory-intensive workloads
   - Best for: In-memory caching, large datasets
   
   Option 3: Add ElastiCache (Recommended)
   - Cost: $50/month (cache.t3.medium)
   - Performance: Reduces latency by 80-95%
   - Best for: Read-heavy workloads
   
   Trade-off Analysis:
   - Larger instance: 3x cost for 2x performance
   - Caching: 1.5x cost for 10x performance improvement
   
   Recommendation: Add caching first (better ROI), then scale instances if needed.
   Caching provides 10x performance improvement for 1.5x cost."

IF latency_target < 10ms:
  "For latency target <10ms (real-time requirements):
   
   This requires specialized architecture:
   
   REQUIRED:
   - In-memory caching (ElastiCache Redis)
   - Compute-optimized instances (c6i family)
   - Low-latency networking (placement groups)
   - Edge locations (CloudFront)
   
   Cost: $500-2000/month (depending on scale)
   Complexity: High (distributed caching, cache invalidation)
   
   Trade-off: 5-10x cost increase for <10ms latency.
   
   Question: Is <10ms latency a business requirement or a nice-to-have?
   - Business requirement (gaming, trading): Invest in specialized architecture
   - Nice-to-have: Consider if <100ms is acceptable (10x cost savings)"
```

### Template 4: Operational Excellence vs. Complexity

**Scenario**: Monitoring and observability recommendation

**Context Questions**:
- What's your team size?
- What's your operational maturity?
- How critical is this system?

**Conditional Guidance**:

```
IF team_size == "small" AND operational_maturity == "startup":
  "For small teams (1-5 people) with startup maturity:
   
   Option 1: Managed Services (RECOMMENDED)
   - Use AWS-managed services (RDS, ElastiCache, ECS Fargate)
   - Basic CloudWatch monitoring (free tier)
   - CloudWatch Alarms for critical metrics
   - Cost: $0-50/month
   - Complexity: Low
   - Best for: Focus on product, not operations
   
   Option 2: Comprehensive Observability
   - CloudWatch + X-Ray + CloudWatch Insights
   - Custom dashboards and detailed metrics
   - Cost: $200-500/month
   - Complexity: High (setup, maintenance, analysis)
   - Best for: Mature ops teams
   
   Trade-off: Comprehensive monitoring adds $200-500/month cost and 
   requires 10-20 hours/month maintenance for a small team.
   
   Recommendation: Start with Option 1 (managed services + basic monitoring).
   Add comprehensive observability when you have dedicated ops resources."

IF criticality == "high" OR criticality == "critical":
  "For high/critical systems, comprehensive monitoring is REQUIRED:
   
   REQUIRED:
   - CloudWatch metrics and alarms
   - CloudWatch Logs with retention
   - AWS X-Ray for distributed tracing
   - CloudWatch Insights for log analysis
   - SNS/PagerDuty for alerting
   
   Cost: $200-500/month
   Complexity: Medium-High
   
   This is NON-NEGOTIABLE for critical systems.
   
   Trade-off: Monitoring cost is 5-10% of infrastructure cost but prevents
   outages that could cost 100x more in revenue loss and reputation damage.
   
   Example: 1-hour outage of critical system:
   - Revenue loss: $10,000-100,000
   - Monitoring cost: $500/month
   - ROI: Monitoring pays for itself if it prevents 1 outage per year"

IF team_size == "large" AND operational_maturity == "enterprise":
  "For large teams (20+ people) with enterprise maturity:
   
   Consider advanced observability:
   
   Option 1: AWS Native (CloudWatch + X-Ray)
   - Cost: $500-2000/month
   - Integration: Native AWS integration
   - Best for: AWS-only infrastructure
   
   Option 2: Third-Party (Datadog, New Relic)
   - Cost: $1000-5000/month
   - Features: Advanced analytics, APM, multi-cloud
   - Best for: Complex environments, multiple clouds
   
   Option 3: Open Source (Prometheus + Grafana)
   - Cost: $200-1000/month (infrastructure only)
   - Flexibility: Full control, customization
   - Complexity: High (self-managed)
   - Best for: Large ops teams, specific requirements
   
   Trade-off: Third-party tools cost 2-5x more but provide better analytics
   and multi-cloud support. Open source is cheapest but requires most effort.
   
   Recommendation: For enterprise teams, invest in comprehensive observability.
   The productivity gains and faster incident resolution justify the cost."
```

### Template 5: Sustainability vs. Performance/Cost

**Scenario**: Instance type and region selection

**Context Questions**:
- How important is sustainability to your organization?
- What's your performance requirement?
- What's your budget constraint?

**Conditional Guidance**:

```
IF sustainability_priority == "high":
  "For organizations prioritizing sustainability:
   
   Option 1: AWS Graviton Instances (RECOMMENDED)
   - Cost: 20% cheaper than x86 instances
   - Performance: Comparable to x86 for most workloads
   - Sustainability: 60% less energy consumption
   - Trade-off: May require code changes (ARM architecture)
   - Best for: New applications, containerized workloads
   
   Option 2: Renewable Energy Regions
   - Use regions with high renewable energy percentage
   - Examples: US West (Oregon) 95%, EU (Frankfurt) 80%
   - Cost: Same as other regions
   - Performance: May add latency if far from users
   - Trade-off: Potential latency increase for sustainability
   
   Option 3: Right-Sizing + Auto-Scaling
   - Eliminate over-provisioned resources
   - Scale down during off-peak hours
   - Cost: 30-50% savings
   - Sustainability: 30-50% less energy consumption
   - Complexity: Medium (auto-scaling configuration)
   
   Recommendation: Combine all three for maximum impact:
   - Graviton instances: 60% less energy, 20% cost savings
   - Renewable regions: Minimize carbon footprint
   - Right-sizing: 30-50% resource reduction
   
   Total impact: 70-80% reduction in carbon footprint, 40-60% cost savings"

IF sustainability_priority == "low" AND performance_priority == "high":
  "For performance-focused applications:
   
   Sustainability considerations:
   - Right-sizing still saves cost AND energy (win-win)
   - Graviton instances provide good performance at lower cost/energy
   - Consider sustainability as a secondary benefit, not primary driver
   
   Recommendation: Right-size for cost savings (sustainability is a bonus).
   Consider Graviton if it meets performance requirements (20% cost savings)."
```

## Decision Framework Structure

When presenting multiple options, use this structure:

```
Context: [Environment, SLA, Budget, Data Classification]

Options:

Option 1: [Name] (RECOMMENDED/REQUIRED)
- Cost: [Monthly cost or cost range]
- [Pillar 1]: [Impact - Positive/Negative/Neutral]
- [Pillar 2]: [Impact - Positive/Negative/Neutral]
- Complexity: [Low/Medium/High]
- Best for: [Use cases]
- Avoid when: [Scenarios where not appropriate]

Option 2: [Name]
- Cost: [Monthly cost or cost range]
- [Pillar 1]: [Impact]
- [Pillar 2]: [Impact]
- Complexity: [Low/Medium/High]
- Best for: [Use cases]
- Avoid when: [Scenarios]

Trade-off Analysis:
- [Comparison of key trade-offs]
- [Quantitative impact when possible]

Recommendation: [Specific recommendation based on context]
Rationale: [Why this recommendation for this context]
```

## Common Trade-Off Scenarios

### Scenario 1: Startup MVP

**Context**:
- Environment: Production (but early stage)
- Budget: Tight ($500-2000/month)
- SLA: No formal commitment
- Data: Internal/Confidential (no PII)
- Team: Small (2-5 people)

**Recommendations**:
- Single-AZ: ACCEPTABLE (save 50% cost, accept downtime risk)
- Smaller instances: START SMALL (t3.small/medium, scale up based on usage)
- Basic monitoring: SUFFICIENT (CloudWatch free tier + critical alarms)
- Managed services: REQUIRED (RDS, ElastiCache - minimize ops burden)
- Encryption: BASIC (SSE-S3 or AWS-managed KMS)
- Backups: DAILY (7-day retention)

**Rationale**: Optimize for speed and cost. Acceptable to have some downtime while validating product-market fit. Scale up reliability as business grows.

### Scenario 2: Enterprise Production

**Context**:
- Environment: Production
- Budget: Flexible ($10,000-50,000/month)
- SLA: 99.99% (52 minutes downtime/year)
- Data: Restricted (PII + financial data)
- Compliance: GDPR, SOC 2
- Team: Large (20+ people)

**Recommendations**:
- Multi-AZ: REQUIRED (meet SLA)
- Multi-Region: RECOMMENDED (disaster recovery)
- Appropriately-sized instances: REQUIRED (meet performance SLA)
- Comprehensive monitoring: REQUIRED (CloudWatch + X-Ray + third-party APM)
- Encryption: REQUIRED (KMS with customer-managed keys)
- Backups: COMPREHENSIVE (hourly + cross-region replication)

**Rationale**: Reliability and compliance are non-negotiable. Cost is secondary to meeting SLA and regulatory requirements.

### Scenario 3: Cost-Sensitive Production

**Context**:
- Environment: Production
- Budget: Tight ($2000-5000/month)
- SLA: 99.5% (moderate availability)
- Data: Internal (no PII)
- Team: Medium (6-15 people)

**Recommendations**:
- Multi-AZ: RECOMMENDED (but can consider single-AZ + backups)
- Right-sized instances: CRITICAL (avoid over-provisioning)
- Auto-scaling: REQUIRED (scale down during off-peak)
- Spot instances: CONSIDER (for non-critical workloads)
- Basic monitoring: SUFFICIENT (CloudWatch + critical alarms)
- Encryption: BASIC (AWS-managed KMS)
- Backups: DAILY (14-day retention)

**Rationale**: Balance cost and reliability. Invest in cost optimization (right-sizing, auto-scaling, spot instances) while maintaining acceptable availability.

### Scenario 4: Performance-Critical Production

**Context**:
- Environment: Production
- Budget: Flexible ($15,000-30,000/month)
- SLA: 99.9% + <100ms latency
- Data: Confidential
- Performance: Critical business differentiator

**Recommendations**:
- Multi-AZ: REQUIRED (meet SLA)
- Compute-optimized instances: REQUIRED (meet latency target)
- ElastiCache: REQUIRED (reduce latency by 80-95%)
- CloudFront: RECOMMENDED (edge caching, global performance)
- Comprehensive monitoring: REQUIRED (performance metrics, X-Ray tracing)
- Encryption: REQUIRED (KMS)
- Backups: COMPREHENSIVE

**Rationale**: Performance is a business differentiator. Invest in caching, compute-optimized instances, and CDN. Monitor performance metrics closely.

### Scenario 5: Regulated Industry (Healthcare/Finance)

**Context**:
- Environment: Production
- Budget: Moderate-Flexible
- SLA: 99.95%
- Data: Restricted (PHI or financial data)
- Compliance: HIPAA or PCI-DSS
- Audit requirements: Comprehensive

**Recommendations**:
- Multi-AZ: REQUIRED (compliance + SLA)
- Encryption: REQUIRED (KMS with CMK, documented key management)
- Access controls: REQUIRED (least-privilege IAM, MFA)
- Audit logging: REQUIRED (CloudTrail, CloudWatch Logs, long retention)
- Network isolation: REQUIRED (VPC, private subnets, security groups)
- Backups: REQUIRED (encrypted, cross-region, documented procedures)
- Monitoring: COMPREHENSIVE (security monitoring, compliance dashboards)

**Rationale**: Compliance is non-negotiable. All security and audit requirements are must-have. Cost is secondary to regulatory compliance.

## Documenting Trade-Off Decisions

When a user makes a trade-off decision, document it:

```markdown
## Architecture Decision: [Decision Name]

**Date**: [Date]
**Context**: [Environment, constraints, requirements]
**Decision**: [What was decided]

**Options Considered**:
1. [Option 1]: [Pros/Cons]
2. [Option 2]: [Pros/Cons]
3. [Option 3]: [Pros/Cons]

**Trade-Offs**:
- [Pillar 1] vs [Pillar 2]: [Explanation]
- Cost: [Impact]
- Complexity: [Impact]

**Rationale**: [Why this decision was made]
**Consequences**: [What this means going forward]
**Review Date**: [When to revisit this decision]
```

## Key Takeaways

1. **Context First**: Always gather context before making recommendations
2. **Explain Trade-Offs**: Help users understand what they gain and give up
3. **Distinguish Must-Have vs. Optional**: Security/compliance are non-negotiable
4. **Provide Options**: Present multiple valid solutions with trade-offs
5. **Environment-Specific**: Different standards for dev/staging/prod
6. **Quantify Impact**: Use numbers (cost, latency, availability) when possible
7. **Document Decisions**: Record trade-off decisions for future reference
8. **Revisit Regularly**: Context changes, recommendations should too

## Anti-Patterns to Avoid

❌ **Prescriptive without context**: "You should use Multi-AZ"
❌ **Ignoring budget constraints**: Recommending expensive solutions for tight budgets
❌ **One-size-fits-all**: Same recommendations for dev and prod
❌ **Missing trade-off explanation**: Not explaining what you give up
❌ **Ignoring team capabilities**: Recommending complex solutions for small teams
❌ **Treating everything as must-have**: Not distinguishing required vs. optional
❌ **Forgetting to quantify**: Vague statements instead of specific numbers

✅ **Context-aware**: "For production with 99.9% SLA, Multi-AZ is required"
✅ **Budget-conscious**: Providing cost-effective options for tight budgets
✅ **Environment-specific**: Different recommendations for dev vs. prod
✅ **Trade-off explanation**: "Multi-AZ improves reliability but doubles cost"
✅ **Team-appropriate**: Managed services for small teams
✅ **Clear requirements**: "Encryption is REQUIRED for PII data"
✅ **Quantified impact**: "Multi-AZ costs $1000/month additional"
