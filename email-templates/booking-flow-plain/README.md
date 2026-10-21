# Booking flow — plain-text emails

The four emails in the appointment-status workflow ("Booked Appointment
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

## The four

| File | When | Job |
|---|---|---|
| 1-confirmation.txt | immediately | you are booked, here is the page |
| 2-48h.txt | 48h before | pleasure — $15K to $55K |
| 3-24h.txt | 24h before | pain — the clients you have now |
| 4-30min.txt | 30min before | logistics — the Zoom link |
