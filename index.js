document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化音频系统');
    
    // 音频管理
    const audioManager = {
        bgm: null,
        currentTrack: '',
        clickSound: null,
        
        // 初始化音频
        init: function() {
            this.bgm = new Audio();
            this.bgm.loop = true;
            this.bgm.volume = 0.5;
            
            // 初始化点击音效
            this.clickSound = new Audio('assets/audios/click.mp3');
            this.clickSound.volume = 0.3;
            
            // 从本地存储获取音量设置
            const savedVolume = localStorage.getItem('musicVolume');
            if (savedVolume !== null) {
                this.bgm.volume = savedVolume / 100;
            }
            
            console.log('音频系统初始化完成');
        },
        
        // 播放BGM
        play: function(trackName) {
            console.log('尝试播放BGM:', trackName);
            
            if (this.currentTrack === trackName) {
                console.log('已经在播放该BGM，跳过');
                return;
            }
            
            this.stop();
            this.currentTrack = trackName;
            this.bgm.src = trackName;
            
            // 添加加载事件监听器
            this.bgm.oncanplaythrough = () => {
                console.log('BGM已加载，开始播放');
                // 尝试播放，如果失败则记录错误
                this.bgm.play().then(() => {
                    console.log('BGM播放成功:', trackName);
                }).catch(error => {
                    console.error('BGM播放失败:', error);
                });
                // 移除事件监听器，避免重复触发
                this.bgm.oncanplaythrough = null;
            };
            
            // 添加错误处理
            this.bgm.onerror = (e) => {
                console.error('BGM加载失败:', e);
            };
            
            // 开始加载
            this.bgm.load();
        },
        
        // 停止BGM
        stop: function() {
            if (this.bgm && !this.bgm.paused) {
                console.log('停止当前BGM');
                this.bgm.pause();
                this.bgm.currentTime = 0;
                this.currentTrack = '';
            }
        },
        
        // 设置音量
        setVolume: function(volume) {
            if (this.bgm) {
                console.log('设置音量:', volume);
                this.bgm.volume = volume / 100;
            }
        },
        
        // 播放点击音效
        playClickSound: function() {
            if (this.clickSound) {
                this.clickSound.currentTime = 0;
                this.clickSound.play().catch(error => {
                    console.log('点击音效播放失败:', error);
                });
            }
        }
    };
    
    // 初始化音频管理器
    audioManager.init();
    
    // 准备标题界面BGM但不立即播放
    console.log('准备标题界面BGM');
    
    // 创建一个播放音乐的函数，将在用户交互后调用
    function playBackgroundMusic() {
        const titleBgm = document.getElementById('bgm-preload');
        if (titleBgm) {
            console.log('找到预加载的音频元素');
            titleBgm.volume = audioManager.bgm.volume;
            titleBgm.loop = true;
            
            // 尝试播放
            titleBgm.play().then(() => {
                console.log('标题BGM播放成功');
            }).catch(error => {
                console.error('标题BGM播放失败:', error);
                // 尝试使用audioManager作为备用
                audioManager.play('./assets/audios/标题界面bgm.ogg');
            });
        } else {
            console.warn('未找到预加载的音频元素，使用audioManager播放');
            audioManager.play('./assets/audios/标题界面bgm.ogg');
        }
        
        // 移除事件监听器，避免重复触发
        document.removeEventListener('click', playBackgroundMusic);
        document.removeEventListener('keydown', playBackgroundMusic);
    }
    
    // 添加用户交互事件监听器
    document.addEventListener('click', playBackgroundMusic);
    document.addEventListener('keydown', playBackgroundMusic);
    
    // 初始化音量滑块
    function initVolumeSliders() {
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        
        // 从本地存储加载设置
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSfxVolume = localStorage.getItem('sfxVolume');
        
        if (savedMusicVolume !== null) {
            musicSlider.value = savedMusicVolume;
        }
        
        if (savedSfxVolume !== null) {
            sfxSlider.value = savedSfxVolume;
        }
        
    // 实时调整音量
    musicSlider.addEventListener('input', function() {
        const volume = this.value;
        audioManager.setVolume(volume);
        
        // 同时更新预加载的音频元素音量
        const titleBgm = document.getElementById('bgm-preload');
        if (titleBgm) {
            titleBgm.volume = volume / 100;
        }
    });
    }
    
    // 初始化设置
    initVolumeSliders();
    
    // 初始化粒子效果
    initParticles();
    
    // 初始化飘落的树叶效果
    initFallingLeaves();
    
    // 按钮事件绑定
    document.getElementById('start-game').addEventListener('click', function() {
        console.log('开始游戏按钮被点击');
        audioManager.playClickSound();
        
        // 停止当前BGM
        const titleBgm = document.getElementById('bgm-preload');
        if (titleBgm && !titleBgm.paused) {
            titleBgm.pause();
        }
        audioManager.stop();
        
        // 淡出效果
        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
        window.location.href = 'intro.html';
        }, 500);
    });
    
    document.getElementById('game-intro').addEventListener('click', function() {
        audioManager.playClickSound();
        document.getElementById('intro-modal').classList.add('active');
    });
    
    document.getElementById('close-intro').addEventListener('click', function() {
        audioManager.playClickSound();
        document.getElementById('intro-modal').classList.remove('active');
    });
    
    document.getElementById('game-settings').addEventListener('click', function() {
        audioManager.playClickSound();
        document.getElementById('settings-modal').classList.add('active');
    });
    
    document.getElementById('save-settings').addEventListener('click', function() {
        audioManager.playClickSound();
        
        // 保存设置到本地存储
        const difficulty = document.getElementById('difficulty').value;
        const musicVolume = document.getElementById('music-volume').value;
        const sfxVolume = document.getElementById('sfx-volume').value;
        
        localStorage.setItem('difficulty', difficulty);
        localStorage.setItem('musicVolume', musicVolume);
        localStorage.setItem('sfxVolume', sfxVolume);
        
        // 立即应用音量设置
        audioManager.setVolume(musicVolume);
        
        document.getElementById('settings-modal').classList.remove('active');
    });
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
});

// 初始化粒子效果
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

// 创建单个粒子
function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // 随机位置
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // 随机大小
    const size = Math.random() * 5 + 2;
    
    // 随机透明度
    const opacity = Math.random() * 0.5 + 0.3;
    
    // 随机动画延迟
    const delay = Math.random() * 5;
    
    // 设置样式
    particle.style.left = posX + '%';
    particle.style.top = posY + '%';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.opacity = opacity;
    particle.style.animationDelay = delay + 's';
    
    container.appendChild(particle);
}

// 初始化飘落的树叶效果
function initFallingLeaves() {
    // 这里可以添加飘落树叶的效果，类似于粒子效果但样式不同
    // 暂时留空，可以后续实现
}
