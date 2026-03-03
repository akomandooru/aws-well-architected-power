# Application Code Cost Optimization Patterns

## Overview

This section covers application code patterns that reduce costs through efficient resource usage, proper cleanup, and algorithm optimization.

### Application Cost Optimization Principles

1. **Clean up resources**: Close connections, delete temporary files, release memory
2. **Use efficient algorithms**: Optimize time and space complexity
3. **Reuse resources**: Connection pooling, object reuse
4. **Implement proper shutdown**: Graceful termination with cleanup
5. **Monitor resource usage**: Track memory, CPU, and network usage
6. **Right-size operations**: Process only what's needed

## Python Cost Optimization Patterns

### Pattern 1: Resource Cleanup

```python
import boto3
from contextlib import contextmanager

@contextmanager
def s3_client():
    """Context manager for S3 client with automatic cleanup"""
    client = boto3.client('s3')
    try:
        yield client
    finally:
        # Cleanup happens automatically
        pass

def process_s3_file(bucket, key):
    """Process S3 file with proper resource management"""
    with s3_client() as s3:
        # Download file
        response = s3.get_object(Bucket=bucket, Key=key)
        
        # Process in chunks to avoid loading entire file in memory
        chunk_size = 1024 * 1024  # 1MB chunks
        for chunk in response['Body'].iter_chunks(chunk_size):
            process_chunk(chunk)
        
        # Body is automatically closed when exiting context

# Database connection cleanup
from contextlib import closing

def query_database():
    """Query with automatic connection cleanup"""
    with closing(get_db_connection()) as conn:
        with closing(conn.cursor()) as cursor:
            cursor.execute("SELECT * FROM users LIMIT 100")
            return cursor.fetchall()
```

### Pattern 2: Efficient Data Processing

```python
def process_large_dataset_efficiently(items):
    """Process large dataset with generators (memory efficient)"""
    # BAD: Loads everything in memory
    # results = [expensive_operation(item) for item in items]
    
    # GOOD: Generator - processes one at a time
    for item in items:
        result = expensive_operation(item)
        yield result

# Batch processing to reduce API calls
def batch_delete_items(item_ids, batch_size=25):
    """Delete items in batches to reduce costs"""
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('items')
    
    with table.batch_writer() as batch:
        for item_id in item_ids:
            batch.delete_item(Key={'itemId': item_id})
    # Automatically flushes in batches of 25
```

## TypeScript Cost Optimization Patterns

### Pattern 1: Resource Management

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

async function processS3FileEfficiently(bucket: string, key: string): Promise<void> {
    const s3Client = new S3Client({});
    
    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(command);
        
        // Stream processing - don't load entire file in memory
        const stream = response.Body as Readable;
        
        for await (const chunk of stream) {
            await processChunk(chunk);
        }
    } finally {
        // Cleanup
        s3Client.destroy();
    }
}

// Proper Lambda cleanup
export const handler = async (event: any): Promise<any> => {
    const resources: any[] = [];
    
    try {
        // Process event
        const result = await processEvent(event);
        return { statusCode: 200, body: JSON.stringify(result) };
    } finally {
        // Clean up all resources
        await Promise.all(resources.map(r => r.cleanup()));
    }
};
```

### Pattern 2: Efficient Algorithms

```typescript
// BAD: O(n²) complexity
function findDuplicatesSlow(items: string[]): string[] {
    const duplicates: string[] = [];
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            if (items[i] === items[j]) {
                duplicates.push(items[i]);
            }
        }
    }
    return duplicates;
}

// GOOD: O(n) complexity
function findDuplicatesFast(items: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    
    for (const item of items) {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    }
    
    return Array.from(duplicates);
}
```

## Common Cost Anti-Patterns

### ❌ Anti-Pattern 1: Memory Leaks

**Bad:**
```python
# DON'T DO THIS - Accumulates data in memory
cache = {}

def get_data(key):
    if key not in cache:
        cache[key] = fetch_expensive_data(key)  # Never cleaned up
    return cache[key]
```

**Fix:**
```python
# DO THIS - Use LRU cache with size limit
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_data(key):
    return fetch_expensive_data(key)
```

### ❌ Anti-Pattern 2: Inefficient Loops

**Bad:**
```typescript
// DON'T DO THIS - Makes API call for each item
for (const item of items) {
    await dynamodb.putItem({ TableName: 'items', Item: item });
}
```

**Fix:**
```typescript
// DO THIS - Batch write
await dynamodb.batchWriteItem({
    RequestItems: {
        'items': items.map(item => ({
            PutRequest: { Item: item }
        }))
    }
});
```

## Cost Optimization Checklist

### Resource Management
- [ ] Connections closed after use
- [ ] Temporary files deleted
- [ ] Memory released when no longer needed
- [ ] Streams closed properly
- [ ] Context managers/try-finally used

### Algorithm Efficiency
- [ ] Time complexity optimized (avoid O(n²))
- [ ] Space complexity minimized
- [ ] Unnecessary iterations removed
- [ ] Data structures chosen appropriately
- [ ] Caching used for expensive operations

### Batch Operations
- [ ] API calls batched where possible
- [ ] Database operations batched
- [ ] File operations batched
- [ ] Batch size optimized for service limits
- [ ] Error handling for partial batch failures

### Lambda Optimization
- [ ] Memory size right-sized
- [ ] Cold start minimized
- [ ] Dependencies optimized
- [ ] Provisioned concurrency used appropriately
- [ ] Execution time monitored and optimized

## Summary

Application code cost optimization reduces AWS bills through efficient resource usage:

1. **Clean up resources** - Prevent leaks and unnecessary charges
2. **Use efficient algorithms** - Reduce compute time and costs
3. **Batch operations** - Minimize API calls and data transfer
4. **Stream large data** - Avoid loading everything in memory
5. **Right-size Lambda** - Match memory to actual needs
6. **Monitor usage** - Track and optimize expensive operations

