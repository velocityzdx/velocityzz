document.addEventListener('DOMContentLoaded', () => {
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
        const particleCount = 150;
    
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
                
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance/120) * 0.5})`;
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
        if (isNaN(seconds)) return "0:00";
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        if (sec < 10) sec = '0' + sec;
        return min + ':' + sec;
    }

    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
        seekSlider.max = Math.floor(audio.duration);
    });

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

    setTimeout(() => {
        audio.volume = volumeSlider.value;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                isPlaying = true;
                playPauseBtn.classList.remove('fa-play');
                playPauseBtn.classList.add('fa-pause');
                albumArt.classList.add('playing');
            }).catch(error => {
            });
        }
    }, 100);

});
