import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { Resources } from "@/components/resources"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <HowItWorks />
        <Resources />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
