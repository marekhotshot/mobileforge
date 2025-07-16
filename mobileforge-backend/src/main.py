import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from routes.llm import llm_bp
from routes.apps import apps_bp
from routes.codegen import codegen_bp
from routes.containers import containers_bp
from routes.cloudflare import cloudflare_bp
from routes.k8s_orchestration import k8s_bp
from routes.elbia_domains import elbia_bp
from routes.git_checkpoints import git_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app, origins=['*'])

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(llm_bp, url_prefix='/api/llm')
app.register_blueprint(apps_bp, url_prefix='/api/apps')
app.register_blueprint(codegen_bp, url_prefix='/api/codegen')
app.register_blueprint(containers_bp)
app.register_blueprint(cloudflare_bp, url_prefix='/api/cloudflare')
app.register_blueprint(k8s_bp, url_prefix='/api/k8s')
app.register_blueprint(elbia_bp, url_prefix='/api/domains')
app.register_blueprint(git_bp, url_prefix='/api/git')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
