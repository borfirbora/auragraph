import { Menu } from 'obsidian';

export class InputHandler {
    constructor(uiManager, linkManager, audioManager, app, closeModalCallback) {
        this.uiManager = uiManager;
        this.linkManager = linkManager;
        this.audioManager = audioManager;
        this.app = app;
        this.closeModalCallback = closeModalCallback;

        this.activePane = 2; 

        this.magicListState = null; 
        this.magicListOwnerPath = null; 
        this.magicListItems = [];
        this.magicListFocusIndex = -1; 

        this.treeState = {
            nodes: [], 
            focusIndex: -1
        };
        
        this.deckPaths = []; 
        this.deckFocusIndex = 0; 
    }

    attachListeners() {
        this.uiManager.wrapper.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    getFocusedPath() {
        if (this.activePane === 1 && this.deckPaths.length > 0 && this.deckFocusIndex >= 0) {
            return this.deckPaths[this.deckFocusIndex];
        }
        if (this.activePane === 3 && this.magicListState && this.magicListFocusIndex >= 0) {
            return this.magicListItems[this.magicListFocusIndex];
        }
        if (this.activePane === 2 && this.treeState.nodes.length > 0 && this.treeState.focusIndex >= 0) {
            return this.treeState.nodes[this.treeState.focusIndex].path;
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

        if (rawKey === 'Tab') {
            e.preventDefault(); 
            e.stopPropagation();
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Sekme tuşu kapalı. Lütfen bölmeler için 1, 2 veya 3 tuşlarını kullanın.");
            return;
        }

        if (rawKey === 'Escape') {
            e.preventDefault(); e.stopPropagation(); 
            if (this.closeModalCallback) {
                this.closeModalCallback();
            }
            return;
        }

        if (lowerKey === 'c' && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            this.magicListState = null;
            this.magicListOwnerPath = null; 
            this.activePane = 2; 
            this.focusTreeItem();
            this.uiManager.announce("Ağaç alanına dönüldü.");
            return;
        }

        if (lowerKey === 'e' && !isCtrl && !isShift) {
            e.preventDefault(); e.stopPropagation();
            if (this.activePane === 1) {
                this.openDeckMenu();
            } else if (this.activePane === 2) {
                this.openTreeMenu();
            } else {
                this.audioManager.playEarcon('bump');
            }
            return;
        }

        if (rawKey === 'Home') {
            e.preventDefault(); e.stopPropagation();
            if (this.activePane === 1 && this.deckPaths.length > 0) {
                this.deckFocusIndex = 0;
                this.focusDeckItem();
                this.uiManager.announce("Destenin başına gidildi.");
            } else if (this.activePane === 2 && this.treeState.nodes.length > 0) {
                this.treeState.focusIndex = 0;
                this.focusTreeItem();
                this.uiManager.announce("Ağacın köküne gidildi.");
            } else if (this.activePane === 3 && this.magicListItems.length > 0) {
                this.magicListFocusIndex = 0;
                this.focusMagicListItem();
                this.uiManager.announce("Sihirli listenin başına gidildi.");
            }
            return;
        }

        if (rawKey === 'End') {
            e.preventDefault(); e.stopPropagation();
            if (this.activePane === 1 && this.deckPaths.length > 0) {
                this.deckFocusIndex = this.deckPaths.length - 1;
                this.focusDeckItem();
                this.uiManager.announce("Destenin sonuna gidildi.");
            } else if (this.activePane === 2 && this.treeState.nodes.length > 0) {
                this.treeState.focusIndex = this.treeState.nodes.length - 1;
                this.focusTreeItem();
                this.uiManager.announce("Ağacın en altına gidildi.");
            } else if (this.activePane === 3 && this.magicListItems.length > 0) {
                this.magicListFocusIndex = this.magicListItems.length - 1;
                this.focusMagicListItem();
                this.uiManager.announce("Sihirli listenin sonuna gidildi.");
            }
            return;
        }

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
            this.uiManager.announce("Sihirli liste alanına geçildi.");
            this.focusMagicListItem();
            return;
        }

        if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(rawKey)) {
            if (this.activePane === 1) {
                this.handleDeckNavigation(e, rawKey);
            } else if (this.activePane === 2) {
                this.handleTreeNavigation(e, rawKey);
            } else if (this.activePane === 3 && this.magicListState) {
                this.handleMagicListNavigation(e, rawKey);
            }
            return; 
        }

        if (rawKey === 'Enter') {
            e.preventDefault(); e.stopPropagation();
            this.openFocusedFile();
            return;
        }
        
        if (rawKey === ' ' && !isShift && !isCtrl) {
            e.preventDefault(); e.stopPropagation();
            if (this.activePane === 2) {
                const node = this.treeState.nodes[this.treeState.focusIndex];
                if (node) {
                    if (node.expanded) this.collapseNode(this.treeState.focusIndex);
                    else this.expandNode(this.treeState.focusIndex);
                }
            } 
            else if (this.activePane === 3) {
                const focusedPath = this.getFocusedPath();
                if (focusedPath) {
                    this.drillDown(focusedPath);
                }
            }
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

    openDeckMenu() {
        if (this.deckPaths.length === 0) {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Deste boş, menü açılamadı.");
            return;
        }

        const menu = new Menu();

        menu.addItem((item) => {
            item.setTitle("Sadece Not İsimlerini Kopyala")
                .onClick(() => {
                    this.copyDeckAsNames();
                });
        });

        menu.addItem((item) => {
            item.setTitle("Notları Kopyala")
                .onClick(() => {
                    this.copyDeckAsContent();
                });
        });

        this.showMenuAtFocus(menu);
        this.uiManager.announce("Deste menüsü açıldı. Yön tuşlarıyla gezinebilirsiniz.");
    }

    openTreeMenu() {
        if (!this.treeState.nodes || this.treeState.nodes.length === 0) {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Ağaç boş, menü açılamadı.");
            return;
        }

        const menu = new Menu();

        menu.addItem((item) => {
            item.setTitle("Ağaç Olarak Kopyala")
                .onClick(() => {
                    this.copyTreeAsHierarchy();
                });
        });

        menu.addItem((item) => {
            item.setTitle("Liste Olarak Kopyala")
                .onClick(() => {
                    this.copyTreeAsFlatList();
                });
        });

        this.showMenuAtFocus(menu);
        this.uiManager.announce("Ağaç menüsü açıldı. Yön tuşlarıyla gezinebilirsiniz.");
    }

    showMenuAtFocus(menu) {
        const activeEl = document.activeElement;
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        
        if (activeEl && activeEl.getBoundingClientRect) {
            const rect = activeEl.getBoundingClientRect();
            x = rect.left;
            y = rect.bottom;
        }
        
        menu.showAtPosition({ x, y });
    }

    copyDeckAsNames() {
        const text = this.deckPaths.map(p => `- ${p.split('/').pop().replace('.md', '')}`).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            this.audioManager.playEarcon('success');
            this.uiManager.announce("Deste not isimleri panoya kopyalandı.");
        }).catch(() => {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Kopyalama başarısız oldu.");
        });
    }

