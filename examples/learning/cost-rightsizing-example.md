# Learning Example: Right-Sizing Resources (Cost Optimization Pillar)

## Question

**"How do I avoid paying for resources I'm not using?"**

## Detailed Explanation

### Why This Matters

Right-sizing is the process of matching instance types and sizes to your workload requirements at the lowest possible cost. It's the single most effective way to reduce AWS costs.

**Common Waste Scenarios:**
- Running m5.2xlarge when m5.large would suffice: **$1,314/year wasted per instance**
- Leaving development instances running 24/7 when only needed 40 hours/week: **$3,066/year wasted per instance**
- Using gp2 volumes when gp3 offers better performance at lower cost: **20-30% savings**

### The Well-Architected Approach

The Cost Optimization Pillar principle "Implement cloud financial management" recommends:
- **Monitor resource utilization continuously**
- **Right-size resources based on actual usage**
- **Use the most cost-effective resources**
- **Automate cost optimization**

## Real-World Example: Right-Sizing EC2 Instances

### Scenario
You have a web application running on m5.2xlarge instances (8 vCPU, 32 GB RAM) that you provisioned "to be safe."

### Step 1: Analyze Current Usage

```bash
# Check CloudWatch metrics for the past 2 weeks
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-15T00:00:00Z \
  --period 3600 \
  --statistics Average,Maximum
```

**Results:**
- Average CPU: 15%
- Maximum CPU: 35%
- Average Memory: 8 GB (25% of 32 GB)
- Maximum Memory: 12 GB (37.5% of 32 GB)

### Step 2: Identify Right Size

**Current:** m5.2xlarge (8 vCPU, 32 GB RAM) - $0.384/hour
**Analysis:** Using only 15% CPU and 25% memory on average

