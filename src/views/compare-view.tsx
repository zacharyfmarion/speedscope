import {h} from 'preact'
import {memo, useMemo} from 'preact/compat'
import {ActiveProfileState} from '../app-state/active-profile-state'
import {useAtom} from '../lib/atom'
import {compareProfileGroupAtom, profileGroupAtom} from '../app-state'
import {ProfileGroupState} from '../app-state/profile-group'
import {useTheme, withTheme} from './themes/theme'
import {Duration, FontSize, commonStyle} from './style'
import {StyleSheet, css} from 'aphrodite'

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

  return null
}

type CompareViewContainerProps = {
  activeProfileState: ActiveProfileState
  glCanvas: HTMLCanvasElement
  onFileSelect: (ev: Event) => void
}

export const CompareViewContainer = memo(
  ({activeProfileState, glCanvas, onFileSelect}: CompareViewContainerProps) => {
    const style = getStyle(useTheme())
    const profileGroup = useAtom(profileGroupAtom)
    const compareProfileGroup = useAtom(compareProfileGroupAtom)

    if (!compareProfileGroup) {
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
      <CompareView
        glCanvas={glCanvas}
        activeProfileState={activeProfileState}
        profileGroup={profileGroup}
        compareProfileGroup={compareProfileGroup}
      />
    )
  },
)

const getStyle = withTheme(theme =>
  StyleSheet.create({
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
