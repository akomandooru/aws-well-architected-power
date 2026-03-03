# Application Code Operational Excellence Patterns

## Overview

This section covers application code patterns for logging, monitoring, tracing, health checks, and metrics collection.

### Application Operational Excellence Principles

1. **Implement structured logging**: Use consistent log formats with context
2. **Add distributed tracing**: Track requests across services
3. **Expose health checks**: Enable automated health monitoring
4. **Collect custom metrics**: Track business and technical KPIs
5. **Instrument code**: Add observability at key points
6. **Use correlation IDs**: Track requests across system boundaries

## Python Operational Patterns

### Pattern 1: Structured Logging

```python
import logging
import json
from datetime import datetime
import boto3

# Configure structured logging
class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # JSON formatter for CloudWatch Logs Insights
        handler = logging.StreamHandler()
        handler.setFormatter(self._json_formatter())
        self.logger.addHandler(handler)
    
    def _json_formatter(self):
        class JSONFormatter(logging.Formatter):
            def format(self, record):
                log_data = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'level': record.levelname,
                    'message': record.getMessage(),
                    'logger': record.name,
                    'function': record.funcName,
                    'line': record.lineno,
                }
                
                # Add extra fields
                if hasattr(record, 'user_id'):
                    log_data['user_id'] = record.user_id
                if hasattr(record, 'request_id'):
                    log_data['request_id'] = record.request_id
                
                return json.dumps(log_data)
        
        return JSONFormatter()
    
    def info(self, message, **kwargs):
        extra = {k: v for k, v in kwargs.items()}
        self.logger.info(message, extra=extra)
    
    def error(self, message, **kwargs):
        extra = {k: v for k, v in kwargs.items()}
        self.logger.error(message, extra=extra, exc_info=True)

# Usage
logger = StructuredLogger(__name__)

def process_user_request(user_id, request_id):
    logger.info(
        "Processing user request",
        user_id=user_id,
        request_id=request_id
    )
    
    try:
        result = perform_operation(user_id)
        logger.info(
            "Request completed successfully",
            user_id=user_id,
            request_id=request_id,
            result_count=len(result)
        )
        return result
    except Exception as e:
        logger.error(
            "Request failed",
            user_id=user_id,
            request_id=request_id,
            error_type=type(e).__name__
        )
        raise
```

### Pattern 2: Distributed Tracing with X-Ray

```python
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
import boto3

# Patch AWS SDK calls for automatic tracing
patch_all()

@xray_recorder.capture('process_order')
def process_order(order_id):
    """Process order with X-Ray tracing"""
    
    # Add metadata
    xray_recorder.put_metadata('order_id', order_id)
    xray_recorder.put_annotation('order_type', 'standard')
    
    # Subsegment for database operation
    with xray_recorder.capture('fetch_order_details'):
        order = fetch_from_database(order_id)
        xray_recorder.put_metadata('order_value', order['total'])
    
    # Subsegment for external API call
    with xray_recorder.capture('validate_payment'):
        payment_valid = validate_payment(order['payment_id'])
        xray_recorder.put_annotation('payment_valid', payment_valid)
    
    return order

# Lambda handler with X-Ray
@xray_recorder.capture('lambda_handler')
def lambda_handler(event, context):
    request_id = context.request_id
    xray_recorder.put_annotation('request_id', request_id)
    
    return process_order(event['orderId'])
```

### Pattern 3: Custom Metrics

```python
import boto3
from datetime import datetime

cloudwatch = boto3.client('cloudwatch')

class MetricsCollector:
    def __init__(self, namespace):
        self.namespace = namespace
        self.metrics = []
    
    def put_metric(self, name, value, unit='Count', dimensions=None):
        """Add metric to batch"""
        metric = {
            'MetricName': name,
            'Value': value,
            'Unit': unit,
            'Timestamp': datetime.utcnow(),
        }
        
        if dimensions:
            metric['Dimensions'] = [
                {'Name': k, 'Value': v} for k, v in dimensions.items()
            ]
        
        self.metrics.append(metric)
        
        # Flush if batch is full
        if len(self.metrics) >= 20:
            self.flush()
    
    def flush(self):
        """Send metrics to CloudWatch"""
        if not self.metrics:
            return
        
        cloudwatch.put_metric_data(
            Namespace=self.namespace,
            MetricData=self.metrics
        )
        self.metrics = []

# Usage
metrics = MetricsCollector('MyApp')

def process_transaction(transaction):
    start_time = time.time()
    
    try:
        result = perform_transaction(transaction)
        
        # Record success metric
        metrics.put_metric(
            'TransactionSuccess',
            1,
            dimensions={'TransactionType': transaction['type']}
        )
        
        # Record processing time
        duration = time.time() - start_time
        metrics.put_metric(
            'TransactionDuration',
            duration,
            unit='Seconds',
            dimensions={'TransactionType': transaction['type']}
        )
        
        return result
    except Exception as e:
        # Record failure metric
        metrics.put_metric(
            'TransactionFailure',
            1,
            dimensions={
                'TransactionType': transaction['type'],
                'ErrorType': type(e).__name__
            }
        )
        raise
    finally:
        metrics.flush()
```

