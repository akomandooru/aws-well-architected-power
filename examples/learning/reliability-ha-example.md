# Learning Example: High Availability Architecture (Reliability Pillar)

## Question

**"How do I ensure my application stays available even if an AWS data center fails?"**

## Detailed Explanation

### Why This Matters

AWS Availability Zones (AZs) are physically separate data centers within a region. While rare, AZ failures do occur due to:
- Power outages
- Network connectivity issues
- Natural disasters
- Hardware failures

A single-AZ deployment means your entire application goes down if that AZ experiences issues. Multi-AZ deployments ensure your application continues running even when an entire data center fails.

### The Well-Architected Approach

The Reliability Pillar principle "Scale horizontally to increase aggregate workload availability" recommends:
- **Deploy across multiple Availability Zones**
- **Use load balancing to distribute traffic**
- **Design for automatic failover**
- **Eliminate single points of failure**

### Real-World Impact

**Case Study: AWS US-EAST-1 Outage (December 2021)**
- A single AZ in us-east-1 experienced power issues
- Applications deployed only in that AZ went completely offline
- Multi-AZ applications continued running with no downtime
- Single-AZ customers experienced 7+ hours of downtime
- Multi-AZ customers experienced zero downtime

## Real-World Example: Correct Implementation

### Scenario
You're building an e-commerce application that must be highly available. The architecture includes:
- Web application servers
- Application load balancer
- PostgreSQL database
- Redis cache

### ✅ Correct Pattern: Multi-AZ High Availability Architecture

```hcl
# Terraform example - Complete multi-AZ architecture

# Get available AZs in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC spanning multiple AZs
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# Public subnets in 3 AZs for load balancers
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-${count.index + 1}"
    Tier = "public"
  }
}

# Private subnets in 3 AZs for application servers
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

# Private subnets in 3 AZs for databases
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

# Application Load Balancer spanning all AZs
resource "aws_lb" "app" {
  name               = "app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection       = true
  enable_cross_zone_load_balancing = true
  enable_http2                     = true

  tags = {
    Name = "app-alb"
  }
}

# Target group with health checks
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

# Auto Scaling Group with instances in all AZs
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private_app[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  # Minimum: one instance per AZ
  min_size         = 3
  max_size         = 15
  desired_capacity = 6  # Two per AZ for redundancy

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Ensure even distribution across AZs
  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMinSize",
    "GroupMaxSize",
    "GroupTotalInstances"
  ]

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# RDS PostgreSQL with Multi-AZ automatic failover
resource "aws_db_subnet_group" "app" {
  name       = "app-db-subnet-group"
  subnet_ids = aws_subnet.private_data[*].id

  tags = {
    Name = "app-db-subnet-group"
  }
}

resource "aws_db_instance" "app" {
  identifier     = "app-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"

  # Multi-AZ configuration - CRITICAL for high availability
  multi_az = true

  # Storage
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true

  # Network
  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  # Backup for disaster recovery
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  
  # Maintenance window (different from backup window)
  maintenance_window = "mon:04:00-mon:05:00"

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn

  # Protection
  deletion_protection       = true
  skip_final_snapshot      = false
  final_snapshot_identifier = "app-database-final-snapshot"

  tags = {
    Name = "app-database"
  }
}

# ElastiCache Redis with Multi-AZ automatic failover
resource "aws_elasticache_subnet_group" "app" {
  name       = "app-cache-subnet-group"
  subnet_ids = aws_subnet.private_data[*].id
}

resource "aws_elasticache_replication_group" "app" {
  replication_group_id       = "app-cache"
  replication_group_description = "Application cache cluster"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 3  # One primary + two replicas

  # Multi-AZ configuration - CRITICAL for high availability
  automatic_failover_enabled = true
  multi_az_enabled          = true

  # Network
  subnet_group_name  = aws_elasticache_subnet_group.app.name
  security_group_ids = [aws_security_group.cache.id]

  # Backup
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"

  # Maintenance
  maintenance_window = "sun:05:00-sun:07:00"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  tags = {
    Name = "app-cache"
  }
}
```

### Why This Works

#### Load Balancer Layer
- **Cross-Zone Load Balancing**: Distributes traffic evenly across all AZs
- **Health Checks**: Automatically removes unhealthy instances from rotation
- **Multiple AZs**: If one AZ fails, load balancer routes all traffic to healthy AZs

#### Application Layer
- **Minimum 3 Instances**: At least one instance per AZ ensures availability
- **Auto Scaling**: Automatically replaces failed instances
- **Even Distribution**: Auto Scaling ensures instances are spread across AZs
- **Health Checks**: ELB health checks detect and replace unhealthy instances

#### Database Layer
- **RDS Multi-AZ**: Synchronous replication to standby in different AZ
- **Automatic Failover**: Typically completes in 60-120 seconds
- **No Data Loss**: Synchronous replication ensures zero data loss
- **Transparent to Application**: Connection string stays the same after failover

#### Cache Layer
- **Redis Cluster Mode**: Primary in one AZ, replicas in other AZs
- **Automatic Failover**: Promotes replica to primary if primary fails
- **Read Replicas**: Can serve read traffic from multiple AZs

### Failover Scenarios

**Scenario 1: AZ-A Fails Completely**
1. Load balancer stops routing traffic to AZ-A (within seconds)
2. Traffic automatically routes to instances in AZ-B and AZ-C
3. RDS automatically fails over to standby in AZ-B (60-120 seconds)
4. Redis automatically promotes replica in AZ-B to primary (< 60 seconds)
5. Auto Scaling launches replacement instances in AZ-B and AZ-C
6. **Result**: Brief performance degradation, but no downtime

