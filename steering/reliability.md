# Reliability Pillar - AWS Well-Architected Framework

## Overview

The Reliability Pillar focuses on ensuring a workload performs its intended function correctly and consistently when expected. This includes the ability to operate and test the workload through its total lifecycle, recover from failures automatically, and scale to meet demand.

### Core Reliability Principles

1. **Automatically recover from failure**: Monitor systems for key performance indicators and trigger automation when thresholds are breached
2. **Test recovery procedures**: Use automation to simulate different failures and test recovery procedures regularly
3. **Scale horizontally to increase aggregate workload availability**: Replace one large resource with multiple small resources to reduce the impact of a single failure
4. **Stop guessing capacity**: Monitor demand and system utilization, and automate the addition or removal of resources
5. **Manage change through automation**: Use automation to make changes to infrastructure and deploy updates

## Reliability Design Areas

### 1. Foundations

#### Best Practices

**Manage Service Quotas and Constraints**
- Monitor service quotas (formerly service limits) for all AWS services
- Request quota increases proactively based on growth projections
- Use Service Quotas service to track and manage limits
- Set up CloudWatch alarms for quota utilization
- Plan for regional capacity constraints

**Plan Your Network Topology**
- Design for high availability across multiple Availability Zones
- Use multiple VPCs for workload isolation
- Implement hybrid connectivity with redundant connections
- Plan IP address space to avoid conflicts
- Use Transit Gateway for scalable network architecture

**Implement Observability**
- Collect metrics, logs, and traces from all components
- Use CloudWatch for centralized monitoring
- Implement distributed tracing with X-Ray
- Create dashboards for operational visibility
- Set up alarms for key reliability metrics

#### Foundation Patterns

**Pattern 1: Multi-Region Service Quotas Monitoring**
```hcl
# Terraform example - Monitor service quotas across regions
resource "aws_cloudwatch_metric_alarm" "ec2_instance_quota" {
  for_each = toset(["us-east-1", "us-west-2", "eu-west-1"])
  
  alarm_name          = "ec2-instance-quota-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ResourceCount"
  namespace           = "AWS/Usage"
  period              = 300
  statistic           = "Maximum"
  threshold           = 80  # Alert at 80% of quota
  alarm_description   = "EC2 instance quota utilization in ${each.key}"
  
  dimensions = {
    Service  = "EC2"
    Type     = "Resource"
    Resource = "vCPU"
    Class    = "Standard/OnDemand"
  }
}

# Lambda function to automatically request quota increases
resource "aws_lambda_function" "quota_manager" {
  filename      = "quota_manager.zip"
  function_name = "service-quota-manager"
  role          = aws_iam_role.quota_manager.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 60

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.quota_alerts.arn
    }
  }
}
```

**Why This Is Reliable:**
- Proactive monitoring prevents hitting service limits
- Multi-region monitoring ensures capacity in all locations
- Automated alerting enables quick response
- Lambda automation can request increases automatically

**Pattern 2: Comprehensive Observability Stack**
```yaml
# CloudFormation example - Complete observability setup
ObservabilityStack:
  Type: AWS::CloudFormation::Stack
  Properties:
    TemplateURL: !Sub 'https://s3.amazonaws.com/${TemplateBucket}/observability.yaml'
    Parameters:
      ApplicationName: !Ref ApplicationName
      Environment: !Ref Environment

# CloudWatch Log Groups with retention
ApplicationLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub '/aws/application/${ApplicationName}'
    RetentionInDays: 30
    KmsKeyId: !GetAtt LogEncryptionKey.Arn

# CloudWatch Dashboard
ApplicationDashboard:
  Type: AWS::CloudWatch::Dashboard
  Properties:
    DashboardName: !Sub '${ApplicationName}-${Environment}'
    DashboardBody: !Sub |
      {
        "widgets": [
          {
            "type": "metric",
            "properties": {
              "metrics": [
                ["AWS/ApplicationELB", "TargetResponseTime", {"stat": "Average"}],
                [".", "RequestCount", {"stat": "Sum"}],
                [".", "HTTPCode_Target_5XX_Count", {"stat": "Sum", "color": "#d62728"}],
                ["AWS/RDS", "DatabaseConnections", {"stat": "Average"}],
                [".", "CPUUtilization", {"stat": "Average"}]
              ],
              "period": 300,
              "stat": "Average",
              "region": "${AWS::Region}",
              "title": "Application Health Metrics"
            }
          }
        ]
      }

# X-Ray tracing for distributed systems
XRayTracingGroup:
  Type: AWS::XRay::Group
  Properties:
    GroupName: !Sub '${ApplicationName}-traces'
    FilterExpression: 'service("${ApplicationName}")'

# Composite Alarm for overall health
ApplicationHealthAlarm:
  Type: AWS::CloudWatch::CompositeAlarm
  Properties:
    AlarmName: !Sub '${ApplicationName}-health'
    AlarmDescription: 'Overall application health composite alarm'
    ActionsEnabled: true
    AlarmActions:
      - !Ref CriticalAlertTopic
    AlarmRule: !Sub |
      ALARM(${HighErrorRateAlarm}) OR
      ALARM(${HighLatencyAlarm}) OR
      ALARM(${DatabaseConnectionAlarm})
```

**Why This Is Reliable:**
- Centralized logging enables troubleshooting
- Retention policies balance cost and compliance
- Dashboards provide real-time visibility
- X-Ray tracing helps identify bottlenecks
- Composite alarms reduce alert fatigue

### 2. Workload Architecture

#### Best Practices

**Design for Failure**
- Assume everything fails and design accordingly
- Implement graceful degradation when dependencies fail
- Use circuit breakers to prevent cascading failures
- Design stateless applications when possible
- Implement retry logic with exponential backoff and jitter

**Use Multi-AZ and Multi-Region Architectures**
- Deploy across multiple Availability Zones for high availability
- Use multiple regions for disaster recovery
- Implement active-active or active-passive patterns
- Use Route 53 health checks for automatic failover
- Replicate data across regions for critical workloads

**Implement Loose Coupling**
- Use queues and streams to decouple components
- Implement asynchronous communication patterns
- Use service discovery for dynamic environments
- Implement API gateways for service abstraction
- Use event-driven architectures

#### Workload Architecture Patterns

