import { colors } from './colors';

export const components = {
  // Switch bileşeni stilleri
  switch: {
    track: {
      false: colors.switch.track.inactive,
      true: colors.switch.track.active
    },
    thumb: {
      false: colors.switch.thumb.inactive,
      true: colors.switch.thumb.active
    },
    ios_background: colors.switch.track.inactive,
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    style: {
      marginLeft: 8
    }
  },

  // Button bileşeni stilleri
  button: {
    primary: {
      backgroundColor: colors.button.primary,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
      height: 56
    },
    disabled: {
      backgroundColor: colors.button.disabled
    },
    text: {
      color: colors.button.text,
      fontSize: 16,
      fontWeight: '600'
    }
  },

  // Icon Container stilleri
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    marginRight: 12
  },

  // Text stilleri
  text: {
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text.primary,
      marginBottom: 4
    },
    description: {
      fontSize: 14,
      color: colors.text.secondary
    },
    header: {
      fontSize: 34,
      fontWeight: '700',
      color: colors.text.primary
    }
  }
}; 