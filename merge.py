import glob


def replace(text: str, start: str, end: str, new_text: str) -> str:
  start_pos = text.find(start)
  end_pos = text.find(end, start_pos) + len(end)
  return text[:start_pos] + new_text + text[end_pos:]


with open('docs/index.html') as html_file:
  html_content = html_file.read()

# Replace CSS - remove nocscript, inline styles
html_content = replace(html_content, '<noscript>', '</noscript>', '')

css_file = glob.glob("docs/*.css")[0]
print('Replacing CSS file:', css_file)
with open(css_file) as read_file:
  css_content = read_file.read()
html_content = replace(html_content, '<link rel="stylesheet" href="styles', '>',
                       '<style>' + css_content + '</style>')

# Replace JS
js_files = glob.glob("docs/*.js")
print('Replacing JS files:', js_files)
for js_file in js_files:
  with open(js_file) as read_file:
    js_content = read_file.read()
  name = js_file.split('/')[1].split('.')[0]
  html_content = replace(html_content, '<script src="' + name, '</script>',
                         '<script>' + js_content + '</script>')

# Write result
with open('docs/api-viewer.html', 'w') as write_file:
  write_file.write(html_content)

"""
remove
<noscript><link rel="stylesheet" href="styles.af496c625d1d99e8.css"></noscript>

<link rel="stylesheet" href="styles.af496c625d1d99e8.css" media="print" onload="this.media='all'">
<script src="runtime.c71ac0cbd58df2b3.js" type="module"></script>
<script src="polyfills.4a5b315a98b0f68e.js" type="module"></script>
<script src="main.cb56ca3c4330692e.js" type="module"></script>
"""
