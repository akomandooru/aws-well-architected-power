# Terraform Example with Security Issues
# This file demonstrates common security anti-patterns for testing and learning

# ISSUE 1: Unencrypted S3 Bucket
resource "aws_s3_bucket" "data_bucket" {
  bucket = "my-company-data-bucket"
  # Missing: server_side_encryption_configuration
}

# ISSUE 2: Overly Permissive IAM Policy
resource "aws_iam_policy" "admin_policy" {
  name        = "admin-policy"
  description = "Policy with excessive permissions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"              # Grants all actions
        Resource = "*"              # On all resources
      }
    ]
  })
}

# ISSUE 3: Unrestricted Security Group
resource "aws_security_group" "web_sg" {
  name        = "web-security-group"
  description = "Security group with unrestricted access"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allows all IPs on all ports
  }
}

# ISSUE 4: Unencrypted EBS Volume
resource "aws_ebs_volume" "data_volume" {
  availability_zone = "us-east-1a"
  size              = 100
  # Missing: encrypted = true
  # Missing: kms_key_id
}

# ISSUE 5: Publicly Accessible RDS Instance
resource "aws_db_instance" "database" {
  identifier           = "my-database"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "admin"
  password             = "hardcodedpassword123"  # Hardcoded password
  publicly_accessible  = true                     # Publicly accessible
  skip_final_snapshot  = true
  # Missing: storage_encrypted = true
}

# ISSUE 6: Security Group Allowing SSH from Anywhere
resource "aws_security_group" "ssh_sg" {
  name        = "ssh-access"
  description = "SSH access from anywhere"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SSH open to the world
  }
}

# ISSUE 7: CloudWatch Logs Not Encrypted
resource "aws_cloudwatch_log_group" "app_logs" {
  name = "/aws/app/logs"
  # Missing: kms_key_id for encryption
}

# ISSUE 8: Lambda Function with Overly Permissive Role
resource "aws_iam_role" "lambda_role" {
  name = "lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_admin" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"  # Full admin access
}

# Supporting VPC resource
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
