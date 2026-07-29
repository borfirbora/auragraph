# **AuraGraph Station for Obsidian**

*Keyboard-first, accessible, and distraction-free node exploration for Obsidian.*

## **🌟 Project Vision & Philosophy**

**The Problem:** Obsidian's default visual Graph view locks 2D spatial data into a visual canvas. This inherently excludes screen reader users and slows down keyboard-centric "power users."

**The Solution:** AuraGraph Station transforms visual spatiality into a **3-pane ARIA architecture**. By utilizing a "Dynamic Root" approach and providing temporal/auditory feedback (Keyboard \+ TTS Announcer \+ Earcons), it creates a fully accessible, focused workstation without relying on a graphical canvas.

**Target Audience:** Visually impaired users utilizing screen readers (NVDA, JAWS, VoiceOver), developers who demand lightning-fast keyboard navigation, and anyone who wants to apply the Zettelkasten philosophy without visual distractions.

## **🏗️ The 3-Pane Architecture**

The interface is divided into 3 logical panes to provide a "Left-Center-Right" spatial awareness, especially optimized for screen readers (role="application").

1. **Pane 1: Deck (Left \- Curation Area)**  
   * A special staging area where you keep notes you actively select during your workflow (using Shift+Space).  
   * You can reorder, delete, and copy the contents or names of the notes in your deck.  
2. **Pane 2: Dynamic Root (Center \- Main Hub)**  
   * The active note you are currently exploring. The tree view is always rooted in this note.  
   * Selecting a new note rebuilds the tree instantly, preventing infinite recursive loops and keeping your focus sharp.  
3. **Pane 3: Magic List (Right \- Connection Pathways)**  
   * A dynamic list displaying either the **Incoming** or **Outgoing** links of the currently focused note.  
   * Easily toggle between incoming and outgoing contexts using the Left and Right arrow keys.

## **🎧 Audio Experience & Accessibility (UX)**

AuraGraph Station doesn't just display information; it *communicates* it.

* **Live Announcements (TTS):** Integrated ARIA live regions automatically announce link summaries, active items, and actions (e.g., "Note added to deck", "3 Incoming, 5 Outgoing").  
* **Earcons (Web Audio API):**  
  * **Bump (Error/Boundary):** A low-frequency (50ms) sound that plays when you hit a dead end (e.g., trying to navigate to non-existent links) instead of verbose error messages.  
  * **Success:** A short, positive, high-frequency sound that confirms actions like adding a note to the Deck or moving items.

## **⌨️ Keyboard Shortcuts & Navigation**

AuraGraph Station is designed to be used entirely without a mouse.

### **Global Navigation**

| Shortcut | Action |
| :---- | :---- |
| 1, 2, 3 | Focus on Pane 1 (Deck), Pane 2 (Root), or Pane 3 (Magic List). |
| Escape | Close the AuraGraph Station modal. |
| Enter | Open the currently focused note in Obsidian and close the modal. |
| Tab | Prevented to keep focus within the app (plays 'bump' sound). |
| c | **Return to Root:** Immediately return focus to the Center Hub (Pane 2\) from any other pane. |
| Mod \+ Shift \+ A | **Open AuraGraph Station** (Obsidian Command Palette). |
| Mod \+ Shift \+ O | **Open Orphan Notes** (Obsidian Command Palette). |

### **Center Hub (Pane 2 \- Root Tree)**

| Shortcut | Action |
| :---- | :---- |
| Up / Down | Navigate through the tree nodes. |
| Right / Left | Expand / Collapse node branches. |
| Space | Toggle (Expand/Collapse) the focused node. |
| e | Open the context menu (Copy as Tree, Copy as List). |

### **Link Insights (Active when focusing a node)**

| Shortcut | Action |
| :---- | :---- |
| i / I | Announce summary of **Incoming** links (e.g., "3 incoming"). |
| o / O | Announce summary of **Outgoing** links (e.g., "5 outgoing"). |
| Shift \+ I | Announce detailed names of **Incoming** links. |
| Shift \+ O | Announce detailed names of **Outgoing** links. |
| Ctrl+Shift+I | Open the Magic List (Pane 3\) for **Incoming** links and focus it. |
| Ctrl+Shift+O | Open the Magic List (Pane 3\) for **Outgoing** links and focus it. |

