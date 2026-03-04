# Testing the AWS Well-Architected Power Locally

This guide walks you through testing the power locally to ensure it works correctly and provides value.

## Quick Test Checklist

- [ ] Power is recognized by Kiro
- [ ] Example files trigger reviews correctly
- [ ] All six pillars provide guidance
- [ ] Reports generate in multiple formats
- [ ] Hooks work (if installed)
- [ ] MCP servers connect (if configured)
- [ ] Simple Mode works (fast, prescriptive)
- [ ] Context-Aware Mode works (conditional, trade-offs)
- [ ] Full Analysis Mode works (comprehensive, matrices)
- [ ] Automatic mode detection works correctly
- [ ] Explicit mode overrides work
- [ ] Mode switching preserves context

## Step 1: Verify Power Installation (1 minute)

### Test Power Recognition

The power should already be installed if you followed the QUICKSTART guide. Verify it's recognized:

```
"List available powers"
```

**Expected**: You should see "aws-well-architected-power" in the list.

**If not found**:
- Open Powers panel in Kiro (Command Palette → "Powers: Configure")
- Click "Add Custom Power" → "Import from folder"
- Select your `aws-well-architected-power` directory
- The power should now appear in the list

### Test Power Activation

```
"Activate the AWS Well-Architected power"
```

**Expected**: Kiro acknowledges the power and explains its capabilities.

## Step 2: Test IaC Analysis (3 minutes)

### Test with Example Files

The power includes example files specifically designed for testing:

#### Test 1: Terraform Security Issues

```
"Review the file aws-well-architected-power/examples/terraform/security-issues.tf"
```

**Expected Findings** (5 issues):
1. HIGH RISK - Line 2-5: Unencrypted S3 bucket
2. HIGH RISK - Line 8-20: Overly permissive IAM policy (allows *)
3. HIGH RISK - Line 23-35: Security group allows all traffic (0.0.0.0/0)
4. HIGH RISK - Line 38-43: Unencrypted EBS volume
5. HIGH RISK - Line 46-56: RDS instance publicly accessible

**Verify**:
- Issues are identified with specific line numbers
- Risk levels are assigned (HIGH, MEDIUM, LOW)
- Remediation steps are provided
- Pillar classification is correct (Security)

#### Test 2: CloudFormation Reliability Issues

```
"Review the file aws-well-architected-power/examples/cloudformation/reliability-issues.yaml"
```

**Expected Findings** (5 issues):
1. HIGH RISK: EC2 instance in single AZ (no fault tolerance)
2. HIGH RISK: RDS without Multi-AZ enabled
3. MEDIUM RISK: No automated backups configured
4. MEDIUM RISK: No health checks for load balancer
5. MEDIUM RISK: Single NAT Gateway (single point of failure)

#### Test 3: CDK Cost Optimization Issues

```
"Review the file aws-well-architected-power/examples/cdk/cost-optimization-issues.ts"
```

**Expected Findings** (5 issues):
1. MEDIUM RISK: Oversized EC2 instance (t3.2xlarge for simple workload)
2. MEDIUM RISK: No lifecycle policies on S3 bucket
3. MEDIUM RISK: No auto-scaling configured
4. LOW RISK: No cost allocation tags
5. LOW RISK: Standard storage class for infrequently accessed data

### Test with Your Own Files

If you have existing IaC files:

```
"Review my Terraform/CloudFormation/CDK files for Well-Architected compliance"
```

**Verify**:
- Files are detected automatically
- Issues are specific to your infrastructure
- Recommendations are actionable

## Step 3: Test Pillar-Specific Guidance (2 minutes)

### Test Each Pillar

Test that each pillar provides guidance:

```
"Explain Security Pillar best practices for S3"
"Explain Reliability Pillar best practices for RDS"
"Explain Performance Efficiency best practices for EC2"
"Explain Cost Optimization best practices for storage"
"Explain Operational Excellence best practices for monitoring"
"Explain Sustainability Pillar best practices for compute"
```

**Expected**:
- Detailed explanations for each pillar
- Real-world examples and scenarios
- Anti-patterns and what to avoid
- Links to AWS documentation
- Specific implementation guidance

### Test Learning Mode

```
"Enable learning mode and explain why Multi-AZ is important for RDS"
```

**Expected**:
- Detailed explanation of the concept
- Real-world scenarios and consequences
- Common mistakes to avoid
- Step-by-step implementation guidance
- Quiz questions (optional)

## Step 4: Test Code Generation (2 minutes)

### Test Well-Architected Code Generation

```
"Generate a Terraform configuration for an S3 bucket following AWS best practices"
```

**Expected**:
- Code includes encryption (Security)
- Code includes versioning (Reliability)
- Code includes lifecycle policies (Cost Optimization)
- Code includes access logging (Operational Excellence)
- Inline comments explain decisions
- Code is syntactically correct

### Test Different Resources

```
"Generate a Terraform module for a highly available web application"
"Generate a CloudFormation template for a secure RDS database"
"Generate CDK code for a cost-optimized Lambda function"
```

