import yaml, os, shutil
from PIL import Image
from pathlib import Path

def get_files_path(folder, search):
    array = []
    for item in os.scandir(folder):
        if item.is_file():
            if search in item.name:
                array.append(item.path)
        else:
            array.extend(get_files_path(item.path, search))
    return array

def get_yaml(f):
    pointer = f.tell()
    if f.readline() != '---\n':
        f.seek(pointer)
        return ''
    readline = iter(f.readline, '')
    readline = iter(readline.__next__, '---\n') #underscores needed for Python3?
    return ''.join(readline)

def make():

    # index with all projects
    page = open('index.html', 'w')
    page = open('index.html', 'a')
    header = open('code/template/header.html').read()
    header += '\t<link rel="stylesheet" href="/code/style/slide.css">\n'
    page.write('<!DOCTYPE html>\n')
    page.write(header)
    page.write('<body>\n')
    page.write('\t<div id="container" class="row">\n')

    # find projects metadata
    files_paths = get_files_path('content/', 'yml')
    pages_data = []
    for file_path in files_paths:
        file = open(file_path)
        yml = yaml.safe_load(file)
        array = file_path.split('/')
        slug = array.pop().replace('.yml','')
        path = '/'.join(array)
        data = {
            'file_path': file_path,
            'yml': yml,
            'slug': slug,
            'path': path,
        }
        pages_data.append(data)

    # sort projects
    def sort_page(item):
        number = 9999
        data = item['yml']
        if 'date' in data:
            number = data['date']
            if 'order' in data:
                number += data['order']
        elif 'order' in data:
            number = data['order']
        return number
    pages_data = sorted(pages_data, key=sort_page, reverse=True)

    link = yaml.safe_load(open('code/data/link.yml'))
    
    # make pages for each projects
    for data in pages_data:
        path = data['path']
        yml = data['yml']
        slug = data['slug']
        title = yml['title']
        tagline = yml['tagline']
        category = yml['category']
        media = yml['media']
        date = None
        info = None
        authors = None
        width = None
        if 'date' in yml: date = str(yml['date'])
        if 'info' in yml: info = yml['info']
        if 'with' in yml: authors = yml['with']
        if 'width' in yml: width = yml['width']

        page.write('\t<div id="'+slug+'" class="slide column"')
        if width:
            page.write(' style="min-width:'+str(width)+'px;" ')
        page.write('>\n')

        page.write('\t\t<div class="info">\n')
        # page.write('\t\t\t<h1>'+title+'</h1>\n')
        page.write('\t\t\t<h1><a href="#'+slug+'">'+title+'</a></h1>\n')
        # page.write('\t\t\t<h2>'+tagline+'</h2>\n')

        # category
        # page.write('\t\t\t<p><span class="tag">project</span>')
        # for cat in category:
        #     page.write(', <span class="tag">'+cat+'</span>')
        # page.write('</p>\n')

        # date
        # if date:
        #     page.write('\t\t<p>'+date+'</p>\n')

        # info
        if info:
            for line in info:
                page.write('\t\t\t<p>'+line+'</p>\n')

        # authors
        if authors:
            page.write('\t\t\t<p>')
            page.write('with ')
            # page.write('<a href="https://neondelice.xyz/">Léon&nbsp;Denise</a>')
            number = 0
            for line in authors:
                name = line.replace(' ', '&nbsp;')
                if number > 0:
                    page.write(', ')
                if line in link:
                    page.write('<a href="'+link[line]+'">'+name+'</a>')
                else:
                    page.write(''+name)
                number += 1
            page.write('\n\t\t\t</p>\n')
        page.write('\t\t</div>\n')

        # media
        for line in media:
            if isinstance(line, list):
                page.write('\t\t<div class="gallery row">\n')
                for l in line:
                    page.write('\t\t\t<img alt="image" loading="lazy" src="'+path+'/media/'+l+'">\n')
                page.write('\t\t</div>\n')
            else:
                page.write('\t\t<div class="media">\n')
                if "mp4" in line:
                    # pass
                    page.write('\t\t\t<video preload="none" src="'+path+'/media/'+line+'" controls poster="'+path+'/media/poster.webp"></video>\n')
                else:
                    page.write('\t\t\t<img alt="image" loading="lazy" src="'+path+'/media/'+line+'">\n')
                page.write('\t\t</div>\n')

        page.write('\t</div>\n')
    page.write('\t</div>\n')
    page.write('\t<script src="/code/js/scroll.js"></script>\n')
    page.write('</body>\n')

make()