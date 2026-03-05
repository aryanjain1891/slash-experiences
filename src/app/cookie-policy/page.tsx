"use client";

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: July 07, 2025</p>

        <div className="space-y-8 prose prose-gray max-w-none">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Slash Experiences uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><b>Essential Cookies:</b> Required for the website to function properly, including authentication and session management.</li>
              <li><b>Preference Cookies:</b> Used to remember your preferences such as selected location and search history.</li>
              <li><b>Analytics Cookies:</b> Help us understand how visitors interact with the website so we can improve the user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie</th>
                    <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 font-semibold text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Session Token</td>
                    <td className="py-2 pr-4">Keeps you signed in to your account</td>
                    <td className="py-2">7 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Location Preference</td>
                    <td className="py-2 pr-4">Remembers your selected city</td>
                    <td className="py-2">Persistent (localStorage)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Search History</td>
                    <td className="py-2 pr-4">Stores your recent searches for convenience</td>
                    <td className="py-2">Persistent (localStorage)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Saved Experiences</td>
                    <td className="py-2 pr-4">Remembers experiences you&apos;ve saved for later</td>
                    <td className="py-2">Persistent (localStorage)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We may use third-party services such as Google OAuth for authentication. These services may set their own cookies according to their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground mb-4">
              You can control and manage cookies through your browser settings. Please note that disabling essential cookies may affect the functionality of the website, including the ability to sign in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our Cookie Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>By email: <a href="mailto:aryan@slashexperiences.in" className="text-blue-600 underline">aryan@slashexperiences.in</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
