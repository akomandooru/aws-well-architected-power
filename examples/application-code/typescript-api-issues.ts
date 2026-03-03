/**
 * TypeScript API Example with Well-Architected Issues
 * 
 * Issues Present:
 * 1. Hardcoded API keys (Security)
 * 2. No error handling (Reliability)
 * 3. No retry logic (Reliability)
 * 4. No timeout (Reliability)
 * 5. No logging (Operational Excellence)
 * 6. No health check (Operational Excellence)
 * 7. Synchronous operations (Performance)
 * 8. No caching (Performance)
 * 9. Memory leaks (Cost Optimization)
 */

import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import express from 'express';

// ❌ ISSUE 1: Hardcoded credentials (Security - Critical)
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'MySecretPassword123!';

// ❌ ISSUE 2: No retry or timeout configuration (Reliability - High)
const dynamoClient = new DynamoDBClient({});

// ❌ ISSUE 3: Global cache causing memory leak (Cost - High)
const cache: Record<string, any> = {};  // Never cleaned up

const app = express();

// ❌ ISSUE 4: No input validation (Security - High)
// ❌ ISSUE 5: No error handling (Reliability - Critical)
// ❌ ISSUE 6: No logging (Operational Excellence - High)
// ❌ ISSUE 7: Synchronous blocking operations (Performance - Medium)
app.get('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    // ❌ ISSUE 8: No authentication check (Security - Critical)
    
    // Check cache (but it grows indefinitely)
    if (cache[userId]) {
        return res.json(cache[userId]);
    }
    
    // ❌ ISSUE 9: No retry logic (Reliability - High)
    const command = new GetItemCommand({
        TableName: 'users',
        Key: { userId: { S: userId } }
    });
    
    const response = await dynamoClient.send(command);
    
    // ❌ ISSUE 10: No null check (Reliability - Medium)
    const user = response.Item;
    
    // ❌ ISSUE 11: Memory leak - cache grows forever (Cost - High)
    cache[userId] = user;
    
    // ❌ ISSUE 12: No metrics (Operational Excellence - Medium)
    
    res.json(user);
});

// ❌ ISSUE 13: No health check endpoint (Operational Excellence - High)

// ❌ ISSUE 14: No graceful shutdown (Reliability - Medium)
app.listen(3000, () => {
    console.log('Server started');  // Not structured logging
});
