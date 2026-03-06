# Mode Selection Examples

## Overview

Three review modes handle the same infrastructure differently. This document shows each mode in action with the same Lambda configuration, plus auto-detection, overrides, and mode switching.

---

## Sample Infrastructure Code

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

---

## Simple Mode Output (Fastest)

```
❌ HIGH RISK: Hardcoded API key in environment variables
   Location: lambda.tf:12
   Fix: Use AWS Secrets Manager or Parameter Store

⚠️ MEDIUM RISK: Missing timeout configuration
   Location: lambda.tf:3
   Fix: Add `timeout = 30`

⚠️ MEDIUM RISK: Missing memory configuration
   Location: lambda.tf:3
   Fix: Add `memory_size = 512`

Summary: 1 high-risk, 2 medium-risk | 3.2 seconds
```

Characteristics: Fast, prescriptive, no context questions, no trade-offs.

---

## Context-Aware Mode Output (Moderate)

```
📋 Context Questions:
1. What's your availability requirement? → 99.9% SLA
2. What's your budget constraint? → Moderate
3. What type of data? → Customer PII

❌ HIGH RISK: Hardcoded API key
   FOR your context (customer PII, production):
   This is a compliance violation. Secrets must be in Secrets Manager.
   Cost: ~$0.40/month per secret + $0.05/10K API calls

⚠️ MEDIUM RISK: Missing timeout
   FOR your context (99.9% SLA):
   Uncontrolled timeouts can cascade. Set to 80% of API Gateway timeout.
   Trade-off: Too low = false timeouts | Too high = resource waste

Summary: 1 high-risk, 2 medium-risk | +$0.40/month | 6.1 seconds
```

Characteristics: Gathers context, conditional recommendations, trade-off explanations, cost impacts.

---

## Full Analysis Mode Output (Most Thorough)

```
📊 DECISION MATRIX: Lambda Configuration Options

| Aspect | Current | Recommended | Enterprise |
|--------|---------|-------------|------------|
| Secrets | Env vars | Secrets Manager | Secrets Manager + rotation |
| Memory | 128 MB | 512 MB | Power Tuned |
| Timeout | 3s default | 30s | Tuned per function |
| Cost/month | $0 | +$0.40 | +$2.00 |
| Security | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

🎭 PILLAR SCORES: Security 1/5 → 4/5 | Cost 5/5 → 4/5 | Reliability 2/5 → 4/5

💰 COST-BENEFIT: +$0.40/month cost | Eliminates credential exposure risk
   ROI: Compliance violation fine avoidance alone justifies cost

📋 IMPLEMENTATION ROADMAP:
Phase 1 (Day 1): Move secrets to Secrets Manager
Phase 2 (Week 1): Configure memory and timeout
Phase 3 (Week 2): Add X-Ray tracing and monitoring

Review completed in 8.7 seconds
```

Characteristics: Decision matrices, pillar scores, ROI analysis, implementation roadmap.

---

## Automatic Mode Detection

| Signal | Priority | Detected Mode |
|--------|----------|---------------|
| User says "quick review" | 100 (highest) | Simple |
| User says "full analysis" | 100 | Full Analysis |
| CI/CD environment (`CI=true`) | 90 | Simple |
| Custom rule (e.g., "critical" in path) | 95 | Context-Aware |
| File path contains `/prod/` | 50 | Context-Aware |
| File path contains `/dev/` | 50 | Simple |
| File path contains `/staging/` | 50 | Context-Aware |

Higher priority wins. User explicit requests always override auto-detection.

### Examples

```
File: infrastructure/dev/api-gateway.tf
→ Simple Mode (dev path detected)

File: infrastructure/prod/database.tf
→ Context-Aware Mode (prod path detected)

File: infrastructure/prod/database.tf + CI=true
→ Simple Mode (CI/CD overrides prod path)

User: "Full analysis of this VPC design"
→ Full Analysis Mode (explicit request overrides everything)
```

---

## Mode Switching Mid-Session

Modes can escalate during a session:

```
User: "Quick review of this RDS config"
→ Simple Mode: "❌ HIGH RISK: Single-AZ RDS in production"

User: "Why is Multi-AZ high risk? What are the trade-offs?"
→ Switches to Context-Aware Mode, preserves previous findings
→ Gathers context (SLA, budget), provides trade-off analysis

User: "Show me all my caching options with cost comparison"
→ Switches to Full Analysis Mode, preserves all context
→ Decision matrix, ROI analysis, implementation roadmap
```

Context is preserved across mode switches — findings, file references, and gathered context carry forward.

---

## Mode Comparison Summary

| Aspect | Simple | Context-Aware | Full Analysis |
|--------|--------|---------------|---------------|
| Speed | Fastest | Moderate | Most thorough |
| Context questions | None | 3-5 | 8-10 |
| Trade-off analysis | No | Yes | Comprehensive |
| Decision matrices | No | No | Yes |
| Cost-benefit | No | Basic | Detailed with ROI |
| Pillar scores | No | No | Yes |
| Best for | CI/CD, dev, quick checks | Production reviews | Architecture decisions |
