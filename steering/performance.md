# Performance Efficiency Pillar - AWS Well-Architected Framework

## Overview

The Performance Efficiency Pillar focuses on using computing resources efficiently to meet system requirements and maintaining that efficiency as demand changes and technologies evolve. Performance efficiency is about selecting the right resource types and sizes based on workload requirements, monitoring performance, and making informed decisions to maintain efficiency as business needs evolve.

### Core Performance Efficiency Principles

1. **Democratize advanced technologies**: Use managed services to reduce operational burden and leverage advanced technologies
2. **Go global in minutes**: Deploy systems in multiple regions to provide lower latency and better experience for customers
3. **Use serverless architectures**: Remove operational burden of managing servers and benefit from automatic scaling
4. **Experiment more often**: Use virtual resources to quickly test different configurations and instance types
5. **Consider mechanical sympathy**: Understand how cloud services work and use the approach that best aligns with your goals

## Performance Efficiency Design Areas

### 1. Selection

#### Best Practices

**Evaluate Available Services and Features**
- Use managed services to reduce operational overhead
- Leverage purpose-built services for specific workloads
- Consider serverless options for variable workloads
- Use the latest generation instance types
- Evaluate specialized hardware (Graviton, GPU, FPGA)

**Choose the Right Compute Solution**
- Match instance types to workload characteristics
- Use compute-optimized instances for CPU-intensive workloads
- Use memory-optimized instances for in-memory databases
- Use accelerated computing for ML and graphics workloads
- Consider containers and serverless for modern applications

**Select Appropriate Storage Solutions**
- Use EBS for block storage with appropriate volume types
- Use S3 for object storage with appropriate storage classes
- Use EFS for shared file systems
- Use FSx for specialized file systems (Windows, Lustre, NetApp)
- Match storage performance to workload requirements

**Choose the Right Database Solution**
- Use purpose-built databases for specific use cases
- Use RDS for relational workloads
- Use DynamoDB for key-value and document workloads
- Use ElastiCache for caching and session management
- Use specialized databases (Neptune, Timestream, QLDB)

**Configure Networking for Performance**
- Use placement groups for low-latency communication
- Enable enhanced networking for higher bandwidth
- Use VPC endpoints to reduce latency and costs
- Consider AWS Global Accelerator for global applications
- Use CloudFront for content delivery


#### Compute Selection Patterns

**Pattern 1: Right-Sized EC2 Instances with Auto Scaling**
```hcl
# Terraform example - Performance-optimized compute configuration
data "aws_ec2_instance_type_offerings" "available" {
  filter {
    name   = "instance-type"
    values = ["c6i.*", "c6a.*", "c7g.*"]  # Latest generation compute-optimized
  }

  location_type = "availability-zone"
}

# Launch template with latest generation instance
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "c6i.xlarge"  # Compute-optimized for CPU-intensive workloads

  # Enable enhanced networking
  network_interfaces {
    associate_public_ip_address = false
    delete_on_termination       = true
    device_index                = 0
    security_groups             = [aws_security_group.app.id]
    
    # Enable ENA for enhanced networking (up to 100 Gbps)
    interface_type = "efa"  # Elastic Fabric Adapter for HPC workloads
  }

  # EBS optimization for better storage performance
  ebs_optimized = true

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = 100
      volume_type           = "gp3"  # Latest generation, better price/performance
      iops                  = 3000   # Baseline IOPS
      throughput            = 125    # MB/s
      delete_on_termination = true
      encrypted             = true
    }
  }

  # Instance metadata service v2 (IMDSv2) for security
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }

  # User data for performance tuning
  user_data = base64encode(<<-EOF
    #!/bin/bash
    # Enable TCP BBR congestion control for better network performance
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    
    # Increase file descriptor limits
    echo "* soft nofile 65536" >> /etc/security/limits.conf
    echo "* hard nofile 65536" >> /etc/security/limits.conf
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "app-instance"
      Environment = "production"
    }
  }
}

# Auto Scaling with target tracking for optimal performance
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = 2
  max_size         = 20
  desired_capacity = 4

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Warm pool for faster scaling
  warm_pool {
    pool_state                  = "Stopped"
    min_size                    = 2
    max_group_prepared_capacity = 10
  }

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }
}

# Target tracking scaling policy - scale based on CPU
resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0  # Maintain 70% CPU utilization
  }
}

# Target tracking scaling policy - scale based on request count
resource "aws_autoscaling_policy" "request_count_target" {
  name                   = "request-count-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.app.arn_suffix}/${aws_lb_target_group.app.arn_suffix}"
    }
    target_value = 1000.0  # 1000 requests per target
  }
}
```

**Why This Is Performant:**
- Latest generation compute-optimized instances (c6i) provide better price/performance
- Enhanced networking (ENA) provides up to 100 Gbps bandwidth
- EBS optimization ensures dedicated bandwidth for storage
- gp3 volumes offer better performance at lower cost than gp2
- TCP BBR congestion control improves network throughput
- Warm pool enables faster scaling response
- Target tracking automatically adjusts capacity based on demand
- Multiple scaling metrics ensure optimal resource utilization


