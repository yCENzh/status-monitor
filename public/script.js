// 全局变量
let sites = [];
let currentLang = localStorage.getItem('lang') || 'zh';
let translations = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 设置当前年份
  document.getElementById('current-year').textContent = new Date().getFullYear();
  await initApp();
});

async function initApp() {
  initTheme();
  await loadTranslations();
  applyLanguage(currentLang);
  await fetchData();
  setupEventListeners();
}

// 加载语言文件
async function loadTranslations() {
  try {
    const response = await fetch(`locales/${currentLang}.json`);
    translations = await response.json();
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

// 应用当前语言
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  // 更新所有带有data-i18n属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });
  
  // 更新所有带有data-i18n-placeholder属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.placeholder = translations[key];
    }
  });
  
  // 重新渲染数据相关部分
  if (sites.length > 0) {
    renderSites();
    renderStats();
    renderTimeline();
  }
}

// 加载数据
async function fetchData() {
  showLoading(true);
  
  try {
    // 实际应用中应调用真实API
    const response = await fetch('sites.json');
    sites = await response.json();
    
    // 先渲染数据
    renderSites();
    renderStats();
    renderTimeline();
    
    // 然后初始化图表（需要数据）
    initChart();
    
    // 最后隐藏加载状态
    showLoading(false);
  } catch (error) {
    console.error('Failed to load data:', error);
    showLoading(false);
  }
}

// 显示/隐藏加载状态
function showLoading(show) {
  const spinner = document.getElementById('loading-spinner');
  const container = document.getElementById('sites-container');
  
  if (show) {
    spinner.style.display = 'block';
    container.style.display = 'none';
  } else {
    spinner.style.display = 'none';
    container.style.display = 'flex';
  }
}

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
  const statusText = site.status === 'online' ? translations.online || 'Online' : translations.offline || 'Offline';
  const lastChecked = new Date(site.lastChecked).toLocaleString();
  
  card.innerHTML = `
    <div class="card site-card">
      <div class="card-body">
        <span class="badge ${statusClass} status-badge">${statusText}</span>
        <h5 class="card-title">${site.name}</h5>
        <p class="card-text">${site.description}</p>
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between">
            <span>${translations.responseTime || 'Response Time:'}</span>
            <span>${site.responseTime}ms</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>${translations.uptime || 'Uptime:'}</span>
            <span>${site.uptime}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between">
            <span>${translations.lastChecked || 'Last Checked:'}</span>
            <span>${lastChecked}</span>
          </li>
        </ul>
        <a href="${site.url}" target="_blank" class="btn btn-outline-primary mt-3">
          ${translations.visitSite || 'Visit Site'}
        </a>
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
      setInterval(fetchData, 30000);
    } else {
      console.log('自动刷新已禁用');
      clearInterval(window.refreshInterval);
    }
  });
  
  // 语言切换
  document.querySelectorAll('.dropdown-item[data-lang]').forEach(item => {
    item.addEventListener('click', async (e) => {
      const lang = e.target.getAttribute('data-lang');
      await loadTranslations();
      applyLanguage(lang);
    });
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

// 初始化时设置自动刷新定时器
window.refreshInterval = setInterval(fetchData, 30000);
