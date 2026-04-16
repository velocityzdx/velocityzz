document.addEventListener('DOMContentLoaded', () => {
    const enterScreen = document.getElementById('enter-screen');
    const mainContent = document.getElementById('main-content');
    const typewriterElement = document.getElementById('typewriter');
    
    // Config
    const textToType = "velocity!!";
    const typingSpeed = 100; // ms per char
    const DISCORD_USER_ID = "YOUR_DISCORD_ID_HERE"; // Please replace with your numerical Discord ID!

    // Elements
    const avatarImg = document.querySelector('.avatar');
    const bioText = document.querySelector('.bio');
    const viewsElement = document.getElementById('views');
    const statusIndicator = document.querySelector('.status-indicator');

    // 1. Enter Screen logic
    enterScreen.addEventListener('click', () => {
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
    async function triggerViewCounter() {
        try {
            // Fetch view count from a free counter API
            const res = await fetch('https://api.counterapi.dev/v1/velocityzz/velocity_profile_views/up');
            const data = await res.json();
            const count = data.count || 1337;
            
            const formattedCount = formatViews(count);

            // Animate falling old/fake number
            const fallingNumber = document.createElement('div');
            fallingNumber.className = 'falling-number';
            fallingNumber.innerText = formatViews(count - 1);
            document.body.appendChild(fallingNumber);

            // Wait for it to fall down into the void
            setTimeout(() => {
                fallingNumber.remove();
                
                // Now Pop Up the new number in the counter
                viewsElement.innerText = formattedCount;
                viewsElement.parentElement.classList.add('pop-up-anim');
                
                setTimeout(() => {
                    viewsElement.parentElement.classList.remove('pop-up-anim');
                }, 500);
            }, 1200); // Wait for fall animation to finish

        } catch (error) {
            console.error("View counter failed", error);
            viewsElement.innerText = "1,337";
        }
    }

    function formatViews(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 3. Discord API (via Lanyard API since direct client-side Discord API requires bot token)
    async function fetchDiscordData() {
        if(DISCORD_USER_ID === "YOUR_DISCORD_ID_HERE") {
            console.warn("Please add your discord ID to the script!");
            return;
        }
        
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const json = await response.json();
            
            if (json.success) {
                const d = json.data.discord_user;
                // Update Avatar
                if (d.avatar) {
                    const avatarUrl = `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=512`;
                    avatarImg.src = avatarUrl;
                }
                
                // Note: Lanyard doesn't return the "bio/about me" unfortunately, it's a limitation of Discord's presence API.
                // It does return Activities (Status, Spotify, Games). We can show status color!
                const statusColor = {
                    online: '#23a559',
                    idle: '#f1c40f',
                    dnd: '#f04747',
                    offline: '#747f8d'
                };
                statusIndicator.style.backgroundColor = statusColor[json.data.discord_status] || statusColor.offline;

                // Update what you are doing in bio text
                if (json.data.activities && json.data.activities.length > 0) {
                    const activity = json.data.activities[0];
                    if (activity.name === "Spotify") {
                        bioText.innerText = `Listening to ${activity.details} by ${activity.state}`;
                    } else if (activity.type === 0) {
                        bioText.innerText = `Playing ${activity.name}`;
                    } else {
                        bioText.innerText = activity.name;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch Discord data via Lanyard.", e);
        }
    }
});
