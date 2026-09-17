# The Meyers Family Events

A warm, responsive Thanksgiving and Christmas potluck and RSVP page that can be hosted for free with GitHub Pages.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your main branch and the `/ (root)` folder, then click **Save**.

GitHub will provide a public link you can share with your guests.

## Customize

- Select **Settings** and enter the host password, then use **Manage events** to make either Thanksgiving or Christmas visible to guests. The inactive event stays hidden. Each event keeps its own date, menu, claims, and RSVPs, while the family account list is shared. You can also edit the active event menu, manage accounts, RSVP, and claim dishes as **The Meyers**. After the host signs in, the button is labeled **Host tools**.
- Update `HOST_PASSWORD` near the top of `app.js` (the current password is `0810`). Host password matching is case-insensitive.
- Guest names and RSVP details are private in the interface: only a signed-in host can open the guest list or see who claimed a food item. Guests can still see the aggregate attendance and dish counts.
- `GUEST_ACCOUNTS` in `app.js` supplies the initial invited households. You can then manage accounts from **Host tools** without editing code. Write shared first names with commas and separate households with a slash. For example, `Damon,Presley Patterson/Presley,Damon Hall` lets Damon Patterson, Presley Patterson, Presley Hall, and Damon Hall sign in with their own first and last names. RSVP and food entries use the first household's last name, so this example appears as **The Pattersons**. A last name ending in `s`, such as `Stevens`, appears as **The Stevens'**. Matching is case-insensitive.
- Update `defaultItems` in `app.js` to change the initial menu.

> **Important:** This zero-setup version stores sign-ups in each visitor's browser. That makes it ideal as a demo or for one shared tablet, but sign-ups do not synchronize between different devices. For a public multi-device event, connect the state functions in `app.js` to a hosted database such as Firebase or Supabase. Also note that last-name sign-in on a static website is only a convenience—not secure authentication—because visitors can view the site's source code.

