class ProjectSettings {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.form = document.getElementById('projectSettingsForm');
            this.init();
            this.bindEvents();
        });
    }

    async init() {
        await this.loadProjectConfig();
    }

    bindEvents() {
        document.getElementById('pythonVersion').addEventListener('change', () => this.updateCondaCommand());
        document.getElementById('condaEnv').addEventListener('input', () => this.updateCondaCommand());
    }

    updateCondaCommand() {
        const pythonVersion = document.getElementById('pythonVersion').value;
        const condaEnv = document.getElementById('condaEnv').value;
        const envName = condaEnv || document.getElementById('projectName').value || 'your-env';
        
        const defaultCommandElement = document.getElementById('condaCommandDefault');
        const chinaCommandElement = document.getElementById('condaCommandChina');

        if (defaultCommandElement && chinaCommandElement) {
            const defaultCommand = `conda create -n ${envName} python=${pythonVersion}`;
            defaultCommandElement.textContent = defaultCommand;
            
            const chinaCommand = `conda create -n ${envName} python=${pythonVersion} -c https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/`;
            chinaCommandElement.textContent = chinaCommand;
        }
    }

    async executeCondaCommand(source) {
        try {
            const pythonVersion = document.getElementById('pythonVersion').value;
            const condaEnv = document.getElementById('condaEnv').value;
            
            if (!condaEnv) {
                throw new Error('请先填写Conda环境名称');
            }

            const data = {
                conda_env: condaEnv,
                python_version: pythonVersion,
                source: source
            };

            const response = await fetch('/api/execute_conda_command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                alert('conda环境创建成功！');
            } else {
                throw new Error(result.error || '创建失败');
            }
        } catch (error) {
            console.error('Error executing conda command:', error);
            alert('执行命令失败: ' + error.message);
        }
    }

    async loadProjectConfig() {
        try {
            const projectName = document.getElementById('projectName').value;
            const response = await fetch(`/api/project_config?name=${projectName}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                this.fillFormData(result.data);
                this.updateCondaCommand();
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

const projectSettings = new ProjectSettings(); 