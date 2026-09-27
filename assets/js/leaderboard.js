// Renders the record-progression chart per track from the inline #lb-data JSON (written by
// scripts/leaderboard-progress.py). Same design as eeg2025.github.io: faint dots = each team's
// best submission, bold step line = record so far, leader labelled at the end.
(function () {
  var el = document.getElementById('lb-data');
  if (!el || !window.Plotly) return;
  var data = JSON.parse(el.textContent);
  var font = { family: 'Helvetica, Arial, sans-serif', color: '#334155' };
  var now = data.updated;
  data.tracks.forEach(function (t) {
    var div = document.getElementById('lb-chart-' + t.id);
    if (!div) return;
    var dir = t.higher ? 'higher is better ↑' : 'lower is better ↓';
    var last = t.record[t.record.length - 1];
    var lead = t.leader;
    var traces = [
      { x: t.rows.map(function (r) { return r.date; }), y: t.rows.map(function (r) { return r.score; }),
        text: t.rows.map(function (r) { return r.team + (r.model ? ' · ' + r.model : ''); }),
        mode: 'markers', name: 'Best submission per team', marker: { color: 'rgba(120,120,130,0.45)', size: 8 },
        hovertemplate: '%{text}<br>%{x|%b %d, %H:%M} UTC<br>' + t.label + ': %{y}<extra></extra>' },
      { x: t.record.map(function (r) { return r.date; }).concat([now]),
        y: t.record.map(function (r) { return r.score; }).concat([last.score]),
        text: t.record.map(function (r) { return r.team; }).concat([last.team]),
        mode: 'lines+markers', name: 'Record so far', line: { color: t.color, width: 3, shape: 'hv' },
        marker: { color: t.color, size: 9, line: { width: 1.5, color: 'white' } },
        hovertemplate: 'Record: %{y}<br>%{text}<br>since %{x|%b %d, %H:%M} UTC<extra></extra>' }
    ];
    var layout = {
      title: { text: '<b>' + t.title + ' — the race to the top</b><br><span style="font-size:13px;color:#64748b">' +
              t.label + ', ' + dir + ' · ' + t.rows.length + ' teams · warm-up phase</span>',
              x: 0.02, xanchor: 'left', font: { size: 18, color: '#07101f' } },
      font: font, margin: { l: 64, r: 150, t: 84, b: 64 }, height: 420,
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { type: 'date', showgrid: false, showline: true, linecolor: '#cbd5e1', title: { text: 'Submission date (UTC)' } },
      yaxis: { title: { text: t.label }, gridcolor: '#eef2f6', zeroline: false },
      legend: { orientation: 'h', x: 0, y: -0.22, bgcolor: 'rgba(0,0,0,0)' }, hovermode: 'closest',
      annotations: [{ x: now, y: last.score, xanchor: 'left', yanchor: 'middle', xshift: 8, showarrow: false,
                      text: '<b>' + lead.team + '</b> · ' + lead.score, font: { size: 12, color: t.color } }]
    };
    Plotly.newPlot(div, traces, layout, { displaylogo: false, responsive: true, displayModeBar: false });
  });
})();
