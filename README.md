# The Meyers Thanksgiving

A warm, responsive Thanksgiving potluck and RSVP page that can be hosted for free with GitHub Pages.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your main branch and the `/ (root)` folder, then click **Save**.

GitHub will provide a public link you can share with your guests.

## Customize

- Update the event date and time in `index.html`.
- Update `HOST_PASSWORD` near the top of `app.js` (the starter password is `gather`).
- Update `defaultItems` in `app.js` to change the initial menu.

> **Important:** This zero-setup version stores sign-ups in each visitor's browser. That makes it ideal as a demo or for one shared tablet, but sign-ups do not synchronize between different devices. For a public multi-device event, connect the state functions in `app.js` to a hosted database such as Firebase or Supabase. Also note that a password in a static website is only a convenience—not secure authentication—because visitors can view the site's source code.
