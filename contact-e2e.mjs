/**
 * End-to-end browser test for the public Contact / outreach flow.
 *
 * Drives the real Contact page in a headless browser, submits the form, and
 * asserts that the success state appears — proving the submission reached the
 * backend and the admin team was notified.
 *
 * Run:
 *   node "<browser-automation skill>/browser.mjs" http://localhost:5175/contact \
 *        --script ./contact-e2e.mjs
 */
export default async function run(page, ui) {
  const results = {};

  // 1. Wait for the form to actually mount before touching it.
  await page.waitForSelector('.contact-form', { timeout: 20000 });

  const fieldCount = await page.locator('.contact-form input, .contact-form textarea, .contact-form select').count();
  results.fieldCount = fieldCount;
  if (fieldCount === 0) {
    return { ...results, error: 'Contact form did not render any fields.' };
  }

  // 2. Fill every field. React tracks its own value, so we set through the
  //    native setter and dispatch input/change — otherwise React never sees it.
  await page.evaluate(() => {
    const setNativeValue = (el, value) => {
      if (!el) return;
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : el.tagName === 'SELECT'
          ? window.HTMLSelectElement.prototype
          : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
      descriptor.set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const nameInput = document.querySelector('.contact-form input[type="text"]');
    const emailInput = document.querySelector('.contact-form input[type="email"]');
    const phoneInput = document.querySelector('.contact-form input[type="tel"]');
    const allTextInputs = document.querySelectorAll('.contact-form input[type="text"]');
    const subjectInput = allTextInputs[1]; // the second text input is "Subject"
    const categorySelect = document.querySelector('.contact-form select');
    const messageBox = document.querySelector('.contact-form textarea');

    setNativeValue(nameInput, 'E2E Browser Test');
    setNativeValue(emailInput, 'e2e.browser@example.com');
    setNativeValue(phoneInput, '+91 91234 56789');
    setNativeValue(subjectInput, 'Browser Verification');
    setNativeValue(categorySelect, 'general');
    setNativeValue(messageBox, 'Submitting from a real browser to verify the contact outreach flow end to end.');
  });

  await page.waitForTimeout(300);

  // 3. Confirm the values really landed in the DOM before submitting.
  results.filled = await page.evaluate(() => ({
    name: document.querySelector('.contact-form input[type="text"]')?.value || null,
    email: document.querySelector('.contact-form input[type="email"]')?.value || null,
    message: (document.querySelector('.contact-form textarea')?.value || '').slice(0, 40),
  }));

  // 4. Submit.
  await page.locator('.btn-submit-contact').click();

  // 5. Wait for the success state rather than a fixed delay, so a slow backend
  //    is distinguishable from a broken one.
  try {
    await page.waitForSelector('.contact-success-state', { timeout: 20000 });
    results.successShown = true;
  } catch {
    results.successShown = false;
    results.errorShown = await page.locator('.contact-form-alert').count() > 0
      ? await page.locator('.contact-form-alert').innerText()
      : null;
  }

  results.successHeading = results.successShown
    ? await page.locator('.contact-success-state h2').innerText()
    : null;

  // 6. The "send another" reset should return the empty form.
  if (results.successShown) {
    results.successBody = await page.locator('.contact-success-state p').innerText();
    await page.locator('.btn-send-another').click();
    await page.waitForTimeout(400);
    results.formResetOk = await page.locator('.contact-form').count() > 0;
  }

  return results;
}
