# Next batch of work

### Overall page design changes

There is a misconception about how this app should work.
the app at '/' should be for the consumer users (clients looking for barbers) and that is currently the case, but we also need a path for the app directed at another user, the providers or barbers. There should also be a third section specifically for the app owner or admin, so that they can see overall stats, manage users, get information on site reliability and metrics, manage providers, vet and approve providers, and manage content.

#### Consumer users (clients)

'/login' - redirected here if trying to go to a base user authenticated route like '/profile'. Needs forgot password path and link to '/register'.
'/register' - register as a user (person looking for barber), include small pitch here on why they should sign up (Free to sign up).
'/' - Unauthenticated users will see a landing page with a pitch on why they should use the app. Pitch to base users first, then pitch to providers (maybe just have a link like 'For barbers' that takes them to '/providers' which is a landing page for them when not authenticated as a provider. When authenticated, '/' will be a dashboard with information on upcoming appointments with CTAs to cancel, reschedule. It should have links to finding an appointment (/search (user auth route))
'/search' - Here users can search for barbers in their area with filters and sorting controls:
filters:
go to barber vs barber comes to user (in shop, in home)
min rating
max distance
favorites/all
sorting:
low to high price
low to high rating
low to high distance
They should see a map displaying map pins where each barber is located (should they choose to go to the barber rather than the barber come to them)
They should be able to configure their center location (GPS current location or address)
They should be able to search for results within the filtered results
They should be able to clear search and clear filters easily
They should see a list/grid (configurable) of barbers to choose from (search and filter results).
Each barber 'card' should have a title (set by each barber) and a short description (set by each barber) as well as quick action CTAs for requesting an appointment (takes user to '/booking/:barber-slug') and for viewing the barbers profile (/:barber-slug)
'/:barber-slug' - a unique name (slug) set by each provider for displaying that barber's public profile. Has deeper information about the barber (set by barber), reviews (from other clients), gallery (provided by the barber), CTAs for booking, CTA for favoriting
'/profile' - their own profile to see information about their account with navigation items to deeper details like '/history', '/settings', etc
'/booking/:barber-slug' - book an appointment with a specific barber (somewhat configurable by the barber i.e. options for booking home visit (users location) and/or at the barbers location... barbers must provide at least one of the two options for booking). The form submits a request to book an appointment and a preferred time (Barbers can configure their booking to show at least one of these:
detailed schedule
general availability
)
'/settings' - user settings
'/billing' - future route for when this app can be a point of sale for providers and users can store their payment methods to send payment at appointment or ahead of time or later (managed by provider... providers can require payment up front)

#### Provider users (Barbers)

'/providers' - Landing page with pitch to become a provider, information about the process, links to '/providers/register' and, more prominately, a link to '/providers/login'. When authenticated, this route is a dashboard for the provider featuring upcoming appointments, links to other provider routes, link to a feed (future feature where barbers can share articles, images of their work, text posts, etc), overview of analytics.
'/providers/login' - redirected to this if they are not authenticated and try to go to a provider type authenticated route. Should have forgot password path and link to register page
'/providers/register' - Provider registration. They can create an account and get things set up, but will not appear in user lists/search results and their profile will not be public until they are approved.
Registration creates an account and submits a request for verification that goes to the admin. This should
have links to information about requirements as well as information on how to get more help.
'/providers/status' - shows the status of their registration, instructions on how to get help, information on roughly how the process works and how long it is expected to take. Maybe a tracker to see where they are in the process (what step (submitted, viewed, reviewing, approved/rejected)).
'/providers/profile/private' - authenticated route for the specific barber to manage their account and how it is seen publicly (Title, short description, complete description, gallery, highlighted reviews, etc)
'/providers/analytics' - this page helps providers see how often their page is visited and information about how often they appear in search results (frequency, under what filters), also how many users currently have them favorited.
'/providers/settings' - provider settings
'/providers/billing' - Future route for when this app can act as point of sale for providers (for MVP, providers are their own POS and handle that by appointment)

### Admin user

'/admin' - No registration link. Single email/password with MFA (password set initially in DB but can be recovered via recovery key and email or by contacting the site admin). When authenticated, this route becomes a dashboard for the admin featuring links to review requests, see site analytics, manage users (for moderation, account help, etc).
'/admin/settings' - site config management, etc
'/admin/content' - dashboard for managing site content
'/admin/content/landing' - content management for user landing page '/' when users are not authenticated
'/admin/content/providers-landing' - content management for providers landing page '/providers' when user is not authenticated as a provider.

### Design modernization

- What features exist on the app are not space efficient which affects mobile usability.
  The main card with the text "Book Top Local Barbers to Your Door or Studio" should not be a card itself, but a full width 'hero'
- Remove "PWA" tag that appears next to the title
- Create PWA Splash screen with logo displayed prominately
- Display Logo more prominately on landing pages
- Remove Reset DB from nav (this should be hidden in the admin settings)
- Create 'Install' button for installing the PWA. Should be dismissable, inline (no overlay), prominate on landing page.

### Tech Debt

- Use styled-components instead of inline styles
- Build library of atomic reusable components to use throughout the pages to reduce individual file complexity, maintenance load, and code repetition

### Testing

- unit tests for components
- integration tests for sets of components or pages/routes

#### End to end testing

- Suite that can be run against localhost or production (live site url)
- auth flow for client/consumer users
- auth flow for providers
- auth flow for admin
  NOTE: here 'auth flow' means registration -> login -> logout -> forgot password -> update password -> delete account. There should be base tests for testing the logged out functionality of the site. There should be repeatable functions/methods for running through registration -> login for both a user and provider, then executing tests as an authenticated user/provider, then deleting the account. By having methodology for creating new users as part of e2e testing, we can keep the db free of test accounts...
  Another strategy is to load a separate db that matches the prod db but with all dummy data in order to perform tests for user interactions provider -> provider and user -> provider and provider -> user
- user flows:
- - searching (gps vs address, all filters, all sorting)
- - settings
- - booking (creating request, confirming appointment, cancelling appointment, rating barber, etc)
- provider flows:
- - updating profile
- - managing requests (accepting/confirming, rejecting)
