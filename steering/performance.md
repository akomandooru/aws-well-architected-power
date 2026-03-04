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



## Context-Aware Performance Trade-Off Guidance

Performance optimization is not one-size-fits-all. The right performance approach depends on your specific requirements, budget, and operational constraints. This section provides context-aware guidance to help you make informed trade-offs between performance, cost, and complexity.

### Context Questions for Performance Recommendations

Before making performance recommendations, gather context:

1. **Latency Requirements**: What are your latency targets? (<10ms, <100ms, <1s, >1s)
2. **Throughput Requirements**: What's your expected request rate? (requests/second, GB/day)
3. **Availability Requirements**: What's your SLA? (99%, 99.9%, 99.99%)
4. **Budget Constraints**: What's your budget sensitivity? (tight, moderate, flexible)
5. **Environment**: Development, staging, or production?
6. **Data Volume**: How much data? (MB, GB, TB, PB)
7. **Traffic Pattern**: Steady, spiky, seasonal, or unpredictable?
8. **Geographic Distribution**: Single region, multi-region, or global?

### Trade-Off 1: Instance Sizing Approaches

#### Context-Dependent Instance Sizing

**Development/Testing Environment**:
```
Recommendation: Use smaller, burstable instances to minimize cost.

Approach:
- Use t3/t4g instances (burstable, cost-effective)
- Start with t3.medium or t3.large
- Accept occasional performance throttling
- No auto-scaling needed (fixed capacity)

Cost: $30-60/month per instance
Performance: Variable (CPU credits), acceptable for dev/test
Complexity: Low

Trade-off: Lower cost vs. inconsistent performance.
Recommendation: t3 instances are perfect for dev/test where cost matters more than performance.

Rationale: Development environments don't need production-level performance.
Save 60-70% on compute costs compared to production instances.
```

**Production - Low Traffic (<100 req/s)**:
```
Recommendation: Use general-purpose instances with moderate sizing.

Approach:
- Use m6i or m6a instances (balanced compute/memory)
- Start with m6i.large or m6i.xlarge
- Basic auto-scaling (min 2, max 4-6 instances)
- Target 60-70% CPU utilization

Cost: $120-240/month per instance
Performance: Consistent, suitable for moderate traffic
Complexity: Medium

Trade-off: Balanced cost and performance.
Recommendation: m6i instances provide good price/performance for most workloads.

Example: Small e-commerce site, internal tools, small SaaS applications.
```

**Production - High Traffic (>1000 req/s)**:
```
Recommendation: Use compute-optimized instances with aggressive auto-scaling.

Approach:
- Use c6i or c7g instances (compute-optimized)
- Start with c6i.xlarge or c6i.2xlarge
- Aggressive auto-scaling (min 4, max 20+ instances)
- Target 70% CPU utilization
- Use warm pools for faster scaling

Cost: $150-300/month per instance (but better per-request cost)
Performance: High throughput, low latency
Complexity: Medium-High

Trade-off: Higher base cost vs. better per-request economics at scale.
Recommendation: c6i instances provide best performance per dollar at high traffic.

Example: High-traffic APIs, video processing, data analytics.
```

**Production - Latency-Sensitive (<10ms P99)**:
```
Recommendation: Use latest-generation instances with provisioned capacity.

REQUIRED:
- Latest generation compute-optimized (c7g Graviton3 or c6i)
- Larger instance sizes (2xlarge or 4xlarge) for consistent performance
- Provisioned capacity (no auto-scaling delays)
- Enhanced networking enabled
- Placement groups for low-latency communication

Cost: $300-600/month per instance
Performance: Ultra-low latency, consistent P99
Complexity: High

Trade-off: Significant cost vs. guaranteed low latency.
Recommendation: This is required for latency-sensitive applications.

Example: Financial trading, real-time gaming, high-frequency APIs.
Rationale: 10ms latency requirement eliminates cheaper options.
```

#### Instance Type Decision Matrix

| Latency Target | Traffic Level | Environment | Recommended Instance | Monthly Cost/Instance | Auto-Scaling |
|----------------|---------------|-------------|---------------------|----------------------|--------------|
| **>1s** | Any | Dev/Test | t3.medium | $30 | No |
| **<1s** | Low (<100 req/s) | Production | m6i.large | $120 | Basic (2-4) |
| **<100ms** | Medium (100-1000 req/s) | Production | m6i.xlarge | $240 | Moderate (2-8) |
| **<100ms** | High (>1000 req/s) | Production | c6i.xlarge | $150 | Aggressive (4-20) |
| **<10ms** | Any | Production | c7g.2xlarge | $400 | Provisioned (no scaling) |

### Trade-Off 2: Caching Strategies

#### Context-Dependent Caching

**No Caching (Simple Applications)**:
```
When to use:
- Data changes frequently (every request)
- Very low traffic (<10 req/s)
- Development/testing environments
- Data must always be fresh (no staleness acceptable)

Cost: $0
Latency: Database latency (10-50ms typical)
Complexity: None

Trade-off: Zero caching cost vs. higher database load and latency.
Recommendation: Skip caching for simple, low-traffic applications.

Example: Admin dashboards, internal tools with <10 users.
```

**Application-Level Caching (In-Memory)**:
```
When to use:
- Moderate traffic (10-100 req/s)
- Data changes infrequently (minutes to hours)
- Single-instance or small deployments
- Budget-conscious projects

Approach:
- Use in-memory cache (Python dict, Node.js Map, etc.)
- Implement TTL-based expiration
- Cache size limit with LRU eviction

Cost: $0 (uses existing instance memory)
Latency: <1ms (in-memory access)
Complexity: Low (simple implementation)

Trade-off: No additional cost vs. cache not shared across instances.
Recommendation: Start here for moderate traffic before adding external cache.

Example:
```python
from functools import lru_cache
from datetime import datetime, timedelta

