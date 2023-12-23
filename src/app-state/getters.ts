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

  return {
    selfWeightDiff: beforeSelfWeight - afterSelfWeight,
    totalWeightDiff: beforeTotalWeight - afterTotalWeight,
  }
}

type FrameDiff = {
  beforeFrame: Frame
  afterFrame: Frame | undefined
  selfWeightDiff: number
  totalWeightDiff: number
}

function getFrameDiffs(beforeProfile: Profile, afterProfile: Profile): FrameDiff[] {
  const afterFrameMap = afterProfile.getFrameMap()

  const frameDiffs: FrameDiff[] = []

  beforeProfile.forEachFrame(beforeFrame => {
    const afterFrame = afterFrameMap.get(beforeFrame.key)
    const {selfWeightDiff, totalWeightDiff} = getFrameDifference(beforeFrame, afterFrame)

    frameDiffs.push({beforeFrame, afterFrame, selfWeightDiff, totalWeightDiff})
  })

  return frameDiffs
}

/**
 * Ensures that all frame diffs sit between 0.1 and 0.9.
 */
function normalizeFrameDiffs(frameDiffs: FrameDiff[]): FrameDiff[] {
  // Find the maximum absolute differences
  let maxSelfWeightDiff = 0;
  let maxTotalWeightDiff = 0;

  frameDiffs.forEach(fd => {
    maxSelfWeightDiff = Math.max(maxSelfWeightDiff, Math.abs(fd.selfWeightDiff));
    maxTotalWeightDiff = Math.max(maxTotalWeightDiff, Math.abs(fd.totalWeightDiff));
  });

  // Map from [-1,1] to [0.1, 0.9]
  function mapToOutputRange(diff: number) {
    return ((diff + 1) / 2 * 0.8) + 0.1
  }

  // Normalize the differences, scaling down a bit further
  return frameDiffs.map(fd => ({
    ...fd,
    selfWeightDiff: mapToOutputRange(fd.selfWeightDiff / maxSelfWeightDiff),
    totalWeightDiff: mapToOutputRange(fd.totalWeightDiff / maxTotalWeightDiff)
  }));
}

export const getFrameToColorBucketCompare = (
  beforeProfile: Profile,
  afterProfile: Profile,
): Map<string | number, number> => {
  const frameDiffs = getFrameDiffs(beforeProfile, afterProfile)
  const scaledDiffs = normalizeFrameDiffs(frameDiffs);

  const frameToColorBucket = new Map<string | number, number>()

  console.log('---- BEFORE -----')

  beforeProfile.forEachFrame(f => {
    if (f.name.includes('prepareHydratedValue')) {
      console.log(f.key);
    }
  })

  console.log('---- AFTER -----')

  afterProfile.forEachFrame(f => {
    if (f.name.includes('prepareHydratedValue')) {
      console.log(f.key);
    }
  })

  scaledDiffs.forEach(({beforeFrame, afterFrame, totalWeightDiff, selfWeightDiff}) => {

    if (beforeFrame.name.includes('prepareHydratedValue')) {
      console.log({ beforeFrame, afterFrame, selfWeightDiff });
    }

    // TODO: Deal with self vs total weight with a state variable
    // that is surfaced in the UI
    frameToColorBucket.set(beforeFrame.key, selfWeightDiff)
  })

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
      frameToColorBucket.set(frames[i].key, 140)
    }

    return frameToColorBucket
  },
)
