import {join} from 'path'
import {importTraceEvents} from '../import/trace-event'
import {readFileSync} from 'fs'
import {DiffOperation, getProfileDiff} from './diff'
import {CallTreeNode} from './profile'

async function getProfileFromSamples(path: string) {
  const fullPath = join(__dirname, '../../sample/profiles/diff', path)
  const json = JSON.parse(readFileSync(fullPath, 'utf8'))

  const profileGroup = await importTraceEvents(json)
  return profileGroup.profiles[0]
}

async function getDiff(operation: string) {
  const [beforeProfile, afterProfile] = await Promise.all([
    getProfileFromSamples(`${operation}/before.json`),
    getProfileFromSamples(`${operation}/after.json`),
  ])

  const diff = getProfileDiff(beforeProfile, afterProfile)

  return {diff, beforeProfile, afterProfile}
}

function findNodeByKey(root: CallTreeNode, key: string): CallTreeNode | null {
  if (root.key() === key) {
    return root
  }

  for (const child of root.children) {
    const found = findNodeByKey(child, key)
    if (found) {
      return found
    }
  }

  return null
}

describe('diff', () => {
  it('creates the proper diff for a delete event', async () => {
    const {diff, beforeProfile} = await getDiff('delete')
    const callTreeRoot = beforeProfile.getAppendOrderCalltreeRoot()

    const rootNode = findNodeByKey(callTreeRoot, 'root')
    const deletedNode = findNodeByKey(callTreeRoot, 'beta')

    expect(diff).toEqual([
      {
        type: DiffOperation.DELETE,
        node: deletedNode,
        parent: rootNode,
      },
    ])
  })

  it('creates the proper diff for a insert event', async () => {
    const {diff, beforeProfile, afterProfile} = await getDiff('insert')
    const callTreeRoot = beforeProfile.getAppendOrderCalltreeRoot()
    const afterRoot = afterProfile.getAppendOrderCalltreeRoot()

    const rootNode = findNodeByKey(callTreeRoot, 'root')
    const insertedNode = findNodeByKey(afterRoot, 'beta')

    expect(diff).toEqual([
      {
        type: DiffOperation.INSERT,
        node: insertedNode,
        parent: rootNode,
      },
    ])
  })
})