# Simple in-memory cache with TTL
cache = {}
cache_ttl = {}

def get_cached(key, ttl_seconds=300):
    if key in cache:
        if datetime.now() < cache_ttl[key]:
            return cache[key]
        else:
            del cache[key]
            del cache_ttl[key]
    return None

def set_cached(key, value, ttl_seconds=300):
    cache[key] = value
    cache_ttl[key] = datetime.now() + timedelta(seconds=ttl_seconds)
```

**ElastiCache Redis (Distributed Caching)**:
```
When to use:
- High traffic (>100 req/s)
- Multiple application instances
- Data changes infrequently (minutes to hours)
- Need cache sharing across instances

Approach:
- Use ElastiCache Redis cluster
- Start with cache.t4g.micro or cache.t4g.small
- Implement cache-aside pattern
- Use appropriate TTLs (5-30 minutes typical)

Cost: $15-50/month (t4g.micro to t4g.small)
Latency: 1-5ms (network + Redis)
Complexity: Medium (Redis client, connection pooling)

Trade-off: $15-50/month cost vs. shared cache and reduced database load.
Recommendation: Use for production applications with >100 req/s.

Benefit: Reduces database load by 70-90%, improves latency by 10-50x.
ROI: $15/month cache can save $100+/month in database costs.
```

**ElastiCache Redis with Multi-Layer Caching**:
```
When to use:
- Very high traffic (>1000 req/s)
- Latency-sensitive (<50ms P99)
- Read-heavy workloads (90%+ reads)
- Budget allows for optimization

Approach:
- L1: In-memory cache (application)
- L2: ElastiCache Redis
- L3: Database
- Implement cache promotion (L2 → L1 for hot data)

Cost: $50-200/month (cache.r6g.large or larger)
Latency: <1ms (L1), 1-5ms (L2), 10-50ms (L3)
Complexity: High (multi-layer cache management)

Trade-off: Higher cost and complexity vs. optimal performance.
Recommendation: Use for high-traffic, latency-sensitive applications.

Example: High-traffic APIs, social media feeds, e-commerce product catalogs.
```

**DynamoDB with DAX (Microsecond Latency)**:
```
When to use:
- Ultra-low latency required (<10ms P99)
- DynamoDB as primary database
- Read-heavy workloads
- Budget allows for premium performance

Approach:
- Use DynamoDB with DAX cluster
- DAX provides microsecond read latency
- 3-node cluster for high availability

Cost: $200-400/month (dax.t3.small cluster)
Latency: <1ms (DAX), vs 5-10ms (DynamoDB alone)
Complexity: Medium (DAX client integration)

Trade-off: $200-400/month vs. microsecond latency.
Recommendation: Use when <10ms latency is required for DynamoDB.

Benefit: 10x latency improvement over DynamoDB alone.
```

#### Caching Decision Matrix

| Traffic Level | Latency Target | Data Freshness | Recommended Caching | Monthly Cost | Latency Improvement |
|---------------|----------------|----------------|---------------------|--------------|---------------------|
| **<10 req/s** | >1s | Any | No caching | $0 | N/A |
| **10-100 req/s** | <1s | Minutes-Hours | In-memory | $0 | 10-50x |
| **100-1000 req/s** | <100ms | Minutes-Hours | ElastiCache (t4g.small) | $30/month | 10-50x |
| **>1000 req/s** | <50ms | Minutes-Hours | ElastiCache (r6g.large) + L1 | $150/month | 20-100x |
| **>1000 req/s** | <10ms | Minutes-Hours | DAX (for DynamoDB) | $300/month | 10x |

### Trade-Off 3: Database Performance Optimization

#### Context-Dependent Database Sizing

**Development/Testing**:
```
Recommendation: Use smallest instance with basic configuration.

Approach:
- db.t3.micro or db.t4g.micro
- Single-AZ (no Multi-AZ)
- gp2 storage (20-100 GB)
- No read replicas
- Basic backup retention (7 days)

Cost: $15-30/month
Performance: Limited, acceptable for dev/test
Complexity: Low

Trade-off: Minimal cost vs. limited performance.
Recommendation: Perfect for development and testing.
```

**Production - Low Traffic (<100 queries/s)**:
```
Recommendation: Use general-purpose instance with standard configuration.

Approach:
- db.t3.medium or db.t4g.medium
- Multi-AZ for high availability
- gp3 storage (100-500 GB, 3000 IOPS)
- No read replicas initially
- 30-day backup retention

Cost: $100-200/month
Performance: Suitable for moderate workloads
Complexity: Medium

Trade-off: Balanced cost and reliability.
Recommendation: Standard production configuration for most applications.
```

**Production - High Traffic (>1000 queries/s)**:
```
Recommendation: Use memory-optimized instance with read replicas.

Approach:
- db.r6g.large or db.r6g.xlarge (Graviton2)
- Multi-AZ for high availability
- gp3 storage (500-1000 GB, 10000 IOPS)
- 1-2 read replicas for read scaling
- Performance Insights enabled
- 30-day backup retention

Cost: $400-800/month
Performance: High throughput, low latency
Complexity: Medium-High

Trade-off: Higher cost vs. better performance and scalability.
Recommendation: Required for high-traffic applications.

Benefit: Read replicas offload 50-80% of read traffic from primary.
```

**Production - Latency-Sensitive (<10ms queries)**:
```
Recommendation: Use large memory-optimized instance with io2 storage.

REQUIRED:
- db.r6g.2xlarge or larger
- Multi-AZ for high availability
- io2 storage (1000+ GB, 20000+ IOPS)
- Multiple read replicas
- Performance Insights enabled
- Enhanced monitoring (1-second granularity)
- Connection pooling (RDS Proxy)

Cost: $1000-2000/month
Performance: Ultra-low latency, high throughput
Complexity: High

Trade-off: Significant cost vs. guaranteed low latency.
Recommendation: This is required for latency-sensitive applications.

