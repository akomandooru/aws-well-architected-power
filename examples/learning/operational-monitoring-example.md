# Learning Example: Monitoring and Observability (Operational Excellence Pillar)

## Question

**"How do I know when something is wrong with my application before users complain?"**

## Detailed Explanation

### Why This Matters

Without proper monitoring, you're flying blind:
- **Reactive vs. Proactive**: You learn about issues from angry users instead of alerts
- **Long MTTR**: Mean Time To Resolution is high because you don't know what's broken
- **Revenue Impact**: Every minute of downtime costs money and customer trust
- **No Insights**: Can't optimize what you can't measure

### The Well-Architected Approach

The Operational Excellence Pillar principle "Understand operational health" recommends:
- **Define and calculate metrics** for all components
- **Establish baselines** for normal operation
- **Set up alerts** for deviations from normal
- **Create dashboards** for operational visibility
- **Implement distributed tracing** for complex systems

### Real-World Impact

**Case Study: E-commerce Site**
- **Before Monitoring**: Average 45 minutes to detect issues (via customer complaints)
- **After Monitoring**: Average 2 minutes to detect issues (via automated alerts)
- **Result**: 95% reduction in MTTR, 99.9% uptime achieved

## Real-World Example: Comprehensive Monitoring Stack

### Scenario
You have a three-tier web application:
- Application Load Balancer
- EC2 Auto Scaling Group (web servers)
- RDS PostgreSQL database
- ElastiCache Redis cluster

### ✅ Correct Pattern: Multi-Layer Monitoring

```hcl
# Terraform example - Complete monitoring setup

# 1. CloudWatch Dashboard for unified view
resource "aws_cloudwatch_dashboard" "app_health" {
  dashboard_name = "application-health-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # Load Balancer Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", {
              stat = "Average",
              label = "Avg Response Time"
            }],
            ["...", { stat = "p99", label = "P99 Response Time" }],
            [".", "RequestCount", { stat = "Sum", label = "Request Count" }],
            [".", "HTTPCode_Target_5XX_Count", {
              stat = "Sum",
              label = "5XX Errors",
              color = "#d62728"
            }],
            [".", "HTTPCode_Target_4XX_Count", {
              stat = "Sum",
              label = "4XX Errors",
              color = "#ff7f0e"
            }]
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Load Balancer Health"
          yAxis = {
            left = { min = 0 }
          }
        }
      },
      
      # Application Server Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", {
              stat = "Average",
              label = "Avg CPU"
            }],
            ["...", { stat = "Maximum", label = "Max CPU" }],
            [".", "StatusCheckFailed", {
              stat = "Sum",
              label = "Failed Health Checks"
            }]
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Application Server Health"
        }
      },
      
      # Database Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", {
              stat = "Average",
              label = "DB Connections"
            }],
            [".", "ReadLatency", { stat = "Average", label = "Read Latency" }],
            [".", "WriteLatency", { stat = "Average", label = "Write Latency" }],
            [".", "CPUUtilization", { stat = "Average", label = "DB CPU" }],
            [".", "FreeableMemory", {
              stat = "Average",
              label = "Free Memory"
            }]
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Database Health"
        }
      },
      
      # Cache Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CacheHitRate", {
              stat = "Average",
              label = "Cache Hit Rate"
            }],
            [".", "CPUUtilization", { stat = "Average", label = "Cache CPU" }],
            [".", "NetworkBytesIn", { stat = "Sum", label = "Network In" }],
            [".", "NetworkBytesOut", { stat = "Sum", label = "Network Out" }]
          ]
          period = 60
          stat   = "Average"
          region = "us-east-1"
          title  = "Cache Health"
        }
      }
    ]
  })
}

# 2. Critical Alarms - High Response Time
resource "aws_cloudwatch_metric_alarm" "high_response_time" {
  alarm_name          = "critical-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1.0  # 1 second
  alarm_description   = "Response time above 1 second for 2 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  alarm_actions = [
    aws_sns_topic.critical_alerts.arn,
    aws_sns_topic.pagerduty.arn  # Wake up on-call engineer
  ]
}

# 3. Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "critical-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10  # More than 10 errors per minute
  alarm_description   = "High 5XX error rate detected"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  alarm_actions = [
    aws_sns_topic.critical_alerts.arn,
    aws_sns_topic.pagerduty.arn
  ]
}

# 4. Database Connection Alarm
resource "aws_cloudwatch_metric_alarm" "db_connections_high" {
  alarm_name          = "warning-db-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80  # 80% of max connections
  alarm_description   = "Database connection pool near capacity"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.app.id
  }

  alarm_actions = [aws_sns_topic.warning_alerts.arn]
}

# 5. Composite Alarm - Overall Application Health
resource "aws_cloudwatch_composite_alarm" "app_health" {
  alarm_name          = "application-health-composite"
  alarm_description   = "Overall application health status"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]

  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.high_response_time.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.high_error_rate.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.db_connections_high.alarm_name})"
  ])
}

# 6. SNS Topics for Alerts
resource "aws_sns_topic" "critical_alerts" {
  name = "critical-alerts"
  
  # Encrypt messages
  kms_master_key_id = aws_kms_key.sns.id
}

resource "aws_sns_topic_subscription" "critical_email" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = "oncall@example.com"
}

resource "aws_sns_topic_subscription" "critical_slack" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "https"
  endpoint  = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
}

# 7. X-Ray for Distributed Tracing
resource "aws_xray_sampling_rule" "app_tracing" {
  rule_name      = "app-tracing"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.1  # Sample 10% of requests
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "my-app"
  resource_arn   = "*"
}

# 8. CloudWatch Logs Insights Queries
resource "aws_cloudwatch_query_definition" "slow_requests" {
  name = "Slow API Requests"

  log_group_names = [
    aws_cloudwatch_log_group.app.name
  ]

  query_string = <<-QUERY
    fields @timestamp, @message, duration, endpoint, statusCode, userId
    | filter duration > 1000
    | sort duration desc
    | limit 100
  QUERY
}

resource "aws_cloudwatch_query_definition" "error_analysis" {
  name = "Error Analysis"

  log_group_names = [
    aws_cloudwatch_log_group.app.name
  ]

  query_string = <<-QUERY
    fields @timestamp, @message, errorType, errorMessage, stackTrace
    | filter statusCode >= 500
    | stats count() by errorType
    | sort count desc
  QUERY
}

# 9. CloudWatch Agent for Custom Metrics
resource "aws_ssm_parameter" "cloudwatch_agent_config" {
  name  = "/cloudwatch-agent/config"
  type  = "String"
  value = jsonencode({
    metrics = {
      namespace = "CustomApp"
      metrics_collected = {
        mem = {
          measurement = [
            { name = "mem_used_percent", rename = "MemoryUtilization", unit = "Percent" }
          ]
          metrics_collection_interval = 60
        }
        disk = {
          measurement = [
            { name = "used_percent", rename = "DiskUtilization", unit = "Percent" }
          ]
          metrics_collection_interval = 60
          resources = ["*"]
        }
      }
    }
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path        = "/var/log/app/application.log"
              log_group_name   = aws_cloudwatch_log_group.app.name
              log_stream_name  = "{instance_id}/application.log"
              timezone         = "UTC"
            }
          ]
        }
      }
    }
  })
}
```

