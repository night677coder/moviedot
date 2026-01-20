import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

try:
    from app import app
    from mangum import Mangum
    handler = Mangum(app)
except Exception as e:
    # Fallback handler in case of import errors
    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"error": "Server initialization failed", "details": "' + str(e) + '"}'
        }