Example: Financial applications, real-time analytics, high-frequency trading.
```

#### Database Optimization Decision Matrix

| Query Rate | Latency Target | Read/Write Ratio | Recommended Config | Monthly Cost | Key Features |
|------------|----------------|------------------|-------------------|--------------|--------------|
| **<10 q/s** | >1s | Any | db.t3.micro, gp2 | $20 | Single-AZ, basic |
| **10-100 q/s** | <1s | Any | db.t3.medium, gp3, Multi-AZ | $150 | Standard prod |
| **100-1000 q/s** | <100ms | 80/20 read | db.r6g.large, gp3, 1 replica | $500 | Read scaling |
| **>1000 q/s** | <50ms | 90/10 read | db.r6g.xlarge, gp3, 2 replicas | $800 | High performance |
| **>1000 q/s** | <10ms | Any | db.r6g.2xlarge, io2, RDS Proxy | $1500 | Ultra-low latency |

### Trade-Off 4: Storage Performance

#### Context-Dependent Storage Selection

**Development/Testing**:
```
Recommendation: Use gp2 or gp3 with default settings.

Approach:
- gp2 or gp3 volumes
- Default IOPS (3000 for gp3)
- Minimal size (20-100 GB)

Cost: $2-10/month
Performance: 3000 IOPS, 125 MB/s
Complexity: Low

Trade-off: Minimal cost vs. basic performance.
Recommendation: gp2/gp3 defaults are sufficient for dev/test.
```

**Production - General Purpose**:
```
Recommendation: Use gp3 with configured IOPS and throughput.

Approach:
- gp3 volumes
- 3000-10000 IOPS (based on workload)
- 125-500 MB/s throughput
- Size based on data needs (100-1000 GB)

Cost: $10-100/month
Performance: Up to 16,000 IOPS, 1,000 MB/s
Complexity: Low

Trade-off: Moderate cost vs. good performance.
Recommendation: gp3 is best price/performance for most workloads.

Benefit: gp3 is 20% cheaper than gp2 with better performance.
```

**Production - Database (High IOPS)**:
```
Recommendation: Use io2 for consistent high IOPS.

Approach:
- io2 volumes
- 10,000-64,000 IOPS (based on database needs)
- Size based on data needs (500-5000 GB)
- 99.999% durability

Cost: $100-500/month
Performance: Up to 64,000 IOPS, 1,000 MB/s, consistent
Complexity: Medium

Trade-off: Higher cost vs. consistent high performance.
Recommendation: Use io2 for production databases with high IOPS needs.

Example: High-traffic databases, transactional workloads, latency-sensitive apps.
```

**Production - Throughput-Intensive**:
```
Recommendation: Use st1 (HDD) for sequential access workloads.

When to use:
- Log processing, data warehousing
- Sequential access patterns
- Throughput more important than IOPS
- Cost-sensitive workloads

Approach:
- st1 volumes (throughput-optimized HDD)
- 500 MB/s throughput
- Large volumes (500+ GB)

Cost: $4.5/100GB/month (vs $8/100GB for gp3)
Performance: 500 MB/s throughput, lower IOPS
Complexity: Low

Trade-off: 50% cost savings vs. lower IOPS.
Recommendation: Use for big data, log processing, data warehouses.
```

#### Storage Type Decision Matrix

| Workload Type | IOPS Needs | Throughput Needs | Recommended Storage | Cost/100GB/month | Best For |
|---------------|------------|------------------|---------------------|------------------|----------|
| **Dev/Test** | <3000 | <125 MB/s | gp2 or gp3 (default) | $8 | Development |
| **General Purpose** | 3000-10000 | 125-500 MB/s | gp3 (configured) | $8 + IOPS cost | Most workloads |
| **Database** | 10000-64000 | <1000 MB/s | io2 | $12.5 + IOPS cost | High IOPS |
| **Big Data** | Low | >500 MB/s | st1 (HDD) | $4.5 | Sequential access |
| **Archive** | Very Low | Low | sc1 (HDD) | $1.5 | Cold storage |

### Trade-Off 5: Performance vs. Cost

#### Context-Dependent Performance Investment

**Startup/MVP Phase**:
```
Recommendation: Optimize for cost, accept moderate performance.

Approach:
- Use t3/t4g instances (burstable)
- Single-AZ databases (no Multi-AZ)
- Minimal caching (in-memory only)
- Basic monitoring (CloudWatch defaults)
- No read replicas
- gp2/gp3 storage with defaults

Cost: $100-300/month total infrastructure
Performance: Moderate (acceptable for MVP)
Complexity: Low

Trade-off: Lower cost vs. moderate performance and availability.
Recommendation: Focus on product validation, not performance optimization.

Rationale: Premature optimization wastes time and money.
Get to market fast, optimize when you have users and revenue.
```

**Growth Stage (Product-Market Fit)**:
```
Recommendation: Invest in performance for user experience.

Time to invest in:
- Compute-optimized instances (c6i)
- Multi-AZ databases
- ElastiCache for caching
- Auto-scaling for traffic spikes
- CloudFront for global users
- Performance monitoring (X-Ray, Performance Insights)

Cost: $500-2000/month
Performance: Good (suitable for growing user base)
Complexity: Medium

Trade-off: Performance investment vs. feature development time.
Recommendation: Allocate 10-20% of engineering time to performance.

Benefit: Better user experience → higher retention → more revenue.
ROI: 100ms latency improvement can increase conversion by 1-2%.
```

**Enterprise/Scale**:
```
Recommendation: Comprehensive performance optimization (REQUIRED).

REQUIRED:
- Latest-generation instances (c7g, r6g)
- Multi-AZ everything
- Multi-layer caching (L1 + L2)
- Global infrastructure (multi-region)
- Advanced monitoring and APM
- Dedicated performance engineering team
- Regular performance testing and optimization