**Pattern 3: Multi-AZ High Availability Architecture**
```hcl
# Terraform example - Highly available multi-tier application
data "aws_availability_zones" "available" {
  state = "available"
}

# Application Load Balancer spanning multiple AZs
resource "aws_lb" "app" {
  name               = "app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "app-alb"
  }
}

# Auto Scaling Group with multiple AZs
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300
  
  min_size         = 3  # Minimum one per AZ
  max_size         = 12
  desired_capacity = 6  # Two per AZ for redundancy

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Ensure instances are distributed across AZs
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

  # Wait for new instances to be healthy before continuing
  wait_for_capacity_timeout = "10m"
  
  lifecycle {
    create_before_destroy = true
  }
}

# Multi-AZ RDS with automatic failover
resource "aws_db_instance" "app" {
  identifier     = "app-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"

  # High availability configuration
  multi_az               = true  # Automatic failover to standby
  availability_zone      = null  # Let AWS choose for optimal placement
  
  # Storage configuration
  allocated_storage     = 100
  max_allocated_storage = 1000  # Enable storage autoscaling
  storage_type          = "gp3"
  storage_encrypted     = true
  
  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # Backup configuration
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  # Protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "app-database-final-snapshot"

  # Automatic minor version upgrades
  auto_minor_version_upgrade = true
}

# ElastiCache Redis with Multi-AZ automatic failover
resource "aws_elasticache_replication_group" "app" {
  replication_group_id       = "app-cache"
  replication_group_description = "Application cache cluster"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 3  # One primary + two replicas across AZs
  
  # High availability
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  # Network
  subnet_group_name = aws_elasticache_subnet_group.app.name
  security_group_ids = [aws_security_group.cache.id]
  
  # Backup
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  # Maintenance
  maintenance_window = "sun:05:00-sun:07:00"
  
  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.redis_auth.result
  
  # Notifications
  notification_topic_arn = aws_sns_topic.cache_events.arn
}
```

**Why This Is Reliable:**
- Load balancer distributes traffic across multiple AZs
- Auto Scaling ensures minimum capacity in each AZ
- RDS Multi-AZ provides automatic failover (typically 60-120 seconds)
- ElastiCache Multi-AZ provides automatic failover for cache layer
- Health checks detect and replace unhealthy instances
- Cross-zone load balancing ensures even distribution

**Pattern 4: Decoupled Architecture with SQS and SNS**
```yaml
# CloudFormation example - Event-driven decoupled architecture
# SNS Topic for event publishing
EventTopic:
  Type: AWS::SNS::Topic
  Properties:
    TopicName: application-events
    DisplayName: Application Events
    KmsMasterKeyId: !Ref EventEncryptionKey
    Subscription:
      - Endpoint: !GetAtt ProcessingQueue.Arn
        Protocol: sqs
      - Endpoint: !GetAtt AnalyticsQueue.Arn
        Protocol: sqs
      - Endpoint: !GetAtt NotificationQueue.Arn
        Protocol: sqs

# SQS Queue for processing with DLQ
ProcessingQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: processing-queue
    VisibilityTimeout: 300
    MessageRetentionPeriod: 1209600  # 14 days
    ReceiveMessageWaitTimeSeconds: 20  # Long polling
    KmsMasterKeyId: !Ref EventEncryptionKey
    RedrivePolicy:
      deadLetterTargetArn: !GetAtt ProcessingDLQ.Arn
      maxReceiveCount: 3

ProcessingDLQ:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: processing-dlq
    MessageRetentionPeriod: 1209600  # 14 days
    KmsMasterKeyId: !Ref EventEncryptionKey

# Queue policy to allow SNS to send messages
ProcessingQueuePolicy:
  Type: AWS::SQS::QueuePolicy
  Properties:
    Queues:
      - !Ref ProcessingQueue
    PolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: sns.amazonaws.com
          Action: sqs:SendMessage
          Resource: !GetAtt ProcessingQueue.Arn
          Condition:
            ArnEquals:
              aws:SourceArn: !Ref EventTopic

# Lambda function to process messages
ProcessingFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: event-processor
    Runtime: python3.11
    Handler: index.handler
    Code:
      ZipFile: |
        import json
        import boto3
        
        def handler(event, context):
            # Process SQS messages
            for record in event['Records']:
                try:
                    message = json.loads(record['body'])
                    # Process message
                    print(f"Processing: {message}")
                    # Message automatically deleted on success
                except Exception as e:
                    print(f"Error processing message: {e}")
                    # Message goes to DLQ after max retries
                    raise
            
            return {'statusCode': 200}
    ReservedConcurrentExecutions: 100  # Limit concurrency
    Timeout: 300
    DeadLetterConfig:
      TargetArn: !GetAtt ProcessingDLQ.Arn

# Event source mapping with batch processing
ProcessingEventSource:
  Type: AWS::Lambda::EventSourceMapping
  Properties:
    EventSourceArn: !GetAtt ProcessingQueue.Arn
    FunctionName: !Ref ProcessingFunction
    BatchSize: 10
    MaximumBatchingWindowInSeconds: 5
    FunctionResponseTypes:
      - ReportBatchItemFailures  # Partial batch failure handling

# CloudWatch Alarm for DLQ messages
DLQAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: processing-dlq-messages
    AlarmDescription: Alert when messages appear in DLQ
    MetricName: ApproximateNumberOfMessagesVisible
    Namespace: AWS/SQS
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 1
    Threshold: 1
    ComparisonOperator: GreaterThanOrEqualToThreshold
    Dimensions:
      - Name: QueueName
        Value: !GetAtt ProcessingDLQ.QueueName
    AlarmActions:
      - !Ref AlertTopic
```

**Why This Is Reliable:**
- SNS fan-out pattern allows multiple consumers
- SQS provides durable message storage
- Dead Letter Queues capture failed messages for analysis
- Long polling reduces empty receives and costs
- Lambda concurrency limits prevent overwhelming downstream systems
- Partial batch failure handling prevents reprocessing successful messages
- Encryption protects data in transit and at rest

#### Common Architecture Anti-Patterns

**❌ Anti-Pattern 1: Single Point of Failure**
```hcl
# DON'T DO THIS - Single AZ deployment
resource "aws_instance" "single_az" {
  ami           = "ami-12345678"
  instance_type = "t3.large"
  availability_zone = "us-east-1a"  # Only one AZ
  # If us-east-1a has issues, entire application is down
}
```
**Problem**: Single AZ failure takes down entire application
**Fix**: Deploy across multiple AZs with load balancing

