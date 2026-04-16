document.addEventListener('DOMContentLoaded', () => {
    const enterScreen = document.getElementById('enter-screen');
    const mainContent = document.getElementById('main-content');
    const typewriterElement = document.getElementById('typewriter');
    
    // Config
    const textToType = "velocity!!";
    const typingSpeed = 100; // ms per char
    
    enterScreen.addEventListener('click', () => {
        // Fade out enter screen
        enterScreen.style.opacity = '0';
        
        setTimeout(() => {
            enterScreen.style.display = 'none';
            
            // Show main content
            mainContent.style.display = 'flex';
            // Slight delay before fading in to ensure display: flex applies
            setTimeout(() => {
                mainContent.style.opacity = '1';
                startTypewriterText();
            }, 50);
            
        }, 1000); // Wait for fade out transition
    });
    
    function startTypewriterText() {
        let i = 0;
        typewriterElement.innerHTML = '';
        
        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        
        function typeWriter() {
            if (i < textToType.length) {
                // Insert text before cursor
                typewriterElement.textContent = textToType.substring(0, i + 1);
                typewriterElement.appendChild(cursor);
                i++;
                setTimeout(typeWriter, typingSpeed);
            }
        }
        
        // Start typing after a short delay for better effect
        setTimeout(typeWriter, 500);
    }
    
    // Simulate view counter increment randomly (just for visual effect)
    const viewsElement = document.getElementById('views');
    let currentViews = parseViews(viewsElement.innerText);
    
    setInterval(() => {
        if(Math.random() > 0.7) { // 30% chance to increment every 3 seconds
            currentViews += Math.floor(Math.random() * 3) + 1;
            viewsElement.innerText = formatViews(currentViews);
        }
    }, 3000);
    
    function parseViews(str) {
        return parseInt(str.replace(/,/g, ''));
    }
    
    function formatViews(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});
