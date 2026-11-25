const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const videoPath = path.resolve('src/assests/wedding_invite_assests/1.mp4');
const outPath = path.resolve('public/images/first-video-frame.jpg');

const htmlContent = `<!DOCTYPE html>
<html>
<body>
<video id="v" src="/video.mp4" muted playsinline preload="auto" autoplay></video>
<script>
  const v = document.getElementById('v');
  function capture() {
    try {
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 720;
      c.height = v.videoHeight || 1280;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      fetch('/save', {
        method: 'POST',
        body: c.toDataURL('image/jpeg', 0.95)
      });
    } catch (e) {
      fetch('/error?msg=' + encodeURIComponent(e.message));
    }
  }
  v.addEventListener('loadeddata', () => {
    v.currentTime = 0;
  });
  v.addEventListener('seeked', () => {
    setTimeout(capture, 100);
  });
  v.addEventListener('canplaythrough', () => {
    setTimeout(capture, 150);
  });
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.url === '/video.mp4') {
    const stat = fs.statSync(videoPath);
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size
    });
    fs.createReadStream(videoPath).pipe(res);
  } else if (req.url === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const base64Data = body.replace(/^data:image\/jpeg;base64,/, '');
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
      console.log('Successfully saved frame 0 to', outPath);
      res.writeHead(200);
      res.end('ok');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    });
  } else if (req.url.startsWith('/error')) {
    console.error('Client error:', req.url);
    res.writeHead(200);
    res.end();
  }
});

server.listen(59231, () => {
  console.log('Server listening on 59231, launching Edge...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  exec(`"${edgePath}" --headless --disable-gpu --autoplay-policy=no-user-gesture-required http://localhost:59231/`, (err) => {
    if (err) console.error('Edge error:', err);
  });
});

setTimeout(() => {
  console.log('Timeout after 15s');
  server.close();
  process.exit(1);
}, 15000);