**Pattern 2: Serverless Architecture for Variable Workloads**
```yaml
# CloudFormation example - High-performance serverless API
ApiFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: high-performance-api
    Runtime: python3.11
    Handler: app.handler
    MemorySize: 1769  # 1 vCPU allocated at 1769 MB
    Timeout: 29
    
    # Provisioned concurrency for consistent performance
    ProvisionedConcurrencyConfig:
      ProvisionedConcurrentExecutions: 10
    
    # Reserved concurrency to prevent throttling
    ReservedConcurrentExecutions: 100
    
    # Ephemeral storage for temporary files
    EphemeralStorage:
      Size: 1024  # MB
    
    # Environment variables
    Environment:
      Variables:
        CACHE_ENDPOINT: !GetAtt CacheCluster.RedisEndpoint.Address
        TABLE_NAME: !Ref DataTable
        POWERTOOLS_SERVICE_NAME: api
        POWERTOOLS_METRICS_NAMESPACE: MyApp
        LOG_LEVEL: INFO
    
    # VPC configuration for accessing ElastiCache
    VpcConfig:
      SecurityGroupIds:
        - !Ref LambdaSecurityGroup
      SubnetIds: !Ref PrivateSubnets
    
    # Tracing for performance analysis
    Tracing: Active
    
    # Layers for shared dependencies
    Layers:
      - !Ref DependenciesLayer
      - arn:aws:lambda:us-east-1:017000801446:layer:AWSLambdaPowertoolsPythonV2:42

# API Gateway with caching
ApiGateway:
  Type: AWS::Serverless::Api
  Properties:
    StageName: prod
    
    # Enable caching for better performance
    CacheClusterEnabled: true
    CacheClusterSize: '0.5'  # GB
    
    # Method settings for caching
    MethodSettings:
      - ResourcePath: /items
        HttpMethod: GET
        CachingEnabled: true
        CacheTtlInSeconds: 300
        CacheDataEncrypted: true
    
    # Throttling settings
    ThrottleSettings:
      BurstLimit: 5000
      RateLimit: 2000
    
    # Enable X-Ray tracing
    TracingEnabled: true

# DynamoDB with on-demand scaling
DataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: app-data
    BillingMode: PAY_PER_REQUEST  # On-demand for variable workloads
    
    AttributeDefinitions:
      - AttributeName: pk
        AttributeType: S
      - AttributeName: sk
        AttributeType: S
      - AttributeName: gsi1pk
        AttributeType: S
    
    KeySchema:
      - AttributeName: pk
        KeyType: HASH
      - AttributeName: sk
        KeyType: RANGE
    
    # Global Secondary Index for query patterns
    GlobalSecondaryIndexes:
      - IndexName: GSI1
        KeySchema:
          - AttributeName: gsi1pk
            KeyType: HASH
          - AttributeName: sk
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
    
    # Point-in-time recovery
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    
    # DynamoDB Streams for change data capture
    StreamSpecification:
      StreamViewType: NEW_AND_OLD_IMAGES
    
    # Table class for cost optimization
    TableClass: STANDARD

# ElastiCache for caching
CacheCluster:
  Type: AWS::ElastiCache::CacheCluster
  Properties:
    CacheNodeType: cache.r6g.large  # Graviton2 for better price/performance
    Engine: redis
    EngineVersion: 7.0
    NumCacheNodes: 1
    VpcSecurityGroupIds:
      - !Ref CacheSecurityGroup
    CacheSubnetGroupName: !Ref CacheSubnetGroup
```

**Why This Is Performant:**
- Lambda with 1769 MB gets 1 full vCPU for optimal performance
- Provisioned concurrency eliminates cold starts for consistent latency
- API Gateway caching reduces backend load and improves response times
- DynamoDB on-demand scaling handles variable traffic automatically
- ElastiCache with Graviton2 provides better price/performance
- X-Ray tracing enables performance bottleneck identification
- VPC configuration allows Lambda to access ElastiCache with low latency


#### Storage Selection Patterns

**Pattern 3: High-Performance Storage Configuration**
```hcl
# Terraform example - Optimized storage for different workload types

# High-performance database storage with io2 Block Express
resource "aws_ebs_volume" "database" {
  availability_zone = "us-east-1a"
  size              = 1000  # GB
  type              = "io2"
  iops              = 64000  # Maximum IOPS for io2
  throughput        = 1000   # MB/s
  encrypted         = true
  kms_key_id        = aws_kms_key.ebs.arn

  tags = {
    Name        = "database-volume"
    Workload    = "database"
    Performance = "high"
  }
}

# General purpose storage with gp3
resource "aws_ebs_volume" "application" {
  availability_zone = "us-east-1a"
  size              = 500
  type              = "gp3"
  iops              = 16000  # Up to 16,000 IOPS
  throughput        = 1000   # Up to 1,000 MB/s
  encrypted         = true

  tags = {
    Name     = "application-volume"
    Workload = "application"
  }
}

# S3 bucket with intelligent tiering and transfer acceleration
resource "aws_s3_bucket" "data" {
  bucket = "high-performance-data-bucket"
}

resource "aws_s3_bucket_accelerate_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  status = "Enabled"  # Transfer Acceleration for faster uploads
}

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

# CloudFront distribution for S3 content delivery
resource "aws_cloudfront_distribution" "data" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"  # HTTP/3 for better performance
  price_class         = "PriceClass_All"
  
  origin {
    domain_name              = aws_s3_bucket.data.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.data.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.data.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.data.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true  # Enable compression
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }
}

# EFS with performance mode for shared file system
resource "aws_efs_file_system" "shared" {
  creation_token = "shared-file-system"
  
  # Performance mode
  performance_mode = "maxIO"  # For workloads with high aggregate throughput
  
  # Throughput mode
  throughput_mode = "elastic"  # Automatically scales throughput
  
  # Encryption
  encrypted  = true
  kms_key_id = aws_kms_key.efs.arn

  # Lifecycle management
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  lifecycle_policy {
    transition_to_primary_storage_class = "AFTER_1_ACCESS"
  }

  tags = {
    Name = "shared-efs"
  }
}

# EFS mount targets in multiple AZs
resource "aws_efs_mount_target" "shared" {
  count           = length(aws_subnet.private_app)
  file_system_id  = aws_efs_file_system.shared.id
  subnet_id       = aws_subnet.private_app[count.index].id
  security_groups = [aws_security_group.efs.id]
}
```

**Why This Is Performant:**
- io2 volumes provide up to 64,000 IOPS and 1,000 MB/s for databases
- gp3 volumes offer better price/performance than gp2 with configurable IOPS
- S3 Transfer Acceleration speeds up uploads by up to 50-500%
- CloudFront with HTTP/3 reduces latency for global users
- Compression reduces data transfer and improves load times
- EFS with maxIO performance mode handles high aggregate throughput
- Elastic throughput automatically scales based on workload needs
- Multi-AZ mount targets provide low-latency access from any AZ


