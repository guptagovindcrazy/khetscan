import os
import sys
from pathlib import Path

os.environ.setdefault("ML_MODE", "demo")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
