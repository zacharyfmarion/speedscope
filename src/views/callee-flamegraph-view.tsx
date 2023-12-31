import {memoizeByShallowEquality, noop} from '../lib/utils'
import {Profile, Frame} from '../lib/profile'
import {Flamechart} from '../lib/flamechart'
import {createMemoizedFlamechartRenderer, useFlamechartSetters} from './flamechart-view-container'
import {
  getCanvasContext,
  createGetColorBucketForFrame,
  createGetCSSColorForFrame,
  getFrameToColorBucket,
} from '../app-state/getters'
import {FlamechartWrapper} from './flamechart-wrapper'
import {h} from 'preact'
import {memo} from 'preact/compat'
import {useTheme} from './themes/theme'
import {CallerCalleeState, FlamechartID, ProfileGroupAtom} from '../app-state/profile-group'
import {flattenRecursionAtom, glCanvasAtom} from '../app-state'
import {useAtom} from '../lib/atom'

const getCalleeProfile = memoizeByShallowEquality<
  {
    profile: Profile
    frame: Frame
    flattenRecursion: boolean
  },
  Profile
>(({profile, frame, flattenRecursion}) => {
  let p = profile.getProfileForCalleesOf(frame)
  return flattenRecursion ? p.getProfileWithRecursionFlattened() : p
})

const getCalleeFlamegraph = memoizeByShallowEquality<
  {
    calleeProfile: Profile
    getColorBucketForFrame: (frame: Frame) => number
  },
  Flamechart
>(({calleeProfile, getColorBucketForFrame}) => {
  return new Flamechart({
    getTotalWeight: calleeProfile.getTotalNonIdleWeight.bind(calleeProfile),
    forEachCall: calleeProfile.forEachCallGrouped.bind(calleeProfile),
    formatValue: calleeProfile.formatValue.bind(calleeProfile),
    getColorBucketForFrame,
  })
})

const getCalleeFlamegraphRenderer = createMemoizedFlamechartRenderer()

type CalleeFlamegraphViewProps = {
  profile: Profile
  callerCallee: CallerCalleeState
  flamechartId?: FlamechartID
  // TODO: I don't like overloading this word
  // Maybe rename the atom?
  profileGroupAtom: ProfileGroupAtom
}

export const CalleeFlamegraphView = memo(
  ({
    profile,
    callerCallee,
    profileGroupAtom,
    flamechartId = FlamechartID.SANDWICH_CALLEES,
  }: CalleeFlamegraphViewProps) => {
    const flattenRecursion = useAtom(flattenRecursionAtom)
    const glCanvas = useAtom(glCanvasAtom)
    const theme = useTheme()

    if (!profile) throw new Error('profile missing')
    if (!glCanvas) throw new Error('glCanvas missing')
    if (!callerCallee) throw new Error('callerCallee missing')

    const {selectedFrame} = callerCallee

    const frameToColorBucket = getFrameToColorBucket(profile)
    const getColorBucketForFrame = createGetColorBucketForFrame(frameToColorBucket)
    const getCSSColorForFrame = createGetCSSColorForFrame({theme, frameToColorBucket})
    const canvasContext = getCanvasContext({theme, canvas: glCanvas})

    const flamechart = getCalleeFlamegraph({
      calleeProfile: getCalleeProfile({profile, frame: selectedFrame, flattenRecursion}),
      getColorBucketForFrame,
    })
    const flamechartRenderer = getCalleeFlamegraphRenderer({canvasContext, flamechart})

    return (
      <FlamechartWrapper
        theme={theme}
        renderInverted={false}
        flamechart={flamechart}
        flamechartRenderer={flamechartRenderer}
        canvasContext={canvasContext}
        getCSSColorForFrame={getCSSColorForFrame}
        {...useFlamechartSetters(flamechartId, profileGroupAtom)}
        {...callerCallee.calleeFlamegraph}
        // This overrides the setSelectedNode specified in useFlamechartSettesr
        setSelectedNode={noop}
      />
    )
  },
)