#### Database Selection Patterns

**Pattern 4: High-Performance Database Configuration**
```yaml
# CloudFormation example - Performance-optimized RDS and DynamoDB

# RDS with read replicas and Performance Insights
DatabaseInstance:
  Type: AWS::RDS::DBInstance
  Properties:
    DBInstanceIdentifier: high-performance-db
    Engine: postgres
    EngineVersion: '15.4'
    DBInstanceClass: db.r6g.2xlarge  # Graviton2 memory-optimized
    
    # Storage configuration
    AllocatedStorage: 1000
    MaxAllocatedStorage: 5000  # Auto-scaling storage
    StorageType: io1
    Iops: 10000
    StorageEncrypted: true
    
    # Network configuration
    DBSubnetGroupName: !Ref DBSubnetGroup
    VPCSecurityGroups:
      - !Ref DatabaseSecurityGroup
    PubliclyAccessible: false
    
    # High availability
    MultiAZ: true
    
    # Backup configuration
    BackupRetentionPeriod: 30
    PreferredBackupWindow: '03:00-04:00'
    PreferredMaintenanceWindow: 'mon:04:00-mon:05:00'
    
    # Performance monitoring
    EnablePerformanceInsights: true
    PerformanceInsightsRetentionPeriod: 7
    MonitoringInterval: 1  # Enhanced monitoring every second
    MonitoringRoleArn: !GetAtt MonitoringRole.Arn
    
    # CloudWatch Logs
    EnableCloudwatchLogsExports:
      - postgresql
      - upgrade
    
    # Parameter group for performance tuning
    DBParameterGroupName: !Ref DBParameterGroup

# Parameter group with performance optimizations
DBParameterGroup:
  Type: AWS::RDS::DBParameterGroup
  Properties:
    Description: Performance-optimized PostgreSQL parameters
    Family: postgres15
    Parameters:
      # Memory settings
      shared_buffers: '{DBInstanceClassMemory/4096}'  # 25% of RAM
      effective_cache_size: '{DBInstanceClassMemory*3/4096}'  # 75% of RAM
      
      # Connection settings
      max_connections: '500'
      
      # Query planning
      random_page_cost: '1.1'  # For SSD storage
      effective_io_concurrency: '200'  # For SSD storage
      
      # Write performance
      wal_buffers: '16MB'
      checkpoint_completion_target: '0.9'
      
      # Maintenance
      maintenance_work_mem: '2GB'
      autovacuum_max_workers: '4'

# Read replica for read-heavy workloads
DatabaseReadReplica:
  Type: AWS::RDS::DBInstance
  Properties:
    SourceDBInstanceIdentifier: !Ref DatabaseInstance
    DBInstanceClass: db.r6g.2xlarge
    PubliclyAccessible: false
    EnablePerformanceInsights: true
    PerformanceInsightsRetentionPeriod: 7

# DynamoDB with DAX for caching
DynamoDBTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: high-performance-table
    BillingMode: PROVISIONED
    
    # Provisioned capacity with auto-scaling
    ProvisionedThroughput:
      ReadCapacityUnits: 1000
      WriteCapacityUnits: 500
    
    AttributeDefinitions:
      - AttributeName: pk
        AttributeType: S
      - AttributeName: sk
        AttributeType: S
    
    KeySchema:
      - AttributeName: pk
        KeyType: HASH
      - AttributeName: sk
        KeyType: RANGE
    
    # Enable DynamoDB Streams
    StreamSpecification:
      StreamViewType: NEW_AND_OLD_IMAGES
    
    # Point-in-time recovery
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true

# Auto-scaling for DynamoDB read capacity
ReadCapacityScalableTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    ServiceNamespace: dynamodb
    ResourceId: !Sub 'table/${DynamoDBTable}'
    ScalableDimension: dynamodb:table:ReadCapacityUnits
    MinCapacity: 100
    MaxCapacity: 10000
    RoleARN: !GetAtt AutoScalingRole.Arn

ReadCapacityScalingPolicy:
  Type: AWS::ApplicationAutoScaling::ScalingPolicy
  Properties:
    PolicyName: ReadAutoScalingPolicy
    PolicyType: TargetTrackingScaling
    ScalingTargetId: !Ref ReadCapacityScalableTarget
    TargetTrackingScalingPolicyConfiguration:
      TargetValue: 70.0
      PredefinedMetricSpecification:
        PredefinedMetricType: DynamoDBReadCapacityUtilization

# DAX cluster for microsecond latency
DAXCluster:
  Type: AWS::DAX::Cluster
  Properties:
    ClusterName: high-performance-dax
    NodeType: dax.r5.large
    ReplicationFactor: 3  # Multi-AZ for high availability
    IAMRoleARN: !GetAtt DAXRole.Arn
    SubnetGroupName: !Ref DAXSubnetGroup
    SecurityGroupIds:
      - !Ref DAXSecurityGroup
    
    # Parameter group for performance tuning
    ParameterGroupName: !Ref DAXParameterGroup

DAXParameterGroup:
  Type: AWS::DAX::ParameterGroup
  Properties:
    ParameterGroupName: performance-optimized
    Description: Performance-optimized DAX parameters
    ParameterNameValues:
      query-ttl-millis: '300000'  # 5 minutes
      record-ttl-millis: '300000'  # 5 minutes
```

**Why This Is Performant:**
- Graviton2 instances (r6g) provide up to 40% better price/performance
- io1 storage with 10,000 IOPS for consistent database performance
- Performance Insights enables query-level performance analysis
- Enhanced monitoring provides second-level granularity
- Read replicas offload read traffic from primary database
- Optimized PostgreSQL parameters for SSD storage and memory usage
- DynamoDB auto-scaling adjusts capacity based on demand
- DAX provides microsecond read latency (vs milliseconds for DynamoDB)
- Multi-AZ DAX cluster ensures high availability


### 2. Review

#### Best Practices

