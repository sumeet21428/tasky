import sys
import os


sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app as fastapi_app 
from mangum import Mangum

handler = Mangum(fastapi_app, lifespan="auto")