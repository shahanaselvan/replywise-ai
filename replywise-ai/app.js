(function () {
  var TONES = ["Professional", "Friendly", "Concise", "Apologetic", "Assertive", "Appreciative"];
  var LENGTHS = ["Short", "Medium", "Detailed"];
  var REFINES = ["Shorter", "Warmer", "More direct", "Fix grammar"];
  var state = { tone: "Professional", length: "Short", busy: false, ctrl: null };
  var $ = function (id) { return document.getElementById(id); };

  function chips(host, items, key) {
    items.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = name;
      b.setAttribute("aria-pressed", String(state[key] === name));
      b.addEventListener("click", function () {
        state[key] = name;
        Array.prototype.forEach.call(host.children, function (c) {
          c.setAttribute("aria-pressed", String(c.textContent === name));
        });
      });
      host.appendChild(b);
    });
  }
  chips($("tones"), TONES, "tone");
  chips($("lengths"), LENGTHS, "length");

  REFINES.forEach(function (name) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn small ghost";
    b.textContent = name;
    b.addEventListener("click", function () { run(name); });
    $("refine").appendChild(b);
  });

  function words(t) { var m = t.trim().match(/\S+/g); return m ? m.length : 0; }
  function currentBody() { return $("body").textContent; }
  function currentSubject() { return $("subjText").textContent; }
  function setCount() { $("count").textContent = words(currentBody()) + " words"; }
  function showError(msg) { var e = $("err"); e.hidden = !msg; e.textContent = msg || ""; }

  function setBusy(on) {
    state.busy = on;
    $("go").disabled = on;
    $("stop").hidden = !on;
    Array.prototype.forEach.call($("refine").querySelectorAll("button"), function (b) { b.disabled = on; });
    $("sheet").classList.toggle("busy", on);
  }

  function render(text) {
    var t = String(text || "").replace(/\r/g, "");
    var m = t.match(/^\s*Subject:\s*(.*)\n+/i);
    if (m) { $("subjText").textContent = m[1].trim(); t = t.slice(m[0].length); }
    $("body").textContent = t.replace(/^\s+/, "");
    setCount();
  }

  async function run(refine) {
    if (state.busy) return;
    showError("");
    if (!$("email").value.trim()) { showError("Paste the email you want to reply to first."); return; }

    var payload = {
      email: $("email").value,
      points: $("points").value,
      tone: state.tone,
      length: state.length,
      sender: $("sender").value,
      refine: refine || null,
      draft: refine ? { subject: currentSubject(), body: currentBody() } : null
    };

    state.ctrl = new AbortController();
    setBusy(true);
    $("status").textContent = "Writing…";
    $("exTag").hidden = true;

    try {
      var res = await fetch("/api/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: state.ctrl.signal
      });
      var data = {};
      try { data = await res.json(); } catch (e) {}
      if (!res.ok) {
        showError(data.error || "Could not write the reply. Try again.");
        $("status").textContent = "";
        return;
      }
      render(data.text);
      $("status").textContent = "Ready to copy";
    } catch (e) {
      if (e && e.name === "AbortError") { $("status").textContent = "Stopped"; }
      else { showError("Network problem. Check your connection and try again."); $("status").textContent = ""; }
    } finally {
      setBusy(false);
      state.ctrl = null;
    }
  }

  $("go").addEventListener("click", function () { run(null); });
  $("stop").addEventListener("click", function () { if (state.ctrl) state.ctrl.abort(); });

  function copyText(text, btn, done) {
    var orig = btn.textContent;
    function ok() { btn.textContent = done; setTimeout(function () { btn.textContent = orig; }, 1400); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); }
      catch (e) { btn.textContent = "Select and copy manually"; setTimeout(function () { btn.textContent = orig; }, 2200); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  }
  $("copy").addEventListener("click", function () { copyText(currentBody().trim(), $("copy"), "Copied"); });
  $("copySubj").addEventListener("click", function () { copyText(currentSubject().trim(), $("copySubj"), "Copied"); });

  setCount();
})();