**Verify**:
- Best practices are built-in
- Code is production-ready
- Comments explain Well-Architected decisions

## Step 5: Test Report Generation (2 minutes)

### Test Different Report Formats

After conducting a review, test report generation:

```
"Generate a review report in Markdown format"
```

**Expected**:
- Structured report with findings
- Issues organized by pillar and risk level
- Specific remediation steps
- Overall risk scores

```
"Generate a review report in JSON format"
```

**Expected**:
- Machine-readable JSON structure
- All findings with metadata
- Suitable for automation/CI-CD

```
"Generate a review report in HTML format"
```

**Expected**:
- Formatted HTML report
- Suitable for sharing with stakeholders
- Visual presentation of findings

### Verify Report Content

Check that reports include:
- Executive summary
- Findings by pillar
- Risk levels and scores
- Remediation recommendations
- Timestamp and metadata

## Step 6: Test MCP Server Integration (Optional, 3 minutes)

If you have MCP servers configured:

### Test Security Assessment MCP Server

```
"Run an automated security assessment of my AWS environment"
```

**Expected**:
- Connects to Security Assessment MCP server
- Retrieves security findings
- Maps findings to Well-Architected best practices
- Provides remediation guidance

### Test Knowledge MCP Server

```
"Get the latest AWS documentation for S3 encryption best practices"
```

**Expected**:
- Connects to Knowledge MCP server
- Retrieves current AWS documentation
- Provides up-to-date guidance
- Links to official resources

### Test Graceful Degradation

Temporarily disable MCP servers and verify the power still works:

```
"Review my infrastructure for Security Pillar compliance"
```

**Expected**:
- Power works without MCP servers
- Uses fallback documentation from steering files
- Provides valuable guidance (though not automated assessments)

## Step 7: Test Hooks (Optional, 5 minutes)

If you installed hook templates:

### Test File-Save Hook

1. Install the file-save hook:
   ```bash
   cp aws-well-architected-power/hooks/file-save.md ~/.kiro/hooks/aws-waf-file-save.md
   ```

2. Open a `.tf` or `.yaml` file
3. Make a change (add a resource)
4. Save the file

**Expected**:
- Hook triggers automatically
- Review happens in background
- Findings appear in Kiro chat
- No disruption to workflow

### Test Pre-Deployment Hook

1. Install the pre-deployment hook:
   ```bash
   cp aws-well-architected-power/hooks/pre-deployment.md ~/.kiro/hooks/aws-waf-pre-deployment.md
   ```

2. Run a deployment command:
   ```bash
   terraform plan
   # OR
   cdk synth
   ```

**Expected**:
- Hook triggers before command executes
- Review happens automatically
- Findings are presented
- You can proceed or cancel deployment

### Test Post-Generation Hook

1. Install the post-generation hook:
   ```bash
   cp aws-well-architected-power/hooks/post-generation.md ~/.kiro/hooks/aws-waf-post-generation.md
   ```

2. Ask Kiro to generate infrastructure code:
   ```
   "Generate a Terraform module for an RDS database"
   ```

**Expected**:
- Code is generated
- Hook triggers automatically
- Generated code is reviewed
- Issues are identified (if any)

## Step 8: Test Proactive Recognition (2 minutes)

### Test File Pattern Recognition

1. Open a Terraform file (`.tf`)
2. Wait for Kiro to recognize it

**Expected**:
- Kiro acknowledges the IaC file
- Offers to conduct a review
- Suggestion is helpful but not intrusive

### Test Architecture Discussion Recognition

Start a conversation about AWS architecture:

```
"I'm designing a highly available web application on AWS. What should I consider?"
```

**Expected**:
- Kiro recognizes architecture discussion
- Offers Well-Architected guidance
- Asks relevant questions
- Provides pillar-specific recommendations

## Step 9: Verify Value (5 minutes)

### Test Real-World Scenarios

#### Scenario 1: Security Review

```
"I have an S3 bucket storing customer data. Review it for security compliance."
```

**Expected Value**:
- Identifies encryption requirements
- Checks access controls
- Validates bucket policies
- Provides specific remediation steps

#### Scenario 2: Cost Optimization

```
"My AWS bill is too high. Review my infrastructure for cost optimization opportunities."
```

**Expected Value**:
- Identifies oversized resources
- Suggests right-sizing
- Recommends lifecycle policies
- Calculates potential savings

#### Scenario 3: Reliability Improvement

```
"My application has downtime during AWS outages. How can I improve reliability?"
```

**Expected Value**:
- Identifies single points of failure
- Recommends Multi-AZ deployments
- Suggests backup strategies
- Provides disaster recovery guidance

## Step 9: Test Context-Aware Trade-Off Guidance (5 minutes)

### Test Context Gathering

Test that the power asks for context before making recommendations:

```
"Should I use Multi-AZ for my RDS database?"
```

**Expected**:
- Kiro asks about environment type (dev/staging/production)
- Kiro asks about availability requirements (SLA target)
- Kiro asks about budget constraints
- Questions are clear and easy to answer

**Verify**:
- Context questions are relevant
- Questions adapt based on previous answers
- Can skip optional questions
- Context is stored for the session

