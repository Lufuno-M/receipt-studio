#!/usr/bin/env python3
"""
Applies the StockX structural redesign to receipt-studio-v4.
Does an exact-match replace on both files — if either OLD block doesn't
match verbatim, it aborts with an error instead of guessing. Safe to
run: nothing is touched unless both matches succeed.
"""
import sys

CSS_PATH = "src/styles/receipts.css"
JS_PATH = "src/render/renderReceipt.js"

OLD_CSS = """/* ── StockX ── */
.sx-wrap{background:#fff;font-family:Helvetica,Arial,sans-serif}
.sx-header{background:#509E2F;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}
.sx-logo{font-size:16px;font-weight:900;color:#fff;letter-spacing:2px}
.sx-arrival-info{text-align:center}
.sx-arrival-label{font-size:9px;color:#fff;line-height:13px}
.sx-arrival-date{font-size:10px;color:#fff;font-weight:700}
.sx-body{padding:18px}
.sx-order-conf{font-size:17px;font-weight:700;color:#000;text-align:center;margin-bottom:6px}
.sx-congrats{font-size:11px;color:#333;text-align:center;line-height:17px;margin-bottom:18px}
.sx-product-box{background:#fafafa;border:1px solid #eee;border-radius:4px;padding:14px;display:flex;gap:14px;align-items:flex-start}
.sx-product-img{width:110px;height:82px;background:#e0e0e0;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;overflow:hidden}
.sx-product-img img{width:100%;height:100%;object-fit:cover}
.sx-product-name{font-size:13px;font-weight:700;color:#509E2F;margin-bottom:6px;line-height:17px}
.sx-attr{font-size:10px;color:#333;margin-bottom:2px}
.sx-line{display:flex;justify-content:space-between;font-size:10px;color:#333;padding:2px 0}
.sx-line.total{font-weight:700;font-size:11px;border-top:1px solid #ccc;padding-top:5px;margin-top:3px}
.sx-footer{background:#509E2F;padding:9px;text-align:center;font-size:9px;color:#fff;letter-spacing:1px;margin-top:14px}"""

NEW_CSS = """/* ── StockX ──
   Verified-authentic badge, three-step authentication timeline,
   monospace order/style IDs, separated fee card — the process-driven
   register that distinguishes StockX's real confirmation emails from
   a plain marketplace receipt. */
.sx-wrap{background:#fff;font-family:Helvetica,Arial,sans-serif}
.sx-header{background:#509E2F;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}
.sx-logo{font-size:16px;font-weight:900;color:#fff;letter-spacing:2px}
.sx-arrival-info{text-align:center}
.sx-arrival-label{font-size:9px;color:#fff;line-height:13px}
.sx-arrival-date{font-size:10px;color:#fff;font-weight:700}
.sx-body{padding:18px}
.sx-order-conf{font-size:17px;font-weight:700;color:#000;text-align:center;margin-bottom:6px}
.sx-congrats{font-size:11px;color:#333;text-align:center;line-height:17px;margin-bottom:14px}
.sx-verify-badge{display:flex;align-items:center;justify-content:center;gap:6px;background:#eef7e9;border:1px solid #509E2F;border-radius:20px;padding:6px 14px;margin:0 auto 18px;width:fit-content}
.sx-verify-badge svg{width:13px;height:13px;flex-shrink:0}
.sx-verify-badge span{font-size:10px;font-weight:700;letter-spacing:.5px;color:#357a1f;text-transform:uppercase}
.sx-timeline{display:flex;align-items:flex-start;padding:0 6px;margin-bottom:20px}
.sx-timeline-step{flex:1;text-align:center;position:relative}
.sx-timeline-dot{width:9px;height:9px;border-radius:50%;background:#509E2F;margin:0 auto 6px;position:relative;z-index:1}
.sx-timeline-step.pending .sx-timeline-dot{background:#dcdcdc}
.sx-timeline-line{position:absolute;top:4px;left:50%;width:100%;height:1px;background:#509E2F;z-index:0}
.sx-timeline-step.pending .sx-timeline-line{background:#dcdcdc}
.sx-timeline-step:last-child .sx-timeline-line{display:none}
.sx-timeline-label{font-size:8px;letter-spacing:.6px;text-transform:uppercase;color:#333;font-weight:600}
.sx-timeline-step.pending .sx-timeline-label{color:#999}
.sx-product-box{background:#fafafa;border:1px solid #eee;border-radius:4px;padding:14px;display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
.sx-product-img{width:110px;height:82px;background:#e0e0e0;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0;overflow:hidden}
.sx-product-img img{width:100%;height:100%;object-fit:cover}
.sx-product-name{font-size:13px;font-weight:700;color:#509E2F;margin-bottom:6px;line-height:17px}
.sx-attr{font-size:10px;color:#333;margin-bottom:2px;font-family:'SF Mono','Roboto Mono',monospace}
.sx-fee-card{border:1px solid #eee;border-radius:4px;overflow:hidden}
.sx-line{display:flex;justify-content:space-between;font-size:10px;color:#333;padding:7px 12px;border-bottom:1px solid #f5f5f5}
.sx-line:last-child{border-bottom:none}
.sx-line.total{font-weight:700;font-size:11px;background:#fafafa}
.sx-footer{background:#509E2F;padding:9px;text-align:center;font-size:9px;color:#fff;letter-spacing:1px;margin-top:14px}"""

