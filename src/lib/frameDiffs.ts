import {Frame, Profile} from './profile'

function getFrameDifference(beforeFrame: Frame | undefined, afterFrame: Frame | undefined) {
  // Don't show difference in root time
  if (beforeFrame?.name === '[root]') {
    return {
      selfWeightDiff: 0,
      totalWeightDiff: 0,
      selfWeightPercentIncrease: 0,
      totalWeightPercentIncrease: 0,
    }
  }

  const beforeTotalWeight = beforeFrame?.getTotalWeight() || 0
  const beforeSelfWeight = beforeFrame?.getSelfWeight() || 0

  const afterTotalWeight = afterFrame?.getTotalWeight() || 0
  const afterSelfWeight = afterFrame?.getSelfWeight() || 0

  const selfWeightDiff = afterSelfWeight - beforeSelfWeight
  const totalWeightDiff = afterTotalWeight - beforeTotalWeight

  // Calculate percentage increases, handling division by zero
  const selfWeightPercentIncrease = beforeSelfWeight !== 0 ? selfWeightDiff / beforeSelfWeight : 0
  const totalWeightPercentIncrease =
    beforeTotalWeight !== 0 ? totalWeightDiff / beforeTotalWeight : 0

  return {
    selfWeightDiff,
    totalWeightDiff,
    selfWeightPercentIncrease,
    totalWeightPercentIncrease,
  }
}

export type FrameDiff = {
  beforeFrame: Frame | undefined
  afterFrame: Frame | undefined
  selfWeightDiff: number
  selfWeightPercentIncrease: number
  totalWeightDiff: number
  totalWeightPercentIncrease: number
}

export function getFrameFromFrameDiff({beforeFrame, afterFrame}: FrameDiff): Frame {
  const frame = beforeFrame ?? afterFrame
  if (!frame) {
    throw new Error('before or after frame must be present')
  }

  return frame
}

// TODO: Memoize
export function getFrameDiffs(beforeProfile: Profile, afterProfile: Profile): FrameDiff[] {
  const afterKeyMap = afterProfile.getKeyToFrameMap()
  const afterNameMap = afterProfile.getNameToFrameMap()

  const frameDiffs: FrameDiff[] = []

  /**
   * Find the frame in the after profile we think most likely matches the frame
   * in the before profile, first by key, and then by name if we don't have a key
   * match. For now we just ignore functions where we don't have a name
   */
  function getMatchingFrame(frame: Frame) {
    const afterFrame = afterKeyMap.get(frame.key)

    if (afterFrame) return afterFrame

    // If we don't have a key match and it is an anonymous function, we just
    // return for now, since we don't have a good way of matching the frames.
    // In the future we could use the string similarities between keys or some
    // heuristic like that
    if (['anonymous', '(unnamed)'].includes(frame.name)) {
      return
    }

    const framesByName = afterNameMap.get(frame.name) || []

    return framesByName[0]
  }

  const visitedAfterFrameKeys = new Set<string | number>()

  beforeProfile.forEachFrame(beforeFrame => {
    // Attempt to find the frame that matches in the after profile
    const afterFrame = getMatchingFrame(beforeFrame)

    if (afterFrame) {
      visitedAfterFrameKeys.add(afterFrame.key)
    }

    const {selfWeightDiff, totalWeightDiff, selfWeightPercentIncrease, totalWeightPercentIncrease} =
      getFrameDifference(beforeFrame, afterFrame)

    frameDiffs.push({
      beforeFrame,
      afterFrame,
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease,
    })
  })

  // Also include the afterProfile frames that were not present in the beforeProfile
  // TODO: Can probably clean this logic up a bit
  afterProfile.forEachFrame(afterFrame => {
    if (visitedAfterFrameKeys.has(afterFrame.key)) return

    console.log(afterFrame)

    const {selfWeightDiff, totalWeightDiff, selfWeightPercentIncrease, totalWeightPercentIncrease} =
      getFrameDifference(undefined, afterFrame)

    frameDiffs.push({
      beforeFrame: undefined,
      afterFrame,
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease,
    })
  })

  return frameDiffs
}
