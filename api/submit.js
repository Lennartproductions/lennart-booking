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

    const addonsRowsInternal = [
      data.addons.cm && `<tr><td style="padding:10px 0;color:#6b7280;font-size:13px">Community Mgmt</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px">${data.addons.cm.name}</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.addons.cm.price)}</td></tr>`,
      data.addons.ads && `<tr><td style="padding:10px 0;color:#6b7280;font-size:13px">Ads-Betreuung</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px">Monatspauschale</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.addons.ads.price)}</td></tr>`,
      data.addons.blog && `<tr><td style="padding:10px 0;color:#6b7280;font-size:13px">Blog-Repurposing</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px">2 Artikel/Monat</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.addons.blog.price)}</td></tr>`,
      data.addons.newsletter && `<tr><td style="padding:10px 0;color:#6b7280;font-size:13px">Newsletter</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px">Produktion</td><td style="padding:10px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.addons.newsletter.price)}</td></tr>`,
    ].filter(Boolean).join('');

    // ============================================
    // MAIL 1: An dich (Benachrichtigung)
    // ============================================
    const internalHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:32px 16px">

  <!-- Header -->
  <div style="padding:0 8px 24px">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8f99;font-weight:600;margin-bottom:8px">LennArt · Neue Anfrage</div>
    <h1 style="font-size:28px;margin:0;color:#1a1d24;font-weight:500;line-height:1.2">${data.contact.company}</h1>
    <div style="font-size:14px;color:#6b7280;margin-top:4px">${data.contact.name} · ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  </div>

  <!-- Highlight-Box: Preis -->
  <div style="background:linear-gradient(135deg, #1a1d24 0%, #2E3A4A 100%);border-radius:16px;padding:28px;margin-bottom:16px;color:#fff">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;font-weight:600;margin-bottom:12px">Vertragsvolumen</div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="vertical-align:bottom">
          <div style="font-size:13px;color:#9ca3af;margin-bottom:4px">Monatlich</div>
          <div style="font-size:36px;font-weight:600;color:#fff;line-height:1;font-variant-numeric:tabular-nums">${fmt(data.calc.monthlyFinal)}</div>
          ${data.calc.discountPct > 0 ? `<div style="font-size:12px;color:#6ee7b7;margin-top:6px">✓ ${data.calc.discountPct}% Rabatt (${fmt(data.calc.discountAmount)} gespart)</div>` : ''}
        </td>
        <td style="vertical-align:bottom;text-align:right">
          <div style="font-size:13px;color:#9ca3af;margin-bottom:4px">Gesamtvolumen</div>
          <div style="font-size:20px;font-weight:500;color:#fff;font-variant-numeric:tabular-nums">${fmt(data.calc.contractTotal)}</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:2px">über ${data.duration} Monate</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Kontakt -->
  <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:16px;border:1px solid #e4e4e8">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8f99;font-weight:600;margin-bottom:16px">Kontaktdaten</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr>
        <td style="padding:8px 0;color:#6b7280;width:100px;font-size:13px">Name</td>
        <td style="padding:8px 0;color:#1a1d24;font-weight:500">${data.contact.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f5f5f4">Firma</td>
        <td style="padding:8px 0;color:#1a1d24;font-weight:500;border-top:1px solid #f5f5f4">${data.contact.company}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f5f5f4">E-Mail</td>
        <td style="padding:8px 0;border-top:1px solid #f5f5f4"><a href="mailto:${data.contact.email}" style="color:#2E3A4A;text-decoration:none;font-weight:500">${data.contact.email}</a></td>
      </tr>
      ${data.contact.phone ? `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #f5f5f4">Telefon</td>
        <td style="padding:8px 0;border-top:1px solid #f5f5f4"><a href="tel:${data.contact.phone}" style="color:#2E3A4A;text-decoration:none;font-weight:500">${data.contact.phone}</a></td>
      </tr>
      ` : ''}
    </table>
  </div>

  <!-- Konfiguration -->
  <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:16px;border:1px solid #e4e4e8">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8f99;font-weight:600;margin-bottom:4px">Konfiguration</div>
    <div style="display:inline-block;background:#f5f5f4;padding:4px 10px;border-radius:100px;font-size:12px;color:#1a1d24;font-weight:600;margin-bottom:16px">${data.platform}</div>
    
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f5f5f4">
        <td style="padding:12px 0;color:#6b7280;font-size:13px;width:140px">Onboarding</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px">${data.onboarding.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.onboarding.price)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f5f5f4">
        <td style="padding:12px 0;color:#6b7280;font-size:13px">Basis-Paket</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px;font-weight:500">${data.package.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.package.price)}/Mo</td>
      </tr>
      <tr ${addonsRowsInternal ? 'style="border-bottom:1px solid #f5f5f4"' : ''}>
        <td style="padding:12px 0;color:#6b7280;font-size:13px">Content-Modul</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px;font-weight:500">${data.module.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.module.price)}/Mo</td>
      </tr>
      ${addonsRowsInternal}
    </table>

    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #1a1d24">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#6b7280;font-size:12px;padding:4px 0">Laufzeit</td>
          <td style="text-align:right;color:#1a1d24;font-size:13px;font-weight:500;padding:4px 0">${data.duration} Monate</td>
        </tr>
        <tr>
          <td style="color:#6b7280;font-size:12px;padding:4px 0">Erster Monat inkl. Onboarding</td>
          <td style="text-align:right;color:#1a1d24;font-size:13px;font-weight:500;padding:4px 0;font-variant-numeric:tabular-nums">${fmt(data.calc.firstMonth)}</td>
        </tr>
      </table>
    </div>
  </div>

  ${data.contact.message ? `
  <!-- Anmerkung -->
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:24px 28px;margin-bottom:16px">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#92400e;font-weight:600;margin-bottom:10px">💬 Anmerkung vom Kunden</div>
    <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;white-space:pre-wrap">${data.contact.message}</p>
  </div>
  ` : ''}

  <!-- Quick Actions -->
  <div style="background:#f5f5f4;border-radius:16px;padding:20px 28px;margin-bottom:16px">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:0">
          <a href="mailto:${data.contact.email}?subject=Re:%20Deine%20Anfrage%20bei%20LennArt%20Productions" style="display:inline-block;background:#1a1d24;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Kunde antworten</a>
          ${data.contact.phone ? `<a href="tel:${data.contact.phone}" style="display:inline-block;background:#fff;color:#1a1d24;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;margin-left:8px;border:1px solid #e4e4e8">Anrufen</a>` : ''}
        </td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="padding:24px 8px 0;text-align:center;border-top:1px solid #e4e4e8;margin-top:24px">
    <div style="font-size:11px;color:#8a8f99;letter-spacing:0.5px">Eingegangen über buchung.lennartproductions.de</div>
    <div style="font-size:10px;color:#b8b5ab;margin-top:4px">Alle Preise zzgl. 19 % MwSt. · LennArt Productions Konfigurator</div>
  </div>

</div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"LennArt Konfigurator" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      replyTo: data.contact.email,
      subject: `${data.contact.company} · ${fmt(data.calc.monthlyFinal)}/Mo · ${data.package.name}`,
      html: internalHtml,
    });

    // ============================================
    // MAIL 2: An den Kunden (Bestätigung)
    // ============================================
    const firstName = data.contact.name.split(' ')[0];
    
    const addonsRowsCustomer = addonsRowsInternal;
    
    const customerHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:32px 16px">

  <div style="padding:0 8px 24px">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8f99;font-weight:600;margin-bottom:8px">LennArt Productions</div>
    <h1 style="font-size:28px;margin:0;color:#1a1d24;font-weight:500;line-height:1.2">Danke, ${firstName}.</h1>
    <p style="color:#4b5260;margin-top:12px;font-size:15px;line-height:1.6">
      Deine unverbindliche Anfrage ist bei uns eingegangen. Wir melden uns innerhalb der nächsten 24 Stunden, um die Details zu besprechen.
    </p>
  </div>

  <div style="background:#fff;border-radius:16px;padding:24px 28px;margin-bottom:16px;border:1px solid #e4e4e8">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8f99;font-weight:600;margin-bottom:16px">Zusammenfassung</div>
    <div style="display:inline-block;background:#f5f5f4;padding:4px 10px;border-radius:100px;font-size:12px;color:#1a1d24;font-weight:600;margin-bottom:16px">${data.platform}</div>

    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f5f5f4">
        <td style="padding:12px 0;color:#6b7280;font-size:13px;width:140px">Onboarding</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px">${data.onboarding.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.onboarding.price)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f5f5f4">
        <td style="padding:12px 0;color:#6b7280;font-size:13px">Basis-Paket</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px;font-weight:500">${data.package.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.package.price)}/Mo</td>
      </tr>
      <tr ${addonsRowsCustomer ? 'style="border-bottom:1px solid #f5f5f4"' : ''}>
        <td style="padding:12px 0;color:#6b7280;font-size:13px">Content-Modul</td>
        <td style="padding:12px 0;color:#1a1d24;font-size:13px;font-weight:500">${data.module.name}</td>
        <td style="padding:12px 0;text-align:right;color:#1a1d24;font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:16px">${fmt(data.module.price)}/Mo</td>
      </tr>
      ${addonsRowsCustomer}
    </table>
  </div>

  <div style="background:linear-gradient(135deg, #1a1d24 0%, #2E3A4A 100%);border-radius:16px;padding:28px;margin-bottom:16px;color:#fff">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;font-weight:600;margin-bottom:12px">Deine Konfiguration</div>
    <div style="font-size:13px;color:#9ca3af;margin-bottom:4px">Monatlich</div>
    <div style="font-size:36px;font-weight:600;color:#fff;line-height:1;font-variant-numeric:tabular-nums">${fmt(data.calc.monthlyFinal)}</div>
    ${data.calc.discountPct > 0 ? `<div style="font-size:12px;color:#6ee7b7;margin-top:6px">✓ ${data.calc.discountPct}% Rabatt bei ${data.duration} Monaten Laufzeit</div>` : ''}
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:13px;color:#9ca3af">
      Erster Monat inkl. Onboarding: <span style="color:#fff;font-weight:500">${fmt(data.calc.firstMonth)}</span>
    </div>
  </div>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:24px 28px;margin-bottom:16px">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#92400e;font-weight:600;margin-bottom:10px">So geht's weiter</div>
    <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6">
      Wir prüfen deine Anfrage und melden uns per E-Mail oder Telefon. Gemeinsam klären wir Projektstart, Termine und offene Punkte. Du bekommst anschließend ein schriftliches Angebot.
    </p>
  </div>

  <p style="color:#4b5260;font-size:14px;line-height:1.6;margin:32px 8px 8px">
    Falls du in der Zwischenzeit Fragen hast, antworte einfach auf diese E-Mail.
  </p>

  <p style="color:#1a1d24;font-size:14px;line-height:1.6;margin:0 8px 24px">
    Bis bald,<br>
    <strong>LennArt Productions</strong>
  </p>

  <div style="padding:24px 8px 0;text-align:center;border-top:1px solid #e4e4e8;margin-top:24px">
    <div style="font-size:11px;color:#8a8f99;letter-spacing:0.5px">Automatische Bestätigung · Alle Preise zzgl. 19 % MwSt.</div>
    <div style="font-size:10px;color:#b8b5ab;margin-top:4px">Diese Bestätigung stellt noch kein verbindliches Angebot dar.</div>
  </div>

</div>
</body>
</html>
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