**❌ Anti-Pattern 2: Tight Coupling**
```python
# DON'T DO THIS - Synchronous tight coupling
def process_order(order):
    # Directly call other services synchronously
    inventory_service.reserve_items(order.items)  # Blocks if service is down
    payment_service.charge(order.total)           # Blocks if service is down
    shipping_service.create_shipment(order)       # Blocks if service is down
    # If any service fails, entire order fails
```
**Problem**: Failure in any service causes entire operation to fail
**Fix**: Use queues for asynchronous processing and implement circuit breakers

**❌ Anti-Pattern 3: No Health Checks**
```hcl
# DON'T DO THIS - No health checks configured
resource "aws_lb_target_group" "bad" {
  name     = "app-targets"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  # No health_check block - uses defaults only
}
```
**Problem**: Load balancer may send traffic to unhealthy instances
**Fix**: Configure comprehensive health checks with appropriate thresholds

### 3. Change Management

#### Best Practices

**Monitor Workload Resources**
- Collect metrics for all components
- Set up alarms for anomalies
- Use CloudWatch Logs Insights for log analysis
- Implement distributed tracing
- Monitor business metrics alongside technical metrics

**Design for Deployment**
- Use infrastructure as code for all resources
- Implement blue/green or canary deployments
- Automate deployment processes
- Use immutable infrastructure patterns
- Implement automated rollback on failure

**Test Reliability**
- Implement chaos engineering practices
- Test failure scenarios regularly
- Validate backup and restore procedures
- Test scaling under load
- Conduct disaster recovery drills

#### Change Management Patterns

**Pattern 5: Blue/Green Deployment with Auto Rollback**
```hcl
# Terraform example - Blue/Green deployment using CodeDeploy
resource "aws_codedeploy_app" "app" {
  name             = "my-application"
  compute_platform = "Server"
}

resource "aws_codedeploy_deployment_group" "app" {
  app_name              = aws_codedeploy_app.app.name
  deployment_group_name = "production"
  service_role_arn      = aws_iam_role.codedeploy.arn

  # Blue/Green deployment configuration
  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  blue_green_deployment_config {
    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 60  # Keep blue for 1 hour
    }

    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    green_fleet_provisioning_option {
      action = "COPY_AUTO_SCALING_GROUP"
    }
  }

  # Load balancer configuration
  load_balancer_info {
    target_group_info {
      name = aws_lb_target_group.blue.name
    }
  }

  # Automatic rollback configuration
  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }

  # CloudWatch alarms to trigger rollback
  alarm_configuration {
    enabled = true
    alarms  = [
      aws_cloudwatch_metric_alarm.error_rate.alarm_name,
      aws_cloudwatch_metric_alarm.latency.alarm_name
    ]
    ignore_poll_alarm_failure = false
  }

  # Auto Scaling groups
  autoscaling_groups = [aws_autoscaling_group.app.name]
}

# Alarm for error rate
resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Triggers rollback if error rate is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
}

# Alarm for latency
resource "aws_cloudwatch_metric_alarm" "latency" {
  alarm_name          = "high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1.0  # 1 second
  alarm_description   = "Triggers rollback if latency is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
}
```

**Why This Is Reliable:**
- Blue/Green deployment minimizes downtime
- Traffic shifts gradually to new version
- Old version kept running for quick rollback
- Automatic rollback on alarm triggers
- CloudWatch alarms monitor deployment health
- Immutable infrastructure prevents configuration drift


**Pattern 6: Canary Deployment with Gradual Traffic Shift**
```python
# AWS Lambda example - Canary deployment configuration
# serverless.yml or SAM template
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-api-function
      Runtime: python3.11
      Handler: app.handler
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes  # 10% traffic for 5 minutes
        Alarms:
          - !Ref CanaryErrorAlarm
          - !Ref CanaryDurationAlarm
        Hooks:
          PreTraffic: !Ref PreTrafficHook
          PostTraffic: !Ref PostTrafficHook

  # Pre-traffic hook to validate deployment
  PreTrafficHook:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: pre-traffic-validation
      Runtime: python3.11
      Handler: validation.pre_traffic
      Environment:
        Variables:
          NEW_VERSION: !Ref MyFunction.Version
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - codedeploy:PutLifecycleEventHookExecutionStatus
              Resource: '*'
            - Effect: Allow
              Action:
                - lambda:InvokeFunction
              Resource: !Ref MyFunction.Version

  # Alarm for canary errors
  CanaryErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: canary-errors
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 1
      MetricName: Errors
      Namespace: AWS/Lambda
      Period: 60
      Statistic: Sum
      Threshold: 5
      Dimensions:
        - Name: FunctionName
          Value: !Ref MyFunction
        - Name: Resource
          Value: !Sub '${MyFunction}:live'

  # Alarm for canary duration
  CanaryDurationAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: canary-duration
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 1
      MetricName: Duration
      Namespace: AWS/Lambda
      Period: 60
      Statistic: Average
      Threshold: 3000  # 3 seconds
      Dimensions:
        - Name: FunctionName
          Value: !Ref MyFunction
        - Name: Resource
          Value: !Sub '${MyFunction}:live'
```

**Why This Is Reliable:**
- Gradual traffic shift limits blast radius
- Pre-traffic hooks validate deployment before traffic shift
- Automatic rollback on alarm triggers
- Canary testing with real production traffic
- Version aliases enable instant rollback

### 4. Failure Management

#### Best Practices

**Back Up Data**
- Implement automated backup schedules
- Test restore procedures regularly
- Store backups in different regions
- Use versioning for critical data
- Implement point-in-time recovery

**Use Fault Isolation**
- Implement bulkheads to contain failures
- Use separate resources for different workloads
- Implement circuit breakers
- Use shuffle sharding for multi-tenant systems
- Limit blast radius of failures

**Design for Resilience**
- Implement retry logic with exponential backoff
- Use timeouts to prevent resource exhaustion
- Implement graceful degradation
- Cache data to survive dependency failures
- Use static stability patterns

#### Failure Management Patterns

