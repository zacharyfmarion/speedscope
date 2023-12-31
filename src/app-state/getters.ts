import {Frame, Profile} from '../lib/profile'
import {memoizeByReference, memoizeByShallowEquality} from '../lib/utils'
import {RowAtlas} from '../gl/row-atlas'
import {CanvasContext} from '../gl/canvas-context'
import {FlamechartRowAtlasKey} from '../gl/flamechart-renderer'
import {Theme} from '../views/themes/theme'

export const createGetColorBucketForFrame = memoizeByReference(
  (frameToColorBucket: Map<number | string, number>) => {
    return (frame: Frame): number => {
      return frameToColorBucket.get(frame.key) || 0
    }
  },
)

export const createGetCSSColorForFrame = memoizeByShallowEquality(
  ({
    theme,
    frameToColorBucket,
  }: {
    theme: Theme
    frameToColorBucket: Map<number | string, number>
  }) => {
    const getColorBucketForFrame = createGetColorBucketForFrame(frameToColorBucket)
    return (frame: Frame): string => {
      const t = getColorBucketForFrame(frame) / 255
      return theme.colorForBucket(t).toCSS()
    }
  },
)

export const getCanvasContext = memoizeByShallowEquality(
  ({theme, canvas}: {theme: Theme; canvas: HTMLCanvasElement}) => {
    return new CanvasContext(canvas, theme)
  },
)

export const getRowAtlas = memoizeByReference((canvasContext: CanvasContext) => {
  return new RowAtlas<FlamechartRowAtlasKey>(
    canvasContext.gl,
    canvasContext.rectangleBatchRenderer,
    canvasContext.textureRenderer,
  )
})

export const getProfileToView = memoizeByShallowEquality(
  ({profile, flattenRecursion}: {profile: Profile; flattenRecursion: boolean}): Profile => {
    return flattenRecursion ? profile.getProfileWithRecursionFlattened() : profile
  },
)

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
  beforeFrame: Frame
  afterFrame: Frame | undefined
  selfWeightDiff: number
  selfWeightPercentIncrease: number
  totalWeightDiff: number
  totalWeightPercentIncrease: number
}

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

  beforeProfile.forEachFrame(beforeFrame => {
    // Attempt to find the frame that matches in the after profile
    const afterFrame = getMatchingFrame(beforeFrame)

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

  return frameDiffs
}

export const getFrameToColorBucket = memoizeByReference(
  (profile: Profile): Map<string | number, number> => {
    const frames: Frame[] = []
    profile.forEachFrame(f => frames.push(f))
    function key(f: Frame) {
      return (f.file || '') + f.name
    }
    function compare(a: Frame, b: Frame) {
      return key(a) > key(b) ? 1 : -1
    }
    frames.sort(compare)
    const frameToColorBucket = new Map<string | number, number>()
    for (let i = 0; i < frames.length; i++) {
      frameToColorBucket.set(frames[i].key, Math.floor((255 * i) / frames.length))
    }

    return frameToColorBucket
  },
)
