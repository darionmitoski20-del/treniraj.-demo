#!/usr/bin/env python3
"""Нова верзија на датотеките: телефонот не користи стари копии од кешот.
Пушти го пред секој commit: python3 tools/bump.py"""
import glob, json, re, time, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = str(int(time.time()))
files = sorted(glob.glob(os.path.join(root, 'js', '**', '*.js'), recursive=True) + glob.glob(os.path.join(root, 'js', '**', '*.mjs'), recursive=True))
imap = {'imports': {'./' + os.path.relpath(f, root).replace(os.sep, '/'): './' + os.path.relpath(f, root).replace(os.sep, '/') + '?v=' + v for f in files}}
idx = os.path.join(root, 'index.html')
s = open(idx, encoding='utf-8').read()
block = '<!--importmap-->\n<script type="importmap">' + json.dumps(imap, indent=1) + '</script>\n<!--/importmap-->'
if '<!--importmap-->' in s:
    s = re.sub(r'<!--importmap-->.*?<!--/importmap-->', lambda m: block, s, flags=re.S)
else:
    s = s.replace('<link rel="stylesheet" href="styles.css">', block + '\n<link rel="stylesheet" href="styles.css">', 1)
s = re.sub(r'href="styles\.css[^"]*"', 'href="styles.css?v=' + v + '"', s)
s = re.sub(r'src="js/app\.js[^"]*"', 'src="js/app.js?v=' + v + '"', s)
open(idx, 'w', encoding='utf-8').write(s)
print('верзија', v, '·', len(files), 'датотеки')
