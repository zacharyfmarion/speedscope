import {Color} from '../../lib/color'

export function compareColorForBucket(t: number) {
  const red = [1.0, 0.0, 0.0] // Red color
  const green = [0.0, 1.0, 0.0] // Green color
  const gray = [0.5, 0.5, 0.5] // Gray color

  // Mix function to interpolate between two colors
  const mix = (color1: number[], color2: number[], factor: number) => {
    const [r, g, b] = color1.map((c1, index) => c1 * (1 - factor) + color2[index] * factor)
    return new Color(r, g, b)
  }

  if (t < 0.5) {
    // Interpolate between green and gray
    const mixRatio = 1.0 - (t - 0.1) / (0.5 - 0.1) // Linear transformation
    return mix(green, gray, mixRatio)
  } else {
    // Interpolate between gray and red
    const mixRatio = (t - 0.5) / 0.5 // Normalize t to the range [0, 1]
    return mix(gray, red, mixRatio)
  }
}

export const compareColorForBucketGLSL = `
    vec3 colorForBucket(float t) {
      if (t < 0.5) {
        // Interpolate between green and gray
        float mixRatio = 1.0 - (t - 0.1) / (0.5 - 0.1); // linear transformation so that colors closer to 0.1 are more red
        return mix(vec3(0.0, 1.0, 0.0), vec3(0.5, 0.5, 0.5), mixRatio);
      } else {
        // Interpolate between gray and red
        float mixRatio = (t - 0.5) / 0.5; // Normalize t to the range [0, 1] for mixing
        return mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 0.0, 0.0), mixRatio);
      }
    }
  `
