"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"


type CaseDTO = {
  id: string
  victimType: string
  victimHandle: string | null
  infractorHandle: string | null
  postUrl: string | null
  notes: string | null
  involvesNudityOrSexualization: "yes" | "no" | "unknown"
  suspectedMinor: "yes" | "no" | "unknown"
  publicOptIn: boolean
  createdAt?: string
  updatedAt?: string
}

type EvidenceDTO = {
  id: string
  createdAt?: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  sha256: string
}

export default function CasePage() {
    const router = useRouter()
    const params = useParams<{ caseId: string }>()
    const caseId = (params?.caseId ?? "").trim()

    if (!caseId) {
        return (
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10 max-w-xl">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        )
      }
      
  const storageKey = useMemo(() => `case:${caseId}:token`, [caseId])
  const [token, setToken] = useState("")
  const [tokenReady, setTokenReady] = useState(false)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [caseData, setCaseData] = useState<CaseDTO | null>(null)
  const [evidence, setEvidence] = useState<EvidenceDTO[]>([])

  // Local edit state
  const [victimHandle, setVictimHandle] = useState("")
  const [infractorHandle, setInfractorHandle] = useState("")
  const [postUrl, setPostUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [nudity, setNudity] = useState<"yes" | "no" | "unknown">("unknown")
  const [minor, setMinor] = useState<"yes" | "no" | "unknown">("unknown")

  useEffect(() => {
    const existing = sessionStorage.getItem(storageKey)
    if (existing) {
      setToken(existing)
      setTokenReady(true)
    }
  }, [storageKey])

  const load = async (t: string) => {
    setLoading(true)
    try {
        console.log("access token", t)
      const res = await fetch(`/api/cases/${caseId}`, {
        headers: { "x-case-token": t },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Falha ao carregar caso")

      setCaseData(json.case)
      setEvidence(json.evidence || [])

      // prime edit fields
      setVictimHandle(json.case.victimHandle ?? "")
      setInfractorHandle(json.case.infractorHandle ?? "")
      setPostUrl(json.case.postUrl ?? "")
      setNotes(json.case.notes ?? "")
      setNudity(json.case.involvesNudityOrSexualization)
      setMinor(json.case.suspectedMinor)
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tokenReady && token) load(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenReady])

  const saveEdits = async () => {
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-case-token": token,
        },
        body: JSON.stringify({
          victimHandle: victimHandle || null,
          infractorHandle: infractorHandle || null,
          postUrl: postUrl || null,
          notes,
          involvesNudityOrSexualization: nudity,
          suspectedMinor: minor,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Falha ao salvar")

      toast.success("Caso atualizado")
      await load(token)
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const uploadMoreEvidence = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!token) return

    for (const file of Array.from(files)) {
      try {
        const form = new FormData()
        form.append("file", file)

        const res = await fetch(`/api/cases/${caseId}/evidence`, {
          method: "POST",
          headers: { "x-case-token": token },
          body: form,
        })

        const text = await res.text()
        let json: any = null
        try { json = JSON.parse(text) } catch {}

        if (!res.ok) throw new Error(json?.error || text.slice(0, 250) || "Falha no upload")

        toast.success(`Evidência enviada: ${file.name}`)
      } catch (e: any) {
        toast.error(e?.message ?? `Falha ao enviar ${file.name}`)
        return
      }
    }

    await load(token)
  }

  const downloadEvidence = async (evidenceId: string, filename: string) => {
    if (!token) return
    const res = await fetch(`/api/cases/${caseId}/evidence/${evidenceId}?download=1`, {
      headers: { "x-case-token": token },
    })
    if (!res.ok) {
      const t = await res.text()
      toast.error(t.slice(0, 200) || "Falha ao baixar")
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || "evidence"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Token gate UI
  if (!tokenReady) return null

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Informe o código de acesso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>Código de acesso</Label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const t = token.trim()
                    if (!t) return toast.error("Informe o código")
                    sessionStorage.setItem(storageKey, t)
                    setToken(t)
                    load(t)
                  }}
                >
                  Abrir
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={() => router.push("/")}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>ID do caso</Label>
              <Input readOnly value={caseId} />
            </div>

            {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

            {caseData && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>@ da vítima</Label>
                    <Input value={victimHandle} onChange={(e) => setVictimHandle(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>@ do infrator</Label>
                    <Input value={infractorHandle} onChange={(e) => setInfractorHandle(e.target.value)} />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>URL do post</Label>
                    <Input value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Nudez/sexualização</Label>
                    <Select value={nudity} onValueChange={(v: any) => setNudity(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                        <SelectItem value="unknown">Não sei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Suspeita de menor</Label>
                    <Select value={minor} onValueChange={(v: any) => setMinor(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                        <SelectItem value="unknown">Não sei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[120px]" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveEdits} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => {
                      sessionStorage.removeItem(storageKey)
                      setToken("")
                      toast.success("Token removido desta sessão")
                    }}
                  >
                    Sair do caso
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => document.getElementById("evidence-upload")?.click()}
              >
                Enviar novas evidências
              </Button>
              <input
                id="evidence-upload"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                multiple
                className="hidden"
                onChange={(e) => uploadMoreEvidence(e.target.files)}
              />
            </div>

            {evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma evidência registrada.</p>
            ) : (
              <div className="space-y-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between border border-border p-3 bg-muted/30">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ev.originalFilename}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(ev.sizeBytes / 1024)} KB • {ev.mimeType}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => downloadEvidence(ev.id, ev.originalFilename)}
                    >
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
