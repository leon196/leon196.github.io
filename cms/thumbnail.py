import yaml
import os
from PIL import Image

content = yaml.safe_load(open('cms/post.yml'))
for slug in content:
    row = content[slug]
    path = 'p/'+slug+'/'
    if not os.path.exists(path+'/thumbnails/'):
        os.mkdir(path+'/thumbnails/')
    if 'media' in row:
        for media in row['media']:
            image = Image.open(path+media)
            w, h = image.size
            new_h = 300
            new_w = int(w * (new_h / h))
            image.resize((new_w, new_h), Image.LANCZOS)
            image.save(path+'/thumbnails/'+media)
            # index.write('\t\t<div class="preview"><img src="'+path+media+'"/></div>\n')