import yaml, math, random
from pathlib import Path

def write_section(file, row, path):
    file.write('\t\t<section>\n')
    if 'title' in row:
        # file.write('\t\t\t<h1><a href="'+path+'">'+row['title']+'</a></h1>\n')
        file.write('\t\t\t<h1>'+row['title']+'</h1>\n')
    if 'subtitle' in row:
        file.write('\t\t\t<h3>'+row['subtitle'])
        if 'date' in row:
            file.write(' ('+str(row['date'])+')')
        file.write('</h3>\n')
    if 'text' in row:
        file.write('\t\t\t<p>'+row['text']+'</p>\n')
    if 'with' in row:
        file.write('\t\t\t<p>with ')
        count = len(row['with'])
        n = 0
        for author in row['with']:
            href = author[0]
            label = author[1]
            sep = ' ' if count == 1 else ', '
            sep = '.' if n == count-1 else sep
            file.write('<a href="'+href+'">'+label+'</a>'+sep)
            n += 1
        file.write('</p>\n')
    if 'link' in row:
        for link in row['link']:
            href = link[0]
            label = link[1]
            file.write('\t\t\t<h2><a href="'+href+'">'+label+'</a></h2>\n')
    file.write('\t\t</section>\n')

def write_media(file, row, path):
    if 'media' in row:
        for media in row['media']:
            thumbnail = path+'/thumbnails/'+Path(media).stem+".webp"
            file.write('\t\t<div class="preview"><img loading="lazy" draggable="false" src="'+thumbnail+'"/></div>\n')

content = yaml.safe_load(open('cms/slide.yml'))

file = open('slide.html', 'w')
file = open('slide.html', 'a')
file.write('<!DOCTYPE html>\n')
file.write(open('cms/layout/slide.html').read())
file.write('<html>\n<body>\n')

for slug in content:
    row = content[slug]
    path = 'p/'+slug+'/'

    if 'cover' in row:
        file.write('\t<div class="row" style="background:url(\''+path+row['cover']+'\')">\n')

    # file.write('\t<div class="slide">\n')

    write_media(file, row, path)
    write_section(file, row, path)

    file.write('\t</div>\n')


file.write('</body>\n</html>\n')