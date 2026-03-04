# Review Mode Selection Guide

## Overview

This steering file guides Kiro on how to detect, select, and manage review modes for AWS Well-Architected Framework reviews. The power supports three review modes optimized for different use cases, balancing thoroughness with performance and cost.

## Three Review Modes

### 1. Simple Mode

**Characteristics:**
- **Token Budget:** 17-25K tokens
- **Target Latency:** 2.5-6 seconds
- **Approach:** Prescriptive guidance based on Well-Architected best practices
- **Context Gathering:** None
- **Trade-Off Analysis:** None
- **Decision Matrices:** Not loaded
- **Scenarios:** Not loaded

**When to Use:**
- CI/CD pipeline checks
- Quick validation during active development
- Development environment reviews
- Routine compliance checks
- Pre-commit hooks
- Fast feedback loops

**What Simple Mode Provides:**
- Direct identification of Well-Architected violations
- Prescriptive recommendations (e.g., "Enable encryption at rest")
- Risk level assignments (High, Medium, Low)
- Specific remediation steps
- Line numbers and file references for issues
- No context questions or trade-off discussions

**Example Output:**
```
❌ HIGH RISK: S3 bucket lacks encryption at rest
Location: main.tf:45
Recommendation: Add server_side_encryption_configuration block
Remediation: Enable AES256 or aws:kms encryption
```

### 2. Context-Aware Mode

**Characteristics:**
- **Token Budget:** 35-50K tokens
- **Target Latency:** 4-8 seconds
- **Approach:** Conditional guidance based on system context
- **Context Gathering:** Yes (environment, SLA, budget, data classification)
- **Trade-Off Analysis:** Yes (for key recommendations)
- **Decision Matrices:** Loaded on-demand
- **Scenarios:** Loaded on-demand

**When to Use:**
- Interactive review sessions
- Production environment reviews
- Staging environment reviews
- Architecture decision reviews
- When context matters for recommendations
- When trade-offs need explanation

**What Context-Aware Mode Provides:**
- Context questions to understand requirements
- Conditional recommendations based on context
- Trade-off explanations for key decisions
- Environment-specific guidance
- Cost-benefit analysis for major changes
- Alternative approaches with pros/cons

**Example Output:**
```
⚠️ CONTEXT-DEPENDENT: Single-AZ RDS instance detected
Location: database.tf:23

Context Questions:
- What environment is this? (development/staging/production)
- What's your availability requirement? (SLA target)
- What's your budget constraint? (tight/moderate/flexible)

Conditional Guidance:
- FOR production with 99.9% SLA: Multi-AZ is REQUIRED
  - Improves Reliability: Automatic failover, 99.95% availability
  - Cost Impact: 2x database cost (~$200/month → ~$400/month)
  
- FOR development/test: Single-AZ is ACCEPTABLE
  - Cost Savings: 50% reduction in database costs
  - Trade-off: No automatic failover, manual recovery needed
  - Acceptable because: Non-critical environment, downtime tolerable

Recommendation: Based on your context, choose the appropriate configuration.
```

### 3. Full Analysis Mode

**Characteristics:**
- **Token Budget:** 70-95K tokens
- **Target Latency:** 5-10 seconds
- **Approach:** Comprehensive analysis with decision matrices and scenarios
- **Context Gathering:** Yes (comprehensive)
- **Trade-Off Analysis:** Yes (detailed)
- **Decision Matrices:** Preloaded
- **Scenarios:** Preloaded

**When to Use:**
- Major architecture decisions
- Explicit user request for comprehensive analysis
- Complex trade-off scenarios
- Multi-pillar optimization decisions
- Architecture review meetings
- When cost justification is needed

**What Full Analysis Mode Provides:**
- Comprehensive context gathering
- Detailed trade-off analysis across all pillars
- Decision matrices comparing multiple options
- Quantitative cost-benefit estimates
- Scenario matching with examples
- Multi-pillar impact analysis
- Long-term implications discussion

