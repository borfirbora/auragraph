import os

# Hangi dosya uzantılarını alalım?
UZANTILAR = ['.py', '.html', '.css', '.js']

# Hangi klasörlere girmeyelim? (Gereksiz kalabalık yapmasınlar)
HARIC_KLASORLER = [
    'venv', 'env', '.git', '__pycache__', 'migrations', 'node_modules', 
    'media', 'staticfiles', '.idea', '.vscode', 'node_modules'
]

# Hangi dosyaları kesinlikle almayalım?
HARIC_DOSYALAR = ['db.sqlite3', 'manage.py', 'hazirla.py']

def projeyi_birlestir():
    cikti_dosyasi = "tum_kodlar.txt"
    
    with open(cikti_dosyasi, "w", encoding="utf-8") as f_out:
        # Mevcut klasörden başlayarak alt klasörleri gez
        for root, dirs, files in os.walk("."):
            
            # Hariç tutulan klasörleri yerinde temizle ki içine girmesin
            dirs[:] = [d for d in dirs if d not in HARIC_KLASORLER]
            
            for file in files:
                dosya_uzantisi = os.path.splitext(file)[1]
                
                # Sadece belirlediğimiz uzantıları ve yasaklı olmayanları al
                if dosya_uzantisi in UZANTILAR and file not in HARIC_DOSYALAR:
                    dosya_yolu = os.path.join(root, file)
                    
                    # Dosyanın adını başlık olarak yaz
                    f_out.write(f"\n{'='*20}\n")
                    f_out.write(f"DOSYA: {dosya_yolu}\n")
                    f_out.write(f"{'='*20}\n")
                    
                    # Dosyanın içeriğini oku ve yaz
                    try:
                        with open(dosya_yolu, "r", encoding="utf-8") as f_in:
                            f_out.write(f_in.read())
                    except Exception as e:
                        f_out.write(f"HATA: Bu dosya okunamadı. {e}")
                        
    print(f"İşlem tamam! Tüm kodlar '{cikti_dosyasi}' dosyasına kaydedildi.")

if __name__ == "__main__":
    projeyi_birlestir()