# Code Generation Guidance - AWS Well-Architected Framework

## Overview

This steering file guides Kiro on automatically applying Well-Architected Framework best practices when generating infrastructure code. When users request infrastructure code generation, Kiro should proactively incorporate security, reliability, performance, and cost optimization principles into the generated code, along with inline comments explaining the architectural decisions.

### Core Principles for Code Generation

1. **Context-Aware**: Ask about environment (dev/staging/prod), SLA, budget, and data classification before generating code
2. **Security by Default**: Always generate code with encryption, least privilege IAM, and secure network configurations
3. **Reliability First**: Include multi-AZ deployments, backup configurations, and fault tolerance patterns (context-dependent)
4. **Performance Aware**: Use appropriate instance sizing, caching strategies, and efficient resource configurations
5. **Cost Optimized**: Implement right-sizing, auto-scaling, and cost-effective resource choices based on context
6. **Well Documented**: Add inline comments explaining Well-Architected decisions and trade-offs
7. **Production Ready**: Generate code that's ready for the target environment, with appropriate trade-offs explained

## Context-Aware Code Generation

### Gathering Context Before Generation

Before generating infrastructure code, gather context to provide appropriate recommendations:

**Essential Context Questions:**
1. **Environment**: "What environment is this for? (development, staging, production)"
2. **SLA Requirements**: "Do you have specific availability requirements?" (if production)
3. **Budget**: "What's your budget sensitivity? (tight, moderate, flexible)"
4. **Data Classification**: "Will this handle sensitive data (PII, financial, health)?"
5. **Performance**: "Do you have specific latency or throughput requirements?"

**Example Context Gathering:**
```
User: "Generate Terraform code for an RDS database"

Kiro: "I'll generate that for you. First, let me gather some context:
- What environment is this for? (development, staging, production)
- Will this handle sensitive data?
- Do you have specific availability requirements?

This will help me generate code with appropriate configurations and trade-offs."
```

### Environment-Specific Code Generation

#### Development Environment

**Characteristics:**
- Cost optimization prioritized
- Simplicity over redundancy
- Acceptable downtime
- No sensitive data (usually)

**Code Generation Adjustments:**
- Single-AZ deployments
- Smaller instance sizes (t4g family)
- Basic monitoring
- AWS-managed encryption keys
- Shorter backup retention (7 days)
- Can stop instances outside business hours

**Example: Development RDS**
```hcl
# Terraform - Development RDS Database
resource "aws_db_instance" "dev_database" {
  identifier = "app-dev-db"
  engine     = "postgres"
  engine_version = "15.4"
  
  # Development: Use smaller instance for cost savings
  instance_class = "db.t4g.medium"  # $60/month vs $365/month for production
  
  # Development: Single-AZ acceptable (save 50% cost)
  multi_az = false  # Trade-off: Cost savings vs. availability
  
  allocated_storage = 20  # Start small for dev
  storage_encrypted = true
  
  # Development: AWS-managed keys sufficient
  # kms_key_id not specified - uses AWS-managed key (free)
  
  # Development: Shorter backup retention
  backup_retention_period = 7  # vs 30 days for production
  
  # Development: Can delete without protection
  deletion_protection = false
  
  # Development: Basic monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Trade-off Explanation:
  # - Single-AZ saves $60/month but means 1-2 hour recovery time if AZ fails
  # - Smaller instance saves $305/month but may be slower under load
  # - Acceptable for development where cost > availability
}
```

#### Production Environment

**Characteristics:**
- Reliability and security prioritized
- High availability required
- Sensitive data handling
- Comprehensive monitoring

**Code Generation Adjustments:**
- Multi-AZ deployments
- Appropriate instance sizing
- Comprehensive monitoring
- Customer-managed encryption keys (KMS CMK)
- Longer backup retention (30+ days)
- Deletion protection enabled

**Example: Production RDS**
```hcl
# Terraform - Production RDS Database
resource "aws_db_instance" "prod_database" {
  identifier = "app-prod-db"
  engine     = "postgres"
  engine_version = "15.4"
  
  # Production: Appropriate sizing for load
  instance_class = "db.r6g.large"  # $365/month - memory-optimized
  
  # Production: Multi-AZ REQUIRED for 99.95% availability
  multi_az = true  # Trade-off: 2x cost for automatic failover
  
  allocated_storage = 100
  storage_encrypted = true
  
  # Production: Customer-managed KMS key for audit trail
  kms_key_id = aws_kms_key.database.arn  # +$1/month for key
  
  # Production: Extended backup retention for compliance
  backup_retention_period = 30  # 30-day retention
  
  # Production: Protect against accidental deletion
  deletion_protection = true
  
  # Production: Comprehensive monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval = 60  # Enhanced monitoring
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  
  # Production: Performance Insights for query analysis
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  
  # Trade-off Explanation:
  # - Multi-AZ doubles cost ($365 → $730/month) but provides:
  #   * 99.95% availability vs 99% (4.4 hours vs 3.65 days downtime/year)
  #   * Automatic failover in 60-120 seconds
  #   * Required for production SLA commitments
  # - Customer-managed KMS key adds $1/month but provides:
  #   * Full audit trail of key usage
  #   * Compliance with GDPR, HIPAA, PCI-DSS
  #   * Custom key rotation policies
}

# KMS key for production database encryption
resource "aws_kms_key" "database" {
  description = "Encryption key for production database"
  
  # Production: Enable automatic key rotation
  enable_key_rotation = true
  
  # Production: Prevent accidental deletion
  deletion_window_in_days = 30
}
```

#### Staging Environment

**Characteristics:**
- Production-like for testing
- Balance cost and reliability
- Test failover scenarios
- Similar security to production

**Code Generation Adjustments:**
- Multi-AZ recommended (test failover)
- Smaller than production but production-like
- Production-like monitoring
- Customer-managed keys (match production)
- Moderate backup retention (14 days)

**Example: Staging RDS**
```hcl
# Terraform - Staging RDS Database
resource "aws_db_instance" "staging_database" {
  identifier = "app-staging-db"
  engine     = "postgres"
  engine_version = "15.4"
  
  # Staging: Smaller than production but production-like
  instance_class = "db.t4g.large"  # $120/month - between dev and prod
  
  # Staging: Multi-AZ recommended to test failover scenarios
  multi_az = true  # Test production-like behavior
  
  allocated_storage = 50  # Smaller than production
  storage_encrypted = true
  
  # Staging: Match production encryption for testing
  kms_key_id = aws_kms_key.database.arn
  
  # Staging: Moderate backup retention
  backup_retention_period = 14  # Between dev (7) and prod (30)
  
  # Staging: Can delete if needed
  deletion_protection = false
  
  # Staging: Production-like monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  
  # Trade-off Explanation:
  # - Multi-AZ in staging costs 2x ($120 → $240/month) but:
  #   * Allows testing failover procedures
  #   * Validates production-like behavior
  #   * Catches issues before production deployment
  # - Smaller instance than production saves $125/month
  # - Balance between cost-effective and production-representative
}
```

