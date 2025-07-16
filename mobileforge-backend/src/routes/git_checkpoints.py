"""
Git Auto-commits and Checkpoint System
Handles automatic commits, checkpoint creation, and context migration between chats
"""

from flask import Blueprint, request, jsonify
import git
import os
import json
import time
import shutil
from typing import Dict, List, Optional
from datetime import datetime
import hashlib

git_bp = Blueprint('git', __name__)

# Base directory for Git repositories
REPOS_BASE_DIR = "/workspace/repos"
CHECKPOINTS_DIR = "/workspace/checkpoints"

def ensure_directories():
    """Ensure required directories exist"""
    os.makedirs(REPOS_BASE_DIR, exist_ok=True)
    os.makedirs(CHECKPOINTS_DIR, exist_ok=True)

def get_repo_path(user_id: str, project_id: str) -> str:
    """Get the repository path for a user/project"""
    return os.path.join(REPOS_BASE_DIR, f"{user_id}_{project_id}")

def get_checkpoint_path(user_id: str, project_id: str, checkpoint_id: str) -> str:
    """Get the checkpoint path"""
    return os.path.join(CHECKPOINTS_DIR, f"{user_id}_{project_id}_{checkpoint_id}")

def init_or_get_repo(repo_path: str) -> git.Repo:
    """Initialize or get existing Git repository"""
    if os.path.exists(repo_path):
        return git.Repo(repo_path)
    else:
        os.makedirs(repo_path, exist_ok=True)
        repo = git.Repo.init(repo_path)
        
        # Configure Git user
        with repo.config_writer() as git_config:
            git_config.set_value("user", "name", "MobileForge")
            git_config.set_value("user", "email", "mobileforge@123agent.eu")
        
        # Create initial commit
        gitignore_content = """
# Dependencies
node_modules/
*.log
npm-debug.log*

# Build outputs
dist/
build/
*.tgz

# Environment files
.env
.env.local

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# MobileForge specific
.mobileforge/
checkpoints/
"""
        
        gitignore_path = os.path.join(repo_path, '.gitignore')
        with open(gitignore_path, 'w') as f:
            f.write(gitignore_content.strip())
        
        readme_content = f"""# MobileForge Project

This project was created with MobileForge - AI Mobile App Creator.

## Getting Started

This is a React Native project. To run it:

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Run on iOS: `npm run ios`
4. Run on Android: `npm run android`

## Features

- Cross-platform mobile app (iOS & Android)
- Modern React Native architecture
- Professional UI/UX components
- Real-time functionality

## Deployment

Use MobileForge's deployment tools to publish to app stores.

---

Created with ❤️ by MobileForge
"""
        
        readme_path = os.path.join(repo_path, 'README.md')
        with open(readme_path, 'w') as f:
            f.write(readme_content)
        
        repo.index.add(['.gitignore', 'README.md'])
        repo.index.commit("Initial commit - MobileForge project setup")
        
        return repo

