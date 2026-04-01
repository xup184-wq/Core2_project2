const modal = document.getElementById('modal');
const mcBtn = document.getElementById('mc');
if (mcBtn) mcBtn.onclick = () => modal.classList.remove('on');
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('on'); });

function openModal(t, d) {
    document.getElementById('mt').textContent = t || '';
    document.getElementById('md').textContent = d || '';
    modal.classList.add('on');
}

const fixedPositions = ["1x1", "1x2", "1x4", "2x2", "2x3", "2x4", "3x1", "3x2", "3x4", "4x1", "4x3"];
const gridImages = ['image/6.png', 'image/3.png', 'image/4.png', 'image/5.png', 'image/8.png'];
const gridOverlay = document.getElementById('gridOverlay');
const gridContainer = document.getElementById('gridContainer');

function initGrid() {
    gridContainer.innerHTML = '';
    let clickableCount = 0;
    for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 4; c++) {
            const pos = `${c}x${r}`;
            const item = document.createElement('div');
            item.className = 'grid-item';
            if (fixedPositions.includes(pos)) {
                item.classList.add('item-fixed');
            } else {
                clickableCount++;
                item.classList.add('item-clickable');
                item.id = `grid-zone-${clickableCount}`;
                const img = document.createElement('img');
                img.src = gridImages[clickableCount - 1] || 'image/placeholder.png';
                item.appendChild(img);
                item.onclick = (e) => {
                    e.stopPropagation();
                    item.classList.toggle('active');
                };
            }
            gridContainer.appendChild(item);
        }
    }
}

document.querySelectorAll('button.btn').forEach(b => {
    b.addEventListener('click', () => {
        if (b.textContent.trim() === "Structure" || b.dataset.t === "Structure") {
            initGrid();
            gridOverlay.classList.add('on');
        }
    });
});

gridOverlay.onclick = (e) => { if (e.target === gridOverlay) gridOverlay.classList.remove('on'); };

const passionBtn = document.querySelector('button.btn[data-t="Passion"]');
if (passionBtn) {
    passionBtn.addEventListener('click', function () {
        this.classList.add('bubble-clicked');
        burstBubbles();
        setTimeout(() => { this.classList.remove('bubble-clicked'); }, 600);
    });
}