Cost: $5,000-50,000+/month
Performance: Excellent (required for scale)
Complexity: High

Trade-off: None - this is required at enterprise scale.

Rationale: At scale, performance directly impacts revenue.
1% conversion improvement = $100K-1M+ annual revenue.
```

### Trade-Off 6: Performance vs. Complexity

#### Context-Dependent Complexity

**Simple Architecture (Low Complexity)**:
```
When to use:
- Small team (1-5 people)
- Low traffic (<100 req/s)
- Limited operational expertise
- Budget constraints

Approach:
- Single-region deployment
- Monolithic application
- Single database (no read replicas)
- Basic caching (in-memory)
- Simple monitoring (CloudWatch)

Cost: $200-500/month
Performance: Moderate
Complexity: Low
Operational Overhead: 5-10 hours/month

Trade-off: Simpler operations vs. limited scalability.
Recommendation: Start simple, add complexity as needed.

Example: Small SaaS, internal tools, MVP applications.
```

**Moderate Architecture (Medium Complexity)**:
```
When to use:
- Medium team (6-20 people)
- Moderate traffic (100-1000 req/s)
- Growing user base
- Moderate budget

Approach:
- Single-region, multi-AZ
- Microservices or modular monolith
- Database with read replicas
- ElastiCache for caching
- CloudFront for CDN
- Comprehensive monitoring

Cost: $1,000-5,000/month
Performance: Good
Complexity: Medium
Operational Overhead: 20-40 hours/month

Trade-off: Better performance and scalability vs. operational complexity.
Recommendation: Appropriate for growing businesses.

Example: Growing SaaS, e-commerce, mobile app backends.
```

**Complex Architecture (High Complexity)**:
```
When to use:
- Large team (20+ people)
- High traffic (>1000 req/s)
- Global user base
- Enterprise requirements

Approach:
- Multi-region deployment
- Microservices architecture
- Distributed databases (sharding, replication)
- Multi-layer caching (L1 + L2 + CDN)
- Service mesh for observability
- Advanced monitoring and APM
- Chaos engineering

Cost: $10,000-100,000+/month
Performance: Excellent
Complexity: High
Operational Overhead: 100+ hours/month (dedicated team)

Trade-off: Maximum performance and availability vs. significant operational complexity.
Recommendation: Required for enterprise scale and global applications.

Example: Large SaaS platforms, social media, financial services.
```

#### Complexity Decision Matrix

| Team Size | Traffic Level | User Base | Recommended Complexity | Monthly Cost | Operational Hours |
|-----------|---------------|-----------|------------------------|--------------|-------------------|
| **1-5** | <100 req/s | Regional | Simple (single-region, monolith) | $300 | 5-10 |
| **6-20** | 100-1000 req/s | Regional | Moderate (multi-AZ, microservices) | $2,000 | 20-40 |
| **20-50** | >1000 req/s | Multi-region | Complex (multi-region, distributed) | $10,000 | 100+ |
| **50+** | >10,000 req/s | Global | Very Complex (global, service mesh) | $50,000+ | 200+ |

### Trade-Off 7: When Performance Optimization is Premature

#### Avoid Premature Optimization

**Premature Optimization Scenarios**:
```
DON'T optimize performance when:

1. No Users Yet (MVP/Pre-Launch)
   - You don't know actual usage patterns
   - Optimization based on assumptions, not data
   - Time better spent on product features
   
   Recommendation: Use reasonable defaults, optimize after launch.

2. Low Traffic (<10 req/s)
   - Performance is already acceptable
   - Optimization cost exceeds benefit
   - Simple architecture is sufficient
   
   Recommendation: Focus on features, not performance.

3. No Performance Problems
   - Users aren't complaining
   - Metrics show acceptable performance
   - No business impact from current performance
   
   Recommendation: "If it ain't broke, don't fix it."

4. Unclear Bottlenecks
   - No monitoring or profiling data
   - Guessing at performance issues
   - Optimizing the wrong thing
   
   Recommendation: Measure first, optimize second.

5. Limited Resources
   - Small team with limited time
   - Performance optimization takes time from features
   - Opportunity cost is high
   
   Recommendation: Optimize only critical paths.
```

**When to Optimize Performance**:
```
DO optimize performance when:

1. User Complaints
   - Users report slow performance
   - High bounce rates or abandonment
   - Direct business impact
   
   Action: Measure, identify bottlenecks, optimize.

2. Metrics Show Issues
   - P99 latency >1s
   - Error rates increasing
   - Database CPU >80%
   
   Action: Address specific bottlenecks.

3. Scaling Issues
   - Performance degrades with traffic
   - Can't handle peak loads
   - Auto-scaling not keeping up
   
   Action: Optimize hot paths, add caching.

4. Cost Impact
   - Over-provisioned resources
   - High database costs
   - Inefficient queries
   
   Action: Right-size, optimize queries, add caching.

5. Competitive Advantage
   - Performance is differentiator
   - Users expect fast experience
   - Industry standards require it
   
   Action: Invest in performance engineering.
