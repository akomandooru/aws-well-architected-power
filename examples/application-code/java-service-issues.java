/**
 * Java Service Example with Well-Architected Issues
 * 
 * Issues Present:
 * 1. Hardcoded credentials (Security)
 * 2. No error handling (Reliability)
 * 3. No retry configuration (Reliability)
 * 4. No timeout (Reliability)
 * 5. No logging (Operational Excellence)
 * 6. Resource leaks (Cost Optimization)
 * 7. Synchronous blocking calls (Performance)
 * 8. No connection pooling (Performance)
 */

package com.example.service;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import java.sql.*;

public class UserService {
    
    // ❌ ISSUE 1: Hardcoded credentials (Security - Critical)
    private static final String DB_PASSWORD = "MySecretPassword123!";
    private static final String AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    
    // ❌ ISSUE 2: No retry or timeout configuration (Reliability - High)
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    
    // ❌ ISSUE 3: No connection pooling (Performance - High)
    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:postgresql://mydb.example.com:5432/myapp",
            "admin",
            DB_PASSWORD  // Hardcoded password
        );
    }
    
    public User getUser(String userId) {
        // ❌ ISSUE 4: No input validation (Security - High)
        // ❌ ISSUE 5: No error handling (Reliability - Critical)
        // ❌ ISSUE 6: No logging (Operational Excellence - High)
        
        // ❌ ISSUE 7: Synchronous blocking call (Performance - Medium)
        GetItemRequest request = GetItemRequest.builder()
            .tableName("users")
            .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
            .build();
        
        GetItemResponse response = dynamoDb.getItem(request);
        
        // ❌ ISSUE 8: Resource leak - connection not closed (Cost - High)
        Connection conn = getConnection();
        Statement stmt = conn.createStatement();
        
        // ❌ ISSUE 9: SQL injection vulnerability (Security - Critical)
        String query = "SELECT * FROM orders WHERE user_id = '" + userId + "'";
        ResultSet rs = stmt.executeQuery(query);
        
        // ❌ ISSUE 10: Resources never closed (Cost - High)
        // conn, stmt, rs should be closed in finally block
        
        return new User(response.item(), rs);
    }
}
