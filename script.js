document.addEventListener('DOMContentLoaded', () => {
    const enterScreen = document.getElementById('enter-screen');
    const mainContent = document.getElementById('main-content');
    const typewriterElement = document.getElementById('typewriter');
    
    const textToType = "velocity!!";
    const typingSpeed = 100;
    const DISCORD_USER_ID = "1428576132793499650";

    const viewsElement = document.getElementById('views');
    const statusIndicator = document.querySelector('.status-indicator');

    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let particleCount = 150;
    
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
            
            update() {
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.baseVx = -this.baseVx;
                    this.vx = -this.vx;
                }
                if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                    this.baseVy = -this.baseVy;
                    this.vy = -this.vy;
                }
    
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        
                        this.vx -= forceDirectionX * force * 1.5;
                        this.vy -= forceDirectionY * force * 1.5;
                    }
                }
                
                this.vx += (this.baseVx - this.vx) * 0.04;
                this.vy += (this.baseVy - this.vy) * 0.04;
                
                this.x += this.vx;
                this.y += this.vy;
            }
        }
    
        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
    
        function updateParticleCount(newCount) {
             if (newCount > particles.length) {
                 const diff = newCount - particles.length;
                 for(let i = 0; i < diff; i++) {
                     particles.push(new Particle());
                 }
             } else if (newCount < particles.length) {
                 particles.splice(newCount);
             }
        }

        const particleSlider = document.getElementById('particle-slider');
        const particleDisplay = document.getElementById('particle-count-display');
        if (particleSlider) {
            particleSlider.value = particleCount;
            if (particleDisplay) particleDisplay.textContent = particleCount;
            particleSlider.addEventListener('input', (e) => {
                particleCount = parseInt(e.target.value);
                updateParticleCount(particleCount);
                if (particleDisplay) particleDisplay.textContent = particleCount;
            });
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            // WebKit path-limit batching (drops paths if over 64k entries)
            const chunk = 1000;
            for (let i = 0; i < particles.length; i += chunk) {
                ctx.beginPath();
                for (let j = i; j < i + chunk && j < particles.length; j++) {
                    let p = particles[j];
                    p.update();
                    ctx.moveTo(p.x, p.y);
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            
            // Connect lines ONLY for a clamped number of particles to simulate the mesh network.
            // If we check all 50,000 against each other it creates 1.25 BILLION loop checks and instantly crashes memory.
            ctx.lineWidth = 1;
            const lineLimit = Math.min(particles.length, 300);
            for (let i = 0; i < lineLimit; i++) {
                for (let j = i + 1; j < lineLimit; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance/120) * 0.5})`;
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

    let hasEntered = false;

    if (enterScreen) {
        enterScreen.addEventListener('click', (e) => {
            if (hasEntered) return;
            hasEntered = true;

            const ripple = document.createElement('div');
            ripple.className = 'enter-ripple';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            enterScreen.appendChild(ripple);

            const enterText = enterScreen.querySelector('.enter-text');
            if (enterText) enterText.style.opacity = '0';

            const targetVolume = parseFloat(volumeSlider.value);
            audio.volume = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    playPauseBtn.classList.remove('fa-play');
                    playPauseBtn.classList.add('fa-pause');
                    albumArt.classList.add('playing');
                    
                    let currentVol = 0;
                    const fadeStep = targetVolume / 25;
                    const fadeInterval = setInterval(() => {
                        currentVol += fadeStep;
                        if (currentVol >= targetVolume || currentVol >= 1) {
                            audio.volume = targetVolume;
                            clearInterval(fadeInterval);
                        } else {
                            audio.volume = currentVol;
                        }
                    }, 20);
                }).catch(err => console.log('Autoplay blocked', err));
            }

            setTimeout(() => {
                enterScreen.style.opacity = '0';
                enterScreen.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    enterScreen.style.display = 'none';
                    
                    startTypewriterText();
                    triggerViewCounter();
                    fetchDiscordData();
                }, 400); 
            }, 500); 
        });
    }
    
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

    function triggerViewCounter() {
        fetch('https://api.counterapi.dev/v1/velocityzz/velocity_profile_views/up')
            .then(res => res.json())
            .then(data => {
                const count = data.count || 1337;
                triggerPopUp(count);
            })
            .catch(error => {
                triggerPopUp(1337);
            });
            
        function triggerPopUp(finalNumber) {
            setTimeout(() => {
                viewsElement.parentElement.classList.add('pop-up-anim');
                
                let duration = 2500;
                let start = null;
                
                function step(timestamp) {
                    if (!start) start = timestamp;
                    let progress = (timestamp - start) / duration;
                    if (progress > 1) progress = 1;
                    
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
            }, 500);
        }
    }

    function formatViews(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    async function fetchDiscordData() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const json = await response.json();
            
            if (json.success) {
                const statusColor = {
                    online: '#23a559',
                    idle: '#f1c40f',
                    dnd: '#f04747',
                    offline: '#747f8d'
                };
                statusIndicator.style.backgroundColor = statusColor[json.data.discord_status] || statusColor.offline;
            }
        } catch (e) {
        }
    }

    const audio = document.getElementById('bg-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const albumArt = document.getElementById('album-art');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    const volumeSlider = document.getElementById('global-volume-slider');
    const muteBtn = document.getElementById('global-mute-btn');

    let isPlaying = false;

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.classList.remove('fa-pause');
            playPauseBtn.classList.add('fa-play');
            albumArt.classList.remove('playing');
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    playPauseBtn.classList.remove('fa-play');
                    playPauseBtn.classList.add('fa-pause');
                    albumArt.classList.add('playing');
                }).catch(error => {
                });
            }
        }
        isPlaying = !isPlaying;
    }

    playPauseBtn.addEventListener('click', () => {
        isPlaying = !audio.paused; 
        togglePlay();
    });

    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        if (sec < 10) sec = '0' + sec;
        return min + ':' + sec;
    }

    function updateAudioMeta() {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
            totalTimeEl.textContent = formatTime(audio.duration);
            seekSlider.max = Math.floor(audio.duration);
        }
    }

    if (audio.readyState >= 1) {
        updateAudioMeta();
    } else {
        audio.addEventListener('loadedmetadata', updateAudioMeta);
        audio.addEventListener('durationchange', updateAudioMeta);
    }

    audio.addEventListener('timeupdate', () => {
        if (!seekSlider.active) {
            seekSlider.value = Math.floor(audio.currentTime);
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    seekSlider.addEventListener('input', () => {
        seekSlider.active = true;
        currentTimeEl.textContent = formatTime(seekSlider.value);
    });
    seekSlider.addEventListener('change', () => {
        audio.currentTime = seekSlider.value;
        seekSlider.active = false;
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
        updateVolumeIcon();
    });
    
    let lastVolume = 0.5;
    muteBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            lastVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
        } else {
            audio.volume = lastVolume > 0 ? lastVolume : 0.5;
            volumeSlider.value = audio.volume;
        }
        updateVolumeIcon();
    });

    function updateVolumeIcon() {
        muteBtn.className = '';
        if (audio.volume === 0) {
            muteBtn.className = 'fa-solid fa-volume-xmark';
        } else if (audio.volume < 0.5) {
            muteBtn.className = 'fa-solid fa-volume-low';
        } else {
            muteBtn.className = 'fa-solid fa-volume-high';
        }
    }

});
