
/* --- PC SPECS & PERIPHERALS ORBIT ENGINE --- */
(function() {
    console.log("Specs Orbit Engine: Loading...");

    const imagesData = [
        { name: "AMD RYZEN 7 7800X3D", url: "specs/7800x3d.png" },
        { name: "MADLIONS MAD60HE", url: "specs/keyboard.png" },
        { name: "MI 2K GAMING 27\" 180HZ", url: "specs/monitor.png" },
        { name: "SUPERGLIDE PADS", url: "specs/glass-pads.png" },
        { name: "TRUTHEAR x CRINACLE ZERO", url: "specs/iem.png" },
        { name: "XFX SWIFT RX 9060 XT", url: "specs/gpu.png" },
        { name: "PULSAR X2 CRAZYLIGHT", url: "specs/mouse.png" }
    ];

    const PARTICLE_COUNT = 1000;
    const SPHERE_RADIUS = 8;
    const IMAGE_SIZE = 1.8;

    let scene, camera, renderer, group, controls;
    const container = document.getElementById('specs-orbit-container');

    if (!container) return;

    function createLabelTexture(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024; // Expanded width so long text fits on one line
        canvas.height = 128;
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 44px "Teko", sans-serif';
        ctx.fillStyle = '#ff4655';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        return new THREE.CanvasTexture(canvas);
    }

    function init() {
        console.log("Specs Orbit Engine: Initializing Scene...");
        scene = new THREE.Scene();
        
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || 500;
        
        camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.z = 18;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.5;
            // Allow zoom but constrain it slightly so they don't break the layout
            controls.minDistance = 5;
            controls.maxDistance = 40;
        }

        group = new THREE.Group();
        scene.add(group);

        // --- Particles ---
        const geometry = new THREE.SphereGeometry(0.04, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4655,
            transparent: true,
            opacity: 0.4
        });
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const particle = new THREE.Mesh(geometry, particleMaterial);
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
            const radiusVar = SPHERE_RADIUS + (Math.random() - 0.5) * 3;
            particle.position.x = radiusVar * Math.cos(theta) * Math.sin(phi);
            particle.position.y = radiusVar * Math.cos(phi);
            particle.position.z = radiusVar * Math.sin(theta) * Math.sin(phi);
            group.add(particle);
        }

        // --- Orbiting Images ---
        const textureLoader = new THREE.TextureLoader();
        imagesData.forEach((data, i) => {
            const angle = (i / imagesData.length) * Math.PI * 2;
            const x = (SPHERE_RADIUS + 1) * Math.cos(angle);
            const z = (SPHERE_RADIUS + 1) * Math.sin(angle);
            const y = 0; // Aligned perfectly on the Y-axis

            const planeGeo = new THREE.PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE);
            textureLoader.load(data.url, (tex) => {
                const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(planeGeo, planeMat);
                
                const pos = new THREE.Vector3(x, y, z);
                mesh.position.copy(pos);
                // Make plane face exactly outward from the center
                mesh.lookAt(pos.clone().multiplyScalar(2));
                
                group.add(mesh);
            });

            // Label
            const labelGeo = new THREE.PlaneGeometry(6, 0.75); // Match the new 8:1 canvas ratio
            const labelMat = new THREE.MeshBasicMaterial({ 
                map: createLabelTexture(data.name), 
                transparent: true, 
                side: THREE.DoubleSide 
            });
            const labelMesh = new THREE.Mesh(labelGeo, labelMat);
            
            const labelPos = new THREE.Vector3(x, y - (IMAGE_SIZE / 2 + 0.6), z);
            labelMesh.position.copy(labelPos);
            // Label faces exactly outward as well
            labelMesh.lookAt(new THREE.Vector3(x * 2, labelPos.y, z * 2));
            
            group.add(labelMesh);
        });

        window.addEventListener('resize', () => {
            const nw = container.offsetWidth;
            const nh = container.offsetHeight;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        });

        console.log("Specs Orbit Engine: Animation Started.");
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update(); // OrbitControls handles auto-rotation and damping
        } else {
            // Fallback rotation if OrbitControls didn't load
            group.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
    }

    // Reliable Launch
    function checkAndInit() {
        if (window.THREE && document.body) {
            init();
        } else {
            setTimeout(checkAndInit, 100);
        }
    }
    checkAndInit();
})();
