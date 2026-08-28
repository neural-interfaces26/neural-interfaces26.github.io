"""Minimal helpers to read/patch the qdf-normalised track figures."""
import re, subprocess

def qdf(src, dst):
    subprocess.run(['qpdf', '--qdf', '--object-streams=disable', src, dst], check=True)

def content_obj(d):
    """(objnum, start, end) of the page content stream (largest stream with BT)."""
    best = None
    for m in re.finditer(rb'(\d+) 0 obj\s*<<(.{0,400}?)>>\s*stream\r?\n', d, re.S):
        end = d.find(b'\nendstream', m.end())
        if b'BT' not in d[m.end():end]:
            continue
        if best is None or end - m.end() > best[2] - best[1]:
            best = (int(m.group(1)), m.end(), end)
    return best

def tounicode(d, objnum):
    m = re.search(rb'(?<![0-9])' + str(objnum).encode() + rb' 0 obj(.{0,400}?)stream\r?\n(.*?)\nendstream', d, re.S)
    body, mp = m.group(2), {}
    for bf in re.finditer(rb'beginbfchar(.*?)endbfchar', body, re.S):
        for a, b in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', bf.group(1)):
            mp[int(a, 16)] = ''.join(chr(int(b[i:i+4], 16)) for i in range(0, len(b), 4))
    for bf in re.finditer(rb'beginbfrange(.*?)endbfrange', body, re.S):
        for lo, hi, dst in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', bf.group(1)):
            lo, hi, dst = int(lo, 16), int(hi, 16), int(dst, 16)
            for k in range(lo, hi + 1):
                mp[k] = chr(dst + k - lo)
    return mp

def cid_widths(d, fontobj):
    """gid -> width (/1000) from the descendant CIDFont /W array."""
    o = re.search(rb'(?<![0-9])' + str(fontobj).encode() + rb' 0 obj(.{0,900}?)endobj', d, re.S).group(1)
    desc = re.search(rb'/DescendantFonts \[?\s*(\d+) 0 R', o).group(1)
    o2 = re.search(rb'(?<![0-9])' + desc + rb' 0 obj(.{0,4000}?)endobj', d, re.S).group(1)
    dw = float(re.search(rb'/DW ([\d.]+)', o2).group(1)) if re.search(rb'/DW ([\d.]+)', o2) else 1000.0
    body = re.search(rb'/W \[(.*?)\n  \]', o2, re.S).group(1).decode()
    toks = body.replace('[', ' [ ').replace(']', ' ] ').split()
    w, i = {}, 0
    while i < len(toks):
        first = int(float(toks[i])); i += 1
        if toks[i] == '[':
            i += 1; gid = first
            while toks[i] != ']':
                w[gid] = float(toks[i]); gid += 1; i += 1
            i += 1
        else:
            last = int(float(toks[i])); i += 1
            val = float(toks[i]); i += 1
            for g in range(first, last + 1):
                w[g] = val
    return w, dw

def set_stream(d, objnum, new):
    """Replace the content of stream `objnum` and fix its (indirect) /Length."""
    m = re.search(rb'(?<![0-9])' + str(objnum).encode() + rb' 0 obj\s*<<(.{0,400}?)>>\s*stream\r?\n', d, re.S)
    start = m.end(); end = d.find(b'\nendstream', start)
    lenref = re.search(rb'/Length (\d+) 0 R', m.group(1))
    d = d[:start] + new + d[end:]
    if lenref:
        ln = int(lenref.group(1))
        pat = re.compile(rb'(?<![0-9])' + str(ln).encode() + rb' 0 obj\s*\n?\s*\d+\s*\n?endobj')
        d = pat.sub(f'{ln} 0 obj\n{len(new)}\nendobj'.encode(), d, count=1)
    return d
