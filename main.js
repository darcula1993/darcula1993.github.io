// 游戏状态
const gameState = {
    currentPeriod: 1, // 当前旬数（1-36，共12个月，每月3旬）
    maxPeriods: 36, // 总旬数（12个月 × 3旬）
    money: 1000,
    debt: 16500,
    health: 100,
    currentLocation: null,
    inventory: [],
    visitedThisPeriod: false, // 本旬是否已访问地点
    events: [],
    // 游戏起始日期：绍兴十一年一月一日
    // 目标：绍兴十一年十二月廿九（十二月下旬）
    startDate: {
        year: 1141,
        month: 1,
        period: 1, // 1=上旬, 2=中旬, 3=下旬
        eraName: '绍兴',
        eraYear: 11
    }
};

// 音频管理器
const gameAudioManager = {
    bgm: null,
    currentTrack: '',
    volume: 0.4,
    isInitialized: false,
    clickSound: null,
    
    // 初始化音频
    init: function() {
        this.bgm = new Audio();
        this.bgm.loop = true;
        this.bgm.volume = this.volume;
        
        // 初始化点击音效
        this.clickSound = new Audio('assets/audios/click.mp3');
        this.clickSound.volume = 0.3; // 点击音效音量稍小一些
        
        this.isInitialized = true;
        
        // 检查是否需要播放游戏BGM
        const shouldPlayBGM = localStorage.getItem('shouldPlayGameBGM');
        const introBGMEnded = localStorage.getItem('introBGMEnded');
        
        console.log('音频管理器初始化:', { shouldPlayBGM, introBGMEnded });
        
        if (shouldPlayBGM === 'true' || introBGMEnded === 'true') {
            // 延迟一点时间再播放，确保页面完全加载
            setTimeout(() => {
                this.playGameplayBGM();
                localStorage.removeItem('shouldPlayGameBGM');
                localStorage.removeItem('introBGMEnded');
            }, 500);
        } else {
            // 如果不是从剧情进入，添加用户交互监听器
            this.addUserInteractionListener();
        }
    },
    
    // 播放游戏BGM
    playGameplayBGM: function() {
        const gameplayBGM = 'assets/audios/游戏进行中的bgm.ogg';
        this.play(gameplayBGM);
        console.log('尝试播放游戏BGM');
    },
    
    // 播放指定音频
    play: function(trackPath) {
        if (!this.isInitialized) {
            console.warn('音频管理器未初始化');
            return;
        }
        
        if (this.currentTrack === trackPath && !this.bgm.paused) {
            console.log('BGM已在播放:', trackPath);
            return;
        }
        
        // 显示加载状态
        this.setLoadingState();
        
        this.stop();
        this.currentTrack = trackPath;
        this.bgm.src = trackPath;
        
        // 尝试播放音频
        const playPromise = this.bgm.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('BGM播放成功:', trackPath);
                this.updateButtonState(false); // 更新按钮状态为播放中
            }).catch(error => {
                console.error('BGM播放失败:', error);
                console.log('由于浏览器限制，需要用户交互才能播放音频');
                // 如果自动播放失败，添加用户交互监听器
                this.addUserInteractionListener();
                this.updateButtonState(true); // 更新按钮状态为静音
            });
        } else {
            // 对于不支持Promise的旧浏览器
            setTimeout(() => {
                if (this.bgm.paused) {
                    this.addUserInteractionListener();
                    this.updateButtonState(true);
                } else {
                    this.updateButtonState(false);
                }
            }, 100);
        }
    },
    
    // 添加用户交互监听器（用于处理自动播放限制）
    addUserInteractionListener: function() {
        const playOnInteraction = () => {
            if (this.currentTrack && this.bgm.paused) {
                this.bgm.play().then(() => {
                    console.log('用户交互后BGM播放成功');
                    this.updateButtonState(false);
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                }).catch(error => {
                    console.error('用户交互后BGM播放仍然失败:', error);
                });
            } else if (!this.currentTrack) {
                // 如果没有当前音轨，播放游戏BGM
                this.playGameplayBGM();
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            }
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
        
        console.log('已添加用户交互监听器，等待用户操作以播放BGM');
    },
    
    // 更新按钮状态
    updateButtonState: function(isMuted) {
        const bgmToggle = document.getElementById('bgm-toggle');
        if (bgmToggle) {
            if (isMuted) {
                bgmToggle.classList.add('muted');
                bgmToggle.classList.remove('loading');
                bgmToggle.title = '播放背景音乐';
                bgmToggle.innerHTML = '🎵';
            } else {
                bgmToggle.classList.remove('muted');
                bgmToggle.classList.remove('loading');
                bgmToggle.title = '暂停背景音乐';
                bgmToggle.innerHTML = '🎵';
            }
        }
    },
    
    // 设置加载状态
    setLoadingState: function() {
        const bgmToggle = document.getElementById('bgm-toggle');
        if (bgmToggle) {
            bgmToggle.classList.add('loading');
            bgmToggle.classList.remove('muted');
            bgmToggle.title = '正在加载音乐...';
            bgmToggle.innerHTML = '⏳';
        }
    },
    
    // 停止音频
    stop: function() {
        if (this.bgm && !this.bgm.paused) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
        this.currentTrack = '';
        this.updateButtonState(true);
    },
    
    // 暂停音频
    pause: function() {
        if (this.bgm && !this.bgm.paused) {
            this.bgm.pause();
            this.updateButtonState(true);
        }
    },
    
    // 恢复播放
    resume: function() {
        if (this.bgm && this.bgm.paused && this.currentTrack) {
            this.bgm.play().then(() => {
                console.log('BGM恢复播放成功');
                this.updateButtonState(false);
            }).catch(error => {
                console.error('BGM恢复播放失败:', error);
                this.updateButtonState(true);
            });
        }
    },
    
    // 淡出音频
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
    
    // 设置音量
    setVolume: function(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.volume;
        }
    },
    
    // 播放点击音效
    playClickSound: function() {
        if (this.clickSound) {
            // 重置音频到开始位置，确保可以重复播放
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(error => {
                console.log('点击音效播放失败:', error);
            });
        }
    }
};

