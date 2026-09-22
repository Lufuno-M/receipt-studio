// Ported from the original renderer.js. Same markup, same CSS classes —
// but pure functions now: (values, currency) in, HTML string out.
// No document.getElementById anywhere, so this works identically in
// React (dangerouslySetInnerHTML), tests, or a future PDF export step.

function fmt(n, currency = '$') {
  return currency + parseFloat(n || 0).toFixed(2);
}

function imgEl(values, fieldId, fallback) {
  const url = values[fieldId];
  if (url) return `<img src="${url}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  return fallback;
}

// Swaps a brand's hardcoded text wordmark for the user-uploaded logo image,
// when one exists. Falls back to the original text markup otherwise.
function brandLogo(logoUrl, fallbackHtml, maxHeight = 26) {
  if (!logoUrl) return fallbackHtml;
  return `<img src="${logoUrl}" alt="logo" style="max-height:${maxHeight}px;max-width:160px;object-fit:contain;display:block">`;
}

export function calcTotal(template, values) {
  const price = parseFloat(values.price) || 0;
  const disc = parseFloat(values.disc) || 0;
  const ship = parseFloat(values.ship) || 0;
  const tax = parseFloat(values.tax) || 0;
  const hasDisc = template.fields.some(f => f.id === 'disc');
  return hasDisc ? price - disc + ship + tax : price + ship + tax;
}

function renderEND(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="end-top">${brandLogo(logoUrl, '<span class="end-logo">END.</span>', 18)}</div>
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
        <div class="end-pcolor">${v.color}</div>
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

function renderGOAT(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0;
  return `
  <div class="goat-wrap">
    <div class="goat-top">${brandLogo(logoUrl, '<span class="goat-logo">GOAT</span><span class="goat-shop">SHOP</span>', 28)}</div>
    <div class="goat-hero">
      <div class="goat-title">Thank you for your order</div>
      <div class="goat-sub">Your order is being sent to GOAT for authentication by our specialists. Once authenticated, we'll send you a confirmation email with tracking details.</div>
    </div>
    <div class="goat-order-box">
      <div class="goat-order-num">Order #${v.order}</div>
      <div class="goat-product-img"><div class="goat-product-img-inner">${imgEl(v, 'img', '👟')}</div></div>
      <div class="goat-product-name">${v.product}</div>
      <ul class="goat-attrs">
        <li>Style ID: ${v.style}</li>
        <li>U.S. Men's Size: ${v.size}</li>
        <li>Condition: ${v.cond}</li>
        <li>Order number: ${v.order}</li>
      </ul>
      <div class="goat-line-row"><span>Purchase Price:</span><span>${fmt(price, c)}</span></div>
      <div class="goat-line-row"><span>Shipping:</span><span>${fmt(ship, c)}</span></div>
      <div class="goat-line-row"><span>Authentication Fee:</span><span>FREE</span></div>
      <div class="goat-line-row total"><span>TOTAL PAYMENT</span><span>${fmt(total, c)}</span></div>
    </div>
    <div class="goat-footer">GOAT — Assurance of Authenticity</div>
  </div>`;
}

function renderStockX(v, total, c, logoUrl) {
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
}

function renderApple(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="apple-wrap">
    <div class="apple-header">${brandLogo(logoUrl, '<span class="apple-logo">🍎</span>', 24)}<span class="apple-receipt-label">Receipt</span></div>
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
        <div class="apple-product-dev">${v.dev}</div>
        <div class="apple-product-type">${v.type}</div>
      </div>
      <div class="apple-product-price">${fmt(price, c)}</div>
    </div>
    <div class="apple-divider"></div>
    <div class="apple-total-row"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
    <div class="apple-total-row"><span>Tax</span><span>${fmt(tax, c)}</span></div>
    <div class="apple-total-row grand"><span>Total</span><span>${fmt(total, c)}</span></div>
    <div class="apple-footer">You can manage your subscriptions in your account settings. Questions? Visit Apple Support.</div>
  </div>`;
}

