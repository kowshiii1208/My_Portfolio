document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       APPLE-STYLE CUSTOM CURSOR & LIGHTBOX MODAL
       ========================================================================== */
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const cursorLabel = document.getElementById('cursorLabel');
    const mouseGlow = document.getElementById('mouseGlow');
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
    
    if (isTouchDevice) {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorRing) cursorRing.style.display = 'none';
        if (cursorLabel) cursorLabel.style.display = 'none';
    } else {
        document.body.classList.add('custom-cursor-active');
        // Init positions off-screen so cursors never flash in the corner
        let mouseX = -500, mouseY = -500; // target mouse coordinates
        let dotX = -500, dotY = -500;     // current dot positions
        let ringX = -500, ringY = -500;   // current ring positions
        let isMagnetic = false;
        let targetMagneticElement = null;
        
        // Hide until first real mouse move
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
        let hasMouseMoved = false;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!hasMouseMoved) {
                hasMouseMoved = true;
                // Snap both to cursor position instantly on first move
                dotX = mouseX;
                dotY = mouseY;
                ringX = mouseX;
                ringY = mouseY;
                cursorDot.style.opacity = '1';
                cursorRing.style.opacity = '1';
            }
        });
        
        // Hide cursor when it leaves the window
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            if (hasMouseMoved) {
                cursorDot.style.opacity = '1';
                cursorRing.style.opacity = '1';
            }
        });
        
        // Butter-smooth lerp animation loop
        function updateCursor() {
            if (isMagnetic && targetMagneticElement) {
                const rect = targetMagneticElement.getBoundingClientRect();
                const targetX = rect.left + rect.width / 2;
                const targetY = rect.top + rect.height / 2;
                
                ringX += (targetX - ringX) * 0.22;
                ringY += (targetY - ringY) * 0.22;
                
                dotX = mouseX;
                dotY = mouseY;
            } else {
                dotX = mouseX;
                dotY = mouseY;
                
                ringX += (mouseX - ringX) * 0.16;
                ringY += (mouseY - ringY) * 0.16;
            }
            
            cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            cursorLabel.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${cursorLabel.classList.contains('visible') ? 1 : 0.6})`;
            
            // Track mouseGlow with lerp to maintain synchronicity
            if (mouseGlow) {
                mouseGlow.style.left = `${dotX}px`;
                mouseGlow.style.top = `${dotY}px`;
            }
            
            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);
        
        // Ripple & Click Shrink
        document.addEventListener('mousedown', () => {
            cursorRing.style.width = '18px';
            cursorRing.style.height = '18px';
            
            const ripple = document.createElement('div');
            ripple.className = 'cursor-ripple';
            ripple.style.left = `${mouseX}px`;
            ripple.style.top = `${mouseY}px`;
            document.body.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        document.addEventListener('mouseup', () => {
            const isHovered = cursorRing.classList.contains('hovered');
            const isLabeled = cursorRing.classList.contains('labeled');
            if (isLabeled) {
                cursorRing.style.width = '50px';
                cursorRing.style.height = '50px';
            } else if (isHovered) {
                cursorRing.style.width = '44px';
                cursorRing.style.height = '44px';
            } else {
                cursorRing.style.width = '24px';
                cursorRing.style.height = '24px';
            }
        });
        
        // Hover State Delegation
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, .social-link, .project-card, .credential-card, .hackathon-showcase-card, .cert-showcase-card, .btn-preview-achievement');
            
            if (target) {
                const labelText = target.getAttribute('data-cursor');
                if (labelText) {
                    cursorLabel.textContent = labelText;
                    cursorLabel.classList.add('visible');
                    cursorRing.classList.add('labeled');
                    cursorRing.style.width = '50px';
                    cursorRing.style.height = '50px';
                } else {
                    cursorRing.classList.add('hovered');
                    cursorRing.style.width = '44px';
                    cursorRing.style.height = '44px';
                }
                
                // Magnetic snapping
                if (target.matches('a, button, .social-link, .btn-preview-achievement')) {
                    isMagnetic = true;
                    targetMagneticElement = target;
                    cursorRing.classList.add('magnetic');
                    target.style.transform = 'translate3d(0, -3px, 0)';
                }
            }
            
            const textTarget = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, span:not(.logo-dot):not(.bar)');
            if (textTarget && !target) {
                cursorRing.classList.add('text-hovered');
                cursorDot.classList.add('text-hovered');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, button, .social-link, .project-card, .credential-card, .hackathon-showcase-card, .cert-showcase-card, .btn-preview-achievement');
            if (target) {
                cursorLabel.classList.remove('visible');
                cursorRing.classList.remove('labeled');
                cursorRing.classList.remove('hovered');
                cursorRing.classList.remove('magnetic');
                cursorRing.style.width = '24px';
                cursorRing.style.height = '24px';
                isMagnetic = false;
                targetMagneticElement = null;
                target.style.transform = '';
            }
            
            const textTarget = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, span:not(.logo-dot):not(.bar)');
            if (textTarget) {
                cursorRing.classList.remove('text-hovered');
                cursorDot.classList.remove('text-hovered');
            }
        });
    }

    /* ==========================================================================
       CERTIFICATE LIGHTBOX MODAL
       ========================================================================== */
    const modal = document.getElementById('certificateModal');
    const modalClose = document.getElementById('modalClose');
    const modalImg = document.getElementById('modalImg');
    const modalPdf = document.getElementById('modalPdf');
    const modalCaption = document.getElementById('modalCaption');
    
    function openModal(filePath, captionText, pdfPath) {
        if (!modal) return;
        
        let captionHtml = `<span class="modal-caption-title">${captionText || 'Participation Certificate'}</span>`;
        if (pdfPath) {
            captionHtml += ` <a href="${pdfPath}" target="_blank" download class="modal-pdf-link"><i class="fa-solid fa-file-pdf"></i> Download Official PDF</a>`;
        }
        modalCaption.innerHTML = captionHtml;
        
        if (filePath.toLowerCase().endsWith('.pdf')) {
            modalImg.style.display = 'none';
            modalImg.src = '';
            
            modalPdf.src = filePath;
            modalPdf.style.display = 'block';
        } else {
            modalPdf.style.display = 'none';
            modalPdf.src = '';
            
            modalImg.src = filePath;
            modalImg.style.display = 'block';
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        if (!modal) return;
        modal.style.display = 'none';
        modalImg.src = '';
        modalPdf.src = '';
        modalCaption.innerHTML = '';
        document.body.style.overflow = '';
    }
    
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-preview-achievement, .btn-view-cert');
        if (btn) {
            e.preventDefault();
            const filePath = btn.getAttribute('data-file') || btn.getAttribute('data-cert');
            const pdfPath = btn.getAttribute('data-pdf') || (filePath && filePath.endsWith('.pdf') ? filePath : null);
            const caption = btn.getAttribute('data-caption') || 'Certificate';
            openModal(filePath, caption, pdfPath);
        }
    });
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.modal-body-container') === null) {
                closeModal();
            }
        });
    }

    /* ==========================================================================
       RESUME MODAL INTERACTIVITY
       ========================================================================== */
    const resumeModal = document.getElementById('resumeModal');
    const resumeModalClose = document.getElementById('resumeModalClose');
    const aboutResumeBtn = document.getElementById('aboutResumeBtn');
    
    if (aboutResumeBtn && resumeModal) {
        aboutResumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resumeModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    function closeResumeModal() {
        if (!resumeModal) return;
        resumeModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    if (resumeModalClose) {
        resumeModalClose.addEventListener('click', closeResumeModal);
    }
    
    if (resumeModal) {
        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal || e.target.closest('.modal-body-container') === null) {
                closeResumeModal();
            }
        });
    }

    /* ==========================================================================
       CARD SPOTLIGHT & 3D TILT EFFECT
       ========================================================================== */
    const glassCards = document.querySelectorAll('.card-glass');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    const tiltCards = document.querySelectorAll('.hero-image-card, .project-card, .stat-card');
    
    tiltCards.forEach(card => {
        card.classList.add('tilt-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt angle (max 6 degrees for subtle next-level premium effect)
            const rotateX = ((centerY - y) / centerY) * 6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    /* ==========================================================================
       PARALLAX BACKGROUND GLOWS
       ========================================================================== */
    const glow1 = document.querySelector('.bg-glow-1');
    const glow2 = document.querySelector('.bg-glow-2');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (glow1) {
            glow1.style.transform = `translate(${scrolled * 0.04}px, ${scrolled * 0.04}px)`;
        }
        if (glow2) {
            glow2.style.transform = `translate(-${scrolled * 0.02}px, -${scrolled * 0.02}px)`;
        }
    });

    /* ==========================================================================
       TYPING TEXT EFFECT
       ========================================================================== */
    const typingElement = document.getElementById('typingElement');
    const roles = [
        "Aspiring Full Stack Developer",
        "Competitive Programmer",
        "Problem Solver"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;
    let erasingDelay = 50;
    let newWordDelay = 2000;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = erasingDelay;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Finished typing word, wait before erasing
            isDeleting = true;
            typingDelay = newWordDelay;
        } else if (isDeleting && charIndex === 0) {
            // Finished erasing, switch to next word
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingDelay = 500;
        }

        setTimeout(type, typingDelay);
    }

    // Start typing effect
    if (typingElement) {
        setTimeout(type, 1000);
    }

    /* ==========================================================================
       THEME TOGGLING (DARK / LIGHT MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const iconMoon = themeToggleBtn ? themeToggleBtn.querySelector('.icon-moon') : null;
    const iconSun = themeToggleBtn ? themeToggleBtn.querySelector('.icon-sun') : null;

    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        document.body.classList.add('light-theme');
        if (iconMoon) iconMoon.style.display = 'none';
        if (iconSun) iconSun.style.display = 'block';
    } else {
        document.body.classList.remove('light-theme');
        if (iconMoon) iconMoon.style.display = 'block';
        if (iconSun) iconSun.style.display = 'none';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            if (isLight) {
                if (iconMoon) iconMoon.style.display = 'none';
                if (iconSun) iconSun.style.display = 'block';
            } else {
                if (iconMoon) iconMoon.style.display = 'block';
                if (iconSun) iconSun.style.display = 'none';
            }
        });
    }

    /* ==========================================================================
       NAVBAR SCROLL & MOBILE TOGGLE
       ========================================================================== */
    const header = document.querySelector('.navbar-container');
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navbar.classList.remove('active');
        });
    });

    /* ==========================================================================
       SCROLL SECTION ACTIVE STATE & SKILL BAR ANIMATIONS
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    
    const scrollObserverOptions = {
        threshold: 0.25,
        rootMargin: "0px 0px -20% 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update navigation active link
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, scrollObserverOptions);

    sections.forEach(section => {
        scrollObserver.observe(section);
    });

    /* ==========================================================================
       INTERSECTION OBSERVER FOR FADE-IN SECTIONS
       ========================================================================== */
    const fadeElements = document.querySelectorAll('.fade-in, .card-glass, .timeline-item, .skills-card');
    
    const fadeObserverOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Once it appears, we can unobserve
                fadeObserver.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(element => {
        // Add class dynamically if not present
        if (!element.classList.contains('fade-in')) {
            element.classList.add('fade-in');
        }
        fadeObserver.observe(element);
    });

    /* ==========================================================================
       CONTACT FORM SUBMIT (SIMULATION)
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation check
            if (!name || !email || !subject || !message) {
                showStatus('Please fill in all fields.', 'error');
                return;
            }

            // Disable submit button
            const submitBtn = contactForm.querySelector('.btn-submit');
            const submitBtnText = submitBtn.querySelector('span');
            const submitBtnIcon = submitBtn.querySelector('i');
            
            submitBtn.disabled = true;
            submitBtnText.textContent = 'Sending...';
            submitBtnIcon.className = 'fa-solid fa-spinner fa-spin';

            // Simulate API request (delay of 1.5 seconds)
            setTimeout(() => {
                showStatus(`Thank you, ${name}! Your message has been sent successfully.`, 'success');
                contactForm.reset();
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtnText.textContent = 'Send Message';
                submitBtnIcon.className = 'fa-solid fa-paper-plane';
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            }, 1500);
        });
    }

    function showStatus(msg, type) {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }

    /* ==========================================================================
       SCROLL TO TOP BUTTON
       ========================================================================== */
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       ABOUT SECTION STAGGERED ENTRANCE ANIMATIONS
       ========================================================================== */
    // Add stagger delays for about section children
    const aboutInfoItems = document.querySelectorAll('.about-info .about-text, .about-info .personal-details-grid, .about-details');
    aboutInfoItems.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.12}s`;
    });

    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach((el, i) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${0.2 + i * 0.08}s`;
        fadeObserver.observe(el);
    });

    // Staggered credentials cards
    document.querySelectorAll('.credential-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
    });


    // Staggered hackathon cards
    document.querySelectorAll('.hackathon-showcase-card, .cert-showcase-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
    });

    /* ==========================================================================
       DYNAMIC CODING STATS — fetches live data from free public APIs
       Falls back silently to the hardcoded HTML values if any fetch fails.
       ========================================================================== */
    async function updateCodingStats() {
        // Helper: set element text content by ID (no-op if el not found)
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el && value !== null && value !== undefined) el.textContent = value;
        };

        // Helper: set width of a progress bar by ID, clamped 0–100%
        const setWidth = (id, pct) => {
            const el = document.getElementById(id);
            if (el) el.style.width = Math.min(100, Math.max(0, Math.round(pct))) + '%';
        };

        // CORS proxy wrapper (AllOrigins) for endpoints that block direct browser access
        const proxied = url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        // ── LeetCode (alfa-leetcode-api — has Access-Control-Allow-Origin: *) ──
        try {
            const [solvedRes, contestRes] = await Promise.all([
                fetch('https://alfa-leetcode-api.onrender.com/Kowshik_Kumar/solved'),
                fetch('https://alfa-leetcode-api.onrender.com/Kowshik_Kumar/contest')
            ]);

            if (solvedRes.ok) {
                const d = await solvedRes.json();
                const total = d.solvedProblem ?? 0;
                const easy  = d.easySolved   ?? 0;
                const med   = d.mediumSolved  ?? 0;
                const hard  = d.hardSolved    ?? 0;

                setText('lc-total-solved', total);
                setText('lc-easy',   easy);
                setText('lc-medium', med);
                setText('lc-hard',   hard);

                if (total > 0) {
                    setWidth('lc-easy-bar',   (easy / total) * 100);
                    setWidth('lc-medium-bar', (med  / total) * 100);
                    setWidth('lc-hard-bar',   (hard / total) * 100);
                }
            }

            if (contestRes.ok) {
                const d = await contestRes.json();
                setText('lc-contests', d.contestAttend ?? 13);
            }
        } catch (err) {
            console.warn('[CodingStats] LeetCode fetch failed:', err.message);
        }

        // ── HackerRank (via AllOrigins proxy) ──
        try {
            const hrUrl   = 'https://www.hackerrank.com/rest/hackers/kowshiii1208/badges';
            const proxyRes = await fetch(proxied(hrUrl));
            if (proxyRes.ok) {
                const wrapper = await proxyRes.json();
                const d = JSON.parse(wrapper.contents);

                if (Array.isArray(d.models) && d.models.length > 0) {
                    const totalStars  = d.models.reduce((acc, m) => acc + (m.stars  || 0), 0);
                    const totalSolved = d.models.reduce((acc, m) => acc + (m.solved || 0), 0);

                    setText('hr-total-stars', totalStars + '★');
                    setText('hr-solved', totalSolved);

                    const badge = type => d.models.find(m => m.badge_type === type);
                    const maxStars = 5;

                    const ps  = badge('problem-solving');
                    const py  = badge('python');
                    const cpp = badge('cpp');

                    if (ps)  { setText('hr-ps-stars',  ps.stars  + '★'); setWidth('hr-ps-bar',  (ps.stars  / maxStars) * 100); }
                    if (py)  { setText('hr-py-stars',  py.stars  + '★'); setWidth('hr-py-bar',  (py.stars  / maxStars) * 100); }
                    if (cpp) { setText('hr-cpp-stars', cpp.stars + '★'); setWidth('hr-cpp-bar', (cpp.stars / maxStars) * 100); }
                }
            }
        } catch (err) {
            console.warn('[CodingStats] HackerRank fetch failed:', err.message);
        }

        // ── GeeksforGeeks (via AllOrigins proxy — may fail on Vercel endpoints) ──
        try {
            const gfgUrl  = 'https://gfgstatscard.vercel.app/kowshii6ran?raw=true';
            const proxyRes = await fetch(proxied(gfgUrl));
            if (proxyRes.ok) {
                const wrapper = await proxyRes.json();
                const d = JSON.parse(wrapper.contents);

                const total  = d.total_problems_solved ?? 0;
                const school = d.School ?? 0;
                const basic  = d.Basic  ?? 0;
                const easy   = (d.Easy  ?? 0) + school + basic; // group lower levels as Easy
                const med    = d.Medium ?? 0;
                const hard   = d.Hard   ?? 0;

                setText('gfg-total-solved', total);
                setText('gfg-easy',   easy);
                setText('gfg-medium', med);
                setText('gfg-hard',   hard);
                setText('gfg-monthly', d.monthly_score ?? d.monthly_score ?? '--');
                setText('gfg-score',   d.total_score   ?? '--');

                if (total > 0) {
                    setWidth('gfg-easy-bar',   (easy / total) * 100);
                    setWidth('gfg-medium-bar', (med  / total) * 100);
                    setWidth('gfg-hard-bar',   (hard / total) * 100);
                }
            }
        } catch (err) {
            console.warn('[CodingStats] GFG fetch failed:', err.message);
        }

        // ── CodeChef (via AllOrigins proxy) ──
        try {
            const ccUrl   = 'https://cp-rating-api.vercel.app/codechef/kowshiii_1208';
            const proxyRes = await fetch(proxied(ccUrl));
            if (proxyRes.ok) {
                const wrapper = await proxyRes.json();
                const d = JSON.parse(wrapper.contents);
                setText('cc-contests', d.participation ?? 13);
            }
        } catch (err) {
            console.warn('[CodingStats] CodeChef fetch failed:', err.message);
        }

        // ── Codeforces (Direct API with AllOrigins fallback) ──
        try {
            let statusList = null;
            try {
                const cfRes = await fetch('https://codeforces.com/api/user.status?handle=kowshiii1208');
                if (cfRes.ok) {
                    const cfJson = await cfRes.json();
                    if (cfJson.status === 'OK' && Array.isArray(cfJson.result)) {
                        statusList = cfJson.result;
                    }
                }
            } catch (netErr) {
                // Try CORS proxy if direct fetch is blocked
                const proxyRes = await fetch(proxied('https://codeforces.com/api/user.status?handle=kowshiii1208'));
                if (proxyRes.ok) {
                    const wrapper = await proxyRes.json();
                    const cfJson = JSON.parse(wrapper.contents);
                    if (cfJson.status === 'OK' && Array.isArray(cfJson.result)) {
                        statusList = cfJson.result;
                    }
                }
            }

            if (Array.isArray(statusList)) {
                const solvedMap = new Map();
                let maxRating = 0;
                let easyCount = 0;
                let medCount = 0;
                let hardCount = 0;

                statusList.forEach(s => {
                    if (s.verdict === 'OK' && s.problem) {
                        const pid = `${s.problem.contestId}-${s.problem.index}`;
                        if (!solvedMap.has(pid)) {
                            solvedMap.set(pid, s.problem);
                            const r = s.problem.rating || 800;
                            if (r > maxRating) maxRating = r;
                            if (r <= 1000) easyCount++;
                            else if (r <= 1500) medCount++;
                            else hardCount++;
                        }
                    }
                });

                const totalSolved = solvedMap.size;
                setText('cf-total-solved', totalSolved);
                setText('cf-easy', easyCount);
                setText('cf-medium', medCount);
                setText('cf-hard', hardCount);
                if (maxRating > 0) setText('cf-max-rating', maxRating);

                if (totalSolved > 0) {
                    setWidth('cf-easy-bar',   (easyCount / totalSolved) * 100);
                    setWidth('cf-medium-bar', (medCount  / totalSolved) * 100);
                    setWidth('cf-hard-bar',   (hardCount / totalSolved) * 100);
                }
            }

            // Fetch rank title or rating from user.info
            try {
                const infoRes = await fetch('https://codeforces.com/api/user.info?handles=kowshiii1208');
                if (infoRes.ok) {
                    const infoJson = await infoRes.json();
                    if (infoJson.status === 'OK' && infoJson.result?.[0]) {
                        const u = infoJson.result[0];
                        if (u.rank) {
                            setText('cf-rank-badge', u.rank.charAt(0).toUpperCase() + u.rank.slice(1));
                        } else if (u.rating) {
                            setText('cf-rank-badge', `${u.rating} Rating`);
                        }
                    }
                }
            } catch (infoErr) {
                // Non-critical
            }
        } catch (err) {
            console.warn('[CodingStats] Codeforces fetch failed:', err.message);
        }
    }

    // Kick off stats update after a short delay to not block page interactivity
    setTimeout(updateCodingStats, 800);

    /* ==========================================================================
       10/10 PORTFOLIO UPGRADES (TOAST, COPY, MILESTONES, FILTERS, ARCH MODAL, CMD PALETTE)
       ========================================================================== */

    // 1. Toast Notification System
    const toastEl = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    let toastTimer = null;

    function showToast(message, iconClass = 'fa-solid fa-circle-check') {
        if (!toastEl || !toastMsg) return;
        toastMsg.textContent = message;
        const iconEl = toastEl.querySelector('.toast-icon');
        if (iconEl) iconEl.className = `${iconClass} toast-icon`;
        
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3200);
    }

    // 2. Email Copy with Feedback
    function copyEmailToClipboard() {
        const email = 'kowshiii1208@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(() => {
                showToast('Copied kowshiii1208@gmail.com to clipboard! 📋');
            }).catch(() => fallbackCopy(email));
        } else {
            fallbackCopy(email);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('Copied kowshiii1208@gmail.com to clipboard! 📋');
        } catch (e) {
            showToast('Email: kowshiii1208@gmail.com');
        }
        document.body.removeChild(ta);
    }

    const heroCopyBtn = document.getElementById('heroCopyEmailBtn');
    if (heroCopyBtn) heroCopyBtn.addEventListener('click', copyEmailToClipboard);

    const contactCopyBtn = document.getElementById('contactCopyEmailBtn');
    if (contactCopyBtn) contactCopyBtn.addEventListener('click', copyEmailToClipboard);

    // 3. Cumulative Coding Milestones Counter Animation
    const banner = document.querySelector('.coding-milestones-banner');
    if (banner) {
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !animated) {
                animated = true;
                const numbers = banner.querySelectorAll('.milestone-number');
                numbers.forEach(num => {
                    const target = parseFloat(num.getAttribute('data-target'));
                    const isDecimal = num.getAttribute('data-decimal') === '1';
                    const duration = 1800;
                    const startTime = performance.now();

                    function update(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart
                        const currentVal = target * ease;
                        
                        num.textContent = isDecimal 
                            ? currentVal.toFixed(1) 
                            : Math.floor(currentVal).toLocaleString();

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            num.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
                        }
                    }
                    requestAnimationFrame(update);
                });
                observer.disconnect();
            }
        }, { threshold: 0.25 });
        observer.observe(banner);
    }

    // 4. Project Filter Tabs
    const filterBtns = document.querySelectorAll('.filter-tab-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.35s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 40);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 5. Project Architecture Deep-Dive Modal
    const archModal = document.getElementById('projectArchModal');
    const archModalClose = document.getElementById('archModalClose');
    const archModalContent = document.getElementById('archModalContent');

    const projectArchData = {
        echolearn: {
            title: "EchoLearn — System Architecture",
            sub: "AI-Powered Conversational Tutoring & Active Recall Engine",
            sections: [
                {
                    heading: "Problem & Target Audience",
                    icon: "fa-solid fa-bullseye",
                    text: "Students experience passive fatigue and poor memory retention with traditional video lectures. EchoLearn flips education into active conversational recall using real-time conversational AI."
                },
                {
                    heading: "System Architecture & Technologies",
                    icon: "fa-solid fa-layer-group",
                    text: "Frontend built on React 18 and TypeScript with modular chat and recall interfaces. Backend leverages Supabase for instantaneous session state, user authentication, and persistent learning telemetry."
                },
                {
                    heading: "Key Engineering Solutions",
                    icon: "fa-solid fa-gears",
                    bullets: [
                        "Adaptive context-windowing to preserve student learning paths while minimizing token overhead.",
                        "Optimistic UI updates ensuring zero perceived lag during voice and chat interactions.",
                        "Dynamic Socratic questioning algorithms prompting students to justify answers rather than giving direct answers."
                    ]
                }
            ]
        },
        medicare: {
            title: "Medicare Assistant — System Architecture",
            sub: "Healthcare Navigation Platform Engineered for Senior Accessibility",
            sections: [
                {
                    heading: "Problem & Target Audience",
                    icon: "fa-solid fa-bullseye",
                    text: "Navigating Medicare part A, B, C, D eligibility and out-of-pocket thresholds is overwhelming for elderly seniors, leading to critical coverage gaps."
                },
                {
                    heading: "Accessibility-First Architecture",
                    icon: "fa-solid fa-universal-access",
                    text: "Engineered with strict WCAG AAA color contrast ratios, enlarged touch targets, simplified conversational flows, and persistent state management via Supabase."
                },
                {
                    heading: "Key Engineering Solutions",
                    icon: "fa-solid fa-gears",
                    bullets: [
                        "Deterministic triage decision tree combined with conversational LLM explanations.",
                        "Responsive layout optimized for high-zoom browser modes and assistive screen readers.",
                        "Privacy-compliant anonymized user session storage."
                    ]
                }
            ]
        },
        quizgame: {
            title: "Quiz Game System — Architecture & Engineering",
            sub: "C++14 OOP Assessment Platform with Anti-Cheat & Web Portal",
            sections: [
                {
                    heading: "Core Problem & Design Goal",
                    icon: "fa-solid fa-bullseye",
                    text: "Online technical assessments struggle with tab-switching dishonesty, network drops, and lack of real-time merit recognition."
                },
                {
                    heading: "C++14 Object-Oriented Core",
                    icon: "fa-solid fa-code",
                    bullets: [
                        "<strong>Encapsulation:</strong> Strict separation of Candidate, QuestionBank, ExamSession, and LeaderboardManager classes.",
                        "<strong>Polymorphism:</strong> Base Question class extensible into MCQ, True/False, and Multi-select formats.",
                        "<strong>Singleton Pattern:</strong> Thread-safe Leaderboard and Session manager."
                    ]
                },
                {
                    heading: "Web Portal & Anti-Cheat Logic",
                    icon: "fa-solid fa-shield-halved",
                    bullets: [
                        "Client-side Page Visibility API monitoring tab switches with penalty strikes.",
                        "Automated Canvas-rendered Merit & Honor Pass certificate generation with unique candidate hashes.",
                        "Persistent browser state recovery preventing session loss on accidental page reload."
                    ]
                }
            ]
        }
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-project-deepdive');
        if (btn) {
            e.preventDefault();
            const archKey = btn.getAttribute('data-arch');
            const data = projectArchData[archKey];
            if (!data || !archModalContent) return;

            let html = `
                <div class="arch-modal-header">
                    <div>
                        <h3 class="arch-modal-title">${data.title}</h3>
                        <p class="arch-modal-sub">${data.sub}</p>
                    </div>
                </div>
            `;

            data.sections.forEach(sec => {
                html += `
                    <div class="arch-modal-section">
                        <h4><i class="${sec.icon}"></i> ${sec.heading}</h4>
                        ${sec.text ? `<p>${sec.text}</p>` : ''}
                        ${sec.bullets ? `<ul>${sec.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
                    </div>
                `;
            });

            archModalContent.innerHTML = html;
            archModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });

    if (archModalClose) {
        archModalClose.addEventListener('click', () => {
            archModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (archModal) {
        archModal.addEventListener('click', (e) => {
            if (e.target === archModal || e.target.closest('.arch-modal-sheet') === null) {
                archModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // 6. Interactive Command Palette (Ctrl + K)
    const cmdModal = document.getElementById('cmdPaletteModal');
    const cmdBtn = document.getElementById('cmdPaletteBtn');
    const cmdInput = document.getElementById('cmdInput');
    const cmdResults = document.getElementById('cmdResults');

    function scrollToSection(selector) {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    const cmdData = [
        // Navigation
        { group: "Navigation", title: "Home", desc: "Hero section", icon: "fa-solid fa-house", action: () => scrollToSection('#hero') },
        { group: "Navigation", title: "About Me", desc: "Background & Education", icon: "fa-solid fa-user", action: () => scrollToSection('#about') },
        { group: "Navigation", title: "Technical Skills", desc: "Languages, Web, Tools", icon: "fa-solid fa-code", action: () => scrollToSection('#skills') },
        { group: "Navigation", title: "Projects", desc: "EchoLearn, Medicare, Quiz Game", icon: "fa-solid fa-folder-open", action: () => scrollToSection('#projects') },
        { group: "Navigation", title: "Coding Profiles", desc: "LeetCode, Codeforces, CodeChef", icon: "fa-solid fa-terminal", action: () => scrollToSection('#credentials') },
        { group: "Navigation", title: "Achievements & Hackathons", desc: "2x SIH, Certifications", icon: "fa-solid fa-trophy", action: () => scrollToSection('#achievements') },
        { group: "Navigation", title: "Contact Me", desc: "Send message, reach out", icon: "fa-solid fa-paper-plane", action: () => scrollToSection('#contact') },
        
        // Quick Actions
        { group: "Actions", title: "Copy Email Address", desc: "kowshiii1208@gmail.com", icon: "fa-regular fa-copy", badge: "Action", action: () => copyEmailToClipboard() },
        { group: "Actions", title: "Interactive Resume", desc: "Open resume viewer & download DOCX", icon: "fa-solid fa-file-lines", badge: "Modal", action: () => {
            const resumeBtn = document.getElementById('aboutResumeBtn');
            if (resumeBtn) resumeBtn.click();
        }},
        { group: "Actions", title: "Toggle Theme", desc: "Dark / Light Mode", icon: "fa-solid fa-circle-half-stroke", badge: "Toggle", action: () => {
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) themeBtn.click();
        }},
        
        // Projects
        { group: "Projects", title: "EchoLearn", desc: "AI-powered interactive learning platform", icon: "fa-solid fa-robot", badge: "React / AI", action: () => scrollToSection('#projects') },
        { group: "Projects", title: "Quiz Game System", desc: "C++ & OOP examination platform on Vercel", icon: "fa-solid fa-gamepad", badge: "C++ / Web", action: () => window.open('https://quiz-game-system-eight.vercel.app/', '_blank') },
        { group: "Projects", title: "Medicare Assistant", desc: "Healthcare insurance guide for seniors", icon: "fa-solid fa-heart-pulse", badge: "React / Supabase", action: () => scrollToSection('#projects') },

        // External Profiles
        { group: "Profiles", title: "GitHub", desc: "github.com/kowshiii1208", icon: "fa-brands fa-github", badge: "External", action: () => window.open('https://github.com/kowshiii1208', '_blank') },
        { group: "Profiles", title: "LinkedIn", desc: "linkedin.com/in/kowshik-kumar-yanamala-613992369", icon: "fa-brands fa-linkedin", badge: "External", action: () => window.open('https://www.linkedin.com/in/kowshik-kumar-yanamala-613992369', '_blank') },
        { group: "Profiles", title: "LeetCode", desc: "leetcode.com/u/Kowshik_Kumar", icon: "fa-solid fa-code", badge: "170+ Solved", action: () => window.open('https://leetcode.com/u/Kowshik_Kumar', '_blank') },
        { group: "Profiles", title: "CodeChef", desc: "codechef.com/users/kowshiii_1208", icon: "fa-solid fa-trophy", badge: "900+ Solved", action: () => window.open('https://www.codechef.com/users/kowshiii_1208', '_blank') },
        { group: "Profiles", title: "Codeforces", desc: "codeforces.com/profile/kowshiii1208", icon: "fa-solid fa-bolt", badge: "Profile", action: () => window.open('https://codeforces.com/profile/kowshiii1208', '_blank') }
    ];

    let selectedIndex = 0;

    function openCmdPalette() {
        if (!cmdModal) return;
        cmdModal.classList.add('open');
        if (cmdInput) {
            cmdInput.value = '';
            renderCmdResults('');
            cmdInput.focus();
        }
        document.body.style.overflow = 'hidden';
    }

    function closeCmdPalette() {
        if (!cmdModal) return;
        cmdModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderCmdResults(query) {
        if (!cmdResults) return;
        const q = query.toLowerCase().trim();
        const filtered = q === '' 
            ? cmdData 
            : cmdData.filter(item => 
                item.title.toLowerCase().includes(q) || 
                item.desc.toLowerCase().includes(q) ||
                item.group.toLowerCase().includes(q)
              );

        if (filtered.length === 0) {
            cmdResults.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--secondary-text);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 8px; opacity: 0.5;"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        selectedIndex = 0;
        let html = '';
        let currentGroup = '';

        filtered.forEach((item, idx) => {
            if (item.group !== currentGroup) {
                currentGroup = item.group;
                html += `<div class="cmd-group-label">${currentGroup}</div>`;
            }
            html += `
                <div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                    <div class="cmd-item-left">
                        <div class="cmd-item-icon"><i class="${item.icon}"></i></div>
                        <div>
                            <strong>${item.title}</strong>
                            <span class="cmd-item-desc">${item.desc}</span>
                        </div>
                    </div>
                    ${item.badge ? `<span class="cmd-item-badge">${item.badge}</span>` : ''}
                </div>
            `;
        });

        cmdResults.innerHTML = html;

        const itemEls = cmdResults.querySelectorAll('.cmd-item');
        itemEls.forEach((el, idx) => {
            el.addEventListener('click', () => {
                closeCmdPalette();
                filtered[idx].action();
            });
            el.addEventListener('mouseenter', () => {
                itemEls.forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
                selectedIndex = idx;
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdModal && cmdModal.classList.contains('open')) {
                closeCmdPalette();
            } else {
                openCmdPalette();
            }
        } else if (e.key === 'Escape') {
            if (cmdModal && cmdModal.classList.contains('open')) {
                closeCmdPalette();
            }
        } else if (cmdModal && cmdModal.classList.contains('open')) {
            const itemEls = cmdResults.querySelectorAll('.cmd-item');
            if (itemEls.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % itemEls.length;
                itemEls.forEach((el, idx) => el.classList.toggle('selected', idx === selectedIndex));
                itemEls[selectedIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + itemEls.length) % itemEls.length;
                itemEls.forEach((el, idx) => el.classList.toggle('selected', idx === selectedIndex));
                itemEls[selectedIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (itemEls[selectedIndex]) {
                    itemEls[selectedIndex].click();
                }
            }
        }
    });

    if (cmdBtn) cmdBtn.addEventListener('click', openCmdPalette);
    if (cmdInput) cmdInput.addEventListener('input', (e) => renderCmdResults(e.target.value));
    if (cmdModal) {
        cmdModal.addEventListener('click', (e) => {
            if (e.target === cmdModal) closeCmdPalette();
        });
    }

});
