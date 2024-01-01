import {JSX, h} from 'preact'
import {memo, useCallback, useContext, useEffect, useMemo} from 'preact/compat'
import {ActiveProfileState} from '../app-state/active-profile-state'
import {useAtom} from '../lib/atom'
import {compareProfileGroupAtom, flattenRecursionAtom, profileGroupAtom} from '../app-state'
import {Theme, useTheme, withTheme} from './themes/theme'
import {Duration, FontSize, Sizes, commonStyle} from './style'
import {StyleSheet, css} from 'aphrodite'
import {Frame} from '../lib/profile'
import {SandwichSearchView} from './sandwich-search-view'
import {CompareTableViewContainer} from './compare-table-view'
import {SandwichViewContext, SandwichViewContextData} from './sandwich-view'
import {ProfileSearchContext} from './search-view'
import {CalleeFlamegraphView, getCalleeProfile} from './callee-flamegraph-view'
import {getFrameDiffs} from '../lib/frameDiffs'

type CompareViewProps = {
  selectedFrame: Frame | null
  profileIndex: number
  theme: Theme
  activeProfileState: ActiveProfileState
  compareActiveProfileState: ActiveProfileState
  setSelectedFrame: (selectedFrame: Frame | null) => void
}

const CompareView = memo(function CompareView({
  activeProfileState,
  compareActiveProfileState,
  selectedFrame,
  theme,
}: CompareViewProps) {
  // TODO: Abstract this into a hook
  useEffect(() => {
    function handleEscapeKeyPres(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        profileGroupAtom.setSelectedFrame(null)
        compareProfileGroupAtom.setSelectedFrame(null)
      }
    }

    window.addEventListener('keydown', handleEscapeKeyPres)
    return () => window.removeEventListener('keydown', handleEscapeKeyPres)
  }, [])

  const style = getStyle(theme)

  const {beforeProfile, afterProfile} = useMemo(() => {
    return {
      beforeProfile: activeProfileState.profile,
      afterProfile: compareActiveProfileState.profile,
    }
  }, [activeProfileState, compareActiveProfileState])

  // TODO: Globally memoize?
  const frameDiffs = useMemo(() => {
    return getFrameDiffs(beforeProfile, afterProfile)
  }, [beforeProfile, afterProfile])

  let flamegraphViews: JSX.Element | null = null

  const beforeCallerCallee = activeProfileState.sandwichViewState.callerCallee
  const afterCallerCallee = compareActiveProfileState.sandwichViewState.callerCallee

  const flattenRecursion = useAtom(flattenRecursionAtom)

  /**
   * Set the total weight to be the maximum of the total weights of the two callee
   * profiles so the two flamegraphs share the same timescale
   */
  const getTotalWeight = useCallback(() => {
    let totalWeight = 0

    if (beforeCallerCallee) {
      const beforeCalleeProfile = getCalleeProfile({
        profile: beforeProfile,
        frame: beforeCallerCallee.selectedFrame,
        flattenRecursion,
      })

      totalWeight = beforeCalleeProfile.getTotalNonIdleWeight()
    }

    if (afterCallerCallee) {
      const afterCalleeProfile = getCalleeProfile({
        profile: afterProfile,
        frame: afterCallerCallee?.selectedFrame,
        flattenRecursion,
      })

      const afterCalleeTotalWeight = afterCalleeProfile.getTotalNonIdleWeight()

      return Math.max(totalWeight, afterCalleeTotalWeight)
    }

    return totalWeight
  }, [beforeProfile, afterProfile, beforeCallerCallee, afterCallerCallee, flattenRecursion])

  if (selectedFrame) {
    flamegraphViews = (
      <div className={css(commonStyle.fillY, style.callersAndCallees, commonStyle.vbox)}>
        <div className={css(commonStyle.hbox, style.panZoomViewWraper)}>
          <div className={css(style.flamechartLabelParent)}>
            <div className={css(style.flamechartLabel)}>Before</div>
          </div>
          {beforeCallerCallee && (
            <CalleeFlamegraphView
              profile={beforeProfile}
              callerCallee={beforeCallerCallee}
              getTotalWeight={getTotalWeight}
              profileGroupAtom={profileGroupAtom}
            />
          )}
        </div>
        <div className={css(style.divider)} />
        <div className={css(commonStyle.hbox, style.panZoomViewWraper)}>
          <div className={css(style.flamechartLabelParent, style.flamechartLabelParentBottom)}>
            <div className={css(style.flamechartLabel, style.flamechartLabelBottom)}>After</div>
          </div>
          {afterCallerCallee && (
            <CalleeFlamegraphView
              profile={afterProfile}
              callerCallee={afterCallerCallee}
              getTotalWeight={getTotalWeight}
              profileGroupAtom={compareProfileGroupAtom}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={css(commonStyle.hbox, commonStyle.fillY)}>
      <div className={css(style.tableView)}>
        <CompareTableViewContainer
          compareActiveProfileState={compareActiveProfileState}
          activeProfileState={activeProfileState}
          frameDiffs={frameDiffs}
        />
        <SandwichSearchView />
      </div>
      {flamegraphViews}
    </div>
  )
})

type CompareViewContainerProps = {
  activeProfileState: ActiveProfileState
  compareActiveProfileState: ActiveProfileState | null
  onFileSelect: (ev: Event) => void
  glCanvas: HTMLCanvasElement
}

export const CompareViewContainer = memo(
  ({activeProfileState, compareActiveProfileState, onFileSelect}: CompareViewContainerProps) => {
    const style = getStyle(useTheme())

    // TODO: Dedupe this with compare-table-view
    const {sandwichViewState, index} = activeProfileState
    const theme = useTheme()

    // TODO: Refactor this so that we can correctly determine which frame to set
    // Right now I'm not sure this gets used
    const setSelectedFrame = useCallback((selectedFrame: Frame | null) => {
      profileGroupAtom.setSelectedFrame(selectedFrame)
    }, [])

    const profileSearchResults = useContext(ProfileSearchContext)

    const selectedFrame =
      sandwichViewState.callerCallee?.selectedFrame ??
      compareActiveProfileState?.sandwichViewState?.callerCallee?.selectedFrame ??
      null

    // TODO: Refactor this, right now it is unused but just needed to supply context
    const rowList: Frame[] = useMemo(() => {
      return []
    }, [])

    const getIndexForFrame: (frame: Frame) => number | null = useMemo(() => {
      const indexByFrame = new Map<Frame, number>()
      for (let i = 0; i < rowList.length; i++) {
        indexByFrame.set(rowList[i], i)
      }
      return (frame: Frame) => {
        const index = indexByFrame.get(frame)
        return index == null ? null : index
      }
    }, [rowList])

    const getSearchMatchForFrame: (frame: Frame) => [number, number][] | null = useMemo(() => {
      return (frame: Frame) => {
        if (profileSearchResults == null) return null
        return profileSearchResults.getMatchForFrame(frame)
      }
    }, [profileSearchResults])

    const contextData: SandwichViewContextData = useMemo(
      () => ({
        rowList,
        selectedFrame,
        setSelectedFrame,
        getIndexForFrame,
        getSearchMatchForFrame,
      }),
      [rowList, selectedFrame, setSelectedFrame, getIndexForFrame, getSearchMatchForFrame],
    )

    // TODO: Make the importing loading UI better with the progress bar
    if (!compareActiveProfileState) {
      return (
        <div className={css(commonStyle.hbox, commonStyle.fillY, style.landingContainer)}>
          <p className={css(style.landingP)}>Upload a second profile to compare</p>
          <div className={css(style.browseButtonContainer)}>
            <input
              type="file"
              name="file"
              id="file"
              onChange={onFileSelect}
              className={css(commonStyle.hide)}
            />
            <label for="file" className={css(style.browseButton)} tabIndex={0}>
              Browse
            </label>
          </div>
        </div>
      )
    }

    return (
      <SandwichViewContext.Provider value={contextData}>
        <CompareView
          theme={theme}
          activeProfileState={activeProfileState}
          compareActiveProfileState={compareActiveProfileState}
          setSelectedFrame={setSelectedFrame}
          selectedFrame={selectedFrame}
          profileIndex={index}
        />
      </SandwichViewContext.Provider>
    )
  },
)

const getStyle = withTheme(theme =>
  StyleSheet.create({
    // Table styles:
    tableView: {
      position: 'relative',
      flex: 1,
    },
    panZoomViewWraper: {
      flex: 1,
    },
    flamechartLabelParent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      fontSize: FontSize.TITLE,
      width: FontSize.TITLE * 1.2,
      borderRight: `1px solid ${theme.fgSecondaryColor}`,
    },
    flamechartLabelParentBottom: {
      justifyContent: 'flex-start',
    },
    flamechartLabel: {
      transform: 'rotate(-90deg)',
      transformOrigin: '50% 50% 0',
      width: FontSize.TITLE * 1.2,
      flexShrink: 1,
    },
    flamechartLabelBottom: {
      transform: 'rotate(-90deg)',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    callersAndCallees: {
      flex: 1,
      borderLeft: `${Sizes.SEPARATOR_HEIGHT}px solid ${theme.fgSecondaryColor}`,
    },
    divider: {
      height: 2,
      background: theme.fgSecondaryColor,
    },
    // Landing styles
    landingContainer: {
      background: theme.bgPrimaryColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      flex: 1,
    },
    landingP: {
      marginBottom: 16,
    },
    // TODO: Make a browse button component
    browseButtonContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    browseButton: {
      marginBottom: 16,
      height: 72,
      flex: 1,
      maxWidth: 256,
      textAlign: 'center',
      fontSize: FontSize.BIG_BUTTON,
      lineHeight: '72px',
      background: theme.selectionPrimaryColor,
      color: theme.altFgPrimaryColor,
      transition: `all ${Duration.HOVER_CHANGE} ease-in`,
      padding: `0 60px`,
      ':hover': {
        background: theme.selectionSecondaryColor,
      },
    },
  }),
)
