import { Plugin, Modal } from 'obsidian';
import { LinkManager } from './LinkManager.js';
import { UIManager } from './UIManager.js';
import { InputHandler } from './InputHandler.js';
import { AudioManager } from './AudioManager.js';

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

        // 4. parametre olarak app, 5. parametre olarak modalı kapatma fonksiyonunu gönderiyoruz
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
            // Başlangıçta aktif dosyayı kök olarak belirliyoruz
            this.inputHandler.changeRootNode(activeFile.path);
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}

export default class AuraGraphPlugin extends Plugin {
    async onload() {
        console.log('AuraGraph (Saf JS) yükleniyor...');
        this.linkManager = new LinkManager(this.app);
        this.addCommand({
            id: 'open-auragraph',
            name: 'AuraGraph İstasyonunu Aç',
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "a" }],
            callback: () => {
                new AuraGraphStation(this.app, this.linkManager).open();
            }
        });
    }

    onunload() {
        console.log('AuraGraph kapatıldı.');
    }
}