function renderNike(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="nike-wrap">
    <div class="nike-header"><div class="nike-logo">${brandLogo(logoUrl, 'NIKE', 30)}</div></div>
    <div class="nike-nav"><span>MEN</span><span>WOMEN</span><span>KIDS</span><span>CUSTOMIZE</span></div>
    <div class="nike-greeting">Hi ${v.name},<br><br>Thank you for shopping with us, your payment overview is below.<br><br>Nike.com</div>
    <div class="nike-ship-pay">
      <div class="nike-box"><div class="nike-box-title">Ship To</div>${v.sname}<br>${v.saddr}<br><br>Method: ${v.shipmethod}</div>
      <div class="nike-box"><div class="nike-box-title">Order Info</div>Order #${v.order}<br>Size: ${v.size}<br>Color: ${v.color}</div>
    </div>
    <div class="nike-product-row">
      <div class="nike-product-img">${imgEl(v, 'img', '✔')}</div>
      <div style="flex:1">
        <div class="nike-product-name">${v.product}</div>
        <div class="nike-product-detail">Size: ${v.size}<br>Color: ${v.color}</div>
      </div>
      <div class="nike-product-price">${fmt(price, c)}</div>
    </div>
    <div class="nike-lines">
      <div class="nike-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
      <div class="nike-line"><span>Shipping</span><span>${ship === 0 ? 'Free' : fmt(ship, c)}</span></div>
      ${disc > 0 ? `<div class="nike-line"><span>Discount</span><span>-${fmt(disc, c)}</span></div>` : ''}
      <div class="nike-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>
      <div class="nike-line total"><span>Total</span><span>${fmt(total, c)}</span></div>
    </div>
    <div class="nike-footer"><p>© 2024 Nike, Inc. All Rights Reserved.</p></div>
  </div>`;
}

function renderEbay(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="ebay-wrap">
    <div class="ebay-header"><div class="ebay-logo">${brandLogo(logoUrl, '<span class="ebay-e">e</span><span class="ebay-b">b</span><span class="ebay-a">a</span><span class="ebay-y">y</span>', 22)}</div></div>
    <div class="ebay-body">
      <div class="ebay-title">Order Confirmed</div>
      <div class="ebay-subtitle">Order #${v.order} confirmed — ${v.date}</div>
      <div class="ebay-product-row">
        <div class="ebay-product-img">${imgEl(v, 'img', '🛒')}</div>
        <div style="flex:1">
          <div class="ebay-product-name">${v.product}</div>
          <div class="ebay-product-detail">Condition: ${v.cond}<br>Size: ${v.size}<br>Seller: ${v.seller}</div>
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
    <div class="ebay-footer">© 2024 eBay Inc. | Help & Contact | Privacy</div>
  </div>`;
}

function renderLV(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="lv-wrap">
    <div class="lv-header"><div class="lv-logo">${brandLogo(logoUrl, 'LOUIS VUITTON', 20)}</div></div>
    <div class="lv-body">
      <div class="lv-greeting">Dear ${v.name},<br><br>Thank you for your order. We are pleased to confirm the receipt of your purchase. Your order ${v.order} placed on ${v.date} is being prepared with care.</div>
      <div class="lv-product-row">
        <div class="lv-product-img">${imgEl(v, 'img', '🟤')}</div>
        <div>
          <div class="lv-product-name">${v.product}</div>
          <div class="lv-product-ref">Ref: ${v.ref}</div>
          <div class="lv-product-ref">${v.desc}</div>
          <div class="lv-product-price">${fmt(price, c)}</div>
        </div>
      </div>
      <div class="lv-divider"></div>
      <div class="lv-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
      <div class="lv-line"><span>Shipping</span><span>Complimentary</span></div>
      ${tax > 0 ? `<div class="lv-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>` : ''}
      <div class="lv-line total"><span>Order Total</span><span>${fmt(total, c)}</span></div>
      <div class="lv-addr-grid">
        <div class="lv-addr-block"><strong>Delivery Address</strong>${v.saddr}</div>
        <div class="lv-addr-block"><strong>Payment</strong>${v.paymethod}</div>
      </div>
    </div>
    <div class="lv-footer"><p>LOUIS VUITTON — us.louisvuitton.com</p></div>
  </div>`;
}

function renderPatagonia(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="pat-wrap">
    <div class="pat-header">${brandLogo(logoUrl, '<div class="pat-logo-icon">🏔</div><div class="pat-logo">PATAGONIA</div>', 26)}</div>
    <div class="pat-body">
      <div class="pat-title">Order Confirmed, ${v.name}!</div>
      <div class="pat-sub">Thank you for your order ${v.order}. We'll send you shipping confirmation with tracking info when your order ships.</div>
      <div class="pat-product-row">
        <div class="pat-product-img">${imgEl(v, 'img', '🏔')}</div>
        <div>
          <div class="pat-product-name">${v.product}</div>
          <div class="pat-product-color">${v.color} · Size ${v.size}</div>
          <div class="pat-product-price">${fmt(price, c)}</div>
        </div>
      </div>
      <div class="pat-lines">
        <div class="pat-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
        <div class="pat-line"><span>Shipping</span><span>${ship === 0 ? 'Free' : fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="pat-line"><span>Discount</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="pat-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>
        <div class="pat-line total"><span>Order Total</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="pat-addr-grid">
        <div class="pat-addr-block"><strong>Ship To</strong>${v.saddr}</div>
        <div class="pat-addr-block"><strong>Payment</strong>${v.paymethod}<br><br><strong>Estimated Arrival</strong>${v.arr1} – ${v.arr2}</div>
      </div>
    </div>
    <div class="pat-footer"><p>© 2024 Patagonia, Inc. | 259 W. Santa Clara St., Ventura, CA 93001</p></div>
  </div>`;
}

