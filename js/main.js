'use strict';

// ================ 模块导入 ================
import { initScroll } from './components/smooth-scroll.js';

// ================ 全局状态管理 ================
const AppState = {
    initialized: false,
    aosLoaded: window.AOS ? true : false,
    components: {
        theme: false,
        scroll: false,
        aos: false,
        serviceWorker: false
    }
};

// ================ 主题管理模块 ================
const ThemeManager = (() => {
    const STORAGE_KEY = 'theme';
    let currentTheme = 'light';

    const applyTheme = (theme) => {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            currentTheme = theme;
            localStorage.setItem(STORAGE_KEY, theme);

            // 安全刷新AOS
            if (AppState.aosLoaded && typeof AOS.refresh === 'function') {
                AOS.refresh();
            }
        } catch (error) {
            console.error('主题切换失败:', error);
        }
    };

    const init = () => {
        if (AppState.components.theme) return;

        try {
            const savedTheme = localStorage.getItem(STORAGE_KEY);
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = savedTheme || (systemIsDark ? 'dark' : 'light');

            applyTheme(initialTheme);

            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
                });
            }

            AppState.components.theme = true;
        } catch (error) {
            console.error('主题系统初始化失败:', error);
        }
    };

    return { init };
})();

// ================ 滚动管理模块 ================
const ScrollManager = (() => {
    const SCROLL_THRESHOLD = 200;
    let backToTopBtn = null;

    const handleScroll = () => {
        if (!backToTopBtn) return;

        const shouldShow = window.scrollY > SCROLL_THRESHOLD;
        backToTopBtn.style.display = shouldShow ? 'flex' : 'none';

        requestAnimationFrame(() => {
            backToTopBtn.classList.toggle('visible', shouldShow);
        });
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    // 处理导航栏下拉菜单
    const initDropdowns = () => {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (link && content) {
                // 移除所有现有的事件监听器
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                
                // 添加新的点击事件
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 关闭其他下拉菜单
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            const otherContent = other.querySelector('.dropdown-content');
                            if (otherContent) {
                                otherContent.classList.remove('show');
                            }
                        }
                    });
                    
                    // 切换当前下拉菜单
                    content.classList.toggle('show');
                });

                // 为下拉菜单中的链接添加点击事件
                content.querySelectorAll('a').forEach(item => {
                    item.addEventListener('click', () => {
                        content.classList.remove('show');
                    });
                });
            }
        });
        
        // 点击外部关闭所有下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-content').forEach(content => {
                    content.classList.remove('show');
                });
            }
        });
    };

    // 处理下拉菜单点击
    const handleDropdownClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = e.currentTarget.closest('.dropdown');
        const content = dropdown.querySelector('.dropdown-content');
        
        // 关闭其他下拉菜单
        document.querySelectorAll('.dropdown-content.show').forEach(item => {
            if (item !== content) {
                item.classList.remove('show');
            }
        });
        
        // 切换当前下拉菜单
        content.classList.toggle('show');
    };

    // 处理点击外部区域
    const handleOutsideClick = (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.show').forEach(content => {
                content.classList.remove('show');
            });
        }
    };

    const init = () => {
        if (AppState.components.scroll) return;
    
        try {
            backToTopBtn = document.getElementById('back-to-top');
            if (backToTopBtn) {
                window.addEventListener('scroll', handleScroll);
                backToTopBtn.addEventListener('click', scrollToTop);
                handleScroll();
            }
            
            // 初始化下拉菜单
            initDropdowns();
            
            AppState.components.scroll = true;
        } catch (error) {
            console.error('滚动系统初始化失败:', error);
        }
    };
    
    return { init };
})();

// ================ AOS动画管理 ================
const AOSManager = {
    init: () => {
        if (AppState.components.aos || !AppState.aosLoaded) return;
    
        try {
            AOS.init({
                duration: 800,
                once: true,
                easing: 'ease-out-back',
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                initClassName: 'aos-init',
                animatedClassName: 'aos-animate'
            });
            AppState.components.aos = true;
        } catch (error) {
            console.error('AOS初始化失败:', error);
        }
    },
    refresh: () => {
        if (AppState.aosLoaded && AppState.components.aos) {
            AOS.refresh();
        }
    }
};

// ================ 服务进程管理 ================
const ServiceWorkerManager = (() => {
    const register = () => {
        if (AppState.components.serviceWorker || !('serviceWorker' in navigator)) return;
    
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker 注册成功:', registration.scope);
                AppState.components.serviceWorker = true;
            })
            .catch(error => {
                console.warn('ServiceWorker 注册失败:', error);
            });
    };
    
    return { register };
})();

// ================ 主初始化函数 ================
export const initApp = () => {
    if (AppState.initialized) {
        console.warn('应用已初始化，跳过重复操作');
        return;
    }

    // 初始化顺序控制
    try {
        ThemeManager.init();
        ScrollManager.init();
        initScroll(); // 平滑滚动

        // 动态检查AOS状态
        const aosCheckInterval = setInterval(() => {
            if (window.AOS) {
                clearInterval(aosCheckInterval);
                AppState.aosLoaded = true;
                AOSManager.init();
            }
        }, 100);

        // 延迟初始化服务进程
        setTimeout(ServiceWorkerManager.register, 2000);

        // 页脚观察器
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

        AppState.initialized = true;
        console.log('应用初始化完成 ✅');
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
};

// ================ 浏览器环境自动启动 ================
if (typeof window !== 'undefined' && !window.__NO_AUTO_INIT__) {
    document.addEventListener('DOMContentLoaded', () => {
        // 兼容非模块环境
        if (!AppState.initialized) {
            initApp();
        }
    });
}

// ================ 全局访问点 ================
window.__CloudForgeTech = {
    reinit: () => {
        AppState.initialized = false;
        initApp();
    },
    refreshAOS: AOSManager.refresh,
    getState: () => ({ ...AppState })
};

// CloudForgeTech_Home-v1.2