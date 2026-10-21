# Accelerator — qualified, did not book

Five touches for a firm that cleared the bar, landed on
/accelerator/next, and never picked a time. The most valuable group in
the funnel: they qualified AND looked at the calendar.

Lives inside the delivery workflow's "agency" branch, after the PDF
send. Not a separate workflow.

    Wait 10 min   PDF email + SMS                 <- already built
    Wait 30 min   1-30min            check tag first
    Wait 1 day    2-day1-pleasure    check tag first
    Wait 1 day    3-day2-pain        check tag first
    Wait 2 days   4-day4-diy         check tag first
    Wait 3 days   5-day7-last        check tag first, then STOP

CHECK "advisory booked" BEFORE EVERY SEND, not just the first. They can
book at any moment and the booking route applies that tag; firing blind
chases a firm that already has a call in the diary. That is the message
people remember, and not kindly.

## Five angles, on purpose

    1  30 min   EASE        twenty seconds, you already qualified
    2  day 1    PLEASURE    what a full calendar is worth
    3  day 2    PAIN        the clients you have instead
    4  day 4    THE DIY TRAP  you can do it yourself - here is the bill
    5  day 7    URGENCY     21 days to build, January does not move

Number 4 is the one that only works on this audience. Every other
segment is choosing whether to buy; these people already have the
free guide in their inbox, so their real objection is "I will just do
it myself". Nobody else in the funnel can be sold against that, and
nothing else in the sequence addresses it.

Pleasure before pain, as everywhere else: someone who just watched a
VSL is not ready to be told their business is broken, and from a
stranger on day one that reads as an attack.

## Merge tags

Webhook-triggered, so {{inboundWebhookRequest.firstName}} and
{{inboundWebhookRequest.resume_url}} - which on this branch opens
/accelerator/next, the VSL and the calendar, signed in.

ASCII only. Plain-text body in GHL, not a code block.
