# Context Question Templates

## Purpose

This file provides templates for gathering system context before making Well-Architected recommendations. Context-aware guidance ensures recommendations are appropriate for the specific situation rather than prescriptive one-size-fits-all rules.

## When to Ask Context Questions

Ask context questions:
- At the start of a Well-Architected review session
- Before making recommendations that have significant cost or complexity implications
- When the user asks about architecture decisions with multiple valid options
- Before recommending Multi-AZ, encryption approaches, instance sizing, or disaster recovery strategies

## Context Question Flow

### 1. Environment Type (ALWAYS ASK FIRST)

**Question**: "What environment is this for?"

**Options**:
- Development
- Staging
- Production
- Demo
- Test

**Why it matters**: Different environments have different risk tolerances and cost sensitivities.

**Example prompt**:
```
Before I provide recommendations, I need to understand your context.

What environment is this infrastructure for?
- Development (cost-sensitive, acceptable downtime)
- Staging (production-like, testing environment)
- Production (customer-facing, high availability required)
- Demo (short-lived, minimal cost)
- Test (automated testing, ephemeral)
```

### 2. Availability Requirements (ASK FOR PRODUCTION/STAGING)

**Questions**:
- "What's your availability requirement (SLA)?"
- "What's your Recovery Time Objective (RTO)?"
- "What's your Recovery Point Objective (RPO)?"
- "How critical is this system?"

**Options for SLA**:
- No specific requirement
- 99% (3.65 days downtime/year)
- 99.9% (8.76 hours downtime/year)
- 99.95% (4.38 hours downtime/year)
- 99.99% (52.56 minutes downtime/year)
- 99.999% (5.26 minutes downtime/year)

**Options for Criticality**:
- Low (internal tools, non-critical)
- Medium (important but not critical)
- High (customer-facing, revenue-impacting)
- Critical (life-safety, regulatory, core business)

**Why it matters**: Determines whether Multi-AZ, multi-region, and disaster recovery are required or optional.

**Example prompt**:
```
For production environments, I need to understand your availability requirements:

1. What's your target SLA (uptime percentage)?
   - 99% (acceptable for internal tools)
   - 99.9% (standard for customer-facing apps)
   - 99.99% (high availability requirement)
   - 99.999% (mission-critical systems)

2. How critical is this system?
   - Low: Internal tools, acceptable downtime
   - Medium: Important but not critical
   - High: Customer-facing, revenue-impacting
   - Critical: Life-safety, regulatory, core business

3. What's your Recovery Time Objective (RTO)?
   - How quickly must the system recover after a failure?
   - Examples: 1 hour, 4 hours, 24 hours

4. What's your Recovery Point Objective (RPO)?
   - How much data loss is acceptable?
   - Examples: 0 (no data loss), 1 hour, 24 hours
```

### 3. Budget Constraints (ASK FOR ALL ENVIRONMENTS)

**Questions**:
- "What's your budget constraint level?"
- "What's your monthly infrastructure budget?"
- "How cost-sensitive is this project?"

**Options for Budget Level**:
- Tight (minimize costs, accept trade-offs)
- Moderate (balance cost and capabilities)
- Flexible (prioritize capabilities over cost)
- Unlimited (cost is not a primary concern)

**Options for Cost Sensitivity**:
- High (every dollar matters, startup/small business)
- Medium (cost-conscious but willing to invest)
- Low (cost is secondary to other factors)

**Why it matters**: Determines whether cost-saving measures (single-AZ, smaller instances, reduced backups) are appropriate.

**Example prompt**:
```
Understanding your budget helps me provide cost-appropriate recommendations:

1. What's your budget constraint level?
   - Tight: Minimize costs, accept some trade-offs
   - Moderate: Balance cost and capabilities
   - Flexible: Prioritize capabilities over cost
   - Unlimited: Cost is not a primary concern

2. How cost-sensitive is this project?
   - High: Every dollar matters (startup, small business)
   - Medium: Cost-conscious but willing to invest
   - Low: Cost is secondary to reliability/performance

3. What's your approximate monthly infrastructure budget?
   - This helps me suggest right-sized solutions
```

### 4. Data Classification (ASK WHEN DISCUSSING SECURITY/ENCRYPTION)

**Questions**:
- "What type of data does this system handle?"
- "Does it contain PII (Personally Identifiable Information)?"
- "Does it contain financial data?"
- "Does it contain health data?"
- "What regulatory requirements apply?"

**Options for Data Level**:
- Public (no sensitive data)
- Internal (company-internal, not public)
- Confidential (sensitive business data)
- Restricted (highly sensitive, regulated)

**Regulatory Requirements**:
- None
- GDPR (EU data protection)
- HIPAA (US healthcare)
- PCI-DSS (payment card data)
- SOC 2 (security controls)
- FedRAMP (US government)
- Other (specify)

**Why it matters**: Determines whether encryption, access controls, and audit logging are required or optional.

