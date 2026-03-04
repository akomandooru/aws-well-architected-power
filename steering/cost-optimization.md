# Cost Optimization Pillar - AWS Well-Architected Framework

## Overview

The Cost Optimization Pillar focuses on achieving business outcomes at the lowest price point while meeting your functional requirements. Cost optimization is about understanding and controlling where money is spent, selecting appropriate resource types and quantities, analyzing spending over time, and scaling to meet business needs without overspending.

### Core Cost Optimization Principles

1. **Implement cloud financial management**: Establish cost awareness, control, planning, and optimization practices
2. **Adopt a consumption model**: Pay only for the computing resources you consume and increase or decrease usage based on business requirements
3. **Measure overall efficiency**: Measure business output and costs associated with delivering it, and use this data to make informed decisions
4. **Stop spending money on undifferentiated heavy lifting**: Focus on business differentiation rather than infrastructure management
5. **Analyze and attribute expenditure**: Accurately identify cost drivers and attribute costs to workload owners for accountability

## Cost Optimization Design Areas

### 1. Practice Cloud Financial Management

#### Best Practices

**Establish Cost Awareness**
- Implement cost allocation tags for all resources
- Create cost and usage reports for detailed analysis
- Use AWS Cost Explorer for visualization and trends
- Set up billing alerts and budgets
- Share cost reports with stakeholders regularly

**Implement Cost Controls**
- Use AWS Budgets to set spending limits
- Implement Service Control Policies (SCPs) for guardrails
- Use IAM policies to restrict expensive operations
- Enable AWS Cost Anomaly Detection
- Require approval for large resource deployments

**Optimize Over Time**
- Review costs monthly and identify optimization opportunities
- Track cost optimization metrics and KPIs
- Implement FinOps practices and culture
- Use AWS Cost Optimization Hub for recommendations
- Celebrate cost savings achievements


#### Cost Management Patterns

**Pattern 1: Comprehensive Cost Tagging Strategy**
```hcl
# Terraform example - Consistent cost allocation tagging
locals {
  common_tags = {
    Environment  = var.environment
    Project      = var.project_name
    CostCenter   = var.cost_center
    Owner        = var.owner_email
    ManagedBy    = "Terraform"
    Application  = var.application_name
    BusinessUnit = var.business_unit
  }
}

# EC2 instance with cost tags
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type

  tags = merge(
    local.common_tags,
    {
      Name        = "app-server"
      Workload    = "web-application"
      Criticality = "high"
    }
  )
}

# S3 bucket with cost tags
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"

  tags = merge(
    local.common_tags,
    {
      Name        = "data-bucket"
      DataClass   = "confidential"
      Retention   = "7-years"
    }
  )
}

# RDS instance with cost tags
resource "aws_db_instance" "main" {
  identifier     = "main-database"
  engine         = "postgres"
  instance_class = var.db_instance_class

  tags = merge(
    local.common_tags,
    {
      Name     = "main-database"
      Database = "production"
      Backup   = "daily"
    }
  )
}

# AWS Budget with alerts
resource "aws_budgets_budget" "monthly" {
  name              = "${var.project_name}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = var.monthly_budget_limit
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2024-01-01_00:00"

  cost_filter {
    name = "TagKeyValue"
    values = [
      "Project$${var.project_name}"
    ]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.owner_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.owner_email, var.finance_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = [var.owner_email]
  }
}

# Cost anomaly detection
resource "aws_ce_anomaly_monitor" "service_monitor" {
  name              = "${var.project_name}-anomaly-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "alerts" {
  name      = "${var.project_name}-anomaly-alerts"
  frequency = "DAILY"

  monitor_arn_list = [
    aws_ce_anomaly_monitor.service_monitor.arn
  ]

  subscriber {
    type    = "EMAIL"
    address = var.owner_email
  }

  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values        = ["100"]  # Alert on anomalies over $100
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }
}
```

**Why This Is Cost-Effective:**
- Consistent tagging enables accurate cost allocation and chargeback
- Tags identify cost centers, projects, and owners for accountability
- Budgets with multiple thresholds provide early warning
- Forecasted budget alerts prevent month-end surprises
- Cost anomaly detection catches unexpected spending automatically
- Email notifications ensure stakeholders are informed


### 2. Expenditure and Usage Awareness

#### Best Practices

**Monitor Cost and Usage**
- Enable AWS Cost and Usage Reports (CUR)
- Use AWS Cost Explorer for analysis and forecasting
- Implement custom cost dashboards
- Track unit costs (cost per transaction, per user, per GB)
- Monitor Reserved Instance and Savings Plans utilization

**Analyze Cost Drivers**
- Identify top spending services and resources
- Analyze cost trends over time
- Compare actual vs. budgeted costs
- Identify idle and underutilized resources
- Use AWS Cost Categories for custom grouping

**Implement Chargeback and Showback**
- Allocate costs to business units or teams
- Create cost transparency reports
- Use tags for cost attribution
- Implement internal billing if needed
- Share cost optimization opportunities with teams

#### Cost Visibility Patterns

**Pattern 2: Cost and Usage Dashboard**
```yaml
# CloudFormation example - Cost visibility infrastructure
CostDashboard:
  Type: AWS::CloudWatch::Dashboard
  Properties:
    DashboardName: cost-optimization-dashboard
    DashboardBody: !Sub |
      {
        "widgets": [
          {
            "type": "metric",
            "properties": {
              "metrics": [
                ["AWS/Billing", "EstimatedCharges", {"stat": "Maximum"}]
              ],
              "period": 86400,
              "stat": "Maximum",
              "region": "us-east-1",
              "title": "Estimated Monthly Charges",
              "yAxis": {
                "left": {
                  "label": "USD"
                }
              }
            }
          },
          {
            "type": "log",
            "properties": {
              "query": "SOURCE '/aws/lambda/cost-analyzer' | fields @timestamp, service, cost | sort cost desc | limit 10",
              "region": "us-east-1",
              "title": "Top 10 Services by Cost"
            }
          }
        ]
      }

# Lambda function for cost analysis
CostAnalyzerFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: cost-analyzer
    Runtime: python3.11
    Handler: app.handler
    Timeout: 300
    MemorySize: 512
    Environment:
      Variables:
        S3_BUCKET: !Ref CostReportBucket
        SNS_TOPIC: !Ref CostAlertTopic
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - ce:GetCostAndUsage
              - ce:GetCostForecast
              - ce:GetReservationUtilization
              - ce:GetSavingsPlansUtilization
            Resource: '*'
          - Effect: Allow
            Action:
              - s3:PutObject
            Resource: !Sub '${CostReportBucket.Arn}/*'
    Events:
      DailySchedule:
        Type: Schedule
        Properties:
          Schedule: 'cron(0 8 * * ? *)'  # 8 AM daily

# S3 bucket for cost reports
CostReportBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub '${AWS::StackName}-cost-reports'
    VersioningConfiguration:
      Status: Enabled
    LifecycleConfiguration:
      Rules:
        - Id: DeleteOldReports
          Status: Enabled
          ExpirationInDays: 90
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: true
      IgnorePublicAcls: true
      RestrictPublicBuckets: true

# SNS topic for cost alerts
CostAlertTopic:
  Type: AWS::SNS::Topic
  Properties:
    TopicName: cost-optimization-alerts
    DisplayName: Cost Optimization Alerts
    Subscription:
      - Endpoint: !Ref AlertEmail
        Protocol: email

# EventBridge rule for idle resource detection
IdleResourceDetection:
  Type: AWS::Events::Rule
  Properties:
    Name: detect-idle-resources
    Description: Detect idle resources for cost optimization
    ScheduleExpression: 'rate(1 day)'
    State: ENABLED
    Targets:
      - Arn: !GetAtt IdleResourceDetector.Arn
        Id: IdleResourceDetectorTarget

IdleResourceDetector:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: idle-resource-detector
    Runtime: python3.11
    Handler: detector.handler
    Timeout: 300
    Environment:
      Variables:
        SNS_TOPIC: !Ref CostAlertTopic
        IDLE_THRESHOLD_DAYS: 7
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - ec2:DescribeInstances
              - ec2:DescribeVolumes
              - rds:DescribeDBInstances
              - elasticloadbalancing:DescribeLoadBalancers
              - cloudwatch:GetMetricStatistics
            Resource: '*'
```

**Why This Is Cost-Effective:**
- Daily cost analysis identifies spending trends early
- Automated idle resource detection prevents waste
- Cost reports stored in S3 with lifecycle management
- SNS alerts notify stakeholders of cost issues
- CloudWatch dashboard provides real-time visibility
- Scheduled analysis reduces manual effort


### 3. Cost-Effective Resources

#### Best Practices

**Right-Size Resources**
- Use AWS Compute Optimizer for recommendations
- Monitor resource utilization continuously
- Start small and scale up as needed
- Use burstable instances (T3/T4g) for variable workloads
- Downsize or terminate idle resources

**Use Appropriate Pricing Models**
- Use On-Demand for unpredictable workloads
- Use Reserved Instances for steady-state workloads (1-3 year commitment)
- Use Savings Plans for flexible commitment across services
- Use Spot Instances for fault-tolerant workloads (up to 90% savings)
- Mix pricing models for optimal cost

**Select Cost-Effective Storage**
- Use S3 Intelligent-Tiering for unknown access patterns
- Use S3 Glacier for archival storage
- Use EBS gp3 instead of gp2 for better price/performance
- Delete unused EBS snapshots and volumes
- Use S3 Lifecycle policies to transition data

**Optimize Data Transfer**
- Use CloudFront to reduce data transfer costs
- Keep data transfer within the same region
- Use VPC endpoints to avoid NAT Gateway costs
- Compress data before transfer
- Use AWS Direct Connect for large data transfers

#### Right-Sizing Patterns

**Pattern 3: Compute Right-Sizing with Auto Scaling**
```hcl
# Terraform example - Cost-optimized compute configuration
# Use Compute Optimizer recommendations
data "aws_ec2_instance_type_offerings" "graviton" {
  filter {
    name   = "instance-type"
    values = ["t4g.*", "m6g.*", "c6g.*"]  # Graviton instances (up to 40% better price/performance)
  }
}

# Launch template with right-sized instance
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "t4g.medium"  # Burstable Graviton instance for variable workloads

  # Use gp3 for better price/performance than gp2
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30  # Right-sized for application needs
      volume_type = "gp3"
      iops        = 3000  # Baseline IOPS (no extra cost)
      throughput  = 125   # Baseline throughput (no extra cost)
      encrypted   = true
      delete_on_termination = true
    }
  }

  # Instance metadata
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      local.common_tags,
      {
        Name = "app-instance"
        RightSized = "true"
      }
    )
  }
}

# Auto Scaling Group with scheduled scaling
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = 2
  max_size         = 10
  desired_capacity = 2  # Start with minimum

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Instance refresh for zero-downtime updates
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }
}

# Scheduled scaling - scale down during off-hours
resource "aws_autoscaling_schedule" "scale_down_evening" {
  scheduled_action_name  = "scale-down-evening"
  min_size               = 1
  max_size               = 5
  desired_capacity       = 1
  recurrence             = "0 20 * * *"  # 8 PM daily
  autoscaling_group_name = aws_autoscaling_group.app.name
}

# Scheduled scaling - scale up during business hours
resource "aws_autoscaling_schedule" "scale_up_morning" {
  scheduled_action_name  = "scale-up-morning"
  min_size               = 2
  max_size               = 10
  desired_capacity       = 2
  recurrence             = "0 8 * * MON-FRI"  # 8 AM weekdays
  autoscaling_group_name = aws_autoscaling_group.app.name
}

# Target tracking scaling policy
resource "aws_autoscaling_policy" "target_tracking" {
  name                   = "target-tracking-policy"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# CloudWatch alarm for underutilized instances
resource "aws_cloudwatch_metric_alarm" "low_cpu" {
  alarm_name          = "low-cpu-utilization"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 24  # 24 hours
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 3600  # 1 hour
  statistic           = "Average"
  threshold           = 10  # Less than 10% CPU
  alarm_description   = "Alert when instances are underutilized"
  alarm_actions       = [aws_sns_topic.cost_alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }
}
```

