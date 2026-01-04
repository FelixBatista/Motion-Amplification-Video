"""
Progress tracking for video processing operations.
Uses in-memory storage for progress updates.
"""
from typing import Dict, Optional
from datetime import datetime
import threading

class ProgressTracker:
    """Thread-safe progress tracker for video processing"""
    
    def __init__(self):
        self._progress: Dict[str, Dict] = {}
        self._lock = threading.Lock()
    
    def create_job(self, job_id: str, job_type: str = "process") -> None:
        """Create a new job with initial progress"""
        with self._lock:
            self._progress[job_id] = {
                "job_id": job_id,
                "job_type": job_type,
                "status": "starting",
                "progress": 0,
                "current_step": "",
                "message": "Initializing...",
                "started_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
    
    def update_progress(self, job_id: str, progress: int, 
                       current_step: str = "", message: str = "") -> None:
        """Update progress for a job"""
        with self._lock:
            if job_id in self._progress:
                self._progress[job_id].update({
                    "progress": max(0, min(100, progress)),
                    "current_step": current_step,
                    "message": message,
                    "updated_at": datetime.now().isoformat()
                })
    
    def set_status(self, job_id: str, status: str, message: str = "") -> None:
        """Set status for a job (starting, processing, completed, error)"""
        with self._lock:
            if job_id in self._progress:
                self._progress[job_id].update({
                    "status": status,
                    "message": message,
                    "updated_at": datetime.now().isoformat()
                })
                if status == "completed":
                    self._progress[job_id]["progress"] = 100
                elif status == "error":
                    self._progress[job_id]["progress"] = 0
    
    def get_progress(self, job_id: str) -> Optional[Dict]:
        """Get current progress for a job"""
        with self._lock:
            return self._progress.get(job_id)
    
    def remove_job(self, job_id: str) -> None:
        """Remove a job from tracking (cleanup)"""
        with self._lock:
            if job_id in self._progress:
                del self._progress[job_id]
    
    def cleanup_old_jobs(self, max_age_hours: int = 24) -> None:
        """Remove jobs older than max_age_hours"""
        from datetime import datetime, timedelta
        cutoff = datetime.now() - timedelta(hours=max_age_hours)
        
        with self._lock:
            to_remove = []
            for job_id, job_data in self._progress.items():
                try:
                    updated = datetime.fromisoformat(job_data["updated_at"])
                    if updated < cutoff:
                        to_remove.append(job_id)
                except:
                    to_remove.append(job_id)
            
            for job_id in to_remove:
                del self._progress[job_id]

# Global progress tracker instance
progress_tracker = ProgressTracker()

