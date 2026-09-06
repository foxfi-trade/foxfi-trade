# Plugging your own wallet modal (noir.js) into FoxFi

FoxFi has no wallet modal of its own anymore. Your script owns the modal; FoxFi
just reads the connected address so every page (Positions, Swap, Withdraw,
Trade, Tools) unlocks.

## 1. Drop your files in `public/`

```
public/noir.js     <- your script  (served at /noir.js)
public/noir.css    <- your styles  (served at /noir.css, optional)
```

Anything in `public/` is served from the site root, exactly like it was next to
the old `index.html`. If your modal needs images, put them in `public/` too and
reference them as `/whatever.png`.

They are already loaded for you from `src/routes/__root.tsx`:

```ts
links:   [ ..., { rel: "stylesheet", href: "/noir.css" } ],
scripts: [ { src: "/noir.js", defer: true } ],
```

(If you don't have a `noir.css`, delete that one line to avoid a 404.)

## 2. The button already exists

`ConnectButton` in `src/components/site.tsx` renders exactly your markup:

```html
<button type="button" class="connect-wallet noir-connect noir-evm ...">Connect Wallet</button>
```

It appears in the header, the hero, and on every wallet-gated page, so bind with
a **delegated** listener rather than a one-time `querySelector` — React mounts
and unmounts these buttons as you navigate:

```js
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".noir-connect");
  if (!btn) return;
  openNoirModal();          // your modal
});
```

## 3. Tell FoxFi who connected (one line)

After your modal connects, do either of these:

```js
window.foxfiSetWallet(address, chainIdHex);   // e.g. ("0xabc...", "0x1")
// or
window.dispatchEvent(new CustomEvent("noir:connected",
  { detail: { address, chainId: "0x1" } }));
```

On disconnect:

```js
window.foxfiClearWallet();
// or window.dispatchEvent(new Event("noir:disconnected"))
```

If your modal simply calls `eth_requestAccounts` on `window.ethereum`, you don't
need any of this — FoxFi already picks up `eth_accounts`, `accountsChanged` and
`chainChanged` automatically.

## 4. Turn off FoxFi's fallback

FoxFi has a minimal built-in fallback connect so the buttons aren't dead before
your script lands. Disable it by adding this at the top of `noir.js`:

```js
window.__noirReady = true;
```

Then clicks do nothing but run your handler.

## 5. Styling note

The buttons also carry FoxFi's `btn-base btn-ember` classes. If your `noir.css`
should win, either raise its specificity (`.noir-connect.connect-wallet { ... }`)
or remove `btn-base btn-ember` from `ConnectButton` in
`src/components/site.tsx`.