### **Deck Management (Pane 1 \- Deck)**

| Shortcut | Action |
| :---- | :---- |
| Shift \+ Space | Add the currently focused note (from any pane) to the Deck. |
| Up / Down | Navigate through the Deck. |
| , (Comma) | Select the currently focused Deck item to be moved. |
| . (Period) | Move the previously selected item to the current position. |
| Delete | Remove the focused note from the Deck. |
| e | Open the context menu (Copy Note Names, Copy Content). |

### **Magic List (Pane 3\)**

| Shortcut | Action |
| :---- | :---- |
| Up / Down | Navigate through the links. |
| Right | Switch to the **Outgoing** links view. |
| Left | Switch to the **Incoming** links view. |
| Space | Drill down: Add the focused link as a child to the active tree node and focus it. |

## **🔍 Orphan Notes Detection**

AuraGraph Station includes a dedicated tool to find **Orphan Notes** (notes with zero incoming and zero outgoing links).

* Use the command Open Orphan Notes (Mod \+ Shift \+ O) to view a list of all disconnected files in your vault.  
* Fully keyboard accessible with standard Up/Down navigation and Enter to open.

# **🇹🇷 AuraGraph İstasyonu (Türkçe)**

*Obsidian için erişilebilir, klavye odaklı ve dikkat dağıtmayan bağlantı keşif istasyonu.*

## **🌟 Proje Vizyonu ve Felsefesi**

**Temel Problem:** Obsidian'ın varsayılan Graf (Graph) görünümü, 2 boyutlu uzamsal veriyi görsel bir kanvasa kilitler. Bu durum ekran okuyucu kullanıcılarını sistemden dışlar ve klavye ile hızlı gezinmek isteyen "power user"ları yavaşlatır.

