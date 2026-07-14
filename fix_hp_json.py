import re

with open('c:\\app2026\\SeoAgent\\hp.json', 'r', encoding='utf-8') as f:
    content = f.read()

old_count = content.count('971529244592') + content.count('00971554779240')
print(f'Old numbers remaining: {old_count}')

# Replace WhatsApp number
content = content.replace('971529244592', '971554779331')

# Replace old phone format
content = content.replace('00971554779240', '+971 55 477 9240')

# Fix tel: links that have wrong format after replacement
content = re.sub(r'tel:\+971 55 477 9240', 'tel:971554779240', content)

with open('c:\\app2026\\SeoAgent\\hp.json', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
old = content.count('971529244592') + content.count('00971554779240')
print(f'Old numbers after fix: {old}')
print(f'New WhatsApp count: {content.count("971554779331")}')
print(f'New Phone count: {content.count("971554779240")}')
