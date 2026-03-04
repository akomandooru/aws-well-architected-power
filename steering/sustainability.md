# Sustainability Pillar - AWS Well-Architected Framework

## Overview

The Sustainability Pillar focuses on minimizing the environmental impacts of running cloud workloads. This pillar addresses the long-term environmental, economic, and societal impact of your business activities. Sustainability in the cloud is a continuous effort focused on energy reduction, efficiency improvements, and waste minimization across all components of a workload.

### Core Sustainability Principles

1. **Understand your impact**: Measure and monitor the environmental impact of your cloud workloads
2. **Establish sustainability goals**: Set long-term sustainability goals for your workloads and model return on investment
3. **Maximize utilization**: Right-size workloads and implement efficient design patterns to ensure high utilization
4. **Anticipate and adopt new, more efficient offerings**: Stay current with new, more efficient hardware and software offerings
5. **Use managed services**: Share resources across a broad customer base to maximize resource efficiency
6. **Reduce downstream impact**: Reduce the amount of energy and resources required to use your services

## Sustainability Design Areas

### 1. Region Selection

#### Best Practices

**Choose Regions with Lower Carbon Intensity**
- Select AWS Regions powered by renewable energy
- Consider carbon intensity of electricity grids
- Use AWS Customer Carbon Footprint Tool to track emissions
- Prioritize regions with AWS sustainability commitments
- Balance sustainability with latency and compliance requirements

**Optimize Multi-Region Architectures**
- Use regions closer to users to reduce network transmission
- Implement edge computing with CloudFront and Lambda@Edge
- Avoid unnecessary data replication across regions
- Use S3 Transfer Acceleration for efficient long-distance transfers
- Consider regional failover strategies that minimize carbon footprint

#### Region Selection Patterns

**Pattern 1: Sustainable Region Selection Strategy**
```hcl
# Terraform example - Region selection with sustainability considerations
# AWS Regions with high renewable energy usage (as of 2024)
locals {
  sustainable_regions = {
    "us-west-2" = {
      name = "Oregon"
      renewable_energy_percentage = 95
      carbon_intensity = "low"
      description = "Powered primarily by hydroelectric and wind"
    }
    "eu-west-1" = {
      name = "Ireland"
      renewable_energy_percentage = 90
      carbon_intensity = "low"
      description = "High wind energy availability"
    }
    "eu-north-1" = {
      name = "Stockholm"
      renewable_energy_percentage = 98
      carbon_intensity = "very-low"
      description = "Powered by hydroelectric and nuclear"
    }
    "ca-central-1" = {
      name = "Canada"
      renewable_energy_percentage = 85
      carbon_intensity = "low"
      description = "Hydroelectric power dominant"
    }
  }
  
  # Select region based on sustainability and latency
  selected_region = "us-west-2"  # Oregon - high renewable energy
}

# Provider configuration for sustainable region
provider "aws" {
  region = local.selected_region
  
  default_tags {
    tags = {
      SustainabilityOptimized = "true"
      CarbonAware = "true"
      Region = local.sustainable_regions[local.selected_region].name
    }
  }
}

# CloudFront distribution to reduce data transfer distance
resource "aws_cloudfront_distribution" "sustainable" {
  enabled = true
  comment = "Sustainable content delivery with edge caching"
  
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "S3-sustainable-content"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-sustainable-content"
    
    # Maximize cache hit ratio to reduce origin requests
    min_ttl     = 3600      # 1 hour
    default_ttl = 86400     # 24 hours
    max_ttl     = 31536000  # 1 year
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    compress               = true  # Reduce data transfer
    viewer_protocol_policy = "redirect-to-https"
  }
  
  # Use all edge locations for optimal user proximity
  price_class = "PriceClass_All"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

**Why This Is Sustainable:**
- Selects regions with high renewable energy usage
- CloudFront edge caching reduces long-distance data transfer
- Compression reduces bandwidth and energy consumption
- Long cache TTLs minimize origin requests and compute
- HTTPS redirect ensures efficient encrypted transmission


### 2. Alignment to Demand

#### Best Practices

**Scale Infrastructure with Demand**
- Use Auto Scaling to match capacity to actual demand
- Implement scheduled scaling for predictable patterns
- Shut down non-production environments when not in use
- Use serverless architectures that scale to zero
- Implement queue-based load leveling to smooth demand spikes

**Optimize for Variable Workloads**
- Use burstable instances (T3/T4g) for variable CPU needs
- Implement Lambda for sporadic workloads
- Use Fargate for containerized workloads without idle capacity
- Leverage Spot Instances for fault-tolerant batch processing
- Use S3 Intelligent-Tiering for variable access patterns

**Eliminate Idle Resources**
- Tag and track resource utilization
- Implement automated shutdown of idle resources
- Use AWS Instance Scheduler for dev/test environments
- Monitor and alert on low utilization
- Regularly review and decommission unused resources

#### Demand Alignment Patterns

**Pattern 2: Automated Environment Scheduling**
```yaml
# CloudFormation example - Automated start/stop for non-production environments
InstanceSchedulerRole:
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
      - PolicyName: InstanceSchedulerPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - ec2:DescribeInstances
                - ec2:StartInstances
                - ec2:StopInstances
                - rds:DescribeDBInstances
                - rds:StartDBInstance
                - rds:StopDBInstance
                - tag:GetResources
              Resource: '*'

InstanceSchedulerFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: environment-scheduler
    Runtime: python3.11
    Handler: scheduler.handler
    Role: !GetAtt InstanceSchedulerRole.Arn
    Timeout: 300
    Environment:
      Variables:
        TIMEZONE: 'America/New_York'
    InlineCode: |
      import boto3
      import os
      from datetime import datetime
      import pytz
      
      ec2 = boto3.client('ec2')
      rds = boto3.client('rds')
      
      def handler(event, context):
          action = event.get('action', 'stop')
          timezone = pytz.timezone(os.environ.get('TIMEZONE', 'UTC'))
          current_time = datetime.now(timezone)
          
          # Find resources tagged for scheduling
          ec2_instances = ec2.describe_instances(
              Filters=[
                  {'Name': 'tag:AutoSchedule', 'Values': ['true']},
                  {'Name': 'instance-state-name', 'Values': ['running' if action == 'stop' else 'stopped']}
              ]
          )
          
          instance_ids = []
          for reservation in ec2_instances['Reservations']:
              for instance in reservation['Instances']:
                  instance_ids.append(instance['InstanceId'])
          
          if instance_ids:
              if action == 'stop':
                  ec2.stop_instances(InstanceIds=instance_ids)
                  print(f"Stopped {len(instance_ids)} EC2 instances")
              else:
                  ec2.start_instances(InstanceIds=instance_ids)
                  print(f"Started {len(instance_ids)} EC2 instances")
          
          # Handle RDS instances
          rds_instances = rds.describe_db_instances()
          for db in rds_instances['DBInstances']:
              tags = rds.list_tags_for_resource(ResourceName=db['DBInstanceArn'])
              auto_schedule = any(tag['Key'] == 'AutoSchedule' and tag['Value'] == 'true' 
                                for tag in tags['TagList'])
              
              if auto_schedule:
                  if action == 'stop' and db['DBInstanceStatus'] == 'available':
                      rds.stop_db_instance(DBInstanceIdentifier=db['DBInstanceIdentifier'])
                      print(f"Stopped RDS instance {db['DBInstanceIdentifier']}")
                  elif action == 'start' and db['DBInstanceStatus'] == 'stopped':
                      rds.start_db_instance(DBInstanceIdentifier=db['DBInstanceIdentifier'])
                      print(f"Started RDS instance {db['DBInstanceIdentifier']}")
          
          return {'statusCode': 200, 'body': f'Completed {action} action'}

# Schedule to stop resources at 7 PM weekdays
StopSchedule:
  Type: AWS::Events::Rule
  Properties:
    Name: stop-dev-resources
    Description: Stop development resources at 7 PM weekdays
    ScheduleExpression: 'cron(0 19 ? * MON-FRI *)'
    State: ENABLED
    Targets:
      - Arn: !GetAtt InstanceSchedulerFunction.Arn
        Id: StopTarget
        Input: '{"action": "stop"}'

# Schedule to start resources at 8 AM weekdays
StartSchedule:
  Type: AWS::Events::Rule
  Properties:
    Name: start-dev-resources
    Description: Start development resources at 8 AM weekdays
    ScheduleExpression: 'cron(0 8 ? * MON-FRI *)'
    State: ENABLED
    Targets:
      - Arn: !GetAtt InstanceSchedulerFunction.Arn
        Id: StartTarget
        Input: '{"action": "start"}'

# Permissions for EventBridge to invoke Lambda
StopSchedulePermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !Ref InstanceSchedulerFunction
    Action: lambda:InvokeFunction
    Principal: events.amazonaws.com
    SourceArn: !GetAtt StopSchedule.Arn

StartSchedulePermission:
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName: !Ref InstanceSchedulerFunction
    Action: lambda:InvokeFunction
    Principal: events.amazonaws.com
    SourceArn: !GetAtt StartSchedule.Arn
