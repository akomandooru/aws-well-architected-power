# Application Code Reliability Patterns

## Overview

This section extends the Reliability Pillar guidance to cover application code reliability patterns. Reliable applications handle failures gracefully, implement retry logic, use timeouts, and include circuit breakers to prevent cascading failures.

### Application Reliability Principles

1. **Handle all errors gracefully**: Catch and handle exceptions appropriately
2. **Implement retry logic with exponential backoff**: Retry transient failures with increasing delays
3. **Set timeouts for all external calls**: Prevent hanging operations
4. **Use circuit breakers**: Prevent cascading failures by failing fast
5. **Implement fallback mechanisms**: Provide degraded functionality when dependencies fail
6. **Log failures for analysis**: Track errors to identify patterns and root causes

## Language-Specific Reliability Patterns

### Python Reliability Patterns

#### Pattern 1: Retry Logic with Exponential Backoff

**Reliable Implementation:**
```python
import boto3
import time
from botocore.exceptions import ClientError
from botocore.config import Config

# Configure boto3 with retry logic
config = Config(
    retries={
        'max_attempts': 5,
        'mode': 'adaptive'  # Adaptive retry mode adjusts based on response
    },
    connect_timeout=5,
    read_timeout=10
)

dynamodb = boto3.resource('dynamodb', config=config)

def exponential_backoff_retry(func, max_retries=5, base_delay=1):
    """
    Retry function with exponential backoff
    """
    for attempt in range(max_retries):
        try:
            return func()
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            # Don't retry on client errors (4xx)
            if error_code in ['ValidationException', 'ResourceNotFoundException']:
                raise
            
            # Retry on throttling and server errors (5xx)
            if attempt == max_retries - 1:
                raise
            
            # Calculate delay with exponential backoff and jitter
            delay = base_delay * (2 ** attempt) + (time.time() % 1)
            print(f"Retry attempt {attempt + 1} after {delay:.2f}s")
            time.sleep(delay)
    
    raise Exception("Max retries exceeded")

# Usage example
def put_item_with_retry():
    table = dynamodb.Table('users')
    
    def put_operation():
        return table.put_item(
            Item={
                'userId': '12345',
                'name': 'John Doe',
                'email': 'john@example.com'
            }
        )
    
    return exponential_backoff_retry(put_operation)
```

**Why This Is Reliable:**
- Adaptive retry mode adjusts to service conditions
- Exponential backoff prevents overwhelming the service
- Jitter prevents thundering herd problem
- Distinguishes between retryable and non-retryable errors
- Timeouts prevent hanging operations

#### Pattern 2: Circuit Breaker Pattern

**Reliable Implementation:**
```python
import time
from enum import Enum
from typing import Callable, Any

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60, success_threshold=2):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.success_threshold = success_threshold
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        self.failure_count = 0
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
    
    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Usage example
import boto3

s3_client = boto3.client('s3')
s3_circuit_breaker = CircuitBreaker(failure_threshold=3, timeout=30)

def get_object_with_circuit_breaker(bucket, key):
    try:
        return s3_circuit_breaker.call(
            s3_client.get_object,
            Bucket=bucket,
            Key=key
        )
    except Exception as e:
        print(f"Circuit breaker prevented call or operation failed: {e}")
        # Return cached data or default value
        return get_cached_object(bucket, key)
```

**Why This Is Reliable:**
- Prevents cascading failures by failing fast
- Automatically recovers when service is healthy
- Reduces load on failing services
- Provides fallback mechanism
- Configurable thresholds for different scenarios


#### Pattern 3: Timeout Configuration

**Reliable Implementation:**
```python
import boto3
from botocore.config import Config
import signal
from contextlib import contextmanager

# Configure AWS SDK with timeouts
config = Config(
    connect_timeout=5,  # Connection timeout
    read_timeout=10,    # Read timeout
    retries={'max_attempts': 3}
)

lambda_client = boto3.client('lambda', config=config)

@contextmanager
def timeout(seconds):
    """Context manager for operation timeout"""
    def timeout_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    # Set the signal handler
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        signal.alarm(0)  # Disable the alarm

def invoke_lambda_with_timeout(function_name, payload):
    """Invoke Lambda with timeout protection"""
    try:
        with timeout(30):  # Overall operation timeout
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=payload
            )
            return response['Payload'].read()
    except TimeoutError as e:
        print(f"Lambda invocation timed out: {e}")
        # Return default response or trigger fallback
        return {'error': 'timeout', 'message': str(e)}
    except Exception as e:
        print(f"Lambda invocation failed: {e}")
        raise
```

