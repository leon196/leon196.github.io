import yaml, math, random
from pathlib import Path

def write_section(index, row, path):
    index.write('\t\t<section>\n')
    if 'title' in row:
        index.write('\t\t\t<h1><a href="'+path+'">'+row['title']+'</a></h1>\n')
    if 'subtitle' in row:
        index.write('\t\t\t<h3>'+row['subtitle'])
        if 'date' in row:
            index.write(' ('+str(row['date'])+')')
        index.write('</h3>\n')
    if 'text' in row:
        index.write('\t\t\t<p>'+row['text']+'</p>\n')
    if 'with' in row:
        index.write('\t\t\t<p>with ')
        count = len(row['with'])
        n = 0
        for author in row['with']:
            href = author[0]
            label = author[1]
            sep = ' ' if count == 1 else ', '
            sep = '.' if n == count-1 else sep
            index.write('<a href="'+href+'">'+label+'</a>'+sep)
            n += 1
        index.write('</p>\n')
    if 'link' in row:
        for link in row['link']:
            href = link[0]
            label = link[1]
            index.write('\t\t\t<h2><a href="'+href+'">'+label+'</a></h2>\n')
    index.write('\t\t</section>\n')

def write_media(index, row, path):
    if 'media' in row:
        for media in row['media']:
            thumbnail = path+'/thumbnails/'+Path(media).stem+".webp"
            index.write('\t\t<div class="preview"><img loading="lazy" draggable="false" src="'+thumbnail+'"/></div>\n')

def write_page(row, path):
    page = open(path+'index.html', 'w')
    page = open(path+'index.html', 'a')
    page.write('<!DOCTYPE html>\n')
    page.write(open('cms/layout/header.html').read())
    page.write('<html>\n<body>\n')
    page.write('\t<div class="column">\n')
    if 'media' in row:
        for media in row['media']:
            page.write('\t\t<div class="photo"><img loading="lazy" src="'+media+'"/></div>\n')
    page.write('\t</div">\n')
    page.write('</body>\n</html>\n')

def random_section(index, row, path):
    if 'media' in row:
        count = len(row['media'])
        rnd = math.floor(random.random() * count)
        idx = 0
        for media in row['media']:
            if idx == rnd:
                write_section(index, row, path)
            index.write('\t\t<div class="preview"><img loading="lazy" src="'+path+media+'"/></div>\n')
            idx += 1
    else:
        write_section(index, row, path)

content = yaml.safe_load(open('cms/post.yml'))

index = open('index.html', 'w')
index = open('index.html', 'a')
index.write('<!DOCTYPE html>\n')
index.write(open('cms/layout/header.html').read())
index.write('<html>\n<body>\n')

for slug in content:
    row = content[slug]
    path = 'p/'+slug+'/'

    index.write('\t<div class="row">\n')

    write_media(index, row, path)
    write_section(index, row, path)

    index.write('\t</div>\n')

    # write_page(row, path)

index.write(open('cms/layout/footer.html').read())
index.write('</body>\n</html>\n')