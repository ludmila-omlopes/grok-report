"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CasesEntryPage() {
  const router = useRouter()
  const [caseId, setCaseId] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const saveAndGo = async () => {
    if (!caseId.trim() || !token.trim()) {
      toast.error("Informe o ID do caso e o código de acesso.")
      return
    }

    setLoading(true)
    try {
      // Store token in sessionStorage (not URL)
      sessionStorage.setItem(`case:${caseId.trim()}:token`, token.trim())
      router.push(`/cases/${caseId.trim()}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Acessar um caso</CardTitle>
            <CardDescription>
              Insira o ID do caso e o código de acesso que você salvou. Não usamos contas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ID do caso</Label>
              <Input value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="ex.: 2bf28a28-..." />
            </div>

            <div className="space-y-2">
              <Label>Código de acesso</Label>
              <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ex.: 64 caracteres hex" />
            </div>

            <Button onClick={saveAndGo} disabled={loading}>
              {loading ? "Abrindo..." : "Abrir caso"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
