/**
 * TypeScript API Example - Well-Architected Compliant
 * 
 * Improvements:
 * 1. ✅ Secrets from environment/Secrets Manager (Security)
 * 2. ✅ Comprehensive error handling (Reliability)
 * 3. ✅ Retry configuration (Reliability)
 * 4. ✅ Timeout configuration (Reliability)
 * 5. ✅ Structured logging (Operational Excellence)
 * 6. ✅ Health check endpoint (Operational Excellence)
 * 7. ✅ Async operations (Performance)
 * 8. ✅ Redis caching with TTL (Performance)
 * 9. ✅ LRU cache to prevent memory leaks (Cost Optimization)
 */

import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import express, { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import winston from 'winston';
import LRU from 'lru-cache';

// ✅ Structured logging (Operational Excellence)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

// ✅ AWS SDK with retry and timeout (Reliability)
const dynamoClient = new DynamoDBClient({
    maxAttempts: 3,
    requestHandler: {
        connectionTimeout: 5000,
        requestTimeout: 10000,
    },
});

const secretsClient = new SecretsManagerClient({
    maxAttempts: 3,
});

const cloudwatchClient = new CloudWatchClient({});

// ✅ Redis client for caching (Performance)
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
});

redisClient.connect().catch(err => {
    logger.error('Redis connection failed', { error: err.message });
});

// ✅ LRU cache as fallback (Cost Optimization)
const memoryCache = new LRU<string, any>({
    max: 1000,  // Maximum 1000 items
    ttl: 1000 * 60 * 5,  // 5 minutes TTL
});

const app = express();
app.use(express.json());

// ✅ Request ID middleware (Operational Excellence)
app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || 
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
});

// ✅ Logging middleware (Operational Excellence)
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info('Request received', {
        method: req.method,
        path: req.path,
        requestId: req.headers['x-request-id'],
    });
    next();
});

// ✅ Input validation (Security)
function validateUserId(userId: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(userId);
}

// ✅ Authentication middleware (Security)
async function authenticate(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        logger.warn('Missing API key', {
            requestId: req.headers['x-request-id'],
        });
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // ✅ Validate API key (in production, check against Secrets Manager)
    const validKey = process.env.API_KEY;
    if (apiKey !== validKey) {
        logger.warn('Invalid API key', {
            requestId: req.headers['x-request-id'],
        });
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
}

// ✅ Custom metrics (Operational Excellence)
async function putMetric(metricName: string, value: number) {
    try {
        await cloudwatchClient.send(new PutMetricDataCommand({
            Namespace: 'MyApp/API',
            MetricData: [{
                MetricName: metricName,
                Value: value,
                Unit: 'Count',
                Timestamp: new Date(),
            }],
        }));
    } catch (error) {
        logger.warn('Failed to send metric', { metricName, error });
    }
}

// ✅ Caching with Redis and fallback (Performance)
async function getCachedUser(userId: string): Promise<any | null> {
    try {
        // Try Redis first
        const cached = await redisClient.get(`user:${userId}`);
        if (cached) {
            logger.debug('Cache hit (Redis)', { userId });
            await putMetric('CacheHit', 1);
            return JSON.parse(cached);
        }
    } catch (error) {
        logger.warn('Redis error, using memory cache', { error });
    }
    
    // Fallback to memory cache
    const memoryCached = memoryCache.get(userId);
    if (memoryCached) {
        logger.debug('Cache hit (memory)', { userId });
        await putMetric('CacheHit', 1);
        return memoryCached;
    }
    
    await putMetric('CacheMiss', 1);
    return null;
}

// ✅ Cache with TTL (Performance)
async function cacheUser(userId: string, user: any) {
    try {
        await redisClient.setEx(`user:${userId}`, 300, JSON.stringify(user));
    } catch (error) {
        logger.warn('Failed to cache in Redis', { error });
    }
    
    // Also cache in memory
    memoryCache.set(userId, user);
}

// ✅ Main endpoint with all best practices
app.get('/users/:userId', authenticate, async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const requestId = req.headers['x-request-id'] as string;
    
    try {
        // ✅ Input validation (Security)
        if (!validateUserId(userId)) {
            logger.warn('Invalid user ID format', { userId, requestId });
            await putMetric('ValidationError', 1);
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        logger.info('Fetching user', { userId, requestId });
        
        // ✅ Check cache (Performance)
        const cachedUser = await getCachedUser(userId);
        if (cachedUser) {
            return res.json(cachedUser);
        }
        
        // ✅ Fetch from DynamoDB with retry (Reliability)
        const command = new GetItemCommand({
            TableName: 'users',
            Key: { userId: { S: userId } },
        });
        
        const response = await dynamoClient.send(command);
        
        // ✅ Handle not found (Reliability)
        if (!response.Item) {
            logger.warn('User not found', { userId, requestId });
            await putMetric('UserNotFound', 1);
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = response.Item;
        
        // ✅ Cache result (Performance)
        await cacheUser(userId, user);
        
        // ✅ Metrics (Operational Excellence)
        await putMetric('UserFetched', 1);
        
        logger.info('User fetched successfully', { userId, requestId });
        
        res.json(user);
        
    } catch (error: any) {
        // ✅ Error handling without exposing details (Security)
        logger.error('Error fetching user', {
            userId,
            requestId,
            errorType: error.constructor.name,
            errorMessage: error.message,
        });
        
        await putMetric('InternalError', 1);
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Health check endpoint (Operational Excellence)
app.get('/health', async (req: Request, res: Response) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            redis: 'unknown',
            dynamodb: 'unknown',
        },
    };
    
    // Check Redis
    try {
        await redisClient.ping();
        health.checks.redis = 'healthy';
    } catch (error) {
        health.checks.redis = 'unhealthy';
        health.status = 'degraded';
    }
    
    // Check DynamoDB
    try {
        await dynamoClient.send(new GetItemCommand({
            TableName: 'users',
            Key: { userId: { S: 'health-check' } },
        }));
        health.checks.dynamodb = 'healthy';
    } catch (error) {
        health.checks.dynamodb = 'unhealthy';
        health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

// ✅ Graceful shutdown (Reliability)
const server = app.listen(3000, () => {
    logger.info('Server started', { port: 3000 });
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    
    server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close connections
        await redisClient.quit();
        dynamoClient.destroy();
        
        logger.info('Shutdown complete');
        process.exit(0);
    });
});
