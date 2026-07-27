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
        this.wrapper.setAttribute('aria-modal', 'true'); 
        this.wrapper.tabIndex = -1;

        this.wrapper.style.display = 'flex';
        this.wrapper.style.gap = '20px';
        this.wrapper.style.padding = '10px';
        this.wrapper.style.outline = 'none';

        this.pane1 = this.createPane('Bölme 1: Deste', 'auragraph-pane deck-pane', 'listbox');
        this.pane2 = this.createPane('Bölme 2: Kök', 'auragraph-pane root-pane', 'tree');
        this.pane2.id = 'bölme-2-kök';
        this.pane3 = this.createPane('Bölme 3: Sihirli Liste', 'auragraph-pane magic-list-pane', 'listbox');

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

    createPane(titleText, className, roleType) {
        const pane = document.createElement('div');
        pane.className = className;
        pane.style.flex = '1';
        pane.style.border = '1px solid #444';
        pane.style.padding = '10px';

        const title = document.createElement('h3');
        title.id = 'title-' + className.split(' ')[1]; 
        title.textContent = titleText;

        const content = document.createElement('div');
        content.className = 'pane-content';
        
        const ul = document.createElement('ul');
        ul.setAttribute('role', roleType);
        ul.setAttribute('aria-labelledby', title.id); 
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        
        if (className.includes('deck')) ul.id = 'deck-list-container';
        if (className.includes('root')) ul.id = 'root-tree';
        if (className.includes('magic')) ul.id = 'magic-list-container';

        const li = document.createElement('li');
        li.setAttribute('role', roleType === 'tree' ? 'treeitem' : 'option');
        li.tabIndex = -1;
        li.textContent = 'Hazır bekliyor...';
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid #555';
        
        if (className.includes('deck')) li.className = 'deck-list-item';
        if (className.includes('root')) li.className = 'tree-item';
        if (className.includes('magic')) li.className = 'magic-list-item';

        li.addEventListener('focus', () => {
            li.style.background = 'rgba(255,255,255,0.1)';
            if (roleType === 'tree') li.style.outline = '1px solid #aaa';
        });
        li.addEventListener('blur', () => {
            li.style.background = 'transparent';
            if (roleType === 'tree') li.style.outline = 'none';
        });

        ul.appendChild(li);
        content.appendChild(ul);
        pane.appendChild(title);
        pane.appendChild(content);

        return pane;
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

    // YENİ: Ağaç yapısı düz (flat) listeye dönüştürülüp aria-level ile hiyerarşi sağlandı.
    renderTree(nodes) {
        const content = this.pane2.querySelector('.pane-content');
        content.empty(); 

        const tree = document.createElement('ul');
        tree.setAttribute('role', 'tree');
        tree.setAttribute('aria-labelledby', this.pane2.querySelector('h3').id);
        tree.style.listStyle = 'none';
        tree.style.padding = '0';
        tree.id = 'root-tree';

        if (!nodes || nodes.length === 0) {
            const li = document.createElement('li');
            li.textContent = "Ağaç boş.";
            li.setAttribute('role', 'treeitem');
            li.tabIndex = -1;
            tree.appendChild(li);
            content.appendChild(tree);
            return;
        }

        nodes.forEach((node, index) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'treeitem');
            li.setAttribute('aria-level', node.level); // NVDA'ya derinliği bildirir
            
            if (node.hasChildren) {
                li.setAttribute('aria-expanded', node.expanded ? 'true' : 'false');
            }

            li.tabIndex = -1;
            li.className = 'tree-item';
            
            // Görsel olarak içeriden başlatmak için derinliğe göre padding hesaplaması
            li.style.padding = '5px';
            li.style.paddingLeft = `${(node.level - 1) * 20 + 5}px`; 
            li.style.borderBottom = '1px solid #444';
            
            let prefix = "";
            if (node.hasChildren) {
                prefix = node.expanded ? "[-] " : "[+] ";
            } else {
                prefix = "    "; 
            }

            // Prefix'i görsel olarak gösterip NVDA'dan gizliyoruz, çünkü NVDA aria-expanded ile zaten anlıyor.
            const prefixSpan = document.createElement('span');
            prefixSpan.textContent = prefix;
            prefixSpan.setAttribute('aria-hidden', 'true');
            
            const textSpan = document.createElement('span');
            textSpan.textContent = node.basename;

            li.appendChild(prefixSpan);
            li.appendChild(textSpan);

            li.addEventListener('focus', () => {
                li.style.background = 'rgba(255,255,255,0.1)';
                li.style.outline = '1px solid #aaa'; 
            });
            li.addEventListener('blur', () => {
                li.style.background = 'transparent';
                li.style.outline = 'none';
            });
            
            tree.appendChild(li);
        });

        content.appendChild(tree);
    }

    renderMagicList(title, items, type) {
        const content = this.pane3.querySelector('.pane-content');
        content.empty(); 

        const listTitle = document.createElement('h4');
        listTitle.id = 'magic-list-dynamic-title'; 
        listTitle.textContent = `${title} (${type === 'INCOMING' ? 'Gelenler' : 'Gidenler'})`;
        content.appendChild(listTitle);

        const ul = document.createElement('ul');
        ul.setAttribute('role', 'listbox'); 
        ul.setAttribute('aria-labelledby', listTitle.id); 
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.id = 'magic-list-container';

        if (items.length === 0) {
            const li = document.createElement('li');
            li.textContent = "Bağlantı yok.";
            li.className = 'magic-list-item empty-item';
            li.setAttribute('role', 'option'); 
            li.tabIndex = -1;
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #555';
            li.addEventListener('focus', () => li.style.background = 'rgba(255,255,255,0.1)');
            li.addEventListener('blur', () => li.style.background = 'transparent');
            ul.appendChild(li);
            content.appendChild(ul);
            return;
        }

        items.forEach((item, index) => {
            let b = item.split('/').pop().replace('.md', '');
            const li = document.createElement('li');
            li.textContent = b;
            li.className = 'magic-list-item';
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
            ul.appendChild(li);
        });
        content.appendChild(ul);
    }

    renderDeck(paths) {
        const content = this.pane1.querySelector('.pane-content');
        content.empty();
        
        const ul = document.createElement('ul');
        ul.setAttribute('role', 'listbox');
        ul.setAttribute('aria-labelledby', this.pane1.querySelector('h3').id);
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.id = 'deck-list-container'; 

        if (paths.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Deste henüz boş.';
            li.className = 'deck-list-item empty-item';
            li.setAttribute('role', 'option');
            li.tabIndex = -1;
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #444';
            li.addEventListener('focus', () => li.style.background = 'rgba(255,255,255,0.1)');
            li.addEventListener('blur', () => li.style.background = 'transparent');
            ul.appendChild(li);
            content.appendChild(ul);
            return;
        }

        paths.forEach((p, index) => {
            const li = document.createElement('li');
            let b = p.split('/').pop().replace('.md', '');
            li.textContent = b;
            li.className = 'deck-list-item'; 
            li.setAttribute('role', 'option');
            li.tabIndex = -1; 
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