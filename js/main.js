'use strict';

import { initScroll } from './components/smooth-scroll.js';

// 主题管理模块
const ThemeManager = (() => {
    const STORAGE_KEY = 'theme';
    let currentTheme = 'light';

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
        AOS.refresh(); // 刷新动画
    };

    const init = () => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (systemIsDark ? 'dark' : 'light');
        applyTheme(initialTheme);

        document.getElementById('theme-toggle').addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    };

    return { init };
})();

// 滚动管理模块
const ScrollManager = (() => {
    const SCROLL_THRESHOLD = 200;
    let backToTopBtn = null;

    const handleScroll = () => {
        const shouldShow = window.scrollY > SCROLL_THRESHOLD;
        backToTopBtn.style.display = shouldShow ? 'flex' : 'none';
        setTimeout(() => {
            backToTopBtn.classList.toggle('visible', shouldShow);
        }, 10);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const init = () => {
        backToTopBtn = document.getElementById('back-to-top');
        window.addEventListener('scroll', handleScroll);
        backToTopBtn.addEventListener('click', scrollToTop);
    };

    return { init };
})();

// 服务进程管理
const ServiceWorkerManager = (() => {
    const register = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker 注册成功:', registration.scope);
                })
                .catch(error => {
                    console.warn('ServiceWorker 注册失败:', error);
                });
        }
    };

    return { register };
})();

// 主初始化函数
const initApp = () => {
    // 1. 主题系统
    ThemeManager.init();

    // 2. 滚动系统
    ScrollManager.init();
    initScroll(); // 平滑滚动

    // 3. 初始化动画
    AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-back',
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });

    // 4. 服务进程
    ServiceWorkerManager.register();

    // 5. 其他初始化...
    console.log('应用初始化完成 ✅');
};

// 观察页脚进入视口
const footerObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.1 }
);

document.querySelectorAll('.site-footer').forEach(el => {
    footerObserver.observe(el);
});

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);

// CloudForgeTech_Home-v1.0