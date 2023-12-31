import {JSX, h} from 'preact'
import {memo, useCallback, useContext, useEffect, useMemo} from 'preact/compat'
import {ActiveProfileState} from '../app-state/active-profile-state'
import {useAtom} from '../lib/atom'
import {
  SortDirection,
  SortField,
  compareProfileGroupAtom,
  profileGroupAtom,
  tableSortMethodAtom,
} from '../app-state'
import {ProfileGroupState} from '../app-state/profile-group'
import {Theme, useTheme, withTheme} from './themes/theme'
import {Duration, FontSize, Sizes, commonStyle} from './style'
import {StyleSheet, css} from 'aphrodite'
import {Frame} from '../lib/profile'
import {SandwichSearchView} from './sandwich-search-view'
import {CompareTableViewContainer} from './compare-table-view'
import {SandwichViewContext, SandwichViewContextData} from './sandwich-view'
import {ProfileSearchContext} from './search-view'
import {sortBy} from '../lib/utils'
import {getFrameDiffs} from '../app-state/getters'
import {InvertedCallerFlamegraphView} from './inverted-caller-flamegraph-view'
import {CalleeFlamegraphView} from './callee-flamegraph-view'

type CompareViewProps = {
  profileGroup: ProfileGroupState
  compareProfileGroup: ProfileGroupState
  selectedFrame: Frame | null
  profileIndex: number
  theme: Theme
  glCanvas: HTMLCanvasElement
  activeProfileState: ActiveProfileState
  compareActiveProfileState: ActiveProfileState
  setSelectedFrame: (selectedFrame: Frame | null) => void
}

const CompareView = memo(function CompareView({
  activeProfileState,
  compareActiveProfileState,
  selectedFrame,
  theme,
  glCanvas,
}: CompareViewProps) {
  const style = getStyle(theme)
  const frameDiffs = useMemo(() => {
    return getFrameDiffs(activeProfileState?.profile, compareActiveProfileState?.profile)
  }, [activeProfileState, compareActiveProfileState])

  let flamegraphViews: JSX.Element | null = null

  const beforeCallerCallee = useMemo(() => {
    return activeProfileState.sandwichViewState.callerCallee
  }, [activeProfileState])

  const afterCallerCallee = useMemo(() => {
    return compareActiveProfileState.sandwichViewState.callerCallee
  }, [compareActiveProfileState])

  if (selectedFrame) {
    flamegraphViews = (
      <div className={css(commonStyle.fillY, style.callersAndCallees, commonStyle.vbox)}>
        <div className={css(commonStyle.hbox, style.panZoomViewWraper)}>
          <div className={css(style.flamechartLabelParent)}>
            <div className={css(style.flamechartLabel)}>Before</div>
          </div>
          {beforeCallerCallee && (
            <CalleeFlamegraphView
              glCanvas={glCanvas}
              profile={activeProfileState.profile}
              callerCallee={beforeCallerCallee}
            />
          )}
        </div>
        <div className={css(style.divider)} />
        <div className={css(commonStyle.hbox, style.panZoomViewWraper)}>
          <div className={css(style.flamechartLabelParent, style.flamechartLabelParentBottom)}>
            <div className={css(style.flamechartLabel, style.flamechartLabelBottom)}>After</div>
          </div>
          {/* {afterCallerCallee && (
            <CalleeFlamegraphView
              glCanvas={glCanvas}
              profile={compareActiveProfileState.profile}
              callerCallee={afterCallerCallee}
            />
          )} */}
        </div>
      </div>
    )
  }

  return (
    <div className={css(commonStyle.hbox, commonStyle.fillY)}>
      <div className={css(style.tableView)}>
        <CompareTableViewContainer
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
  compareActiveProfileState: ActiveProfileState
  onFileSelect: (ev: Event) => void
  glCanvas: HTMLCanvasElement
}

export const CompareViewContainer = memo(
  ({
    activeProfileState,
    compareActiveProfileState,
    onFileSelect,
    glCanvas,
  }: CompareViewContainerProps) => {
    const style = getStyle(useTheme())

    const {sandwichViewState, index} = activeProfileState
    const {callerCallee} = sandwichViewState

    const theme = useTheme()
    const setSelectedFrame = useCallback((selectedFrame: Frame | null) => {
      profileGroupAtom.setSelectedFrame(selectedFrame)
    }, [])

    const profile = activeProfileState.profile
    const tableSortMethod = useAtom(tableSortMethodAtom)
    const profileSearchResults = useContext(ProfileSearchContext)

    const selectedFrame = callerCallee ? callerCallee.selectedFrame : null

    const rowList: Frame[] = useMemo(() => {
      const rowList: Frame[] = []

      profile.forEachFrame(frame => {
        if (profileSearchResults && !profileSearchResults.getMatchForFrame(frame)) {
          return
        }
        rowList.push(frame)
      })

      switch (tableSortMethod.field) {
        case SortField.SYMBOL_NAME: {
          sortBy(rowList, f => f.name.toLowerCase())
          break
        }
        case SortField.SELF: {
          sortBy(rowList, f => f.getSelfWeight())
          break
        }
        case SortField.TOTAL: {
          sortBy(rowList, f => f.getTotalWeight())
          break
        }
      }
      if (tableSortMethod.direction === SortDirection.DESCENDING) {
        rowList.reverse()
      }

      return rowList
    }, [profile, profileSearchResults, tableSortMethod])

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

    const contextData: SandwichViewContextData = {
      rowList,
      selectedFrame,
      setSelectedFrame,
      getIndexForFrame,
      getSearchMatchForFrame,
    }

    // TODO: Deal with importing loading UI
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
          glCanvas={glCanvas}
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
      flex: '2 1 0%',
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
