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
        return `
            <div class="project-card">
                <h3>${project.name}</h3>
                <div class="project-info">
                    <p><i class="fab fa-python"></i> Python ${project.python_version}</p>
                    <p><i class="fas fa-terminal"></i> ${project.env_name}</p>
                    <p><i class="fas fa-code-branch"></i> ${project.branch}</p>
                </div>
                <div class="project-actions">
                    <button onclick="window.location.href='/settings?project=${project.name}'">
                        <i class="fas fa-cog"></i> 设置
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