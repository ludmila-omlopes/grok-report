import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Termos de Uso | GrokReport",
  description: "Termos de Uso do GrokReport.",
}

const LAST_UPDATED = "08/01/2026" // ajuste quando publicar

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground mt-2">Última atualização: {LAST_UPDATED}</p>
          </div>

          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>GrokReport</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 text-sm leading-relaxed text-foreground">
            <section className="space-y-3">
              <h2 className="text-base font-semibold">1. Sobre a plataforma</h2>
              <p className="text-muted-foreground">
                O GrokReport é uma ferramenta para registrar e organizar informações e evidências relacionadas a
                possíveis abusos envolvendo a manipulação de imagens por inteligência artificial (incluindo o Grok), com
                foco em documentação e apoio a iniciativas coletivas.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">2. O que a plataforma não faz</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Não realiza denúncias automáticas no X, SaferNet, ANPD ou outros órgãos</li>
                <li>Não garante remoção de conteúdo nem resultados em procedimentos administrativos ou judiciais</li>
                <li>Não fornece assessoria jurídica</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">3. Responsabilidades do usuário</h2>
              <p className="text-muted-foreground">
                Ao utilizar a plataforma, o usuário se compromete a:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Enviar apenas informações e arquivos que tenha autorização para compartilhar</li>
                <li>Não utilizar o sistema para difamação, assédio ou exposição de vítimas</li>
                <li>Não enviar conteúdos manifestamente ilegais ou que violem direitos de terceiros</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">4. Acesso ao caso</h2>
              <p>
                O acesso ao caso é feito por <span className="font-medium">ID do caso + código de acesso</span>.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>O código é exibido uma única vez no momento do salvamento</li>
                <li>O usuário é responsável por guardar o código</li>
                <li>Por segurança, o código não pode ser recuperado se perdido</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">5. Conteúdo enviado</h2>
              <p className="text-muted-foreground">
                O usuário é responsável pelo conteúdo e pelas evidências que envia. A plataforma se reserva o direito de
                remover conteúdos que violem estes Termos ou que representem abuso do sistema.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">6. Uso público e anonimização (opt-in)</h2>
              <p className="text-muted-foreground">
                Caso o usuário consinta, o registro poderá ser utilizado de forma anonimizada para fins estatísticos,
                jornalísticos ou institucionais. Esse compartilhamento é opcional e depende de consentimento explícito.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">7. Disponibilidade e mudanças</h2>
              <p className="text-muted-foreground">
                O GrokReport é um MVP. Funcionalidades podem ser alteradas, descontinuadas ou evoluídas a qualquer
                momento, buscando preservar segurança e privacidade.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">8. Contato</h2>
              <p>
                Dúvidas, solicitações ou comunicações devem ser feitas pelo e-mail:{" "}
                <span className="font-medium">contatogrokreport@gmail.com</span>.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">9. Lei aplicável e foro</h2>
              <p className="text-muted-foreground">
                Aplica-se a legislação da República Federativa do Brasil. Fica eleito o foro do Brasil, conforme a
                legislação aplicável, para dirimir eventuais controvérsias.
              </p>
            </section>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild>
                <Link href="/cases/new">Criar denúncia</Link>
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/privacy">Ver Política de Privacidade</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