**Pattern 7: Comprehensive Backup Strategy**
```hcl
# Terraform example - Multi-layer backup strategy
# AWS Backup plan for centralized backup management
resource "aws_backup_plan" "comprehensive" {
  name = "comprehensive-backup-plan"

  # Daily backups with 30-day retention
  rule {
    rule_name         = "daily_backups"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 2 * * ? *)"  # 2 AM daily
    
    lifecycle {
      delete_after = 30
    }

    recovery_point_tags = {
      BackupType = "Daily"
      Automated  = "true"
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.secondary.arn
      
      lifecycle {
        delete_after = 30
      }
    }
  }

  # Weekly backups with 90-day retention
  rule {
    rule_name         = "weekly_backups"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 3 ? * SUN *)"  # 3 AM Sundays
    
    lifecycle {
      cold_storage_after = 30
      delete_after       = 90
    }

    recovery_point_tags = {
      BackupType = "Weekly"
      Automated  = "true"
    }
  }

  # Monthly backups with 1-year retention
  rule {
    rule_name         = "monthly_backups"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 4 1 * ? *)"  # 4 AM on 1st of month
    
    lifecycle {
      cold_storage_after = 30
      delete_after       = 365
    }

    recovery_point_tags = {
      BackupType = "Monthly"
      Automated  = "true"
    }
  }
}

# Primary backup vault with encryption
resource "aws_backup_vault" "primary" {
  name        = "primary-backup-vault"
  kms_key_arn = aws_kms_key.backup.arn

  tags = {
    Environment = "production"
    Purpose     = "primary-backups"
  }
}

# Secondary backup vault in different region
resource "aws_backup_vault" "secondary" {
  provider    = aws.secondary_region
  name        = "secondary-backup-vault"
  kms_key_arn = aws_kms_key.backup_secondary.arn

  tags = {
    Environment = "production"
    Purpose     = "disaster-recovery"
  }
}

# Backup selection - what to back up
resource "aws_backup_selection" "production_resources" {
  name         = "production-resources"
  plan_id      = aws_backup_plan.comprehensive.id
  iam_role_arn = aws_iam_role.backup.arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Backup"
    value = "true"
  }

  resources = [
    "arn:aws:rds:*:*:db:*",
    "arn:aws:dynamodb:*:*:table/*",
    "arn:aws:ec2:*:*:volume/*",
    "arn:aws:efs:*:*:file-system/*"
  ]
}

# CloudWatch alarm for backup failures
resource "aws_cloudwatch_metric_alarm" "backup_failures" {
  alarm_name          = "backup-job-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = 86400  # 24 hours
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alert when backup jobs fail"
  treat_missing_data  = "notBreaching"

  alarm_actions = [aws_sns_topic.backup_alerts.arn]
}

# Automated restore testing
resource "aws_lambda_function" "backup_restore_test" {
  filename      = "restore_test.zip"
  function_name = "backup-restore-test"
  role          = aws_iam_role.restore_test.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 900  # 15 minutes

  environment {
    variables = {
      BACKUP_VAULT_NAME = aws_backup_vault.primary.name
      TEST_VPC_ID       = aws_vpc.test.id
    }
  }
}

# Schedule monthly restore tests
resource "aws_cloudwatch_event_rule" "restore_test" {
  name                = "monthly-restore-test"
  description         = "Trigger monthly backup restore test"
  schedule_expression = "cron(0 5 15 * ? *)"  # 15th of each month at 5 AM
}

resource "aws_cloudwatch_event_target" "restore_test" {
  rule      = aws_cloudwatch_event_rule.restore_test.name
  target_id = "RestoreTestLambda"
  arn       = aws_lambda_function.backup_restore_test.arn
}
```

**Why This Is Reliable:**
- Multiple backup frequencies for different recovery needs
- Cross-region backup copies for disaster recovery
- Automated backup lifecycle management
- Cold storage for long-term retention cost optimization
- Backup failure monitoring and alerting
- Automated restore testing validates backups work

**Pattern 8: Circuit Breaker Implementation**
```python
# Python example - Circuit breaker for external service calls
import time
import requests
from enum import Enum
from threading import Lock

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60, success_threshold=2):
        self.failure_threshold = failure_threshold
        self.timeout = timeout  # Seconds before trying again
        self.success_threshold = success_threshold
        
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        self.lock = Lock()
    
    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        with self.lock:
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                else:
                    raise Exception("Circuit breaker is OPEN - service unavailable")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        """Handle successful call"""
        with self.lock:
            self.failure_count = 0
            
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self.state = CircuitState.CLOSED
                    self.success_count = 0
    
    def _on_failure(self):
        """Handle failed call"""
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
    
    def _should_attempt_reset(self):
        """Check if enough time has passed to try again"""
        return (time.time() - self.last_failure_time) >= self.timeout

# Usage example with retry and exponential backoff
class ResilientAPIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            timeout=60,
            success_threshold=2
        )
    
    def get_data(self, endpoint, max_retries=3):
        """Get data with circuit breaker and retry logic"""
        for attempt in range(max_retries):
            try:
                return self.circuit_breaker.call(
                    self._make_request,
                    endpoint
                )
            except Exception as e:
                if attempt == max_retries - 1:
                    # Last attempt failed, use fallback
                    return self._get_fallback_data(endpoint)
                
                # Exponential backoff with jitter
                wait_time = (2 ** attempt) + (random.random() * 0.1)
                time.sleep(wait_time)
    
    def _make_request(self, endpoint):
        """Make HTTP request with timeout"""
        response = requests.get(
            f"{self.base_url}/{endpoint}",
            timeout=5  # 5 second timeout
        )
        response.raise_for_status()
        return response.json()
    
    def _get_fallback_data(self, endpoint):
        """Return cached or default data when service is unavailable"""
        # Try cache first
        cached_data = self._get_from_cache(endpoint)
        if cached_data:
            return cached_data
        
        # Return safe default
        return {"status": "degraded", "data": []}
    
    def _get_from_cache(self, endpoint):
        """Get data from cache (Redis, ElastiCache, etc.)"""
        # Implementation depends on caching solution
        pass

# Example usage
client = ResilientAPIClient("https://api.example.com")

try:
    data = client.get_data("users")
    print(f"Retrieved data: {data}")
except Exception as e:
    print(f"Failed to retrieve data: {e}")
```

**Why This Is Reliable:**
- Circuit breaker prevents cascading failures
- Automatic recovery testing with half-open state
- Exponential backoff prevents overwhelming failed service
- Jitter prevents thundering herd problem
- Fallback data ensures graceful degradation
- Timeouts prevent resource exhaustion

#### Common Failure Management Anti-Patterns

**❌ Anti-Pattern 4: No Backup Strategy**
```hcl
# DON'T DO THIS - No backups configured
resource "aws_db_instance" "no_backups" {
  identifier = "my-database"
  # ...
  backup_retention_period = 0  # No backups!
  skip_final_snapshot    = true  # No final snapshot!
}
```
**Problem**: Data loss is permanent with no recovery option
**Fix**: Enable automated backups with appropriate retention

