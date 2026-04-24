document.addEventListener('DOMContentLoaded', () => {
    // Glitch text effect on hover
    const glitchElements = document.querySelectorAll('.glitch, .logo');

    glitchElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            let iterations = 0;
            const originalText = el.dataset.text;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            
            const interval = setInterval(() => {
                el.innerText = originalText.split('').map((letter, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * letters.length)];
                }).join('');

                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    el.innerText = originalText;
                }
                iterations += 1 / 3;
            }, 30);
        });
    });

    // Custom crosshair element tracking mouse slightly
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create temporary hit markers
            if(Math.random() > 0.95) {
                const marker = document.createElement('div');
                marker.style.position = 'absolute';
                marker.style.left = x + 'px';
                marker.style.top = y + 'px';
                marker.style.width = '10px';
                marker.style.height = '10px';
                marker.style.border = '1px solid var(--val-cyan)';
                marker.style.transform = 'translate(-50%, -50%) rotate(45deg)';
                marker.style.pointerEvents = 'none';
                
                heroVisual.appendChild(marker);
                
                setTimeout(() => {
                    marker.remove();
                }, 500);
            }
        });
    }

    // Squad Gallery Interaction
    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Remove expanded class from all
            agentCards.forEach(c => c.classList.remove('expanded'));
            // Add to current
            card.classList.add('expanded');
        });
    });

    // --- About Me Card Logic ---
    function updateClock() {
        const timeEl = document.getElementById('local-time');
        if (!timeEl) return;
        
        // Force GMT+8 (Philippine Time)
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const gmt8 = new Date(utc + (3600000 * 8));
        
        let hours = gmt8.getHours();
        const minutes = gmt8.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        timeEl.innerText = `${hours}:${minutes}${ampm}`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);

    window.copyEmail = async () => {
        const email = "eyronggwp@gmail.com";
        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(email);
            
            // Show feedback
            const btn = document.querySelector('.btn-copy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> COPIED';
            
            // Open mailto
            window.location.href = `mailto:${email}`;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    // --- Gallery Scanner Logic ---
    const gallerySection = document.querySelector('.gallery-section');
    const scanner = document.querySelector('.gallery-scanner');
    
    if (gallerySection && scanner) {
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;

        gallerySection.addEventListener('mousemove', (e) => {
            const rect = gallerySection.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        function animateScanner() {
            // Add a tiny bit of easing for that high-end feel
            currentX += (mouseX - currentX) * 0.2;
            currentY += (mouseY - currentY) * 0.2;
            
            scanner.style.transform = `translate(${currentX - 30}px, ${currentY - 30}px)`;
            requestAnimationFrame(animateScanner);
        }
        
        animateScanner();
    }
});