**Why This Is Cost-Effective:**
- Graviton instances provide up to 40% better price/performance
- Burstable instances (t4g) cost less for variable workloads
- gp3 volumes offer better price/performance than gp2
- Right-sized volumes reduce storage costs
- Scheduled scaling reduces costs during off-hours
- Target tracking maintains optimal utilization
- Underutilization alarms identify right-sizing opportunities
- Instance refresh enables zero-downtime optimization


**Pattern 4: Spot Instances for Fault-Tolerant Workloads**
```yaml
# CloudFormation example - Cost-optimized with Spot Instances
SpotFleetRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: spotfleet.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole

# Mixed instances policy - combine On-Demand and Spot
MixedInstancesAutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 2
    MaxSize: 20
    DesiredCapacity: 4
    VPCZoneIdentifier: !Ref PrivateSubnets
    HealthCheckType: ELB
    HealthCheckGracePeriod: 300
    
    MixedInstancesPolicy:
      InstancesDistribution:
        OnDemandBaseCapacity: 2  # Always keep 2 On-Demand instances
        OnDemandPercentageAboveBaseCapacity: 20  # 20% On-Demand, 80% Spot
        SpotAllocationStrategy: capacity-optimized  # Best availability
        SpotInstancePools: 4
        SpotMaxPrice: ''  # Use On-Demand price as max (recommended)
      
      LaunchTemplate:
        LaunchTemplateSpecification:
          LaunchTemplateId: !Ref LaunchTemplate
          Version: !GetAtt LaunchTemplate.LatestVersionNumber
        
        Overrides:
          - InstanceType: t4g.medium
            WeightedCapacity: 1
          - InstanceType: t4g.large
            WeightedCapacity: 2
          - InstanceType: t3.medium
            WeightedCapacity: 1
          - InstanceType: t3.large
            WeightedCapacity: 2

# Spot interruption handler
SpotInterruptionHandler:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: spot-interruption-handler
    Runtime: python3.11
    Handler: handler.lambda_handler
    Timeout: 60
    Environment:
      Variables:
        ASG_NAME: !Ref MixedInstancesAutoScalingGroup
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - autoscaling:CompleteLifecycleAction
              - autoscaling:RecordLifecycleActionHeartbeat
            Resource: '*'
    Events:
      SpotInterruption:
        Type: EventBridgeRule
        Properties:
          Pattern:
            source:
              - aws.ec2
            detail-type:
              - EC2 Spot Instance Interruption Warning

# Savings Plans recommendation checker
SavingsPlanChecker:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: savings-plan-checker
    Runtime: python3.11
    Handler: checker.handler
    Timeout: 300
    Environment:
      Variables:
        SNS_TOPIC: !Ref CostAlertTopic
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - ce:GetSavingsPlansPurchaseRecommendation
              - ce:GetReservationPurchaseRecommendation
            Resource: '*'
    Events:
      MonthlyCheck:
        Type: Schedule
        Properties:
          Schedule: 'cron(0 9 1 * ? *)'  # 1st of month at 9 AM
```

**Why This Is Cost-Effective:**
- Spot Instances provide up to 90% savings vs On-Demand
- Mixed instances policy ensures availability with On-Demand base
- Capacity-optimized allocation reduces interruptions
- Multiple instance types increase Spot availability
- Spot interruption handler enables graceful shutdown
- Automated Savings Plans recommendations maximize savings
- Weighted capacity allows flexible instance sizing


**Pattern 5: Cost-Optimized Storage Strategy**
```hcl
# Terraform example - Multi-tier storage with lifecycle policies
# S3 bucket with Intelligent-Tiering
resource "aws_s3_bucket" "data" {
  bucket = "cost-optimized-data-bucket"
}

# Enable versioning for data protection
resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Intelligent-Tiering configuration
resource "aws_s3_bucket_intelligent_tiering_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  name   = "EntireDataset"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90  # Move to Archive Access after 90 days
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180  # Move to Deep Archive after 180 days
  }
}

# Lifecycle policy for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    id     = "transition-old-data"
    status = "Enabled"

    # Transition current versions
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
      storage_class = "GLACIER"  # Glacier Flexible Retrieval after 180 days
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"  # Deep Archive after 1 year
    }

    # Delete old versions
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 180  # Delete old versions after 180 days
    }

    # Delete incomplete multipart uploads
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "delete-temporary-data"
    status = "Enabled"

    filter {
      prefix = "temp/"
    }

    expiration {
      days = 7  # Delete temporary data after 7 days
    }
  }
}

# EBS volume with gp3 and snapshot lifecycle
resource "aws_ebs_volume" "data" {
  availability_zone = "us-east-1a"
  size              = 100
  type              = "gp3"
  iops              = 3000  # Baseline IOPS (no extra cost)
  throughput        = 125   # Baseline throughput (no extra cost)
  encrypted         = true

  tags = merge(
    local.common_tags,
    {
      Name = "data-volume"
      SnapshotSchedule = "daily"
    }
  )
}

# Data Lifecycle Manager for automated snapshots
resource "aws_dlm_lifecycle_policy" "ebs_snapshots" {
  description        = "Cost-optimized EBS snapshot policy"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]

    schedule {
      name = "Daily snapshots with retention"

      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["03:00"]
      }

      retain_rule {
        count = 7  # Keep only 7 daily snapshots
      }

      tags_to_add = {
        SnapshotType = "automated"
        ManagedBy    = "DLM"
      }

      copy_tags = true
    }

    target_tags = {
      SnapshotSchedule = "daily"
    }
  }
}

# EFS with lifecycle management
resource "aws_efs_file_system" "shared" {
  creation_token = "cost-optimized-efs"
  encrypted      = true
  
  # Lifecycle management to move to IA storage class
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  lifecycle_policy {
    transition_to_primary_storage_class = "AFTER_1_ACCESS"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "shared-efs"
    }
  )
}

# CloudWatch alarm for unused EBS volumes
resource "aws_cloudwatch_metric_alarm" "unused_ebs" {
  alarm_name          = "unused-ebs-volumes"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 7  # 7 days
  metric_name         = "VolumeReadOps"
  namespace           = "AWS/EBS"
  period              = 86400  # 1 day
  statistic           = "Sum"
  threshold           = 1  # Less than 1 read operation per day
  alarm_description   = "Alert when EBS volumes are unused"
  alarm_actions       = [aws_sns_topic.cost_alerts.arn]
  treat_missing_data  = "breaching"
}
```

**Why This Is Cost-Effective:**
- Intelligent-Tiering automatically optimizes storage costs
- Lifecycle policies transition data to cheaper storage classes
- Old versions deleted automatically to reduce costs
- Incomplete multipart uploads cleaned up
- gp3 volumes provide better price/performance than gp2
- Snapshot retention limited to 7 days (adjust based on needs)
- EFS lifecycle management moves infrequently accessed data to IA
- Unused volume detection prevents waste


### 4. Manage Demand and Supply Resources

#### Best Practices

**Use Auto Scaling**
- Implement Auto Scaling for compute resources
- Use target tracking scaling policies
- Configure scheduled scaling for predictable patterns
- Use predictive scaling for ML-based forecasting
- Scale based on business metrics, not just technical metrics

**Implement Throttling and Buffering**
- Use API Gateway throttling to control request rates
- Implement SQS queues to buffer requests
- Use Lambda reserved concurrency to limit costs
- Implement exponential backoff for retries
- Use CloudFront to cache and reduce origin load

**Use Serverless Architectures**
- Use Lambda for event-driven workloads
- Use API Gateway for serverless APIs
- Use DynamoDB for serverless databases
- Use S3 for serverless storage
- Pay only for actual usage, not idle capacity

#### Demand Management Patterns

**Pattern 6: Serverless Architecture for Variable Demand**
```yaml
# CloudFormation example - Cost-optimized serverless architecture
# API Gateway with caching and throttling
ApiGateway:
  Type: AWS::Serverless::Api
  Properties:
    StageName: prod
    
    # Enable caching to reduce Lambda invocations
    CacheClusterEnabled: true
    CacheClusterSize: '0.5'  # Smallest cache size
    
    # Method settings
    MethodSettings:
      - ResourcePath: /*
        HttpMethod: '*'
        CachingEnabled: true
        CacheTtlInSeconds: 300
        CacheDataEncrypted: true
        
        # Throttling to control costs
        ThrottlingBurstLimit: 1000
        ThrottlingRateLimit: 500
    
    # Enable X-Ray tracing
    TracingEnabled: true

# Lambda function with right-sized memory
ApiFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: api-handler
    Runtime: python3.11
    Handler: app.handler
    MemorySize: 512  # Right-sized based on profiling
    Timeout: 10
    
    # Reserved concurrency to limit costs
    ReservedConcurrentExecutions: 100
    
    # Ephemeral storage (default 512 MB is usually sufficient)
    EphemeralStorage:
      Size: 512
    
    # Environment variables
    Environment:
      Variables:
        TABLE_NAME: !Ref DataTable
        CACHE_TTL: '300'
    
    # Policies
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref DataTable
    
    # Events
    Events:
      ApiEvent:
        Type: Api
        Properties:
          RestApiId: !Ref ApiGateway
          Path: /items
          Method: GET

# DynamoDB with on-demand billing
DataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: api-data
    BillingMode: PAY_PER_REQUEST  # On-demand for variable workloads
    
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    
    # Point-in-time recovery
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    
    # Table class for cost optimization
    TableClass: STANDARD_INFREQUENT_ACCESS  # 50% cheaper for infrequent access

# SQS queue for buffering requests
RequestQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: request-queue
    VisibilityTimeout: 300
    MessageRetentionPeriod: 345600  # 4 days
    ReceiveMessageWaitTimeSeconds: 20  # Long polling to reduce costs
    
    # Dead letter queue for failed messages
    RedrivePolicy:
      deadLetterTargetArn: !GetAtt RequestDLQ.Arn
      maxReceiveCount: 3

RequestDLQ:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: request-dlq
    MessageRetentionPeriod: 1209600  # 14 days

# Lambda function for queue processing
QueueProcessor:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: queue-processor
    Runtime: python3.11
    Handler: processor.handler
    MemorySize: 512
    Timeout: 300
    
    # Reserved concurrency to control costs
    ReservedConcurrentExecutions: 50
    
    Events:
      QueueEvent:
        Type: SQS
        Properties:
          Queue: !GetAtt RequestQueue.Arn
          BatchSize: 10
          MaximumBatchingWindowInSeconds: 5
          FunctionResponseTypes:
            - ReportBatchItemFailures

# CloudWatch alarm for high Lambda costs
LambdaCostAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: high-lambda-invocations
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 1
    MetricName: Invocations
    Namespace: AWS/Lambda
    Period: 3600  # 1 hour
    Statistic: Sum
    Threshold: 100000  # Alert if more than 100k invocations per hour
    AlarmDescription: Alert when Lambda invocations are high
    AlarmActions:
      - !Ref CostAlertTopic
    Dimensions:
      - Name: FunctionName
        Value: !Ref ApiFunction
```