**Why This Is Reliable:**
- Prevents indefinite waiting
- Multiple timeout layers (connection, read, operation)
- Graceful handling of timeout errors
- Allows fallback mechanisms
- Protects against slow dependencies


### Java Reliability Patterns

#### Pattern 1: Retry with AWS SDK for Java v2

**Reliable Implementation:**
```java
import software.amazon.awssdk.core.retry.RetryPolicy;
import software.amazon.awssdk.core.retry.backoff.BackoffStrategy;
import software.amazon.awssdk.core.retry.conditions.RetryCondition;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import java.time.Duration;

public class ReliableDynamoDBClient {
    
    private final DynamoDbClient dynamoDb;
    
    public ReliableDynamoDBClient() {
        // Configure retry policy with exponential backoff
        RetryPolicy retryPolicy = RetryPolicy.builder()
                .numRetries(5)
                .backoffStrategy(BackoffStrategy.defaultStrategy())
                .throttlingBackoffStrategy(BackoffStrategy.defaultThrottlingStrategy())
                .retryCondition(RetryCondition.defaultRetryCondition())
                .build();
        
        this.dynamoDb = DynamoDbClient.builder()
                .overrideConfiguration(config -> config
                        .retryPolicy(retryPolicy)
                        .apiCallTimeout(Duration.ofSeconds(30))
                        .apiCallAttemptTimeout(Duration.ofSeconds(10)))
                .build();
    }
    
    public void putItemWithRetry(String tableName, Map<String, AttributeValue> item) {
        try {
            PutItemRequest request = PutItemRequest.builder()
                    .tableName(tableName)
                    .item(item)
                    .build();
            
            dynamoDb.putItem(request);
            System.out.println("Item successfully written");
        } catch (DynamoDbException e) {
            System.err.println("Failed to put item: " + e.getMessage());
            throw e;
        }
    }
}
```

**Why This Is Reliable:**
- Built-in retry policy with exponential backoff
- Separate timeouts for overall call and individual attempts
- Throttling-specific backoff strategy
- Automatic retry on transient failures
- Type-safe error handling


### TypeScript/Node.js Reliability Patterns

#### Pattern 1: Retry with AWS SDK v3

**Reliable Implementation:**
```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Configure client with retry and timeout
const client = new DynamoDBClient({
    maxAttempts: 5,
    requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
    },
});

const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

async function putItemWithRetry(tableName: string, item: Record<string, any>): Promise<void> {
    const command = new PutCommand({
        TableName: tableName,
        Item: item,
    });
    
    try {
        await docClient.send(command);
        console.log('Item successfully written');
    } catch (error) {
        console.error('Failed to put item:', error.name);
        throw error;
    }
}

// Manual retry with exponential backoff
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 5,
    baseDelay: number = 1000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            // Don't retry on client errors
            if (error.name === 'ValidationException' || error.name === 'ResourceNotFoundException') {
                throw error;
            }
            
            if (attempt === maxRetries - 1) {
                throw error;
            }
            
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw new Error('Max retries exceeded');
}
```

**Why This Is Reliable:**
- AWS SDK handles retries automatically
- Configurable connection and request timeouts
- Manual retry wrapper for custom logic
- Exponential backoff with jitter
- Type-safe error handling with TypeScript


## Common Application Code Reliability Anti-Patterns

### ❌ Anti-Pattern 1: No Error Handling

**Bad Example:**
```python
# DON'T DO THIS
def get_user(user_id):
    response = dynamodb.get_item(
        TableName='users',
        Key={'userId': user_id}
    )
    return response['Item']  # Crashes if item doesn't exist
```

**Fix:**
```python
# DO THIS
def get_user(user_id):
    try:
        response = dynamodb.get_item(
            TableName='users',
            Key={'userId': user_id}
        )
        return response.get('Item')
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return None
        raise
```