**Example prompt**:
```
Understanding your data classification helps me recommend appropriate security controls:

1. What type of data does this system handle?
   - Public: No sensitive data
   - Internal: Company-internal, not public
   - Confidential: Sensitive business data
   - Restricted: Highly sensitive, regulated

2. Does it contain:
   - PII (Personally Identifiable Information)? Yes/No
   - Financial data (credit cards, bank accounts)? Yes/No
   - Health data (PHI, medical records)? Yes/No

3. What regulatory requirements apply?
   - GDPR (EU data protection)
   - HIPAA (US healthcare)
   - PCI-DSS (payment card data)
   - SOC 2 (security controls)
   - FedRAMP (US government)
   - None
   - Other: [specify]
```

### 5. Performance Requirements (ASK WHEN DISCUSSING PERFORMANCE)

**Questions**:
- "What's your latency target?"
- "What's your throughput requirement?"
- "How important is performance?"

**Options for Latency Target**:
- No specific requirement
- < 1 second (acceptable for most apps)
- < 500ms (good user experience)
- < 100ms (excellent user experience)
- < 10ms (real-time, gaming, trading)

**Options for Throughput**:
- Low (< 100 requests/second)
- Medium (100-1000 requests/second)
- High (1000-10000 requests/second)
- Very High (> 10000 requests/second)

**Options for Performance Priority**:
- Low (performance is not critical)
- Medium (good performance expected)
- High (performance is a key differentiator)

**Why it matters**: Determines whether caching, CDN, larger instances, or performance optimization are required.

**Example prompt**:
```
Understanding your performance requirements helps me recommend appropriate optimizations:

1. What's your latency target (response time)?
   - No specific requirement
   - < 1 second (acceptable for most apps)
   - < 500ms (good user experience)
   - < 100ms (excellent user experience)
   - < 10ms (real-time, gaming, trading)

2. What's your expected throughput?
   - Low: < 100 requests/second
   - Medium: 100-1000 requests/second
   - High: 1000-10000 requests/second
   - Very High: > 10000 requests/second

3. How important is performance to your business?
   - Low: Performance is not critical
   - Medium: Good performance expected
   - High: Performance is a key differentiator
```

### 6. Scalability Requirements (ASK WHEN DISCUSSING SCALING)

**Questions**:
- "What's your expected growth rate?"
- "What's your peak load multiplier?"
- "Do you need global distribution?"

**Options for Expected Growth**:
- Stable (no significant growth expected)
- Moderate (steady growth, predictable)
- Rapid (fast growth, scaling challenges expected)

**Options for Peak Load**:
- 2x (double normal load)
- 5x (five times normal load)
- 10x+ (extreme spikes, viral potential)

**Options for Global Distribution**:
- Single region (all users in one geographic area)
- Multi-region (users across multiple continents)

**Why it matters**: Determines whether auto-scaling, global infrastructure, and elastic architectures are required.

**Example prompt**:
```
Understanding your scalability needs helps me recommend appropriate scaling strategies:

1. What's your expected growth rate?
   - Stable: No significant growth expected
   - Moderate: Steady growth, predictable
   - Rapid: Fast growth, scaling challenges expected

2. What's your peak load compared to normal?
   - 2x: Double normal load
   - 5x: Five times normal load
   - 10x+: Extreme spikes, viral potential

3. Do you need global distribution?
   - Single region: All users in one geographic area
   - Multi-region: Users across multiple continents
```

### 7. Team and Operational Maturity (ASK WHEN DISCUSSING OPERATIONAL EXCELLENCE)

**Questions**:
- "What's your team size?"
- "What's your operational maturity level?"

**Options for Team Size**:
- Small (1-5 people)
- Medium (6-20 people)
- Large (21-50 people)
- Enterprise (50+ people)

**Options for Operational Maturity**:
- Startup (minimal ops, focus on speed)
- Growth (building ops capabilities)
- Enterprise (mature ops, established processes)

**Why it matters**: Determines whether managed services, automation, and complex operational procedures are appropriate.

**Example prompt**:
```
Understanding your team helps me recommend appropriate operational approaches:

1. What's your team size?
   - Small: 1-5 people
   - Medium: 6-20 people
   - Large: 21-50 people
   - Enterprise: 50+ people

2. What's your operational maturity?
   - Startup: Minimal ops, focus on speed
   - Growth: Building ops capabilities
   - Enterprise: Mature ops, established processes
```

## Context Inference from Files

When possible, infer context from file paths and names:

### Environment Inference

**File path patterns**:
- `/dev/`, `/development/`, `-dev.`, `dev-` → Development
- `/staging/`, `/stage/`, `-staging.`, `stage-` → Staging
- `/prod/`, `/production/`, `-prod.`, `prod-` → Production
- `/test/`, `/testing/`, `-test.` → Test
- `/demo/` → Demo

**Example**:
```
File: infrastructure/prod/main.tf
Inferred: Production environment
Action: Ask for availability requirements and data classification
```

### Data Classification Inference

**File name patterns**:
- `pii`, `personal`, `customer-data` → Contains PII
- `payment`, `billing`, `financial` → Contains financial data
- `health`, `medical`, `phi` → Contains health data
- `public`, `static`, `assets` → Public data

