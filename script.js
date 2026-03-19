// ===== SUPER FAST VERSION - NO HEAVY 3D MODELS =====

// Simple initialization - runs immediately
document.addEventListener('DOMContentLoaded', function() {
    console.log('NoorVerse starting...');
    
    // Hide loading screen after 2 seconds MAXIMUM
    setTimeout(function() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }, 2000);
    
    // Simple 3D background (very lightweight)
    initSimple3D();
    
    // Setup all buttons
    setupButtons();
    
    // Load prayer times
    getPrayerTimes();
});

// ===== SUPER SIMPLE 3D (NO HEAVY MODELS) =====
function initSimple3D() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Draw animated stars (much lighter than Three.js)
    let stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0b2e');
        gradient.addColorStop(1, '#3c1e5c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        ctx.fillStyle = '#8b5cf6';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Move stars
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===== BUTTON FUNCTIONALITY =====
function setupButtons() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            alert(`📖 Loading ${sectionId} section`);
        });
    });
    
    // Quick action cards
    document.getElementById('prayerTimesCard')?.addEventListener('click', function() {
        alert(`🕌 Next prayer: ${document.getElementById('nextPrayer').textContent} at ${document.getElementById('prayerTime').textContent}`);
    });
    
    document.getElementById('qiblaCard')?.addEventListener('click', function() {
        alert('🧭 Qibla direction: Facing Makkah');
        document.querySelector('.compass-needle').style.transform = 'rotate(45deg)';
    });
    
    // Dhikr counter
    let count = 0;
    document.getElementById('tapDhikr')?.addEventListener('click', function() {
        count++;
        if (count > 33) count = 0;
        document.getElementById('dhikrCount').textContent = count;
        
        // Haptic feedback simulation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => this.style.transform = 'scale(1)', 100);
    });
    
    document.getElementById('resetDhikr')?.addEventListener('click', function() {
        count = 0;
        document.getElementById('dhikrCount').textContent = '0';
    });
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            alert(`Loading ${this.textContent} Adhkar`);
        });
    });
    
    // FAB button
    document.getElementById('fab')?.addEventListener('click', function() {
        const menu = document.getElementById('quickMenu');
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Quick menu items
    document.querySelectorAll('.quick-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            alert(`Opening ${this.textContent.trim()}`);
            document.getElementById('quickMenu').style.display = 'none';
        });
    });
    
    // Quran controls
    document.getElementById('playAyah')?.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.className = icon.className.includes('play') ? 'fas fa-pause' : 'fas fa-play';
        alert(icon.className.includes('pause') ? '▶️ Playing recitation' : '⏸️ Paused');
    });
    
    document.getElementById('bookmarkAyah')?.addEventListener('click', () => alert('📑 Ayah bookmarked!'));
    document.getElementById('shareAyah')?.addEventListener('click', () => alert('📤 Sharing ayah...'));
    
    // Video play buttons
    document.querySelectorAll('.play-video').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.video-card')?.querySelector('h4')?.textContent || 'video';
            alert(`🎬 Playing: ${title}`);
        });
    });
    
    // Photo view
    document.querySelectorAll('.view-photo').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.photo-item')?.querySelector('h4')?.textContent || 'image';
            alert(`🖼️ Viewing: ${title}`);
        });
    });
    
    // Community buttons
    document.querySelectorAll('.community-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.community-card');
            const title = card?.querySelector('h3')?.textContent || 'feature';
            alert(`👥 Opening ${title}`);
        });
    });
    
    // Voice search
    document.querySelector('.voice-search')?.addEventListener('click', function() {
        alert('🎤 Voice search activated - Say something');
    });
    
    // Search input
    document.querySelector('.search-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            alert(`Searching for: ${this.value}`);
        }
    });
    
    // Settings
    document.getElementById('animationIntensity')?.addEventListener('input', function(e) {
        console.log('Intensity:', e.target.value);
    });
    
    document.getElementById('performanceMode')?.addEventListener('change', function(e) {
        alert(e.target.checked ? '⚡ Performance mode ON' : '🎨 Performance mode OFF');
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
    
    // Window resize
    window.addEventListener('resize', function() {
        const canvas = document.getElementById('bgCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

// ===== PRAYER TIMES (SIMULATED) =====
function getPrayerTimes() {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    
    // Simulate prayer times
    document.getElementById('nextPrayer').textContent = 
        hours < 5 ? 'Fajr' :
        hours < 12 ? 'Dhuhr' :
        hours < 15 ? 'Asr' :
        hours < 18 ? 'Maghrib' : 'Isha';
    
    document.getElementById('prayerTime').textContent = 
        hours < 5 ? '05:30 AM' :
        hours < 12 ? '12:30 PM' :
        hours < 15 ? '03:45 PM' :
        hours < 18 ? '06:15 PM' : '08:00 PM';
    
    // Islamic date
    document.getElementById('hijriDate').textContent = '1 Muharram 1446';
    document.getElementById('gregorianDate').textContent = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ===== LOAD SUHR LIST =====
function loadSurahList() {
    const surahList = document.getElementById('surahList');
    if (!surahList) return;
    
    const surahs = [
        'Al-Fatiha', 'Al-Baqarah', 'Aal-E-Imran', 'An-Nisa', 'Al-Maidah',
        'Al-Anam', 'Al-Araf', 'Al-Anfal', 'At-Tawbah', 'Yunus'
    ];
    
    surahList.innerHTML = '';
    surahs.forEach((surah, index) => {
        const div = document.createElement('div');
        div.className = 'surah-item';
        div.innerHTML = `
            <span class="surah-number">${index + 1}</span>
            <span class="surah-name">${surah}</span>
            <span class="surah-verses">${Math.floor(Math.random() * 100 + 50)} verses</span>
        `;
        div.addEventListener('click', () => {
            document.getElementById('currentSurah').textContent = surah;
            document.getElementById('currentAyah').textContent = `${index + 1}:1`;
            document.getElementById('arabicAyah').textContent = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
            document.getElementById('translation').textContent = 'In the name of Allah, the Most Gracious, the Most Merciful';
            alert(`📖 Loading Surah ${surah}`);
        });
        surahList.appendChild(div);
    });
}

// ===== LOAD VIDEOS =====
function loadVideos() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    const videos = [
        { title: 'Surah Al-Kahf', reciter: 'Mishary Al-Afasy' },
        { title: 'The Purpose of Life', reciter: 'Yasir Qadhi' },
        { title: 'Ya Taybah', reciter: 'Maher Zain' }
    ];
    
    videoGrid.innerHTML = videos.map(video => `
        <div class="video-card glass-card">
            <div class="video-thumbnail">
                <img src="https://via.placeholder.com/300x200/2D1B4A/8B5CF6?text=${video.title.replace(' ', '+')}" alt="${video.title}">
                <span class="video-duration">30:00</span>
                <button class="play-video"><i class="fas fa-play"></i></button>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.reciter}</p>
            </div>
        </div>
    `).join('');
}

// ===== LOAD PHOTOS =====
function loadPhotos() {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;
    
    const photos = [
        { title: 'Masjid Al-Haram', url: 'https://via.placeholder.com/400x300/2D1B4A/8B5CF6?text=Mosque' },
        { title: 'Islamic Calligraphy', url: 'https://via.placeholder.com/400x300/2D1B4A/FFD700?text=Calligraphy' },
        { title: 'Moon Night', url: 'https://via.placeholder.com/400x300/2D1B4A/C4B5FD?text=Moon' }
    ];
    
    photoGrid.innerHTML = photos.map(photo => `
        <div class="photo-item glass-card">
            <img src="${photo.url}" alt="${photo.title}">
            <div class="photo-overlay">
                <h4>${photo.title}</h4>
                <button class="view-photo"><i class="fas fa-search-plus"></i></button>
            </div>
        </div>
    `).join('');
}

// Initialize everything
loadSurahList();
loadVideos();
loadPhotos();

// Click outside to close quick menu
document.addEventListener('click', function(e) {
    const menu = document.getElementById('quickMenu');
    const fab = document.getElementById('fab');
    if (menu && fab && !menu.contains(e.target) && !fab.contains(e.target)) {
        menu.style.display = 'none';
    }
});
