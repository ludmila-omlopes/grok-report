import { Upload, Search, FileCheck, Send } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Registro do caso",
      description:
        "Informe a URL do post, os perfis envolvidos e o contexto do uso indevido do Grok para alterar imagens de pessoas.",
    },
    {
      number: "02",
      icon: Search,
      title: "Envio de evidências",
      description:
        "Anexe capturas de tela e arquivos que comprovem o ocorrido, priorizando contexto completo, data, horário e identificação do post.",
    },
    {
      number: "03",
      icon: FileCheck,
      title: "Código de acesso",
      description:
        "Ao salvar, o sistema gera um código único de acesso. Esse código garante a integridade do registro e permite editar o caso posteriormente.",
    },
    {
      number: "04",
      icon: Send,
      title: "Registro coletivo",
      description:
        "Com seu consentimento, o caso pode integrar um conjunto anonimizado de provas para apoiar denúncias coletivas, investigações jornalísticas e ações institucionais.",
    },
  ]

  return (
    <section id="como-funciona" className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-card-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Um fluxo simples para transformar relatos isolados em registros organizados de uso indevido de IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex gap-6">
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center border-2 border-border bg-background">
                    <span className="text-2xl font-bold text-muted-foreground font-mono">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center border border-border bg-accent">
                    <step.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
