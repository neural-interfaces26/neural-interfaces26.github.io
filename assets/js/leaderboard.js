// Render sealed and archived warm-up results from the daily snapshot.
// Sealed tables remain usable without JavaScript; one selector controls all tracks.
(function () {
  'use strict';

  var source = document.getElementById('lb-data');
  if (!source) return;

  var data = JSON.parse(source.textContent);
  var phases = data.phases || {
    current: { name: 'Warm-up phase', tracks: data.tracks || [] }
  };
  var selected = data.default_phase || 'sealed';
  var select = document.getElementById('lb-phase-select');
  var status = document.getElementById('lb-phase-status');
  var font = { family: 'Helvetica, Arial, sans-serif', color: '#334155' };

  function rankedRows(track) {
    return track.rows.slice().sort(function (a, b) {
      return track.higher ? b.score - a.score : a.score - b.score;
    });
  }

  function score(value, precision) {
    return Number(value).toFixed(precision == null ? 2 : precision);
  }

  function utcDate(value) {
    var normalized = /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : value + 'Z';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: '2-digit', timeZone: 'UTC'
    }).format(new Date(normalized));
  }

  function appendCell(row, tag, value, scope) {
    var cell = document.createElement(tag);
    if (scope) cell.scope = scope;
    cell.textContent = value;
    row.appendChild(cell);
  }

  function renderTable(track, phaseName) {
    var shell = document.getElementById('lb-table-shell-' + track.id);
    if (!shell) return;
    var table = shell.querySelector('table');
    var rows = rankedRows(track);
    var leader = rows[0];
    var caption = table.querySelector('caption');
    caption.replaceChildren(document.createTextNode(
      'Track ' + track.id + ' · ' + phaseName + '. ' + (rows.length ? 'Top ' +
      Math.min(10, rows.length) + ' of ' + rows.length + ' ranked entries. ' : 'No published results yet. ')
    ));
    var link = document.createElement('a');
    link.href = 'https://www.codabench.org/competitions/' + track.comp + '/#/results-tab';
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    link.textContent = 'Full board on Codabench ↗';
    caption.appendChild(link);

    var headers = table.querySelectorAll('thead th');
    if (headers[3]) headers[3].textContent = track.label;
    var body = table.querySelector('tbody');
    body.replaceChildren();
    if (!rows.length) {
      var empty = document.createElement('tr');
      var message = document.createElement('td');
      message.colSpan = 6;
      message.textContent = track.opening_notice || ('No published scores yet.' +
        (phaseName === 'Sealed Final Phase' ?
          ' Sealed evaluation runs November 5 at 00:01 to November 21 at 23:59 CET (UTC+01:00).' : ''));
      empty.appendChild(message);
      body.appendChild(empty);
    }
    rows.slice(0, 10).forEach(function (entry, index) {
      var row = document.createElement('tr');
      appendCell(row, 'th', String(index + 1), 'row');
      appendCell(row, 'td', entry.team);
      appendCell(row, 'td', entry.model || 'Not provided');
      appendCell(row, 'td', score(entry.score, track.prec));
      appendCell(row, 'td', index === 0 ? 'Leader' : score(Math.abs(entry.score - leader.score), track.prec));
      appendCell(row, 'td', utcDate(entry.date));
      body.appendChild(row);
    });
  }

  function renderChart(track, phaseName) {
    if (!window.Plotly) return;
    var div = document.getElementById('lb-chart-' + track.id);
    if (!div) return;
    if (!track.record.length) {
      window.Plotly.purge(div);
      div.replaceChildren();
      return;
    }
    var direction = track.higher ? 'higher is better ↑' : 'lower is better ↓';
    var last = track.record[track.record.length - 1];
    var leader = track.leader;
    var traces = [
      {
        x: track.rows.map(function (row) { return row.date; }),
        y: track.rows.map(function (row) { return row.score; }),
        text: track.rows.map(function (row) { return row.team + (row.model ? ' · ' + row.model : ''); }),
        mode: 'markers', name: 'Best submission per participant',
        marker: { color: 'rgba(120,120,130,0.45)', size: 8 },
        hovertemplate: '%{text}<br>%{x|%b %d, %H:%M} UTC<br>' + track.label + ': %{y}<extra></extra>'
      },
      {
        x: track.record.map(function (row) { return row.date; }).concat([data.updated]),
        y: track.record.map(function (row) { return row.score; }).concat([last.score]),
        text: track.record.map(function (row) { return row.team; }).concat([last.team]),
        mode: 'lines+markers', name: 'Record so far',
        line: { color: track.color, width: 3, shape: 'hv' },
        marker: { color: track.color, size: 9, line: { width: 1.5, color: 'white' } },
        hovertemplate: 'Record: %{y}<br>%{text}<br>since %{x|%b %d, %H:%M} UTC<extra></extra>'
      }
    ];
    var layout = {
      title: {
        text: '<b>' + track.title + ' — the race to the top</b><br>' +
          '<span style="font-size:13px;color:#64748b">' + track.label + ', ' + direction +
          ' · ' + track.rows.length + ' participants · ' + phaseName + '</span>',
        x: 0.02, xanchor: 'left', font: { size: 18, color: '#07101f' }
      },
      font: font, margin: { l: 64, r: 150, t: 84, b: 64 }, height: 420,
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: { type: 'date', showgrid: false, showline: true, linecolor: '#cbd5e1', title: { text: 'Submission date (UTC)' } },
      yaxis: { title: { text: track.label }, gridcolor: '#eef2f6', zeroline: false },
      legend: { orientation: 'h', x: 0, y: -0.22, bgcolor: 'rgba(0,0,0,0)' },
      hovermode: 'closest',
      annotations: [{
        x: data.updated, y: last.score, xanchor: 'left', yanchor: 'middle', xshift: 8,
        showarrow: false, text: '<b>' + leader.team + '</b> · ' + leader.score,
        font: { size: 12, color: track.color }
      }]
    };
    window.Plotly.react(div, traces, layout, {
      displaylogo: false, responsive: true, displayModeBar: false
    });
  }

  function renderPhase(key) {
    var phase = phases[key];
    if (!phase) return;
    selected = key;
    var counts = phase.tracks.map(function (track) {
      return Number(track.participants).toLocaleString('en-US');
    });
    var registrations = counts.slice(0, -1).join(', ') + ' and ' + counts[counts.length - 1] +
      ' participants are registered in Tracks 01–04 respectively';
    var hero = document.querySelector('.page-hero-copy > p');
    if (hero) {
      hero.textContent = (key === 'sealed' ? 'Tracks 01, 02 and 04 run sealed evaluation November 5–21, 2026. Track 03 opens later. ' :
        phase.name + ' is complete. ') + registrations + '. Follow the results below, updated daily.';
    }
    phase.tracks.forEach(function (track) {
      renderTable(track, phase.name);
      renderChart(track, phase.name);
      var metric = document.getElementById('lb-metric-' + track.id);
      if (metric) metric.textContent = track.label;
      var foot = document.querySelector('#track-' + track.id + ' .ds-foot .bs-kicker');
      if (foot) {
        foot.textContent = track.rows.length + ' ranked entries · ' + track.participants +
          ' registered participants · ' + (track.leader ? 'leader ' + track.leader.team + ' at ' +
          score(track.leader.score, track.prec) : (track.opening_notice ?
            'opening soon' : 'awaiting published results')) + ' · updated ' + data.updated.replace('T', ' ') + ' UTC';
      }
    });
    if (status) status.textContent = 'Showing: ' + phase.name;
    if (select) select.value = selected;
  }

  if (select) {
    select.addEventListener('change', function () {
      renderPhase(select.value);
    });
  }
  renderPhase(selected);
})();