// 商品定义
const products = {
    regular: [
        // 传统商品
        { id: 'silk', name: '丝绸', minPrice: 500, maxPrice: 3000, risk: 0, category: 'textile' },
        { id: 'tea', name: '茶叶', minPrice: 100, maxPrice: 800, risk: 0, category: 'food' },
        { id: 'porcelain', name: '瓷器', minPrice: 200, maxPrice: 1500, risk: 0, category: 'craft' },
        { id: 'spices', name: '香料', minPrice: 50, maxPrice: 500, risk: 0, category: 'food' },
        
        // 新增纺织品类
        { id: 'cotton', name: '棉布', minPrice: 80, maxPrice: 600, risk: 0, category: 'textile' },
        { id: 'hemp', name: '麻布', minPrice: 30, maxPrice: 300, risk: 0, category: 'textile' },
        { id: 'brocade', name: '锦缎', minPrice: 800, maxPrice: 4000, risk: 0, category: 'textile' },
        
        // 新增食品类
        { id: 'rice', name: '稻米', minPrice: 20, maxPrice: 200, risk: 0, category: 'food' },
        { id: 'wine', name: '美酒', minPrice: 150, maxPrice: 1200, risk: 0, category: 'food' },
        { id: 'sugar', name: '蔗糖', minPrice: 100, maxPrice: 800, risk: 0, category: 'food' },
        { id: 'dried_fruits', name: '果脯', minPrice: 60, maxPrice: 400, risk: 0, category: 'food' },
        
        // 新增工艺品类
        { id: 'jade', name: '玉器', minPrice: 300, maxPrice: 2500, risk: 0, category: 'craft' },
        { id: 'bronze', name: '铜器', minPrice: 150, maxPrice: 1000, risk: 0, category: 'craft' },
        { id: 'lacquerware', name: '漆器', minPrice: 200, maxPrice: 1500, risk: 0, category: 'craft' },
        { id: 'calligraphy', name: '字画', minPrice: 100, maxPrice: 2000, risk: 0, category: 'craft' },
        
        // 新增药材类
        { id: 'ginseng', name: '人参', minPrice: 500, maxPrice: 3500, risk: 0, category: 'medicine' },
        { id: 'herbs', name: '草药', minPrice: 40, maxPrice: 300, risk: 0, category: 'medicine' },
        { id: 'deer_antler', name: '鹿茸', minPrice: 800, maxPrice: 4500, risk: 0, category: 'medicine' },
        
        // 新增金属类
        { id: 'iron', name: '铁器', minPrice: 80, maxPrice: 600, risk: 0, category: 'metal' },
        { id: 'silver', name: '银器', minPrice: 400, maxPrice: 2800, risk: 0, category: 'metal' }
    ],
    gray: [
        // 传统灰色商品
        { id: 'salt', name: '私盐', minPrice: 50, maxPrice: 500, risk: 0.25, category: 'contraband' },
        { id: 'weapons', name: '兵器', minPrice: 200, maxPrice: 2000, risk: 0.3, category: 'contraband' },
        { id: 'banned_books', name: '禁书', minPrice: 30, maxPrice: 300, risk: 0.2, category: 'contraband' },
        { id: 'stolen_goods', name: '赃物', minPrice: 10, maxPrice: 100, risk: 0.15, category: 'contraband' },
        
        // 新增违禁品
        { id: 'opium', name: '鸦片', minPrice: 300, maxPrice: 2500, risk: 0.4, category: 'contraband' },
        { id: 'fake_gold', name: '假金', minPrice: 100, maxPrice: 800, risk: 0.35, category: 'contraband' },
        { id: 'counterfeit_silk', name: '假丝绸', minPrice: 80, maxPrice: 600, risk: 0.25, category: 'contraband' },
        { id: 'smuggled_tea', name: '走私茶', minPrice: 60, maxPrice: 500, risk: 0.2, category: 'contraband' },
        
        // 新增高风险高收益商品
        { id: 'imperial_seal', name: '伪造印章', minPrice: 500, maxPrice: 5000, risk: 0.5, category: 'contraband' },
        { id: 'foreign_coins', name: '外国钱币', minPrice: 200, maxPrice: 1500, risk: 0.3, category: 'contraband' },
        { id: 'poison', name: '毒药', minPrice: 150, maxPrice: 1200, risk: 0.45, category: 'contraband' },
        { id: 'secret_maps', name: '军事地图', minPrice: 400, maxPrice: 3000, risk: 0.4, category: 'contraband' }
    ]
};

// 地点定义
const locations = [
    '清河坊', '凤凰山', '艮山门', '大井巷', '万松岭', '湖墅', '望湖楼'
];

// 地点历史知识
const locationHistory = {
    '清河坊': '清河坊的得名，与南宋的太师张俊有关，建炎三年（1129），张俊在明州（今宁波）击退金兵，取得高桥大捷，晚年封为清河郡王，倍受宠遇。他在今河坊街太平巷建有清河郡王府，故这一带就被称为"清河坊"。',
    
    '凤凰山': '凤凰山主峰海拔178米，北近西湖，南接钱塘江，因"形若飞凤，扑天接地"而得此名。南宋建都杭州后，此地为皇城所在地，兴建殿堂四、楼七、台六、亭十九。还有人造的"小西湖"、"六桥"、"飞来峰"等风景构筑。著名的万松书院位于山上，北麓有老虎洞南宋官窑。',
    
    '艮山门': '五代吴越时筑罗城（外城），保德门为十城门之一。南宋绍兴二十八年，门址移于菜市河以西，改名艮山门（艮为北，艮山，为城北之小山。北宋汴京有"艮岳"之名，取名艮山有思念故国之意）。艮山门内有顺应桥，俗称坝子桥，艮山门因而也名坝子门。',
    
    '大井巷': '大井巷，坊内有大井，称吴山井巷，俗称大井巷。相传此井为五代吴越时德昭国师所凿，周四丈，其水甘冽泓莹洁，异于众泉。南宋绍兴年间，太尉董德元捐钱购石板盖上，中凿五眼。宋淳祐七年（1247），临安大旱，城井皆涸，独此井日下万绠，不盈不减，都人神之。安抚赵与在井旁立祠保护。',
    
    '万松岭': '万松岭，西起湖岸，东抵江干，这里是皇城根，古道浓荫，贵气天成。一般说法都认为，它因白居易诗句"万株松树青山上，十里沙堤月明中"而获名。',
    
    '湖墅': '湖墅自古以来就是南北水陆交通要道和繁华商埠。至南宋时，得益于便捷的运河水运，湖墅成为各路商家的货物集散地，形成了"十里银湖墅"的繁荣景象。南宋时，湖墅设有"江涨东市"和"江涨西市"，街市繁盛，人烟广聚。',
    
    '望湖楼': '望湖楼位于西湖北岸，是临安城著名的酒楼茶肆。楼高三层，登楼可望西湖全景，故名"望湖楼"。此处汇聚了临安城的文人雅士、富商巨贾，是品茗论诗、听曲看戏的绝佳去处。楼内设有雅间、大堂、戏台，还有名厨烹制的各色美食，是临安城最著名的休闲娱乐场所。'
};

