document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Set up scroll observer script 
    window.addEventListener('scroll', () => {
        let currentId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Trigger active state when section enters top third of view
            if (scrollY >= (sectionTop - window.innerHeight / 3)) {
                currentId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            // Reset styling to default
            link.classList.remove('text-[#C0C1FF]', 'border-[#C0C1FF]');
            link.classList.add('text-slate-400', 'border-transparent');
            
            // Apply primary styling for active section
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('text-[#C0C1FF]', 'border-[#C0C1FF]');
                link.classList.remove('text-slate-400', 'border-transparent');
            }
        });
    });
    // Contact Form Anti-Spam & Fetch Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            const button = document.getElementById('submit-btn');

            // CLIENT-SIDE RATE LIMITING (3 Messages per 10 minutes)
            const currentTime = new Date().getTime();
            let history = JSON.parse(localStorage.getItem('submission_history') || '[]');
            
            // Keep only timestamps from the last 10 minutes (600,000 miliseconds)
            history = history.filter(time => currentTime - time < 600000);
            
            if (history.length >= 3) {
                const oldest = history[0];
                const waitTimeMs = 600000 - (currentTime - oldest);
                const waitMinutes = Math.ceil(waitTimeMs / 60000);
                
                button.innerHTML = `LOCKED (${waitMinutes}m) <span class="material-symbols-outlined text-xl">lock</span>`;
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = 'EXECUTE_TRANSMISSION <span class="material-symbols-outlined text-xl">send</span>';
                }, 3000);
                return;
            }

            // CLIENT-SIDE SANITIZATION (Basic XSS Prevention)
            for (let [key, value] of data.entries()) {
                if (typeof value === 'string') {
                    data.set(key, value.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
                }
            }

            button.innerHTML = 'TRANSMITTING...';
            button.disabled = true;

            const payload = Object.fromEntries(data.entries());

            fetch(form.action, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    form.reset();
                    
                    // Record this successful submission timestamp
                    history.push(currentTime);
                    localStorage.setItem('submission_history', JSON.stringify(history));
                    
                    button.innerHTML = 'DELIVERED <span class="material-symbols-outlined text-xl">check_circle</span>';
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = 'EXECUTE_TRANSMISSION <span class="material-symbols-outlined text-xl">send</span>';
                    }, 4000);

                } else {
                    button.innerHTML = 'REJECTED <span class="material-symbols-outlined text-xl">error</span>';
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = 'EXECUTE_TRANSMISSION <span class="material-symbols-outlined text-xl">send</span>';
                    }, 4000);
                }
            }).catch(error => {
                button.innerHTML = 'NETWORK ERROR <span class="material-symbols-outlined text-xl">wifi_off</span>';
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = 'EXECUTE_TRANSMISSION <span class="material-symbols-outlined text-xl">send</span>';
                }, 4000);
            });
        });
    }
});
