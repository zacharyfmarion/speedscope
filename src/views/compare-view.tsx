import {h} from 'preact'
import {memo, useCallback, useMemo} from 'preact/compat'
import {ActiveProfileState} from '../app-state/active-profile-state'
import {useAtom} from '../lib/atom'
import {compareProfileGroupAtom, profileGroupAtom} from '../app-state'
import {FlamechartID, ProfileGroupState} from '../app-state/profile-group'
import {FlamechartSearchContextProvider} from './flamechart-search-view'
import {FlamechartView} from './flamechart-view'
import {useFlamechartSetters} from './flamechart-view-container'
import {getCanvasContext, getFrameToColorBucketCompare, getRowAtlas} from '../app-state/getters'
import {ThemeContext, useTheme} from './themes/theme'
import {darkCompareTheme, darkTheme} from './themes/dark-theme'
import {lightCompareTheme} from './themes/light-theme'
import {Frame} from '../lib/profile'
import {Flamechart} from '../lib/flamechart'
import {FlamechartRenderer} from '../gl/flamechart-renderer'
import {getProfileDiff} from '../lib/diff'

type CompareViewProps = {
  profileGroup: ProfileGroupState
  compareProfileGroup: ProfileGroupState
  activeProfileState: ActiveProfileState
  glCanvas: HTMLCanvasElement
}

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

  const diff = useMemo(() => {
    const diff = getProfileDiff(beforeProfile, afterProfile)
    console.log(diff)
    return diff
  }, [beforeProfile, afterProfile])

  const {chronoViewState} = activeProfileState
  const theme = useTheme()

  const canvasContext = getCanvasContext({theme, canvas: glCanvas})

  // TODO: Migrate the main chrono flamechart view to also use hooks
  // instead of custom memoized functions
  const frameToColorBucket = useMemo(() => {
    return getFrameToColorBucketCompare(beforeProfile, afterProfile)
  }, [beforeProfile, afterProfile])

  const getColorBucketForFrame = useCallback(
    (frame: Frame): number => {
      return frameToColorBucket.get(frame.key) || 0
    },
    [frameToColorBucket],
  )

  const getCSSColorForFrame = useCallback(
    (frame: Frame): string => {
      const t = getColorBucketForFrame(frame) / 255
      return theme.colorForBucket(t).toCSS()
    },
    [theme, getColorBucketForFrame],
  )

  const flamechart = useMemo(() => {
    return new Flamechart({
      getTotalWeight: beforeProfile.getTotalWeight.bind(beforeProfile),
      forEachCall: beforeProfile.forEachCall.bind(beforeProfile),
      formatValue: beforeProfile.formatValue.bind(beforeProfile),
      getColorBucketForFrame,
    })
  }, [beforeProfile, getColorBucketForFrame])

  const flamechartRenderer = useMemo(() => {
    return new FlamechartRenderer(
      canvasContext.gl,
      getRowAtlas(canvasContext),
      flamechart,
      canvasContext.rectangleBatchRenderer,
      canvasContext.flamechartColorPassRenderer,
      {
        inverted: false,
        isCompareView: true,
      },
    )
  }, [canvasContext, flamechart])

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
    const theme = useTheme()
    const profileGroup = useAtom(profileGroupAtom)
    const compareProfileGroup = useAtom(compareProfileGroupAtom)

    const compareTheme = useMemo(() => {
      if (theme === darkTheme) return darkCompareTheme
      return lightCompareTheme
    }, [theme])

    if (!compareProfileGroup) {
      return <div>Upload second profile</div>
    }

    return (
      // <ThemeContext.Provider value={compareTheme}>
      <CompareView
        glCanvas={glCanvas}
        activeProfileState={activeProfileState}
        profileGroup={profileGroup}
        compareProfileGroup={compareProfileGroup}
      />
      // </ThemeContext.Provider>
    )
  },
)
