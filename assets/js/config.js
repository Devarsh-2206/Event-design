/* ==========================================================================
   EDIT THIS FILE — nothing else needs changing for launch.
   --------------------------------------------------------------------------
   Every value below appears on the site. Fill one in and it replaces the
   placeholder text automatically. Leave a value as "" and the page keeps the
   safe placeholder already written into index.html.
   ========================================================================== */

window.EVENT_CONFIG = {

  /* ---- 1. EVENT DETAILS ------------------------------------------------ */

  // Shown in the hero vitals, the details card and the footer.
  eventDate:   "31 October",          // e.g. "Saturday, 31 October 2026"
  eventDay:    "",          // sub-line under the date on the details card

  // Short name used in the hero fact strip (keep it to a few words).
  venueShort:  "",          // e.g. "Gachibowli Stadium"
  venueCity:   " Hyderabad",

  // Full address, shown in the footer.
  venueFull:   "",          // e.g. "GMC Balayogi Athletic Stadium, Gachibowli, Hyderabad"


  /* ---- 2. CONTACT ------------------------------------------------------ */

  // Coordinator's number in international format, digits only, no "+".
  // 91 is India. This powers the WhatsApp button on the enquiry form.
  whatsapp:    "",          // e.g. "919876543210"

  phone:       "",          // e.g. "+91 98765 43210"  (shown in the footer)
  email:       "",          // e.g. "events@snkdance.in"


  /* ---- 3. PAYMENT ------------------------------------------------------ */

  // Paste the payment page link from whichever provider you use —
  // Razorpay Payment Page, PhonePe, Cashfree, Instamojo, a bank link, anything.
  // The "Pay participation fee" button opens this in a new tab.
  // Leave it "" and the button quietly points at the contact section instead,
  // so the site never shows a dead payment button.
  paymentLink: "",          // e.g. "https://rzp.io/l/your-page"

  // UPI ID for the secondary "Pay by UPI" button. Leave "" to hide the button.
  upiId:       "",          // e.g. "snkdance@okhdfcbank"
  upiName:     "SNK Dance Company",

  // Fee shown on the participation card. Keep the currency symbol.
  price:       "",          // e.g. "₹350"
  priceNote:   "",          // e.g. "Per student. Includes T-shirt, snacks and training."

  // Small print under the payment buttons.
  payNote:     "",


  /* ---- 4. GUESTS -------------------------------------------------------- */

  // IMPORTANT: leave the "Invited · to be confirmed" tags in index.html in
  // place until an appearance is confirmed in writing. Only remove a tag once
  // you have that confirmation.
  guest1Name:  "",          // celebrity choreographer
  guest2Name:  "",          // chief guest

  // Guest photographs.
  //
  // These are real, identifiable people. Before putting a photograph here you
  // need TWO things, and neither is optional:
  //   1. A licence for the image. Press and agency photos are copyrighted;
  //      pulling one off a search result is an infringement.
  //   2. Written permission from the person (or their office/manager) to use
  //      their likeness to promote this event.
  // Until an appearance is confirmed in writing, leave the "Invited · to be
  // confirmed" tag in index.html in place. A photo of a public figure on a
  // page that asks schools for money reads as a confirmed endorsement.
  //
  // Drop the files into assets/images/ and reference them here.
  photos: {
    guest1: "",            // e.g. "assets/images/shekar-master.jpg"
    guest2: ""             // e.g. "assets/images/malla-reddy.jpg"
  }
};
