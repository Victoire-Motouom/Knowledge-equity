import Header from "@/components/Header";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <h1 className="text-3xl font-semibold text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective date: January 31, 2026
        </p>

        <section className="mt-8 space-y-5 text-sm text-muted-foreground">
          <p>
            This Privacy Policy describes how Knowledge Equity ("Knowledge
            Equity", "we", "us", or "our") collects, uses, discloses, and
            safeguards information when you access or use the Service.
          </p>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              1. Information collected
            </h2>
            <p className="mt-2">
              <strong>Account information:</strong> name, email, handle, and
              profile attributes you provide.
            </p>
            <p className="mt-2">
              <strong>User content:</strong> contributions, reviews, comments,
              and expertise domains.
            </p>
            <p className="mt-2">
              <strong>Usage data:</strong> log data such as IP address,
              device/browser metadata, timestamps, and request identifiers,
              collected for security and service reliability.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              2. Purposes of processing
            </h2>
            <p className="mt-2">
              We process information to provide and maintain the Service,
              authenticate users, calculate KE scores, prevent fraud or abuse,
              comply with legal obligations, and improve features and
              performance.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              3. Legal bases (where applicable)
            </h2>
            <p className="mt-2">
              We process personal data based on your consent, performance of a
              contract, legitimate interests (such as security and product
              improvement), and compliance with legal obligations.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              4. Disclosures
            </h2>
            <p className="mt-2">
              We do not sell personal information. We may disclose information
              to service providers that assist us with hosting, authentication,
              database storage, analytics, and customer support, subject to
              contractual confidentiality and security obligations.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              5. Data retention
            </h2>
            <p className="mt-2">
              We retain information for as long as necessary to provide the
              Service, comply with legal obligations, resolve disputes, and
              enforce agreements. KE calculations may require retention of
              contribution and review history.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              6. International transfers
            </h2>
            <p className="mt-2">
              Your information may be transferred to and processed in countries
              other than your own. We use appropriate safeguards to protect
              personal data during such transfers.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              7. Your rights and choices
            </h2>
            <p className="mt-2">
              You may access, update, or correct your profile information
              through Settings. You may request deletion of your account by
              contacting us. Depending on your jurisdiction, you may have
              additional rights regarding your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              8. Security
            </h2>
            <p className="mt-2">
              We implement reasonable administrative, technical, and physical
              safeguards designed to protect personal information. No method of
              transmission or storage is completely secure.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              9. Changes to this Policy
            </h2>
            <p className="mt-2">
              We may update this Policy from time to time. We will post the
              updated policy and update the effective date above.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              10. Contact
            </h2>
            <p className="mt-2">Contact us at privacy@knowledgeequity.org.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
