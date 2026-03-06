# Changelog

All notable changes to the AWS Well-Architected Power will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - TBD

### Changed - Steering Files Optimization

Major reduction in steering file size and addition of conditional inclusion for better performance.

#### Conditional Inclusion
- All 11 steering files now use `inclusion: fileMatch` front matter
- Files only load when relevant file types are open (IaC, application code)
- Prevents loading ~25K lines of guidance into every conversation

#### File Consolidation
- Merged 5 standalone application code files into their parent pillar files
- Reduced from 17 steering files to 11 (removed `security-application-code.md`, `reliability-application-code.md`, `cost-optimization-application-code.md`, `operational-excellence-application-code.md`, `performance-application-code.md`)

#### Content Optimization
- Trimmed pillar files from ~2,500-3,300 lines each to ~95-150 lines (checklists + key patterns + anti-pattern tables)
- Trimmed utility files (context-questions, trade-off-guidance, review-mode-selection, proactive-review, code-generation-guidance) to essentials
- Moved full code templates to `examples/` directory (steering files now reference examples)
- Total steering: 1,095 lines (down from ~25,000 — 96% reduction)

#### Examples Optimization
- Trimmed `mode-selection-examples.md` from 1,549 to 123 lines (one scenario across all 3 modes, auto-detection table, comparison)
- Trimmed `trade-off-scenarios.md` from 1,179 to 116 lines (all 6 scenarios as compact tables with key trade-offs)
- Trimmed `decision-matrices.md` from 931 to 131 lines (all 6 matrices as tables with decision rules)
- Trimmed `examples/README.md` from 221 to 39 lines (removed duplicated expected findings)
- Total examples: 8,101 lines (down from ~11,600 — 30% reduction)
- IaC example files (.tf, .yaml, .ts, .py, .java) unchanged

#### Hooks Optimization
- Trimmed `hooks/file-save.md` from 270 to ~45 lines (essential config + customization only)
- Trimmed `hooks/post-generation.md` from 432 to ~35 lines
- Trimmed `hooks/pre-deployment.md` from 370 to ~35 lines
- Trimmed `hooks/README.md` from 414 to ~30 lines
- Removed bloated use cases, troubleshooting, and best practices filler
- Total hooks: ~145 lines (down from ~1,486 — 90% reduction)

#### POWER.md Optimization
- Trimmed POWER.md from 1,045 to ~120 lines
- Consolidated into essential sections: overview, review modes, MCP servers, file types, steering files, hooks, examples, getting started

## [2.0.0] - TBD

### Added - Context-Aware Trade-Off Guidance

This major release transforms the power from prescriptive guidance to context-aware decision support, helping you make informed architecture decisions based on your specific situation.

#### Context Gathering
- **Context question templates** for environment type, availability requirements, budget constraints, and data classification
- **Automatic context inference** from file paths (e.g., `dev/`, `prod/`, `staging/`)
- **Context validation** with warnings for missing critical information
- **Session-based context storage** for consistent recommendations throughout a review

#### Conditional Guidance
- **Environment-specific recommendations**: Different guidance for development, staging, and production
- **SLA-aware recommendations**: Multi-AZ required for 99.9%+ SLA, optional for dev/test
- **Budget-sensitive recommendations**: Right-sizing and cost optimization based on budget constraints
- **Data classification-aware recommendations**: Encryption requirements based on data sensitivity (PII, PHI, financial)
- **Compliance-aware recommendations**: Regulatory requirements (GDPR, HIPAA, PCI-DSS) drive security controls

#### Trade-Off Analysis
- **Quantitative trade-off explanations**: Specific cost impacts (e.g., "2x cost, $60/month")
- **What you gain vs. what you give up**: Clear benefit and cost analysis for each option
- **When to choose each option**: Context-based decision guidance
- **Business rationale**: Why recommendations make sense for your situation
- **Multiple option presentation**: Compare alternatives side-by-side

#### Decision Matrices
- **Multi-AZ vs. Single-AZ deployment** matrix with cost, availability, and recovery time
- **Encryption approach** matrix (SSE-S3, SSE-KMS, client-side) with compliance requirements
- **Instance sizing** matrix with cost vs. performance trade-offs
- **Caching strategy** matrix (ElastiCache, DAX, CloudFront, application-level)
- **Disaster recovery** matrix (backup, pilot light, warm standby, hot standby)
- **Database choice** matrix (RDS, Aurora, DynamoDB) with use case guidance