---

### ❌ Anti-Pattern 2: No Timeout Configuration

**Bad Example:**
```typescript
// DON'T DO THIS
const client = new DynamoDBClient({});  // No timeout
```

**Fix:**
```typescript
// DO THIS
const client = new DynamoDBClient({
    requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
    },
});
```

---

### ❌ Anti-Pattern 3: Infinite Retry Loop

**Bad Example:**
```java
// DON'T DO THIS
while (true) {
    try {
        return performOperation();
    } catch (Exception e) {
        // Retry forever
    }
}
```

**Fix:**
```java
// DO THIS
int maxRetries = 5;
for (int attempt = 0; attempt < maxRetries; attempt++) {
    try {
        return performOperation();
    } catch (Exception e) {
        if (attempt == maxRetries - 1) throw e;
        Thread.sleep(1000 * (long)Math.pow(2, attempt));
    }
}
```

## Application Code Reliability Checklist

### Error Handling
- [ ] All AWS SDK calls wrapped in try-catch blocks
- [ ] Errors logged with appropriate context
- [ ] Graceful degradation when dependencies fail
- [ ] User-friendly error messages (no stack traces)
- [ ] Failed operations tracked in metrics

### Retry Logic
- [ ] Retry logic implemented for transient failures
- [ ] Exponential backoff with jitter
- [ ] Maximum retry attempts configured
- [ ] Non-retryable errors identified (4xx client errors)
- [ ] Retry metrics tracked

### Timeouts
- [ ] Connection timeout configured
- [ ] Read/request timeout configured
- [ ] Overall operation timeout set
- [ ] Timeout values appropriate for operation
- [ ] Timeout errors handled gracefully

### Circuit Breakers
- [ ] Circuit breakers for external dependencies
- [ ] Failure threshold configured
- [ ] Timeout period set for recovery
- [ ] Half-open state for testing recovery
- [ ] Circuit state monitored and alerted

### Fallback Mechanisms
- [ ] Fallback logic for critical operations
- [ ] Cached data used when service unavailable
- [ ] Default values provided when appropriate
- [ ] Degraded functionality documented
- [ ] Fallback usage tracked in metrics

## Language-Specific Reliability Libraries

### Python
- **tenacity**: Advanced retry library with multiple strategies
- **pybreaker**: Circuit breaker implementation
- **boto3**: Built-in retry with botocore.config
- **asyncio**: For async/await patterns with timeouts

### Java
- **Resilience4j**: Circuit breaker, retry, rate limiter
- **Failsafe**: Fault tolerance library
- **AWS SDK for Java v2**: Built-in retry policies
- **Hystrix**: Netflix circuit breaker (maintenance mode)

### TypeScript/Node.js
- **axios-retry**: HTTP retry with exponential backoff
- **opossum**: Circuit breaker implementation
- **p-retry**: Promise-based retry
- **AWS SDK v3**: Built-in retry configuration

### Go
- **go-retryablehttp**: HTTP client with retry
- **gobreaker**: Circuit breaker
- **context**: Built-in timeout and cancellation
- **AWS SDK for Go v2**: Configurable retry modes

### C#
- **Polly**: Resilience and transient fault handling
- **AWS SDK for .NET**: Built-in retry policies
- **Task.WhenAny**: For timeout patterns
- **CancellationToken**: For operation cancellation

### Ruby
- **retriable**: Retry with exponential backoff
- **circuitbox**: Circuit breaker
- **AWS SDK for Ruby v3**: Configurable retry
- **Timeout**: Built-in timeout module

## Summary

Application code reliability is essential for building resilient systems. Key takeaways:

1. **Handle all errors** - Never let exceptions crash your application
2. **Implement retry logic** - Use exponential backoff with jitter
3. **Set timeouts** - Prevent hanging operations at all levels
4. **Use circuit breakers** - Fail fast to prevent cascading failures
5. **Provide fallbacks** - Degrade gracefully when dependencies fail
6. **Monitor and alert** - Track failures, retries, and circuit breaker states

By implementing these patterns across all supported languages, you ensure your applications can withstand and recover from failures automatically.

## Additional Resources

- [AWS SDK Retry Behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)
- [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [AWS Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)

