import re
c = open('src/components/ProductSearchPanel.jsx', encoding='utf-8').read()

# Add image back before the card body - find the drag label and insert img before it
old = '<img src={p.img} alt={p.name} style={{ width: "100%", height: "78px", objectFit: "cover", display: "block", pointerEvents: "none" }} />'
print('img tag present:', old in c)

# Check what the card currently looks like
idx = c.find('psp-drag')
print(c[max(0,idx-300):idx+100])
