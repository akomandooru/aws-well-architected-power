# Review Workflow Guide

This guide demonstrates the step-by-step workflow for conducting a Well-Architected Framework review using the AWS Well-Architected Power.

## Table of Contents

1. [Overview](#overview)
2. [Workflow Steps](#workflow-steps)
3. [Review Session Structure](#review-session-structure)
4. [Question Types](#question-types)
5. [Answering Questions](#answering-questions)
6. [Risk Assessment](#risk-assessment)
7. [Report Generation](#report-generation)
8. [Best Practices](#best-practices)

---

## Overview

The guided review workflow is an interactive process that helps you systematically evaluate your AWS architecture against Well-Architected Framework best practices. The workflow is designed to be:

- **Structured**: Follow a clear path through relevant questions
- **Flexible**: Skip questions and return to them later
- **Educational**: Learn best practices as you review
- **Actionable**: Get specific remediation guidance

---

## Workflow Steps

### Step 1: Initiate Review

Start a new review session by specifying:

- **Pillars to assess**: Select one or more of the six pillars
- **Focus areas**: Optionally specify areas like "web-application", "database", "compute"
- **Learning mode**: Enable for detailed explanations and examples
- **Custom questions**: Add organization-specific questions if needed

**Example Prompt:**
```
I want to conduct a Well-Architected review of my e-commerce application. 
Please focus on Security, Reliability, Performance Efficiency, and Cost Optimization pillars.
Enable learning mode so I can understand the rationale behind recommendations.
```

**Power Response:**
```
I'll guide you through a Well-Architected review focusing on:
- Security Pillar
- Reliability Pillar  
- Performance Efficiency Pillar
- Cost Optimization Pillar

Learning mode is enabled - I'll provide detailed explanations for each best practice.

We'll cover approximately 24 questions across these pillars. You can skip questions 
and return to them later. Let's start with the Security Pillar.
```

### Step 2: Answer Questions

The power presents questions one at a time or grouped by topic. For each question:

1. **Read the question** and understand what it's asking
2. **Provide your answer** describing your current implementation
3. **Include evidence** such as file references, configurations, or documentation
4. **Receive feedback** on alignment with best practices

**Example Question:**
```
Question 1 (Security): How do you protect your data at rest?

Best Practices:
- Encrypt all data at rest using AWS KMS or service-managed keys
- Use separate keys for different data classifications
- Implement key rotation policies
- Audit key usage with CloudTrail

Please describe how you currently protect data at rest in your application.
```

**Example Answer:**
```
We use AWS KMS for encryption of all data at rest:
- RDS databases: KMS encryption enabled with custom CMK
- S3 buckets: Default encryption configured with KMS
- EBS volumes: Encryption enabled for all volumes

Evidence:
- terraform/rds.tf - Lines 15-20 show KMS configuration
- terraform/s3.tf - Lines 8-12 show bucket encryption
- terraform/ec2.tf - Lines 25-28 show EBS encryption
```

**Power Feedback:**
```
✅ Aligned with Best Practices

Your implementation follows Well-Architected best practices:
- Using AWS KMS provides strong encryption with centralized key management
- Encrypting all storage services (RDS, S3, EBS) ensures comprehensive protection
- Custom CMK allows for key rotation and access control

Recommendation: Consider implementing separate KMS keys for different data 
classifications (e.g., customer data vs. application logs) to enable more 
granular access control.
```

### Step 3: Review Identified Issues

As you answer questions, the power identifies gaps and issues. Each issue includes:

- **Description**: What the issue is
- **Risk level**: High, Medium, or Low
- **Impact**: Potential consequences
- **Resource**: Specific resource affected (if applicable)
- **Location**: File and line number (for IaC analysis)
- **Remediation steps**: Specific actions to fix the issue

**Example Issue:**
```
⚠️ Issue Identified: IAM Policies Contain Wildcard Permissions

Risk Level: HIGH
Pillar: Security
Question: How do you manage access to AWS resources?

Description:
IAM policies contain wildcard permissions that violate the least privilege principle.

Resource: AWS::IAM::Role - app-execution-role
Location: terraform/iam.tf:15

Impact:
Potential for privilege escalation and unauthorized access to AWS resources.

Remediation Steps:
1. Review all IAM policies and identify wildcard permissions
2. Replace wildcards with specific resource ARNs
3. Implement separate roles for different application functions
4. Use IAM Access Analyzer to validate least privilege
5. Establish regular IAM policy review process
```

### Step 4: Track Documentation Gaps

The power identifies areas where documentation is missing or incomplete:

**Example Documentation Gap:**
```
📄 Documentation Gap Identified

Pillar: Security
Question: How do you manage access to AWS resources?
Priority: HIGH

Missing Information:
- IAM policy review process and schedule
- Least privilege implementation guidelines
- Access review procedures and frequency
- Policy approval workflow

Recommended Action:
Create a security operations runbook documenting IAM management procedures.

Suggested Template:
# IAM Management Procedures

## Policy Review Process
- Review frequency: Quarterly
- Review team: Security team + application owners
- Review checklist: [link to checklist]

## Least Privilege Guidelines
- Start with minimal permissions
- Add permissions based on actual needs
- Document permission justifications
- Use IAM Access Analyzer for validation

## Access Review
- Review all IAM users and roles quarterly
- Remove unused credentials
- Validate MFA enforcement
- Audit CloudTrail logs for suspicious activity
```

### Step 5: Skip and Resume

You can skip questions and return to them later:

**Skipping a Question:**
```
User: "I need to check with the database team before answering this. Can we skip it?"

Power: "No problem! I've marked this question as skipped. We can return to it later.

Skipped Questions: 1
- Question 5 (Reliability): How do you back up data?

Would you like to continue with the next question or return to skipped questions?"
```

**Returning to Skipped Questions:**
```
User: "Let's go back to the skipped questions."

Power: "Great! Let's return to the skipped questions.

Question 5 (Reliability): How do you back up data?
[Question details...]"
```

### Step 6: Save Progress

You can save your progress and resume later:

**Saving:**
```
User: "I need to stop for now. Can we save this review?"

Power: "I'll save your progress.

Review Session Saved:
- Session ID: review-2024-01-15-webapp
- Progress: 15/24 questions answered (62%)
- Skipped: 2 questions
- Issues identified: 3

You can resume this review anytime by providing the session ID."
```

**Resuming:**
```
User: "I want to resume review session review-2024-01-15-webapp"

Power: "Welcome back! Resuming your review session.

Session: review-2024-01-15-webapp
Progress: 15/24 questions answered (62%)
Remaining: 9 questions
Skipped: 2 questions

Would you like to:
1. Continue with the next question
2. Return to skipped questions
3. Review current findings"
```

### Step 7: Generate Report

Once all questions are answered, generate a comprehensive report:

**Report Generation:**
```
User: "All questions are answered. Please generate the report."

Power: "Excellent! I'll generate your Well-Architected review report.

Report Options:
1. Markdown (.md) - Human-readable format for documentation
2. JSON (.json) - Machine-readable format for automation
3. HTML (.html) - Formatted report for sharing with stakeholders

Which format would you like? (You can generate multiple formats)"
```

**Report Contents:**
- Executive summary with key findings
- Pillar scores and risk profile
- Detailed findings by pillar
- Strengths and issues identified
- Documentation gaps
- Remediation roadmap with priorities
- Next steps and recommendations

---

## Review Session Structure

A review session is stored as a JSON object with the following structure:

```json
{
  "id": "unique-session-id",
  "config": {
    "pillars": ["security", "reliability"],
    "focusAreas": ["web-application"],
    "learningMode": true,
    "customQuestions": []
  },
  "startTime": "2024-01-15T10:30:00Z",
  "lastUpdated": "2024-01-15T11:45:00Z",
  "progress": {
    "totalQuestions": 24,
    "answeredQuestions": 20,
    "skippedQuestions": 2,
    "completionPercentage": 83
  },
  "answers": {
    "question-id": {
      "questionId": "question-id",
      "question": "Question text",
      "response": "User's answer",
      "evidence": ["file references"],
      "timestamp": "2024-01-15T10:35:00Z",
      "alignment": "aligned|partial|not-aligned"
    }
  },
  "issues": [],
  "documentationGaps": [],
  "metadata": {}
}
```

---

## Question Types

### 1. Implementation Questions

Ask about current implementation:

**Example:**
```
How do you protect your data at rest?
How do you design your workload to withstand component failures?
How do you select appropriate resource types and sizes?
```

### 2. Process Questions

Ask about procedures and practices:

**Example:**
```
How do you manage access to AWS resources?
How do you monitor usage and cost?
How do you govern usage?
```

### 3. Architecture Questions

Ask about design decisions:

**Example:**
```
How do you design your workload to adapt to changes in demand?
How do you implement change management?
How do you use caching to improve performance?
```

---

## Answering Questions

### Good Answer Structure

A good answer includes:

1. **Current implementation**: What you're doing now
2. **Evidence**: Where to find proof (files, configs, docs)
3. **Context**: Why you made these choices (optional)

**Example Good Answer:**
```
We implement multi-AZ deployment for high availability:

Implementation:
- Application deployed across 3 availability zones (us-east-1a, 1b, 1c)
- Auto Scaling Group configured with min 3, max 12 instances
- Application Load Balancer distributes traffic across AZs
- RDS Multi-AZ deployment for database failover

Evidence:
- terraform/asg.tf - Lines 10-25 show ASG configuration
- terraform/alb.tf - Lines 5-15 show ALB setup
- terraform/rds.tf - Lines 30-35 show Multi-AZ enabled

Context:
We chose 3 AZs to balance availability with cost. Our SLA requires 99.9% uptime,
which this architecture supports.
```

### Incomplete Answer

If your answer lacks detail, the power will ask follow-up questions:

**Example:**
```
User: "We use encryption."

Power: "Thanks for confirming you use encryption. To provide better guidance, 
I need more details:

1. What services are encrypted? (RDS, S3, EBS, etc.)
2. What encryption method? (AWS KMS, service-managed keys, client-side)
3. Are encryption keys rotated?
4. Where can I find the encryption configuration in your code?"
```

### "I Don't Know" Answers

It's okay to not know the answer:

**Example:**
```
User: "I'm not sure how our backup strategy works."

Power: "No problem! This indicates a documentation gap. I'll note this and 
recommend creating backup documentation.

Documentation Gap Identified:
- Backup and recovery procedures
- RTO and RPO requirements
- Disaster recovery plan

Would you like me to provide a template for backup documentation?"
```

---

## Risk Assessment

Each issue is assigned a risk level based on:

### High Risk
- **Impact**: Severe consequences (data loss, security breach, major outage)
- **Likelihood**: Likely to occur
- **Examples**: 
  - Wildcard IAM permissions
  - No encryption for sensitive data
  - Single point of failure in critical path

### Medium Risk
- **Impact**: Moderate consequences (performance degradation, increased costs)
- **Likelihood**: Possible but not certain
- **Examples**:
  - Missing backups for non-critical data
  - Inefficient resource sizing
  - Incomplete monitoring

### Low Risk
- **Impact**: Minor consequences (slight inefficiency, minor cost increase)
- **Likelihood**: Unlikely to cause problems
- **Examples**:
  - Manual processes that could be automated
  - Missing documentation for well-understood systems
  - Optimization opportunities

---

## Report Generation

### Markdown Report

Best for:
- Documentation repositories
- README files
- Wiki pages
- Version control

Features:
- Human-readable format
- Easy to edit and update
- Works with Git
- Supports code blocks and formatting

### JSON Report

Best for:
- Automation and CI/CD pipelines
- Integration with other tools
- Programmatic analysis
- Data processing

Features:
- Machine-readable format
- Structured data
- Easy to parse
- Supports automation

### HTML Report

Best for:
- Sharing with stakeholders
- Executive presentations
- Email distribution
- Printing

Features:
- Professional formatting
- Visual design
- Charts and tables
- Print-friendly

---

## Best Practices

### Before Starting

1. **Gather context**: Have your IaC files, architecture diagrams, and documentation ready
2. **Allocate time**: Plan for 1-2 hours for a comprehensive review
3. **Involve team**: Include relevant team members (security, ops, dev)
4. **Set scope**: Choose pillars relevant to your current priorities

### During Review

1. **Be honest**: Accurate answers lead to better recommendations
2. **Provide evidence**: Reference specific files and configurations
3. **Ask questions**: Use learning mode to understand best practices
4. **Take notes**: Document decisions and rationale
5. **Skip when needed**: Don't guess - skip and gather information

### After Review

1. **Share findings**: Distribute report to stakeholders
2. **Prioritize remediation**: Focus on high-risk issues first
3. **Create tickets**: Track remediation work in your project management tool
4. **Update documentation**: Address identified documentation gaps
5. **Schedule follow-up**: Plan next review in 3-6 months

### Continuous Improvement

1. **Integrate into workflow**: Use hooks for automated reviews
2. **Review before deployment**: Check IaC changes before applying
3. **Learn from issues**: Use findings to improve development practices
4. **Track progress**: Compare reviews over time to measure improvement
5. **Share knowledge**: Use learning mode to educate team members

---

## Example Workflow Timeline

### Initial Review (2 hours)

- **0:00-0:15**: Setup and scope definition
- **0:15-1:30**: Answer questions (24 questions, ~3 min each)
- **1:30-1:45**: Review identified issues
- **1:45-2:00**: Generate and review report

### Follow-up Review (1 hour)

- **0:00-0:10**: Review previous findings
- **0:10-0:40**: Answer new/changed questions
- **0:40-0:50**: Compare with previous review
- **0:50-1:00**: Generate updated report

### Quick Check (15 minutes)

- **0:00-0:05**: Focus on specific pillar or component
- **0:05-0:12**: Answer targeted questions
- **0:12-0:15**: Review findings

---

## Troubleshooting

### "I can't find the information to answer this question"

**Solution**: Mark it as a documentation gap and skip the question. The power will recommend creating documentation.

### "The question doesn't apply to my architecture"

**Solution**: Explain why it doesn't apply. The power will note this and move on.

### "I disagree with the risk assessment"

**Solution**: Provide your reasoning. Risk levels can be adjusted based on your specific context and risk tolerance.

### "The remediation steps are too complex"

**Solution**: Ask for a phased approach or alternative solutions. The power can break down complex remediations into smaller steps.

### "I need to involve other teams"

**Solution**: Save the session and resume later. Share specific questions with relevant teams before continuing.

---

## Next Steps

1. **Try the example**: Review the example session and reports in this directory
2. **Start your review**: Initiate a review for your own project
3. **Explore learning mode**: Enable learning mode to deepen your understanding
4. **Set up hooks**: Install optional hooks for continuous reviews
5. **Share feedback**: Help improve the power by sharing your experience

---

## Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [Pillar Whitepapers](https://aws.amazon.com/architecture/well-architected/#Whitepapers)
- [AWS Architecture Center](https://aws.amazon.com/architecture/)

---

**Document Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Power Version**: 1.0.0
