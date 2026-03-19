// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== GLOBAL VARIABLES =====
let scene, camera, renderer, controls;
let mosque3D, particles;
let currentSection = 'home';
let dhikrCount = 0;
let dhikrTarget = 33;
let currentCategory = 'morning';
let audioPlayer = new Audio();
let currentSurah = 1;
let currentAyah = 1;
let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks')) || [];
let userLocation = null;
let prayerTimings = {};
let streakCount = parseInt(localStorage.getItem('streakCount')) || 7;
let notificationSettings = JSON.parse(localStorage.getItem('notificationSettings')) || {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initialize3DScene();
    loadUserData();
    startLoadingProgress();
    loadSurahList();
    loadVideos();
    loadPhotos();
    getLocationAndPrayerTimes();
});

// ===== LOADING SCREEN =====
function startLoadingProgress() {
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    appContainer.style.display = 'block';
                    showNotification('Welcome to NoorVerse! 🌙', 'success');
                }, 1000);
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles dynamically
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--electric-violet)' : type === 'error' ? '#ff4444' : 'var(--royal-purple)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== 3D SCENE INITIALIZATION =====
function initialize3DScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0b2e);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
    
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bgCanvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x8b5cf6, 1, 20);
    pointLight1.position.set(2, 3, 4);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xfbbf24, 0.5, 20);
    pointLight2.position.set(-2, 1, 4);
    scene.add(pointLight2);
    
    createParticles();
    createProceduralMosque();
    
    animate();
}

// ===== CREATE PROCEDURAL MOSQUE =====
function createProceduralMosque() {
    const group = new THREE.Group();
    
    // Main dome
    const domeGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const domeMat = new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        emissive: 0x2d1b4a,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.scale.set(1, 0.6, 1);
    dome.position.y = 1.5;
    group.add(dome);
    
    // Main building
    const buildingGeo = new THREE.BoxGeometry(3, 2, 3);
    const buildingMat = new THREE.MeshPhongMaterial({
        color: 0x3c1e5c,
        transparent: true,
        opacity: 0.7,
        wireframe: true
    });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.y = 0;
    group.add(building);
    
    // Minarets
    const positions = [[-2, 1, -2], [2, 1, -2], [-2, 1, 2], [2, 1, 2]];
    positions.forEach(pos => {
        const minaretGeo = new THREE.CylinderGeometry(0.3, 0.4, 3);
        const minaretMat = new THREE.MeshPhongMaterial({ color: 0x8b5cf6, emissive: 0x2d1b4a });
        const minaret = new THREE.Mesh(minaretGeo, minaretMat);
        minaret.position.set(pos[0], pos[1] + 1.5, pos[2]);
        group.add(minaret);
        
        const topGeo = new THREE.SphereGeometry(0.15, 8);
        const topMat = new THREE.MeshPhongMaterial({ color: 0xfbbf24 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(pos[0], pos[1] + 3, pos[2]);
        group.add(top);
    });
    
    scene.add(group);
    mosque3D = group;
}

// ===== CREATE PARTICLES =====
function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 50;
        posArray[i+1] = (Math.random() - 0.5) * 50;
        posArray[i+2] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    
    if (particles) particles.rotation.y += 0.0002;
    if (mosque3D) mosque3D.rotation.y += 0.002;
    
    controls.update();
    renderer.render(scene, camera);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('href').substring(1);
            navigateToSection(sectionId);
            showNotification(`Loading ${sectionId} section...`, 'info');
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // FAB menu
    document.getElementById('fab').addEventListener('click', toggleQuickMenu);
    
    // Dhikr counter
    document.getElementById('tapDhikr').addEventListener('click', incrementDhikr);
    document.getElementById('resetDhikr').addEventListener('click', resetDhikr);
    
    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            loadDhikrByCategory(currentCategory);
            showNotification(`Loaded ${currentCategory} Dhikr`, 'success');
        });
    });
    
    // Quran controls
    document.getElementById('fontIncrease').addEventListener('click', increaseFontSize);
    document.getElementById('fontDecrease').addEventListener('click', decreaseFontSize);
    document.getElementById('nightMode').addEventListener('click', toggleNightMode);
    
    // Search
    document.querySelector('.search-input').addEventListener('input', debounce(handleSearch, 300));
    
    // Voice search
    document.querySelector('.voice-search').addEventListener('click', startVoiceSearch);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
    
    // Quick menu items
    document.querySelectorAll('.quick-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Prayer cards click
    document.querySelectorAll('.prayer-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const prayer = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'][index];
            showNotification(`${prayer} prayer time: ${card.querySelector('.prayer-time').textContent}`, 'info');
        });
    });
    
    // Qibla compass click
    document.getElementById('qiblaCard').addEventListener('click', showQiblaDirection);
    
    // Quran play button
    document.getElementById('playAyah').addEventListener('click', playCurrentAyah);
    
    // Bookmark button
    document.getElementById('bookmarkAyah').addEventListener('click', bookmarkCurrentAyah);
    
    // Share button
    document.getElementById('shareAyah').addEventListener('click', shareAyah);
    
    // Tafsir button
    document.getElementById('tafsirAyah').addEventListener('click', showTafsir);
    
    // Copy Dua button
    document.querySelector('.copy-dua').addEventListener('click', copyDua);
    
    // Find Mosques button
    document.getElementById('findMosques').addEventListener('click', findNearbyMosques);
    
    // Community buttons
    document.querySelectorAll('.community-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.closest('.community-card').querySelector('h3').textContent;
            showNotification(`Opening ${text}...`, 'info');
        });
    });
    
    // Settings controls
    document.getElementById('animationIntensity').addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--animation-intensity', e.target.value + '%');
    });
    
    document.getElementById('performanceMode').addEventListener('change', (e) => {
        if (e.target.checked) {
            renderer.setPixelRatio(1);
            showNotification('Performance mode enabled', 'success');
        } else {
            renderer.setPixelRatio(window.devicePixelRatio);
        }
    });
    
    document.getElementById('calculationMethod').addEventListener('change', (e) => {
        localStorage.setItem('calculationMethod', e.target.value);
        getLocationAndPrayerTimes();
    });
    
    document.getElementById('audioQuality').addEventListener('change', (e) => {
        localStorage.setItem('audioQuality', e.target.value);
        showNotification(`Audio quality set to ${e.target.value}`, 'success');
    });
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Set interval for prayer times
    setInterval(updatePrayerTimes, 60000);
}