#### Common Scenarios
- **Startup MVP**: $110-150/month, rapid iteration, acceptable downtime
- **Enterprise Production**: $15k-30k/month, 99.99% SLA, compliance required
- **Prototype/POC**: $20-50/month, short-lived, minimal cost
- **Cost-Sensitive Production**: $2.5k-4k/month, balance cost and reliability
- **Performance-Critical**: $8k-18k/month, <100ms latency required
- **Regulated Industry**: $8k-30k/month, HIPAA/PCI-DSS compliance
- **Global Scale**: $25k-80k/month, multi-region, high availability
- **Internal Tools**: $500-2k/month, moderate availability, limited users

#### Updated Steering Files
- All six pillar steering files updated with context-aware guidance
- Trade-off templates for common architecture decisions
- Environment-specific guidance (dev vs. staging vs. production)
- Budget-sensitive recommendations with cost impact analysis

#### New Documentation
- `steering/context-questions.md`: Context gathering templates
- `steering/trade-off-guidance.md`: Trade-off analysis framework
- `examples/decision-matrices.md`: 6 comprehensive decision matrices
- `examples/trade-off-scenarios.md`: 8 detailed real-world scenarios
- Updated README.md with context-aware review examples
- Updated README.md highlighting trade-off capabilities

### Changed
- **Recommendations are now context-aware**: Same infrastructure reviewed differently based on environment, SLA, budget, and data classification
- **"Must-have" vs. "context-dependent" classification**: Security and compliance requirements are non-negotiable, other recommendations adapt to context
- **Quantitative estimates**: Cost impacts, availability improvements, and recovery times now include specific numbers
- **Business-focused rationale**: Recommendations explain business impact, not just technical benefits

### Migration Guide

**For existing users:**

The power now asks context questions before making recommendations. This is a **non-breaking change** - the power still works without context, but provides better guidance with it.

**What to expect:**
1. When requesting a review, Kiro may ask about your environment, SLA requirements, budget, and data classification
2. Recommendations will adapt based on your answers
3. Trade-offs will be explained with specific cost and benefit estimates
4. You can update context during a review if your situation changes

**Example:**
```
Before (v1.0.0):
"Your RDS instance should use Multi-AZ for high availability."

After (v2.0.0):
"For production with 99.9% SLA, Multi-AZ is REQUIRED (+$60/month, 99% → 99.95% availability).
For development with no SLA, Single-AZ is ACCEPTABLE (save $60/month, accept 1-2 hour recovery)."
```

**No action required** - the power automatically uses context-aware guidance. You can continue using it as before, and Kiro will ask for context when needed.

### Benefits

**Why this matters:**
- **Avoid over-engineering**: Don't pay for Multi-AZ in development environments
- **Avoid under-engineering**: Don't skip Multi-AZ in production with SLA commitments
- **Make informed decisions**: Understand what you gain and give up with each choice
- **Justify architecture decisions**: Business rationale for stakeholders and documentation
- **Learn architecture trade-offs**: Understand why recommendations differ by context

**Real-world impact:**
- Startup MVP: Save $500-1000/month by right-sizing for your stage
- Enterprise Production: Justify $15k-30k/month spend with business rationale
- Cost-Sensitive Production: Balance reliability and cost with data-driven decisions

## [1.0.0] - 2026-03-03

### Added
- Initial release of AWS Well-Architected Power
- Integration with AWS Security Assessment MCP Server for automated security checks
- Integration with AWS Knowledge MCP Server for documentation and best practices
- Comprehensive steering files for all six Well-Architected pillars:
  - Security
  - Reliability
  - Performance Efficiency
  - Cost Optimization
  - Operational Excellence
  - Sustainability
- Proactive review guidance for recognizing review opportunities
- Code generation guidance with built-in Well-Architected principles
- Optional hook templates for automated reviews:
  - File-save hook for IaC files
  - Pre-deployment hook for terraform/cdk commands
  - Post-generation hook for generated infrastructure code
- Example IaC files demonstrating Well-Architected issues and fixes:
  - Terraform examples
  - CloudFormation examples
  - CDK examples
- Example review sessions and reports in multiple formats (Markdown, JSON, HTML)
- Learning mode examples with detailed explanations and anti-patterns
- Quick start guide for getting started in under 5 minutes
- Comprehensive README with installation and usage instructions

### Documentation
- POWER.md with overview and usage guidance
- Pillar-specific steering files with best practices and patterns
- Hook templates with installation instructions
- Examples directory with real-world scenarios
- Quick start guide for rapid onboarding

### Features
- Multi-pillar coverage across all six Well-Architected pillars
- IaC analysis support for CloudFormation, Terraform, and CDK
- Context-aware file pattern recognition
- Graceful fallback when MCP servers unavailable
- Proactive suggestions during development workflows
- Well-Architected principles applied to code generation

[1.0.0]: https://github.com/your-org/aws-well-architected-power/releases/tag/v1.0.0
