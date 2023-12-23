import {Color} from '../../lib/color'
import {triangle} from '../../lib/utils'
import {Theme} from './theme'

// These colors are intentionally not exported from this file, because these
// colors are theme specific, and we want all color values to come from the
// active theme.
enum Colors {
  LIGHTER_GRAY = '#D0D0D0',
  LIGHT_GRAY = '#BDBDBD',
  GRAY = '#666666',
  DARK_GRAY = '#222222',
  DARKER_GRAY = '#0C0C0C',
  OFF_BLACK = '#060606',
  BLACK = '#000000',
  BLUE = '#00769B',
  PALE_BLUE = '#004E75',
  GREEN = '#0F8A42',
  LIGHT_BROWN = '#D6AE24',
  BROWN = '#A66F1C',
}

// const C_0 = 0.2
// const C_d = 0.1
// const L_0 = 0.2
// const L_d = 0.1

function colorForBucket(t: number) {
  // Represents a color in RGB format
  const red = [1.0, 0.0, 0.0]; // Red color
  const green = [0.0, 1.0, 0.0]; // Green color
  const gray = [0.5, 0.5, 0.5]; // Gray color

  // Mix function to interpolate between two colors
  const mix = (color1: number[], color2: number[], factor: number) => {
      return color1.map((c1: number, index: number) => c1 * (1 - factor) + color2[index] * factor);
  };

  if (t === 1.0) {
      return gray;
  }
  if (t < 0.0) {
      // Interpolate between gray and red for negative values
      return mix(gray, red, -t);
  } else {
      // Interpolate between gray and green for positive values
      return mix(gray, green, t);
  }
}

const colorForBucketGLSL = `
  vec3 colorForBucket(float t) {
    if (t < 0.5) {
      // Interpolate between red and gray
      float mixRatio = t / 0.5; // Normalize t to the range [0, 1] for mixing
      return mix(vec3(1.0, 0.0, 0.0), vec3(0.5, 0.5, 0.5), mixRatio);
    } else {
      // Interpolate between gray and green
      float mixRatio = (t - 0.5) / 0.5; // Normalize t to the range [0, 1] for mixing
      return mix(vec3(0.5, 0.5, 0.5), vec3(0.0, 1.0, 0.0), mixRatio);
    }
  }
`;

    // float x = triangle(30.0 * t);
    // float H = 360.0 * (0.9 * t);
    // float C = ${C_0.toFixed(1)} + ${C_d.toFixed(1)} * x;
    // float L = ${L_0.toFixed(1)} - ${L_d.toFixed(1)} * x;
    // return hcl2rgb(H, C, L);

export const darkTheme: Theme = {
  fgPrimaryColor: Colors.LIGHTER_GRAY,
  fgSecondaryColor: Colors.GRAY,

  bgPrimaryColor: Colors.OFF_BLACK,
  bgSecondaryColor: Colors.DARKER_GRAY,

  altFgPrimaryColor: Colors.LIGHTER_GRAY,
  altFgSecondaryColor: Colors.GRAY,

  altBgPrimaryColor: Colors.BLACK,
  altBgSecondaryColor: Colors.DARKER_GRAY,

  selectionPrimaryColor: Colors.BLUE,
  selectionSecondaryColor: Colors.PALE_BLUE,

  weightColor: Colors.GREEN,

  searchMatchTextColor: Colors.DARKER_GRAY,
  searchMatchPrimaryColor: Colors.BROWN,
  searchMatchSecondaryColor: Colors.LIGHT_BROWN,

  colorForBucket,
  colorForBucketGLSL,
}
