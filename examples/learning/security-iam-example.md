# Learning Example: IAM Best Practices (Security Pillar)

## Question

**"How should I manage access credentials for my EC2 instances that need to access S3?"**

## Detailed Explanation

### Why This Matters

Identity and Access Management (IAM) is the foundation of AWS security. How you manage credentials determines whether your infrastructure is secure or vulnerable to compromise. Using long-term credentials (access keys) creates several risks:

1. **Credential Exposure**: Access keys can be accidentally committed to version control, logged, or exposed in memory dumps
2. **Difficult Rotation**: Manually rotating keys across multiple instances is error-prone and often neglected
3. **Broad Permissions**: Shared credentials often have overly broad permissions to work across multiple use cases
4. **No Audit Trail**: It's difficult to track which instance or application used shared credentials

### The Well-Architected Approach

The Security Pillar principle "Implement a strong identity foundation" recommends:
- **Use IAM roles instead of long-term credentials**
- **Apply least privilege access**
- **Eliminate the need to manage credentials manually**

## Real-World Example: Correct Implementation

### Scenario
You have a web application running on EC2 that needs to:
- Read configuration files from S3
- Write application logs to S3
- Nothing else

### ✅ Correct Pattern: IAM Role with Least Privilege

```hcl
# Terraform example
resource "aws_iam_role" "web_app_role" {
  name = "web-app-ec2-role"

  # Trust policy: Allow EC2 to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# Permission policy: Only what's needed
resource "aws_iam_role_policy" "web_app_s3_access" {
  name = "web-app-s3-access"
  role = aws_iam_role.web_app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "arn:aws:s3:::my-config-bucket/config/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "arn:aws:s3:::my-logs-bucket/app-logs/*"
      }
    ]
  })
}

# Instance profile to attach role to EC2
resource "aws_iam_instance_profile" "web_app_profile" {
  name = "web-app-instance-profile"
  role = aws_iam_role.web_app_role.name
}

# EC2 instance with the role attached
resource "aws_instance" "web_app" {
  ami                  = "ami-12345678"
  instance_type        = "t3.medium"
  iam_instance_profile = aws_iam_instance_profile.web_app_profile.name
  
  # No access keys needed in user data or configuration!
}
```

### Why This Works

1. **No Credentials to Manage**: The EC2 instance automatically receives temporary credentials from the instance metadata service
2. **Automatic Rotation**: AWS rotates the temporary credentials every few hours automatically
3. **Least Privilege**: The role can only read from the config path and write to the logs path - nothing else
4. **Audit Trail**: CloudTrail logs show exactly which instance (by instance ID) performed each action
5. **No Exposure Risk**: No long-term credentials exist that could be leaked

### Application Code

Your application code uses the AWS SDK, which automatically discovers and uses the IAM role credentials:

```python
import boto3

# No credentials needed in code!
s3 = boto3.client('s3')

# Read config
response = s3.get_object(Bucket='my-config-bucket', Key='config/app.json')
config = response['Body'].read()

# Write logs
s3.put_object(Bucket='my-logs-bucket', Key='app-logs/app.log', Body=log_data)
```

## Common Anti-Patterns

### ❌ Anti-Pattern 1: Hardcoded Access Keys

```python
# DON'T DO THIS!
import boto3

s3 = boto3.client(
    's3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
)
```

**Why This Is Dangerous:**
- Credentials are visible in code and version control
- Anyone with access to the code has full access to your AWS resources
- Credentials never expire unless manually rotated
- If compromised, attacker has persistent access
- Difficult to revoke access without breaking all applications using these keys

**Real-World Impact:**
- GitHub has found millions of exposed AWS credentials in public repositories
- Attackers use automated tools to scan for exposed keys
- Compromised keys are often used for cryptocurrency mining, costing thousands of dollars
- Average time to detect compromised keys: 4 days (during which damage accumulates)