### Trade-Off Explanations in Generated Code

**Always Include Trade-Off Comments:**

```hcl
# Good: Explains the trade-off
multi_az = true  # Trade-off: 2x cost ($120 → $240/month) for 99.95% availability and automatic failover

# Good: Explains when to use
instance_class = "db.t4g.medium"  # Development: Cost-optimized ($60/month), acceptable for non-production

# Good: Explains the benefit
kms_key_id = aws_kms_key.database.arn  # Production: Required for PII/PHI, provides audit trail (+$1/month)

# Bad: No explanation
multi_az = true

# Bad: Vague explanation
multi_az = true  # Enable Multi-AZ
```

### Conditional Code Generation Based on Context

**Example: Context-Driven Generation**

```
User: "Generate Terraform for an RDS database"
Kiro: "What environment? (dev/staging/prod)"
User: "Production with 99.9% SLA, handling PII"

Kiro generates:
- Multi-AZ: REQUIRED (for 99.9% SLA)
- KMS CMK: REQUIRED (for PII compliance)
- Instance: db.r6g.large (appropriate for production)
- Backups: 30-day retention (compliance)
- Monitoring: Comprehensive (production observability)
- Deletion Protection: Enabled (prevent accidents)

All with inline comments explaining trade-offs and requirements.
```

**Example: Different Context**

```
User: "Generate Terraform for an RDS database"
Kiro: "What environment? (dev/staging/prod)"
User: "Development, no sensitive data"

Kiro generates:
- Single-AZ: ACCEPTABLE (cost savings for dev)
- AWS-managed encryption: SUFFICIENT (no compliance needs)
- Instance: db.t4g.medium (cost-optimized for dev)
- Backups: 7-day retention (adequate for dev)
- Monitoring: Basic (CloudWatch logs only)
- Deletion Protection: Disabled (easier cleanup)

All with inline comments explaining cost savings and trade-offs.
```

## Security Best Practices for Code Generation

### Principle: Secure by Default

When generating infrastructure code, ALWAYS include security best practices without the user needing to ask. Security should be the default, not an afterthought.

### Encryption

**Always Enable Encryption at Rest**

For S3 buckets:
```hcl
# Terraform - S3 bucket with KMS encryption
resource "aws_s3_bucket" "data" {
  bucket = "my-application-data"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"  # Well-Architected: Use KMS for encryption at rest
      kms_master_key_id = aws_kms_key.data.arn
    }
    bucket_key_enabled = true  # Cost Optimization: Reduce KMS API calls
  }
}

# Well-Architected: Enable versioning for data protection and recovery
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

For RDS databases:
```yaml
# CloudFormation - RDS with encryption
Database:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: app-database
    Engine: postgres
    EngineVersion: '15.4'
    DBInstanceClass: db.r6g.large
    AllocatedStorage: 100
    # Well-Architected Security: Enable encryption at rest
    StorageEncrypted: true
    KmsKeyId: !Ref DatabaseEncryptionKey
    # Well-Architected Reliability: Enable Multi-AZ for automatic failover
    MultiAZ: true
    # Well-Architected Security: Store credentials in Secrets Manager
    ManageMasterUserPassword: true
    # Well-Architected Security: Place in private subnet with no public access
    DBSubnetGroupName: !Ref DBSubnetGroup
    PubliclyAccessible: false
    VPCSecurityGroups:
      - !Ref DatabaseSecurityGroup
    # Well-Architected Reliability: Enable automated backups
    BackupRetentionPeriod: 30
    PreferredBackupWindow: '03:00-04:00'
    # Well-Architected Operational Excellence: Enable monitoring
    EnableCloudwatchLogsExports:
      - postgresql
      - upgrade
    MonitoringInterval: 60
    MonitoringRoleArn: !GetAtt MonitoringRole.Arn
    # Well-Architected Reliability: Protect against accidental deletion
    DeletionProtection: true

DatabaseEncryptionKey:
  Type: AWS::KMS::Key
  Properties:
    Description: Encryption key for RDS database
    # Well-Architected Security: Enable automatic key rotation
    EnableKeyRotation: true
    KeyPolicy:
      Version: '2012-10-17'
      Statement:
        - Sid: Enable IAM User Permissions
          Effect: Allow
          Principal:
            AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
          Action: 'kms:*'
          Resource: '*'
```

**Always Enable Encryption in Transit**

For Application Load Balancers:
```hcl
# Terraform - ALB with HTTPS only
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"  # Well-Architected Security: Use HTTPS for encryption in transit
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # Well-Architected Security: Use TLS 1.3
  certificate_arn   = aws_acm_certificate.app.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Well-Architected Security: Redirect HTTP to HTTPS
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

### IAM - Least Privilege Access

**Always Use IAM Roles, Never Access Keys**

For EC2 instances:
```hcl
# Terraform - EC2 with IAM role (NOT access keys)
resource "aws_iam_role" "app_instance" {
  name = "app-instance-role"

  # Well-Architected Security: Use IAM role for EC2, not access keys
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

# Well-Architected Security: Grant only specific permissions needed
resource "aws_iam_role_policy" "app_s3_access" {
  name = "app-s3-access"
  role = aws_iam_role.app_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",      # Well-Architected Security: Specific actions only
        "s3:PutObject"
      ]
      Resource = "arn:aws:s3:::my-app-bucket/app-data/*"  # Well-Architected Security: Specific path, not entire bucket
    }]
  })
}

resource "aws_iam_instance_profile" "app" {
  name = "app-instance-profile"
  role = aws_iam_role.app_instance.name
}

resource "aws_instance" "app" {
  ami                  = data.aws_ami.amazon_linux_2.id
  instance_type        = "t3.medium"
  iam_instance_profile = aws_iam_instance_profile.app.name  # Well-Architected Security: Attach IAM role
  # ... other configuration
}
```

For Lambda functions:
```yaml
# CloudFormation - Lambda with least privilege IAM role
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
    # Well-Architected Security: Use AWS managed policy for basic Lambda execution
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Policies:
      - PolicyName: DynamoDBAccess
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            # Well-Architected Security: Grant only specific DynamoDB actions
            - Effect: Allow
              Action:
                - dynamodb:GetItem
                - dynamodb:PutItem
                - dynamodb:UpdateItem
              # Well-Architected Security: Limit to specific table
              Resource: !GetAtt DataTable.Arn

ProcessingFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: data-processor
    Runtime: python3.11
    Handler: index.handler
    # Well-Architected Security: Use IAM role with least privilege
    Role: !GetAtt LambdaExecutionRole.Arn
    Code:
      ZipFile: |
        def handler(event, context):
            # Function code here
            pass
```

### Network Security

**Always Use Security Groups with Least Privilege**

