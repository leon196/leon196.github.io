import os

linkStableDiffusion = "<a href='https://github.com/CompVis/stable-diffusion'>Stable Diffusion</a>"
linkOptimized = "<a href='https://github.com/basujindal/stable-diffusion'>the optimized version</a>"
linkModel = "<a href='https://huggingface.co/CompVis/stable-diffusion-v-1-4-original'>sd-v1-4.ckpt</a>"
text = "images generated with "+linkStableDiffusion+", " + \
    linkOptimized+", dataset model is "+linkModel + "," + \
    "<br/>cfg scale was between 5 and 8, seeds are embed in the filename, processed with a nvidia RTX 2060," + \
    "<br/>prompt was:"

links = """<div class='text'>galleries:</div>
<ul>"""

# build links
index = 0
for dirpath, dirs, files in os.walk('./image/'):
    if len(files) > 0:
        dirname = dirpath.replace('_', ' ').replace('./image/', '')
        links += "\t\t<li><a href='"+str(index)+".html'>"+dirname+'</a></li>\n'
        index += 1
links += "</ul>"

# build gallery pages
index = 0
for dirpath, dirs, files in os.walk('./image/'):
    if len(files) > 0:

        page = ""
        page += "\t<div class='label'>"+text+"</div>\n"
        page += "\t<br/>\n"
        dirname = dirpath.replace('_', ' ').replace('./image/', '')
        page += "\t<div class='terminal'>"+dirname+"</div>\n"
        page += "\t<div class=\"grid-container\">\n"
        for filename in files:
            page += "\t\t<img src=\"" + dirpath + "/" + filename + "\">\n"
        page += "\t</div>\n"

        file = open(str(index)+'.html', 'w')
        html = """<html>
            <head>
                <title>Gallery</title>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" href="style.css" />
            </head>
        <body>
        <a class='text' href='index.html'>index</a></br></br></br>
        """+page+links+"""
        </body>
        </html>
        """
        file.write(html)
        file.close()

        index += 1

# build gallery list
file = open('index.html', 'w')
html = """<html>
    <head>
        <title>Links</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="style.css" />
    </head>
<body>
"""+links+"""
</body>
</html>
"""
file.write(html)
file.close()