```

#### Optimization Priority Framework

| Scenario | Optimize? | Priority | Rationale |
|----------|-----------|----------|-----------|
| **MVP, no users** | No | N/A | Focus on product validation |
| **<10 req/s, no complaints** | No | N/A | Performance is acceptable |
| **Users complaining** | Yes | High | Direct business impact |
| **P99 >1s** | Yes | High | Poor user experience |
| **Database CPU >80%** | Yes | Medium | Approaching limits |
| **High AWS costs** | Yes | Medium | Cost optimization opportunity |
| **Competitive advantage** | Yes | Low-Medium | Strategic investment |

### Decision Framework: Performance Investment

Use this framework to determine appropriate performance investment:

| Factor | Minimal | Standard | High Performance |
|--------|---------|----------|------------------|
| **Environment** | Development | Production (moderate traffic) | Production (high traffic) |
| **Latency Target** | >1s | <100ms | <10ms |
| **Traffic Level** | <10 req/s | 100-1000 req/s | >1000 req/s |
| **Budget** | Tight | Moderate | Flexible |
| **Team Size** | 1-5 people | 6-20 people | 20+ people |
| **Instances** | t3 (burstable) | m6i (general purpose) | c6i/c7g (compute-optimized) |
| **Caching** | None or in-memory | ElastiCache (t4g.small) | Multi-layer + DAX |
| **Database** | db.t3.micro, single-AZ | db.t3.medium, Multi-AZ | db.r6g.large+, replicas |
| **Storage** | gp2 default | gp3 configured | io2 high IOPS |
| **Monitoring** | CloudWatch basic | CloudWatch + alarms | X-Ray + Performance Insights |
| **Monthly Cost** | $50-200 | $500-2,000 | $5,000-50,000+ |
| **Complexity** | Low | Medium | High |

### Key Takeaways for Context-Aware Performance

1. **Latency Requirements Drive Decisions**: <10ms requires premium solutions, >100ms allows cost optimization
2. **Traffic Level Matters**: Different approaches for 10 req/s vs 10,000 req/s
3. **Environment Dictates Investment**: Dev/test can use cheaper options than production
4. **Caching is High ROI**: $15/month cache can save $100+/month in database costs
5. **Start Simple, Scale Up**: Don't over-engineer for traffic you don't have yet
6. **Measure Before Optimizing**: Use data to identify bottlenecks, not assumptions
7. **Balance Cost and Performance**: Not every workload needs ultra-low latency
8. **Consider Operational Complexity**: More performance often means more operational overhead
9. **Avoid Premature Optimization**: Focus on product validation before performance tuning
10. **Performance is Iterative**: Continuously monitor and optimize as you grow

### Anti-Patterns to Avoid

❌ **Over-Engineering for MVP**: Spending months on multi-region, multi-layer caching before launch
❌ **Ignoring Latency Requirements**: Using t3 instances for <10ms latency requirements
❌ **No Caching at Scale**: Hitting database directly with >100 req/s
❌ **Wrong Instance Type**: Using general-purpose instances for CPU-intensive workloads
❌ **Premature Optimization**: Optimizing before measuring actual performance
❌ **One-Size-Fits-All**: Same performance approach for dev and production
❌ **Ignoring Cost**: Implementing expensive solutions without considering budget
❌ **No Monitoring**: Optimizing blind without metrics and profiling data

✅ **Measure First**: Use CloudWatch, X-Ray, Performance Insights to identify bottlenecks
✅ **Start Simple**: Use reasonable defaults, optimize based on actual usage
✅ **Context-Aware**: Different approaches for different latency/traffic/budget requirements
✅ **Iterative Optimization**: Continuously improve as you grow
✅ **Cost-Conscious**: Balance performance investment with business value
✅ **Right-Size**: Match resources to actual needs, not theoretical maximums
✅ **Cache Strategically**: Add caching where it provides highest ROI
✅ **Monitor Continuously**: Track performance metrics and set up alarms

## Summary

The Performance Efficiency Pillar is about using computing resources efficiently to meet requirements and maintaining that efficiency as demand changes. By following the guidance in this document, you can:

- **Select the right resources** based on workload characteristics and requirements
- **Implement caching** at appropriate layers to reduce latency and cost
- **Monitor performance** continuously to identify bottlenecks and optimization opportunities
- **Make informed trade-offs** between performance, cost, and complexity based on context
- **Optimize iteratively** as your application grows and requirements evolve
- **Avoid premature optimization** by measuring first and optimizing based on data
- **Balance performance investment** with business value and operational capacity

Remember: Performance optimization is not one-size-fits-all. The right approach depends on your specific latency requirements, traffic levels, budget constraints, and operational capacity. Use the context questions and decision matrices in this guide to make informed trade-offs that align with your business goals.

Start with reasonable defaults, measure actual performance, and optimize based on data - not assumptions. As your application grows, continuously monitor and refine your performance strategy to maintain efficiency at scale.


---

## Mode-Aware Guidance for Performance Efficiency Reviews

This section guides Kiro on how to adapt Performance Efficiency Pillar reviews based on the current review mode (Simple, Context-Aware, or Full Analysis). Each mode provides different levels of detail and analysis appropriate for different use cases.

### Simple Mode - Performance Efficiency Reviews

**When to Use:** CI/CD pipelines, quick checks, development environment reviews, pre-commit hooks

**Token Budget:** 17-25K tokens | **Target Latency:** 2.5-6 seconds

**What to Include in Simple Mode:**

1. **Direct Violation Identification**
   - Flag clear performance violations without context gathering
   - Use prescriptive language: "Enable caching", "Use connection pooling", "Right-size instance"
   - Assign risk levels based on standard criteria
   - Provide specific line numbers and file references

2. **Prescriptive Recommendations**
   - Give direct remediation steps without trade-off discussion
   - Use code examples showing the fix
   - Focus on Well-Architected best practices without customization
   - No context questions about latency requirements, throughput targets, or traffic patterns

3. **Standard Risk Assessment**
   - High Risk: No caching for read-heavy workloads, synchronous operations that should be async, inefficient database queries
   - Medium Risk: Oversized instances, missing connection pooling, no CDN for static content
   - Low Risk: Suboptimal configurations, missing performance monitoring, minor improvements

4. **Output Format**
   ```
   ❌ HIGH RISK: No caching configured for read-heavy DynamoDB table
   Location: dynamodb.tf:23
   Issue: Missing DAX cluster for caching
   Recommendation: Add DAX cluster to reduce read latency and cost
   Remediation:
   [Code example showing the fix]
   ```

**What to EXCLUDE in Simple Mode:**
- ❌ Context questions (latency requirements, throughput targets, traffic patterns)
- ❌ Trade-off discussions (cost vs. performance, complexity vs. speed)
- ❌ Alternative approaches with pros/cons
- ❌ Decision matrices or scenario matching
- ❌ Conditional guidance based on context
- ❌ Long explanations of performance optimization strategies

**Example Simple Mode Output:**
```
Performance Efficiency Review Results (Simple Mode)