```hcl
# Terraform - Security groups with least privilege
# Well-Architected Security: ALB security group - only HTTPS from internet
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

  # Well-Architected Security: Reference security group, not CIDR
  egress {
    description     = "To application servers only"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "alb-security-group"
  }
}

# Well-Architected Security: Application security group - only from ALB
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

  tags = {
    Name = "app-security-group"
  }
}

# Well-Architected Security: Database security group - only from app servers
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

  # Well-Architected Security: No egress rules - database doesn't need outbound access

  tags = {
    Name = "database-security-group"
  }
}
```

**Always Block Public Access for S3 Buckets (Unless Explicitly Needed)**

```hcl
# Terraform - S3 bucket with public access blocked
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  # Well-Architected Security: Block all public access by default
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Well-Architected Security: Bucket policy to enforce encryption and HTTPS
resource "aws_s3_bucket_policy" "data" {
  bucket = aws_s3_bucket.data.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyUnencryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.data.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.data.arn,
          "${aws_s3_bucket.data.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}
```

## Reliability Best Practices for Code Generation

### Principle: Design for Failure

When generating infrastructure code, always assume components will fail and design for automatic recovery and high availability.

### Multi-AZ Deployments

**Always Deploy Across Multiple Availability Zones**

For Auto Scaling Groups:
```hcl
# Terraform - Multi-AZ Auto Scaling Group
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id  # Well-Architected Reliability: Multiple AZ subnets
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"  # Well-Architected Reliability: Use ELB health checks
  health_check_grace_period = 300
  
  # Well-Architected Reliability: Minimum one instance per AZ
  min_size         = 3
  max_size         = 12
  desired_capacity = 6  # Well-Architected Reliability: Two per AZ for redundancy

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Well-Architected Reliability: Ensure even distribution across AZs
  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMinSize",
    "GroupMaxSize"
  ]

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }

  # Well-Architected Reliability: Wait for instances to be healthy
  wait_for_capacity_timeout = "10m"
  
  lifecycle {
    create_before_destroy = true
  }
}
```

For RDS (already shown above with Multi-AZ enabled):
```yaml
# CloudFormation - RDS Multi-AZ
Database:
  Type: AWS::RDS::DBInstance
  Properties:
    # Well-Architected Reliability: Enable Multi-AZ for automatic failover (60-120 seconds)
    MultiAZ: true
    # ... other properties
```

For ElastiCache:
```hcl
# Terraform - ElastiCache Redis with Multi-AZ
resource "aws_elasticache_replication_group" "cache" {
  replication_group_id       = "app-cache"
  replication_group_description = "Application cache cluster"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 3  # Well-Architected Reliability: One primary + two replicas across AZs
  
  # Well-Architected Reliability: Enable automatic failover
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.cache.name
  security_group_ids = [aws_security_group.cache.id]
  
  # Well-Architected Reliability: Enable backups
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  # Well-Architected Security: Enable encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  notification_topic_arn = aws_sns_topic.cache_events.arn
}
```

### Backup and Recovery

**Always Enable Automated Backups**

For RDS:
```yaml
# CloudFormation - RDS with comprehensive backup configuration
Database:
  Type: AWS::RDS::DBInstance
  Properties:
    # Well-Architected Reliability: Enable automated backups with 30-day retention
    BackupRetentionPeriod: 30
    PreferredBackupWindow: '03:00-04:00'
    # Well-Architected Reliability: Enable automated minor version upgrades
    AutoMinorVersionUpgrade: true
    PreferredMaintenanceWindow: 'mon:04:00-mon:05:00'
    # Well-Architected Reliability: Protect against accidental deletion
    DeletionProtection: true
    # Well-Architected Reliability: Create final snapshot on deletion
    DeleteAutomatedBackups: false
    # ... other properties
```

For DynamoDB:
```hcl
# Terraform - DynamoDB with point-in-time recovery
resource "aws_dynamodb_table" "data" {
  name           = "application-data"
  billing_mode   = "PAY_PER_REQUEST"  # Well-Architected Cost Optimization: Pay per request for variable workloads
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # Well-Architected Reliability: Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Well-Architected Security: Enable encryption at rest
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb.arn
  }

  # Well-Architected Reliability: Enable deletion protection
  deletion_protection_enabled = true

  tags = {
    Name        = "application-data"
    Environment = "production"
  }
}

# Well-Architected Reliability: AWS Backup for additional protection
resource "aws_backup_plan" "dynamodb" {
  name = "dynamodb-backup-plan"

  rule {
    rule_name         = "daily_backups"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 2 * * ? *)"  # 2 AM daily
    
    lifecycle {
      delete_after = 30
    }
  }
}

resource "aws_backup_selection" "dynamodb" {
  name         = "dynamodb-backup-selection"
  plan_id      = aws_backup_plan.dynamodb.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    aws_dynamodb_table.data.arn
  ]
}
```

For S3:
```hcl
# Terraform - S3 with versioning and lifecycle policies
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id

  # Well-Architected Reliability: Enable versioning for data protection
  versioning_configuration {
    status = "Enabled"
  }
}

# Well-Architected Cost Optimization: Lifecycle policy to manage old versions
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"  # Well-Architected Cost Optimization: Move to cheaper storage
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"  # Well-Architected Cost Optimization: Archive old versions
    }

    noncurrent_version_expiration {
      noncurrent_days = 365  # Well-Architected Cost Optimization: Delete after 1 year
    }
  }
}
```

### Health Checks and Monitoring

**Always Configure Comprehensive Health Checks**

For Application Load Balancers:
```hcl
# Terraform - ALB target group with health checks
resource "aws_lb_target_group" "app" {
  name     = "app-targets"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  # Well-Architected Reliability: Configure comprehensive health checks
  health_check {
    enabled             = true
    healthy_threshold   = 2    # Well-Architected Reliability: Mark healthy after 2 successful checks
    unhealthy_threshold = 3    # Well-Architected Reliability: Mark unhealthy after 3 failed checks
    timeout             = 5
    interval            = 30
    path                = "/health"  # Well-Architected Reliability: Use dedicated health endpoint
    matcher             = "200"
  }

  # Well-Architected Reliability: Enable connection draining
  deregistration_delay = 30

  # Well-Architected Reliability: Enable stickiness for stateful applications
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  tags = {
    Name = "app-target-group"
  }
}
```

For Auto Scaling:
```yaml
# CloudFormation - Auto Scaling with health checks
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    VPCZoneIdentifier:
      - !Ref PrivateSubnet1
      - !Ref PrivateSubnet2
      - !Ref PrivateSubnet3
    LaunchTemplate:
      LaunchTemplateId: !Ref LaunchTemplate
      Version: !GetAtt LaunchTemplate.LatestVersionNumber
    MinSize: 3
    MaxSize: 12
    DesiredCapacity: 6
    # Well-Architected Reliability: Use ELB health checks
    HealthCheckType: ELB
    HealthCheckGracePeriod: 300
    TargetGroupARNs:
      - !Ref TargetGroup
    # Well-Architected Reliability: Enable metrics collection
    MetricsCollection:
      - Granularity: 1Minute
        Metrics:
          - GroupDesiredCapacity
          - GroupInServiceInstances
          - GroupMinSize
          - GroupMaxSize
    Tags:
      - Key: Name
        Value: app-instance
        PropagateAtLaunch: true
```

