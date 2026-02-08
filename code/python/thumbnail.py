import yaml, os, shutil
import cms
from os.path import isfile, join
from PIL import Image
from pathlib import Path

size = 800
# content = yaml.safe_load(open('code/data/post.yml'))
files = cms.get_files_path('content/project/miroir-arcade', '.md')
for file_path in files:
    array = file_path.split('/')
    array.pop()
    path = '/'.join(array)+'/'
    path_media = path+'media/'

    if not os.path.exists(path_media):
        os.makedirs(path_media)
        
    images = [f for f in os.listdir(path) if isfile(join(path, f))]
    for image_path in images:
        if "png" in image_path or "jpg" in image_path:
            image = Image.open(path+image_path)
            image.save(path_media+Path(image_path).stem+".webp", "WEBP")