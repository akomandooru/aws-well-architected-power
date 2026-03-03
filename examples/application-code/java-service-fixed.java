/**
 * Java Service Example - Well-Architected Compliant
 * 
 * Improvements:
 * 1. ✅ Secrets from Secrets Manager (Security)
 * 2. ✅ Comprehensive error handling (Reliability)
 * 3. ✅ Retry policy configured (Reliability)
 * 4. ✅ Timeout configuration (Reliability)
 * 5. ✅ Structured logging (Operational Excellence)
 * 6. ✅ Proper resource management (Cost Optimization)
 * 7. ✅ Async operations (Performance)
 * 8. ✅ Connection pooling (Performance)
 */

package com.example.service;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.retry.RetryPolicy;
import software.amazon.awssdk.services.dynamodb.DynamoDbAsyncClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.*;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

public class UserService {
    
    // ✅ Structured logging (Operational Excellence)
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // ✅ Async client with retry and timeout (Reliability + Performance)
    private final DynamoDbAsyncClient dynamoDb;
    
    // ✅ Connection pool (Performance)
    private final HikariDataSource dataSource;
    
    // ✅ Secrets Manager client (Security)
    private final SecretsManagerClient secretsManager;
    
    // ✅ Input validation pattern (Security)
    private static final Pattern UUID_PATTERN = Pattern.compile(
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    );
    
    public UserService() {
        // ✅ Configure retry policy (Reliability)
        RetryPolicy retryPolicy = RetryPolicy.builder()
            .numRetries(3)
            .build();
        
        // ✅ Async client with timeout (Performance + Reliability)
        this.dynamoDb = DynamoDbAsyncClient.builder()
            .credentialsProvider(DefaultCredentialsProvider.create())
            .overrideConfiguration(config -> config
                .retryPolicy(retryPolicy)
                .apiCallTimeout(Duration.ofSeconds(30))
                .apiCallAttemptTimeout(Duration.ofSeconds(10)))
            .build();
        
        this.secretsManager = SecretsManagerClient.create();
        
        // ✅ Initialize connection pool (Performance)
        this.dataSource = initializeDataSource();
    }
    
    // ✅ Secrets from Secrets Manager (Security)
    private HikariDataSource initializeDataSource() {
        try {
            Map<String, String> creds = getDatabaseCredentials();
            
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(String.format("jdbc:postgresql://%s:%s/%s",
                creds.get("host"), creds.get("port"), creds.get("database")));
            config.setUsername(creds.get("username"));
            config.setPassword(creds.get("password"));
            
            // ✅ Connection pool configuration (Performance)
            config.setMaximumPoolSize(20);
            config.setMinimumIdle(5);
            config.setConnectionTimeout(10000);
            config.setIdleTimeout(600000);
            config.setMaxLifetime(1800000);
            
            // ✅ SSL/TLS for database (Security)
            config.addDataSourceProperty("ssl", "true");
            config.addDataSourceProperty("sslmode", "require");
            
            return new HikariDataSource(config);
        } catch (Exception e) {
            logger.error("Failed to initialize data source", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }
    
    private Map<String, String> getDatabaseCredentials() throws Exception {
        GetSecretValueRequest request = GetSecretValueRequest.builder()
            .secretId("prod/database/credentials")
            .build();
        
        String secretString = secretsManager.getSecretValue(request).secretString();
        return objectMapper.readValue(secretString, Map.class);
    }
    
    // ✅ Input validation (Security)
    private void validateUserId(String userId) {
        if (userId == null || !UUID_PATTERN.matcher(userId.toLowerCase()).matches()) {
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }
    
    // ✅ Async operation (Performance)
    public CompletableFuture<User> getUserAsync(String userId) {
        // ✅ Structured logging (Operational Excellence)
        logger.info("Fetching user: userId={}", userId);
        
        try {
            // ✅ Input validation (Security)
            validateUserId(userId);
            
            // ✅ Async DynamoDB call (Performance)
            GetItemRequest request = GetItemRequest.builder()
                .tableName("users")
                .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
                .build();
            
            return dynamoDb.getItem(request)
                .thenCompose(response -> {
                    if (!response.hasItem()) {
                        logger.warn("User not found: userId={}", userId);
                        return CompletableFuture.failedFuture(
                            new UserNotFoundException("User not found")
                        );
                    }
                    
                    // ✅ Async database query (Performance)
                    return getUserOrdersAsync(userId)
                        .thenApply(orders -> new User(response.item(), orders));
                })
                .exceptionally(ex -> {
                    // ✅ Error handling (Reliability)
                    logger.error("Error fetching user: userId={}", userId, ex);
                    throw new RuntimeException("Failed to fetch user", ex);
                });
                
        } catch (IllegalArgumentException e) {
            // ✅ Validation error handling (Security)
            logger.warn("Invalid user ID: userId={}", userId);
            return CompletableFuture.failedFuture(e);
        }
    }
    
    // ✅ Efficient database query with connection pooling (Performance)
    private CompletableFuture<List<Order>> getUserOrdersAsync(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            // ✅ Try-with-resources for automatic cleanup (Cost Optimization)
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(
                     "SELECT * FROM orders WHERE user_id = ? LIMIT 100")) {
                
                // ✅ Parameterized query prevents SQL injection (Security)
                stmt.setString(1, userId);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    List<Order> orders = new ArrayList<>();
                    while (rs.next()) {
                        orders.add(mapOrder(rs));
                    }
                    
                    logger.info("Retrieved orders: userId={}, count={}", 
                        userId, orders.size());
                    return orders;
                }
                
            } catch (SQLException e) {
                // ✅ Error handling without exposing details (Security)
                logger.error("Database error for userId={}", userId, e);
                throw new RuntimeException("Failed to fetch orders", e);
            }
        });
    }
    
    // ✅ Proper cleanup (Cost Optimization)
    public void shutdown() {
        try {
            if (dataSource != null && !dataSource.isClosed()) {
                dataSource.close();
            }
            if (dynamoDb != null) {
                dynamoDb.close();
            }
            if (secretsManager != null) {
                secretsManager.close();
            }
            logger.info("UserService shutdown completed");
        } catch (Exception e) {
            logger.error("Error during shutdown", e);
        }
    }
}