**Options:**
1. **m5.large** (2 vCPU, 8 GB RAM) - $0.096/hour
   - 2 vCPUs would run at 60% average (15% × 8/2)
   - 8 GB RAM is sufficient (current max is 12 GB, but that's with oversized instance)
   
2. **m5.xlarge** (4 vCPU, 16 GB RAM) - $0.192/hour
   - 4 vCPUs would run at 30% average (safer margin)
   - 16 GB RAM provides comfortable headroom

### ✅ Correct Choice: m5.xlarge

```hcl
# Terraform example - Right-sized instance
resource "aws_launch_template" "app_rightsized" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "m5.xlarge"  # Right-sized from m5.2xlarge

  # Enable detailed monitoring to track the change
  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name           = "app-instance"
      RightSized     = "2024-01-15"
      PreviousType   = "m5.2xlarge"
      MonthlySavings = "$138"
    }
  }
}

# CloudWatch alarm to ensure we're not under-provisioned
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "app-cpu-high-after-rightsizing"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Alert if CPU consistently above 70% after right-sizing"
  treat_missing_data  = "notBreaching"
}
```

### Cost Savings

**Before:** m5.2xlarge × 3 instances × 730 hours/month = $841/month
**After:** m5.xlarge × 3 instances × 730 hours/month = $420/month
**Monthly Savings:** $421/month
**Annual Savings:** $5,052/year

### Why This Works

1. **Data-Driven**: Based on actual usage, not guesses
2. **Safe Margin**: 30% average CPU leaves room for spikes
3. **Monitoring**: Alarms ensure we catch if we under-sized
4. **Significant Savings**: 50% cost reduction with no performance impact

## Real-World Example: Right-Sizing Storage

### Scenario
You have 100 gp2 EBS volumes (500 GB each) for application data.

### Current Configuration

```hcl
# DON'T DO THIS - using old generation gp2
resource "aws_ebs_volume" "app_data" {
  count             = 100
  availability_zone = "us-east-1a"
  size              = 500
  type              = "gp2"  # Old generation
  # gp2: 3 IOPS per GB = 1,500 IOPS per volume
  # Cost: $0.10/GB-month = $50/volume/month
}
```

**Current Cost:** 100 volumes × $50/month = $5,000/month

### ✅ Optimized Configuration: Switch to gp3

```hcl
# DO THIS - use gp3 with right-sized IOPS
resource "aws_ebs_volume" "app_data_optimized" {
  count             = 100
  availability_zone = "us-east-1a"
  size              = 500
  type              = "gp3"
  iops              = 3000   # Baseline, same as gp2
  throughput        = 125    # MB/s, baseline
  # gp3: $0.08/GB-month = $40/volume/month
  # Same performance, 20% cheaper
}
```

**Optimized Cost:** 100 volumes × $40/month = $4,000/month
**Monthly Savings:** $1,000/month
**Annual Savings:** $12,000/year

### Why This Works

1. **Better Technology**: gp3 is newer and more cost-effective
2. **Same Performance**: 3,000 IOPS baseline (same as gp2)
3. **Configurable**: Can adjust IOPS and throughput independently
4. **20% Savings**: Simply by switching volume type

## Real-World Example: Scheduling Non-Production Resources

### Scenario
You have development and test environments that run 24/7 but are only used during business hours (9 AM - 6 PM, Monday-Friday).

### Current Configuration

```hcl
# Running 24/7
resource "aws_instance" "dev_server" {
  count         = 5
  ami           = "ami-12345678"
  instance_type = "m5.large"
  # Running 168 hours/week
}
```

**Current Cost:** 5 instances × $0.096/hour × 730 hours/month = $350/month

### ✅ Optimized Configuration: Scheduled Scaling

```hcl
# Auto Scaling with scheduled actions
resource "aws_autoscaling_schedule" "dev_start" {
  scheduled_action_name  = "dev-start-business-hours"
  min_size               = 5
  max_size               = 5
  desired_capacity       = 5
  recurrence             = "0 9 * * MON-FRI"  # 9 AM weekdays
  autoscaling_group_name = aws_autoscaling_group.dev.name
}

resource "aws_autoscaling_schedule" "dev_stop" {
  scheduled_action_name  = "dev-stop-after-hours"
  min_size               = 0
  max_size               = 0
  desired_capacity       = 0
  recurrence             = "0 18 * * MON-FRI"  # 6 PM weekdays
  autoscaling_group_name = aws_autoscaling_group.dev.name
}

# Or use Lambda to stop/start instances
resource "aws_lambda_function" "instance_scheduler" {
  filename      = "instance_scheduler.zip"
  function_name = "dev-instance-scheduler"
  role          = aws_iam_role.scheduler.arn
  handler       = "index.handler"
  runtime       = "python3.11"

  environment {
    variables = {
      START_SCHEDULE = "0 9 * * MON-FRI"
      STOP_SCHEDULE  = "0 18 * * MON-FRI"
      TAG_KEY        = "Environment"
      TAG_VALUE      = "development"
    }
  }
}
```

**Optimized Cost:** 5 instances × $0.096/hour × 45 hours/week × 4.33 weeks/month = $93/month
**Monthly Savings:** $257/month (73% reduction!)
**Annual Savings:** $3,084/year

### Why This Works

1. **Usage-Based**: Only pay for what you use
2. **Automated**: No manual intervention required
3. **Significant Savings**: 73% cost reduction
4. **No Impact**: Development work happens during business hours anyway

## Common Anti-Patterns

### ❌ Anti-Pattern 1: "Better Safe Than Sorry" Over-Provisioning

```hcl
# DON'T DO THIS
resource "aws_instance" "app" {
  instance_type = "m5.4xlarge"  # "Just to be safe"
  # Actual usage: 10% CPU, 8 GB RAM
  # Paying for: 16 vCPU, 64 GB RAM
}
```

**Why This Is Wrong:**
- Paying for 16 vCPUs when using 1.6 vCPUs worth
- Paying for 64 GB RAM when using 8 GB
- Cost: $0.768/hour ($561/month)
- Right-sized m5.large: $0.096/hour ($70/month)
- **Wasting $491/month per instance!**

**Psychology:** Fear of performance issues leads to over-provisioning
**Reality:** Modern monitoring and auto-scaling make this unnecessary

### ❌ Anti-Pattern 2: Set It and Forget It

```hcl
# Provisioned in 2020, never reviewed
resource "aws_instance" "legacy_app" {
  instance_type = "m4.2xlarge"  # Old generation
  # Still running in 2024
}
```

**Why This Is Wrong:**
- Using 4-year-old instance type
- M6i.2xlarge: 15% better performance, same price
- M7g.2xlarge: 25% better price/performance
- Missing out on newer features and efficiency

**Better Approach:** Review and right-size quarterly

### ❌ Anti-Pattern 3: Ignoring Storage Costs

```hcl
# DON'T DO THIS
resource "aws_ebs_volume" "logs" {
  size = 1000  # 1 TB
  type = "gp3"
  # Storing logs that are never accessed
  # Cost: $80/month
}
```

**Why This Is Wrong:**
- Storing data that's never accessed
- Should use S3 for archival: $23/month (71% cheaper)
- Or delete old logs entirely

**Better Approach:**
```hcl
# Send logs to S3 with lifecycle policy
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "archive-old-logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"  # $0.0125/GB
    }

    transition {
      days          = 90
      storage_class = "GLACIER"  # $0.004/GB
    }

    expiration {
      days = 365  # Delete after 1 year
    }
  }
}
```

## Right-Sizing Process

### Step 1: Discover (Week 1)

```bash
# Enable detailed monitoring
aws ec2 monitor-instances --instance-ids i-1234567890abcdef0

# Install CloudWatch agent for memory metrics
# (CPU is available by default, memory requires agent)
```

### Step 2: Analyze (Week 2-3)

```python
# Python script to analyze CloudWatch metrics
import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch')

def analyze_instance(instance_id):
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=14)
    
    # Get CPU metrics
    cpu_response = cloudwatch.get_metric_statistics(
        Namespace='AWS/EC2',
        MetricName='CPUUtilization',
        Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
        StartTime=start_time,
        EndTime=end_time,
        Period=3600,
        Statistics=['Average', 'Maximum']
    )
    
    # Analyze results
    avg_cpu = sum(d['Average'] for d in cpu_response['Datapoints']) / len(cpu_response['Datapoints'])
    max_cpu = max(d['Maximum'] for d in cpu_response['Datapoints'])
    
    print(f"Instance {instance_id}:")
    print(f"  Average CPU: {avg_cpu:.1f}%")
    print(f"  Maximum CPU: {max_cpu:.1f}%")
    
    # Recommendation
    if avg_cpu < 20 and max_cpu < 40:
        print("  Recommendation: Consider downsizing")
    elif avg_cpu > 70:
        print("  Recommendation: Consider upsizing")
    else:
        print("  Recommendation: Current size is appropriate")
```

### Step 3: Test (Week 4)

```hcl
# Test right-sizing in non-production first
resource "aws_launch_template" "app_test" {
  name_prefix   = "app-test-"
  instance_type = "m5.large"  # Testing smaller size
  
  # Deploy to test environment
  # Monitor for 1 week
  # Verify performance is acceptable
}
```

### Step 4: Implement (Week 5)

```hcl
# Roll out to production with monitoring
resource "aws_launch_template" "app_prod" {
  name_prefix   = "app-prod-"
  instance_type = "m5.large"  # Implementing right-size
}

# Set up alarms to catch issues
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "app-cpu-high-after-rightsizing"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 70
}
```

### Step 5: Monitor (Ongoing)

```hcl
# Quarterly review
resource "aws_cloudwatch_event_rule" "quarterly_review" {
  name                = "quarterly-rightsizing-review"
  description         = "Trigger quarterly right-sizing review"
  schedule_expression = "cron(0 9 1 */3 *)"  # 9 AM on 1st of every 3rd month
}
```

## AWS Documentation Links

- [Right Sizing](https://aws.amazon.com/aws-cost-management/aws-cost-optimization/right-sizing/)
- [AWS Compute Optimizer](https://aws.amazon.com/compute-optimizer/)
- [Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [CloudWatch Metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html)
- [Instance Scheduler](https://aws.amazon.com/solutions/implementations/instance-scheduler/)

## Key Takeaways

1. ✅ **Monitor actual usage** for at least 2 weeks before right-sizing
2. ✅ **Start with non-production** environments to test changes
3. ✅ **Set up alarms** to catch if you under-sized
4. ✅ **Review quarterly** - usage patterns change over time
5. ✅ **Use AWS Compute Optimizer** for automated recommendations

## Quiz: Test Your Understanding

1. **What's the first step in right-sizing?**
   - A) Immediately downsize all instances
   - B) Monitor actual resource usage for 2+ weeks
   - C) Ask developers what they think they need
   - D) Use the smallest instance type possible

   <details>
   <summary>Answer</summary>
   B) Monitor actual resource usage for 2+ weeks. Right-sizing must be based on data, not guesses. You need to understand actual usage patterns before making changes.
   </details>

2. **Why is gp3 better than gp2 for most workloads?**
   - A) It's faster
   - B) It's 20% cheaper with same baseline performance
   - C) It has more storage
   - D) It's more secure

   <details>
   <summary>Answer</summary>
   B) It's 20% cheaper with same baseline performance. gp3 offers the same 3,000 IOPS baseline as gp2 but costs $0.08/GB-month vs $0.10/GB-month for gp2.
   </details>

3. **How much can you save by scheduling dev instances to run only during business hours?**
   - A) 10-20%
   - B) 30-40%
   - C) 50-60%
   - D) 70-75%

   <details>
   <summary>Answer</summary>
   D) 70-75%. Business hours (9 AM - 6 PM, Mon-Fri) are only 45 hours out of 168 hours per week, which is about 27% of the time. You save the other 73%.
   </details>
