
/* --- PC SPECS & PERIPHERALS ORBIT ENGINE --- */
(function() {
    const imagesData = [
        { name: "AMD RYZEN 7 7800X3D", url: "specs/7800x3d.png" },
        { name: "MADLIONS MAD60HE", url: "specs/keyboard.png" },
        { name: "MI 2K GAMING 27\" 180HZ", url: "specs/monitor.png" },
        { name: "SUPERGLIDE PADS", url: "specs/glass-pads.png" },
        { name: "TRUTHEAR x CRINACLE ZERO", url: "specs/iem.png" },
        { name: "XFX SWIFT RX 9060 XT", url: "specs/gpu.png" },
        { name: "PULSAR X2 CRAZYLIGHT", url: "specs/mouse.png" }
    ];

    const PARTICLE_COUNT = 1500;
    const SPHERE_RADIUS = 9;
    const IMAGE_SIZE = 1.8;

    let scene, camera, renderer, group;
    const container = document.getElementById('specs-orbit-container');

    if (!container) return;

    let isDragging = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let autoRotate = true;

    function createLabelTexture(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 40px "Teko", sans-serif';
        ctx.fillStyle = '#ff4655';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        return new THREE.CanvasTexture(canvas);
    }

    function init() {
        scene = new THREE.Scene();
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || 600;
        
        camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        camera.position.z = 20;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        group = new THREE.Group();
        scene.add(group);

        // --- Particles ---
        const geometry = new THREE.SphereGeometry(0.04, 8, 6);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.6 + Math.random() * 0.3),
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(geometry, material);
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
            const radiusVar = SPHERE_RADIUS + (Math.random() - 0.5) * 4;
            particle.position.x = radiusVar * Math.cos(theta) * Math.sin(phi);
            particle.position.y = radiusVar * Math.cos(phi);
            particle.position.z = radiusVar * Math.sin(theta) * Math.sin(phi);
            group.add(particle);
        }

        // --- Orbiting Images ---
        const textureLoader = new THREE.TextureLoader();
        imagesData.forEach((data, i) => {
            const angle = (i / imagesData.length) * Math.PI * 2;
            const x = SPHERE_RADIUS * Math.cos(angle);
            const z = SPHERE_RADIUS * Math.sin(angle);
            const y = (Math.random() - 0.5) * 4; 

            const planeGeo = new THREE.PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE);
            textureLoader.load(data.url, (tex) => {
                const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(planeGeo, planeMat);
                mesh.position.set(x, y, z);
                mesh.lookAt(new THREE.Vector3(0, y, 0));
                mesh.rotateY(Math.PI);
                group.add(mesh);
            });

            const labelGeo = new THREE.PlaneGeometry(2.5, 0.6);
            const labelMat = new THREE.MeshBasicMaterial({ map: createLabelTexture(data.name), transparent: true, side: THREE.DoubleSide });
            const labelMesh = new THREE.Mesh(labelGeo, labelMat);
            labelMesh.position.set(x, y - (IMAGE_SIZE / 2 + 0.5), z);
            labelMesh.lookAt(new THREE.Vector3(0, y - (IMAGE_SIZE / 2 + 0.5), 0));
            labelMesh.rotateY(Math.PI);
            group.add(labelMesh);
        });

        // Interactivity
        container.addEventListener('mousedown', (e) => { isDragging = true; autoRotate = false; });
        window.addEventListener('mouseup', () => { isDragging = true; }); // Keep dragging state logic simple
        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.movementX || 0;
                const deltaY = e.movementY || 0;
                group.rotation.y += deltaX * 0.005;
                group.rotation.x += deltaY * 0.005;
            }
        });
        // Simplified touch
        container.addEventListener('touchstart', () => { autoRotate = false; });

        window.addEventListener('resize', () => {
            const nw = container.clientWidth;
            const nh = container.clientHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        });

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (autoRotate) {
            group.rotation.y += 0.003;
        }
        renderer.render(scene, camera);
    }

    // Initialize when DOM and Three are ready
    if (window.THREE) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.THREE) init();
        });
    }
})();