@git_bp.route('/repos', methods=['POST'])
def create_repository():
    """Create a new Git repository for a project"""
    try:
        ensure_directories()
        
        data = request.get_json()
        user_id = data.get('user_id', 'default')
        project_id = data.get('project_id')
        project_name = data.get('project_name', 'MobileForge Project')
        description = data.get('description', '')
        
        if not project_id:
            return jsonify({'success': False, 'error': 'Project ID is required'}), 400
        
        repo_path = get_repo_path(user_id, project_id)
        
        if os.path.exists(repo_path):
            return jsonify({'success': False, 'error': 'Repository already exists'}), 400
        
        repo = init_or_get_repo(repo_path)
        
        # Create project metadata
        metadata = {
            'user_id': user_id,
            'project_id': project_id,
            'project_name': project_name,
            'description': description,
            'created_at': datetime.now().isoformat(),
            'last_commit': None,
            'checkpoints': []
        }
        
        metadata_path = os.path.join(repo_path, '.mobileforge', 'metadata.json')
        os.makedirs(os.path.dirname(metadata_path), exist_ok=True)
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        repo.index.add(['.mobileforge/metadata.json'])
        commit = repo.index.commit(f"Create project: {project_name}")
        
        return jsonify({
            'success': True,
            'repository': {
                'user_id': user_id,
                'project_id': project_id,
                'path': repo_path,
                'commit_hash': commit.hexsha,
                'created_at': metadata['created_at']
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/repos/<user_id>/<project_id>/commit', methods=['POST'])
def auto_commit(user_id: str, project_id: str):
    """Create an automatic commit with current changes"""
    try:
        ensure_directories()
        
        data = request.get_json()
        message = data.get('message', 'Auto-commit: Save progress')
        files = data.get('files', [])  # Specific files to commit, or empty for all
        
        repo_path = get_repo_path(user_id, project_id)
        
        if not os.path.exists(repo_path):
            return jsonify({'success': False, 'error': 'Repository not found'}), 404
        
        repo = git.Repo(repo_path)
        
        # Add files to staging
        if files:
            # Add specific files
            for file_path in files:
                full_path = os.path.join(repo_path, file_path)
                if os.path.exists(full_path):
                    repo.index.add([file_path])
        else:
            # Add all changed files
            repo.git.add(A=True)
        
        # Check if there are changes to commit
        if not repo.index.diff("HEAD"):
            return jsonify({
                'success': True,
                'message': 'No changes to commit',
                'commit_hash': repo.head.commit.hexsha
            })
        
        # Create commit
        commit = repo.index.commit(message)
        
        # Update metadata
        metadata_path = os.path.join(repo_path, '.mobileforge', 'metadata.json')
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            metadata['last_commit'] = {
                'hash': commit.hexsha,
                'message': message,
                'timestamp': datetime.now().isoformat(),
                'files_changed': len(commit.stats.files)
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        return jsonify({
            'success': True,
            'commit': {
                'hash': commit.hexsha,
                'message': message,
                'timestamp': commit.committed_datetime.isoformat(),
                'author': str(commit.author),
                'files_changed': len(commit.stats.files),
                'stats': {
                    'insertions': commit.stats.total['insertions'],
                    'deletions': commit.stats.total['deletions'],
                    'files': commit.stats.total['files']
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/repos/<user_id>/<project_id>/checkpoints', methods=['POST'])
def create_checkpoint(user_id: str, project_id: str):
    """Create a checkpoint (snapshot) of the current project state"""
    try:
        ensure_directories()
        
        data = request.get_json()
        checkpoint_name = data.get('name', f'checkpoint_{int(time.time())}')
        description = data.get('description', 'Auto-generated checkpoint')
        context_data = data.get('context', {})  # Chat context, variables, etc.
        
        repo_path = get_repo_path(user_id, project_id)
        
        if not os.path.exists(repo_path):
            return jsonify({'success': False, 'error': 'Repository not found'}), 404
        
        repo = git.Repo(repo_path)
        
        # First, auto-commit any pending changes
        repo.git.add(A=True)
        if repo.index.diff("HEAD"):
            commit = repo.index.commit(f"Auto-commit before checkpoint: {checkpoint_name}")
        else:
            commit = repo.head.commit
        
        # Generate checkpoint ID
        checkpoint_id = hashlib.md5(f"{user_id}_{project_id}_{checkpoint_name}_{time.time()}".encode()).hexdigest()[:12]
        checkpoint_path = get_checkpoint_path(user_id, project_id, checkpoint_id)
        
        # Create checkpoint directory
        os.makedirs(checkpoint_path, exist_ok=True)
        
        # Copy repository state
        repo_backup_path = os.path.join(checkpoint_path, 'repo')
        shutil.copytree(repo_path, repo_backup_path, ignore=shutil.ignore_patterns('.git'))
        
        # Save checkpoint metadata
        checkpoint_metadata = {
            'id': checkpoint_id,
            'name': checkpoint_name,
            'description': description,
            'user_id': user_id,
            'project_id': project_id,
            'created_at': datetime.now().isoformat(),
            'commit_hash': commit.hexsha,
            'commit_message': commit.message.strip(),
            'context': context_data,
            'files_count': len(list(os.walk(repo_backup_path))),
            'size_bytes': sum(os.path.getsize(os.path.join(dirpath, filename))
                            for dirpath, dirnames, filenames in os.walk(repo_backup_path)
                            for filename in filenames)
        }
        
        checkpoint_metadata_path = os.path.join(checkpoint_path, 'metadata.json')
        with open(checkpoint_metadata_path, 'w') as f:
            json.dump(checkpoint_metadata, f, indent=2)
        
        # Update project metadata
        project_metadata_path = os.path.join(repo_path, '.mobileforge', 'metadata.json')
        if os.path.exists(project_metadata_path):
            with open(project_metadata_path, 'r') as f:
                project_metadata = json.load(f)
            
            if 'checkpoints' not in project_metadata:
                project_metadata['checkpoints'] = []
            
            project_metadata['checkpoints'].append({
                'id': checkpoint_id,
                'name': checkpoint_name,
                'created_at': checkpoint_metadata['created_at'],
                'commit_hash': commit.hexsha
            })
            
            with open(project_metadata_path, 'w') as f:
                json.dump(project_metadata, f, indent=2)
        
        return jsonify({
            'success': True,
            'checkpoint': checkpoint_metadata
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/repos/<user_id>/<project_id>/checkpoints', methods=['GET'])
def list_checkpoints(user_id: str, project_id: str):
    """List all checkpoints for a project"""
    try:
        ensure_directories()
        
        repo_path = get_repo_path(user_id, project_id)
        
        if not os.path.exists(repo_path):
            return jsonify({'success': False, 'error': 'Repository not found'}), 404
        
        # Get checkpoints from project metadata
        project_metadata_path = os.path.join(repo_path, '.mobileforge', 'metadata.json')
        checkpoints = []
        
        if os.path.exists(project_metadata_path):
            with open(project_metadata_path, 'r') as f:
                project_metadata = json.load(f)
                checkpoints = project_metadata.get('checkpoints', [])
        
        # Enrich with detailed checkpoint data
        detailed_checkpoints = []
        for checkpoint_ref in checkpoints:
            checkpoint_path = get_checkpoint_path(user_id, project_id, checkpoint_ref['id'])
            metadata_path = os.path.join(checkpoint_path, 'metadata.json')
            
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    checkpoint_data = json.load(f)
                    detailed_checkpoints.append(checkpoint_data)
        
        return jsonify({
            'success': True,
            'checkpoints': detailed_checkpoints
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/repos/<user_id>/<project_id>/checkpoints/<checkpoint_id>/restore', methods=['POST'])
def restore_checkpoint(user_id: str, project_id: str, checkpoint_id: str):
    """Restore a project to a specific checkpoint"""
    try:
        ensure_directories()
        
        repo_path = get_repo_path(user_id, project_id)
        checkpoint_path = get_checkpoint_path(user_id, project_id, checkpoint_id)
        
        if not os.path.exists(checkpoint_path):
            return jsonify({'success': False, 'error': 'Checkpoint not found'}), 404
        
        # Load checkpoint metadata
        metadata_path = os.path.join(checkpoint_path, 'metadata.json')
        with open(metadata_path, 'r') as f:
            checkpoint_metadata = json.load(f)
        
        # Backup current state before restore
        backup_data = request.get_json() or {}
        if backup_data.get('create_backup', True):
            backup_result = create_checkpoint(user_id, project_id)
            if not backup_result[0].get_json().get('success'):
                return jsonify({'success': False, 'error': 'Failed to create backup before restore'}), 500
        
        # Restore repository state
        repo_backup_path = os.path.join(checkpoint_path, 'repo')
        
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)
        
        shutil.copytree(repo_backup_path, repo_path)
        
        # Reinitialize Git repository
        repo = init_or_get_repo(repo_path)
        
        # Create restore commit
        repo.git.add(A=True)
        restore_commit = repo.index.commit(f"Restore from checkpoint: {checkpoint_metadata['name']}")
        
        return jsonify({
            'success': True,
            'restored_checkpoint': checkpoint_metadata,
            'restore_commit': restore_commit.hexsha,
            'message': f'Successfully restored to checkpoint: {checkpoint_metadata["name"]}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/repos/<user_id>/<project_id>/migrate-context', methods=['POST'])
def migrate_context(user_id: str, project_id: str):
    """Migrate context from old chat to new chat with digest"""
    try:
        data = request.get_json()
        old_chat_id = data.get('old_chat_id')
        new_chat_id = data.get('new_chat_id')
        chat_history = data.get('chat_history', [])
        
        if not old_chat_id or not new_chat_id:
            return jsonify({'success': False, 'error': 'Both old_chat_id and new_chat_id are required'}), 400
        
        # Create digest of chat history
        digest = create_chat_digest(chat_history)
        
        # Create checkpoint with context migration
        checkpoint_data = {
            'name': f'context_migration_{old_chat_id}_to_{new_chat_id}',
            'description': f'Context migration from chat {old_chat_id} to {new_chat_id}',
            'context': {
                'old_chat_id': old_chat_id,
                'new_chat_id': new_chat_id,
                'chat_digest': digest,
                'migration_timestamp': datetime.now().isoformat(),
                'full_history_length': len(chat_history)
            }
        }
        
        # Create checkpoint
        checkpoint_result = create_checkpoint(user_id, project_id)
        if not checkpoint_result[0].get_json().get('success'):
            return jsonify({'success': False, 'error': 'Failed to create migration checkpoint'}), 500
        
        return jsonify({
            'success': True,
            'migration': {
                'old_chat_id': old_chat_id,
                'new_chat_id': new_chat_id,
                'digest': digest,
                'checkpoint_created': True
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def create_chat_digest(chat_history: List[Dict]) -> Dict:
    """Create a digest of chat history for context migration"""
    if not chat_history:
        return {'summary': 'No chat history available'}
    
    # Extract key information
    total_messages = len(chat_history)
    user_messages = [msg for msg in chat_history if msg.get('role') == 'user']
    assistant_messages = [msg for msg in chat_history if msg.get('role') == 'assistant']
    
    # Get key topics and decisions
    key_decisions = []
    project_details = {}
    
    for msg in chat_history:
        content = msg.get('content', '')
        if 'create' in content.lower() or 'build' in content.lower():
            key_decisions.append({
                'type': 'creation_request',
                'content': content[:200] + '...' if len(content) > 200 else content,
                'timestamp': msg.get('timestamp')
            })
        elif 'deploy' in content.lower() or 'publish' in content.lower():
            key_decisions.append({
                'type': 'deployment_action',
                'content': content[:200] + '...' if len(content) > 200 else content,
                'timestamp': msg.get('timestamp')
            })
    
    # Extract project information
    for msg in user_messages[:5]:  # Look at first few user messages
        content = msg.get('content', '').lower()
        if 'app' in content:
            project_details['type'] = 'mobile_app'
        if 'react native' in content:
            project_details['framework'] = 'react_native'
        if 'flutter' in content:
            project_details['framework'] = 'flutter'
    
    return {
        'summary': f'Chat session with {total_messages} messages ({len(user_messages)} user, {len(assistant_messages)} assistant)',
        'project_details': project_details,
        'key_decisions': key_decisions[-10:],  # Last 10 key decisions
        'message_count': total_messages,
        'created_at': datetime.now().isoformat()
    }

@git_bp.route('/repos/<user_id>/<project_id>/history', methods=['GET'])
def get_commit_history(user_id: str, project_id: str):
    """Get commit history for a project"""
    try:
        repo_path = get_repo_path(user_id, project_id)
        
        if not os.path.exists(repo_path):
            return jsonify({'success': False, 'error': 'Repository not found'}), 404
        
        repo = git.Repo(repo_path)
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)
        
        commits = []
        for commit in repo.iter_commits(max_count=limit, skip=skip):
            commits.append({
                'hash': commit.hexsha,
                'short_hash': commit.hexsha[:8],
                'message': commit.message.strip(),
                'author': str(commit.author),
                'timestamp': commit.committed_datetime.isoformat(),
                'stats': {
                    'files': commit.stats.total['files'],
                    'insertions': commit.stats.total['insertions'],
                    'deletions': commit.stats.total['deletions']
                }
            })
        
        return jsonify({
            'success': True,
            'commits': commits,
            'total_commits': len(list(repo.iter_commits()))
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@git_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for Git system"""
    try:
        ensure_directories()
        
        # Check if directories are writable
        test_file = os.path.join(REPOS_BASE_DIR, '.test')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        return jsonify({
            'success': True,
            'message': 'Git system healthy',
            'repos_dir': REPOS_BASE_DIR,
            'checkpoints_dir': CHECKPOINTS_DIR
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

