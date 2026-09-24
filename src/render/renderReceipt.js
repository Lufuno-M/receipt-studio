// Pure functions: (template, values, currency, logoUrl) in, HTML string out.
// Each brand now has its own render function AND its own reason for the
// document shape it produces — this file intentionally does not share a
// "receipt skeleton" between brands. Where two brands render similarly it's
// because the underlying artifact genuinely is similar (e.g. Amazon/eBay
// really are both cost-ladder order confirmations) — not because of a
// shared default.

function fmt(n, currency = '$') {
  return currency + parseFloat(n || 0).toFixed(2);
}

function imgEl(values, fieldId, fallback) {
  const url = values[fieldId];
  if (url) return `<img src="${url}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  return fallback;
}

function brandLogo(logoUrl, fallbackHtml, maxHeight = 26) {
  if (!logoUrl) return fallbackHtml;
  return `<img src="${logoUrl}" alt="logo" style="max-height:${maxHeight}px;max-width:160px;object-fit:contain;display:block">`;
}

function nl2br(s) {
  return (s || '').replace(/\n/g, '<br>');
}

export function calcTotal(template, values) {
  const price = parseFloat(values.price) || 0;
  const disc = parseFloat(values.disc) || 0;
  const ship = parseFloat(values.ship) || 0;
  const tax = parseFloat(values.tax) || 0;
  const hasDisc = template.fields.some(f => f.id === 'disc');
  return hasDisc ? price - disc + ship + tax : price + ship + tax;
}

// ───────────────────────── Amazon — Order Confirmation ─────────────────────
// White, wordmark-only, plain-text delivery estimate. No navy banner, no
// highlighted arrival box — Amazon's real confirmation email is quieter
// than the storefront.
function renderAmazon(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="amz-wrap">
    <div class="amz-header">${brandLogo(logoUrl, 'amazon', 22)}</div>
    <div class="amz-body">
      <div class="amz-greeting">Hello ${v.name},</div>
      <div class="amz-thanks">Your order has been placed. Order Confirmation #${v.order} — ${v.date}.</div>
      <div class="amz-arrival-line">Arriving <strong>${v.arr1} – ${v.arr2}</strong></div>
      <div class="amz-divider"></div>
      <div class="amz-product-row">
        <div class="amz-product-img">${imgEl(v, 'img', '📦')}</div>
        <div style="flex:1">
          <div class="amz-product-name">${v.product}</div>
          <div class="amz-product-sold">Sold by: ${v.sold}</div>
          <div class="amz-product-qty">Qty: ${v.qty}</div>
        </div>
        <div class="amz-product-price">${fmt(price, c)}</div>
      </div>
      <div class="amz-divider"></div>
      <div class="amz-lines">
        <div class="amz-line"><span>Item(s) Subtotal:</span><span>${fmt(price, c)}</span></div>
        <div class="amz-line"><span>Shipping & Handling:</span><span>${ship === 0 ? '$0.00' : fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="amz-line discount"><span>Discount:</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="amz-line"><span>Tax:</span><span>${fmt(tax, c)}</span></div>
        <div class="amz-line total"><span>Order Total:</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="amz-info-grid">
        <div class="amz-info-block">
          <div class="amz-info-label">Shipping Address</div>
          <div class="amz-info-val">${v.saddr}</div>
        </div>
        <div class="amz-info-block">
          <div class="amz-info-label">Payment Method</div>
          <div class="amz-info-val">${v.paymethod}</div>
        </div>
      </div>
    </div>
    <div class="amz-footer">
      <p>Amazon.com | Your Orders | Help</p>
    </div>
  </div>`;
}

