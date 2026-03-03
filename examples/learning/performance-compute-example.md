# Learning Example: Compute Selection (Performance Efficiency Pillar)

## Question

**"How do I choose the right EC2 instance type for my application?"**

## Detailed Explanation

### Why This Matters

Choosing the wrong instance type can result in:
- **Over-provisioning**: Paying for resources you don't use (wasted money)
- **Under-provisioning**: Poor performance and user experience
- **Wrong optimization**: Using compute-optimized instances for memory-intensive workloads

AWS offers over 500 instance types across different families, each optimized for specific workload characteristics. Understanding your application's resource requirements is key to optimal performance and cost.

### The Well-Architected Approach

The Performance Efficiency Pillar principle "Consider mechanical sympathy" recommends:
- **Understand your workload characteristics**
- **Match instance types to workload requirements**
- **Use the latest generation instances**
- **Experiment with different instance types**
- **Monitor and adjust based on actual usage**

## Instance Family Overview

### Instance Family Categories

| Family | Optimization | Use Cases | Example Types |
|--------|-------------|-----------|---------------|
| **T** | Burstable | Development, low-traffic web servers | t3.medium, t4g.small |
| **M** | General Purpose | Balanced workloads, web apps | m6i.xlarge, m7g.large |
| **C** | Compute Optimized | CPU-intensive, batch processing | c6i.2xlarge, c7g.xlarge |
| **R** | Memory Optimized | In-memory databases, caching | r6g.xlarge, r7g.2xlarge |
| **X** | Memory Optimized | Large in-memory databases | x2gd.xlarge |
| **I** | Storage Optimized | NoSQL databases, data warehousing | i4i.xlarge |
| **G** | GPU | Machine learning, graphics | g5.xlarge, p4d.24xlarge |

### Generation Matters

- **Latest generation** (e.g., m7g, c7g): Best price/performance
- **Previous generation** (e.g., m5, c5): Still good, but older
- **Graviton processors** (g suffix): ARM-based, up to 40% better price/performance

## Real-World Examples

### Example 1: Web Application Server

**Scenario:** Node.js web application serving API requests
- Moderate CPU usage
- Low memory requirements (2-4 GB)
- Steady traffic with occasional spikes
- Not compute-intensive

#### ✅ Correct Choice: T3 or T4g (Burstable)

```hcl
# Terraform example
resource "aws_launch_template" "web_app" {
  name_prefix   = "web-app-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"  # 2 vCPU, 4 GB RAM, burstable

  # T3 provides baseline CPU with ability to burst
  # Perfect for web apps with variable load
  
  credit_specification {
    cpu_credits = "unlimited"  # Allow sustained bursting if needed
  }
}
```

**Why This Works:**
- **Baseline Performance**: 20% CPU baseline (0.4 vCPU) for steady-state
- **Burst Capability**: Can burst to 100% CPU when needed
- **Cost-Effective**: ~$30/month vs. ~$60/month for m6i.medium
- **CPU Credits**: Accumulate credits during low usage, spend during spikes

**Monitoring:**
```hcl
resource "aws_cloudwatch_metric_alarm" "cpu_credits" {
  alarm_name          = "web-app-cpu-credits-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUCreditBalance"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "Alert when CPU credits are running low"
}
```

### Example 2: Batch Processing Job

**Scenario:** Video transcoding service
- Very high CPU usage (90%+)
- Moderate memory requirements
- Runs continuously
- CPU-bound workload

#### ✅ Correct Choice: C6i or C7g (Compute Optimized)

```hcl
resource "aws_launch_template" "transcoder" {
  name_prefix   = "transcoder-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "c6i.2xlarge"  # 8 vCPU, 16 GB RAM
  
  # Compute-optimized: High CPU-to-memory ratio
  # Latest generation Intel processors
}

# Or use Graviton for better price/performance
resource "aws_launch_template" "transcoder_graviton" {
  name_prefix   = "transcoder-"
  image_id      = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "c7g.2xlarge"  # 8 vCPU, 16 GB RAM, Graviton3
  
  # Up to 25% better price/performance than c6i
  # Requires ARM-compatible software
}
```

**Why This Works:**
- **High CPU Performance**: Optimized for sustained CPU usage
- **Cost-Effective**: More CPU per dollar than general-purpose instances
- **Latest Generation**: c6i/c7g provide best performance
- **Graviton Option**: c7g offers even better price/performance

**Performance Comparison:**
- **T3.2xlarge**: $0.33/hour, but throttles after CPU credits exhausted
- **M6i.2xlarge**: $0.38/hour, balanced but not optimized for CPU
- **C6i.2xlarge**: $0.34/hour, optimized for sustained CPU workloads
- **C7g.2xlarge**: $0.29/hour, best price/performance with Graviton3

