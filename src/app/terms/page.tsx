"use client";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">Terms and Conditions</h1>

        <div className="prose prose-gray max-w-none">
          <p className="mb-4">
            These terms and conditions outline the rules and regulations for the use of Slash Experiences&apos;s Website, located at Slash Experiences.
          </p>
          <p className="mb-4">
            By accessing this website we assume you accept these terms and conditions. Do not continue to use Slash Experiences if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2">Cookies</h2>
          <p className="mb-4">
            We employ the use of cookies. By accessing Slash Experiences, you agreed to use cookies in agreement with the Slash Experiences&apos;s Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2">License</h2>
          <p className="mb-4">
            Unless otherwise stated, Slash Experiences and/or its licensors own the intellectual property rights for all material on Slash Experiences. All intellectual property rights are reserved.
          </p>
          <p className="mb-4">You must not:</p>
          <ul className="mb-4 list-disc list-inside text-muted-foreground">
            <li>Republish material from Slash Experiences</li>
            <li>Sell, rent or sub-license material from Slash Experiences</li>
            <li>Reproduce, duplicate or copy material from Slash Experiences</li>
            <li>Redistribute content from Slash Experiences</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">Content Liability</h2>
          <p className="mb-4">
            We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that arise on your Website.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2">Your Privacy</h2>
          <p className="mb-4">
            Please read our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2">Reservation of Rights</h2>
          <p className="mb-4">
            We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2">Disclaimer</h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website.
          </p>
          <ul className="mb-4 list-disc list-inside text-muted-foreground">
            <li>limit or exclude our or your liability for death or personal injury;</li>
            <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
            <li>limit any of our or your liabilities in any way that is not permitted under applicable law;</li>
            <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
          </ul>
          <p className="mb-4 text-muted-foreground">
            As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
          </p>
        </div>
      </div>
    </div>
  );
}