**Monitor Performance Metrics**
- Collect metrics for all components (compute, storage, database, network)
- Use CloudWatch for centralized monitoring
- Set up alarms for performance degradation
- Monitor business metrics alongside technical metrics
- Use CloudWatch Logs Insights for log analysis

**Analyze Performance Data**
- Use CloudWatch Insights for metric analysis
- Implement distributed tracing with X-Ray
- Use Performance Insights for database query analysis
- Analyze cost and performance trade-offs
- Identify performance bottlenecks

**Conduct Performance Testing**
- Load test before production deployment
- Test at expected peak load and beyond
- Use realistic test data and scenarios
- Test failure scenarios and recovery
- Continuously test in production with canary deployments

#### Performance Monitoring Patterns

**Pattern 5: Comprehensive Performance Monitoring**
```hcl
# Terraform example - Complete performance monitoring stack

# CloudWatch dashboard for performance metrics
resource "aws_cloudwatch_dashboard" "performance" {
  dashboard_name = "application-performance"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average", label = "Avg Response Time" }],
            ["...", { stat = "p99", label = "P99 Response Time" }],
            [".", "RequestCount", { stat = "Sum", label = "Request Count" }],
            [".", "HTTPCode_Target_5XX_Count", { stat = "Sum", label = "5XX Errors" }],
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Application Load Balancer Performance"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", { stat = "Average" }],
            [".", "NetworkIn", { stat = "Sum" }],
            [".", "NetworkOut", { stat = "Sum" }],
            ["AWS/EBS", "VolumeReadOps", { stat = "Sum" }],
            [".", "VolumeWriteOps", { stat = "Sum" }],
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Compute and Storage Performance"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", { stat = "Average" }],
            [".", "ReadLatency", { stat = "Average" }],
            [".", "WriteLatency", { stat = "Average" }],
            [".", "ReadThroughput", { stat = "Average" }],
            [".", "WriteThroughput", { stat = "Average" }],
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Database Performance"
        }
      }
    ]
  })
}

# Performance alarm for high latency
resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0.5  # 500ms
  alarm_description   = "Alert when average response time exceeds 500ms"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  alarm_actions = [aws_sns_topic.performance_alerts.arn]
}

# Composite alarm for overall performance health
resource "aws_cloudwatch_composite_alarm" "performance_health" {
  alarm_name          = "application-performance-health"
  alarm_description   = "Overall application performance health"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]

  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.high_latency.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.high_error_rate.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.database_latency.alarm_name})",
  ])
}

# X-Ray sampling rule for performance tracing
resource "aws_xray_sampling_rule" "performance" {
  rule_name      = "performance-sampling"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.05  # Sample 5% of requests
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {
    Environment = "production"
  }
}

# CloudWatch Logs Insights query for performance analysis
resource "aws_cloudwatch_query_definition" "slow_requests" {
  name = "Slow API Requests"

  log_group_names = [
    aws_cloudwatch_log_group.application.name
  ]

  query_string = <<-QUERY
    fields @timestamp, @message, duration, endpoint, statusCode
    | filter duration > 1000
    | sort duration desc
    | limit 100
  QUERY
}

# Lambda function for automated performance analysis
resource "aws_lambda_function" "performance_analyzer" {
  filename      = "performance_analyzer.zip"
  function_name = "performance-analyzer"
  role          = aws_iam_role.performance_analyzer.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 300

  environment {
    variables = {
      DASHBOARD_NAME = aws_cloudwatch_dashboard.performance.dashboard_name
      SNS_TOPIC_ARN  = aws_sns_topic.performance_alerts.arn
    }
  }
}

# EventBridge rule to run performance analysis daily
resource "aws_cloudwatch_event_rule" "daily_performance_analysis" {
  name                = "daily-performance-analysis"
  description         = "Run performance analysis daily"
  schedule_expression = "cron(0 8 * * ? *)"  # 8 AM daily
}

resource "aws_cloudwatch_event_target" "performance_analyzer" {
  rule      = aws_cloudwatch_event_rule.daily_performance_analysis.name
  target_id = "PerformanceAnalyzer"
  arn       = aws_lambda_function.performance_analyzer.arn
}
```

**Why This Is Effective:**
- Comprehensive dashboard provides single-pane-of-glass view
- Multiple metrics across all layers (application, compute, storage, database)
- Alarms detect performance degradation automatically
- Composite alarm reduces alert fatigue
- X-Ray sampling balances visibility with overhead
- CloudWatch Logs Insights enables ad-hoc performance analysis
- Automated daily analysis identifies trends and anomalies


### 3. Monitoring

#### Best Practices

**Establish Performance Baselines**
- Measure performance under normal conditions
- Document expected performance characteristics
- Set performance targets and SLAs
- Track performance over time
- Identify seasonal patterns and trends

**Use Active and Passive Monitoring**
- Implement synthetic monitoring for proactive detection
- Use real user monitoring (RUM) for actual user experience
- Monitor both technical and business metrics
- Set up alerts for anomalies
- Use distributed tracing for request flows

**Implement Automated Responses**
- Auto-scale based on performance metrics
- Automatically remediate common issues
- Use AWS Systems Manager for automated actions
- Implement circuit breakers for failing dependencies
- Use chaos engineering to test resilience

### 4. Trade-offs

#### Best Practices

**Understand Performance Trade-offs**
- Balance consistency vs. latency (CAP theorem)
- Consider cost vs. performance trade-offs
- Evaluate durability vs. latency for storage
- Balance security controls with performance impact
- Consider operational complexity vs. performance gains

**Use Caching Strategically**
- Cache at multiple layers (CDN, application, database)
- Use appropriate cache invalidation strategies
- Consider cache hit ratio and effectiveness
- Balance cache size with cost
- Use read-through and write-through patterns

**Optimize for Common Cases**
- Optimize hot paths and frequent operations
- Use lazy loading for infrequent operations
- Implement pagination for large datasets
- Use asynchronous processing for non-critical operations
- Prioritize user-facing operations

#### Caching Patterns

