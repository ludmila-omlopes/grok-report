import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function Hero() {
  return (
    <section className="relative border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Sua imagem foi alterada indevidamente com o Grok?
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 text-pretty leading-relaxed">
            Documente o abuso e contribua para um registro coletivo de provas sobre o uso indevido de IA.
            </p>

            {/* Subheadline complementar */}
  <p className="text-sm sm:text-base text-muted-foreground mb-10 max-w-2xl">
    Os registros podem ser utilizados de forma anonimizada para fins jornalísticos,
    jurídicos e institucionais, respeitando a LGPD.
  </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base font-semibold" asChild>
                <Link href="/cases/new">Iniciar denúncia →</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base font-semibold bg-transparent" asChild>
                <Link href="/privacy">Ver Política de Privacidade</Link>
              </Button>
            </div>
          </div>

          {/* Right side - Case Card Preview */}
          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wider font-mono">CASO #2847</h3>
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20">
                EM ANÁLISE
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 tracking-wide font-mono">
                  URL DO POST
                </label>
                <div className="flex items-center gap-2 bg-muted/30 border border-border p-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground font-mono truncate">x.com/infrator/status/1234567890</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 tracking-wide font-mono">
                  INFRATOR
                </label>
                <div className="bg-muted/30 border border-border p-3">
                  <span className="text-sm text-foreground font-mono">@usuario_infrator</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 tracking-wide font-mono">
                  TIMESTAMP
                </label>
                <div className="bg-muted/30 border border-border p-3">
                  <span className="text-sm text-foreground font-mono">2024-01-15 14:32:18 UTC</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 tracking-wide font-mono">
                  EVIDÊNCIAS
                </label>
                <div className="bg-muted/30 border border-border p-3">
                  <span className="text-sm text-muted-foreground">3 arquivos • Hash verificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
