import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const workflowUrl = new URL('../.github/workflows/image.yaml', import.meta.url)

test('main image builds dispatch an immutable production release through Namche infra', async () => {
  const workflow = await readFile(workflowUrl, 'utf8')

  assert.match(workflow, /id: build/)
  assert.match(workflow, /digest: \$\{\{ steps\.build\.outputs\.digest \}\}/)
  assert.match(workflow, /needs: image/)
  assert.match(
    workflow,
    /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/,
  )
  assert.match(workflow, /environment: production/)
  assert.match(workflow, /GH_TOKEN: \$\{\{ secrets\.INFRA_DISPATCH_TOKEN \}\}/)
  assert.match(workflow, /\^sha256:\[0-9a-f\]\{64\}\$/)
  assert.match(
    workflow,
    /gh workflow run deploy-app\.yml -R NamcheAI\/infra --ref main/,
  )
  assert.match(workflow, /-f app=batlogg-site/)
  assert.match(workflow, /-f environment=production/)
  assert.match(workflow, /-f image="\$IMAGE@\$DIGEST"/)
})
