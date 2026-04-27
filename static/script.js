// Mobile Menu Logic
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('active');
    });
}

// Typing Animation Logic
const typingText = document.getElementById('typing-text');
if (typingText) {
    const words = ["scribe", "limited"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 150;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 100;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 200;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 3000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
}

// Particle System
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(168, 85, 247, ' : 'rgba(59, 130, 246, ';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add subtle glow to particles
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color === 'rgba(168, 85, 247, ' ? '#a855f7' : '#3b82f6';
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

// Intersection Observer for Fade-in
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Existing App Logic (Safety Checked)
const audioInput = document.getElementById('audio');
const dropZone = document.getElementById('drop-zone');
const statusContainer = document.getElementById('status-container');
const statusMessage = document.getElementById('status-message');
const resultContainer = document.getElementById('result-container');
const outputTextarea = document.getElementById('output');

if (audioInput && dropZone) {
    // Drag and drop mechanics
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            audioInput.files = files; // Assign files to input
            handleUpload();
        }
    });

    audioInput.addEventListener('change', handleUpload);

    async function handleUpload() {
        if (audioInput.files.length === 0) return;
        
        const file = audioInput.files[0];
        
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/') && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a|mp4|opus|webm)$/i)) {
            showError('Please select a valid audio or video file.');
            audioInput.value = ''; // Reset
            return;
        }

        const formData = new FormData();
        formData.append('audio', file);

        // Update UI states
        dropZone.style.display = 'none';
        if (resultContainer) resultContainer.style.display = 'none';
        if (statusContainer) statusContainer.style.display = 'block';
        if (statusMessage) statusMessage.innerText = 'Uploading to neural net...';

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload audio');
            }

            if (statusMessage) statusMessage.innerText = 'Analyzing audio signatures...';
            pollStatus(data.job_id);
        } catch (error) {
            showError(error.message);
        }
    }

    async function pollStatus(jobId) {
        try {
            const response = await fetch(`/status/${jobId}`);
            const data = await response.json();

            if (data.status === 'done') {
                if (statusContainer) statusContainer.style.display = 'none';
                if (resultContainer) resultContainer.style.display = 'block';
                if (outputTextarea) outputTextarea.value = data.text;
                
                // Allow another upload by revealing the drop zone again
                const newUploadLabel = document.createElement('div');
                newUploadLabel.innerHTML = '<br><button onclick="location.reload()" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:8px 16px; border-radius:8px; cursor:pointer;" onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'transparent\'">Transcribe Another File</button>';
                if (resultContainer) resultContainer.appendChild(newUploadLabel);

            } else if (data.status === 'failed') {
                showError(`Transcription failed: ${data.error}`);
            } else {
                // Still Processing
                const msgs = ['Extracting features...', 'Running decoder...', 'Decoding tensors...', 'Analyzing audio signatures...'];
                if(Math.random() > 0.7 && statusMessage) {
                    statusMessage.innerText = msgs[Math.floor(Math.random() * msgs.length)];
                }
                setTimeout(() => pollStatus(jobId), 2000);
            }
        } catch (error) {
            showError(`Status check failed: ${error.message}`);
        }
    }

    function showError(msg) {
        if (statusContainer) statusContainer.style.display = 'none';
        if (dropZone) dropZone.style.display = 'block';
        alert(msg);
    }
}

// Result Page specific logic
const downloadBtn = document.getElementById('download-btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const text = outputTextarea ? outputTextarea.value : '';
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcription.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        if (outputTextarea) {
            outputTextarea.select();
            document.execCommand('copy');
            copyBtn.innerText = '✅ Copied';
            setTimeout(() => copyBtn.innerText = '📋', 2000);
        }
    });
}