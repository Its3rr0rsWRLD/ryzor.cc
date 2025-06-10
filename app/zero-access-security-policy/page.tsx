import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EnhancedTextGlow } from "@/components/enhanced-text-glow"

export default function ZeroAccessSecurityPolicyPage() {
  return (
    <div className="min-h-screen text-white bg-background py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="flex items-center text-gray-400 hover:text-[#ff0033] transition-colors mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-5xl md:text-6xl font-bold mb-8 cyber-title">
          <EnhancedTextGlow intensity="high" className="font-bold">
            Zero-Access Security Policy
          </EnhancedTextGlow>
        </h1>

        <div className="space-y-8 text-lg text-gray-300 leading-relaxed">
          <p>
            At Ryzor.cc, your security and privacy are paramount. Our Zero-Access Security Policy ensures that while we
            process your Discord tokens, <strong>we NEVER store them on our servers</strong>.
          </p>
          <p>
            Your Discord tokens are accessed solely for the purpose of sending requests to Discord&apos;s API on your
            behalf. All sensitive operations, including the encryption and decryption of your tokens, occur exclusively
            client-side (within your browser). This means your tokens are used transiently for API calls and are
            immediately discarded from our system&apos;s memory after use, ensuring they are never retained or logged.
          </p>
          <p>
            We are committed to transparency. Our frontend code is open source, allowing you to inspect and verify our
            security claims independently. We believe that true security comes from verifiable practices, not just
            promises.
          </p>
          <p>
            By adhering to this model, we eliminate the risk of your data being exposed through our systems. You retain
            full control and ownership of your information at all times.
          </p>
          <p className="text-sm text-gray-500 pt-4">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}
