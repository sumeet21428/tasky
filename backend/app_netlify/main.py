import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir) 
sys.path.insert(0, backend_dir)

from app.main import app as fastapi_app 
from mangum import Mangum

handler = Mangum(fastapi_app, lifespan="auto")