## Performance Efficiency Best Practices for Code Generation

### Principle: Use the Right Resources for the Job

When generating infrastructure code, select appropriate instance types, enable caching, and configure resources for optimal performance.

### Instance Sizing

**Use Appropriate Instance Types Based on Workload**

For compute-intensive workloads:
```hcl
# Terraform - Compute-optimized instances for CPU-intensive tasks
resource "aws_launch_template" "compute_intensive" {
  name_prefix   = "compute-app-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = "c6i.xlarge"  # Well-Architected Performance: Compute-optimized for CPU-intensive workloads

  # Well-Architected Performance: Use latest generation instances
  # c6i provides better price-performance than c5

  iam_instance_profile {
    name = aws_iam_instance_profile.app.name
  }

  monitoring {
    enabled = true  # Well-Architected Operational Excellence: Enable detailed monitoring
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # Well-Architected Security: Require IMDSv2
    http_put_response_hop_limit = 1
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "compute-intensive-app"
    }
  }
}
```

For memory-intensive workloads:
```yaml
# CloudFormation - Memory-optimized instances for in-memory databases/caches
LaunchTemplate:
  Type: AWS::EC2::LaunchTemplate
  Properties:
    LaunchTemplateName: memory-intensive-app
    LaunchTemplateData:
      ImageId: !Ref LatestAmiId
      # Well-Architected Performance: Memory-optimized for memory-intensive workloads
      InstanceType: r6i.xlarge
      IamInstanceProfile:
        Arn: !GetAtt InstanceProfile.Arn
      # Well-Architected Performance: Enable enhanced networking
      NetworkInterfaces:
        - DeviceIndex: 0
          AssociatePublicIpAddress: false
          Groups:
            - !Ref SecurityGroup
          DeleteOnTermination: true
      Monitoring:
        Enabled: true
      MetadataOptions:
        HttpEndpoint: enabled
        HttpTokens: required
```

For Lambda functions:
```hcl
# Terraform - Lambda with appropriate memory configuration
resource "aws_lambda_function" "processor" {
  function_name = "data-processor"
  runtime       = "python3.11"
  handler       = "index.handler"
  role          = aws_iam_role.lambda.arn
  
  # Well-Architected Performance: Configure memory based on workload
  # Memory also determines CPU allocation (1769 MB = 1 vCPU)
  memory_size = 1769  # Well-Architected Performance: 1 vCPU for CPU-bound tasks
  
  # Well-Architected Performance: Set appropriate timeout
  timeout = 300  # 5 minutes for processing tasks
  
  # Well-Architected Performance: Use ARM architecture for better price-performance
  architectures = ["arm64"]
  
  # Well-Architected Reliability: Configure reserved concurrency to prevent throttling
  reserved_concurrent_executions = 100
  
  # Well-Architected Operational Excellence: Enable X-Ray tracing
  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      LOG_LEVEL = "INFO"
    }
  }

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")
}
```

### Caching Strategies

**Implement Caching at Multiple Layers**

For CloudFront CDN:
```hcl
# Terraform - CloudFront distribution with caching
resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Application CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # Well-Architected Cost Optimization: Use optimal price class

  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = "S3-app-bucket"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.app.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-app-bucket"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"  # Well-Architected Security: Force HTTPS
    # Well-Architected Performance: Configure caching TTLs
    min_ttl                = 0
    default_ttl            = 3600    # 1 hour default cache
    max_ttl                = 86400   # 24 hour max cache
    compress               = true    # Well-Architected Performance: Enable compression
  }

  # Well-Architected Performance: Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-app-bucket"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400   # Well-Architected Performance: Cache static assets for 24 hours
    max_ttl                = 31536000 # Well-Architected Performance: Max 1 year for versioned assets
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.app.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"  # Well-Architected Security: Modern TLS version
  }

  tags = {
    Name = "app-cdn"
  }
}
```

For ElastiCache (already shown above):
```hcl
# Well-Architected Performance: Use ElastiCache for application-level caching
resource "aws_elasticache_replication_group" "cache" {
  replication_group_id       = "app-cache"
  replication_group_description = "Application cache cluster"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r6g.large"  # Well-Architected Performance: Memory-optimized for caching
  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled          = true
  # ... other configuration
}
```

For DynamoDB DAX:
```yaml
# CloudFormation - DynamoDB with DAX for microsecond latency
DAXCluster:
  Type: AWS::DAX::Cluster
  Properties:
    ClusterName: app-dax-cluster
    # Well-Architected Performance: DAX provides microsecond read latency
    NodeType: dax.r5.large
    ReplicationFactor: 3  # Well-Architected Reliability: Multi-node for high availability
    IAMRoleARN: !GetAtt DAXRole.Arn
    SubnetGroupName: !Ref DAXSubnetGroup
    SecurityGroupIds:
      - !Ref DAXSecurityGroup
    # Well-Architected Security: Enable encryption
    SSESpecification:
      SSEEnabled: true
    # Well-Architected Performance: Configure TTL for cache entries
    ParameterGroupName: !Ref DAXParameterGroup

DAXParameterGroup:
  Type: AWS::DAX::ParameterGroup
  Properties:
    ParameterGroupName: app-dax-params
    Description: DAX parameter group for application
    ParameterNameValues:
      # Well-Architected Performance: Set appropriate TTL
      query-ttl-millis: "300000"  # 5 minutes
      record-ttl-millis: "300000"
```

### Database Performance

**Configure Appropriate Database Settings**

For RDS:
```hcl
# Terraform - RDS with performance optimization
resource "aws_db_instance" "app" {
  identifier     = "app-database"
  engine         = "postgres"
  engine_version = "15.4"
  # Well-Architected Performance: Use latest generation instance class
  instance_class = "db.r6g.xlarge"  # Graviton2 for better price-performance

  allocated_storage     = 100
  max_allocated_storage = 1000  # Well-Architected Performance: Enable storage autoscaling
  # Well-Architected Performance: Use gp3 for better performance and cost
  storage_type          = "gp3"
  iops                  = 3000  # Well-Architected Performance: Provision IOPS for consistent performance
  storage_throughput    = 125   # Well-Architected Performance: Configure throughput

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # Well-Architected Performance: Enable Performance Insights
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  performance_insights_kms_key_id      = aws_kms_key.rds.arn

  # Well-Architected Operational Excellence: Enable enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Well-Architected Operational Excellence: Enable CloudWatch Logs
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Well-Architected Performance: Configure parameter group for optimization
  parameter_group_name = aws_db_parameter_group.app.name

  backup_retention_period = 30
  storage_encrypted       = true
  kms_key_id             = aws_kms_key.rds.arn
  deletion_protection    = true

  tags = {
    Name = "app-database"
  }
}

# Well-Architected Performance: Custom parameter group for optimization
resource "aws_db_parameter_group" "app" {
  name   = "app-postgres-params"
  family = "postgres15"

  # Well-Architected Performance: Optimize for workload
  parameter {
    name  = "shared_buffers"
    value = "8388608"  # 8GB for r6g.xlarge (25% of memory)
  }

  parameter {
    name  = "effective_cache_size"
    value = "25165824"  # 24GB (75% of memory)
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "2097152"  # 2GB
  }

  parameter {
    name  = "work_mem"
    value = "32768"  # 32MB
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }
}
```

