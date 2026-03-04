# Security Pillar - AWS Well-Architected Framework

## Overview

The Security Pillar focuses on protecting information, systems, and assets while delivering business value through risk assessments and mitigation strategies. Security is foundational to building reliable, compliant, and trustworthy systems on AWS.

### Core Security Principles

1. **Implement a strong identity foundation**: Use least privilege access, centralize identity management, and eliminate long-term credentials
2. **Enable traceability**: Monitor and log all actions and changes to your environment in real-time
3. **Apply security at all layers**: Defense in depth with multiple security controls at network, host, application, and data layers
4. **Automate security best practices**: Use software-based security mechanisms that scale with your infrastructure
5. **Protect data in transit and at rest**: Classify data by sensitivity and use encryption, tokenization, and access controls
6. **Keep people away from data**: Reduce or eliminate direct access to data to minimize risk of mishandling or modification
7. **Prepare for security events**: Have incident response processes, run simulations, and use tools to detect and respond to security events

## Security Assessment MCP Server

This power integrates with the AWS Security Assessment MCP Server for operational security monitoring and automated compliance checks.

### Available Tools

The Security Assessment MCP Server provides the following capabilities:

**1. Automated Security Checks**
- Run Well-Architected Security Pillar assessments against your AWS environment
- Validate security configurations across multiple services
- Identify security gaps and misconfigurations

**2. Service Monitoring**
- Monitor AWS GuardDuty findings for threat detection
- Check AWS Security Hub for centralized security alerts
- Review IAM Access Analyzer findings for unintended access
- Monitor AWS Config for compliance and configuration changes

**3. Findings Analysis**
- Analyze security findings from multiple sources
- Map findings to Well-Architected best practices
- Prioritize remediation based on risk and impact

**4. Compliance Validation**
- Validate compliance with security frameworks (CIS, PCI-DSS, HIPAA, etc.)
- Check control implementation status
- Generate compliance reports

### When to Use the MCP Server

Use the Security Assessment MCP Server for:
- **Operational Reviews**: Assessing security posture of deployed AWS resources
- **Incident Investigation**: Analyzing security findings and alerts
- **Compliance Audits**: Validating security controls are properly configured
- **Continuous Monitoring**: Regular security assessments as part of CI/CD

## Security Best Practices by Area

### 1. Identity and Access Management (IAM)

#### Best Practices

**Use IAM Roles Instead of Long-Term Credentials**
- Assign IAM roles to EC2 instances, Lambda functions, and containers
- Use IAM roles for cross-account access
- Avoid embedding access keys in code or configuration files
- Rotate credentials regularly when long-term credentials are unavoidable

**Implement Least Privilege Access**
- Grant only the permissions required to perform a task
- Start with minimal permissions and add as needed
- Use IAM policies with specific actions and resources (avoid wildcards)
- Regularly review and remove unused permissions

**Enable Multi-Factor Authentication (MFA)**
- Require MFA for all human users, especially privileged accounts
- Use MFA for AWS root account access
- Consider hardware MFA devices for highly privileged accounts
- Enforce MFA through IAM policies and SCPs

**Centralize Identity Management**
- Use AWS IAM Identity Center (formerly AWS SSO) for workforce access
- Integrate with existing identity providers (Active Directory, Okta, etc.)
- Implement federated access for temporary credentials
- Use AWS Organizations for multi-account identity management

#### Secure IAM Patterns

**Pattern 1: EC2 Instance with S3 Access**
```hcl
# Terraform example - Secure EC2 instance role
resource "aws_iam_role" "app_instance_role" {
  name = "app-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "app_s3_access" {
  name = "app-s3-access"
  role = aws_iam_role.app_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject"
      ]
      Resource = "arn:aws:s3:::my-app-bucket/app-data/*"  # Specific path, not entire bucket
    }]
  })
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "app-instance-profile"
  role = aws_iam_role.app_instance_role.name
}
```

**Why This Is Secure:**
- Uses IAM role instead of access keys
- Grants specific S3 actions (GetObject, PutObject) not full S3 access
- Restricts access to specific bucket path, not entire bucket
- No credentials stored in code or on instance

**Pattern 2: Lambda Function with DynamoDB Access**
```yaml
# CloudFormation example - Secure Lambda execution role
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole  # CloudWatch Logs only
    Policies:
      - PolicyName: DynamoDBAccess
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - dynamodb:GetItem
                - dynamodb:PutItem
                - dynamodb:UpdateItem
              Resource: !GetAtt MyTable.Arn
              Condition:
                StringEquals:
                  dynamodb:LeadingKeys:
                    - ${aws:userid}  # Row-level security
```

**Why This Is Secure:**
- Separates basic execution permissions (CloudWatch Logs) from data access
- Grants specific DynamoDB actions, not full table access
- Uses resource-specific ARN, not wildcard
- Implements row-level security with condition keys

#### Common IAM Anti-Patterns

**❌ Anti-Pattern 1: Overly Permissive Policies**
```json
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}
```
**Problem**: Grants full access to all AWS services and resources
**Fix**: Use specific actions and resources based on actual requirements

**❌ Anti-Pattern 2: Embedded Access Keys**
```python
# DON'T DO THIS
aws_access_key = "AKIAIOSFODNN7EXAMPLE"
aws_secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```
**Problem**: Credentials in code can be exposed in version control, logs, or memory dumps
**Fix**: Use IAM roles, environment variables, or AWS Secrets Manager

**❌ Anti-Pattern 3: Shared Credentials**
```hcl
# DON'T DO THIS - Single role for multiple applications
resource "aws_iam_role" "shared_app_role" {
  name = "shared-application-role"
  # Used by multiple unrelated applications
}
```
**Problem**: Violates least privilege, makes auditing difficult, increases blast radius
**Fix**: Create separate roles for each application or workload

### 2. Detection and Response

#### Best Practices

**Enable Comprehensive Logging**
- Enable AWS CloudTrail in all regions and accounts
- Configure VPC Flow Logs for network traffic analysis
- Enable S3 access logging for sensitive buckets
- Use AWS Config to track resource configuration changes
- Send logs to centralized logging account for security

**Implement Threat Detection**
- Enable Amazon GuardDuty for intelligent threat detection
- Configure AWS Security Hub for centralized security findings
- Use Amazon Detective for security investigation
- Set up EventBridge rules for automated responses
- Monitor for unusual API activity patterns

**Automate Incident Response**
- Create automated remediation workflows with Lambda
- Use AWS Systems Manager for automated patching
- Implement automated security group rule revocation
- Set up SNS notifications for critical security events
- Document and test incident response procedures

#### Secure Detection Patterns

**Pattern 3: Centralized Security Monitoring**
```hcl
# Terraform example - GuardDuty and Security Hub setup
resource "aws_guardduty_detector" "main" {
  enable = true
  
  finding_publishing_frequency = "FIFTEEN_MINUTES"
  
  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
  }
}

resource "aws_securityhub_account" "main" {}

resource "aws_securityhub_standards_subscription" "cis" {
  standards_arn = "arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.2.0"
  depends_on    = [aws_securityhub_account.main]
}

resource "aws_securityhub_standards_subscription" "aws_foundational" {
  standards_arn = "arn:aws:securityhub:us-east-1::standards/aws-foundational-security-best-practices/v/1.0.0"
  depends_on    = [aws_securityhub_account.main]
}

# Automated response to critical findings
resource "aws_cloudwatch_event_rule" "security_findings" {
  name        = "critical-security-findings"
  description = "Trigger on critical GuardDuty or Security Hub findings"

  event_pattern = jsonencode({
    source      = ["aws.guardduty", "aws.securityhub"]
    detail-type = ["GuardDuty Finding", "Security Hub Findings - Imported"]
    detail = {
      severity = [{
        label = ["CRITICAL", "HIGH"]
      }]
    }
  })
}

resource "aws_cloudwatch_event_target" "security_response" {
  rule      = aws_cloudwatch_event_rule.security_findings.name
  target_id = "SecurityResponseLambda"
  arn       = aws_lambda_function.security_response.arn
}
```

**Why This Is Secure:**
- Enables comprehensive threat detection with GuardDuty
- Monitors S3 and Kubernetes audit logs
- Implements compliance standards (CIS, AWS Foundational Security)
- Automates response to critical findings
- Centralizes security findings in Security Hub

### 3. Infrastructure Protection

#### Best Practices

**Implement Network Segmentation**
- Use VPCs to isolate workloads
- Create separate subnets for different tiers (web, app, data)
- Use private subnets for resources that don't need internet access
- Implement security groups as stateful firewalls
- Use Network ACLs for subnet-level controls

**Control Network Traffic**
- Use security groups with least privilege rules
- Deny all traffic by default, allow only necessary ports
- Reference security groups instead of CIDR blocks when possible
- Use AWS Network Firewall for advanced traffic filtering
- Implement VPC endpoints to avoid internet traffic

**Protect Compute Resources**
- Use AWS Systems Manager Session Manager instead of SSH
- Disable unnecessary services and ports
- Keep systems patched and up to date
- Use Amazon Inspector for vulnerability scanning
- Implement host-based intrusion detection

#### Secure Infrastructure Patterns

