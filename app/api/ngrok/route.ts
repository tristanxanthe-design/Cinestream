import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

let ngrokProcess: ReturnType<typeof spawn> | null = null

export async function POST() {
  // Kill existing ngrok process if any
  if (ngrokProcess) {
    ngrokProcess.kill()
    ngrokProcess = null
  }

  return new Promise<NextResponse>((resolve) => {
    const proc = spawn('ngrok', ['http', '3000'], { shell: true })
    ngrokProcess = proc

    let resolved = false
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(NextResponse.json({ error: 'ngrok timed out. Make sure ngrok is installed and authenticated.' }, { status: 500 }))
      }
    }, 10000)

    proc.stdout?.on('data', async (data: Buffer) => {
      const text = data.toString()
      // Try to get the public URL from ngrok's local API
      if (!resolved) {
        try {
          const res = await fetch('http://localhost:4040/api/tunnels')
          const json = await res.json()
          const tunnel = json.tunnels?.find((t: any) => t.proto === 'https')
          if (tunnel?.public_url) {
            resolved = true
            clearTimeout(timeout)
            resolve(NextResponse.json({ url: tunnel.public_url }))
          }
        } catch {
          // ngrok API not ready yet, wait for more output
        }
      }
    })

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve(NextResponse.json({ error: `Failed to start ngrok: ${err.message}` }, { status: 500 }))
      }
    })

    // Poll ngrok's local API
    let attempts = 0
    const poll = setInterval(async () => {
      if (resolved) { clearInterval(poll); return }
      attempts++
      if (attempts > 20) { clearInterval(poll); return }
      try {
        const res = await fetch('http://localhost:4040/api/tunnels')
        const json = await res.json()
        const tunnel = json.tunnels?.find((t: any) => t.proto === 'https')
        if (tunnel?.public_url) {
          resolved = true
          clearTimeout(timeout)
          clearInterval(poll)
          resolve(NextResponse.json({ url: tunnel.public_url }))
        }
      } catch {
        // not ready yet
      }
    }, 500)
  })
}
