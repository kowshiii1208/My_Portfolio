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
    
    function openModal(filePath, captionText) {
        if (!modal) return;
        
        modalCaption.textContent = captionText || 'Participation Certificate';
        
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
        document.body.style.overflow = '';
    }
    
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-preview-achievement, .btn-view-cert');
        if (btn) {
            e.preventDefault();
            const filePath = btn.getAttribute('data-file') || btn.getAttribute('data-cert');
            const caption = btn.getAttribute('data-caption') || btn.getAttribute('data-caption') || 'Certificate';
            openModal(filePath, caption);
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
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    // Reset skill bars initial width to 0 for animation trigger
    skillBars.forEach(bar => {
        bar.dataset.width = bar.style.width;
        bar.style.width = '0';
    });

    function animateSkills() {
        skillBars.forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }

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

                // Trigger skill animations specifically when entering skills section
                if (id === 'skills') {
                    animateSkills();
                }
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
});
