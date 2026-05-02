// --- تهيئة قاعدة البيانات وربط المتغيرات (للملفات الخارجية) ---
const DB = {
    mindmapTree: {
        1: typeof Mind_Map !== 'undefined' ? Mind_Map.children : null,
        2: typeof Mind_Map_1 !== 'undefined' ? Mind_Map_1.children : null
    },
    qa: {
        1: typeof lessonQuestions !== 'undefined' ? lessonQuestions : null
    },
    cards: {
        1: typeof Flash_Cards !== 'undefined' ? Flash_Cards.map((item, i) => ({ _id: `c_${i}`, q: item.question, a: item.answer })) : null,
        2: typeof Flash_Cards_1 !== 'undefined' ? Flash_Cards_1.map((item, i) => ({ _id: `c1_${i}`, q: item.question, a: item.answer })) : null
    },
    tf: {
        1: typeof True_False !== 'undefined' ? True_False.map((item, i) => ({ _id: `tf_${i}`, q: item.text, a: item.answer, exp: item.explanation })) : null,
        2: typeof True_False_1 !== 'undefined' ? True_False_1.map((item, i) => ({ _id: `tf1_${i}`, q: item.text, a: item.answer, exp: item.explanation })) : null
    },
    mcq: {
        1: typeof Multiple_Choice !== 'undefined' ? Multiple_Choice.map((item, i) => ({ _id: `m_${i}`, q: item.q, opts: item.options, correct: item.correctIndex, exp: item.rationale })) : null,
        2: typeof Multiple_Choice_1 !== 'undefined' ? Multiple_Choice_1.map((item, i) => ({ _id: `m1_${i}`, q: item.q, opts: item.options, correct: item.correctIndex, exp: item.rationale })) : null
    },
    fill: {
        1: typeof Fill_Blank !== 'undefined' ? Fill_Blank.map((item, i) => ({ _id: `f_${i}`, q: item.text, a: item.answer })) : null,
        2: typeof Fill_Blank_1 !== 'undefined' ? Fill_Blank_1.map((item, i) => ({ _id: `f1_${i}`, q: item.text, a: item.answer })) : null
    },
    comp: {
        1: typeof Compare !== 'undefined' ? Compare : null,
        2: typeof Compare_1 !== 'undefined' ? Compare_1 : null
    }
};

// --- المظاهر ---
const THEMES = [
    { 
        name: "الأخضر الغابي (فاتح)", 
        vars: { 
            '--bg-main': '#DADADA', 
            '--bg-panel': '#DADADA', 
            '--bg-panel-solid': '#DADADA', 
            '--bg-panel-hover': '#c4c4c4', 
            '--border-color': '#4C6054', 
            '--accent-primary': '#4C6054', 
            '--accent-text': '#ffffff', 
            '--text-main': '#111111', 
            '--text-muted': '#4C6054', 
            '--accent-green': '#059669', 
            '--accent-danger': '#ef4444' 
        } 
    },
    { 
        name: "الأخضر الرمادي", 
        vars: { '--bg-main': 'linear-gradient(135deg, #71897b 0%, #4b6856 100%)', '--bg-panel': 'rgba(245, 247, 245, 0.9)', '--bg-panel-solid': '#f4f7f5', '--bg-panel-hover': '#e2e8e4', '--border-color': '#4b6856', '--accent-primary': '#283b2f', '--accent-text': '#ffffff', '--text-main': '#111111', '--text-muted': '#4b6856', '--accent-green': '#059669', '--accent-danger': '#ef4444' } 
    },
    { 
        name: "الوضع الليلي", 
        vars: { 
            '--bg-main': '#000000', 
            '--bg-panel': '#000000', 
            '--bg-panel-solid': '#000000', 
            '--bg-panel-hover': '#111111', 
            '--border-color': '#4C6054', 
            '--accent-primary': '#4C6054', 
            '--accent-text': '#DADADA', 
            '--text-main': '#DADADA', 
            '--text-muted': '#8a9f91', 
            '--accent-green': '#059669', 
            '--accent-danger': '#ef4444' 
        } 
    },
    { 
        name: "الرمادي", 
        vars: { '--bg-main': 'hsl(210, 13%, 95%)', '--bg-panel': 'hsl(204, 12.2%, 91.96%)', '--bg-panel-solid': 'hsl(210, 13%, 88%)', '--bg-panel-hover': 'hsl(204, 12%, 75%)', '--border-color': 'hsl(204, 12%, 65%)', '--accent-primary': 'hsl(203, 12%, 35%)', '--accent-text': '#ffffff', '--text-main': '#333333', '--text-muted': '#8d8d8d', '--accent-green': '#059669', '--accent-danger': '#a94442' } 
    }
];

