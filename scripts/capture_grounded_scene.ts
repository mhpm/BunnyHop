import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--window-size=1280,720',
    'http://localhost:3000/',
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch('http://127.0.0.1:9224/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {}
  }

  if (!targets) {
    console.error('Failed to connect to Edge');
    proc.kill();
    return;
  }

  const page = targets.find((t) => t.type === 'page');
  const wsUrl = page.webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);

  let nextId = 1;
  function send(method: string, params: any = {}) {
    return new Promise((resolve) => {
      const id = nextId++;
      const handler = (evt: any) => {
        const data = JSON.parse(evt.data.toString());
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Input.enable');

  // Wait 2s for MainMenu
  await new Promise((r) => setTimeout(r, 2000));

  // Click JUGAR AHORA
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('JUGAR') || b.textContent.includes('JUGAR AHORA'));
      if (btn) btn.click();
    })()`
  });

  // Wait 2s for level to spawn
  await new Promise((r) => setTimeout(r, 2000));

  // Capture Screenshot 1: Spawn & starting meadow
  const shot1: any = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1?.data) {
    fs.writeFileSync('C:\\Users\\miche\\.gemini\\antigravity-ide\\brain\\543d315a-cf69-4f74-9f94-b84265894667\\grounded_scene_start.png', Buffer.from(shot1.data, 'base64'));
  }

  // Move right for 1.8s towards the farm section with windmill, barn, cow
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await new Promise((r) => setTimeout(r, 1800));
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });

  await new Promise((r) => setTimeout(r, 500));

  // Capture Screenshot 2: Farm clearing with windmill, cow, white fence
  const shot2: any = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2?.data) {
    fs.writeFileSync('C:\\Users\\miche\\.gemini\\antigravity-ide\\brain\\543d315a-cf69-4f74-9f94-b84265894667\\grounded_scene_farm.png', Buffer.from(shot2.data, 'base64'));
  }

  console.log('Saved grounded_scene_start.png and grounded_scene_farm.png');
  ws.close();
  proc.kill();
}

run().catch(console.error);
