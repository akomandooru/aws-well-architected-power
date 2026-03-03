# Changelog

All notable changes to the AWS Well-Architected Power will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
