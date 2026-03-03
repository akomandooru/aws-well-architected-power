# Testing the AWS Well-Architected Power Locally

This guide walks you through testing the power locally to ensure it works correctly and provides value.

## Quick Test Checklist

- [ ] Power is recognized by Kiro
- [ ] Example files trigger reviews correctly
- [ ] All six pillars provide guidance
- [ ] Reports generate in multiple formats
- [ ] Hooks work (if installed)
- [ ] MCP servers connect (if configured)

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

## Step 10: Performance Testing (Optional)

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

**Total Testing Time**: 15-30 minutes (depending on optional tests)

**Expected Outcome**: Confidence that the power works correctly and provides value for your AWS infrastructure development.
