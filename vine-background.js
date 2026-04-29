/**
 * Living Vine Background
 * Adapted from React component for plain JS
 */
class LivingVine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.vineColor = "rgba(255, 70, 85, 0.8)";
        this.branchColor = "rgba(255, 70, 85, 0.6)";
        this.maxBranchLength = 50;
        
        this.mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.pathHistory = [];
        this.branches = [];
        this.destroyed = false;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => this.resize());
        
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    handleMouseMove(e) {
        this.mousePos = { x: e.clientX, y: e.clientY };
        this.pathHistory.push({ ...this.mousePos });
        if (this.pathHistory.length > 100) this.pathHistory.shift();
        
        if (Math.random() > 0.95) {
            this.branches.push(new VineBranch(this.ctx, e.clientX, e.clientY, this.maxBranchLength));
        }
    }

    animate() {
        if (this.destroyed) return;
        
        // Detect touch device
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Use a slightly transparent black to create a trail effect
        // MUCH Faster fade on mobile to keep the screen clear
        const fadeOpacity = isTouch ? 0.8 : 0.15;
        this.ctx.fillStyle = `rgba(15, 25, 35, ${fadeOpacity})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Shorten path history on touch to prevent long zig-zags during scrolling
        const maxHistory = isTouch ? 2 : 100;
        if (this.pathHistory.length > maxHistory) {
            this.pathHistory.shift();
        }

        if (this.pathHistory.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pathHistory[0].x, this.pathHistory[0].y);
            for (let i = 1; i < this.pathHistory.length; i++) {
                this.ctx.lineTo(this.pathHistory[i].x, this.pathHistory[i].y);
            }
            this.ctx.strokeStyle = this.vineColor;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }

        this.branches = this.branches.filter((b) => b.life > 0);
        for (const branch of this.branches) {
            branch.update();
            branch.draw();
        }

        requestAnimationFrame(() => this.animate());
    }
}

class VineBranch {
    constructor(ctx, x, y, maxBranchLength) {
        this.ctx = ctx;
        this.points = [{ x, y }];
        this.life = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.5 + 0.5;
        this.length = 0;
        this.maxLength = maxBranchLength;
    }

    update() {
        if (this.length >= this.maxLength) {
            this.life -= 0.02;
            return;
        }
        this.angle += (Math.random() - 0.5) * 0.2;
        const last = this.points[this.points.length - 1];
        const newX = last.x + Math.cos(this.angle) * this.speed;
        const newY = last.y + Math.sin(this.angle) * this.speed;
        this.points.push({ x: newX, y: newY });
        this.length++;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        // Using theme red with varying opacity
        this.ctx.strokeStyle = `rgba(255, 70, 85, ${this.life * 0.4})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LivingVine('vine-canvas');
});