### Test Conditional Guidance Based on Context

#### Test 1: Development Environment

```
You: "Review my RDS configuration"
Kiro: [Asks context questions]
You: "This is for development, no SLA requirement, tight budget"
```

**Expected**:
- Single-AZ is marked as ACCEPTABLE (not required)
- Recommendation includes cost savings ($60/month)
- Trade-off clearly explained (cost vs. availability)
- Rationale mentions development environment

#### Test 2: Production Environment

```
You: "Review my RDS configuration"
Kiro: [Asks context questions]
You: "This is for production with 99.9% SLA requirement"
```

**Expected**:
- Multi-AZ is marked as REQUIRED (not optional)
- Recommendation includes business impact
- Trade-off includes SLA penalty costs
- Rationale mentions production requirements

#### Test 3: Data Classification

```
You: "Review my S3 bucket encryption"
Kiro: [Asks context questions]
You: "This bucket stores PII and financial data"
```

**Expected**:
- KMS with Customer-Managed Keys is REQUIRED
- SSE-S3 is marked as INSUFFICIENT
- Compliance requirements mentioned (GDPR, PCI-DSS)
- Cost impact is minimal compared to breach risk

### Test Trade-Off Explanations

Test that trade-offs are clearly explained with quantitative data:

```
"Explain the trade-offs between Single-AZ and Multi-AZ for RDS"
```

**Expected**:
- **What you gain**: Specific benefits (99.95% availability, automatic failover)
- **What you give up**: Specific costs (2x infrastructure cost, $60/month)
- **When to choose**: Clear guidance based on context
- **Quantitative estimates**: Actual numbers (cost, downtime, recovery time)
- **Business rationale**: Why it matters for your situation

**Verify**:
- Trade-offs include specific numbers (not vague)
- Multiple options are presented (not just one)
- Recommendations adapt to context
- Rationale is business-focused (not just technical)

### Test Decision Matrices

Request decision matrices for common architecture choices:

```
"Show me a decision matrix for Multi-AZ vs. Single-AZ vs. Multi-Region"
```

**Expected**:
- Table format with options as rows
- Criteria as columns (cost, availability, recovery time, complexity)
- Clear "Best For" guidance
- Context factors listed
- Recommendation based on your context

**Verify**:
- All relevant options included
- Criteria are comprehensive
- Recommendations are clear
- Cost estimates are realistic

### Test Common Scenarios

Test that the power provides appropriate guidance for different scenarios:

#### Test Startup MVP Scenario

```
"I'm building an MVP for a startup. What architecture should I use?"
```

**Expected**:
- Budget: $110-150/month
- Priority: Speed to market > Cost > Reliability
- Recommendations: Single-AZ, burstable instances, basic monitoring
- Trade-offs: Accept downtime to save costs
- Evolution path: How to upgrade as you grow

#### Test Enterprise Production Scenario

```
"I'm building a production system for an enterprise with 99.99% SLA"
```

**Expected**:
- Budget: $15k-30k/month
- Priority: Reliability > Security > Performance > Cost
- Recommendations: Multi-AZ, Multi-Region, comprehensive monitoring
- Trade-offs: Higher cost for high availability
- Compliance: GDPR, SOC 2 considerations

#### Test Cost-Sensitive Production Scenario

```
"I have a production app but tight budget constraints"
```

**Expected**:
- Budget: $2.5k-4k/month
- Priority: Cost > Reliability > Performance
- Recommendations: Multi-AZ database, single-node cache, Reserved Instances
- Trade-offs: Balance cost and reliability
- Optimization strategies: Right-sizing, auto-scaling schedules

### Test Context Inference

Test that the power infers context from file paths:

```
"Review the file dev/infrastructure.tf"
```

**Expected**:
- Kiro infers development environment from path
- Recommendations are appropriate for dev
- Still asks for confirmation if uncertain
- Adjusts guidance based on inferred context

### Test Context Updates

Test that context can be updated during a review:

```
You: "Review my infrastructure"
Kiro: [Asks context questions]
You: "This is for development"
[Review happens]
You: "Actually, this will be production. Re-review with that context."
```

**Expected**:
- Kiro updates context
- Recommendations change appropriately
- Previous findings are re-evaluated
- New recommendations reflect production requirements

## Step 10: Test Review Modes (10 minutes)

The power supports three review modes optimized for different use cases. This section tests each mode, automatic detection, explicit overrides, and mode switching.

### Understanding the Three Modes

Before testing, understand what each mode provides:

| Mode | Token Budget | Latency | Context Questions | Trade-Off Analysis | Decision Matrices | Best For |
|------|-------------|---------|-------------------|-------------------|-------------------|----------|
| **Simple** | 17-25K | 2.5-6s | No | No | No | CI/CD, quick checks, dev |
| **Context-Aware** | 35-50K | 4-8s | Yes (3-5) | Yes | On-demand | Interactive, prod files |
| **Full Analysis** | 70-95K | 5-10s | Yes (8-10) | Yes | Preloaded | Major decisions |

### Test 1: Simple Mode