**Pattern 4: Multi-Tier VPC Architecture**
```hcl
# Terraform example - Secure VPC with proper segmentation
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "secure-vpc"
  }
}

# Public subnet for load balancers only
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "public-subnet-${count.index + 1}"
    Tier = "public"
  }
}

# Private subnet for application servers
resource "aws_subnet" "private_app" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-app-subnet-${count.index + 1}"
    Tier = "private-app"
  }
}

# Private subnet for databases (most restricted)
resource "aws_subnet" "private_data" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-data-subnet-${count.index + 1}"
    Tier = "private-data"
  }
}

# Security group for ALB - only allows HTTPS from internet
resource "aws_security_group" "alb" {
  name        = "alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "To application servers only"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}

# Security group for application servers - only allows traffic from ALB
resource "aws_security_group" "app" {
  name        = "app-sg"
  description = "Security group for application servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From ALB only"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description     = "To database only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.db.id]
  }
}

# Security group for database - only allows traffic from app servers
resource "aws_security_group" "db" {
  name        = "db-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "From application servers only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # No egress rules - database doesn't need outbound access
}
```

**Why This Is Secure:**
- Three-tier network architecture with proper isolation
- Public subnet only for load balancers, not application servers
- Security groups reference each other, not CIDR blocks
- Least privilege network access at each tier
- Database has no internet access or outbound connectivity
- Multi-AZ deployment for availability

#### Common Infrastructure Anti-Patterns

**❌ Anti-Pattern 4: Overly Permissive Security Groups**
```hcl
# DON'T DO THIS
resource "aws_security_group" "bad_example" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```
**Problem**: Allows all TCP traffic from anywhere on the internet
**Fix**: Allow only specific ports from specific sources

**❌ Anti-Pattern 5: SSH Access from Internet**
```hcl
# DON'T DO THIS
resource "aws_security_group" "bad_ssh" {
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```
**Problem**: Exposes SSH to brute force attacks from anywhere
**Fix**: Use AWS Systems Manager Session Manager, or restrict to specific IPs/VPN

**❌ Anti-Pattern 6: Database in Public Subnet**
```hcl
# DON'T DO THIS
resource "aws_db_instance" "bad_db" {
  publicly_accessible = true
  # Other configuration...
}
```
**Problem**: Exposes database to internet, increases attack surface
**Fix**: Place databases in private subnets with no internet access

### 4. Data Protection

#### Best Practices

**Encrypt Data at Rest**
- Enable encryption for all data stores (S3, EBS, RDS, DynamoDB)
- Use AWS KMS for key management
- Implement envelope encryption for large datasets
- Rotate encryption keys regularly
- Use separate keys for different data classifications

**Encrypt Data in Transit**
- Use TLS 1.2 or higher for all data transmission
- Enforce HTTPS for web applications and APIs
- Use VPC endpoints for AWS service communication
- Implement certificate management and rotation
- Use AWS Certificate Manager for SSL/TLS certificates

**Implement Data Classification**
- Classify data by sensitivity (public, internal, confidential, restricted)
- Apply appropriate controls based on classification
- Use S3 bucket policies and IAM policies to enforce access
- Tag resources with data classification labels
- Implement data loss prevention (DLP) controls

**Manage Secrets Securely**
- Use AWS Secrets Manager for database credentials and API keys
- Use AWS Systems Manager Parameter Store for configuration data
- Never store secrets in code, environment variables, or logs
- Rotate secrets automatically
- Audit secret access with CloudTrail

#### Secure Data Protection Patterns

**Pattern 5: Encrypted S3 Bucket with Secure Access**
```yaml
# CloudFormation example - Secure S3 bucket configuration
SecureS3Bucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: my-secure-data-bucket
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - ServerSideEncryptionByDefault:
            SSEAlgorithm: aws:kms
            KMSMasterKeyID: !GetAtt DataEncryptionKey.Arn
          BucketKeyEnabled: true
    VersioningConfiguration:
      Status: Enabled
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: true
      IgnorePublicAcls: true
      RestrictPublicBuckets: true
    LoggingConfiguration:
      DestinationBucketName: !Ref LoggingBucket
      LogFilePrefix: s3-access-logs/
    LifecycleConfiguration:
      Rules:
        - Id: DeleteOldVersions
          Status: Enabled
          NoncurrentVersionExpirationInDays: 90

DataEncryptionKey:
  Type: AWS::KMS::Key
  Properties:
    Description: Encryption key for S3 data
    KeyPolicy:
      Version: '2012-10-17'
      Statement:
        - Sid: Enable IAM User Permissions
          Effect: Allow
          Principal:
            AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
          Action: 'kms:*'
          Resource: '*'
        - Sid: Allow S3 to use the key
          Effect: Allow
          Principal:
            Service: s3.amazonaws.com
          Action:
            - 'kms:Decrypt'
            - 'kms:GenerateDataKey'
          Resource: '*'

SecureBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket: !Ref SecureS3Bucket
    PolicyDocument:
      Statement:
        - Sid: DenyUnencryptedObjectUploads
          Effect: Deny
          Principal: '*'
          Action: 's3:PutObject'
          Resource: !Sub '${SecureS3Bucket.Arn}/*'
          Condition:
            StringNotEquals:
              's3:x-amz-server-side-encryption': 'aws:kms'
        - Sid: DenyInsecureTransport
          Effect: Deny
          Principal: '*'
          Action: 's3:*'
          Resource:
            - !GetAtt SecureS3Bucket.Arn
            - !Sub '${SecureS3Bucket.Arn}/*'
          Condition:
            Bool:
              'aws:SecureTransport': false
```

**Why This Is Secure:**
- KMS encryption enabled with customer-managed key
- Versioning enabled for data recovery
- All public access blocked
- Access logging enabled for audit trail
- Lifecycle policy to manage old versions
- Bucket policy enforces encryption and HTTPS
- Denies unencrypted uploads
- Denies non-HTTPS access

**Pattern 6: RDS Database with Encryption and Secure Access**
```hcl
# Terraform example - Secure RDS configuration
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet-group"
  subnet_ids = aws_subnet.private_data[*].id

  tags = {
    Name = "Main DB subnet group"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "secure-database"
  engine         = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.medium"

  # Encryption
  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # Credentials from Secrets Manager
  manage_master_user_password = true

  # Backup and maintenance
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  # Monitoring and logging
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn
  
  # Deletion protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "secure-database-final-snapshot"

  # Multi-AZ for high availability
  multi_az = true
}
```

**Why This Is Secure:**
- Storage encryption with KMS and automatic key rotation
- Database in private subnet with no public access
- Master password managed by Secrets Manager (automatic rotation)
- 30-day backup retention for recovery
- CloudWatch Logs enabled for audit trail
- Enhanced monitoring enabled
- Deletion protection prevents accidental deletion
- Multi-AZ for availability and automatic failover

#### Common Data Protection Anti-Patterns

**❌ Anti-Pattern 7: Unencrypted Data Stores**
```hcl
# DON'T DO THIS
resource "aws_s3_bucket" "bad_bucket" {
  bucket = "my-data-bucket"
  # No encryption configuration
}

resource "aws_db_instance" "bad_db" {
  storage_encrypted = false  # Unencrypted database
}
```
**Problem**: Data at rest is not encrypted, vulnerable to unauthorized access
**Fix**: Enable encryption for all data stores using KMS

**❌ Anti-Pattern 8: Hardcoded Secrets**
```python
# DON'T DO THIS
import psycopg2

conn = psycopg2.connect(
    host="mydb.example.com",
    database="myapp",
    user="admin",
    password="SuperSecret123!"  # Hardcoded password
)
```
**Problem**: Credentials in code can be exposed in version control or logs
**Fix**: Use AWS Secrets Manager or Parameter Store

**❌ Anti-Pattern 9: Allowing HTTP Traffic**
```hcl
# DON'T DO THIS
resource "aws_lb_listener" "bad_http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"  # Unencrypted traffic

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
```
**Problem**: Data in transit is not encrypted, vulnerable to interception
**Fix**: Use HTTPS with TLS 1.2+, redirect HTTP to HTTPS

### 5. Incident Response

#### Best Practices

**Prepare for Security Events**
- Document incident response procedures
- Define roles and responsibilities
- Create runbooks for common scenarios
- Establish communication channels
- Practice with game days and simulations

**Automate Detection and Response**
- Use EventBridge for automated responses
- Create Lambda functions for remediation
- Implement automated isolation of compromised resources
- Set up automated snapshots before remediation
- Use AWS Systems Manager for automated patching

**Preserve Evidence**
- Enable CloudTrail log file validation
- Store logs in immutable storage (S3 with Object Lock)
- Create forensic snapshots of affected resources
- Implement log retention policies
- Use AWS Backup for automated backups

**Learn from Incidents**
- Conduct post-incident reviews
- Update runbooks based on lessons learned
- Improve detection and response automation
- Share findings across teams
- Track metrics (MTTD, MTTR)

#### Incident Response Pattern