**Pattern 6: Multi-Layer Caching Strategy**
```python
# Python example - Multi-layer caching implementation
import redis
import json
from functools import wraps
from typing import Optional, Callable, Any
import hashlib

class MultiLayerCache:
    """
    Implements multi-layer caching with in-memory, Redis, and database layers
    """
    
    def __init__(self, redis_client: redis.Redis, max_memory_items: int = 1000):
        self.redis = redis_client
        self.memory_cache = {}  # In-memory cache (L1)
        self.max_memory_items = max_memory_items
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function name and arguments"""
        key_data = f"{func_name}:{str(args)}:{str(sorted(kwargs.items()))}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache, checking L1 (memory) then L2 (Redis)"""
        # Check L1 cache (memory) - fastest
        if key in self.memory_cache:
            print(f"Cache hit: L1 (memory) - {key}")
            return self.memory_cache[key]
        
        # Check L2 cache (Redis) - fast
        redis_value = self.redis.get(key)
        if redis_value:
            print(f"Cache hit: L2 (Redis) - {key}")
            value = json.loads(redis_value)
            # Promote to L1 cache
            self._set_memory_cache(key, value)
            return value
        
        print(f"Cache miss: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """Set value in both cache layers"""
        # Set in L1 cache (memory)
        self._set_memory_cache(key, value)
        
        # Set in L2 cache (Redis) with TTL
        self.redis.setex(key, ttl, json.dumps(value))
    
    def _set_memory_cache(self, key: str, value: Any):
        """Set value in memory cache with LRU eviction"""
        if len(self.memory_cache) >= self.max_memory_items:
            # Simple LRU: remove first item (oldest)
            self.memory_cache.pop(next(iter(self.memory_cache)))
        self.memory_cache[key] = value
    
    def invalidate(self, key: str):
        """Invalidate cache entry in all layers"""
        if key in self.memory_cache:
            del self.memory_cache[key]
        self.redis.delete(key)
    
    def cache_decorator(self, ttl: int = 300):
        """Decorator for automatic caching of function results"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = self._generate_key(func.__name__, args, kwargs)
                
                # Try to get from cache
                cached_value = self.get(cache_key)
                if cached_value is not None:
                    return cached_value
                
                # Cache miss - execute function
                result = func(*args, **kwargs)
                
                # Store in cache
                self.set(cache_key, result, ttl)
                
                return result
            return wrapper
        return decorator

# Usage example
redis_client = redis.Redis(
    host='cache-cluster.abc123.0001.use1.cache.amazonaws.com',
    port=6379,
    decode_responses=False,
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30
)

cache = MultiLayerCache(redis_client)

@cache.cache_decorator(ttl=600)  # Cache for 10 minutes
def get_user_profile(user_id: str) -> dict:
    """
    Expensive database query - automatically cached
    """
    # This would be a database query
    print(f"Fetching user profile from database: {user_id}")
    return {
        'user_id': user_id,
        'name': 'John Doe',
        'email': 'john@example.com'
    }

# First call - cache miss, queries database
profile1 = get_user_profile('user123')

# Second call - cache hit from L1 (memory)
profile2 = get_user_profile('user123')

# Invalidate cache when user updates profile
def update_user_profile(user_id: str, updates: dict):
    # Update database
    print(f"Updating user profile: {user_id}")
    
    # Invalidate cache
    cache_key = cache._generate_key('get_user_profile', (user_id,), {})
    cache.invalidate(cache_key)
```

**Why This Is Performant:**
- L1 (memory) cache provides sub-millisecond access
- L2 (Redis) cache provides single-digit millisecond access
- Automatic cache promotion from L2 to L1 for hot data
- LRU eviction prevents memory exhaustion
- Decorator pattern makes caching transparent
- Cache invalidation ensures data consistency
- TTL prevents stale data


**Pattern 7: CloudFront with Origin Shield for Global Performance**
```hcl
# Terraform example - Global content delivery with caching

# S3 bucket for origin content
resource "aws_s3_bucket" "origin" {
  bucket = "global-content-origin"
}

# CloudFront distribution with caching optimization
resource "aws_cloudfront_distribution" "global" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  price_class         = "PriceClass_All"
  comment             = "Global content delivery with optimized caching"
  default_root_object = "index.html"

  # Origin configuration with Origin Shield
  origin {
    domain_name              = aws_s3_bucket.origin.bucket_regional_domain_name
    origin_id                = "S3-Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.origin.id
    
    # Origin Shield for additional caching layer
    origin_shield {
      enabled              = true
      origin_shield_region = "us-east-1"  # Choose region closest to origin
    }
    
    # Custom headers for origin
    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.origin_secret.result
    }
  }

  # Default cache behavior for static content
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "S3-Origin"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    # Cache policy for static content
    cache_policy_id = aws_cloudfront_cache_policy.static_content.id
    
    # Origin request policy
    origin_request_policy_id = aws_cloudfront_origin_request_policy.cors.id
    
    # Response headers policy
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  # Cache behavior for API endpoints (different caching strategy)
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "S3-Origin"
    compress               = true
    viewer_protocol_policy = "https-only"

    # Cache policy for API (shorter TTL)
    cache_policy_id = aws_cloudfront_cache_policy.api.id
    
    # Forward all headers for API
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  # Cache behavior for dynamic content (no caching)
  ordered_cache_behavior {
    path_pattern           = "/dynamic/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-Origin"
    compress               = true
    viewer_protocol_policy = "https-only"

    # No caching for dynamic content
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_disabled.id
  }

  # Geographic restrictions (if needed)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL/TLS configuration
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cdn.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Logging configuration
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.logs.bucket_domain_name
    prefix          = "cloudfront/"
  }

  tags = {
    Name        = "global-cdn"
    Environment = "production"
  }
}

# Cache policy for static content (long TTL)
resource "aws_cloudfront_cache_policy" "static_content" {
  name        = "static-content-policy"
  comment     = "Cache policy for static content with long TTL"
  default_ttl = 86400   # 1 day
  max_ttl     = 31536000 # 1 year
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    
    headers_config {
      header_behavior = "none"
    }
    
    query_strings_config {
      query_string_behavior = "none"
    }
    
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Cache policy for API (short TTL)
resource "aws_cloudfront_cache_policy" "api" {
  name        = "api-cache-policy"
  comment     = "Cache policy for API with short TTL"
  default_ttl = 60    # 1 minute
  max_ttl     = 300   # 5 minutes
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "CloudFront-Viewer-Country"]
      }
    }
    
    query_strings_config {
      query_string_behavior = "all"
    }
    
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Response headers policy for security and performance
resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "security-headers-policy"
  comment = "Security and performance headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    
    content_type_options {
      override = true
    }
    
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }

  custom_headers_config {
    items {
      header   = "Cache-Control"
      value    = "public, max-age=31536000, immutable"
      override = false
    }
  }
}

# CloudWatch alarms for cache performance
resource "aws_cloudwatch_metric_alarm" "cache_hit_rate" {
  alarm_name          = "cloudfront-low-cache-hit-rate"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CacheHitRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 80  # Alert if cache hit rate below 80%
  alarm_description   = "CloudFront cache hit rate is low"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.global.id
  }

  alarm_actions = [aws_sns_topic.performance_alerts.arn]
}
```

