import {h} from 'preact'
import {memo, useMemo} from 'preact/compat'
import {ActiveProfileState} from '../app-state/active-profile-state'
import {useAtom} from '../lib/atom'
import {compareProfileGroupAtom, profileGroupAtom} from '../app-state'
import {FlamechartID, ProfileGroupState} from '../app-state/profile-group'
import {FlamechartSearchContextProvider} from './flamechart-search-view'
import {FlamechartView} from './flamechart-view'
import {
  createMemoizedFlamechartRenderer,
  getChronoViewFlamechart,
  useFlamechartSetters,
} from './flamechart-view-container'
import {
  createGetCSSColorForFrame,
  createGetColorBucketForFrame,
  getCanvasContext,
  getFrameToColorBucketCompare,
} from '../app-state/getters'
import {useTheme} from './themes/theme'

type CompareViewProps = {
  profileGroup: ProfileGroupState
  compareProfileGroup: ProfileGroupState
  activeProfileState: ActiveProfileState
  glCanvas: HTMLCanvasElement
}

const getChronoViewFlamechartRenderer = createMemoizedFlamechartRenderer()

function CompareView({
  profileGroup,
  compareProfileGroup,
  activeProfileState,
  glCanvas,
}: CompareViewProps) {
  // TODO: Validate that the same pid:tid mapping exiests for both profiles
  // otherwise error out

  // For now lets just take the first profiles from both and compare them
  const {beforeProfile, afterProfile} = useMemo(() => {
    const beforeProfile = profileGroup!.profiles[0].profile
    const afterProfile = compareProfileGroup!.profiles[0].profile

    return {beforeProfile, afterProfile}
  }, [profileGroup, compareProfileGroup])

  const {chronoViewState} = activeProfileState

  const theme = useTheme()

  const canvasContext = getCanvasContext({theme, canvas: glCanvas})

  const frameToColorBucket = useMemo(() => {
    return getFrameToColorBucketCompare(beforeProfile, afterProfile)
  }, [beforeProfile, afterProfile])

  const getColorBucketForFrame = createGetColorBucketForFrame(frameToColorBucket)
  const getCSSColorForFrame = createGetCSSColorForFrame({theme, frameToColorBucket})

  const flamechart = getChronoViewFlamechart({profile: beforeProfile, getColorBucketForFrame})
  const flamechartRenderer = getChronoViewFlamechartRenderer({
    canvasContext,
    flamechart,
  })

  const setters = useFlamechartSetters(FlamechartID.CHRONO)

  return (
    <FlamechartSearchContextProvider
      flamechart={flamechart}
      selectedNode={chronoViewState.selectedNode}
      setSelectedNode={setters.setSelectedNode}
      configSpaceViewportRect={chronoViewState.configSpaceViewportRect}
      setConfigSpaceViewportRect={setters.setConfigSpaceViewportRect}
    >
      <FlamechartView
        theme={theme}
        renderInverted={false}
        flamechart={flamechart}
        flamechartRenderer={flamechartRenderer}
        canvasContext={canvasContext}
        getCSSColorForFrame={getCSSColorForFrame}
        {...chronoViewState}
        {...setters}
      />
    </FlamechartSearchContextProvider>
  )
}

type CompareViewContainerProps = {
  activeProfileState: ActiveProfileState
  glCanvas: HTMLCanvasElement
}

export const CompareViewContainer = memo(
  ({activeProfileState, glCanvas}: CompareViewContainerProps) => {
    const profileGroup = useAtom(profileGroupAtom)
    const compareProfileGroup = useAtom(compareProfileGroupAtom)

    if (!compareProfileGroup) {
      return <div>Upload second profile</div>
    }

    return (
      <CompareView
        glCanvas={glCanvas}
        activeProfileState={activeProfileState}
        profileGroup={profileGroup}
        compareProfileGroup={compareProfileGroup}
      />
    )
  },
)