**Pattern 7: Automated Security Incident Response**
```python
# Lambda function for automated incident response
import boto3
import json

ec2 = boto3.client('ec2')
sns = boto3.client('sns')
ssm = boto3.client('ssm')

def lambda_handler(event, context):
    """
    Responds to GuardDuty findings by isolating compromised instances
    and creating forensic snapshots
    """
    
    # Parse GuardDuty finding
    finding = event['detail']
    severity = finding['severity']
    finding_type = finding['type']
    
    # Only respond to high/critical findings
    if severity < 7.0:
        return {'statusCode': 200, 'body': 'Low severity, no action taken'}
    
    # Extract instance ID from finding
    instance_id = None
    for resource in finding.get('resource', {}).get('instanceDetails', []):
        instance_id = resource.get('instanceId')
        break
    
    if not instance_id:
        return {'statusCode': 200, 'body': 'No instance found in finding'}
    
    try:
        # Step 1: Create forensic snapshot of instance volumes
        volumes = ec2.describe_volumes(
            Filters=[{'Name': 'attachment.instance-id', 'Values': [instance_id]}]
        )
        
        snapshot_ids = []
        for volume in volumes['Volumes']:
            snapshot = ec2.create_snapshot(
                VolumeId=volume['VolumeId'],
                Description=f'Forensic snapshot for security incident {finding["id"]}',
                TagSpecifications=[{
                    'ResourceType': 'snapshot',
                    'Tags': [
                        {'Key': 'Purpose', 'Value': 'Forensics'},
                        {'Key': 'IncidentId', 'Value': finding['id']},
                        {'Key': 'Severity', 'Value': str(severity)}
                    ]
                }]
            )
            snapshot_ids.append(snapshot['SnapshotId'])
        
        # Step 2: Isolate the instance by replacing security group
        ec2.modify_instance_attribute(
            InstanceId=instance_id,
            Groups=['sg-quarantine']  # Pre-created quarantine security group with no rules
        )
        
        # Step 3: Tag the instance
        ec2.create_tags(
            Resources=[instance_id],
            Tags=[
                {'Key': 'SecurityStatus', 'Value': 'Quarantined'},
                {'Key': 'IncidentId', 'Value': finding['id']},
                {'Key': 'QuarantineTime', 'Value': context.aws_request_id}
            ]
        )
        
        # Step 4: Notify security team
        message = f"""
        SECURITY INCIDENT RESPONSE AUTOMATED ACTION
        
        Finding Type: {finding_type}
        Severity: {severity}
        Instance ID: {instance_id}
        
        Actions Taken:
        1. Created forensic snapshots: {', '.join(snapshot_ids)}
        2. Isolated instance by applying quarantine security group
        3. Tagged instance for investigation
        
        Next Steps:
        - Review GuardDuty finding details
        - Analyze forensic snapshots
        - Determine if instance should be terminated
        - Update incident response runbook if needed
        """
        
        sns.publish(
            TopicArn='arn:aws:sns:REGION:ACCOUNT_ID:security-incidents',
            Subject=f'Security Incident Response: {finding_type}',
            Message=message
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'action': 'instance_quarantined',
                'instance_id': instance_id,
                'snapshots': snapshot_ids
            })
        }
        
    except Exception as e:
        # Notify on failure
        sns.publish(
            TopicArn='arn:aws:sns:REGION:ACCOUNT_ID:security-incidents',
            Subject='FAILED: Automated Incident Response',
            Message=f'Failed to respond to incident: {str(e)}'
        )
        raise

```

**Why This Is Effective:**
- Automated response reduces time to containment
- Creates forensic evidence before remediation
- Isolates compromised instance to prevent lateral movement
- Tags resources for investigation tracking
- Notifies security team with actionable information
- Handles errors gracefully with notifications

## Common Security Issues and Remediation

### Issue 1: Public S3 Bucket

**Detection**: AWS Config rule `s3-bucket-public-read-prohibited` or Security Hub finding

**Risk**: High - Sensitive data may be exposed to the internet

**Remediation**:
```hcl
# Add public access block to existing bucket
resource "aws_s3_bucket_public_access_block" "remediation" {
  bucket = aws_s3_bucket.existing_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Review and update bucket policy to remove public access
resource "aws_s3_bucket_policy" "remediation" {
  bucket = aws_s3_bucket.existing_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyPublicAccess"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.existing_bucket.arn,
          "${aws_s3_bucket.existing_bucket.arn}/*"
        ]
        Condition = {
          StringNotEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}
```

### Issue 2: Unencrypted EBS Volumes

**Detection**: AWS Config rule `encrypted-volumes` or Security Hub finding

**Risk**: Medium - Data at rest is not protected

**Remediation**:
```bash
# For existing volumes, create encrypted copy
# 1. Create snapshot of unencrypted volume
aws ec2 create-snapshot --volume-id vol-1234567890abcdef0 --description "Snapshot for encryption"

# 2. Copy snapshot with encryption
aws ec2 copy-snapshot \
  --source-region us-east-1 \
  --source-snapshot-id snap-1234567890abcdef0 \
  --encrypted \
  --kms-key-id arn:aws:kms:REGION:ACCOUNT_ID:key/KMS_KEY_ID

# 3. Create encrypted volume from encrypted snapshot
aws ec2 create-volume \
  --snapshot-id snap-0987654321fedcba0 \
  --availability-zone us-east-1a \
  --encrypted

# 4. Stop instance, detach old volume, attach new encrypted volume
```

**Prevention** (for new volumes):
```hcl
# Enable encryption by default for all new EBS volumes
resource "aws_ebs_encryption_by_default" "enabled" {
  enabled = true
}

# Specify KMS key for encryption
resource "aws_ebs_default_kms_key" "main" {
  key_arn = aws_kms_key.ebs.arn
}
```

### Issue 3: Overly Permissive IAM Policy

**Detection**: IAM Access Analyzer or manual policy review

**Risk**: High - Violates least privilege principle

**Example Problem**:
```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```

**Remediation**:
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::my-specific-bucket",
    "arn:aws:s3:::my-specific-bucket/*"
  ]
}
```

**Process**:
1. Review CloudTrail logs to identify actual API calls made
2. Use IAM Access Analyzer to identify unused permissions
3. Create new policy with only required permissions
4. Test with new policy in non-production environment
5. Apply to production after validation

### Issue 4: Missing MFA on Root Account

**Detection**: AWS Config rule `root-account-mfa-enabled` or Security Hub finding

**Risk**: Critical - Root account compromise has full access

**Remediation**:
1. Sign in to AWS Management Console as root user
2. Navigate to IAM → Dashboard → Security Status
3. Click "Activate MFA on your root account"
4. Choose MFA device type (virtual MFA app recommended)
5. Follow setup wizard to configure MFA
6. Store backup codes in secure location
7. Test MFA by signing out and back in

**Additional Hardening**:
- Create IAM users for daily operations, don't use root
- Set up billing alerts for root account activity
- Enable CloudTrail logging for root account actions
- Store root account credentials in secure vault

### Issue 5: Security Group Allows 0.0.0.0/0 on Sensitive Ports

**Detection**: AWS Config rule `restricted-ssh` or `restricted-common-ports`

**Risk**: High - Exposes services to internet-wide attacks

**Remediation**:
```hcl
# Remove overly permissive rules
resource "aws_security_group_rule" "remove_public_ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]  # This rule should be removed
  security_group_id = aws_security_group.bad.id
}

# Replace with Systems Manager Session Manager access (no inbound rules needed)
# Or restrict to specific IP ranges
resource "aws_security_group_rule" "restricted_ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["10.0.0.0/8"]  # Internal network only
  security_group_id = aws_security_group.good.id
}