const StateManager = {
    saveState: function(stateObj) { localStorage.setItem('exam_app_state', JSON.stringify(stateObj)); },
    loadState: function() { const saved = localStorage.getItem('exam_app_state'); return saved ? JSON.parse(saved) : null; },
    getAllTreeNodes: function() {
        let allIds = [];
        const extract = (nodes) => {
            if(!nodes) return;
            nodes.forEach(n => {
                const safeTitle = n.title ? String(n.title) : 'unknown';
                const nodeId = `node_${btoa(unescape(encodeURIComponent(safeTitle))).replace(/[^a-zA-Z0-9]/g, '')}`;
                allIds.push(nodeId);
                if(n.children) extract(n.children);
            });
        };
        if(DB.mindmapTree[1]) extract(DB.mindmapTree[1]);
        if(DB.mindmapTree[2]) extract(DB.mindmapTree[2]);
        return allIds;
    },
    saveMindmap: function(expandedNodes, scrollPos) { localStorage.setItem('exam_mindmap_state', JSON.stringify({ expandedNodes, scrollPos })); },
    loadMindmap: function() { const saved = localStorage.getItem('exam_mindmap_state'); return saved ? JSON.parse(saved) : { expandedNodes: this.getAllTreeNodes(), scrollPos: 0 }; },
    saveQuestionOrder: function(tabKey, setNum, array) { const orderKey = `order_${tabKey}_${setNum}`; const orderIds = array.map(item => item._id); localStorage.setItem(orderKey, JSON.stringify(orderIds)); },
    loadQuestionOrder: function(tabKey, setNum) { const orderKey = `order_${tabKey}_${setNum}`; const saved = localStorage.getItem(orderKey); return saved ? JSON.parse(saved) : null; },
    clearTabState: function(tabKey) {
        let currentState = this.loadState() || {};
        if(tabKey === 'cards') { currentState.cardsIdx = 0; currentState.cardsFlipped = false; localStorage.removeItem(`order_cards_${currentState.activeSet.cards}`); }
        if(tabKey === 'tf') { currentState.tfIdx = 0; currentState.tfScore = 0; currentState.tfChecked = false; currentState.tfSelected = null; localStorage.removeItem(`order_tf_${currentState.activeSet.tf}`); }
        if(tabKey === 'mcq') { currentState.mcqIdx = 0; currentState.mcqScore = 0; currentState.mcqChecked = false; currentState.mcqSelected = null; localStorage.removeItem(`order_mcq_${currentState.activeSet.mcq}`); }
        if(tabKey === 'fill') { currentState.fillIdx = 0; currentState.fillScore = 0; currentState.fillChecked = false; currentState.fillVal = ''; currentState.fillScoreAdded = false; localStorage.removeItem(`order_fill_${currentState.activeSet.fill}`); }
        if(tabKey === 'comp') { currentState.compIdx = 0; currentState.compChecked = false; }
        this.saveState(currentState);
    }
};

let State = {
    tab: 'mindmap', 
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
    activeSet: { mindmap: 1, qa: 1, tf: 1, cards: 1, mcq: 1, fill: 1, comp: 1 }, 
    cardsIdx: 0, cardsFlipped: false,
    tfIdx: 0, tfSelected: null, tfChecked: false, tfScore: 0,
    mcqIdx: 0, mcqSelected: null, mcqChecked: false, mcqScore: 0,
    fillIdx: 0, fillVal: '', fillChecked: false, fillScore: 0, fillScoreAdded: false,
    compIdx: 0, compChecked: true, 
    isExamActive: { cards: false, tf: false, mcq: false, fill: false } 
};

const savedState = StateManager.loadState();
if (savedState) { State = { ...State, ...savedState }; State.compChecked = true; }

const DOM = {
    app: document.getElementById('app-container'), 
    content: document.getElementById('content-area'),
    tabs: document.querySelectorAll('.pill-btn'), 
    themeSelect: document.getElementById('theme-select'), 
    btnFontUp: document.getElementById('btn-font-up'), 
    btnFontDown: document.getElementById('btn-font-down'),
    btnReset: document.getElementById('btn-reset'), 
    settingsModal: document.getElementById('settings-modal'),
    settingsModalContent: document.getElementById('settings-modal-content'),
    navModal: document.getElementById('nav-modal'),
    navModalContent: document.getElementById('nav-modal-content'),
    headerWrapper: document.getElementById('header-wrapper')
};

function updateTabCounters() {
    const keys = ['cards', 'tf', 'mcq', 'fill', 'comp'];
    const counts = {};
    keys.forEach(key => {
        if (DB[key]) {
            const c1 = DB[key][1] ? DB[key][1].length : 0;
            const c2 = DB[key][2] ? DB[key][2].length : 0;
            counts[key] = (c1 > 0 && c2 > 0) ? `${c1} + ${c2}` : (c1 + c2);
        }
    });

    if(DOM.tabs) {
        DOM.tabs.forEach(btn => { 
            if(counts[btn.dataset.tab] !== undefined) btn.textContent = btn.textContent.split(' (')[0] + ` (${counts[btn.dataset.tab]})`; 
        });
    }
}

function shuffleArray(array) { 
    if(!array) return; 
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    } 
}

function randomizeAllQuestions() { 
    Object.keys(DB).forEach(key => {
        if (['cards', 'tf', 'mcq', 'fill'].includes(key) && DB[key]) {
            [1, 2].forEach(setNum => {
                if(DB[key][setNum]) {
                    const savedOrder = StateManager.loadQuestionOrder(key, setNum);
                    if (savedOrder && State.isExamActive[key]) {
                        DB[key][setNum].sort((a, b) => savedOrder.indexOf(a._id) - savedOrder.indexOf(b._id));
                    } else {
                        shuffleArray(DB[key][setNum]);
                    }
                }
            });
        }
    });
}