OLD_JS = '''function renderStockX(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0;
  return `
  <div class="sx-wrap">
    <div class="sx-header">
      <span class="sx-logo">${brandLogo(logoUrl, 'STOCKX', 20)}</span>
      <div class="sx-arrival-info">
        <div class="sx-arrival-label">ESTIMATED ARRIVAL AT YOUR DOOR:</div>
        <div class="sx-arrival-date">${v.arr1} - ${v.arr2}</div>
      </div>
    </div>
    <div class="sx-body">
      <div class="sx-order-conf">Order Confirmation</div>
      <div class="sx-congrats">Congrats! Your latest StockX purchase is on the way. You can expect to receive it by ${v.arr2}.</div>
      <div class="sx-product-box">
        <div class="sx-product-img">${imgEl(v, 'img', '👟')}</div>
        <div>
          <div class="sx-product-name">${v.product}</div>
          <div class="sx-attr">Style ID: ${v.style}</div>
          <div class="sx-attr">Size: ${v.size}</div>
          <div class="sx-attr">Order: ${v.order}</div>
          <div class="sx-line"><span>Purchase Price:</span><span>${fmt(price, c)}</span></div>
          <div class="sx-line"><span>Shipping:</span><span>${fmt(ship, c)}</span></div>
          <div class="sx-line"><span>Authentication Fee:</span><span>FREE</span></div>
          <div class="sx-line total"><span>TOTAL</span><span>${fmt(total, c)}</span></div>
        </div>
      </div>
    </div>
    <div class="sx-footer">stockx.com | Help | Jobs</div>
  </div>`;
}'''

NEW_JS = '''function renderStockX(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0;
  const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#357a1f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  return `
  <div class="sx-wrap">
    <div class="sx-header">
      <span class="sx-logo">${brandLogo(logoUrl, 'STOCKX', 20)}</span>
      <div class="sx-arrival-info">
        <div class="sx-arrival-label">ESTIMATED ARRIVAL AT YOUR DOOR:</div>
        <div class="sx-arrival-date">${v.arr1} - ${v.arr2}</div>
      </div>
    </div>
    <div class="sx-body">
      <div class="sx-order-conf">Order Confirmation</div>
      <div class="sx-congrats">Congrats! Your latest StockX purchase is on the way. You can expect to receive it by ${v.arr2}.</div>
      <div class="sx-verify-badge">${checkSvg}<span>Verified Authentic</span></div>
      <div class="sx-timeline">
        <div class="sx-timeline-step"><div class="sx-timeline-line"></div><div class="sx-timeline-dot"></div><div class="sx-timeline-label">Ordered</div></div>
        <div class="sx-timeline-step"><div class="sx-timeline-line"></div><div class="sx-timeline-dot"></div><div class="sx-timeline-label">Verified</div></div>
        <div class="sx-timeline-step pending"><div class="sx-timeline-line"></div><div class="sx-timeline-dot"></div><div class="sx-timeline-label">Shipping</div></div>
      </div>
      <div class="sx-product-box">
        <div class="sx-product-img">${imgEl(v, 'img', '👟')}</div>
        <div>
          <div class="sx-product-name">${v.product}</div>
          <div class="sx-attr">STYLE ID: ${v.style}</div>
          <div class="sx-attr">SIZE: ${v.size}</div>
          <div class="sx-attr">ORDER: ${v.order}</div>
        </div>
      </div>
      <div class="sx-fee-card">
        <div class="sx-line"><span>Purchase Price</span><span>${fmt(price, c)}</span></div>
        <div class="sx-line"><span>Shipping</span><span>${fmt(ship, c)}</span></div>
        <div class="sx-line"><span>Authentication Fee</span><span>FREE</span></div>
        <div class="sx-line total"><span>TOTAL</span><span>${fmt(total, c)}</span></div>
      </div>
    </div>
    <div class="sx-footer">stockx.com | Help | Jobs</div>
  </div>`;
}'''

def patch(path, old, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    count = content.count(old)
    if count != 1:
        print(f"ABORT: {label} — expected exactly 1 match of the old block in {path}, found {count}.")
        print("Nothing was written. The file may already differ from what this script expects.")
        sys.exit(1)
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK: {label} patched in {path}")

patch(CSS_PATH, OLD_CSS, NEW_CSS, "StockX CSS block")
patch(JS_PATH, OLD_JS, NEW_JS, "renderStockX function")
print("\nDone. Run npm run dev and open StockX to check it.")
