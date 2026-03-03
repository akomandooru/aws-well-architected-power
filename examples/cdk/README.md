# CDK Cost Optimization Examples

This directory contains AWS CDK examples demonstrating common cost inefficiencies and their remediation according to AWS Well-Architected Framework best practices.

## Files

- **cost-optimization-issues.ts** - CDK stack with cost inefficiencies
- **cost-optimization-issues-fixed.ts** - Remediated version with cost optimizations
- **package.json** - NPM dependencies
- **tsconfig.json** - TypeScript configuration

## Cost Optimization Issues Demonstrated

### 1. Over-Provisioned EC2 Instance
**Issue:** Using c5.4xlarge (16 vCPUs, 32 GB) for development workload
**Cost Impact:** ~$500/month vs ~$30/month for right-sized instance
**Fix:** Use t3.medium with Spot instances and scheduled scaling

### 2. Fixed Capacity Without Auto Scaling
**Issue:** Running 5 Fargate tasks 24/7 regardless of load
**Cost Impact:** ~$150/month wasted during low-traffic periods
**Fix:** Implement auto scaling with Fargate Spot (70% savings)

### 3. S3 Without Lifecycle Policies
**Issue:** All objects remain in Standard storage class indefinitely
**Cost Impact:** 10x more expensive than Glacier for infrequently accessed data
**Fix:** Use Intelligent-Tiering and lifecycle transitions

### 4. Always-On Development Database
**Issue:** RDS instance running 24/7 for 8-hour workday
**Cost Impact:** ~$50/month wasted during off-hours
**Fix:** Use Aurora Serverless v2 that scales to zero

### 5. Missing Cost Allocation Tags
**Issue:** No tags for cost tracking and allocation
**Cost Impact:** Cannot identify cost drivers or allocate costs to teams
**Fix:** Implement comprehensive tagging strategy

### 6. Over-Provisioned ElastiCache
**Issue:** Using cache.r6g.xlarge with 3 nodes for development
**Cost Impact:** ~$400/month vs ~$15/month for right-sized cache
**Fix:** Use cache.t3.micro for dev, Reserved Nodes for production

### 7. NAT Gateway in Every AZ
**Issue:** Multiple NAT Gateways for development environment
**Cost Impact:** ~$100/month vs ~$35/month for single NAT Gateway
**Fix:** Use single NAT Gateway for dev, VPC endpoints to reduce data transfer

### 8. No Reserved Capacity
**Issue:** All resources using On-Demand pricing
**Cost Impact:** Missing 30-70% savings from commitments
**Fix:** Use Reserved Instances and Savings Plans for predictable workloads

### 9. Expensive Load Balancer for Low Traffic
**Issue:** Application Load Balancer for low-traffic dev environment
**Cost Impact:** ~$16/month base cost + data transfer
**Fix:** Consider alternatives like API Gateway for low traffic

### 10. No CloudWatch Logs Retention
**Issue:** Logs retained indefinitely
**Cost Impact:** Accumulating storage costs over time
**Fix:** Set retention period to 7-30 days based on requirements

### 11. Unoptimized Data Transfer
**Issue:** No CloudFront, no VPC endpoints
**Cost Impact:** Higher data transfer costs
**Fix:** Use CloudFront for static content, VPC endpoints for AWS services

### 12. No Cost Monitoring
**Issue:** No budgets, alarms, or cost tracking
**Cost Impact:** Unexpected bills, no visibility into spending
**Fix:** Implement CloudWatch dashboards, AWS Budgets, Cost Anomaly Detection

## Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Synthesize CloudFormation template (issues version)
npm run synth:issues

# Synthesize CloudFormation template (fixed version)
npm run synth:fixed
```

## Usage

### Analyze the Issues Stack

```bash
# Synthesize template
cdk synth -a 'npx ts-node cost-optimization-issues.ts'

# View differences (if stack exists)
cdk diff -a 'npx ts-node cost-optimization-issues.ts'

# Use AWS Well-Architected Power to review
# Ask Kiro: "Review this CDK code for cost optimization issues"
```

### Review the Fixed Version

```bash
# Compare the code
diff cost-optimization-issues.ts cost-optimization-issues-fixed.ts

# Synthesize fixed template
cdk synth -a 'npx ts-node cost-optimization-issues-fixed.ts'

