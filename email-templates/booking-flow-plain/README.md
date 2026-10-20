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

This workflow is triggered by the APPOINTMENT, so:

    {{contact.first_name}}
    {{appointment.start_time}}     works here, since the trigger is the appointment
    {{contact.resume_url}}         custom field, written by the booked route

If {{contact.resume_url}} comes back blank on a test send, the GHL contact
sync is not writing it and the link is dead — use the plain URL
https://www.nexli.net/booking-confirmed-b until that is fixed.

## The four

| File | When | Job |
|---|---|---|
| 1-confirmation.txt | immediately | you are booked, here is the page |
| 2-48h.txt | 48h before | pleasure — $15K to $55K |
| 3-24h.txt | 24h before | pain — the clients you have now |
| 4-30min.txt | 30min before | logistics — the Zoom link |
