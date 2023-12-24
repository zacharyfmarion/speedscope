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

type FrameDiff = {
  beforeFrame: Frame
  afterFrame: Frame | undefined
  selfWeightDiff: number
  selfWeightPercentIncrease: number
  totalWeightDiff: number
  totalWeightPercentIncrease: number
}

function getFrameDiffs(beforeProfile: Profile, afterProfile: Profile): FrameDiff[] {
  const afterFrameMap = afterProfile.getFrameMap()

  const frameDiffs: FrameDiff[] = []

  beforeProfile.forEachFrame(beforeFrame => {
    const afterFrame = afterFrameMap.get(beforeFrame.key)
    const {
      selfWeightDiff,
      totalWeightDiff,
      selfWeightPercentIncrease,
      totalWeightPercentIncrease,
    } = getFrameDifference(beforeFrame, afterFrame)

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

/**
 * Ensures that all frame diffs sit between 0.1 and 0.9.
 * Anything larger than 0.5 is a percent increase, anything smaller is a
 * percent decrease
 */
function normalizeFrameDiffs(frameDiffs: FrameDiff[]): FrameDiff[] {
  // Map from [-1,1] to [0.1, 0.9]
  function mapToOutputRange(diff: number) {
    return ((diff + 1) / 2) * 0.8 + 0.1
  }

  // Normalize the differences, scaling down a bit further
  return frameDiffs.map(fd => ({
    ...fd,
    selfWeightPercentIncrease: mapToOutputRange(fd.selfWeightPercentIncrease),
    totalWeightPercentIncrease: mapToOutputRange(fd.totalWeightPercentIncrease),
  }))
}

// We ignore anything less than 3ms
const COMPARE_THRESHOLD = 3_000_000;

export const getFrameToColorBucketCompare = (
  beforeProfile: Profile,
  afterProfile: Profile,
): Map<string | number, number> => {
  const frameDiffs = getFrameDiffs(beforeProfile, afterProfile)
  const scaledDiffs = normalizeFrameDiffs(frameDiffs)

  const frameToColorBucket = new Map<string | number, number>()

  scaledDiffs.forEach(
    ({
      beforeFrame,
      // afterFrame,
      totalWeightDiff,
      // selfWeightDiff,
      // selfWeightPercentIncrease,
      totalWeightPercentIncrease,
    }) => {
      // TODO: Deal with self vs total weight with a state variable
      // Also a variable for whether to go by percent increase / decrease vs ns diff
      // that is surfaced in the UI

      const value = Math.abs(totalWeightDiff) > COMPARE_THRESHOLD ? totalWeightPercentIncrease : 0.5;

      frameToColorBucket.set(beforeFrame.key, value)
    },
  )

  return frameToColorBucket
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