**Why This Is Performant:**
- CloudFront edge locations provide low-latency access globally
- Origin Shield adds additional caching layer, reducing origin load by up to 60%
- HTTP/3 support reduces connection establishment time
- Brotli compression provides better compression than gzip
- Different cache policies for different content types optimize hit rates
- Long TTL for static content maximizes cache effectiveness
- Cache hit rate monitoring ensures caching is effective
- TLS 1.2+ with SNI reduces SSL/TLS overhead


## Common Performance Issues and Remediation

### Issue 1: High Database Latency

**Detection**: RDS Performance Insights shows high query latency, CloudWatch alarms trigger

**Symptoms**:
- Slow application response times
- Database CPU utilization high
- Long-running queries in Performance Insights

**Root Causes**:
- Missing indexes on frequently queried columns
- Inefficient queries with full table scans
- Insufficient database instance size
- Connection pool exhaustion

**Remediation**:
```sql
-- Add missing indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10;

-- Optimize query with proper index usage
-- Before: Full table scan
SELECT * FROM orders WHERE status = 'pending' AND created_at > NOW() - INTERVAL '7 days';

-- After: Index on (status, created_at)
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

```hcl
# Upgrade instance size if needed
resource "aws_db_instance" "main" {
  instance_class = "db.r6g.2xlarge"  # Upgrade from smaller instance
  
  # Enable Performance Insights for analysis
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  
  # Add read replica to offload read traffic
  # (create separate resource for read replica)
}

# Implement connection pooling
resource "aws_rds_proxy" "main" {
  name                   = "db-proxy"
  engine_family          = "POSTGRESQL"
  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.db_credentials.arn
  }
  
  role_arn               = aws_iam_role.proxy.arn
  vpc_subnet_ids         = aws_subnet.private_data[*].id
  require_tls            = true
  
  # Connection pooling configuration
  idle_client_timeout    = 1800
  max_connections_percent = 100
  max_idle_connections_percent = 50
}
```

### Issue 2: Slow API Response Times

**Detection**: ALB target response time exceeds threshold, X-Ray shows bottlenecks

**Symptoms**:
- High P99 latency
- User complaints about slow page loads
- Increased error rates during peak traffic

**Root Causes**:
- No caching layer
- Synchronous external API calls
- Inefficient data serialization
- Cold start issues with Lambda

**Remediation**:
```python
# Add caching layer
import redis
from functools import wraps

redis_client = redis.Redis(host='cache-endpoint', port=6379)

def cache_result(ttl=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            
            # Try cache first
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Cache miss - execute function
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(ttl=600)
def get_product_details(product_id):
    # Expensive database query
    return query_database(product_id)

# Make external API calls asynchronous
import asyncio
import aiohttp

async def fetch_multiple_apis():
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_api_1(session),
            fetch_api_2(session),
            fetch_api_3(session)
        ]
        # Execute in parallel instead of sequentially
        results = await asyncio.gather(*tasks)
        return results

# Use efficient serialization
import orjson  # Faster than standard json

def serialize_response(data):
    # orjson is 2-3x faster than json.dumps
    return orjson.dumps(data)
```

```yaml
# Eliminate Lambda cold starts with provisioned concurrency
ApiFunction:
  Type: AWS::Serverless::Function
  Properties:
    ProvisionedConcurrencyConfig:
      ProvisionedConcurrentExecutions: 10
    
    # Increase memory for faster execution
    MemorySize: 1769  # 1 vCPU
    
    # Optimize package size
    Layers:
      - !Ref DependenciesLayer  # Move dependencies to layer
