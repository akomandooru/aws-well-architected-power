// CDK Example with Cost Optimization Issues
// This file demonstrates common cost inefficiencies for testing and learning

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';

export class CostOptimizationIssuesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ISSUE 1: Over-Provisioned EC2 Instance for Development
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
    });

    // Using expensive compute-optimized instance for simple dev workload
    const instance = new ec2.Instance(this, 'DevInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.C5,
        ec2.InstanceSize.XLARGE4  // 16 vCPUs, 32 GB RAM - overkill for dev
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      // Missing: No instance scheduling for dev environment
      // Missing: No Spot instance usage
    });

    // ISSUE 2: Fixed Capacity Without Auto Scaling
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 2048,  // Fixed memory allocation
      cpu: 1024,             // Fixed CPU allocation
    });

    taskDefinition.addContainer('app', {
      image: ecs.ContainerImage.fromRegistry('nginx'),
      memoryLimitMiB: 2048,
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 5,  // Fixed count - runs 5 tasks 24/7 regardless of load
      // Missing: Auto scaling configuration
      // Missing: Fargate Spot usage
    });

    // ISSUE 3: S3 Bucket Without Lifecycle Policies
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      versioned: true,
      // Missing: Lifecycle rules to transition to cheaper storage classes
      // Missing: Intelligent-Tiering
      // Missing: Expiration policies for old versions
    });

    // ISSUE 4: Always-On Development Database
    const devDatabase = new rds.DatabaseInstance(this, 'DevDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_7,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.LARGE  // Larger than needed for dev
      ),
      vpc,
      allocatedStorage: 100,
      // Runs 24/7 even though dev team only works 8 hours/day
      // Missing: Aurora Serverless option
      // Missing: Scheduled start/stop
      // Missing: Storage auto-scaling
    });

    // ISSUE 5: Missing Cost Allocation Tags
    // No tags for cost tracking and allocation
    // Missing: Environment tag (dev/staging/prod)
    // Missing: CostCenter tag
    // Missing: Project tag
    // Missing: Owner tag

    // ISSUE 6: Over-Provisioned ElastiCache
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for ElastiCache',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    const cache = new elasticache.CfnCacheCluster(this, 'Cache', {
      cacheNodeType: 'cache.r6g.xlarge',  // Expensive memory-optimized instance
      engine: 'redis',
      numCacheNodes: 3,  // Fixed 3 nodes regardless of usage
      cacheSubnetGroupName: cacheSubnetGroup.ref,
      // Missing: Smaller node type for dev/test
      // Missing: Reserved instance purchase for production
    });

    // ISSUE 7: NAT Gateway in Every AZ
    // VPC created with default settings uses NAT Gateway per AZ
    // For dev/test, single NAT Gateway or NAT Instance would be cheaper
    // Missing: NAT instance option for non-production
    // Missing: VPC endpoints to avoid NAT Gateway data transfer costs

    // ISSUE 8: No Reserved Capacity or Savings Plans
    // All resources use On-Demand pricing
    // Missing: Reserved Instances for predictable workloads
    // Missing: Savings Plans commitment
    // Missing: Spot instances for fault-tolerant workloads

    // ISSUE 9: Expensive Load Balancer for Low Traffic
    const loadBalancedService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'LoadBalancedService',
      {
        cluster,
        taskDefinition,
        desiredCount: 2,
        // Application Load Balancer costs ~$16/month + data transfer
        // For low-traffic dev environment, could use API Gateway or CloudFront
      }
    );

    // ISSUE 10: No CloudWatch Logs Retention Policy
    // Logs retained indefinitely, accumulating costs
    // Missing: Log retention period
    // Missing: Log aggregation and filtering

    // ISSUE 11: Unoptimized Data Transfer
    // Missing: CloudFront for static content
    // Missing: VPC endpoints for AWS services
    // Missing: S3 Transfer Acceleration consideration

    // ISSUE 12: Development Resources in Production Account
    // Dev and prod resources in same account without cost separation
    // Missing: Separate AWS accounts for environments
    // Missing: AWS Organizations with consolidated billing

    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: dataBucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: devDatabase.dbInstanceEndpointAddress,
      description: 'Database Endpoint',
    });
  }
}

// Usage
const app = new cdk.App();
new CostOptimizationIssuesStack(app, 'CostOptimizationIssuesStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
