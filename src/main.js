import { Plugin, Modal } from 'obsidian';
import { LinkManager } from './LinkManager.js';
import { UIManager } from './UIManager.js';
import { InputHandler } from './InputHandler.js';
import { AudioManager } from './AudioManager.js';
import { OrphanNotesModal } from './OrphanNotesModal.js';
import { t } from './i18n.js';

class AuraGraphStation extends Modal {
    constructor(app, linkManager) {
        super(app);
        this.linkManager = linkManager;
        this.uiManager = null;
        this.inputHandler = null;
        this.audioManager = null;
    }

    onOpen() {
        this.titleEl.style.display = 'none';
        this.modalEl.style.padding = '0';
        
        this.uiManager = new UIManager(this.contentEl);
        this.uiManager.buildUI();
        this.audioManager = new AudioManager();

        this.inputHandler = new InputHandler(
            this.uiManager, 
            this.linkManager, 
            this.audioManager, 
            this.app,
            () => this.close() 
        );
        this.inputHandler.attachListeners();
        
        this.loadInitialData();
    }
    
    loadInitialData() {
        const activeFile = this.app.workspace.getActiveFile();
        
        if (activeFile) {
            this.inputHandler.changeRootNode(activeFile.path);
        } else {
            const recentPaths = this.app.workspace.getLastOpenFiles(); 
            
            if (recentPaths && recentPaths.length > 0) {
                const lastOpenedPath = recentPaths[0]; 
                const file = this.app.vault.getAbstractFileByPath(lastOpenedPath);
                
                if (file) {
                    this.inputHandler.changeRootNode(file.path);
                    return; 
                }
            }

            setTimeout(() => {
                this.audioManager.playEarcon('bump');
                this.uiManager.announce(t('announce_no_history'));
            }, 500);
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}

export default class AuraGraphPlugin extends Plugin {
    async onload() {
        this.linkManager = new LinkManager(this.app);
        
        this.addCommand({
            id: 'open-auragraph',
            name: t('command_open_auragraph'),
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }],
            callback: () => {
                new AuraGraphStation(this.app, this.linkManager).open();
            }
        });

        this.addCommand({
            id: 'open-orphan-notes',
            name: t('command_open_orphan'),
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "o" }],
            callback: () => {
                new OrphanNotesModal(this.app, this.linkManager).open();
            }
        });
    }

    onunload() {
    }
}