**Why This Is Cost-Effective:**
- API Gateway caching reduces Lambda invocations by up to 90%
- Reserved concurrency prevents runaway costs
- Right-sized Lambda memory optimizes cost/performance
- DynamoDB on-demand billing eliminates idle capacity costs
- Standard-IA table class saves 50% for infrequent access
- SQS long polling reduces API calls and costs
- Batch processing reduces Lambda invocations
- Cost alarms prevent unexpected spending


### 5. Optimize Over Time

#### Best Practices

**Review and Optimize Regularly**
- Conduct monthly cost optimization reviews
- Use AWS Cost Optimization Hub for recommendations
- Implement AWS Compute Optimizer recommendations
- Review and delete unused resources
- Update to latest generation instances

**Measure and Track Optimization**
- Track cost per unit metrics (per user, per transaction)
- Measure cost optimization savings
- Set cost optimization goals and KPIs
- Share optimization wins with stakeholders
- Celebrate cost savings achievements

**Stay Current with AWS Services**
- Evaluate new AWS services for cost benefits
- Migrate to Graviton instances for better price/performance
- Use latest generation instances and storage
- Adopt managed services to reduce operational costs
- Leverage AWS innovations (Spot, Savings Plans, etc.)

#### Optimization Patterns

**Pattern 7: Automated Cost Optimization**
```python
# Python Lambda example - Automated cost optimization
import boto3
import json
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')
rds = boto3.client('rds')
cloudwatch = boto3.client('cloudwatch')
sns = boto3.client('sns')
ce = boto3.client('ce')

def lambda_handler(event, context):
    """
    Automated cost optimization checks and actions
    """
    optimizations = []
    
    # 1. Find and stop idle EC2 instances
    idle_instances = find_idle_ec2_instances()
    if idle_instances:
        optimizations.append({
            'type': 'idle_ec2',
            'count': len(idle_instances),
            'instances': idle_instances,
            'potential_savings': calculate_ec2_savings(idle_instances)
        })
    
    # 2. Find unattached EBS volumes
    unattached_volumes = find_unattached_ebs_volumes()
    if unattached_volumes:
        optimizations.append({
            'type': 'unattached_ebs',
            'count': len(unattached_volumes),
            'volumes': unattached_volumes,
            'potential_savings': calculate_ebs_savings(unattached_volumes)
        })
    
    # 3. Find old EBS snapshots
    old_snapshots = find_old_snapshots(days=90)
    if old_snapshots:
        optimizations.append({
            'type': 'old_snapshots',
            'count': len(old_snapshots),
            'snapshots': old_snapshots,
            'potential_savings': calculate_snapshot_savings(old_snapshots)
        })
    
    # 4. Find idle RDS instances
    idle_rds = find_idle_rds_instances()
    if idle_rds:
        optimizations.append({
            'type': 'idle_rds',
            'count': len(idle_rds),
            'instances': idle_rds,
            'potential_savings': calculate_rds_savings(idle_rds)
        })
    
    # 5. Check for unoptimized instance types
    upgrade_recommendations = get_compute_optimizer_recommendations()
    if upgrade_recommendations:
        optimizations.append({
            'type': 'instance_upgrades',
            'recommendations': upgrade_recommendations
        })
    
    # 6. Check Reserved Instance utilization
    ri_utilization = check_ri_utilization()
    if ri_utilization['underutilized']:
        optimizations.append({
            'type': 'ri_underutilization',
            'details': ri_utilization
        })
    
    # Generate report
    report = generate_optimization_report(optimizations)
    
    # Send notification
    send_notification(report)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'optimizations_found': len(optimizations),
            'total_potential_savings': sum(opt.get('potential_savings', 0) for opt in optimizations)
        })
    }

def find_idle_ec2_instances():
    """Find EC2 instances with low CPU utilization"""
    idle_instances = []
    
    # Get all running instances
    response = ec2.describe_instances(
        Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
    )
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            
            # Check CPU utilization over last 7 days
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=7)
            
            cpu_stats = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                StartTime=start_time,
                EndTime=end_time,
                Period=3600,  # 1 hour
                Statistics=['Average']
            )
            
            if cpu_stats['Datapoints']:
                avg_cpu = sum(dp['Average'] for dp in cpu_stats['Datapoints']) / len(cpu_stats['Datapoints'])
                
                # If average CPU < 5% over 7 days, consider idle
                if avg_cpu < 5:
                    idle_instances.append({
                        'instance_id': instance_id,
                        'instance_type': instance['InstanceType'],
                        'avg_cpu': round(avg_cpu, 2),
                        'tags': instance.get('Tags', [])
                    })
    
    return idle_instances

def find_unattached_ebs_volumes():
    """Find EBS volumes not attached to any instance"""
    unattached = []
    
    response = ec2.describe_volumes(
        Filters=[{'Name': 'status', 'Values': ['available']}]
    )
    
    for volume in response['Volumes']:
        unattached.append({
            'volume_id': volume['VolumeId'],
            'size': volume['Size'],
            'volume_type': volume['VolumeType'],
            'created': volume['CreateTime'].isoformat()
        })
    
    return unattached

def find_old_snapshots(days=90):
    """Find snapshots older than specified days"""
    old_snapshots = []
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    response = ec2.describe_snapshots(OwnerIds=['self'])
    
    for snapshot in response['Snapshots']:
        if snapshot['StartTime'].replace(tzinfo=None) < cutoff_date:
            old_snapshots.append({
                'snapshot_id': snapshot['SnapshotId'],
                'volume_size': snapshot['VolumeSize'],
                'start_time': snapshot['StartTime'].isoformat(),
                'age_days': (datetime.utcnow() - snapshot['StartTime'].replace(tzinfo=None)).days
            })
    
    return old_snapshots

def find_idle_rds_instances():
    """Find RDS instances with low connection count"""
    idle_rds = []
    
    response = rds.describe_db_instances()
    
    for db in response['DBInstances']:
        db_id = db['DBInstanceIdentifier']
        
        # Check database connections over last 7 days
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7)
        
        conn_stats = cloudwatch.get_metric_statistics(
            Namespace='AWS/RDS',
            MetricName='DatabaseConnections',
            Dimensions=[{'Name': 'DBInstanceIdentifier', 'Value': db_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average']
        )
        
        if conn_stats['Datapoints']:
            avg_connections = sum(dp['Average'] for dp in conn_stats['Datapoints']) / len(conn_stats['Datapoints'])
            
            # If average connections < 1 over 7 days, consider idle
            if avg_connections < 1:
                idle_rds.append({
                    'db_instance': db_id,
                    'instance_class': db['DBInstanceClass'],
                    'engine': db['Engine'],
                    'avg_connections': round(avg_connections, 2)
                })
    
    return idle_rds

def get_compute_optimizer_recommendations():
    """Get Compute Optimizer recommendations"""
    compute_optimizer = boto3.client('compute-optimizer')
    recommendations = []
    
    try:
        response = compute_optimizer.get_ec2_instance_recommendations()
        
        for rec in response.get('instanceRecommendations', []):
            if rec['finding'] in ['Overprovisioned', 'Underprovisioned']:
                recommendations.append({
                    'instance_id': rec['instanceArn'].split('/')[-1],
                    'current_type': rec['currentInstanceType'],
                    'recommended_type': rec['recommendationOptions'][0]['instanceType'],
                    'finding': rec['finding'],
                    'estimated_savings': rec['recommendationOptions'][0].get('estimatedMonthlySavings', {})
                })
    except Exception as e:
        print(f"Error getting Compute Optimizer recommendations: {e}")
    
    return recommendations

def check_ri_utilization():
    """Check Reserved Instance utilization"""
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    
    response = ce.get_reservation_utilization(
        TimePeriod={
            'Start': start_date.isoformat(),
            'End': end_date.isoformat()
        },
        Granularity='MONTHLY'
    )
    
    utilization = response['UtilizationsBy Time'][0]['Total']
    utilization_pct = float(utilization['UtilizationPercentage'])
    
    return {
        'utilization_percentage': utilization_pct,
        'underutilized': utilization_pct < 80,
        'purchased_hours': utilization['PurchasedHours'],
        'used_hours': utilization['UsedHours']
    }

def calculate_ec2_savings(instances):
    """Calculate potential savings from stopping idle instances"""
    # Simplified calculation - actual pricing varies by region and instance type
    savings = 0
    for instance in instances:
        # Rough estimate: $0.05/hour average
        savings += 0.05 * 24 * 30  # Monthly savings
    return round(savings, 2)

def calculate_ebs_savings(volumes):
    """Calculate savings from deleting unattached volumes"""
    savings = 0
    for volume in volumes:
        # gp3: $0.08/GB-month
        savings += volume['size'] * 0.08
    return round(savings, 2)

def calculate_snapshot_savings(snapshots):
    """Calculate savings from deleting old snapshots"""
    savings = 0
    for snapshot in snapshots:
        # Snapshot: $0.05/GB-month
        savings += snapshot['volume_size'] * 0.05
    return round(savings, 2)

def calculate_rds_savings(instances):
    """Calculate potential savings from stopping idle RDS instances"""
    savings = 0
    for instance in instances:
        # Rough estimate: $0.10/hour average
        savings += 0.10 * 24 * 30
    return round(savings, 2)

def generate_optimization_report(optimizations):
    """Generate human-readable optimization report"""
    report = "AWS Cost Optimization Report\n"
    report += "=" * 50 + "\n\n"
    
    total_savings = 0
    
    for opt in optimizations:
        if opt['type'] == 'idle_ec2':
            report += f"Idle EC2 Instances: {opt['count']}\n"
            report += f"Potential Monthly Savings: ${opt['potential_savings']}\n"
            for instance in opt['instances'][:5]:  # Show first 5
                report += f"  - {instance['instance_id']} ({instance['instance_type']}): {instance['avg_cpu']}% CPU\n"
            report += "\n"
            total_savings += opt['potential_savings']
        
        elif opt['type'] == 'unattached_ebs':
            report += f"Unattached EBS Volumes: {opt['count']}\n"
            report += f"Potential Monthly Savings: ${opt['potential_savings']}\n\n"
            total_savings += opt['potential_savings']
        
        elif opt['type'] == 'old_snapshots':
            report += f"Old Snapshots (>90 days): {opt['count']}\n"
            report += f"Potential Monthly Savings: ${opt['potential_savings']}\n\n"
            total_savings += opt['potential_savings']
        
        elif opt['type'] == 'idle_rds':
            report += f"Idle RDS Instances: {opt['count']}\n"
            report += f"Potential Monthly Savings: ${opt['potential_savings']}\n\n"
            total_savings += opt['potential_savings']
        
        elif opt['type'] == 'instance_upgrades':
            report += f"Instance Right-Sizing Opportunities: {len(opt['recommendations'])}\n"
            for rec in opt['recommendations'][:5]:
                report += f"  - {rec['instance_id']}: {rec['current_type']} → {rec['recommended_type']}\n"
            report += "\n"
        
        elif opt['type'] == 'ri_underutilization':
            report += f"Reserved Instance Utilization: {opt['details']['utilization_percentage']}%\n"
            report += "Consider modifying or selling unused RIs\n\n"
    
    report += "=" * 50 + "\n"
    report += f"Total Potential Monthly Savings: ${total_savings}\n"
    
    return report

def send_notification(report):
    """Send optimization report via SNS"""
    sns.publish(
        TopicArn='arn:aws:sns:REGION:ACCOUNT_ID:cost-optimization',
        Subject='AWS Cost Optimization Report',
        Message=report
    )
```

