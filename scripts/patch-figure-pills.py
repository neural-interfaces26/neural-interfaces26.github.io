#!/usr/bin/env python3
"""Patch the shift/metric pills on the Track 3 and Track 4 figure PDFs.

The figures were printed from HTML by headless Chrome, so their text is real
(CID TrueType, Identity-H) but the embedded fonts are subsetted. Two of the
three edits only need glyphs the subset already carries, so they are done by
rewriting the glyph-id string in place and re-centring the run in its pill.
The third ("cross-device") needs 'd' and 'v', which the Track 3 subset does
not contain, so that run is blanked and redrawn in base-14 Helvetica —
metrically identical to Liberation Sans, which is why the re-centring maths
is the same for both paths.
"""
import re, subprocess, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from _pdflib import qdf, content_obj, tounicode, cid_widths, set_stream

# Helvetica / Arial / Liberation Sans share these advance widths.
HELV = {' ': 278, '-': 333, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556,
        'i': 222, 'o': 556, 'r': 333, 's': 500, 'u': 556, 'v': 500}


def pill_centre_x(lines, tj_index, txt_cm, pill_cm):
    """Centre of the pill behind the run, expressed in the text block's frame."""
    fi = next(j for j in range(tj_index, 0, -1) if lines[j] == 'f')
    qi = next(j for j in range(fi, 0, -1) if lines[j] == 'q')
    xs = []
    for j in range(qi, fi):
        m = re.match(r'^([-\d. ]+)(m|l|c)$', lines[j])
        if m:
            v = [float(t) for t in m.group(1).split()]
            xs += v[0::2]
    scale = txt_cm[0]
    shift = (pill_cm[4] - txt_cm[4]) / scale          # pill frame -> text frame
    return (min(xs) + max(xs)) / 2 + shift


def locate(lines, uni, wanted):
    for i, l in enumerate(lines):
        if not l.endswith('Tj'):
            continue
        hx = re.findall(r'<([0-9A-Fa-f]+)>', l)
        if not hx:
            continue
        txt = ''.join(uni.get(int(h[k:k + 4], 16), '?') for h in hx for k in range(0, len(h), 4))
        if txt == wanted:
            tm_i = next(j for j in range(i, 0, -1) if ' Tm' in lines[j])
            tf_i = next(j for j in range(i, 0, -1) if ' Tf' in lines[j])
            cm_i = next(j for j in range(i, 0, -1) if lines[j].endswith(' cm'))
            fi = next(j for j in range(i, 0, -1) if lines[j] == 'f')
            pcm_i = next(j for j in range(fi, 0, -1) if lines[j].endswith(' cm'))
            return dict(tj=i, tm=tm_i, tf=tf_i,
                        size=float(lines[tf_i].split()[1]),
                        txt_cm=[float(t) for t in lines[cm_i].split()[:6]],
                        pill_cm=[float(t) for t in lines[pcm_i].split()[:6]])
    raise SystemExit(f'run {wanted!r} introuvable')


def patch(name, tuobj, fontobj, edits, helv_edits=()):
    qdf(f'{name}.pdf', f'/tmp/{name}_in.pdf')
    d = open(f'/tmp/{name}_in.pdf', 'rb').read()
    num, s, e = content_obj(d)
    lines = [l.strip().decode('latin1') for l in d[s:e].split(b'\n')]
    uni = tounicode(d, tuobj)
    rev = {v: k for k, v in uni.items()}
    w, dw = cid_widths(d, fontobj)
    gwidth = lambda t: sum(w.get(rev[c], dw) for c in t)
    hwidth = lambda t: sum(HELV[c] for c in t)

    overlay = []
    for old, new in edits:                       # in-place glyph substitution
        loc = locate(lines, uni, old)
        cx = pill_centre_x(lines, loc['tj'], loc['txt_cm'], loc['pill_cm'])
        wid = gwidth(new) * loc['size'] / 1000
        x0 = cx - wid / 2
        tm = lines[loc['tm']].split()
        tm[4] = f'{x0:.5f}'
        lines[loc['tm']] = ' '.join(tm)
        lines[loc['tj']] = '<' + ''.join(f'{rev[c]:04X}' for c in new) + '> Tj'
        print(f'  {name}: {old!r} -> {new!r}  (x {x0:.2f}, largeur {wid:.2f})')

    for old, new in helv_edits:                  # blank + redraw in Helvetica
        loc = locate(lines, uni, old)
        cx = pill_centre_x(lines, loc['tj'], loc['txt_cm'], loc['pill_cm'])
        wid = hwidth(new) * loc['size'] / 1000
        x0 = cx - wid / 2
        y0 = float(lines[loc['tm']].split()[5])
        col = next(lines[j] for j in range(loc['tj'], 0, -1) if lines[j].endswith(' rg'))
        col = ' '.join(col.split()[-4:-1])
        lines[loc['tj']] = '<> Tj'
        c = loc['txt_cm']
        overlay.append(
            f'q\n{c[0]} {c[1]} {c[2]} {c[3]} {c[4]} {c[5]} cm\n{col} rg\n'
            f'BT /HPATCH {loc["size"]} Tf 1 0 0 -1 {x0:.5f} {y0} Tm ({new}) Tj ET\nQ')
        print(f'  {name}: {old!r} -> {new!r} en Helvetica  (x {x0:.2f}, largeur {wid:.2f})')

    stream = ('\n'.join(lines) + ('\n' + '\n'.join(overlay) if overlay else '')).encode('latin1')
    d = set_stream(d, num, stream)

    if overlay:                                  # declare the base-14 font
        m = re.search(rb'/Font\s*<<', d)
        ins = m.end()
        d = d[:ins] + (b'\n    /HPATCH << /Type /Font /Subtype /Type1 '
                       b'/BaseFont /Helvetica /Encoding /WinAnsiEncoding >>') + d[ins:]

    open(f'/tmp/{name}_out.pdf', 'wb').write(d)
    # Byte-level edits invalidate the xref offsets; qpdf rebuilds the table
    # from the object headers (exit 3 = warnings only, which is expected here).
    r = subprocess.run(['qpdf', '--stream-data=compress', '--object-streams=generate',
                        f'/tmp/{name}_out.pdf', f'{name}.pdf'], capture_output=True)
    if r.returncode not in (0, 3):
        raise SystemExit(r.stderr.decode())
    chk = subprocess.run(['qpdf', '--check', f'{name}.pdf'], capture_output=True)
    print(f'  -> {name}.pdf réécrit · qpdf --check: '
          + ('OK' if chk.returncode == 0 else chk.stdout.decode().strip()[:200]))


# Run from assets/img/. Re-export the PNGs afterwards with:
#   magick -density 180 <fig>.pdf -background white -alpha remove -alpha off \
#          -trim +repage figures/<fig>@2x.png      # and -density 90 for the 1x
if __name__ == '__main__':
    patch('emg-to-text', 30, 19, edits=[('cross-subject', 'cross-user')])
    patch('sleep_prediction', 27, 19,
          edits=[('MAE \u2193', 'W-bMAE \u2193')],
          helv_edits=[('cross-subject', 'cross-device')])