❌ HIGH RISK: Lambda function lacks connection pooling
Location: lambda.py:15
Recommendation: Implement connection pooling for database connections
Remediation: Use connection pooling library to reuse connections across invocations

⚠️ MEDIUM RISK: EC2 instance oversized for workload
Location: compute.tf:34
Recommendation: Right-size to t3.medium (currently t3.xlarge)
Remediation: Reduce instance size to match actual CPU/memory usage

⚠️ MEDIUM RISK: No CDN configured for static content
Location: s3.tf:12
Recommendation: Add CloudFront distribution for S3 bucket
Remediation: Configure CloudFront to cache static assets

✓ 3 issues found: 1 high-risk, 2 medium-risk
```

### Context-Aware Mode - Performance Efficiency Reviews

**When to Use:** Interactive sessions, production reviews, staging reviews, architecture decisions

**Token Budget:** 35-50K tokens | **Target Latency:** 4-8 seconds

**What to Include in Context-Aware Mode:**

1. **Context Gathering (3-5 Key Questions)**
   - "What environment is this? (development/staging/production)"
   - "What's your latency requirement? (target response time in ms)"
   - "What's your throughput requirement? (requests per second)"
   - "What's your traffic pattern? (steady/variable/spiky)"
   - "What's your budget constraint? (tight/moderate/flexible)"

2. **Conditional Recommendations Based on Context**
   - Provide different guidance for dev vs. production
   - Adjust performance recommendations based on latency requirements
   - Explain when caching is required vs. optional
   - Consider budget constraints in recommendations

3. **Trade-Off Explanations for Key Decisions**
   - Explain performance vs. cost trade-offs (e.g., caching reduces cost but adds complexity)
   - Discuss performance vs. consistency trade-offs (e.g., eventual consistency for speed)
   - Provide cost estimates for performance improvements
   - Explain when to defer performance optimizations vs. implement immediately

4. **Alternative Approaches with Pros/Cons**
   - Present multiple valid performance approaches
   - Explain when each approach is appropriate
   - Provide decision criteria for choosing between options

5. **Output Format**
   ```
   ⚠️ CONTEXT-DEPENDENT: No caching configured for DynamoDB table
   Location: dynamodb.tf:23
   
   Context Questions:
   - What's your read:write ratio? (read-heavy/balanced/write-heavy)
   - What's your latency requirement? (target response time)
   - What's your budget constraint?
   
   Conditional Guidance:
   - FOR read-heavy workload (80%+ reads) with <10ms latency requirement:
     DAX caching is REQUIRED
     - Latency: 20ms → <1ms (20x improvement)
     - Cost: +$0.25/hour per node (~$180/month for 1 node)
     - Throughput: 10x increase in read capacity
   
   - FOR balanced workload or relaxed latency: DAX is OPTIONAL
     - Cost savings: $180/month
     - Trade-off: Higher latency (20ms vs. <1ms)
   
   Recommendation: Based on your workload pattern, choose appropriate caching strategy.
   ```

**What to INCLUDE in Context-Aware Mode:**
- ✅ Context questions (3-5 key questions about latency, throughput, traffic patterns)
- ✅ Conditional recommendations based on gathered context
- ✅ Trade-off explanations for major performance decisions
- ✅ Cost-benefit analysis for key recommendations
- ✅ Alternative approaches with use cases
- ✅ Environment-specific guidance (dev/staging/prod)
- ✅ Latency and throughput requirement explanations

**What to EXCLUDE in Context-Aware Mode:**
- ❌ Comprehensive decision matrices (save for Full Analysis)
- ❌ Detailed quantitative cost analysis (save for Full Analysis)
- ❌ Scenario matching with examples (save for Full Analysis)
- ❌ Multi-pillar impact analysis (save for Full Analysis)
- ❌ Long-term strategic implications (save for Full Analysis)

**Example Context-Aware Mode Output:**
```
Performance Efficiency Review Results (Context-Aware Mode)

Context Gathered:
- Environment: Production
- Latency Requirement: <100ms p99
- Throughput: 1000 req/sec peak
- Traffic Pattern: Variable (2x peak vs. average)
- Budget: Moderate ($5K/month infrastructure)

⚠️ CONTEXT-DEPENDENT: No caching configured for API responses
Location: api.py:45

Context Analysis:
- Production API with 100ms latency requirement
- Read-heavy workload (80% reads, 20% writes)
- Variable traffic pattern requires scalable caching

Recommendation: Implement ElastiCache Redis for API caching

Trade-Offs:
- Cost: $50-100/month for cache cluster
- Latency: 50ms → 5ms (10x improvement)
- Throughput: 3x increase in request capacity
- Complexity: Medium (cache invalidation strategy needed)

Alternative Approaches:
1. No caching: Simple but slow (50ms latency)
2. Application-level caching: Free but not scalable
3. ElastiCache Redis: RECOMMENDED - scalable and fast
4. CloudFront: Good for static content, not dynamic APIs

Decision: Use ElastiCache Redis (option 3) for scalable API caching.

Cost-Benefit: $75/month cost enables 3x throughput increase.
Avoids need for 3x compute capacity ($300/month savings).
Net benefit: $225/month positive ROI.

⚠️ CONTEXT-DEPENDENT: Lambda function uses synchronous invocation
Location: lambda.py:23

Context Analysis:
- Variable traffic pattern (2x peak)
- Non-critical background processing task

Conditional Guidance:
- FOR critical path operations: Synchronous is REQUIRED
  - Ensures completion before returning to user
  - Acceptable latency impact for critical operations

