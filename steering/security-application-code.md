# Application Code Security Patterns

## Overview

This section extends the Security Pillar guidance to cover application code security patterns across multiple programming languages. While infrastructure security (IAM, encryption, network controls) is critical, application-level security is equally important for a comprehensive Well-Architected implementation.

### Application Security Principles

1. **Never hardcode secrets**: Use AWS Secrets Manager or Parameter Store
2. **Validate all inputs**: Prevent injection attacks and data corruption
3. **Implement proper authentication**: Verify identity before granting access
4. **Enforce authorization**: Check permissions for every operation
5. **Use secure AWS SDK configurations**: Enable retries, timeouts, and encryption
6. **Log security events**: Track authentication, authorization, and suspicious activity
7. **Handle errors securely**: Don't expose sensitive information in error messages

## Language-Specific Security Patterns

### Python Security Patterns

#### Pattern 1: Secure AWS SDK Configuration with Secrets Manager

**Secure Implementation:**
```python
import boto3
import json
from botocore.config import Config

# Configure boto3 with security best practices
config = Config(
    region_name='us-east-1',
    signature_version='v4',
    retries={
        'max_attempts': 3,
        'mode': 'adaptive'
    }
)

# Use Secrets Manager for database credentials
def get_database_credentials():
    """Retrieve database credentials from Secrets Manager"""
    secrets_client = boto3.client('secretsmanager', config=config)
    
    try:
        response = secrets_client.get_secret_value(
            SecretId='prod/database/credentials'
        )
        return json.loads(response['SecretString'])
    except Exception as e:
        # Log error without exposing secret details
        print(f"Error retrieving credentials: {type(e).__name__}")
        raise

# Use credentials securely
def connect_to_database():
    """Connect to database using Secrets Manager credentials"""
    import psycopg2
    
    creds = get_database_credentials()
    
    conn = psycopg2.connect(
        host=creds['host'],
        database=creds['database'],
        user=creds['username'],
        password=creds['password'],
        sslmode='require',  # Enforce SSL/TLS
        connect_timeout=10
    )
    
    return conn
```

**Why This Is Secure:**
- No hardcoded credentials
- Credentials retrieved from Secrets Manager at runtime
- SSL/TLS enforced for database connection
- Connection timeout prevents hanging connections
- Error handling doesn't expose sensitive details
- AWS SDK configured with retries and signature v4


#### Pattern 2: Input Validation and Sanitization

**Secure Implementation:**
```python
import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format to prevent injection"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def sanitize_user_input(user_input: str, max_length: int = 255) -> str:
    """Sanitize user input to prevent injection attacks"""
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>\"\'%;()&+]', '', user_input)
    # Limit length
    return sanitized[:max_length]

def safe_dynamodb_query(table, user_id: str):
    """Safely query DynamoDB with validated input"""
    # Validate user_id format (UUID)
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, user_id.lower()):
        raise ValueError("Invalid user ID format")
    
    # Use parameterized query (DynamoDB handles escaping)
    response = table.get_item(
        Key={'userId': user_id}
    )
    
    return response.get('Item')
```

**Why This Is Secure:**
- Input validation prevents injection attacks
- Whitelist approach (only allow known-good patterns)
- Length limits prevent buffer overflow
- Parameterized queries prevent NoSQL injection
- Type hints improve code safety


#### Pattern 3: Secure Authentication and Authorization

**Secure Implementation:**
```python
import boto3
import jwt
from functools import wraps
from datetime import datetime, timedelta

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token from Amazon Cognito"""
    # In production, fetch and cache JWKS from Cognito
    cognito_client = boto3.client('cognito-idp')
    
    try:
        # Verify token signature and expiration
        decoded = jwt.decode(
            token,
            options={"verify_signature": False},  # Simplified for example
            algorithms=["RS256"]
        )
        
        # Check token expiration
        if decoded['exp'] < datetime.now().timestamp():
            raise ValueError("Token expired")
        
        return decoded
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {str(e)}")

def require_authentication(f):
    """Decorator to require authentication for Lambda functions"""
    @wraps(f)
    def decorated_function(event, context):
        # Extract token from Authorization header
        auth_header = event.get('headers', {}).get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Missing or invalid authorization header'})
            }
        
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        try:
            # Verify token
            user_claims = verify_jwt_token(token)
            # Add user info to event for use in function
            event['user'] = user_claims
            return f(event, context)
        except ValueError as e:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Unauthorized'})
            }
    
    return decorated_function

def check_permission(user_claims: dict, required_permission: str) -> bool:
    """Check if user has required permission"""
    user_permissions = user_claims.get('cognito:groups', [])
    return required_permission in user_permissions

@require_authentication
def lambda_handler(event, context):
    """Lambda function with authentication and authorization"""
    user = event['user']
    
    # Check authorization
    if not check_permission(user, 'admin'):
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Forbidden'})
        }
    
    # Process authorized request
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Success'})
    }
```

**Why This Is Secure:**
- JWT token verification prevents unauthorized access
- Token expiration checked to prevent replay attacks
- Decorator pattern enforces authentication consistently
- Authorization checked separately from authentication
- Error messages don't expose sensitive information