**❌ Anti-Pattern 5: Infinite Retries**
```python
# DON'T DO THIS - Infinite retry loop
def call_api():
    while True:
        try:
            return requests.get("https://api.example.com/data")
        except:
            time.sleep(1)  # Retry forever
            continue
```
**Problem**: Never gives up, wastes resources, prevents graceful degradation
**Fix**: Implement max retries, exponential backoff, and circuit breaker

**❌ Anti-Pattern 6: No Timeout**
```python
# DON'T DO THIS - No timeout on external calls
response = requests.get("https://slow-api.example.com/data")
# Hangs forever if service doesn't respond
```
**Problem**: Blocked threads, resource exhaustion, cascading failures
**Fix**: Always set timeouts on external calls

### 5. Data Durability and Availability

#### Best Practices

**Replicate Data**
- Use Multi-AZ deployments for databases
- Implement cross-region replication for critical data
- Use S3 Cross-Region Replication
- Implement read replicas for read-heavy workloads
- Use DynamoDB Global Tables for multi-region access

**Implement Data Lifecycle Management**
- Define retention policies for different data types
- Use S3 lifecycle policies for automatic transitions
- Implement data archival strategies
- Use versioning for critical data
- Implement data deletion policies for compliance

**Monitor Data Integrity**
- Use checksums to verify data integrity
- Monitor replication lag
- Implement data validation checks
- Use S3 Object Lock for immutable data
- Monitor storage metrics and capacity

#### Data Durability Patterns

**Pattern 9: Multi-Region Data Replication**
```hcl
# Terraform example - S3 Cross-Region Replication
# Primary bucket in us-east-1
resource "aws_s3_bucket" "primary" {
  bucket = "my-app-data-primary"
  
  tags = {
    Environment = "production"
    Region      = "primary"
  }
}

resource "aws_s3_bucket_versioning" "primary" {
  bucket = aws_s3_bucket.primary.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Replica bucket in us-west-2
resource "aws_s3_bucket" "replica" {
  provider = aws.us_west_2
  bucket   = "my-app-data-replica"
  
  tags = {
    Environment = "production"
    Region      = "replica"
  }
}

resource "aws_s3_bucket_versioning" "replica" {
  provider = aws.us_west_2
  bucket   = aws_s3_bucket.replica.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Replication configuration
resource "aws_s3_bucket_replication_configuration" "primary_to_replica" {
  bucket = aws_s3_bucket.primary.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-all"
    status = "Enabled"

    filter {
      prefix = ""  # Replicate all objects
    }

    destination {
      bucket        = aws_s3_bucket.replica.arn
      storage_class = "STANDARD_IA"  # Use cheaper storage class for replica
      
      # Replicate encryption
      encryption_configuration {
        replica_kms_key_id = aws_kms_key.replica.arn
      }
      
      # Replication metrics
      metrics {
        status = "Enabled"
        event_threshold {
          minutes = 15
        }
      }
      
      # Replication time control (RTC) for predictable replication
      replication_time {
        status = "Enabled"
        time {
          minutes = 15
        }
      }
    }

    # Delete marker replication
    delete_marker_replication {
      status = "Enabled"
    }
  }
}

# Monitor replication lag
resource "aws_cloudwatch_metric_alarm" "replication_lag" {
  alarm_name          = "s3-replication-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReplicationLatency"
  namespace           = "AWS/S3"
  period              = 300
  statistic           = "Maximum"
  threshold           = 900  # 15 minutes
  alarm_description   = "S3 replication is lagging"
  treat_missing_data  = "notBreaching"

  dimensions = {
    SourceBucket      = aws_s3_bucket.primary.id
    DestinationBucket = aws_s3_bucket.replica.id
    RuleId            = "replicate-all"
  }

  alarm_actions = [aws_sns_topic.ops_alerts.arn]
}

# DynamoDB Global Table for multi-region access
resource "aws_dynamodb_table" "global" {
  name             = "my-global-table"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  # Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Replica in us-west-2
  replica {
    region_name = "us-west-2"
    
    point_in_time_recovery = true
  }

  # Replica in eu-west-1
  replica {
    region_name = "eu-west-1"
    
    point_in_time_recovery = true
  }

  tags = {
    Environment = "production"
    Replication = "global"
  }
}
```

**Why This Is Reliable:**
- Cross-region replication protects against regional failures
- Versioning enables recovery from accidental deletions
- Replication Time Control provides predictable replication
- Replication metrics enable monitoring
- DynamoDB Global Tables provide multi-region writes
- Point-in-time recovery enables granular restore