// ===== NAVIGATION =====
function navigateToSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    currentSection = sectionId;
}

// ===== TOGGLE FUNCTIONS =====
function toggleSidebar() {
    document.querySelector('.main-nav').classList.toggle('show');
}

function toggleQuickMenu() {
    const menu = document.getElementById('quickMenu');
    menu.classList.toggle('show');
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    const icon = document.querySelector('#nightMode i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    showNotification('Night mode toggled', 'success');
}

// ===== QUICK ACTIONS =====
function handleQuickAction(action) {
    document.getElementById('quickMenu').classList.remove('show');
    
    switch(action) {
        case 'prayer':
            navigateToSection('home');
            showNotification('Showing prayer times', 'info');
            break;
        case 'qibla':
            showQiblaDirection();
            break;
        case 'dhikr':
            navigateToSection('dhikr');
            break;
        case 'quran':
            navigateToSection('quran');
            break;
    }
}

// ===== QIBLA DIRECTION =====
function showQiblaDirection() {
    if (!userLocation) {
        showNotification('Getting your location...', 'info');
        getLocationAndPrayerTimes();
        return;
    }
    
    // Calculate Qibla direction (simplified)
    const qiblaLat = 21.4225;
    const qiblaLon = 39.8262;
    
    const lat1 = userLocation.latitude * Math.PI / 180;
    const lon1 = userLocation.longitude * Math.PI / 180;
    const lat2 = qiblaLat * Math.PI / 180;
    const lon2 = qiblaLon * Math.PI / 180;
    
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    document.querySelector('.compass-needle').style.transform = `rotate(${bearing}deg)`;
    showNotification(`Qibla direction: ${Math.round(bearing)}°`, 'success');
}

// ===== PRAYER TIMES =====
function getLocationAndPrayerTimes() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                fetchPrayerTimes(userLocation.latitude, userLocation.longitude);
                showNotification('Location detected successfully', 'success');
            },
            (error) => {
                console.log('Using default location (Makkah)');
                userLocation = { latitude: 21.4225, longitude: 39.8262 };
                fetchPrayerTimes(21.4225, 39.8262);
            }
        );
    } else {
        fetchPrayerTimes(21.4225, 39.8262);
    }
}

