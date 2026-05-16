# Instruction and Changes

## 1. SEO - Change the content and image as below

- Line 6 - Change title (shown on browser tabs)
- Line 7 - Description
- Line 8 - Keywords
- Line 9 - Author
- Line 14, 15 - Replace `favicon.ico` file at root level (same name)
- Line 17 - Add Domain URL
- Line 21 - Add site name (same as title is fine)
- Line 22 - Title (same as Line 6)
- Line 23 - Description (same as Line 7)
- Line 24 - URL (Domain URL)
- Line 25 - Replace banner image (standard size: 1200x630)
- Line 28, 29, 30 - Same as title, description, image
- Line 39 - Title should be fine
- Line 40 - Add Domain URL
- Line 42 - Add Instagram URL
- Line 47 - Title should be fine
- Line 48 - Domain URL
- Line 49 - Description (same as Line 7)
- Line 53 - Name (service you are providing)
- Line 56 - Add person name
- Line 58 - Use ISO country codes:
  - Example: `"areaServed": ["CA", "IN"]`
- Line 59 - Add service type

### File Updates

- sitemap.xml
  - Line 4 - Update domain

- robots.txt
  - Line 4 - Update domain with `/sitemap.xml`

---

## 2. Hero Section Subscribe

- Add submit logic  
  - Search: `TODO: HERO SECTION SUBSCRIBE`

---

## 3. Plan Payment Button

- Add submit logic  
  - Search: `TODO: PAYMENT SUBMIT`

---

## 4. Floating Button

- Add submit logic  
  - Search: `TODO: FLOATING QUERY SUBMIT`

---

## 5. Questions Section

- Update email
- Add Instagram link

---

## 6. Footer

- Update footer content

---

## 7. Redirection from Payment Gateway to Website 

- Show Success Popup Add query Parameters
https://example.com/?payment=true&status=success&order_id=ORD12345&txn_id=TXN778899&amount=299&plan=monthly_coaching&test=data

If you add more query paramters then it will add to the details automatically

- Show Failed Payment Popup
https://example.com/?payment=true&status=fail&order_id=ORD12345&txn_id=TXN778899&reason=signature_mismatch&amount=299

If you add more query paramters then it will add to the details automatically

---

## 8. Tokens and Other config for calendy in index.html

window.CALENDLY_CONFIG = {
        token: "",
        apiBaseUrl: "https://api.calendly.com",
        availabilityWindowDays: 7,
        eventTypeUri: "https://api.calendly.com/event_types/37a52748-3b49-491f-8fda-127d06209c77"
};