**Example Output:**
```
🔍 COMPREHENSIVE ANALYSIS: Database High Availability Strategy
Location: database.tf:23

Context Gathered:
- Environment: Production
- SLA Requirement: 99.9% (43 minutes downtime/month)
- Budget: Moderate ($5K/month infrastructure)
- Data Classification: Confidential (customer PII)
- Expected Growth: Moderate (2x in 12 months)

Decision Matrix: Database HA Options

| Option | Reliability | Cost | Complexity | Recovery Time | Best For |
|--------|------------|------|------------|---------------|----------|
| Single-AZ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 30-60 min | Dev/Test |
| Multi-AZ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 1-2 min | Production |
| Aurora Global | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | <1 min | Global Apps |

Recommended: Multi-AZ RDS

Pillar Impact Analysis:
✅ Reliability: +HIGH
   - Automatic failover in 1-2 minutes
   - Synchronous replication to standby
   - Meets 99.9% SLA requirement
   
⚠️ Cost: +MEDIUM
   - 2x database instance cost: $200/mo → $400/mo
   - 2x storage cost: $50/mo → $100/mo
   - Total increase: $250/month ($3K/year)
   
✅ Security: NEUTRAL
   - Same encryption and access controls
   - Standby in different AZ (physical isolation)
   
⚠️ Performance: +LOW
   - Slight write latency increase (1-2ms)
   - Read performance unchanged
   
✅ Operational Excellence: +MEDIUM
   - Reduced operational burden (automated failover)
   - No manual intervention for AZ failures
   
Cost-Benefit Analysis:
- Downtime Cost: $500/hour (estimated)
- Multi-AZ prevents: ~40 minutes/month downtime
- Savings: ~$333/month in prevented downtime
- Net benefit: $83/month positive ROI

Trade-Off Scenarios:
1. Startup with tight budget: Consider Single-AZ initially, plan Multi-AZ migration
2. Enterprise with strict SLA: Multi-AZ is non-negotiable
3. Global application: Consider Aurora Global Database for <1s failover

Decision: IMPLEMENT Multi-AZ
Rationale: Meets SLA requirement, positive ROI, acceptable cost increase for moderate budget
```

## Automatic Mode Detection

### Detection Rules (Priority Order)

Kiro evaluates these rules from highest to lowest priority. The first matching rule determines the mode.

#### Priority 100: Explicit User Requests (Highest)

**Trigger Full Analysis Mode:**
- User says: "full analysis"
- User says: "comprehensive review"
- User says: "trade-off analysis"
- User says: "detailed analysis"
- User says: "compare options"

**Trigger Simple Mode:**
- User says: "quick review"
- User says: "simple review"
- User says: "fast check"
- User says: "quick scan"
- User says: "rapid review"

**Trigger Context-Aware Mode:**
- User says: "context-aware review"
- User says: "review with context"
- User says: "explain trade-offs"
- User says: "conditional guidance"

#### Priority 90: CI/CD and Automation

**Trigger Simple Mode:**
- Environment variable `CI=true`
- Environment variable `GITHUB_ACTIONS=true`
- Environment variable `GITLAB_CI=true`
- Environment variable `JENKINS_HOME` is set
- Running in automated pipeline context

**Rationale:** CI/CD needs fast feedback without interactive context gathering.

#### Priority 50: File Path Detection

**Trigger Simple Mode:**
- File path contains `/dev/`
- File path contains `-dev.`
- File path contains `.dev.`
- File path contains `/development/`
- File path contains `dev-`

**Trigger Context-Aware Mode:**
- File path contains `/prod/`
- File path contains `-prod.`
- File path contains `.prod.`
- File path contains `/production/`
- File path contains `/staging/`
- File path contains `-staging.`
- File path contains `.staging.`

**Rationale:** Production and staging files warrant context-aware analysis due to higher risk.

#### Priority 30: Session Type

**Trigger Context-Aware Mode:**
- Interactive session (user is present)
- Not in CI/CD environment
- User can answer context questions

**Rationale:** Interactive sessions allow for context gathering and discussion.

#### Priority 0: Default Fallback

**Trigger Context-Aware Mode:**
- No other rules matched
- Balanced default for most use cases

### Mode Detection Examples

**Example 1: CI/CD Pipeline**
```
Context:
- CI=true
- File: infrastructure/prod/main.tf
- Session: Non-interactive

Detected Mode: Simple Mode
Reason: CI/CD environment (Priority 90) overrides file path (Priority 50)
```

**Example 2: Interactive Production Review**
```
Context:
- CI=false
- File: infrastructure/prod/main.tf
- Session: Interactive

Detected Mode: Context-Aware Mode
Reason: File path contains "prod" (Priority 50)
```

