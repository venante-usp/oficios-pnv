export class Counter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    let value = (await this.state.storage.get("counter")) ?? 0;

    const url = new URL(request.url);

    if (url.pathname === "/get") {
      return new Response(String(value));
    }

    if (url.pathname === "/inc") {
      value++;
      await this.state.storage.put("counter", value);
      return new Response(String(value));
    }

    if (url.pathname === "/dec") {
      value = Math.max(0, value - 1);
      await this.state.storage.put("counter", value);
      return new Response(String(value));
    }

    return new Response("ok");
  }
}

export default {
  async fetch(request, env) {
    const id = env.COUNTER.idFromName("global");
    const obj = env.COUNTER.get(id);

    const url = new URL(request.url);

    if (url.pathname === "/api/inc") {
      return obj.fetch("https://counter/inc");
    }

    if (url.pathname === "/api/dec") {
      return obj.fetch("https://counter/dec");
    }

    if (url.pathname === "/api/get") {
      return obj.fetch("https://counter/get");
    }

    return new Response(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ofícios</title>
  <style>
    body { font-family: Arial; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; }
    #num { font-size:80px; margin:20px; }
    button { font-size:40px; margin:10px; width:90px; height:90px; border-radius:12px; cursor:pointer; }
  </style>
</head>
<body>
  <h1>Controle de Ofícios</h1>
  <div id="num">000</div>
  <div>
    <button onclick="dec()">-</button>
    <button onclick="inc()">+</button>
  </div>

<script>
async function load(){
  const r = await fetch('/api/get');
  const v = await r.text();
  document.getElementById('num').innerText = String(v).padStart(3,'0');
}
async function inc(){
  const r = await fetch('/api/inc');
  const v = await r.text();
  document.getElementById('num').innerText = String(v).padStart(3,'0');
}
async function dec(){
  const r = await fetch('/api/dec');
  const v = await r.text();
  document.getElementById('num').innerText = String(v).padStart(3,'0');
}
load();
</script>
</body>
</html>`, {
      headers: {"content-type":"text/html"}
    });
  }
};
