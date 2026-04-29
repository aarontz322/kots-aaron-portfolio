
/* --- SQUAD MEMORIES GALLERY ENGINE --- */
document.addEventListener('DOMContentLoaded', () => {
    if (window.gsap && window.MotionPathPlugin) {
        gsap.registerPlugin(MotionPathPlugin);
    }

    const images = [
        { title: "Lysera", url: "gallery/Lysera.jpg" },
        { title: "Lysera 1", url: "gallery/Lysera1.jpg" },
        { title: "Lysera A", url: "gallery/Lyseraa.jpg" },
        { title: "Me", url: "gallery/Me.jpg" },
        { title: "Me 1", url: "gallery/Me1.jpg" },
        { title: "Lysera 2", url: "gallery/Lysera2.jpg" },
        { title: "Lysera 3", url: "gallery/Lysera3.jpg" },
        { title: "Group", url: "gallery/Group.jpg" },
        { title: "Champ 1", url: "gallery/Champ1.jpg" },
        { title: "Champ 2", url: "gallery/Champ2.jpg" }
    ];

    let opened = 0;
    let oldOpened = -1;
    let disabled = false;
    const total = images.length;
    const container = document.getElementById('image-gallery-container');
    const nextBtn = document.getElementById('next-gallery');
    const prevBtn = document.getElementById('prev-gallery');

    const gap = 10;
    const circleRadius = 7;
    const width = 400;
    const height = 400;
    const scale = 700;
    const bigSize = circleRadius * scale;

    const getPosSmall = (id) => ({
        cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
        cy: height - 30,
        r: circleRadius
    });
    const getPosSmallAbove = (id) => ({
        cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
        cy: height / 2,
        r: circleRadius * 2
    });
    const getPosCenter = () => ({ cx: width / 2, cy: height / 2, r: circleRadius * 7 });
    
    // Directional Positions
    const getPosExit = (isForward) => ({ 
        cx: isForward ? bigSize : width - bigSize, 
        cy: height / 2, 
        r: bigSize 
    });
    const getPosEntrance = (isForward) => ({ 
        cx: isForward ? width / 2 + bigSize : width / 2 - bigSize, 
        cy: height / 2, 
        r: bigSize 
    });

    function init() {
        if (!container) return;
        
        let html = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:100%; pointer-events:none;">
            <defs>`;
        
        images.forEach((img, i) => {
            const small = getPosSmall(i);
            html += `
                <clipPath id="clip_${i}">
                    <circle id="circle_${i}" cx="${small.cx}" cy="${small.cy}" r="${small.r}"></circle>
                </clipPath>
                <clipPath id="square_${i}">
                    <rect width="${width}" height="${height}"></rect>
                </clipPath>
                <clipPath id="tab_clip_${i}">
                    <circle cx="${small.cx}" cy="${small.cy}" r="${circleRadius}"></circle>
                </clipPath>`;
        });

        html += `</defs>`;
        
        images.forEach((img, i) => {
            html += `
                <g id="group_${i}" clip-path="url(#clip_${i})" style="display:none;">
                    <image width="${width}" height="${height}" href="${img.url}" preserveAspectRatio="xMidYMid meet"></image>
                </g>`;
        });

        // Tabs
        images.forEach((img, i) => {
            const pos = getPosSmall(i);
            html += `
                <g class="gallery-tab" style="pointer-events:auto; cursor:pointer;" data-index="${i}">
                    <image x="${pos.cx - circleRadius}" y="${pos.cy - circleRadius}" width="${circleRadius * 2}" height="${circleRadius * 2}" href="${img.url}" clip-path="url(#tab_clip_${i})" preserveAspectRatio="xMidYMid slice"></image>
                    <circle cx="${pos.cx}" cy="${pos.cy}" r="${circleRadius + 2}" fill="transparent" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"></circle>
                </g>`;
        });

        html += `</svg>`;
        container.innerHTML = html;

        container.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = parseInt(tab.getAttribute('data-index'));
                if (idx !== opened && !disabled) updateGallery(idx);
            });
        });
        
        updateGallery(0, true);
    }

    function updateGallery(newIndex, isFirst = false, forcedDirection = null) {
        if (!window.gsap) return;
        if (disabled && !isFirst) return;
        
        // Use forced direction if provided (buttons), otherwise fallback to index comparison (thumbnails)
        const isForward = isFirst || (forcedDirection !== null ? forcedDirection === 1 : newIndex > opened);
        const oldIndex = opened;
        oldOpened = oldIndex;
        opened = newIndex;
        disabled = true;

        images.forEach((_, i) => {
            const circle = document.getElementById(`circle_${i}`);
            const group = document.getElementById(`group_${i}`);
            if (!circle || !group) return;

            gsap.killTweensOf(circle);
            const tl = gsap.timeline();

            if (i === opened) {
                // INCOMING IMAGE: Expanding on top
                group.style.display = 'block';
                group.style.zIndex = 10;
                group.setAttribute('clip-path', `url(#clip_${i})`);
                
                tl.set(circle, getPosSmall(i))
                  .to(circle, {
                    ...getPosCenter(),
                    duration: isFirst ? 0 : 0.2,
                    ease: "power3.inOut"
                }).to(circle, {
                    ...getPosExit(isForward),
                    duration: isFirst ? 0.01 : 0.6,
                    ease: "power4.in",
                    onComplete: () => {
                        group.setAttribute('clip-path', `url(#square_${i})`);
                        disabled = false;
                        // CLEANUP: Hide the previous photo ONLY after the new one is full
                        images.forEach((_, idx) => {
                            if (idx !== opened) {
                                document.getElementById(`group_${idx}`).style.display = 'none';
                            }
                        });
                    }
                });
            } else if (i === oldIndex && !isFirst) {
                // PREVIOUS IMAGE: Stay full-screen as a background layer
                group.style.display = 'block';
                group.style.zIndex = 1;
                group.setAttribute('clip-path', `url(#square_${i})`);
                
                // Optional: Gentle fade or slight movement out behind the new one
                tl.to(circle, {
                    ...getPosCenter(),
                    duration: 0.8,
                    ease: "power2.inOut"
                });
            } else {
                // Neutral state
                if (i !== opened && i !== oldIndex) {
                    group.style.display = 'none';
                }
                gsap.set(circle, getPosSmall(i));
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            if (!disabled) updateGallery((opened + 1) % total, false, 1);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            if (!disabled) updateGallery((opened - 1 + total) % total, false, -1);
        });
    }

    // --- TOUCH SWIPE SUPPORT ---
    let touchStartX = 0;
    let touchEndX = 0;

    if (container) {
        container.style.pointerEvents = 'auto'; // Ensure it catches touch
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, { passive: true });
    }

    function handleGesture() {
        if (disabled) return;
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            // Swipe Left -> Next
            updateGallery((opened + 1) % total, false, 1);
        } else if (touchEndX > touchStartX + threshold) {
            // Swipe Right -> Prev
            updateGallery((opened - 1 + total) % total, false, -1);
        }
    }

    init();
});
