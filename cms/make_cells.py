import yaml, math, random
from pathlib import Path

content = yaml.safe_load(open('cms/post.yml'))

page_name = 'cells.html'
page = open(page_name, 'w')
page = open(page_name, 'a')
header = open('cms/layout/header.html').read()
header = header.replace(
    '<link rel="stylesheet"/>',
    '<link rel="stylesheet" href="/css/cell.css" />')
page.write('<!DOCTYPE html>\n')
page.write(header)
page.write('<html>\n<body class="grid">\n')

def write_cell(page, data, path):
    page.write('\t\t<a href="'+path+'index.html" class="cell">\n')
    page.write('\t\t\t<div class="thumbnail">\n')
    page.write('\t\t\t\t<section>\n')
    page.write('\t\t\t\t\t<h2>'+data['title']+'</h2>\n')
    page.write('\t\t\t\t\t<p>'+data['tagline']+'</p>\n')
    page.write('\t\t\t\t</section>\n')
    media = data['media'][0]
    thumbnail = path+'/thumbnails/'+Path(media).stem+".webp"
    page.write('\t\t\t\t<img loading="lazy" draggable="false" src="'+thumbnail+'"/>\n')
    page.write('\t\t\t</div>\n')
    page.write('\t\t</a>\n')

def write_page(data, path):
    page = open(path+'index.html', 'w')
    page = open(path+'index.html', 'a')
    header = open('cms/layout/header.html').read()
    header = header.replace(
        '<link rel="stylesheet"/>',
        '<link rel="stylesheet" href="/css/page.css" />')
    page.write('<!DOCTYPE html>\n')
    page.write(header)
    page.write('<html>\n<body>\n')
    page.write('\t<div class="column">\n')
    if 'media' in data:
        for media in data['media']:
            page.write('\t\t<div class="photo"><img loading="lazy" src="'+media+'"/></div>\n')
    page.write('\t</div">\n')
    page.write('</body>\n</html>\n')

for slug in content:
    data = content[slug]
    path = 'p/'+slug+'/'

    write_cell(page, data, path)
    write_page(data, path)


page.write('</body>\n</html>\n')