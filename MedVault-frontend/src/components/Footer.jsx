export default function Footer() {
  const year = new Date().getFullYear();

  const quickLinks = [
    ["About", "#about"],
    ["Services", "#services"],
    ["Doctors", "#our-doctors"],
    ["Support", "#contact-support"],
  ];

  const socialLinks = [
    ["Instagram", "fab fa-instagram"],
    ["Facebook", "fab fa-facebook-f"],
    ["Twitter", "fab fa-twitter"],
    ["LinkedIn", "fab fa-linkedin-in"],
  ];

  const paymentPartners = [
    ["Mastercard", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"],
    ["PayPal", "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"],
    ["Paytm", "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg"],
    ["GPay", "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"],
    ["PhonePe", "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"],
    ["RuPay", "https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg"],
  ];

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#071513] px-6 py-16 text-slate-300">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-xl font-black text-white">
                M
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">MedVault</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                  Secure Health Cloud
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm leading-7 text-slate-400">
              A modern healthcare workspace for appointments, medical records,
              doctor workflows and patient care management.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <div className="space-y-3 text-sm font-semibold">
              {quickLinks.map(([label, href]) => (
                <a key={label} href={href} className="block hover:text-teal-300">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Contact</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p><i className="fas fa-map-marker-alt mr-2 text-teal-300" /> Kolkata, West Bengal</p>
              <p><i className="fas fa-envelope mr-2 text-teal-300" /> support@medvault.com</p>
              <p><i className="fas fa-phone mr-2 text-teal-300" /> +91 1122334455</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Social</h3>
            <div className="flex gap-3">
              {socialLinks.map(([label, icon]) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:-translate-y-1 hover:bg-teal-600"
                >
                  <i className={`${icon} text-lg`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-slate-500">© {year} MedVault. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Payment Partners
              </p>
              {paymentPartners.map(([label, src]) => (
                <img
                  key={label}
                  src={src}
                  alt={label}
                  className="h-7 rounded-lg bg-white px-2 py-1 shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