**Purpose**: Verify fast, prescriptive recommendations without context gathering.

#### Test Simple Mode Explicitly

```
"Quick review of infrastructure/dev/lambda.tf"
```

**Expected Behavior**:
- ✅ Mode announced: "Simple Mode (Quick Check)"
- ✅ No context questions asked
- ✅ Direct issue identification with line numbers
- ✅ Prescriptive recommendations (e.g., "Enable encryption")
- ✅ Clear remediation steps
- ✅ Completes in 2.5-6 seconds
- ❌ No trade-off discussions
- ❌ No cost-benefit analysis
- ❌ No decision matrices

**Example Output Format**:
```
🔍 Simple Mode Review (Quick Check)

❌ HIGH RISK: Hardcoded API key
Location: lambda.tf:12
Recommendation: Use AWS Secrets Manager
Remediation: [specific steps]

⚠️ MEDIUM RISK: Missing timeout
Location: lambda.tf:3
Recommendation: Set explicit timeout
Remediation: Add `timeout = 30`

Summary: 1 high-risk, 1 medium-risk issues
Review completed in 3.2 seconds
```

**Verify**:
- [ ] Mode is clearly announced
- [ ] No context questions appear
- [ ] Issues have specific line numbers
- [ ] Recommendations are prescriptive (not conditional)
- [ ] Completes within 2.5-6 seconds
- [ ] Token consumption is 17-25K (check if available)

#### Test Simple Mode in CI/CD Context

Set environment variable and test:

```bash
export CI=true
```

Then request:
```
"Review infrastructure/prod/database.tf"
```

**Expected**:
- ✅ Simple Mode used despite "prod" in path
- ✅ CI/CD environment overrides file path detection
- ✅ Fast feedback suitable for pipelines
- ✅ No interactive context gathering

**Verify**:
- [ ] Simple Mode selected (not Context-Aware)
- [ ] Reason stated: "CI/CD environment"
- [ ] Completes quickly (under 6 seconds)

### Test 2: Context-Aware Mode

**Purpose**: Verify conditional guidance based on gathered context.

#### Test Context-Aware Mode with Production File

```
"Review infrastructure/prod/database.tf"
```

**Expected Behavior**:
- ✅ Mode announced: "Context-Aware Mode (production environment)"
- ✅ Context questions asked (3-5 questions)
- ✅ Conditional recommendations based on answers
- ✅ Trade-off explanations for key decisions
- ✅ Cost impact analysis
- ✅ Alternative options with pros/cons
- ✅ Completes in 4-8 seconds

**Example Context Questions**:
```
📋 Context Questions:

1. What's your availability requirement?
   - 99.9% (43 minutes downtime/month)
   - 99.95% (22 minutes downtime/month)
   - 99.99% (4 minutes downtime/month)

2. What's your budget constraint?
   - Tight (minimize costs)
   - Moderate (balance cost and reliability)
   - Flexible (prioritize reliability)

3. What type of data does this database store?
   - Public data
   - Internal business data
   - Customer PII
   - Financial/health data
```

**Example Conditional Output**:
```
❌ HIGH RISK: Single-AZ RDS in production

Context-Specific Analysis:
FOR your requirements (99.9% SLA, customer PII, moderate budget):
  Multi-AZ is REQUIRED

Trade-Off Analysis:
  Single-AZ Risks:
    - AZ failure = 30-60 min recovery (violates SLA)
    - Unacceptable for customer PII
  
  Multi-AZ Benefits:
    - Automatic failover (1-2 min)
    - Meets 99.9% SLA requirement
    - Cost: +$73/month (acceptable for moderate budget)

Recommendation: Enable Multi-AZ immediately
```

**Verify**:
- [ ] Mode is announced with reason
- [ ] 3-5 context questions asked
- [ ] Questions are relevant and clear
- [ ] Recommendations change based on answers
- [ ] Trade-offs include specific numbers (cost, time)
- [ ] "FOR your requirements" language used
- [ ] Completes within 4-8 seconds
- [ ] Token consumption is 35-50K

#### Test Context Preservation

After answering context questions, ask a follow-up:

```
"Now review infrastructure/prod/cache.tf"
```

**Expected**:
- ✅ Context is preserved (no re-asking same questions)
- ✅ Previous answers applied to new review
- ✅ Can update context if needed

**Verify**:
- [ ] Same context questions NOT asked again
- [ ] Previous context applied to new file
- [ ] Option to update context if needed

### Test 3: Full Analysis Mode

**Purpose**: Verify comprehensive analysis with decision matrices and scenarios.

#### Test Full Analysis Mode Explicitly

```
"I need a full analysis of infrastructure/prod/cache.tf with all trade-offs and cost comparisons"
```

**Expected Behavior**:
- ✅ Mode announced: "Full Analysis Mode - Comprehensive Review"
- ✅ Loading message: "Loading decision matrices and scenarios..."
- ✅ Comprehensive context gathering (8-10 questions)
- ✅ Decision matrix comparing multiple options
- ✅ Multi-pillar impact analysis
- ✅ Quantitative cost-benefit analysis
- ✅ Trade-off scenarios for different contexts
- ✅ Implementation roadmap
- ✅ Complete code examples
- ✅ Completes in 5-10 seconds

