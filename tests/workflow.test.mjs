import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const workflowUrl = new URL('../.github/workflows/image.yaml', import.meta.url)

test('publish the public main image without host deployment authority', async () => {
  const workflow = await readFile(workflowUrl, 'utf8')

  assert.match(workflow, /images: ghcr\.io\/jodok\/batlogg\.com/)
  assert.match(workflow, /type=raw,value=latest,enable=\{\{is_default_branch\}\}/)
  assert.match(workflow, /type=sha/)
  assert.match(workflow, /type=semver,pattern=\{\{version\}\}/)
  assert.match(workflow, /push: \$\{\{ github\.event_name != 'pull_request' \}\}/)
  assert.match(workflow, /password: \$\{\{ secrets\.GITHUB_TOKEN \}\}/)
  assert.doesNotMatch(workflow, /NAMCHE_DEPLOY|INFRA_DISPATCH|create-github-app-token/)
  assert.doesNotMatch(workflow, /tailscale|1password|\bssh\b|gh api|deployments: write/i)
  assert.doesNotMatch(workflow, /^  deploy:/m)
})
