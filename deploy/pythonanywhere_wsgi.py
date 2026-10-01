"""Example contents for the PythonAnywhere WSGI configuration file.

Replace the username in the path, then set ADMIN_PASSWORD to a private value
in this dashboard-only file before saving it.
"""

import os
import sys

PROJECT_DIR = "/home/YOUR_PYTHONANYWHERE_USERNAME/Jalpadevi-Complaint-System"
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# Set a private admin password in the PythonAnywhere WSGI file, never in Git.
os.environ["ADMIN_PASSWORD"] = "CHANGE-THIS-TO-A-PRIVATE-PASSWORD"
os.environ["ADMIN_TOKEN"] = "CHANGE-THIS-TO-A-LONG-RANDOM-TOKEN"
os.environ["STORAGE_DIR"] = os.path.join(PROJECT_DIR, "backend")

from backend.app import app as application
