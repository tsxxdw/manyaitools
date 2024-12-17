class ProjectManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadProjects();
        this.bindEvents();
    }

    bindEvents() {
        $('.add-project-btn').on('click', () => {
            $('#addCardModal').css('display', 'flex');
            $('#cardName').focus();
        });
        
        $('.close-btn').on('click', () => {
            this.closeModal();
        });
        
        $('#addCardForm').on('submit', async (e) => {
            e.preventDefault();
            const name = $('#cardName').val();
            
            try {
                const data = {
                    name: name
                };
                
                const response = await fetch('/api/save_card', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('卡片创建成功！');
                    this.closeModal();
                    this.loadProjects();
                } else {
                    throw new Error(result.error || '保存失败');
                }
            } catch (error) {
                alert('保存失败: ' + error.message);
            }
        });
    }

    closeModal() {
        $('#addCardModal').css('display', 'none');
        $('#cardName').val('');
    }

    loadProjects() {
        $.get('/api/projects', (response) => {
            if (response && response.success) {
                const projects = response.data || [];
                this.renderProjects(projects);
            } else {
                this.showError(response?.error || '加载失败');
            }
        }).fail((xhr, status, error) => {
            this.showError('网络错误');
        });
    }

    renderProjects(projects) {
        if (projects.length === 0) {
            this.showEmptyState();
            return;
        }

        const projectsHtml = projects.map(project => this.renderProjectCard(project)).join('');
        $('#projectList').html(projectsHtml);
    }

    renderProjectCard(project) {
        const statusClass = project.status === 'running' ? 'status-running' : 'status-stopped';
        const statusText = project.status === 'running' ? '运行中' : '已停止';
        const portText = project.port ? project.port : '0.0.0.0';
        
        return `
            <div class="project-card">
                <div class="card-content">
                    <div class="project-title">
                        <span class="label">项目名称：</span>
                        <span class="value">${project.name}</span>
                    </div>
                    <div class="project-info">
                        <p class="info-item port-info">
                            <span class="label">端口号：</span>
                            <span class="value">${portText}</span>
                        </p>
                        <p class="info-item status-info">
                            <span class="label">状态：</span>
                            <span class="status-text ${statusClass}">${statusText}</span>
                        </p>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn-action btn-start" onclick="projectManager.startProject('${project.name}')">
                        <i class="fas fa-play"></i> 启动
                    </button>
                    <button class="btn-action btn-stop" onclick="projectManager.stopProject('${project.name}')">
                        <i class="fas fa-stop"></i> 停止
                    </button>
                    <button class="btn-action btn-settings" onclick="window.location.href='/settings?project=${project.name}'">
                        <i class="fas fa-cog"></i> 配置
                    </button>
                    <button class="btn-action btn-logs" onclick="projectManager.viewLogs('${project.name}')">
                        <i class="fas fa-file-alt"></i> 日志
                    </button>
                </div>
            </div>
        `;
    }

    showEmptyState() {
        $('#projectList').html(`
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <p>暂无项目，点击右上角添加新项目</p>
            </div>
        `);
    }

    showError(message) {
        $('#projectList').html(`
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>错误：${message}</p>
            </div>
        `);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ProjectManager();
}); 