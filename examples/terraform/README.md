# Terraform Security Examples

This directory contains Terraform examples demonstrating common security anti-patterns and their remediation according to AWS Well-Architected Framework best practices.

## Files

- **security-issues.tf** - Infrastructure code with security vulnerabilities
- **security-issues-fixed.tf** - Remediated version with security best practices

## Security Issues Demonstrated

### 1. Unencrypted S3 Bucket
**Issue:** S3 bucket without server-side encryption
**Risk:** Data at rest is not protected
**Fix:** Enable default encryption with KMS, add versioning and public access block

### 2. Overly Permissive IAM Policy
**Issue:** IAM policy with `*` actions on `*` resources
**Risk:** Violates least privilege principle, potential for privilege escalation
**Fix:** Specify exact actions and resources needed for the application

### 3. Unrestricted Security Group
**Issue:** Security group allowing 0.0.0.0/0 on all ports
**Risk:** Exposes resources to the entire internet
**Fix:** Restrict to specific IP ranges and required ports only

### 4. Unencrypted EBS Volume
**Issue:** EBS volume without encryption
**Risk:** Data at rest is not protected
**Fix:** Enable encryption with KMS key

### 5. Publicly Accessible RDS
**Issue:** RDS instance with `publicly_accessible = true` and hardcoded password
**Risk:** Database exposed to internet, credentials in code
**Fix:** Set `publicly_accessible = false`, use Secrets Manager, enable encryption

### 6. SSH Open to World
**Issue:** Security group allowing SSH (port 22) from 0.0.0.0/0
**Risk:** Brute force attacks, unauthorized access
**Fix:** Use bastion host pattern, restrict SSH to specific IPs

### 7. Unencrypted CloudWatch Logs
**Issue:** Log group without KMS encryption
**Risk:** Sensitive log data not protected
**Fix:** Enable KMS encryption for log groups

### 8. Lambda with Admin Access
**Issue:** Lambda function with AdministratorAccess policy
**Risk:** Excessive permissions, potential for abuse
**Fix:** Create custom policy with only required permissions

## Usage

### Analyze the Issues File

```bash
# Initialize Terraform
terraform init

# Validate syntax
terraform validate

# Plan (don't apply!)
terraform plan -out=issues.tfplan

# Use AWS Well-Architected Power to review
# Ask Kiro: "Review this Terraform file for security issues"
```

### Review the Fixed Version

```bash
# Compare the differences
diff security-issues.tf security-issues-fixed.tf

# Plan the fixed version
terraform plan -out=fixed.tfplan

# Review improvements with Kiro
# Ask Kiro: "Explain the security improvements in this file"
```

## Key Security Best Practices Applied

1. **Encryption Everywhere**
   - S3 buckets encrypted with KMS
   - EBS volumes encrypted
   - RDS storage encrypted
   - CloudWatch Logs encrypted

2. **Least Privilege IAM**
   - Specific actions instead of wildcards
   - Resource-level permissions
   - Separate roles for different services

3. **Network Security**
   - Security groups with specific rules
   - Bastion host for SSH access
   - Private subnets for databases
   - VPC endpoints to avoid internet traffic

4. **Secrets Management**
   - Passwords stored in Secrets Manager
   - No hardcoded credentials
   - Automatic password rotation capability

5. **Defense in Depth**
   - Multiple layers of security controls
   - Public access blocks on S3
   - Deletion protection on critical resources
   - Enhanced monitoring enabled

## Testing with AWS Well-Architected Power

1. Open `security-issues.tf` in your editor
2. Ask Kiro to review it: "Review this infrastructure code for Well-Architected security issues"
3. Compare findings with the documented issues above
4. Open `security-issues-fixed.tf` to see the remediation
5. Ask Kiro to explain the improvements

## Learning Resources

- [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [Terraform AWS Provider Security Best Practices](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

## Notes

- These examples are for learning and testing purposes only
- Do not deploy the issues file to production
- Always review and customize security configurations for your specific requirements
- Use AWS Security Hub and GuardDuty for continuous security monitoring