**Pattern 10: RDS Multi-Region Disaster Recovery**
```yaml
# CloudFormation example - RDS with cross-region read replica
PrimaryDatabase:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: primary-db
    Engine: postgres
    EngineVersion: '15.4'
    DBInstanceClass: db.r6g.xlarge
    AllocatedStorage: 100
    StorageType: gp3
    StorageEncrypted: true
    KmsKeyId: !Ref PrimaryDBKey
    
    # High availability in primary region
    MultiAZ: true
    
    # Backup configuration
    BackupRetentionPeriod: 30
    PreferredBackupWindow: '03:00-04:00'
    CopyTagsToSnapshot: true
    
    # Enable automated backups to S3
    EnableCloudwatchLogsExports:
      - postgresql
      - upgrade
    
    # Performance Insights
    EnablePerformanceInsights: true
    PerformanceInsightsRetentionPeriod: 7
    
    # Network
    DBSubnetGroupName: !Ref PrimaryDBSubnetGroup
    VPCSecurityGroups:
      - !Ref PrimaryDBSecurityGroup
    PubliclyAccessible: false
    
    # Deletion protection
    DeletionProtection: true

# Cross-region read replica for disaster recovery
ReplicaDatabase:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: replica-db
    SourceDBInstanceIdentifier: !Ref PrimaryDatabase
    SourceRegion: us-east-1
    DBInstanceClass: db.r6g.xlarge
    StorageEncrypted: true
    KmsKeyId: !Ref ReplicaDBKey
    
    # Can be promoted to standalone database
    MultiAZ: false  # Enable after promotion
    
    # Network in DR region
    DBSubnetGroupName: !Ref ReplicaDBSubnetGroup
    VPCSecurityGroups:
      - !Ref ReplicaDBSecurityGroup
    PubliclyAccessible: false
    
    # Monitoring
    EnablePerformanceInsights: true
    EnableCloudwatchLogsExports:
      - postgresql
      - upgrade

# Monitor replication lag
ReplicationLagAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: rds-replication-lag
    AlarmDescription: Alert when replication lag exceeds threshold
    MetricName: ReplicaLag
    Namespace: AWS/RDS
    Statistic: Average
    Period: 300
    EvaluationPeriods: 2
    Threshold: 300  # 5 minutes
    ComparisonOperator: GreaterThanThreshold
    Dimensions:
      - Name: DBInstanceIdentifier
        Value: !Ref ReplicaDatabase
    AlarmActions:
      - !Ref DRAlertTopic

# Lambda function for automated failover
FailoverFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: rds-failover-automation
    Runtime: python3.11
    Handler: index.handler
    Timeout: 300
    Role: !GetAtt FailoverRole.Arn
    Environment:
      Variables:
        REPLICA_DB_ID: !Ref ReplicaDatabase
        ROUTE53_HOSTED_ZONE: !Ref HostedZone
        DB_CNAME_RECORD: db.example.com
    Code:
      ZipFile: |
        import boto3
        import os
        
        rds = boto3.client('rds')
        route53 = boto3.client('route53')
        
        def handler(event, context):
            replica_id = os.environ['REPLICA_DB_ID']
            
            # Promote read replica to standalone database
            print(f"Promoting replica {replica_id} to standalone database")
            rds.promote_read_replica(
                DBInstanceIdentifier=replica_id,
                BackupRetentionPeriod=30,
                PreferredBackupWindow='03:00-04:00'
            )
            
            # Wait for promotion to complete
            waiter = rds.get_waiter('db_instance_available')
            waiter.wait(DBInstanceIdentifier=replica_id)
            
            # Get new endpoint
            response = rds.describe_db_instances(
                DBInstanceIdentifier=replica_id
            )
            new_endpoint = response['DBInstances'][0]['Endpoint']['Address']
            
            # Update Route 53 DNS record
            print(f"Updating DNS to point to {new_endpoint}")
            route53.change_resource_record_sets(
                HostedZoneId=os.environ['ROUTE53_HOSTED_ZONE'],
                ChangeBatch={
                    'Changes': [{
                        'Action': 'UPSERT',
                        'ResourceRecordSet': {
                            'Name': os.environ['DB_CNAME_RECORD'],
                            'Type': 'CNAME',
                            'TTL': 60,
                            'ResourceRecords': [{'Value': new_endpoint}]
                        }
                    }]
                }
            )
            
            return {
                'statusCode': 200,
                'body': f'Failover complete. New endpoint: {new_endpoint}'
            }
```

**Why This Is Reliable:**
- Multi-AZ in primary region for high availability
- Cross-region read replica for disaster recovery
- Automated promotion capability
- DNS-based failover with Route 53
- Replication lag monitoring
- 30-day backup retention in both regions

## Common Reliability Issues and Remediation

### Issue 1: Single AZ Deployment

**Detection**: Manual review or custom AWS Config rule

**Risk**: High - Entire application fails if AZ has issues

**Remediation**:
```hcl
# Convert single-AZ to multi-AZ deployment
resource "aws_autoscaling_group" "multi_az" {
  name                = "app-asg-multi-az"
  vpc_zone_identifier = [
    aws_subnet.private_az1.id,
    aws_subnet.private_az2.id,
    aws_subnet.private_az3.id
  ]
  
  min_size         = 3  # At least one per AZ
  max_size         = 12
  desired_capacity = 6  # Two per AZ
  
  # Ensure even distribution
  capacity_rebalance = true
  
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
}

# Enable Multi-AZ for RDS
resource "aws_db_instance" "multi_az" {
  identifier = "app-database"
  multi_az   = true  # Enable Multi-AZ
  # ... other configuration
}
```

### Issue 2: No Backup Configuration

**Detection**: AWS Config rule `db-backup-enabled` or `dynamodb-pitr-enabled`

**Risk**: Critical - Data loss is permanent

**Remediation**:
```bash
# Enable RDS automated backups
aws rds modify-db-instance \
  --db-instance-identifier my-database \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately

# Enable DynamoDB point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name my-table \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled
```

### Issue 3: No Health Checks Configured

**Detection**: Manual review of load balancer target groups

**Risk**: Medium - Traffic sent to unhealthy instances

**Remediation**:
```hcl
resource "aws_lb_target_group" "with_health_checks" {
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
    protocol            = "HTTP"
  }

  deregistration_delay = 30
}
```

### Issue 4: No Auto Scaling Configured

**Detection**: Manual review or custom monitoring

**Risk**: Medium - Cannot handle traffic spikes, wastes resources during low traffic

**Remediation**:
```hcl
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

# Step scaling for rapid scale-out
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out-policy"
  autoscaling_group_name = aws_autoscaling_group.app.name
  adjustment_type        = "PercentChangeInCapacity"
  policy_type            = "StepScaling"

  step_adjustment {
    scaling_adjustment          = 10
    metric_interval_lower_bound = 0
    metric_interval_upper_bound = 10
  }

  step_adjustment {
    scaling_adjustment          = 20
    metric_interval_lower_bound = 10
  }
}
```

### Issue 5: Missing CloudWatch Alarms

**Detection**: Manual review or AWS Config custom rule

**Risk**: Medium - Issues not detected until users report problems

**Remediation**:
```hcl
# CPU utilization alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when CPU exceeds 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app.name
  }
}

# Error rate alarm
resource "aws_cloudwatch_metric_alarm" "high_errors" {
  alarm_name          = "high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when error rate is high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
}

# Database connection alarm
resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "high-db-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when database connections are high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.app.id
  }
}
```

## Reliability Checklist for Code Reviews

When reviewing infrastructure code, check for these reliability requirements:

### High Availability
- [ ] Resources deployed across multiple Availability Zones
- [ ] Load balancers configured with multiple AZs
- [ ] Auto Scaling groups span multiple AZs
- [ ] RDS Multi-AZ enabled for production databases
- [ ] ElastiCache Multi-AZ enabled with automatic failover
- [ ] Minimum capacity ensures at least one instance per AZ

### Fault Tolerance
- [ ] Health checks configured for all load balancer targets
- [ ] Auto Scaling policies configured for scale-out and scale-in
- [ ] Circuit breakers implemented for external dependencies
- [ ] Retry logic with exponential backoff and jitter
- [ ] Timeouts configured for all external calls
- [ ] Graceful degradation patterns implemented

### Backup and Recovery
- [ ] Automated backups enabled with appropriate retention
- [ ] Cross-region backup copies for critical data
- [ ] Point-in-time recovery enabled for databases
- [ ] S3 versioning enabled for critical data
- [ ] Backup restore procedures tested regularly
- [ ] Recovery Time Objective (RTO) and Recovery Point Objective (RPO) defined