### Why This Works

#### 1. Multi-Layer Visibility
- **Load Balancer**: Request rates, response times, error rates
- **Application**: CPU, memory, disk usage
- **Database**: Connections, latency, CPU
- **Cache**: Hit rate, CPU, network

#### 2. Proactive Alerting
- **Critical Alarms**: Page on-call engineer immediately
- **Warning Alarms**: Email team for investigation
- **Composite Alarms**: Reduce alert fatigue by grouping related issues

#### 3. Root Cause Analysis
- **X-Ray Tracing**: See request flow through all services
- **CloudWatch Logs Insights**: Query logs for patterns
- **Custom Metrics**: Track application-specific metrics

#### 4. Actionable Insights
- **Dashboards**: Single pane of glass for operations
- **Saved Queries**: Quick access to common investigations
- **Automated Responses**: Can trigger Lambda for auto-remediation

## Common Anti-Patterns

### ❌ Anti-Pattern 1: No Monitoring

```hcl
# DON'T DO THIS - No monitoring at all!
resource "aws_instance" "app" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  # No CloudWatch agent
  # No custom metrics
  # No alarms
}
```

**Why This Is Dangerous:**
- No visibility into application health
- Learn about issues from users
- Long time to detect and resolve issues
- Can't identify performance trends
- No data for capacity planning

**Real-World Impact:**
- Average MTTR: 45+ minutes
- Customer complaints before detection
- Lost revenue during outages
- Difficulty troubleshooting issues

### ❌ Anti-Pattern 2: Alert Fatigue

```hcl
# DON'T DO THIS - Too many noisy alarms!
resource "aws_cloudwatch_metric_alarm" "cpu_any_spike" {
  alarm_name          = "cpu-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1  # Alert after just 1 minute!
  metric_name         = "CPUUtilization"
  period              = 60
  statistic           = "Average"
  threshold           = 50  # Too low!
  # Alerts 20+ times per day
}
```

**Why This Is Wrong:**
- Too sensitive: Alerts on normal spikes
- Team ignores alerts (boy who cried wolf)
- Real issues get missed in the noise
- On-call engineer burnout

**Better Approach:**
```hcl
resource "aws_cloudwatch_metric_alarm" "cpu_sustained_high" {
  alarm_name          = "cpu-sustained-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3  # 3 consecutive periods
  metric_name         = "CPUUtilization"
  period              = 300  # 5 minutes
  statistic           = "Average"
  threshold           = 80  # Reasonable threshold
  # Only alerts on sustained issues
}
```

