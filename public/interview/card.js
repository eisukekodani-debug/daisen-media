/* 意見カードの絵を描く（インタビュー画面と「AIインタビュー」ページで共通） */
var CATCH = '選挙の日じゃなくても、町は動かせる。';

// インタビューのテーマごとに、カードの題名と上の写真を変える。テーマを増やすときはここに足す
var THEMES = {
  gikai: { title: '大山町議会について', photo: '/interview/daisen.jpg' }
};

function wrap(ctx, text, width) {
  // 単語のまとまりで改行する（使えない環境では1文字ずつ）
  var parts = window.Intl && Intl.Segmenter
    ? Array.from(new Intl.Segmenter('ja', { granularity: 'word' }).segment(text), function (s) { return s.segment; })
    : text.split('');
  var out = [], cur = '', last = '';
  parts.forEach(function (p) {
    if (ctx.measureText(cur + p).width <= width || !cur || /^[、。」』）！？ー]/.test(p)) { cur += p; last = p; return; }
    // 「と」「が」などの助詞で行が始まらないよう、直前の語ごと次の行へ送る
    if (/^[とがのをにはもでへやだ]$/.test(p) && last && cur.length > last.length) {
      out.push(cur.slice(0, cur.length - last.length)); cur = last + p; last = p; return;
    }
    out.push(cur); cur = p; last = p;
  });
  if (cur) out.push(cur);
  // 1語が長すぎて枠からはみ出す行は、1文字ずつ折り返す
  return out.reduce(function (acc, row) {
    if (ctx.measureText(row).width <= width * 1.04) { acc.push(row); return acc; }
    var c = '';
    row.split('').forEach(function (ch) {
      if (ctx.measureText(c + ch).width > width && c) { acc.push(c); c = ch; } else c += ch;
    });
    if (c) acc.push(c);
    return acc;
  }, []);
}

// カード上部の大山（daisen.jpg：元写真の y=560〜1080 を切り抜いたもの）
function drawDaisen(x, bx, by, bw, bh, photo) {
  x.fillStyle = '#CFE6EA'; x.fillRect(bx, by, bw, bh);
  if (!photo || !photo.naturalWidth) return;
  var sh = photo.naturalWidth * bh / bw; // 縦横の比率を保ち、上（空）を削る
  x.drawImage(photo, 0, photo.naturalHeight - sh, photo.naturalWidth, sh, bx, by, bw, bh);
}

function roundRect(x, l, t, w, h, r) {
  x.beginPath();
  x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath();
}