**Çözüm:** AuraGraph İstasyonu, görsel uzamsallığı **3 bölmeli bir ARIA mimarisine** dönüştürür. "Dinamik Kök" yaklaşımı ve zamansal/işitsel geri bildirimlerle (Klavye \+ Sesli Okuyucu \+ Earcon'lar), görsel bir haritaya ihtiyaç duymadan erişilebilir ve odaklı bir çalışma istasyonu yaratır.

**Hedef Kitle:** Ekran okuyucu (NVDA, JAWS vb.) kullanan görme engelli bireyler, klavye ile yıldırım hızında gezinmek isteyen geliştiriciler ve Zettelkasten felsefesini görsel karmaşa olmadan uygulamak isteyen herkes.

## **🏗️ 3 Bölmeli Mimari (UI Layout)**

Arayüz, ekran okuyucuya "Sol-Orta-Sağ" uzamsal algısını verecek 3 mantıksal bölmeden oluşur (role="application").

1. **Bölme 1: Deste (Sol \- Kürasyon Alanı)**  
   * Çalışma sırasında Shift+Space ile seçtiğiniz notların tutulduğu özel liste.  
   * Bu alanda notları silebilir, sırasını değiştirebilir ve içeriklerini/isimlerini topluca kopyalayabilirsiniz.  
2. **Bölme 2: Dinamik Kök (Orta \- Merkez Alan)**  
   * O an üzerinde çalışılan aktif nottur. Ağaç görünümünün kökü daima bu nottur.  
   * Yeni bir nota odaklanıp kök yapıldığında ağaç baştan çizilir. Bu sayede sonsuz döngüler (recursive loops) engellenir.  
3. **Bölme 3: Sihirli Liste (Sağ \- Bağlantı Yolları)**  
   * Aktif kök notun **Gelen** ve **Giden** bağlantılarının listelendiği alandır.  
   * Sağ ve Sol ok tuşlarıyla gelen/giden bağlamı arasında anında geçiş yapılabilir.

## **🎧 İşitsel Deneyim ve UX**

AuraGraph sadece veriyi göstermez, onu *hissettirir*.

* **Otomatik Okuma (TTS):** Entegre ARIA canlı bölgeleri sayesinde yapılan işlemler (ör. "Deste başı", "3 Gelen bağlantı") otomatik seslendirilir.  
* **Earcon'lar (Web Audio API):**  
  * **Çarpma/Sınır Sesi (Bump):** Sihirli listede bağlantı olmayan bir yöne basıldığında veya listenin sonuna gelindiğinde gereksiz konuşma yerine 50ms'lik tok bir uyarı sesi çalınır.  
  * **Başarı Sesi (Success):** Desteye not ekleme, taşıma veya kopyalama gibi eylemleri onaylayan kısa ve pozitif bir sestir.

## **⌨️ Kısayol Haritası (Keybindings)**

AuraGraph İstasyonu tamamen faresiz (mouse olmadan) kullanılmak üzere tasarlanmıştır.

### **Genel Navigasyon**

| Kısayol | İşlem |
| :---- | :---- |
| 1, 2, 3 | Sırasıyla Bölme 1 (Deste), Bölme 2 (Kök) veya Bölme 3 (Sihirli Liste) alanına odaklan. |
| Escape | AuraGraph İstasyonu penceresini kapatır. |
| Enter | Seçili olan notu Obsidian'da açar ve pencereyi kapatır. |
| Tab | Odağın uygulama dışına çıkmasını engeller (Çarpma/Bump sesi çalar). |
| c | **Köke Dön:** Hangi bölmede olursanız olun odağı anında Merkez Alana (Bölme 2\) geri döndürür. |
| Mod \+ Shift \+ A | **AuraGraph İstasyonunu Aç** (Obsidian Komut Paleti). |
| Mod \+ Shift \+ O | **Yetim Notları Aç** (Obsidian Komut Paleti). |

### **Merkez Odak (Bölme 2 \- Kök Ağacı)**

| Kısayol | İşlem |
| :---- | :---- |
| Yukarı / Aşağı | Ağaçtaki notlar arasında gezin. |
| Sağ / Sol | Düğüm (node) dallarını aç / kapat. |
| Space | Seçili düğümü aç/kapat (Genişlet/Daralt). |
| e | Ağaç menüsünü aç (Ağaç veya Liste olarak kopyala). |

### **Bağlantı Okumaları (Bir not üzerindeyken)**

| Kısayol | İşlem |
| :---- | :---- |
| i / I | **Gelen** bağlantıların özetini seslendir (Örn: "3 gelen"). |
| o / O | **Giden** bağlantıların özetini seslendir (Örn: "5 giden"). |
| Shift \+ I | **Gelen** bağlantıların isimlerini detaylıca seslendir. |
| Shift \+ O | **Giden** bağlantıların isimlerini detaylıca seslendir. |
| Ctrl \+ Shift \+ I | Sihirli Listeyi (Bölme 3\) **Gelen** bağlantılar görünümünde aç ve odaklan. |
| Ctrl \+ Shift \+ O | Sihirli Listeyi (Bölme 3\) **Giden** bağlantılar görünümünde aç ve odaklan. |

### **Deste Yönetimi (Bölme 1 \- Deste)**

| Kısayol | İşlem |
| :---- | :---- |
| Shift \+ Space | Bulunduğunuz herhangi bir bölmedeki aktif notu Desteye ekle. |
| Yukarı / Aşağı | Deste içinde gezin. |
| , (Virgül) | Taşınmak üzere mevcut deste öğesini seç. |
| . (Nokta) | Önceden seçilen öğeyi şu anki konuma taşı. |
| Delete | Seçili notu Desteden çıkar. |
| e | Deste menüsünü aç (İsimleri kopyala, İçeriği kopyala). |

### **Sihirli Liste (Bölme 3\)**

| Kısayol | İşlem |
| :---- | :---- |
| Yukarı / Aşağı | Bağlantılar arasında gezin. |
| Sağ Ok | **Giden** bağlantılar listesine geçiş yap. |
| Sol Ok | **Gelen** bağlantılar listesine geçiş yap. |
| Space | Derinlemesine İniş (Drill down): Seçili bağlantıyı aktif ağaca alt düğüm olarak ekle ve ona odaklan. |

## **🔍 Yetim Notlar (Orphan Notes)**

AuraGraph İstasyonu, hiçbir gelen veya giden bağlantısı olmayan yetim notları tespit etmek için özel bir araca sahiptir.

* Kasanızdaki bağsız dosyaları görmek için Mod \+ Shift \+ O komutunu kullanın.  
* Standart ok tuşları ve Enter ile tamamen klavye erişilebilirdir.