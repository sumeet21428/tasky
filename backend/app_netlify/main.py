# Adjust relative imports to go up one level to access the 'app' module
import sys
import os

# Add the parent directory of 'app_netlify' (which is 'backend') to the Python path
# This allows us to import from 'app.main' as if we were in the 'backend' directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir) 
sys.path.insert(0, backend_dir)

# Now you can import your FastAPI app instance from the original main.py
from app.main import app as fastapi_app # Import your FastAPI app instance
from mangum import Mangum # Mangum adapts ASGI apps (like FastAPI) for AWS Lambda (which Netlify Functions use)

# This is the handler function that Netlify will invoke
handler = Mangum(fastapi_app, lifespan="off") # Use "off" if your app doesn't have complex startup/shutdown events managed by lifespan
                                            # Or use "auto" if you have startup/shutdown events in FastAPI
                                            # For your current setup with load_tasks on startup, "auto" might be better.
                                            # Let's try "auto" first.
# handler = Mangum(fastapi_app, lifespan="auto")


# If you used lifespan="auto", ensure your FastAPI startup/shutdown events
# are compatible with how Mangum handles them.
# For the simple load_tasks on startup, it should be fine.
# If you encounter issues with "auto", switch to "off" and ensure
# load_tasks() is called in a way that works for serverless (e.g., lazy loading on first request if needed,
# though for a JSON file, loading on cold start is usually okay).