### ❌ Anti-Pattern 3: Monitoring Without Context

```hcl
# DON'T DO THIS - Metrics without business context!
resource "aws_cloudwatch_metric_alarm" "high_latency" {
  alarm_name = "high-latency"
  threshold  = 1.0  # 1 second
  # But what's the business impact?
  # Is this for checkout or static content?
  # No context for prioritization
}
```

**Why This Is Wrong:**
- Can't prioritize alerts
- Don't know business impact
- Treat all issues equally
- Miss critical issues while fixing minor ones

**Better Approach:**
```hcl
# Separate alarms by criticality
resource "aws_cloudwatch_metric_alarm" "checkout_latency_critical" {
  alarm_name        = "CRITICAL-checkout-latency-high"
  alarm_description = "Checkout latency high - impacts revenue"
  threshold         = 2.0  # 2 seconds for checkout
  alarm_actions     = [aws_sns_topic.pagerduty.arn]  # Page immediately
  
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
    TargetGroup  = aws_lb_target_group.checkout.arn_suffix
  }
}

resource "aws_cloudwatch_metric_alarm" "static_latency_warning" {
  alarm_name        = "WARNING-static-content-latency"
  alarm_description = "Static content latency high - low priority"
  threshold         = 5.0  # 5 seconds for static content
  alarm_actions     = [aws_sns_topic.team_email.arn]  # Email only
  
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
    TargetGroup  = aws_lb_target_group.static.arn_suffix
  }
}
```

## The Four Golden Signals

Google's SRE book defines four key metrics to monitor:

### 1. Latency
**What:** Time to service a request
**Why:** Directly impacts user experience
**Threshold:** P99 latency < 1 second

```hcl
resource "aws_cloudwatch_metric_alarm" "p99_latency" {
  alarm_name          = "p99-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"  # 99th percentile
  threshold           = 1.0
}
```

### 2. Traffic
**What:** Demand on your system
**Why:** Understand load patterns and capacity needs
**Threshold:** Varies by application

```hcl
resource "aws_cloudwatch_metric_alarm" "traffic_spike" {
  alarm_name          = "traffic-spike-detected"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10000  # 10k requests/minute
  alarm_description   = "Unusual traffic spike - verify not attack"
}
```

### 3. Errors
**What:** Rate of failed requests
**Why:** Indicates problems with your application
**Threshold:** Error rate < 0.1%

```hcl
resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "error-rate-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  
  # Calculate error rate as percentage
  metric_query {
    id          = "error_rate"
    expression  = "(errors / requests) * 100"
    label       = "Error Rate %"
    return_data = true
  }
  
  metric_query {
    id = "errors"
    metric {
      metric_name = "HTTPCode_Target_5XX_Count"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
    }
  }
  
  metric_query {
    id = "requests"
    metric {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
    }
  }
  
  threshold = 1.0  # 1% error rate
}
```

### 4. Saturation
**What:** How "full" your service is
**Why:** Predict when you'll run out of capacity
**Threshold:** < 80% utilization

```hcl
resource "aws_cloudwatch_metric_alarm" "cpu_saturation" {
  alarm_name          = "cpu-saturation-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU saturation high - consider scaling"
}
```

## AWS Documentation Links

- [CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide/)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- [Operational Excellence Pillar](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)
- [Google SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)

## Key Takeaways

1. ✅ **Monitor the Four Golden Signals**: Latency, traffic, errors, saturation
2. ✅ **Set up proactive alerts**: Detect issues before users complain
3. ✅ **Create dashboards**: Single pane of glass for operations
4. ✅ **Use distributed tracing**: Understand request flows in complex systems
5. ✅ **Avoid alert fatigue**: Only alert on actionable issues

## Quiz: Test Your Understanding

1. **What are the Four Golden Signals?**
   - A) CPU, Memory, Disk, Network
   - B) Latency, Traffic, Errors, Saturation
   - C) Availability, Performance, Security, Cost
   - D) Requests, Responses, Timeouts, Failures

   <details>
   <summary>Answer</summary>
   B) Latency, Traffic, Errors, Saturation. These four metrics provide comprehensive visibility into system health and are recommended by Google's SRE practices.
   </details>

2. **Why should you use composite alarms?**
   - A) They're cheaper
   - B) They reduce alert fatigue by grouping related issues
   - C) They're faster
   - D) They're more secure

   <details>
   <summary>Answer</summary>
   B) They reduce alert fatigue by grouping related issues. Instead of getting 5 separate alerts for related problems, you get one composite alarm indicating overall system health.
   </details>

3. **What's the purpose of X-Ray distributed tracing?**
   - A) To encrypt data
   - B) To reduce costs
   - C) To understand request flows through multiple services
   - D) To improve performance

   <details>
   <summary>Answer</summary>
   C) To understand request flows through multiple services. X-Ray shows you how requests travel through your application, helping identify bottlenecks and failures in complex distributed systems.
   </details>