**Why This Is Cost-Effective:**
- Automated detection of idle resources
- Identifies unattached volumes and old snapshots
- Checks RDS utilization to find idle databases
- Integrates with Compute Optimizer for right-sizing
- Monitors Reserved Instance utilization
- Calculates potential savings for each optimization
- Automated weekly reports reduce manual effort
- Actionable recommendations with specific resource IDs


## Common Cost Optimization Issues and Remediation

### Issue 1: Idle EC2 Instances

**Detection**: CloudWatch CPU utilization < 5% for 7+ days

**Risk**: Medium - Wasting money on unused compute capacity

**Potential Savings**: $50-500/month per instance

**Remediation**:
```hcl
# Stop idle instances during off-hours
resource "aws_autoscaling_schedule" "stop_idle" {
  scheduled_action_name  = "stop-idle-instances"
  min_size               = 0
  max_size               = 0
  desired_capacity       = 0
  recurrence             = "0 20 * * *"  # 8 PM daily
  autoscaling_group_name = aws_autoscaling_group.app.name
}

# Or use Instance Scheduler
resource "aws_lambda_function" "instance_scheduler" {
  filename      = "instance_scheduler.zip"
  function_name = "instance-scheduler"
  role          = aws_iam_role.scheduler.arn
  handler       = "scheduler.handler"
  runtime       = "python3.11"
  
  environment {
    variables = {
      SCHEDULE = "weekdays-9to5"  # Only run during business hours
    }
  }
}
```

### Issue 2: Unattached EBS Volumes

**Detection**: EBS volumes in "available" state

**Risk**: Low - Small ongoing cost but adds up

**Potential Savings**: $8/month per 100 GB volume

**Remediation**:
```python
# Lambda function to delete unattached volumes after 30 days
import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')

def delete_old_unattached_volumes():
    volumes = ec2.describe_volumes(
        Filters=[{'Name': 'status', 'Values': ['available']}]
    )
    
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    
    for volume in volumes['Volumes']:
        create_time = volume['CreateTime'].replace(tzinfo=None)
        
        if create_time < cutoff_date:
            # Check if volume has "DoNotDelete" tag
            tags = {tag['Key']: tag['Value'] for tag in volume.get('Tags', [])}
            
            if tags.get('DoNotDelete') != 'true':
                print(f"Deleting volume {volume['VolumeId']}")
                ec2.delete_volume(VolumeId=volume['VolumeId'])
```

### Issue 3: Old EBS Snapshots

**Detection**: Snapshots older than retention policy

**Risk**: Low - Incremental cost but accumulates

**Potential Savings**: $5/month per 100 GB snapshot

**Remediation**:
```hcl
# Use Data Lifecycle Manager for automated snapshot management
resource "aws_dlm_lifecycle_policy" "snapshots" {
  description        = "Automated snapshot lifecycle"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]

    schedule {
      name = "Daily snapshots"

      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["03:00"]
      }

      retain_rule {
        count = 7  # Keep only 7 snapshots
      }

      copy_tags = true
    }

    target_tags = {
      Snapshot = "true"
    }
  }
}
```

### Issue 4: Oversized RDS Instances

**Detection**: RDS CPU < 20%, memory < 50% consistently

**Risk**: Medium - Significant cost for databases

**Potential Savings**: $100-1000/month per instance

**Remediation**:
```hcl
# Downsize RDS instance
resource "aws_db_instance" "main" {
  identifier     = "main-database"
  engine         = "postgres"
  instance_class = "db.t4g.medium"  # Downsize from db.r6g.xlarge
  
  # Enable storage autoscaling
  allocated_storage     = 100
  max_allocated_storage = 500
  
  # Use gp3 for better price/performance
  storage_type = "gp3"
  iops         = 3000
  
  # Enable Performance Insights to monitor after downsize
  performance_insights_enabled = true
}
```

### Issue 5: Unused Load Balancers

**Detection**: Load balancer with 0 active connections

**Risk**: Low - $16-20/month per ALB

**Potential Savings**: $16-20/month per load balancer

**Remediation**:
```python
# Lambda to detect and alert on unused load balancers
import boto3
from datetime import datetime, timedelta

elbv2 = boto3.client('elbv2')
cloudwatch = boto3.client('cloudwatch')

def find_unused_load_balancers():
    unused_lbs = []
    
    response = elbv2.describe_load_balancers()
    
    for lb in response['LoadBalancers']:
        lb_arn = lb['LoadBalancerArn']
        
        # Check active connections over last 7 days
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7)
        
        stats = cloudwatch.get_metric_statistics(
            Namespace='AWS/ApplicationELB',
            MetricName='ActiveConnectionCount',
            Dimensions=[{
                'Name': 'LoadBalancer',
                'Value': lb_arn.split('/')[-3] + '/' + lb_arn.split('/')[-2] + '/' + lb_arn.split('/')[-1]
            }],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Sum']
        )
        
        if not stats['Datapoints'] or all(dp['Sum'] == 0 for dp in stats['Datapoints']):
            unused_lbs.append({
                'name': lb['LoadBalancerName'],
                'arn': lb_arn,
                'type': lb['Type']
            })
    
    return unused_lbs
```

### Issue 6: Unoptimized Data Transfer

**Detection**: High data transfer costs in Cost Explorer

**Risk**: Medium - Can be significant for data-intensive applications

**Potential Savings**: Varies widely, often 20-50% reduction possible

**Remediation**:
```hcl
# Use CloudFront to reduce data transfer costs
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_100"  # Use only North America and Europe
  
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.content.id}"
    
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.content.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true  # Enable compression
    
    min_ttl     = 0
    default_ttl = 86400   # 24 hours
    max_ttl     = 31536000  # 1 year
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Use VPC endpoints to avoid NAT Gateway costs
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  
  route_table_ids = aws_route_table.private[*].id
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.dynamodb"
  
  route_table_ids = aws_route_table.private[*].id
}
```

### Issue 7: No Reserved Instances or Savings Plans

**Detection**: 100% On-Demand usage for steady-state workloads

**Risk**: High - Missing 30-70% savings opportunity

**Potential Savings**: 30-70% on compute costs

**Remediation**:
```hcl
# Purchase Compute Savings Plan (most flexible)
# Note: This is typically done through AWS Console or CLI, not Terraform
# But you can track and monitor with CloudWatch

resource "aws_cloudwatch_metric_alarm" "savings_plan_utilization" {
  alarm_name          = "low-savings-plan-utilization"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UtilizationPercentage"
  namespace           = "AWS/SavingsPlans"
  period              = 86400  # Daily
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when Savings Plan utilization is low"
  treat_missing_data  = "notBreaching"
}

# Lambda to check Savings Plans recommendations
resource "aws_lambda_function" "savings_plan_recommender" {
  filename      = "sp_recommender.zip"
  function_name = "savings-plan-recommender"
  role          = aws_iam_role.sp_recommender.arn
  handler       = "recommender.handler"
  runtime       = "python3.11"
  timeout       = 300
  
  environment {
    variables = {
      SNS_TOPIC = aws_sns_topic.cost_alerts.arn
    }
  }
}

# Schedule monthly Savings Plans review
resource "aws_cloudwatch_event_rule" "monthly_sp_review" {
  name                = "monthly-savings-plan-review"
  description         = "Monthly Savings Plans recommendation review"
  schedule_expression = "cron(0 9 1 * ? *)"  # 1st of month at 9 AM
}

resource "aws_cloudwatch_event_target" "sp_recommender" {
  rule      = aws_cloudwatch_event_rule.monthly_sp_review.name
  target_id = "SavingsPlanRecommender"
  arn       = aws_lambda_function.savings_plan_recommender.arn
}
```


## Code Generation Guidance for Cost-Optimized Infrastructure

When generating infrastructure code, apply these cost optimization principles:

### 1. Compute Cost Optimization

**Always Consider:**
- Use Graviton instances (t4g, m6g, c6g, r6g) for up to 40% better price/performance
- Start with burstable instances (t3/t4g) for variable workloads
- Implement Auto Scaling to match capacity with demand
- Use Spot Instances for fault-tolerant workloads (up to 90% savings)
- Set up scheduled scaling for predictable patterns

**Example Generated Code:**
```hcl
# Cost-optimized compute configuration
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "t4g.medium"  # Graviton burstable instance
  
  # Cost-optimized storage
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30  # Right-sized
      volume_type = "gp3"  # Better price/performance than gp2
      iops        = 3000
      throughput  = 125
      encrypted   = true
    }
  }
}

# Auto Scaling for cost optimization
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = var.private_subnet_ids
  min_size            = 2
  max_size            = 10
  desired_capacity    = 2
  
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
  
  # Target tracking to maintain optimal utilization
  target_group_arns = [aws_lb_target_group.app.arn]
}

# Scheduled scaling for predictable patterns
resource "aws_autoscaling_schedule" "scale_down_evening" {
  scheduled_action_name  = "scale-down-evening"
  min_size               = 1
  max_size               = 5
  desired_capacity       = 1
  recurrence             = "0 20 * * *"  # Scale down at 8 PM
  autoscaling_group_name = aws_autoscaling_group.app.name
}
```

### 2. Storage Cost Optimization

**Always Consider:**
- Use gp3 volumes instead of gp2 (20% cheaper, better performance)
- Implement S3 Lifecycle policies to transition to cheaper storage classes
- Use S3 Intelligent-Tiering for unknown access patterns
- Enable EFS lifecycle management to move to IA storage
- Delete old snapshots and unattached volumes

**Example Generated Code:**
```hcl
# Cost-optimized S3 bucket
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}

# Intelligent-Tiering for automatic cost optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  name   = "EntireDataset"
  
  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
  
  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# Lifecycle policy for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id     = "cost-optimization"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
    
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
```

### 3. Database Cost Optimization

**Always Consider:**
- Use Graviton instances (db.t4g, db.r6g) for RDS
- Use DynamoDB on-demand for variable workloads
- Use DynamoDB Standard-IA for infrequent access (50% cheaper)
- Enable storage autoscaling for RDS
- Use read replicas instead of larger primary instances

**Example Generated Code:**
```hcl
# Cost-optimized RDS instance
resource "aws_db_instance" "main" {
  identifier     = "main-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t4g.medium"  # Graviton burstable instance
  
  # Storage autoscaling
  allocated_storage     = 100
  max_allocated_storage = 500
  storage_type          = "gp3"
  
  # Multi-AZ for production
  multi_az = true
  
  # Automated backups with reasonable retention
  backup_retention_period = 7  # Not excessive
  
  # Enable Performance Insights (free tier)
  performance_insights_enabled          = true
  performance_insights_retention_period = 7  # Free tier
}

# Cost-optimized DynamoDB table
resource "aws_dynamodb_table" "data" {
  name         = "app-data"
  billing_mode = "PAY_PER_REQUEST"  # On-demand for variable workloads
  
  attribute {
    name = "id"
    type = "S"
  }
  
  hash_key = "id"
  
  # Use Standard-IA for infrequent access (50% cheaper)
  table_class = "STANDARD_INFREQUENT_ACCESS"
  
  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }
}
```

