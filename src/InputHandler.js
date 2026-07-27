export class InputHandler {
    constructor(uiManager, linkManager, audioManager, app, closeModalCallback) {
        this.uiManager = uiManager;
        this.linkManager = linkManager;
        this.audioManager = audioManager;
        this.app = app;
        this.closeModalCallback = closeModalCallback;

        // YENİ: Aktif Bölme (1: Deste, 2: Kök/Ağaç, 3: Sihirli Liste)
        this.activePane = 2; // Başlangıçta Kök (Ağaç) açık

        this.magicListState = null; 
        this.magicListOwnerPath = null; 
        this.magicListItems = [];
        this.magicListFocusIndex = -1; 

        this.treeState = {
            paths: [], 
            focusIndex: -1
        };
        
        this.deckPaths = []; 
        this.deckFocusIndex = 0; // Deste için fokus indeksi
    }

    attachListeners() {
        this.uiManager.wrapper.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    // YENİ: Artık sadece Aktif Bölme'nin (activePane) içindeki elemanı okur
    getFocusedPath() {
        if (this.activePane === 1 && this.deckPaths.length > 0 && this.deckFocusIndex >= 0) {
            return this.deckPaths[this.deckFocusIndex];
        }
        if (this.activePane === 3 && this.magicListState && this.magicListFocusIndex >= 0) {
            return this.magicListItems[this.magicListFocusIndex];
        }
        if (this.activePane === 2 && this.treeState.paths.length > 0 && this.treeState.focusIndex >= 0) {
            return this.treeState.paths[this.treeState.focusIndex];
        }
        return null;
    }

    handleKeyDown(e) {
        const isShift = e.shiftKey;
        const isCtrl = e.ctrlKey || e.metaKey;
        const rawKey = e.key; 
        const lowerKey = rawKey.toLowerCase();
        
        const isInlink = (lowerKey === 'ı' || lowerKey === 'i' || rawKey === 'I');
        const isOutlink = (lowerKey === 'o' || rawKey === 'O');

        if (rawKey === 'Escape') {
            e.preventDefault(); e.stopPropagation(); 
            this.magicListState = null;
            this.magicListOwnerPath = null; 
            this.treeState.focusIndex = 0; 
            this.activePane = 2; // Escape daima Kök alanına döndürür
            this.focusTreeItem();
            this.uiManager.announce("Ağaç alanına dönüldü.");
            return;
        }

        // --- BÖLME GEÇİŞ KISAYOLLARI (1, 2, 3) ---
        if (rawKey === '1' && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.activePane = 1;
            this.uiManager.announce("Deste alanına geçildi.");
            this.focusDeckItem();
            return;
        }
        if (rawKey === '2' && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.activePane = 2;
            this.uiManager.announce("Ağaç alanına geçildi.");
            this.focusTreeItem();
            return;
        }
        if (rawKey === '3' && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.activePane = 3;
            if (this.magicListState && this.magicListItems.length > 0) {
                this.uiManager.announce("Sihirli Liste alanına geçildi.");
                this.focusMagicListItem();
            } else {
                this.uiManager.pane3.focus();
                this.uiManager.announce("Sihirli liste alanına geçildi, ancak şu an boş.");
            }
            return;
        }

        // --- YÖN TUŞLARI (Bulunulan Bölmeye Göre Ayrılır) ---
        if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(rawKey)) {
            if (this.activePane === 1) {
                this.handleDeckNavigation(e, rawKey);
            } else if (this.activePane === 2) {
                this.handleTreeNavigation(e, rawKey);
            } else if (this.activePane === 3 && this.magicListState) {
                this.handleMagicListNavigation(e, rawKey);
            }
            return; // Yön tuşu işlendi, çık
        }

        if (rawKey === 'Enter') {
            e.preventDefault(); e.stopPropagation();
            this.openFocusedFile();
            return;
        }
        if (rawKey === ' ' && !isShift && !isCtrl) {
            e.preventDefault(); e.stopPropagation();
            const focusedPath = this.getFocusedPath();
            if (focusedPath) this.changeRootNode(focusedPath);
            return;
        }
        if (rawKey === ' ' && isShift && !isCtrl) {
            e.preventDefault(); e.stopPropagation();
            this.addToDeck();
            return;
        }

        if (isInlink && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.announceSummary('inlinks');
        } 
        else if (isOutlink && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.announceSummary('outlinks');
        }
        else if (isInlink && isShift && !isCtrl) {
            e.preventDefault(); e.stopPropagation();
            this.announceDetailed('inlinks');
        } 
        else if (isOutlink && isShift && !isCtrl) {
            e.preventDefault(); e.stopPropagation();
            this.announceDetailed('outlinks');
        } 
        else if (isInlink && isCtrl && isShift) {
            e.preventDefault(); e.stopPropagation();
            this.openMagicList('INCOMING');
        } 
        else if (isOutlink && isCtrl && isShift) {
            e.preventDefault(); e.stopPropagation();
            this.openMagicList('OUTGOING');
        }
    }

    announceSummary(type) {
        const path = this.getFocusedPath();
        if (!path) return;

        let data = {};
        let label = "";

        if (type === 'inlinks') {
            data = this.linkManager.getInlinks(path);
            label = "Gelen bağlantı";
        } else {
            data = this.linkManager.getOutlinks(path);
            label = "Giden bağlantı";
        }
        const count = Object.keys(data).length;
        this.uiManager.announce(`${count} adet ${label} var.`);
    }

    announceDetailed(type) {
        const path = this.getFocusedPath();
        if (!path) return;

        let linksMap = {};
        if (type === 'inlinks') {
            linksMap = this.linkManager.getInlinks(path);
        } else {
            linksMap = this.linkManager.getOutlinks(path);
        }

        const linkPaths = Object.keys(linksMap);
        const totalCount = linkPaths.length;

        if (totalCount === 0) {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce(`${type === 'inlinks' ? 'Gelen' : 'Giden'} bağlantı yok.`);
            return;
        }

        const basenames = linkPaths.map(p => p.split('/').pop().replace('.md', ''));
        
        let message = "";
        if (totalCount <= 5) {
            if (totalCount === 1) {
                message = basenames[0];
            } else {
                const lastItem = basenames.pop();
                message = basenames.join(', ') + ' ve ' + lastItem;
            }
        } else {
            const firstFive = basenames.slice(0, 5);
            const remaining = totalCount - 5;
            message = firstFive.join(', ') + ` ve ${remaining} daha`;
        }

        this.uiManager.announce(`${type === 'inlinks' ? 'Gelenler' : 'Gidenler'}: ${message}.`);
    }

    handleDeckNavigation(e, key) {
        if (this.deckPaths.length === 0) return;
        
        if (key === 'ArrowDown') {
            e.preventDefault(); e.stopPropagation();
            if (this.deckFocusIndex < this.deckPaths.length - 1) {
                this.deckFocusIndex++;
                this.focusDeckItem();
            }
        } 
        else if (key === 'ArrowUp') {
            e.preventDefault(); e.stopPropagation();
            if (this.deckFocusIndex > 0) {
                this.deckFocusIndex--;
                this.focusDeckItem();
            }
        }
    }

    handleTreeNavigation(e, key) {
        if (key === 'ArrowDown') {
            e.preventDefault(); e.stopPropagation();
            if (this.treeState.focusIndex < this.treeState.paths.length - 1) {
                this.treeState.focusIndex++;
                this.focusTreeItem();
            }
        } 
        else if (key === 'ArrowUp') {
            e.preventDefault(); e.stopPropagation();
            if (this.treeState.focusIndex > 0) {
                this.treeState.focusIndex--;
                this.focusTreeItem();
            }
        }
    }

    handleMagicListNavigation(e, key) {
        if (key === 'ArrowDown') {
            e.preventDefault(); e.stopPropagation();
            if (this.magicListFocusIndex < this.magicListItems.length - 1) {
                this.magicListFocusIndex++;
                this.focusMagicListItem();
            }
        } 
        else if (key === 'ArrowUp') {
            e.preventDefault(); e.stopPropagation();
            if (this.magicListFocusIndex > 0) {
                this.magicListFocusIndex--;
                this.focusMagicListItem();
            }
        }
        else if (key === 'ArrowRight') {
            e.preventDefault(); e.stopPropagation();
            this.attemptSwitchList('OUTGOING');
        }
        else if (key === 'ArrowLeft') {
            e.preventDefault(); e.stopPropagation();
            this.attemptSwitchList('INCOMING');
        }
    }

    attemptSwitchList(targetState) {
        if (this.magicListState === targetState) {
            this.audioManager.playEarcon('bump');
            return;
        }

        const path = this.magicListOwnerPath;
        if (!path) return;

        let links = {};
        if (targetState === 'INCOMING') {
            links = this.linkManager.getInlinks(path);
        } else {
            links = this.linkManager.getOutlinks(path);
        }

        if (Object.keys(links).length === 0) {
            this.audioManager.playEarcon('bump'); 
        } else {
            this.openMagicList(targetState, path);
        }
    }

    openMagicList(direction, specificPath = null) {
        const path = specificPath || this.getFocusedPath();
        if (!path) return;

        let links = {};
        if (direction === 'INCOMING') {
            links = this.linkManager.getInlinks(path);
        } else {
            links = this.linkManager.getOutlinks(path);
        }

        this.magicListOwnerPath = path; 
        this.magicListState = direction;
        this.magicListItems = Object.keys(links);
        this.magicListFocusIndex = 0;
        
        // Liste açıldığında otomatik olarak odağı Bölme 3'e taşır
        this.activePane = 3; 

        let basename = path.split('/').pop().replace('.md', '');
        this.uiManager.renderMagicList(basename, this.magicListItems, direction);
        this.uiManager.announce(`Sihirli liste ${direction === 'INCOMING' ? 'Gelenler' : 'Gidenler'} görünümünde açıldı.`);
        
        setTimeout(() => {
            this.focusMagicListItem();
        }, 50);
    }

    focusDeckItem() {
        const container = document.getElementById('deck-list-container');
        if (!container || this.deckPaths.length === 0) {
            this.uiManager.pane1.focus();
            return;
        }
        const items = container.querySelectorAll('.deck-list-item');
        const targetItem = items[this.deckFocusIndex];
        if (targetItem) targetItem.focus();
    }

    focusTreeItem() {
        const container = document.getElementById('root-tree');
        if (!container) return;
        const items = container.querySelectorAll('.tree-item');
        const targetItem = items[this.treeState.focusIndex];
        if (targetItem) targetItem.focus();
    }

    focusMagicListItem() {
        const container = document.getElementById('magic-list-container');
        if (!container) return;
        const items = container.querySelectorAll('.magic-list-item');
        const targetItem = items[this.magicListFocusIndex];
        if (targetItem) targetItem.focus();
    }

    changeRootNode(path) {
        this.magicListState = null;
        this.magicListOwnerPath = null; 
        this.activePane = 2; // Kök değiştiğinde otomatik olarak Ağaç alanına (2) döner
        
        let basename = path.split('/').pop().replace('.md', '');
        
        const outlinksMap = this.linkManager.getOutlinks(path);
        const outlinkPaths = Object.keys(outlinksMap);
        
        this.treeState = {
            paths: [path, ...outlinkPaths],
            focusIndex: 0
        };

        this.uiManager.renderTree(basename, outlinkPaths);

        const inCount = Object.keys(this.linkManager.getInlinks(path)).length;
        const outCount = outlinkPaths.length;

        this.uiManager.announce(`${basename} yeni kök oldu. Altında ${outCount} adet giden bağlantı düğümü var.`);

        const magicListContent = this.uiManager.pane3.querySelector('.pane-content');
        if (magicListContent) {
            magicListContent.textContent = 'Hazır bekliyor...';
        }

        setTimeout(() => {
            this.focusTreeItem();
        }, 50);
    }

    addToDeck() {
        const path = this.getFocusedPath();
        if (!path) return;

        if (!this.deckPaths.includes(path)) {
            this.deckPaths.push(path);
        }

        let basename = path.split('/').pop().replace('.md', '');
        this.audioManager.playEarcon('success');
        this.uiManager.announce(`${basename} desteye eklendi.`);
        
        this.uiManager.renderDeck(this.deckPaths);
    }

    openFocusedFile() {
        const path = this.getFocusedPath();
        if (!path) return;

        const file = this.app.vault.getAbstractFileByPath(path);
        if (file) {
            this.uiManager.announce(`${path} açılıyor...`);
            this.app.workspace.getLeaf(false).openFile(file);
            
            if (this.closeModalCallback) {
                this.closeModalCallback();
            }
        }
    }
}