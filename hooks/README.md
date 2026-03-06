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

Copy the JSON configuration block from any hook file into a `.kiro.hook` file in your Kiro hooks directory:

```bash
# User-level (all projects)
~/.kiro/hooks/<hook-name>.kiro.hook

# Workspace-level (current project only)
.kiro/hooks/<hook-name>.kiro.hook
```

> **Note:** Hook files must use the `.kiro.hook` extension to be recognized by Kiro. The `.md` files in this directory are documentation templates — copy the JSON config block from each into a new `.kiro.hook` file.

Hooks activate automatically after installation. Reload the window if needed.

## Customization

Each hook's JSON config can be customized:
- `filePatterns` — narrow which files trigger the hook
- `outputPrompt` — change review focus (e.g., security-only, quick check)
- `toolTypes` — change which tool types trigger pre/post hooks

See individual hook files for customization examples.
