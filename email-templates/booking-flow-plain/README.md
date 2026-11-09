# Booking flow — plain-text emails

The five emails in the appointment-status workflow ("Booked Appointment
Flow"). Deliberately plain: no HTML, no logo, no buttons.

A designed marketing email saying "your call is in 30 minutes" reads as
automated, and that is the wrong signal at the moment someone is deciding
whether to show up. Plain text reads as written by a person, renders
identically everywhere, and tends to stay out of Gmail's Promotions tab,
which is where styled email goes to be ignored.

These replace the HTML versions (booking-reminder*.html), which were
deleted. The $97 and advisory sequences are still HTML — those are
marketing and should look like it.

## Pasting into GHL

Use the plain-text / rich-text body, NOT a code block. Keep the line
breaks. Do not let the editor add a signature image or a logo header —
that defeats the point.

Type apostrophes and hyphens directly rather than pasting from a word
processor, or smart quotes creep in and look wrong in a text email.

## Merge tags

Written for the INBOUND WEBHOOK flow, so the name comes from the payload:

    {{inboundWebhookRequest.firstName}}
    {{contact.booking_start}}      the custom field, NOT the webhook value

THE DATE IS THE CUSTOM FIELD ON PURPOSE. The webhook carries
booking_start as a raw ISO timestamp, so
{{inboundWebhookRequest.booking_start}} renders literally as
2026-11-05T17:00:00.000Z in the body of the email. The custom field is a
GHL Date/Time, which GHL formats into the location's timezone. Map
booking_start into that field in the workflow, or these emails print a
machine timestamp at a prospect.

If the field is empty on a test send, drop the date sentence rather than
shipping a blank or an ISO string — "we're on in two days" carries the
message on its own.

PLAIN URL, NOT A RESUME LINK. /booking-confirmed-b is ungated, so the
bare link opens on any device. The resume URL would also greet them by
name, but it depends on the GHL contact sync having written it, and a
blank href is a dead email.

## The five, and the text

| File | When | Job |
|---|---|---|
| 1-confirmation.txt | immediately | you are booked, here is the page |
| 5-candor.txt | between confirmation and 48h | the doubts they won't say out loud → Candor |
| sms-candor.txt | same step as 5-candor | the same ask, as a text (SMS) |
| 2-48h.txt | 48h before | pleasure — $15K to $55K |
| 3-24h.txt | 24h before | pain — the clients you have now |
| 4-30min.txt | 30min before | logistics — the Zoom link |


## 5-candor.txt

Added 4 November 2026. Send it between the confirmation and the 48-hour
email — far enough in that they have stopped thinking about the booking,
early enough that whatever it surfaces can still change how the call is
run.

Its job is not to sell. It is to get the two or three unspoken doubts
out of their head and into a box before the call, so the call is not
spent on them. The questions people actually ask land in the server logs
as `[Candor]` lines, which is the other half of why this exists.

Same link rule as the rest of this folder: the plain URL, not a resume
link. /candor is ungated on purpose.

### {{contact.candor_url}} — the Candor link

Added 9 November 2026. The one exception to "plain URL". Phones that tap
an email or text link carry no funnel cookie, so a Candor conversation
started from one reached Marcel with no name on it. The link now carries
the GHL contact id (`/candor?c=<id>`), which the page passes through to
the transcript webhook as `contact_id`, plus `contact_url`, a one-click
link to the contact record.

The SITE builds the link and writes it to the contact's `candor_url`
custom field when they book (lib/ghl-sync, `candorUrl: true`, from
app/api/advisory-pricing/booked and app/api/demo/booked). A contact
field rather than a webhook value, so it is in the variable picker under
Contact whatever starts the workflow, like `{{contact.booking_start}}`.

The field has to exist in GHL first: Settings > Custom Fields > Contact,
Single line, named "Candor URL" (key `contact.candor_url`). Add its id to
`GHL_CUSTOM_FIELD_IDS` as `"candor_url"` alongside the others.

Do not hand-write `/candor?c={{contact.id}}` in the template: GHL's
editor flags a merge tag inside a URL as an issue with your custom
variables. The id is never shown to the visitor and never used to greet
them.

Only bookings made after the change is deployed have `candor_url`. For a
contact already in the flow it is blank, so a send to them goes out
without a link.

The Candor email and SMS use `{{contact.first_name}}` rather than
`{{inboundWebhookRequest.firstName}}` — a contact field renders whatever
triggered the flow.

In the Candor transcript email workflow, add
`Contact: {{inboundWebhookRequest.contact_url}}` above the transcript.

### sms-candor.txt

Same step as 5-candor, gated on `marketing_sms_opt_in = true`. Full setup
notes and the character count are in the file.