```

**Why This Is Sustainable:**
- Automatically stops non-production resources outside business hours
- Reduces energy consumption by ~65% for dev/test environments
- Works with both EC2 and RDS instances
- Simple tag-based configuration (AutoSchedule=true)
- Customizable schedules per timezone
- Zero cost when resources are stopped


### 3. Software and Architecture

#### Best Practices

**Optimize Code Efficiency**
- Profile applications to identify inefficient code paths
- Use efficient algorithms and data structures
- Minimize unnecessary computations and loops
- Implement caching to avoid redundant processing
- Use compiled languages for compute-intensive workloads

**Adopt Efficient Architecture Patterns**
- Use event-driven architectures to reduce polling
- Implement asynchronous processing where possible
- Use managed services to benefit from AWS optimizations
- Leverage serverless for automatic scaling and efficiency
- Implement microservices to scale components independently

**Minimize Data Movement**
- Process data close to where it's stored
- Use data compression for storage and transmission
- Implement data lifecycle policies to archive cold data
- Use incremental backups instead of full backups
- Leverage AWS services that minimize data transfer

**Optimize Development Practices**
- Use infrastructure as code to avoid manual provisioning
- Implement CI/CD pipelines for efficient deployments
- Use container images efficiently (multi-stage builds, layer caching)
- Automate testing to catch inefficiencies early
- Monitor and optimize build processes

#### Software Efficiency Patterns

**Pattern 3: Efficient Serverless Architecture**
```python
# Python example - Optimized Lambda function with caching and efficient processing
import json
import boto3
import os
from functools import lru_cache
from datetime import datetime, timedelta
import gzip
import base64

# Initialize clients outside handler for connection reuse
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
table = dynamodb.Table(os.environ['TABLE_NAME'])

# Cache configuration data to reduce DynamoDB reads
@lru_cache(maxsize=128)
def get_config(config_key):
    """Cached configuration retrieval"""
    response = table.get_item(Key={'config_key': config_key})
    return response.get('Item', {})

# Batch processing for efficiency
def process_records_batch(records):
    """Process multiple records in a single invocation"""
    results = []
    
    # Group records by type for efficient processing
    records_by_type = {}
    for record in records:
        record_type = record.get('type', 'default')
        if record_type not in records_by_type:
            records_by_type[record_type] = []
        records_by_type[record_type].append(record)
    
    # Process each type in batch
    for record_type, type_records in records_by_type.items():
        config = get_config(record_type)
        
        # Batch write to DynamoDB (up to 25 items)
        with table.batch_writer() as batch:
            for record in type_records:
                processed = process_single_record(record, config)
                batch.put_item(Item=processed)
                results.append(processed)
    
    return results

def process_single_record(record, config):
    """Efficient single record processing"""
    # Apply configuration-based transformations
    processed = {
        'id': record['id'],
        'timestamp': datetime.utcnow().isoformat(),
        'data': record.get('data', {}),
        'processed': True
    }
    
    # Apply config transformations efficiently
    if config.get('compress', False):
        # Compress large data fields
        data_str = json.dumps(processed['data'])
        if len(data_str) > 1024:  # Only compress if > 1KB
            compressed = gzip.compress(data_str.encode('utf-8'))
            processed['data'] = base64.b64encode(compressed).decode('utf-8')
            processed['compressed'] = True
    
    return processed

def lambda_handler(event, context):
    """
    Optimized Lambda handler with efficient processing
    """
    # Early return for warming invocations
    if event.get('source') == 'aws.events' and event.get('detail-type') == 'Scheduled Event':
        return {'statusCode': 200, 'body': 'Warmed'}
    
    # Extract records from event
    records = []
    if 'Records' in event:
        # SQS or SNS event
        for record in event['Records']:
            if 'body' in record:
                records.append(json.loads(record['body']))
            elif 'Sns' in record:
                records.append(json.loads(record['Sns']['Message']))
    else:
        # Direct invocation
        records = event.get('records', [event])
    
    # Process in batch for efficiency
    results = process_records_batch(records)
    
    # Return success with minimal response
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processed': len(results),
            'timestamp': datetime.utcnow().isoformat()
        })
    }
```

**Lambda Configuration for Sustainability:**
```hcl
# Terraform example - Optimized Lambda configuration
resource "aws_lambda_function" "processor" {
  function_name = "efficient-processor"
  runtime       = "python3.11"  # Latest runtime for performance improvements
  handler       = "app.lambda_handler"
  filename      = "function.zip"
  
  # Right-sized memory (also determines CPU allocation)
  memory_size = 512  # Profiled to find optimal size
  
  # Appropriate timeout
  timeout = 30  # Only as long as needed
  
  # Ephemeral storage (default 512 MB is usually sufficient)
  ephemeral_storage {
    size = 512
  }
  
  # ARM-based Graviton2 processors (better performance per watt)
  architectures = ["arm64"]
  
  # Environment variables
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.data.name
      LOG_LEVEL  = "WARN"  # Reduce logging overhead
      POWERTOOLS_SERVICE_NAME = "processor"
    }
  }
  
  # Reserved concurrency to prevent over-provisioning
  reserved_concurrent_executions = 100
  
  # Enable code signing for security and integrity
  code_signing_config_arn = aws_lambda_code_signing_config.main.arn
  
  # VPC configuration only if needed (adds cold start time)
  # vpc_config {
  #   subnet_ids         = aws_subnet.private[*].id
  #   security_group_ids = [aws_security_group.lambda.id]
  # }
}

# SQS trigger with batch processing
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = aws_sqs_queue.input.arn
  function_name    = aws_lambda_function.processor.arn
  
  # Batch size for efficient processing
  batch_size = 10
  
  # Batch window to accumulate messages
  maximum_batching_window_in_seconds = 5
  
  # Partial batch response for better error handling
  function_response_types = ["ReportBatchItemFailures"]
}
```

**Why This Is Sustainable:**
- ARM64 architecture provides better performance per watt
- Connection reuse reduces overhead
- Caching minimizes redundant database reads
- Batch processing reduces invocation count
- Compression reduces storage and data transfer
- Right-sized memory allocation optimizes resource usage
- Efficient error handling prevents wasted retries


### 4. Data Management

#### Best Practices

**Implement Data Lifecycle Policies**
- Automatically transition data to colder storage tiers
- Delete data that is no longer needed
- Use S3 Intelligent-Tiering for automatic optimization
- Archive infrequently accessed data to Glacier
- Implement retention policies based on compliance needs

**Optimize Data Storage**
- Use appropriate storage classes for access patterns
- Compress data before storage
- Deduplicate data where possible
- Use efficient file formats (Parquet, ORC for analytics)
- Minimize data replication across regions

**Reduce Data Transfer**
- Use CloudFront for content delivery
- Implement caching at multiple layers
- Process data in the region where it's stored
- Use VPC endpoints to avoid internet data transfer
- Compress data before transmission

**Backup Efficiently**
- Use incremental backups instead of full backups
- Implement backup lifecycle policies
- Use AWS Backup for centralized management
- Delete old backups that exceed retention requirements
- Use EBS snapshots efficiently (incremental by default)

#### Data Management Patterns

**Pattern 4: Intelligent Data Lifecycle Management**
```hcl
# Terraform example - Comprehensive data lifecycle strategy
# S3 bucket with Intelligent-Tiering and lifecycle policies
resource "aws_s3_bucket" "data_lake" {
  bucket = "sustainable-data-lake"
}

# Enable versioning for data protection
resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Intelligent-Tiering configuration for automatic optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  name   = "EntireDataset"
  
  status = "Enabled"
  
  # Archive access tier after 90 days of no access
  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
  
  # Deep archive after 180 days of no access
  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# Lifecycle policy for additional optimization
resource "aws_s3_bucket_lifecycle_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  
  # Rule for raw data
  rule {
    id     = "raw-data-lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "raw/"
    }
    
    # Transition to Intelligent-Tiering immediately
    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }
    
    # Delete old versions after 30 days
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER_IR"
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
  
  # Rule for processed data
  rule {
    id     = "processed-data-lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "processed/"
    }
    
    # Keep in Standard for 7 days (frequent access)
    transition {
      days          = 7
      storage_class = "INTELLIGENT_TIERING"
    }
    
    # Archive after 1 year
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
    
    # Delete after 7 years (compliance requirement)
    expiration {
      days = 2555  # 7 years
    }
  }
  
  # Rule for temporary data
  rule {
    id     = "temp-data-cleanup"
    status = "Enabled"
    
    filter {
      prefix = "temp/"
    }
    
    # Delete temporary data after 7 days
    expiration {
      days = 7
    }
  }
  
  # Rule for logs
  rule {
    id     = "log-lifecycle"
    status = "Enabled"
    
    filter {
      prefix = "logs/"
    }
    
    # Transition logs to IA after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    # Archive logs after 90 days
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
    
    # Delete logs after 1 year
    expiration {
      days = 365
    }
  }
  
  # Clean up incomplete multipart uploads
  rule {
    id     = "cleanup-incomplete-uploads"
    status = "Enabled"
    
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# EBS Data Lifecycle Manager for efficient snapshots
resource "aws_dlm_lifecycle_policy" "ebs_snapshots" {
  description        = "Sustainable EBS snapshot policy"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"
  
  policy_details {
    resource_types = ["VOLUME"]
    
    # Daily snapshots with retention
    schedule {
      name = "Daily snapshots"
      
      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["03:00"]
      }
      
      # Keep only 7 daily snapshots
      retain_rule {
        count = 7
      }
      
      tags_to_add = {
        SnapshotType = "daily"
        ManagedBy    = "DLM"
      }
      
      copy_tags = true
    }
    
    # Weekly snapshots with longer retention
    schedule {
      name = "Weekly snapshots"
      
      create_rule {
        cron_expression = "cron(0 3 ? * SUN *)"
      }
      
      # Keep 4 weekly snapshots
      retain_rule {
        count = 4
      }
      
      tags_to_add = {
        SnapshotType = "weekly"
        ManagedBy    = "DLM"
      }
      
      copy_tags = true
    }
    
    target_tags = {
      Backup = "true"
    }
  }
}

# CloudWatch Logs retention policy
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/application/sustainable-app"
  retention_in_days = 30  # Only keep logs for 30 days
  kms_key_id        = aws_kms_key.logs.arn
}