```

### Issue 3: High S3 Data Transfer Costs and Latency

**Detection**: CloudWatch shows high S3 data transfer, users report slow downloads

**Symptoms**:
- High data transfer costs
- Slow file downloads for global users
- High S3 request rates

**Root Causes**:
- No CDN for content delivery
- Serving large files directly from S3
- No compression enabled
- Inefficient access patterns

**Remediation**:
```hcl
# Add CloudFront distribution
resource "aws_cloudfront_distribution" "content" {
  enabled = true
  
  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = "S3-Content"
    
    origin_access_control_id = aws_cloudfront_origin_access_control.content.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-Content"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true  # Enable compression
    
    # Long TTL for static content
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  # Use all edge locations for global reach
  price_class = "PriceClass_All"
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Enable S3 Transfer Acceleration for uploads
resource "aws_s3_bucket_accelerate_configuration" "content" {
  bucket = aws_s3_bucket.content.id
  status = "Enabled"
}

# Use S3 Intelligent-Tiering for cost optimization
resource "aws_s3_bucket_intelligent_tiering_configuration" "content" {
  bucket = aws_s3_bucket.content.id
  name   = "EntireDataset"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
}
```

### Issue 4: DynamoDB Throttling

**Detection**: CloudWatch shows throttled requests, application errors increase

**Symptoms**:
- ProvisionedThroughputExceededException errors
- Increased application latency
- Failed write operations

**Root Causes**:
- Insufficient provisioned capacity
- Hot partition keys
- Burst traffic exceeding capacity
- No auto-scaling configured

**Remediation**:
```yaml
# Enable auto-scaling for DynamoDB
Table:
  Type: AWS::DynamoDB::Table
  Properties:
    BillingMode: PAY_PER_REQUEST  # Or use PROVISIONED with auto-scaling
    
    # If using provisioned mode, configure auto-scaling
    # BillingMode: PROVISIONED
    # ProvisionedThroughput:
    #   ReadCapacityUnits: 100
    #   WriteCapacityUnits: 100

# Auto-scaling configuration
ReadCapacityScalableTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    ServiceNamespace: dynamodb
    ResourceId: !Sub 'table/${Table}'
    ScalableDimension: dynamodb:table:ReadCapacityUnits
    MinCapacity: 5
    MaxCapacity: 1000

ReadCapacityScalingPolicy:
  Type: AWS::ApplicationAutoScaling::ScalingPolicy
  Properties:
    PolicyType: TargetTrackingScaling
    ScalingTargetId: !Ref ReadCapacityScalableTarget
    TargetTrackingScalingPolicyConfiguration:
      TargetValue: 70.0
      PredefinedMetricSpecification:
        PredefinedMetricType: DynamoDBReadCapacityUtilization

# Add DAX for read-heavy workloads
DAXCluster:
  Type: AWS::DAX::Cluster
  Properties:
    NodeType: dax.r5.large
    ReplicationFactor: 3
```

```python
# Fix hot partition keys by adding randomness
import random

# Bad: All items for same user go to same partition
user_id = "user123"
item_key = f"USER#{user_id}"

# Good: Distribute across multiple partitions
shard_id = random.randint(0, 9)  # 10 shards
item_key = f"USER#{user_id}#SHARD#{shard_id}"

# When querying, query all shards and merge results
def get_user_items(user_id):
    results = []
    for shard_id in range(10):
        key = f"USER#{user_id}#SHARD#{shard_id}"
        items = dynamodb.query(KeyConditionExpression=Key('pk').eq(key))
        results.extend(items)
    return results
```


## Performance Anti-Patterns

### ❌ Anti-Pattern 1: Using General Purpose Instances for Specialized Workloads

```hcl
# DON'T DO THIS - Using t3 instances for CPU-intensive workloads
resource "aws_instance" "compute_intensive" {
  ami           = "ami-12345678"
  instance_type = "t3.large"  # Burstable instance for sustained CPU load
  # T3 instances use CPU credits - will throttle under sustained load
}
```

**Problem**: T3 instances are burstable and will throttle when CPU credits are exhausted
**Fix**: Use compute-optimized instances (c6i, c6a, c7g) for CPU-intensive workloads

```hcl
# DO THIS - Use compute-optimized instances
resource "aws_instance" "compute_intensive" {
  ami           = "ami-12345678"
  instance_type = "c6i.large"  # Compute-optimized for sustained CPU load
}
```

### ❌ Anti-Pattern 2: No Caching Layer

```python
# DON'T DO THIS - Query database on every request
def get_user_profile(user_id):
    # Database query on every request
    return db.query("SELECT * FROM users WHERE id = ?", user_id)

# Every API call hits the database, even for unchanged data
```

**Problem**: Unnecessary database load, high latency, poor scalability
**Fix**: Implement caching layer with appropriate TTL

```python
# DO THIS - Use caching
@cache_result(ttl=300)
def get_user_profile(user_id):
    return db.query("SELECT * FROM users WHERE id = ?", user_id)
```

### ❌ Anti-Pattern 3: Synchronous Processing of Independent Tasks

```python
# DON'T DO THIS - Sequential processing
def process_order(order):
    send_confirmation_email(order)      # 2 seconds
    update_inventory(order)             # 1 second
    notify_shipping(order)              # 1 second
    update_analytics(order)             # 1 second
    # Total: 5 seconds
```

**Problem**: Sequential processing increases latency unnecessarily
**Fix**: Use asynchronous processing or queues

```python
# DO THIS - Asynchronous processing
import asyncio

async def process_order(order):
    await asyncio.gather(
        send_confirmation_email(order),
        update_inventory(order),
        notify_shipping(order),
        update_analytics(order)
    )
    # Total: ~2 seconds (longest task)

# Or use queues for non-critical tasks
def process_order(order):
    # Critical path - synchronous
    update_inventory(order)
    
    # Non-critical - asynchronous via queue
    queue.send_message({
        'type': 'order_created',
        'order_id': order.id
    })
```

### ❌ Anti-Pattern 4: Using Wrong Storage Type

```hcl
# DON'T DO THIS - Using gp2 for high-performance database
resource "aws_ebs_volume" "database" {
  size = 1000
  type = "gp2"  # Limited to 16,000 IOPS max
}
```

**Problem**: gp2 volumes have IOPS limitations based on size
**Fix**: Use gp3 or io2 for high-performance workloads

```hcl
# DO THIS - Use appropriate storage type
resource "aws_ebs_volume" "database" {
  size       = 1000
  type       = "gp3"
  iops       = 16000  # Configurable IOPS
  throughput = 1000   # Configurable throughput
}

# Or for very high performance
resource "aws_ebs_volume" "high_performance_db" {
  size = 1000
  type = "io2"
  iops = 64000  # Up to 64,000 IOPS
}
```

### ❌ Anti-Pattern 5: No Connection Pooling

```python
# DON'T DO THIS - Create new connection for each request
def handle_request():
    conn = psycopg2.connect(
        host="database.example.com",
        database="myapp",
        user="admin",
        password="secret"
    )
    # Execute query
    conn.close()
    # Connection overhead on every request
```

**Problem**: Connection establishment overhead, connection exhaustion
**Fix**: Use connection pooling

```python
# DO THIS - Use connection pooling
from psycopg2 import pool

# Create connection pool at startup
connection_pool = pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=20,
    host="database.example.com",
    database="myapp",
    user="admin",
    password="secret"
)