function openModal(modal, content) {
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeModal(modal, content) {
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function initApp() {
    randomizeAllQuestions(); 
    updateTabCounters(); 
    applyFontSize();
    
    const savedTheme = localStorage.getItem('selectedThemeIdx');
    if(DOM.themeSelect) DOM.themeSelect.value = savedTheme !== null && THEMES[savedTheme] ? savedTheme : 0;
    applyTheme(DOM.themeSelect ? parseInt(DOM.themeSelect.value) : 0);

    document.getElementById('top-settings-btn')?.addEventListener('click', () => openModal(DOM.settingsModal, DOM.settingsModalContent));
    document.getElementById('close-settings-btn')?.addEventListener('click', () => closeModal(DOM.settingsModal, DOM.settingsModalContent));

    document.getElementById('top-nav-btn')?.addEventListener('click', () => openModal(DOM.navModal, DOM.navModalContent));
    document.getElementById('close-nav-btn')?.addEventListener('click', () => closeModal(DOM.navModal, DOM.navModalContent));

    [DOM.settingsModal, DOM.navModal].forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if(e.target === modal) closeModal(modal, modal.firstElementChild);
            });
        }
    });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50 && currentScrollY > lastScrollY) {
            DOM.headerWrapper.classList.add('-translate-y-full');
        } else {
            DOM.headerWrapper.classList.remove('-translate-y-full');
        }
        lastScrollY = currentScrollY;
    });

    if(DOM.btnReset) {
        DOM.btnReset.addEventListener('click', () => {
            if(confirm("⚠️ هل أنت متأكد من رغبتك في إعادة ضبط التطبيق بالكامل؟ سيتم مسح جميع الإجابات والترتيب المحفوظ.")) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    if(DOM.themeSelect) DOM.themeSelect.addEventListener('change', (e) => applyTheme(parseInt(e.target.value)));
    if(DOM.btnFontUp) DOM.btnFontUp.addEventListener('click', () => changeFont(1));
    if(DOM.btnFontDown) DOM.btnFontDown.addEventListener('click', () => changeFont(-1));
    
    if(DOM.tabs) {
        DOM.tabs.forEach(btn => {
            if(btn.dataset.tab === State.tab) btn.classList.add('active'); 
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                DOM.tabs.forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.tab === targetTab) b.classList.add('active');
                });
                State.tab = targetTab; 
                StateManager.saveState(State);
                if (DOM.navModal && !DOM.navModal.classList.contains('hidden')) { closeModal(DOM.navModal, DOM.navModalContent); }
                renderTab();
            });
        });
    }
    renderTab();
}

function applyTheme(idx) {
    const theme = THEMES[idx]; 
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) { root.style.setProperty(key, value); }
    localStorage.setItem('selectedThemeIdx', idx);
}

function changeFont(val) { 
    State.fontSize = Math.max(12, Math.min(24, State.fontSize + val)); 
    localStorage.setItem('fontSize', State.fontSize); 
    applyFontSize(); 
}

function applyFontSize() { document.documentElement.style.fontSize = State.fontSize + 'px'; }

window.switchSet = function(tabKey, setNum) {
    State.activeSet[tabKey] = setNum;
    StateManager.saveState(State);
    window.restartQuiz(tabKey); 
    updateTabCounters();
    renderTab();
};

function getSetButtonsHTML(tabKey) {
    if (tabKey === 'qa') return ''; 
    const active = State.activeSet[tabKey];
    return `
        <div class="flex gap-1" dir="rtl">
            <button class="w-6 h-6 flex justify-center items-center rounded text-xs font-black transition-all ${active === 1 ? 'bg-[color:var(--accent-primary)] text-[color:var(--accent-text)]' : 'bg-[color:var(--accent-primary)]/30 text-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--accent-text)]'}" onclick="window.switchSet('${tabKey}', 1)">1</button>
            <button class="w-6 h-6 flex justify-center items-center rounded text-xs font-black transition-all ${active === 2 ? 'bg-[color:var(--accent-primary)] text-[color:var(--accent-text)]' : 'bg-[color:var(--accent-primary)]/30 text-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--accent-text)]'}" onclick="window.switchSet('${tabKey}', 2)">2</button>
        </div>
    `;
}