// ───────────────────────── Apple — App Store Receipt ───────────────────────
// Developer + item type collapse into one small grey line under the product
// name, exactly as Apple's real receipt does — they are never their own
// labeled fields in the genuine document.
function renderApple(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="apple-wrap">
    <div class="apple-header">${brandLogo(logoUrl, '<span class="apple-logo">🍎</span>', 22)}<span class="apple-receipt-label">Receipt</span></div>
    <div class="apple-info-grid">
      <div class="apple-info-cell"><div class="apple-info-label">Apple ID</div><div class="apple-info-val">${v.email}</div></div>
      <div class="apple-info-cell"><div class="apple-info-label">Billed To</div><div class="apple-info-val">${v.card}<br>${v.bname}<br>${v.baddr}</div></div>
      <div class="apple-info-cell"><div class="apple-info-label">Date</div><div class="apple-info-val">${v.date}</div></div>
      <div class="apple-info-cell"><div class="apple-info-label">Order ID</div><div class="apple-info-val" style="color:#0073ff">${v.order}</div></div>
    </div>
    <div class="apple-section-header"><span>App Store</span><span>Price</span></div>
    <div class="apple-product-row">
      <div class="apple-product-icon">${imgEl(v, 'img', '📱')}</div>
      <div style="flex:1">
        <div class="apple-product-name">${v.product}</div>
        <div class="apple-product-meta">${v.dev} · ${v.type}</div>
      </div>
      <div class="apple-product-price">${fmt(price, c)}</div>
    </div>
    <div class="apple-divider"></div>
    <div class="apple-total-row"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
    <div class="apple-total-row"><span>Tax</span><span>${fmt(tax, c)}</span></div>
    <div class="apple-total-row grand"><span>Total</span><span>${fmt(total, c)}</span></div>
    <div class="apple-footer">Questions about this receipt? <span class="apple-link">Report a Problem</span>. If this purchase was made by a family member, it may be part of Family Sharing.</div>
  </div>`;
}

// ───────────────────────── eBay — Order Confirmation ───────────────────────
// Headline reads "You won!" for auctions vs "Your order is confirmed" for
// Buy It Now — and the seller, a stranger you're trusting, carries a
// feedback score the way it always does on the real platform.
function renderEbay(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  const isAuction = (v.listingType || '').toLowerCase() === 'auction';
  const headline = isAuction ? 'You won!' : 'Your order is confirmed';
  return `
  <div class="ebay-wrap">
    <div class="ebay-header"><div class="ebay-logo">${brandLogo(logoUrl, '<span class="ebay-e">e</span><span class="ebay-b">b</span><span class="ebay-a">a</span><span class="ebay-y">y</span>', 20)}</div></div>
    <div class="ebay-body">
      <div class="ebay-title">${headline}</div>
      <div class="ebay-subtitle">Order #${v.order} · ${v.date} · ${v.listingType || 'Buy It Now'}</div>
      <div class="ebay-product-row">
        <div class="ebay-product-img">${imgEl(v, 'img', '🛒')}</div>
        <div style="flex:1">
          <div class="ebay-product-name">${v.product}</div>
          <div class="ebay-product-detail">Condition: ${v.cond}<br>Size: ${v.size}</div>
          <div class="ebay-seller">${v.seller} <span class="ebay-feedback">(${v.feedback})</span></div>
        </div>
        <div class="ebay-product-price">${fmt(price, c)}</div>
      </div>
      <div class="ebay-lines">
        <div class="ebay-line"><span>Item price</span><span>${fmt(price, c)}</span></div>
        <div class="ebay-line"><span>Shipping</span><span>${fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="ebay-line"><span>Discount</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="ebay-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>
        <div class="ebay-line total"><span>Order total</span><span>${fmt(total, c)}</span></div>
      </div>
      <div style="font-size:11px;color:#555;margin-top:10px">
        <strong style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#333;display:block;margin-bottom:3px">Ship to</strong>
        ${v.saddr}
      </div>
    </div>
    <div class="ebay-footer">Sold by ${v.seller}, fulfilled via eBay | Help & Contact | Privacy</div>
  </div>`;
}

// ───────────────────────── END. — Order Confirmation ───────────────────────
function renderEND(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="end-top">${brandLogo(logoUrl, '<span class="end-logo">END.</span>', 16)}</div>
  <div class="end-hero">
    <div class="end-greeting">Hi ${v.name}, We've received your order</div>
    <div class="end-sub">Your order <a>#${v.order}</a> will soon be on its way. We'll be in touch once it's dispatched with the tracking details.</div>
  </div>
  <div class="end-body">
    <div class="end-order-title">Order Summary</div>
    <div class="end-product">
      <div class="end-img">${imgEl(v, 'img', '👟')}</div>
      <div>
        <div class="end-pname">${v.product}</div>
        <div class="end-pcolor">${v.colorway}</div>
        <div class="end-psizeprice"><span>${v.size} QTY ${v.qty}</span><span>${fmt(price, c)}</span></div>
      </div>
    </div>
    <div class="end-lines">
      <div class="end-line"><span>Subtotal:</span><span>${fmt(price, c)}</span></div>
      <div class="end-line"><span>Discount:</span><span>-${fmt(disc, c)}</span></div>
      <div class="end-line"><span>Shipping:</span><span>${fmt(ship, c)}</span></div>
      <div class="end-line"><span>Tax:</span><span>${fmt(tax, c)}</span></div>
    </div>
    <div class="end-total-row"><span class="end-total-label">Total:</span><span class="end-total-val">${fmt(total, c)}</span></div>
  </div>
  <div class="end-grey">
    <div class="end-addresses">
      <div class="end-addr"><p><strong>Shipping Address</strong>${v.street}<br>${v.city}<br>${v.country}<br>${v.state}</p></div>
      <div class="end-addr"><p><strong>Billing Address</strong>${v.street}<br>${v.city}<br>${v.country}<br>${v.state}</p></div>
    </div>
    <div class="end-methods">
      <div class="end-method"><strong>Shipping Method</strong>${v.shipmethod}</div>
      <div class="end-method"><strong>Payment Method</strong>${v.paymethod}</div>
      <div class="end-method"><strong>Estimated Arrival</strong><div class="end-arrival">${v.arr1} – ${v.arr2}</div></div>
    </div>
  </div>
  <div class="end-info"><strong>Additional Information</strong>
    <p>We'll send you an email once your order is dispatched containing tracking details, or you can check its progress by visiting <a href="#">your account</a>.</p>
    <p>To avoid delays please check your billing address matches the address shown on your card statement.</p>
  </div>
  <div class="end-qs"><strong>Any Questions?</strong>
    <p>If you have any issues with your order, please get in touch within 30 minutes. Contact us on +44 (0)333 323 7728 or info@endclothing.com.</p>
  </div>
  <div class="end-footer"><div class="end-footer-title">Contact Us</div><p>T: +44 (0)333 323 7728</p><p>E: info@endclothing.com</p></div>
  <div class="end-legal">END., Unit C Merlin Way, Newcastle Upon Tyne, NE27 0QG | Registered in England - 865368680</div>`;
}

// ───────────────────────── GOAT — Authenticity Card ────────────────────────
// Not an order receipt. This is the card that ships inside the box: no
// price, no shipping, no "total" — a condition grade, a certificate number,
// and who authenticated it.
function renderGOAT(v, total, c, logoUrl) {
  return `
  <div class="goat-card">
    <div class="goat-card-top">
      ${brandLogo(logoUrl, '<span class="goat-card-logo">GOAT</span>', 20)}
      <div class="goat-seal">✓ VERIFIED</div>
    </div>
    <div class="goat-card-title">Authenticity Card</div>
    <div class="goat-card-product">${v.product}</div>
    <div class="goat-card-attrs">
      <div><span>Style ID</span><b>${v.style}</b></div>
      <div><span>Size</span><b>${v.size}</b></div>
      <div><span>Condition</span><b>${v.grade}</b></div>
    </div>
    <div class="goat-card-divider"></div>
    <div class="goat-card-cert">
      <div><span>Certificate No.</span><b>${v.serial}</b></div>
      <div><span>Verified On</span><b>${v.verifiedDate}</b></div>
    </div>
    <div class="goat-card-footer">Authenticated by ${v.authenticator}. Not what you expected? You're covered by GOAT's Buyer Protection.</div>
  </div>`;
}

// ───────────────────────── StockX — Order Confirmation ─────────────────────
// Protected per the previous redesign: verification pill, three-step
// authentication timeline, monospace IDs, a bordered fee card. Rebuilt here
// from that spec so the template file is complete and self-consistent —
// diff against your live copy before treating this as final.
function renderStockX(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0;
  return `
  <div class="sx-wrap">
    <div class="sx-header">
      <span class="sx-logo">${brandLogo(logoUrl, 'StockX', 18)}</span>
      <div class="sx-verified-pill"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 5.5L4 8.5L9 1.5" stroke="white" stroke-width="1.6" fill="none"/></svg> Verified Authentic</div>
    </div>
    <div class="sx-body">
      <div class="sx-order-conf">Order Confirmed</div>
      <div class="sx-congrats">Your bid was accepted. Here's what happens next.</div>
      <div class="sx-timeline">
        <div class="sx-tl-step done"><div class="sx-tl-dot"></div><span>Ordered</span></div>
        <div class="sx-tl-line"></div>
        <div class="sx-tl-step"><div class="sx-tl-dot"></div><span>Verified</span></div>
        <div class="sx-tl-line"></div>
        <div class="sx-tl-step"><div class="sx-tl-dot"></div><span>Shipping</span></div>
      </div>
      <div class="sx-product-box">
        <div class="sx-product-img">${imgEl(v, 'img', '👟')}</div>
        <div>
          <div class="sx-product-name">${v.product}</div>
          <div class="sx-attr mono">Style ID: ${v.style}</div>
          <div class="sx-attr mono">Size: ${v.size}</div>
          <div class="sx-attr mono">Order: ${v.order}</div>
        </div>
      </div>
      <div class="sx-fee-card">
        <div class="sx-line"><span>Purchase Price</span><span>${fmt(price, c)}</span></div>
        <div class="sx-line"><span>Shipping</span><span>${fmt(ship, c)}</span></div>
        <div class="sx-line"><span>Authentication Fee</span><span>FREE</span></div>
        <div class="sx-line total"><span>Total</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="sx-arrival">Estimated arrival: ${v.arr1} – ${v.arr2}</div>
    </div>
    <div class="sx-footer">stockx.com | Help | Jobs</div>
  </div>`;
}

// ───────────────────────── Nike — SNKRS Draw Result ─────────────────────────
// This is the artifact people actually screenshot — not the order email.
// Full-bleed result state first, everything else secondary.
function renderNike(v, total, c, logoUrl) {
  const won = (v.result || '').toLowerCase().includes('got');
  return `
  <div class="nsk-wrap">
    <div class="nsk-top">${brandLogo(logoUrl, '<span class="nsk-swoosh">SNKRS</span>', 16)}</div>
    <div class="nsk-result ${won ? 'won' : 'lost'}">${won ? 'You got the W' : 'Not this time'}</div>
    <div class="nsk-release">${v.release}</div>
    <div class="nsk-meta">
      <div><span>Entrant</span><b>${v.name}</b></div>
      <div><span>Size Entered</span><b>${v.sizeEntered}</b></div>
    </div>
    ${won ? `
    <div class="nsk-window">
      <div class="nsk-window-label">Purchase Window</div>
      <div class="nsk-window-val">${v.purchaseWindow}</div>
    </div>` : `
    <div class="nsk-consolation">You weren't selected for this release. Better luck next drop.</div>`}
    <div class="nsk-foot">
      <div><span>Retail</span><b>${fmt(v.retail, c)}</b></div>
      <div><span>Release Date</span><b>${v.releaseDate}</b></div>
      <div><span>Entry ID</span><b>${v.order}</b></div>
    </div>
  </div>`;
}

// ───────────────────────── Goyard — Boutique Acquisition Ticket ────────────
// Goyard doesn't run e-commerce at scale — this is a boutique slip, not a
// checkout receipt. No shipping, no payment method, no discount.
function renderGoyard(v, total, c, logoUrl) {
  return `
  <div class="goy-ticket">
    <div class="goy-ticket-head">${brandLogo(logoUrl, '<span class="goy-logo">GOYARD</span>', 16)}<div class="goy-sub-head">ACQUISITION TICKET</div></div>
    <div class="goy-ticket-row"><span>Client</span><b>${v.name}</b></div>
    <div class="goy-ticket-row"><span>Date</span><b>${v.date}</b></div>
    <div class="goy-ticket-divider"></div>
    <div class="goy-ticket-item">${v.product}</div>
    <div class="goy-ticket-row"><span>Reference</span><b>${v.ref}</b></div>
    <div class="goy-ticket-row"><span>Colorway</span><b>${v.color}</b></div>
    <div class="goy-ticket-desc">${v.desc}</div>
    ${v.personalization ? `<div class="goy-ticket-personalization"><span>Personalization</span>${v.personalization}</div>` : ''}
    <div class="goy-ticket-divider"></div>
    <div class="goy-ticket-row"><span>Boutique</span><b>${v.boutique}</b></div>
    <div class="goy-ticket-row"><span>Sales Associate</span><b>${v.associate}</b></div>
  </div>`;
}

// ───────────────────────── Supreme — Order Receipt ─────────────────────────
// Rebuilt from the actual document: bare monospace packing slip, black box
// logo, a barcode, a plain disclaimer paragraph. Deliberately less designed
// than the rest of this collection — that flatness is the brand's identity.
function renderSupreme(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  const barcodeBars = Array.from({ length: 46 }).map((_, i) => `<div style="width:${(i % 5 === 0) ? 2 : 1}px;background:#000;height:100%;margin-right:1px"></div>`).join('');
  return `
  <div class="sup-slip">
    <div class="sup-slip-top">
      <div class="sup-box-logo">${brandLogo(logoUrl, 'Supreme', 16)}</div>
      <div class="sup-barcode">${barcodeBars}</div>
    </div>
    <div class="sup-slip-line"><b>Order</b> #${v.order}</div>
    <div class="sup-slip-line"><b>Date</b> ${v.date}</div>
    <div class="sup-slip-label">Order Detail</div>
    <div class="sup-slip-item">
      <div class="sup-slip-thumb">${imgEl(v, 'img', '')}</div>
      <div class="sup-slip-item-text">
        ${v.product}<br>
        Style : ${v.style}<br>
        Size : ${v.size}
      </div>
      <div class="sup-slip-price">${fmt(price, c)}</div>
    </div>
    <div class="sup-slip-divider"></div>
    <div class="sup-slip-totals">
      <div>Subtotal: ${fmt(price, c)}</div>
      <div>Shipping: ${fmt(ship, c)}</div>
      <div>Tax: ${fmt(tax, c)}</div>
      <div><b>Total: ${fmt(total, c)}</b></div>
    </div>
    <div class="sup-slip-label" style="margin-top:14px">Ship To</div>
    <div class="sup-slip-addr">
      ${v.name}<br>
      ${nl2br(v.saddr)}<br>
      Phone: ${v.phone}<br>
      Email: ${v.email}
    </div>
    <div class="sup-slip-line" style="margin-top:14px"><b>Tracking Number:</b> ${v.tracking}</div>
    <div class="sup-slip-note">Your shipping information has been emailed to you. Shipping time depends on location.<br>For more information, please review our terms at: supremenewyork.com/shop/terms</div>
  </div>`;
}

// ───────────────────────── Louis Vuitton — Certificate of Authenticity ─────
// A passport for the object, not a proof of checkout. No price, no
// shipping — provenance and material instead.
function renderLV(v, total, c, logoUrl) {
  return `
  <div class="lv-cert">
    <div class="lv-cert-head">${brandLogo(logoUrl, '<span class="lv-logo">LOUIS VUITTON</span>', 14)}</div>
    <div class="lv-cert-title">Certificate of Authenticity</div>
    <div class="lv-cert-row"><span>Issued To</span><b>${v.name}</b></div>
    <div class="lv-cert-row"><span>Date</span><b>${v.date}</b></div>
    <div class="lv-cert-divider"></div>
    <div class="lv-cert-object">${v.product}</div>
    <div class="lv-cert-grid">
      <div><span>Reference</span><b>${v.ref}</b></div>
      <div><span>Material</span><b>${v.material}</b></div>
    </div>
    <div class="lv-cert-desc">${v.desc}</div>
    <div class="lv-cert-row"><span>Atelier</span><b>${v.atelier}</b></div>
    <div class="lv-cert-divider"></div>
    <div class="lv-cert-row"><span>Acquired At</span><b>${v.acquiredAt}</b></div>
    <div class="lv-cert-row"><span>Passport No.</span><b>${v.passportNo}</b></div>
  </div>`;
}

// ───────────────────────── Patagonia — Worn Wear Repair Ticket ─────────────
// Patagonia's real cultural artifact is the repair program, not a checkout
// email. No price ladder — repairs run on the Ironclad Guarantee.
function renderPatagonia(v, total, c, logoUrl) {
  return `
  <div class="pat-ticket">
    <div class="pat-ticket-head">${brandLogo(logoUrl, '<span class="pat-logo">PATAGONIA</span>', 16)}<div class="pat-worn-wear">WORN WEAR</div></div>
    <div class="pat-ticket-guarantee">IRONCLAD GUARANTEE</div>
    <div class="pat-ticket-no">Ticket No. ${v.ticketNo}</div>
    <div class="pat-ticket-divider"></div>
    <div class="pat-ticket-row"><span>Owner</span><b>${v.name}</b></div>
    <div class="pat-ticket-row"><span>Garment</span><b>${v.garment}</b></div>
    <div class="pat-ticket-grid">
      <div><span>Color</span><b>${v.color}</b></div>
      <div><span>Size</span><b>${v.size}</b></div>
    </div>
    <div class="pat-ticket-issue"><span>Reported Issue</span><p>${nl2br(v.issue)}</p></div>
    <div class="pat-ticket-divider"></div>
    <div class="pat-ticket-row"><span>Repair Type</span><b>${v.repairType}</b></div>
    <div class="pat-ticket-row"><span>Facility</span><b>${v.facility}</b></div>
    <div class="pat-ticket-row"><span>Estimated Completion</span><b>${v.estCompletion}</b></div>
    <div class="pat-ticket-foot">Built to last. If it breaks, we fix it — that's the guarantee.</div>
  </div>`;
}

// ───────────────────────── OVO — Order Confirmation ────────────────────────
// Typography-forward on purpose — no product photo. OVO's own photography
// is moody/dark and a thumbnail reads as clutter against this palette.
function renderOVO(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0, disc = parseFloat(v.disc) || 0;
  return `
  <div class="ovo-wrap">
    <div class="ovo-header">${brandLogo(logoUrl, '<span class="ovo-logo">OVO</span>', 18)}<span class="ovo-tag">OCTOBER'S VERY OWN</span></div>
    <div class="ovo-body">
      <div class="ovo-title">Order Confirmation</div>
      <div class="ovo-sub">${v.name}, thank you for your order ${v.order}.</div>
      <div class="ovo-product-row">
        <div>
          <div class="ovo-product-name">${v.product}</div>
          <div class="ovo-product-detail">Size: ${v.size} · ${v.color}</div>
          <div class="ovo-product-price">${fmt(price, c)}</div>
        </div>
      </div>
      <div class="ovo-lines">
        <div class="ovo-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
        <div class="ovo-line"><span>Shipping</span><span>${ship === 0 ? 'Free' : fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="ovo-line"><span>Discount</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="ovo-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>
        <div class="ovo-line total"><span>Total</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="ovo-addr-grid">
        <div class="ovo-addr-block"><strong>Ship To</strong>${v.saddr}</div>
        <div class="ovo-addr-block"><strong>Payment</strong>${v.paymethod}</div>
      </div>
    </div>
    <div class="ovo-footer">OVO Sound · octobersveryown.com</div>
  </div>`;
}

// ───────────────────────── Sickö — Recognition ──────────────────────────────
// Archive category. No commerce vocabulary. Handmade/zine register — loose,
// stamped, deliberately unpolished.
function renderSicko(v, total, c, logoUrl) {
  return `
  <div class="rec-card rec-sicko">
    <div class="rec-sicko-head">${brandLogo(logoUrl, '<span class="rec-sicko-logo">sickö</span>', 22)}<span class="rec-sicko-ring">✓</span></div>
    <div class="rec-sicko-object">${v.object}</div>
    <div class="rec-sicko-meta">No. ${v.catalogueNo} · Recognized ${v.dateRecognized}</div>
    <div class="rec-sicko-edition">${v.edition}</div>
    <div class="rec-sicko-note">${v.note}</div>
    <div class="rec-sicko-foot">ALL SALES FINAL — BORN FROM PAIN</div>
  </div>`;
}

// ───────────────────────── Vetements — Recognition ──────────────────────────
// Blunt, institutional, all-caps Helvetica. The woven label is the whole
// visual idea — bigger and plainer than any logo.
function renderVetements(v, total, c, logoUrl) {
  return `
  <div class="rec-card rec-vtm">
    <div class="rec-vtm-head">${brandLogo(logoUrl, '<span class="rec-vtm-logo">VETEMENTS</span>', 14)}</div>
    <div class="rec-vtm-object">${v.object}</div>
    <div class="rec-vtm-label">${v.label}</div>
    <div class="rec-vtm-meta">
      <div><span>CATALOGUE</span><b>${v.catalogueNo}</b></div>
      <div><span>RECOGNIZED</span><b>${v.dateRecognized}</b></div>
    </div>
    <div class="rec-vtm-note">${v.note}</div>
  </div>`;
}

// ───────────────────────── Yeezy — Recognition ──────────────────────────────
// Retrospective / museum-placard register. The brand is historical now —
// this reads like a dated wall label, not a drop announcement.
function renderYeezy(v, total, c, logoUrl) {
  return `
  <div class="rec-card rec-yzy">
    <div class="rec-yzy-head">${brandLogo(logoUrl, '<span class="rec-yzy-logo">YEEZY</span>', 13)}</div>
    <div class="rec-yzy-object">${v.object}</div>
    <div class="rec-yzy-era">${v.era}</div>
    <div class="rec-yzy-meta">
      <div><span>Catalogue No.</span><b>${v.catalogueNo}</b></div>
      <div><span>Recognized</span><b>${v.dateRecognized}</b></div>
    </div>
    <div class="rec-yzy-note">${v.note}</div>
  </div>`;
}

const RENDERERS = {
  end: renderEND,
  goat: renderGOAT,
  stockx: renderStockX,
  apple: renderApple,
  nike: renderNike,
  ebay: renderEbay,
  lv: renderLV,
  patagonia: renderPatagonia,
  amazon: renderAmazon,
  goyard: renderGoyard,
  supreme: renderSupreme,
  ovo: renderOVO,
  sicko: renderSicko,
  vetements: renderVetements,
  yeezy: renderYeezy,
};

export function renderReceipt(template, values, currency = '$', logoUrl = '') {
  const total = calcTotal(template, values);
  const fn = RENDERERS[template.id];
  return fn ? fn(values, total, currency, logoUrl) : `<div style="padding:24px;color:#666">Renderer for <b>${template.id}</b> not found.</div>`;
}
