class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    this.closeEnoughTarget = 100;
    this.maxSpeed = 1.0;
    this.maxForce = 0.1;
    this.particleSize = 6;
    this.isKilled = false;

    this.startColor = { r: 0, g: 0, b: 0 };
    this.targetColor = { r: 0, g: 0, b: 0 };
    this.colorWeight = 0;
    this.colorBlendRate = 0.01;
  }

  move() {
    let proximityMult = 1;
    const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2));

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget;
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };

    const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y);
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    };

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce;
      steer.y = (steer.y / steerMagnitude) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx, drawAsPoints) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    }

    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    };

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(width, height) {
    if (!this.isKilled) {
      const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2, width, height);
      this.target.x = randomPos.x;
      this.target.y = randomPos.y;

      // REMOVED: No longer fading to black. Particles keep their word color as they fly away.
      this.isKilled = true;
    }
  }

  generateRandomPos(x, y, mag, width, height) {
    const randomX = Math.random() * width;
    const randomY = Math.random() * height;

    const direction = {
      x: randomX - x,
      y: randomY - y,
    };

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag;
      direction.y = (direction.y / magnitude) * mag;
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    };
  }
}

class ParticleEffect {
  constructor(canvasId, words) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.words = words;
    this.wordIndex = 0;
    this.particles = [];
    this.pixelSteps = 1; // RESTORED: Maximum density for solid letters
    this.drawAsPoints = true;
    this.frameCount = 0;
    this.mouse = { x: 0, y: 0, isPressed: false, isRightClick: false };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.isPressed = true;
      this.mouse.isRightClick = e.button === 2;
    });
    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isPressed = false;
      this.mouse.isRightClick = false;
    });
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.nextWord(this.words[0]);
    this.animate();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  generateRandomPos(x, y, mag) {
    const randomX = Math.random() * this.canvas.width;
    const randomY = Math.random() * this.canvas.height;

    const direction = {
      x: randomX - x,
      y: randomY - y,
    };

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag;
      direction.y = (direction.y / magnitude) * mag;
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    };
  }

  nextWord(word) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this.canvas.width;
    offscreenCanvas.height = this.canvas.height;
    const offCtx = offscreenCanvas.getContext('2d');

    // Responsive font size: Even more conservative for mobile to avoid clipping
    const isMobile = window.innerWidth <= 768;
    const fontSize = isMobile ? Math.min(this.canvas.width / 14, 32) : Math.min(this.canvas.width / 10, 80);
    offCtx.fillStyle = 'white';
    offCtx.font = `800 ${fontSize}px Rajdhani, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(word, this.canvas.width / 2, this.canvas.height / 2);

    const imageData = offCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    // Theme Red (#ff4655) with slight variation for depth
    const newColor = {
      r: 255,
      g: 70 + (Math.random() - 0.5) * 20,
      b: 85 + (Math.random() - 0.5) * 20,
    };

    const particles = this.particles;
    let particleIndex = 0;

    // SYNC: Update ALL existing particles to the new color immediately
    particles.forEach(p => {
        p.startColor = {
            r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight,
            g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight,
            b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight,
        };
        p.targetColor = newColor;
        p.colorWeight = 0;
    });

    // Collect coordinates
    const coordsIndexes = [];
    for (let i = 0; i < pixels.length; i += this.pixelSteps * 4) {
      coordsIndexes.push(i);
    }

    // Shuffle coordinates for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
    }

    for (const coordIndex of coordsIndexes) {
      const alpha = pixels[coordIndex + 3];

      if (alpha > 0) {
        const x = (coordIndex / 4) % this.canvas.width;
        const y = Math.floor(coordIndex / 4 / this.canvas.width);

        let particle;
        if (particleIndex < this.particles.length) {
          particle = this.particles[particleIndex];
          particle.isKilled = false;
          particleIndex++;
        } else {
          particle = new Particle();
          const randPos = this.generateRandomPos(this.canvas.width / 2, this.canvas.height / 2, (this.canvas.width + this.canvas.height) / 2);
          particle.pos.x = randPos.x;
          particle.pos.y = randPos.y;

          particle.maxSpeed = Math.random() * 4 + 8; // Faster: 8-12 speed
          particle.maxForce = particle.maxSpeed * 0.08; // More agile
          particle.particleSize = Math.random() * 6 + 6;
          particle.colorBlendRate = Math.random() * 0.03 + 0.02; // Faster color change: ~1-1.5s
          this.particles.push(particle);
        }

        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        };
        particle.targetColor = newColor;
        particle.colorWeight = 0;

        particle.target.x = x;
        particle.target.y = y;
      }
    }

    for (let i = particleIndex; i < this.particles.length; i++) {
      this.particles[i].kill(this.canvas.width, this.canvas.height);
    }
  }

  animate() {
    // REFINED: Transparent fading that maintains background integrity
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fades old trails to transparency
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'source-over';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.move();
      p.draw(this.ctx, this.drawAsPoints);

      if (p.isKilled && (p.pos.x < 0 || p.pos.x > this.canvas.width || p.pos.y < 0 || p.pos.y > this.canvas.height)) {
        this.particles.splice(i, 1);
      }
    }

    if (this.mouse.isPressed && this.mouse.isRightClick) {
      this.particles.forEach(p => {
        const d = Math.sqrt(Math.pow(p.pos.x - this.mouse.x, 2) + Math.pow(p.pos.y - this.mouse.y, 2));
        if (d < 50) p.kill(this.canvas.width, this.canvas.height);
      });
    }

    this.frameCount++;
    if (this.frameCount % 180 === 0) { // Cycle every 3 seconds at 60fps
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      this.nextWord(this.words[this.wordIndex]);
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleEffect('particle-canvas', ["HELLO", "Looking For", "Nice One", "Baby!", "HAHAHAHA"]);
});
