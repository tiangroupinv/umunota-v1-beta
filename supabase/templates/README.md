# UMUNOTA Auth Email Templates

These templates are the source-controlled UMUNOTA designs for Supabase Auth emails. Hosted Supabase projects require the corresponding HTML and subject lines to be applied in **Authentication → Email Templates**. The templates use `{{ .SiteURL }}/umunota-logo-official.png`, so the Supabase Site URL must point to the public UMUNOTA deployment where that asset is available.

Recommended subjects:

- `confirmation.html` — **Confirm your UMUNOTA email**
- `recovery.html` — **Reset your UMUNOTA password**
- `magic_link.html` — **Your secure UMUNOTA sign-in link**
- `invite.html` — **You’re invited to UMUNOTA**
- `email_change.html` — **Confirm your new UMUNOTA email**
- `reauthentication.html` — **Your UMUNOTA verification code**
- `password_changed.html` — **Your UMUNOTA password was changed**
- `email_changed.html` — **Your UMUNOTA email was changed**

For production delivery, configure a custom SMTP provider using an official Tian Group / UMUNOTA sender domain rather than relying on the shared default SMTP service. Disable link tracking in the SMTP provider for authentication links.

Do not replace Supabase auth variables such as `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .OldEmail }}` or `{{ .SiteURL }}` with hard-coded values.