// 事件定义
const events = {
    business: [
        { 
            name: '岳飞北伐', 
            description: '岳飞率军北伐，军需物资紧缺！', 
            effect: () => {
                modifyPricesByCategory('weapons', 1.5);
                modifyPricesByCategory('silk', 1.2);
                showEvent('岳飞北伐', '岳飞率军北伐，军需物资紧缺！兵器和丝绸价格上涨。');
            }
        },
        { 
            name: '江南水患', 
            description: '江南地区遭遇水患，商路受阻！', 
            effect: () => {
                modifyPricesAll(1.2);
                showEvent('江南水患', '江南地区遭遇水患，商路受阻！各类商品价格普遍上涨20%。');
            }
        },
        { 
            name: '朝廷减税', 
            description: '朝廷减免商税，市场繁荣！', 
            effect: () => {
                modifyPricesAll(0.8);
                showEvent('朝廷减税', '朝廷减免商税，市场繁荣！各类商品价格普遍下跌20%。');
            }
        },
        { 
            name: '西域商队', 
            description: '西域商队抵达临安，带来稀有香料！', 
            effect: () => {
                modifyPricesByCategory('spices', 0.6);
                showEvent('西域商队', '一支西域商队抵达临安，带来大量稀有香料，香料价格暴跌40%！');
            }
        },
        { 
            name: '官窑开炉', 
            description: '官窑新开一炉，瓷器产量增加！', 
            effect: () => {
                modifyPricesByCategory('porcelain', 0.7);
                showEvent('官窑开炉', '官窑新开一炉，瓷器产量增加，价格下跌30%！');
            }
        },
        { 
            name: '棉花丰收', 
            description: '江南棉花大丰收，棉布价格暴跌！', 
            effect: () => {
                modifyPricesByCategory('cotton', 0.5);
                showEvent('棉花丰收', '江南棉花大丰收，市场上棉布供应充足，价格暴跌50%！');
            }
        },
        { 
            name: '皇室大婚', 
            description: '皇室举办盛大婚礼，锦缎需求激增！', 
            effect: () => {
                modifyPricesByCategory('brocade', 2.0);
                modifyPricesByCategory('jade', 1.5);
                showEvent('皇室大婚', '皇室举办盛大婚礼，锦缎和玉器需求激增！锦缎价格翻倍，玉器价格上涨50%！');
            }
        },
        { 
            name: '瘟疫爆发', 
            description: '临安爆发瘟疫，药材价格飞涨！', 
            effect: () => {
                modifyPricesByCategory('ginseng', 2.5);
                modifyPricesByCategory('herbs', 3.0);
                modifyPricesByCategory('deer_antler', 2.0);
                showEvent('瘟疫爆发', '临安爆发瘟疫，药材需求激增！人参价格涨150%，草药价格涨200%，鹿茸价格翻倍！');
            }
        },
        { 
            name: '矿山发现', 
            description: '临安附近发现新铁矿，铁器价格下跌！', 
            effect: () => {
                modifyPricesByCategory('iron', 0.6);
                modifyPricesByCategory('bronze', 0.8);
                showEvent('矿山发现', '临安附近发现新铁矿，铁器供应增加，价格下跌40%！铜器价格也受影响下跌20%。');
            }
        },
        { 
            name: '银矿枯竭', 
            description: '北方银矿枯竭，银器价格暴涨！', 
            effect: () => {
                modifyPricesByCategory('silver', 1.8);
                showEvent('银矿枯竭', '北方银矿枯竭，银器供应紧张，价格暴涨80%！');
            }
        },
        { 
            name: '稻米歉收', 
            description: '江南稻米歉收，粮价上涨！', 
            effect: () => {
                modifyPricesByCategory('rice', 1.6);
                modifyPricesByCategory('wine', 1.3);
                showEvent('稻米歉收', '江南稻米歉收，粮价上涨60%！酿酒成本增加，美酒价格也上涨30%。');
            }
        },
        { 
            name: '蔗糖短缺', 
            description: '南方蔗糖运输受阻，糖价飞涨！', 
            effect: () => {
                modifyPricesByCategory('sugar', 2.2);
                modifyPricesByCategory('dried_fruits', 1.4);
                showEvent('蔗糖短缺', '南方蔗糖运输受阻，糖价飞涨120%！果脯制作成本增加，价格上涨40%。');
            }
        },
        { 
            name: '名家字画', 
            description: '著名书法家到访临安，字画价格上涨！', 
            effect: () => {
                modifyPricesByCategory('calligraphy', 1.7);
                showEvent('名家字画', '著名书法家苏轼后人到访临安，引发字画收藏热潮，价格上涨70%！');
            }
        },
        { 
            name: '漆器工艺', 
            description: '新的漆器工艺传入临安，价格下跌！', 
            effect: () => {
                modifyPricesByCategory('lacquerware', 0.7);
                showEvent('漆器工艺', '新的漆器制作工艺传入临安，生产效率提高，价格下跌30%！');
            }
        }
    ],
    health: [
        { 
            name: '染上瘟疫', 
            description: '你不幸染上了瘟疫！', 
            effect: () => {
                gameState.health -= 20;
                gameState.money -= 500;
                showEvent('染上瘟疫', '你不幸染上了瘟疫！健康-20，医药费-500文。');
                updateStats();
            }
        },
        { 
            name: '风寒入体', 
            description: '天气变化，你感染了风寒！', 
            effect: () => {
                gameState.health -= 10;
                gameState.money -= 200;
                showEvent('风寒入体', '天气变化，你感染了风寒！健康-10，医药费-200文。');
                updateStats();
            }
        },
        { 
            name: '过度劳累', 
            description: '你最近太拼命了，过度劳累！', 
            effect: () => {
                gameState.health -= 15;
                gameState.currentPeriod += 1;
                showEvent('过度劳累', '你最近太拼命了，过度劳累！健康-15，强制休息一旬。');
                updateStats();
            }
        },
        { 
            name: '饮酒过度', 
            description: '你在酒楼饮酒过度，醉倒街头！', 
            effect: () => {
                gameState.health -= 25;
                gameState.money -= 300;
                showEvent('饮酒过度', '你在酒楼饮酒过度，醉倒街头被偷走了钱袋！健康-25，损失300文。');
                updateStats();
            }
        },
        { 
            name: '熬夜算账', 
            description: '你整晚计算账目，结果算出亏损，气得吐血！', 
            effect: () => {
                gameState.health -= 15;
                showEvent('熬夜算账', '你整晚计算账目，结果发现自己亏了，气得直接喷出三升老血！健康-15，但你获得了"算学入门"技能。');
                updateStats();
            }
        }
    ],
    risk: [
        { 
            name: '遭遇劫匪', 
            description: '你在路上遭遇了劫匪！', 
            effect: () => {
                const loss = Math.floor(gameState.money * 0.3);
                gameState.money -= loss;
                showEvent('遭遇劫匪', `你在郊外遭遇了劫匪，被抢走了${loss}文钱财！`);
                updateStats();
            }
        },
        { 
            name: '官府查税', 
            description: '官府突击查税，没收了你的违禁商品！', 
            effect: () => {
                const grayItems = gameState.inventory.filter(item => 
                    products.gray.some(p => p.id === item.id)
                );
                
                if (grayItems.length > 0) {
                    gameState.inventory = gameState.inventory.filter(item => 
                        !products.gray.some(p => p.id === item.id)
                    );
                    showEvent('官府查税', '官府突击查税，没收了你所有的违禁商品！');
                    updateInventory();
                } else {
                    showEvent('官府查税', '官府突击查税，但你没有携带违禁商品，虚惊一场！');
                }
            }
        },
        { 
            name: '被骗', 
            description: '你被骗购买了一批假货！', 
            effect: () => {
                if (gameState.inventory.length > 0) {
                    const randomIndex = Math.floor(Math.random() * gameState.inventory.length);
                    const lostItem = gameState.inventory[randomIndex];
                    gameState.inventory.splice(randomIndex, 1);
                    showEvent('被骗', `你被骗购买了一批假货！损失了${lostItem.name} x ${lostItem.quantity}。`);
                    updateInventory();
                } else {
                    showEvent('被骗', '有人试图骗你购买假货，但你警觉性高，避免了损失。');
                }
            }
        },
        { 
            name: '醉酒赌博', 
            description: '你喝多了，被人拉去赌场！', 
            effect: () => {
                const loss = Math.floor(gameState.money * 0.4);
                gameState.money -= loss;
                gameState.health -= 5;
                showEvent('醉酒赌博', `你在酒楼喝得烂醉，被人拉去赌场，输了${loss}文钱财！健康-5。`);
                updateStats();
            }
        },
        { 
            name: '遇见江湖骗子', 
            description: '有人想骗你，却不知你也是行家！', 
            effect: () => {
                const gain = Math.floor(500 + Math.random() * 1000);
                gameState.money += gain;
                showEvent('遇见江湖骗子', `有人想骗你买假药，却不知你曾是江湖骗子！你反客为主，成功骗得对方${gain}文钱财！`);
                updateStats();
            }
        },
        { 
            name: '货物被退', 
            description: '你卖出的货物被顾客发现有问题，强行要求退款！', 
            effect: () => {
                const loss = Math.floor(gameState.money * 0.2);
                gameState.money -= loss;
                showEvent('货物被退', `你卖出的货物被一位精明的顾客发现有问题，对方不仅要求双倍退款，还威胁要告到官府！你赔了${loss}文平息事件。`);
                updateStats();
            }
        }
    ],
    humor: [
        {
            name: '醉汉闹事',
            description: '一名醉汉在街上大喊"金兵来了"引发混乱！',
            effect: () => {
                gameState.health += 5;
                showEvent('醉汉闹事', '一名醉汉在街上大喊"金兵来了"引发混乱！你躲在一旁看热闹，笑得肚子疼。健康+5。');
                updateStats();
            }
        },
        {
            name: '茶楼丢人',
            description: '你在茶楼大谈生意，被周围人嘲笑！',
            effect: () => {
                modifyPricesAll(1.05);
                showEvent('茶楼丢人', '你在茶楼大谈自己的"万贯家财"，被周围人当成笑话。不料传言四起，你成了"临安商业奇才"，意外提高了你的销售价格！所有商品价格+5%。');
                updateStats();
            }
        },
        {
            name: '假冒进士',
            description: '你意外被误认为是新科进士！',
            effect: () => {
                if (gameState.inventory.some(item => item.id === 'silk')) {
                    const silkItem = gameState.inventory.find(item => item.id === 'silk');
                    const bonus = silkItem.quantity * 200;
                    gameState.money += bonus;
                    showEvent('假冒进士', `你被误认为是新科进士，一时间门庭若市！你趁机推销自己的丝绸，额外赚了${bonus}文。`);
                } else {
                    showEvent('假冒进士', '你被误认为是新科进士，一时间门庭若市！可惜你没有丝绸库存，错失了一次发财良机。');
                }
                updateStats();
            }
        },
        {
            name: '暴雨商机',
            description: '临安突降暴雨，积水严重！',
            effect: () => {
                if (gameState.inventory.some(item => item.id === 'porcelain')) {
                    const porcelainItem = gameState.inventory.find(item => item.id === 'porcelain');
                    const bonus = porcelainItem.quantity * 100;
                    gameState.money += bonus;
                    showEvent('暴雨商机', `临安突降暴雨，街道积水严重！你灵机一动，把库存瓷器改造成"临时船只"，在街头高价卖出，额外赚了${bonus}文。`);
                } else {
                    modifyPricesByCategory('porcelain', 1.3);
                    showEvent('暴雨商机', '临安突降暴雨，街道积水严重！你没有瓷器库存，错失了发财机会，但市场上瓷器价格上涨了30%。');
                }
                updateStats();
            }
        },
        {
            name: '高利贷讨债',
            description: '高利贷讨债人找错了人，找到了你头上！',
            effect: () => {
                if (gameState.money > 1000) {
                    const loss = Math.min(gameState.money, 1000);
                    gameState.money -= loss;
                    gameState.debt -= loss * 2;
                    showEvent('高利贷讨债', `高利贷讨债人找错了人，威胁你还钱！你灵机一动，假装害怕，给了他们${loss}文"利息"，并让他们在你真正的债主那里销账，成功减少了${loss*2}文债务！`);
                } else {
                    gameState.health -= 10;
                    showEvent('高利贷讨债', '高利贷讨债人找错了人，威胁你还钱！你没钱给他们，被吓得够呛，健康-10。');
                }
                updateStats();
            }
        }
    ],
    war: [
        {
            name: '金兵南下',
            description: '传闻金兵南下，商路受阻！',
            effect: () => {
                modifyPricesAll(1.3);
                showEvent('金兵南下', '传闻金兵南下，北方商路受阻！各类商品价格普遍上涨30%。');
                updateStats();
            }
        },
        {
            name: '岳家军征兵',
            description: '岳家军在临安征兵，年轻人纷纷应征！',
            effect: () => {
                modifyPricesByCategory('weapons', 1.8);
                showEvent('岳家军征兵', '岳家军在临安征兵，年轻人纷纷应征！兵器价格暴涨80%。');
                updateStats();
            }
        },
        {
            name: '军需征收',
            description: '朝廷征收军需物资，强制收购民间丝绸！',
            effect: () => {
                if (gameState.inventory.some(item => item.id === 'silk')) {
                    const silkItem = gameState.inventory.find(item => item.id === 'silk');
                    const compensation = silkItem.quantity * 100;
                    gameState.money += compensation;
                    gameState.inventory = gameState.inventory.filter(item => item.id !== 'silk');
                    showEvent('军需征收', `朝廷征收军需物资，强制收购了你的所有丝绸！你获得了${compensation}文补偿，但远低于市场价值。`);
                    updateInventory();
                } else {
                    modifyPricesByCategory('silk', 2.0);
                    showEvent('军需征收', '朝廷征收军需物资，强制收购民间丝绸！丝绸价格翻倍。');
                }
                updateStats();
            }
        },
        {
            name: '战事胶着',
            description: '北方战事胶着，军中急需药材！',
            effect: () => {
                modifyPricesByCategory('tea', 1.5);
                showEvent('战事胶着', '北方战事胶着，军中急需药材和茶叶提神！茶叶价格上涨50%。');
                updateStats();
            }
        }
    ]
};

