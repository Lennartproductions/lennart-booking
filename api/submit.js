import nodemailer from 'nodemailer';

const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const addonsRows = [
      data.addons.cm && `<tr><td style="padding:8px 0;color:#6b7280">Community Mgmt</td><td style="padding:8px 0;text-align:right">${data.addons.cm.name} · ${fmt(data.addons.cm.price)}</td></tr>`,
      data.addons.ads && `<tr><td style="padding:8px 0;color:#6b7280">Ads-Betreuung</td><td style="padding:8px 0;text-align:right">${fmt(data.addons.ads.price)}/Monat</td></tr>`,
      data.addons.blog && `<tr><td style="padding:8px 0;color:#6b7280">Blog-Repurposing</td><td style="padding:8px 0;text-align:right">${fmt(data.addons.blog.price)}/Monat</td></tr>`,
      data.addons.newsletter && `<tr><td style="padding:8px 0;color:#6b7280">Newsletter</td><td style="padding:8px 0;text-align:right">${fmt(data.addons.newsletter.price)}/Monat</td></tr>`,
    ].filter(Boolean).join('');

    // ============================================
    // MAIL 1: An dich (Benachrichtigung)
    // ============================================
    const internalHtml = `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1d24">
  <h1 style="font-size:24px;margin-bottom:8px">Neue Anfrage · Social Media Konfigurator</h1>
  <p style="color:#6b7280;margin-bottom:24px">Eingegangen über buchung.lennartproductions.de</p>

  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:24px">
    <h2 style="font-size:16px;margin:0 0 12px">Kontakt</h2>
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:6px 0;color:#6b7280;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${data.contact.name}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Firma</td><td style="padding:6px 0;font-weight:600">${data.contact.company}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">E-Mail</td><td style="padding:6px 0"><a href="mailto:${data.contact.email}">${data.contact.email}</a></td></tr>
      ${data.contact.phone ? `<tr><td style="padding:6px 0;color:#6b7280">Telefon</td><td style="padding:6px 0"><a href="tel:${data.contact.phone}">${data.contact.phone}</a></td></tr>` : ''}
    </table>
  </div>

  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:24px">
    <h2 style="font-size:16px;margin:0 0 12px">Konfiguration</h2>
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:8px 0;color:#6b7280">Plattform</td><td style="padding:8px 0;text-align:right;font-weight:600">${data.platform}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Onboarding</td><td style="padding:8px 0;text-align:right">${data.onboarding.name} · ${fmt(data.onboarding.price)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Paket</td><td style="padding:8px 0;text-align:right">${data.package.name} · ${fmt(data.package.price)}/Monat</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Modul</td><td style="padding:8px 0;text-align:right">${data.module.name} · ${fmt(data.module.price)}/Monat</td></tr>
      ${addonsRows}
      <tr><td style="padding:8px 0;color:#6b7280">Laufzeit</td><td style="padding:8px 0;text-align:right">${data.duration} Monate</td></tr>
    </table>
  </div>

  <div style="background:#1a1d24;color:#fff;border-radius:12px;padding:20px;margin-bottom:24px">
    <table style="width:100%;font-size:14px;color:#fff">
      <tr><td style="padding:6px 0;color:#9ca3af">Monatlich</td><td style="padding:6px 0;text-align:right;font-size:20px;font-weight:600">${fmt(data.calc.monthlyFinal)}</td></tr>
      ${data.calc.discountPct > 0 ? `<tr><td style="padding:6px 0;color:#9ca3af">Rabatt</td><td style="padding:6px 0;text-align:right;color:#6ee7b7">${data.calc.discountPct}% (− ${fmt(data.calc.discountAmount)})</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#9ca3af">Erster Monat inkl. Onboarding</td><td style="padding:6px 0;text-align:right">${fmt(data.calc.firstMonth)}</td></tr>
      <tr><td style="padding:6px 0;color:#9ca3af">Gesamtvolumen Laufzeit</td><td style="padding:6px 0;text-align:right">${fmt(data.calc.contractTotal)}</td></tr>
    </table>
  </div>

  ${data.contact.message ? `
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px">
    <h3 style="font-size:14px;margin:0 0 8px">Anmerkung vom Kunden</h3>
    <p style="margin:0;font-size:14px;color:#78350f;white-space:pre-wrap">${data.contact.message}</p>
  </div>
  ` : ''}

  <p style="color:#9ca3af;font-size:12px;margin-top:32px">Alle Preise zzgl. 19 % MwSt.</p>
