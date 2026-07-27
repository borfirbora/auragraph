export class AudioManager {
    constructor() {
        // Tarayıcı uyumluluğu için AudioContext
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
    }

    playEarcon(type) {
        // Güvenlik politikaları gereği suspended ise uyandır
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        if (type === 'bump') {
            // Earcon 1: Tok, düşük frekanslı çarpma sesi (50ms)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
            
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.05);
        } 
        else if (type === 'success') {
            // Earcon 2: Kısa, ince ve pozitif bir ekleme sesi[cite: 1]
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(880, this.audioCtx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.1);
        }
    }
}