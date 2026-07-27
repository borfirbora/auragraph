export class UIManager {
    constructor(containerEl) {
        this.container = containerEl;
        this.wrapper = null;
        this.pane1 = null;
        this.pane2 = null;
        this.pane3 = null;
    }

    buildUI() {
        this.container.empty();

        this.wrapper = document.createElement('div');
        this.wrapper.setAttribute('role', 'application');
        this.wrapper.setAttribute('aria-label', 'AuraGraph Çalışma İstasyonu');
        this.wrapper.tabIndex = -1;

        this.wrapper.style.display = 'flex';
        this.wrapper.style.gap = '20px';
        this.wrapper.style.padding = '10px';
        this.wrapper.style.outline = 'none';

        this.pane1 = this.createPane('Bölme 1: Deste', 'auragraph-pane deck-pane');
        this.pane2 = this.createPane('Bölme 2: Kök', 'auragraph-pane root-pane');
        this.pane2.id = 'bölme-2-kök';
        this.pane3 = this.createPane('Bölme 3: Sihirli Liste', 'auragraph-pane magic-list-pane');

        this.wrapper.appendChild(this.pane1);
        this.wrapper.appendChild(this.pane2);
        this.wrapper.appendChild(this.pane3);

        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite'); 
        this.announcer.style.position = 'absolute';
        this.announcer.style.width = '1px';
        this.announcer.style.height = '1px';
        this.announcer.style.padding = '0';
        this.announcer.style.overflow = 'hidden';
        this.announcer.style.clip = 'rect(0, 0, 0, 0)';
        this.announcer.style.whiteSpace = 'nowrap';
        this.wrapper.appendChild(this.announcer);

        this.container.appendChild(this.wrapper);

        setTimeout(() => {
            this.wrapper.focus();
        }, 50);
    }

    createPane(titleText, className) {
        const pane = document.createElement('div');
        pane.className = className;
        pane.style.flex = '1';
        pane.style.border = '1px solid #444';
        pane.style.padding = '10px';
        pane.tabIndex = -1; 

        const title = document.createElement('h3');
        title.textContent = titleText;

        const content = document.createElement('div');
        content.className = 'pane-content';
        content.textContent = 'Hazır bekliyor...';

        pane.appendChild(title);
        pane.appendChild(content);

        return pane;
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = '';
            setTimeout(() => {
                this.announcer.textContent = message;
            }, 50);
        }
    }

    renderTree(rootBasename, outlinkPaths) {
        const content = this.pane2.querySelector('.pane-content');
        content.empty(); 

        const tree = document.createElement('ul');
        tree.setAttribute('role', 'tree');
        tree.style.listStyle = 'none';
        tree.style.padding = '0';
        tree.id = 'root-tree';

        const rootLi = document.createElement('li');
        rootLi.setAttribute('role', 'treeitem');
        rootLi.setAttribute('aria-expanded', outlinkPaths.length > 0 ? 'true' : 'false');
        rootLi.tabIndex = -1;
        rootLi.className = 'tree-item root-item';
        
        const rootSpan = document.createElement('span');
        rootSpan.textContent = rootBasename + " (Kök Not)";
        rootLi.appendChild(rootSpan);
        tree.appendChild(rootLi);

        if (outlinkPaths.length > 0) {
            const group = document.createElement('ul');
            group.setAttribute('role', 'group');
            group.style.listStyle = 'none';
            group.style.paddingLeft = '20px';

            outlinkPaths.forEach((path) => {
                let childBasename = path;
                if (path.includes('/')) childBasename = path.split('/').pop();
                if (childBasename.endsWith('.md')) childBasename = childBasename.slice(0, -3);

                const childLi = document.createElement('li');
                childLi.setAttribute('role', 'treeitem');
                childLi.tabIndex = -1;
                childLi.className = 'tree-item child-item';
                childLi.textContent = childBasename;
                
                group.appendChild(childLi);
            });
            rootLi.appendChild(group);
        }

        content.appendChild(tree);

        const items = content.querySelectorAll('.tree-item');
        items.forEach((item, index) => {
            item.dataset.index = index;
            item.style.padding = '5px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #444';

            item.addEventListener('focus', () => {
                item.style.background = 'rgba(255,255,255,0.1)';
                item.style.outline = '1px solid #aaa'; 
            });
            item.addEventListener('blur', () => {
                item.style.background = 'transparent';
                item.style.outline = 'none';
            });
        });
    }

    renderMagicList(title, items, type) {
        const content = this.pane3.querySelector('.pane-content');
        content.empty(); 

        const listTitle = document.createElement('h4');
        listTitle.textContent = `${title} (${type === 'INCOMING' ? 'Gelenler' : 'Gidenler'})`;
        content.appendChild(listTitle);

        if (items.length === 0) {
            const p = document.createElement('p');
            p.textContent = "Bağlantı yok.";
            content.appendChild(p);
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.id = 'magic-list-container';

        items.forEach((item, index) => {
            let b = item.split('/').pop().replace('.md', '');
            const li = document.createElement('li');
            li.textContent = b;
            li.className = 'magic-list-item';
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
            ul.appendChild(li);
        });
        content.appendChild(ul);
    }

    renderDeck(paths) {
        const content = this.pane1.querySelector('.pane-content');
        content.empty();
        if (paths.length === 0) {
            content.textContent = 'Henüz boş.';
            return;
        }
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.id = 'deck-list-container'; // ID eklendi

        paths.forEach((p, index) => {
            const li = document.createElement('li');
            let b = p.split('/').pop().replace('.md', '');
            li.textContent = b;
            li.className = 'deck-list-item'; // Sınıf eklendi
            li.tabIndex = -1; // Odaklanabilirlik eklendi
            li.dataset.index = index;
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #444';
            
            li.addEventListener('focus', () => {
                li.style.background = 'rgba(255,255,255,0.1)';
            });
            li.addEventListener('blur', () => {
                li.style.background = 'transparent';
            });
            
            ul.appendChild(li);
        });
        content.appendChild(ul);
    }
}