### ❌ Anti-Pattern 2: Overly Permissive Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:*",
    "Resource": "*"
  }]
}
```

**Why This Is Dangerous:**
- Grants full S3 access to all buckets in the account
- If the instance is compromised, attacker can access all S3 data
- Violates the principle of least privilege
- Makes it impossible to determine what permissions are actually needed
- Increases blast radius of any security incident

**Real-World Impact:**
- Capital One breach (2019): Overly permissive IAM role allowed attacker to access 100 million customer records
- The role had permissions to list and read from all S3 buckets
- Proper least privilege would have limited the breach to a single application's data

### ❌ Anti-Pattern 3: Shared IAM Role Across Applications

```hcl
# DON'T DO THIS!
resource "aws_iam_role" "shared_app_role" {
  name = "shared-application-role"
  # Used by web app, batch jobs, and admin scripts
}

resource "aws_iam_role_policy" "shared_policy" {
  role = aws_iam_role.shared_app_role.id
  
  policy = jsonencode({
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:*",
        "dynamodb:*",
        "sqs:*"
      ]
      Resource = "*"
    }]
  })
}
```

**Why This Is Dangerous:**
- Each application gets permissions it doesn't need
- Difficult to audit which application performed which action
- Can't revoke access for one application without affecting others
- Violates separation of duties
- Makes security reviews and compliance audits difficult

**Better Approach:**
Create separate roles for each application with only the permissions that specific application needs.

## Rationale: Why IAM Roles Are Superior

### Technical Benefits

1. **Temporary Credentials**: Credentials expire automatically (typically every 6 hours)
2. **Automatic Rotation**: No manual intervention required
3. **No Storage Required**: Credentials are never stored on disk or in code
4. **Metadata Service**: Credentials are retrieved securely from the EC2 metadata service (IMDSv2)

### Security Benefits

1. **Reduced Attack Surface**: No long-term credentials to steal
2. **Audit Trail**: CloudTrail logs include the role session name and instance ID
3. **Easy Revocation**: Detach the role or update the policy to immediately revoke access
4. **Least Privilege**: Each role can have precisely the permissions needed

### Operational Benefits

1. **No Credential Management**: No keys to rotate, store, or distribute
2. **Scalability**: Works automatically for any number of instances
3. **Consistency**: Same pattern works for EC2, ECS, Lambda, and other services
4. **Compliance**: Meets requirements for credential rotation and least privilege

## AWS Documentation Links

- [IAM Roles for Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Security Pillar - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [Least Privilege Principle](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege)
- [Using Instance Profiles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)

## Key Takeaways

1. ✅ **Always use IAM roles for EC2 instances** - never use access keys
2. ✅ **Apply least privilege** - grant only the specific permissions needed
3. ✅ **Create separate roles per application** - don't share roles
4. ✅ **Use specific resource ARNs** - avoid wildcards in Resource fields
5. ✅ **Test your permissions** - verify the role works with minimal permissions before deployment

## Quiz: Test Your Understanding

1. **Why are IAM roles better than access keys for EC2 instances?**
   - A) They're easier to create
   - B) They provide temporary credentials that rotate automatically
   - C) They're faster
   - D) They cost less

   <details>
   <summary>Answer</summary>
   B) They provide temporary credentials that rotate automatically. This eliminates the need to manage long-term credentials and reduces the risk of credential exposure.
   </details>

2. **What does "least privilege" mean in IAM?**
   - A) Using the smallest instance type
   - B) Granting only the minimum permissions required to perform a task
   - C) Having the fewest number of users
   - D) Using the cheapest AWS services

   <details>
   <summary>Answer</summary>
   B) Granting only the minimum permissions required to perform a task. This limits the potential damage if credentials are compromised.
   </details>

3. **What's wrong with this policy: `"Resource": "*"`?**
   - A) It's too expensive
   - B) It grants access to all resources instead of specific ones
   - C) It doesn't work
   - D) Nothing, it's a best practice

   <details>
   <summary>Answer</summary>
   B) It grants access to all resources instead of specific ones. This violates least privilege and increases the blast radius of any security incident.
   </details>
