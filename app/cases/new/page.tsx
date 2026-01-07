"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, Upload, FileIcon, Info, ExternalLink, FileText, Package, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"


// Schema de validação
const formSchema = z.object({
  reporterType: z.enum(["victim", "third-party"], {
    message: "Selecione quem está reportando",
  }),
  victimHandle: z.string().min(2, "Username da vítima é obrigatório").regex(/^@/, "Deve começar com @"),
  postUrl: z.string().url("URL inválida").includes("x.com", { message: "Deve ser uma URL do X (Twitter)" }),
  infractorHandle: z.string().min(2, "Username do infrator é obrigatório").regex(/^@/, "Deve começar com @"),
  observations: z.string().optional(),
  hasNudity: z.enum(["yes", "no", "unknown"]),
  hasMinor: z.enum(["yes", "no", "unknown"]),
  publicDataConsent: z.boolean().optional(),
})

type CaseFormData = z.infer<typeof formSchema>

type Attachment = {
  id: string
  file: File
  name: string
  size: string
  status: "ready" | "uploading" | "uploaded" | "failed"
  evidenceId?: string
  sha256?: string
  error?: string
}


export default function NewCasePage() {
  console.log("[v0] NewCasePage rendering")

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [userConsent, setUserConsent] = useState<"pending" | "yes" | "no">("pending")
  const [xReportDialogOpen, setXReportDialogOpen] = useState(false)
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [protocols, setProtocols] = useState([])
  const [createdCase, setCreatedCase] = useState<{ caseId: string; accessToken: string } | null>(null)
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false)
  const router = useRouter()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterType: "victim",
      victimHandle: "@",
      postUrl: "",
      infractorHandle: "@",
      observations: "",
      hasNudity: "unknown",
      hasMinor: "unknown",
      publicDataConsent: false,
    },
  })

  const hasMinorValue = watch("hasMinor")
  const hasNudityValue = watch("hasNudity")
  const publicDataConsent = watch("publicDataConsent")
  const formValues = watch()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
  
    const newOnes: Attachment[] = Array.from(files).map((file) => {
      const sizeInKB = (file.size / 1024).toFixed(1)
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: `${sizeInKB} KB`,
        status: "ready",
      }
    })
  
    setAttachments((prev) => [...prev, ...newOnes])
    toast.success("Arquivo anexado com sucesso")
  
    // allow uploading same file again if needed
    event.target.value = ""
  }
  

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
    toast.success("Arquivo removido")
  }

  const uploadEvidence = async (caseId: string, accessToken: string, att: Attachment) => {
    const form = new FormData()
    form.append("file", att.file)
  
    const res = await fetch(`/api/cases/${caseId}/evidence`, {
      method: "POST",
      headers: {
        "x-case-token": accessToken,
      },
      body: form,
    })
  
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json?.error || "Falha ao enviar evidência")
    }
  
    return { evidenceId: json.evidenceId as string, sha256: json.sha256 as string }
  }
  

  const onSubmit = async (data: CaseFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      const payload = {
        victimType: data.reporterType === "victim" ? "self" : "third_party",
        victimHandle: data.victimHandle,
        infractorHandle: data.infractorHandle,
        postUrl: data.postUrl,
        notes: data.observations ?? null,
        involvesNudityOrSexualization: data.hasNudity,
        suspectedMinor: data.hasMinor,
        publicOptIn: !!data.publicDataConsent,
        consent: {
          accepted: true,
          version: "v1.0",
          scopes: {
            caseProcessing: true,
            anonymizedPublicUse: !!data.publicDataConsent,
          },
        },
      };
  
      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
  
      // attach files
      for (const att of attachments) {
        form.append("files", att.file);
      }
  
      // optimistic UI
      if (attachments.length > 0) {
        setAttachments((prev) => prev.map((a) => ({ ...a, status: "uploading", error: undefined })));
      }
  
      const res = await fetch("/api/cases/submit", {
        method: "POST",
        body: form,
      });
  
      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}
  
      if (!res.ok) {
        throw new Error(json?.error || text.slice(0, 250) || "Erro ao salvar caso");
      }
  
      setCreatedCase({ caseId: json.caseId, accessToken: json.accessToken });
      setTokenDialogOpen(true);
  
      // mark attachments as uploaded (since backend did it)
      if (attachments.length > 0) {
        setAttachments((prev) => prev.map((a) => ({ ...a, status: "uploaded" })));
      }
  
      toast.success("Caso salvo com sucesso");
    } catch (err: any) {
      // on failure, nothing was persisted in DB (by design)
      if (attachments.length > 0) {
        setAttachments((prev) => prev.map((a) => ({ ...a, status: "failed", error: err?.message })));
      }
      toast.error(err?.message ?? "Erro ao salvar caso");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const checklistItems = [
    { label: "URL informada", checked: !!formValues.postUrl },
    { label: "@ informado", checked: formValues.infractorHandle !== "@" && formValues.infractorHandle.length > 1 },
    { label: "Pelo menos 1 evidência anexada", checked: attachments.some((a) => a.status === "uploaded")},
    { label: "Denúncia no X iniciada", checked: userConsent !== "pending" },
    ...(hasMinorValue === "yes" ? [{ label: "SaferNet iniciada", checked: true }] : []),
    { label: "ANPD iniciada", checked: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">Criar caso</span>
        </nav>

        {/* Título */}
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-left">Criar caso</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Coluna esquerda - Formulário */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-left">Denúncias</CardTitle>
                  <CardDescription className="text-left">Primeiro, inicie as denúncias oficiais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="size-4" />
                    <AlertDescription className="text-sm">
                      Recomendamos iniciar as denúncias oficiais antes de preencher os detalhes do caso. Assim você já
                      terá os protocolos para documentar.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 justify-start bg-transparent"
                        onClick={() => window.open("https://help.x.com/forms/safety-and-sensitive-content", "_blank")}
                      >
                        <ExternalLink className="size-4" />
                        Abrir denúncia no X
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setXReportDialogOpen(true)}>
                        <Info className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">O caso envolve menor de idade?</p>
                    <p className="text-xs text-muted-foreground">
                      Se sim, denuncie também na SaferNet, especializada em crimes contra crianças e adolescentes.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => window.open("https://new.safernet.org.br/denuncie", "_blank")}
                    >
                      <ExternalLink className="size-4" />
                      Abrir SaferNet
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      O protocolo do X resolveu o problema e a imagem foi removida?
                    </p>
                    <p className="text-xs text-muted-foreground">Se não, continue com as denúncias abaixo.</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">ANPD - Autoridade Nacional de Proteção de Dados</p>
                      <p className="text-xs text-muted-foreground">
                        A ANPD é o órgão responsável por fiscalizar a Lei Geral de Proteção de Dados (LGPD). Você pode
                        registrar uma petição sobre uso indevido dos seus dados pessoais (sua imagem) por plataformas de
                        IA.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => window.open("https://www.gov.br/anpd/pt-br", "_blank")}
                    >
                      <ExternalLink className="size-4" />
                      Abrir petição LGPD/ANPD
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent">
                <CardHeader>
                  <CardTitle className="text-left">Registro no GrokReport</CardTitle>
                  <CardDescription className="text-left">
                    Ajude a combater o abuso de IA compartilhando seu caso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="size-4" />
                    <AlertDescription className="text-sm">
                      Você pode registrar seu caso no GrokReport para uso em processos coletivos, como fonte de dados
                      para jornalistas e políticos. Seu caso será completamente anonimizado e seus dados pessoais
                      protegidos.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-start gap-3 p-4 border border-border bg-muted/30">
                    <Checkbox
                      id="registrationConsent"
                      checked={userConsent === "yes"}
                      onCheckedChange={(checked) => {
                        setUserConsent(checked ? "yes" : "no")
                        setValue("publicDataConsent", checked === true)
                      }}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="registrationConsent" className="cursor-pointer font-medium">
                        Quero registrar meu caso no GrokReport para uso público
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ao aceitar, seu caso (anonimizado) poderá ser usado em: processos coletivos contra abuso de IA,
                        estatísticas públicas para jornalistas, relatórios para autoridades e legisladores. Seus dados
                        pessoais serão sempre protegidos.
                      </p>
                    </div>
                  </div>

                  {userConsent === "pending" && (
                    <Alert className="border-muted-foreground/20">
                      <AlertDescription className="text-sm">
                        Se preferir não compartilhar, você ainda pode usar as ferramentas de denúncia acima. O
                        formulário completo só ficará disponível se você aceitar o registro.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {userConsent === "yes" && (
                <>
                  {/* Card: Identificação do post */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-left">Identificação do post</CardTitle>
                      <CardDescription className="text-left">Informações sobre o conteúdo abusivo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reporterType">Você é a vítima ou está reportando por outra pessoa?</Label>
                        <Select
                          value={watch("reporterType")}
                          onValueChange={(value: "victim" | "third-party") => setValue("reporterType", value)}
                        >
                          <SelectTrigger id="reporterType">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="victim">Eu sou a vítima</SelectItem>
                            <SelectItem value="third-party">Estou reportando por outra pessoa</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.reporterType && (
                          <p className="text-sm text-destructive">{errors.reporterType.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="victimHandle">@ da vítima</Label>
                        <Input
                          id="victimHandle"
                          placeholder="@username"
                          {...register("victimHandle", {
                            onChange: (e) => {
                              let value = e.target.value
                              if (!value.startsWith("@") && value.length > 0) {
                                value = "@" + value
                              }
                              setValue("victimHandle", value)
                            },
                          })}
                        />
                        {errors.victimHandle && (
                          <p className="text-sm text-destructive">{errors.victimHandle.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postUrl">URL do post no X</Label>
                        <Input id="postUrl" placeholder="https://x.com/username/status/..." {...register("postUrl")} />
                        {errors.postUrl && <p className="text-sm text-destructive">{errors.postUrl.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="infractorHandle">@ do infrator</Label>
                        <Input
                          id="infractorHandle"
                          placeholder="@username"
                          {...register("infractorHandle", {
                            onChange: (e) => {
                              let value = e.target.value
                              if (!value.startsWith("@") && value.length > 0) {
                                value = "@" + value
                              }
                              setValue("infractorHandle", value)
                            },
                          })}
                        />
                        {errors.infractorHandle && (
                          <p className="text-sm text-destructive">{errors.infractorHandle.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observations">Observações (opcional)</Label>
                        <Textarea
                          id="observations"
                          placeholder="Ex.: imagem editada com nudez não consentida"
                          {...register("observations")}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hasNudity">Conteúdo envolve nudez/sexualização?</Label>
                        <Select
                          value={watch("hasNudity")}
                          onValueChange={(value: "yes" | "no" | "unknown") => setValue("hasNudity", value)}
                        >
                          <SelectTrigger id="hasNudity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Sim</SelectItem>
                            <SelectItem value="no">Não</SelectItem>
                            <SelectItem value="unknown">Não sei</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hasMinor">Há suspeita de menor?</Label>
                        <Select
                          value={watch("hasMinor")}
                          onValueChange={(value: "yes" | "no" | "unknown") => setValue("hasMinor", value)}
                        >
                          <SelectTrigger id="hasMinor">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Sim</SelectItem>
                            <SelectItem value="no">Não</SelectItem>
                            <SelectItem value="unknown">Não sei</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {hasMinorValue === "yes" && (
                        <Alert className="border-destructive bg-destructive/10">
                          <AlertTriangle className="size-4" />
                          <AlertDescription className="text-sm">
                            <strong>Atenção:</strong> Casos envolvendo menores têm prioridade máxima. Recomendamos
                            denúncia imediata às autoridades competentes e SaferNet.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label>Data/hora de registro (America/Sao_Paulo)</Label>
                        <Input value={new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} readOnly />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card: Anexos */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-left">Anexos</CardTitle>
                      <CardDescription className="text-left">Evidências visuais do abuso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-transparent cursor-pointer"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          <Upload className="size-4" />
                          Enviar screenshot/print
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Inclua o post completo com @, data/hora visível se possível.
                        </p>
                      </div>

                      {attachments.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 p-3 border border-border bg-muted/30"
                            >
                              <FileIcon className="size-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">{attachment.size}</p>
                                {attachment.error && (
                                    <p className="text-xs text-destructive mt-1">{attachment.error}</p>
                                  )}
                              </div>
                              <Badge
                                  variant={
                                    attachment.status === "uploaded"
                                      ? "default"
                                      : attachment.status === "failed"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {attachment.status === "ready" && "Pronto"}
                                  {attachment.status === "uploading" && "Enviando..."}
                                  {attachment.status === "uploaded" && "Enviado"}
                                  {attachment.status === "failed" && "Falhou"}
                                </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0"
                                onClick={() => handleRemoveAttachment(attachment.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setCaptureDialogOpen(true)}
                      >
                        <Info className="size-4" />
                        Dicas de captura
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Coluna direita - Painéis */}
            <div className="space-y-6 lg:sticky lg:top-8">
              {/* Status do caso */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-left text-lg">Status do caso</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-muted">
                    Em rascunho
                  </Badge>
                </CardContent>
              </Card>

              {userConsent === "yes" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-left text-lg">Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {checklistItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div
                            className={`size-5 border flex items-center justify-center mt-0.5 ${
                              item.checked ? "bg-accent border-accent" : "border-muted-foreground"
                            }`}
                          >
                            {item.checked && (
                              <svg
                                className="size-3 text-accent-foreground"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Exportação */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-left text-lg">Exportação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled>
                    <FileText className="size-4" />
                    Gerar PDF
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Em breve
                    </Badge>
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" disabled>
                    <Package className="size-4" />
                    Exportar ZIP
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Em breve
                    </Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Barra de ação inferior */}
          {userConsent === "yes" && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-start sticky bottom-0 bg-background py-4 border-t border-border">
              <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                {isSubmitting ? "Salvando..." : "Salvar caso"}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmitting} className="sm:w-auto bg-transparent">
                Salvar e gerar rascunho do dossiê
              </Button>
            </div>
          )}
        </form>

        <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
  <DialogContent className="max-w-xl" onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}>
    <DialogHeader>
      <DialogTitle>Código de acesso do caso</DialogTitle>
      <DialogDescription>
        Este código será exibido somente agora. Salve em um local seguro.
      </DialogDescription>
    </DialogHeader>

    {createdCase && (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>ID do caso</Label>
          <Input readOnly value={createdCase.caseId} />
        </div>

        <div className="space-y-2">
          <Label>Código de acesso</Label>
          <Input readOnly value={createdCase.accessToken} />
          <p className="text-xs text-muted-foreground">
            Sem este código, não será possível editar, anexar evidências ou exportar este caso.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `caseId: ${createdCase.caseId}\naccessToken: ${createdCase.accessToken}`
              )
              toast.success("Copiado para a área de transferência")
            }}
          >
            Copiar
          </Button>

          <Button
            type="button"
            variant="outline"
            className="bg-transparent"
            onClick={() => {
              setTokenDialogOpen(false)
              setSuccessDialogOpen(true)
            }}
            
          >
            Entendi
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

<Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
  <DialogContent
    className="max-w-md"
    onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    <DialogHeader>
      <DialogTitle>Caso salvo!</DialogTitle>
      <DialogDescription>
        Seu caso foi registrado com sucesso. Você será redirecionada para a página inicial.
      </DialogDescription>
    </DialogHeader>

    <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-4">
      <CheckCircle2 className="size-5 mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium">Tudo certo.</p>
        <p className="text-xs text-muted-foreground">
          Se você salvou o código de acesso, pode fechar esta janela para continuar.
        </p>
      </div>
    </div>

    <div className="flex justify-end">
      <Button
        type="button"
        onClick={() => {
          setSuccessDialogOpen(false)
          router.push("/")
          router.refresh()
        }}
      >
        Ir para o início
      </Button>
    </div>
  </DialogContent>
</Dialog>

        {/* Dialog: Instruções de denúncia no X */}
        <Dialog open={xReportDialogOpen} onOpenChange={setXReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Como denunciar no X</DialogTitle>
              <DialogDescription>Instruções específicas por tipo de caso</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {hasNudityValue === "yes" && (
                <div className="border border-border p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Caso envolvendo nudez/sexualização:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Acesse o post abusivo</li>
                    <li>Clique nos três pontos (⋯) no canto superior direito do post</li>
                    <li>Selecione "Denunciar post"</li>
                    <li>Escolha "Conteúdo sensível" → "Nudez não consensual"</li>
                    <li>Siga as instruções e anexe evidências se solicitado</li>
                    <li>Anote o número do protocolo fornecido</li>
                  </ol>
                </div>
              )}

              {hasMinorValue === "yes" && (
                <div className="border border-destructive p-4 bg-destructive/10">
                  <h4 className="font-semibold mb-2 text-destructive">Caso envolvendo menor:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Acesse o post abusivo</li>
                    <li>Clique nos três pontos (⋯)</li>
                    <li>Selecione "Denunciar post"</li>
                    <li>Escolha "Exploração infantil"</li>
                    <li>
                      <strong>CRÍTICO:</strong> Este tipo de denúncia tem prioridade máxima
                    </li>
                    <li>O X pode remover o conteúdo em poucas horas</li>
                    <li>Também denuncie à SaferNet e autoridades locais</li>
                  </ol>
                </div>
              )}

              <div className="border border-border p-4 bg-muted/30">
                <h4 className="font-semibold mb-2">Caso geral de deepfake/manipulação:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse o post com a imagem manipulada</li>
                  <li>Clique nos três pontos (⋯)</li>
                  <li>Selecione "Denunciar post"</li>
                  <li>Escolha "Mídia sintética ou manipulada"</li>
                  <li>Especifique que é deepfake não autorizado</li>
                  <li>Mencione violação de privacidade/imagem</li>
                </ol>
              </div>

              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Faça screenshots de cada etapa do processo de denúncia. Isso serve como prova
                  de que você seguiu os procedimentos oficiais.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Dicas de captura */}
        <Dialog open={captureDialogOpen} onOpenChange={setCaptureDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dicas de captura de evidências</DialogTitle>
              <DialogDescription>Como coletar provas eficazes</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p>• Faça print de tela completo mostrando URL, @ e data/hora</p>
              <p>• Capture o contexto: replies, retweets, números de engajamento</p>
              <p>• Salve a URL original do post</p>
              <p>• Se possível, grave vídeo da tela navegando no perfil</p>
              <p>• Não edite as capturas (use ferramentas forenses se necessário)</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
