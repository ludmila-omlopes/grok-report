import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer id="privacidade" className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6" />
              <span className="text-lg font-bold">GrokReport</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              Sistema profissional para vítimas de deepfake organizarem evidências e denunciarem abuso de imagem.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#como-funciona"
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <a
                  href="#recursos"
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Documentação
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Política de privacidade
                </a>
              </li>
              <li>
                <a href="/terms" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Termos de uso
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#faq"
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/70">
          <p>© 2025 GrokReport. Todos os direitos reservados.</p>
          <p className="font-mono">Sistema v1.0.0</p>
        </div>
      </div>
    </footer>
  )
}
