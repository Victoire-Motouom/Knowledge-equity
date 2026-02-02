import Header from "@/components/Header";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <h1 className="text-3xl font-semibold text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Effective date: January 31, 2026
        </p>

        <section className="mt-8 space-y-5 text-sm text-muted-foreground">
          <p>
            These Terms of Service ("Terms") govern your access to and use of
            Knowledge Equity ("Knowledge Equity", "we", "us", or "our") and the
            website, applications, and services we provide (collectively, the
            "Service"). By accessing or using the Service, you agree to be bound
            by these Terms. If you do not agree, do not access or use the
            Service.
          </p>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              1. Eligibility and accounts
            </h2>
            <p className="mt-2">
              You must be able to form a binding contract in your jurisdiction
              and comply with all applicable laws. You agree to provide accurate
              information and to maintain the security of your account
              credentials. You are responsible for all activity that occurs
              under your account.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              2. User content; license
            </h2>
            <p className="mt-2">
              "User Content" includes contributions, reviews, comments, and
              profile information you submit. You retain ownership of your User
              Content. By submitting User Content, you grant Knowledge Equity a
              worldwide, non-exclusive, royalty-free, transferable,
              sublicensable license to host, store, use, reproduce, modify (for
              formatting), distribute, and display such User Content in
              connection with operating and improving the Service. You represent
              and warrant that you have all rights necessary to grant this
              license and that your User Content does not violate law or
              third-party rights.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              3. Knowledge Equity (KE)
            </h2>
            <p className="mt-2">
              Knowledge Equity ("KE") is an informational reputation score
              derived from contributions and reviews. KE has no monetary value
              and is not a financial product. We may modify the scoring
              methodology, reprocess scores, or remove content in order to
              preserve integrity and quality.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              4. Acceptable use
            </h2>
            <p className="mt-2">
              You agree not to: (a) submit unlawful, infringing, or harmful
              content; (b) manipulate reviews or KE scores; (c) reverse engineer
              or disrupt the Service; (d) access the Service using automated
              means without permission; or (e) violate any applicable law or
              regulation.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              5. Intellectual property
            </h2>
            <p className="mt-2">
              The Service, including its software, design, and trademarks, is
              owned by Knowledge Equity or its licensors and is protected by
              intellectual property laws. These Terms do not grant you any
              ownership rights in the Service.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              6. Termination
            </h2>
            <p className="mt-2">
              We may suspend or terminate your access to the Service at any time
              for conduct that violates these Terms or threatens the integrity,
              security, or availability of the Service. You may stop using the
              Service at any time.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              7. Disclaimer of warranties
            </h2>
            <p className="mt-2">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
              INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY OF CONTENT.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              8. Limitation of liability
            </h2>
            <p className="mt-2">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KNOWLEDGE EQUITY SHALL NOT
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR
              REVENUE, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              9. Indemnification
            </h2>
            <p className="mt-2">
              You agree to indemnify and hold Knowledge Equity harmless from any
              claims, damages, liabilities, and expenses arising out of your use
              of the Service or your User Content.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              10. Copyright policy
            </h2>
            <p className="mt-2">
              We respond to notices of alleged copyright infringement. If you
              believe content on the Service infringes your copyright, please
              contact us at legal@knowledgeequity.org.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              11. Governing law
            </h2>
            <p className="mt-2">
              These Terms are governed by the laws of the State of California,
              without regard to conflict of law principles. Any disputes shall
              be resolved in the state or federal courts located in California,
              and you consent to their jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              12. Changes to these Terms
            </h2>
            <p className="mt-2">
              We may update these Terms from time to time. Your continued use of
              the Service after changes become effective constitutes acceptance
              of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              13. Contact
            </h2>
            <p className="mt-2">
              Questions? Contact us at support@knowledgeequity.org.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
