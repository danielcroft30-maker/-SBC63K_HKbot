// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize color picker with default color
    const colorPicker = new iro.ColorPicker('#color-picker', {
        width: 280,
        color: '#ff0000',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        layout: [
            { 
                component: iro.ui.Wheel,
                options: {
                    wheelLightness: true,
                }
            },
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'hue',
                }
            },
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'saturation',
                }
            },
            {
                component: iro.ui.Slider,
                options: {
                    sliderType: 'value',
                }
            }
        ]
    });

    // Elements for displaying color values
    const hexValue = document.getElementById('hex-value');
    const rgbValue = document.getElementById('rgb-value');
    const hslValue = document.getElementById('hsl-value');
    const cmykValue = document.getElementById('cmyk-value');
    const colorPreview = document.getElementById('color-preview');
    const sendBtn = document.getElementById('send-btn');

    // Color conversion functions
    function rgbToCmyk(r, g, b) {
        let c, m, y, k;
        let r1 = r / 255;
        let g1 = g / 255;
        let b1 = b / 255;
        k = 1 - Math.max(r1, g1, b1);
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        c = (1 - r1 - k) / (1 - k) * 100;
        m = (1 - g1 - k) / (1 - k) * 100;
        y = (1 - b1 - k) / (1 - k) * 100;
        return { c: Math.round(c), m: Math.round(m), y: Math.round(y), k: Math.round(k * 100) };
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { 
            h: Math.round(h * 360), 
            s: Math.round(s * 100), 
            l: Math.round(l * 100) 
        };
    }

    // Update all color displays
    function updateColors(color) {
        const hex = color.hexString;
        const rgb = color.rgb;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

        // Update display values
        hexValue.textContent = hex.toUpperCase();
        rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslValue.textContent = `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;
        cmykValue.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        colorPreview.style.backgroundColor = hex;

        // Store data for sending
        sendBtn.dataset.hex = hex;
        sendBtn.dataset.rgb = JSON.stringify(rgb);
        sendBtn.dataset.hsl = JSON.stringify(hsl);
        sendBtn.dataset.cmyk = JSON.stringify(cmyk);
    }

    // Handle color change
    colorPicker.on('color:change', updateColors);

    // Initial update
    updateColors(colorPicker.color);

    // Copy functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.copy;
            let text = '';
            switch(type) {
                case 'hex':
                    text = hexValue.textContent;
                    break;
                case 'rgb':
                    text = rgbValue.textContent;
                    break;
                case 'hsl':
                    text = hslValue.textContent;
                    break;
                case 'cmyk':
                    text = cmykValue.textContent;
                    break;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Copied to clipboard!');
            }).catch(() => {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('📋 Copied to clipboard!');
            });
        });
    });

    // Send data to Telegram bot
    sendBtn.addEventListener('click', function() {
        const data = {
            hex: this.dataset.hex,
            rgb: JSON.parse(this.dataset.rgb),
            hsl: JSON.parse(this.dataset.hsl),
            cmyk: JSON.parse(this.dataset.cmyk)
        };

        // Send to Telegram WebApp
        if (window.TelegramWebApp) {
            window.TelegramWebApp.sendData(JSON.stringify(data));
            showToast('✅ Sent to bot!');
        } else {
            // For testing outside Telegram
            console.log('Color data:', data);
            showToast('⚠️ Open this in Telegram to send to bot');
        }
    });

    // Toast notification
    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});