# Better: Use Session Manager instead of SSH
resource "aws_iam_role" "ssm_role" {
  name = "ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
```

### Issue 6: CloudTrail Not Enabled

**Detection**: AWS Config rule `cloud-trail-enabled` or Security Hub finding

**Risk**: High - No audit trail for API activity

**Remediation**:
```hcl
# Create S3 bucket for CloudTrail logs
resource "aws_s3_bucket" "cloudtrail" {
  bucket = "my-org-cloudtrail-logs"
}

resource "aws_s3_bucket_public_access_block" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# Enable CloudTrail
resource "aws_cloudtrail" "main" {
  name                          = "organization-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::*/"]  # Log all S3 object-level events
    }
  }

  insight_selector {
    insight_type = "ApiCallRateInsight"
  }
}
```

## Security Checklist for Code Reviews

When reviewing infrastructure code, check for these security requirements:

### Identity and Access Management
- [ ] IAM roles used instead of access keys
- [ ] Policies follow least privilege principle
- [ ] No wildcards in IAM policies (or justified)
- [ ] MFA required for privileged operations
- [ ] Service-specific IAM roles (not shared)
- [ ] IAM policy conditions used where appropriate

### Network Security
- [ ] Resources in private subnets when possible
- [ ] Security groups deny by default
- [ ] No 0.0.0.0/0 on sensitive ports (22, 3389, 3306, 5432)
- [ ] Security groups reference each other, not CIDR blocks
- [ ] VPC Flow Logs enabled
- [ ] Network ACLs configured for subnet-level control

### Data Protection
- [ ] Encryption at rest enabled for all data stores
- [ ] KMS customer-managed keys used (not AWS-managed)
- [ ] Encryption in transit enforced (TLS 1.2+)
- [ ] S3 buckets have public access blocked
- [ ] S3 bucket policies enforce encryption and HTTPS
- [ ] Versioning enabled for critical data
- [ ] Backup and retention policies configured

### Logging and Monitoring
- [ ] CloudTrail enabled in all regions
- [ ] CloudTrail log file validation enabled
- [ ] VPC Flow Logs enabled
- [ ] S3 access logging enabled for sensitive buckets
- [ ] GuardDuty enabled
- [ ] Security Hub enabled with standards
- [ ] CloudWatch alarms for security events

### Secrets Management
- [ ] No hardcoded credentials in code
- [ ] Secrets Manager or Parameter Store used
- [ ] Automatic secret rotation configured
- [ ] Database passwords managed by AWS
- [ ] API keys and tokens stored securely

### Compliance and Governance
- [ ] Resources tagged appropriately
- [ ] AWS Config rules enabled
- [ ] Compliance standards configured in Security Hub
- [ ] Backup policies meet requirements
- [ ] Deletion protection enabled for critical resources

## Security by Service

### Amazon S3
**Key Security Features:**
- Server-side encryption (SSE-S3, SSE-KMS, SSE-C)
- Bucket policies and IAM policies
- Access Control Lists (ACLs) - legacy, use policies instead
- S3 Block Public Access
- Versioning and Object Lock
- Access logging and CloudTrail integration
- VPC endpoints for private access

**Security Best Practices:**
- Enable Block Public Access at account and bucket level
- Use bucket policies to enforce encryption and HTTPS
- Enable versioning for data recovery
- Use S3 Object Lock for compliance (WORM)
- Enable access logging for audit trail
- Use VPC endpoints to avoid internet traffic
- Implement lifecycle policies for data retention

### Amazon RDS
**Key Security Features:**
- Encryption at rest with KMS
- Encryption in transit with SSL/TLS
- Network isolation with VPC and security groups
- IAM database authentication
- Automated backups and snapshots
- Enhanced monitoring and Performance Insights
- Secrets Manager integration

**Security Best Practices:**
- Enable encryption at rest for all databases
- Place databases in private subnets
- Use Secrets Manager for credential management
- Enable automated backups with appropriate retention
- Enable Multi-AZ for high availability
- Use IAM database authentication when possible
- Enable deletion protection for production databases
- Monitor with CloudWatch and Enhanced Monitoring

### AWS Lambda
**Key Security Features:**
- Execution role with IAM policies
- VPC integration for private resource access
- Environment variable encryption with KMS
- Resource-based policies for invocation control
- X-Ray tracing for security analysis
- Code signing for deployment integrity

**Security Best Practices:**
- Use separate execution roles per function
- Grant minimal permissions in execution role
- Encrypt environment variables with KMS
- Use VPC integration for database/private resource access
- Enable X-Ray tracing for security monitoring
- Implement code signing for production functions
- Use Secrets Manager for sensitive configuration
- Set appropriate timeout and memory limits

### Amazon EC2
**Key Security Features:**
- Security groups (stateful firewall)
- IAM roles for EC2 instances
- EBS encryption with KMS
- Systems Manager Session Manager
- Instance metadata service (IMDSv2)
- Amazon Inspector for vulnerability scanning
- Nitro System for hardware-level security

**Security Best Practices:**
- Use IAM roles, never embed credentials
- Enable EBS encryption by default
- Use Systems Manager Session Manager instead of SSH
- Require IMDSv2 for metadata access
- Keep AMIs and software up to date
- Use Amazon Inspector for vulnerability scanning
- Implement host-based intrusion detection
- Use dedicated instances for compliance workloads

### Amazon VPC
**Key Security Features:**
- Network isolation and segmentation
- Security groups (stateful)
- Network ACLs (stateless)
- VPC Flow Logs
- VPC endpoints for private AWS service access
- AWS Network Firewall
- AWS PrivateLink

**Security Best Practices:**
- Use multiple subnets for different tiers
- Implement defense in depth with security groups and NACLs
- Enable VPC Flow Logs for traffic analysis
- Use VPC endpoints to avoid internet traffic
- Implement Network Firewall for advanced filtering
- Use PrivateLink for secure service access
- Segment workloads into separate VPCs
- Use Transit Gateway for hub-and-spoke architecture

## AWS Security Services

### Amazon GuardDuty
**Purpose**: Intelligent threat detection service that continuously monitors for malicious activity

**What It Detects:**
- Compromised instances (cryptocurrency mining, backdoors)
- Reconnaissance activity (port scanning, unusual API calls)
- Account compromise (leaked credentials, unusual behavior)
- Malicious IP addresses and domains
- S3 data exfiltration attempts

**How to Use:**
1. Enable GuardDuty in all regions and accounts
2. Configure finding export to S3 for long-term storage
3. Set up EventBridge rules for automated responses
4. Review findings regularly and tune suppression rules
5. Integrate with Security Hub for centralized view

### AWS Security Hub
**Purpose**: Centralized security and compliance dashboard

**What It Provides:**
- Aggregated findings from GuardDuty, Inspector, Macie, etc.
- Compliance checks against standards (CIS, PCI-DSS, AWS Foundational Security)
- Security score and prioritized findings
- Automated remediation with EventBridge and Systems Manager
- Cross-region and cross-account aggregation

**How to Use:**
1. Enable Security Hub in all regions
2. Enable security standards (CIS, AWS Foundational Security)
3. Configure finding aggregation across accounts
4. Set up automated remediation for common issues
5. Review security score and high-priority findings regularly

### AWS IAM Access Analyzer
**Purpose**: Identifies resources shared with external entities

**What It Analyzes:**
- S3 buckets with external access
- IAM roles with external trust relationships
- KMS keys with external key policies
- Lambda functions with external permissions
- SQS queues with external access

**How to Use:**
1. Enable IAM Access Analyzer in each region
2. Review findings for unintended external access
3. Use policy validation for new policies
4. Generate least-privilege policies from CloudTrail logs
5. Archive expected findings to reduce noise

### Amazon Macie
**Purpose**: Discovers and protects sensitive data in S3

**What It Does:**
- Automatically discovers sensitive data (PII, credentials, financial data)
- Classifies data by sensitivity
- Monitors for unusual data access patterns
- Generates findings for security and compliance risks
- Provides data inventory and classification

**How to Use:**
1. Enable Macie in regions with S3 data
2. Configure sensitive data discovery jobs
3. Review findings for exposed sensitive data
4. Set up automated remediation for high-risk findings
5. Use data classification for compliance reporting

### AWS Config
**Purpose**: Tracks resource configuration and compliance

**What It Provides:**
- Configuration history for all resources
- Compliance checking with managed and custom rules
- Change notifications and remediation
- Configuration snapshots for audit
- Relationship tracking between resources

**How to Use:**
1. Enable AWS Config in all regions
2. Configure managed rules for security best practices
3. Create custom rules for organization-specific requirements
4. Set up automatic remediation with Systems Manager
5. Use configuration history for incident investigation

## Security Compliance Frameworks

### CIS AWS Foundations Benchmark
**Purpose**: Industry-accepted security best practices for AWS

**Key Areas:**
- Identity and Access Management (14 controls)
- Storage (3 controls)
- Logging (11 controls)
- Monitoring (15 controls)
- Networking (5 controls)

**How to Implement:**
1. Enable CIS standard in Security Hub
2. Review failing controls and prioritize by severity
3. Implement automated remediation where possible
4. Document exceptions with business justification
5. Regular compliance reporting and review

**Common CIS Controls:**
- 1.4: Ensure no root account access key exists
- 1.5-1.11: MFA requirements for root and IAM users
- 2.1.1: Deny HTTP requests to S3 buckets
- 3.1-3.11: CloudTrail configuration and monitoring
- 4.1-4.15: CloudWatch alarms for security events
- 5.1-5.4: VPC and network security configuration

### AWS Foundational Security Best Practices
**Purpose**: AWS-recommended security controls

**Coverage:**
- 20+ AWS services
- 200+ automated checks
- Aligned with AWS Well-Architected Framework
- Continuously updated by AWS

**Key Controls:**
- [AutoScaling.1] Auto Scaling groups should use multiple instance types
- [CloudTrail.1] CloudTrail should be enabled and configured
- [EC2.1] EBS snapshots should not be publicly restorable
- [EC2.2] VPC default security group should not allow inbound/outbound traffic
- [IAM.1] IAM policies should not allow full "*:*" administrative privileges
- [RDS.1] RDS snapshots should be private
- [S3.1] S3 Block Public Access setting should be enabled

### HIPAA Compliance
**Requirements**: Health Insurance Portability and Accountability Act

**Key Security Requirements:**
- Access controls and audit logging
- Encryption of PHI at rest and in transit
- Backup and disaster recovery
- Incident response procedures
- Business associate agreements (BAA)

**AWS Services for HIPAA:**
- Eligible services: EC2, S3, RDS, DynamoDB, Lambda, etc.
- Sign BAA with AWS
- Enable encryption for all PHI storage
- Implement comprehensive logging and monitoring
- Use VPC for network isolation
- Implement access controls and MFA

### PCI-DSS Compliance
**Requirements**: Payment Card Industry Data Security Standard

**Key Requirements:**
- Install and maintain firewall configuration
- Encrypt transmission of cardholder data
- Protect stored cardholder data
- Implement strong access control measures
- Regularly monitor and test networks
- Maintain information security policy

**AWS Implementation:**
- Use VPC for network segmentation
- Implement encryption with KMS
- Enable CloudTrail and VPC Flow Logs
- Use GuardDuty for threat detection
- Implement IAM with least privilege
- Regular vulnerability scanning with Inspector

## Additional Resources

### AWS Documentation
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [AWS Security Documentation](https://docs.aws.amazon.com/security/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

### AWS Whitepapers
- [AWS Security Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/wellarchitected-security-pillar.pdf)
- [AWS Security Best Practices](https://d1.awsstatic.com/whitepapers/Security/AWS_Security_Best_Practices.pdf)
- [Introduction to AWS Security](https://docs.aws.amazon.com/whitepapers/latest/introduction-aws-security/welcome.html)
- [AWS Security Incident Response Guide](https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/welcome.html)

### Training and Certification
- [AWS Security Fundamentals (Digital Training)](https://aws.amazon.com/training/digital/aws-security-fundamentals/)
- [AWS Certified Security - Specialty](https://aws.amazon.com/certification/certified-security-specialty/)
- [AWS Security Hub Workshop](https://catalog.workshops.aws/security-hub/en-US)
- [AWS Well-Architected Labs - Security](https://wellarchitectedlabs.com/security/)

### Tools and Utilities
- [AWS Security Hub](https://aws.amazon.com/security-hub/) - Centralized security management
- [Amazon GuardDuty](https://aws.amazon.com/guardduty/) - Threat detection
- [AWS IAM Access Analyzer](https://aws.amazon.com/iam/access-analyzer/) - External access analysis
- [Amazon Macie](https://aws.amazon.com/macie/) - Sensitive data discovery
- [AWS Config](https://aws.amazon.com/config/) - Configuration compliance
- [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) - API activity logging
- [AWS Systems Manager](https://aws.amazon.com/systems-manager/) - Operational management
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) - Secrets management
- [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/) - SSL/TLS certificates

### Community Resources
- [AWS Security Blog](https://aws.amazon.com/blogs/security/)
- [AWS re:Inforce Conference](https://reinforce.awsevents.com/)
- [AWS Security Bulletins](https://aws.amazon.com/security/security-bulletins/)
- [AWS Security GitHub Repositories](https://github.com/aws-samples?q=security)

## Application Code Security

In addition to infrastructure security, application code must also follow Well-Architected security principles. This power analyzes application code across multiple programming languages for security patterns.

### Supported Languages for Application Code Analysis

- **Python**: boto3 security patterns, secrets management, input validation
- **Java**: AWS SDK for Java v2 security, authentication patterns
- **TypeScript/Node.js**: AWS SDK v3 security, secure API development
- **Go**: Context-based security, error handling patterns
- **C#**: Async security patterns, credential management
- **Ruby**: AWS SDK security, resource management

### Key Application Security Patterns Detected

1. **Hardcoded Secrets Detection**: Identifies credentials, API keys, and passwords in code
2. **Input Validation**: Checks for SQL injection, NoSQL injection, and XSS vulnerabilities
3. **Authentication Patterns**: Verifies JWT token validation and session management
4. **Authorization Checks**: Ensures permission checks before sensitive operations
5. **AWS SDK Configuration**: Validates retry policies, timeouts, and IAM role usage
6. **Error Handling**: Checks that errors don't expose sensitive information
7. **Logging Security**: Ensures sensitive data isn't logged

### Application Code Security Guidance

For detailed application code security patterns, examples, and language-specific best practices, see:

**[Application Code Security Patterns](./security-application-code.md)**

This companion guide provides:
- Language-specific secure coding examples (Python, Java, TypeScript, Go, C#, Ruby)
- Common security anti-patterns and fixes
- AWS SDK security configuration for each language
- Input validation and sanitization patterns
- Authentication and authorization implementations
- Secrets management best practices
- Application code security checklist

## Context-Aware Security Trade-Off Guidance

Security is often seen as non-negotiable, but the **level** and **approach** to security controls should be context-aware. While core security principles (no hardcoded secrets, least privilege) are always required, the implementation details depend on your specific situation.

### Context Questions for Security Recommendations

Before making security recommendations, gather context:

1. **Data Classification**: What type of data? (public, internal, confidential, restricted)
2. **Regulatory Requirements**: GDPR, HIPAA, PCI-DSS, SOC 2, FedRAMP, or none?
3. **Environment**: Development, staging, or production?
4. **Budget Constraints**: Tight, moderate, or flexible?
5. **Compliance Maturity**: Startup, growth, or enterprise?

### Trade-Off 1: Encryption Approaches

#### Context-Dependent Encryption Decisions

**Public Data (No Sensitive Information)**:
```
Recommendation: Encryption is OPTIONAL but recommended for defense-in-depth.

