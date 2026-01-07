import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Política de Privacidade | GrokReport",
  description: "Política de Privacidade do GrokReport (LGPD).",
}

const LAST_UPDATED = "08/01/2026" // ajuste quando publicar

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
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
              <h2 className="text-base font-semibold">1. Quem somos (Controladora) e contato</h2>
              <p>
                O GrokReport é uma plataforma independente criada para registrar e organizar casos de uso indevido de
                inteligência artificial (incluindo o Grok) na manipulação de imagens de pessoas, com o objetivo de apoiar
                documentação, denúncias coletivas e iniciativas de interesse público.
              </p>
              <p className="text-muted-foreground">
                A controladora dos dados pessoais tratados na plataforma é:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>
                  <span className="text-foreground font-medium">Nome:</span> Ludmila Lopes
                </li>
                <li>
                  <span className="text-foreground font-medium">Contato:</span> contatogrokreport@gmail.com
                </li>
                <li>
                  <span className="text-foreground font-medium">Localização:</span> Brasil
                </li>
              </ul>
              <p>
                O código-fonte do GrokReport é disponibilizado como open-source. A infraestrutura de produção, incluindo
                banco de dados e armazenamento de arquivos, não é pública e é operada de forma privada para garantir
                segurança, privacidade e conformidade com a LGPD.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">2. Quais dados coletamos</h2>

              <div className="space-y-2">
                <h3 className="font-medium">a) Dados do caso</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>URL do post no X</li>
                  <li>Perfis envolvidos (@ informados)</li>
                  <li>Descrição e observações fornecidas pelo usuário</li>
                  <li>Classificações informadas (ex.: suspeita de nudez/sexualização; suspeita de menor)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">b) Evidências anexadas</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Arquivos enviados pelo usuário, como capturas de tela (prints)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">c) Dados operacionais</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Data e hora de criação e atualização do caso</li>
                  <li>Registros técnicos mínimos necessários para funcionamento e segurança da plataforma</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">d) Código de acesso</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Um código único de acesso, exibido no momento do salvamento do caso, utilizado para permitir acesso e edição posteriores</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">3. Finalidades do tratamento</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Criar e manter o registro do caso e suas evidências</li>
                <li>Permitir acesso e edição do caso mediante ID do caso + código de acesso</li>
                <li>Garantir funcionamento, estabilidade e segurança da plataforma</li>
                <li>Prevenir abusos e uso indevido do sistema</li>
              </ul>
              <p>
                Quando houver consentimento expresso do usuário, os dados do caso poderão ser utilizados de forma
                anonimizada para estatísticas agregadas, relatórios de interesse público e apoio a iniciativas
                jornalísticas, institucionais e de advocacy relacionadas ao uso indevido de IA.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">4. Bases legais (LGPD)</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Execução de procedimentos a pedido do titular, para criar e manter o caso solicitado</li>
                <li>Consentimento, quando o usuário opta por permitir uso público/estatístico do caso</li>
                <li>Legítimo interesse, estritamente para segurança, prevenção a abusos e melhoria da plataforma, respeitando os direitos do titular</li>
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">5. Compartilhamento de dados</h2>
              <p>O GrokReport não vende dados pessoais.</p>
              <p className="text-muted-foreground">
                Os dados podem ser compartilhados apenas com fornecedores de infraestrutura tecnológica, exclusivamente
                para operação da plataforma e sob dever de confidencialidade, ou mediante ordem legal ou judicial, quando
                aplicável.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">6. Retenção e exclusão</h2>
              <p>
                Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta Política.
              </p>
              <p className="text-muted-foreground">
                O GrokReport é um MVP, e funcionalidades automáticas de exclusão ainda estão em evolução. Solicitações de
                exclusão podem ser feitas pelo e-mail: contatogrokreport@gmail.com.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">7. Direitos do titular</h2>
              <p className="text-muted-foreground">
                Nos termos da LGPD, o titular pode solicitar, entre outros direitos: confirmação da existência de
                tratamento, acesso, correção de dados incompletos ou desatualizados, anonimização, bloqueio ou eliminação
                quando cabível, e informações sobre compartilhamento.
              </p>
              <p>
                As solicitações devem ser feitas pelo e-mail: <span className="font-medium">contatogrokreport@gmail.com</span>.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">8. Segurança</h2>
              <p className="text-muted-foreground">
                São adotadas medidas técnicas e administrativas razoáveis para proteger os dados contra acessos não
                autorizados, perdas e incidentes. Ainda assim, nenhum sistema é completamente livre de riscos.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">9. Crianças e adolescentes</h2>
              <p className="text-muted-foreground">
                Em casos que envolvam suspeita de menor de idade ou exploração infantil, recomenda-se denúncia imediata
                aos canais oficiais competentes, como SaferNet e autoridades. O GrokReport não substitui canais oficiais
                de denúncia.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-base font-semibold">10. Alterações desta Política</h2>
              <p className="text-muted-foreground">
                Esta Política pode ser atualizada a qualquer momento. A versão vigente estará sempre disponível nesta página.
              </p>
            </section>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild>
                <Link href="/cases/new">Criar denúncia</Link>
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/terms">Ver Termos de Uso</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