**Example**:
```
File: services/customer-pii-service/
Inferred: Contains PII
Action: Require encryption, access controls, audit logging
```

## Storing Context

Store gathered context with the review session:

```json
{
  "context": {
    "environment": "production",
    "availabilityRequirement": {
      "sla": 99.9,
      "rto": 60,
      "rpo": 15,
      "criticalityLevel": "high"
    },
    "budgetConstraint": {
      "level": "moderate",
      "monthlyBudget": 5000,
      "costSensitivity": "medium"
    },
    "dataClassification": {
      "level": "confidential",
      "containsPII": true,
      "containsFinancialData": false,
      "containsHealthData": false,
      "regulatoryRequirements": ["GDPR", "SOC2"]
    },
    "performanceRequirement": {
      "latencyTarget": 500,
      "throughputTarget": 1000,
      "priority": "medium"
    },
    "scalabilityRequirement": {
      "expectedGrowth": "moderate",
      "peakLoadMultiplier": 3,
      "globalDistribution": false
    },
    "teamSize": 15,
    "operationalMaturity": "growth"
  }
}
```

## Using Context in Recommendations

### Example: Multi-AZ Recommendation

**Without context** (prescriptive):
```
❌ "You should use Multi-AZ deployment for high availability."
```

**With context** (conditional):
```
✅ Development environment:
"For development, single-AZ is acceptable to reduce costs by 50%. 
Multi-AZ is not required for dev environments."

✅ Production with 99.9% SLA:
"For production with 99.9% SLA, Multi-AZ is REQUIRED. 
Single-AZ would not meet your availability target.
Trade-off: Multi-AZ doubles infrastructure cost but ensures 
automatic failover and meets your SLA commitment."

✅ Production with tight budget:
"For production with tight budget, consider:
Option 1: Multi-AZ (recommended) - Meets SLA, 2x cost
Option 2: Single-AZ + automated backups - Lower cost, longer recovery time
Trade-off: Save 50% cost but accept 1-2 hour recovery time vs. 60-120 seconds"
```

### Example: Encryption Recommendation

**Without context** (prescriptive):
```
❌ "You should enable encryption at rest."
```

**With context** (conditional):
```
✅ Public data:
"For public data, encryption at rest is OPTIONAL. 
Consider encryption for defense-in-depth, but it's not required."

✅ PII data with GDPR:
"For PII data with GDPR requirements, encryption at rest is REQUIRED.
Use AWS KMS with customer-managed keys for compliance.
Trade-off: Adds ~$1/month per key + minimal performance overhead."

✅ Confidential data with tight budget:
"For confidential data, encryption is REQUIRED.
Option 1: AWS KMS (recommended) - $1/month, audit trail, key rotation
Option 2: SSE-S3 (budget option) - Free, AWS-managed keys, less control
Trade-off: KMS provides better control and compliance but costs more."
```

## Validation

After gathering context, validate completeness:

**Required for all reviews**:
- Environment type

**Required for production**:
- Availability requirements
- Data classification

**Required for cost-impacting recommendations**:
- Budget constraints

**Required for security recommendations**:
- Data classification
- Regulatory requirements

**Required for performance recommendations**:
- Performance requirements

## Example Complete Context Gathering Flow

```
Kiro: "Before I review your infrastructure, I need to understand your context.

1. What environment is this for?
   - Development
   - Staging  
   - Production
   - Demo
   - Test"

User: "Production"

Kiro: "Great. For production, I need a few more details:

2. What's your target SLA (uptime percentage)?
   - 99% (acceptable for internal tools)
   - 99.9% (standard for customer-facing apps)
   - 99.99% (high availability requirement)"

User: "99.9%"

Kiro: "Perfect. Now about your data:

3. What type of data does this system handle?
   - Public (no sensitive data)
   - Internal (company-internal)
   - Confidential (sensitive business data)
   - Restricted (highly sensitive, regulated)

4. Does it contain PII, financial data, or health data?"

User: "Confidential, contains PII"

Kiro: "Got it. Last question about budget:

5. What's your budget constraint level?
   - Tight (minimize costs)
   - Moderate (balance cost and capabilities)
   - Flexible (prioritize capabilities)"

User: "Moderate"

Kiro: "Perfect! Based on your context:
- Environment: Production
- SLA: 99.9% (8.76 hours downtime/year max)
- Data: Confidential with PII
- Budget: Moderate

I'll now provide context-aware recommendations. For example:
- Multi-AZ is REQUIRED to meet your 99.9% SLA
- Encryption is REQUIRED for PII data
- I'll suggest cost-effective options within your moderate budget

Let me review your infrastructure..."
```

## Tips for Effective Context Gathering

1. **Ask early**: Gather context before making recommendations
2. **Be concise**: Don't overwhelm with too many questions
3. **Provide options**: Make it easy to answer with predefined choices
4. **Explain why**: Help users understand why context matters
5. **Infer when possible**: Use file paths and names to reduce questions
6. **Store context**: Save with review session for future reference
7. **Update as needed**: Allow context updates during the review
8. **Validate completeness**: Ensure critical context is gathered before proceeding