async function fetchPrayerTimes(lat, lon) {
    try {
        const date = new Date();
        const method = localStorage.getItem('calculationMethod') || '2';
        const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}?latitude=${lat}&longitude=${lon}&method=${method}`);
        const data = await response.json();
        
        if (data.code === 200) {
            prayerTimings = data.data.timings;
            updatePrayerCards();
            findNextPrayer();
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        showNotification('Error loading prayer times', 'error');
    }
}

function updatePrayerCards() {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const cards = document.querySelectorAll('.prayer-card');
    
    prayers.forEach((prayer, index) => {
        if (cards[index] && prayerTimings[prayer]) {
            const time = prayerTimings[prayer];
            cards[index].querySelector('.prayer-time').textContent = formatTime(time);
        }
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function findNextPrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (let prayer of prayers) {
        if (!prayerTimings[prayer]) continue;
        
        const [hours, minutes] = prayerTimings[prayer].split(':');
        const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes);
        
        if (prayerMinutes > currentTime) {
            document.getElementById('nextPrayer').textContent = prayer;
            document.getElementById('prayerTime').textContent = formatTime(prayerTimings[prayer]);
            
            const timeUntilPrayer = prayerMinutes - currentTime;
            const totalDayMinutes = 24 * 60;
            const progress = ((totalDayMinutes - timeUntilPrayer) / totalDayMinutes) * 100;
            document.getElementById('prayerProgress').style.width = progress + '%';
            
            // Schedule adhan if notifications are enabled
            if (notificationSettings[prayer.toLowerCase()]) {
                scheduleAdhan(timeUntilPrayer, prayer);
            }
            break;
        }
    }
}

function scheduleAdhan(minutesUntil, prayer) {
    setTimeout(() => {
        showNotification(`🕌 ${prayer} adhan time!`, 'success');
        playAdhan();
    }, minutesUntil * 60000);
}

function playAdhan() {
    // Simple notification sound (browser beep)
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4GmmQQUeqbEEbQvLBYQ/tNvqqAAD//w='; // Silent beep
    audio.play().catch(() => {});
}

// ===== DHIKR COUNTER =====
function incrementDhikr() {
    dhikrCount++;
    if (dhikrCount > dhikrTarget) {
        dhikrCount = 0;
        streakCount++;
        localStorage.setItem('streakCount', streakCount);
        document.getElementById('streakDays').textContent = `${streakCount} Day Streak`;
        createCelebrationEffect();
        showNotification('🎉 Completed! Keep going!', 'success');
    }
    updateDhikrDisplay();
    localStorage.setItem('dhikrCount', dhikrCount);
}

function resetDhikr() {
    dhikrCount = 0;
    updateDhikrDisplay();
    localStorage.setItem('dhikrCount', dhikrCount);
    showNotification('Counter reset', 'info');
}

function updateDhikrDisplay() {
    document.getElementById('dhikrCount').textContent = dhikrCount;
}

function loadDhikrByCategory(category) {
    const dhikrList = {
        morning: { text: 'Subhanallah', translation: 'Glory be to Allah', target: 33 },
        evening: { text: 'Alhamdulillah', translation: 'Praise be to Allah', target: 33 },
        'after-prayer': { text: 'Allahu Akbar', translation: 'Allah is the Greatest', target: 34 },
        sleeping: { text: 'Astaghfirullah', translation: 'I seek forgiveness from Allah', target: 100 }
    };
    
    const dhikr = dhikrList[category];
    document.querySelector('#currentDhikr h3').textContent = dhikr.text;
    document.querySelector('#currentDhikr p').textContent = dhikr.translation;
    dhikrTarget = dhikr.target;
    document.querySelector('.target').textContent = `/${dhikrTarget}`;
    resetDhikr();
}

// ===== QURAN FUNCTIONS =====
function loadSurahList() {
    const surahs = [
        { number: 1, name: 'Al-Fatiha', verses: 7, meaning: 'The Opening' },
        { number: 2, name: 'Al-Baqarah', verses: 286, meaning: 'The Cow' },
        { number: 3, name: 'Aal-E-Imran', verses: 200, meaning: 'Family of Imran' },
        { number: 4, name: 'An-Nisa', verses: 176, meaning: 'The Women' },
        { number: 5, name: 'Al-Maidah', verses: 120, meaning: 'The Table Spread' },
        { number: 6, name: 'Al-Anam', verses: 165, meaning: 'The Cattle' },
        { number: 7, name: 'Al-Araf', verses: 206, meaning: 'The Heights' },
        { number: 8, name: 'Al-Anfal', verses: 75, meaning: 'The Spoils of War' },
        { number: 9, name: 'At-Tawbah', verses: 129, meaning: 'The Repentance' },
        { number: 10, name: 'Yunus', verses: 109, meaning: 'Jonah' }
    ];
    
    const surahList = document.getElementById('surahList');
    surahList.innerHTML = '';
    
    surahs.forEach(surah => {
        const div = document.createElement('div');
        div.className = 'surah-item';
        div.innerHTML = `
            <span class="surah-number">${surah.number}</span>
            <span class="surah-name">${surah.name}</span>
            <span class="surah-meaning">${surah.meaning}</span>
            <span class="surah-verses">${surah.verses} verses</span>
        `;
        div.addEventListener('click', () => loadSurah(surah.number));
        surahList.appendChild(div);
    });
}

function loadSurah(surahNumber) {
    currentSurah = surahNumber;
    currentAyah = 1;
    
    // Show loading
    document.getElementById('arabicAyah').textContent = 'Loading...';
    document.getElementById('translation').textContent = 'Please wait';
    
    // Fetch from Quran API
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const surah = data.data;
                document.getElementById('currentSurah').textContent = surah.name;
                document.getElementById('currentAyah').textContent = `${surahNumber}:1`;
                document.getElementById('arabicAyah').textContent = surah.ayahs[0].text;
                
                // Fetch translation
                fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`)
                    .then(res => res.json())
                    .then(transData => {
                        if (transData.code === 200) {
                            document.getElementById('translation').textContent = transData.data.ayahs[0].text;
                        }
                    });
                
                showNotification(`Loaded Surah ${surah.name}`, 'success');
            }
        })
        .catch(error => {
            console.error('Error loading surah:', error);
            showNotification('Error loading surah', 'error');
        });
}