### 4. Serverless Cost Optimization

**Always Consider:**
- Right-size Lambda memory based on profiling
- Use reserved concurrency to limit costs
- Enable API Gateway caching to reduce Lambda invocations
- Use SQS for buffering to batch process requests
- Use DynamoDB on-demand for variable traffic

**Example Generated Code:**
```yaml
# Cost-optimized serverless API
ApiGateway:
  Type: AWS::Serverless::Api
  Properties:
    StageName: prod
    CacheClusterEnabled: true
    CacheClusterSize: '0.5'  # Smallest cache
    MethodSettings:
      - ResourcePath: /*
        HttpMethod: '*'
        CachingEnabled: true
        CacheTtlInSeconds: 300
        ThrottlingBurstLimit: 1000
        ThrottlingRateLimit: 500

ApiFunction:
  Type: AWS::Serverless::Function
  Properties:
    Runtime: python3.11
    Handler: app.handler
    MemorySize: 512  # Right-sized based on profiling
    Timeout: 10
    ReservedConcurrentExecutions: 100  # Limit to control costs
    Environment:
      Variables:
        TABLE_NAME: !Ref DataTable
    Events:
      ApiEvent:
        Type: Api
        Properties:
          RestApiId: !Ref ApiGateway
          Path: /items
          Method: GET

DataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    BillingMode: PAY_PER_REQUEST
    TableClass: STANDARD_INFREQUENT_ACCESS
```

### 5. Network Cost Optimization

**Always Consider:**
- Use VPC endpoints to avoid NAT Gateway costs ($0.045/hour + $0.045/GB)
- Use CloudFront to reduce data transfer costs
- Keep data transfer within the same region
- Use PrivateLink for service-to-service communication
- Enable compression for data transfer

**Example Generated Code:**
```hcl
# VPC endpoints to avoid NAT Gateway costs
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  route_table_ids = aws_route_table.private[*].id
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.dynamodb"
  route_table_ids = aws_route_table.private[*].id
}

# Interface endpoints for other services
resource "aws_vpc_endpoint" "lambda" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.lambda"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}

# CloudFront for content delivery
resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"
  price_class     = "PriceClass_100"  # Use only cost-effective regions
  
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "S3-origin"
  }
  
  default_cache_behavior {
    target_origin_id       = "S3-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true  # Enable compression
    
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
}
```

### 6. Cost Tagging and Monitoring

**Always Include:**
- Consistent cost allocation tags on all resources
- AWS Budgets with alerts
- Cost anomaly detection
- CloudWatch alarms for cost metrics

**Example Generated Code:**
```hcl
# Standard cost allocation tags
locals {
  common_tags = {
    Environment  = var.environment
    Project      = var.project_name
    CostCenter   = var.cost_center
    Owner        = var.owner_email
    ManagedBy    = "Terraform"
    Application  = var.application_name
  }
}

# Budget with alerts
resource "aws_budgets_budget" "monthly" {
  name              = "${var.project_name}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = var.monthly_budget_limit
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.owner_email]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.owner_email, var.finance_email]
  }
}

# Cost anomaly detection
resource "aws_ce_anomaly_monitor" "service_monitor" {
  name              = "${var.project_name}-anomaly-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "alerts" {
  name      = "${var.project_name}-anomaly-alerts"
  frequency = "DAILY"
  
  monitor_arn_list = [
    aws_ce_anomaly_monitor.service_monitor.arn
  ]
  
  subscriber {
    type    = "EMAIL"
    address = var.owner_email
  }
  
  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values        = ["100"]
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }
}
```

### Inline Comments for Cost Decisions

Always include comments explaining cost optimization decisions:

```hcl
# Using t4g.medium (Graviton) instead of t3.medium for 20% cost savings
# and better price/performance ratio
instance_type = "t4g.medium"

# Using gp3 instead of gp2 saves 20% on storage costs while providing
# better baseline performance (3000 IOPS vs 100-16000 IOPS for gp2)
volume_type = "gp3"

# Scheduled scaling reduces costs by 50% during off-hours (8 PM - 8 AM)
# when traffic is typically 80% lower
recurrence = "0 20 * * *"

# Reserved concurrency of 100 prevents runaway Lambda costs while
# still allowing for traffic spikes up to 100 concurrent executions
reserved_concurrent_executions = 100

# API Gateway caching reduces Lambda invocations by ~80% for this
# read-heavy workload, saving approximately $200/month
cache_cluster_enabled = true
```


## Cost Optimization Anti-Patterns

### ❌ Anti-Pattern 1: Always-On Development Environments

**Problem**: Running development and test environments 24/7 like production

```hcl
# DON'T DO THIS - Dev environment running 24/7
resource "aws_instance" "dev" {
  ami           = "ami-12345678"
  instance_type = "t3.large"
  # No scheduling, runs continuously
}
```

**Fix**: Implement scheduled start/stop for non-production environments

```hcl
# DO THIS - Schedule dev environment to run only during business hours
resource "aws_autoscaling_schedule" "dev_start" {
  scheduled_action_name  = "dev-start"
  min_size               = 1
  max_size               = 3
  desired_capacity       = 1
  recurrence             = "0 8 * * MON-FRI"  # 8 AM weekdays
  autoscaling_group_name = aws_autoscaling_group.dev.name
}

resource "aws_autoscaling_schedule" "dev_stop" {
  scheduled_action_name  = "dev-stop"
  min_size               = 0
  max_size               = 0
  desired_capacity       = 0
  recurrence             = "0 18 * * MON-FRI"  # 6 PM weekdays
  autoscaling_group_name = aws_autoscaling_group.dev.name
}
```

**Savings**: 70-80% reduction in compute costs for dev/test environments

### ❌ Anti-Pattern 2: Oversized "Just in Case" Resources

**Problem**: Provisioning large instances "just in case" without monitoring actual usage

```hcl
# DON'T DO THIS - Oversized instance without justification
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "m5.4xlarge"  # 16 vCPUs, 64 GB RAM
  # Actual usage: 10% CPU, 20% memory
}
```

**Fix**: Start small, monitor, and scale up based on actual needs

```hcl
# DO THIS - Right-sized instance with monitoring
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t4g.medium"  # Start small
  
  tags = {
    Name = "app-server"
    MonitorUtilization = "true"
  }
}

# CloudWatch alarm to alert if consistently high utilization
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "app-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when CPU is consistently high - may need to upsize"
}
```

**Savings**: 50-70% reduction by right-sizing

### ❌ Anti-Pattern 3: No Lifecycle Policies on S3

**Problem**: Keeping all data in S3 Standard storage indefinitely

```hcl
# DON'T DO THIS - No lifecycle management
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
  # No lifecycle configuration
}
```

**Fix**: Implement lifecycle policies to transition to cheaper storage classes

```hcl
# DO THIS - Lifecycle policies for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id     = "cost-optimization"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"  # 50% cheaper
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER_IR"  # 68% cheaper
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"  # 95% cheaper
    }
  }
}
```

**Savings**: 50-95% reduction in storage costs depending on access patterns

### ❌ Anti-Pattern 4: Using NAT Gateways When VPC Endpoints Would Work

**Problem**: Routing all AWS service traffic through expensive NAT Gateways

```hcl
# DON'T DO THIS - NAT Gateway for AWS service access
# Cost: $0.045/hour + $0.045/GB = ~$32/month + data transfer costs
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id
}

# Private instances access S3/DynamoDB through NAT Gateway
# Expensive data transfer charges
```

**Fix**: Use VPC endpoints for AWS services

```hcl
# DO THIS - VPC endpoints for AWS services (no data transfer charges)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  route_table_ids = aws_route_table.private[*].id
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.dynamodb"
  route_table_ids = aws_route_table.private[*].id
}

# Interface endpoints for other services
resource "aws_vpc_endpoint" "lambda" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.lambda"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true
}
```

**Savings**: $30-100+/month per NAT Gateway eliminated

### ❌ Anti-Pattern 5: No Reserved Instances or Savings Plans for Steady Workloads

**Problem**: Running steady-state workloads on 100% On-Demand pricing

```hcl
# DON'T DO THIS - On-Demand only for steady workload
resource "aws_autoscaling_group" "app" {
  min_size         = 10  # Always running
  max_size         = 15
  desired_capacity = 10
  
  # No Savings Plans or Reserved Instances
  # Paying full On-Demand price
}
```

**Fix**: Purchase Savings Plans or Reserved Instances for baseline capacity

```hcl
# DO THIS - Mix of Savings Plans and On-Demand
# Purchase Compute Savings Plan for baseline (10 instances)
# This is done through AWS Console/CLI, not Terraform

# Configure Auto Scaling to use Savings Plans for baseline
resource "aws_autoscaling_group" "app" {
  min_size         = 10  # Covered by Savings Plans (30-70% savings)
  max_size         = 20  # Burst capacity uses On-Demand
  desired_capacity = 10
}

# Monitor Savings Plans utilization
resource "aws_cloudwatch_metric_alarm" "sp_utilization" {
  alarm_name          = "low-savings-plan-utilization"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UtilizationPercentage"
  namespace           = "AWS/SavingsPlans"
  period              = 86400
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when Savings Plan utilization is low"
}
```

**Savings**: 30-70% on baseline compute costs

### ❌ Anti-Pattern 6: Ignoring Graviton Instances

**Problem**: Using x86 instances when Graviton would provide better price/performance

```hcl
# DON'T DO THIS - x86 instance when Graviton would work
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023_x86.id
  instance_type = "t3.medium"  # x86 instance
}
```

**Fix**: Use Graviton instances for up to 40% better price/performance

```hcl
# DO THIS - Graviton instance for better price/performance
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "t4g.medium"  # Graviton instance
  # 20% cheaper than t3.medium with better performance
}

# For RDS
resource "aws_db_instance" "main" {
  engine         = "postgres"
  instance_class = "db.t4g.medium"  # Graviton RDS instance
  # Up to 35% better price/performance than db.t3.medium
}
```

**Savings**: 20-40% cost reduction with same or better performance

### ❌ Anti-Pattern 7: No Cost Allocation Tags

**Problem**: No tags to track costs by project, team, or environment

```hcl
# DON'T DO THIS - No cost allocation tags
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  # No tags - can't track costs
}
```

**Fix**: Implement consistent cost allocation tagging

```hcl
# DO THIS - Comprehensive cost allocation tags
locals {
  common_tags = {
    Environment  = var.environment
    Project      = var.project_name
    CostCenter   = var.cost_center
    Owner        = var.owner_email
    ManagedBy    = "Terraform"
    Application  = var.application_name
    BusinessUnit = var.business_unit
  }
}

resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  
  tags = merge(
    local.common_tags,
    {
      Name = "app-server"
      Role = "web-server"
    }
  )
}
```

**Benefit**: Enables accurate cost allocation, chargeback, and optimization

### ❌ Anti-Pattern 8: No Monitoring of Idle Resources

**Problem**: Resources running with no activity, wasting money

```hcl
# DON'T DO THIS - No monitoring for idle resources
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  # No alarms to detect if idle
}
```

**Fix**: Implement monitoring and alerts for idle resources