// 市场价格
let marketPrices = {};

// 日期计算工具
const dateUtils = {
    // 中国古代月份名称
    monthNames: [
        '正月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    
    // 数字转汉字
    numberToChinese: function(num) {
        const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const chineseUnits = ['', '十', '百', '千'];
        
        if (num === 0) return '零';
        if (num < 10) return chineseNumbers[num];
        if (num === 10) return '十';
        if (num < 20) return '十' + chineseNumbers[num % 10];
        if (num < 100) {
            const tens = Math.floor(num / 10);
            const ones = num % 10;
            return chineseNumbers[tens] + '十' + (ones === 0 ? '' : chineseNumbers[ones]);
        }
        
        // 处理更大的数字（年份等）
        let result = '';
        let unitIndex = 0;
        while (num > 0) {
            const digit = num % 10;
            if (digit !== 0) {
                result = chineseNumbers[digit] + chineseUnits[unitIndex] + result;
            } else if (result !== '' && !result.startsWith('零')) {
                result = '零' + result;
            }
            num = Math.floor(num / 10);
            unitIndex++;
        }
        return result;
    },
    
    // 旬名称
    periodNames: ['上旬', '中旬', '下旬'],
    
    // 计算当前游戏日期
    getCurrentDate: function() {
        const startDate = gameState.startDate;
        const periodsPassed = gameState.currentPeriod - 1;
        
        // 计算当前月份和旬
        const totalPeriods = periodsPassed;
        const monthsPassed = Math.floor(totalPeriods / 3);
        const currentPeriodInMonth = (totalPeriods % 3) + 1;
        
        let currentYear = startDate.year;
        let currentMonth = startDate.month + monthsPassed;
        let eraYear = startDate.eraYear;
        
        // 处理年份溢出
        while (currentMonth > 12) {
            currentMonth -= 12;
            currentYear++;
            eraYear++;
        }
        
        return {
            year: currentYear,
            month: currentMonth,
            period: currentPeriodInMonth,
            eraName: startDate.eraName,
            eraYear: eraYear,
            monthName: this.monthNames[currentMonth - 1],
            periodName: this.periodNames[currentPeriodInMonth - 1]
        };
    },
    
    // 格式化日期显示
    formatDate: function(dateObj) {
        if (!dateObj) {
            dateObj = this.getCurrentDate();
        }
        
        const eraYearChinese = this.numberToChinese(dateObj.eraYear);
        
        return `${dateObj.eraName}${eraYearChinese}年${dateObj.monthName}${dateObj.periodName}`;
    },
    
    // 获取剩余旬数
    getRemainingPeriods: function() {
        return gameState.maxPeriods - gameState.currentPeriod + 1;
    }
};

// 初始化游戏
function initGame() {
    console.log('=== 游戏初始化开始 ===');
    
    // 初始化音频管理器
    gameAudioManager.init();
    
    // 检查是否有难度设置
    const difficulty = localStorage.getItem('gameDifficulty');
    if (difficulty) {
        switch(difficulty) {
            case 'easy':
                gameState.money = 1500;
                break;
            case 'normal':
                gameState.money = 1000;
                break;
            case 'hard':
                gameState.money = 500;
                break;
        }
    }
    
    // 修复现有库存中缺少unitCost的商品
    gameState.inventory.forEach(item => {
        if (!item.unitCost) {
            item.unitCost = Math.floor(item.totalCost / item.quantity);
        }
    });
    
    // 初始化市场价格
    initMarketPrices();
    
    // 更新统计数据
    updateStats();
    
    // 初始化市场显示
    updateMarket();
    
    // 绑定事件
    bindEvents();
    
    // 检查是否需要显示教程
    console.log('准备检查教程状态...');
    checkAndShowTutorial();
    
    console.log('=== 游戏初始化完成 ===');
}

// 检查并显示教程
function checkAndShowTutorial() {
    console.log('=== 教程检查开始 ===');
    
    // 修改：每次进入游戏都显示教程
    console.log('每次进入游戏都显示教程');
    
    // 立即尝试显示教程
    const tutorialModal = document.getElementById('tutorial-modal');
    console.log('找到教程模态框元素:', tutorialModal);
    
    if (tutorialModal) {
        // 立即显示
        tutorialModal.classList.add('active');
        console.log('教程模态框已立即显示');
        
        // 也设置延迟显示作为备用
        setTimeout(() => {
            if (!tutorialModal.classList.contains('active')) {
                tutorialModal.classList.add('active');
                console.log('延迟显示教程模态框');
            }
        }, 1000);
    } else {
        console.error('找不到教程模态框元素');
        
        // 延迟重试
        setTimeout(() => {
            const retryModal = document.getElementById('tutorial-modal');
            if (retryModal) {
                retryModal.classList.add('active');
                console.log('重试显示教程模态框成功');
            } else {
                console.error('重试后仍然找不到教程模态框元素');
            }
        }, 2000);
    }
    
    console.log('=== 教程检查结束 ===');
}

// 关闭教程并开始游戏
function closeTutorial() {
    document.getElementById('tutorial-modal').classList.remove('active');
}

// 初始化市场价格
function initMarketPrices() {
    marketPrices = {};
    
    locations.forEach(location => {
        marketPrices[location] = {
            regular: {},
            gray: {}
        };
        
        // 初始化正规商品价格
        products.regular.forEach(product => {
            const basePrice = Math.floor(Math.random() * (product.maxPrice - product.minPrice + 1)) + product.minPrice;
            marketPrices[location].regular[product.id] = basePrice;
        });
        
        // 初始化灰色商品价格
        products.gray.forEach(product => {
            const basePrice = Math.floor(Math.random() * (product.maxPrice - product.minPrice + 1)) + product.minPrice;
            marketPrices[location].gray[product.id] = basePrice;
        });
    });
}

// 更新市场价格
function updateMarketPrices() {
    locations.forEach(location => {
        // 更新正规商品价格
        products.regular.forEach(product => {
            const currentPrice = marketPrices[location].regular[product.id];
            
            // 根据商品类别设置不同的波动幅度
            let fluctuationRange;
            switch(product.category) {
                case 'food':
                    fluctuationRange = 0.7 + Math.random() * 0.6; // -30%到+30%
                    break;
                case 'textile':
                    fluctuationRange = 0.75 + Math.random() * 0.5; // -25%到+25%
                    break;
                case 'craft':
                    fluctuationRange = 0.8 + Math.random() * 0.4; // -20%到+20%
                    break;
                case 'medicine':
                    fluctuationRange = 0.6 + Math.random() * 0.8; // -40%到+40%
                    break;
                case 'metal':
                    fluctuationRange = 0.85 + Math.random() * 0.3; // -15%到+15%
                    break;
                default:
                    fluctuationRange = 0.75 + Math.random() * 0.5; // -25%到+25%
            }
            
            let newPrice = Math.floor(currentPrice * fluctuationRange);
            
            // 确保价格在合理范围内
            newPrice = Math.max(product.minPrice, Math.min(product.maxPrice, newPrice));
            marketPrices[location].regular[product.id] = newPrice;
        });
        
        // 更新灰色商品价格（更大的波动幅度）
        products.gray.forEach(product => {
            const currentPrice = marketPrices[location].gray[product.id];
            const fluctuation = 0.5 + Math.random() * 1.0; // 价格波动范围：-50%到+50%
            let newPrice = Math.floor(currentPrice * fluctuation);
            
            // 确保价格在合理范围内
            newPrice = Math.max(product.minPrice, Math.min(product.maxPrice, newPrice));
            marketPrices[location].gray[product.id] = newPrice;
        });
    });
}

// 按类别修改价格
function modifyPricesByCategory(categoryId, multiplier) {
    locations.forEach(location => {
        // 检查正规商品
        products.regular.forEach(product => {
            if (product.id === categoryId) {
                marketPrices[location].regular[product.id] = Math.floor(marketPrices[location].regular[product.id] * multiplier);
            }
        });
        
        // 检查灰色商品
        products.gray.forEach(product => {
            if (product.id === categoryId) {
                marketPrices[location].gray[product.id] = Math.floor(marketPrices[location].gray[product.id] * multiplier);
            }
        });
    });
}

// 修改所有价格
function modifyPricesAll(multiplier) {
    locations.forEach(location => {
        // 修改正规商品价格
        products.regular.forEach(product => {
            marketPrices[location].regular[product.id] = Math.floor(marketPrices[location].regular[product.id] * multiplier);
        });
        
        // 修改灰色商品价格
        products.gray.forEach(product => {
            marketPrices[location].gray[product.id] = Math.floor(marketPrices[location].gray[product.id] * multiplier);
        });
    });
}

// 更新统计数据
function updateStats() {
    // 更新日期显示
    document.getElementById('current-date').textContent = dateUtils.formatDate();
    
    document.getElementById('current-period').textContent = dateUtils.numberToChinese(gameState.currentPeriod);
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('debt').textContent = Math.floor(gameState.debt);
    document.getElementById('health').textContent = gameState.health;
    
    // 检查游戏结束条件
    checkGameOver();
}

// 显示地点历史知识
function showLocationHistory(location) {
    const historyContent = document.getElementById('history-content');
    if (location && locationHistory[location]) {
        historyContent.innerHTML = `<p class="history-text">${locationHistory[location]}</p>`;
    } else {
        historyContent.innerHTML = '<p class="history-placeholder">选择一个地点了解其历史典故</p>';
    }
}

// 绑定事件
function bindEvents() {
    // 地点选择按钮
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            gameAudioManager.playClickSound();
            selectLocation(this.dataset.location);
        });
        
        // 添加悬停事件显示历史知识
        btn.addEventListener('mouseenter', function() {
            showLocationHistory(this.dataset.location);
        });
    });
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            gameAudioManager.playClickSound();
            selectTab(this.dataset.tab);
        });
    });
    
    // 下一旬按钮
    document.getElementById('next-period-btn').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        showEndPeriodConfirmation();
    });
    
    // 结束本旬确认按钮
    document.getElementById('confirm-end-period').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        document.getElementById('end-period-modal').classList.remove('active');
        nextPeriod();
        checkGameOver();
    });
    
    // 取消结束本旬按钮
    document.getElementById('cancel-end-period').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        document.getElementById('end-period-modal').classList.remove('active');
    });
    
    // 事件确认按钮
    document.getElementById('event-confirm').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        document.getElementById('event-modal').classList.remove('active');
    });
    
    // 重新开始按钮
    document.getElementById('restart-game').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        location.reload();
    });
    
    // 教程按钮事件
    document.getElementById('start-tutorial').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        closeTutorial();
    });
    
    document.getElementById('skip-tutorial').addEventListener('click', function() {
        gameAudioManager.playClickSound();
        closeTutorial();
    });
    
    // 帮助按钮事件
    document.getElementById('help-btn').addEventListener('click', function(event) {
        gameAudioManager.playClickSound();
        
        // 如果按住Shift键，重置教程状态（用于测试）
        if (event.shiftKey) {
            localStorage.removeItem('hasSeenTutorial');
            console.log('教程状态已重置，刷新页面将重新显示教程');
            alert('教程状态已重置，刷新页面将重新显示教程');
            return;
        }
        
        document.getElementById('tutorial-modal').classList.add('active');
    });
    
    // 点击模态框外部关闭模态框
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
    
    // BGM控制按钮
    const bgmToggle = document.getElementById('bgm-toggle');
    if (bgmToggle) {
        bgmToggle.addEventListener('click', function() {
            gameAudioManager.playClickSound();
            
            if (gameAudioManager.bgm && !gameAudioManager.bgm.paused) {
                // 当前在播放，暂停BGM
                gameAudioManager.pause();
                console.log('BGM已暂停');
            } else {
                // 当前暂停或未播放，播放BGM
                if (gameAudioManager.currentTrack) {
                    gameAudioManager.resume();
                } else {
                    gameAudioManager.playGameplayBGM();
                }
                console.log('BGM已播放');
            }
        });
        
        // 初始化按钮状态
        setTimeout(() => {
            if (gameAudioManager.bgm && !gameAudioManager.bgm.paused) {
                gameAudioManager.updateButtonState(false);
            } else {
                gameAudioManager.updateButtonState(true);
            }
        }, 1000);
    }
}

