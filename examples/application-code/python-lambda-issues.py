"""
Python Lambda Example with Well-Architected Issues

This example demonstrates common anti-patterns in Python Lambda functions.
See python-lambda-fixed.py for the corrected version.

Issues Present:
1. Hardcoded credentials (Security)
2. No error handling (Reliability)
3. No retry logic (Reliability)
4. No timeout configuration (Reliability)
5. No logging (Operational Excellence)
6. No metrics (Operational Excellence)
7. Inefficient database queries (Performance)
8. No connection pooling (Performance)
9. Memory leaks (Cost Optimization)
10. No resource cleanup (Cost Optimization)
"""

import boto3
import psycopg2

# ❌ ISSUE 1: Hardcoded credentials (Security - Critical)
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DB_PASSWORD = "MySecretPassword123!"

# ❌ ISSUE 2: No connection pooling (Performance - High)
# Creates new connection for every invocation
def get_db_connection():
    return psycopg2.connect(
        host="mydb.example.com",
        database="myapp",
        user="admin",
        password=DB_PASSWORD  # Also hardcoded!
    )

# ❌ ISSUE 3: Global state causing memory leaks (Cost - Medium)
cache = {}  # Never cleaned up, grows indefinitely

def lambda_handler(event, context):
    user_id = event['userId']
    
    # ❌ ISSUE 4: No input validation (Security - High)
    # Could lead to SQL injection or invalid data
    
    # ❌ ISSUE 5: No error handling (Reliability - Critical)
    # Any exception will crash the function
    
    # ❌ ISSUE 6: No logging (Operational Excellence - High)
    # Can't debug or monitor function behavior
    
    # ❌ ISSUE 7: No timeout configuration (Reliability - Medium)
    dynamodb = boto3.client('dynamodb')  # No timeout set
    
    # ❌ ISSUE 8: No retry logic (Reliability - High)
    # Transient failures will cause immediate failure
    response = dynamodb.get_item(
        TableName='users',
        Key={'userId': {'S': user_id}}
    )
    
    user_data = response['Item']
    
    # ❌ ISSUE 9: Inefficient database query (Performance - High)
    # N+1 query problem
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get user orders one by one
    cursor.execute(f"SELECT * FROM orders WHERE user_id = '{user_id}'")
    orders = cursor.fetchall()
    
    # ❌ ISSUE 10: No resource cleanup (Cost - Medium)
    # Connection and cursor not closed
    
    # ❌ ISSUE 11: Memory leak (Cost - High)
    # Cache grows indefinitely
    cache[user_id] = user_data
    
    # ❌ ISSUE 12: No metrics (Operational Excellence - Medium)
    # Can't track function performance or business KPIs
    
    return {
        'statusCode': 200,
        'body': {'user': user_data, 'orders': orders}
    }
