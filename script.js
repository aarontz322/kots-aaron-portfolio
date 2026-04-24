document.addEventListener('DOMContentLoaded', () => {
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

    // --- Background Music Logic ---
    const musicToggle = document.getElementById('music-toggle');
    const bgAudio = document.getElementById('bg-audio');
    const musicText = musicToggle?.querySelector('.music-text');
    let isPlaying = false;

    if (musicToggle && bgAudio) {
        bgAudio.volume = 0.25; // Lowered to 25% volume per user request

        const toggleMusic = () => {
            if (isPlaying) {
                bgAudio.pause();
                musicToggle.classList.remove('playing');
                musicToggle.classList.add('muted');
                if (musicText) musicText.innerText = "SOUND OFF";
            } else {
                bgAudio.play().catch(e => console.log("Audio play blocked by browser"));
                musicToggle.classList.add('playing');
                musicToggle.classList.remove('muted');
                if (musicText) musicText.innerText = "SOUND ON";
            }
            isPlaying = !isPlaying;
        };

        musicToggle.addEventListener('click', toggleMusic);

        // Auto-play attempt on first interaction
        const unlockAudio = () => {
            if (!isPlaying) {
                toggleMusic();
            }
            document.removeEventListener('click', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
    }
});
