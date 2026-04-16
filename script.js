document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const typewriterElement = document.getElementById('typewriter');
    
    // Config
    const textToType = "velocity!!";
    const typingSpeed = 100; // ms per char
    const DISCORD_USER_ID = "1428576132793499650"; // User's numerical Discord ID

    // Elements
    const viewsElement = document.getElementById('views');
    const statusIndicator = document.querySelector('.status-indicator');

    // Create Canvas Particles Constellation
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 80;
    
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    
        const mouse = { x: null, y: null, radius: 150 };
    
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });
    
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseVx = (Math.random() - 0.5) * 1.5;
                this.baseVy = (Math.random() - 0.5) * 1.5;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
            }
            
            update() {
                // Bounce off walls
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.baseVx = -this.baseVx;
                    this.vx = -this.vx;
                }
                if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                    this.baseVy = -this.baseVy;
                    this.vy = -this.vy;
                }
    
                // Mouse interaction
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        
                        // Push loosely AWAY from mouse
                        this.vx -= forceDirectionX * force * 1.5;
                        this.vy -= forceDirectionY * force * 1.5;
                    }
                }
                
                // Drag back to natural floating velocity
                this.vx += (this.baseVx - this.vx) * 0.04;
                this.vy += (this.baseVy - this.vy) * 0.04;
                
                this.x += this.vx;
                this.y += this.vy;
                
                this.draw();
            }
        }
    
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
    
        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                
                // Draw connecting lines
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance/120) * 0.5})`; // Max opacity 0.5
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        initParticles();
        animateParticles();
    }

    // 1. Initial Page Load Events
    setTimeout(() => {
        startTypewriterText();
        triggerViewCounter();
        fetchDiscordData();
    }, 50);
    
    function startTypewriterText() {
        let i = 0;
        typewriterElement.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        
        function typeWriter() {
            if (i < textToType.length) {
                typewriterElement.textContent = textToType.substring(0, i + 1);
                typewriterElement.appendChild(cursor);
                i++;
                setTimeout(typeWriter, typingSpeed);
            }
        }
        setTimeout(typeWriter, 500);
    }

    // 2. View Counter Logic
    function triggerViewCounter() {
        fetch('https://api.counterapi.dev/v1/velocityzz/velocity_profile_views/up')
            .then(res => res.json())
            .then(data => {
                const count = data.count || 1337;
                triggerPopUp(count);
            })
            .catch(error => {
                console.error("View counter failed", error);
                triggerPopUp(1337);
            });
            
        function triggerPopUp(finalNumber) {
            setTimeout(() => {
                // Now Pop Up the counter container
                viewsElement.parentElement.classList.add('pop-up-anim');
                
                // Animate count up from 0 to finalNumber
                let duration = 2500; // 2.5 seconds counting up
                let start = null;
                
                function step(timestamp) {
                    if (!start) start = timestamp;
                    let progress = (timestamp - start) / duration;
                    if (progress > 1) progress = 1;
                    
                    // Smoother quartic ease-out
                    let easeOut = 1 - Math.pow(1 - progress, 4);
                    
                    let currentVal = Math.floor(easeOut * finalNumber);
                    viewsElement.innerText = formatViews(currentVal);
                    
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        viewsElement.innerText = formatViews(finalNumber);
                    }
                }
                
                requestAnimationFrame(step);
                
                setTimeout(() => {
                    viewsElement.parentElement.classList.remove('pop-up-anim');
                }, 500);
            }, 500); // Small 500ms delay after page load to pop up
        }
    }

    function formatViews(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 3. Discord API Data
    async function fetchDiscordData() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const json = await response.json();
            
            if (json.success) {
                // We only update the status indicator light now since PFP and Bio are manually set!
                const statusColor = {
                    online: '#23a559',
                    idle: '#f1c40f',
                    dnd: '#f04747',
                    offline: '#747f8d'
                };
                statusIndicator.style.backgroundColor = statusColor[json.data.discord_status] || statusColor.offline;
            }
        } catch (e) {
            console.error("Failed to fetch Discord data via Lanyard.", e);
        }
    }
});
