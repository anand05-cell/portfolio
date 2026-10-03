(() => {
    const root = document.documentElement;
    root.classList.add('js');

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ───── Dark / light theme (remembered) ───── */
    try {
        const saved = localStorage.getItem('theme');
        if (saved) root.setAttribute('data-theme', saved);
    } catch (e) {}

    const toggle = $('#modeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    /* ───── Mobile menu ───── */
    const menu = $('.nav-links');
    const burger = $('.hamburger');
    if (menu && burger) {
        burger.addEventListener('click', () => {
            menu.classList.toggle('nav-active');
            burger.classList.toggle('active');
        });
        $$('.nav-links a').forEach(a =>
            a.addEventListener('click', () => {
                menu.classList.remove('nav-active');
                burger.classList.remove('active');
            })
        );
    }

    /* ───── Scroll progress, navbar shadow, back-to-top ───── */
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const topBtn = document.createElement('button');
    topBtn.className = 'to-top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(topBtn);

    const navbar = $('.navbar');
    let ticking = false;
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        bar.style.transform = `scaleX(${p})`;
        navbar && navbar.classList.toggle('scrolled', scrollY > 20);
        topBtn.classList.toggle('show', scrollY > 600);
        ticking = false;
    };
    addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ───── Scroll reveal with stagger ───── */
    const revealTargets = $$(
        '.section-title, .about-content, .skill-card, .project-card, .education-card, .learning-item, .contact-item, .contact-form'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));
    revealTargets.forEach(el => {
        const group = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.setProperty('--d', Math.min(group.indexOf(el), 6) * 0.09 + 's');
    });

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => revealObs.observe(el));

    /* ───── Skill bars fill when visible ───── */
    $$('.progress').forEach(p => {
        p.dataset.w = p.style.width || '0';
        p.style.width = '0';
    });
    const barObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const p = $('.progress', entry.target);
                setTimeout(() => { p.style.width = p.dataset.w; }, 250);
                barObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    $$('.skill-card').forEach(c => barObs.observe(c));

    /* ───── Card spotlight ───── */
    $$('.skill-card, .project-card, .education-card, .learning-item, .contact-item, .contact-form').forEach(card => {
        card.classList.add('spot');
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    /* ───── Active nav link while scrolling ───── */
    const links = $$('.nav-links a[href^="#"]');
    const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const navObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(a =>
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id)
                );
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));

    /* ───── Cursor glow ───── */
    if (!reduce && matchMedia('(hover: hover)').matches) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);
        let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
        addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
        (function loop() {
            x += (tx - x) * 0.12;
            y += (ty - y) * 0.12;
            glow.style.transform = `translate3d(${x - 230}px, ${y - 230}px, 0)`;
            requestAnimationFrame(loop);
        })();
    }

    /* ───── Typing effect ───── */
    const heroTitle = $('.hero h2');
    if (heroTitle && !reduce) {
        const roles = ['B.Tech CSE Student', 'Aspiring Software Engineer', 'Web Developer', 'Problem Solver'];
        const text = document.createElement('span');
        const caret = document.createElement('span');
        caret.className = 'caret';
        heroTitle.textContent = '';
        heroTitle.append(text, caret);

        let r = 0, i = 0, deleting = false;
        (function type() {
            const word = roles[r];
            text.textContent = word.slice(0, i);
            let delay = deleting ? 45 : 85;
            if (!deleting && i === word.length) { deleting = true; delay = 1400; }
            else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
            i += deleting ? -1 : 1;
            setTimeout(type, delay);
        })();
    }

    /* ───── Hero: particle network + scroll hint ───── */
    const hero = $('.hero');
    if (hero) {
        const hint = document.createElement('a');
        hint.className = 'scroll-hint';
        hint.href = '#about';
        hint.setAttribute('aria-label', 'Scroll down');
        hint.innerHTML = '<span></span>';
        hero.appendChild(hint);
    }

    if (hero && !reduce) {
        const cv = document.createElement('canvas');
        cv.className = 'particles';
        hero.prepend(cv);
        const ctx = cv.getContext('2d');
        let w, h, pts = [], running = true;
        const mouse = { x: -999, y: -999 };

        const init = () => {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            w = hero.clientWidth;
            h = hero.clientHeight;
            cv.width = w * dpr;
            cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.min(90, Math.floor((w * h) / 16000));
            pts = Array.from({ length: n }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.6 + 0.6
            }));
        };

        const draw = () => {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (const p of pts) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,150,110,0.7)';
                ctx.fill();
            }
            for (let a = 0; a < pts.length; a++) {
                for (let b = a + 1; b < pts.length; b++) {
                    const dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
                    const d = Math.hypot(dx, dy);
                    if (d < 120) {
                        ctx.strokeStyle = `rgba(255,120,90,${0.22 * (1 - d / 120)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(pts[a].x, pts[a].y);
                        ctx.lineTo(pts[b].x, pts[b].y);
                        ctx.stroke();
                    }
                }
                const mx = pts[a].x - mouse.x, my = pts[a].y - mouse.y;
                const md = Math.hypot(mx, my);
                if (md < 160) {
                    ctx.strokeStyle = `rgba(255,190,150,${0.4 * (1 - md / 160)})`;
                    ctx.beginPath();
                    ctx.moveTo(pts[a].x, pts[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
            requestAnimationFrame(draw);
        };

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });

        let resizeTimer;
        addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(init, 200);
        });

        // pause drawing when the hero is off screen
        new IntersectionObserver(([entry]) => {
            const was = running;
            running = entry.isIntersecting;
            if (running && !was) draw();
        }).observe(hero);

        init();
        draw();
    }
})();
