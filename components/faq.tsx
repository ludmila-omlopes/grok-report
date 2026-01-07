import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Para que serve o GrokReport?",
      answer:
        "O GrokReport é uma ferramenta para registrar casos de uso indevido do Grok para alterar imagens de pessoas e organizar evidências. Com seu consentimento, os registros podem contribuir para um conjunto anonimizado de provas que apoia denúncias coletivas, investigações jornalísticas e ações institucionais.",
    },
    {
      question: "Quais tipos de evidências posso anexar no MVP?",
      answer:
        "No momento, priorizamos arquivos de imagem (prints/screenshot) e a URL do post no X. Recomendamos capturas completas com contexto visível: @, data/hora, URL, e a tela mostrando o post e o perfil.",
    },
    {
      question: "O GrokReport denuncia automaticamente no X ou em órgãos públicos?",
      answer:
        "Não. A plataforma ajuda a documentar e organizar o material. As denúncias oficiais devem ser feitas diretamente nos canais apropriados (por exemplo: X, SaferNet em casos envolvendo menores, e petições/denúncias relacionadas à LGPD).",
    },
    {
      question: "As evidências têm validade jurídica?",
      answer:
        "O GrokReport ajuda a manter o material organizado e consistente, mas não é uma certificadora forense e não garante, por si só, aceitação como prova em um processo. Se você pretende usar o material formalmente, recomendamos consultar um profissional especializado e preservar os arquivos originais (sem edição).",
    },
    {
      question: "Como acesso meu caso depois?",
      answer:
        "Você acessa com o ID do caso e um código de acesso exibido no momento do salvamento. Guarde esse código em local seguro. Sem ele, não é possível editar o caso ou baixar evidências vinculadas.",
    },
    {
      question: "Perdi meu código de acesso. Vocês recuperam?",
      answer:
        "Por segurança e privacidade, não. O código não é recuperável. Se necessário, você pode criar um novo caso e anexar novamente as evidências que tiver.",
    },
    {
      question: "Meus dados ficam públicos?",
      answer:
        "Não por padrão. O registro público só acontece se você marcar explicitamente o consentimento. Mesmo assim, o objetivo é utilizar os casos de forma anonimizada para fins jornalísticos, jurídicos e institucionais, respeitando a LGPD.",
    },
    {
      question: "Por quanto tempo os dados ficam armazenados?",
      answer:
        "No MVP, a retenção e a exclusão automática ainda estão em evolução. Se você precisar remover um caso, anote essa necessidade para a equipe ou aguarde a funcionalidade de exclusão, que está no roadmap. Enquanto isso, evite anexar informações pessoais desnecessárias.",
    },
  ]

  return (
    <section id="faq" className="border-b border-border bg-card">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-card-foreground mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Respostas objetivas sobre o que o GrokReport faz (e o que ainda não faz) no MVP
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left text-card-foreground hover:text-card-foreground/80 font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