function burstBubbles() {
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'bubble-particle';
        const size = Math.random() * (window.innerWidth * 0.05) + 10;
        p.style.width = size + 'px'; p.style.height = size + 'px';
        p.style.left = Math.random() * window.innerWidth + 'px';
        p.style.top = Math.random() * window.innerHeight + 'px';
        document.body.appendChild(p);
        const anim = p.animate([
            { opacity: 0, transform: 'scale(0.5)' },
            { opacity: 1, offset: 0.2 },
            { opacity: 0, transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(1.5)` }
        ], { duration: 2000, fill: 'forwards' });
        anim.onfinish = () => p.remove();
    }
}

const focusBtn = document.getElementById('focusBtn');
const playBtn = document.getElementById('playBtn');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioCtx, analyser, recorder, stream, chunks = [], audioUrl = null, isRecording = false, playCount = 0;

focusBtn.onclick = async function () {
    if (!isRecording) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            isRecording = true;
            this.classList.add('focus-recording');
            canvas.style.display = 'block';
            drawVisualizer();
            recorder = new MediaRecorder(stream);
            chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                audioUrl = URL.createObjectURL(blob);
                playBtn.style.display = 'flex';
                if (window.innerWidth > 768) {
                    const orangeBtn = document.querySelector('.h-orange');
                    if (orangeBtn) {
                        playBtn.style.left = orangeBtn.offsetLeft + (orangeBtn.offsetWidth / 2 - playBtn.offsetWidth / 2) + 'px';
                        playBtn.style.top = (orangeBtn.offsetTop + orangeBtn.offsetHeight + 15) + 'px';
                    }
                } else {
                    playBtn.style.left = "";
                    playBtn.style.top = "";
                }
                setTimeout(() => playBtn.classList.add('show'), 10);
            };
            recorder.start();
        } catch (err) { alert("Mic error"); }
    } else {
        isRecording = false;
        this.classList.remove('focus-recording');
        canvas.style.display = 'none';
        if (recorder) recorder.stop();
        if (stream) stream.getTracks().forEach(t => t.stop());
    }
};

function drawVisualizer() {
    if (!isRecording) return;
    requestAnimationFrame(drawVisualizer);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#6367FF';
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    }
}

playBtn.onclick = () => {
    if (playCount >= 1) {
        playBtn.textContent = "Error";
        playBtn.classList.add('play-error');
        setTimeout(() => { playBtn.classList.remove('play-error'); playBtn.textContent = "Spent"; }, 2000);
        return;
    }
    if (audioUrl) {
        const a = new Audio(audioUrl);
        a.play();
        playCount++;
        playBtn.textContent = "Playing...";
        a.onended = () => { playBtn.textContent = "Spent"; playBtn.style.opacity = "0.5"; };
    }
};

const sw_el = document.getElementById('sw'), sf = document.getElementById('sf'), st = document.getElementById('st');
const charImg = document.getElementById('charImage');
const mindTrigger = document.getElementById('mindTrigger');
const PAD = 4;
let drag = false, ox = 0, startLeft = PAD, unlocked = false, isMindClicked = false;

function getSwMax() { 
    const track = sw_el.querySelector('.slide-track');
    return track.offsetWidth - st.offsetWidth - (PAD * 2); 
}

st.addEventListener('mousedown', swMainStart);
st.addEventListener('touchstart', swMainStart, { passive: true });

function swMainStart(e) {
    drag = true;
    ox = e.touches ? e.touches[0].clientX : e.clientX;
    startLeft = parseInt(st.style.left) || PAD;
    
    st.style.transition = 'none'; 
    sf.style.transition = 'none';
    
    document.addEventListener('mousemove', swMainMove);
    document.addEventListener('mouseup', swMainEnd);
    document.addEventListener('touchmove', swMainMove, { passive: false });
    document.addEventListener('touchend', swMainEnd);
}

function swMainMove(e) {
    if (!drag) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const max = getSwMax();
    const nl = Math.max(PAD, Math.min(startLeft + (cx - ox), max));
    
    st.style.left = nl + 'px';
    sf.style.width = ((nl - PAD) / max * 100) + '%';
    if (!unlocked && nl >= max - 2) {
        unlocked = true;
        sw_el.classList.add('unlocked');
        charImg.style.opacity = "1";
        charImg.style.pointerEvents = "all"; 
    } 
    else if (unlocked && nl <= PAD + 5) {
        lock();
    }
}

function swMainMove(e) {
    if (!drag) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const max = getSwMax();
    const nl = Math.max(PAD, Math.min(startLeft + (cx - ox), max));
    st.style.left = nl + 'px';
    sf.style.width = ((nl - PAD) / max * 100) + '%';
    if (!unlocked && nl >= max - 2) {
        unlocked = true;
        sw_el.classList.add('unlocked');
        charImg.style.opacity = "1";
    } else if (unlocked && nl <= PAD + 5) {
        lock();
    }
}

function swMainEnd() {
    drag = false;
    const max = getSwMax();
    st.style.transition = 'left .3s ease'; sf.style.transition = 'width .3s ease';
    if (!unlocked) { st.style.left = PAD + 'px'; sf.style.width = '0%'; } 
    else { st.style.left = max + 'px'; sf.style.width = '100%'; }
    document.removeEventListener('mousemove', swMainMove);
    document.removeEventListener('mouseup', swMainEnd);
}

function lock() {
    unlocked = false;
    sw_el.classList.remove('unlocked');
    st.style.left = PAD + 'px'; 
    sf.style.width = '0%';
    charImg.style.opacity = "0";
    charImg.style.pointerEvents = "none";
    isMindClicked = false;
    mindTrigger.style.color = "#fff";

    document.querySelectorAll('.btn, #switchBtn, .gentle-glass-container').forEach(b => {
        b.classList.remove('revealed');
        b.classList.remove('growing');
        b.classList.remove('rt-btn-slide-out');
        b.style.opacity = "0";
        b.style.pointerEvents = "none";
    });

    const gw = document.getElementById('gentleWrapper');
    if (gw) {
        gw.classList.remove('revealed', 'expanded', 'shifted');
        gw.style.opacity = "0";
    }

    if (swOn) {
        swOn = false;
        switchBtn.classList.remove('sw-on');
        swKnob.style.left = SW_PAD + 'px';
        triggerVideo(false);
    }
    
    console.log("System Locked: All fragments hidden.");
}

const switchBtn = document.getElementById('switchBtn');
const swKnob = document.getElementById('swKnob');
const videoOverlay = document.getElementById('videoOverlay');
const innerVideo = document.getElementById('innerVideo');
let swOn = false, swDrag = false, swOx = 0, swStartL = 0;
const SW_PAD = 8;

function getSwitchMax() { return switchBtn.offsetWidth - swKnob.offsetWidth - (SW_PAD * 2); }

swKnob.addEventListener('mousedown', swVideoStart);
swKnob.addEventListener('touchstart', swVideoStart, { passive: true });

function swVideoStart(e) {
    e.stopPropagation(); swDrag = true;
    swOx = e.touches ? e.touches[0].clientX : e.clientX;
    swStartL = parseInt(swKnob.style.left) || SW_PAD;
    swKnob.style.transition = 'none';
    document.addEventListener('mousemove', swVideoMove);
    document.addEventListener('mouseup', swVideoEnd);
}

function swVideoMove(e) {
    if (!swDrag) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const max = getSwitchMax();
    const nl = Math.max(SW_PAD, Math.min(swStartL + (cx - swOx), max));
    swKnob.style.left = nl + 'px';
}

function swVideoEnd() {
    swDrag = false;
    const max = getSwitchMax();
    const currentLeft = parseInt(swKnob.style.left) || SW_PAD;
    swKnob.style.transition = 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    if (currentLeft > max / 2) {
        swKnob.style.left = max + 'px';
        if (!swOn) { swOn = true; switchBtn.classList.add('sw-on'); triggerVideo(true); }
    } else {
        swKnob.style.left = SW_PAD + 'px';
        if (swOn) { swOn = false; switchBtn.classList.remove('sw-on'); triggerVideo(false); }
    }
    document.removeEventListener('mousemove', swVideoMove);
    document.removeEventListener('mouseup', swVideoEnd);
}

function triggerVideo(show) {
    const rightBtns = document.querySelectorAll('.h-coral, #growBtn, .h-yellow');
    if (show) {
        videoOverlay.style.zIndex = "105";
        rightBtns.forEach((b, i) => setTimeout(() => b.classList.add('rt-btn-slide-out'), i * 100));
        videoOverlay.classList.add('show');
        innerVideo.play().catch(() => { });
    } else {
        rightBtns.forEach((b, i) => setTimeout(() => b.classList.remove('rt-btn-slide-out'), i * 100));
        videoOverlay.classList.remove('show');
        innerVideo.pause();
    }
}

const growBtn = document.getElementById('growBtn');
const cube = document.getElementById('cube');
let cubeRot = 0, isGrown = false;

growBtn.addEventListener('click', (e) => {
    const isCubeClick = e.target.closest('#cubeScene');
    if (isGrown && isCubeClick) {
        e.stopPropagation();
        cubeRot -= 90;
        cube.style.transform = `rotateY(${cubeRot}deg)`; 
        return;
    }
    isGrown = !isGrown;
    growBtn.classList.toggle('growing', isGrown);
    growBtn.style.zIndex = isGrown ? '9999' : '';
    if (!isGrown) {
        cubeRot = 0;
        cube.style.transform = 'rotateY(0deg)';
    }
});

mindTrigger.onclick = (e) => {
    if (!unlocked || isMindClicked) return;
    isMindClicked = true;
    document.querySelectorAll('.btn').forEach((b, i) => { setTimeout(() => b.classList.add('revealed'), i * 60); });
    const gw = document.getElementById('gentleWrapper');
    if (gw) { setTimeout(() => gw.classList.add('revealed'), 300); }
    mindTrigger.style.color = "#79ffe1";
};

const titleBtn = document.getElementById('titleBtn');
const letters = titleBtn.querySelectorAll('span:not(.mind-trigger)');
titleBtn.onclick = (e) => {
    if (e.target.id === 'mindTrigger') return;
    letters.forEach(s => {
        s.style.transform = `translate(${(Math.random() - 0.5) * 80}vw, ${(Math.random() - 0.5) * 80}vh) rotate(${Math.random() * 720}deg) scale(0)`;
        s.style.opacity = "0";
    });
    setTimeout(() => {
        letters.forEach(s => { s.style.transform = 'translate(0,0) rotate(0deg) scale(1)'; s.style.opacity = "1"; });
    }, 2000);
};

const gentleWrapper = document.getElementById('gentleWrapper');
const gentleBtn = document.getElementById('gentleBtn');
const actionBtn = document.getElementById('actionBtn');
if (gentleBtn && actionBtn) {
    gentleBtn.onclick = (e) => {
        e.stopPropagation();
        gentleWrapper.classList.add('expanded');
        setTimeout(() => {
            gentleWrapper.classList.add('shifted');
            gentleBtn.classList.remove('active');
            actionBtn.classList.add('active');
        }, 50);
    };
    actionBtn.onclick = (e) => {
        e.stopPropagation();
        if (gentleWrapper.classList.contains('shifted')) {
            document.querySelectorAll('.btn, .char-wrap, .page-title, .slide-wrap, #gentleWrapper, .video-overlay').forEach(el => {
                el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                el.style.opacity = '0';
            });
            setTimeout(() => { window.location.href = 'dream.html'; }, 800);
        }
    };
}

document.getElementById('dreamBtn').addEventListener('click', () => { window.location.href = 'a.html'; });