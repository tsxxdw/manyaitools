class SystemSettings {
    constructor() {
        this.form = document.getElementById('systemSettingsForm');
        this.init();
    }

    init() {
        this.loadSystemConfig();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async loadSystemConfig() {
        try {
            const response = await fetch('/api/system_config');
            const result = await response.json();
            
            if (result.success && result.data) {
                this.fillFormData(result.data);
            } else {
                throw new Error(result.error || '加载配置失败');
            }
        } catch (error) {
            console.error('Error loading system config:', error);
            alert('加载系统配置失败: ' + error.message);
        }
    }

    fillFormData(config) {
        document.getElementById('projectPath').value = config.project_path || '';
        document.getElementById('proxyAddress').value = config.proxy_address || '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
            
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            const response = await fetch('/api/system_config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                alert('系统配置保存成功！');
                window.history.back();
            } else {
                throw new Error(result.error || '保存失败');
            }
            
        } catch (error) {
            console.error('Error saving config:', error);
            alert('保存配置失败: ' + error.message);
            
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> 保存配置';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SystemSettings();
}); 