// 选择地点
function selectLocation(location) {
    // 如果本旬已经访问过地点，不能再访问
    if (gameState.visitedThisPeriod) {
        showEvent('时间不够', '本旬你已经去过一个地方了，无法再前往其他地点。请结束本旬。');
        return;
    }
    
    // 更新当前地点
    gameState.currentLocation = location;
    gameState.visitedThisPeriod = true;
    
    // 更新UI
    document.getElementById('current-location').textContent = location;
    
    // 清除之前的选中状态
    const locationButtons = document.querySelectorAll('.location-btn');
    locationButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 设置当前地点为选中状态
    document.querySelector(`.location-btn[data-location="${location}"]`).classList.add('active');
    
    // 更新市场商品
    updateMarket();
    
    // 更新背包显示（显示当前地点的市场价格）
    updateInventory();
    
    // 显示地点历史知识
    showLocationHistory(location);
}

// 选择标签
function selectTab(tab) {
    // 更新UI
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    
    const goodsLists = document.querySelectorAll('.goods-list');
    goodsLists.forEach(list => {
        list.classList.remove('active');
    });
    
    document.getElementById(`${tab}-goods`).classList.add('active');
}

// 更新市场商品
function updateMarket() {
    const regularGoodsList = document.getElementById('regular-goods');
    const grayGoodsList = document.getElementById('gray-goods');
    
    if (!gameState.currentLocation) {
        // 未选择地点时显示提示信息
        regularGoodsList.innerHTML = '<div class="no-location-message">请先选择一个地点查看商品</div>';
        grayGoodsList.innerHTML = '<div class="no-location-message">请先选择一个地点查看商品</div>';
        return;
    }
    
    // 如果是望湖楼，显示娱乐休闲选项
    if (gameState.currentLocation === '望湖楼') {
        showEntertainmentOptions();
        return;
    }
    
    // 更新正规商品
    regularGoodsList.innerHTML = '';
    
    products.regular.forEach(product => {
        const price = marketPrices[gameState.currentLocation].regular[product.id];
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item';
        goodsItem.innerHTML = `
            <div class="goods-info">
                <div class="goods-header">
                    <span class="goods-name">${product.name}</span>
                    <span class="goods-price">¥${price}</span>
                </div>
            </div>
            <div class="goods-actions">
                <button class="buy-btn" data-id="${product.id}" data-type="regular">买入</button>
            </div>
        `;
        regularGoodsList.appendChild(goodsItem);
    });
    
    // 更新灰色商品
    grayGoodsList.innerHTML = '';
    
    products.gray.forEach(product => {
        const price = marketPrices[gameState.currentLocation].gray[product.id];
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item gray-item';
        goodsItem.innerHTML = `
            <div class="goods-info">
                <div class="goods-header">
                    <span class="goods-name">${product.name}</span>
                    <span class="goods-price">¥${price}</span>
                </div>
                <div class="risk-warning">风险: ${Math.floor(product.risk * 100)}%</div>
            </div>
            <div class="goods-actions">
                <button class="buy-btn" data-id="${product.id}" data-type="gray">买入</button>
            </div>
        `;
        grayGoodsList.appendChild(goodsItem);
    });
    
    // 绑定买入卖出按钮事件
    bindMarketButtons();
}