**Example 3: Explicit Request**
```
User: "Can you do a full analysis of this architecture?"
Context:
- File: infrastructure/dev/main.tf
- Session: Interactive

Detected Mode: Full Analysis Mode
Reason: Explicit user request (Priority 100) overrides file path
```

**Example 4: Quick Check**
```
User: "Quick review of this Lambda function"
Context:
- File: src/lambda/handler.py
- Session: Interactive

Detected Mode: Simple Mode
Reason: Explicit "quick review" request (Priority 100)
```

## Mode Configuration Options

### Configuration File Format

Users can customize mode behavior via `.kiro/config/well-architected-modes.json`:

```json
{
  "defaultMode": "context-aware",
  "autoDetectMode": true,
  "modeOverrides": {
    "development": "simple",
    "staging": "context-aware",
    "production": "context-aware"
  },
  "disabledModes": [],
  "customDetectionRules": [
    {
      "condition": "filePath.includes('critical')",
      "mode": "full-analysis",
      "priority": 80
    }
  ],
  "tokenBudgets": {
    "simple": 25000,
    "context-aware": 50000,
    "full-analysis": 95000
  },
  "features": {
    "simple": {
      "enableContextGathering": false,
      "enableTradeOffAnalysis": false,
      "loadDecisionMatrices": false
    },
    "context-aware": {
      "enableContextGathering": true,
      "enableTradeOffAnalysis": true,
      "loadDecisionMatrices": false
    },
    "full-analysis": {
      "enableContextGathering": true,
      "enableTradeOffAnalysis": true,
      "loadDecisionMatrices": true
    }
  }
}
```

### Configuration Options Explained

**defaultMode:** The mode to use when no detection rules match (default: "context-aware")

**autoDetectMode:** Enable/disable automatic mode detection (default: true)
- If false, always use defaultMode unless explicitly requested

**modeOverrides:** Force specific modes for specific environments
- Overrides automatic detection for matching environments

**disabledModes:** List of modes to disable (e.g., ["full-analysis"])
- Disabled modes fall back to next available mode

**customDetectionRules:** User-defined detection rules
- Evaluated at specified priority level
- Condition is JavaScript expression evaluated with context

**tokenBudgets:** Customize token limits per mode
- Useful for cost control or performance tuning

**features:** Fine-tune feature availability per mode
- Allows customization of what each mode includes

## Performance Characteristics

### Token Consumption

| Mode | Min Tokens | Max Tokens | Typical | Use Case |
|------|-----------|-----------|---------|----------|
| Simple | 17K | 25K | 20K | Fast checks |
| Context-Aware | 35K | 50K | 42K | Standard reviews |
| Full Analysis | 70K | 95K | 82K | Deep analysis |

### Latency Targets

| Mode | Min Latency | Max Latency | Typical | Acceptable For |
|------|------------|-------------|---------|----------------|
| Simple | 2.5s | 6s | 4s | CI/CD, dev workflow |
| Context-Aware | 4s | 8s | 6s | Interactive sessions |
| Full Analysis | 5s | 10s | 7.5s | Architecture decisions |

### Cost Estimates (GPT-4 Pricing)

Assuming $0.03 per 1K input tokens, $0.06 per 1K output tokens:

| Mode | Input Cost | Output Cost | Total per Review | 100 Reviews/Month |
|------|-----------|-------------|------------------|-------------------|
| Simple | $0.60 | $0.30 | $0.90 | $90 |
| Context-Aware | $1.26 | $0.60 | $1.86 | $186 |
| Full Analysis | $2.46 | $1.20 | $3.66 | $366 |

**Cost Optimization Tips:**
- Use Simple Mode for routine checks (10x cheaper than Full Analysis)
- Reserve Full Analysis for major decisions
- Enable auto-detection to use appropriate mode automatically
- Configure CI/CD to use Simple Mode only

## Mode Switching Mid-Session

### Switching Scenarios

**Scenario 1: Start Simple, Escalate to Context-Aware**
```
User: "Quick review of this RDS config"
Kiro: [Simple Mode] "❌ HIGH RISK: Single-AZ RDS in production file"

User: "Why is this high risk? What are my options?"
Kiro: [Switches to Context-Aware Mode] "Let me gather some context..."
```

