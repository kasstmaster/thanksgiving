# The Meyers Family Events

A warm, responsive Thanksgiving and Christmas potluck and RSVP page that can be hosted for free with GitHub Pages.

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose your main branch and the `/ (root)` folder, then click **Save**.

GitHub will provide a public link you can share with your guests.

## Save everything permanently in GitHub

The app always loads `data/app-state.json` from this repository before opening
the sign-in dialog. That checked-in file is the canonical fallback on every
phone and computer, so accounts, RSVPs, claims, dates, and menu edits placed in
it do not depend on browser storage. Edit and commit that JSON file whenever you
want to manually replace the published state.

GitHub Pages cannot write to its own repository, and putting a GitHub token in
browser JavaScript would let every visitor steal it. This repository therefore
includes a small Cloudflare Worker in `github-state-worker/`. It keeps the token
secret and commits the complete account, event, menu, claim, and RSVP state to a
JSON file in GitHub after every change. Every device reads the newest committed
state when the page opens, regains focus, and every 30 seconds.

### One-time setup

1. Create a **private** GitHub repository for the data. A private repository is
   strongly recommended because the JSON contains guest names and RSVP details.
2. Create a fine-grained GitHub personal access token with access only to that
   repository and **Contents: Read and write** permission.
3. Edit `github-state-worker/wrangler.toml`: set `GITHUB_REPOSITORY` to
   `owner/repository`, set `ALLOWED_ORIGIN` to the exact GitHub Pages origin
   (include a repository path only in the Pages URL, not in the origin), and
   change the branch or state path if needed.
4. From the repository root, run:

   ```sh
   cd github-state-worker
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler deploy
   ```

5. Copy the deployed `workers.dev` URL into the `shared-state-url` meta tag in
   `index.html`, commit, and publish. Do **not** add the token to
   `wrangler.toml`, `app.js`, or any committed file.
6. On the device that currently has the desired data, reload the published site
   and make one change. The worker creates `data/app-state.json`; subsequent
   edits create normal Git commits, so state is shared across devices and can be
   recovered from Git history. If there is no browser data to preserve, the
   first change starts from the defaults in `app.js`.

The Worker is required for changes made *inside the website* to be committed
automatically. Without a Worker URL, visitors can still read the same committed
`data/app-state.json` on every device, while website edits remain local until
you copy them into the file and commit it.

If GitHub or the worker is temporarily unavailable, the change remains in that
browser and the site shows a sync warning. Make another change after service is
restored to commit the latest complete state. The repository remains the durable
shared copy; browser storage is only an offline fallback.

## Customize

- Select **Settings** and enter the host password, then use **Manage events** to make either Thanksgiving or Christmas visible to guests. The inactive event stays hidden. Each event keeps its own date, menu, claims, and RSVPs, while the family account list is shared. You can also edit the active event menu, clear a selected quantity of a family's dish claim, manage accounts, RSVP, and claim dishes as **The Host**. After the host signs in, the button is labeled **Host tools**.
- Update `HOST_PASSWORD` near the top of `app.js` (the current password is `0810`). Host password matching is case-insensitive.
- Guest names and RSVP details are private in the interface: only a signed-in host can open the guest list or see who claimed a food item. Guests can still see the aggregate attendance and dish counts.
- `GUEST_ACCOUNTS` in `app.js` supplies the initial invited households. You can then manage accounts from **Host tools** without editing code. Write shared first names with commas and separate households with a slash. For example, `Damon,Presley Patterson/Presley,Damon Hall` lets Damon Patterson, Presley Patterson, Presley Hall, and Damon Hall sign in with their own first and last names. RSVP and food entries use the first household's last name, so this example appears as **The Pattersons**. A last name ending in `s`, such as `Stevens`, appears as **The Stevens'**. Matching is case-insensitive.
- Update `defaultItems` in `app.js` to change the initial menu.
- In **Host tools → Edit menu**, add, rename, or remove quantity types such as **Dozen**, **Package**, **Tray**, or **Case**, then choose a type for each requested quantity. Guests will see and claim the quantity in the selected unit.

> **Important:** When `shared-state-url` is blank, sign-ups are stored only in
> each visitor's browser and are not shared or committed to GitHub. The app
> retains a local backup and will recover the browser copy containing the most
> accounts, RSVPs, and claims if an empty state was previously loaded. Older
> saved copies are upgraded without deleting their guest data. Also note
> that last-name sign-in on a
> static website is only a convenience—not secure authentication—because
> visitors can view the site's source code. Protect the shared endpoint with
> appropriate access controls if RSVP names must remain private.

