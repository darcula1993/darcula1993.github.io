document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化');
    
    // 显示加载画面
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    
    // 创建场景过渡元素
    const transitionElement = document.createElement('div');
    transitionElement.classList.add('scene-transition');
    document.getElementById('story-container').appendChild(transitionElement);
    
    // 创建旁白元素
    const narrationElement = document.createElement('div');
    narrationElement.classList.add('narration');
    document.getElementById('story-container').appendChild(narrationElement);
    
    // 创建粒子效果容器
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles');
    document.getElementById('story-container').appendChild(particlesContainer);
    
    // 获取DOM元素
    const dialogueBox = document.getElementById('dialogue-box');
    const speakerName = document.getElementById('speaker-name');
    const dialogueText = document.getElementById('dialogue-text');
    const background = document.getElementById('background');
    const characterLeft = document.getElementById('character-left');
    const characterRight = document.getElementById('character-right');
    const characterCenter = document.createElement('div'); // 创建中间角色元素
    characterCenter.id = 'character-center';
    characterCenter.className = 'character';
    document.getElementById('story-container').appendChild(characterCenter); // 添加到DOM
    const skipButton = document.getElementById('skip-button');
    
    // 确保跳过按钮始终可见
    skipButton.style.display = 'block';
    skipButton.style.zIndex = '9999';
    
    console.log('DOM元素已获取:', 
        dialogueBox ? '对话框-OK' : '对话框-缺失',
        background ? '背景-OK' : '背景-缺失',
        narrationElement ? '旁白-OK' : '旁白-缺失'
    );
    
    // 创建粒子效果
    function createParticles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (4 + Math.random() * 4) + 's';
                particlesContainer.appendChild(particle);
                
                // 粒子动画结束后移除
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 8000);
            }, i * 300);
        }
    }
    
    // 启动粒子效果
    createParticles();
    setInterval(createParticles, 10000); // 每10秒创建新的粒子
    
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
        },
        
        // 播放BGM
        play: function(trackName) {
            // 如果已经在播放同一首BGM，则不重新开始
            if (this.currentTrack === trackName && !this.bgm.paused) {
                console.log('已经在播放该BGM，不重新开始');
                return;
            }
            
            // 如果是新的BGM，则停止当前的并播放新的
            if (this.currentTrack !== trackName) {
                this.stop();
                this.currentTrack = trackName;
                this.bgm.src = trackName;
                
                // 尝试播放，如果失败则记录错误
                this.bgm.play().catch(error => {
                    console.error('BGM播放失败:', error);
                });
                
                console.log('正在播放BGM:', trackName);
            } else if (this.bgm.paused) {
                // 如果是同一首BGM但已暂停，则继续播放
                this.bgm.play().catch(error => {
                    console.error('BGM继续播放失败:', error);
                });
                console.log('继续播放BGM:', trackName);
            }
        },
        
        // 停止BGM
        stop: function() {
            if (this.bgm && !this.bgm.paused) {
                this.bgm.pause();
                this.bgm.currentTime = 0;
                this.currentTrack = '';
            }
        },
        
        // 淡出BGM
        fadeOut: function(duration = 2000) {
            if (!this.bgm || this.bgm.paused) return;
            
            const originalVolume = this.bgm.volume;
            const fadeSteps = 20;
            const volumeStep = originalVolume / fadeSteps;
            const stepDuration = duration / fadeSteps;
            
            let currentStep = 0;
            
            const fadeInterval = setInterval(() => {
                currentStep++;
                this.bgm.volume = Math.max(0, originalVolume - (volumeStep * currentStep));
                
                if (currentStep >= fadeSteps) {
                    clearInterval(fadeInterval);
                    this.stop();
                    this.bgm.volume = originalVolume;
                }
            }, stepDuration);
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
    
    // 初始化音频管理
    audioManager.init();
    
    // 音频文件路径
    const audioTracks = {
        intro: 'assets/audios/开场剧情bgm.ogg',
        title: 'assets/audios/标题界面bgm.ogg',
        gameplay: 'assets/audios/游戏进行中的bgm.ogg',
        gameover: 'assets/audios/gameover.ogg',
        battle: 'assets/audios/刀剑如梦.ogg'
    };
    
    // 创建一个播放音乐的函数，将在用户交互后调用
    function playBackgroundMusic() {
        // 检查BGM是否已经在播放
        if (audioManager.bgm && !audioManager.bgm.paused) {
            console.log('BGM已经在播放中，不重新开始');
            return;
        }
        
        console.log('开始播放开场剧情BGM');
        audioManager.play(audioTracks.intro);
        // 移除事件监听器，避免重复触发
        document.removeEventListener('click', playBackgroundMusic);
        document.removeEventListener('keydown', playBackgroundMusic);
        document.removeEventListener('touchstart', playBackgroundMusic);
    }
    
    // 添加用户交互事件监听器（包括移动端）
    document.addEventListener('click', playBackgroundMusic);
    document.addEventListener('keydown', playBackgroundMusic);
    document.addEventListener('touchstart', playBackgroundMusic);
    
    // 背景图片 - 使用本地图片
    const backgrounds = {
        village: 'assets/images/backgrounds/village.jpg',
        road: 'assets/images/backgrounds/road.jpg',
        city: 'assets/images/backgrounds/city.jpg',
        tavern: 'assets/images/backgrounds/tavern.jpg',
        gambling: 'assets/images/backgrounds/gambling.jpg',
        street: 'assets/images/backgrounds/street.jpg'
    };
    
    // 角色立绘（使用本地SVG占位图）
    const characters = {
        player: 'assets/images/characters/player.svg',
        sister: 'assets/images/characters/sister.svg', // 新增妹妹角色
        merchant: 'assets/images/characters/merchant.svg',
        gambler: 'assets/images/characters/gambler.svg',
        innkeeper: 'assets/images/characters/innkeeper.svg',
        creditor: 'assets/images/characters/creditor.svg'
    };
    
    // 预加载所有图片和音频
    const imagesToLoad = [
        ...Object.values(backgrounds),
        ...Object.values(characters)
    ];
    
    const audioToLoad = Object.values(audioTracks);
    
    console.log('需要加载的图片:', imagesToLoad);
    console.log('需要加载的音频:', audioToLoad);
    
    let loadedImages = 0;
    let loadedAudio = 0;
    const totalImages = imagesToLoad.length;
    const totalAudio = audioToLoad.length;
    const totalResources = totalImages + totalAudio;
    
    // 加载每个图片
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            console.log(`图片加载成功(${loadedImages}/${totalImages}): ${src}`);
            updateLoadingProgress(loadedImages + loadedAudio, totalResources);
            checkAllResourcesLoaded();
        };
        img.onerror = () => {
            loadedImages++;
            console.error(`图片加载失败(${loadedImages}/${totalImages}): ${src}`);
            updateLoadingProgress(loadedImages + loadedAudio, totalResources);
            checkAllResourcesLoaded();
        };
        img.src = src;
    });
    
    // 加载每个音频
    audioToLoad.forEach(src => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            loadedAudio++;
            console.log(`音频加载成功(${loadedAudio}/${totalAudio}): ${src}`);
            updateLoadingProgress(loadedImages + loadedAudio, totalResources);
            checkAllResourcesLoaded();
        };
        audio.onerror = () => {
            loadedAudio++;
            console.error(`音频加载失败(${loadedAudio}/${totalAudio}): ${src}`);
            updateLoadingProgress(loadedImages + loadedAudio, totalResources);
            checkAllResourcesLoaded();
        };
        audio.src = src;
        // 预加载但不播放
        audio.preload = 'auto';
        audio.load();
    });
    
    // 更新加载进度
    function updateLoadingProgress(loaded, total) {
        const loadingText = document.querySelector('.loading-text');
        const percentage = Math.floor((loaded / total) * 100);
        loadingText.textContent = `正在加载剧情...${percentage}%`;
    }
    
    // 检查是否所有资源都已加载
    function checkAllResourcesLoaded() {
        if (loadedImages >= totalImages && loadedAudio >= totalAudio) {
            // 所有资源加载完成，隐藏加载画面
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // 初始化对话框和其他元素
                dialogueBox.style.opacity = '1';
                // 开始显示剧情（不自动播放BGM）
                showStory(0);
                
                // 添加调试信息
                console.log('所有资源加载完成，开始显示剧情');
            }, 500);
        }
    }
    
    // 剧情对话
    const story = [
        // 序章：历史背景
        { type: 'narration', text: '建炎四年，金兵南下，北宋灭亡。' },
        { type: 'narration', text: '康王赵构南渡建立南宋，定都临安。' },
        { type: 'narration', text: '十年后，岳飞北伐抗金，战火再起...' },
        { type: 'narration', text: '你的家乡，位于北方的一个小村庄，不幸被金兵烧毁...' },
        // 第一幕：家乡被毁
        { type: 'background', src: backgrounds.village },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '你', text: '（望着燃烧的村庄）爹...娘...为什么会这样...' },
        { type: 'dialogue', speaker: '旁白', text: '金兵的铁蹄踏过，你的村庄化为灰烬，父母双亡，只剩你和年幼的妹妹相依为命。' },
        { type: 'dialogue', speaker: '你', text: '妹妹，别怕，有哥在。我们往南走，去临安城，那里没有战火，我们一定可以活下去！' },
        
        // 第二幕：逃难路上的饥饿与绝望
        { type: 'background', src: backgrounds.road },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'character', position: 'left', src: characters.sister },
        { type: 'dialogue', speaker: '旁白', text: '绍兴十年，你带着妹妹踏上了漫长的逃难之路。' },
        { type: 'dialogue', speaker: '旁白', text: '寒风刺骨，雪花纷飞。你们身上只有单薄的衣衫，脚下是破烂的草鞋。' },
        { type: 'dialogue', speaker: '你', text: '（颤抖着）妹妹，再坚持一下，前面应该就有村庄了...' },
        { type: 'dialogue', speaker: '妹妹', text: '（虚弱地）哥...我走不动了...' },
        { type: 'dialogue', speaker: '旁白', text: '妹妹的脸色苍白如纸，嘴唇发紫，眼神涣散。她的身体摇摇欲坠，仿佛随时会倒下。' },
        { type: 'dialogue', speaker: '你', text: '（心如刀割）都是哥没用...连口饭都给不了你吃...' },
        { type: 'dialogue', speaker: '妹妹', text: '（勉强笑着）哥，不怪你...是这世道不好...' },
        { type: 'dialogue', speaker: '旁白', text: '就在你们快要支撑不住的时候，路边走来了一个衣着华丽的富商。' },
        
        // 第三幕：遇到人贩子
        { type: 'character', position: 'center', src: characters.merchant },
        { type: 'dialogue', speaker: '人贩子', text: '啧...最近的流民越来越多了，不知道北边的情况如何了...' },
        { type: 'dialogue', speaker: '人贩子', text: '咦？这小姑娘骨相不错啊...' },
        { type: 'dialogue', speaker: '人贩子', text: '（上前打招呼）这位小兄弟，想吃饱饭吗？' },
        { type: 'dialogue', speaker: '你', text: '（警惕地）你...你是什么人？' },
        { type: 'dialogue', speaker: '人贩子', text: '你别管我是谁。我看你身边这小姑娘不错，我可以出五千五百文买下她。' },
        { type: 'dialogue', speaker: '你', text: '（愤怒）什么？！你想买我妹妹？！' },
        { type: 'dialogue', speaker: '人贩子', text: '别激动，我不是恶人。我看你们脚步虚浮，她也是风寒在身，怕是很久没吃过饱饭了。她跟着我，至少有饭吃，有衣穿，总比在这里饿死强。' },
        { type: 'dialogue', speaker: '妹妹', text: '（拉住你的袖子）哥...' },
        { type: 'dialogue', speaker: '你', text: '不！我绝不会卖掉你！我们一起死也不分开！' },
        
        // 第四幕：妹妹的牺牲
        { type: 'dialogue', speaker: '妹妹', text: '（眼含热泪）哥，你听我说...如果我们都死在这里，那就真的什么都没有了。' },
        { type: 'dialogue', speaker: '妹妹', text: '但如果我跟他走，你就能活下去，还能想办法救我出来。' },
        { type: 'dialogue', speaker: '你', text: '（哽咽）妹妹...我怎么能...' },
        { type: 'dialogue', speaker: '妹妹', text: '哥，我相信你一定能成功的。你要好好活着，然后来救我。' },
        { type: 'dialogue', speaker: '人贩子', text: '我也不是没良心的人。这样吧，明年十二月廿九之前，你若能带一万六千五百文来赎人，我就放她走。' },
        { type: 'dialogue', speaker: '你', text: '（震惊）一万六千五百文？！那是三倍的价钱！' },
        { type: 'dialogue', speaker: '人贩子', text: '养一个人一年，吃穿用度，再加上利息，这个价钱不算高。' },
        { type: 'dialogue', speaker: '妹妹', text: '（坚定地）哥，答应他吧。我等你来救我。' },
        { type: 'dialogue', speaker: '你', text: '（含泪点头）好...我答应你...明年十二月廿九，我一定带钱来赎你！' },
        { type: 'dialogue', speaker: '旁白', text: '你含泪与妹妹告别，接过五千五百文钱，看着她跟人贩子离去的背影。' },
        
        // 第五幕：抵达临安
        { type: 'background', src: backgrounds.city },
        { type: 'character', position: 'left', src: null },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '怀着沉重的心情，你独自前往临安城。' },
        { type: 'dialogue', speaker: '你', text: '（望着繁华的临安城）妹妹，哥一定会在这里赚到钱，然后救你出来的！' },
        { type: 'dialogue', speaker: '旁白', text: '临安城果然繁华，街道上人来人往，商铺林立，一片繁荣景象。' },
        { type: 'dialogue', speaker: '你', text: '有了这五千五百文，我要想办法让它变成一万六千五百文！' },
        
        // 第六幕：被骗
        { type: 'background', src: backgrounds.street },
        { type: 'character', position: 'left', src: characters.merchant },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '在临安城中，你遇到了一位热心的商人。' },
        { type: 'dialogue', speaker: '商人', text: '兄弟，看你面生，是刚到临安吧？想不想发财？' },
        { type: 'dialogue', speaker: '你', text: '发财？什么意思？' },
        { type: 'dialogue', speaker: '商人', text: '我有个稳赚不赔的生意，我有门路，投五千文，一个月后就能变成一万文！' },
        { type: 'dialogue', speaker: '你', text: '（心动）真的吗？那太好了！我正需要赚钱！' },
        { type: 'dialogue', speaker: '商人', text: '当然是真的！北边岳元帅的军队需要丝绸，你投钱给我，我替你经营，转手就是十倍的利润' },
        { type: 'dialogue', speaker: '旁白', text: '你看他面相和蔼又言之确凿，就将所有的钱都交给了他。' },
        { type: 'dialogue', speaker: '你', text: '（交出钱袋）这是我全部的钱，拜托了！' },
        { type: 'dialogue', speaker: '商人', text: '（接过钱）放心！一个月后在清河坊见面！' },
        
        // 第七幕：血本无归
        { type: 'background', src: backgrounds.street },
        { type: 'character', position: 'left', src: null },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '一个月后，你来到清河坊，却再也找不到那个商人。' },
        { type: 'dialogue', speaker: '你', text: '（绝望）不...不可能...我的钱...我妹妹...' },
        { type: 'dialogue', speaker: '路人', text: '又一个被骗的。那个王商人是有名的骗子，专门骗外地人。' },
        { type: 'dialogue', speaker: '你', text: '（瘫坐在地）完了...全完了...我拿什么去救妹妹...' },
        { type: 'dialogue', speaker: '旁白', text: '你身无分文，流落街头，绝望地想着妹妹的处境。' },
        
        // 第八幕：神秘乞丐的帮助
        { type: 'background', src: backgrounds.street },
        { type: 'character', position: 'left', src: characters.gambler },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '神秘乞丐', text: '年轻人，我看你愁眉苦脸的，是遇到什么难处了？' },
        { type: 'dialogue', speaker: '你', text: '（抬头看）一个乞丐？' },
        { type: 'dialogue', speaker: '神秘乞丐', text: '别小看乞丐。我在临安城混了几十年，什么世面没见过？' },
        { type: 'dialogue', speaker: '你', text: '（苦笑）我被骗了，现在身无分文，还要救我妹妹...' },
        { type: 'dialogue', speaker: '神秘乞丐', text: '这样吧，我看你是个有情有义的人，这一千文你拿去。' },
        { type: 'dialogue', speaker: '你', text: '（震惊）一千文？！你一个乞丐哪来这么多钱？' },
        { type: 'dialogue', speaker: '神秘乞丐', text: '（神秘一笑）我说了，别小看任何人。这钱你拿去，想办法翻身吧。' },
        { type: 'dialogue', speaker: '神秘乞丐', text: '记住，在临安城，只要你够聪明，够勇敢，一千文也能变成一万文。' },
        { type: 'dialogue', speaker: '你', text: '（感激涕零）谢谢...谢谢您！我一定不会辜负您的好意！' },
        
        // 尾声
        { type: 'dialogue', speaker: '旁白', text: '就这样，你在临安城重新开始，手中只有一千文和一颗拯救妹妹的决心。' },
        { type: 'dialogue', speaker: '旁白', text: '距离明年十二月廿九的期限，你还有一年的时间。' },
        { type: 'dialogue', speaker: '旁白', text: '你必须想办法将这一千文变成一万六千五百文，才能赎回心爱的妹妹。' },
        { type: 'dialogue', speaker: '旁白', text: '临安城机遇与挑战并存，你的浮生记，正式开始了...' },
        { type: 'end' }
    ];
    
    let currentStoryIndex = 0;
    let isProcessing = false; // 添加处理状态标志
    let currentClickHandler = null; // 当前的点击处理器
    
    // 点击跳过按钮
    skipButton.addEventListener('click', function() {
        console.log('跳过按钮被点击');
        audioManager.playClickSound();
        skipStory();
    });
    
    // 显示剧情
    function showStory(index) {
        console.log('显示剧情索引:', index, '类型:', story[index].type);
        
        const currentScene = story[index];
        
        // 根据剧情内容切换BGM
        updateBGMForScene(index, currentScene);
        
        switch(currentScene.type) {
            case 'narration':
                showNarration(currentScene.text);
                break;
                
            case 'background':
                isProcessing = true; // 设置处理状态
                changeBackground(currentScene.src);
                break;
                
            case 'character':
                isProcessing = true; // 设置处理状态
                showCharacter(currentScene.position, currentScene.src);
                break;
                
            case 'dialogue':
                showDialogue(currentScene.speaker, currentScene.text);
                break;
                
            case 'end':
                endStory();
                break;
        }
    }
    
    // 根据剧情内容更新BGM
    function updateBGMForScene(index, scene) {
        // 整个开场剧情只播放一个BGM，不做切换
    }
    
    // 移除当前的点击事件监听器
    function removeCurrentClickHandler() {
        if (currentClickHandler) {
            document.body.removeEventListener('click', currentClickHandler);
            currentClickHandler = null;
        }
    }
    
    // 显示旁白
    function showNarration(text) {
        console.log('显示旁白:', text);
        
        // 如果正在处理，直接返回
        if (isProcessing) {
            console.log('正在处理中，忽略点击');
            return;
        }
        
        isProcessing = true;
        removeCurrentClickHandler(); // 移除之前的事件监听器
        
        // 淡出对话框和角色
        dialogueBox.style.opacity = '0';
        dialogueBox.classList.remove('show');
        if (characterLeft) characterLeft.style.opacity = '0';
        if (characterRight) characterRight.style.opacity = '0';
        if (characterCenter) characterCenter.style.opacity = '0';
        
        // 检查是否是历史背景介绍（前四个旁白）
        const isHistorical = currentStoryIndex <= 3;
        if (isHistorical) {
            narrationElement.classList.add('historical');
            // 历史背景使用纯黑背景
            background.style.backgroundColor = '#000000';
            background.style.backgroundImage = 'none';
            background.style.opacity = '1';
        } else {
            narrationElement.classList.remove('historical');
        }
        
        // 显示过渡黑屏
        transitionElement.classList.add('active');
        
        // 设置旁白文字并显示
        setTimeout(() => {
            narrationElement.textContent = text;
            narrationElement.classList.add('active');
            console.log('旁白元素已激活');
            
            // 等待点击继续
            currentClickHandler = function(event) {
                // 防止跳过按钮的点击事件触发剧情继续
                if (event.target === skipButton || !isProcessing) {
                    return;
                }
                
                // 播放点击音效
                audioManager.playClickSound();
                
                // 移除点击事件
                removeCurrentClickHandler();
                
                // 淡出旁白
                narrationElement.classList.remove('active');
                
                setTimeout(() => {
                    // 淡出黑屏
                    transitionElement.classList.remove('active');
                    
                    // 继续下一段剧情
                    currentStoryIndex++;
                    isProcessing = false; // 重置处理状态
                    
                    if (currentStoryIndex < story.length) {
                        setTimeout(() => {
                            showStory(currentStoryIndex);
                        }, 500);
                    }
                }, 800);
            };
            
            // 添加延迟，防止用户立即点击跳过
            setTimeout(() => {
                if (isProcessing) { // 只有在仍在处理时才添加监听器
                    document.body.addEventListener('click', currentClickHandler);
                }
            }, 1000);
        }, 1500);
    }
    
    // 更换背景
    function changeBackground(src) {
        console.log('更换背景:', src);
        
        // 显示过渡黑屏
        transitionElement.classList.add('active');
        
        // 淡出对话框
        dialogueBox.style.opacity = '0';
        dialogueBox.classList.remove('show');
        
        // 淡出当前背景和角色
        background.style.opacity = '0';
        if (characterLeft) {
            characterLeft.style.opacity = '0';
            characterLeft.classList.remove('active');
            characterLeft.style.backgroundImage = 'none';
        }
        if (characterRight) {
            characterRight.style.opacity = '0';
            characterRight.classList.remove('active');
            characterRight.style.backgroundImage = 'none';
        }
        if (characterCenter) {
            characterCenter.style.opacity = '0';
            characterCenter.classList.remove('active');
            characterCenter.style.backgroundImage = 'none';
        }
        
        // 等待当前背景淡出完成
        setTimeout(() => {
            // 更改背景图片源
            background.style.backgroundImage = `url(${src})`;
            
            // 预加载图片以确保加载完成
            const img = new Image();
            img.onload = function() {
                console.log('背景图片加载完成:', src);
                
                // 淡入新背景
                setTimeout(() => {
                    background.style.opacity = '1';
                    
                    // 淡出黑屏
                    setTimeout(() => {
                        transitionElement.classList.remove('active');
                        console.log('背景已设置为:', src);
                        
                        // 继续下一段剧情
                        currentStoryIndex++;
                        isProcessing = false; // 重置处理状态
                        if (currentStoryIndex < story.length) {
                            setTimeout(() => {
                                showStory(currentStoryIndex);
                            }, 500);
                        }
                    }, 1000);
                    }, 800);
            };
            
            img.onerror = function() {
                console.error('背景图片加载失败:', src);
                // 即使加载失败也继续
                background.style.opacity = '1';
                transitionElement.classList.remove('active');
                
                // 继续下一段剧情
                currentStoryIndex++;
                isProcessing = false; // 重置处理状态
                if (currentStoryIndex < story.length) {
                    setTimeout(() => {
                        showStory(currentStoryIndex);
                    }, 500);
                }
            };
            
            img.src = src;
        }, 1200); // 等待背景完全淡出
    }
    
    // 显示角色
    function showCharacter(position, src) {
        let character;
        
        // 根据位置选择角色元素
        if (position === 'left') {
            character = characterLeft;
        } else if (position === 'right') {
            character = characterRight;
        } else if (position === 'center') {
            character = characterCenter;
        } else {
            console.error('未知的角色位置:', position);
            return;
        }
        
        // 淡出当前角色
        character.style.opacity = '0';
        character.classList.remove('active');
        
        setTimeout(() => {
            // 如果src为null，则隐藏角色
            if (src === null) {
                character.style.backgroundImage = 'none';
                
                // 继续下一段剧情
                currentStoryIndex++;
                isProcessing = false; // 重置处理状态
                if (currentStoryIndex < story.length) {
                    setTimeout(() => {
                        showStory(currentStoryIndex);
                    }, 500);
                }
            } else {
                // 预加载角色图片
                const img = new Image();
                img.onload = function() {
                    console.log('角色图片加载完成:', src);
                    
                    // 设置角色图片并添加active类
                    character.style.backgroundImage = `url(${src})`;
                    character.classList.add('active');
                    
                    // 淡入新角色
                    setTimeout(() => {
                        character.style.opacity = '1';
                        
                        // 继续下一段剧情
                        currentStoryIndex++;
                        isProcessing = false; // 重置处理状态
                        if (currentStoryIndex < story.length) {
                            setTimeout(() => {
                                showStory(currentStoryIndex);
                            }, 500);
                        }
                    }, 200);
                };
                
                img.onerror = function() {
                    console.error('角色图片加载失败:', src);
                    // 即使加载失败也继续
                    character.style.backgroundImage = 'none';
                    
                    // 继续下一段剧情
                    currentStoryIndex++;
                    isProcessing = false; // 重置处理状态
                    if (currentStoryIndex < story.length) {
                        setTimeout(() => {
                            showStory(currentStoryIndex);
                        }, 500);
                    }
                };
                
                img.src = src;
            }
        }, 600); // 给角色足够的淡出时间
    }
    
    // 显示对话
    function showDialogue(speaker, text) {
        console.log('显示对话:', speaker, text);
        
        // 如果正在处理，直接返回
        if (isProcessing) {
            console.log('正在处理中，忽略点击');
            return;
        }
        
        isProcessing = true;
        removeCurrentClickHandler(); // 移除之前的事件监听器
        
        // 先移除所有角色的speaking效果
        if (characterLeft) characterLeft.classList.remove('speaking');
        if (characterRight) characterRight.classList.remove('speaking');
        if (characterCenter) characterCenter.classList.remove('speaking');
        
        // 根据说话人添加speaking效果
        if (speaker === '你' && characterRight && characterRight.style.opacity === '1') {
            characterRight.classList.add('speaking');
        } else if (speaker === '妹妹' && characterLeft && characterLeft.style.opacity === '1') {
            characterLeft.classList.add('speaking');
        } else if ((speaker === '富绅' || speaker === '商人' || speaker === '债主' || speaker === '店主') && characterLeft && characterLeft.style.opacity === '1') {
            characterLeft.classList.add('speaking');
        } else if (characterCenter && characterCenter.style.opacity === '1') {
            characterCenter.classList.add('speaking');
        }
        
        // 先淡出对话框
        dialogueBox.style.opacity = '0';
        dialogueBox.classList.remove('show');
        
        setTimeout(() => {
            // 更新对话内容
            speakerName.textContent = speaker;
            dialogueText.textContent = '';
            dialogueText.classList.add('typing-cursor');
            
            // 淡入对话框
            dialogueBox.style.opacity = '1';
            dialogueBox.classList.add('show');
            
            // 逐字显示文本
            let i = 0;
            const typingSpeed = 20; // 打字速度（毫秒/字）- 加快速度
            let isTyping = true; // 添加打字状态标志
            
            function typeWriter() {
                if (i < text.length && isTyping) {
                    dialogueText.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, typingSpeed);
                } else if (isTyping) {
                    // 打字完成，移除光标效果
                    dialogueText.classList.remove('typing-cursor');
                    
                    // 添加点击继续的事件监听器
                    currentClickHandler = function(event) {
                        // 防止跳过按钮的点击事件触发剧情继续
                        if (event.target === skipButton || !isProcessing) {
                            return;
                        }
                        
                        // 播放点击音效
                        audioManager.playClickSound();
                        
                        // 移除speaking效果
                        if (characterLeft) characterLeft.classList.remove('speaking');
                        if (characterRight) characterRight.classList.remove('speaking');
                        if (characterCenter) characterCenter.classList.remove('speaking');
                        
                        // 移除点击事件
                        removeCurrentClickHandler();
                        
                        // 继续下一段剧情
                        currentStoryIndex++;
                        isProcessing = false; // 重置处理状态
                        
                        if (currentStoryIndex < story.length) {
                            setTimeout(() => {
                                showStory(currentStoryIndex);
                            }, 300);
                        }
                    };
                    
                    // 添加延迟，防止用户立即点击跳过
                    setTimeout(() => {
                        if (isProcessing) { // 只有在仍在处理时才添加监听器
                            document.body.addEventListener('click', currentClickHandler);
                        }
                    }, 500);
                }
            }
            
            // 开始打字效果
            setTimeout(typeWriter, 300);
        }, 400);
    }
    
    // 结束剧情
    function endStory() {
        // 设置标记，表示应该播放游戏BGM
        localStorage.setItem('shouldPlayGameBGM', 'true');
        
        // 淡出当前BGM
        if (audioManager.bgm && !audioManager.bgm.paused) {
            audioManager.fadeOut(1000);
        }
        
        // 延迟跳转，等待音频淡出
        setTimeout(() => {
            window.location.href = 'main.html'; // 剧情结束，进入游戏
        }, 1000);
    }

    function skipStory() {
        // 清理状态
        isProcessing = false;
        removeCurrentClickHandler();
        
        // 设置标记，表示应该播放游戏BGM
        localStorage.setItem('shouldPlayGameBGM', 'true');
        
        // 停止当前BGM
        if (audioManager.bgm && !audioManager.bgm.paused) {
            audioManager.stop();
        }
        
        window.location.href = 'main.html'; // 跳过剧情，直接进入游戏
    }
});
