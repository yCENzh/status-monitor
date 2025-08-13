// 模拟数据 - 实际应用中应替换为真实API
const sites = [
  {
    id: 1,
    name: "谷歌",
    url: "https://google.com",
    status: "online",
    responseTime: 120,
    lastChecked: "2023-07-15T10:30:00Z",
    description: "全球最大的搜索引擎",
    uptime: "99.99%",
    history: [
      { timestamp: "2023-07-15T10:00:00Z", status: "online", responseTime: 110 },
      { timestamp: "2023-07-15T09:30:00Z", status: "online", responseTime: 115 },
      { timestamp: "2023-07-15T09:00:00Z", status: "offline", responseTime: 0 }
    ]
  },
  {
    id: 2,
    name: "百度",
    url: "https://baidu.com",
    status: "online",
    responseTime: 85,
    lastChecked: "2023-07-15T10:28:00Z",
    description: "中国最大的搜索引擎",
    uptime: "99.95%",
    history: [
      { timestamp: "2023-07-15T10:00:00Z", status: "online", responseTime: 80 },
      { timestamp: "2023-07-15T09:30:00Z", status: "online", responseTime: 90 },
      { timestamp: "2023-07-15T09:00:00Z", status: "online", responseTime: 85 }
    ]
  },
  {
    id: 3,
    name: "GitHub",
    url: "https://github.com",
    status: "offline",
    responseTime: 0,
    lastChecked: "2023-07-15T10:25:00Z",
    description: "代码托管平台",
    uptime: "99.90%",
    history: [
      { timestamp: "2023-07-15T10:00:00Z", status: "online", responseTime: 200 },
      { timestamp: "2023-07-15T09:30:00Z", status: "online", responseTime: 210 },
      { timestamp: "2023-07-15T09:00:00Z", status: "offline", responseTime: 0 }
    ]
  }
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderSites();
  renderStats();
  renderTimeline();
  initChart();
  setupEventListeners();
});

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// 切换主题
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('#theme-toggle i');
  themeIcon.className = theme === 'light' ? 'bi bi-moon' : 'bi bi-sun';
}

// 渲染网站卡片
function renderSites() {
  const container = document.getElementById('sites-container');
  container.innerHTML = '';
  
  sites.forEach(site => {
    const card = createSiteCard(site);
    container.appendChild(card);
  });
}

// 创建网站卡片
function createSiteCard(site) {
  const card = document.createElement('div');
  card.className = 'col-md-4';
  
  const statusClass = site.status === 'online' ? 'bg-success' : 'bg-danger';
  const statusText = site.status === 'online' ? '在线' : '离线';
  const lastChecked = new Date(site.lastChecked).toLocaleString();
  
  card.innerHTML = `
    <div class="card site-card">
      <div class="card-body">
        <span class="badge ${statusClass} status-badge">${statusText}</span>
        <h5 class="card-title">${site.name}</h5>
        <p class="card-text">${site.description}</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between">
            <span>响应时间:</span>
            <span>${site.responseTime}ms</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>正常运行时间:</span>
            <span>${site.uptime}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>最后检查:</span>
            <span>${lastChecked}</span>
          </li>
        </ul>
        <a href="${site.url}" target="_blank" class="btn btn-outline-primary mt-3">访问网站</a>
      </div>
    </div>
  `;
  
  return card;
}

// 渲染统计数据
function renderStats() {
  const totalSites = sites.length;
  const onlineSites = sites.filter(site => site.status === 'online').length;
  const offlineSites = totalSites - onlineSites;
  
  const totalResponseTime = sites.reduce((sum, site) => sum + site.responseTime, 0);
  const avgResponseTime = Math.round(totalResponseTime / onlineSites) || 0;
  
  document.getElementById('total-sites').textContent = totalSites;
  document.getElementById('online-sites').textContent = onlineSites;
  document.getElementById('offline-sites').textContent = offlineSites;
  document.getElementById('avg-response').textContent = `${avgResponseTime}ms`;
}

// 渲染时间线
function renderTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  
  // 获取所有事件并按时间排序
  const allEvents = [];
  sites.forEach(site => {
    site.history.forEach(event => {
      allEvents.push({
        site: site.name,
        timestamp: event.timestamp,
        status: event.status,
        responseTime: event.responseTime
      });
    });
  });
  
  allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // 只显示最近10个事件
  const recentEvents = allEvents.slice(0, 10);
  
  recentEvents.forEach(event => {
    const eventElement = document.createElement('li');
    const eventDate = new Date(event.timestamp).toLocaleString();
    const statusClass = event.status === 'online' ? 'online' : 'offline';
    const statusText = event.status === 'online' ? '在线' : '离线';
    
    eventElement.innerHTML = `
      <div class="timeline-event ${statusClass}">
        <div class="d-flex justify-content-between">
          <strong>${event.site}</strong>
          <small>${eventDate}</small>
        </div>
        <p>状态: ${statusText} | 响应时间: ${event.responseTime || 0}ms</p>
      </div>
    `;
    
    timeline.appendChild(eventElement);
  });
}

// 初始化图表
function initChart() {
  const ctx = document.getElementById('response-chart').getContext('2d');
  
  // 获取最近30分钟的数据
  const now = new Date();
  const labels = [];
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now - i * 60000);
    labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    
    // 模拟数据 - 实际应用中应从API获取
    const value = 100 + Math.random() * 150;
    data.push(Math.round(value));
  }
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '平均响应时间 (ms)',
        data: data,
        borderColor: 'rgba(13, 110, 253, 1)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  // 主题切换
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // 搜索功能
  document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSites = sites.filter(site => 
      site.name.toLowerCase().includes(searchTerm) || 
      site.description.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('sites-container');
    container.innerHTML = '';
    
    filteredSites.forEach(site => {
      const card = createSiteCard(site);
      container.appendChild(card);
    });
  });
  
  // 自动刷新
  document.getElementById('auto-refresh').addEventListener('change', (e) => {
    if (e.target.checked) {
      // 实际应用中应启动定时器
      console.log('自动刷新已启用');
    } else {
      console.log('自动刷新已禁用');
    }
  });
}

// 模拟API调用
function fetchData() {
  // 实际应用中应调用真实API
  console.log('正在获取最新数据...');
  
  // 随机更新一些状态以模拟变化
  sites.forEach(site => {
    if (Math.random() > 0.8) {
      site.status = site.status === 'online' ? 'offline' : 'online';
      site.responseTime = site.status === 'online' ? Math.floor(Math.random() * 300) : 0;
      site.lastChecked = new Date().toISOString();
      
      // 添加到历史记录
      site.history.unshift({
        timestamp: site.lastChecked,
        status: site.status,
        responseTime: site.responseTime
      });
      
      // 只保留最近10条记录
      if (site.history.length > 10) {
        site.history.pop();
      }
    }
  });
  
  renderSites();
  renderStats();
  renderTimeline();
}

// 每30秒刷新一次数据
setInterval(fetchData, 30000);
