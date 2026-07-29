import { Modal } from 'obsidian';
import { AudioManager } from './AudioManager.js';

export class OrphanNotesModal extends Modal {
    constructor(app, linkManager) {
        super(app);
        this.linkManager = linkManager;
        this.audioManager = null;
        this.orphans = [];
        this.focusIndex = 0;
        this.listContainer = null;
        this.announcer = null;
    }

    onOpen() {
        this.titleEl.style.display = 'none';
        this.modalEl.style.padding = '0';
        
        this.audioManager = new AudioManager();
        this.orphans = this.linkManager.getOrphanNotes();
        
        this.buildUI();
        this.attachListeners();
        
        setTimeout(() => {
            this.focusItem();
        }, 100);
    }

    buildUI() {
        this.contentEl.empty();

        const wrapper = document.createElement('div');
        wrapper.setAttribute('role', 'application');
        wrapper.setAttribute('aria-label', 'AuraGraph');
        wrapper.setAttribute('aria-modal', 'true');
        wrapper.tabIndex = -1;
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '20px';
        wrapper.style.padding = '10px';
        wrapper.style.outline = 'none';

        const title = document.createElement('h3');
        title.id = 'orphan-notes-title';
        title.textContent = `Yetim Notlar (${this.orphans.length})`;
        title.style.margin = '0 0 10px 0';
        title.style.color = '#fff';

        this.listContainer = document.createElement('ul');
        this.listContainer.setAttribute('role', 'listbox');
        this.listContainer.setAttribute('aria-labelledby', 'orphan-notes-title');
        this.listContainer.style.listStyle = 'none';
        this.listContainer.style.padding = '0';
        this.listContainer.style.margin = '0';
        this.listContainer.style.maxHeight = '60vh';
        this.listContainer.style.overflowY = 'auto';

        if (this.orphans.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Yetim not bulunamadı.';
            li.setAttribute('role', 'option');
            li.tabIndex = -1;
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #444';
            this.listContainer.appendChild(li);
        } else {
            this.orphans.forEach((file, index) => {
                const li = document.createElement('li');
                li.textContent = file.basename;
                li.className = 'orphan-list-item';
                li.setAttribute('role', 'option');
                li.tabIndex = -1;
                li.dataset.index = index;
                li.style.padding = '5px';
                li.style.borderBottom = '1px solid #555';
                li.style.cursor = 'pointer';

                li.addEventListener('focus', () => {
                    li.style.background = 'rgba(255,255,255,0.1)';
                });
                li.addEventListener('blur', () => {
                    li.style.background = 'transparent';
                });

                this.listContainer.appendChild(li);
            });
        }

        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.style.position = 'absolute';
        this.announcer.style.width = '1px';
        this.announcer.style.height = '1px';
        this.announcer.style.padding = '0';
        this.announcer.style.overflow = 'hidden';
        this.announcer.style.clip = 'rect(0, 0, 0, 0)';
        this.announcer.style.whiteSpace = 'nowrap';

        wrapper.appendChild(title);
        wrapper.appendChild(this.listContainer);
        wrapper.appendChild(this.announcer);
        
        this.contentEl.appendChild(wrapper);
        wrapper.focus();
    }

    attachListeners() {
        this.contentEl.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        const rawKey = e.key;

        if (rawKey === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            this.close();
            return;
        }

        if (this.orphans.length === 0) return;

        if (rawKey === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            if (this.focusIndex < this.orphans.length - 1) {
                this.focusIndex++;
                this.focusItem();
            } else {
                this.audioManager.playEarcon('bump');
            }
        } else if (rawKey === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            if (this.focusIndex > 0) {
                this.focusIndex--;
                this.focusItem();
            } else {
                this.audioManager.playEarcon('bump');
            }
        } else if (rawKey === 'Home') {
            e.preventDefault();
            e.stopPropagation();
            this.focusIndex = 0;
            this.focusItem();
            this.announce("Başa gidildi.");
        } else if (rawKey === 'End') {
            e.preventDefault();
            e.stopPropagation();
            this.focusIndex = this.orphans.length - 1;
            this.focusItem();
            this.announce("Sona gidildi.");
        } else if (rawKey === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            this.openFocusedFile();
        }
    }

    focusItem() {
        if (this.orphans.length === 0) return;
        const items = this.listContainer.querySelectorAll('.orphan-list-item');
        const targetItem = items[this.focusIndex];
        if (targetItem) {
            targetItem.focus();
            targetItem.scrollIntoView({ block: 'nearest' });
        }
    }

    openFocusedFile() {
        if (this.orphans.length === 0) return;
        const file = this.orphans[this.focusIndex];
        if (file) {
            this.announce("Açılıyor.");
            this.app.workspace.getLeaf(false).openFile(file);
            this.close();
        }
    }

    announce(message) {
        if (this.announcer) {
            if (this.announcer.textContent === message) {
                this.announcer.textContent = message + '\u00A0';
            } else {
                this.announcer.textContent = message;
            }
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}