**Example Decision Matrix**:
```
📊 DECISION MATRIX: Caching Architecture Options

| Option | Reliability | Performance | Cost/Month | Complexity | Best For |
|--------|------------|-------------|------------|------------|----------|
| Single Node | ⭐⭐ | ⭐⭐⭐ | $15 | ⭐⭐⭐⭐⭐ | Dev/Test |
| Redis Cluster | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $180 | ⭐⭐⭐ | Production |
| Cluster + Replicas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $360 | ⭐⭐⭐ | High-traffic |
```

**Example Multi-Pillar Analysis**:
```
🎭 MULTI-PILLAR IMPACT ANALYSIS:

┌─────────────────────────────────────────────────────────────────┐
│ Pillar                  │ Current │ Recommended │ Impact        │
├─────────────────────────┼─────────┼─────────────┼───────────────┤
│ Reliability             │ ⭐⭐     │ ⭐⭐⭐⭐⭐      │ +HIGH         │
│ Performance Efficiency  │ ⭐⭐     │ ⭐⭐⭐⭐⭐      │ +HIGH         │
│ Cost Optimization       │ ⭐⭐⭐⭐⭐  │ ⭐⭐⭐        │ -MEDIUM       │
└─────────────────────────────────────────────────────────────────┘
```

**Example Cost-Benefit Analysis**:
```
💰 COST-BENEFIT ANALYSIS:

Current State: $15/month, 99.5% availability
Recommended State: $360/month, 99.95% availability

Net Benefit Analysis:
├─ Additional cost: +$345/month
├─ Risk reduction: -$7,267/month (downtime prevention)
├─ Net benefit: $6,922/month
└─ ROI: 2,005% (20x return)
```

**Verify**:
- [ ] Mode announced with "Full Analysis"
- [ ] Loading message appears
- [ ] 8-10 comprehensive context questions
- [ ] Decision matrix with 3+ options
- [ ] Multi-pillar impact table
- [ ] Quantitative cost-benefit analysis
- [ ] Trade-off scenarios (3+ scenarios)
- [ ] Implementation roadmap included
- [ ] Complete code examples provided
- [ ] Completes within 5-10 seconds
- [ ] Token consumption is 70-95K

### Test 4: Automatic Mode Detection

**Purpose**: Verify the power automatically selects the appropriate mode based on context.

#### Test Detection Priority Order

The power uses this priority order (highest to lowest):
1. Explicit user request (Priority 100)
2. CI/CD environment (Priority 90)
3. File path (dev/prod/staging) (Priority 50)
4. Session type (interactive) (Priority 30)
5. Default fallback (Priority 0)

#### Test 4.1: Development File Path Detection

```
"Review infrastructure/dev/api-gateway.tf"
```

**Expected**:
- ✅ Simple Mode selected
- ✅ Reason: "development environment"
- ✅ Announcement: "I'll do a quick review since this is a development environment file"

**Verify**:
- [ ] Simple Mode used
- [ ] Detection reason stated
- [ ] File path "/dev/" triggered detection

#### Test 4.2: Production File Path Detection

```
"Review infrastructure/prod/load-balancer.tf"
```

**Expected**:
- ✅ Context-Aware Mode selected
- ✅ Reason: "production environment"
- ✅ Announcement: "I notice this is a production file. I'll gather some context..."

**Verify**:
- [ ] Context-Aware Mode used
- [ ] Detection reason stated
- [ ] File path "/prod/" triggered detection

#### Test 4.3: Staging File Path Detection

```
"Review infrastructure/staging/ecs-cluster.tf"
```

**Expected**:
- ✅ Context-Aware Mode selected
- ✅ Reason: "staging environment"
- ✅ Context questions asked

**Verify**:
- [ ] Context-Aware Mode used
- [ ] File path "/staging/" triggered detection

#### Test 4.4: CI/CD Environment Override

Set CI environment variable:
```bash
export CI=true
export GITHUB_ACTIONS=true
```

Then:
```
"Review infrastructure/prod/critical-database.tf"
```

**Expected**:
- ✅ Simple Mode selected (despite "prod" in path)
- ✅ Reason: "CI/CD environment"
- ✅ Explanation: "Running in CI/CD mode for fast feedback"

**Verify**:
- [ ] Simple Mode used (not Context-Aware)
- [ ] CI/CD detection overrides file path
- [ ] Fast completion suitable for pipelines

#### Test 4.5: Multiple Files with Mixed Paths

```
"Review infrastructure/dev/lambda.py and infrastructure/prod/lambda.tf"
```

**Expected**:
- ✅ Context-Aware Mode selected
- ✅ Reason: "production file detected"
- ✅ Explanation: "Using Context-Aware Mode since production files are present"

**Verify**:
- [ ] Context-Aware Mode used (higher priority)
- [ ] Production file takes precedence over dev file

### Test 5: Explicit Mode Override

**Purpose**: Verify users can explicitly request a specific mode, overriding automatic detection.