## Cost Optimization Best Practices for Code Generation

### Principle: Pay Only for What You Need

When generating infrastructure code, implement right-sizing, auto-scaling, and cost-effective resource choices to optimize costs without sacrificing performance or reliability.

### Right-Sizing

**Use Appropriate Instance Sizes and Types**

```hcl
# Terraform - Right-sized instances with auto-scaling
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2.id
  # Well-Architected Cost Optimization: Start with smaller instance, scale horizontally
  instance_type = "t3.medium"  # Burstable for variable workloads

  # Well-Architected Cost Optimization: Use latest generation for better price-performance
  # t3 provides better value than t2

  iam_instance_profile {
    name = aws_iam_instance_profile.app.name
  }

  monitoring {
    enabled = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "app-instance"
    }
  }
}
```

For RDS:
```yaml
# CloudFormation - Right-sized RDS with storage autoscaling
Database:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: app-database
    Engine: postgres
    EngineVersion: '15.4'
    # Well-Architected Cost Optimization: Start with appropriate size
    DBInstanceClass: db.t4g.large  # Graviton2 for 40% better price-performance
    # Well-Architected Cost Optimization: Start small, enable autoscaling
    AllocatedStorage: 100
    MaxAllocatedStorage: 1000  # Autoscale up to 1TB as needed
    StorageType: gp3
    MultiAZ: true
    # ... other properties
```

### Auto-Scaling

**Implement Auto-Scaling to Match Demand**

For EC2 Auto Scaling:
```hcl
# Terraform - Auto Scaling with target tracking
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  # Well-Architected Cost Optimization: Scale based on actual utilization
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0  # Well-Architected Cost Optimization: Target 70% CPU utilization
  }
}

# Well-Architected Cost Optimization: Scale based on request count
resource "aws_autoscaling_policy" "request_count_target" {
  name                   = "request-count-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.app.arn_suffix}/${aws_lb_target_group.app.arn_suffix}"
    }
    target_value = 1000.0  # Well-Architected Cost Optimization: 1000 requests per target
  }
}

# Well-Architected Cost Optimization: Scheduled scaling for predictable patterns
resource "aws_autoscaling_schedule" "scale_up_morning" {
  scheduled_action_name  = "scale-up-morning"
  min_size               = 6
  max_size               = 12
  desired_capacity       = 8
  recurrence             = "0 8 * * MON-FRI"  # 8 AM weekdays
  autoscaling_group_name = aws_autoscaling_group.app.name
}

resource "aws_autoscaling_schedule" "scale_down_evening" {
  scheduled_action_name  = "scale-down-evening"
  min_size               = 3
  max_size               = 12
  desired_capacity       = 4
  recurrence             = "0 18 * * MON-FRI"  # 6 PM weekdays
  autoscaling_group_name = aws_autoscaling_group.app.name
}
```

For DynamoDB:
```yaml
# CloudFormation - DynamoDB with auto-scaling
DataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: application-data
    # Well-Architected Cost Optimization: Use on-demand for unpredictable workloads
    BillingMode: PAY_PER_REQUEST
    # For predictable workloads, use provisioned with auto-scaling:
    # BillingMode: PROVISIONED
    # ProvisionedThroughput:
    #   ReadCapacityUnits: 5
    #   WriteCapacityUnits: 5
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    SSESpecification:
      SSEEnabled: true
    Tags:
      - Key: Name
        Value: application-data

# Well-Architected Cost Optimization: Auto-scaling for provisioned capacity
# (Only needed if using PROVISIONED billing mode)
TableReadScalingTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    MaxCapacity: 100
    MinCapacity: 5
    ResourceId: !Sub 'table/${DataTable}'
    RoleARN: !GetAtt ScalingRole.Arn
    ScalableDimension: dynamodb:table:ReadCapacityUnits
    ServiceNamespace: dynamodb

TableReadScalingPolicy:
  Type: AWS::ApplicationAutoScaling::ScalingPolicy
  Properties:
    PolicyName: ReadAutoScalingPolicy
    PolicyType: TargetTrackingScaling
    ScalingTargetId: !Ref TableReadScalingTarget
    TargetTrackingScalingPolicyConfiguration:
      TargetValue: 70.0  # Well-Architected Cost Optimization: Target 70% utilization
      PredefinedMetricSpecification:
        PredefinedMetricType: DynamoDBReadCapacityUtilization
```

### Storage Optimization

**Use Appropriate Storage Classes and Lifecycle Policies**

For S3:
```hcl
# Terraform - S3 with intelligent tiering and lifecycle policies
resource "aws_s3_bucket" "data" {
  bucket = "application-data"
}

# Well-Architected Cost Optimization: Use Intelligent-Tiering for unknown access patterns
resource "aws_s3_bucket_intelligent_tiering_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  name   = "EntireDataBucket"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# Well-Architected Cost Optimization: Lifecycle policies for known patterns
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    id     = "transition-old-data"
    status = "Enabled"

    # Well-Architected Cost Optimization: Move to cheaper storage classes over time
    transition {
      days          = 30
      storage_class = "STANDARD_IA"  # Infrequent Access after 30 days
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"  # Glacier Instant Retrieval after 90 days
    }

    transition {
      days          = 180
      storage_class = "GLACIER"  # Glacier after 180 days
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"  # Deep Archive after 1 year
    }

    # Well-Architected Cost Optimization: Delete old data
    expiration {
      days = 2555  # 7 years retention
    }
  }

  rule {
    id     = "delete-incomplete-uploads"
    status = "Enabled"

    # Well-Architected Cost Optimization: Clean up incomplete multipart uploads
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "manage-old-versions"
    status = "Enabled"

    # Well-Architected Cost Optimization: Manage old versions
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}
```

For EBS:
```yaml
# CloudFormation - EBS with appropriate volume type
LaunchTemplate:
  Type: AWS::EC2::LaunchTemplate
  Properties:
    LaunchTemplateName: app-template
    LaunchTemplateData:
      ImageId: !Ref LatestAmiId
      InstanceType: t3.medium
      BlockDeviceMappings:
        - DeviceName: /dev/xvda
          Ebs:
            # Well-Architected Cost Optimization: Use gp3 for better price-performance
            VolumeType: gp3
            VolumeSize: 30
            # Well-Architected Performance: Configure IOPS and throughput
            Iops: 3000
            Throughput: 125
            # Well-Architected Security: Enable encryption
            Encrypted: true
            KmsKeyId: !Ref EBSEncryptionKey
            # Well-Architected Cost Optimization: Delete on termination
            DeleteOnTermination: true
```