```hcl
# DO THIS - Monitor for idle resources
resource "aws_cloudwatch_metric_alarm" "idle_instance" {
  alarm_name          = "idle-instance-${aws_instance.app.id}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 24  # 24 hours
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 3600  # 1 hour
  statistic           = "Average"
  threshold           = 5  # Less than 5% CPU
  alarm_description   = "Alert when instance is idle"
  alarm_actions       = [aws_sns_topic.cost_alerts.arn]
  
  dimensions = {
    InstanceId = aws_instance.app.id
  }
}

# Automated Lambda to stop idle instances
resource "aws_lambda_function" "stop_idle_instances" {
  filename      = "stop_idle.zip"
  function_name = "stop-idle-instances"
  role          = aws_iam_role.lambda.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.11"
  
  environment {
    variables = {
      IDLE_THRESHOLD_HOURS = "24"
      DRY_RUN              = "false"
    }
  }
}
```

**Savings**: Identifies and eliminates waste from idle resources


## Cost Optimization Best Practices Summary

### Quick Wins (Implement First)

1. **Enable Cost Allocation Tags** - Track costs by project, team, environment
2. **Set Up AWS Budgets** - Get alerts before overspending
3. **Use Graviton Instances** - 20-40% better price/performance
4. **Implement S3 Lifecycle Policies** - Automatic transition to cheaper storage
5. **Stop Dev/Test Environments After Hours** - 70% savings on non-production
6. **Delete Unattached EBS Volumes** - Eliminate waste
7. **Use VPC Endpoints** - Avoid NAT Gateway costs for AWS services
8. **Enable Cost Anomaly Detection** - Catch unexpected spending early

### Medium-Term Optimizations

1. **Right-Size Resources** - Use AWS Compute Optimizer recommendations
2. **Purchase Savings Plans** - 30-70% savings on steady workloads
3. **Implement Auto Scaling** - Match capacity to demand
4. **Use Spot Instances** - Up to 90% savings for fault-tolerant workloads
5. **Optimize Data Transfer** - Use CloudFront, keep data in same region
6. **Review and Delete Old Snapshots** - Implement retention policies
7. **Use Serverless for Variable Workloads** - Pay only for usage
8. **Implement Reserved Concurrency** - Prevent runaway Lambda costs

### Long-Term Strategies

1. **Establish FinOps Culture** - Make cost optimization everyone's responsibility
2. **Track Unit Economics** - Measure cost per user, per transaction
3. **Conduct Monthly Cost Reviews** - Identify trends and opportunities
4. **Automate Cost Optimization** - Use Lambda for idle resource detection
5. **Optimize Architecture** - Use managed services, serverless patterns
6. **Stay Current with AWS** - Adopt new cost-effective services
7. **Implement Chargeback** - Allocate costs to teams for accountability
8. **Celebrate Savings** - Recognize and reward cost optimization efforts

## Additional Resources

