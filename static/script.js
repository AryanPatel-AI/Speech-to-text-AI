const audioInput = document.getElementById('audio');
const dropZone = document.getElementById('drop-zone');
const statusContainer = document.getElementById('status-container');
const statusMessage = document.getElementById('status-message');
const resultContainer = document.getElementById('result-container');
const outputTextarea = document.getElementById('output');

// Mobile Menu Logic
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('active');
    });
}

// Close menu when clicking links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) navToggle.classList.remove('open');
        if (navLinks) navLinks.classList.remove('active');
    });
});

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
    resultContainer.style.display = 'none';
    statusContainer.style.display = 'block';
    statusMessage.innerText = 'Uploading to neural net...';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to upload audio');
        }

        statusMessage.innerText = 'Analyzing audio signatures...';
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
            statusContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            outputTextarea.value = data.text;
            
            // Allow another upload by revealing the drop zone again
            const newUploadLabel = document.createElement('div');
            newUploadLabel.innerHTML = '<br><button onclick="location.reload()" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:8px 16px; border-radius:8px; cursor:pointer;" onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'transparent\'">Transcribe Another File</button>';
            resultContainer.appendChild(newUploadLabel);

        } else if (data.status === 'failed') {
            showError(`Transcription failed: ${data.error}`);
        } else {
            // Still Processing
            // Update message randomly to show activity
            const msgs = ['Extracting features...', 'Running decoder...', 'Decoding tensors...', 'Analyzing audio signatures...'];
            if(Math.random() > 0.7) {
                statusMessage.innerText = msgs[Math.floor(Math.random() * msgs.length)];
            }
            setTimeout(() => pollStatus(jobId), 2000);
        }
    } catch (error) {
        showError(`Status check failed: ${error.message}`);
    }
}

function showError(msg) {
    statusContainer.style.display = 'none';
    dropZone.style.display = 'block';
    alert(msg);
}

document.getElementById('download-btn').addEventListener('click', () => {
    const text = outputTextarea.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('copy-btn').addEventListener('click', () => {
    outputTextarea.select();
    document.execCommand('copy');
    const btn = document.getElementById('copy-btn');
    btn.innerText = '✅ Copied';
    setTimeout(() => btn.innerText = '📋', 2000);
});