### Pattern 4: Health Check Endpoint

```python
from flask import Flask, jsonify
import boto3

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for load balancer"""
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {}
    }
    
    # Check database connectivity
    try:
        db_healthy = check_database_connection()
        health_status['checks']['database'] = 'healthy' if db_healthy else 'unhealthy'
    except Exception as e:
        health_status['checks']['database'] = 'unhealthy'
        health_status['status'] = 'unhealthy'
    
    # Check external dependencies
    try:
        api_healthy = check_external_api()
        health_status['checks']['external_api'] = 'healthy' if api_healthy else 'unhealthy'
    except Exception as e:
        health_status['checks']['external_api'] = 'unhealthy'
        # Don't fail health check for non-critical dependencies
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code

def check_database_connection():
    """Check if database is accessible"""
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1")
        return True
    except:
        return False

def check_external_api():
    """Check if external API is accessible"""
    try:
        response = requests.get('https://api.example.com/health', timeout=2)
        return response.status_code == 200
    except:
        return False
```

## TypeScript Operational Patterns

### Pattern 1: Structured Logging

```typescript
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({
    serviceName: 'my-service',
    logLevel: 'INFO',
});

export const handler = async (event: any, context: any): Promise<any> => {
    // Add persistent attributes
    logger.addPersistentLogAttributes({
        requestId: context.requestId,
        environment: process.env.ENVIRONMENT,
    });
    
    logger.info('Processing request', {
        userId: event.userId,
        action: event.action,
    });
    
    try {
        const result = await processRequest(event);
        
        logger.info('Request completed', {
            userId: event.userId,
            resultCount: result.length,
            duration: Date.now() - startTime,
        });
        
        return { statusCode: 200, body: JSON.stringify(result) };
    } catch (error) {
        logger.error('Request failed', {
            userId: event.userId,
            error: error.message,
            errorType: error.constructor.name,
        });
        
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
    }
};
```

### Pattern 2: Custom Metrics

```typescript
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics';

const metrics = new Metrics({
    namespace: 'MyApp',
    serviceName: 'order-service',
});

export const handler = async (event: any): Promise<any> => {
    const startTime = Date.now();
    
    try {
        const result = await processOrder(event.orderId);
        
        // Add success metric
        metrics.addMetric('OrderProcessed', MetricUnits.Count, 1);
        metrics.addDimension('OrderType', event.orderType);
        
        // Add duration metric
        const duration = Date.now() - startTime;
        metrics.addMetric('ProcessingDuration', MetricUnits.Milliseconds, duration);
        
        return { statusCode: 200, body: JSON.stringify(result) };
    } catch (error) {
        // Add failure metric
        metrics.addMetric('OrderFailed', MetricUnits.Count, 1);
        metrics.addDimension('ErrorType', error.constructor.name);
        
        throw error;
    } finally {
        // Publish all metrics
        metrics.publishStoredMetrics();
    }
};
```

## Operational Excellence Checklist

### Logging
- [ ] Structured logging implemented (JSON format)
- [ ] Log levels used appropriately (DEBUG, INFO, WARN, ERROR)
- [ ] Correlation IDs included in logs
- [ ] Sensitive data not logged
- [ ] Logs sent to CloudWatch or centralized system

### Monitoring
- [ ] Custom metrics collected for business KPIs
- [ ] Technical metrics tracked (latency, errors, throughput)
- [ ] Metrics have appropriate dimensions
- [ ] CloudWatch dashboards created
- [ ] Alarms configured for critical metrics

### Tracing
- [ ] X-Ray tracing enabled
- [ ] Subsegments created for key operations
- [ ] Annotations added for filtering
- [ ] Metadata included for debugging
- [ ] Trace sampling configured

### Health Checks
- [ ] Health check endpoint implemented
- [ ] Database connectivity checked
- [ ] External dependencies checked
- [ ] Health check returns appropriate status codes
- [ ] Load balancer configured to use health check

### Instrumentation
- [ ] Key operations instrumented
- [ ] Error rates tracked
- [ ] Performance metrics collected
- [ ] Business metrics tracked
- [ ] Instrumentation doesn't impact performance

## Summary

Application code operational excellence enables effective monitoring and troubleshooting:

1. **Log structured data** - Enable powerful queries and analysis
2. **Trace requests** - Understand flow across services
3. **Collect metrics** - Track health and performance
4. **Expose health checks** - Enable automated monitoring
5. **Instrument code** - Add observability at key points
6. **Use correlation IDs** - Track requests end-to-end