function playCurrentAyah() {
    const playBtn = document.getElementById('playAyah');
    const icon = playBtn.querySelector('i');
    
    if (audioPlayer.paused) {
        // Simulate playing (in real app, would fetch from Quran API)
        icon.className = 'fas fa-pause';
        showNotification('Playing audio...', 'info');
        
        // Animate waveform
        animateWaveform();
        
        // Simulate playback
        setTimeout(() => {
            icon.className = 'fas fa-play';
        }, 5000);
    } else {
        audioPlayer.pause();
        icon.className = 'fas fa-play';
        showNotification('Paused', 'info');
    }
}

function animateWaveform() {
    const waveform = document.getElementById('waveform');
    let bars = '';
    for (let i = 0; i < 20; i++) {
        const height = Math.random() * 100;
        bars += `<div style="width: 4px; height: ${height}%; background: var(--electric-violet); margin: 0 2px; border-radius: 2px; animation: wave 0.5s ease infinite;"></div>`;
    }
    waveform.innerHTML = bars;
}

function bookmarkCurrentAyah() {
    const bookmark = {
        surah: currentSurah,
        ayah: currentAyah,
        text: document.getElementById('arabicAyah').textContent,
        date: new Date().toISOString()
    };
    
    bookmarks.push(bookmark);
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
    showNotification('Ayah bookmarked! 📖', 'success');
}

function shareAyah() {
    const text = document.getElementById('arabicAyah').textContent;
    const translation = document.getElementById('translation').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quran Ayah',
            text: `${text}\n${translation}`,
            url: window.location.href
        }).catch(() => {
            copyToClipboard(`${text}\n${translation}`);
        });
    } else {
        copyToClipboard(`${text}\n${translation}`);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    });
}

function showTafsir() {
    showNotification('Loading Tafsir...', 'info');
    setTimeout(() => {
        showNotification('Tafsir Ibn Kathir - This verse explains...', 'info');
    }, 1000);
}

