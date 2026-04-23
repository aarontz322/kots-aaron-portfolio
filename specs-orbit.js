
import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js';

/* --- PC SPECS & PERIPHERALS ORBIT ENGINE --- */
(function() {
    console.log("Specs Orbit Engine Initializing...");
    
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

    let scene, camera, renderer, group, controls;
    const container = document.getElementById('specs-orbit-container');

    if (!container) {
        console.error("Specs container not found!");
        return;
    }

    function createLabelTexture(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use a generic sans-serif fallback if Teko isn't ready
        ctx.font = 'bold 40px "Teko", "Oswald", sans-serif';
        ctx.fillStyle = '#ff4655';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        return new THREE.CanvasTexture(canvas);
    }

    function init() {
        console.log("Starting Three.js Scene...");
        
        scene = new THREE.Scene();
        
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 600;
        
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 20;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        console.log("Renderer appended.");

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;

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
            textureLoader.load(data.url, (texture) => {
                const planeMat = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    transparent: true,
                    side: THREE.DoubleSide
                });
                const mesh = new THREE.Mesh(planeGeo, planeMat);
                mesh.position.set(x, y, z);
                mesh.lookAt(new THREE.Vector3(0, y, 0));
                mesh.rotateY(Math.PI);
                group.add(mesh);
            });

            // Label
            const labelGeo = new THREE.PlaneGeometry(2.5, 0.6);
            const labelMat = new THREE.MeshBasicMaterial({ 
                map: createLabelTexture(data.name),
                transparent: true,
                side: THREE.DoubleSide
            });
            const labelMesh = new THREE.Mesh(labelGeo, labelMat);
            labelMesh.position.set(x, y - (IMAGE_SIZE / 2 + 0.5), z);
            labelMesh.lookAt(new THREE.Vector3(0, y - (IMAGE_SIZE / 2 + 0.5), 0));
            labelMesh.rotateY(Math.PI);
            group.add(labelMesh);
        });

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        console.log("Scene setup complete. Starting animation loop.");
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    // Force init
    init();
})();
