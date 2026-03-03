# Application Code Examples

This directory contains example application code files demonstrating Well-Architected patterns and anti-patterns across multiple programming languages.

## Overview

Each example comes in two versions:
- **`*-issues.*`**: Code with Well-Architected anti-patterns (what NOT to do)
- **`*-fixed.*`**: Code with Well-Architected best practices (what TO do)

## Available Examples

### Python Examples
- **`python-lambda-issues.py`**: Lambda function with 12 Well-Architected issues
- **`python-lambda-fixed.py`**: Same Lambda with all issues fixed

**Issues Demonstrated:**
- Hardcoded credentials (Security)
- No error handling (Reliability)
- No retry logic (Reliability)
- No timeout configuration (Reliability)
- No logging (Operational Excellence)
- No metrics (Operational Excellence)
- Inefficient database queries (Performance)
- No connection pooling (Performance)
- Memory leaks (Cost Optimization)
- No resource cleanup (Cost Optimization)

### Java Examples
- **`java-service-issues.java`**: Service class with 10 Well-Architected issues
- **`java-service-fixed.java`**: Same service with all issues fixed

**Issues Demonstrated:**
- Hardcoded credentials (Security)
- No error handling (Reliability)
- No retry configuration (Reliability)
- No timeout (Reliability)
- No logging (Operational Excellence)
- Resource leaks (Cost Optimization)
- Synchronous blocking calls (Performance)
- No connection pooling (Performance)
- SQL injection vulnerability (Security)

### TypeScript Examples
- **`typescript-api-issues.ts`**: Express API with 14 Well-Architected issues
- **`typescript-api-fixed.ts`**: Same API with all issues fixed

**Issues Demonstrated:**
- Hardcoded API keys (Security)
- No error handling (Reliability)
- No retry logic (Reliability)
- No timeout (Reliability)
- No logging (Operational Excellence)
- No health check (Operational Excellence)
- Synchronous operations (Performance)
- No caching (Performance)
- Memory leaks (Cost Optimization)
- No authentication (Security)

## How to Use These Examples

### For Learning
1. Read the `-issues` file first to understand common anti-patterns
2. Try to identify the issues yourself before looking at the comments
3. Compare with the `-fixed` file to see the correct implementation
4. Note the inline comments explaining why each change improves Well-Architected compliance

### For Testing the Power
1. Copy an `-issues` file into your workspace
2. Ask Kiro to review it for Well-Architected compliance
3. The power should identify the issues and suggest fixes
4. Compare Kiro's suggestions with the `-fixed` file

### For Code Reviews
1. Use these examples as a reference during code reviews
2. Look for similar patterns in your own code
3. Apply the fixes from the `-fixed` files to your codebase

## Expected Findings

When the AWS Well-Architected Power analyzes the `-issues` files, it should detect:

### Security Issues
- Hardcoded credentials and secrets
- Missing input validation
- SQL injection vulnerabilities
- Missing authentication/authorization
- Sensitive data in error messages

### Reliability Issues
- Missing error handling
- No retry logic
- Missing timeout configuration
- No circuit breakers
- Resource leaks

### Performance Issues
- No caching
- No connection pooling
- Synchronous blocking operations
- Inefficient database queries (N+1 problem)
- No batch operations

### Cost Optimization Issues
- Memory leaks
- No resource cleanup
- Inefficient algorithms
- Missing connection pooling
- No proper disposal

### Operational Excellence Issues
- No structured logging
- Missing metrics collection
- No distributed tracing
- Missing health check endpoints
- No correlation IDs

## Additional Languages

Examples for Go, C#, and Ruby will be added in future updates. The patterns demonstrated in Python, Java, and TypeScript apply to all languages with language-specific syntax adjustments.

## Running the Examples

### Python
```bash
# Install dependencies
pip install boto3 psycopg2-binary

# Run (will fail due to missing credentials - that's expected)
python python-lambda-fixed.py
```

### Java
```bash
# Compile
javac -cp ".:aws-sdk/*:hikari/*" java-service-fixed.java

# Run
java -cp ".:aws-sdk/*:hikari/*" com.example.service.UserService
```

### TypeScript
```bash
# Install dependencies
npm install @aws-sdk/client-dynamodb @aws-sdk/client-secrets-manager \
  @aws-sdk/client-cloudwatch express redis winston lru-cache

# Compile
tsc typescript-api-fixed.ts

# Run
node typescript-api-fixed.js
```

## Contributing

When adding new examples:
1. Create both `-issues` and `-fixed` versions
2. Add inline comments explaining each issue and fix
3. Cover multiple Well-Architected pillars
4. Include realistic scenarios
5. Update this README with the new example

## Related Documentation

- [Security Application Code Patterns](../../steering/security-application-code.md)
- [Reliability Application Code Patterns](../../steering/reliability-application-code.md)
- [Performance Application Code Patterns](../../steering/performance-application-code.md)
- [Cost Optimization Application Code Patterns](../../steering/cost-optimization-application-code.md)
- [Operational Excellence Application Code Patterns](../../steering/operational-excellence-application-code.md)