// ===== VIDEO FUNCTIONS =====
function loadVideos() {
    const videos = [
        { id: 'd1_JBMrrADw', title: 'Surah Al-Kahf', reciter: 'Mishary Al-Afasy', duration: '45:30' },
        { id: '8s6pZ4fQ9lY', title: 'The Purpose of Life', reciter: 'Yasir Qadhi', duration: '1:15:20' },
        { id: 'iJ9_8z7kLmN', title: 'Ya Taybah', reciter: 'Maher Zain', duration: '4:15' },
        { id: 'q5pZ2fR8tY6', title: 'Stories of the Prophets', reciter: 'Mufti Menk', duration: '55:10' },
        { id: 'nM7kL2jH4gF', title: 'Islamic History', reciter: 'Dr. Yasir Qadhi', duration: '1:30:45' }
    ];
    
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';
    
    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card glass-card';
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}">
                <span class="video-duration">${video.duration}</span>
                <button class="play-video"><i class="fas fa-play"></i></button>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.reciter}</p>
                <span class="video-views">${Math.floor(Math.random() * 1000)}K views</span>
            </div>
        `;
        
        card.querySelector('.play-video').addEventListener('click', () => playVideo(video));
        videoGrid.appendChild(card);
    });
}

function playVideo(video) {
    showNotification(`Playing: ${video.title}`, 'info');
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
}

// ===== PHOTO FUNCTIONS =====
function loadPhotos() {
    const photos = [
        { title: 'Masjid Al-Haram', category: 'mosques', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800' },
        { title: 'Islamic Calligraphy', category: 'art', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800' },
        { title: 'Moon Night', category: 'nature', url: 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800' },
        { title: 'Kaaba', category: 'hajj', url: 'https://images.pexels.com/photos/4064432/pexels-photo-4064432.jpeg?w=800' },
        { title: 'Masjid Nabawi', category: 'mosques', url: 'https://images.pexels.com/photos/4064389/pexels-photo-4064389.jpeg?w=800' },
        { title: 'Geometric Art', category: 'art', url: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800' }
    ];
    
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    
    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-item glass-card';
        card.innerHTML = `
            <img src="${photo.url}" alt="${photo.title}" loading="lazy">
            <div class="photo-overlay">
                <h4>${photo.title}</h4>
                <button class="view-photo"><i class="fas fa-search-plus"></i></button>
            </div>
        `;
        
        card.querySelector('.view-photo').addEventListener('click', () => viewPhoto(photo));
        photoGrid.appendChild(card);
    });
}

function viewPhoto(photo) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = photo.url;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 0 50px var(--electric-violet);
    `;
    
    lightbox.appendChild(img);
    lightbox.addEventListener('click', () => lightbox.remove());
    document.body.appendChild(lightbox);
}

// ===== COMMUNITY FUNCTIONS =====
function findNearbyMosques() {
    if (!userLocation) {
        showNotification('Getting your location...', 'info');
        getLocationAndPrayerTimes();
        return;
    }
    
    showNotification(`Searching for mosques near you...`, 'info');
    
    // Simulate finding mosques
    setTimeout(() => {
        const mosques = [
            { name: 'Masjid Al-Noor', distance: '0.5 km' },
            { name: 'Islamic Center', distance: '1.2 km' },
            { name: 'Masjid Al-Rahman', distance: '1.8 km' }
        ];
        
        let message = 'Nearby Mosques:\n';
        mosques.forEach(m => message += `${m.name} - ${m.distance}\n`);
        showNotification(message, 'info');
    }, 2000);
}

// ===== DUA FUNCTIONS =====
function copyDua() {
    const duaText = document.querySelector('.dua-arabic').textContent;
    const translation = document.querySelector('.dua-translation').textContent;
    
    navigator.clipboard.writeText(`${duaText}\n${translation}`).then(() => {
        showNotification('Dua copied to clipboard!', 'success');
    });
}

// ===== FONT CONTROLS =====
function increaseFontSize() {
    const arabicText = document.querySelector('.arabic-text');
    const currentSize = parseInt(window.getComputedStyle(arabicText).fontSize);
    arabicText.style.fontSize = (currentSize + 2) + 'px';
    document.getElementById('fontSize').textContent = (currentSize + 2) + 'px';
}

function decreaseFontSize() {
    const arabicText = document.querySelector('.arabic-text');
    const currentSize = parseInt(window.getComputedStyle(arabicText).fontSize);
    if (currentSize > 12) {
        arabicText.style.fontSize = (currentSize - 2) + 'px';
        document.getElementById('fontSize').textContent = (currentSize - 2) + 'px';
    }
}

