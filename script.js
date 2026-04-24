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
        
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        timeEl.innerText = `${hours}:${minutes}${ampm}`;
    }
    
    // Initial call
    updateClock();
    // Update every second for precision
    setInterval(updateClock, 1000);

    window.copyEmail = async () => {
        const email = "your.email@example.com"; // User should provide their actual email if different
        try {
            await navigator.clipboard.writeText(email);
            const btn = document.querySelector('.btn-copy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> COPIED';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };
});