**Scenario 2: Single Instance Fails**
1. Health check fails after 3 consecutive failures (90 seconds)
2. Load balancer stops routing traffic to that instance
3. Auto Scaling launches replacement instance
4. **Result**: No user impact, other instances handle the load

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Single-AZ Deployment

```hcl
# DON'T DO THIS!
resource "aws_instance" "app" {
  ami               = "ami-12345678"
  instance_type     = "t3.large"
  availability_zone = "us-east-1a"  # Only one AZ!
  subnet_id         = aws_subnet.single_az.id
}

resource "aws_db_instance" "app" {
  identifier  = "app-database"
  multi_az    = false  # Single AZ!
  # ... other configuration
}
```

**Why This Is Dangerous:**
- Entire application goes down if AZ fails
- No automatic failover capability
- Maintenance windows require downtime
- Single point of failure

**Real-World Impact:**
- Expected availability: 99.5% (43 hours downtime per year)
- With multi-AZ: 99.95% (4.3 hours downtime per year)
- During AZ outages: 100% downtime vs. 0% downtime

### ❌ Anti-Pattern 2: Insufficient Instance Count

```hcl
# DON'T DO THIS!
resource "aws_autoscaling_group" "app" {
  min_size         = 1  # Only one instance!
  max_size         = 3
  desired_capacity = 1
  # If this instance fails, there's a gap until replacement launches
}
```

**Why This Is Dangerous:**
- No redundancy during instance replacement
- Can't handle traffic during deployments
- No capacity for rolling updates
- Single point of failure at application layer

**Better Approach:**
- Minimum: Number of AZs (e.g., 3 for 3 AZs)
- Desired: 2x number of AZs for redundancy
- This ensures at least one instance per AZ always running

### ❌ Anti-Pattern 3: No Health Checks

```hcl
# DON'T DO THIS!
resource "aws_lb_target_group" "app" {
  name     = "app-targets"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  # No health_check block!
  # Uses defaults: checks every 30s, but may not detect app failures
}
```

**Why This Is Dangerous:**
- Load balancer may route traffic to unhealthy instances
- Application failures not detected quickly
- Users experience errors instead of automatic failover
- Increases mean time to recovery (MTTR)

**Better Approach:**
```hcl
health_check {
  enabled             = true
  healthy_threshold   = 2      # 2 successful checks = healthy
  unhealthy_threshold = 3      # 3 failed checks = unhealthy
  timeout             = 5      # 5 second timeout
  interval            = 30     # Check every 30 seconds
  path                = "/health"  # Application health endpoint
  matcher             = "200"  # Expected HTTP status
}
```

## Rationale: Why Multi-AZ Matters

### Availability Mathematics

**Single AZ:**
- AZ availability: 99.99%
- Application availability: 99.99% (at best)
- Annual downtime: ~52 minutes

**Multi-AZ (3 AZs):**
- Probability all 3 AZs fail simultaneously: 0.01% × 0.01% × 0.01% = 0.000000001%
- Application availability: 99.999%+ (five nines)
- Annual downtime: ~5 minutes

### Cost vs. Benefit

**Additional Cost:**
- ~2x infrastructure cost (running instances in multiple AZs)
- Minimal data transfer costs between AZs

**Benefits:**
- Eliminates downtime from AZ failures
- Enables zero-downtime deployments
- Allows maintenance without downtime
- Improves performance (lower latency to users in different locations)

**ROI Calculation:**
For an e-commerce site doing $1M/day:
- 1 hour downtime = $41,667 lost revenue
- Multi-AZ cost: ~$500/month additional
- Break-even: Prevents just 17 minutes of downtime per year

## AWS Documentation Links

- [Regions and Availability Zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)
- [High Availability with Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
- [Auto Scaling Groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html)
- [Reliability Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)

## Key Takeaways

1. ✅ **Always deploy across at least 3 AZs** for production workloads
2. ✅ **Enable Multi-AZ for databases** (RDS, ElastiCache, etc.)
3. ✅ **Use Auto Scaling with minimum = number of AZs** to ensure coverage
4. ✅ **Configure comprehensive health checks** to detect failures quickly
5. ✅ **Test failover scenarios** regularly to ensure they work as expected

## Quiz: Test Your Understanding

1. **What happens when an RDS Multi-AZ primary fails?**
   - A) All data is lost
   - B) Manual intervention is required to fail over
   - C) Automatic failover to standby occurs in 60-120 seconds
   - D) The database is unavailable until the primary recovers

   <details>
   <summary>Answer</summary>
   C) Automatic failover to standby occurs in 60-120 seconds. RDS Multi-AZ uses synchronous replication and automatic failover with no data loss.
   </details>

2. **Why should Auto Scaling minimum size equal the number of AZs?**
   - A) It's cheaper
   - B) It ensures at least one instance per AZ for availability
   - C) It's required by AWS
   - D) It improves performance

   <details>
   <summary>Answer</summary>
   B) It ensures at least one instance per AZ for availability. This guarantees your application continues running even if an entire AZ fails.
   </details>

3. **What does cross-zone load balancing do?**
   - A) Distributes traffic evenly across all AZs
   - B) Reduces costs
   - C) Improves security
   - D) Enables HTTPS

   <details>
   <summary>Answer</summary>
   A) Distributes traffic evenly across all AZs. Without it, traffic is only distributed within each AZ, which can lead to uneven load distribution.
   </details>