def handle_request():
    conn = connection_pool.getconn()
    try:
        # Execute query
        pass
    finally:
        connection_pool.putconn(conn)
```

### ❌ Anti-Pattern 6: Fetching More Data Than Needed

```python
# DON'T DO THIS - Fetch all columns and rows
def get_user_names():
    users = db.query("SELECT * FROM users")  # Fetches all columns
    return [user['name'] for user in users]  # Only need name
```

**Problem**: Unnecessary data transfer, memory usage, network bandwidth
**Fix**: Select only needed columns and use pagination

```python
# DO THIS - Fetch only needed data
def get_user_names(page=1, page_size=100):
    offset = (page - 1) * page_size
    users = db.query(
        "SELECT name FROM users LIMIT ? OFFSET ?",
        page_size, offset
    )
    return [user['name'] for user in users]
```

### ❌ Anti-Pattern 7: No Monitoring or Alerting

```hcl
# DON'T DO THIS - Deploy without monitoring
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  # No CloudWatch alarms, no monitoring
}
```

**Problem**: Performance issues go undetected until users complain
**Fix**: Implement comprehensive monitoring and alerting

```hcl
# DO THIS - Add monitoring and alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    InstanceId = aws_instance.app.id
  }
}
```

## Code Generation Guidance

When generating infrastructure code, Kiro should apply these Performance Efficiency principles:

### Instance Sizing
- **Use latest generation instances**: Prefer c6i, r6g, m6i over older generations
- **Match instance type to workload**: 
  - Compute-optimized (c6i) for CPU-intensive
  - Memory-optimized (r6g) for in-memory databases
  - General purpose (m6i) for balanced workloads
- **Enable enhanced networking**: Always enable ENA for better network performance
- **Use Graviton2/3**: Consider ARM-based instances for better price/performance

### Storage Configuration
- **Use gp3 by default**: Better price/performance than gp2
- **Configure IOPS and throughput**: Don't rely on defaults
- **Use io2 for databases**: When consistent high IOPS needed
- **Enable EBS optimization**: Always enable for better storage performance

### Caching
- **Add ElastiCache**: For read-heavy workloads
- **Use CloudFront**: For static content and APIs
- **Implement DAX**: For DynamoDB read-heavy patterns
- **Configure appropriate TTLs**: Balance freshness with performance

### Auto Scaling
- **Use target tracking**: Automatically adjust capacity
- **Configure warm pools**: For faster scaling response
- **Set appropriate thresholds**: 70% CPU utilization is good target
- **Use multiple metrics**: CPU, request count, custom metrics

### Monitoring
- **Enable Performance Insights**: For RDS databases
- **Configure X-Ray tracing**: For distributed applications
- **Create CloudWatch dashboards**: For visibility
- **Set up alarms**: For proactive issue detection

### Example Generated Code

```hcl
# Well-Architected Performance Efficiency: High-performance web application
# Generated by Kiro with Performance Efficiency best practices

# Latest generation compute-optimized instances
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "c6i.xlarge"  # Latest gen compute-optimized
  
  # Enhanced networking for better performance
  network_interfaces {
    associate_public_ip_address = false
    delete_on_termination       = true
    security_groups             = [aws_security_group.app.id]
  }
  
  # EBS optimization for storage performance
  ebs_optimized = true
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_type = "gp3"      # Latest generation SSD
      volume_size = 100
      iops        = 3000       # Configured IOPS
      throughput  = 125        # Configured throughput
      encrypted   = true
    }
  }
}

# Auto Scaling with target tracking
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  
  min_size         = 2
  max_size         = 20
  desired_capacity = 4
  
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
  
  # Warm pool for faster scaling
  warm_pool {
    pool_state = "Stopped"
    min_size   = 2
  }
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
    target_value = 70.0  # Maintain 70% CPU utilization
  }
}

# ElastiCache for caching layer
resource "aws_elasticache_replication_group" "cache" {
  replication_group_id       = "app-cache"
  replication_group_description = "Application cache"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r6g.large"  # Graviton2 for better price/performance
  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled          = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

# CloudWatch alarms for performance monitoring
resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name          = "high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0.5  # 500ms
  alarm_description   = "Alert when response time exceeds 500ms"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

## Additional Resources

### AWS Documentation
- [Performance Efficiency Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)
- [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Amazon EBS Volume Types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html)
- [Amazon CloudFront Performance](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/performance.html)
- [Amazon RDS Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html)
- [Amazon DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS Lambda Performance Optimization](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

### AWS Whitepapers
- [Performance Efficiency Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/wellarchitected-performance-efficiency-pillar.pdf)
- [Optimizing Enterprise Economics with Serverless Architectures](https://d1.awsstatic.com/whitepapers/optimizing-enterprise-economics-serverless-architectures.pdf)

### AWS Blogs
- [AWS Architecture Blog - Performance](https://aws.amazon.com/blogs/architecture/category/performance/)
- [Amazon Builders' Library - Performance](https://aws.amazon.com/builders-library/)

### Tools
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/) - Right-sizing recommendations
- [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) - Monitoring and observability
- [AWS X-Ray](https://aws.amazon.com/xray/) - Distributed tracing
- [Amazon DevOps Guru](https://aws.amazon.com/devops-guru/) - ML-powered operational insights

## Application Code Performance

Application code performance patterns are critical for user experience and cost optimization. This power analyzes application code for caching, connection pooling, async operations, and query optimization.

### Application Performance Guidance

For detailed application code performance patterns, see:

**[Application Code Performance Patterns](./performance-application-code.md)**

This guide covers:
- Caching with ElastiCache and DAX
- Connection pooling for databases and services
- Async/await patterns for non-blocking I/O
- Efficient database query patterns
- Batch operations to reduce API calls
- Stream processing for large datasets

