class WebsiteMonitor {
    constructor() {
        this.sites = [];
        this.checkInterval = 30000; // 30秒
        this.timeout = 6000; // 6秒超时
        this.intervalId = null;
        this.progressIntervalId = null;
    }

    async init() {
        await this.loadSites();
        this.render();
        await this.checkAllSites();
        this.startAutoCheck();
        this.startProgressBar();
    }

    async loadSites() {
        try {
            const response = await fetch('./status.json');
            const data = await response.json();
            this.sites = data.sites.map(site => ({
                ...site,
                status: 'checking',
                responseTime: null,
                lastCheck: null
            }));
        } catch (error) {
            console.error('加载配置失败:', error);
            this.sites = [];
        }
    }

    render() {
        const grid = document.getElementById('monitor-grid');
        grid.innerHTML = '';

        this.sites.forEach((site, index) => {
            const item = document.createElement('div');
            item.className = 'monitor-item';
            item.id = `site-${index}`;
            
            const statusClass = this.getStatusClass(site.status);
            const statusText = this.getStatusText(site.status);
            const responseTimeClass = this.getResponseTimeClass(site.responseTime);
            
            item.innerHTML = `
                <div class="monitor-header">
                    <div class="monitor-name">${site.name}</div>
                    <div class="status-badge ${statusClass}">${statusText}</div>
                </div>
                <div class="monitor-url">${site.url}</div>
                <div class="monitor-details">
                    <span class="response-time ${responseTimeClass}">
                        ${site.responseTime !== null ? site.responseTime + 'ms' : '--'}
                    </span>
                    <span class="last-check">
                        ${site.lastCheck ? new Date(site.lastCheck).toLocaleTimeString() : '--'}
                    </span>
                </div>
            `;
            
            grid.appendChild(item);
        });

        this.updateStats();
    }

    getStatusClass(status) {
        switch(status) {
            case 'online': return 'status-online';
            case 'offline': return 'status-offline';
            default: return 'status-checking';
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'online': return '在线';
            case 'offline': return '离线';
            default: return '检测中';
        }
    }

    getResponseTimeClass(time) {
        if (time === null) return '';
        if (time < 1000) return 'fast';
        if (time < 3000) return 'medium';
        return 'slow';
    }

    async checkSite(site, index) {
        const item = document.getElementById(`site-${index}`);
        if (item) {
            item.classList.add('pulse');
        }

        const startTime = Date.now();
        
        try {
            const response = await fetch(`/.netlify/functions/check?url=${encodeURIComponent(site.url)}`, {
                signal: AbortSignal.timeout(this.timeout)
            });
            
            const data = await response.json();
            const responseTime = Date.now() - startTime;
            
            site.status = data.status === 'ok' ? 'online' : 'offline';
            site.responseTime = responseTime;
            site.lastCheck = Date.now();
        } catch (error) {
            site.status = 'offline';
            site.responseTime = null;
            site.lastCheck = Date.now();
        }

        if (item) {
            item.classList.remove('pulse');
        }
        
        this.updateSiteDisplay(site, index);
    }

    updateSiteDisplay(site, index) {
        const item = document.getElementById(`site-${index}`);
        if (!item) return;

        const statusBadge = item.querySelector('.status-badge');
        const responseTime = item.querySelector('.response-time');
        const lastCheck = item.querySelector('.last-check');

        statusBadge.className = `status-badge ${this.getStatusClass(site.status)}`;
        statusBadge.textContent = this.getStatusText(site.status);
        
        responseTime.className = `response-time ${this.getResponseTimeClass(site.responseTime)}`;
        responseTime.textContent = site.responseTime !== null ? site.responseTime + 'ms' : '--';
        
        lastCheck.textContent = site.lastCheck ? new Date(site.lastCheck).toLocaleTimeString() : '--';
        
        this.updateStats();
    }

    async checkAllSites() {
        document.getElementById('last-update').textContent = '检测中...';
        
        const promises = this.sites.map((site, index) => 
            this.checkSite(site, index)
        );
        
        await Promise.all(promises);
        
        document.getElementById('last-update').textContent = 
            new Date().toLocaleString('zh-CN');
    }

    updateStats() {
        const online = this.sites.filter(s => s.status === 'online').length;
        const offline = this.sites.filter(s => s.status === 'offline').length;
        const checking = this.sites.filter(s => s.status === 'checking').length;
        
        document.getElementById('online-count').textContent = online;
        document.getElementById('offline-count').textContent = offline;
        document.getElementById('checking-count').textContent = checking;
    }

    startAutoCheck() {
        this.intervalId = setInterval(() => {
            this.checkAllSites();
        }, this.checkInterval);
    }

    startProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        let width = 100;
        const step = 100 / (this.checkInterval / 1000);
        
        progressFill.style.width = '100%';
        
        this.progressIntervalId = setInterval(() => {
            width -= step;
            if (width <= 0) {
                width = 100;
            }
            progressFill.style.width = width + '%';
        }, 1000);
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.progressIntervalId) {
            clearInterval(this.progressIntervalId);
        }
    }
}

const monitor = new WebsiteMonitor();
document.addEventListener('DOMContentLoaded', () => {
    monitor.init();
});