### AWS Documentation
- [Cost Optimization Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [AWS Cost Management](https://aws.amazon.com/aws-cost-management/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)
- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/)
- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/)
- [AWS Savings Plans](https://aws.amazon.com/savingsplans/)
- [Amazon EC2 Spot Instances](https://aws.amazon.com/ec2/spot/)
- [AWS Graviton](https://aws.amazon.com/ec2/graviton/)

### AWS Whitepapers
- [Cost Optimization Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/wellarchitected-cost-optimization-pillar.pdf)
- [Cloud Financial Management with AWS](https://d1.awsstatic.com/whitepapers/aws-cloud-financial-management.pdf)

### AWS Blogs
- [AWS Cost Management Blog](https://aws.amazon.com/blogs/aws-cost-management/)
- [AWS Architecture Blog - Cost Optimization](https://aws.amazon.com/blogs/architecture/category/cost-optimization/)

### Tools
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/) - Visualize and analyze costs
- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/) - Set custom budgets and alerts
- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/) - ML-powered anomaly detection
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/) - Right-sizing recommendations
- [AWS Cost Optimization Hub](https://aws.amazon.com/aws-cost-management/cost-optimization-hub/) - Centralized recommendations
- [AWS Pricing Calculator](https://calculator.aws/) - Estimate costs for AWS services
- [AWS Application Cost Profiler](https://aws.amazon.com/aws-cost-management/aws-application-cost-profiler/) - Track application-level costs

### Third-Party Tools
- [CloudHealth by VMware](https://www.cloudhealthtech.com/)
- [CloudCheckr](https://cloudcheckr.com/)
- [Spot by NetApp](https://spot.io/)
- [Apptio Cloudability](https://www.apptio.com/products/cloudability/)

### Training and Certification
- [AWS Cloud Financial Management for Builders](https://aws.amazon.com/training/learn-about/cloud-financial-management/)
- [AWS Cost Optimization Workshop](https://catalog.workshops.aws/well-architected-cost-optimization/)
- [AWS Well-Architected Labs - Cost Optimization](https://wellarchitectedlabs.com/cost/)


## Context-Aware Cost Optimization Trade-Off Guidance

Cost optimization is not about minimizing costs at all costs—it's about achieving business outcomes at the lowest price point while meeting functional requirements. The **right** level of cost optimization depends on your specific context: environment type, availability requirements, budget constraints, and business priorities.

### Context Questions for Cost Optimization Recommendations

Before making cost optimization recommendations, gather context:

1. **Environment Type**: Development, staging, or production?
2. **Availability Requirements**: What's your SLA? (99%, 99.9%, 99.99%)
3. **Budget Constraints**: Tight, moderate, or flexible?
4. **Data Sensitivity**: Public, internal, confidential, or regulated?
5. **Performance Requirements**: Latency-sensitive or batch processing?
6. **Business Stage**: Startup/MVP, growth, or enterprise?

### Trade-Off 1: Single-AZ vs. Multi-AZ (Cost vs. Reliability)

#### Context-Dependent Availability Decisions

**Development Environment**:
```
Recommendation: Single-AZ is ACCEPTABLE for cost savings.

Single-AZ Configuration:
- Cost: 50% reduction (no cross-AZ data transfer, single instance)
- Availability: ~99.5% (single AZ availability)
- Recovery: Manual restart in another AZ if needed
- Downtime Impact: Low (dev environment, no customer impact)

Trade-off: 50% cost savings vs. occasional dev environment downtime.
Recommendation: Use Single-AZ for dev to maximize cost savings.

Example:
- Multi-AZ RDS: $200/month
- Single-AZ RDS: $100/month
- Savings: $100/month (50%)
```

**Staging Environment**:
```
Recommendation: Single-AZ or Multi-AZ depending on testing needs.

Options:
1. Single-AZ (Cost-Optimized)
   - Cost: $100/month
   - Use for: Functional testing, performance testing
   - Risk: Cannot test failover scenarios
   - Best for: Budget-constrained teams

2. Multi-AZ (Production-Like)
   - Cost: $200/month
   - Use for: Failover testing, pre-production validation
   - Benefit: Test production scenarios
   - Best for: Critical applications

Trade-off: $100/month savings vs. production-like testing.
Recommendation: Use Single-AZ for staging unless you need to test failover.
```

**Production Environment - Internal Tools (99% SLA)**:
```
Recommendation: Multi-AZ is RECOMMENDED but not required.

Options:
1. Single-AZ with Automated Failover
   - Cost: $100/month + automation
   - Availability: ~99.5%
   - Recovery: 5-15 minutes (automated)
   - Acceptable for: Internal tools, non-critical applications
   - Risk: Brief downtime during AZ failure

2. Multi-AZ
   - Cost: $200/month
   - Availability: ~99.9%
   - Recovery: Automatic (1-2 minutes)
   - Best for: Important internal tools

Trade-off: $100/month vs. 99.5% → 99.9% availability improvement.
Recommendation: For internal tools with 99% SLA, Single-AZ with automation is acceptable.

Calculation:
- 99% SLA = 7.2 hours downtime/month acceptable
- 99.5% availability = 3.6 hours downtime/month
- 99.9% availability = 43 minutes downtime/month
```

**Production Environment - Customer-Facing (99.9%+ SLA)**:
```
Recommendation: Multi-AZ is REQUIRED (non-negotiable).

REQUIRED Configuration:
- Multi-AZ deployment for databases
- Multi-AZ load balancers
- Instances in multiple AZs
- Auto Scaling across AZs

Cost: 2x infrastructure + cross-AZ data transfer
Availability: 99.9%+ (meets SLA)
Recovery: Automatic (1-2 minutes)

Trade-off: None - this is required to meet SLA commitments.

Downtime Cost Analysis:
- 1 hour outage cost: $10,000 - $100,000 (typical)
- Multi-AZ additional cost: $100-500/month
- ROI: Multi-AZ pays for itself if it prevents 1 outage per year
```

#### Decision Matrix: Single-AZ vs. Multi-AZ

| Factor | Single-AZ | Multi-AZ |
|--------|-----------|----------|
| **Cost** | $100/month | $200/month |
| **Availability** | ~99.5% | ~99.9% |
| **Downtime/Month** | ~3.6 hours | ~43 minutes |
| **Recovery Time** | 5-15 minutes | 1-2 minutes |
| **Best For** | Dev, staging, internal tools | Production, customer-facing |
| **SLA Support** | Up to 99% | 99.9%+ |
| **Acceptable Risk** | Dev/test downtime | Customer-facing downtime |

### Trade-Off 2: On-Demand vs. Reserved Instances vs. Spot (Cost vs. Flexibility)

#### Context-Dependent Pricing Model Decisions

**Unpredictable Workloads (Startup/MVP)**:
```
Recommendation: On-Demand for maximum flexibility.

On-Demand Pricing:
- Cost: $0.10/hour (baseline)
- Commitment: None
- Flexibility: Scale up/down anytime
- Best for: Unpredictable traffic, rapid iteration

Trade-off: Pay 30-70% more for flexibility during validation phase.
Recommendation: Use On-Demand until usage patterns stabilize (3-6 months).

Example:
- On-Demand: $720/month (24/7 operation)
- Reserved (1-year): $504/month (30% savings)
- Savings: $216/month, but requires 1-year commitment
```

**Steady-State Workloads (Production)**:
```
Recommendation: Reserved Instances or Savings Plans for predictable baseline.

Options:
1. Reserved Instances (1-year, no upfront)
   - Cost: 30% savings ($504/month vs. $720/month)
   - Commitment: 1 year, specific instance type
   - Flexibility: Low (locked to instance type)
   - Best for: Stable workloads with known instance types

2. Compute Savings Plans (1-year)
   - Cost: 30% savings
   - Commitment: 1 year, dollar amount
   - Flexibility: High (any instance type, region)
   - Best for: Workloads that may change instance types

3. Reserved Instances (3-year, all upfront)
   - Cost: 60% savings ($288/month vs. $720/month)
   - Commitment: 3 years, upfront payment
   - Flexibility: None
   - Best for: Extremely stable workloads, strong cash position

Trade-off: Commitment vs. savings.
Recommendation: Start with 1-year Compute Savings Plans for flexibility.

Budget Impact:
- Tight budget: 1-year Savings Plan (30% savings, manageable commitment)
- Flexible budget: 3-year Reserved (60% savings, maximum cost reduction)
```

**Variable Workloads with Baseline**:
```
Recommendation: Mix Reserved/Savings Plans for baseline + On-Demand for peaks.

Strategy:
- Reserved/Savings Plans: Cover 60-70% of baseline capacity
- On-Demand: Handle traffic spikes and growth

Example:
- Baseline: 10 instances 24/7 → Reserved Instances
- Peak: +5 instances during business hours → On-Demand
- Cost: $5,040/month (Reserved) + $1,080/month (On-Demand) = $6,120/month
- vs. All On-Demand: $10,800/month
- Savings: $4,680/month (43%)

Trade-off: Some commitment vs. significant savings.
Recommendation: Reserve 60-70% of baseline, use On-Demand for peaks.
```

**Fault-Tolerant Workloads (Batch Processing, Dev/Test)**:
```
Recommendation: Spot Instances for up to 90% savings.

Spot Instance Strategy:
- Cost: $0.01-0.03/hour (90% savings vs. On-Demand)
- Availability: Can be interrupted with 2-minute warning
- Best for: Batch jobs, CI/CD, dev/test, stateless workloads

Requirements for Spot:
- Application handles interruptions gracefully
- Work can be checkpointed and resumed
- Not time-critical

Example:
- On-Demand: $720/month
- Spot: $72/month
- Savings: $648/month (90%)

Trade-off: Interruption handling vs. massive cost savings.
Recommendation: Use Spot for all fault-tolerant workloads.
```

#### Decision Matrix: Pricing Models

| Workload Type | Pricing Model | Cost | Commitment | Flexibility | Savings |
|---------------|---------------|------|------------|-------------|---------|
| **Unpredictable** | On-Demand | $720/mo | None | High | 0% |
| **Steady-State** | 1-yr Savings Plan | $504/mo | 1 year | Medium | 30% |
| **Very Stable** | 3-yr Reserved | $288/mo | 3 years | Low | 60% |
| **Variable** | Mixed (Reserved + On-Demand) | $612/mo | Partial | Medium | 15-30% |
| **Fault-Tolerant** | Spot | $72/mo | None | Low | 90% |

### Trade-Off 3: Instance Sizing (Cost vs. Performance)

#### Context-Dependent Instance Sizing Decisions

**Development Environment**:
```
Recommendation: Smallest instance that works (t3.micro, t3.small).

Small Instance Strategy:
- Cost: $7-15/month per instance
- Performance: Adequate for development
- Trade-off: Slower builds/tests vs. minimal cost

Example:
- t3.small: $15/month
- t3.medium: $30/month
- t3.large: $60/month

Recommendation: Use t3.small for dev, accept slower performance.
Savings: $45/month per developer (vs. t3.large)
```

**Production - Latency-Sensitive Application (< 100ms p99)**:
```
Recommendation: Right-size for performance, not cost.

Performance-First Sizing:
- Instance: c6g.xlarge (compute-optimized Graviton)
- Cost: $100/month
- Performance: <50ms p99 latency
- Trade-off: Higher cost for better user experience

vs. Cost-Optimized:
- Instance: t4g.medium (burstable)
- Cost: $25/month
- Performance: 100-200ms p99 latency (bursting limits)
- Risk: Poor user experience, customer churn

Trade-off: $75/month vs. customer satisfaction.
Recommendation: Invest in performance for customer-facing applications.

ROI Calculation:
- 1% customer churn from poor performance = $10,000/month revenue loss
- Performance optimization cost: $75/month
- ROI: 133x return on investment
```

**Production - Batch Processing (Not Time-Critical)**:
```
Recommendation: Smallest instance that completes within time window.

Cost-Optimized Sizing:
- Instance: t4g.medium
- Cost: $25/month
- Processing Time: 4 hours/day
- Trade-off: Slower processing vs. lower cost

vs. Performance-Optimized:
- Instance: c6g.xlarge
- Cost: $100/month
- Processing Time: 1 hour/day
- Benefit: Faster completion, but not required

Trade-off: $75/month vs. 3 hours faster completion (not needed).
Recommendation: Use smaller instance for batch jobs with flexible deadlines.
```

**Production - Variable Traffic (Bursty Workloads)**:
```
Recommendation: Burstable instances (t3/t4g) for cost efficiency.

Burstable Instance Strategy:
- Instance: t4g.medium
- Cost: $25/month
- Performance: Handles bursts up to 40% CPU baseline
- Best for: Web servers, small databases, dev tools

When to Upgrade to Fixed Performance:
- Sustained CPU > 40% (burning through credits)
- Unpredictable performance during bursts
- Cost of t4g.medium with unlimited = cost of m6g.medium

Trade-off: Burstable performance vs. 60% cost savings.
Recommendation: Start with burstable, monitor CPU credits, upgrade if needed.
```

#### Decision Matrix: Instance Sizing

| Use Case | Instance Type | Cost/Month | Performance | Best For |
|----------|---------------|------------|-------------|----------|
| **Development** | t3.small | $15 | Low | Dev/test environments |
| **Low Traffic** | t4g.medium | $25 | Burstable | Small apps, variable traffic |
| **Steady Traffic** | m6g.large | $60 | Consistent | Production apps |
| **High Performance** | c6g.xlarge | $100 | High | Latency-sensitive apps |
| **Memory-Intensive** | r6g.large | $100 | High memory | Databases, caching |
| **Batch Processing** | t4g.medium | $25 | Adequate | Non-time-critical jobs |

### Trade-Off 4: Managed Services vs. Self-Managed (Cost vs. Operational Overhead)

#### Context-Dependent Service Management Decisions

**Small Team (1-5 people), Tight Budget**:
```
Recommendation: Managed services despite higher per-unit cost.

Managed Service Example (RDS):
- Cost: $100/month
- Operational Overhead: ~2 hours/month (monitoring, minor tuning)
- Includes: Automated backups, patching, failover, monitoring

vs. Self-Managed (EC2 + PostgreSQL):
- Cost: $50/month (EC2 + EBS)
- Operational Overhead: ~20 hours/month (setup, patching, backups, monitoring)
- Engineer time cost: 20 hours × $100/hour = $2,000/month

Trade-off: $50/month savings vs. $2,000/month in engineering time.
Recommendation: Use managed services for small teams (10-40x ROI).

Total Cost of Ownership:
- Managed: $100/month
- Self-Managed: $50/month + $2,000/month = $2,050/month
- Savings with Managed: $1,950/month
```

**Large Team (20+ people), High Scale**:
```
Recommendation: Consider self-managed for cost optimization at scale.

Self-Managed at Scale:
- Cost: $5,000/month (EC2 + EBS for large cluster)
- Operational Overhead: 1 dedicated engineer ($10,000/month)
- Total: $15,000/month

vs. Managed Service (RDS):
- Cost: $25,000/month (large RDS instances)
- Operational Overhead: ~10 hours/month ($1,000/month)
- Total: $26,000/month

Trade-off: $11,000/month savings vs. operational complexity.
Recommendation: At scale, self-managed can be cost-effective with dedicated team.

Break-Even Analysis:
- Self-managed makes sense when: (Managed Cost - Self-Managed Cost) > Engineer Cost
- In this case: ($25,000 - $5,000) = $20,000 > $10,000 ✓
```

**Startup/MVP Phase**:
```
Recommendation: Managed services for speed to market.

Managed Service Benefits:
- Faster time to market (weeks vs. months)
- Focus on product, not infrastructure
- Proven reliability and security
- Easy to scale

Cost Comparison:
- Managed: $500/month
- Self-Managed: $200/month + 40 hours setup + 10 hours/month maintenance

Trade-off: $300/month vs. 2-4 weeks faster launch.
Recommendation: Use managed services during MVP phase, optimize later.

Opportunity Cost:
- 2 weeks faster launch = 2 weeks more customer feedback
- Early customer feedback value >> $300/month savings
```

#### Decision Matrix: Managed vs. Self-Managed

| Factor | Managed Services | Self-Managed |
|--------|------------------|--------------|
| **Cost (Small Scale)** | $100/month | $50/month + $2,000/month ops |
| **Cost (Large Scale)** | $25,000/month | $5,000/month + $10,000/month ops |
| **Setup Time** | Minutes | Weeks |
| **Operational Overhead** | Low (2-5 hours/month) | High (20-40 hours/month) |
| **Expertise Required** | Basic | Advanced |
| **Best For** | Small teams, startups, standard use cases | Large teams, custom requirements, high scale |
| **Break-Even Point** | < 10 instances | > 50 instances |

### Trade-Off 5: Storage Classes (Cost vs. Access Speed)

#### Context-Dependent Storage Decisions

**Frequently Accessed Data (Daily Access)**:
```
Recommendation: S3 Standard for optimal performance.

S3 Standard:
- Cost: $0.023/GB-month
- Access: Instant, no retrieval fees
- Best for: Active data, frequently accessed files

Trade-off: None - this is the right choice for frequent access.

Example:
- 1 TB data accessed 100 times/month
- S3 Standard: $23/month storage + $0 retrieval = $23/month
- S3 Standard-IA: $12.50/month storage + $100 retrieval = $112.50/month
- Recommendation: Use S3 Standard (5x cheaper for frequent access)
```

**Infrequently Accessed Data (Monthly Access)**:
```
Recommendation: S3 Standard-IA for 50% cost savings.

S3 Standard-IA:
- Cost: $0.0125/GB-month storage + $0.01/GB retrieval
- Access: Instant, with retrieval fees
- Best for: Backups, disaster recovery, infrequent access

Example:
- 1 TB data accessed 5 times/month
- S3 Standard: $23/month
- S3 Standard-IA: $12.50/month storage + $50 retrieval = $62.50/month
- Savings: -$39.50/month (more expensive!)

Break-Even: Access < 1 time/month for Standard-IA to be cheaper.
Recommendation: Use Standard-IA only if accessed < 1 time/month.
```

**Rarely Accessed Data (Quarterly/Annual Access)**:
```
Recommendation: S3 Glacier Instant Retrieval for 68% savings.

S3 Glacier Instant Retrieval:
- Cost: $0.004/GB-month storage + $0.03/GB retrieval
- Access: Instant (milliseconds)
- Best for: Archive data with occasional instant access needs

Example:
- 1 TB data accessed 1 time/quarter
- S3 Standard: $23/month × 12 = $276/year
- Glacier IR: $4/month × 12 + $30 retrieval × 4 = $168/year
- Savings: $108/year (39%)

Recommendation: Use Glacier IR for data accessed < 1 time/month.
```

**Archive Data (Annual or Never)**:
```
Recommendation: S3 Glacier Flexible Retrieval or Deep Archive.

Options:
1. Glacier Flexible Retrieval
   - Cost: $0.0036/GB-month + $0.02/GB retrieval
   - Access: 1-5 minutes (expedited), 3-5 hours (standard)
   - Best for: Archives with occasional access

2. Glacier Deep Archive
   - Cost: $0.00099/GB-month + $0.02/GB retrieval
   - Access: 12 hours
   - Best for: Long-term archives, compliance

Example (10 TB archive, accessed once/year):
- S3 Standard: $230/month × 12 = $2,760/year
- Glacier Flexible: $36/month × 12 + $200 retrieval = $632/year
- Glacier Deep Archive: $10/month × 12 + $200 retrieval = $320/year
- Savings: $2,440/year (88% with Deep Archive)

Trade-off: 12-hour retrieval time vs. 88% cost savings.
Recommendation: Use Deep Archive for compliance archives, long-term retention.
```

#### Decision Matrix: Storage Classes

| Access Pattern | Storage Class | Cost/GB-month | Retrieval Time | Retrieval Cost | Best For |
|----------------|---------------|---------------|----------------|----------------|----------|
| **Daily** | S3 Standard | $0.023 | Instant | $0 | Active data |
| **Weekly** | S3 Standard | $0.023 | Instant | $0 | Frequently accessed |
| **Monthly** | S3 Standard-IA | $0.0125 | Instant | $0.01/GB | Backups |
| **Quarterly** | Glacier IR | $0.004 | Instant | $0.03/GB | Archives |
| **Annual** | Glacier Flexible | $0.0036 | 1-5 hours | $0.02/GB | Compliance |
| **Rarely/Never** | Glacier Deep Archive | $0.00099 | 12 hours | $0.02/GB | Long-term archives |

### Trade-Off 6: Budget Constraints and Environment-Specific Guidance

#### Tight Budget (Startup, Cost-Sensitive)

**Acceptable Cost-Saving Measures**:
```
Development:
- Single-AZ everything (50% savings)
- t3.micro/t3.small instances (80% savings vs. production-sized)
- Scheduled start/stop (70% savings - only run during work hours)
- Spot instances for CI/CD (90% savings)
- No load balancers (use single instance with Elastic IP)
- Minimal monitoring (CloudWatch free tier only)

Staging:
- Single-AZ (50% savings)
- Smaller instance sizes (50% savings vs. production)
- Shared resources (one RDS for multiple apps)
- Scheduled start/stop during off-hours (30% savings)

Production:
- Multi-AZ for databases only (not compute)
- t4g burstable instances (40% savings vs. fixed performance)
- Spot instances for batch jobs (90% savings)
- CloudFront free tier (1 TB/month)
- Basic monitoring (GuardDuty, CloudTrail only)

Total Savings: 60-70% vs. "gold standard" architecture
Risk: Acceptable for non-critical applications, startups validating product-market fit
```

#### Moderate Budget (Growth Stage)

**Balanced Approach**:
```
Development:
- Single-AZ (50% savings)
- Right-sized instances (t4g.small/medium)
- Scheduled start/stop (70% savings)
- Spot instances for CI/CD (90% savings)

Staging:
- Single-AZ or Multi-AZ (depending on testing needs)
- Production-like sizing for performance testing
- Always-on for continuous testing

Production:
- Multi-AZ for critical components (databases, load balancers)
- Mix of Reserved Instances (baseline) + On-Demand (peaks)
- Graviton instances for 20-40% savings
- CloudFront for global distribution
- Standard monitoring (GuardDuty, Security Hub, Config)

Total Savings: 30-40% vs. "gold standard" architecture
Risk: Low - maintains reliability while optimizing costs
```

#### Flexible Budget (Enterprise, High-Availability Requirements)

**Reliability-First Approach**:
```
Development:
- Single-AZ acceptable (50% savings)
- Right-sized instances
- Always-on for developer productivity

Staging:
- Multi-AZ for production-like testing
- Production-equivalent sizing
- Always-on

Production:
- Multi-AZ everything (databases, compute, load balancers)
- Multi-region for disaster recovery
- Reserved Instances for 30-60% savings on baseline
- Graviton instances for 20-40% additional savings
- Comprehensive monitoring and security
- Dedicated support plan

Total Savings: 20-30% through Reserved Instances and Graviton
Risk: Minimal - prioritizes reliability and performance
```

### Decision Framework: Cost Optimization Investment

Use this framework to determine appropriate cost optimization level:

| Factor | Minimal Investment | Standard Investment | Maximum Investment |
|--------|-------------------|---------------------|-------------------|
| **Environment** | Development | Staging | Production |
| **Budget** | Tight | Moderate | Flexible |
| **Availability SLA** | None | 99% | 99.9%+ |
| **Team Size** | 1-5 people | 6-20 people | 20+ people |
| **Business Stage** | Startup/MVP | Growth | Enterprise |
| **Multi-AZ** | No (50% savings) | Databases only | Everything |
| **Instance Type** | t3.micro/small | t4g.medium | Right-sized for performance |
| **Pricing Model** | On-Demand + Spot | Mixed (Reserved + On-Demand) | Reserved/Savings Plans |
| **Monitoring** | Basic (free tier) | Standard (GuardDuty, Config) | Comprehensive |
| **Monthly Cost** | $100-500 | $1,000-5,000 | $10,000+ |
| **Cost Savings** | 60-70% | 30-40% | 20-30% |

### Key Takeaways for Context-Aware Cost Optimization

1. **Environment Matters**: Different cost optimization strategies for dev, staging, and production
2. **Budget Drives Decisions**: Tight budgets require aggressive optimization; flexible budgets prioritize reliability
3. **SLA Requirements Override Cost**: Customer-facing applications with SLAs require Multi-AZ (non-negotiable)
4. **Quantify Trade-Offs**: Use specific cost numbers and percentages to make informed decisions
5. **Optimize Progressively**: Start with aggressive cost optimization, invest in reliability as you grow
6. **Balance Cost and Performance**: For customer-facing apps, poor performance costs more than infrastructure
7. **Managed Services for Small Teams**: 10-40x ROI compared to self-managed infrastructure
8. **Reserved Instances at Scale**: 30-60% savings for predictable workloads
9. **Spot for Fault-Tolerant**: 90% savings for batch jobs, CI/CD, dev/test
10. **Document Decisions**: Record why you chose specific cost optimization approaches

### Anti-Patterns to Avoid

❌ **Over-Optimizing Development**: Spending hours to save $10/month on dev environments
❌ **Under-Investing in Production**: Using Single-AZ for customer-facing applications to save money
❌ **Ignoring SLA Requirements**: Choosing cost over reliability when SLA requires high availability
❌ **Premature Reserved Instances**: Committing to 3-year RIs before usage patterns stabilize
❌ **Self-Managing Everything**: Building custom solutions when managed services are more cost-effective
❌ **No Cost Monitoring**: Optimizing once and never reviewing again
❌ **One-Size-Fits-All**: Same cost optimization strategy for all environments

✅ **Environment-Specific Optimization**: Aggressive savings in dev, balanced in staging, reliability-first in production
✅ **Context-Driven Decisions**: Let SLA, budget, and business stage drive cost optimization choices
✅ **Progressive Investment**: Start lean, invest in reliability as you grow and validate
✅ **Quantified Trade-Offs**: Use specific cost numbers to justify decisions
✅ **Managed Services First**: Use managed services until scale justifies self-managed
✅ **Continuous Optimization**: Monthly cost reviews and optimization
✅ **Balanced Approach**: Optimize costs while meeting functional requirements


## Application Code Cost Optimization

Application code efficiency directly impacts AWS costs through compute time, memory usage, and API calls. This power analyzes application code for resource cleanup, algorithm efficiency, and batch operations.

### Application Cost Optimization Guidance

For detailed application code cost optimization patterns, see:

**[Application Code Cost Optimization Patterns](./cost-optimization-application-code.md)**

This guide covers:
- Resource cleanup and memory management
- Efficient algorithms and data structures
- Batch operations to reduce API calls
- Stream processing to minimize memory usage
- Lambda optimization for cost reduction
- Connection pooling and reuse



---

## Mode-Aware Guidance for Cost Optimization Reviews

This section guides Kiro on how to adapt Cost Optimization Pillar reviews based on the current review mode.

### Simple Mode - Cost Optimization Reviews

**Token Budget:** 17-25K | **Latency:** 2.5-6s | **Use:** CI/CD, quick checks, dev reviews

**What to Include:**
- Direct cost violation identification (oversized instances, unused resources, no auto-scaling)
- Prescriptive recommendations without trade-off discussion
- Standard risk levels: High (wasted resources >$100/month), Medium ($20-100/month), Low (<$20/month)
- Code examples showing fixes

**What to EXCLUDE:**
- Context questions about budget, growth plans, or business priorities
- Trade-off discussions (cost vs. performance, cost vs. reliability)
- Alternative approaches or decision matrices

**Example Output:**
```
❌ HIGH RISK: EC2 instance oversized (t3.xlarge with 10% CPU usage)
Location: compute.tf:23
Recommendation: Right-size to t3.medium
Savings: $50/month (60% cost reduction)
```

### Context-Aware Mode - Cost Optimization Reviews

**Token Budget:** 35-50K | **Latency:** 4-8s | **Use:** Interactive sessions, production reviews

**What to Include:**
- Context questions (3-5): Budget constraint, growth expectations, performance requirements, business priorities
- Conditional recommendations based on context
- Trade-off explanations (cost vs. performance, cost vs. reliability)
- Cost-benefit analysis for key recommendations
- Alternative approaches with pros/cons

**Example Output:**
```
⚠️ CONTEXT-DEPENDENT: No auto-scaling configured

Context Questions:
- What's your traffic pattern? (steady/variable/spiky)
- What's your budget priority? (minimize cost/balance/maximize performance)

Conditional Guidance:
- FOR variable traffic (2x peak): Auto-scaling REQUIRED
  - Cost savings: 40-60% during off-peak hours
  - Performance: Handles spikes automatically
  
- FOR steady traffic: Fixed capacity acceptable
  - Simpler operations
  - Predictable costs

Recommendation: Based on traffic pattern, choose appropriate scaling strategy.
```

### Full Analysis Mode - Cost Optimization Reviews

**Token Budget:** 70-95K | **Latency:** 5-10s | **Use:** Major decisions, budget planning

**What to Include:**
- Comprehensive context gathering (10+ questions including current costs, growth plans, business model)
- Decision matrices comparing 3-5 cost optimization options
- Quantitative cost-benefit analysis with ROI calculations
- Multi-pillar impact analysis (cost vs. performance vs. reliability)
- Scenario matching (startup/growth/enterprise)
- Long-term cost projections and TCO analysis
- Phased implementation roadmap

**Example Output:**
```
🔍 COMPREHENSIVE ANALYSIS: Compute Cost Optimization Strategy

Decision Matrix: Compute Options
| Option | Cost | Performance | Reliability | Complexity |
|--------|------|-------------|-------------|------------|
| Fixed EC2 | $500/mo | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Auto-scaling | $300/mo | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Spot + On-Demand | $150/mo | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Lambda | $100/mo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

Recommended: Auto-scaling with Spot instances

Cost-Benefit Analysis:
- Current: $500/month fixed capacity
- Proposed: $150/month with Spot + auto-scaling
- Savings: $350/month ($4,200/year)
- Implementation: 16 hours
- ROI: Payback in <1 month

[Detailed pillar impact analysis, trade-off scenarios, implementation roadmap]
```

### Mode Selection

**Simple Mode:** CI/CD, dev files, "quick review"
**Context-Aware Mode:** Production files, interactive sessions, "review with context"
**Full Analysis Mode:** Explicit request for "full analysis", budget planning

### Best Practices by Mode

**Simple Mode:** Focus on clear waste, prescriptive fixes, no context questions
**Context-Aware Mode:** Ask 3-5 context questions, explain trade-offs, provide alternatives
**Full Analysis Mode:** Comprehensive analysis, decision matrices, TCO calculations, roadmap

### Common Scenarios by Mode

**Oversized Instance:**
- Simple: "Right-size to t3.medium, save $50/month"
- Context-Aware: "For 10% CPU usage, t3.medium sufficient. For variable load, use auto-scaling"
- Full Analysis: "[Decision matrix comparing instance types with cost, performance, auto-scaling strategies]"

**No Reserved Instances:**
- Simple: "Purchase Reserved Instances for 72% savings"
- Context-Aware: "For steady workload, RIs save 72%. For variable workload, Savings Plans more flexible"
- Full Analysis: "[Decision matrix comparing On-Demand, RIs, Savings Plans, Spot with commitment levels]"