### Serverless and Managed Services

**Prefer Serverless and Managed Services to Reduce Operational Costs**

```hcl
# Terraform - Serverless architecture for cost optimization
# Well-Architected Cost Optimization: Use Lambda instead of always-on EC2
resource "aws_lambda_function" "api" {
  function_name = "api-handler"
  runtime       = "python3.11"
  handler       = "index.handler"
  role          = aws_iam_role.lambda.arn
  
  # Well-Architected Cost Optimization: Pay only for execution time
  memory_size = 512
  timeout     = 30
  
  # Well-Architected Cost Optimization: Use ARM for 20% cost savings
  architectures = ["arm64"]
  
  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")
}

# Well-Architected Cost Optimization: Use API Gateway instead of ALB for APIs
resource "aws_apigatewayv2_api" "api" {
  name          = "application-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn
  # Well-Architected Cost Optimization: Pay per request, no hourly charges
}

# Well-Architected Cost Optimization: Use DynamoDB instead of RDS for key-value workloads
resource "aws_dynamodb_table" "data" {
  name         = "application-data"
  billing_mode = "PAY_PER_REQUEST"  # Well-Architected Cost Optimization: Pay per request
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Well-Architected Cost Optimization: Use S3 instead of EBS for object storage
resource "aws_s3_bucket" "storage" {
  bucket = "application-storage"
  # S3 is significantly cheaper than EBS for object storage
}
```

## Code Templates with Well-Architected Principles

### Template 1: Secure Web Application (3-Tier Architecture)

This template demonstrates a complete 3-tier web application with all Well-Architected principles applied.

```hcl
# Terraform - Complete 3-tier web application with Well-Architected principles

# VPC with multi-AZ subnets
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "app-vpc"
  }
}

# Well-Architected Reliability: Public subnets in multiple AZs for load balancers
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "public-subnet-${count.index + 1}"
    Tier = "public"
  }
}

# Well-Architected Security: Private subnets for application servers
resource "aws_subnet" "private_app" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-app-subnet-${count.index + 1}"
    Tier = "private-app"
  }
}

# Well-Architected Security: Private subnets for databases (most restricted)
resource "aws_subnet" "private_data" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-data-subnet-${count.index + 1}"
    Tier = "private-data"
  }
}

# Internet Gateway for public subnets
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Well-Architected Reliability: NAT Gateways in each AZ for high availability
resource "aws_eip" "nat" {
  count  = 3
  domain = "vpc"

  tags = {
    Name = "nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "nat-gateway-${count.index + 1}"
  }
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-route-table"
  }
}

resource "aws_route_table" "private_app" {
  count  = 3
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "private-app-route-table-${count.index + 1}"
  }
}

# Well-Architected Security: No internet access for database subnets
resource "aws_route_table" "private_data" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "private-data-route-table"
  }
}

# Route table associations
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_app" {
  count          = 3
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app[count.index].id
}

resource "aws_route_table_association" "private_data" {
  count          = 3
  subnet_id      = aws_subnet.private_data[count.index].id
  route_table_id = aws_route_table.private_data.id
}

# Well-Architected Security: Security groups with least privilege
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

  tags = {
    Name = "alb-security-group"
  }
}

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

  tags = {
    Name = "app-security-group"
  }
}

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

  tags = {
    Name = "database-security-group"
  }
}

# Well-Architected Reliability: Application Load Balancer across multiple AZs
resource "aws_lb" "app" {
  name               = "app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  # Well-Architected Reliability: Enable deletion protection
  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "app-alb"
  }
}

# Well-Architected Reliability: Target group with health checks
resource "aws_lb_target_group" "app" {
  name     = "app-targets"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "app-target-group"
  }
}

# Well-Architected Security: HTTPS listener with modern TLS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.app.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Well-Architected Security: Redirect HTTP to HTTPS
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Well-Architected Reliability: Auto Scaling Group across multiple AZs
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300
  
  min_size         = 3
  max_size         = 12
  desired_capacity = 6

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMinSize",
    "GroupMaxSize"
  ]

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }

  wait_for_capacity_timeout = "10m"
  
  lifecycle {
    create_before_destroy = true
  }
}

# Well-Architected Cost Optimization: Auto-scaling based on CPU
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Well-Architected Reliability: RDS with Multi-AZ and encryption
resource "aws_db_instance" "app" {
  identifier     = "app-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn
  
  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  manage_master_user_password = true

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled    = true
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "app-database-final-snapshot"

  tags = {
    Name = "app-database"
  }
}
```

**Key Well-Architected Principles in This Template:**

1. **Security**: Encryption at rest and in transit, least privilege security groups, private subnets for data, IAM roles, HTTPS only
2. **Reliability**: Multi-AZ deployment, auto-scaling, health checks, automated backups, deletion protection
3. **Performance**: Appropriate instance types, load balancing, caching potential, performance insights
4. **Cost Optimization**: Auto-scaling, right-sized instances, latest generation instances, storage autoscaling
5. **Operational Excellence**: CloudWatch monitoring, automated backups, infrastructure as code

### Template 2: Serverless API with DynamoDB

This template demonstrates a serverless architecture with Well-Architected principles.