### Example 3: In-Memory Database (Redis)

**Scenario:** Redis cache for session storage
- Low CPU usage
- Very high memory requirements (64 GB+)
- Memory-intensive workload
- Requires fast memory access

#### ✅ Correct Choice: R6g or R7g (Memory Optimized)

```hcl
resource "aws_instance" "redis" {
  ami           = data.aws_ami.amazon_linux_2023_arm64.id
  instance_type = "r6g.2xlarge"  # 8 vCPU, 64 GB RAM
  
  # Memory-optimized: High memory-to-CPU ratio
  # Graviton2 for better price/performance
  
  ebs_optimized = true
  
  root_block_device {
    volume_type = "gp3"
    volume_size = 100
  }
}
```

**Why This Works:**
- **High Memory**: 64 GB RAM for large datasets
- **Memory-to-CPU Ratio**: 8:1 ratio (8 GB per vCPU)
- **Graviton2**: Up to 40% better price/performance
- **Network Performance**: Up to 10 Gbps for fast data access

**Memory Comparison:**
- **M6i.2xlarge**: 32 GB RAM, $0.38/hour
- **R6g.2xlarge**: 64 GB RAM, $0.40/hour (2x memory for similar price!)
- **X2gd.2xlarge**: 128 GB RAM, $0.67/hour (for even larger datasets)

### Example 4: Machine Learning Training

**Scenario:** Training deep learning models
- GPU acceleration required
- High memory requirements
- Parallel processing
- Training jobs run for hours

#### ✅ Correct Choice: G5 or P4 (GPU Instances)

```hcl
resource "aws_instance" "ml_training" {
  ami           = data.aws_ami.deep_learning_ami.id
  instance_type = "g5.xlarge"  # 4 vCPU, 16 GB RAM, 1x NVIDIA A10G GPU
  
  # GPU-optimized for ML training
  # NVIDIA A10G Tensor Core GPU
  
  ebs_optimized = true
  
  root_block_device {
    volume_type = "gp3"
    volume_size = 500
    iops        = 3000
  }
}

# For larger models, use P4 instances
resource "aws_instance" "ml_training_large" {
  ami           = data.aws_ami.deep_learning_ami.id
  instance_type = "p4d.24xlarge"  # 96 vCPU, 1152 GB RAM, 8x NVIDIA A100 GPUs
  
  # Top-tier GPU instance for large-scale training
  # 8x NVIDIA A100 GPUs with NVLink
}
```

**Why This Works:**
- **GPU Acceleration**: 10-100x faster than CPU for ML workloads
- **Tensor Cores**: Specialized hardware for matrix operations
- **High Memory**: Sufficient for large models and datasets
- **NVLink**: Fast GPU-to-GPU communication for multi-GPU training

**GPU Comparison:**
- **G5.xlarge**: $1.01/hour, 1x A10G GPU, good for inference and small training
- **G5.12xlarge**: $5.67/hour, 4x A10G GPUs, good for medium training jobs
- **P4d.24xlarge**: $32.77/hour, 8x A100 GPUs, best for large-scale training

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Using T3 for Sustained High CPU

```hcl
# DON'T DO THIS for CPU-intensive workloads!
resource "aws_instance" "batch_processor" {
  instance_type = "t3.2xlarge"  # Burstable instance
  # Running at 100% CPU continuously
}
```

**Why This Is Wrong:**
- T3 instances are designed for burstable workloads
- Sustained high CPU exhausts CPU credits
- Performance throttles to baseline (20% for t3.2xlarge)
- You're paying for 8 vCPUs but only getting 1.6 vCPUs worth of performance

**What Happens:**
1. Instance starts with CPU credit balance
2. High CPU usage depletes credits quickly
3. After credits exhausted, CPU throttles to 20% baseline
4. Your batch job that should take 1 hour now takes 5 hours
5. You're paying for an instance that's mostly idle

**Better Choice:** C6i.2xlarge for sustained CPU workloads

### ❌ Anti-Pattern 2: Using M5 for Memory-Intensive Workload

```hcl
# DON'T DO THIS for memory-intensive workloads!
resource "aws_instance" "database" {
  instance_type = "m5.4xlarge"  # 16 vCPU, 64 GB RAM
  # Running in-memory database that needs 64 GB
}
```

**Why This Is Wrong:**
- Paying for 16 vCPUs when you only need memory
- M5.4xlarge: $0.77/hour for 64 GB RAM
- R6g.2xlarge: $0.40/hour for 64 GB RAM (same memory, 48% cheaper!)

