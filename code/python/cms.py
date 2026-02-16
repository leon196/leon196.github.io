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
    index = open('index.html', 'w')
    index = open('index.html', 'a')
    header = open('code/template/header.html').read()
    header += '\t<link rel="stylesheet" href="/code/style/cells.css" />\n'
    index.write('<!DOCTYPE html>\n')
    index.write(header)
    index.write('<html>\n<body class="grid">\n')

    files_paths = get_files_path('content/', 'md')
    pages_data = []
    for file_path in files_paths:
        file = open(file_path)
        header = get_yaml(file)
        body = file.read().replace(header, "")
        yml = yaml.safe_load(header)
        array = file_path.split('/')
        slug = array.pop().replace('.md','')
        path = '/'.join(array)
        data = {
            'file_path': file_path,
            'body': body,
            'yml': yml,
            'slug': slug,
            'path': path,
        }
        pages_data.append(data)

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
    # print(pages_data)
    # return
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

        page.write(open('code/template/background.html').read())
        page.write(open('code/template/home_button.html').read())

        # page.write(body)
        body = data['body']
        lines = body.split('\n')
        for line in lines:
            page.write('\t'+line+'\n')

        page.write('</body>\n')
        page.write('</html>\n')

        # index
        write_cell(index, data)

    index.write('</body>\n')
    index.write('</html>\n')

make()