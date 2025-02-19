export function initScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // 跳过下拉菜单的触发器链接
        if (!anchor.closest('.dropdown')) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.hash);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    history.replaceState(null, null, this.hash);
                }
            });
        }
    });
}

// CloudForgeTech_Home-v1.2