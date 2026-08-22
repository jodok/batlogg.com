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
  assert.match(workflow, /actions\/create-github-app-token@[0-9a-f]{40}/)
  assert.match(
    workflow,
    /client-id: \$\{\{ vars\.NAMCHE_DEPLOY_APP_CLIENT_ID \}\}/,
  )
  assert.match(
    workflow,
    /private-key: \$\{\{ secrets\.NAMCHE_DEPLOY_APP_PRIVATE_KEY \}\}/,
  )
  assert.match(workflow, /owner: NamcheAI/)
  assert.match(workflow, /repositories: infra/)
  assert.match(workflow, /permission-deployments: write/)
  assert.doesNotMatch(workflow, /permission-actions: write/)
  assert.match(workflow, /GH_TOKEN: \$\{\{ steps\.deploy-token\.outputs\.token \}\}/)
  assert.doesNotMatch(workflow, /INFRA_DISPATCH_TOKEN/)
  assert.match(workflow, /\^sha256:\[0-9a-f\]\{64\}\$/)
  assert.match(
    workflow,
    /gh api --method POST repos\/NamcheAI\/infra\/deployments --input -/,
  )
  assert.match(workflow, /task: "deploy-batlogg-site"/)
  assert.match(workflow, /environment: "batlogg-production"/)
  assert.match(workflow, /payload: \{image: \$image\}/)
})