# Lambda function to compress and archive old logs
resource "aws_lambda_function" "log_archiver" {
  function_name = "log-archiver"
  runtime       = "python3.11"
  handler       = "archiver.handler"
  filename      = "log_archiver.zip"
  role          = aws_iam_role.log_archiver.arn
  
  memory_size = 512
  timeout     = 300
  
  environment {
    variables = {
      ARCHIVE_BUCKET = aws_s3_bucket.data_lake.id
      LOG_GROUP      = aws_cloudwatch_log_group.application.name
    }
  }
}

# Schedule log archival weekly
resource "aws_cloudwatch_event_rule" "log_archival" {
  name                = "weekly-log-archival"
  description         = "Archive CloudWatch Logs to S3 weekly"
  schedule_expression = "cron(0 2 ? * SUN *)"
}

resource "aws_cloudwatch_event_target" "log_archival" {
  rule      = aws_cloudwatch_event_rule.log_archival.name
  target_id = "LogArchiver"
  arn       = aws_lambda_function.log_archiver.arn
}
```

**Why This Is Sustainable:**
- Intelligent-Tiering automatically optimizes storage costs and energy
- Lifecycle policies transition data to energy-efficient storage tiers
- Old versions and temporary data deleted automatically
- Incremental EBS snapshots minimize storage and data transfer
- Compressed logs reduce storage footprint
- Retention policies prevent unnecessary data accumulation
- Automated cleanup reduces manual intervention and errors


### 5. Hardware and Services

#### Best Practices

**Use Efficient Hardware**
- Choose AWS Graviton processors for better performance per watt
- Use latest generation instances for improved efficiency
- Select instance types optimized for your workload
- Use burstable instances for variable workloads
- Consider ARM-based instances for compatible workloads

**Leverage Managed Services**
- Use managed services to benefit from AWS economies of scale
- Leverage serverless services that scale to zero
- Use managed databases instead of self-managed
- Adopt managed container services (ECS, EKS with Fargate)
- Use managed analytics services (Athena, EMR Serverless)

**Optimize Compute Selection**
- Use AWS Compute Optimizer for recommendations
- Match instance types to workload characteristics
- Use Spot Instances for fault-tolerant workloads
- Implement auto-scaling to match demand
- Consider Lambda for event-driven workloads

**Adopt Sustainable Services**
- Use services with built-in sustainability features
- Leverage AWS's renewable energy commitments
- Choose services that minimize data movement
- Use edge computing to reduce latency and energy
- Adopt services with automatic optimization

#### Hardware Efficiency Patterns

**Pattern 5: Graviton-Based Sustainable Architecture**
```hcl
# Terraform example - Graviton-optimized infrastructure
# Graviton3 instances provide up to 60% better energy efficiency
data "aws_ami" "amazon_linux_2023_arm64" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["al2023-ami-*-arm64"]
  }
  
  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# Launch template with Graviton instances
resource "aws_launch_template" "graviton_app" {
  name_prefix   = "graviton-app-"
  image_id      = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "t4g.medium"  # Graviton2-based burstable instance
  
  # Use gp3 for better efficiency
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp3"
      iops        = 3000
      throughput  = 125
      encrypted   = true
    }
  }
  
  # Instance metadata
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name         = "graviton-app"
      Architecture = "arm64"
      Sustainable  = "true"
    }
  }
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    # Install application optimized for ARM64
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    
    # Run ARM64-optimized container
    docker run -d --name app \
      --restart unless-stopped \
      -p 8080:8080 \
      myapp:arm64
  EOF
  )
}

# Auto Scaling Group with Graviton instances
resource "aws_autoscaling_group" "graviton_app" {
  name                = "graviton-app-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  
  min_size         = 2
  max_size         = 10
  desired_capacity = 2
  
  launch_template {
    id      = aws_launch_template.graviton_app.id
    version = "$Latest"
  }
  
  # Mixed instances policy for availability
  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 2
      on_demand_percentage_above_base_capacity = 20
      spot_allocation_strategy                 = "capacity-optimized"
    }
    
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.graviton_app.id
        version            = "$Latest"
      }
      
      # Multiple Graviton instance types for flexibility
      override {
        instance_type     = "t4g.medium"
        weighted_capacity = 1
      }
      
      override {
        instance_type     = "t4g.large"
        weighted_capacity = 2
      }
      
      override {
        instance_type     = "c7g.medium"  # Graviton3 for compute-intensive
        weighted_capacity = 1
      }
      
      override {
        instance_type     = "m7g.medium"  # Graviton3 for balanced workloads
        weighted_capacity = 1
      }
    }
  }
  
  tag {
    key                 = "Name"
    value               = "graviton-app"
    propagate_at_launch = true
  }
}

# RDS with Graviton for database workloads
resource "aws_db_instance" "graviton_db" {
  identifier     = "graviton-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t4g.medium"  # Graviton2-based RDS instance
  
  allocated_storage     = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  iops                  = 3000
  storage_throughput    = 125
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  multi_az = true
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = {
    Name         = "graviton-database"
    Architecture = "arm64"
    Sustainable  = "true"
  }
}

# Lambda with ARM64 for serverless workloads
resource "aws_lambda_function" "graviton_lambda" {
  function_name = "graviton-processor"
  runtime       = "python3.11"
  handler       = "app.handler"
  filename      = "function.zip"
  role          = aws_iam_role.lambda.arn
  
  memory_size = 512
  timeout     = 30
  
  # ARM64 architecture for better efficiency
  architectures = ["arm64"]
  
  environment {
    variables = {
      REGION = var.aws_region
    }
  }
  
  tags = {
    Name         = "graviton-processor"
    Architecture = "arm64"
    Sustainable  = "true"
  }
}

# ECS Fargate with Graviton for containers
resource "aws_ecs_task_definition" "graviton_task" {
  family                   = "graviton-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  
  # ARM64 architecture
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }
  
  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "myapp:arm64"
      cpu       = 512
      memory    = 1024
      essential = true
      
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "graviton-app"
        }
      }
    }
  ])
  
  tags = {
    Name         = "graviton-task"
    Architecture = "arm64"
    Sustainable  = "true"
  }
}
```

**Why This Is Sustainable:**
- Graviton processors provide up to 60% better energy efficiency
- ARM64 architecture optimized for cloud workloads
- Latest generation instances have improved performance per watt
- Mixed instances policy with Spot reduces resource waste
- Managed services (RDS, Lambda, Fargate) benefit from AWS optimizations
- gp3 storage provides better efficiency than gp2
- Multi-AZ deployment ensures availability without over-provisioning


### 6. Process and Culture

#### Best Practices

**Establish Sustainability Goals**
- Set measurable sustainability targets
- Track carbon footprint using AWS Customer Carbon Footprint Tool
- Monitor resource utilization metrics
- Report on sustainability improvements
- Align sustainability goals with business objectives

**Implement Sustainability Reviews**
- Include sustainability in architecture reviews
- Review resource utilization regularly
- Identify optimization opportunities
- Track sustainability metrics over time
- Share sustainability wins across teams

**Foster Sustainability Culture**
- Educate teams on sustainable practices
- Recognize and reward sustainability improvements
- Include sustainability in design decisions
- Make sustainability everyone's responsibility
- Share sustainability best practices

**Automate Sustainability Practices**
- Implement automated resource cleanup
- Use infrastructure as code for consistency
- Automate right-sizing recommendations
- Implement automated scaling policies
- Use AWS tools for continuous optimization

#### Sustainability Monitoring Patterns

**Pattern 6: Comprehensive Sustainability Dashboard**
```python
# Python example - Sustainability metrics collection and reporting
import boto3
import json
from datetime import datetime, timedelta
from decimal import Decimal

cloudwatch = boto3.client('cloudwatch')
ce = boto3.client('ce')
compute_optimizer = boto3.client('compute-optimizer')
s3 = boto3.client('s3')

