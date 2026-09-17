# The Meyers Thanksgiving

A warm, responsive Thanksgiving potluck and RSVP page that can be hosted for free with GitHub Pages.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your main branch and the `/ (root)` folder, then click **Save**.

GitHub will provide a public link you can share with your guests.

## Customize

- Enter the host password on the welcome prompt to open the host dashboard and update the event date or menu.
- Update `HOST_PASSWORD` near the top of `app.js` (the starter password is `gather`).
- Add each invited household's last name to `GUEST_ACCOUNTS` in `app.js`. That name is also their sign-in name; capitalization and spaces are ignored, so `Raudman`, `raudman`, and `Raud man` all match the included **Raudman** account.
- Update `defaultItems` in `app.js` to change the initial menu.

> **Important:** This zero-setup version stores sign-ups in each visitor's browser. That makes it ideal as a demo or for one shared tablet, but sign-ups do not synchronize between different devices. For a public multi-device event, connect the state functions in `app.js` to a hosted database such as Firebase or Supabase. Also note that last-name sign-in on a static website is only a convenience—not secure authentication—because visitors can view the site's source code.
 