#### Test 5.1: Override to Simple Mode

```
"Quick review of infrastructure/prod/s3-bucket.tf"
```

**Expected**:
- ✅ Simple Mode used (despite "prod" in path)
- ✅ Override detected and announced
- ✅ Explanation: "User requested: Simple Mode ('quick review')"

**Verify**:
- [ ] Simple Mode used
- [ ] Override reason stated
- [ ] "quick review" keyword triggered override

**Other keywords to test**:
- "quick review"
- "simple review"
- "fast check"
- "quick scan"
- "rapid review"

#### Test 5.2: Override to Full Analysis Mode

```
"I need a full analysis of infrastructure/dev/vpc.tf with all trade-offs"
```

**Expected**:
- ✅ Full Analysis Mode used (despite "dev" in path)
- ✅ Override detected and announced
- ✅ Explanation: "User requested: Full Analysis Mode ('full analysis')"

**Verify**:
- [ ] Full Analysis Mode used
- [ ] Override reason stated
- [ ] "full analysis" keyword triggered override

**Other keywords to test**:
- "full analysis"
- "comprehensive review"
- "trade-off analysis"
- "detailed analysis"
- "compare options"

#### Test 5.3: Override to Context-Aware Mode

```
"Review infrastructure/dev/database.tf with context and explain trade-offs"
```

**Expected**:
- ✅ Context-Aware Mode used (despite "dev" in path)
- ✅ Override detected and announced
- ✅ Context questions asked

**Verify**:
- [ ] Context-Aware Mode used
- [ ] "explain trade-offs" triggered override

**Other keywords to test**:
- "context-aware review"
- "review with context"
- "explain trade-offs"
- "conditional guidance"

### Test 6: Mode Switching Mid-Session

**Purpose**: Verify users can switch modes during a review session while preserving context.

#### Test 6.1: Escalate from Simple to Context-Aware

**Step 1**: Start with Simple Mode
```
"Quick review of infrastructure/prod/database.tf"
```

**Expected**: Simple Mode output with prescriptive recommendations.

**Step 2**: Request more detail
```
"Why is Multi-AZ high risk? What are the trade-offs?"
```

**Expected**:
- ✅ Mode switch detected
- ✅ Announcement: "Switching to Context-Aware Mode"
- ✅ Context preservation message
- ✅ Context questions asked
- ✅ Trade-off analysis provided
- ✅ Previous findings referenced

**Example Switch Message**:
```
🔄 Mode Switch Detected
Current mode: Simple Mode
User asked: "What are the trade-offs?"
Switching to: Context-Aware Mode

Preserving context:
✅ Previous findings (Single-AZ, storage type)
✅ File being reviewed (database.tf)
✅ Environment detected (production)

Gathering additional context for trade-off analysis...
```

**Verify**:
- [ ] Mode switch announced
- [ ] Reason for switch stated
- [ ] Context preservation confirmed
- [ ] Previous findings NOT re-analyzed
- [ ] Context questions asked
- [ ] Trade-off analysis provided

#### Test 6.2: Escalate from Context-Aware to Full Analysis

**Step 1**: Start with Context-Aware Mode
```
"Review infrastructure/prod/cache.tf"
```

**Expected**: Context-Aware Mode with conditional recommendations.

**Step 2**: Request comprehensive analysis
```
"Can you do a full analysis with cost comparison and decision matrix?"
```

**Expected**:
- ✅ Mode switch to Full Analysis
- ✅ Context preserved (no re-asking)
- ✅ Decision matrices loaded
- ✅ Comprehensive analysis provided

**Verify**:
- [ ] Mode switch announced
- [ ] Previous context preserved
- [ ] Decision matrix appears
- [ ] Cost-benefit analysis included
- [ ] Multi-pillar impact analysis included

#### Test 6.3: Simplify from Full Analysis to Simple

**Step 1**: Start with Full Analysis
```
"Full analysis of infrastructure/prod/lambda.tf"
```

**Expected**: Comprehensive Full Analysis output.

**Step 2**: Request quick check of another file
```
"Now quick check infrastructure/prod/api-gateway.tf"
```

**Expected**:
- ✅ Mode switch to Simple Mode
- ✅ Fast prescriptive recommendations
- ✅ No context questions (already gathered)

**Verify**:
- [ ] Mode switch announced
- [ ] Simple Mode used for new file
- [ ] Previous context available if needed

#### Test 6.4: Context Preservation Across Switches

After switching modes, verify context is preserved:

```
"What was my availability requirement again?"
```

**Expected**:
- ✅ Kiro recalls previous context
- ✅ No need to re-answer questions
- ✅ Context available across all modes

**Verify**:
- [ ] Context recalled correctly
- [ ] No re-asking of questions
- [ ] Context applies to subsequent reviews

### Test 7: Performance Verification

**Purpose**: Verify each mode meets its performance targets.

#### Test 7.1: Measure Latency

For each mode, measure completion time:

**Simple Mode**:
```
"Quick review of infrastructure/dev/lambda.tf"
```
- **Target**: 2.5-6 seconds
- **Actual**: _____ seconds
- **Pass/Fail**: _____

