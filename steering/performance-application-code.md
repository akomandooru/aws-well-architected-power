# Application Code Performance Patterns

## Overview

This section covers application code performance patterns including caching, connection pooling, async operations, and efficient database queries.

### Application Performance Principles

1. **Implement caching**: Reduce latency and cost by caching frequently accessed data
2. **Use connection pooling**: Reuse database and service connections
3. **Leverage async operations**: Non-blocking I/O for better throughput
4. **Optimize database queries**: Use indexes, limit results, avoid N+1 queries
5. **Implement lazy loading**: Load data only when needed
6. **Monitor performance**: Track latency, throughput, and resource usage

## Python Performance Patterns

### Pattern 1: Caching with ElastiCache

```python
import boto3
import redis
import json
from functools import wraps

# Redis connection pool
redis_client = redis.Redis(
    host='my-cluster.cache.amazonaws.com',
    port=6379,
    decode_responses=True,
    max_connections=50,  # Connection pool
    socket_connect_timeout=5,
    socket_timeout=5
)

def cache_result(ttl=300):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(ttl=600)
def get_user_profile(user_id):
    """Get user profile with caching"""
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('users')
    response = table.get_item(Key={'userId': user_id})
    return response.get('Item')
```

### Pattern 2: Connection Pooling for Databases

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Create engine with connection pool
engine = create_engine(
    'postgresql://user:pass@host:5432/db',
    poolclass=QueuePool,
    pool_size=20,          # Number of connections to maintain
    max_overflow=10,       # Additional connections when pool is full
    pool_timeout=30,       # Timeout waiting for connection
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True     # Verify connections before use
)

def get_users_efficient():
    """Query with connection pooling"""
    with engine.connect() as conn:
        result = conn.execute("SELECT * FROM users LIMIT 100")
        return [dict(row) for row in result]
```

### Pattern 3: Async Operations

```python
import asyncio
import aioboto3

async def fetch_multiple_items(item_ids):
    """Fetch multiple items concurrently"""
    async with aioboto3.Session().resource('dynamodb') as dynamodb:
        table = await dynamodb.Table('items')
        
        # Create tasks for concurrent execution
        tasks = [
            table.get_item(Key={'itemId': item_id})
            for item_id in item_ids
        ]
        
        # Execute concurrently
        results = await asyncio.gather(*tasks)
        return [r.get('Item') for r in results if 'Item' in r]

# Usage
item_ids = ['id1', 'id2', 'id3', 'id4', 'id5']
items = asyncio.run(fetch_multiple_items(item_ids))
```

## TypeScript Performance Patterns

### Pattern 1: Caching and Connection Pooling

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createClient } from 'redis';

// DynamoDB client with connection reuse
const dynamoClient = new DynamoDBClient({
    maxAttempts: 3,
    requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
    },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Redis client with connection pooling
const redisClient = createClient({
    url: 'redis://my-cluster.cache.amazonaws.com:6379',
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
});

await redisClient.connect();

async function getCachedItem(itemId: string): Promise<any> {
    // Check cache first
    const cached = await redisClient.get(`item:${itemId}`);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Fetch from DynamoDB
    const command = new GetCommand({
        TableName: 'items',
        Key: { itemId },
    });
    
    const response = await docClient.send(command);
    
    // Cache for 5 minutes
    if (response.Item) {
        await redisClient.setEx(`item:${itemId}`, 300, JSON.stringify(response.Item));
    }
    
    return response.Item;
}
```

### Pattern 2: Batch Operations

```typescript
async function batchGetItems(itemIds: string[]): Promise<any[]> {
    // Process in batches of 25 (DynamoDB limit)
    const batchSize = 25;
    const batches: string[][] = [];
    
    for (let i = 0; i < itemIds.length; i += batchSize) {
        batches.push(itemIds.slice(i, i + batchSize));
    }
    
    // Execute batches concurrently
    const results = await Promise.all(
        batches.map(batch => fetchBatch(batch))
    );
    
    return results.flat();
}

async function fetchBatch(itemIds: string[]): Promise<any[]> {
    const command = new BatchGetCommand({
        RequestItems: {
            'items': {
                Keys: itemIds.map(id => ({ itemId: id })),
            },
        },
    });
    
    const response = await docClient.send(command);
    return response.Responses?.items || [];
}
```

## Common Performance Anti-Patterns

### ❌ Anti-Pattern 1: N+1 Query Problem

**Bad:**
```python
# DON'T DO THIS - Makes N+1 database queries
def get_users_with_orders():
    users = db.query("SELECT * FROM users")
    for user in users:
        user['orders'] = db.query(f"SELECT * FROM orders WHERE user_id = {user['id']}")
    return users
```

**Fix:**
```python
# DO THIS - Single query with JOIN
def get_users_with_orders():
    return db.query("""
        SELECT u.*, o.* 
        FROM users u 
        LEFT JOIN orders o ON u.id = o.user_id
    """)
```

### ❌ Anti-Pattern 2: No Connection Pooling

**Bad:**
```typescript
// DON'T DO THIS - Creates new connection for each request
async function getUser(id: string) {
    const client = new DynamoDBClient({});  // New client each time
    // ...
}
```

**Fix:**
```typescript
// DO THIS - Reuse client
const client = new DynamoDBClient({});  // Create once, reuse

async function getUser(id: string) {
    // Use existing client
}
```

## Performance Checklist

### Caching
- [ ] Frequently accessed data cached
- [ ] Cache TTL configured appropriately
- [ ] Cache invalidation strategy implemented
- [ ] Cache hit/miss ratio monitored
- [ ] ElastiCache or DAX used for AWS services

### Connection Management
- [ ] Connection pooling enabled
- [ ] Pool size configured for workload
- [ ] Connections recycled periodically
- [ ] Connection health checks enabled
- [ ] Connection timeouts set

### Async Operations
- [ ] I/O-bound operations use async/await
- [ ] Concurrent operations batched
- [ ] Promise.all/asyncio.gather used for parallelism
- [ ] Async error handling implemented
- [ ] Async operations have timeouts

### Database Optimization
- [ ] Queries use indexes
- [ ] Result sets limited (LIMIT clause)
- [ ] N+1 queries avoided
- [ ] Batch operations used where possible
- [ ] Query performance monitored

## Summary

Application code performance is critical for user experience and cost optimization. Key takeaways:

1. **Cache aggressively** - Reduce latency and database load
2. **Pool connections** - Reuse expensive resources
3. **Go async** - Non-blocking I/O for better throughput
4. **Optimize queries** - Use indexes and avoid N+1 problems
5. **Batch operations** - Reduce API calls and improve efficiency
6. **Monitor performance** - Track and optimize hot paths

