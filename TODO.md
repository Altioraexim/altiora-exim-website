# TODO - localhost:3000 asset parity fix

- [ ] Update server.js static serving to explicitly mount `/assets` correctly
- [ ] Add explicit routes for `/`, `/index.html`, `/gallery.html`, `/certificate.html`
- [ ] Ensure fallback `*` route does not interfere with asset requests
- [ ] Run `npm start` and verify:
  - [ ] Logo loads on `/`
  - [ ] Products images load on `/`
  - [ ] Gallery images load on `/gallery.html`
  - [ ] Certificates images load on `/certificate.html`

