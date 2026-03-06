---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/*.yaml,**/*.yml,**/*.json,**/*.ts,**/*.js,**/*.py,**/*.java,**/*.go,**/*.cs,**/*.rb,**/cdk.json"
---

# Security Pillar - AWS Well-Architected Framework

## Principles

1. Implement a strong identity foundation (least privilege, no long-term credentials)
2. Enable traceability (CloudTrail, VPC Flow Logs, Config)
3. Apply security at all layers (network, host, application, data)
4. Automate security best practices
5. Protect data in transit and at rest
6. Keep people away from data
7. Prepare for security events

## Security Assessment MCP Server

When available, use the Security Assessment MCP Server for:
- Automated Well-Architected Security Pillar assessments
- GuardDuty, Security Hub, IAM Access Analyzer monitoring
- Compliance validation (CIS, PCI-DSS, HIPAA)

## IaC Security Checklist

### Identity and Access Management
- [ ] IAM roles used instead of long-term credentials
- [ ] Least privilege: specific actions and resources (no `*` wildcards)
- [ ] MFA required for human users and root account
- [ ] Separate roles per application/workload
- [ ] Cross-account access uses IAM roles, not shared credentials

### Detection and Response
- [ ] CloudTrail enabled in all regions
- [ ] VPC Flow Logs enabled
- [ ] GuardDuty enabled for threat detection
- [ ] Security Hub enabled with CIS/AWS Foundational standards
- [ ] Automated remediation for critical findings (EventBridge + Lambda)

### Infrastructure Protection
- [ ] VPC with proper subnet segmentation (public/private/data tiers)
- [ ] Security groups: least privilege, reference SGs not CIDRs
- [ ] No SSH/RDP from 0.0.0.0/0 — use Systems Manager Session Manager
- [ ] Databases in private subnets, `publicly_accessible = false`
- [ ] VPC endpoints for AWS service communication

### Data Protection
- [ ] Encryption at rest for all data stores (S3, EBS, RDS, DynamoDB)
- [ ] KMS with customer-managed keys for sensitive data, key rotation enabled
- [ ] Encryption in transit: TLS 1.2+, HTTPS enforced
- [ ] S3: public access blocked, bucket policy denies non-HTTPS (`aws:SecureTransport`)
- [ ] SNS/SQS: policy denies non-HTTPS access (`aws:SecureTransport`)
- [ ] Secrets in AWS Secrets Manager or Parameter Store, never in code
- [ ] Data classified by sensitivity with appropriate controls

### Incident Response
- [ ] CloudTrail log file validation enabled
- [ ] Logs in immutable storage (S3 Object Lock)
- [ ] Automated isolation for compromised resources
- [ ] Incident response runbooks documented and tested

## Application Code Security Checklist

### Secrets Management
- [ ] No hardcoded credentials (AWS keys, database passwords, API keys)
- [ ] Secrets retrieved from Secrets Manager or Parameter Store at runtime
- [ ] Secrets not logged or exposed in error messages
- [ ] Automatic secret rotation configured

### Input Validation
- [ ] All user inputs validated (whitelist approach)
- [ ] Length limits enforced
- [ ] Parameterized queries (no string concatenation for SQL/NoSQL)

### Authentication & Authorization
- [ ] Authentication required for all protected endpoints
- [ ] JWT tokens verified (signature, expiration, issuer)
- [ ] Authorization checked per operation
- [ ] Generic error messages (no sensitive info in responses)

### AWS SDK Configuration
- [ ] IAM roles via default credential provider
- [ ] Retry and timeout configuration set
- [ ] TLS/SSL enforced for all service calls

## Key Anti-Patterns

| Anti-Pattern | Risk | Fix |
|---|---|---|
| `"Action": "*", "Resource": "*"` | Full AWS access | Specific actions and resources |
| Hardcoded access keys in code | Credential exposure | IAM roles + Secrets Manager |
| SSH from 0.0.0.0/0 | Brute force attacks | Systems Manager Session Manager |
| Database `publicly_accessible = true` | Internet exposure | Private subnets only |
| S3 bucket without public access block | Data exposure | `BlockPublicAcls`, `BlockPublicPolicy`, etc. |
| HTTP listener without redirect | Unencrypted traffic | HTTPS with TLS 1.2+ |
| Missing `aws:SecureTransport` policy | No HTTPS enforcement | Deny policy on S3/SNS/SQS |

## Key Secure Patterns (Reference)

### Least Privilege IAM Role
```hcl
resource "aws_iam_role_policy" "app_s3_access" {
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "arn:aws:s3:::my-bucket/app-data/*"  # Specific path
    }]
  })
}
```

### S3 HTTPS Enforcement
```hcl
resource "aws_s3_bucket_policy" "secure" {
  policy = jsonencode({
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource  = ["${aws_s3_bucket.main.arn}", "${aws_s3_bucket.main.arn}/*"]
      Condition = { Bool = { "aws:SecureTransport" = "false" } }
    }]
  })
}
```

### Multi-Tier Security Groups
```hcl
# ALB → App → DB: each tier only accepts traffic from the tier above
resource "aws_security_group" "app" {
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]  # Reference SG, not CIDR
  }
}
```

### Secure Secrets Access (Python)
```python
def get_credentials():
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='prod/db/credentials')
    return json.loads(response['SecretString'])
```

## Resources
- [AWS Security Best Practices](https://aws.amazon.com/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
