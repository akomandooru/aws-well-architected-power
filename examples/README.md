# AWS Well-Architected Power Examples

Examples for testing, learning, and understanding the AWS Well-Architected Power.

## Directory Structure

```
examples/
├── test-manifest.json          # Expected findings for automated validation
├── mode-selection-examples.md  # Review mode comparison (Simple, Context-Aware, Full Analysis)
├── trade-off-scenarios.md      # 6 real-world scenarios (Startup MVP → Enterprise)
├── decision-matrices.md        # 6 decision matrices (Multi-AZ, encryption, caching, DR, etc.)
├── terraform/                  # Security issues and fixes (.tf)
├── cloudformation/             # Reliability issues and fixes (.yaml)
├── cdk/                        # Cost optimization issues and fixes (.ts)
├── application-code/           # Python, Java, TypeScript issues and fixes
├── learning/                   # Educational examples with explanations per pillar
└── reviews/                    # Complete review sessions, reports, and workflow guide
```

## Quick Start

### Automated Validation

Install the `validate-examples` hook from `hooks/validate-examples.md`, then trigger it from the Agent Hooks panel. It reviews all 6 `-issues` files and reports which expected findings were detected. See [test-manifest.json](test-manifest.json) for the test cases.

### Manual Testing

Open any issue file and ask Kiro to review it:

```
"Review this infrastructure code against AWS Well-Architected best practices"
```

Try these:
- `terraform/security-issues.tf` — unencrypted S3, overly permissive IAM, public RDS
- `cloudformation/reliability-issues.yaml` — single-AZ, no backups, no auto-scaling
- `cdk/cost-optimization-issues.ts` — over-provisioned, no lifecycle policies, no tags
- `application-code/python-lambda-issues.py` — hardcoded secrets, no error handling

Then compare with the `-fixed` versions to see best practices applied.

### Understand Review Modes

See [mode-selection-examples.md](mode-selection-examples.md) — same Lambda config reviewed in all 3 modes with sample outputs.

### Learn Best Practices

The `learning/` directory has educational examples per pillar with explanations, anti-patterns, and rationale. See [learning/README.md](learning/README.md).

### See Full Review Workflow

The `reviews/` directory has complete review sessions with reports in Markdown, JSON, and HTML. See [reviews/README.md](reviews/README.md).

## Expected Findings

Each subdirectory README documents the specific issues the power should find. See:
- [terraform/README.md](terraform/README.md) — 5 security issues
- [cloudformation/README.md](cloudformation/README.md) — 5 reliability issues
- [cdk/README.md](cdk/README.md) — 5 cost optimization issues
- [application-code/README.md](application-code/README.md) — multi-language issues
