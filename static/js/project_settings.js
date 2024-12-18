class ProjectSettings {
    constructor() {
        this.form = document.getElementById('projectSettingsForm');
        this.init();
    }

    init() {
        this.loadProjectConfig();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async loadProjectConfig() {
        try {
            const projectName = document.getElementById('projectName').value;
            const response = await fetch(`/api/project_config?name=${projectName}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                this.fillFormData(result.data);
            }
        } catch (error) {
            console.error('Error loading project config:', error);
            alert('加载项目配置失败: ' + error.message);
        }
    }

    fillFormData(config) {
        document.getElementById('condaEnv').value = config.conda_env || '';
        document.getElementById('pythonVersion').value = config.python_version || '3.9';
        document.getElementById('startupFile').value = config.startup_file || '';
        document.getElementById('apiFile').value = config.api_file || '';
        document.getElementById('downloadUrl').value = config.download_url || '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            const response = await fetch('/api/project_config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                alert('项目配置保存成功！');
                window.history.back();
            } else {
                throw new Error(result.error || '保存失败');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            alert('保存配置失败: ' + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProjectSettings();
}); 