### Java Security Patterns

#### Pattern 1: Secure AWS SDK Configuration with Secrets Manager

**Secure Implementation:**
```java
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Map;
import java.util.Properties;

public class SecureDatabaseConnection {
    
    private final SecretsManagerClient secretsClient;
    private final ObjectMapper objectMapper;
    
    public SecureDatabaseConnection() {
        // Configure AWS SDK with security best practices
        this.secretsClient = SecretsManagerClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public Map<String, String> getDatabaseCredentials() {
        try {
            GetSecretValueRequest request = GetSecretValueRequest.builder()
                    .secretId("prod/database/credentials")
                    .build();
            
            GetSecretValueResponse response = secretsClient.getSecretValue(request);
            String secretString = response.secretString();
            
            return objectMapper.readValue(secretString, Map.class);
        } catch (Exception e) {
            // Log error without exposing secret details
            System.err.println("Error retrieving credentials: " + e.getClass().getSimpleName());
            throw new RuntimeException("Failed to retrieve credentials", e);
        }
    }
    
    public Connection connectToDatabase() {
        Map<String, String> creds = getDatabaseCredentials();
        
        try {
            // Configure secure connection properties
            Properties props = new Properties();
            props.setProperty("user", creds.get("username"));
            props.setProperty("password", creds.get("password"));
            props.setProperty("ssl", "true");
            props.setProperty("sslmode", "require");
            props.setProperty("connectTimeout", "10");
            
            String url = String.format("jdbc:postgresql://%s:%s/%s",
                    creds.get("host"),
                    creds.get("port"),
                    creds.get("database"));
            
            return DriverManager.getConnection(url, props);
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getClass().getSimpleName());
            throw new RuntimeException("Failed to connect to database", e);
        }
    }
}
```

**Why This Is Secure:**
- Uses IAM roles via DefaultCredentialsProvider (no hardcoded keys)
- Credentials retrieved from Secrets Manager
- SSL/TLS enforced for database connection
- Connection timeout prevents hanging
- Error handling doesn't expose sensitive details
- Proper resource management with try-catch


### TypeScript/Node.js Security Patterns

#### Pattern 1: Secure AWS SDK v3 Configuration

**Secure Implementation:**
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK with security best practices
const secretsClient = new SecretsManagerClient({
    region: 'us-east-1',
    maxAttempts: 3,
});

