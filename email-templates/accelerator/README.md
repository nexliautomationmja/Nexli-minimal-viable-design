# Accelerator delivery — plain-text emails

The two emails in the Accelerator delivery workflow. Both attach the PDF;
the only difference is what they say next.

Plain text on purpose. This is a free guide arriving in someone's inbox
minutes after they asked for it — a designed HTML template makes it look
like a campaign, and the whole credibility of the thing is that it reads
like a person sent it.

## The workflow

    Trigger: Inbound Webhook (b8230993)
      Add Tag "accelerator lead"
      If/Else: {{inboundWebhookRequest.funnel_path}} equals "agency"
          yes -> Wait 10 min -> 1-qualified.txt    + PDF attached
          no  -> Wait  2 min -> 2-free-lead.txt    + PDF attached

BRANCH ON funnel_path, NOT ON `qualified`. Both are in the payload, but
`qualified` is a JSON boolean and GHL compares conditions as strings —
it usually coerces, and "usually" in a condition that silently sends
every qualified lead down the wrong branch is not good enough.
funnel_path is a plain string: "agency" or "not-a-fit".

## Why the waits differ

Ten minutes on the qualified branch because /accelerator/next has a VSL
holding them — the delay is what keeps them watching. Two on the other,
because /accelerator/sending is an empty confirmation page and a long
wait there is just silence that earns a support email.

## Merge tags

Webhook-triggered, so:

    {{inboundWebhookRequest.firstName}}
    {{inboundWebhookRequest.resume_url}}   qualified branch ONLY

resume_url differs per branch. On the qualified branch it opens
/accelerator/next — the VSL and the calendar — signed in. On the other
it opens /accelerator/sending, which is a delivery confirmation and
nothing else, so 2-free-lead.txt deliberately has no link in it.

## Pasting into GHL

Plain-text / rich-text body, NOT a code block. Attach the PDF to the
email action itself. Do not let the editor add a logo header or a
signature image.

Type apostrophes and hyphens directly rather than pasting from a word
processor, or smart quotes creep in and look wrong in a text email.
