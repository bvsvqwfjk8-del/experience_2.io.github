const audio = document.getElementById('audio-player');
const recordDisc = document.getElementById('record-disc');
const coverImage = document.getElementById('cover-image');
const trackTitle = document.getElementById('track-title');
// const trackArtist = document.getElementById('track-artist'); // 已移除

const btnPlay = document.getElementById('btn-play');
const iconPlay = document.getElementById('icon-play'); 
const iconPause = document.getElementById('icon-pause');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

const btnVolume = document.getElementById('btn-volume');
const volumeContainer = document.getElementById('volume-container');
const volumeBar = document.getElementById('volume-bar');

const btnSpeed = document.getElementById('btn-speed');

const btnPlaylist = document.getElementById('btn-playlist');
const btnClosePlaylist = document.getElementById('btn-close-playlist');
const playlistDrawer = document.getElementById('playlist-drawer');
const playlistContainer = document.getElementById('playlist-container');


// ============================================
// 1. 数据定义
// ============================================
const PLAYLIST = [
    {
        id: 1,
        title: "洛春赋",
        artist: "云汐",
        cover: "./img/14936926.jpg", 
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "06:12"
    },
    {
        id: 2,
        title: "星河入梦",
        artist: "云汐",
        cover: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=600&auto=format&fit=crop",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "07:05"
    },
    {
        id: 3,
        title: "月下独酌",
        artist: "云汐",
        cover: "./img/R.jpg",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "05:44"
    },
    {
        id: 4,
        title: "深林幽谷",
        artist: "佚名",
        cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: "03:30"
    }
];

let currentIndex = 0;
let isPlaying = false;
let currentVolume = 0.8;

const speeds = [1.0, 1.25, 1.5, 2.0, 0.5];
let speedIndex = 0;

// 4. 核心逻辑函数

function loadTrack(index) {
    const track = PLAYLIST[index];
    audio.src = track.url;
    
    if(coverImage) {
        coverImage.src = track.cover;
        coverImage.onerror = function() {
            console.log("图片加载失败，可能是路径不对:", track.cover);
        };
    }
    
    trackTitle.textContent = track.title;
    // 移除了动态更新作者的逻辑，使其保持为固定的学号姓名
    // trackArtist.textContent = track.artist; 
    
    currentTimeEl.textContent = "00:00";
    progressBar.style.width = "0%";
    
    // 切歌时：重置唱片动画
    recordDisc.classList.remove('animate-spin-slow');
    recordDisc.style.animationPlayState = 'paused';

    // 切歌时保持当前的播放速度
    audio.playbackRate = speeds[speedIndex];

    updatePlaylistUI();
    lucide.createIcons();
}

function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        updatePlayButton();
        recordDisc.classList.add('animate-spin-slow');
        recordDisc.style.animationPlayState = 'running';
        
        updatePlaylistUI();
    }).catch(e => console.error("Playback error:", e));
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayButton();
    recordDisc.style.animationPlayState = 'paused';
    
    updatePlaylistUI();
}

function updatePlayButton() {
    if (isPlaying) {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
    } else {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderPlaylist() {
    playlistContainer.innerHTML = '';
    PLAYLIST.forEach((track, index) => {
        const isActive = index === currentIndex;
        const activeClass = isActive ? 'bg-white/10 border-[#4ade80]/30' : 'border-transparent hover:bg-white/5';
        const textClass = isActive ? 'text-[#4ade80]' : 'text-gray-200';
        
        const waveAnim = isActive && isPlaying ? `
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div class="w-1 h-3 bg-[#4ade80] playing-bar mx-[1px]" style="animation-delay:0s"></div>
                <div class="w-1 h-4 bg-[#4ade80] playing-bar mx-[1px]" style="animation-delay:0.1s"></div>
                <div class="w-1 h-2 bg-[#4ade80] playing-bar mx-[1px]" style="animation-delay:0.2s"></div>
            </div>
        ` : '';

        const item = document.createElement('div');
        item.className = `p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all border ${activeClass}`;
        item.innerHTML = `
            <div class="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                <img src="${track.cover}" class="w-full h-full object-cover">
                ${waveAnim}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate ${textClass}">${track.title}</div>
                <div class="text-xs text-gray-500 truncate">${track.artist}</div>
            </div>
            <div class="text-xs text-gray-600 font-mono">${track.duration}</div>
        `;
        
        item.onclick = () => {
            if (index === currentIndex) {
                isPlaying ? pauseTrack() : playTrack();
            } else {
                currentIndex = index;
                loadTrack(currentIndex);
                playTrack();
            }
        };
        
        playlistContainer.appendChild(item);
    });
}

function updatePlaylistUI() {
    renderPlaylist(); 
}

// 5. 事件监听

btnPlay.addEventListener('click', () => {
    if (isPlaying) pauseTrack();
    else playTrack();
});

btnPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(currentIndex);
    if (isPlaying) playTrack();
});

btnNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % PLAYLIST.length;
    loadTrack(currentIndex);
    if (isPlaying) playTrack();
});

audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const duration = audio.duration;
    const percent = (current / duration) * 100;
    
    currentTimeEl.textContent = formatTime(current);
    progressBar.style.width = `${percent}%`;
});

audio.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    btnNext.click();
});

progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const width = rect.width;
    const clickX = e.clientX - rect.left;
    const duration = audio.duration;
    
    audio.currentTime = (clickX / width) * duration;
});

volumeContainer.addEventListener('click', (e) => {
    const rect = volumeContainer.getBoundingClientRect();
    const width = rect.width;
    const clickX = e.clientX - rect.left;
    let volume = clickX / width;
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    audio.volume = volume;
    currentVolume = volume;
    volumeBar.style.width = `${volume * 100}%`;
});

btnVolume.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.volume = 0;
        volumeBar.style.width = '0%';
    } else {
        audio.volume = currentVolume;
        volumeBar.style.width = `${currentVolume * 100}%`;
    }
});

// 倍速切换监听
btnSpeed.addEventListener('click', () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    const newSpeed = speeds[speedIndex];
    
    audio.playbackRate = newSpeed;
    btnSpeed.textContent = newSpeed + "X";
});

btnPlaylist.addEventListener('click', () => {
    playlistDrawer.classList.remove('translate-x-full');
    btnPlaylist.classList.add('text-[#4ade80]');
});

btnClosePlaylist.addEventListener('click', () => {
    playlistDrawer.classList.add('translate-x-full');
    btnPlaylist.classList.remove('text-[#4ade80]');
});

// 6. 启动
window.addEventListener('DOMContentLoaded', () => {
    loadTrack(currentIndex);
});
