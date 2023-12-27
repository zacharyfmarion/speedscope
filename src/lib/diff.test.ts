import {join} from 'path'
import {importTraceEvents} from '../import/trace-event'
import {readFileSync} from 'fs'
import {getProfileDiff} from './diff'

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

  return getProfileDiff(beforeProfile, afterProfile)
}

describe('diff', () => {
  it('creates the proper diff for insert events', async () => {
    const diff = await getDiff('insert')
    console.log(diff)
  })
})
