class Vector {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
    }
    add(v) { 
        this.x += v.x; 
        this.y += v.y; 
        return this; 
    }
    sub(v) { 
        this.x -= v.x; 
        this.y -= v.y; 
        return this; 
    }
    mul(n) { 
        this.x *= n; 
        this.y *= n; 
        return this; 
    }
    div(n) { 
        if (n !== 0) { 
            this.x /= n; 
            this.y /= n; 
        } 
        return this; 
    }

    mag() { 
        return Math.sqrt(this.x * this.x + this.y * this.y); 
    }
    setMag(n) { 
        return this.normalize().mul(n); 
    }
    normalize() { 
        const m = this.mag(); 
        if (m > 0) this.div(m); 
        return this; 
    }
    limit(max) { 
        if (this.mag() > max) 
            this.setMag(max); 
        return this; 
    }
    static dist(v1, v2) {
        return Math.hypot(v1.x - v2.x, v1.y - v2.y); 
    }
    clone() { 
        return new Vector(this.x, this.y); 
    }
}

class Particle {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.vel = new Vector((Math.random()-0.5)*4, (Math.random()-0.5)*4);
        this.life = 1.0;
    }
    update() { 
        this.pos.add(this.vel); 
        this.life -= 0.03; 
    }
    draw(ctx) { 
        ctx.fillStyle = `rgba(255, 0, 85, ${this.life})`; 
        ctx.beginPath(); 
        ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI*2); 
        ctx.fill(); 
    }
}

class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector((Math.random()-0.5)*4, (Math.random()-0.5)*4);
        this.acceleration = new Vector(0, 0);
        this.size = 3;
        this.color = `hsl(${160 + Math.random()*60}, 100%, 60%)`;
    }
    applyForce(f) { this.acceleration.add(f); }
    update(config) {
        this.velocity.add(this.acceleration).limit(config.maxSpeed);
        this.position.add(this.velocity); this.acceleration.mul(0);
        if (this.position.x > canvas.width) this.position.x = 0; 
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0; 
        if (this.position.y < 0) this.position.y = canvas.height;
    }
    flock(boids, config, foods, obstacles, predators) {
        let sep = new Vector(0,0), 
        ali = new Vector(0,0), 
        coh = new Vector(0,0);
        let total = 0;
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (other !== this && d < config.perceptionRadius) {
                let diff = this.position.clone().sub(other.position).div(d*d);
                sep.add(diff); 
                ali.add(other.velocity); 
                coh.add(other.position); 
                total++;
            }
        }
        if (total > 0) {
            sep.div(total).setMag(config.maxSpeed).sub(this.velocity).limit(config.maxForce * 1.5);
            ali.div(total).setMag(config.maxSpeed).sub(this.velocity).limit(config.maxForce);
            coh.div(total).sub(this.position).setMag(config.maxSpeed).sub(this.velocity).limit(config.maxForce);
            this.applyForce(sep); 
            this.applyForce(ali); 
            this.applyForce(coh);
        }
        predators.forEach(p => { 
            if(
                Vector.dist(this.position, p.position) < 100
            ) 
            this.applyForce(
                this.position.clone().sub(p.position).setMag(config.maxSpeed).limit(config.maxForce * 4)); 
            });
        foods.forEach((f, i) => { 
            if(Vector.dist(this.position, f) < 15) { 
                foods.splice(i, 1); 
                updateScore(10); 
            } else if(
                Vector.dist(this.position, f) < 100) this.applyForce(f.clone().sub(this.position).setMag(config.maxSpeed).limit(config.maxForce*2)); });
        obstacles.forEach((o, i) => { 
            if(Vector.dist(this.position, o) < o.r + 30) { 
                this.applyForce(this.position.clone().sub(new Vector(o.x, o.y)).setMag(config.maxSpeed).limit(config.maxForce*4)); 
                if(Vector.dist(this.position, o) < o.r+5) { 
                    o.health -= 2; 
                    if(o.health <= 0) { 
                        obstacles.splice(i,1); 
                        updateScore(5); 
                        for(let k=0; k<8; k++) pEffects.push(new Particle(o.x, o.y)); 
                    } 
                } 
            } 
        });
    }
    draw(ctx) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save(); 
        ctx.translate(this.position.x, this.position.y); 
        ctx.rotate(angle);
        ctx.shadowBlur = 12; 
        ctx.shadowColor = this.color; 
        ctx.fillStyle = this.color;
        ctx.beginPath(); 
        ctx.moveTo(this.size*3, 0); 
        ctx.lineTo(-this.size, this.size); 
        ctx.lineTo(-this.size, -this.size); 
        ctx.fill(); 
        ctx.restore();
    }
}

