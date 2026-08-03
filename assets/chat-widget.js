/**
 * SCM Signpost — chat widget
 * Samostatný soubor. Do index.html stačí přidat před </body>:
 *   <script src="assets/chat-widget.js" defer></script>
 */
(function () {
  "use strict";

  var WORKER_URL = "https://scm-chat.blazek-jak.workers.dev";
  var MAX_CHARS = 1000;
  var MAX_HISTORY = 12;

  var GREETING =
    "Dobrý den. Zeptejte se na cokoli ohledně 3PL tendrů, skladové efektivity, " +
    "dopravy, WMS/TMS nebo krizového řízení.";

  var SUGGESTIONS = [
    "Jak probíhá audit 3PL tendru?",
    "Co potřebujete pro analýzu?",
    "Jak funguje spolupráce?"
  ];

  /* ---------- styly ---------- */

  var CSS = [
    "#scmChatBtn{position:fixed;right:24px;bottom:24px;z-index:9998;",
    "font-family:'Roboto Mono',monospace;font-weight:700;font-size:11px;letter-spacing:.1em;",
    "text-transform:uppercase;padding:14px 20px;background:#FFD700;color:#262626;",
    "border:none;cursor:pointer;transition:opacity .15s;}",
    "#scmChatBtn:hover{opacity:.85;}",
    "#scmChatBtn[hidden]{display:none;}",

    "#scmChatPanel{position:fixed;right:24px;bottom:24px;z-index:9999;width:380px;",
    "max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 48px);",
    "display:flex;flex-direction:column;background:#2E2E2E;border:1px solid #3A3D41;",
    "font-family:'Inter',sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45);}",
    "#scmChatPanel[hidden]{display:none;}",

    "#scmChatHead{display:flex;align-items:center;justify-content:space-between;",
    "padding:14px 16px;border-bottom:1px solid #2C2F33;flex:0 0 auto;}",
    "#scmChatHead span{font-family:'Roboto Mono',monospace;font-size:10px;",
    "letter-spacing:.2em;text-transform:uppercase;color:#FFD700;}",
    "#scmChatClose{background:transparent;border:none;color:#9298A0;cursor:pointer;",
    "font-size:20px;line-height:1;padding:0 4px;}",
    "#scmChatClose:hover{color:#FFFFFF;}",

    "#scmChatLog{flex:1 1 auto;overflow-y:auto;padding:16px;display:flex;",
    "flex-direction:column;gap:12px;}",
    ".scm-msg{font-size:14px;line-height:1.55;white-space:pre-wrap;padding:10px 12px;",
    "max-width:88%;word-wrap:break-word;overflow-wrap:anywhere;}",
    ".scm-bot{background:#2C2F33;color:#FFFFFF;align-self:flex-start;",
    "border-left:2px solid #FFD700;}",
    ".scm-user{background:#3A3D41;color:#FFFFFF;align-self:flex-end;}",
    ".scm-err{background:rgba(255,215,0,.10);border:1px solid #FFD700;color:#FFD700;",
    "align-self:flex-start;font-family:'Roboto Mono',monospace;font-size:12px;}",

    "#scmChatSugg{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;flex:0 0 auto;}",
    "#scmChatSugg[hidden]{display:none;}",
    ".scm-sugg{font-family:'Roboto Mono',monospace;font-size:10px;letter-spacing:.05em;",
    "background:transparent;border:1px solid #3A3D41;color:#9298A0;padding:6px 10px;",
    "cursor:pointer;transition:border-color .15s,color .15s;text-align:left;}",
    ".scm-sugg:hover{border-color:#FFD700;color:#FFFFFF;}",

    "#scmChatFoot{flex:0 0 auto;border-top:1px solid #2C2F33;padding:12px 16px 10px;}",
    "#scmChatForm{display:flex;gap:8px;align-items:flex-end;}",
    "#scmChatInput{flex:1 1 auto;background:#2C2F33;border:1px solid #3A3D41;color:#FFFFFF;",
    "padding:10px;font-family:'Inter',sans-serif;font-size:14px;resize:none;outline:none;",
    "max-height:110px;line-height:1.5;}",
    "#scmChatInput:focus{border-color:#FFD700;}",
    "#scmChatSend{background:#FFD700;color:#262626;border:none;padding:10px 14px;",
    "font-family:'Roboto Mono',monospace;font-weight:700;font-size:12px;cursor:pointer;",
    "transition:opacity .15s;flex:0 0 auto;}",
    "#scmChatSend:hover{opacity:.85;}",
    "#scmChatSend:disabled{opacity:.4;cursor:not-allowed;}",
    "#scmChatNote{font-family:'Roboto Mono',monospace;font-size:9px;color:#9298A0;",
    "margin-top:8px;line-height:1.4;}",

    "#scmChatPanel :focus-visible{outline:2px solid #FFD700;outline-offset:2px;}",

    "@media(max-width:520px){",
    "#scmChatPanel{right:0;bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;",
    "border:none;}",
    "#scmChatBtn{right:16px;bottom:16px;}",
    "}"
  ].join("");

  /* ---------- DOM ---------- */

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "scmChatBtn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Otevřít chat");
  btn.textContent = "Chat →";

  var panel = document.createElement("div");
  panel.id = "scmChatPanel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "SCM Signpost asistent");
  panel.innerHTML =
    '<div id="scmChatHead">' +
      "<span>// SCM Asistent</span>" +
      '<button id="scmChatClose" type="button" aria-label="Zavřít chat">&times;</button>' +
    "</div>" +
    '<div id="scmChatLog" aria-live="polite"></div>' +
    '<div id="scmChatSugg"></div>' +
    '<div id="scmChatFoot">' +
      '<div id="scmChatForm">' +
        '<textarea id="scmChatInput" rows="1" maxlength="' + MAX_CHARS + '" ' +
          'placeholder="Napište dotaz…" aria-label="Váš dotaz"></textarea>' +
        '<button id="scmChatSend" type="button">→</button>' +
      "</div>" +
      '<p id="scmChatNote">Odpovídá AI asistent. Pro závazné posouzení kontaktujte ' +
      "info@scmsignpost.com</p>" +
    "</div>";

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var log = panel.querySelector("#scmChatLog");
  var suggBox = panel.querySelector("#scmChatSugg");
  var input = panel.querySelector("#scmChatInput");
  var sendBtn = panel.querySelector("#scmChatSend");
  var closeBtn = panel.querySelector("#scmChatClose");

  /* ---------- stav ---------- */

  var history = [];
  var busy = false;
  var started = false;

  function addMsg(text, kind) {
    var el = document.createElement("div");
    el.className = "scm-msg " + kind;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function renderSuggestions() {
    suggBox.innerHTML = "";
    SUGGESTIONS.forEach(function (q) {
      var s = document.createElement("button");
      s.type = "button";
      s.className = "scm-sugg";
      s.textContent = q;
      s.addEventListener("click", function () {
        suggBox.hidden = true;
        send(q);
      });
      suggBox.appendChild(s);
    });
    suggBox.hidden = false;
  }

  function openPanel() {
    panel.hidden = false;
    btn.hidden = true;
    if (!started) {
      started = true;
      addMsg(GREETING, "scm-bot");
      renderSuggestions();
    }
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    btn.hidden = false;
    btn.focus();
  }

  /* ---------- odeslání ---------- */

  function send(text) {
    if (busy) return;
    text = (text || "").trim();
    if (!text) return;

    suggBox.hidden = true;
    addMsg(text, "scm-user");
    history.push({ role: "user", content: text });
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

    input.value = "";
    input.style.height = "auto";
    busy = true;
    sendBtn.disabled = true;

    var pending = addMsg("…", "scm-bot");

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    })
      .then(function (r) {
        return r.json().then(function (d) {
          return { ok: r.ok, data: d };
        });
      })
      .then(function (res) {
        if (res.ok && res.data && res.data.reply) {
          pending.textContent = res.data.reply;
          history.push({ role: "assistant", content: res.data.reply });
        } else {
          pending.remove();
          addMsg(
            (res.data && res.data.error) ||
              "Odpověď se nepodařilo načíst. Napište prosím na info@scmsignpost.com.",
            "scm-err"
          );
        }
      })
      .catch(function () {
        pending.remove();
        addMsg(
          "Spojení se nezdařilo. Zkuste to prosím znovu, nebo napište na info@scmsignpost.com.",
          "scm-err"
        );
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = false;
        log.scrollTop = log.scrollHeight;
        input.focus();
      });
  }

  /* ---------- události ---------- */

  btn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  sendBtn.addEventListener("click", function () { send(input.value); });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });

  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 110) + "px";
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });
})();