</div>
    `;

    await transporter.sendMail({
      from: `"LennArt Konfigurator" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      replyTo: data.contact.email,
      subject: `Neue Anfrage: ${data.contact.company} · ${fmt(data.calc.monthlyFinal)}/Monat`,
      html: internalHtml,
    });

    // ============================================
    // MAIL 2: An den Kunden (Bestätigung)
    // ============================================
    const firstName = data.contact.name.split(' ')[0];
    
    const customerHtml = `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1d24">
  <h1 style="font-size:24px;margin-bottom:8px">Danke für deine Anfrage, ${firstName}.</h1>
  <p style="color:#4b5260;margin-bottom:24px;font-size:15px;line-height:1.6">
    Deine unverbindliche Anfrage ist bei uns eingegangen. Wir melden uns innerhalb der nächsten 24 Stunden bei dir, um die Details zu besprechen und offene Fragen zu klären.
  </p>

  <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:24px">
    <h2 style="font-size:16px;margin:0 0 12px">Zusammenfassung deiner Auswahl</h2>
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:8px 0;color:#6b7280">Plattform</td><td style="padding:8px 0;text-align:right;font-weight:600">${data.platform}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Onboarding</td><td style="padding:8px 0;text-align:right">${data.onboarding.name} · ${fmt(data.onboarding.price)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Paket</td><td style="padding:8px 0;text-align:right">${data.package.name} · ${fmt(data.package.price)}/Monat</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Modul</td><td style="padding:8px 0;text-align:right">${data.module.name} · ${fmt(data.module.price)}/Monat</td></tr>
      ${addonsRows}
      <tr><td style="padding:8px 0;color:#6b7280">Laufzeit</td><td style="padding:8px 0;text-align:right">${data.duration} Monate</td></tr>
    </table>
  </div>

  <div style="background:#1a1d24;color:#fff;border-radius:12px;padding:20px;margin-bottom:24px">
    <table style="width:100%;font-size:14px;color:#fff">
      <tr><td style="padding:6px 0;color:#9ca3af">Monatlich</td><td style="padding:6px 0;text-align:right;font-size:20px;font-weight:600">${fmt(data.calc.monthlyFinal)}</td></tr>
      ${data.calc.discountPct > 0 ? `<tr><td style="padding:6px 0;color:#9ca3af">Rabatt</td><td style="padding:6px 0;text-align:right;color:#6ee7b7">${data.calc.discountPct}% (− ${fmt(data.calc.discountAmount)})</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#9ca3af">Erster Monat inkl. Onboarding</td><td style="padding:6px 0;text-align:right">${fmt(data.calc.firstMonth)}</td></tr>
    </table>
  </div>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px">
    <h3 style="font-size:14px;margin:0 0 8px">So geht's weiter</h3>
    <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6">
      Wir prüfen deine Anfrage und melden uns per E-Mail oder Telefon. Gemeinsam klären wir den Projektstart, Termine und alle offenen Punkte. Du bekommst anschließend ein schriftliches Angebot.
    </p>
  </div>

  <p style="color:#4b5260;font-size:14px;line-height:1.6;margin-bottom:24px">
    Falls du in der Zwischenzeit Fragen hast oder etwas ergänzen möchtest, antworte einfach auf diese E-Mail.
  </p>

  <p style="color:#4b5260;font-size:14px;line-height:1.6;margin-bottom:4px">
    Bis bald,<br>
    <strong>LennArt Productions</strong>
  </p>

  <hr style="border:none;border-top:1px solid #e4e4e8;margin:32px 0 16px">
  <p style="color:#9ca3af;font-size:11px;line-height:1.5">
    Diese E-Mail ist eine automatische Bestätigung deiner Anfrage. Alle Preise zzgl. 19 % MwSt. Diese Bestätigung stellt noch kein verbindliches Angebot dar.
  </p>
</div>
    `;

    await transporter.sendMail({
      from: `"LennArt Productions" <${process.env.MAIL_FROM}>`,
      to: data.contact.email,
      replyTo: process.env.MAIL_TO,
      subject: `Deine Anfrage bei LennArt Productions`,
      html: customerHtml,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Mail sending failed', details: err.message });
  }
}
