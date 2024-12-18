import json
import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

@app.route('/api/projects')
def get_projects():
    try:
        # 确保配置目录存在
        config_dir = os.path.join(os.path.dirname(__file__), 'config')
        if not os.path.exists(config_dir):
            os.makedirs(config_dir)
            
        config_file = os.path.join(config_dir, 'project_setting.json')
        
        # 如果配置文件不存在，返回空列表
        if not os.path.exists(config_file):
            return jsonify({
                'success': True,
                'data': []
            })
            
        # 读取项目配置
        with open(config_file, 'r', encoding='utf-8') as f:
            projects = json.load(f)
            
        return jsonify({
            'success': True,
            'data': projects
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/system-settings')
def system_settings():
    return render_template('system_settings.html')

@app.route('/add_card')
def add_card():
    return render_template('add_card.html')

@app.route('/api/save_card', methods=['POST'])
def save_card():
    try:
        data = request.get_json()
        
        # 确保配置目录存在
        config_dir = os.path.join(os.path.dirname(__file__), 'config')
        if not os.path.exists(config_dir):
            os.makedirs(config_dir)
            
        config_file = os.path.join(config_dir, 'project_setting.json')
        
        # 读取现有配置
        projects = []
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                projects = json.load(f)
                
        # 检查项目名称是否已存在
        if any(project['name'] == data['name'] for project in projects):
            return jsonify({
                'success': False,
                'error': '项目名称已存在'
            })
                
        # 添加新项目
        projects.append({
            'name': data['name']
        })
        
        # 保存更新后的配置
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(projects, f, ensure_ascii=False, indent=2)
            
        return jsonify({
            'success': True,
            'message': '保存成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/system_config', methods=['GET', 'POST'])
def system_config():
    config_file = os.path.join(os.path.dirname(__file__), 'config', 'system_config.json')
    
    if request.method == 'GET':
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
            else:
                config = {
                    'project_path': '',
                    'proxy_address': ''
                }
            return jsonify({
                'success': True,
                'data': config
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # 确保配置目录存在
            config_dir = os.path.dirname(config_file)
            if not os.path.exists(config_dir):
                os.makedirs(config_dir)
            
            # 保存配置
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            return jsonify({
                'success': True,
                'message': '保存成功'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })

@app.route('/project-settings')
def project_settings():
    project_name = request.args.get('name')
    return render_template('project_settings.html', project_name=project_name)

@app.route('/api/project_config', methods=['GET', 'POST'])
def project_config():
    config_file = os.path.join(os.path.dirname(__file__), 'config', 'project_setting.json')
    
    if request.method == 'GET':
        try:
            project_name = request.args.get('name')
            if os.path.exists(config_file):
                with open(config_file, 'r', encoding='utf-8') as f:
                    projects = json.load(f)
                    project = next((p for p in projects if p['name'] == project_name), None)
                    if project:
                        return jsonify({
                            'success': True,
                            'data': project
                        })
            return jsonify({
                'success': True,
                'data': {'name': project_name}
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            if os.path.exists(config_file):
                with open(config_file, 'r', encoding='utf-8') as f:
                    projects = json.load(f)
            else:
                projects = []
            
            project_index = next((i for i, p in enumerate(projects) if p['name'] == data['name']), None)
            if project_index is not None:
                projects[project_index].update(data)
            else:
                projects.append(data)
            
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(projects, f, ensure_ascii=False, indent=2)
            
            return jsonify({
                'success': True,
                'message': '保存成功'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1000, debug=True) 