// カードの似顔絵（男性・女性・どちらでもない）。丸の中に、顔と肩だけの簡単な絵
function drawAvatar(x, cx, cy, r, sex) {
  var bg = sex === 'm' ? '#DCE7EF' : sex === 'f' ? '#F4E1DA' : '#E6E6E1';
  var cloth = sex === 'm' ? '#3F6274' : sex === 'f' ? '#B4654F' : '#7C8288';
  var hair = '#3B2F2A', skin = '#F2D3B8';
  x.save();
  x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.clip();
  x.fillStyle = bg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  var u = r / 56;
  if (sex === 'f') { // 後ろ髪
    x.fillStyle = hair; x.beginPath(); x.ellipse(cx, cy + 2 * u, 31 * u, 38 * u, 0, 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = cloth; x.beginPath(); x.ellipse(cx, cy + 62 * u, 44 * u, 34 * u, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = skin; x.fillRect(cx - 8 * u, cy + 14 * u, 16 * u, 16 * u);
  x.beginPath(); x.arc(cx, cy - 4 * u, 23 * u, 0, Math.PI * 2); x.fill();
  if (sex) { // 前髪
    x.fillStyle = hair; x.beginPath();
    x.ellipse(cx, cy - 12 * u, 25 * u, sex === 'f' ? 20 * u : 18 * u, 0, Math.PI, Math.PI * 2);
    x.closePath(); x.fill();
  } else {
    x.fillStyle = '#9AA0A6'; x.beginPath(); x.ellipse(cx, cy - 14 * u, 24 * u, 15 * u, 0, Math.PI, Math.PI * 2); x.closePath(); x.fill();
  }
  x.fillStyle = '#3B2F2A';
  x.beginPath(); x.arc(cx - 8 * u, cy - 2 * u, 2.4 * u, 0, Math.PI * 2); x.arc(cx + 8 * u, cy - 2 * u, 2.4 * u, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#B5715A'; x.lineWidth = 2 * u; x.lineCap = 'round';
  x.beginPath(); x.arc(cx, cy + 4 * u, 6 * u, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke();
  x.restore();
  x.strokeStyle = '#FFFFFF'; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
}

function drawCard(ls, nick, sex, themeKey) {
  var theme = THEMES[themeKey] || THEMES.gikai;
  var W = 1080, H = 1080, PAD = 90;
  var c = document.createElement('canvas');
  c.width = W; c.height = H;
  var x = c.getContext('2d');
  var qr = new Image();
  var photo = new Image();
  var photoReady = new Promise(function (ok) { photo.onload = ok; photo.onerror = ok; });
  photo.src = theme.photo;
  var qrReady = new Promise(function (ok) { qr.onload = ok; qr.onerror = ok; });
  qr.src = '/line-qr.svg';
  var fonts = document.fonts ? Promise.all([
    document.fonts.load('800 48px "Shippori Mincho B1"'),
    document.fonts.load('700 30px "Zen Kaku Gothic New"')
  ]).catch(function () {}) : Promise.resolve();

  return Promise.all([qrReady, photoReady, fonts]).then(function () {
    var M = '"Shippori Mincho B1","Hiragino Mincho ProN",serif';
    var G = '"Zen Kaku Gothic New","Hiragino Sans",sans-serif';
    x.fillStyle = '#FAF8F3'; x.fillRect(0, 0, W, H);
    drawDaisen(x, 50, 50, W - 100, 250, photo);
    x.strokeStyle = '#222'; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, H - 80);
    x.lineWidth = 1; x.strokeRect(50, 50, W - 100, H - 100);
    x.textBaseline = 'top';

    // 写真の右上：インタビューのテーマ（白い札）
    var ts = 34;
    for (; ts > 24; ts -= 2) { x.font = '800 ' + ts + 'px ' + M; if (x.measureText(theme.title).width <= 560) break; }
    var tw = Math.max(x.measureText(theme.title).width, 200) + 44;
    var tl = W - PAD + 14 - tw;
    x.fillStyle = 'rgba(255,255,255,0.86)'; roundRect(x, tl, 74, tw, ts + 54, 10); x.fill();
    x.fillStyle = '#4A5560'; x.font = '700 20px ' + G; x.fillText('インタビューのテーマ', tl + 22, 86);
    x.fillStyle = '#222'; x.font = '800 ' + ts + 'px ' + M; x.fillText(theme.title, tl + 22, 114);

    // 写真の下端に似顔絵を重ね、右に「わたしの意見」とお名前
    drawAvatar(x, PAD + 66, 300, 66, sex);
    var NX = PAD + 156;
    x.fillStyle = '#3F6274'; x.font = '800 30px ' + M; x.fillText('わたしの意見', NX, 312);
    var nm = nick || '匿名', ns = 46;
    for (; ns > 26; ns -= 2) { x.font = '800 ' + ns + 'px ' + G; if (x.measureText(nm).width <= W - PAD - NX) break; }
    x.fillStyle = '#222'; x.fillText(nm, NX, 352);

    // 3行の意見：枠に収まるまで文字を小さくする
    var top = 452, bottom = 800, size = 48, blocks, total;
    for (; size >= 32; size -= 2) {
      x.font = '700 ' + size + 'px ' + M;
      blocks = ls.map(function (l) { return wrap(x, l, W - PAD * 2 - 56); });
      total = blocks.reduce(function (n, b) { return n + b.length; }, 0) * size * 1.5 + (blocks.length - 1) * 34;
      if (total <= bottom - top) break;
    }
    var y = top + Math.max(0, (bottom - top - total) / 2);
    blocks.forEach(function (b, i) {
      x.fillStyle = '#3F6274'; x.fillRect(PAD, y + size * 0.42, 22, 22);
      x.fillStyle = '#222'; x.font = '700 ' + size + 'px ' + M;
      b.forEach(function (row) { x.fillText(row, PAD + 56, y); y += size * 1.5; });
      if (i < blocks.length - 1) {
        x.strokeStyle = '#D6D0C3'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(PAD, y + 12); x.lineTo(W - PAD, y + 12); x.stroke();
        y += 34;
      }
    });

    x.strokeStyle = '#222'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(PAD, 820); x.lineTo(W - PAD, 820); x.stroke();
    x.fillStyle = '#595959'; x.font = '700 24px ' + G;
    x.fillText('AIインタビューに答えて、まとめた意見です', PAD, 846);
    x.fillStyle = '#222'; x.font = '800 34px ' + M; x.fillText(CATCH, PAD, 890);
    x.fillStyle = '#595959'; x.font = '700 24px ' + G;
    x.fillText('公式LINE「議員定数削減の署名活動」', PAD, 948);
    if (qr.naturalWidth) { x.fillStyle = '#fff'; x.fillRect(W - PAD - 150, 838, 150, 150); x.drawImage(qr, W - PAD - 144, 844, 138, 138); }
    return c.toDataURL('image/png');
  });
}