**Context-Aware Mode**:
```
"Review infrastructure/prod/database.tf"
```
- **Target**: 4-8 seconds
- **Actual**: _____ seconds
- **Pass/Fail**: _____

**Full Analysis Mode**:
```
"Full analysis of infrastructure/prod/cache.tf"
```
- **Target**: 5-10 seconds
- **Actual**: _____ seconds
- **Pass/Fail**: _____

**Verify**:
- [ ] Simple Mode completes in 2.5-6s
- [ ] Context-Aware Mode completes in 4-8s
- [ ] Full Analysis Mode completes in 5-10s

#### Test 7.2: Verify Token Consumption (if available)

If token usage is visible, verify consumption:

**Simple Mode**:
- **Target**: 17-25K tokens
- **Actual**: _____ tokens
- **Pass/Fail**: _____

**Context-Aware Mode**:
- **Target**: 35-50K tokens
- **Actual**: _____ tokens
- **Pass/Fail**: _____

**Full Analysis Mode**:
- **Target**: 70-95K tokens
- **Actual**: _____ tokens
- **Pass/Fail**: _____

**Verify**:
- [ ] Simple Mode uses 17-25K tokens
- [ ] Context-Aware Mode uses 35-50K tokens
- [ ] Full Analysis Mode uses 70-95K tokens

#### Test 7.3: Cost Comparison

Calculate approximate cost per review (assuming GPT-4 pricing: $0.03/1K input, $0.06/1K output):

**Simple Mode**: ~$0.90 per review
**Context-Aware Mode**: ~$1.86 per review
**Full Analysis Mode**: ~$3.66 per review

**Verify**:
- [ ] Simple Mode is ~10x cheaper than Full Analysis
- [ ] Cost scales appropriately with mode depth

### Test 8: Expected Behavior Documentation

**Purpose**: Verify each mode behaves as documented.

#### Simple Mode Expected Behavior Checklist

- [ ] No context questions asked
- [ ] Prescriptive recommendations (not conditional)
- [ ] Direct issue identification
- [ ] Specific line numbers provided
- [ ] Clear remediation steps
- [ ] No trade-off discussions
- [ ] No cost-benefit analysis
- [ ] No decision matrices
- [ ] Fast completion (2.5-6s)
- [ ] Suitable for CI/CD
- [ ] Works in non-interactive sessions

#### Context-Aware Mode Expected Behavior Checklist

- [ ] 3-5 context questions asked
- [ ] Conditional recommendations ("FOR your requirements...")
- [ ] Trade-off explanations with numbers
- [ ] Cost impact analysis
- [ ] Alternative options with pros/cons
- [ ] Environment-specific guidance
- [ ] Context preserved across reviews
- [ ] Moderate completion time (4-8s)
- [ ] Suitable for interactive sessions
- [ ] Requires user interaction

#### Full Analysis Mode Expected Behavior Checklist

- [ ] 8-10 comprehensive context questions
- [ ] Decision matrix with 3+ options
- [ ] Multi-pillar impact analysis
- [ ] Quantitative cost-benefit analysis
- [ ] Trade-off scenarios (3+ scenarios)
- [ ] Implementation roadmap
- [ ] Complete code examples
- [ ] Detailed explanations
- [ ] Longer completion time (5-10s)
- [ ] Opt-in only (not automatic)
- [ ] Comprehensive documentation

### Troubleshooting Mode Issues

#### Issue: Wrong Mode Detected

**Symptoms**: Simple Mode used when Context-Aware expected, or vice versa.

**Solutions**:
1. Check file path contains "dev/", "prod/", or "staging/"
2. Verify CI environment variables (CI=true forces Simple Mode)
3. Use explicit mode request ("quick review" or "full analysis")
4. Check if custom detection rules are configured

**Test**:
```
"Why did you use Simple Mode for this production file?"
```

**Expected**: Kiro explains detection logic and reason.

#### Issue: Mode Too Slow

**Symptoms**: Review takes longer than expected, CI/CD times out.

**Solutions**:
1. Use Simple Mode explicitly: "quick review"
2. Verify not in Full Analysis Mode unintentionally
3. Check network latency to MCP servers
4. Reduce scope: review specific files, not entire directory

**Test**:
```
"Quick review of infrastructure/prod/database.tf"
```

**Expected**: Completes in under 6 seconds.

#### Issue: Mode Too Shallow

**Symptoms**: Not enough detail, missing trade-offs, no context questions.

**Solutions**:
1. Use Context-Aware or Full Analysis explicitly
2. Ask follow-up: "What are the trade-offs?"
3. Provide context upfront: "This is production with 99.9% SLA"
4. Request specific analysis: "Compare Multi-AZ vs Single-AZ"

**Test**:
```
"I need more detail on this recommendation. What are the trade-offs?"
```

**Expected**: Mode escalates to Context-Aware or Full Analysis.

#### Issue: Context Questions Annoying

**Symptoms**: Too many questions, slows down workflow.

**Solutions**:
1. Use Simple Mode for quick checks
2. Provide context upfront to skip questions
3. Answer once per session (context is preserved)
4. Use CI/CD mode for automated checks