### Monitoring and Alarms
- [ ] CloudWatch alarms for key metrics (CPU, memory, errors, latency)
- [ ] Composite alarms for overall health
- [ ] SNS topics configured for alarm notifications
- [ ] CloudWatch Logs configured with appropriate retention
- [ ] X-Ray tracing enabled for distributed systems
- [ ] Custom metrics for business-critical indicators

### Change Management
- [ ] Blue/green or canary deployment strategy
- [ ] Automated rollback on deployment failures
- [ ] Infrastructure as code for all resources
- [ ] Immutable infrastructure patterns
- [ ] Deployment alarms configured
- [ ] Pre-deployment and post-deployment validation

### Data Durability
- [ ] Cross-region replication for critical data
- [ ] DynamoDB Global Tables for multi-region access
- [ ] S3 Cross-Region Replication configured
- [ ] Replication lag monitoring
- [ ] Data integrity checks implemented
- [ ] Lifecycle policies for data management

## Reliability by Service

### Amazon EC2
**Key Reliability Features:**
- Auto Scaling for capacity management
- Elastic Load Balancing for traffic distribution
- Multiple Availability Zones for high availability
- Amazon Machine Images (AMIs) for quick recovery
- EC2 Instance Recovery for automatic recovery
- Placement groups for low-latency communication

**Reliability Best Practices:**
- Use Auto Scaling groups with multiple AZs
- Configure health checks for ELB targets
- Use launch templates for consistent configuration
- Implement instance metadata service v2 (IMDSv2)
- Use Systems Manager for patch management
- Monitor with CloudWatch and set up alarms

### Amazon RDS
**Key Reliability Features:**
- Multi-AZ deployments with automatic failover
- Automated backups with point-in-time recovery
- Read replicas for read scaling
- Cross-region read replicas for disaster recovery
- Automated software patching
- Enhanced monitoring and Performance Insights

**Reliability Best Practices:**
- Enable Multi-AZ for production databases
- Configure automated backups with 30-day retention
- Create cross-region read replicas for DR
- Monitor replication lag
- Use connection pooling
- Test failover procedures regularly

