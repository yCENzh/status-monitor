// 全局变量
let sites = [];
let currentLang = localStorage.getItem('lang') || 'zh';
let translations = {};
let chart = null;
let autoRefreshInterval = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化AOS动画
  AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 100
  });
  
  document.getElementById('current-year').textContent = new Date().getFullYear();
  await initApp();
});

async function initApp() {
  initTheme();
  await loadTranslations();
  applyLanguage(currentLang);
  await fetchData();
  setupEventListeners();
  startAutoRefresh();
}

// 加载语言文件
async function loadTranslations() {
  try {
    const response = await fetch(`locales/${currentLang}.json`);
    translations = await response.json();
  } catch (error) {
    console.error('Failed to load translations:', error);
    // 使用默认中文
    translations = {
      heroTitle: "实时监控",
      heroSubtitle: "您的网站状态",
      heroDescription: "全天候监控网站可用性，确保您的在线服务始终保持最佳状态",
      uptimeLabel: "总体可用性",
      monitoringLabel: "持续监控",
      searchPlaceholder: "搜索网站...",
      filterAll: "全部",
      filterOnline: "在线",
      filterOffline: "离线",
      autoRefresh: "自动刷新",
      totalSites: "监控站点",
      onlineSites: "在线站点",
      offlineSites: "离线站点",
      avgResponse: "平均响应",
      loading: "正在加载数据...",
      monitoredSites: "监控站点",
      responseHistory: "响应时间趋势",
      statusTimeline: "事件时间线",
      liveUpdates: "实时更新",
      footerText: "实时监控您的网站可用性和性能",
      quickLinks: "快速链接",
      documentation: "文档",
      apiReference: "API 参考",
      support: "支持",
      online: "在线",
      offline: "离线",
      responseTime: "响应时间",
      uptime: "可用率",
      lastChecked: "最后检查",
      visitSite: "访问站点"
    };
  }
}

// 应用当前语言
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.placeholder = translations[key];
    }
  });
  
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
    const response = await fetch('sites.json');
    sites = await response.json();
    
    renderSites();
    renderStats();
    renderTimeline();
    
    if (!chart) {
      initChart();
    } else {
      updateChart();
    }
    
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
  
  spinner.style.display = show ? 'block' : 'none';
  if (!show && container) {
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
  themeIcon.className = theme === 'light' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
}

// 渲染网站卡片
function renderSites(filter = 'all') {
  const container = document.getElementById('sites-container');
  container.innerHTML = '';
  
  let filteredSites = sites;
  if (filter === 'online') {
    filteredSites = sites.filter(site => site.status === 'online');
  } else if (filter === 'offline') {
    filteredSites = sites.filter(site => site.status === 'offline');
  }
  
  filteredSites.forEach((site, index) => {
    const card = createModernSiteCard(site);
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', index * 50);
    container.appendChild(card);
  });
  
  // 重新初始化AOS
  AOS.refresh();
}

// 创建现代化网站卡片
function createModernSiteCard(site) {
  const card = document.createElement('div');
  card.className = 'col-lg-4 col-md-6';
  
  const statusClass = site.status === 'online' ? 'online' : 'offline';
  const statusText = site.status === 'online' ? translations.online : translations.offline;
  const lastChecked = new Date(site.lastChecked).toLocaleString();
  
  card.innerHTML = `
    <div class="site-card status-${statusClass}">
      <div class="site-header">
        <div class="site-info">
          <h4>${site.name}</h4>
          <p>${site.description}</p>
        </div>
        <div class="status-indicator ${statusClass}">
          <span class="status-dot"></span>
          <span>${statusText}</span>
        </div>
      </div>
      
      <div class="site-metrics">
        <div class="metric">
          <div class="metric-value">${site.responseTime}ms</div>
          <div class="metric-label">${translations.responseTime}</div>
        </div>
        <div class="metric">
          <div class="metric-value">${site.uptime}</div>
          <div class="metric-label">${translations.uptime}</div>
        </div>
      </div>
      
      <div class="site-footer">
        <span class="last-check">
          <i class="bi bi-clock"></i> ${lastChecked}
        </span>
        <a href="${site.url}" target="_blank" class="visit-btn">
          ${translations.visitSite} <i class="bi bi-arrow-up-right"></i>
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
  
  const totalResponseTime = sites
    .filter(site => site.status === 'online')
    .reduce((sum, site) => sum + site.responseTime, 0);
  const avgResponseTime = onlineSites > 0 ? Math.round(totalResponseTime / onlineSites) : 0;
  
  // 使用动画数字效果
  animateNumber('total-sites', totalSites);
  animateNumber('online-sites', onlineSites);
  animateNumber('offline-sites', offlineSites);
  document.getElementById('avg-response').textContent = `${avgResponseTime}ms`;
  
  // 更新总体可用性
  const uptimePercentage = onlineSites > 0 ? ((onlineSites / totalSites) * 100).toFixed(1) : 0;
  document.getElementById('uptime-percentage').textContent = `${uptimePercentage}%`;
}

// 数字动画效果
function animateNumber(elementId, targetValue) {
  const element = document.getElementById(elementId);
  const startValue = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// 渲染时间线
function renderTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  
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
  const recentEvents = allEvents.slice(0, 10);
  
  recentEvents.forEach((event, index) => {
    const eventElement = createTimelineItem(event);
    eventElement.setAttribute('data-aos', 'fade-right');
    eventElement.setAttribute('data-aos-delay', index * 50);
    timeline.appendChild(eventElement);
  });
  
  AOS.refresh();
}

// 创建时间线项目
function createTimelineItem(event) {
  const item = document.createElement('div');
  item.className = 'timeline-item';
  
  const eventDate = new Date(event.timestamp);
  const timeAgo = getTimeAgo(eventDate);
  const iconClass = event.status === 'online' ? 'icon-success' : 'icon-danger';
  const icon = event.status === 'online' ? 'bi-check-circle' : 'bi-x-circle';
  
  item.innerHTML = `
    <div class="timeline-icon ${iconClass}">
      <i class="bi ${icon}"></i>
    </div>
    <div class="timeline-content">
      <div class="timeline-title">${event.site}</div>
      <div class="timeline-description">
        状态变更为 ${event.status === 'online' ? '在线' : '离线'}
        ${event.responseTime ? `- 响应时间: ${event.responseTime}ms` : ''}
      </div>
      <div class="timeline-meta">
        <span><i class="bi bi-clock"></i> ${timeAgo}</span>
        <span><i class="bi bi-calendar"></i> ${eventDate.toLocaleDateString()}</span>
      </div>
    </div>
  `;
  
  return item;
}

// 计算时间差
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    年: 31536000,
    月: 2592000,
    周: 604800,
    天: 86400,
    小时: 3600,
    分钟: 60,
    秒: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}前`;
    }
  }
  return '刚刚';
}

