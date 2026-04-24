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

// Start clock immediately and repeatedly
updateClock();
setInterval(updateClock, 1000);

document.addEventListener('DOMContentLoaded', () => {
    updateClock(); // Re-check once DOM is ready
    
    // Glitch text effect on hover
    const glitchElements = document.querySelectorAll('.glitch, .logo');
    
    glitchElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            let iterations = 0;
            const originalText = el.dataset.text || el.innerText;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            
            const interval = setInterval(() => {
                el.innerText = originalText.split('').map((letter, index) => {
                    if (index < iterations) return originalText[index];
                    return letters[Math.floor(Math.random() * letters.length)];
                }).join('');

                if (iterations >= originalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 30);
        });
    });

    // Custom crosshair element tracking
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if(Math.random() > 0.95) {
                const marker = document.createElement('div');
                marker.style.cssText = `position:absolute; left:${x}px; top:${y}px; width:10px; height:10px; border:1px solid var(--val-cyan); transform:translate(-50%,-50%) rotate(45deg); pointer-events:none;`;
                heroVisual.appendChild(marker);
                setTimeout(() => marker.remove(), 500);
            }
        });
    }

    // Squad Gallery Interaction
    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            agentCards.forEach(c => c.classList.remove('expanded'));
            card.classList.add('expanded');
        });
    });

    window.copyEmail = async () => {
        const email = "eyronggwp@gmail.com";
        try {
            await navigator.clipboard.writeText(email);
            const btn = document.querySelector('.btn-copy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> COPIED';
            window.location.href = `mailto:${email}`;
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };
});
