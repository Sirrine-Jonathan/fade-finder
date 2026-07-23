Complete each of these changes, then prompt me for manual verification.

- on '/' and logged out, we shouldn't need any <nav> at all (unless maybe for just a log in button. Then the CTAs in the Hero can just be 'Get Started' and 'Become a Provider')
- on '/' and logged out, we don't need links in the footer to features that are auth protected.
  We don't need the 'Find barbers' link in the footer or the 'Bookings' header above it.
- The footer links for DOPL License Standard and Terms & Privacy need to go to public pages that have the expected content for each link.
- After successful sign up, user should be logged in automatically and redirected dynamically (to where the page where they were prompted to login or just to their profile as a fallback/default)
- on '/' logged in, the user should see nav options for 'Profile' and a button for logging out.
- on '/' logged in, the user should see dashboard featuring:
  - upcoming appointments
  - recent activity
    - prompts to rate barbers they've engaged with
    - prompts to write reviews for barbers they've engaged with
  - favorited barbers
  - links to search, manage bookings, etc
- on '/providers/register', the 'Help & FAQs' link incorrectly link to /provider/status. This doesn't make sense because the 'Help & FAQs' link is on the provider sign up form, so the user has not yet signed up to be a provider so there would be no status to check. /provider/status should be per provider and only accesible after logging in as a provider. This is the same for the 'Verification Requirements' link.

- Configure the admin login credentials to require what is set in .env as ADMIN_EMAIL and ADMIN_PASSWORD
- Use heroku cli to set env vars for ADMIN_EMAIL and ADMIN_PASSWORD as they are defined in the local .env
