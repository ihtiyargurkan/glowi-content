import sys
from PIL import Image, ImageDraw
fr=[int(x) for x in sys.argv[2:]]; cols=8; w,h=270,480
rows=(len(fr)+cols-1)//cols; sh=Image.new('RGB',(cols*w,rows*(h+24)),'black'); d=ImageDraw.Draw(sh)
for i,f in enumerate(fr):
    im=Image.open(f'out/stills/f{f}.jpg').resize((w,h)); x=(i%cols)*w; y=(i//cols)*(h+24); sh.paste(im,(x,y+24)); d.text((x+4,y+4),f'{f} ({f/30:.1f}s)',fill='white')
sh.save(sys.argv[1],quality=80)