function renderAmazon(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, disc = parseFloat(v.disc) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="amz-wrap">
    <div class="amz-header">
      <div class="amz-logo">${brandLogo(logoUrl, 'amazon', 24)}</div>
      <div class="amz-order-info">
        <div class="amz-order-label">Order Confirmation</div>
        <div class="amz-order-num">#${v.order}</div>
      </div>
    </div>
    <div class="amz-body">
      <div class="amz-greeting">Hello ${v.name},</div>
      <div class="amz-thanks">Thank you for your order. We'll send a confirmation when your item ships.</div>
      <div class="amz-arrival-box">
        <div class="amz-arrival-label">Estimated Delivery</div>
        <div class="amz-arrival-date">${v.arr1} – ${v.arr2}</div>
      </div>
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
        <div class="amz-line"><span>Shipping & Handling:</span><span>${ship === 0 ? 'FREE' : fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="amz-line discount"><span>Discount:</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="amz-line"><span>Tax:</span><span>${fmt(tax, c)}</span></div>
        <div class="amz-divider"></div>
        <div class="amz-line total"><span>Order Total:</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="amz-info-grid">
        <div class="amz-info-block">
          <div class="amz-info-label">Ship To</div>
          <div class="amz-info-val">${v.saddr}</div>
        </div>
        <div class="amz-info-block">
          <div class="amz-info-label">Payment</div>
          <div class="amz-info-val">${v.paymethod}</div>
        </div>
      </div>
    </div>
    <div class="amz-footer">
      <p>© 2024 Amazon.com, Inc. or its affiliates. All rights reserved.</p>
      <p>Amazon.com | Help | Your Account | Your Orders</p>
    </div>
  </div>`;
}

// ─── GOYARD ───
// Recreates the maison's visual language: the Goyardine chevron canvas
// pattern (top/bottom bands), the tri-colour personalization stripe that
// appears on the trunks/totes, a wax-seal "Est. 1853" mark, and italic
// correspondence-style copy in place of generic e-commerce phrasing.
function renderGoyard(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, tax = parseFloat(v.tax) || 0;
  return `
  <div class="goy-wrap">
    <div class="goy-chevron-band"></div>
    <div class="goy-header">
      <div class="goy-seal">EST.<br>1853</div>
      ${brandLogo(logoUrl, '<span class="goy-logo">Goyard</span>', 20)}
      <div class="goy-sub-header">Maison Fondée à Paris</div>
    </div>
    <div class="goy-stripe-row">
      <div class="goy-stripe" style="background:#1a1a1a"></div>
      <div class="goy-stripe" style="background:#e2d5ab"></div>
      <div class="goy-stripe" style="background:#a08a4f"></div>
      <div class="goy-stripe" style="background:#1a1a1a"></div>
    </div>
    <div class="goy-body">
      <div class="goy-greeting">Dear ${v.name},<br><br>Thank you for your order. Your purchase ${v.order}, placed on ${v.date}, is being prepared by our ateliers with the utmost care.</div>
      <div class="goy-product-row">
        <div class="goy-product-img">${imgEl(v, 'img', '🧳')}</div>
        <div>
          <div class="goy-product-name">${v.product}</div>
          <div class="goy-product-ref">Ref. ${v.ref} — ${v.color}</div>
          <div class="goy-product-desc">${v.desc}</div>
          <div class="goy-product-price">${fmt(price, c)}</div>
        </div>
      </div>
      <div class="goy-divider"></div>
      <div class="goy-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
      <div class="goy-line"><span>Shipping</span><span>Complimentary</span></div>
      ${tax > 0 ? `<div class="goy-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>` : ''}
      <div class="goy-line total"><span>Total</span><span>${fmt(total, c)}</span></div>
      <div class="goy-addr-grid">
        <div class="goy-addr-block"><strong>Delivery Address</strong>${v.saddr}</div>
        <div class="goy-addr-block"><strong>Payment</strong>${v.paymethod}</div>
      </div>
      <div class="goy-craft-note">Each Goyard piece is hand-finished in our ateliers and bears the personal mark of the craftsman who made it.</div>
    </div>
    <div class="goy-footer-chevron"></div>
    <div class="goy-footer"><p>MAISON GOYARD · GOYARD.COM</p></div>
  </div>`;
}

// ─── SUPREME ───
// The skewed "box logo" treatment, a drop-tag bar, a hangtag-style corner
// flag on the product block, an authentication stamp, and a perforated
// tear-line before the footer — reads like a hype-drop confirmation
// instead of a generic order email with red paint.
function renderSupreme(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0, disc = parseFloat(v.disc) || 0;
  return `
  <div class="sup-wrap">
    <div class="sup-header">${brandLogo(logoUrl, '<span class="sup-boxlogo">Supreme</span>', 22)}</div>
    <div class="sup-drop-tag">Limited Drop · Order Confirmed</div>
    <div class="sup-body">
      <div class="sup-title">You Copped It</div>
      <div class="sup-sub">Hey ${v.name}, your order ${v.order} is confirmed. Thanks for shopping Supreme — no reselling, no exceptions.</div>
      <div class="sup-product-row">
        <div class="sup-tag-corner">New</div>
        <div class="sup-product-img">${imgEl(v, 'img', '📦')}</div>
        <div>
          <div class="sup-product-name">${v.product}</div>
          <div class="sup-product-detail">Size: ${v.size} · ${v.color}</div>
          <div class="sup-product-price">${fmt(price, c)}</div>
        </div>
      </div>
      <div class="sup-lines">
        <div class="sup-line"><span>Subtotal</span><span>${fmt(price, c)}</span></div>
        <div class="sup-line"><span>Shipping</span><span>${ship === 0 ? 'FREE' : fmt(ship, c)}</span></div>
        ${disc > 0 ? `<div class="sup-line"><span>Discount</span><span>-${fmt(disc, c)}</span></div>` : ''}
        <div class="sup-line"><span>Tax</span><span>${fmt(tax, c)}</span></div>
        <div class="sup-line total"><span>Total</span><span>${fmt(total, c)}</span></div>
      </div>
      <div class="sup-addr"><strong>Ship To</strong>${v.saddr}</div>
      <div class="sup-stamp">Authenticated · One Per Customer</div>
    </div>
    <div class="sup-perf"></div>
    <div class="sup-footer">© Supreme — No Reselling. No Exceptions.</div>
  </div>`;
}

// ─── OVO ───
// An abstract owl mark (deliberately generic — not a trademark
// reproduction) in the header and as a faint footer watermark, a gold
// accent bar on the product row, and a hairline gold rule under the
// header for the late-night luxury-streetwear feel the brand trades on.
function renderOVO(v, total, c, logoUrl) {
  const price = parseFloat(v.price) || 0, ship = parseFloat(v.ship) || 0, tax = parseFloat(v.tax) || 0, disc = parseFloat(v.disc) || 0;
  const owl = `<svg class="ovo-owl" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.3"><path d="M12 2c-4 0-6 3-6 7 0 5 2 9 6 12 4-3 6-7 6-12 0-4-2-7-6-7z"/><circle cx="9" cy="10" r="1.6" fill="#d4af37" stroke="none"/><circle cx="15" cy="10" r="1.6" fill="#d4af37" stroke="none"/><path d="M12 13l-1.4 2h2.8z" fill="#d4af37" stroke="none"/></svg>`;
  return `
  <div class="ovo-wrap">
    <div class="ovo-header">
      <div class="ovo-logo-row">${owl}${brandLogo(logoUrl, '<span class="ovo-logo">OVO</span>', 18)}</div>
      <span class="ovo-tag">October's Very Own</span>
    </div>
    <div class="ovo-gold-rule"></div>
    <div class="ovo-body">
      <div class="ovo-title">Order Confirmation</div>
      <div class="ovo-sub">${v.name}, thank you for your order ${v.order}.</div>
      <div class="ovo-product-row">
        <div class="ovo-product-img">${imgEl(v, 'img', '🦉')}</div>
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
      <div class="ovo-owl-watermark">${owl}</div>
    </div>
    <div class="ovo-footer">OVO Sound · octobersveryown.com</div>
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
};

export function renderReceipt(template, values, currency = '$', logoUrl = '') {
  const total = calcTotal(template, values);
  const fn = RENDERERS[template.id];
  return fn ? fn(values, total, currency, logoUrl) : `<div style="padding:24px;color:#666">Renderer for <b>${template.id}</b> not found.</div>`;
}