Options:
1. No Encryption
   - Cost: $0
   - Complexity: None
   - Risk: Low (data is public anyway)
   - Best for: Truly public data (marketing assets, public documentation)

2. SSE-S3 (AWS-Managed Keys)
   - Cost: $0 (included with S3)
   - Complexity: Low (enable with one setting)
   - Security: Basic encryption at rest
   - Best for: Public data with defense-in-depth approach

Trade-off: SSE-S3 adds zero cost and minimal complexity for additional security layer.
Recommendation: Enable SSE-S3 for defense-in-depth (free, easy, no downside).
```

**Internal/Confidential Data (No Regulatory Requirements)**:
```
Recommendation: Encryption is REQUIRED. Choose approach based on control needs.

Options:
1. SSE-S3 (AWS-Managed Keys)
   - Cost: $0
   - Control: AWS manages keys, automatic rotation
   - Audit: Basic CloudTrail logging
   - Compliance: Meets basic encryption requirements
   - Best for: Internal data, cost-sensitive projects

2. KMS with AWS-Managed Keys
   - Cost: $0 (AWS-managed CMKs are free)
   - Control: AWS manages keys, automatic rotation
   - Audit: CloudTrail logging of key usage
   - Compliance: Better audit trail than SSE-S3
   - Best for: Confidential data, moderate control needs

3. KMS with Customer-Managed Keys (CMK)
   - Cost: $1/month per key + $0.03 per 10,000 requests
   - Control: Full control over key policies, rotation, deletion
   - Audit: Comprehensive CloudTrail logging
   - Compliance: Meets most regulatory requirements
   - Best for: Confidential data, compliance needs, production

Trade-off: KMS CMK costs $1/month but provides full control and audit trail.
Recommendation: Use KMS CMK for production confidential data ($1/month is negligible).
```

**PII, Financial, or Health Data (Regulatory Requirements)**:
```
Recommendation: KMS with Customer-Managed Keys is REQUIRED (non-negotiable).

REQUIRED Configuration:
- KMS with customer-managed keys (CMK)
- Automatic or manual key rotation enabled
- Key policies with least privilege access
- CloudTrail logging of all key operations
- Documented key management procedures
- Encryption in transit (TLS 1.2+)

Cost: $1/month per key + $0.03 per 10,000 requests
Complexity: Medium (key management, rotation, access control)

This is NON-NEGOTIABLE for:
- PII data (GDPR, CCPA)
- Financial data (PCI-DSS)
- Health data (HIPAA)
- Regulated industries

Trade-off: None - this is a compliance requirement.
Non-compliance cost: Fines up to €20M (GDPR), $1.5M/year (HIPAA), $500K (PCI-DSS).
```

#### Environment-Specific Encryption

| Environment | Public Data | Internal Data | PII/Regulated Data |
|-------------|-------------|---------------|-------------------|
| **Development** | Optional | SSE-S3 or KMS AWS-managed | KMS CMK (test keys) |
| **Staging** | SSE-S3 | KMS AWS-managed or CMK | KMS CMK (production-like) |
| **Production** | SSE-S3 | KMS CMK | KMS CMK (REQUIRED) |

### Trade-Off 2: IAM Complexity vs. Security

#### Context-Dependent IAM Approaches

**Small Team (1-5 people), Startup**:
```
Recommendation: Balance security with operational simplicity.

Approach:
1. Use IAM roles for all AWS resources (REQUIRED)
2. Use IAM Identity Center for human access (RECOMMENDED)
3. Start with AWS-managed policies, refine to least privilege over time
4. Enable MFA for all users (REQUIRED)
5. Use separate AWS accounts for dev/prod (RECOMMENDED)

Trade-off: Start with broader permissions, tighten as you grow.
- Broader permissions: Faster development, some security risk
- Least privilege from day 1: Slower development, maximum security

Recommendation: Use AWS-managed policies initially (e.g., PowerUserAccess for devs),
then create custom least-privilege policies as you understand access patterns.

Rationale: For small teams, velocity matters. Start secure (MFA, roles, no root access)
but don't over-engineer IAM policies before you understand your access patterns.
```

**Medium Team (6-20 people), Growth Stage**:
```
Recommendation: Implement structured IAM with least privilege.

Approach:
1. Use IAM Identity Center with groups and permission sets (REQUIRED)
2. Create custom least-privilege policies for each role
3. Use IAM Access Analyzer to generate policies from CloudTrail logs
4. Implement SCPs for organization-wide guardrails
5. Regular access reviews (quarterly)
6. Separate accounts per environment and team

Trade-off: More IAM complexity for better security and compliance.
- Cost: 10-20 hours/month for IAM management
- Benefit: Reduced blast radius, better compliance, audit trail

Recommendation: Invest in proper IAM structure now to avoid refactoring later.
```

**Large Team (20+ people), Enterprise**:
```
Recommendation: Comprehensive IAM with automation and governance.

REQUIRED:
- IAM Identity Center with federated access
- Least-privilege custom policies for all roles
- SCPs for organization-wide controls
- Automated access reviews and certification
- Just-in-time access for privileged operations
- Comprehensive audit logging and monitoring
- Separate accounts per workload (not just per environment)

Cost: Dedicated IAM/security team or 40+ hours/month
Complexity: High (but necessary for scale and compliance)

Trade-off: Significant IAM overhead for maximum security and compliance.
Recommendation: This is non-negotiable at enterprise scale.
```

### Trade-Off 3: Security Monitoring Depth

#### Context-Dependent Monitoring

**Development Environment**:
```
Recommendation: Basic monitoring is sufficient.

Minimal Security Monitoring:
- CloudTrail enabled (REQUIRED - free tier covers most dev activity)
- Basic CloudWatch alarms for root account usage
- AWS Config for critical resources only (optional)
- GuardDuty: Optional (consider for shared dev accounts)

Cost: $0-20/month
Complexity: Low

Trade-off: Minimal monitoring cost vs. limited visibility.
Recommendation: Basic monitoring is sufficient for dev. Invest in prod monitoring.
```

**Production Environment - Internal Tools**:
```
Recommendation: Standard security monitoring.

