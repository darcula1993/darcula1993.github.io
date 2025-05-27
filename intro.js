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
        
        // 初始化音频
        init: function() {
            this.bgm = new Audio();
            this.bgm.loop = true;
            this.bgm.volume = 0.5;
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
        
        audioManager.play(audioTracks.intro);
        // 移除事件监听器，避免重复触发
        document.removeEventListener('click', playBackgroundMusic);
        document.removeEventListener('keydown', playBackgroundMusic);
    }
    
    // 添加用户交互事件监听器
    document.addEventListener('click', playBackgroundMusic);
    document.addEventListener('keydown', playBackgroundMusic);
    
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
        // 序章：家乡被毁
        { type: 'narration', text: '建炎四年（公元1130年），金兵南下，北宋灭亡。' },
        { type: 'narration', text: '康王赵构南渡建立南宋，定都临安（今杭州）。' },
        { type: 'narration', text: '十年后，岳飞北伐抗金，战火再起...' },
        { type: 'background', src: backgrounds.village },
        { type: 'narration', text: '你的家乡，位于北方的一个小村庄，不幸被金兵烧毁...' },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '你', text: '（望着燃烧的村庄）爹...娘...为什么会这样...' },
        { type: 'dialogue', speaker: '旁白', text: '金兵的铁蹄踏过，你的村庄化为灰烬，父母双亡，只剩你和年幼的妹妹相依为命。' },
        { type: 'dialogue', speaker: '你', text: '妹妹，别怕，有哥在。我们往南走，去临安城，那里没有战火，我们可以重新开始。' },
        
        // 第一幕：逃难路上
        { type: 'background', src: backgrounds.road },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'character', position: 'left', src: characters.sister },
        { type: 'dialogue', speaker: '旁白', text: '你带着妹妹，踏上了漫长的逃难之路。一路上，你们忍饥挨饿，风餐露宿。' },
        { type: 'dialogue', speaker: '你', text: '（疲惫地）再坚持一下，听说前面不远就是临安城了。' },
        { type: 'dialogue', speaker: '妹妹', text: '哥...我饿...我走不动了...' },
        { type: 'dialogue', speaker: '你', text: '（心痛地）再忍一忍，到了临安，哥一定会找到活路的。' },
        { type: 'dialogue', speaker: '旁白', text: '然而，妹妹已经三天没有进食，脸色苍白，步履蹒跚。' },
        
        // 第二幕：无奈之举
        { type: 'background', src: backgrounds.village },
        { type: 'character', position: 'left', src: characters.merchant },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'character', position: 'center', src: characters.sister },
        { type: 'dialogue', speaker: '旁白', text: '临近临安城的一个村庄，你们遇到了一位富绅。' },
        { type: 'dialogue', speaker: '富绅', text: '看你们兄妹二人如此落魄，何不让小姑娘到我家做个丫鬟？有吃有住，总比流落街头强。' },
        { type: 'dialogue', speaker: '你', text: '（犹豫）这...' },
        { type: 'dialogue', speaker: '妹妹', text: '哥，你就让我去吧。你先去城里找活路，等有钱了再来接我。' },
        { type: 'dialogue', speaker: '富绅', text: '我可以给你五千五百文，算是预支工钱。四十天后，你若带钱来赎人，我自然放她走；若不来，她就是我家的丫鬟了。' },
        { type: 'dialogue', speaker: '你', text: '（咬牙）好，四十天，我一定会回来赎妹妹！' },
        { type: 'dialogue', speaker: '旁白', text: '你含泪与妹妹告别，带着五千五百文钱，独自前往临安城。' },
        
        // 第三幕：抵达临安
        { type: 'background', src: backgrounds.city },
        { type: 'character', position: 'left', src: null },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '经过几日跋涉，你终于抵达了传说中的临安城。' },
        { type: 'dialogue', speaker: '你', text: '（惊叹）这就是临安城！果然繁华非凡！我一定要在这里找到活路，赚钱赎回妹妹。' },
        { type: 'dialogue', speaker: '旁白', text: '城中人来人往，叫卖声此起彼伏。各色商铺林立，货物琳琅满目。' },
        { type: 'dialogue', speaker: '你', text: '先找个地方住下，然后打听打听哪里能找到活计。' },
        
        // 第四幕：客栈
        { type: 'background', src: backgrounds.tavern },
        { type: 'character', position: 'left', src: characters.innkeeper },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '店主', text: '客官，是打尖还是住店？' },
        { type: 'dialogue', speaker: '你', text: '掌柜的，我想住几日，不知一晚上多少钱？' },
        { type: 'dialogue', speaker: '店主', text: '标准间一晚五十文，包一顿早饭。上房一晚一百文，包两顿饭。' },
        { type: 'dialogue', speaker: '你', text: '（心想：得省着点用）给我一间标准的吧。' },
        { type: 'dialogue', speaker: '店主', text: '好嘞！客官从哪来啊？来临安做什么？' },
        { type: 'dialogue', speaker: '你', text: '在下从北方来，想在临安找个活路。' },
        { type: 'dialogue', speaker: '店主', text: '哦？找活路啊。临安城机会多，但水也深，客官要小心。' },
        { type: 'dialogue', speaker: '店主', text: '尤其是那些说能一夜暴富的，十有八九是骗子。' },
        { type: 'dialogue', speaker: '你', text: '多谢提醒，我会注意的。' },
        
        // 第五幕：被骗
        { type: 'background', src: backgrounds.street },
        { type: 'character', position: 'left', src: characters.merchant },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '安顿下来后，你在城中四处打听工作。一位看似热心的商人向你推荐了一个"稳赚不赔"的生意。' },
        { type: 'dialogue', speaker: '商人', text: '兄弟，看你面生，是刚到临安吧？我告诉你，现在有个发财的好机会！' },
        { type: 'dialogue', speaker: '你', text: '什么机会？' },
        { type: 'dialogue', speaker: '商人', text: '最近北方战事吃紧，军中急需丝绸做旗帜。我有渠道，你只需出钱，我帮你买进丝绸，转手就能卖给军中，利润至少翻倍！' },
        { type: 'dialogue', speaker: '你', text: '（心动）真的？这么好的事？' },
        { type: 'dialogue', speaker: '商人', text: '千真万确！我在临安做了十几年生意，还会骗你不成？你要是不信，可以先投一点试试。' },
        { type: 'dialogue', speaker: '你', text: '（思考）我手上有五千五百文，是用来赎我妹妹的...' },
        { type: 'dialogue', speaker: '商人', text: '兄弟，你这是为了家人啊！更应该把握机会。十天之内，保证你的钱翻一倍！' },
        { type: 'dialogue', speaker: '旁白', text: '被商人的花言巧语打动，你决定将全部积蓄交给他，期待着丰厚的回报。' },
        { type: 'dialogue', speaker: '你', text: '（交出钱袋）这是我全部的钱，拜托了。' },
        { type: 'dialogue', speaker: '商人', text: '（接过钱）放心吧！三天后，在清河坊集合，我把货物和利润一起给你！' },
        
        // 第六幕：上当
        { type: 'background', src: backgrounds.street },
        { type: 'character', position: 'left', src: null },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '三天后，你按约定来到清河坊，却不见商人的踪影。' },
        { type: 'dialogue', speaker: '你', text: '（焦急）奇怪，人呢？约定的时间已经过了。' },
        { type: 'dialogue', speaker: '路人', text: '你在等谁啊？' },
        { type: 'dialogue', speaker: '你', text: '一个姓王的商人，说好在这里交易的。' },
        { type: 'dialogue', speaker: '路人', text: '（摇头）哎，又一个被骗的。那个"王商人"是临安城有名的骗子，专骗外地人的钱。' },
        { type: 'dialogue', speaker: '你', text: '（震惊）什么？！不...不可能！我的钱...我妹妹...' },
        { type: 'dialogue', speaker: '旁白', text: '你瘫坐在地上，绝望万分。不仅钱财被骗一空，还失去了赎回妹妹的希望。' },
        
        // 第七幕：债主登场
        { type: 'background', src: backgrounds.tavern },
        { type: 'character', position: 'left', src: characters.creditor },
        { type: 'character', position: 'right', src: characters.player },
        { type: 'dialogue', speaker: '旁白', text: '回到客栈，你发现一位陌生人正等着你。' },
        { type: 'dialogue', speaker: '债主', text: '你就是新来的吧？我听说你被王商人骗了？' },
        { type: 'dialogue', speaker: '你', text: '（警惕）你是谁？' },
        { type: 'dialogue', speaker: '债主', text: '我是做钱庄生意的。那个王商人欠我一笔钱，现在他跑了，债务就转到你头上了。' },
        { type: 'dialogue', speaker: '你', text: '（愤怒）凭什么？我是受害者！' },
        { type: 'dialogue', speaker: '债主', text: '（冷笑）你们是合伙做生意，他拿了你的钱，你就是他的合伙人。他欠的债，你也得还。' },
        { type: 'dialogue', speaker: '你', text: '这不公平！我根本不认识他！' },
        { type: 'dialogue', speaker: '债主', text: '公平？在临安城，有钱就是公平。你现在欠我五千五百文，每天利息一分，也就是十文钱。' },
        { type: 'dialogue', speaker: '债主', text: '我给你四十天时间还清，否则...你应该不想知道后果吧？' },
        { type: 'dialogue', speaker: '你', text: '（绝望）四十天...这不可能...' },
        { type: 'dialogue', speaker: '债主', text: '没什么不可能的。临安城机会多的是，只要你够聪明，四十天赚五千五百文不是难事。' },
        { type: 'dialogue', speaker: '债主', text: '这是契约，按个手印。记住，四十天后，我会来找你。' },
        { type: 'dialogue', speaker: '你', text: '（无奈按下手印）我...我会还的。' },
        
        // 尾声
        { type: 'dialogue', speaker: '旁白', text: '就这样，你在临安城既背负了五千五百文的债务，又肩负着赎回妹妹的重任。' },
        { type: 'dialogue', speaker: '旁白', text: '四十天的期限，双重的压力，让你倍感绝望。' },
        { type: 'dialogue', speaker: '旁白', text: '但临安城机遇与挑战并存，只要你足够聪明，善于把握时机，或许还能在这繁华都市中闯出一片天地...' },
        { type: 'dialogue', speaker: '旁白', text: '你的临安浮生记，正式开始了。' },
        { type: 'end' }
    ];
    
    let currentStoryIndex = 0;
    
    // 点击对话框继续剧情
    dialogueBox.addEventListener('click', function() {
        console.log('对话框被点击，当前索引:', currentStoryIndex);
        currentStoryIndex++;
        if (currentStoryIndex < story.length) {
            showStory(currentStoryIndex);
        } else {
            endStory();
        }
    });
    
    // 点击跳过按钮
    skipButton.addEventListener('click', function() {
        console.log('跳过按钮被点击');
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
                changeBackground(currentScene.src);
                break;
                
            case 'character':
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
        // 不在这里自动播放BGM，而是依赖用户交互触发的playBackgroundMusic函数
        // 也不在场景切换时重新播放BGM，保持BGM连续播放
    }
    
    // 显示旁白
    function showNarration(text) {
        console.log('显示旁白:', text);
        
        // 淡出对话框和角色
        dialogueBox.style.opacity = '0';
        dialogueBox.classList.remove('show');
        if (characterLeft) characterLeft.style.opacity = '0';
        if (characterRight) characterRight.style.opacity = '0';
        if (characterCenter) characterCenter.style.opacity = '0';
        
        // 显示过渡黑屏
        transitionElement.classList.add('active');
        
        // 设置旁白文字并显示
        setTimeout(() => {
            narrationElement.textContent = text;
            narrationElement.classList.add('active');
            console.log('旁白元素已激活');
        }, 1000);
        
        // 等待点击继续
        const clickHandler = function(event) {
            // 防止跳过按钮的点击事件触发剧情继续
            if (event.target === skipButton) {
                return;
            }
            
            // 淡出旁白
            narrationElement.classList.remove('active');
            
            setTimeout(() => {
                // 淡出黑屏
                transitionElement.classList.remove('active');
                
                // 移除点击事件
                document.body.removeEventListener('click', clickHandler);
                
                // 继续下一段剧情
                currentStoryIndex++;
                if (currentStoryIndex < story.length) {
                    setTimeout(() => {
                        showStory(currentStoryIndex);
                    }, 800);
                }
            }, 800);
        };
        
        // 添加延迟，防止用户立即点击跳过
        setTimeout(() => {
            document.body.addEventListener('click', clickHandler);
        }, 1500);
    }
    
    // 更换背景
    function changeBackground(src) {
        console.log('更换背景:', src);
        
        // 显示过渡黑屏
        transitionElement.classList.add('active');
        
        // 淡出当前背景和角色
        background.style.opacity = '0';
        if (characterLeft) characterLeft.style.opacity = '0';
        if (characterRight) characterRight.style.opacity = '0';
        if (characterCenter) characterCenter.style.opacity = '0';
        
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
            const typingSpeed = 50; // 打字速度（毫秒/字）
            
            function typeWriter() {
                if (i < text.length) {
                    dialogueText.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, typingSpeed);
                } else {
                    // 打字完成，移除光标效果
                    dialogueText.classList.remove('typing-cursor');
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
        // 设置标记，表示应该播放游戏BGM
        localStorage.setItem('shouldPlayGameBGM', 'true');
        
        // 停止当前BGM
        if (audioManager.bgm && !audioManager.bgm.paused) {
            audioManager.stop();
        }
        
        window.location.href = 'main.html'; // 跳过剧情，直接进入游戏
    }
});
