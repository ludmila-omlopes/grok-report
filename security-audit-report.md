# Relatório de Auditoria de Segurança - Projeto GrokReport

**Data da Auditoria:** 07 de janeiro de 2026  
**Auditor:** Senior Software Engineer  
**Projeto:** grok-report (GitHub: https://github.com/ludmila-omlopes/grok-report)

## Resumo Executivo

Este relatório apresenta uma análise sistemática de segurança do projeto GrokReport, uma plataforma para reportar abuso no uso da IA Grok, especificamente manipulação indevida de imagens. A auditoria identificou vulnerabilidades críticas relacionadas à exposição de dados sensíveis e moderadas em controles de acesso.

## Metodologia

A auditoria foi realizada através de análise de código, configuração e dependências, abrangendo:

- Autenticação e autorização
- Validação de entrada
- Consultas de banco de dados
- Upload e armazenamento de arquivos
- Criptografia de dados
- Controle de taxa (rate limiting)
- Vulnerabilidades em dependências
- Configurações de segurança

## Vulnerabilidades Identificadas

### 1. Exposição de Arquivos de Evidência (CRÍTICO)
- **Severidade:** Crítica
- **CVSS Score:** 9.1 (Alta)
- **Localização:** `app/api/cases/[caseId]/evidence/route.ts:66`
- **Descrição:** Arquivos de evidência são armazenados no Vercel Blob com acesso público, tornando-os acessíveis via URL direta.
- **Vetor de Ataque:** Qualquer pessoa com conhecimento da URL pode acessar evidências sensíveis.
- **Impacto:** Violação de privacidade, exposição de dados pessoais, potencial dano psicológico às vítimas.
- **Evidência:**
  ```typescript
  const blob = await put(storageKey, buffer, {
    access: "public",  // <- Problema crítico
    contentType: file.type,
    addRandomSuffix: false,
  });
  ```
- **Recomendação:** Alterar para `access: "private"` e implementar endpoint seguro para download controlado.

### 2. Ausência de Rate Limiting (ALTO)
- **Severidade:** Alta
- **CVSS Score:** 7.5 (Alta)
- **Localização:** Todas as rotas API (`/api/cases/*`)
- **Descrição:** Não há limitação na taxa de requisições para APIs.
- **Vetor de Ataque:** Ataques de força bruta contra tokens, uploads massivos, enumeração de casos.
- **Impacto:** Sobrecarga do sistema, exposição de dados via tentativa e erro.
- **Recomendação:** Implementar middleware de rate limiting (ex: `express-rate-limit`).

### 3. Ausência de Content Security Policy (CSP) (MODERADO)
- **Severidade:** Moderada
- **CVSS Score:** 6.1 (Média)
- **Localização:** `next.config.ts`, `app/layout.tsx`
- **Descrição:** Não há política de segurança de conteúdo configurada.
- **Vetor de Ataque:** Injeção de scripts maliciosos se vulnerabilidades XSS forem introduzidas.
- **Impacto:** Execução de código arbitrário no navegador do usuário.
- **Recomendação:** Configurar CSP headers no Next.js config.

### 4. Validação Insuficiente de Tokens de Acesso (MODERADO)
- **Severidade:** Moderada
- **CVSS Score:** 5.3 (Média)
- **Localização:** `lib/case-auth.ts:30`
- **Descrição:** Verificação de comprimento mínimo de 20 caracteres para tokens de 64 caracteres hexadecimais.
- **Vetor de Ataque:** Tokens mais curtos são mais suscetíveis a adivinhação.
- **Impacto:** Redução da entropia de segurança.
- **Evidência:**
  ```typescript
  if (!rawToken || rawToken.length < 20) {  // <- Muito permissivo
    return { ok: false as const, error: "Missing or invalid token" };
  }
  ```
- **Recomendação:** Exigir comprimento exato de 64 caracteres.

### 5. Vulnerabilidades em Dependências de Desenvolvimento (MODERADO)
- **Severidade:** Moderada
- **CVSS Score:** 4.2 (Média)
- **Localização:** `package.json` (esbuild via drizzle-kit)
- **Descrição:** 4 vulnerabilidades moderadas no esbuild, afetando apenas desenvolvimento.
- **Vetor de Ataque:** Ataques ao servidor de desenvolvimento via requisições arbitrárias.
- **Impacto:** Limitado ao ambiente de desenvolvimento.
- **Evidência:** Resultado do `npm audit`:
  ```
  esbuild  <=0.24.2
  Severity: moderate
  esbuild enables any website to send any requests to the development server and read the response
  ```
- **Recomendação:** Atualizar drizzle-kit ou migrar para alternativa.

## Vulnerabilidades de Baixa Severidade

### 6. Ausência de Proteção CSRF
- **Severidade:** Baixa
- **CVSS Score:** 3.1 (Baixa)
- **Localização:** APIs usam headers customizados
- **Descrição:** Não há tokens CSRF implementados.
- **Impacto:** Mínimo, pois não usa cookies para autenticação.
- **Recomendação:** Monitorar se necessário no futuro.

### 7. Logs de Auditoria Incompletos
- **Severidade:** Baixa
- **CVSS Score:** 2.6 (Baixa)
- **Localização:** `db/schema.ts` (tabela audit_log)
- **Descrição:** User-agent é armazenado, mas IP não (apenas hash opcional).
- **Impacto:** Possível identificação via fingerprinting.
- **Recomendação:** Minimizar coleta de dados ou melhorar anonimização.

### 8. Validação Superficial de Tipo de Arquivo
- **Severidade:** Baixa
- **CVSS Score:** 2.4 (Baixa)
- **Localização:** `app/api/cases/[caseId]/evidence/route.ts:39`
- **Descrição:** Validação baseada apenas no MIME type declarado pelo cliente.
- **Impacto:** Arquivos maliciosos podem ser disfarçados como imagens.
- **Recomendação:** Implementar verificação de magic bytes.

## Pontos Positivos de Segurança

### Autenticação Robusta
- Uso de PBKDF2/SHA256 para hashing de tokens
- Comparação timing-safe para prevenir ataques de temporização
- Validação rigorosa de formato UUID
- Tokens de acesso únicos por caso

### Validação de Entrada
- Lista de permissões para campos atualizáveis
- Sanitização de nomes de arquivo
- Validação de tamanho de arquivo (15MB máximo)
- Restrição de tipos MIME para imagens

### Proteção contra Injeção
- Uso de Drizzle ORM com queries parametrizadas
- Ausência de execução dinâmica de código
- Não há uso de `eval()` ou `dangerouslySetInnerHTML`

### Criptografia Adequada
- SHA256 para integridade de arquivos
- Geração segura de tokens usando `crypto.randomBytes()`

### Conformidade com LGPD
- Requerimento explícito de consentimento
- Minimização de dados coletados
- Transparência sobre finalidades do tratamento

## Plano de Correção Priorizado

### Prioridade Crítica (Implementar Imediatamente)
1. **Correção da Exposição de Arquivos**
   - Alterar Vercel Blob para acesso privado
   - Criar endpoint `/api/evidence/[id]/download` com autenticação
   - Migrar arquivos existentes se necessário

### Prioridade Alta (Próximas 2 semanas)
2. **Implementar Rate Limiting**
   - Adicionar middleware em todas as rotas API
   - Configurar limites apropriados (ex: 100 req/hora por IP)
   - Implementar backoff exponencial para tentativas falhidas

### Prioridade Média (Próximo mês)
3. **Configurar CSP**
   - Definir política de segurança de conteúdo
   - Testar impacto em funcionalidades existentes
4. **Atualizar Dependências**
   - Resolver vulnerabilidades no esbuild
   - Atualizar outras dependências desatualizadas

### Prioridade Baixa (Backlog)
5. **Refinamentos de Segurança**
   - Melhorar validação de tokens
   - Implementar verificação de magic bytes
   - Otimizar logs de auditoria

## Conclusão

O projeto GrokReport demonstra uma abordagem responsável à segurança, com implementações sólidas em autenticação, validação de entrada e conformidade regulatória. No entanto, a exposição pública dos arquivos de evidência representa um risco crítico que deve ser corrigido urgentemente para proteger a privacidade dos usuários.

A arquitetura geral é segura, mas requer atenção imediata aos controles de acesso a arquivos e implementação de proteções básicas contra abuso.

## Referências

- OWASP Top 10 2021
- NIST Cybersecurity Framework
- LGPD (Lei Geral de Proteção de Dados - Brasil)
- Próprias diretrizes de segurança do Next.js