Standard Security Monitoring:
- CloudTrail enabled in all regions (REQUIRED)
- GuardDuty enabled (REQUIRED)
- Security Hub with AWS Foundational Security standard
- CloudWatch alarms for security events
- VPC Flow Logs for network analysis
- AWS Config for compliance tracking

Cost: $50-200/month (depending on activity)
Complexity: Medium

Trade-off: Monitoring cost vs. threat detection and compliance.
Recommendation: Standard monitoring is required for production.
```

**Production Environment - Customer-Facing/Critical**:
```
Recommendation: Comprehensive security monitoring (REQUIRED).

Comprehensive Security Monitoring:
- CloudTrail enabled in all regions with S3 + CloudWatch Logs
- GuardDuty enabled with S3 protection and EKS protection
- Security Hub with multiple standards (CIS, PCI-DSS, etc.)
- Amazon Macie for sensitive data discovery
- IAM Access Analyzer for external access
- AWS Config with automated remediation
- VPC Flow Logs with analysis
- CloudWatch Insights for log analysis
- EventBridge rules for automated response
- Third-party SIEM integration (Splunk, Datadog, etc.)

Cost: $500-2000/month
Complexity: High

Trade-off: Significant monitoring cost vs. comprehensive threat detection.
Recommendation: This is non-negotiable for critical systems.

Rationale: 1-hour outage from security incident costs $10K-100K+.
Monitoring cost is 1-5% of potential incident cost.
```

### Trade-Off 4: Network Security Complexity

#### Context-Dependent Network Security

**Simple Application (Single-Tier)**:
```
Recommendation: Basic VPC with security groups.

Approach:
- Single VPC with public and private subnets
- Security groups for instance-level firewalls
- NACLs at default (allow all)
- VPC endpoints for AWS services (optional)
- No NAT Gateway (use NAT instances or public subnets)

Cost: $0-50/month
Complexity: Low

Trade-off: Simpler network vs. less defense-in-depth.
Recommendation: Sufficient for simple applications with basic security needs.
```

**Multi-Tier Application (Web/App/DB)**:
```
Recommendation: Segmented VPC with defense-in-depth.

Approach:
- VPC with public, private, and data subnets
- Security groups for each tier with least privilege
- NACLs for subnet-level protection
- VPC endpoints for AWS services (S3, DynamoDB)
- NAT Gateway for private subnet internet access
- VPC Flow Logs for traffic analysis

Cost: $100-300/month (NAT Gateway is $32/month + data transfer)
Complexity: Medium

Trade-off: NAT Gateway cost vs. security and reliability.
- NAT Gateway: $32/month + data transfer, highly available
- NAT Instance: $10-20/month, single point of failure

Recommendation: Use NAT Gateway for production (worth the cost for reliability).
```

**Highly Regulated/Sensitive Application**:
```
Recommendation: Comprehensive network security (REQUIRED).

REQUIRED:
- VPC with multiple subnet tiers (public, private, data, management)
- Security groups with least privilege (no 0.0.0.0/0 except load balancers)
- NACLs for subnet-level protection
- VPC endpoints for all AWS services (avoid internet traffic)
- NAT Gateway in multiple AZs
- VPC Flow Logs with analysis
- AWS Network Firewall for advanced filtering
- PrivateLink for service access
- Transit Gateway for multi-VPC connectivity
- AWS WAF for application-layer protection

Cost: $500-2000/month
Complexity: High

Trade-off: Significant network complexity vs. maximum security.
Recommendation: This is required for regulated industries (HIPAA, PCI-DSS, FedRAMP).
```

### Trade-Off 5: Security vs. Developer Velocity

#### Context-Dependent Security Controls

**Startup/MVP Phase**:
```
Recommendation: Security fundamentals without over-engineering.

REQUIRED (Non-Negotiable):
- No hardcoded secrets (use Secrets Manager or Parameter Store)
- IAM roles for all AWS resources (no access keys)
- MFA for all users
- Encryption for any sensitive data
- CloudTrail enabled

RECOMMENDED (Balance with velocity):
- Start with AWS-managed IAM policies, refine later
- Basic security monitoring (CloudTrail + GuardDuty)
- Single AWS account initially, separate later
- Manual security reviews before major releases

DEFER (Add as you grow):
- Comprehensive least-privilege IAM policies
- Advanced monitoring and SIEM integration
- Network segmentation beyond basic public/private
- Automated security testing in CI/CD

Trade-off: Faster development vs. comprehensive security.
Recommendation: Implement security fundamentals, add advanced controls as you scale.

Rationale: Perfect security on day 1 slows product validation. Implement fundamentals
(no secrets in code, MFA, encryption) and add advanced controls as you grow.
```

**Growth Stage**:
```
Recommendation: Structured security with automation.

Time to invest in:
- Least-privilege IAM policies
- Comprehensive monitoring (GuardDuty, Security Hub, Config)
- Separate AWS accounts per environment
- Security testing in CI/CD pipeline
- Regular security reviews and penetration testing
- Incident response procedures

Cost: 10-20% of engineering time + $500-2000/month for tools
Benefit: Reduced security incidents, faster compliance, better customer trust

Trade-off: Security investment vs. feature development time.
Recommendation: Allocate 10-20% of engineering time to security.
```

**Enterprise/Regulated**:
```
Recommendation: Comprehensive security program (REQUIRED).

REQUIRED:
- Dedicated security team
- Comprehensive IAM with least privilege
- Advanced monitoring and SIEM
- Automated security testing
- Regular penetration testing and audits
- Incident response team and procedures
- Compliance certifications (SOC 2, ISO 27001, etc.)
- Security training for all engineers

Cost: 20-30% of engineering budget
Complexity: High

Trade-off: None - this is required for enterprise and regulated industries.
```

### Decision Framework: Security Investment

Use this framework to determine appropriate security investment:

| Factor | Minimal | Standard | Comprehensive |
|--------|---------|----------|---------------|
| **Environment** | Development | Production (internal) | Production (customer-facing) |
| **Data Sensitivity** | Public/Internal | Confidential | PII/Financial/Health |
| **Regulatory Requirements** | None | Basic compliance | HIPAA/PCI-DSS/FedRAMP |
| **Team Size** | 1-5 people | 6-20 people | 20+ people |
| **Budget** | Tight | Moderate | Flexible |
| **Encryption** | Optional/SSE-S3 | KMS AWS-managed | KMS CMK (REQUIRED) |
| **IAM Complexity** | AWS-managed policies | Custom policies | Least privilege + automation |
| **Monitoring** | CloudTrail only | GuardDuty + Security Hub | Comprehensive + SIEM |
| **Network Security** | Basic VPC | Segmented VPC | Advanced (Firewall, PrivateLink) |
| **Monthly Cost** | $0-50 | $200-500 | $1000-5000 |
| **Engineering Time** | 5% | 10-20% | 20-30% |

### Key Takeaways for Context-Aware Security

1. **Security Fundamentals are Non-Negotiable**: No hardcoded secrets, IAM roles, MFA, encryption for sensitive data
2. **Implementation Details are Context-Dependent**: Encryption approach, IAM complexity, monitoring depth
3. **Regulatory Requirements Override Context**: HIPAA, PCI-DSS, GDPR requirements are mandatory
4. **Environment Matters**: Different standards for dev vs. production
5. **Balance Security and Velocity**: Especially important for startups and small teams
6. **Invest Progressively**: Start with fundamentals, add advanced controls as you grow
7. **Quantify Trade-Offs**: Use cost and time estimates to make informed decisions
8. **Document Decisions**: Record why you chose specific security approaches

### Anti-Patterns to Avoid

❌ **Over-Engineering Security for MVP**: Spending months on perfect IAM policies before validating product
❌ **Under-Investing in Production Security**: Treating production like development
❌ **Ignoring Regulatory Requirements**: Assuming encryption is optional for PII data
❌ **One-Size-Fits-All**: Same security controls for dev and prod
❌ **Security as Afterthought**: Adding security after building the application
❌ **Ignoring Cost**: Implementing expensive security controls without considering budget
❌ **Analysis Paralysis**: Waiting for perfect security before launching

✅ **Security Fundamentals First**: Implement non-negotiables (no secrets, MFA, encryption)
✅ **Progressive Enhancement**: Add advanced controls as you grow
✅ **Context-Aware Decisions**: Different approaches for different situations
✅ **Compliance-Driven**: Let regulatory requirements drive security investment
✅ **Balanced Approach**: Security that enables business, not blocks it
✅ **Cost-Conscious**: Choose appropriate security level for budget and risk
✅ **Pragmatic Security**: Ship with good security, improve continuously

## Summary

The Security Pillar is foundational to building trustworthy systems on AWS. By implementing the best practices in this guide, you can:

- **Protect your data** with encryption at rest and in transit
- **Control access** with IAM roles and least privilege policies
- **Detect threats** with GuardDuty, Security Hub, and CloudTrail
- **Respond to incidents** with automated remediation and forensics
- **Maintain compliance** with industry standards and regulations
- **Continuously improve** security posture through monitoring and testing
- **Secure application code** across all programming languages

Remember: Security is not a one-time effort but a continuous process. Regularly review your security posture at both the infrastructure and application layers, stay informed about new threats and AWS security features, and always apply defense in depth principles.

Use the Security Assessment MCP Server to automate security checks and the Knowledge MCP Server to access the latest AWS security guidance. When in doubt, follow the principle of least privilege and encrypt everything - in both infrastructure and application code.


---

## Mode-Aware Guidance for Security Reviews

This section guides Kiro on how to adapt Security Pillar reviews based on the current review mode (Simple, Context-Aware, or Full Analysis). Each mode provides different levels of detail and analysis appropriate for different use cases.

### Simple Mode - Security Reviews

**When to Use:** CI/CD pipelines, quick checks, development environment reviews, pre-commit hooks

**Token Budget:** 17-25K tokens | **Target Latency:** 2.5-6 seconds

**What to Include in Simple Mode:**

1. **Direct Violation Identification**
   - Flag clear security violations without context gathering
   - Use prescriptive language: "Enable encryption", "Add MFA", "Remove public access"
   - Assign risk levels (High, Medium, Low) based on standard criteria
   - Provide specific line numbers and file references

2. **Prescriptive Recommendations**
   - Give direct remediation steps without trade-off discussion
   - Use code examples showing the fix
   - Focus on Well-Architected best practices without customization
   - No context questions about environment, data classification, or budget

3. **Standard Risk Assessment**
   - High Risk: Unencrypted sensitive data, public access to databases, overly permissive IAM
   - Medium Risk: Missing MFA, single-AZ deployments, broad security groups
   - Low Risk: Missing tags, suboptimal configurations, minor improvements

4. **Output Format**
   ```
   ❌ HIGH RISK: S3 bucket lacks encryption at rest
   Location: main.tf:45
   Issue: server_side_encryption_configuration block is missing
   Recommendation: Add server_side_encryption_configuration with AES256 or aws:kms
   Remediation:
   [Code example showing the fix]
   ```

**What to EXCLUDE in Simple Mode:**
- ❌ Context questions (environment type, SLA, budget, data classification)
- ❌ Trade-off discussions (cost vs. security, complexity vs. benefit)
- ❌ Alternative approaches with pros/cons
- ❌ Decision matrices or scenario matching
- ❌ Conditional guidance based on context
- ❌ Long explanations of why something is a best practice

**Example Simple Mode Output:**
```
Security Review Results (Simple Mode)

