// 游戏状态
const gameState = {
    day: 1,
    maxDays: 40,
    money: 2000,
    debt: 5500,
    health: 100,
    currentLocation: null,
    inventory: [],
    visitedToday: false,
    events: []
};

// 商品定义
const products = {
    regular: [
        { id: 'silk', name: '丝绸', minPrice: 500, maxPrice: 3000, risk: 0 },
        { id: 'tea', name: '茶叶', minPrice: 100, maxPrice: 800, risk: 0 },
        { id: 'porcelain', name: '瓷器', minPrice: 200, maxPrice: 1500, risk: 0 },
        { id: 'spices', name: '香料', minPrice: 50, maxPrice: 500, risk: 0 }
    ],
    gray: [
        { id: 'salt', name: '私盐', minPrice: 50, maxPrice: 500, risk: 0.25 },
        { id: 'weapons', name: '兵器', minPrice: 200, maxPrice: 2000, risk: 0.3 },
        { id: 'banned_books', name: '禁书', minPrice: 30, maxPrice: 300, risk: 0.2 },
        { id: 'stolen_goods', name: '赃物', minPrice: 10, maxPrice: 100, risk: 0.15 }
    ]
};

// 地点定义
const locations = [
    '清河坊', '凤凰山', '艮山门', '大井巷', '万松岭', '湖墅'
];

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
                gameState.day += 1;
                showEvent('过度劳累', '你最近太拼命了，过度劳累！健康-15，强制休息一天。');
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

// 初始化游戏
function initGame() {
    // 初始化市场价格
    initMarketPrices();
    
    // 更新统计数据
    updateStats();
    
    // 绑定事件
    bindEvents();
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
            const fluctuation = 0.9 + Math.random() * 0.2; // 价格波动范围：-10%到+10%
            let newPrice = Math.floor(currentPrice * fluctuation);
            
            // 确保价格在合理范围内
            newPrice = Math.max(product.minPrice, Math.min(product.maxPrice, newPrice));
            marketPrices[location].regular[product.id] = newPrice;
        });
        
        // 更新灰色商品价格
        products.gray.forEach(product => {
            const currentPrice = marketPrices[location].gray[product.id];
            const fluctuation = 0.85 + Math.random() * 0.3; // 价格波动范围：-15%到+15%
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
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('debt').textContent = Math.floor(gameState.debt);
    document.getElementById('health').textContent = gameState.health;
    
    // 检查游戏结束条件
    checkGameOver();
}

// 绑定事件
function bindEvents() {
    // 地点按钮点击事件
    const locationButtons = document.querySelectorAll('.location-btn');
    locationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const location = button.dataset.location;
            selectLocation(location);
        });
    });
    
    // 标签切换事件
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            selectTab(tab);
        });
    });
    
    // 下一天按钮点击事件
    document.getElementById('next-day-btn').addEventListener('click', nextDay);
    
    // 事件确认按钮点击事件
    document.getElementById('event-confirm').addEventListener('click', () => {
        document.getElementById('event-modal').classList.remove('active');
    });
    
    // 重新开始游戏按钮点击事件
    document.getElementById('restart-game').addEventListener('click', () => {
        location.reload();
    });
}

// 选择地点
function selectLocation(location) {
    // 如果今天已经访问过地点，不能再访问
    if (gameState.visitedToday) {
        showEvent('时间不够', '今天你已经去过一个地方了，无法再前往其他地点。请结束今天。');
        return;
    }
    
    // 更新当前地点
    gameState.currentLocation = location;
    gameState.visitedToday = true;
    
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
    if (!gameState.currentLocation) return;
    
    // 更新正规商品
    const regularGoodsList = document.getElementById('regular-goods');
    regularGoodsList.innerHTML = '';
    
    products.regular.forEach(product => {
        const price = marketPrices[gameState.currentLocation].regular[product.id];
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item';
        goodsItem.innerHTML = `
            <div>
                <div class="goods-name">${product.name}</div>
                <div class="goods-price">¥${price}</div>
            </div>
            <div class="goods-actions">
                <button class="buy-btn" data-id="${product.id}" data-type="regular">买入</button>
                <button class="sell-btn" data-id="${product.id}" data-type="regular">卖出</button>
            </div>
        `;
        regularGoodsList.appendChild(goodsItem);
    });
    
    // 更新灰色商品
    const grayGoodsList = document.getElementById('gray-goods');
    grayGoodsList.innerHTML = '';
    
    products.gray.forEach(product => {
        const price = marketPrices[gameState.currentLocation].gray[product.id];
        const goodsItem = document.createElement('div');
        goodsItem.className = 'goods-item gray-item';
        goodsItem.innerHTML = `
            <div>
                <div class="goods-name">${product.name}</div>
                <div class="goods-price">¥${price}</div>
                <div class="risk-warning">风险: ${Math.floor(product.risk * 100)}%</div>
            </div>
            <div class="goods-actions">
                <button class="buy-btn" data-id="${product.id}" data-type="gray">买入</button>
                <button class="sell-btn" data-id="${product.id}" data-type="gray">卖出</button>
            </div>
        `;
        grayGoodsList.appendChild(goodsItem);
    });
    
    // 绑定买入卖出按钮事件
    bindMarketButtons();
}

