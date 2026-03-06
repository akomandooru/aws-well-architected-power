---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Review Mode Selection Guide

## Three Review Modes

### Simple Mode (2.5-6s)
- **Approach**: Prescriptive checks against Well-Architected best practices
- **No** context questions, trade-off analysis, or decision matrices
- **Output**: Direct violations with risk level, location, and remediation
- **Trigger**: "quick review", dev files, CI/CD context, pre-commit

### Context-Aware Mode (4-8s)
- **Approach**: Conditional guidance based on gathered context
- **Asks** about environment, SLA, budget, data classification
- **Output**: Context-specific recommendations with trade-off explanations
- **Trigger**: Production files, interactive sessions, "review for production"

### Full Analysis Mode (5-10s)
- **Approach**: Comprehensive analysis with decision matrices and ROI
- **Loads** trade-off scenarios, decision matrices, cost-benefit analysis
- **Output**: Pillar scores, priority-ranked actions, decision matrices, cost summaries
- **Trigger**: "full analysis", "comprehensive review", major architecture decisions

## Auto-Detection Rules

### File Path Signals
| Pattern | Mode |
|---|---|
| `dev/`, `development/`, `local/`, `sandbox/` | Simple |
| `prod/`, `production/`, `live/` | Context-Aware |
| `staging/`, `stg/`, `qa/` | Context-Aware |
| `modules/` (reusable) | Context-Aware |

### User Request Signals
| Keywords | Mode |
|---|---|
| "quick", "fast", "check", "scan", "lint" | Simple |
| "review", "assess", "evaluate" | Context-Aware |
| "full analysis", "comprehensive", "deep dive", "decision matrix" | Full Analysis |

### Context Signals
| Signal | Mode |
|---|---|
| CI/CD pipeline | Simple |
| Single file review | Simple or Context-Aware |
| Multiple files / architecture | Context-Aware |
| Architecture decision with options | Full Analysis |

## Mode Escalation

Start with detected mode. Escalate if:
- Simple → Context-Aware: Critical findings need context (e.g., missing Multi-AZ — need to know if prod)
- Context-Aware → Full Analysis: User asks "what are my options?" or multiple valid architectures exist

## Output Format by Mode

### Simple Mode
```
❌ HIGH RISK: [Issue]
   Location: [file:line]
   Fix: [Specific remediation]

⚠️ MEDIUM RISK: [Issue]
   Location: [file:line]
   Fix: [Specific remediation]
```

### Context-Aware Mode
```
FOR [environment] with [SLA]:
  ❌ [Issue] — [Why it matters in this context]
  Recommendation: [Context-specific fix]
  Trade-off: [What you gain] vs [What it costs]
```

### Full Analysis Mode
```
📊 PILLAR SCORES: Security 4/5 | Reliability 3/5 | Cost 4/5 | ...

Priority Actions:
1. [HIGH] [Issue] — [Impact] — [Fix with cost-benefit]
2. [MEDIUM] [Issue] — [Impact] — [Fix with trade-off]

Decision Matrix: [Options comparison table]
Cost Summary: Current $X/month → Optimized $Y/month
```
