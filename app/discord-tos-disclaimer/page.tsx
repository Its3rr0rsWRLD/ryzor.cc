import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EnhancedTextGlow } from "@/components/enhanced-text-glow"

export default function DiscordTOSDisclaimerPage() {
  return (
    <div className="min-h-screen text-white bg-background py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="flex items-center text-gray-400 hover:text-[#ff0033] transition-colors mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-5xl md:text-6xl font-bold mb-8 cyber-title">
          <EnhancedTextGlow intensity="high" className="font-bold">
            Discord TOS Disclaimer
          </EnhancedTextGlow>
        </h1>

        <div className="space-y-8 text-lg text-gray-300 leading-relaxed">
          <p>
            Ryzor.cc is an independent third-party application and is not affiliated with, endorsed, or sponsored by
            Discord Inc. or its subsidiaries.
          </p>
          <p>
            Users of Ryzor.cc acknowledge and agree that the use of this platform may be in violation of Discord's Terms
            of Service (TOS). Discord's TOS generally prohibit the use of automated clients, self-bots, or any software
            that interacts with Discord in a way not explicitly permitted by Discord.
          </p>
          <p>
            By using Ryzor.cc, you assume full responsibility for any potential consequences, including but not limited
            to, temporary or permanent suspension of your Discord account. Ryzor.cc provides its services &quot;as
            is&quot; without any warranties, express or implied, regarding compliance with Discord&apos;s TOS.
          </p>
          <p>
            We strongly advise all users to review Discord&apos;s official Terms of Service and Community Guidelines to
            understand their obligations and the potential risks associated with using third-party applications.
          </p>
          <p className="text-sm text-gray-500 pt-4">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}