    async copyDeckAsContent() {
        try {
            let finalContent = "";
            for (const path of this.deckPaths) {
                const file = this.app.vault.getAbstractFileByPath(path);
                if (file) {
                    const content = await this.app.vault.read(file);
                    const basename = path.split('/').pop().replace('.md', '');
                    finalContent += `## ${basename}\n\n${content}\n\n`;
                }
            }
            
            await navigator.clipboard.writeText(finalContent.trimEnd());
            
            this.audioManager.playEarcon('success');
            this.uiManager.announce("Destedeki notların içerikleri panoya kopyalandı.");
        } catch (err) {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("İçerikleri kopyalama başarısız oldu.");
        }
    }

    copyTreeAsHierarchy() {
        const text = this.treeState.nodes.map(node => {
            const indent = "  ".repeat(node.level - 1);
            return `${indent}- ${node.basename}`;
        }).join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.audioManager.playEarcon('success');
            this.uiManager.announce("Ağaç hiyerarşik olarak panoya kopyalandı.");
        }).catch(() => {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Kopyalama başarısız oldu.");
        });
    }

    copyTreeAsFlatList() {
        const text = this.treeState.nodes.map(node => `- ${node.basename}`).join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.audioManager.playEarcon('success');
            this.uiManager.announce("Ağaç düz liste olarak panoya kopyalandı.");
        }).catch(() => {
            this.audioManager.playEarcon('bump');
            this.uiManager.announce("Kopyalama başarısız oldu.");
        });
    }

    expandNode(index, silent = false) {
        const node = this.treeState.nodes[index];
        if (node.expanded) return;
        
        if (!node.dynamicChildren || node.dynamicChildren.length === 0) {
            if (!silent) {
                this.audioManager.playEarcon('bump');
                this.uiManager.announce("Genişletilecek alt bağlantı yok.");
            }
            return;
        }

        node.expanded = true;
        node.hasChildren = true;

        const newNodes = node.dynamicChildren.map((childPath, i) => {
            const outlinks = Object.keys(this.linkManager.getOutlinks(childPath));
            return {
                id: Date.now().toString() + Math.random(),
                path: childPath,
                basename: childPath.split('/').pop().replace('.md', ''),
                level: node.level + 1,
                expanded: false,
                hasChildren: outlinks.length > 0,
                dynamicChildren: [...outlinks]
            };
        });

        this.treeState.nodes.splice(index + 1, 0, ...newNodes);
        this.uiManager.renderTree(this.treeState.nodes);
        
        if (!silent) {
            this.audioManager.playEarcon('success'); 
            this.uiManager.announce(`${node.basename} genişletildi, ${newNodes.length} alt öğe açıldı.`);
        }
        this.focusTreeItem();
    }

    collapseNode(index, silent = false) {
        const node = this.treeState.nodes[index];
        if (!node.expanded) return;

        node.expanded = false;
        let removeCount = 0;
        
        for (let i = index + 1; i < this.treeState.nodes.length; i++) {
            if (this.treeState.nodes[i].level > node.level) {
                removeCount++;
            } else {
                break;
            }
        }

        if (removeCount > 0) {
            this.treeState.nodes.splice(index + 1, removeCount);
        }

        this.uiManager.renderTree(this.treeState.nodes);
        if (!silent) {
            this.uiManager.announce(`${node.basename} daraltıldı.`);
        }
        this.focusTreeItem();
    }

    drillDown(path) {
        if (this.treeState.nodes.length === 0) return; 
        
        const parentIndex = this.treeState.focusIndex;
        const parentNode = this.treeState.nodes[parentIndex];
        
        if (!parentNode.dynamicChildren) parentNode.dynamicChildren = [];
        
        parentNode.dynamicChildren.unshift(path);
        parentNode.hasChildren = true;

        if (parentNode.expanded) {
            this.collapseNode(parentIndex, true); 
        }
        this.expandNode(parentIndex, true); 
        
        this.treeState.focusIndex = parentIndex + 1; 
        this.activePane = 2; 

        const newNode = this.treeState.nodes[this.treeState.focusIndex];
        this.audioManager.playEarcon('success');
        this.uiManager.announce(`${newNode.basename}, ${parentNode.basename} düğümüne eklendi ve odaklanıldı.`);
        
        this.magicListState = null;
        this.magicListOwnerPath = null;
        this.uiManager.renderMagicList('Sihirli Liste', [], 'INCOMING');

        this.focusTreeItem();
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
            if (this.treeState.focusIndex < this.treeState.nodes.length - 1) {
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
        else if (key === 'ArrowRight') {
            e.preventDefault(); e.stopPropagation();
            const node = this.treeState.nodes[this.treeState.focusIndex];
            if (node && node.hasChildren) {
                if (!node.expanded) {
                    this.expandNode(this.treeState.focusIndex);
                } else {
                    if (this.treeState.focusIndex < this.treeState.nodes.length - 1) {
                        this.treeState.focusIndex++;
                        this.focusTreeItem();
                    }
                }
            } else {
                this.audioManager.playEarcon('bump'); 
            }
        }
        else if (key === 'ArrowLeft') {
            e.preventDefault(); e.stopPropagation();
            const node = this.treeState.nodes[this.treeState.focusIndex];
            if (node) {
                if (node.expanded) {
                    this.collapseNode(this.treeState.focusIndex);
                } else {
                    let p = this.treeState.focusIndex - 1;
                    while (p >= 0 && this.treeState.nodes[p].level >= node.level) {
                        p--;
                    }
                    if (p >= 0) {
                        this.treeState.focusIndex = p;
                        this.focusTreeItem();
                        this.uiManager.announce(`${this.treeState.nodes[p].basename} üst düğümüne dönüldü.`);
                    } else {
                        this.audioManager.playEarcon('bump'); 
                    }
                }
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
        
        this.activePane = 3; 

        let basename = path.split('/').pop().replace('.md', '');
        this.uiManager.renderMagicList(basename, this.magicListItems, direction);
        this.uiManager.announce(`Sihirli liste ${direction === 'INCOMING' ? 'Gelenler' : 'Gidenler'} görünümünde açıldı.`);
        
        this.focusMagicListItem();
    }

    focusDeckItem() {
        const container = document.getElementById('deck-list-container');
        if (!container) return;
        const items = container.querySelectorAll('.deck-list-item');
        let targetIndex = this.deckPaths.length === 0 ? 0 : this.deckFocusIndex;
        const targetItem = items[targetIndex];
        if (targetItem) targetItem.focus();
    }

    focusTreeItem() {
        const container = document.getElementById('root-tree');
        if (!container) return;
        const items = container.querySelectorAll('.tree-item');
        let targetIndex = (!this.treeState.nodes || this.treeState.nodes.length === 0) ? 0 : this.treeState.focusIndex;
        if (targetIndex < 0) targetIndex = 0; 
        const targetItem = items[targetIndex];
        if (targetItem) targetItem.focus();
    }

    focusMagicListItem() {
        const container = document.getElementById('magic-list-container');
        if (!container) return;
        const items = container.querySelectorAll('.magic-list-item');
        let targetIndex = (!this.magicListItems || this.magicListItems.length === 0) ? 0 : this.magicListFocusIndex;
        const targetItem = items[targetIndex];
        if (targetItem) targetItem.focus();
    }

    changeRootNode(path) {
        this.magicListState = null;
        this.magicListOwnerPath = null; 
        this.activePane = 2; 
        
        let basename = path.split('/').pop().replace('.md', '');
        const outlinksMap = this.linkManager.getOutlinks(path);
        const outlinkPaths = Object.keys(outlinksMap);
        
        this.treeState = {
            nodes: [{
                id: Date.now().toString(),
                path: path,
                basename: basename,
                level: 1,
                expanded: false,
                hasChildren: outlinkPaths.length > 0,
                dynamicChildren: [...outlinkPaths]
            }],
            focusIndex: 0
        };

        this.uiManager.renderTree(this.treeState.nodes);

        this.expandNode(0, true);

        const outCount = outlinkPaths.length;
        this.uiManager.announce(`${basename} çalışma istasyonunun kökü oldu. Altında ${outCount} adet bağlantı var.`);
        this.uiManager.renderMagicList('Sihirli Liste', [], 'INCOMING');

        this.focusTreeItem();
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