```yaml
# CloudFormation - Serverless API with Well-Architected principles
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Serverless API with DynamoDB following Well-Architected best practices

Resources:
  # Well-Architected Cost Optimization: DynamoDB with on-demand billing
  DataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: api-data
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      # Well-Architected Reliability: Enable point-in-time recovery
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      # Well-Architected Security: Enable encryption at rest
      SSESpecification:
        SSEEnabled: true
        SSEType: KMS
        KMSMasterKeyId: !Ref DataEncryptionKey
      # Well-Architected Reliability: Enable deletion protection
      DeletionProtectionEnabled: true
      # Well-Architected Operational Excellence: Enable streams for event processing
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      Tags:
        - Key: Name
          Value: api-data-table

  # Well-Architected Security: KMS key for encryption
  DataEncryptionKey:
    Type: AWS::KMS::Key
    Properties:
      Description: Encryption key for DynamoDB table
      EnableKeyRotation: true
      KeyPolicy:
        Version: '2012-10-17'
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::${AWS::AccountId}:root'
            Action: 'kms:*'
            Resource: '*'

  # Well-Architected Security: Lambda execution role with least privilege
  ApiLambdaRole:
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
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
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
                  - dynamodb:Query
                Resource: !GetAtt DataTable.Arn
              - Effect: Allow
                Action:
                  - kms:Decrypt
                  - kms:GenerateDataKey
                Resource: !GetAtt DataEncryptionKey.Arn

  # Well-Architected Cost Optimization: Lambda with ARM architecture
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: api-handler
      Runtime: python3.11
      Handler: index.handler
      # Well-Architected Cost Optimization: Use ARM for 20% cost savings
      Architectures:
        - arm64
      # Well-Architected Performance: Configure appropriate memory
      MemorySize: 512
      Timeout: 30
      Role: !GetAtt ApiLambdaRole.Arn
      Environment:
        Variables:
          TABLE_NAME: !Ref DataTable
          # Well-Architected Operational Excellence: Enable structured logging
          LOG_LEVEL: INFO
      # Well-Architected Operational Excellence: Enable X-Ray tracing
      Tracing: Active
      # Well-Architected Reliability: Configure reserved concurrency
      ReservedConcurrentExecutions: 100
      # Well-Architected Reliability: Configure DLQ for failed invocations
      DeadLetterQueue:
        Type: SQS
        TargetArn: !GetAtt FunctionDLQ.Arn
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
            ApiId: !Ref HttpApi

  # Well-Architected Reliability: Dead letter queue for failed invocations
  FunctionDLQ:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: api-function-dlq
      MessageRetentionPeriod: 1209600  # 14 days
      # Well-Architected Security: Enable encryption
      KmsMasterKeyId: !Ref DataEncryptionKey

  # Well-Architected Cost Optimization: HTTP API (cheaper than REST API)
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      StageName: prod
      # Well-Architected Operational Excellence: Enable access logging
      AccessLogSettings:
        DestinationArn: !GetAtt ApiLogGroup.Arn
        Format: $context.requestId $context.error.message $context.error.messageString
      # Well-Architected Performance: Configure throttling
      DefaultRouteSettings:
        ThrottlingBurstLimit: 5000
        ThrottlingRateLimit: 2000
      # Well-Architected Security: Configure CORS
      CorsConfiguration:
        AllowOrigins:
          - https://example.com
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
        AllowHeaders:
          - Content-Type
          - Authorization
        MaxAge: 300

  # Well-Architected Operational Excellence: CloudWatch Logs for API
  ApiLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /aws/apigateway/api
      RetentionInDays: 30
      # Well-Architected Security: Enable encryption
      KmsKeyId: !GetAtt DataEncryptionKey.Arn

  # Well-Architected Operational Excellence: CloudWatch Logs for Lambda
  FunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/lambda/${ApiFunction}'
      RetentionInDays: 30
      KmsKeyId: !GetAtt DataEncryptionKey.Arn

  # Well-Architected Operational Excellence: CloudWatch Alarms
  FunctionErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: api-function-errors
      AlarmDescription: Alert on Lambda function errors
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 5
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: FunctionName
          Value: !Ref ApiFunction
      AlarmActions:
        - !Ref AlertTopic

  FunctionThrottleAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: api-function-throttles
      AlarmDescription: Alert on Lambda function throttles
      MetricName: Throttles
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: FunctionName
          Value: !Ref ApiFunction
      AlarmActions:
        - !Ref AlertTopic

  # Well-Architected Operational Excellence: SNS topic for alerts
  AlertTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: api-alerts
      # Well-Architected Security: Enable encryption
      KmsMasterKeyId: !Ref DataEncryptionKey

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
  
  TableName:
    Description: DynamoDB table name
    Value: !Ref DataTable
```

**Key Well-Architected Principles in This Template:**

1. **Security**: KMS encryption for all data, least privilege IAM, CORS configuration, encrypted logs
2. **Reliability**: Point-in-time recovery, DLQ for failed invocations, reserved concurrency, deletion protection
3. **Performance**: ARM architecture, appropriate memory sizing, throttling configuration
4. **Cost Optimization**: Serverless (pay per request), on-demand DynamoDB, HTTP API instead of REST API, ARM architecture
5. **Operational Excellence**: X-Ray tracing, CloudWatch Logs, CloudWatch Alarms, structured logging

## Inline Comments - Explaining Well-Architected Decisions

### Principle: Document the "Why" Behind Decisions

When generating infrastructure code, always include inline comments that explain:
1. **Which Well-Architected pillar** the configuration addresses
2. **Why this specific configuration** was chosen
3. **What trade-offs** were considered (if applicable)

### Comment Format

Use this format for Well-Architected comments:
```
# Well-Architected [Pillar]: [Brief explanation of decision]
```

Examples:
```hcl
# Well-Architected Security: Use KMS encryption for data at rest
# Well-Architected Reliability: Enable Multi-AZ for automatic failover
# Well-Architected Performance: Use gp3 for better IOPS and throughput
# Well-Architected Cost Optimization: Use on-demand billing for variable workloads
# Well-Architected Operational Excellence: Enable CloudWatch Logs for debugging
```

### Good Comment Examples

**Example 1: Explaining Security Decisions**
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      # Well-Architected Security: Use KMS encryption instead of S3-managed keys
      # for better key management and audit capabilities
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data.arn
    }
    # Well-Architected Cost Optimization: Enable bucket keys to reduce KMS API calls
    # and lower encryption costs by up to 99%
    bucket_key_enabled = true
  }
}
```

**Example 2: Explaining Reliability Decisions**
```yaml
Database:
  Type: AWS::RDS::DBInstance
  Properties:
    # Well-Architected Reliability: Enable Multi-AZ for automatic failover
    # Provides 99.95% availability SLA with automatic failover in 60-120 seconds
    MultiAZ: true
    # Well-Architected Reliability: 30-day backup retention for point-in-time recovery
    # Allows recovery from accidental data deletion or corruption
    BackupRetentionPeriod: 30
    # Well-Architected Reliability: Protect against accidental deletion
    # Requires explicit disable before deletion can occur
    DeletionProtection: true
```

**Example 3: Explaining Performance Decisions**
```hcl
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  # Well-Architected Performance: Use c6i (compute-optimized) for CPU-intensive workloads
  # Provides 15% better price-performance than c5 generation
  instance_type = "c6i.xlarge"
  
  # Well-Architected Performance: Use latest generation for better performance
  # c6i includes Intel Ice Lake processors with higher clock speeds
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      # Well-Architected Performance: Use gp3 for configurable IOPS and throughput
      # Provides 20% lower cost than gp2 with better baseline performance
      volume_type = "gp3"
      # Well-Architected Performance: Provision 3000 IOPS for consistent performance
      # Baseline is 3000 IOPS regardless of volume size
      iops = 3000
      # Well-Architected Performance: Configure 125 MB/s throughput
      # Independent of IOPS, optimized for sequential workloads
      throughput = 125
    }
  }
}
```

**Example 4: Explaining Cost Optimization Decisions**
```hcl
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    # Well-Architected Cost Optimization: Target 70% CPU utilization
    # Balances cost efficiency with performance headroom for traffic spikes
    # Lower target wastes resources, higher target risks performance degradation
    target_value = 70.0
  }
}

