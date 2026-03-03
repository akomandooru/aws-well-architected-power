"""
Python Lambda Example - Well-Architected Compliant

This example demonstrates Well-Architected best practices for Python Lambda functions.
Fixes all issues from python-lambda-issues.py

Improvements:
1. ✅ Secrets from Secrets Manager (Security)
2. ✅ Comprehensive error handling (Reliability)
3. ✅ Retry logic with exponential backoff (Reliability)
4. ✅ Timeout configuration (Reliability)
5. ✅ Structured logging (Operational Excellence)
6. ✅ Custom metrics (Operational Excellence)
7. ✅ Efficient database queries (Performance)
8. ✅ Connection pooling (Performance)
9. ✅ LRU cache with size limit (Cost Optimization)
10. ✅ Proper resource cleanup (Cost Optimization)
"""

import boto3
import json
import logging
from functools import lru_cache
from botocore.config import Config
from botocore.exceptions import ClientError
from contextlib import closing
import psycopg2
from psycopg2 import pool

# ✅ Structured logging (Operational Excellence)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ✅ AWS SDK with retry and timeout configuration (Reliability)
config = Config(
    retries={'max_attempts': 3, 'mode': 'adaptive'},
    connect_timeout=5,
    read_timeout=10
)

dynamodb = boto3.client('dynamodb', config=config)
secrets_client = boto3.client('secretsmanager', config=config)
cloudwatch = boto3.client('cloudwatch', config=config)

# ✅ Connection pool for database (Performance)
db_pool = None

def get_db_pool():
    """Initialize database connection pool"""
    global db_pool
    if db_pool is None:
        creds = get_database_credentials()
        db_pool = psycopg2.pool.SimpleConnectionPool(
            1, 10,  # min and max connections
            host=creds['host'],
            database=creds['database'],
            user=creds['username'],
            password=creds['password'],
            sslmode='require'
        )
    return db_pool

# ✅ Secrets from Secrets Manager (Security)
@lru_cache(maxsize=1)
def get_database_credentials():
    """Retrieve database credentials from Secrets Manager"""
    try:
        response = secrets_client.get_secret_value(
            SecretId='prod/database/credentials'
        )
        return json.loads(response['SecretString'])
    except ClientError as e:
        logger.error(f"Failed to retrieve credentials: {e.response['Error']['Code']}")
        raise

# ✅ Input validation (Security)
def validate_user_id(user_id):
    """Validate user ID format"""
    import re
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, user_id.lower()):
        raise ValueError("Invalid user ID format")
    return user_id

# ✅ Custom metrics (Operational Excellence)
def put_metric(metric_name, value, unit='Count'):
    """Send custom metric to CloudWatch"""
    try:
        cloudwatch.put_metric_data(
            Namespace='MyApp/Lambda',
            MetricData=[{
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit
            }]
        )
    except Exception as e:
        logger.warning(f"Failed to send metric: {e}")

# ✅ Retry logic with exponential backoff (Reliability)
def get_user_from_dynamodb(user_id):
    """Get user from DynamoDB with retry logic"""
    try:
        response = dynamodb.get_item(
            TableName='users',
            Key={'userId': {'S': user_id}}
        )
        return response.get('Item')
    except ClientError as e:
        logger.error(f"DynamoDB error: {e.response['Error']['Code']}")
        raise

# ✅ Efficient database query (Performance)
def get_user_orders(user_id):
    """Get user orders with efficient query and connection pooling"""
    pool = get_db_pool()
    conn = pool.getconn()
    
    try:
        with closing(conn.cursor()) as cursor:
            # Single query instead of N+1
            cursor.execute(
                "SELECT * FROM orders WHERE user_id = %s LIMIT 100",
                (user_id,)  # Parameterized query prevents SQL injection
            )
            return cursor.fetchall()
    finally:
        # ✅ Resource cleanup (Cost Optimization)
        pool.putconn(conn)

def lambda_handler(event, context):
    """
    Lambda handler with Well-Architected best practices
    """
    request_id = context.request_id
    
    # ✅ Structured logging with context (Operational Excellence)
    logger.info(json.dumps({
        'event': 'lambda_invocation',
        'request_id': request_id,
        'function_name': context.function_name
    }))
    
    try:
        # ✅ Input validation (Security)
        user_id = validate_user_id(event['userId'])
        
        logger.info(json.dumps({
            'event': 'processing_user',
            'user_id': user_id,
            'request_id': request_id
        }))
        
        # ✅ Error handling with retry (Reliability)
        user_data = get_user_from_dynamodb(user_id)
        
        if not user_data:
            logger.warning(json.dumps({
                'event': 'user_not_found',
                'user_id': user_id,
                'request_id': request_id
            }))
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'})
            }
        
        # ✅ Efficient query with connection pooling (Performance)
        orders = get_user_orders(user_id)
        
        # ✅ Custom metrics (Operational Excellence)
        put_metric('UserRequestSuccess', 1)
        put_metric('OrdersRetrieved', len(orders))
        
        logger.info(json.dumps({
            'event': 'request_completed',
            'user_id': user_id,
            'order_count': len(orders),
            'request_id': request_id
        }))
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'user': user_data,
                'orders': orders
            })
        }
        
    except ValueError as e:
        # ✅ Secure error handling (Security)
        logger.error(json.dumps({
            'event': 'validation_error',
            'error_type': 'ValueError',
            'request_id': request_id
        }))
        put_metric('ValidationError', 1)
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid input'})
        }
        
    except ClientError as e:
        # ✅ Error handling without exposing details (Security)
        logger.error(json.dumps({
            'event': 'aws_error',
            'error_code': e.response['Error']['Code'],
            'request_id': request_id
        }))
        put_metric('AWSError', 1)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
        
    except Exception as e:
        # ✅ Catch-all error handling (Reliability)
        logger.error(json.dumps({
            'event': 'unexpected_error',
            'error_type': type(e).__name__,
            'request_id': request_id
        }), exc_info=True)
        put_metric('UnexpectedError', 1)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