**Test**:
```
"Quick review without context questions"
```

**Expected**: Simple Mode used, no questions asked.

#### Issue: Mode Switch Not Working

**Symptoms**: Mode doesn't change when requested.

**Solutions**:
1. Use explicit keywords: "quick review", "full analysis"
2. Ask directly: "Switch to Context-Aware Mode"
3. Verify mode switching is supported
4. Check if mode is disabled in configuration

**Test**:
```
"Switch to Full Analysis Mode for this review"
```

**Expected**: Mode switches and announces change.

### Mode Testing Success Criteria

Your mode implementation is working correctly if:

- ✅ All three modes are available and functional
- ✅ Automatic detection works based on file path and environment
- ✅ Explicit overrides work with keywords
- ✅ Mode switching preserves context
- ✅ Performance targets are met (latency, tokens)
- ✅ Simple Mode: Fast, prescriptive, no context questions
- ✅ Context-Aware Mode: Conditional, trade-offs, 3-5 questions
- ✅ Full Analysis Mode: Comprehensive, matrices, 8-10 questions
- ✅ CI/CD uses Simple Mode automatically
- ✅ Production files use Context-Aware Mode by default
- ✅ Development files use Simple Mode by default
- ✅ Mode selection is announced and explained
- ✅ Context is preserved across mode switches
- ✅ Token consumption matches targets
- ✅ Cost scales appropriately with mode depth

## Step 11: Performance Testing (Optional)

### Test Review Speed

Time how long reviews take:

```
"Quick review - top 3 critical issues only"
```

**Expected**: Should complete in under 30 seconds for small files.

### Test Large File Handling

Test with larger IaC files (100+ resources):

```
"Review this large Terraform configuration"
```

**Expected**:
- Handles large files without errors
- Provides comprehensive findings
- Completes in reasonable time (under 2 minutes)

## Troubleshooting Test Failures

### Power Not Recognized

**Issue**: Power doesn't appear in list

**Solutions**:
1. Verify installation path
2. Check `POWER.md` frontmatter
3. Restart Kiro
4. Check logs for errors

### No Issues Found in Example Files

**Issue**: Example files don't trigger findings

**Solutions**:
1. Verify you're using the correct example files (`*-issues.tf`, not `*-issues-fixed.tf`)
2. Check that MCP servers are configured (some checks require them)
3. Request specific pillar reviews
4. Enable learning mode for detailed explanations

### Hooks Not Triggering

**Issue**: Installed hooks don't activate

**Solutions**:
1. Verify hook file location (`~/.kiro/hooks/`)
2. Check file patterns match your files
3. Ensure hook doesn't have `.disabled` extension
4. Restart Kiro
5. Check file permissions

### MCP Server Errors

**Issue**: Errors about MCP servers

**Solutions**:
1. The power works without MCP servers (graceful degradation)
2. Configure MCP servers in `~/.kiro/settings/mcp.json` for enhanced features
3. Check AWS credentials if using Security Assessment
4. Verify network connectivity

## Success Criteria

Your power is working correctly if:

- ✅ Power is recognized and activates
- ✅ Example files trigger expected findings
- ✅ All six pillars provide guidance
- ✅ Code generation includes best practices
- ✅ Reports generate in multiple formats
- ✅ Hooks work (if installed)
- ✅ Context gathering works correctly
- ✅ Recommendations adapt based on context
- ✅ Trade-off explanations are clear and quantitative
- ✅ Decision matrices are comprehensive
- ✅ Scenario guidance matches constraints
- ✅ **Simple Mode: Fast (2.5-6s), prescriptive, no context questions**
- ✅ **Context-Aware Mode: Moderate speed (4-8s), conditional, 3-5 questions**
- ✅ **Full Analysis Mode: Comprehensive (5-10s), matrices, 8-10 questions**
- ✅ **Automatic mode detection works based on file path and environment**
- ✅ **Explicit mode overrides work with keywords**
- ✅ **Mode switching preserves context**
- ✅ **Performance targets met (latency and token consumption)**
- ✅ Provides actionable, valuable recommendations
- ✅ Works with and without MCP servers

## Next Steps

Once testing is complete:

1. **Use with Real Projects**: Apply to your actual infrastructure
2. **Customize Configuration**: Adjust for your organization's needs
3. **Install Hooks**: Automate reviews in your workflow
4. **Share with Team**: Onboard team members
5. **Provide Feedback**: Report issues or suggest improvements

## Getting Help

If tests fail or you encounter issues:

1. Check [QUICKSTART.md](QUICKSTART.md) for setup guidance
2. Review [README.md](README.md) troubleshooting section
3. Check [hooks/README.md](hooks/README.md) for hook issues
4. Review Kiro logs: `~/.kiro/logs/kiro.log`
5. Open an issue with test results and error messages

---

**Total Testing Time**: 30-50 minutes (depending on optional tests)

**Expected Outcome**: Confidence that the power works correctly, provides context-aware guidance with appropriate mode selection, and delivers value for your AWS infrastructure development.