// 初始化图表
function initChart() {
  const ctx = document.getElementById('response-chart').getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
  gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
  
  const labels = [];
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60000);
    labels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    data.push(Math.floor(80 + Math.random() * 120));
  }
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '平均响应时间 (ms)',
        data: data,
        borderColor: '#667eea',
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#667eea',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              return `响应时间: ${context.parsed.y}ms`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxTicksLimit: 8
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value + 'ms';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// 更新图表数据
function updateChart() {
  if (!chart) return;
  
  // 添加新数据点
  const now = new Date();
  chart.data.labels.push(now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  chart.data.labels.shift();
  
  const newValue = Math.floor(80 + Math.random() * 120);
  chart.data.datasets[0].data.push(newValue);
  chart.data.datasets[0].data.shift();
  
  chart.update('none');
}

// 设置事件监听器
function setupEventListeners() {
  // 主题切换
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // 搜索功能
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const cards = document.querySelectorAll('.site-card');
      
      cards.forEach(card => {
        const siteName = card.querySelector('h4').textContent.toLowerCase();
        const siteDesc = card.querySelector('p').textContent.toLowerCase();
        const parent = card.closest('.col-lg-4');
        
        if (siteName.includes(searchTerm) || siteDesc.includes(searchTerm)) {
          parent.style.display = '';
        } else {
          parent.style.display = 'none';
        }
      });
    });
  }
  
  // 筛选按钮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderSites(filter);
    });
  });
  
  // 自动刷新
  const autoRefreshToggle = document.getElementById('auto-refresh');
  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    });
  }
  
  // 语言切换
  document.querySelectorAll('.dropdown-item[data-lang]').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const lang = e.target.getAttribute('data-lang');
      currentLang = lang;
      await loadTranslations();
      applyLanguage(lang);
    });
  });
  
  // 时间范围选择器
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      // 这里可以根据时间范围更新图表数据
    });
  });
  
  // 视图切换
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const view = e.target.getAttribute('data-view');
      const container = document.getElementById('sites-container');
      if (view === 'list') {
        container.classList.add('list-view');
      } else {
        container.classList.remove('list-view');
      }
    });
  });
}

// 开始自动刷新
function startAutoRefresh() {
  if (autoRefreshInterval) return;
  
  autoRefreshInterval = setInterval(() => {
    fetchData();
    console.log('数据已刷新:', new Date().toLocaleTimeString());
  }, 30000);
}

// 停止自动刷新
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// 模拟实时数据更新
function simulateDataUpdate() {
  sites.forEach(site => {
    // 随机更新状态
    if (Math.random() > 0.95) {
      site.status = site.status === 'online' ? 'offline' : 'online';
    }
    
    // 更新响应时间
    if (site.status === 'online') {
      site.responseTime = Math.floor(50 + Math.random() * 200);
    } else {
      site.responseTime = 0;
    }
    
    // 更新最后检查时间
    site.lastChecked = new Date().toISOString();
  });
  
  renderStats();
  updateChart();
}

// 定期模拟数据更新
setInterval(simulateDataUpdate, 5000);