# AWS Well-Architected Power — Hook Templates

Pre-configured hooks that automate Well-Architected reviews during development.

## Available Hooks

| Hook | Trigger | Use Case |
|------|---------|----------|
| [file-save.md](file-save.md) | Save IaC files (*.tf, *.yaml, *.json) | Immediate feedback during development |
| [pre-deployment.md](pre-deployment.md) | Before `terraform apply` / `cdk deploy` | Final safety check before changes |
| [post-generation.md](post-generation.md) | After Kiro generates IaC code | Ensure AI-generated code follows best practices |
| [validate-examples.md](validate-examples.md) | Manual trigger | Verify the power catches expected issues in all 6 example files |

## Installation

Copy the hook file to your Kiro hooks directory:

```bash
# User-level (all projects)
cp aws-well-architected-power/hooks/<hook-file>.md ~/.kiro/hooks/

# Workspace-level (current project only)
cp aws-well-architected-power/hooks/<hook-file>.md .kiro/hooks/
```

Hooks activate automatically after installation. Restart Kiro if needed.

## Customization

Each hook's JSON config can be customized:
- `filePatterns` — narrow which files trigger the hook
- `outputPrompt` — change review focus (e.g., security-only, quick check)
- `toolTypes` — change which tool types trigger pre/post hooks

See individual hook files for customization examples.