**Cost Impact:**
- Monthly cost difference: $266/month wasted
- Annual cost difference: $3,196/year wasted
- You're paying for CPU you don't use

**Better Choice:** R6g.2xlarge for memory-intensive workloads

### ❌ Anti-Pattern 3: Using Previous Generation Instances

```hcl
# DON'T DO THIS - using old generation!
resource "aws_instance" "app" {
  instance_type = "m4.xlarge"  # Previous generation
}
```

**Why This Is Wrong:**
- M4 is 3 generations old
- M6i provides 15% better performance at same price
- M7g provides 25% better price/performance
- Missing out on newer features (EBS optimization, enhanced networking)

**Performance Comparison (4 vCPU, 16 GB RAM):**
- **M4.xlarge**: $0.20/hour, older Xeon processors
- **M5.xlarge**: $0.19/hour, newer Xeon, better performance
- **M6i.xlarge**: $0.19/hour, latest Xeon, even better performance
- **M7g.xlarge**: $0.16/hour, Graviton3, best price/performance

**Better Choice:** Always use latest generation (M7g > M6i > M5 > M4)

## Decision Framework

### Step 1: Identify Workload Characteristics

Ask these questions:
1. **CPU Usage**: Low (<20%), Moderate (20-70%), High (>70%)?
2. **Memory Usage**: How much RAM does the application need?
3. **Traffic Pattern**: Steady, bursty, or variable?
4. **Workload Type**: Web app, batch processing, database, ML?

### Step 2: Choose Instance Family

| If your workload is... | Choose... |
|------------------------|-----------|
| Variable CPU, low-moderate usage | T3/T4g (Burstable) |
| Balanced CPU and memory | M6i/M7g (General Purpose) |
| CPU-intensive | C6i/C7g (Compute Optimized) |
| Memory-intensive | R6g/R7g (Memory Optimized) |
| Very large memory (>384 GB) | X2gd (High Memory) |
| Storage-intensive | I4i (Storage Optimized) |
| GPU workloads | G5/P4 (GPU) |

### Step 3: Choose Size

Start with monitoring:
```hcl
# Start with a reasonable size
instance_type = "m6i.large"  # 2 vCPU, 8 GB RAM

# Monitor for 1-2 weeks
# Check CloudWatch metrics:
# - CPUUtilization
# - MemoryUtilization (requires CloudWatch agent)
# - NetworkIn/NetworkOut
# - DiskReadOps/DiskWriteOps

# Adjust based on actual usage
```

### Step 4: Consider Graviton

Graviton instances offer up to 40% better price/performance:
- **Pros**: Better performance per dollar, lower power consumption
- **Cons**: Requires ARM-compatible software
- **Recommendation**: Use Graviton unless you have x86-specific dependencies

## AWS Documentation Links

- [EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Graviton Processors](https://aws.amazon.com/ec2/graviton/)
- [Burstable Performance Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html)
- [Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)
- [EC2 Instance Comparison](https://instances.vantage.sh/)

## Key Takeaways

1. ✅ **Match instance family to workload type** (compute, memory, GPU, etc.)
2. ✅ **Use latest generation instances** for best price/performance
3. ✅ **Consider Graviton** for up to 40% better price/performance
4. ✅ **Monitor actual usage** and adjust instance type accordingly
5. ✅ **Use burstable instances (T3/T4g) only for variable workloads**

## Quiz: Test Your Understanding

1. **When should you use T3 instances?**
   - A) For sustained high CPU workloads
   - B) For variable workloads with occasional spikes
   - C) For memory-intensive applications
   - D) For GPU workloads

   <details>
   <summary>Answer</summary>
   B) For variable workloads with occasional spikes. T3 instances are burstable and designed for workloads that don't use full CPU continuously.
   </details>

2. **What's the main benefit of Graviton instances?**
   - A) They're faster than Intel instances
   - B) They support more memory
   - C) They offer up to 40% better price/performance
   - D) They have more CPU cores

   <details>
   <summary>Answer</summary>
   C) They offer up to 40% better price/performance. Graviton processors are ARM-based and provide better performance per dollar than x86 instances.
   </details>

3. **Which instance family should you choose for an in-memory database?**
   - A) C6i (Compute Optimized)
   - B) T3 (Burstable)
   - C) R6g (Memory Optimized)
   - D) M6i (General Purpose)

   <details>
   <summary>Answer</summary>
   C) R6g (Memory Optimized). Memory-optimized instances provide the best memory-to-CPU ratio and are designed for memory-intensive workloads like in-memory databases.
   </details>
