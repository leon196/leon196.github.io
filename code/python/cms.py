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

def write_cell(page, data):
    yml = data['yml']
    path = data['path']
    page.write('\t<a href="'+path+'/" class="cell column">\n')
    page.write('\t\t<div class="thumbnail row">\n')
    thumbnail = path+'/media/cover.webp'
    page.write('\t\t\t<img class="shadow" draggable="false" src="'+thumbnail+'"/>\n')
    page.write('\t\t</div>\n')
    page.write('\t\t<section>\n')
    page.write('\t\t\t<h2>'+yml['title']+'</h2>\n')
    page.write('\t\t\t<p>'+yml['tagline'])
    if 'date' in yml:
        page.write(' ('+str(yml['date'])+')')
    page.write('</p>\n')
    page.write('\t\t</section>\n')
    page.write('\t</a>\n')

def make():

    # index with all projects
    index = open('index.html', 'w')
    index = open('index.html', 'a')
    header = open('code/template/header.html').read()
    header += '\t<link rel="stylesheet" href="/code/style/cells.css" />\n'
    index.write('<!DOCTYPE html>\n')
    index.write(header)
    index.write('<html>\n<body class="grid">\n')

    # find projects metadata
    files_paths = get_files_path('content/', 'yml')
    # files_paths = get_files_path('content/xr/dusted', 'yml')
    pages_data = []
    for file_path in files_paths:
        file = open(file_path)
        # header = get_yaml(file)
        # body = file.read().replace(header, "")
        # yml = yaml.safe_load(header)
        yml = yaml.safe_load(file)
        array = file_path.split('/')
        slug = array.pop().replace('.md','')
        path = '/'.join(array)
        data = {
            'file_path': file_path,
            # 'body': body,
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
        page = open(path+'/index.html', 'w')
        page = open(path+'/index.html', 'a')
        page.write('<!DOCTYPE html>\n')
        page.write('<html>\n')
        page.write('<head>\n')

        header = open('code/template/header.html').read()
        header += '\t<link rel="stylesheet" href="/code/style/page.css" />\n'
        page.write(header)

        page.write('<head>\n')
        page.write('<body>\n')

        # page.write(open('code/template/background.html').read())
        page.write(open('code/template/home_button.html').read())

        # page.write(body)
        # body = data['body']
        # lines = body.split('\n')
        # for line in lines:
        #     page.write('\t'+line+'\n')
        yml = data['yml']
        title = yml['title']
        tagline = yml['tagline']
        category = yml['category']
        date = None
        if 'date' in yml:
            date = str(yml['date'])
        info = None
        if 'info' in yml:
            info = yml['info']
        media = yml['media']

        authors = None
        if 'with' in yml:
            authors = yml['with']

        page.write('\t<div class="page">\n')
        page.write('\t\t<div class="info">\n')

        # info
        page.write('\t\t\t<h1>'+title+'</h1>\n')
        page.write('\t\t\t<h2>'+tagline+'</h2>\n')#+' ('+date+')</h2>\n')
        if info:
            for line in info:
                page.write('\t\t\t<p>'+line+'</p>\n')

        # authors
        if authors:
            page.write('\t\t\t<p>')
            page.write('<a href="https://neondelice.xyz/">Léon&nbsp;Denise</a>')
            for line in authors:
                name = line.replace(' ', '&nbsp;')
                if line in link:
                    page.write(', <a href="'+link[line]+'">'+name+'</a>')
                else:
                    page.write(', '+name)
            page.write('\n\t\t\t</p>\n')

        # category
        page.write('\t\t\t<p><span class="tag">project</span>')
        for cat in category:
            page.write(', <span class="tag">'+cat+'</span>')
        page.write('</p>\n')

        # date
        if date:
            page.write('\t\t<p>'+date+'</p>\n')
        
        page.write('\t\t</div>\n')

        # media
        page.write('\t\t<div class="media">\n')
        for line in media:
            if isinstance(line, list):
                page.write('\t\t\t<div class="media-band">\n')
                for l in line:
                    page.write('\t\t\t\t<img src="media/'+l+'" />\n')
                page.write('\t\t\t</div>\n')
            elif "mp4" in line:
                page.write('\t\t\t<video src="media/'+line+'" controls poster="media/poster.webp"></video>\n')
            else:
                page.write('\t\t\t<img src="media/'+line+'" />\n')
        page.write('\t\t</div>\n')
        page.write('\t</div>\n')
        page.write('</body>\n')
        page.write('</html>\n')

        # index
        write_cell(index, data)

    index.write('</body>\n')
    index.write('</html>\n')

make()