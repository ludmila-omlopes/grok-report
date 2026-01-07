import { Database, Shield, Clock, FileSearch, Scale, Lock } from "lucide-react"

export function Resources() {
  const features = [
    {
      icon: Database,
      title: "Registro centralizado",
      description:
        "Guarde URL do post, perfis envolvidos, contexto e evidências em um único caso para evitar perda de informações e facilitar organização.",
    },
    {
      icon: Shield,
      title: "Integridade das evidências",
      description:
        "Cada arquivo recebe uma impressão digital (hash) para ajudar a detectar alterações e manter consistência do material anexado ao caso.",
    },
    {
      icon: Clock,
      title: "Data e contexto do registro",
      description:
        "O sistema registra data e hora do salvamento do caso e mantém as evidências vinculadas ao post e aos perfis informados.",
    },
    {
      icon: FileSearch,
      title: "Pronto para triagem e análise",
      description:
        "Campos padronizados ajudam a classificar casos (ex.: nudez/sexualização, suspeita de menor) e organizar dados para análises futuras.",
    },
    {
      icon: Scale,
      title: "Foco em denúncias coletivas",
      description:
        "Com seu consentimento, seu caso pode contribuir para estatísticas e relatórios anonimizados que apoiam pressão institucional e jornalística.",
    },
    {
      icon: Lock,
      title: "Privacidade por padrão (LGPD)",
      description:
        "Coletamos o mínimo necessário e você controla o acesso ao caso com um código único. Sem conta, sem login e sem exposição de dados em links.",
    },
  ]

  return (
    <section id="recursos" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Recursos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas práticas para registrar casos de uso indevido do Grok e reunir evidências com segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="border border-border bg-card p-6 hover:border-foreground/20 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border bg-accent">
                <feature.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