# Review improvements with Kiro
# Ask Kiro: "Explain the cost optimizations in this CDK stack"
```

## Cost Optimization Strategies Applied

### 1. Right-Sizing (30-50% savings)
- T3 instances instead of C5 for variable workloads
- Appropriate memory and CPU allocation
- Regular review of CloudWatch metrics

### 2. Spot Instances (70-90% savings)
- EC2 Spot instances for fault-tolerant workloads
- Fargate Spot for containerized applications
- Spot/On-Demand mix for reliability

### 3. Auto Scaling (40-60% savings)
- Scale based on actual demand
- Schedule scaling for predictable patterns
- Scale to zero during off-hours for dev/test

### 4. Storage Optimization (50-90% savings)
- S3 Intelligent-Tiering for automatic optimization
- Lifecycle policies to transition to cheaper storage
- Delete old versions and incomplete uploads

### 5. Serverless (Pay-per-use)
- Aurora Serverless v2 for databases
- Lambda for event-driven workloads
- API Gateway for low-traffic APIs

### 6. Reserved Capacity (30-70% savings)
- Reserved Instances for predictable workloads
- Savings Plans for flexible commitments
- 1-year or 3-year terms based on stability

### 7. Network Optimization (30-50% savings)
- Single NAT Gateway for dev environments
- VPC endpoints to avoid NAT Gateway costs
- CloudFront for content delivery

### 8. Cost Monitoring
- CloudWatch dashboards for metrics
- AWS Budgets with alerts
- Cost Anomaly Detection
- Regular cost reviews

## Cost Comparison

### Monthly Cost Estimate (Development Environment)

| Resource | Issues Version | Fixed Version | Savings |
|----------|---------------|---------------|---------|
| EC2 Instances | $500 | $30 | 94% |
| ECS Fargate | $150 | $45 | 70% |
| RDS/Aurora | $50 | $10 | 80% |
| ElastiCache | $400 | $15 | 96% |
| NAT Gateway | $100 | $35 | 65% |
| S3 Storage | $50 | $15 | 70% |
| Load Balancer | $16 | $16 | 0% |
| **Total** | **$1,266** | **$166** | **87%** |

### Annual Savings: ~$13,200

## Testing with AWS Well-Architected Power

1. Open `cost-optimization-issues.ts` in your editor
2. Ask Kiro to review it: "Review this CDK code for Well-Architected cost optimization issues"
3. Compare findings with the documented issues above
4. Open `cost-optimization-issues-fixed.ts` to see the remediation
5. Ask Kiro to explain the cost savings

## Cost Optimization Tools

### AWS Native Tools
- **AWS Cost Explorer**: Analyze spending patterns
- **AWS Budgets**: Set spending limits and alerts
- **AWS Cost Anomaly Detection**: Detect unusual spending
- **AWS Compute Optimizer**: Right-sizing recommendations
- **AWS Trusted Advisor**: Cost optimization checks
- **AWS Cost and Usage Report**: Detailed billing data

### Third-Party Tools
- CloudHealth
- CloudCheckr
- Spot.io
- ProsperOps

## Best Practices Checklist

- [ ] Right-size all resources based on actual usage
- [ ] Use Spot instances for fault-tolerant workloads
- [ ] Implement auto scaling for variable workloads
- [ ] Schedule scaling for predictable patterns
- [ ] Use Reserved Instances/Savings Plans for stable workloads
- [ ] Implement S3 lifecycle policies
- [ ] Use appropriate storage classes
- [ ] Enable S3 Intelligent-Tiering
- [ ] Use Aurora Serverless for variable database workloads
- [ ] Implement comprehensive cost allocation tags
- [ ] Set up AWS Budgets with alerts
- [ ] Review costs monthly
- [ ] Delete unused resources
- [ ] Use VPC endpoints to reduce data transfer
- [ ] Implement CloudFront for static content
- [ ] Set CloudWatch Logs retention policies
- [ ] Use single NAT Gateway for dev/test
- [ ] Separate dev/test/prod accounts
- [ ] Review AWS Trusted Advisor recommendations
- [ ] Use AWS Cost Anomaly Detection

## Learning Resources

- [AWS Well-Architected Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
- [AWS Cost Management](https://aws.amazon.com/aws-cost-management/)
- [FinOps Foundation](https://www.finops.org/)

## Notes

- These examples are for learning and testing purposes only
- Do not deploy the issues stack to production
- Always review and customize configurations for your specific requirements
- Cost estimates are approximate and vary by region
- Consider using AWS Cost Calculator for accurate estimates
- Implement a FinOps culture in your organization
- Review costs regularly and optimize continuously