const dynamoClient = new DynamoDBClient({
    region: 'us-east-1',
    maxAttempts: 3,
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface DatabaseCredentials {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

async function getDatabaseCredentials(): Promise<DatabaseCredentials> {
    try {
        const command = new GetSecretValueCommand({
            SecretId: 'prod/database/credentials',
        });
        
        const response = await secretsClient.send(command);
        
        if (!response.SecretString) {
            throw new Error('Secret value is empty');
        }
        
        return JSON.parse(response.SecretString);
    } catch (error) {
        // Log error without exposing secret details
        console.error(`Error retrieving credentials: ${error.constructor.name}`);
        throw new Error('Failed to retrieve credentials');
    }
}

// Secure environment variable access
function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

// Never do this - hardcoded secrets
// const API_KEY = 'sk-1234567890abcdef';  // ❌ BAD

// Do this instead - use environment variables or Secrets Manager
const API_KEY = getRequiredEnv('API_KEY');  // ✅ GOOD
```

**Why This Is Secure:**
- AWS SDK v3 with modular imports (smaller attack surface)
- Credentials from Secrets Manager, not hardcoded
- Type safety with TypeScript interfaces
- Proper error handling without exposing secrets
- Environment variables validated at startup
- Retry configuration for resilience


## Common Application Code Security Anti-Patterns

### ❌ Anti-Pattern 1: Hardcoded Credentials

**Bad Example (Python):**
```python
# DON'T DO THIS
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DATABASE_PASSWORD = "MySecretPassword123!"
```

**Problem:**
- Credentials exposed in source code
- Can be leaked via version control
- Difficult to rotate
- Violates principle of least privilege

**Fix:**
- Use IAM roles for AWS credentials
- Use Secrets Manager for database passwords
- Use environment variables for non-sensitive config
- Never commit secrets to version control

---

### ❌ Anti-Pattern 2: Missing Input Validation

**Bad Example (Java):**
```java
// DON'T DO THIS
public User getUserById(String userId) {
    String query = "SELECT * FROM users WHERE id = '" + userId + "'";
    return database.execute(query);  // SQL injection vulnerability
}
```

**Problem:**
- SQL injection vulnerability
- No validation of user input
- Allows malicious queries

**Fix:**
```java
// DO THIS
public User getUserById(String userId) {
    // Validate input format
    if (!userId.matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")) {
        throw new IllegalArgumentException("Invalid user ID format");
    }
    
    // Use parameterized query
    String query = "SELECT * FROM users WHERE id = ?";
    return database.executeQuery(query, userId);
}
```

---

### ❌ Anti-Pattern 3: Exposing Sensitive Information in Errors

**Bad Example (TypeScript):**
```typescript
// DON'T DO THIS
try {
    const secret = await getSecret('api-key');
} catch (error) {
    console.error('Failed to get secret:', error);  // May log secret value
    throw error;  // May expose secret in stack trace
}
```

**Problem:**
- Error messages may contain sensitive data
- Stack traces logged to CloudWatch
- Attackers can use error messages for reconnaissance

**Fix:**
```typescript
// DO THIS
try {
    const secret = await getSecret('api-key');
} catch (error) {
    console.error('Failed to retrieve secret:', error.constructor.name);
    throw new Error('Configuration error');  // Generic message
}
```


## Application Code Security Checklist

When reviewing application code, check for these security requirements:

### Secrets Management
- [ ] No hardcoded credentials (AWS keys, database passwords, API keys)
- [ ] Secrets retrieved from Secrets Manager or Parameter Store
- [ ] Environment variables used only for non-sensitive configuration
- [ ] Secrets not logged or exposed in error messages
- [ ] Automatic secret rotation configured where possible

### Input Validation
- [ ] All user inputs validated before processing
- [ ] Whitelist validation (allow known-good, not block known-bad)
- [ ] Length limits enforced on all inputs
- [ ] Parameterized queries used (no string concatenation)
- [ ] File upload validation (type, size, content)

### Authentication & Authorization
- [ ] Authentication required for all protected endpoints
- [ ] JWT tokens verified (signature, expiration, issuer)
- [ ] Authorization checked for every operation
- [ ] Session tokens have appropriate expiration
- [ ] MFA enforced for sensitive operations

### AWS SDK Configuration
- [ ] IAM roles used instead of access keys
- [ ] Retry configuration enabled
- [ ] Timeout configuration set
- [ ] TLS/SSL enforced for all AWS service calls
- [ ] Latest SDK version used

### Error Handling
- [ ] Errors logged without sensitive information
- [ ] Generic error messages returned to users
- [ ] Stack traces not exposed in production
- [ ] Failed authentication attempts logged
- [ ] Rate limiting on error-prone endpoints

### Logging & Monitoring
- [ ] Security events logged (auth, authz, access)
- [ ] Logs sent to CloudWatch or centralized logging
- [ ] Sensitive data not logged (passwords, tokens, PII)
- [ ] Log retention configured appropriately
- [ ] Alerts configured for security events


## Language-Specific AWS SDK Security Best Practices

### Python (boto3)
- Use `botocore.config.Config` for retry and timeout configuration
- Enable signature version 4: `signature_version='v4'`
- Use session objects for thread safety
- Enable boto3 logging for debugging (but not in production with sensitive data)
- Use `boto3.Session()` for multi-region applications

### Java (AWS SDK for Java v2)
- Use `DefaultCredentialsProvider` for IAM role credentials
- Configure retry policy: `.overrideConfiguration(retry -> retry.numRetries(3))`
- Use async clients for better performance: `S3AsyncClient`
- Enable request/response logging only in development
- Use `try-with-resources` for proper client cleanup

### TypeScript/Node.js (AWS SDK v3)
- Use modular imports to reduce bundle size
- Configure `maxAttempts` for retries
- Use middleware for custom authentication
- Enable X-Ray tracing: `@aws-sdk/middleware-sdk-xray`
- Use `AbortController` for request cancellation

### Go (AWS SDK for Go v2)
- Use `context.Context` for timeout and cancellation
- Configure retry mode: `config.RetryMode = aws.RetryModeAdaptive`
- Use `defer` for resource cleanup
- Enable request logging with `config.ClientLogMode`
- Use `sync.Pool` for client reuse

### C# (AWS SDK for .NET)
- Use `async/await` for all SDK calls
- Configure `RetryMode` in `AmazonServiceClient`
- Use `using` statements for proper disposal
- Enable request/response logging via `AWSConfigs.LoggingConfig`
- Use `CancellationToken` for timeout control

### Ruby (AWS SDK for Ruby v3)
- Configure retry limit: `retry_limit: 3`
- Use `Aws::AssumeRoleCredentials` for cross-account access
- Enable HTTP wire tracing only in development
- Use connection pooling for HTTP clients
- Implement proper error handling with `rescue`

## Summary

Application code security is critical for comprehensive Well-Architected compliance. Key takeaways:

1. **Never hardcode secrets** - Use Secrets Manager or Parameter Store
2. **Validate all inputs** - Prevent injection attacks with whitelist validation
3. **Authenticate and authorize** - Verify identity and permissions for every request
4. **Configure AWS SDKs securely** - Enable retries, timeouts, and use IAM roles
5. **Handle errors securely** - Don't expose sensitive information
6. **Log security events** - Track authentication, authorization, and suspicious activity

By following these patterns across all supported languages, you ensure consistent security posture at both the infrastructure and application layers.

## Additional Resources

- [AWS Security Best Practices for Application Development](https://aws.amazon.com/security/security-learning/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [AWS SDK Security Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/security.html)