// ===== VOICE SEARCH =====
function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.start();
        showNotification('Listening...', 'info');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.querySelector('.search-input').value = transcript;
            handleSearch(transcript);
            showNotification(`Searching for: ${transcript}`, 'success');
        };
        
        recognition.onerror = () => {
            showNotification('Voice recognition failed', 'error');
        };
    } else {
        showNotification('Voice search not supported', 'error');
    }
}

// ===== SEARCH HANDLER =====
function handleSearch(query) {
    if (typeof query === 'string' && query.length > 0) {
        // Search in Quran
        if (query.includes('surah') || query.includes('quran')) {
            navigateToSection('quran');
            showNotification(`Searching Quran for: ${query}`, 'info');
        }
        // Search in videos
        else if (query.includes('video') || query.includes('lecture')) {
            navigateToSection('videos');
            showNotification(`Searching videos for: ${query}`, 'info');
        }
        // Search in gallery
        else {
            showNotification(`Search results for: ${query}`, 'info');
        }
    }
}

// ===== CELEBRATION EFFECT =====
function createCelebrationEffect() {
    const celebrationGeometry = new THREE.BufferGeometry();
    const count = 100;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        positions[i*3] = (Math.random() - 0.5) * 10;
        positions[i*3+1] = (Math.random() - 0.5) * 10;
        positions[i*3+2] = (Math.random() - 0.5) * 10;
        
        colors[i*3] = Math.random();
        colors[i*3+1] = Math.random();
        colors[i*3+2] = Math.random();
    }
    
    celebrationGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    celebrationGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const celebrationMaterial = new THREE.PointsMaterial({ 
        size: 0.2, 
        vertexColors: true,
        blending: THREE.AdditiveBlending 
    });
    
    const celebrationParticles = new THREE.Points(celebrationGeometry, celebrationMaterial);
    scene.add(celebrationParticles);
    
    setTimeout(() => {
        scene.remove(celebrationParticles);
    }, 2000);
}

// ===== LOAD USER DATA =====
function loadUserData() {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'night') {
        document.body.classList.add('night-mode');
    }
    
    // Load dhikr progress
    const savedDhikr = localStorage.getItem('dhikrCount');
    if (savedDhikr) {
        dhikrCount = parseInt(savedDhikr);
        updateDhikrDisplay();
    }
    
    // Load streak
    document.getElementById('streakDays').textContent = `${streakCount} Day Streak`;
    
    // Load notification settings
    document.querySelectorAll('.notification-toggle input').forEach((toggle, index) => {
        const prayer = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'][index];
        if (notificationSettings[prayer] !== undefined) {
            toggle.checked = notificationSettings[prayer];
        }
        
        toggle.addEventListener('change', () => {
            notificationSettings[prayer] = toggle.checked;
            localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
            showNotification(`${prayer} notifications ${toggle.checked ? 'enabled' : 'disabled'}`, 'success');
        });
    });
    
    // Set Islamic date
    updateIslamicDate();
}

function updateIslamicDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('gregorianDate').textContent = today.toLocaleDateString('en-US', options);
    
    // Hijri date (simplified - would need API for accurate)
    const hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
    const hijriDay = Math.floor(Math.random() * 30) + 1;
    const hijriMonth = hijriMonths[Math.floor(Math.random() * 12)];
    const hijriYear = 1445 + Math.floor(Math.random() * 2);
    document.getElementById('hijriDate').textContent = `${hijriDay} ${hijriMonth} ${hijriYear}`;
}

// ===== DEBOUNCE =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== WINDOW RESIZE =====
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== INITIALIZE APP =====
function initializeApp() {
    console.log('NoorVerse - Your Digital Islamic Sanctuary');
    loadDhikrByCategory('morning');
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes wave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(1.5); }
    }
    
    .notification {
        transition: all 0.3s ease;
    }
    
    .night-mode {
        filter: brightness(0.8) contrast(1.2);
    }
    
    .night-mode .glass-card {
        background: rgba(10, 5, 20, 0.8);
    }
`;
document.head.appendChild(style);

// Export for global use
window.navigateToSection = navigateToSection;
window.toggleQuickMenu = toggleQuickMenu;
window.startVoiceSearch = startVoiceSearch;
window.showNotification = showNotification;