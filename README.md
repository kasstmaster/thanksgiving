# The Meyers Family Events

A warm, responsive Thanksgiving and Christmas potluck and RSVP page that can be hosted for free with GitHub Pages.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your main branch and the `/ (root)` folder, then click **Save**.

GitHub will provide a public link you can share with your guests.

## Share sign-ups between phones and computers

Browser storage belongs to one device, so it cannot by itself share claims and
RSVPs with another phone or computer. The app now supports a shared JSON state
endpoint:

1. Deploy an HTTPS endpoint that accepts `GET` and `PUT` at the same URL. `GET`
   should return the saved JSON document (or `404`/`204` before the first save),
   and `PUT` should persist the JSON request body. Allow CORS requests from the
   GitHub Pages site.
2. In `index.html`, set the `shared-state-url` meta tag's `content` to that URL.
3. Reload the site once on the device containing the current sign-ups and make
   any change. That uploads its state. Other devices load the shared state when
   the page opens. An open page also refreshes when it regains focus and every
   30 seconds while it remains open.

If the endpoint is temporarily unavailable, changes remain saved in the local
browser and the page displays a sync warning instead of losing the update.

## Customize

- Select **Settings** and enter the host password, then use **Manage events** to make either Thanksgiving or Christmas visible to guests. The inactive event stays hidden. Each event keeps its own date, menu, claims, and RSVPs, while the family account list is shared. You can also edit the active event menu, clear a selected quantity of a family's dish claim, manage accounts, RSVP, and claim dishes as **The Host**. After the host signs in, the button is labeled **Host tools**.
- Update `HOST_PASSWORD` near the top of `app.js` (the current password is `0810`). Host password matching is case-insensitive.
- Guest names and RSVP details are private in the interface: only a signed-in host can open the guest list or see who claimed a food item. Guests can still see the aggregate attendance and dish counts.
- `GUEST_ACCOUNTS` in `app.js` supplies the initial invited households. You can then manage accounts from **Host tools** without editing code. Write shared first names with commas and separate households with a slash. For example, `Damon,Presley Patterson/Presley,Damon Hall` lets Damon Patterson, Presley Patterson, Presley Hall, and Damon Hall sign in with their own first and last names. RSVP and food entries use the first household's last name, so this example appears as **The Pattersons**. A last name ending in `s`, such as `Stevens`, appears as **The Stevens'**. Matching is case-insensitive.
- Update `defaultItems` in `app.js` to change the initial menu.
- In **Host tools → Edit menu**, add, rename, or remove quantity types such as **Dozen**, **Package**, **Tray**, or **Case**, then choose a type for each requested quantity. Guests will see and claim the quantity in the selected unit.

> **Important:** When `shared-state-url` is blank, the zero-setup fallback stores
> sign-ups only in each visitor's browser. Also note that last-name sign-in on a
> static website is only a convenience—not secure authentication—because
> visitors can view the site's source code. Protect the shared endpoint with
> appropriate access controls if RSVP names must remain private.

