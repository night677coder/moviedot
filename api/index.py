import json
import sys
import os

# Simple test endpoint first
def handler(event, context):
    try:
        # Basic health check
        if event.get('httpMethod') == 'GET' and event.get('path') == '/health':
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "status": "healthy",
                    "version": "1.0.0",
                    "message": "Basic handler working"
                })
            }
        
        # Basic root endpoint
        if event.get('httpMethod') == 'GET' and event.get('path') == '/':
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "status": True,
                    "total_found": 0,
                    "url": "",
                    "data": [],
                    "message": "API is running - full features coming soon"
                })
            }
        
        # Default response
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "message": "API endpoint working",
                "path": event.get('path'),
                "method": event.get('httpMethod')
            })
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Handler error",
                "details": str(e)
            })
        }
