---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Context Question Templates

## Purpose

Gather system context before making Well-Architected recommendations. Context-aware guidance ensures recommendations fit the specific situation rather than being prescriptive one-size-fits-all rules.

## When to Ask

- At the start of a Well-Architected review session
- Before recommendations with significant cost or complexity implications
- Before recommending Multi-AZ, encryption approaches, instance sizing, or DR strategies

## Question Flow

### 1. Environment Type (ALWAYS ASK FIRST)

"What environment is this for?"
- Development (cost-sensitive, acceptable downtime)
- Staging (production-like testing)
- Production (customer-facing, high availability)

### 2. Availability Requirements (PRODUCTION/STAGING)

- Target SLA: 99% / 99.9% / 99.99% / 99.999%
- RTO: How quickly must it recover?
- RPO: How much data loss is acceptable?
- Criticality: Low / Medium / High / Critical

### 3. Budget Constraints (ALL ENVIRONMENTS)

- Tight (minimize costs, accept trade-offs)
- Moderate (balance cost and capabilities)
- Flexible (reliability and performance first)

### 4. Data Classification (WHEN RELEVANT)

- Public (no restrictions)
- Internal (business data, standard protection)
- Confidential (PII, financial — encryption required)
- Restricted (health, regulated — compliance required)

### 5. Compliance Requirements (WHEN RELEVANT)

- HIPAA, PCI-DSS, SOC 2, GDPR, FedRAMP
- Affects: encryption, logging, access controls, audit trails

## How Context Changes Recommendations

| Context | Recommendation Changes |
|---|---|
| Dev + tight budget | Single-AZ, t4g instances, minimal monitoring |
| Prod + 99.9% SLA | Multi-AZ required, auto-scaling, comprehensive monitoring |
| Confidential data | KMS CMK, HTTPS enforcement, access logging |
| HIPAA compliance | Encryption everywhere, audit trails, BAA-eligible services |

## Context Inference from File Paths

| Path Pattern | Inferred Context |
|---|---|
| `dev/`, `development/`, `local/` | Development environment |
| `staging/`, `stg/`, `qa/` | Staging environment |
| `prod/`, `production/`, `live/` | Production environment |
| `modules/` | Reusable — ask about target environment |

When context can be inferred from file paths, confirm rather than ask:
"I see this is in a production path. I'll provide production-grade recommendations. Let me know if this is actually for a different environment."