❌ HIGH RISK: RDS instance lacks encryption at rest
Location: database.tf:23
Recommendation: Enable storage_encrypted = true
Remediation: Add encryption configuration to RDS instance

❌ HIGH RISK: S3 bucket allows public access
Location: storage.tf:12
Recommendation: Set block_public_acls = true and block_public_policy = true
Remediation: Add aws_s3_bucket_public_access_block resource

⚠️ MEDIUM RISK: Security group allows SSH from 0.0.0.0/0
Location: network.tf:45
Recommendation: Restrict SSH access to specific IP ranges
Remediation: Change cidr_blocks from ["0.0.0.0/0"] to your office IP range

✓ 3 issues found: 2 high-risk, 1 medium-risk
```

### Context-Aware Mode - Security Reviews

**When to Use:** Interactive sessions, production reviews, staging reviews, architecture decisions

**Token Budget:** 35-50K tokens | **Target Latency:** 4-8 seconds

**What to Include in Context-Aware Mode:**

1. **Context Gathering (3-5 Key Questions)**
   - "What environment is this? (development/staging/production)"
   - "What's your data classification? (public/internal/confidential/PII)"
   - "What are your regulatory requirements? (GDPR/HIPAA/PCI-DSS/none)"
   - "What's your budget constraint? (tight/moderate/flexible)"
   - "What's your team size and security maturity?"

2. **Conditional Recommendations Based on Context**
   - Provide different guidance for dev vs. production
   - Adjust encryption recommendations based on data classification
   - Explain when security controls are required vs. optional
   - Consider budget constraints in recommendations

3. **Trade-Off Explanations for Key Decisions**
   - Explain security vs. cost trade-offs (e.g., KMS CMK vs. SSE-S3)
   - Discuss security vs. complexity trade-offs (e.g., IAM complexity)
   - Provide cost estimates for security improvements
   - Explain when to defer security controls vs. implement immediately

4. **Alternative Approaches with Pros/Cons**
   - Present multiple valid security approaches
   - Explain when each approach is appropriate
   - Provide decision criteria for choosing between options

5. **Output Format**
   ```
   ⚠️ CONTEXT-DEPENDENT: RDS instance lacks Multi-AZ configuration
   Location: database.tf:23
   
   Context Questions:
   - What environment is this? (development/staging/production)
   - What's your availability requirement?
   - What's your data classification?
   
   Conditional Guidance:
   - FOR production with confidential data: Multi-AZ is REQUIRED
     - Security benefit: Automatic failover, data redundancy
     - Cost impact: 2x database cost (~$200/mo → ~$400/mo)
   
   - FOR development: Single-AZ is ACCEPTABLE
     - Cost savings: 50% reduction
     - Trade-off: Manual recovery needed, acceptable for dev
   
   Recommendation: Based on your context, choose appropriate configuration.
   ```

**What to INCLUDE in Context-Aware Mode:**
- ✅ Context questions (3-5 key questions, not exhaustive)
- ✅ Conditional recommendations based on gathered context
- ✅ Trade-off explanations for major security decisions
- ✅ Cost-benefit analysis for key recommendations
- ✅ Alternative approaches with use cases
- ✅ Environment-specific guidance (dev/staging/prod)
- ✅ Regulatory requirement explanations

**What to EXCLUDE in Context-Aware Mode:**
- ❌ Comprehensive decision matrices (save for Full Analysis)
- ❌ Detailed quantitative cost analysis (save for Full Analysis)
- ❌ Scenario matching with examples (save for Full Analysis)
- ❌ Multi-pillar impact analysis (save for Full Analysis)
- ❌ Long-term strategic implications (save for Full Analysis)

**Example Context-Aware Mode Output:**
```
Security Review Results (Context-Aware Mode)

Context Gathered:
- Environment: Production
- Data Classification: Confidential (customer data)
- Regulatory Requirements: GDPR compliance required
- Budget: Moderate ($5K/month infrastructure)
- Team Size: 10 engineers

❌ HIGH RISK: S3 bucket lacks encryption at rest
Location: storage.tf:12

Context Analysis:
- Production environment with customer data
- GDPR requires encryption for personal data
- This is a compliance requirement, not optional

Recommendation: Enable KMS encryption with customer-managed keys (REQUIRED)

Trade-Offs:
- Cost: $1/month per key + $0.03 per 10,000 requests
- Complexity: Medium (key management, rotation)
- Benefit: GDPR compliance, full audit trail, key control

Alternative Approaches:
1. SSE-S3 (AWS-managed): NOT SUFFICIENT for GDPR
2. KMS AWS-managed: Meets basic requirements but limited control
3. KMS CMK: RECOMMENDED - full control and audit trail

Decision: Use KMS CMK (option 3) for GDPR compliance.

⚠️ CONTEXT-DEPENDENT: Security group allows SSH from 0.0.0.0/0
Location: network.tf:45

Context Analysis:
- Production environment
- Moderate security maturity team

Conditional Guidance:
- FOR production: Restrict to specific IP ranges (REQUIRED)
  - Options: Office IP, VPN IP, bastion host only
  - Cost: $0 (configuration change only)
  - Complexity: Low (update security group rules)

- FOR development: 0.0.0.0/0 may be acceptable if:
  - Using key-based authentication (no passwords)
  - Temporary instances (not long-lived)
  - Non-sensitive data

Recommendation: Restrict SSH to office IP range or VPN for production.

Trade-Off: Convenience vs. security
- 0.0.0.0/0: Easy access, high security risk
- Specific IPs: Requires VPN/IP management, much more secure

Cost-Benefit: $0 cost, 10 minutes to implement, eliminates major attack vector.

