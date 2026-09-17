import os
from PIL import Image, ImageDraw

def generate_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'client', 'public')
    assets_dir = os.path.join(base_dir, 'assets')
    
    # Source images
    src_icon_path = os.path.join(public_dir, 'icon-192.png')
    src_logo_path = os.path.join(public_dir, 'stayaheadd-logo-light.png')
    
    src_icon = Image.open(src_icon_path).convert('RGBA')
    src_logo = Image.open(src_logo_path).convert('RGBA')
    
    # 1. Standard 192x192 and 512x512 with transparent background
    bbox = src_icon.getbbox()
    cropped_symbol = src_icon.crop(bbox)
    
    def make_centered_icon(size, padding_ratio=0.15, bg_color=None):
        if bg_color:
            canvas = Image.new('RGBA', (size, size), bg_color)
        else:
            canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            
        target_max = int(size * (1.0 - 2 * padding_ratio))
        w, h = cropped_symbol.size
        scale = min(target_max / w, target_max / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        resized = cropped_symbol.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (size - new_w) // 2
        offset_y = (size - new_h) // 2
        
        canvas.paste(resized, (offset_x, offset_y), resized)
        return canvas

    # Generate transparent icons
    icon_192 = make_centered_icon(192, padding_ratio=0.10)
    icon_512 = make_centered_icon(512, padding_ratio=0.10)
    
    # Generate maskable icons (Safe zone 20% with crisp white solid background)
    maskable_192 = make_centered_icon(192, padding_ratio=0.20, bg_color=(255, 255, 255, 255))
    maskable_512 = make_centered_icon(512, padding_ratio=0.20, bg_color=(255, 255, 255, 255))
    
    # Apple Touch Icon (180x180, white solid background with clean padding)
    apple_icon = make_centered_icon(180, padding_ratio=0.15, bg_color=(255, 255, 255, 255))
    
    # Favicons
    fav_32 = make_centered_icon(32, padding_ratio=0.05)
    fav_16 = make_centered_icon(16, padding_ratio=0.02)
    
    # Save to client/public
    icon_192.save(os.path.join(public_dir, 'icon-192.png'))
    icon_512.save(os.path.join(public_dir, 'icon-512.png'))
    maskable_192.save(os.path.join(public_dir, 'icon-maskable-192.png'))
    maskable_512.save(os.path.join(public_dir, 'icon-maskable-512.png'))
    apple_icon.save(os.path.join(public_dir, 'apple-touch-icon.png'))
    fav_32.save(os.path.join(public_dir, 'favicon-32x32.png'))
    fav_16.save(os.path.join(public_dir, 'favicon-16x16.png'))
    
    # Also mirror to assets/ directory
    if os.path.exists(assets_dir):
        icon_192.save(os.path.join(assets_dir, 'icon-192.png'))
        icon_512.save(os.path.join(assets_dir, 'icon-512.png'))
        maskable_192.save(os.path.join(assets_dir, 'icon-maskable-192.png'))
        maskable_512.save(os.path.join(assets_dir, 'icon-maskable-512.png'))
        apple_icon.save(os.path.join(assets_dir, 'apple-touch-icon.png'))
        fav_32.save(os.path.join(assets_dir, 'favicon-32x32.png'))
        fav_16.save(os.path.join(assets_dir, 'favicon-16x16.png'))
        
    print("Successfully generated all PWA icons (192, 512, maskables, apple-touch, favicons)!")

    # 2. Generate Open Graph / Social Preview Card (1200 x 630)
    og_w, og_h = 1200, 630
    og = Image.new('RGBA', (og_w, og_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(og)
    
    # Add subtle branded top accent gradient/banner (#29B6E8)
    draw.rectangle([0, 0, og_w, 14], fill=(41, 182, 232, 255))
    
    # Paste logo in top-center
    logo_w, logo_h = src_logo.size
    target_lw = 600
    target_lh = int(logo_h * (target_lw / logo_w))
    resized_logo = src_logo.resize((target_lw, target_lh), Image.Resampling.LANCZOS)
    
    logo_x = (og_w - target_lw) // 2
    logo_y = 150
    og.paste(resized_logo, (logo_x, logo_y), resized_logo)
    
    # Add badge pill "AI-POWERED STUDY PLATFORM"
    badge_w, badge_h = 320, 42
    badge_x = (og_w - badge_w) // 2
    badge_y = logo_y + target_lh + 50
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=21, fill=(235, 248, 255, 255), outline=(41, 182, 232, 255), width=2)
    
    # Save OG image
    og.convert('RGB').save(os.path.join(public_dir, 'og-image.png'), quality=95)
    if os.path.exists(assets_dir):
        og.convert('RGB').save(os.path.join(assets_dir, 'og-image.png'), quality=95)
    print("Successfully generated Open Graph preview image (og-image.png)!")

if __name__ == '__main__':
    generate_icons()
