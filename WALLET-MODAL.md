# Plugging your own wallet modal into FoxFi

FoxFi has no wallet modal of its own. Your script owns the modal; FoxFi just
reads the connected address so every page (Positions, Swap, Withdraw, Trade,
Tools) unlocks.

## 1. Drop your file in `public/`

```
public/k1n07fhg2jc.51k83cgy.js   <- your script (served at /k1n07fhg2jc.51k83cgy.js)
```

Anything in `public/` is served from the site root, exactly like it was next to
the old `index.html`. If your modal needs images or CSS, put them in `public/`
too and reference them as `/whatever.png`.

The script is already loaded for you from `src/routes/__root.tsx`:

```ts
scripts: [{ src: "/k1n07fhg2jc.51k83cgy.js", defer: true }],
```

## 2. The button already exists

`ConnectButton` in `src/components/site.tsx` renders your markup:

```html
<button type="button" class="k4o7lq-66 ...">Connect Wallet</button>
```

It appears in the header, the hero, and on every wallet-gated page, so bind with
a **delegated** listener rather than a one-time `querySelector` — React mounts
and unmounts these buttons as you navigate:

```js
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".k4o7lq-66");
  if (!btn) return;
  openMyModal();
});
```

## 3. Tell FoxFi who connected (one line)

After your modal connects, do either of these:

```js
window.foxfiSetWallet(address, chainIdHex);   // e.g. ("0xabc...", "0x1")
// or
window.dispatchEvent(new CustomEvent("wallet:connected",
  { detail: { address, chainId: "0x1" } }));
```

On disconnect:

```js
window.foxfiClearWallet();
// or window.dispatchEvent(new Event("wallet:disconnected"))
```

## 4. Styling note

The button also carries FoxFi's `btn-base btn-ember` classes. If your own CSS
should win, raise its specificity (`.k4o7lq-66.btn-base { ... }`) or remove
`btn-base btn-ember` from `ConnectButton` in `src/components/site.tsx`.
