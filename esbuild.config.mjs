import esbuild from "esbuild";
import process from "process";

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
    // Kodumuzu src klasörünün içindeki saf JS dosyasına yönlendiriyoruz
    entryPoints: ["src/main.js"],
    bundle: true,
    // Obsidian'ın kendi kütüphanelerini paketlemeye dahil etmiyoruz
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr"
    ],
    format: "cjs",
    target: "es2022",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    // Obsidian bu dosyayı okuyacağı için dışarıya ana dizine çıkarıyoruz
    outfile: "main.js",
    minify: prod,
});

if (prod) {
    await context.rebuild();
    process.exit(0);
} else {
    // Eklenti kodunu her kaydettiğinde otomatik derleme yapar
    await context.watch();
}