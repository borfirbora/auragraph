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
            // 1. Senaryo: Ekranda halihazırda açık bir not var.
            this.inputHandler.changeRootNode(activeFile.path);
        } else {
            // 2. Senaryo: Ekranda açık sekme yok. Obsidian'ın geçmişine bak.
            const recentPaths = this.app.workspace.getLastOpenFiles(); // Son açılan dosyaların yollarını dizi olarak verir
            
            if (recentPaths && recentPaths.length > 0) {
                // En son açılan dosya dizinin 0. indeksindedir
                const lastOpenedPath = recentPaths[0]; 
                const file = this.app.vault.getAbstractFileByPath(lastOpenedPath);
                
                if (file) {
                    this.inputHandler.changeRootNode(file.path);
                    return; // İşlem başarılı, fonksiyondan çık
                }
            }

            // 3. Senaryo: Geçmiş bomboş (yepyeni bir kasa veya geçmiş temizlenmiş)
            setTimeout(() => {
                this.audioManager.playEarcon('bump');
                this.uiManager.announce("Açık bir not veya yakın zamanda açılmış bir dosya geçmişi bulunamadı. Ağaç şu an boş.");
            }, 500);
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