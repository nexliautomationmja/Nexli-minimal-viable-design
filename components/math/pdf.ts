// ---------------------------------------------------------------------------
// The See the Math PDFs: where they are, and what they're called.
//
// Two files, both built from the deck by scripts/build-math-pdf.mjs:
//   PDF_HREF        the 16:9 slides, for desktops, laptops and tablets
//   PDF_PHONE_HREF  the phone layout, one tall page per slide
//
// Which one a visitor gets: usePdfHref() (./pdf-link) for the download
// buttons on /math, and PDF_SHARE_PATH, /math/pdf (app/math/pdf), for links
// sent outside the deck. Both use isPhone in lib/device.
//
// Paths only, no React: the /math/pdf route imports this on the server, and
// Next will not let a server route import a file that uses hooks.
// ---------------------------------------------------------------------------

export const PDF_HREF = '/downloads/nexli-see-the-math.pdf';
export const PDF_PHONE_HREF = '/downloads/nexli-see-the-math-phone.pdf';
export const PDF_NAME = 'Nexli-See-The-Math.pdf';
/** The link to text or email: sends a phone the phone PDF, anyone else the slides. */
export const PDF_SHARE_PATH = '/math/pdf';