class Predator extends Boid {
    constructor(x, y) { 
        super(x, y); 
        this.color = "#ff0055"; 
        this.size = 6; 
    }
    hunt(boids) {
        let closest = null, 
        minDist = 300;
        boids.forEach(b => { 
            let d = Vector.dist(this.position, b.position); 
            if(d < minDist) {
                 minDist = d; 
                 closest = b; 
            } 
        });
        if (closest) {
            this.applyForce(closest.position.clone().sub(this.position).setMag(3.5).limit(0.1));
            if (minDist < 12) { 
                boids.splice(boids.indexOf(closest), 1); 
                updateScore(-20); 
                for(
                    let k=0; 
                    k<10; 
                    k++
                ) {
                    pEffects.push(new Particle(closest.position.x, closest.position.y)); 
                }
            }
        }
    }
}

const canvas = document.getElementById('canvas'), 
ctx = canvas.getContext('2d');
let boids = [], 
foods = [], 
obstacles = [], 
pEffects = [], 
predators = [];
let score = 0, 
highScore = localStorage.getItem('boids_pro_hs') || 0;
let currentTool = 'food', 
isDrawing = false, 
isStormy = false, 
isNight = false;
const config = { maxSpeed: 4, maxForce: 0.1, perceptionRadius: 50 };

function init() {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
    boids = Array.from({length: 120}, () => new Boid(Math.random()*canvas.width, Math.random()*canvas.height));
    predators = [
        new Predator(100, 100), 
        new Predator(canvas.width-100, canvas.height-100)
    ];
    document.getElementById('high-score').innerText = highScore;
}

function updateScore(p) { 
    score += p; 
    document.getElementById('current-score').innerText = score; 
    if (score > highScore) { 
        highScore = score; 
        localStorage.setItem('boids_pro_hs', highScore); 
        document.getElementById('high-score').innerText = highScore; 
    } 
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)'; 
    ctx.lineWidth = 0.5;
    for (let x=0; x<canvas.width; x+=60) { 
        ctx.beginPath(); 
        ctx.moveTo(x,0); 
        ctx.lineTo(x,canvas.height); 
        ctx.stroke(); 
    }
    for (let y=0; y<canvas.height; y+=60) { 
        ctx.beginPath(); 
        ctx.moveTo(0,y); 
        ctx.lineTo(canvas.width,y); 
        ctx.stroke(); 
    }
}

