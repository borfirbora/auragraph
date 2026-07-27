export class LinkManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Aktif notun giden bağlantılarını (outlinks) döndürür.
     * @param {string} filePath - Notun dosya yolu (örn: "Klasör/Not.md")
     * @returns {Object} Giden bağlantılar ve ağırlıkları
     */
    getOutlinks(filePath) {
        // resolvedLinks objesinde dosya yolu varsa döndür, yoksa boş obje dön.
        return this.app.metadataCache.resolvedLinks[filePath] || {};
    }

    /**
     * Tüm vault'u tarayarak hedef nota gelen bağlantıları (inlinks) bulur.
     * @param {string} targetFilePath - Hedef notun dosya yolu
     * @returns {Object} Gelen bağlantılar ve ağırlıkları
     */
    getInlinks(targetFilePath) {
        const allLinks = this.app.metadataCache.resolvedLinks;
        const inlinks = {};

        // Tüm kaynak dosyaları dön
        for (const sourcePath in allLinks) {
            // Eğer kaynak dosya, hedef dosyamıza link vermişse bunu inlinks objesine ekle
            if (allLinks[sourcePath][targetFilePath]) {
                inlinks[sourcePath] = allLinks[sourcePath][targetFilePath];
            }
        }
        return inlinks;
    }

    /**
     * Hiçbir gelen ve giden bağlantısı olmayan yetim notları tespit eder.
     * @returns {Array} Yetim notların dosya objeleri listesi
     */
    getOrphanNotes() {
        const allLinks = this.app.metadataCache.resolvedLinks;
        const orphans = [];
        const allFiles = this.app.vault.getMarkdownFiles();

        // Performans için tüm hedeflenen (gelen) linkleri bir Set içinde toplayalım
        const allInlinks = new Set();
        for (const source in allLinks) {
            for (const target in allLinks[source]) {
                allInlinks.add(target);
            }
        }

        // Tüm markdown dosyalarını kontrol edelim
        allFiles.forEach(file => {
            const path = file.path;
            const outlinks = Object.keys(allLinks[path] || {});
            
            const hasOutlinks = outlinks.length > 0;
            const hasInlinks = allInlinks.has(path);

            // Ne giden ne de gelen linki yoksa, bu bir yetim nottur
            if (!hasOutlinks && !hasInlinks) {
                orphans.push(file);
            }
        });

        return orphans;
    }
}