// 显示娱乐休闲选项
function showEntertainmentOptions() {
    const regularGoodsList = document.getElementById('regular-goods');
    const grayGoodsList = document.getElementById('gray-goods');
    
    // 娱乐选项定义
    const entertainmentOptions = [
        { id: 'tea', name: '品茗听雨', cost: 50, health: 15, description: '在雅间品一壶好茶，听雨声潺潺，心情舒畅' },
        { id: 'wine', name: '小酌怡情', cost: 80, health: 20, description: '浅饮几杯美酒，与文人雅士谈笑风生' },
        { id: 'opera', name: '听戏观曲', cost: 100, health: 25, description: '欣赏昆曲名段，陶冶情操，忘却烦忧' },
        { id: 'massage', name: '按摩推拿', cost: 120, health: 30, description: '请师傅推拿按摩，舒筋活血，消除疲劳' },
        { id: 'feast', name: '美食盛宴', cost: 200, health: 40, description: '享用望湖楼招牌菜肴，山珍海味，大快朵颐' }
    ];
    
    // 显示娱乐选项
    regularGoodsList.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px; color: #8b4513;">望湖楼 - 休闲娱乐</h3>';
    
    entertainmentOptions.forEach(option => {
        const optionItem = document.createElement('div');
        optionItem.className = 'goods-item entertainment-item';
        optionItem.innerHTML = `
            <div class="goods-info">
                <div class="goods-header">
                    <span class="goods-name">${option.name}</span>
                    <span class="goods-price">¥${option.cost}</span>
                </div>
                <div class="entertainment-description">${option.description}</div>
                <div class="health-bonus">恢复健康: +${option.health}</div>
            </div>
            <div class="goods-actions">
                <button class="entertainment-btn" data-id="${option.id}" data-cost="${option.cost}" data-health="${option.health}">享受</button>
            </div>
        `;
        regularGoodsList.appendChild(optionItem);
    });
    
    // 隐藏黑市标签页，因为望湖楼没有黑市
    grayGoodsList.innerHTML = '<div class="no-location-message">望湖楼是正当经营的酒楼，没有黑市交易</div>';
    
    // 绑定娱乐按钮事件
    bindEntertainmentButtons();
}