// 绑定市场按钮事件
function bindMarketButtons() {
    // 买入按钮点击事件
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const type = button.dataset.type;
            buyProduct(id, type);
        });
    });
    
    // 卖出按钮点击事件
    const sellButtons = document.querySelectorAll('.sell-btn');
    sellButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const type = button.dataset.type;
            sellProduct(id, type);
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
    
    const existingItem = gameState.inventory.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalCost += price;
    } else {
        gameState.inventory.push({
            id: id,
            name: product.name,
            type: type,
            quantity: 1,
            totalCost: price,
            risk: product.risk
        });
    }
    
    // 更新UI
    updateStats();
    updateInventory();
    
    // 如果是灰色商品，有概率触发风险事件
    if (type === 'gray') {
        const risk = product.risk;
        if (Math.random() < risk) {
            // 触发风险事件
            const riskEvent = events.risk[Math.floor(Math.random() * events.risk.length)];
            riskEvent.effect();
        }
    }
}

// 卖出商品
function sellProduct(id, type) {
    if (!gameState.currentLocation) return;
    
    // 检查库存中是否有该商品
    const inventoryItem = gameState.inventory.find(item => item.id === id);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        showEvent('库存不足', '你的库存中没有这个商品！');
        return;
    }
    
    // 获取售价
    const price = marketPrices[gameState.currentLocation][type][id];
    
    // 增加金钱
    gameState.money += price;
    
    // 从库存中减少
    inventoryItem.quantity -= 1;
    inventoryItem.totalCost -= inventoryItem.totalCost / (inventoryItem.quantity + 1);
    
    if (inventoryItem.quantity <= 0) {
        gameState.inventory = gameState.inventory.filter(item => item.id !== id);
    }
    
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
    
    gameState.inventory.forEach(item => {
        const inventoryItem = document.createElement('div');
        inventoryItem.className = 'inventory-item';
        inventoryItem.innerHTML = `
            <div class="item-name">${item.name} x ${item.quantity}</div>
            <div class="item-cost">成本: ¥${Math.floor(item.totalCost)}</div>
        `;
        inventoryList.appendChild(inventoryItem);
    });
}

// 下一天
function nextDay() {
    // 增加天数
    gameState.day += 1;
    
    // 计算债务利息
    gameState.debt *= 1.1; // 10%的日利率
    
    // 恢复健康值
    gameState.health = Math.min(100, gameState.health + 10);
    
    // 重置访问状态
    gameState.visitedToday = false;
    
    // 更新市场价格
    updateMarketPrices();
    
    // 更新UI
    updateStats();
    
    // 随机触发事件
    if (Math.random() < 0.35) { // 35%概率触发事件
        const eventTypes = ['business', 'health', 'risk', 'humor', 'war'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = events[eventType][Math.floor(Math.random() * events[eventType].length)];
        event.effect();
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
    // 检查是否达到最大天数
    if (gameState.day > gameState.maxDays) {
        endGame('时间到', `40天结束了！你的最终资产为${calculateTotalAssets()}文钱财，债务为${Math.floor(gameState.debt)}文。`);
        return;
    }
    
    // 检查健康值是否为0
    if (gameState.health <= 0) {
        endGame('健康崩溃', '你的健康值降至0，无法继续游戏！');
        return;
    }
    
    // 检查是否连续3天现金为负
    if (gameState.money < 0) {
        gameState.negativeDays = (gameState.negativeDays || 0) + 1;
        if (gameState.negativeDays >= 3) {
            endGame('破产', '你连续3天现金为负，被债主找上门来，游戏结束！');
            return;
        }
    } else {
        gameState.negativeDays = 0;
    }
    
    // 检查是否胜利
    if (gameState.debt <= 0 && calculateTotalAssets() >= 100000) {
        endGame('成功', `恭喜你！你已经还清债务，并且总资产达到了${calculateTotalAssets()}文钱财，成为临安城首富！`);
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
    const gameOverModal = document.getElementById('game-over-modal');
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-description').textContent = description;
    gameOverModal.classList.add('active');
}

// 初始化游戏
function initGame() {
    // 检查是否有难度设置
    const difficulty = localStorage.getItem('gameDifficulty');
    if (difficulty) {
        switch(difficulty) {
            case 'easy':
                gameState.money = 3000;
                break;
            case 'normal':
                gameState.money = 2000;
                break;
            case 'hard':
                gameState.money = 1000;
                break;
        }
    }
    
    // 初始化市场价格
    initMarketPrices();
    
    // 更新统计数据
    updateStats();
    
    // 绑定事件
    bindEvents();
}
// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