### Amazon S3
**Key Reliability Features:**
- 99.999999999% (11 9's) durability
- Cross-Region Replication
- Versioning for data protection
- S3 Object Lock for immutable data
- S3 Lifecycle policies
- S3 Intelligent-Tiering

**Reliability Best Practices:**
- Enable versioning for critical buckets
- Configure Cross-Region Replication for DR
- Use lifecycle policies for data management
- Enable S3 Object Lock for compliance
- Monitor with S3 Storage Lens
- Use S3 Transfer Acceleration for global uploads

### Amazon DynamoDB
**Key Reliability Features:**
- 99.999% availability SLA
- Global Tables for multi-region replication
- Point-in-time recovery
- On-demand backup and restore
- Auto scaling for capacity management
- DynamoDB Streams for change data capture

**Reliability Best Practices:**
- Use Global Tables for multi-region access
- Enable point-in-time recovery
- Configure auto scaling for capacity
- Use DynamoDB Accelerator (DAX) for caching
- Monitor with CloudWatch Contributor Insights
- Implement exponential backoff for retries

### AWS Lambda
**Key Reliability Features:**
- Automatic scaling to handle requests
- Built-in fault tolerance and high availability
- Dead Letter Queues for failed invocations
- Reserved concurrency for critical functions
- Provisioned concurrency for consistent performance
- Destinations for asynchronous invocations

**Reliability Best Practices:**
- Set appropriate timeout values
- Configure Dead Letter Queues
- Use reserved concurrency for critical functions
- Implement idempotent functions
- Use Lambda Destinations for error handling
- Monitor with CloudWatch Logs Insights and X-Ray

### Amazon ECS/EKS
**Key Reliability Features:**
- Multi-AZ deployment
- Service auto scaling
- Health checks and automatic replacement
- Rolling updates with configurable parameters
- Integration with Application Load Balancer
- Fargate for serverless container management

**Reliability Best Practices:**
- Deploy tasks across multiple AZs
- Configure service auto scaling
- Use health checks for task replacement
- Implement rolling updates with proper parameters
- Use Application Load Balancer for traffic distribution
- Monitor with Container Insights

## Disaster Recovery Strategies

### Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

**RTO**: Maximum acceptable time to restore service after a disaster
**RPO**: Maximum acceptable data loss measured in time

### DR Strategy 1: Backup and Restore (Lowest Cost, Highest RTO/RPO)

**RTO**: Hours to days
**RPO**: Hours to days

**Use Case**: Non-critical workloads, development environments

**Implementation**:
- Regular backups to S3
- Cross-region backup copies
- Documented restore procedures
- Periodic restore testing

**Cost**: Low (storage costs only)

### DR Strategy 2: Pilot Light (Low Cost, Moderate RTO/RPO)

**RTO**: Minutes to hours
**RPO**: Minutes to hours

**Use Case**: Business-critical workloads with moderate recovery requirements

**Implementation**:
- Core infrastructure always running in DR region
- Data replication to DR region
- Automated scripts to scale up during disaster
- Regular DR drills

**Cost**: Low to moderate (minimal infrastructure + data replication)

### DR Strategy 3: Warm Standby (Moderate Cost, Low RTO/RPO)

**RTO**: Minutes
**RPO**: Seconds to minutes

**Use Case**: Business-critical workloads requiring quick recovery

**Implementation**:
- Scaled-down version running in DR region
- Continuous data replication
- Automated failover with Route 53
- Regular failover testing

**Cost**: Moderate (running infrastructure + data replication)

### DR Strategy 4: Multi-Region Active-Active (Highest Cost, Lowest RTO/RPO)

**RTO**: Seconds (automatic)
**RPO**: Near-zero

**Use Case**: Mission-critical workloads requiring continuous availability

**Implementation**:
- Full production environment in multiple regions
- DynamoDB Global Tables or database replication
- Route 53 health checks and failover
- Continuous testing and monitoring

**Cost**: High (full infrastructure in multiple regions)

## Testing Reliability

### Chaos Engineering

**Purpose**: Proactively identify weaknesses by injecting failures

**Tools**:
- AWS Fault Injection Simulator (FIS)
- Chaos Monkey (Netflix)
- Gremlin
- LitmusChaos

**Common Experiments**:
- Terminate random EC2 instances
- Inject network latency
- Throttle API calls
- Simulate AZ failure
- Inject CPU/memory stress

**Example FIS Experiment**:
```yaml
# AWS FIS experiment template
description: Terminate random EC2 instances to test auto-recovery
targets:
  myInstances:
    resourceType: aws:ec2:instance
    resourceTags:
      Environment: production
    selectionMode: PERCENT(20)  # Affect 20% of instances

actions:
  terminateInstances:
    actionId: aws:ec2:terminate-instances
    parameters: {}
    targets:
      Instances: myInstances

stopConditions:
  - source: aws:cloudwatch:alarm
    value: arn:aws:cloudwatch:REGION:ACCOUNT_ID:alarm:high-error-rate

roleArn: arn:aws:iam::ACCOUNT_ID:role/FISRole
```

### Load Testing

**Purpose**: Validate system can handle expected and peak loads

**Tools**:
- Apache JMeter
- Gatling
- Locust
- AWS Distributed Load Testing Solution

**Test Scenarios**:
- Normal load (baseline)
- Peak load (expected maximum)
- Stress test (beyond capacity)
- Spike test (sudden traffic increase)
- Endurance test (sustained load)

### Disaster Recovery Drills

**Purpose**: Validate recovery procedures work as expected

**Frequency**: Quarterly for critical systems

**Drill Types**:
1. **Tabletop Exercise**: Walk through procedures without execution
2. **Partial Failover**: Test specific components
3. **Full Failover**: Complete regional failover
4. **Unannounced Drill**: Test team readiness

**Metrics to Track**:
- Actual RTO vs. target RTO
- Actual RPO vs. target RPO
- Issues encountered
- Time to detect failure
- Time to initiate recovery
- Time to full recovery

## Additional Resources

### AWS Documentation
- [AWS Well-Architected Framework - Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [AWS Reliability Best Practices](https://aws.amazon.com/architecture/reliability/)
- [AWS Disaster Recovery](https://aws.amazon.com/disaster-recovery/)
- [AWS Backup Documentation](https://docs.aws.amazon.com/aws-backup/)
- [Amazon RDS Multi-AZ Deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)

### AWS Whitepapers
- [AWS Reliability Pillar Whitepaper](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/wellarchitected-reliability-pillar.pdf)
- [Disaster Recovery of Workloads on AWS](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html)
- [AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/aws-fault-isolation-boundaries.html)
- [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html)

### Training and Certification
- [AWS Reliability Fundamentals](https://aws.amazon.com/training/)
- [AWS Solutions Architect - Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [AWS Well-Architected Labs - Reliability](https://wellarchitectedlabs.com/reliability/)
- [Chaos Engineering on AWS Workshop](https://catalog.workshops.aws/chaos-engineering/en-US)

### Tools and Services
- [AWS Backup](https://aws.amazon.com/backup/) - Centralized backup management
- [AWS Fault Injection Simulator](https://aws.amazon.com/fis/) - Chaos engineering
- [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) - Monitoring and observability
- [AWS X-Ray](https://aws.amazon.com/xray/) - Distributed tracing
- [AWS Systems Manager](https://aws.amazon.com/systems-manager/) - Operational management
- [AWS Resilience Hub](https://aws.amazon.com/resilience-hub/) - Resilience assessment
- [Amazon Route 53](https://aws.amazon.com/route53/) - DNS and health checks
- [AWS Auto Scaling](https://aws.amazon.com/autoscaling/) - Automatic capacity management

### Community Resources
- [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/)
- [AWS Reliability Blog Posts](https://aws.amazon.com/blogs/architecture/category/post-types/reliability/)
- [AWS re:Invent Sessions on Reliability](https://www.youtube.com/results?search_query=aws+reinvent+reliability)
- [AWS Samples GitHub - Reliability](https://github.com/aws-samples?q=reliability)

## Summary

The Reliability Pillar ensures your workload performs its intended function correctly and consistently. By implementing the best practices in this guide, you can:

- **Design for failure** with multi-AZ and multi-region architectures
- **Recover automatically** with health checks and auto scaling
- **Scale dynamically** to meet demand without over-provisioning
- **Test resilience** with chaos engineering and DR drills
- **Protect data** with backups, replication, and versioning
- **Monitor continuously** with CloudWatch, X-Ray, and custom metrics
- **Deploy safely** with blue/green and canary strategies

Remember: Reliability is achieved through architecture, automation, and testing. Design systems that assume failure will occur, implement automatic recovery mechanisms, and regularly test your assumptions through chaos engineering and disaster recovery drills.

When generating infrastructure code, always apply these reliability principles:
- Deploy across multiple Availability Zones
- Configure health checks and auto scaling
- Enable automated backups with cross-region copies
- Implement monitoring and alarms
- Use immutable infrastructure and automated deployments
- Test failure scenarios regularly

Use the AWS Knowledge MCP Server to access the latest reliability guidance and best practices for specific services and scenarios.


## Application Code Reliability

In addition to infrastructure reliability, application code must implement patterns for handling failures, retries, timeouts, and circuit breakers. This power analyzes application code across multiple programming languages for reliability patterns.

### Supported Languages for Application Code Analysis

- **Python**: boto3 retry configuration, error handling, circuit breakers
- **Java**: AWS SDK for Java v2 retry policies, timeout configuration
- **TypeScript/Node.js**: AWS SDK v3 retry, promise-based error handling
- **Go**: Context-based timeouts, error handling patterns
- **C#**: Polly resilience library, async/await patterns
- **Ruby**: Retriable gem, AWS SDK retry configuration

### Key Application Reliability Patterns Detected

1. **Error Handling**: Try-catch blocks around AWS SDK calls and external dependencies
2. **Retry Logic**: Exponential backoff with jitter for transient failures
3. **Timeout Configuration**: Connection, read, and operation timeouts
4. **Circuit Breakers**: Fail-fast patterns to prevent cascading failures
5. **Fallback Mechanisms**: Graceful degradation when dependencies unavailable
6. **Async Patterns**: Non-blocking operations for I/O-bound tasks

### Application Code Reliability Guidance

For detailed application code reliability patterns, examples, and language-specific best practices, see:

**[Application Code Reliability Patterns](./reliability-application-code.md)**

This companion guide provides:
- Language-specific retry implementations (Python, Java, TypeScript, Go, C#, Ruby)
- Circuit breaker pattern examples
- Timeout configuration for all AWS SDKs
- Common reliability anti-patterns and fixes
- Error handling best practices
- Fallback mechanism implementations
- Application code reliability checklist