function animate() {
    ctx.fillStyle = isNight ? 'rgba(5, 5, 15, 0.4)' : 'rgba(5, 5, 15, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    if (isStormy) {
        let center = new Vector(canvas.width/2, canvas.height/2);
        boids.forEach(b => b.applyForce(new Vector(-(b.position.y-center.y), b.position.x-center.x).setMag(0.4)));
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'; 
        ctx.beginPath(); 
        ctx.arc(center.x, center.y, 150, 0, Math.PI*2); 
        ctx.stroke();
    }

    foods.forEach(f => { 
        ctx.shadowBlur = 15; 
        ctx.shadowColor = "#fffb00"; ctx.fillStyle = "#fffb00"; 
        ctx.beginPath(); 
        ctx.arc(f.x, f.y, 4, 0, Math.PI*2); 
        ctx.fill(); 
    });

    obstacles.forEach(o => { 
        ctx.shadowBlur = 10; 
        ctx.shadowColor = "#00ffff"; 
        ctx.strokeStyle = `rgba(0, 255, 255, ${o.health/100})`; 
        ctx.lineWidth = 2; 
        ctx.beginPath(); 
        ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); 
        ctx.stroke(); 
    });

    pEffects = pEffects.filter(p => p.life > 0); 
    pEffects.forEach(p => { 
        p.update(); 
        p.draw(ctx); 
    });

    predators.forEach(p => { 
        p.hunt(boids); 
        p.update(config); 
        p.draw(ctx); 
    });

    boids.forEach(b => { 
        b.flock(boids, config, foods, obstacles, predators); 
        b.update(config); 
        b.draw(ctx); 
    });

    requestAnimationFrame(animate);
}

// UI & Events
window.addEventListener('load', () => setTimeout(() => { 
    document.getElementById('loader').style.display='none'; 
    document.getElementById('help-modal').style.display='block'; 
}, 2000));
document.getElementById('start-game').onclick = () => document.getElementById('help-modal').style.display='none';
document.getElementById('tool-food').onclick = () => { 
    currentTool='food'; 
    document.getElementById('tool-food').classList.add('active'); 
    document.getElementById('tool-wall').classList.remove('active'); 
};
document.getElementById('tool-wall').onclick = () => { 
    currentTool='wall'; 
    document.getElementById('tool-wall').classList.add('active'); 
    document.getElementById('tool-food').classList.remove('active'); 
};
document.getElementById('btn-storm').onclick = function() { 
    isStormy=!isStormy; 
    this.classList.toggle('active'); 
};
document.getElementById('btn-night').onclick = function() { 
    isNight=!isNight; 
    this.classList.toggle('active'); 
    canvas.classList.toggle('night-mode'); 
    config.perceptionRadius=isNight?25:50; 
};
document.getElementById('reset-btn').onclick = () => { 
    score=0; 
    foods=[]; 
    obstacles=[]; 
    init(); 
};
document.getElementById('speed').oninput = (e) => config.maxSpeed = parseFloat(e.target.value);
document.getElementById('help-btn').onclick = () => document.getElementById('help-modal').style.display='block';
document.getElementById('close-help').onclick = () => document.getElementById('help-modal').style.display='none';

const getPos = (e) => ({ 
    x: (e.touches?e.touches[0]:e).clientX, 
    y: (e.touches?e.touches[0]:e).clientY 
});
canvas.addEventListener('mousedown', () => isDrawing=true);
window.addEventListener('mouseup', () => isDrawing=false);
canvas.addEventListener('mousemove', (e) => { 
    if(isDrawing && currentTool==='wall') obstacles.push({
        x: e.clientX, 
        y: e.clientY, 
        r: 15, 
        health: 100
    }); 
});
canvas.addEventListener('click', (e) => { 
    if(currentTool==='food') foods.push(new Vector(e.clientX, e.clientY)); 
});
canvas.addEventListener('touchstart', (e) => { 
    isDrawing=true; 
    let p=getPos(e); 
    if(
        currentTool==='food'
    ) 
    foods.push(new Vector(p.x, p.y));
    
    e.preventDefault(); 
}, 
{passive:false});
canvas.addEventListener('touchmove', (e) => { 
    if(isDrawing && currentTool==='wall') { 
        let p=getPos(e); 
        obstacles.push({x:p.x, y:p.y, r:15, health:100}); 
    } 
    e.preventDefault(); 
}, 
{passive:false});
window.addEventListener('resize', () => { 
    canvas.width=window.innerWidth; 
    canvas.height=window.innerHeight; 
});

init(); animate();