resource "aws_dynamodb_table" "data" {
  name = "application-data"
  # Well-Architected Cost Optimization: Use on-demand billing for unpredictable workloads
  # Eliminates need to provision capacity, pay only for actual requests
  # More cost-effective than provisioned capacity when traffic is variable
  billing_mode = "PAY_PER_REQUEST"
  # Note: For predictable workloads with consistent traffic, provisioned capacity
  # with auto-scaling would be more cost-effective
}
```

**Example 5: Explaining Trade-offs**
```yaml
LaunchTemplate:
  Type: AWS::EC2::LaunchTemplate
  Properties:
    LaunchTemplateData:
      # Well-Architected Cost Optimization: Use t3.medium (burstable) for variable workloads
      # Trade-off: Lower baseline CPU (20%) but can burst to 100% when needed
      # More cost-effective than fixed-performance instances for applications with
      # variable CPU usage patterns. Monitor CPU credits to ensure not exhausted.
      InstanceType: t3.medium
      
      # Well-Architected Performance: Use ARM architecture for better price-performance
      # Trade-off: Requires ARM-compatible AMI and application binaries
      # Provides 40% better price-performance for compatible workloads
      # Not suitable if application requires x86-specific dependencies
      ImageId: !Ref ArmAmiId
```

### When to Add Comments

**Always comment:**
- Security configurations (encryption, IAM, network security)
- Reliability configurations (Multi-AZ, backups, health checks)
- Performance optimizations (instance types, caching, IOPS)
- Cost optimization decisions (billing modes, auto-scaling, storage classes)
- Trade-offs between pillars (e.g., cost vs. performance)

**Don't over-comment:**
- Obvious configurations (e.g., `bucket = "my-bucket"`)
- Standard AWS resource properties that don't involve Well-Architected decisions
- Repetitive information already explained elsewhere

### Comment Placement

Place comments **immediately before** the configuration they explain:

```hcl
# ✅ Good - Comment before the configuration
# Well-Architected Security: Enable encryption at rest
storage_encrypted = true

# ❌ Bad - Comment after the configuration
storage_encrypted = true
# Well-Architected Security: Enable encryption at rest
```

For multi-line configurations, place the comment before the block:

```hcl
# ✅ Good - Comment before the block
# Well-Architected Reliability: Configure comprehensive health checks
# Marks instances healthy after 2 successful checks, unhealthy after 3 failures
health_check {
  enabled             = true
  healthy_threshold   = 2
  unhealthy_threshold = 3
  timeout             = 5
  interval            = 30
  path                = "/health"
}
```

## Code Generation Workflow

### When User Requests Infrastructure Code

When a user asks Kiro to generate infrastructure code, follow this workflow:

#### Step 1: Understand Requirements

Ask clarifying questions if needed:
- What is the workload type? (web app, API, batch processing, etc.)
- What are the performance requirements?
- What are the security requirements? (compliance, data sensitivity)
- What is the expected traffic pattern? (steady, variable, spiky)
- What is the budget constraint?

#### Step 2: Select Appropriate Services

Choose services based on Well-Architected principles:
- **Serverless first** for variable workloads (Lambda, API Gateway, DynamoDB)
- **Managed services** to reduce operational overhead (RDS, ElastiCache, ECS)
- **Right-sized instances** based on workload characteristics
- **Latest generation** for better price-performance

#### Step 3: Apply Security by Default

Always include:
- ✅ Encryption at rest (KMS)
- ✅ Encryption in transit (TLS 1.2+)
- ✅ Least privilege IAM roles (no access keys)
- ✅ Private subnets for data tier
- ✅ Security groups with specific rules
- ✅ Public access blocks for S3

#### Step 4: Design for Reliability

Always include:
- ✅ Multi-AZ deployment
- ✅ Automated backups
- ✅ Health checks
- ✅ Auto-scaling
- ✅ Deletion protection for data stores

#### Step 5: Optimize for Performance

Include:
- ✅ Appropriate instance types
- ✅ Caching layers (CloudFront, ElastiCache, DAX)
- ✅ Performance monitoring (CloudWatch, X-Ray)
- ✅ Latest generation instances

#### Step 6: Optimize for Cost

Include:
- ✅ Auto-scaling policies
- ✅ Right-sized resources
- ✅ Appropriate billing modes (on-demand vs. provisioned)
- ✅ Storage lifecycle policies
- ✅ Latest generation instances

#### Step 7: Add Inline Comments

Document:
- ✅ Which pillar each configuration addresses
- ✅ Why specific choices were made
- ✅ Trade-offs considered

#### Step 8: Offer Review

After generating code, offer to review it:
> "I've generated your infrastructure code with Well-Architected best practices built in. Would you like me to review it to verify all security, reliability, and cost optimization principles are properly implemented?"

### Example Generation Workflow

**User Request:**
> "Generate Terraform code for a web application with a database"

**Kiro Response:**
> "I'll generate a secure, highly available web application infrastructure. A few questions to optimize the design:
> 
> 1. What's your expected traffic pattern? (steady, variable, or spiky)
> 2. Do you have specific compliance requirements? (HIPAA, PCI-DSS, etc.)
> 3. What's your database workload? (read-heavy, write-heavy, or balanced)
> 
> Based on best practices, I'll include:
> - Multi-AZ deployment for high availability
> - Auto-scaling for cost optimization
> - Encryption at rest and in transit
> - Private subnets for the database
> - Automated backups
> 
> Let me know your preferences, or I can proceed with sensible defaults."

**After User Responds or Confirms Defaults:**

Generate the code with all Well-Architected principles applied and inline comments explaining decisions.

**After Generation:**
> "I've generated your infrastructure code following AWS Well-Architected best practices:
> 
> ✅ Security: KMS encryption, least privilege IAM, private subnets, HTTPS only
> ✅ Reliability: Multi-AZ deployment, automated backups, health checks, auto-scaling
> ✅ Performance: Latest generation instances, appropriate sizing, caching ready
> ✅ Cost Optimization: Auto-scaling, right-sized resources, gp3 storage
> 
> The code includes inline comments explaining each Well-Architected decision. Would you like me to review it more thoroughly or explain any specific configuration?"

## Summary

When generating infrastructure code, Kiro should:

1. **Always apply Well-Architected principles by default** - don't wait for users to ask
2. **Prioritize security** - encryption, least privilege, network isolation
3. **Design for reliability** - Multi-AZ, backups, health checks, auto-scaling
4. **Optimize performance** - appropriate instance types, caching, monitoring
5. **Optimize costs** - auto-scaling, right-sizing, serverless where appropriate
6. **Document decisions** - inline comments explaining the "why" behind configurations
7. **Offer review** - suggest a comprehensive Well-Architected review after generation

The goal is to generate **production-ready infrastructure code** that follows best practices, not just proof-of-concept code that requires significant hardening before deployment.

By applying these principles consistently, Kiro helps developers build secure, reliable, performant, and cost-effective infrastructure from the start, reducing technical debt and preventing security vulnerabilities.