// 绑定娱乐按钮事件
function bindEntertainmentButtons() {
    const entertainmentButtons = document.querySelectorAll('.entertainment-btn');
    entertainmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameAudioManager.playClickSound();
            const id = button.dataset.id;
            const cost = parseInt(button.dataset.cost);
            const health = parseInt(button.dataset.health);
            useEntertainment(id, cost, health);
        });
    });
}

// 使用娱乐服务
function useEntertainment(id, cost, health) {
    // 检查是否有足够的钱
    if (gameState.money < cost) {
        showEvent('银两不足', '你没有足够的银两享受这项服务！');
        return;
    }
    
    // 检查健康值是否已满
    if (gameState.health >= 100) {
        showEvent('精神饱满', '你现在精神饱满，不需要额外的休息娱乐。');
        return;
    }
    
    // 扣除银两
    gameState.money -= cost;
    
    // 恢复健康值，但不超过100
    const oldHealth = gameState.health;
    gameState.health = Math.min(100, gameState.health + health);
    const actualHealthGain = gameState.health - oldHealth;
    
    // 获取娱乐项目名称
    const entertainmentNames = {
        'tea': '品茗听雨',
        'wine': '小酌怡情',
        'opera': '听戏观曲',
        'massage': '按摩推拿',
        'feast': '美食盛宴'
    };
    
    const name = entertainmentNames[id];
    
    // 显示结果
    showEvent('身心愉悦', `你享受了${name}，花费${cost}文，恢复了${actualHealthGain}点健康值。感觉身心都得到了很好的放松！`);
    
    // 更新UI
    updateStats();
}

// 绑定市场按钮事件
function bindMarketButtons() {
    // 买入按钮点击事件
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameAudioManager.playClickSound();
            const id = button.dataset.id;
            const type = button.dataset.type;
            buyProduct(id, type);
        });
    });
}

// 绑定背包按钮事件
function bindInventoryButtons() {
    // 卖出按钮点击事件
    const sellButtons = document.querySelectorAll('#inventory-list .sell-btn');
    sellButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameAudioManager.playClickSound();
            const id = button.dataset.id;
            const type = button.dataset.type;
            const unitCost = parseInt(button.dataset.unitCost);
            sellProductFromInventory(id, type, unitCost);
        });
    });
}

// 买入商品
function buyProduct(id, type) {
    if (!gameState.currentLocation) return;
    
    const price = marketPrices[gameState.currentLocation][type][id];
    
    // 检查是否有足够的钱
    if (gameState.money < price) {
        showEvent('资金不足', '你没有足够的钱来购买这个商品！');
        return;
    }
    
    // 扣除金钱
    gameState.money -= price;
    
    // 添加到库存
    const productList = type === 'regular' ? products.regular : products.gray;
    const product = productList.find(p => p.id === id);
    
    // 查找是否有相同价格的同类商品
    const existingItem = gameState.inventory.find(item => 
        item.id === id && item.unitCost === price
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalCost += price;
    } else {
        // 创建新的库存项目，即使是同种商品但价格不同也分开存储
        gameState.inventory.push({
            id: id,
            name: product.name,
            type: type,
            quantity: 1,
            totalCost: price,
            unitCost: price, // 新增：单价成本
            risk: product.risk
        });
    }
    
    // 更新UI
    updateStats();
    updateInventory();
}

// 从背包卖出商品
function sellProductFromInventory(id, type, unitCost) {
    if (!gameState.currentLocation) {
        showEvent('无法卖出', '请先选择一个地点！');
        return;
    }
    
    // 找到指定成本的商品
    const inventoryItem = gameState.inventory.find(item => 
        item.id === id && item.type === type && item.unitCost === unitCost
    );
    
    if (!inventoryItem) {
        showEvent('库存错误', '找不到指定的商品！');
        return;
    }
    
    // 获取当前市场售价
    const sellPrice = marketPrices[gameState.currentLocation][type][id];
    
    // 增加金钱
    gameState.money += sellPrice;
    
    // 从库存中减少
    inventoryItem.quantity -= 1;
    inventoryItem.totalCost -= inventoryItem.unitCost;
    
    if (inventoryItem.quantity <= 0) {
        gameState.inventory = gameState.inventory.filter(item => item !== inventoryItem);
    }
    
    // 不显示交易弹窗，直接完成交易
    
    // 更新UI
    updateStats();
    updateInventory();
}