- FOR background tasks: Asynchronous is RECOMMENDED
  - Reduces API latency by 50-80%
  - Improves user experience
  - Handles traffic spikes better

Recommendation: Convert to asynchronous invocation for background tasks.

Trade-Off: Immediate consistency vs. better performance
- Synchronous: Guaranteed completion, higher latency
- Asynchronous: Better performance, eventual consistency

Cost-Benefit: $0 cost, 50-80% latency reduction, better scalability.

✓ 2 issues found: Both recommended for 100ms latency requirement
```

### Full Analysis Mode - Performance Efficiency Reviews

**When to Use:** Major architecture decisions, explicit user request, complex trade-off scenarios, performance optimization planning

**Token Budget:** 70-95K tokens | **Target Latency:** 5-10 seconds

**What to Include in Full Analysis Mode:**

1. **Comprehensive Context Gathering**
   - All context questions from Context-Aware Mode
   - Additional questions about growth expectations, global distribution needs
   - Performance testing results and bottleneck analysis
   - Current performance metrics (p50, p95, p99 latency)
   - Cost per request and efficiency metrics

2. **Detailed Trade-Off Analysis Across All Pillars**
   - Performance vs. Cost with quantitative estimates
   - Performance vs. Consistency (CAP theorem trade-offs)
   - Performance vs. Operational Complexity
   - Multi-pillar impact analysis

3. **Decision Matrices Comparing Multiple Options**
   - Load and present decision matrices for major performance decisions
   - Compare 3-5 options with scoring across multiple criteria
   - Include quantitative cost estimates and performance benchmarks
   - Provide weighted recommendations based on latency requirements

4. **Scenario Matching with Examples**
   - Match user's latency requirements to common scenarios (<10ms, <100ms, <1s)
   - Provide examples of architectures for each performance tier
   - Include lessons learned and common performance pitfalls
   - Reference industry benchmarks and standards

5. **Quantitative Cost-Benefit Analysis**
   - Detailed cost breakdowns (monthly, annual, 3-year)
   - Performance improvement calculations (latency reduction, throughput increase)
   - ROI calculations for performance investments
   - Break-even analysis (when does performance investment pay off)

6. **Long-Term Implications and Roadmap**
   - Discuss how performance decisions impact future scalability
   - Provide migration paths from current to ideal state
   - Explain technical debt implications of performance shortcuts
   - Suggest phased implementation approaches

7. **Output Format**
   ```
   🔍 COMPREHENSIVE ANALYSIS: API Caching Strategy
   Location: api.py:45
   
   Context Gathered:
   - Environment: Production
   - Latency Requirement: <100ms p99 (currently 150ms p99)
   - Throughput: 1000 req/sec peak, 500 req/sec average
   - Traffic Pattern: Variable (2x peak, daily spikes)
   - Budget: Moderate ($5K/month, can increase for performance)
   - Growth: 3x expected in 12 months
   - Read:Write Ratio: 80:20 (read-heavy)
   - Current Cost: $300/month compute
   
   Decision Matrix: Caching Options
   
   | Option | Latency | Throughput | Cost | Complexity | Best For |
   |--------|---------|------------|------|------------|----------|
   | No Cache | 150ms | 1K req/s | $ | ⭐⭐⭐⭐⭐ | Dev/Test |
   | App Cache | 50ms | 2K req/s | $ | ⭐⭐⭐⭐ | Small scale |
   | ElastiCache | 10ms | 5K req/s | $$ | ⭐⭐⭐ | Production |
   | CloudFront | 5ms | 10K req/s | $$$ | ⭐⭐ | Global CDN |
   
   Recommended: ElastiCache Redis
   
   Pillar Impact Analysis:
   ✅ Performance: +HIGH
      - Latency: 150ms → 10ms p99 (15x improvement)
      - Throughput: 1K → 5K req/s (5x increase)
      - Meets <100ms latency requirement with buffer
      - Handles 3x growth without additional compute
   
   ⚠️ Cost: +LOW
      - ElastiCache: $75/month (cache.t3.medium)
      - Compute savings: $200/month (avoid 3x scale-up)
      - Net cost: -$125/month (saves money)
   
   ⚠️ Reliability: +MEDIUM
      - Multi-AZ cache for high availability
      - Reduces database load (less likely to overwhelm DB)
      - Cache failures degrade to slower performance (not outage)
   
   ⚠️ Operational Excellence: +MEDIUM
      - Requires cache invalidation strategy
      - Monitoring for cache hit rate
      - Automated failover with Multi-AZ
   
   ⚠️ Security: NEUTRAL
      - Encryption in transit and at rest
      - VPC security groups for access control
      - Same security posture as database
   
   Cost-Benefit Analysis:
   - ElastiCache Cost: $75/month
   - Compute Savings: $200/month (avoid 3x scale-up)
   - Net Savings: $125/month ($1,500/year)
   - Performance Improvement: 15x latency reduction
   - Throughput Increase: 5x capacity increase
   - ROI: Immediate positive (saves money while improving performance)
   
   Trade-Off Scenarios:
   
   1. Startup with Tight Budget, <1s Latency OK:
      - Start with application-level caching
      - Use simple in-memory cache (free)
      - Migrate to ElastiCache when traffic grows
      - Cost: $0
      - Trade-off: Limited scalability, 50ms latency
   
   2. Growth Stage with <100ms Latency (YOUR SITUATION):
      - Implement ElastiCache Redis immediately
      - Multi-AZ for high availability
      - Monitor cache hit rate and tune TTLs
      - Cost: $75/month (net savings of $125/month)
      - Benefit: Meets latency requirement, handles growth
   
   3. Enterprise with <10ms Latency, Global Users:
      - Use CloudFront + ElastiCache
      - Edge caching for global distribution
      - Regional ElastiCache clusters
      - Cost: $300-500/month
      - Benefit: <10ms latency globally, massive scale
   
   Decision: IMPLEMENT ElastiCache Redis (Option 2)
   
   Rationale:
   - Current 150ms p99 latency exceeds 100ms requirement
   - 3x growth expected requires 5x throughput capacity
   - Positive ROI: Saves $125/month while improving performance
   - Scalability: Handles 3x growth without compute scale-up
   - User experience: 15x latency improvement
   
   Implementation Roadmap:
   
   Phase 1 (Week 1): Deploy ElastiCache cluster
   - Create cache.t3.medium Multi-AZ cluster
   - Configure VPC security groups
   - Test cache connectivity from application
   - Estimated time: 4 hours
   
   Phase 2 (Week 2): Implement caching layer
   - Add Redis client library to application
      - Implement cache-aside pattern
      - Set appropriate TTLs (5-60 minutes based on data freshness)
      - Add cache invalidation on writes
      - Estimated time: 8 hours
   
   Phase 3 (Week 3): Monitor and optimize
      - Set up CloudWatch metrics for cache hit rate
      - Configure alarms for cache failures
      - Tune TTLs based on hit rate
      - Load test to verify performance improvement
      - Estimated time: 4 hours
   
   Total Implementation: 16 hours over 3 weeks
   Total Cost: $75/month (net savings of $125/month)
   
   Risk of NOT Implementing:
   - Latency SLA violation: 150ms vs. 100ms requirement
   - Scalability blocker: Cannot handle 3x growth without 3x compute cost
   - User experience: Slow API responses damage retention
   - Cost: $200/month additional compute needed for growth
   
   Risk of Implementing:
   - Minimal: $75/month cost (offset by $200/month savings)
   - Cache invalidation complexity (mitigated by cache-aside pattern)
   - 16 hours engineering time
   
   Conclusion: The decision is clear - implement ElastiCache immediately.
   Positive ROI ($125/month net savings), meets latency requirement, enables growth.
   ```

**What to INCLUDE in Full Analysis Mode:**
- ✅ Comprehensive context gathering (10+ questions including current metrics)
- ✅ Detailed trade-off analysis across all pillars
- ✅ Decision matrices with 3-5 options compared
- ✅ Quantitative cost-benefit analysis with performance benchmarks
- ✅ Scenario matching (startup/growth/enterprise with different latency requirements)
- ✅ Long-term implications and technical debt discussion
- ✅ Phased implementation roadmap
- ✅ Risk analysis (risk of implementing vs. not implementing)
- ✅ Multi-pillar impact analysis
- ✅ Industry benchmarks and performance standards
- ✅ ROI and payback period calculations

**What to EXCLUDE in Full Analysis Mode:**
- Nothing - Full Analysis Mode includes everything

### Mode Selection for Performance Efficiency Reviews

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
   - Performance optimization planning

**Mode Switching Mid-Session:**

Users can escalate or simplify modes during a review:

- **Escalate:** "Can you explain the trade-offs?" → Switch to Context-Aware
- **Escalate:** "I need a full analysis with cost comparison" → Switch to Full Analysis
- **Simplify:** "Just tell me what's wrong" → Switch to Simple

When switching modes, preserve all context already gathered (don't re-ask questions).

### Best Practices for Mode-Aware Performance Efficiency Reviews

**For Simple Mode:**
- Focus on clear violations only
- Use prescriptive language without explanation
- Keep output concise and actionable
- Provide code examples for fixes
- Don't ask context questions about latency or throughput

**For Context-Aware Mode:**
- Ask 3-5 key context questions upfront (latency, throughput, traffic pattern)
- Provide conditional guidance based on context
- Explain trade-offs for major decisions
- Offer 2-3 alternative approaches
- Include cost estimates and performance impact

**For Full Analysis Mode:**
- Gather comprehensive context (10+ questions including current metrics)
- Load relevant decision matrices
- Provide quantitative cost-benefit analysis with ROI
- Include scenario matching and examples
- Discuss long-term implications
- Provide phased implementation roadmap

### Common Performance Efficiency Review Scenarios by Mode

**Scenario 1: No Caching**

- **Simple Mode:** "❌ HIGH RISK: Add caching. Implement ElastiCache Redis for read-heavy workload."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For read-heavy workload (80%+ reads) with <100ms latency, caching is REQUIRED. For balanced workload, optional."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing no cache, app cache, ElastiCache, CloudFront with latency, cost, and throughput]"

**Scenario 2: Oversized Instance**

- **Simple Mode:** "⚠️ MEDIUM RISK: Right-size instance. Change from t3.xlarge to t3.medium based on CPU usage."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For steady 20% CPU usage, t3.medium is sufficient ($50/month savings). For variable traffic, keep t3.xlarge with auto-scaling."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing instance types with cost, performance, and auto-scaling strategies]"

**Scenario 3: Synchronous Operations**

- **Simple Mode:** "⚠️ MEDIUM RISK: Use asynchronous invocation for background tasks."
- **Context-Aware Mode:** "⚠️ CONTEXT-DEPENDENT: For critical path operations, synchronous is REQUIRED. For background tasks, asynchronous reduces latency by 50-80%."
- **Full Analysis Mode:** "🔍 COMPREHENSIVE ANALYSIS: [Decision matrix comparing synchronous, asynchronous, and event-driven patterns with latency, consistency, and complexity trade-offs]"

### Summary

Mode-aware performance efficiency reviews ensure that Kiro provides the right level of detail for each situation:

- **Simple Mode:** Fast, prescriptive, no context - perfect for CI/CD and quick checks
- **Context-Aware Mode:** Balanced, conditional, with context - ideal for interactive production reviews
- **Full Analysis Mode:** Comprehensive, detailed, with matrices - best for major architecture decisions and performance optimization planning

Always announce the mode at the start of a review and allow users to switch modes if they need more or less detail. Preserve context when switching modes to avoid re-asking questions.
