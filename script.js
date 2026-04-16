document.addEventListener('DOMContentLoaded', () => {
    const enterScreen = document.getElementById('enter-screen');
    const mainContent = document.getElementById('main-content');
    const typewriterElement = document.getElementById('typewriter');
    
    // Config
    const textToType = "velocity!!";
    const typingSpeed = 100; // ms per char
    const DISCORD_USER_ID = "1428576132793499650"; // User's numerical Discord ID

    // Elements
    const viewsElement = document.getElementById('views');
    const statusIndicator = document.querySelector('.status-indicator');

    // 1. Enter Screen logic
    let hasEntered = false;
    enterScreen.addEventListener('click', () => {
        if (hasEntered) return;
        hasEntered = true;
        
        enterScreen.style.opacity = '0';
        setTimeout(() => {
            enterScreen.style.display = 'none';
            mainContent.style.display = 'flex';
            
            setTimeout(() => {
                mainContent.style.opacity = '1';
                startTypewriterText();
                
                // Trigger view counter animation & fetch AFTER entering
                triggerViewCounter();
                fetchDiscordData();
                
            }, 50);
        }, 1000);
    });
    
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

    // 2. View Counter Logic (Falling animation)
    function triggerViewCounter() {
        // Animate falling fake number IMMEDIATELY so it always shows
        const fallingNumber = document.createElement('div');
        fallingNumber.className = 'falling-number';
        fallingNumber.innerText = "0"; // The one before it pops up
        document.body.appendChild(fallingNumber);

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
            // Wait for it to fall down into the void
            setTimeout(() => {
                if (document.body.contains(fallingNumber)) {
                    fallingNumber.remove();
                }
                
                // Now Pop Up the counter container
                viewsElement.parentElement.classList.add('pop-up-anim');
                
                // Animate count up from 0 to finalNumber
                let current = 0;
                let duration = 1500; // 1.5 seconds counting up
                let start = null;
                
                function step(timestamp) {
                    if (!start) start = timestamp;
                    let progress = (timestamp - start) / duration;
                    if (progress > 1) progress = 1;
                    
                    // Ease out quadratic
                    let easeOut = 1 - Math.pow(1 - progress, 3);
                    
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
            }, 1200); // 1.2s is the duration of fallDownIntoVoid
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