✓ 2 issues found: 1 required fix (GDPR), 1 context-dependent recommendation
```

### Full Analysis Mode - Security Reviews

**When to Use:** Major architecture decisions, explicit user request, complex trade-off scenarios, compliance planning

**Token Budget:** 70-95K tokens | **Target Latency:** 5-10 seconds

**What to Include in Full Analysis Mode:**

1. **Comprehensive Context Gathering**
   - All context questions from Context-Aware Mode
   - Additional questions about long-term plans, growth expectations
   - Compliance roadmap and certification goals
   - Security maturity assessment
   - Incident history and risk tolerance

2. **Detailed Trade-Off Analysis Across All Pillars**
   - Security vs. Cost with quantitative estimates
   - Security vs. Performance (encryption overhead, network latency)
   - Security vs. Operational Complexity
   - Security vs. Developer Velocity
   - Multi-pillar impact analysis

3. **Decision Matrices Comparing Multiple Options**
   - Load and present decision matrices for major security decisions
   - Compare 3-5 options with scoring across multiple criteria
   - Include quantitative cost estimates and ROI calculations
   - Provide weighted recommendations based on context

4. **Scenario Matching with Examples**
   - Match user's situation to common scenarios (startup, growth, enterprise)
   - Provide examples of similar companies and their security approaches
   - Include lessons learned and common pitfalls
   - Reference industry benchmarks and standards

5. **Quantitative Cost-Benefit Analysis**
   - Detailed cost breakdowns (monthly, annual, 3-year)
   - ROI calculations for security investments
   - Downtime cost estimates vs. security improvement costs
   - Compliance cost avoidance (fines, penalties)

6. **Long-Term Implications and Roadmap**
   - Discuss how security decisions impact future scalability
   - Provide migration paths from current to ideal state
   - Explain technical debt implications of security shortcuts
   - Suggest phased implementation approaches

7. **Output Format**
   ```
   🔍 COMPREHENSIVE ANALYSIS: Database Encryption Strategy
   Location: database.tf:23
   
   Context Gathered:
   - Environment: Production
   - Data Classification: PII (customer names, emails, addresses)
   - Regulatory: GDPR compliance required
   - Budget: Moderate ($5K/month, can increase for compliance)
   - Team: 10 engineers, moderate security maturity
   - Growth: 2x expected in 12 months
   - Compliance Goals: SOC 2 Type II in 6 months
   
   Decision Matrix: Database Encryption Options
   
   | Option | Security | Cost | Complexity | Compliance | Audit | Best For |
   |--------|----------|------|------------|------------|-------|----------|
   | No Encryption | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ | Never (non-compliant) |
   | AWS-Managed Keys | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ | ⭐⭐ | Basic compliance |
   | KMS CMK | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | GDPR, SOC 2 |
   | HSM/CloudHSM | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ✅ | ⭐⭐⭐⭐⭐ | FIPS 140-2 Level 3 |
   
   Recommended: KMS with Customer-Managed Keys (CMK)
   
   Pillar Impact Analysis:
   ✅ Security: +HIGH
      - Encryption at rest for all PII data
      - Full control over key policies and rotation
      - Comprehensive audit trail via CloudTrail
      - Meets GDPR Article 32 (security of processing)
      - Meets SOC 2 CC6.1 (logical access controls)
   
   ⚠️ Cost: +LOW
      - KMS CMK: $1/month per key
      - API requests: $0.03 per 10,000 requests (~$5/month)
      - Total: ~$6/month ($72/year)
      - Negligible compared to $5K/month infrastructure budget (0.1%)
   
   ⚠️ Performance: -MINIMAL
      - Encryption overhead: <1% CPU impact
      - Latency: +0.5-1ms per encrypted operation
      - Negligible for most applications
   
   ✅ Operational Excellence: +MEDIUM
      - Automated key rotation available
      - CloudTrail logging of all key operations
      - Centralized key management
      - Requires key management procedures
   
   ⚠️ Reliability: NEUTRAL
      - KMS is highly available (99.99% SLA)
      - Multi-region key replication available
      - No impact on database availability
   
   Cost-Benefit Analysis:
   - Implementation Cost: $6/month ($72/year)
   - Engineering Time: 4 hours initial setup + 1 hour/month management
   - Compliance Benefit: Meets GDPR requirements (avoids fines up to €20M)
   - SOC 2 Benefit: Required for certification (enables enterprise sales)
   - Downtime Avoidance: N/A (encryption doesn't prevent downtime)
   - Net Benefit: Massive positive ROI (compliance enabler)
   
   Trade-Off Scenarios:
   
   1. Startup with Tight Budget:
      - Start with AWS-managed keys (free)
      - Migrate to KMS CMK before handling PII
      - Cost: $0 initially, $6/month after PII
      - Risk: Must migrate before collecting PII (technical debt)
   
   2. Growth Stage with Moderate Budget (YOUR SITUATION):
      - Implement KMS CMK immediately
      - Enable automatic key rotation
      - Document key management procedures
      - Cost: $6/month (negligible)
      - Benefit: GDPR compliant, SOC 2 ready, no migration needed
   
   3. Enterprise with Strict Compliance:
      - KMS CMK with manual rotation
      - Multi-region key replication
      - Dedicated key management team
      - Consider CloudHSM for FIPS 140-2 Level 3
      - Cost: $6-1200/month (depending on HSM needs)
   
   Decision: IMPLEMENT KMS CMK (Option 2)
   
   Rationale:
   - GDPR compliance is non-negotiable for PII data
   - SOC 2 certification requires encryption with customer-managed keys
   - Cost is negligible ($6/month = 0.1% of infrastructure budget)
   - No performance impact (<1% CPU, +1ms latency)
   - Enables enterprise sales (SOC 2 requirement)
   - Avoids future migration (implement correctly now)
   
   Implementation Roadmap:
   
   Phase 1 (Week 1): Enable KMS CMK for RDS
   - Create KMS customer-managed key
   - Enable automatic key rotation
   - Update RDS instance to use KMS CMK
   - Test encryption and key access
   - Estimated time: 4 hours
   
   Phase 2 (Week 2): Implement key management procedures
   - Document key policies and access controls
   - Set up CloudTrail monitoring for key usage
   - Create CloudWatch alarms for key operations
   - Train team on key management
   - Estimated time: 4 hours
   
   Phase 3 (Month 2): Extend to all data stores
   - Enable KMS CMK for S3 buckets with PII
   - Enable KMS CMK for EBS volumes
   - Enable KMS CMK for backups
   - Estimated time: 8 hours
   
   Total Implementation: 16 hours over 2 months
   Total Cost: $6/month ongoing
   
   Risk of NOT Implementing:
   - GDPR non-compliance: Fines up to €20M or 4% of global revenue
   - SOC 2 failure: Cannot sell to enterprise customers
   - Data breach impact: Unencrypted data = higher liability
   - Reputation damage: "Company X leaked unencrypted customer data"
   
   Risk of Implementing:
   - Minimal: $6/month cost, 16 hours engineering time
   - Key management complexity (mitigated by automation)
   - Potential key deletion risk (mitigated by key policies)
   
   Conclusion: The decision is clear - implement KMS CMK immediately.
   Cost is negligible, compliance benefit is massive, risk of not implementing is severe.
   ```

**What to INCLUDE in Full Analysis Mode:**
- ✅ Comprehensive context gathering (10+ questions)
- ✅ Detailed trade-off analysis across all pillars
- ✅ Decision matrices with 3-5 options compared
- ✅ Quantitative cost-benefit analysis with ROI
- ✅ Scenario matching (startup/growth/enterprise)
- ✅ Long-term implications and technical debt discussion
- ✅ Phased implementation roadmap
- ✅ Risk analysis (risk of implementing vs. not implementing)
- ✅ Multi-pillar impact analysis
- ✅ Industry benchmarks and standards
- ✅ Compliance cost avoidance calculations

**What to EXCLUDE in Full Analysis Mode:**
- Nothing - Full Analysis Mode includes everything

**Example Full Analysis Mode Output:**
See the comprehensive example above for database encryption strategy.

### Mode Selection for Security Reviews

**Automatic Mode Detection:**

1. **Simple Mode Triggers:**
   - CI/CD environment (CI=true)
   - File path contains `/dev/` or `-dev.`
   - User requests "quick review" or "fast check"
   - Pre-commit hook execution

2. **Context-Aware Mode Triggers:**
   - File path contains `/prod/` or `/staging/`
   - Interactive session (user can answer questions)
   - User requests "review with context"
   - Default for most interactive reviews

3. **Full Analysis Mode Triggers:**
   - User explicitly requests "full analysis" or "comprehensive review"
   - User asks "compare options" or "trade-off analysis"
   - Major architecture decision context
   - Compliance planning session

**Mode Switching Mid-Session:**

Users can escalate or simplify modes during a review:

- **Escalate:** "Can you explain the trade-offs?" → Switch to Context-Aware
- **Escalate:** "I need a full analysis with cost comparison" → Switch to Full Analysis
- **Simplify:** "Just tell me what's wrong" → Switch to Simple

When switching modes, preserve all context already gathered (don't re-ask questions).

### Best Practices for Mode-Aware Security Reviews

**For Simple Mode:**
- Focus on clear violations only
- Use prescriptive language without explanation
- Keep output concise and actionable
- Provide code examples for fixes
- Don't ask context questions

**For Context-Aware Mode:**
- Ask 3-5 key context questions upfront
- Provide conditional guidance based on context
- Explain trade-offs for major decisions
- Offer 2-3 alternative approaches
- Include cost estimates for recommendations

**For Full Analysis Mode:**
- Gather comprehensive context (10+ questions)
- Load relevant decision matrices
- Provide quantitative cost-benefit analysis
- Include scenario matching and examples
- Discuss long-term implications
- Provide phased implementation roadmap

### Common Security Review Scenarios by Mode

**Scenario 1: Unencrypted S3 Bucket**

- **Simple Mode:** "❌ HIGH RISK: Enable encryption. Add server_side_encryption_configuration."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For production with confidential data, use KMS CMK ($1/month). For dev, SSE-S3 is acceptable."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing SSE-S3, KMS AWS-managed, KMS CMK with costs, compliance, and use cases]"

**Scenario 2: Overly Permissive IAM Policy**

- **Simple Mode:** "❌ HIGH RISK: Policy allows * actions. Restrict to specific actions needed."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For small team (1-5 people), start with AWS-managed policies. For larger team, implement least privilege."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing IAM approaches for different team sizes with complexity, security, and cost trade-offs]"

**Scenario 3: Missing Multi-AZ**

- **Simple Mode:** "⚠️ MEDIUM RISK: Enable Multi-AZ for high availability."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For production with 99.9% SLA, Multi-AZ is REQUIRED (2x cost). For dev, Single-AZ is acceptable."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing Single-AZ, Multi-AZ, Aurora Global with availability, cost, and use cases]"

### Summary

Mode-aware security reviews ensure that Kiro provides the right level of detail for each situation:

- **Simple Mode:** Fast, prescriptive, no context - perfect for CI/CD and quick checks
- **Context-Aware Mode:** Balanced, conditional, with context - ideal for interactive production reviews
- **Full Analysis Mode:** Comprehensive, detailed, with matrices - best for major architecture decisions

Always announce the mode at the start of a review and allow users to switch modes if they need more or less detail. Preserve context when switching modes to avoid re-asking questions.
