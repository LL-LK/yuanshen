/* ============================================================
   提瓦特数学图鉴 · 原神全局增强脚本
   包含：元素粒子、流星效果、角色立绘加载、交互增强
   ============================================================ */

(function() {
  'use strict';

  // ===== 角色CDN配置 =====
  const CHAR_CDN = 'https://genshin.jmp.blue/characters';
  const CHAR_DATA = {
    // 风元素 - 蒙德
    venti: { name: '温迪', element: 'anemo', title: '风色诗人' },
    jean: { name: '琴', element: 'anemo', title: '蒲公英骑士' },
    sucrose: { name: '砂糖', element: 'anemo', title: '无害甜度' },
    xiao: { name: '魈', element: 'anemo', title: '护法夜叉' },
    kazuha: { name: '枫原万叶', element: 'anemo', title: '红叶逐荒波' },
    heizou: { name: '鹿野院平藏', element: 'anemo', title: '心朝乂安' },
    wanderer: { name: '流浪者', element: 'anemo', title: '久世浮倾' },
    faruzan: { name: '珐露珊', element: 'anemo', title: '机逐封秘' },
    xianyun: { name: '闲云', element: 'anemo', title: '銮韵风姿' },
    chasca: { name: '恰斯卡', element: 'anemo', title: '翦玉编春' },

    // 岩元素 - 璃月
    zhongli: { name: '钟离', element: 'geo', title: '尘世闲游' },
    ningguang: { name: '凝光', element: 'geo', title: '掩月天权' },
    noelle: { name: '诺艾尔', element: 'geo', title: '未授勋之花' },
    albedo: { name: '阿贝多', element: 'geo', title: '白垩之子' },
    gorou: { name: '五郎', element: 'geo', title: '戎犬锵锵' },
    aratakiitto: { name: '荒泷一斗', element: 'geo', title: '花坂豪快' },
    yunjin: { name: '云堇', element: 'geo', title: '红毹婵娟' },
    navia: { name: '娜维娅', element: 'geo', title: '明花蔓舵' },
    chiori: { name: '千织', element: 'geo', title: '鸣雷的裁锦师' },
    xilonen: { name: '希诺宁', element: 'geo', title: '绚绽的岻伽' },

    // 雷元素 - 稻妻
    raiden: { name: '雷电将军', element: 'electro', title: '一心净土' },
    keqing: { name: '刻晴', element: 'electro', title: '霆霓快雨' },
    fischl: { name: '菲谢尔', element: 'electro', title: '断罪皇女！！' },
    beidou: { name: '北斗', element: 'electro', title: '无冕的龙王' },
    kujousara: { name: '九条裟罗', element: 'electro', title: '黑羽鸣镝' },
    yaemiko: { name: '八重神子', element: 'electro', title: '浮世笑百姿' },
    kuki: { name: '久岐忍', element: 'electro', title: '烦恼刈除' },
    cyno: { name: '赛诺', element: 'electro', title: '缄秘的裁遣' },
    clorinde: { name: '克洛琳德', element: 'electro', title: '秉烛的狙伏' },
    sethos: { name: '赛索斯', element: 'electro', title: '缄秘的贤医' },

    // 草元素 - 须弥
    nahida: { name: '纳西妲', element: 'dendro', title: '小吉祥草王' },
    tighnari: { name: '提纳里', element: 'dendro', title: '浅蔚轻行' },
    collei: { name: '柯莱', element: 'dendro', title: '萃念初蘖' },
    alhaitham: { name: '艾尔海森', element: 'dendro', title: '诲韬诤言' },
    kaveh: { name: '卡维', element: 'dendro', title: '天穹之镜' },
    yaoyao: { name: '瑶瑶', element: 'dendro', title: '仙蕊玲珑' },
    baizhu: { name: '白术', element: 'dendro', title: '遵生合和' },
    kirara: { name: '绮良良', element: 'dendro', title: '檐宇猫游' },
    emilie: { name: '艾梅莉埃', element: 'dendro', title: '千缕之踪' },
    kinich: { name: '基尼奇', element: 'dendro', title: '回火之狩' },

    // 水元素 - 枫丹
    furina: { name: '芙宁娜', element: 'hydro', title: '不休独舞' },
    tartaglia: { name: '达达利亚', element: 'hydro', title: '「公子」' },
    mona: { name: '莫娜', element: 'hydro', title: '星天水镜' },
    barbara: { name: '芭芭拉', element: 'hydro', title: '闪耀偶像' },
    xingqiu: { name: '行秋', element: 'hydro', title: '少年春衫薄' },
    yelan: { name: '夜兰', element: 'hydro', title: '兰生幽谷' },
    ayato: { name: '神里绫人', element: 'hydro', title: '磐祭叶守' },
    nilou: { name: '妮露', element: 'hydro', title: '莲光落舞筵' },
    candace: { name: '坎蒂丝', element: 'hydro', title: '浮金的誓愿' },
    neuvillette: { name: '那维莱特', element: 'hydro', title: '浪沫之抔' },
    sigewinne: { name: '希格雯', element: 'hydro', title: '龙铃的颂章' },

    // 火元素 - 纳塔
    hutao: { name: '胡桃', element: 'pyro', title: '雪霁梅香' },
    diluc: { name: '迪卢克', element: 'pyro', title: '晨曦的暗面' },
    xiangling: { name: '香菱', element: 'pyro', title: '万民百味' },
    amber: { name: '安柏', element: 'pyro', title: '飞行冠军' },
    bennett: { name: '班尼特', element: 'pyro', title: '命运试金石' },
    yoimiya: { name: '宵宫', element: 'pyro', title: '琉焰华舞' },
    thoma: { name: '托马', element: 'pyro', title: '渡来介者' },
    dehya: { name: '迪希雅', element: 'pyro', title: '炽鬃之狮' },
    lyney: { name: '林尼', element: 'pyro', title: '惑光幻戏' },
    arlecchino: { name: '阿蕾奇诺', element: 'pyro', title: '「仆人」' },
    chevreuse: { name: '夏沃蕾', element: 'pyro', title: '明律的决罚' },
    gaming: { name: '嘉明', element: 'pyro', title: '骏春猊迹' },

    // 冰元素 - 至冬/蒙德
    ganyu: { name: '甘雨', element: 'cryo', title: '循循守月' },
    qiqi: { name: '七七', element: 'cryo', title: '冻冻回魂夜' },
    chongyun: { name: '重云', element: 'cryo', title: '雪融有踪' },
    diona: { name: '迪奥娜', element: 'cryo', title: '猫尾特调' },
    eula: { name: '优菈', element: 'cryo', title: '浪沫的旋舞' },
    ayaka: { name: '神里绫华', element: 'cryo', title: '白鹭霜华' },
    shenhe: { name: '申鹤', element: 'cryo', title: '孤辰茕怀' },
    rosaria: { name: '罗莎莉亚', element: 'cryo', title: '棘冠恩典' },
    layla: { name: '莱依拉', element: 'cryo', title: '绮思晚星' },
    mika: { name: '米卡', element: 'cryo', title: '晴霜的标绘' },
    freminet: { name: '菲米尼', element: 'cryo', title: '潜怀遐梦' },
    wriothesley: { name: '莱欧斯利', element: 'cryo', title: '寂罪的密使' },
    charlotte: { name: '夏洛蒂', element: 'cryo', title: '朗镜索真' }
  };

  // 页面与角色/元素的对应关系
  const PAGE_CONFIG = {
    'index.html': { element: null, chars: ['venti', 'zhongli', 'raiden', 'nahida', 'furina', 'hutao', 'ganyu'] },
    'functions.html': { element: 'anemo', chars: ['venti', 'jean', 'kazuha', 'xiao'], nation: '蒙德' },
    'geometry.html': { element: 'geo', chars: ['zhongli', 'ningguang', 'albedo', 'navia'], nation: '璃月' },
    'probability.html': { element: 'electro', chars: ['raiden', 'yaemiko', 'cyno', 'clorinde'], nation: '稻妻' },
    'calculus.html': { element: 'hydro', chars: ['furina', 'neuvillette', 'yelan', 'tartaglia'], nation: '枫丹' },
    'elective.html': { element: 'dendro', chars: ['nahida', 'alhaitham', 'tighnari', 'baizhu'], nation: '须弥' },
    'challenge.html': { element: null, chars: [] }
  };

  // ===== 工具函数 =====
  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file;
  }

  function getCharUrl(slug, type) {
    // type: icon, gacha-splash, namecard, portrait
    const types = {
      'icon': `${CHAR_CDN}/${slug}/icon`,
      'gacha-splash': `${CHAR_CDN}/${slug}/gacha-splash`,
      'portrait': `${CHAR_CDN}/${slug}/portrait`,
      'namecard': `${CHAR_CDN}/${slug}/namecard`
    };
    return types[type] || types.icon;
  }

  // ===== 元素颜色映射 =====
  const ELEMENT_COLORS = {
    anemo: { main: 'rgba(116,194,168,', glow: 'rgba(168,230,207,' },
    geo: { main: 'rgba(240,182,50,', glow: 'rgba(255,216,102,' },
    electro: { main: 'rgba(176,136,232,', glow: 'rgba(212,179,255,' },
    dendro: { main: 'rgba(123,201,74,', glow: 'rgba(168,226,125,' },
    hydro: { main: 'rgba(76,194,240,', glow: 'rgba(125,218,255,' },
    pyro: { main: 'rgba(239,122,53,', glow: 'rgba(255,176,136,' },
    cryo: { main: 'rgba(160,215,239,', glow: 'rgba(212,238,249,' }
  };

  // ===== 创建粒子容器 =====
  function initParticleContainer() {
    if (document.getElementById('element-particles')) return;
    const container = document.createElement('div');
    container.id = 'element-particles';
    document.body.appendChild(container);
    return container;
  }

  // ===== 创建元素粒子（增强版） =====
  function spawnParticles(element, count = 18) {
    const container = document.getElementById('element-particles') || initParticleContainer();
    container.className = `el-${element}`;
    
    const isMobile = window.innerWidth <= 640;
    const actualCount = isMobile ? Math.floor(count * 0.6) : count;
    
    for (let i = 0; i < actualCount; i++) {
      const p = document.createElement('div');
      p.className = 'el-particle';
      p.style.left = Math.random() * 100 + '%';
      
      // 根据元素类型设置初始位置方向
      if (element === 'dendro' || element === 'cryo') {
        // 草和冰从上往下飘落
        p.style.top = (-10 - Math.random() * 15) + '%';
      } else {
        // 其他元素从下往上升起
        p.style.top = (100 + Math.random() * 20) + '%';
      }
      
      p.style.animationDelay = (Math.random() * 10) + 's';
      
      // 随机化动画时长，创造自然感
      const baseDurations = {
        anemo: [7, 11], geo: [8, 14], electro: [2, 4],
        dendro: [10, 16], hydro: [5, 9], pyro: [3, 6], cryo: [8, 14]
      };
      const [minD, maxD] = baseDurations[element] || [6, 10];
      p.style.animationDuration = (minD + Math.random() * (maxD - minD)) + 's';
      
      // 随机透明度变化
      p.style.opacity = 0.4 + Math.random() * 0.4;
      
      container.appendChild(p);
      
      // 自动移除粒子（防止过多）
      const lifeTime = parseFloat(p.style.animationDuration) * 1000 + 2000;
      setTimeout(() => p.remove(), lifeTime);
    }
  }

  // ===== 创建闪烁星星背景 =====
  let twinkleStarsInitialized = false;
  function initTwinkleStars() {
    if (twinkleStarsInitialized) return;
    twinkleStarsInitialized = true;
    
    const isMobile = window.innerWidth <= 640;
    const starCount = isMobile ? 40 : 80;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'twinkle-star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 70 + '%';
      star.style.animationDelay = (Math.random() * 5) + 's';
      star.style.animationDuration = (2 + Math.random() * 4) + 's';
      
      // 星星大小随机
      const size = 1 + Math.random() * 2;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      
      // 亮度随机
      star.style.opacity = 0.2 + Math.random() * 0.5;
      
      document.body.appendChild(star);
    }
  }

  // ===== 创建元素能量脉冲波 =====
  function spawnEnergyPulse(element) {
    const colors = ELEMENT_COLORS[element];
    if (!colors) return;
    
    const pulse = document.createElement('div');
    pulse.className = 'energy-pulse';
    pulse.style.left = (10 + Math.random() * 80) + '%';
    pulse.style.top = (20 + Math.random() * 60) + '%';
    pulse.style.width = '40px';
    pulse.style.height = '40px';
    pulse.style.background = `radial-gradient(circle, ${colors.glow}0.3) 0%, ${colors.main}0.1) 40%, transparent 70%)`;
    pulse.style.boxShadow = `0 0 20px ${colors.main}0.2)`;
    pulse.style.animationDuration = (3 + Math.random() * 3) + 's';
    
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 6000);
  }

  // ===== 创建元素共鸣光环 =====
  function spawnResonanceRing(element) {
    const colors = ELEMENT_COLORS[element];
    if (!colors) return;
    
    const ring = document.createElement('div');
    ring.className = 'resonance-ring';
    ring.style.left = (Math.random() * 90) + '%';
    ring.style.top = (Math.random() * 80) + '%';
    ring.style.borderColor = colors.main + '0.4)';
    ring.style.boxShadow = `0 0 15px ${colors.main}0.2), inset 0 0 10px ${colors.glow}0.15)`;
    ring.style.animationDuration = (5 + Math.random() * 4) + 's';
    
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 9000);
  }

  // ===== 创建流星（增强版） =====
  function spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = (Math.random() * 60) + '%';
    star.style.top = (Math.random() * 25) + '%';
    const angle = -35 - Math.random() * 25;
    star.style.transform = `rotate(${angle}deg)`;
    star.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 4000);
  }

  // ===== 定期创建流星（增强版） =====
  let shootingStarsInitialized = false;
  function initShootingStars() {
    if (shootingStarsInitialized) return;
    shootingStarsInitialized = true;
    
    // 初始延迟后开始
    setTimeout(() => {
      spawnShootingStar();
      setInterval(() => {
        if (Math.random() > 0.3) spawnShootingStar();
      }, 6000 + Math.random() * 6000);
    }, 2000);
  }

  // ===== 护眼模式控制 =====
  function initEyeCare() {
    // 读取本地存储的护眼设置
    const eyeCareEnabled = localStorage.getItem('genshin_eyecare') === 'true';
    if (eyeCareEnabled) {
      document.body.classList.add('eye-care');
    }
    
    // 创建护眼模式切换按钮
    function createEyeCareButton() {
      // 避免重复创建
      if (document.querySelector('.eye-care-toggle')) return true;
      
      // 查找导航栏内部容器 (所有页面通用: nav.fixed.top-0 > div.flex.items-center.justify-between)
      const navContainer = document.querySelector('nav.fixed.top-0 > div.flex.items-center.justify-between');
      if (!navContainer) return false;
      
      const btn = document.createElement('button');
      btn.className = 'eye-care-toggle' + (eyeCareEnabled ? ' active' : '');
      btn.title = eyeCareEnabled ? '关闭护眼模式' : '开启护眼模式';
      btn.innerHTML = '👁';
      btn.setAttribute('aria-label', '护眼模式');
      btn.type = 'button';
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = document.body.classList.toggle('eye-care');
        btn.classList.toggle('active', isActive);
        btn.title = isActive ? '关闭护眼模式' : '开启护眼模式';
        localStorage.setItem('genshin_eyecare', isActive ? 'true' : 'false');
      });
      
      // 插入到mobile-menu-toggle按钮之前（这样在桌面和移动端都能看到）
      const mobileMenuBtn = navContainer.querySelector('#mobile-menu-toggle');
      if (mobileMenuBtn) {
        navContainer.insertBefore(btn, mobileMenuBtn);
      } else {
        // 如果没有mobile-menu-toggle，添加到末尾
        navContainer.appendChild(btn);
      }
      return true;
    }
    
    // 尝试创建按钮，可能需要等待DOM加载
    if (!createEyeCareButton()) {
      setTimeout(createEyeCareButton, 300);
      setTimeout(createEyeCareButton, 1000);
      setTimeout(createEyeCareButton, 2000);
    }
  }

  // ===== 添加角色立绘背景 =====
  function addCharPortraitBg(container, charSlug) {
    if (!container) return;
    const bg = document.createElement('div');
    bg.className = 'char-portrait-bg';
    const img = document.createElement('img');
    img.src = getCharUrl(charSlug, 'gacha-splash');
    img.alt = CHAR_DATA[charSlug]?.name || '';
    img.loading = 'lazy';
    img.onerror = function() {
      // 如果gacha-splash失败，尝试portrait
      this.src = getCharUrl(charSlug, 'portrait');
      this.onerror = function() { bg.remove(); };
    };
    bg.appendChild(img);
    
    // 确保容器有position: relative
    const pos = window.getComputedStyle(container).position;
    if (pos === 'static') container.style.position = 'relative';
    container.insertBefore(bg, container.firstChild);
  }

  // ===== 为知识点页面添加主题角色 =====
  function enhanceKnowledgePage() {
    const page = getCurrentPage();
    const config = PAGE_CONFIG[page];
    if (!config || !config.element) return;

    // 添加页面元素属性
    document.body.setAttribute('data-element', config.element);
    
    // 初始化粒子（增加数量）
    setTimeout(() => spawnParticles(config.element, 16), 800);
    
    // 持续补充粒子
    setInterval(() => {
      const container = document.getElementById('element-particles');
      const maxParticles = window.innerWidth <= 640 ? 18 : 28;
      if (container && container.children.length < maxParticles) {
        spawnParticles(config.element, 4);
      }
    }, 8000);

    // 定期生成能量脉冲波
    setInterval(() => {
      if (Math.random() > 0.4) spawnEnergyPulse(config.element);
    }, 12000);
    
    // 定期生成共鸣光环
    setTimeout(() => {
      spawnResonanceRing(config.element);
      setInterval(() => {
        if (Math.random() > 0.5) spawnResonanceRing(config.element);
      }, 18000);
    }, 5000);

    // 获取Hero区或第一个section添加角色立绘
    const heroSection = document.querySelector('section[class*="hero"], section:first-of-type, main > section:first-child');
    if (heroSection && config.chars.length > 0) {
      const randomChar = config.chars[Math.floor(Math.random() * config.chars.length)];
      addCharPortraitBg(heroSection, randomChar);
    }

    // 为模块卡片添加元素发光效果
    const glowClass = `element-glow-${config.element}`;
    document.querySelectorAll('.genshin-card').forEach((card, idx) => {
      if (idx === 0) card.classList.add(glowClass);
    });
  }

  // ===== 增强首页 =====
  function enhanceHomePage() {
    const page = getCurrentPage();
    if (page !== 'index.html') return;

    // 为模块卡片添加对应角色小头像
    const moduleCards = document.querySelectorAll('.genshin-card');
    const moduleElements = ['anemo', 'geo', 'electro', 'hydro', 'dendro'];
    const moduleChars = {
      anemo: 'venti',
      geo: 'zhongli',
      electro: 'raiden',
      hydro: 'furina',
      dendro: 'nahida'
    };

    moduleCards.forEach((card, idx) => {
      if (idx >= 5) return;
      const el = moduleElements[idx];
      const charSlug = moduleChars[el];
      if (!charSlug) return;

      // 添加元素发光效果
      card.classList.add(`element-glow-${el}`);

      // 添加角色小头像在卡片角落
      const charIcon = document.createElement('div');
      charIcon.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--el-${el});
        box-shadow: 0 0 12px var(--el-${el}-glow);
        background: var(--genshin-card);
      `;
      const img = document.createElement('img');
      img.src = getCharUrl(charSlug, 'icon');
      img.alt = CHAR_DATA[charSlug]?.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      img.loading = 'lazy';
      charIcon.appendChild(img);
      card.style.position = 'relative';
      card.appendChild(charIcon);
    });

    // 首页金色浮动光点
    initHomeGoldParticles();
  }

  // ===== 首页金色光点粒子 =====
  function initHomeGoldParticles() {
    const container = document.getElementById('element-particles') || initParticleContainer();
    container.className = ''; // 清除元素类
    
    const isMobile = window.innerWidth <= 640;
    const count = isMobile ? 12 : 25;
    
    for (let i = 0; i < count; i++) {
      const glow = document.createElement('div');
      glow.className = 'float-glow';
      glow.style.left = Math.random() * 100 + '%';
      glow.style.top = (100 + Math.random() * 20) + '%';
      glow.style.animationDelay = (Math.random() * 12) + 's';
      glow.style.animationDuration = (8 + Math.random() * 8) + 's';
      
      // 金色主题
      const goldColors = [
        'rgba(200,169,91,',
        'rgba(255,216,102,',
        'rgba(232,213,163,',
        'rgba(255,255,255,'
      ];
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];
      const size = 2 + Math.random() * 4;
      glow.style.width = size + 'px';
      glow.style.height = size + 'px';
      glow.style.background = `radial-gradient(circle, ${color}0.8) 0%, ${color}0.2) 50%, transparent 70%)`;
      glow.style.boxShadow = `0 0 ${size * 2}px ${color}0.4)`;
      
      container.appendChild(glow);
      
      const lifeTime = parseFloat(glow.style.animationDuration) * 1000 + 3000;
      setTimeout(() => glow.remove(), lifeTime);
    }
    
    // 持续补充金色光点
    setInterval(() => {
      if (!document.body.classList.contains('eye-care') && container.children.length < (isMobile ? 20 : 40)) {
        const glow = document.createElement('div');
        glow.className = 'float-glow';
        glow.style.left = Math.random() * 100 + '%';
        glow.style.top = (100 + Math.random() * 10) + '%';
        glow.style.animationDelay = '0s';
        glow.style.animationDuration = (8 + Math.random() * 8) + 's';
        
        const goldColors = ['rgba(200,169,91,','rgba(255,216,102,','rgba(232,213,163,','rgba(255,255,255,'];
        const color = goldColors[Math.floor(Math.random() * goldColors.length)];
        const size = 2 + Math.random() * 4;
        glow.style.width = size + 'px';
        glow.style.height = size + 'px';
        glow.style.background = `radial-gradient(circle, ${color}0.8) 0%, ${color}0.2) 50%, transparent 70%)`;
        glow.style.boxShadow = `0 0 ${size * 2}px ${color}0.4)`;
        
        container.appendChild(glow);
        const lifeTime = parseFloat(glow.style.animationDuration) * 1000 + 3000;
        setTimeout(() => glow.remove(), lifeTime);
      }
    }, 6000);
  }

  // ===== 点击粒子效果增强 =====
  function enhanceClickEffects() {
    const elementColors = {
      anemo: '#74C2A8',
      geo: '#F0B632',
      electro: '#B088E8',
      dendro: '#7BC94A',
      hydro: '#4CC2F0',
      pyro: '#EF7A35',
      cryo: '#A0D7EF'
    };

    const page = getCurrentPage();
    const config = PAGE_CONFIG[page];
    const currentEl = config?.element || null;

    document.addEventListener('click', function(e) {
      // 不处理已处理的点击粒子（已有脚本的情况）
      const target = e.target;
      if (!target.closest('button, a, .day-card, .option-btn, .genshin-card, .next-cta')) return;

      const colors = currentEl ? 
        [elementColors[currentEl], '#C8A95B', '#FFD700'] : 
        ['#C8A95B', '#E8D5A3', '#74C2A8', '#4CC2F0', '#A85AF5', '#EF7A35'];
      
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      colors.forEach(function(c, i) {
        var p = document.createElement('div');
        var ang = Math.PI * 2 / colors.length * i + Math.random() * 0.5;
        var dist = 20 + Math.random() * 30;
        p.style.cssText = 'position:fixed;width:5px;height:5px;border-radius:50%;background:' + c + ';pointer-events:none;z-index:99999;left:' + cx + 'px;top:' + cy + 'px;box-shadow:0 0 8px ' + c + ';transition:all .5s ease-out;';
        document.body.appendChild(p);
        requestAnimationFrame(function() {
          p.style.transform = 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px) scale(0)';
          p.style.opacity = '0';
        });
        setTimeout(function() { p.remove(); }, 550);
      });
    });
  }

  // ===== 导航栏增强 =====
  function enhanceNavbar() {
    // 为导航栏添加元素图标
    const navLinks = document.querySelectorAll('.nav-link[data-nav-key]');
    const navElements = {
      functions: { el: 'anemo', icon: '🌪️' },
      geometry: { el: 'geo', icon: '🪨' },
      probability: { el: 'electro', icon: '⚡' },
      calculus: { el: 'hydro', icon: '💧' },
      elective: { el: 'dendro', icon: '🍃' }
    };

    navLinks.forEach(link => {
      const key = link.getAttribute('data-nav-key');
      const config = navElements[key];
      if (!config) return;
      
      // 将小圆点替换为元素emoji
      const dot = link.querySelector('span.w-2');
      if (dot) {
        dot.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0,0,0,0.3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          border: 1px solid var(--el-${config.el});
          box-shadow: 0 0 6px var(--el-${config.el}-glow);
        `;
        dot.textContent = config.icon;
        dot.classList.remove('w-2', 'h-2', 'rounded-full');
      }
    });
  }

  // ===== 音效增强 =====
  let audioCtx = null;
  function playElementSound(element, type = 'click') {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const freqs = {
        anemo: [523, 659, 784],
        geo: [392, 523, 659],
        electro: [659, 784, 988],
        dendro: [440, 554, 659],
        hydro: [494, 587, 740],
        pyro: [587, 740, 880],
        cryo: [698, 880, 1047]
      };

      const f = freqs[element] || freqs.anemo;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f[Math.floor(Math.random() * f.length)], audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  // ===== 初始化 =====
  function init() {
    // 加载全局CSS
    if (!document.querySelector('link[href*="genshin-enhancements.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'assets/genshin-enhancements.css';
      document.head.appendChild(link);
    }

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initEnhancements, 100);
      });
    } else {
      setTimeout(initEnhancements, 100);
    }
  }

  function initEnhancements() {

    // ===== 移动端检测与优化 =====
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768 
      || ('ontouchstart' in window && window.innerWidth <= 900);
    
    if (isMobile) {
      document.body.classList.add('is-mobile');
      const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      window.addEventListener('orientationchange', () => setTimeout(setVh, 300));
      
      // 防止双击缩放
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
      }, { passive: false });
    }

    const page = getCurrentPage();
    
    // 初始化护眼模式（全局）
    initEyeCare();
    
    // 初始化闪烁星星背景（全局，非试炼页面）
    if (page !== 'challenge.html') {
      setTimeout(initTwinkleStars, 500);
    }
    
    // 增强导航栏
    enhanceNavbar();
    
    // 增强点击效果
    enhanceClickEffects();
    
    // 根据页面类型增强
    if (page === 'index.html') {
      enhanceHomePage();
    } else if (PAGE_CONFIG[page] && PAGE_CONFIG[page].element) {
      enhanceKnowledgePage();
    }
    
    // 全局流星效果（非试炼页面）
    if (page !== 'challenge.html') {
      setTimeout(initShootingStars, 2000);
    }
  }

  // 启动
  init();

  // 暴露给全局
  window.GenshinEnhance = {
    spawnParticles,
    spawnShootingStar,
    playElementSound,
    getCharUrl,
    CHAR_DATA,
    CHAR_CDN
  };
})();