**Scenario 2: Start Context-Aware, Escalate to Full Analysis**
```
User: "Review this architecture"
Kiro: [Context-Aware Mode] "⚠️ Trade-off: Multi-AZ vs Single-AZ"

User: "Can you do a full analysis with cost comparison?"
Kiro: [Switches to Full Analysis Mode] "Loading decision matrices..."
```

**Scenario 3: Start Full Analysis, Simplify to Simple**
```
User: "Full analysis of this Lambda function"
Kiro: [Full Analysis Mode] [Comprehensive analysis]

User: "Now quick check this other Lambda"
Kiro: [Switches to Simple Mode] "✓ Quick scan..."
```

### Context Preservation

When switching modes, Kiro preserves:
- ✅ System context already gathered (environment, SLA, budget, etc.)
- ✅ Previous findings and issues identified
- ✅ User preferences and constraints
- ✅ Session history and decisions made

Kiro does NOT re-gather:
- ❌ Context questions already answered
- ❌ Information already provided by user
- ❌ Analysis already completed

### How to Switch Modes

**Explicit Mode Switch:**
```
User: "Switch to simple mode"
User: "Use context-aware mode for this"
User: "I need a full analysis now"
```

**Implicit Mode Switch (Kiro detects need):**
```
User: "What are the trade-offs?" → Escalate to Context-Aware
User: "Compare all options with costs" → Escalate to Full Analysis
User: "Just tell me what's wrong" → Simplify to Simple
```

## Guidance for Kiro

### When User Doesn't Specify Mode

1. **Detect context** using priority-ordered rules
2. **Announce the mode** at start of review:
   ```
   "I'll do a quick review (Simple Mode) since this is a dev environment..."
   "I'll do a context-aware review (Context-Aware Mode) for this production file..."
   "I'll do a comprehensive analysis (Full Analysis Mode) as requested..."
   ```
3. **Offer mode options** if ambiguous:
   ```
   "I can do a quick review (2-3 seconds) or a detailed analysis with trade-offs (5-7 seconds). Which would you prefer?"
   ```

### Adapting Content to Mode

**In Simple Mode:**
- ❌ Don't ask context questions
- ❌ Don't explain trade-offs
- ❌ Don't load decision matrices
- ✅ Provide direct, prescriptive recommendations
- ✅ Focus on clear violations
- ✅ Keep output concise

**In Context-Aware Mode:**
- ✅ Ask 3-5 key context questions
- ✅ Explain trade-offs for major recommendations
- ✅ Provide conditional guidance based on context
- ✅ Offer alternatives with pros/cons
- ⚠️ Load decision matrices only if needed (on-demand)

**In Full Analysis Mode:**
- ✅ Ask comprehensive context questions
- ✅ Explain all trade-offs in detail
- ✅ Load relevant decision matrices
- ✅ Provide quantitative cost-benefit analysis
- ✅ Include scenario matching
- ✅ Discuss long-term implications

### Progressive Disclosure

In Context-Aware and Full Analysis modes, use progressive disclosure:

1. **Start with summary:** High-level findings and key issues
2. **Then provide details:** Expand on each issue with context
3. **Finally offer deep dive:** Decision matrices and scenarios if requested

Example:
```
Summary: Found 3 high-risk issues, 5 medium-risk issues

[User can stop here if satisfied]

Details: 
❌ HIGH RISK: S3 bucket lacks encryption
   Context: Production bucket with customer data
   Trade-off: Security vs. None (no downside to encryption)
   
[User can stop here if satisfied]

Deep Dive: [If user asks "compare encryption options"]
Decision Matrix: S3 Encryption Options
[Full comparison table]
```

## Troubleshooting Mode Selection

### Issue: Wrong Mode Detected

**Symptoms:**
- Simple Mode used when context needed
- Full Analysis Mode used when quick check wanted
- Context-Aware Mode in CI/CD (too slow)

**Solutions:**
1. **Explicit mode request:** User says "quick review" or "full analysis"
2. **Check file path:** Ensure dev/prod/staging in path for auto-detection
3. **Check CI environment:** Verify CI=true for pipeline runs
4. **Override with config:** Set modeOverrides in config file
5. **Custom detection rule:** Add rule for specific file patterns

### Issue: Mode Too Slow

**Symptoms:**
- Review takes longer than expected
- CI/CD pipeline times out
- User frustrated with wait time