function renderTab() {
    if(!DOM.content) return; 
    let html = '';
    
    if (State.tab !== 'mindmap' && document.getElementById('mindmap-container')) {
        const mindmapState = StateManager.loadMindmap();
        mindmapState.scrollPos = window.scrollY;
        StateManager.saveMindmap(mindmapState.expandedNodes, mindmapState.scrollPos);
    }

    switch(State.tab) { 
        case 'mindmap': html = renderMindmap(); break; 
        case 'qa': html = renderQA(); break; 
        case 'cards': html = renderCards(); break; 
        case 'tf': html = renderTF(); break; 
        case 'mcq': html = renderMCQ(); break; 
        case 'fill': html = renderFill(); break; 
        case 'comp': html = renderComp(); break; 
    }
    
    DOM.content.innerHTML = `<div class="animate-fade-in">${html}</div>`; 
    attachDynamicListeners();

    if (State.tab === 'mindmap') {
        const mindmapState = StateManager.loadMindmap();
        window.scrollTo({ top: mindmapState.scrollPos, behavior: 'instant' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getProgressBar(current, total, tabKey) {
    const perc = total > 0 ? ((current) / total) * 100 : 0;
    let setBtns = getSetButtonsHTML(tabKey);
    return `
        <div class="flex justify-between items-center text-xs font-bold text-[color:var(--text-muted)] mb-1">
            <div class="flex items-center gap-2"><span>مؤشر التقدم</span>${setBtns}</div>
            <span>${current + 1 > total ? total : current + 1} / ${total}</span>
        </div>
        <div class="progress-container mb-3"><div class="progress-bar bg-[color:var(--accent-primary)]" style="width: ${perc}%"></div></div>
    `;
}

function renderFinishScreen(title, score, total, tabKey) {
    const perc = total > 0 ? Math.round((score / total) * 100) : 0;
    return `
        <div class="text-center py-6 flex flex-col items-center animate-fade-in">
            <div class="text-5xl mb-4">🏆</div>
            <h2 class="text-xl font-black mb-2 text-[color:var(--accent-primary)]">إنجاز قسم: ${title}</h2>
            <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] rounded-2xl p-6 mb-6 w-full max-w-xs shadow-sm mx-auto">
                <div class="text-4xl font-black text-[color:var(--accent-primary)] mb-2">${score} <span class="text-xl text-[color:var(--text-muted)] opacity-60">/ ${total}</span></div>
                <div class="text-sm font-bold text-[color:var(--text-muted)] bg-[color:var(--bg-panel)] py-1 px-4 rounded-full border border-[color:var(--border-color)] inline-block">النسبة: ${perc}%</div>
            </div>
            <button class="action-btn max-w-xs text-sm py-3" onclick="window.restartQuiz('${tabKey}')">🔄 إعادة الاختبار</button>
        </div>
    `;
}

window.toggleNode = function(element, nodeId) { 
    const ul = element.nextElementSibling; 
    const icon = element.querySelector('.toggle-icon'); 
    
    if (ul && ul.tagName === 'UL') { 
        ul.classList.toggle('hidden'); 
        if (icon) icon.textContent = ul.classList.contains('hidden') ? '+' : '−'; 
        
        const mindmapState = StateManager.loadMindmap();
        let expanded = new Set(mindmapState.expandedNodes);
        if (!ul.classList.contains('hidden')) {
            expanded.add(nodeId);
        } else {
            expanded.delete(nodeId);
        }
        StateManager.saveMindmap(Array.from(expanded), window.scrollY);
    } 
};

function buildTreeHTML(node, level = 0, expandedNodes = new Set()) {
    const hasChildren = node.children && node.children.length > 0; 
    const safeTitle = node.title ? String(node.title) : 'unknown';
    const nodeId = `node_${btoa(unescape(encodeURIComponent(safeTitle))).replace(/[^a-zA-Z0-9]/g, '')}`; 
    const isExpanded = expandedNodes.has(nodeId);
    
    const toggleIcon = hasChildren ? `<span class="toggle-icon">${isExpanded ? '−' : '+'}</span>` : ''; 
    const pointerClass = hasChildren ? 'cursor-pointer' : 'cursor-default'; 
    const rootClass = level === 0 ? 'root-node' : '';
    
    let html = `
        <li class="tree-node">
            <div class="tree-content text-sm ${rootClass} ${pointerClass}" ${hasChildren ? `onclick="window.toggleNode(this, '${nodeId}')"` : ''}>
                <span>${node.title}</span>${toggleIcon}
            </div>
    `;
    
    if (hasChildren) { 
        html += `<ul class="tree-list pr-6 mt-2 transition-all ${isExpanded ? '' : 'hidden'}">`; 
        node.children.forEach(child => { html += buildTreeHTML(child, level + 1, expandedNodes); }); 
        html += `</ul>`; 
    }
    return html + `</li>`;
}

function renderMindmap() {
    const active = State.activeSet.mindmap;
    const currentData = DB.mindmapTree[active];
    
    const headerBtns = `
        <div class="flex justify-center items-center gap-2 mb-4">
            <span class="text-xs font-bold text-[color:var(--text-muted)]">اختر المشجرة:</span>
            ${getSetButtonsHTML('mindmap')}
        </div>
    `;

    if(!currentData || currentData.length === 0) return headerBtns + '<div class="text-center p-4">لا توجد بيانات للمشجرة في هذه المجموعة</div>';
    
    const mindmapState = StateManager.loadMindmap();
    const expandedSet = new Set(mindmapState.expandedNodes);

    let treeHTML = `<ul class="tree-list root-list pr-0" id="mindmap-container">`; 
    currentData.forEach(node => { treeHTML += buildTreeHTML(node, 0, expandedSet); }); 
    treeHTML += `</ul>`;
    
    return `
        ${headerBtns}
        <div class="mb-4 text-center bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-2 rounded-xl">
            <p class="text-xs font-bold text-[color:var(--text-muted)]">انقر على العُقَد للتوسيع والطي.</p>
        </div>
        <div class="overflow-x-auto pb-4 px-1">${treeHTML}</div>
    `;
}

function renderQA() {
    const active = State.activeSet.qa || 1; 
    const currentData = DB.qa[active];
    if(!currentData || currentData.length === 0) return '<div class="text-center p-4">لا توجد بيانات للأسئلة</div>';

    let html = '';
    
    currentData.forEach((section, secIndex) => {
        const isActive = secIndex === 0 ? 'active' : '';
        html += `
            <div class="accordion-item ${isActive}">
                <button class="accordion-header bg-[color:var(--accent-primary)] text-white w-full flex justify-between items-center font-black text-sm md:text-base py-3 px-4 focus:outline-none border-none">
                    <span>📚 ${section.lesson}</span>
                    <span class="accordion-icon font-black text-white bg-black/20">▼</span>
                </button>
                <div class="accordion-body">
                    <div class="p-3 md:p-5 flex flex-col gap-4">
        `;
        
        section.questions.forEach((item, index) => {
            const isLast = index === section.questions.length - 1;
            const borderClass = isLast ? '' : 'border-b border-dashed border-[color:var(--border-color)] pb-4 mb-4';
            
            html += `
                <div class="${borderClass}">
                    <div class="text-base md:text-lg font-black text-[color:var(--accent-primary)] mb-2 flex items-start gap-2">
                        <span class="inline-flex shrink-0 items-center justify-center bg-[color:var(--bg-panel)] px-2 py-0.5 rounded text-xs border border-[color:var(--border-color)] shadow-sm">س ${index + 1}</span>
                        <span class="leading-relaxed">${item.q}</span>
                    </div>
                    <div class="text-base md:text-lg font-bold leading-relaxed text-[color:var(--text-main)] bg-[color:var(--bg-panel-solid)] p-3 rounded-lg border-r-4 border-[color:var(--accent-green)] shadow-sm mr-2 md:mr-8">
                        ${item.a}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div></div>`;
    });
    return `<div class="pb-4">${html}</div>`;
}

function renderCards() {
    const active = State.activeSet.cards;
    const currentData = DB.cards[active];
    if(!currentData || currentData.length === 0) return getProgressBar(0, 0, 'cards') + '<div class="text-center p-4">لا توجد بطاقات</div>';
    if (State.cardsIdx >= currentData.length) return renderFinishScreen('البطاقات الذكية', currentData.length, currentData.length, 'cards');
    
    const data = currentData[State.cardsIdx];
    return `
        ${getProgressBar(State.cardsIdx, currentData.length, 'cards')}
        <div class="flip-card mt-6 mb-6" id="action-flip">
            <div class="flip-card-inner ${State.cardsFlipped ? 'rotate-y-180' : ''}" style="transform: ${State.cardsFlipped ? 'rotateY(180deg)' : 'none'}">
                <div class="flip-card-front shadow-sm"><div class="text-lg md:text-xl font-black leading-relaxed text-center">${data.q}</div></div>
                <div class="flip-card-back shadow-md"><div class="text-lg md:text-xl font-black leading-relaxed text-center">${data.a}</div></div>
            </div>
        </div>
        <div class="flex justify-center gap-2 mt-4">
            <button class="action-btn text-sm py-2 max-w-[100px] bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] border border-[color:var(--border-color)] shadow-sm" onclick="window.move(-1)" ${State.cardsIdx === 0 ? 'disabled' : ''}>السابق</button>
            <button class="action-btn text-sm py-2 max-w-[150px] shadow-sm" id="btn-next">التالي</button>
        </div>
    `;
}

function renderTF() {
    const active = State.activeSet.tf;
    const currentData = DB.tf[active];
    if(!currentData || currentData.length === 0) return getProgressBar(0, 0, 'tf') + '<div class="text-center p-4">لا توجد بيانات</div>';
    if (State.tfIdx >= currentData.length) return renderFinishScreen('الصواب والخطأ', State.tfScore, currentData.length, 'tf');
    
    const data = currentData[State.tfIdx]; 
    let msgHTML = '';
    
    if (State.tfChecked) {
        const isCorrect = State.tfSelected === data.a;
        msgHTML = `
            <div class="p-3 mt-4 rounded-xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
                <div class="font-black text-sm text-center mb-2">${isCorrect ? '✅ دقيق!' : '❌ خطأ! الجواب: ' + (data.a ? 'صواب' : 'خطأ')}</div>
                ${data.exp ? `<div class="pt-2 border-t border-white/30 text-xs font-bold leading-relaxed text-right">💡 ${data.exp}</div>` : ''}
            </div>
        `;
    }

    // تطبيق ألوان الإجابات مثل الخيارات المتعددة (الأخضر للصحيح والأحمر للخاطئ)
    let trueClasses = "opt-btn p-3 rounded-xl font-black text-base md:text-lg transition-all ";
    let falseClasses = "opt-btn p-3 rounded-xl font-black text-base md:text-lg transition-all ";

    if (State.tfChecked) {
        if (data.a === true) trueClasses += "correct";
        else if (State.tfSelected === true) trueClasses += "wrong";
        else trueClasses += "opacity-50 grayscale";

        if (data.a === false) falseClasses += "correct";
        else if (State.tfSelected === false) falseClasses += "wrong";
        else falseClasses += "opacity-50 grayscale";
    } else {
        if (State.tfSelected === true) trueClasses += "selected";
        if (State.tfSelected === false) falseClasses += "selected";
    }
    
    return `
        ${getProgressBar(State.tfIdx, currentData.length, 'tf')}
        <div class="relative bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 md:p-6 rounded-2xl mt-5 mb-4">
            <div class="absolute -top-3 right-4 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-3 py-1 rounded-lg text-xs font-black border border-[color:var(--bg-panel)]">صح / خطأ؟</div>
            <h3 class="text-lg md:text-xl font-black text-center leading-relaxed mt-2">${data.q}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <button class="${trueClasses}" data-val="true">✅ صواب</button>
            <button class="${falseClasses}" data-val="false">❌ خطأ</button>
        </div>
        ${msgHTML}
        <div class="flex justify-center mt-5">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.tfChecked ? 'disabled' : ''}>${State.tfIdx === currentData.length - 1 ? 'إنهاء الاختبار' : 'التالي'}</button>
        </div>
    `;
}

function renderMCQ() {
    const active = State.activeSet.mcq;
    const currentData = DB.mcq[active];
    if(!currentData || currentData.length === 0) return getProgressBar(0, 0, 'mcq') + '<div class="text-center p-4">لا توجد بيانات</div>';
    if (State.mcqIdx >= currentData.length) return renderFinishScreen('الاختيار من متعدد', State.mcqScore, currentData.length, 'mcq');
    
    const data = currentData[State.mcqIdx]; 
    let msgHTML = '';
    let optsHTML = data.opts.map((opt, i) => {
        let classes = "opt-btn p-2 rounded-xl font-bold text-right mb-1 block w-full text-base md:text-lg transition-all ";
        if (State.mcqChecked) { 
            if (i === data.correct) classes += "correct"; 
            else if (i === State.mcqSelected) classes += "wrong"; 
            else classes += "opacity-50 grayscale"; 
        } else if (State.mcqSelected === i) { classes += "selected"; }
        return `<button class="${classes}" data-idx="${i}"><span class="inline-block bg-[color:var(--bg-main)] text-[color:var(--text-main)] rounded px-2 py-0.5 text-xs ml-2 border border-[color:var(--border-color)]">${String.fromCharCode(1613 + i)}</span> ${opt}</button>`;
    }).join('');
    
    if (State.mcqChecked) {
        const isCorrect = State.mcqSelected === data.correct;
        msgHTML = `
            <div class="p-3 mt-4 rounded-xl border-2 animate-fade-in ${isCorrect ? 'bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)]' : 'bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)]'}">
                <div class="font-black text-sm text-center mb-2">${isCorrect ? '✅ صح!' : '❌ خطأ!'}</div>
                ${data.exp ? `<div class="pt-2 border-t border-white/30 text-xs font-bold leading-relaxed text-right">💡 ${data.exp}</div>` : ''}
            </div>
        `;
    }
    
    return `
        ${getProgressBar(State.mcqIdx, currentData.length, 'mcq')}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] border-r-4 border-r-[color:var(--accent-primary)] p-4 rounded-xl mt-4 mb-4"><h3 class="text-lg md:text-xl font-black leading-relaxed">${data.q}</h3></div>
        <div class="mt-2">${optsHTML}</div>
        ${msgHTML}
        <div class="flex justify-center mt-5">
            <button class="action-btn max-w-xs text-sm py-3" id="btn-next" ${!State.mcqChecked ? 'disabled' : ''}>${State.mcqIdx === currentData.length - 1 ? 'إنهاء الاختبار' : 'التالي'}</button>
        </div>
    `;
}

function renderFill() {
    const active = State.activeSet.fill;
    const currentData = DB.fill[active];
    if(!currentData || currentData.length === 0) return getProgressBar(0, 0, 'fill') + '<div class="text-center p-4">لا توجد بيانات</div>';
    if (State.fillIdx >= currentData.length) return renderFinishScreen('املأ الفراغ', State.fillScore, currentData.length, 'fill');
    
    const data = currentData[State.fillIdx]; 
    const textHTML = data.q.replace(/_+/g, `<span class="inline-block border-b-2 border-dashed border-[color:var(--accent-primary)] w-20 mx-2 align-middle h-6 text-[color:var(--text-muted)] bg-[color:var(--bg-main)] rounded-t"></span>`);
    
    let inputBoxHTML = '';
    if(State.fillChecked) {
        const userVal = State.fillVal.trim(); 
        let isCorrect = false, correctAnswer = '';
        if (Array.isArray(data.a)) { isCorrect = data.a.some(ans => ans.trim() === userVal || userVal.includes(ans.trim())); correctAnswer = data.a[0]; } 
        else { isCorrect = userVal !== '' && (data.a.includes(userVal) || userVal.includes(data.a)); correctAnswer = data.a; }

        if (isCorrect) { inputBoxHTML = `<div class="input-stylish w-full text-center text-base md:text-lg font-black py-3 bg-[color:var(--accent-green)] text-white border-[color:var(--accent-green)] shadow-sm animate-fade-in cursor-default">🎉 إجابة صحيحة: ${userVal}</div>`; } 
        else { inputBoxHTML = `<div class="input-stylish w-full text-center text-base md:text-lg font-black py-2 bg-[color:var(--accent-danger)] text-white border-[color:var(--accent-danger)] shadow-sm animate-fade-in flex flex-col justify-center items-center gap-1 cursor-default">${userVal ? `<span class="line-through opacity-75 text-xs">❌ إجابتك: ${userVal}</span>` : ''}<span class="text-sm md:text-base">💡 الصواب: ${correctAnswer}</span></div>`; }
    } else {
        inputBoxHTML = `<input type="text" id="fill-input" class="input-stylish text-center text-base md:text-lg font-black py-3 w-full shadow-sm focus:ring-2 focus:ring-[color:var(--accent-primary)] transition-all" placeholder="اكتب الكلمة هنا..." value="${State.fillVal}" autocomplete="off">`;
    }
    
    return `
        ${getProgressBar(State.fillIdx, currentData.length, 'fill')}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 md:p-6 rounded-xl mt-4 mb-6 text-center shadow-sm"><div class="text-lg md:text-xl font-black leading-loose">${textHTML}</div></div>
        <div class="relative w-full max-w-md mx-auto mb-2">${inputBoxHTML}</div>
        ${!State.fillChecked ? `<div class="flex justify-center mt-6"><button class="action-btn max-w-xs bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] text-sm py-3 border-2 border-[color:var(--border-color)] hover:bg-[color:var(--bg-panel-hover)] transition-all shadow-sm flex items-center justify-center gap-2" id="btn-check"><span class="text-xl">✔️</span> تحقق من الإجابة</button></div>` : ''}
        <div class="flex justify-center mt-6 pt-4 border-t border-dashed border-[color:var(--border-color)]"><button class="action-btn max-w-xs text-sm py-3 shadow-md" id="btn-next" ${!State.fillChecked ? 'disabled' : ''}>${State.fillIdx === currentData.length - 1 ? '🏁 إنهاء القسم' : 'التالية'}</button></div>
    `;
}

function renderComp() {
    const active = State.activeSet.comp;
    const currentData = DB.comp[active];
    if(!currentData || currentData.length === 0) return getProgressBar(0, 0, 'comp') + '<div class="text-center p-4">لا توجد بيانات</div>';
    if (State.compIdx >= currentData.length) return renderFinishScreen('المقارنات', currentData.length, currentData.length, 'comp');
    
    const data = currentData[State.compIdx]; 
    
    if (!data.criteria && data.q && data.a) {
        return `
            ${getProgressBar(State.compIdx, currentData.length, 'comp')}
            <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-6 rounded-2xl mt-10 mb-8 shadow-sm">
                <h3 class="text-xl font-black text-center text-[color:var(--accent-primary)] leading-relaxed"> ${data.q} </h3>
            </div>
            <div class="mt-4 border-t-2 border-dashed border-[color:var(--border-color)] pt-8 animate-fade-in relative">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] px-6 py-1 rounded-full font-black text-sm border-2 border-[color:var(--bg-panel)]">تفاصيل المقارنة</div>
                <div class="grid grid-cols-1 gap-6 mt-4">
                    <div class="p-6 bg-[color:var(--bg-panel-solid)] text-[color:var(--text-main)] rounded-2xl font-bold text-lg text-center leading-relaxed flex items-center justify-center min-h-[120px] border-2 border-[color:var(--accent-green)] relative">
                        ${data.a}
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-12"><button class="action-btn max-w-sm text-xl py-4 shadow-md" id="btn-next">${State.compIdx === currentData.length - 1 ? 'إنهاء القسم' : 'التالية'}</button></div>
        `;
    }

    let colA_HTML = data.criteria.map((c) => `
        <div class="mb-4 last:mb-0">
            <div class="text-sm md:text-base font-black text-[color:var(--accent-primary)] mb-2 border-b border-dashed border-[color:var(--border-color)] pb-1">▪️ ${c.label}</div>
            <div class="p-2 text-base leading-relaxed text-right font-bold animate-fade-in bg-transparent border-none">${c.answerA}</div>
        </div>
    `).join('');

    let colB_HTML = data.criteria.map((c) => `
        <div class="mb-4 last:mb-0">
            <div class="text-sm md:text-base font-black text-[color:var(--accent-primary)] mb-2 border-b border-dashed border-[color:var(--border-color)] pb-1">▪️ ${c.label}</div>
            <div class="p-2 text-base leading-relaxed text-right font-bold animate-fade-in bg-transparent border-none">${c.answerB}</div>
        </div>
    `).join('');
    
    return `
        ${getProgressBar(State.compIdx, currentData.length, 'comp')}
        <div class="bg-[color:var(--bg-panel-solid)] border-2 border-[color:var(--border-color)] p-4 rounded-xl mt-4 mb-6 shadow-sm"><h3 class="text-lg md:text-xl font-black text-center text-[color:var(--accent-primary)] leading-relaxed">${data.title}</h3></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-[color:var(--bg-panel-solid)] rounded-xl border-2 border-[color:var(--border-color)] overflow-hidden shadow-sm flex flex-col animate-fade-in"><div class="bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] text-center font-black text-sm md:text-base py-3 px-4">${data.caseA_label}</div><div class="p-4 bg-[color:var(--bg-main)] flex-1">${colA_HTML}</div></div>
            <div class="bg-[color:var(--bg-panel-solid)] rounded-xl border-2 border-[color:var(--border-color)] overflow-hidden shadow-sm flex flex-col animate-fade-in" style="animation-delay: 0.1s"><div class="bg-[color:var(--accent-primary)] text-[color:var(--accent-text)] text-center font-black text-sm md:text-base py-3 px-4">${data.caseB_label}</div><div class="p-4 bg-[color:var(--bg-main)] flex-1">${colB_HTML}</div></div>
        </div>
        <div class="flex justify-center mt-6 pt-4 border-t border-dashed border-[color:var(--border-color)]"><button class="action-btn max-w-xs text-sm py-3 shadow-md" id="btn-next">${State.compIdx === currentData.length - 1 ? '🏁 إنهاء القسم' : 'التالية'}</button></div>
    `;
}

function freezeOrderIfNeeded(tab) {
    if (['cards', 'tf', 'mcq', 'fill'].includes(tab) && !State.isExamActive[tab]) {
        State.isExamActive[tab] = true;
        StateManager.saveQuestionOrder(tab, State.activeSet[tab], DB[tab][State.activeSet[tab]]);
    }
}

function attachDynamicListeners() {
    const next = document.getElementById('btn-next'); 
    const check = document.getElementById('btn-check'); 
    const flip = document.getElementById('action-flip'); 
    const fillInp = document.getElementById('fill-input');
    
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => header.parentElement.classList.toggle('active'));
    });
    
    if(next) next.addEventListener('click', () => window.move(1));
    
    if(check) {
        check.addEventListener('click', () => { 
            const active = State.activeSet[State.tab];
            freezeOrderIfNeeded(State.tab); 
            
            if(State.tab === 'fill' && !State.fillChecked) {
                const data = DB.fill[active][State.fillIdx];
                const userVal = State.fillVal.trim();
                let isCorrect = false;
                if (Array.isArray(data.a)) { isCorrect = data.a.some(ans => ans.trim() === userVal || userVal.includes(ans.trim())); } 
                else { isCorrect = userVal !== '' && (data.a.includes(userVal) || userVal.includes(data.a)); }

                if(isCorrect && !State.fillScoreAdded) { State.fillScore++; State.fillScoreAdded = true; }
                State.fillChecked = true; 
            }
            StateManager.saveState(State);
            renderTab(); 
        });
    }
    
    if(fillInp) fillInp.addEventListener('input', (e) => { State.fillVal = e.target.value; StateManager.saveState(State); });
    
    if(flip) {
        flip.addEventListener('click', () => { 
            freezeOrderIfNeeded(State.tab);
            State.cardsFlipped = !State.cardsFlipped; 
            StateManager.saveState(State);
            renderTab(); 
        });
    }
    
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const active = State.activeSet[State.tab];
            freezeOrderIfNeeded(State.tab); 
            
            if (State.tab === 'tf' && !State.tfChecked) { 
                State.tfSelected = e.target.closest('.opt-btn').dataset.val === 'true'; 
                State.tfChecked = true; 
                if (State.tfSelected === DB.tf[active][State.tfIdx].a) State.tfScore++; 
                StateManager.saveState(State);
                renderTab(); 
            }
            if (State.tab === 'mcq' && !State.mcqChecked) { 
                State.mcqSelected = parseInt(e.target.closest('.opt-btn').dataset.idx); 
                State.mcqChecked = true; 
                if (State.mcqSelected === DB.mcq[active][State.mcqIdx].correct) State.mcqScore++; 
                StateManager.saveState(State);
                renderTab(); 
            }
        });
    });
}

window.move = function(dir) {
    freezeOrderIfNeeded(State.tab);
    if (State.tab === 'cards') { State.cardsIdx += dir; State.cardsFlipped = false; }
    if (State.tab === 'tf') { State.tfIdx += dir; State.tfChecked = false; State.tfSelected = null; }
    if (State.tab === 'mcq') { State.mcqIdx += dir; State.mcqChecked = false; State.mcqSelected = null; }
    if (State.tab === 'fill') { State.fillIdx += dir; State.fillChecked = false; State.fillVal = ''; State.fillScoreAdded = false; }
    if (State.tab === 'comp') { State.compIdx += dir; }
    StateManager.saveState(State);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    renderTab();
}

window.restartQuiz = function(tab) {
    State.isExamActive[tab] = false;
    StateManager.clearTabState(tab);
    
    const freshState = StateManager.loadState();
    if(freshState) State = { ...State, ...freshState };

    if (DB[tab] && tab !== 'comp' && tab !== 'qa' && tab !== 'mindmap') {
        shuffleArray(DB[tab][State.activeSet[tab]]);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    updateTabCounters();
    renderTab();
}

document.addEventListener('DOMContentLoaded', initApp);