// 更新库存
function updateInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        inventoryList.innerHTML = '<p id="empty-inventory">背包是空的</p>';
        return;
    }
    
    // 按商品名称和单价成本分组显示
    gameState.inventory.forEach(item => {
        const inventoryItem = document.createElement('div');
        inventoryItem.className = 'inventory-item';
        
        // 计算单价成本
        const unitCost = item.unitCost || Math.floor(item.totalCost / item.quantity);
        
        // 获取当前市场价格（如果在某个地点）
        let currentPrice = null;
        if (gameState.currentLocation) {
            currentPrice = marketPrices[gameState.currentLocation][item.type][item.id];
        }
        
        inventoryItem.innerHTML = `
            <div class="item-info">
                <div class="item-header">
                    <span class="item-name">${item.name} x ${item.quantity}</span>
                    <div class="item-prices">
                        <span class="item-cost">成本: ¥${unitCost}</span>
                        ${gameState.currentLocation ? `<span class="item-market-price">市价: ¥${currentPrice}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="item-actions">
                ${gameState.currentLocation ? `<button class="sell-btn" data-id="${item.id}" data-type="${item.type}" data-unit-cost="${unitCost}">卖出</button>` : '<span class="no-location">选择地点后可卖出</span>'}
            </div>
        `;
        inventoryList.appendChild(inventoryItem);
    });
    
    // 绑定卖出按钮事件
    bindInventoryButtons();
}

// 下一旬
function nextPeriod() {
    // 增加旬数
    gameState.currentPeriod += 1;
    
    // 计算债务利息
    gameState.debt *= 1.1; // 10%的旬利率
    
    // 恢复健康值
    gameState.health = Math.min(100, gameState.health + 10);
    
    // 重置访问状态
    gameState.visitedThisPeriod = false;
    
    // 清除当前地点选择
    gameState.currentLocation = null;
    document.getElementById('current-location').textContent = '请选择地点';
    
    // 清除地点按钮的选中状态
    const locationButtons = document.querySelectorAll('.location-btn');
    locationButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 更新市场价格
    updateMarketPrices();
    
    // 更新UI
    updateStats();
    updateMarket();
    updateInventory();
    
    // 重置历史知识显示
    showLocationHistory(null);
    
    // 在每旬开始时随机触发事件
    triggerPeriodEvent();
}

// 每旬事件触发函数
function triggerPeriodEvent() {
    if (Math.random() < 0.35) { // 35%概率触发事件
        const eventTypes = ['business', 'health', 'risk', 'humor', 'war'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = events[eventType][Math.floor(Math.random() * events[eventType].length)];
        
        // 延迟一点时间显示事件，让玩家先看到新的旬开始
        setTimeout(() => {
            event.effect();
        }, 1000);
    }
}



// 显示事件
function showEvent(title, description) {
    const eventModal = document.getElementById('event-modal');
    document.getElementById('event-description').textContent = description;
    eventModal.querySelector('h2').textContent = title;
    eventModal.classList.add('active');
}

// 检查游戏结束
function checkGameOver() {
    // 检查是否达到最大旬数（绍兴十一年十二月下旬）
    if (gameState.currentPeriod > gameState.maxPeriods) {
        endGame('时间到', `绍兴十一年十二月廿九已到！你的最终资产为${calculateTotalAssets()}文钱财，债务为${Math.floor(gameState.debt)}文。妹妹的赎身期限已过...`);
        return;
    }
    
    // 检查健康值是否为0或以下
    if (gameState.health <= 0) {
        endGame('健康崩溃', '你的健康值降至0，身体不支倒下了，无法继续游戏！妹妹的赎身期限也随之错过...');
        return;
    }
    
    // 检查是否连续3旬现金为负
    if (gameState.money < 0) {
        gameState.negativePeriods = (gameState.negativePeriods || 0) + 1;
        if (gameState.negativePeriods >= 3) {
            endGame('破产', '你连续三旬现金为负，被债主找上门来，游戏结束！');
            return;
        }
    } else {
        gameState.negativePeriods = 0;
    }
    
    // 检查是否胜利（还清债务且有足够资金赎回妹妹）
    if (gameState.debt <= 0 && calculateTotalAssets() >= 100000) {
        endGame('成功', `恭喜你！你已经还清债务，并且总资产达到了${calculateTotalAssets()}文钱财，成功赎回了妹妹，成为临安城首富！`);
        return;
    }
}

// 计算总资产
function calculateTotalAssets() {
    let totalAssets = gameState.money;
    
    // 计算库存价值
    gameState.inventory.forEach(item => {
        const productList = item.type === 'regular' ? products.regular : products.gray;
        const product = productList.find(p => p.id === item.id);
        
        // 使用平均价格作为库存价值
        const avgPrice = (product.minPrice + product.maxPrice) / 2;
        totalAssets += avgPrice * item.quantity;
    });
    
    return Math.floor(totalAssets);
}

// 结束游戏
function endGame(title, description) {
    // 淡出游戏BGM
    gameAudioManager.fadeOut(1500);
    
    // 延迟播放游戏结束音效
    setTimeout(() => {
        const gameOverAudio = new Audio('assets/audios/gameover.ogg');
        gameOverAudio.volume = 0.6;
        gameOverAudio.play().catch(error => {
            console.error('游戏结束音效播放失败:', error);
        });
    }, 1000);
    
    const gameOverModal = document.getElementById('game-over-modal');
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-description').textContent = description;
    gameOverModal.classList.add('active');
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM内容已加载，开始初始化游戏');
    initGame();
    
    // 额外的教程检查（备用方案）
    setTimeout(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        const tutorialModal = document.getElementById('tutorial-modal');
        
        console.log('备用教程检查 - 教程状态:', hasSeenTutorial);
        console.log('备用教程检查 - 模态框元素:', tutorialModal);
        console.log('备用教程检查 - 模态框是否显示:', tutorialModal ? tutorialModal.classList.contains('active') : 'N/A');
        
        // 如果应该显示教程但没有显示，强制显示
        if ((!hasSeenTutorial || hasSeenTutorial === 'false') && tutorialModal && !tutorialModal.classList.contains('active')) {
            console.log('备用方案：强制显示教程');
            tutorialModal.classList.add('active');
        }
    }, 1500);
});

// 显示结束本旬确认模态框
function showEndPeriodConfirmation() {
    // 计算本旬总结数据
    const currentDate = dateUtils.getCurrentDate();
    
    // 计算下一旬的日期
    let nextPeriod = currentDate.period + 1;
    let nextMonth = currentDate.month;
    let nextYear = currentDate.year;
    let nextEraYear = currentDate.eraYear;
    
    if (nextPeriod > 3) {
        nextPeriod = 1;
        nextMonth++;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear++;
            nextEraYear++;
        }
    }
    
    const nextDateStr = `${currentDate.eraName}${dateUtils.numberToChinese(nextEraYear)}年${dateUtils.monthNames[nextMonth - 1]}${dateUtils.periodNames[nextPeriod - 1]}`;
    
    // 计算本旬债务利息
    const currentDebt = Math.floor(gameState.debt);
    const interestAmount = Math.floor(gameState.debt * 0.1);
    const newDebt = currentDebt + interestAmount;
    
    // 计算库存价值
    const inventoryValue = calculateInventoryValue();
    
    // 生成总结内容
    const summaryContent = document.getElementById('summary-content');
    summaryContent.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">当前时间：</span>
            <span class="summary-value">${dateUtils.formatDate()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">下旬时间：</span>
            <span class="summary-value">${nextDateStr}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">当前银两：</span>
            <span class="summary-value">${gameState.money}文</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">当前债务：</span>
            <span class="summary-value negative">${currentDebt}文</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">下旬债务：</span>
            <span class="summary-value negative">${newDebt}文 (+${interestAmount}文利息)</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">库存价值：</span>
            <span class="summary-value">${inventoryValue}文</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">当前健康：</span>
            <span class="summary-value">${gameState.health}/100</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">剩余旬数：</span>
            <span class="summary-value">${dateUtils.numberToChinese(dateUtils.getRemainingPeriods())}旬</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">本旬访问：</span>
            <span class="summary-value">${gameState.currentLocation || '未访问任何地点'}</span>
        </div>
    `;
    
    // 显示模态框
    document.getElementById('end-period-modal').classList.add('active');
}

// 计算库存价值
function calculateInventoryValue() {
    let totalValue = 0;
    
    gameState.inventory.forEach(item => {
        const productList = item.type === 'regular' ? products.regular : products.gray;
        const product = productList.find(p => p.id === item.id);
        
        if (product) {
            // 使用平均价格作为库存价值
            const avgPrice = (product.minPrice + product.maxPrice) / 2;
            totalValue += avgPrice * item.quantity;
        }
    });
    
    return Math.floor(totalValue);
}