**Solutions:**
1. **Use Simple Mode:** Explicitly request "quick review"
2. **Reduce token budget:** Configure lower tokenBudgets in config
3. **Disable features:** Turn off loadDecisionMatrices in config
4. **Focus on specific pillars:** Don't review all six pillars
5. **Check MCP server latency:** Slow MCP responses affect all modes

### Issue: Mode Too Shallow

**Symptoms:**
- Not enough detail in recommendations
- Missing trade-off explanations
- No context-specific guidance

**Solutions:**
1. **Use Context-Aware or Full Analysis:** Explicitly request
2. **Ask follow-up questions:** "What are the trade-offs?"
3. **Provide context upfront:** "This is production with 99.9% SLA"
4. **Enable features:** Ensure enableTradeOffAnalysis is true in config

### Issue: Context Questions Annoying

**Symptoms:**
- Too many questions in Context-Aware Mode
- User knows the context already
- Slows down workflow

**Solutions:**
1. **Use Simple Mode:** For quick checks without questions
2. **Provide context upfront:** "Review this production RDS with 99.9% SLA and moderate budget"
3. **Configure fewer questions:** Customize context questions in config
4. **Answer once per session:** Context is preserved for subsequent reviews

### Issue: Inconsistent Mode Selection

**Symptoms:**
- Same file gets different modes on different runs
- Unpredictable behavior

**Solutions:**
1. **Check detection rules:** Review priority ordering
2. **Disable auto-detection:** Set autoDetectMode: false
3. **Use explicit requests:** Always specify mode
4. **Check environment variables:** CI variables may be set inconsistently
5. **Review custom rules:** Custom rules may conflict

### Issue: Mode Not Available

**Symptoms:**
- "Full Analysis Mode is disabled"
- Requested mode not working

**Solutions:**
1. **Check disabledModes:** Remove mode from disabledModes list
2. **Check configuration:** Ensure mode is configured
3. **Fallback mode:** System uses next available mode
4. **Enable in config:** Add mode to features configuration

## Best Practices

### For Development Workflow

✅ **DO:**
- Use Simple Mode for pre-commit checks
- Use Context-Aware Mode for PR reviews
- Use Full Analysis Mode for architecture decisions
- Enable auto-detection for smart defaults

❌ **DON'T:**
- Use Full Analysis Mode in CI/CD (too slow)
- Use Simple Mode for production architecture decisions
- Disable auto-detection without good reason

### For Team Adoption

✅ **DO:**
- Document mode selection in team guidelines
- Configure sensible defaults in shared config
- Train team on when to use each mode
- Share mode selection examples

❌ **DON'T:**
- Force one mode for all use cases
- Ignore performance characteristics
- Skip mode explanation to users

### For Cost Optimization

✅ **DO:**
- Use Simple Mode for routine checks (90% of reviews)
- Reserve Context-Aware for production reviews (9% of reviews)
- Reserve Full Analysis for major decisions (1% of reviews)
- Monitor token consumption per mode

❌ **DON'T:**
- Use Full Analysis Mode by default
- Ignore cost differences between modes
- Run Full Analysis in automated pipelines

### For Optimal User Experience

✅ **DO:**
- Announce mode at start of review
- Explain why mode was selected
- Offer mode switch if user needs more/less detail
- Preserve context when switching modes

❌ **DON'T:**
- Switch modes without explanation
- Re-ask context questions after mode switch
- Assume user knows what mode means

## Summary

**Three Modes:**
1. **Simple:** Fast (2.5-6s), prescriptive, no context, 17-25K tokens
2. **Context-Aware:** Balanced (4-8s), conditional, with context, 35-50K tokens
3. **Full Analysis:** Comprehensive (5-10s), detailed, with matrices, 70-95K tokens

**Auto-Detection Priority:**
1. Explicit user request (highest)
2. CI/CD environment
3. File path (dev/prod/staging)
4. Session type (interactive)
5. Default fallback (lowest)

**Key Principles:**
- Match mode to use case for optimal performance and cost
- Preserve context when switching modes
- Announce mode and explain selection
- Allow explicit override of auto-detection
- Use progressive disclosure in detailed modes

**When in Doubt:**
- CI/CD → Simple Mode
- Development → Simple Mode
- Production → Context-Aware Mode
- Major Decision → Full Analysis Mode
- User Request → Honor explicit mode request