class SustainabilityMetricsCollector:
    """Collect and report sustainability metrics"""
    
    def __init__(self, report_bucket):
        self.report_bucket = report_bucket
        self.metrics = {}
    
    def collect_compute_utilization(self):
        """Collect EC2 and Lambda utilization metrics"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7)
        
        # Get EC2 CPU utilization
        ec2_cpu = cloudwatch.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average']
        )
        
        avg_cpu = sum(dp['Average'] for dp in ec2_cpu['Datapoints']) / len(ec2_cpu['Datapoints']) if ec2_cpu['Datapoints'] else 0
        
        self.metrics['compute'] = {
            'ec2_avg_cpu_utilization': round(avg_cpu, 2),
            'ec2_efficiency_score': self._calculate_efficiency_score(avg_cpu),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def collect_storage_metrics(self):
        """Collect storage utilization and optimization metrics"""
        # Get S3 storage metrics
        s3_metrics = cloudwatch.get_metric_statistics(
            Namespace='AWS/S3',
            MetricName='BucketSizeBytes',
            StartTime=datetime.utcnow() - timedelta(days=1),
            EndTime=datetime.utcnow(),
            Period=86400,
            Statistics=['Average'],
            Dimensions=[
                {'Name': 'StorageType', 'Value': 'StandardStorage'}
            ]
        )
        
        total_storage_gb = 0
        if s3_metrics['Datapoints']:
            total_storage_bytes = s3_metrics['Datapoints'][0]['Average']
            total_storage_gb = total_storage_bytes / (1024**3)
        
        self.metrics['storage'] = {
            'total_s3_storage_gb': round(total_storage_gb, 2),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def collect_cost_metrics(self):
        """Collect cost and usage metrics"""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        # Get cost and usage
        response = ce.get_cost_and_usage(
            TimePeriod={
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            Granularity='MONTHLY',
            Metrics=['UnblendedCost', 'UsageQuantity'],
            GroupBy=[
                {'Type': 'DIMENSION', 'Key': 'SERVICE'}
            ]
        )
        
        service_costs = {}
        total_cost = 0
        
        for result in response['ResultsByTime']:
            for group in result['Groups']:
                service = group['Keys'][0]
                cost = float(group['Metrics']['UnblendedCost']['Amount'])
                service_costs[service] = round(cost, 2)
                total_cost += cost
        
        self.metrics['cost'] = {
            'total_monthly_cost': round(total_cost, 2),
            'top_services': dict(sorted(service_costs.items(), key=lambda x: x[1], reverse=True)[:5]),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def collect_optimization_opportunities(self):
        """Collect right-sizing and optimization recommendations"""
        try:
            # Get EC2 recommendations
            ec2_recommendations = compute_optimizer.get_ec2_instance_recommendations(
                maxResults=100
            )
            
            savings_opportunities = []
            total_potential_savings = 0
            
            for rec in ec2_recommendations.get('instanceRecommendations', []):
                current_type = rec['currentInstanceType']
                recommended_type = rec['recommendationOptions'][0]['instanceType']
                
                if current_type != recommended_type:
                    savings_opportunities.append({
                        'instance_id': rec['instanceArn'].split('/')[-1],
                        'current_type': current_type,
                        'recommended_type': recommended_type,
                        'reason': 'Right-sizing opportunity'
                    })
            
            self.metrics['optimization'] = {
                'rightsizing_opportunities': len(savings_opportunities),
                'opportunities': savings_opportunities[:10],  # Top 10
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error collecting optimization metrics: {e}")
            self.metrics['optimization'] = {
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _calculate_efficiency_score(self, utilization):
        """Calculate efficiency score based on utilization"""
        # Optimal utilization is 60-80%
        if 60 <= utilization <= 80:
            return 100
        elif utilization < 60:
            # Under-utilized
            return int((utilization / 60) * 100)
        else:
            # Over-utilized (potential performance issues)
            return int(100 - ((utilization - 80) / 20) * 30)
    
    def generate_report(self):
        """Generate comprehensive sustainability report"""
        # Collect all metrics
        self.collect_compute_utilization()
        self.collect_storage_metrics()
        self.collect_cost_metrics()
        self.collect_optimization_opportunities()
        
        # Generate report
        report = {
            'report_date': datetime.utcnow().isoformat(),
            'metrics': self.metrics,
            'summary': {
                'compute_efficiency': self.metrics.get('compute', {}).get('ec2_efficiency_score', 0),
                'optimization_opportunities': self.metrics.get('optimization', {}).get('rightsizing_opportunities', 0),
                'total_monthly_cost': self.metrics.get('cost', {}).get('total_monthly_cost', 0)
            },
            'recommendations': self._generate_recommendations()
        }
        
        # Save report to S3
        report_key = f"sustainability-reports/{datetime.utcnow().strftime('%Y/%m/%d')}/report.json"
        s3.put_object(
            Bucket=self.report_bucket,
            Key=report_key,
            Body=json.dumps(report, indent=2, default=str),
            ContentType='application/json'
        )
        
        return report
    
    def _generate_recommendations(self):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Compute efficiency recommendations
        compute = self.metrics.get('compute', {})
        if compute.get('ec2_efficiency_score', 100) < 70:
            recommendations.append({
                'category': 'Compute Efficiency',
                'priority': 'High',
                'recommendation': 'EC2 instances are under-utilized. Consider right-sizing or using auto-scaling.',
                'potential_impact': 'Reduce energy consumption by 20-40%'
            })
        
        # Optimization recommendations
        optimization = self.metrics.get('optimization', {})
        if optimization.get('rightsizing_opportunities', 0) > 0:
            recommendations.append({
                'category': 'Right-Sizing',
                'priority': 'High',
                'recommendation': f"Found {optimization['rightsizing_opportunities']} right-sizing opportunities.",
                'potential_impact': 'Reduce costs and energy consumption'
            })
        
        # Storage recommendations
        storage = self.metrics.get('storage', {})
        if storage.get('total_s3_storage_gb', 0) > 1000:
            recommendations.append({
                'category': 'Storage Optimization',
                'priority': 'Medium',
                'recommendation': 'Review S3 lifecycle policies to transition data to colder storage tiers.',
                'potential_impact': 'Reduce storage costs and energy by 50-70%'
            })
        
        return recommendations

def lambda_handler(event, context):
    """Lambda handler for sustainability metrics collection"""
    collector = SustainabilityMetricsCollector(
        report_bucket=os.environ['REPORT_BUCKET']
    )
    
    report = collector.generate_report()
    
    # Send notification if there are high-priority recommendations
    high_priority_recs = [r for r in report['recommendations'] if r['priority'] == 'High']
    if high_priority_recs:
        sns = boto3.client('sns')
        sns.publish(
            TopicArn=os.environ['SNS_TOPIC'],
            Subject='Sustainability Optimization Opportunities',
            Message=json.dumps({
                'message': f"Found {len(high_priority_recs)} high-priority sustainability improvements",
                'recommendations': high_priority_recs
            }, indent=2)
        )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'report_generated': True,
            'recommendations_count': len(report['recommendations'])
        })
    }
```

**CloudFormation for Sustainability Dashboard:**
```yaml
# CloudFormation example - Sustainability monitoring infrastructure
SustainabilityReportBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub '${AWS::StackName}-sustainability-reports'
    LifecycleConfiguration:
      Rules:
        - Id: ArchiveOldReports
          Status: Enabled
          Transitions:
            - TransitionInDays: 90
              StorageClass: GLACIER
          ExpirationInDays: 365

SustainabilityMetricsFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: sustainability-metrics-collector
    Runtime: python3.11
    Handler: collector.lambda_handler
    Timeout: 300
    MemorySize: 512
    Architectures:
      - arm64
    Environment:
      Variables:
        REPORT_BUCKET: !Ref SustainabilityReportBucket
        SNS_TOPIC: !Ref SustainabilityAlertTopic
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - cloudwatch:GetMetricStatistics
              - ce:GetCostAndUsage
              - compute-optimizer:GetEC2InstanceRecommendations
              - s3:PutObject
              - sns:Publish
            Resource: '*'
    Events:
      WeeklySchedule:
        Type: Schedule
        Properties:
          Schedule: 'cron(0 9 ? * MON *)'  # Every Monday at 9 AM

SustainabilityAlertTopic:
  Type: AWS::SNS::Topic
  Properties:
    TopicName: sustainability-alerts
    DisplayName: Sustainability Optimization Alerts

SustainabilityDashboard:
  Type: AWS::CloudWatch::Dashboard
  Properties:
    DashboardName: sustainability-metrics
    DashboardBody: !Sub |
      {
        "widgets": [
          {
            "type": "metric",
            "properties": {
              "title": "EC2 CPU Utilization",
              "metrics": [
                ["AWS/EC2", "CPUUtilization", {"stat": "Average"}]
              ],
              "period": 3600,
              "region": "${AWS::Region}",
              "yAxis": {
                "left": {"min": 0, "max": 100}
              }
            }
          },
          {
            "type": "metric",
            "properties": {
              "title": "Lambda Invocations",
              "metrics": [
                ["AWS/Lambda", "Invocations", {"stat": "Sum"}],
                [".", "Duration", {"stat": "Average"}]
              ],
              "period": 3600,
              "region": "${AWS::Region}"
            }
          },
          {
            "type": "metric",
            "properties": {
              "title": "S3 Storage",
              "metrics": [
                ["AWS/S3", "BucketSizeBytes", {"stat": "Average"}]
              ],
              "period": 86400,
              "region": "${AWS::Region}"
            }
          }
        ]
      }
```

**Why This Is Sustainable:**
- Automated metrics collection reduces manual effort
- Regular reporting drives continuous improvement
- Identifies optimization opportunities automatically
- Tracks sustainability progress over time
- Alerts on high-priority improvements
- Uses ARM64 Lambda for efficiency
- Archived reports reduce storage costs


## Common Sustainability Issues and Remediation

### Issue 1: Over-Provisioned Resources

**Detection**: CloudWatch metrics showing consistently low utilization (<20% CPU, <30% memory)

**Impact**: High - Wasted energy and costs from idle capacity

**Remediation**:
```hcl
# Use AWS Compute Optimizer recommendations
data "aws_compute_optimizer_recommendations" "ec2" {
  resource_type = "Ec2Instance"
}

# Implement auto-scaling instead of fixed capacity
resource "aws_autoscaling_group" "app" {
  min_size         = 2
  max_size         = 10
  desired_capacity = 2  # Start small
  
  # Target tracking to maintain optimal utilization
  target_group_arns = [aws_lb_target_group.app.arn]
}

resource "aws_autoscaling_policy" "target_tracking" {
  name                   = "maintain-optimal-utilization"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"
  
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0  # Maintain 70% utilization
  }
}
```

### Issue 2: Idle Resources Running 24/7

**Detection**: Resources tagged for development/testing running outside business hours

**Impact**: High - 65% of compute time wasted for dev/test environments

**Remediation**:
```python
# Implement automated scheduling (see Pattern 2 above)
# Tag resources with AutoSchedule=true
# Use EventBridge rules to start/stop on schedule
# Estimated savings: 65% for non-production environments
```

### Issue 3: Inefficient Data Storage

**Detection**: Large amounts of data in Standard storage class with infrequent access

**Impact**: Medium - Higher energy consumption and costs for cold data

**Remediation**:
```hcl
# Implement S3 Intelligent-Tiering
resource "aws_s3_bucket_intelligent_tiering_configuration" "auto_optimize" {
  bucket = aws_s3_bucket.data.id
  name   = "AutoOptimize"
  
  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
  
  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# Add lifecycle policies for known patterns
resource "aws_s3_bucket_lifecycle_configuration" "optimize" {
  bucket = aws_s3_bucket.data.id
  
  rule {
    id     = "transition-old-data"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }
  }
}
```

### Issue 4: Using x86 When ARM64 Would Work

**Detection**: Applications running on x86 instances without specific x86 requirements

**Impact**: Medium - Missing 20-60% energy efficiency improvement

**Remediation**:
```hcl
# Migrate to Graviton instances
resource "aws_launch_template" "graviton" {
  name_prefix   = "app-graviton-"
  image_id      = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "t4g.medium"  # Graviton2
  
  # Update application to use ARM64-compatible images
  user_data = base64encode(<<-EOF
    #!/bin/bash
    docker run -d myapp:arm64
  EOF
  )
}

# For Lambda functions
resource "aws_lambda_function" "app" {
  architectures = ["arm64"]  # Simple change, significant impact
  # ... other configuration
}
```

### Issue 5: Excessive Data Transfer Between Regions

**Detection**: High inter-region data transfer costs and volumes

**Impact**: Medium - Unnecessary energy consumption from long-distance data transfer

**Remediation**:
```hcl
# Use CloudFront for content delivery
resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "S3-origin"
  }
  
  default_cache_behavior {
    target_origin_id = "S3-origin"
    
    # Long cache TTLs reduce origin requests
    min_ttl     = 3600
    default_ttl = 86400
    max_ttl     = 31536000
    
    compress = true  # Reduce data transfer
  }
}

# Process data in the region where it's stored
resource "aws_lambda_function" "processor" {
  # Deploy in same region as data source
  function_name = "data-processor"
  
  environment {
    variables = {
      DATA_BUCKET = aws_s3_bucket.data.id  # Same region
    }
  }
}

# Use VPC endpoints to avoid internet data transfer
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  
  route_table_ids = aws_route_table.private[*].id
}
```

### Issue 6: Inefficient Container Images

**Detection**: Large container images with long pull times and high storage

**Impact**: Low-Medium - Increased storage and data transfer for deployments

**Remediation**:
```dockerfile
# Use multi-stage builds to reduce image size
FROM public.ecr.aws/docker/library/python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final stage with only runtime dependencies
FROM public.ecr.aws/docker/library/python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app.py .

# Use non-root user
RUN useradd -m appuser
USER appuser

ENV PATH=/root/.local/bin:$PATH

CMD ["python", "app.py"]
```

```hcl
# Use ECR image scanning and lifecycle policies
resource "aws_ecr_repository" "app" {
  name = "app"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep only 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
```

## Sustainability Metrics and KPIs

### Key Metrics to Track

**Resource Utilization**
- Average CPU utilization (target: 60-80%)
- Average memory utilization (target: 60-80%)
- Storage utilization by tier
- Network bandwidth utilization

**Efficiency Metrics**
- Compute efficiency score (utilization vs. capacity)
- Storage efficiency (active vs. total storage)
- Data transfer efficiency (cached vs. origin requests)
- Right-sizing opportunities identified and implemented

**Carbon Footprint**
- Total carbon emissions (use AWS Customer Carbon Footprint Tool)
- Carbon emissions per transaction/user
- Renewable energy percentage by region
- Carbon intensity trends over time

**Cost Efficiency**
- Cost per transaction
- Cost per user
- Waste reduction (idle resources eliminated)
- Savings from optimization initiatives

### Measuring Success

**Short-term Goals (3-6 months)**
- Reduce idle resources by 50%
- Implement auto-scaling for all production workloads
- Migrate 50% of workloads to Graviton
- Implement S3 lifecycle policies for all buckets

**Medium-term Goals (6-12 months)**
- Achieve 70% average resource utilization
- Reduce data transfer by 30% through caching
- Migrate 80% of compatible workloads to ARM64
- Implement automated sustainability reporting

**Long-term Goals (1-2 years)**
- Achieve carbon neutrality for cloud workloads
- Maintain 75%+ resource utilization
- Use 90%+ renewable energy regions
- Establish sustainability as core design principle

## Additional Resources

### AWS Documentation
- [AWS Well-Architected Framework - Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html)
- [AWS Customer Carbon Footprint Tool](https://aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/)
- [AWS Graviton Processors](https://aws.amazon.com/ec2/graviton/)
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/)
- [Amazon S3 Intelligent-Tiering](https://aws.amazon.com/s3/storage-classes/intelligent-tiering/)

### AWS Whitepapers
- [Sustainability Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/wellarchitected-sustainability-pillar.pdf)
- [AWS Sustainability](https://sustainability.aboutamazon.com/products-services/the-cloud)
- [The Carbon Reduction Opportunity of Moving to AWS](https://d39w7f4ix9f5s9.cloudfront.net/e3/79/42bf75c94c279c67d777f002051f/carbon-reduction-opportunity-of-moving-to-aws.pdf)

### Tools and Services
- [AWS Customer Carbon Footprint Tool](https://aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/) - Track carbon emissions
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/) - Right-sizing recommendations
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/) - Cost and usage analysis
- [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/) - Best practice recommendations
- [AWS Instance Scheduler](https://aws.amazon.com/solutions/implementations/instance-scheduler-on-aws/) - Automated start/stop
- [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) - Monitoring and metrics

### Training and Certification
- [AWS Sustainability Learning Path](https://explore.skillbuilder.aws/learn/public/learning_plan/view/1909/sustainability-learning-plan)
- [AWS Well-Architected Labs - Sustainability](https://wellarchitectedlabs.com/sustainability/)
- [Architecting for Sustainability on AWS](https://explore.skillbuilder.aws/learn/course/external/view/elearning/16638/architecting-for-sustainability-on-aws)

### Community Resources
- [AWS Architecture Blog - Sustainability](https://aws.amazon.com/blogs/architecture/category/sustainability/)
- [AWS Sustainability](https://aws.amazon.com/sustainability/)
- [AWS re:Invent Sustainability Sessions](https://www.youtube.com/results?search_query=aws+reinvent+sustainability)

## Context-Aware Sustainability Trade-Off Guidance

Sustainability is important, but the **level** and **approach** to sustainability optimization should be context-aware. While some practices (eliminating idle resources, using efficient storage) are universally beneficial, others involve trade-offs with cost, performance, and complexity. Understanding these trade-offs helps you make informed decisions that align with your business priorities.

### Context Questions for Sustainability Recommendations

Before making sustainability recommendations, gather context:

1. **Sustainability Priority**: How important is sustainability to your organization? (low, medium, high, critical)
2. **Environment Type**: Development, staging, or production?
3. **Performance Requirements**: What are your latency and throughput targets?
4. **Budget Constraints**: Tight, moderate, or flexible?
5. **Operational Maturity**: Startup, growth, or enterprise?
6. **Migration Capacity**: Can you modify code/infrastructure? (limited, moderate, extensive)
7. **Availability Requirements**: What's your SLA? (95%, 99%, 99.9%, 99.99%+)

### Trade-Off 1: Graviton (ARM64) Migration

#### Context-Dependent Graviton Adoption

**Sustainability Priority: Low, Budget: Tight**:
```
Recommendation: Graviton migration is OPTIONAL but provides cost savings.

Decision Factors:
- Graviton provides 20-40% better price/performance
- Requires ARM64-compatible code and dependencies
- Migration effort: 2-8 hours per application

Options:
1. Stay on x86 (Current State)
   - Sustainability Impact: Baseline (higher energy per compute)
   - Cost: Baseline
   - Migration Effort: $0
   - Best for: Applications with x86-specific dependencies

2. Migrate to Graviton
   - Sustainability Impact: 20-60% better energy efficiency
   - Cost: 20-40% reduction
   - Migration Effort: $500-2000 per application
   - Best for: New applications, containerized workloads, Python/Java/Node.js apps

Trade-off: Migration effort vs. ongoing cost savings and efficiency.
Recommendation: Migrate new workloads to Graviton. Evaluate existing workloads based on ROI.

ROI Calculation:
- Application running on m5.xlarge: $140/month
- Migration to m6g.xlarge: $112/month (20% savings = $28/month)
- Migration effort: 4 hours × $100/hour = $400
- Break-even: 14 months
- 3-year savings: $1,008 - $400 = $608
```

**Sustainability Priority: High, Budget: Flexible**:
```
Recommendation: Graviton migration is STRONGLY RECOMMENDED for all compatible workloads.

Aggressive Migration Strategy:
1. Migrate all new workloads to Graviton (REQUIRED)
2. Migrate existing containerized workloads (HIGH PRIORITY)
3. Migrate existing VM-based workloads (MEDIUM PRIORITY)
4. Evaluate x86-specific workloads for alternatives (LOW PRIORITY)

Benefits:
- 20-60% better energy efficiency
- 20-40% cost reduction
- Better performance per watt
- Supports sustainability goals

Investment:
- Migration effort: 2-8 hours per application
- Testing and validation: 4-16 hours per application
- Total: $1,000-4,000 per application

Trade-off: Upfront migration investment for long-term sustainability and cost benefits.
Recommendation: Prioritize Graviton migration as a strategic initiative.

Rationale: If sustainability is a priority, Graviton provides measurable impact.
Energy efficiency improvement is 20-60%, which directly reduces carbon footprint.
```

**Production, Critical Workload**:
```
Recommendation: Graviton migration requires careful validation.

Approach:
1. Validate ARM64 compatibility for all dependencies
2. Test performance in staging environment
3. Run load tests to verify performance characteristics
4. Implement gradual rollout (canary deployment)
5. Monitor performance and error rates closely

Risks:
- Potential performance differences (usually positive)
- Dependency compatibility issues
- Different CPU instruction set behavior

Mitigation:
- Comprehensive testing before production
- Gradual rollout with rollback plan
- Performance monitoring and comparison

Trade-off: Migration risk vs. sustainability and cost benefits.
Recommendation: Migrate with proper testing and gradual rollout.
```

#### Graviton Decision Matrix

| Workload Type | Sustainability Priority | Migration Effort | Recommendation | Expected Benefit |
|---------------|------------------------|------------------|----------------|------------------|
| **New Application** | Any | Low (design for ARM64) | STRONGLY RECOMMENDED | 20-40% cost, 20-60% energy |
| **Containerized App** | High | Low-Medium | RECOMMENDED | 20-40% cost, 20-60% energy |
| **Python/Java/Node.js** | Medium-High | Low-Medium | RECOMMENDED | 20-40% cost, 20-60% energy |
| **Go/Rust Application** | Medium-High | Low | STRONGLY RECOMMENDED | 20-40% cost, 20-60% energy |
| **Legacy .NET Framework** | Any | High (may not be compatible) | NOT RECOMMENDED | N/A |
| **x86-Specific Binary** | Any | Very High | NOT RECOMMENDED | N/A |

### Trade-Off 2: Right-Sizing vs. Performance Headroom

#### Context-Dependent Right-Sizing

**Development Environment**:
```
Recommendation: Aggressive right-sizing is RECOMMENDED.

Approach:
- Use smallest instance type that works
- Accept occasional performance issues
- Implement auto-shutdown during off-hours
- Use burstable instances (T3/T4g)

Benefits:
- 50-70% cost reduction
- 50-70% energy reduction
- Minimal impact (dev environment)

Trade-off: Occasional slow performance vs. significant savings.
Recommendation: Right-size aggressively. Dev performance is not critical.

Example:
- Current: m5.xlarge (4 vCPU, 16 GB) = $140/month
- Right-sized: t4g.medium (2 vCPU, 4 GB) = $28/month
- Savings: $112/month (80% reduction)
- Impact: Slower builds, acceptable for dev
```

**Production, Variable Load**:
```
Recommendation: Right-size with auto-scaling for burst capacity.

Approach:
- Right-size for average load (not peak)
- Use auto-scaling for burst capacity
- Target 60-70% average utilization
- Scale up for peak, scale down for low

Benefits:
- 30-50% cost reduction
- 30-50% energy reduction
- Maintains performance during peaks

Trade-off: Auto-scaling complexity vs. efficiency.
Recommendation: Right-size with auto-scaling (best of both worlds).

Example:
- Current: 4× m5.xlarge (always running) = $560/month
- Right-sized: 2× m5.xlarge + auto-scale to 6× = $280-420/month
- Savings: $140-280/month (25-50% reduction)
- Performance: Same or better (scales to 6× during peaks)
```

**Production, Consistent Load, Latency-Sensitive**:
```
Recommendation: Right-size conservatively with performance headroom.

Approach:
- Right-size for 80th percentile load
- Maintain 20-30% headroom for bursts
- Target 50-60% average utilization
- Monitor performance metrics closely

Benefits:
- 20-30% cost reduction
- 20-30% energy reduction
- Maintains performance SLAs

Trade-off: Some efficiency loss for performance reliability.
Recommendation: Right-size conservatively to maintain SLAs.

Example:
- Current: 4× m5.xlarge (30% utilization) = $560/month
- Right-sized: 3× m5.xlarge (40% utilization) = $420/month
- Savings: $140/month (25% reduction)
- Performance: Maintained with headroom
```

#### Right-Sizing Decision Matrix

| Environment | Load Pattern | Latency Sensitivity | Target Utilization | Auto-Scaling | Expected Savings |
|-------------|--------------|---------------------|-------------------|--------------|------------------|
| **Development** | Variable | Low | 70-80% | Optional | 50-70% |
| **Staging** | Variable | Low-Medium | 60-70% | Recommended | 40-60% |
| **Production - Internal** | Variable | Medium | 60-70% | Recommended | 30-50% |
| **Production - Customer** | Variable | High | 50-60% | Required | 20-40% |
| **Production - Critical** | Consistent | Very High | 40-50% | Required | 10-30% |

### Trade-Off 3: Multi-AZ vs. Single-AZ (Sustainability Perspective)

#### Context-Dependent Multi-AZ Decisions

**Development Environment, Sustainability Priority: High**:
```
Recommendation: Single-AZ is ACCEPTABLE for significant energy savings.

Single-AZ Configuration:
- 50% reduction in infrastructure (1 AZ instead of 2)
- 50% reduction in energy consumption
- 50% reduction in cost
- Acceptable downtime for dev/test

Trade-off: No high availability vs. 50% energy/cost savings.
Recommendation: Use Single-AZ for dev/test environments.

Sustainability Impact:
- 50% fewer servers running
- 50% less energy consumed
- 50% less cooling required
- Significant carbon footprint reduction

Cost Impact:
- Development environment: $1,000/month → $500/month
- Annual savings: $6,000
- Energy savings: ~5,000 kWh/year
```

**Production, Sustainability Priority: High, SLA: 99.9%**:
```
Recommendation: Multi-AZ is REQUIRED, but optimize within Multi-AZ.

Multi-AZ with Sustainability Optimization:
- Use Multi-AZ for availability (REQUIRED for 99.9% SLA)
- Right-size instances in each AZ
- Use auto-scaling to minimize idle capacity
- Use Graviton for better efficiency
- Implement efficient load balancing

Trade-off: Reliability requirement vs. sustainability optimization.
Recommendation: Multi-AZ is required, but optimize efficiency within that constraint.

Sustainability Optimizations:
- Right-sizing: 30% energy reduction
- Graviton migration: 40% energy reduction
- Auto-scaling: 20% energy reduction
- Combined: ~60% energy reduction vs. over-provisioned Multi-AZ

Example:
- Over-provisioned Multi-AZ: 4× m5.xlarge per AZ = 8 instances = $1,120/month
- Optimized Multi-AZ: 2× m6g.xlarge per AZ + auto-scale = $448-672/month
- Savings: $448-672/month (40-60% reduction)
- Availability: Same (99.9%+)
```

**Production, Sustainability Priority: Critical, Global Application**:
```
Recommendation: Multi-Region with sustainability-optimized regions.

Approach:
- Deploy to regions with high renewable energy (us-west-2, eu-north-1, ca-central-1)
- Use CloudFront to reduce data transfer distance
- Implement regional failover (not active-active unless required)
- Right-size and use Graviton in all regions

Trade-off: Global availability vs. energy efficiency.
Recommendation: Choose sustainable regions and optimize within them.

Sustainable Region Selection:
1. us-west-2 (Oregon): 95% renewable energy
2. eu-north-1 (Stockholm): 98% renewable energy
3. ca-central-1 (Canada): 85% renewable energy
4. eu-west-1 (Ireland): 90% renewable energy

Avoid regions with high carbon intensity:
- Regions powered primarily by coal or natural gas
- Check AWS Customer Carbon Footprint Tool for data

Sustainability Impact:
- Region selection: 30-50% carbon reduction
- Graviton + right-sizing: 40-60% energy reduction
- CloudFront caching: 20-40% data transfer reduction
- Combined: 60-80% carbon footprint reduction
```

### Trade-Off 4: Storage Optimization vs. Access Performance

#### Context-Dependent Storage Decisions

**Archival Data, Infrequent Access**:
```
Recommendation: Aggressive lifecycle policies for maximum efficiency.

Lifecycle Strategy:
- Day 0-7: S3 Standard (frequent access expected)
- Day 7-30: S3 Intelligent-Tiering (automatic optimization)
- Day 30-90: S3 Glacier Instant Retrieval (infrequent access)
- Day 90-365: S3 Glacier Flexible Retrieval (rare access)
- Day 365+: S3 Glacier Deep Archive (archival)

Benefits:
- 70-95% storage cost reduction
- 70-95% energy reduction
- Automatic optimization

Trade-off: Retrieval time vs. efficiency.
- S3 Standard: Instant access
- Glacier Instant Retrieval: Instant access, 68% cheaper
- Glacier Flexible Retrieval: 3-5 hours, 82% cheaper
- Glacier Deep Archive: 12-48 hours, 95% cheaper

Recommendation: Use aggressive lifecycle policies for archival data.

Example:
- 10 TB in S3 Standard: $230/month
- 10 TB with lifecycle policies: $50-80/month
- Savings: $150-180/month (65-78% reduction)
- Energy savings: Proportional to cost savings
```

**Active Data, Frequent Access**:
```
Recommendation: S3 Intelligent-Tiering for automatic optimization.

Approach:
- Use S3 Intelligent-Tiering for all active data
- Automatic transition to infrequent access after 30 days
- Automatic transition to archive after 90 days
- No retrieval fees, instant access

Benefits:
- 40-70% cost reduction for mixed access patterns
- 40-70% energy reduction
- Zero operational overhead
- No performance impact

Trade-off: Small monitoring fee vs. automatic optimization.
- Monitoring fee: $0.0025 per 1,000 objects
- Savings: 40-70% on storage costs
- ROI: Positive for buckets with >1,000 objects

Recommendation: Use Intelligent-Tiering for all active data (default choice).

Example:
- 5 TB mixed access data in S3 Standard: $115/month
- 5 TB in Intelligent-Tiering: $50-80/month
- Monitoring fee: $2-5/month
- Net savings: $30-63/month (26-55% reduction)
```

**High-Performance Database Storage**:
```
Recommendation: Use gp3 with right-sized IOPS and throughput.

Approach:
- Use gp3 instead of gp2 (20% cheaper, better performance)
- Right-size IOPS and throughput (don't over-provision)
- Monitor actual usage and adjust
- Use io2 only for extreme IOPS requirements

Benefits:
- 20% cost reduction (gp3 vs gp2)
- Better energy efficiency
- Predictable performance

Trade-off: Need to specify IOPS/throughput vs. automatic scaling.
Recommendation: Use gp3 with monitoring and adjustment.

Example:
- 1 TB gp2 (3,000 IOPS): $100/month
- 1 TB gp3 (3,000 IOPS, 125 MB/s): $80/month
- Savings: $20/month (20% reduction)
- Performance: Same or better
```

#### Storage Decision Matrix

| Data Type | Access Pattern | Retrieval Time | Recommended Tier | Cost vs. Standard | Energy Savings |
|-----------|----------------|----------------|------------------|-------------------|----------------|
| **Active Data** | Daily | Instant | S3 Intelligent-Tiering | 40-70% savings | 40-70% |
| **Recent Backups** | Weekly | Instant | Glacier Instant Retrieval | 68% savings | 68% |
| **Old Backups** | Monthly | 3-5 hours | Glacier Flexible Retrieval | 82% savings | 82% |
| **Archival** | Yearly | 12-48 hours | Glacier Deep Archive | 95% savings | 95% |
| **Logs (Recent)** | Daily | Instant | S3 Standard-IA | 50% savings | 50% |
| **Logs (Old)** | Rare | 3-5 hours | Glacier Flexible Retrieval | 82% savings | 82% |

### Trade-Off 5: Scheduled Shutdown vs. Always-On Availability

#### Context-Dependent Shutdown Strategies

**Development/Test Environments**:
```
Recommendation: Aggressive scheduled shutdown is STRONGLY RECOMMENDED.

Shutdown Schedule:
- Weekdays: 8 AM - 7 PM (11 hours)
- Weekends: Shut down
- Holidays: Shut down
- Total running time: 55 hours/week (33% of time)

Benefits:
- 67% cost reduction
- 67% energy reduction
- Zero impact on development (resources available during work hours)

Trade-off: No 24/7 access vs. massive savings.
Recommendation: Implement scheduled shutdown for all non-production environments.

Implementation:
- Use AWS Instance Scheduler
- Tag resources with AutoSchedule=true
- Customize schedule per team timezone
- Override for special cases (demos, testing)

Example:
- Development environment: $2,000/month (always-on)
- With scheduled shutdown: $660/month (67% savings)
- Annual savings: $16,080
- Energy savings: ~15,000 kWh/year
- Carbon reduction: ~10 metric tons CO2/year
```

**Staging Environment, Pre-Production Testing**:
```
Recommendation: Scheduled shutdown with on-demand start.

Approach:
- Default: Shut down outside business hours
- On-demand: Start for testing/demos
- Automatic shutdown after 2 hours of inactivity
- Weekend shutdown unless explicitly needed

Benefits:
- 50-60% cost reduction
- 50-60% energy reduction
- Available when needed

Trade-off: Need to start manually vs. significant savings.
Recommendation: Implement with easy start mechanism (Lambda, console, CLI).

Example:
- Staging environment: $1,500/month (always-on)
- With smart shutdown: $600-750/month (50-60% savings)
- Annual savings: $9,000-10,800
```

**Production, Internal Tools, Business Hours Usage**:
```
Recommendation: Consider scheduled scaling (not shutdown).

Approach:
- Business hours (8 AM - 6 PM): Full capacity
- Off-hours (6 PM - 8 AM): Reduced capacity (1-2 instances)
- Weekends: Minimal capacity
- Maintain availability, reduce capacity

Benefits:
- 40-50% cost reduction
- 40-50% energy reduction
- Maintains availability for off-hours access

Trade-off: Reduced off-hours performance vs. efficiency.
Recommendation: Scale down (not shut down) for internal production tools.

Example:
- Internal tool: 4 instances 24/7 = $560/month
- With scheduled scaling: 4 instances (business hours), 1 instance (off-hours) = $280-350/month
- Savings: $210-280/month (38-50% reduction)
```

**Production, Customer-Facing, 24/7 Requirement**:
```
Recommendation: Always-on is REQUIRED, but optimize efficiency.

Approach:
- Maintain 24/7 availability (REQUIRED)
- Use auto-scaling to match demand patterns
- Right-size for actual load
- Use Graviton for efficiency
- Implement efficient caching

Trade-off: 24/7 availability requirement vs. sustainability optimization.
Recommendation: Cannot shut down, but optimize within always-on constraint.

Sustainability Optimizations:
- Auto-scaling: 20-30% energy reduction
- Right-sizing: 30-40% energy reduction
- Graviton: 40-60% energy reduction
- Caching: 20-30% compute reduction
- Combined: 60-80% energy reduction vs. over-provisioned baseline

Example:
- Over-provisioned 24/7: 8 instances = $1,120/month
- Optimized 24/7: 2-6 instances (auto-scaled) + Graviton = $450-700/month
- Savings: $420-670/month (38-60% reduction)
- Availability: Same (99.9%+)
```

### Trade-Off 6: Sustainability vs. Performance Optimization

#### Context-Dependent Performance vs. Sustainability

**Startup, Sustainability Priority: Low, Performance: Critical**:
```
Recommendation: Prioritize performance, optimize sustainability where possible.

Approach:
- Use performance-optimized instances (C5, C6i)
- Over-provision for performance headroom
- Use caching aggressively
- Optimize sustainability without impacting performance

Sustainability Optimizations (No Performance Impact):
- Use Graviton (C6g) for better efficiency at same performance
- Implement scheduled shutdown for non-production
- Use S3 lifecycle policies
- Implement efficient caching (reduces compute)

Trade-off: Performance priority vs. sustainability.
Recommendation: Optimize sustainability where it doesn't impact performance.

Rationale: For startups, product-market fit and performance matter most.
Sustainability is important but secondary to business success.
```

**Enterprise, Sustainability Priority: High, Performance: Important**:
```
Recommendation: Balance performance and sustainability with data-driven decisions.

Approach:
- Set performance SLAs (e.g., p99 latency < 200ms)
- Optimize sustainability within SLA constraints
- Use performance testing to validate sustainability changes
- Make trade-offs based on business impact

Sustainability Optimizations:
1. Graviton migration (usually improves performance)
2. Right-sizing with auto-scaling (maintains performance)
3. Efficient caching (improves performance and sustainability)
4. Region selection (may impact latency slightly)

Trade-off: Slight performance impact vs. sustainability goals.
Recommendation: Optimize sustainability while maintaining SLAs.

Example Decision:
- Option A: C5.xlarge in us-east-1 (low latency, high carbon)
- Option B: C6g.xlarge in us-west-2 (5ms higher latency, 60% lower carbon)
- Decision: If 5ms is acceptable, choose Option B
```

**Regulated Industry, Sustainability Priority: Critical**:
```
Recommendation: Sustainability is a strategic priority and compliance requirement.

Approach:
- Set sustainability targets (e.g., 50% carbon reduction by 2025)
- Measure carbon footprint using AWS Customer Carbon Footprint Tool
- Optimize aggressively across all areas
- Report sustainability metrics to stakeholders

Required Optimizations:
- Migrate all workloads to Graviton (unless incompatible)
- Use regions with highest renewable energy
- Implement comprehensive lifecycle policies
- Aggressive right-sizing and auto-scaling
- Scheduled shutdown for all non-production
- Efficient data transfer and caching

Trade-off: Significant effort vs. sustainability compliance.
Recommendation: Sustainability is non-negotiable, invest accordingly.

Expected Results:
- 60-80% carbon footprint reduction
- 40-60% cost reduction
- Improved corporate sustainability metrics
- Compliance with sustainability regulations
```

### When to Prioritize Sustainability

**Prioritize Sustainability When:**

1. **Corporate Sustainability Goals**: Organization has committed to carbon neutrality or reduction targets
2. **Regulatory Requirements**: Industry regulations require sustainability reporting or targets
3. **Cost Optimization Alignment**: Sustainability improvements also reduce costs (win-win)
4. **Low Performance Impact**: Sustainability changes don't affect user experience
5. **Non-Production Environments**: Dev/test environments where availability isn't critical
6. **Long-Term Strategy**: Building sustainable practices for future growth

**Deprioritize Sustainability When:**

1. **Critical Performance Requirements**: Latency or throughput SLAs are at risk
2. **High Availability Requirements**: 99.99%+ SLA requires redundancy over efficiency
3. **Startup Phase**: Product-market fit and growth are primary focus
4. **Tight Deadlines**: Immediate delivery is more important than optimization
5. **Legacy Systems**: Migration effort outweighs sustainability benefits
6. **Compliance Conflicts**: Other compliance requirements take precedence

### Sustainability Decision Framework

Use this framework to make sustainability trade-off decisions:

```
1. Identify the sustainability opportunity
   - What optimization is possible?
   - What's the energy/carbon impact?

2. Assess the trade-offs
   - Cost impact (positive or negative?)
   - Performance impact (acceptable?)
   - Complexity impact (manageable?)
   - Availability impact (acceptable?)

3. Consider the context
   - Environment type (dev/staging/prod?)
   - Sustainability priority (low/medium/high?)
   - Performance requirements (flexible/strict?)
   - Budget constraints (tight/flexible?)

4. Calculate the ROI
   - Energy savings (kWh/year)
   - Cost savings ($/month)
   - Carbon reduction (metric tons CO2/year)
   - Implementation effort (hours)

5. Make the decision
   - If ROI is positive and trade-offs are acceptable: IMPLEMENT
   - If ROI is positive but trade-offs are significant: EVALUATE
   - If ROI is negative or trade-offs are unacceptable: SKIP

6. Document the decision
   - Record the rationale
   - Track the impact
   - Review periodically
```

### Example Trade-Off Decisions

**Example 1: Graviton Migration for Web Application**
```
Opportunity: Migrate web application from m5.xlarge to m6g.xlarge
Energy Impact: 40% reduction
Cost Impact: $28/month savings
Performance Impact: Same or better
Complexity: 4 hours migration + 4 hours testing
ROI: Break-even in 14 months, $1,008 savings over 3 years

Context:
- Environment: Production
- Sustainability Priority: Medium
- Performance: Important (web application)
- Budget: Moderate

Decision: IMPLEMENT
Rationale: Positive ROI, no performance impact, reasonable effort
```

**Example 2: Scheduled Shutdown for Development Environment**
```
Opportunity: Shut down dev environment outside business hours (8 PM - 8 AM, weekends)
Energy Impact: 67% reduction
Cost Impact: $1,340/month savings
Performance Impact: None (not used outside business hours)
Complexity: 2 hours setup
ROI: Immediate, $16,080/year savings

Context:
- Environment: Development
- Sustainability Priority: Any
- Performance: Not critical
- Budget: Any

Decision: STRONGLY RECOMMENDED
Rationale: Massive savings, zero downside, minimal effort
```

**Example 3: Region Migration for Sustainability**
```
Opportunity: Migrate from us-east-1 to us-west-2 (95% renewable energy)
Energy Impact: 40% carbon reduction
Cost Impact: Neutral (same pricing)
Performance Impact: +5ms latency for East Coast users
Complexity: 40 hours migration + testing
ROI: Carbon reduction only, no cost savings

Context:
- Environment: Production
- Sustainability Priority: High
- Performance: Latency-sensitive (p99 < 100ms)
- Budget: Flexible

Decision: EVALUATE
Rationale: Significant carbon reduction, but 5ms latency impact may affect user experience
Recommendation: Test with real users, measure impact, decide based on data
```

## Summary

The Sustainability Pillar helps you minimize the environmental impact of your cloud workloads. By implementing the best practices in this guide, you can:

- **Reduce energy consumption** by right-sizing resources and eliminating idle capacity
- **Optimize resource utilization** through auto-scaling and efficient architectures
- **Minimize data movement** with edge computing and regional processing
- **Use efficient hardware** like AWS Graviton processors for better performance per watt
- **Implement lifecycle policies** to transition data to energy-efficient storage tiers
- **Track and improve** sustainability metrics over time

Remember: Sustainability is not just about reducing costs—it's about minimizing environmental impact while maintaining performance and reliability. Every optimization contributes to a more sustainable future.

Key principles to follow:
1. **Measure first** - Use AWS Customer Carbon Footprint Tool to understand your impact
2. **Right-size everything** - Match capacity to actual demand
3. **Choose efficient hardware** - Use Graviton processors and latest generation instances
4. **Automate optimization** - Implement auto-scaling, scheduling, and lifecycle policies
5. **Continuous improvement** - Regularly review and optimize your workloads

Start with quick wins like implementing auto-scaling and scheduled shutdowns for non-production environments, then progress to more advanced optimizations like migrating to Graviton and implementing comprehensive data lifecycle management.


---

## Mode-Aware Guidance for Sustainability Reviews

This section guides Kiro on how to adapt Sustainability Pillar reviews based on the current review mode.

### Simple Mode - Sustainability Reviews

**Token Budget:** 17-25K | **Latency:** 2.5-6s | **Use:** CI/CD, quick checks, dev reviews

**What to Include:**
- Direct sustainability violation identification (oversized instances, inefficient regions, no auto-scaling)
- Prescriptive recommendations without trade-off discussion
- Standard risk levels: High (significant waste), Medium (moderate inefficiency), Low (minor improvements)
- Code examples showing fixes

**What to EXCLUDE:**
- Context questions about sustainability goals, carbon footprint targets, or business priorities
- Trade-off discussions (sustainability vs. cost, sustainability vs. performance)
- Alternative approaches or decision matrices

**Example Output:**
```
⚠️ MEDIUM RISK: Instance running in high-carbon region (us-east-1)
Location: compute.tf:23
Recommendation: Consider migrating to low-carbon region (eu-west-1, ca-central-1)
Benefit: 50-70% reduction in carbon footprint
```

### Context-Aware Mode - Sustainability Reviews

**Token Budget:** 35-50K | **Latency:** 4-8s | **Use:** Interactive sessions, production reviews

**What to Include:**
- Context questions (3-5): Sustainability goals, latency requirements, data residency constraints, budget priorities
- Conditional recommendations based on context
- Trade-off explanations (sustainability vs. latency, sustainability vs. cost)
- Carbon footprint estimates for key recommendations
- Alternative approaches with pros/cons

**Example Output:**
```
⚠️ CONTEXT-DEPENDENT: Workload running in high-carbon region

Context Questions:
- Do you have sustainability goals? (carbon neutral target/general efficiency/no specific goals)
- What are your latency requirements? (strict <50ms/moderate <200ms/flexible)
- Any data residency constraints? (yes/no)

Conditional Guidance:
- FOR flexible latency + sustainability goals: Low-carbon region RECOMMENDED
  - Carbon reduction: 50-70%
  - Latency impact: +20-50ms (acceptable for many workloads)
  - Cost: Similar or lower (renewable energy regions often cheaper)
  
- FOR strict latency requirements: Current region acceptable
  - Trade-off: Lower latency vs. higher carbon footprint
  - Alternative: Optimize resource utilization in current region

Recommendation: Based on latency requirements and sustainability goals, choose appropriate region.
```

### Full Analysis Mode - Sustainability Reviews

**Token Budget:** 70-95K | **Latency:** 5-10s | **Use:** Major decisions, sustainability planning

**What to Include:**
- Comprehensive context gathering (10+ questions including carbon targets, ESG reporting needs, customer expectations)
- Decision matrices comparing 3-5 sustainability approaches
- Quantitative carbon footprint analysis with reduction estimates
- Multi-pillar impact analysis (sustainability vs. cost vs. performance vs. reliability)
- Scenario matching (startup/growth/enterprise sustainability maturity)
- Long-term sustainability roadmap and ESG reporting implications
- Phased implementation approach

**Example Output:**
```
🔍 COMPREHENSIVE ANALYSIS: Sustainability Optimization Strategy

Decision Matrix: Region and Resource Options
| Option | Carbon | Cost | Latency | Reliability | Best For |
|--------|--------|------|---------|-------------|----------|
| Current (us-east-1) | High | $$ | 20ms | ⭐⭐⭐⭐⭐ | Strict latency |
| Low-carbon (eu-west-1) | Low | $ | 70ms | ⭐⭐⭐⭐ | Sustainability focus |
| Hybrid (multi-region) | Medium | $$$ | 20ms | ⭐⭐⭐⭐⭐ | Global + sustainable |
| Graviton + low-carbon | Very Low | $ | 70ms | ⭐⭐⭐⭐ | Max sustainability |

Recommended: Graviton instances in low-carbon region

Carbon Footprint Analysis:
- Current: 1000 kg CO2e/month
- Proposed: 250 kg CO2e/month (75% reduction)
- Cost: $500/month → $400/month (20% savings)
- Latency: 20ms → 70ms (+50ms)
- Acceptable for: Non-real-time workloads

Cost-Benefit Analysis:
- Carbon reduction: 750 kg CO2e/month (9 tons/year)
- Cost savings: $100/month ($1,200/year)
- ESG benefit: Supports carbon neutral goals
- Customer appeal: Sustainability-conscious customers

[Detailed pillar impact analysis, trade-off scenarios, implementation roadmap]
```

### Mode Selection

**Simple Mode:** CI/CD, dev files, "quick review"
**Context-Aware Mode:** Production files, interactive sessions, "review with context"
**Full Analysis Mode:** Explicit request for "full analysis", sustainability planning

### Best Practices by Mode

**Simple Mode:** Focus on clear inefficiencies, prescriptive fixes, no context questions
**Context-Aware Mode:** Ask 3-5 context questions, explain trade-offs, provide alternatives
**Full Analysis Mode:** Comprehensive analysis, decision matrices, carbon footprint calculations, roadmap

### Common Scenarios by Mode

**High-Carbon Region:**
- Simple: "Consider migrating to low-carbon region (eu-west-1, ca-central-1)"
- Context-Aware: "For flexible latency, low-carbon region reduces carbon by 50-70%. For strict latency, optimize current region"
- Full Analysis: "[Decision matrix comparing regions with carbon footprint, cost, latency, and ESG implications]"

**Oversized Instances:**
- Simple: "Right-size to t3.medium for 60% energy reduction"
- Context-Aware: "For 10% CPU usage, t3.medium sufficient (60% energy savings). For variable load, use auto-scaling"
- Full Analysis: "[Decision matrix comparing instance types and Graviton with carbon footprint, cost, performance]"

**No Auto-Scaling:**
- Simple: "Enable auto-scaling to reduce waste during off-peak hours"
- Context-Aware: "For variable traffic, auto-scaling reduces energy waste by 40-60%. For steady traffic, right-size fixed capacity"
- Full Analysis: "[Decision matrix comparing scaling strategies with carbon footprint, cost, and operational complexity]"

### Sustainability-Specific Guidance

**Key Sustainability Metrics:**
- Carbon footprint (kg CO2e/month)
- Energy efficiency (compute per watt)
- Resource utilization (% of provisioned capacity used)
- Waste reduction (unused resources eliminated)

**Low-Carbon AWS Regions (as of 2024):**
- eu-west-1 (Ireland) - 100% renewable energy
- ca-central-1 (Canada) - 100% renewable energy
- us-west-2 (Oregon) - 95% renewable energy
- eu-north-1 (Stockholm) - 100% renewable energy

**Sustainability Best Practices:**
- Use Graviton instances (20% better energy efficiency)
- Enable auto-scaling to match demand
- Right-size instances based on actual usage
- Use serverless for variable workloads
- Choose low-carbon regions when latency permits
- Implement data lifecycle policies to reduce storage waste
- Use spot instances for fault-tolerant workloads (utilize spare capacity)

### Summary

Mode-aware sustainability reviews ensure that Kiro provides the right level of detail for each situation:

- **Simple Mode:** Fast, prescriptive, no context - perfect for CI/CD and quick checks
- **Context-Aware Mode:** Balanced, conditional, with context - ideal for interactive production reviews
- **Full Analysis Mode:** Comprehensive, detailed, with matrices - best for major architecture decisions and sustainability planning

Always announce the mode at the start of a review and allow users to switch modes if they need more or less detail. Preserve context when switching modes to avoid re-asking questions.
