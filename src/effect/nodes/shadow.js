import {
  Fn,
  Loop,
  float,
  modelScale,
  positionWorld,
  uniform,
  vec3,
} from 'three/tsl'
import { gui } from '../../debug.js'
import { smoothDepthNode } from '../depth-map.js'
import { uLightPosition } from '../light.js'
import { uDisplacementScale } from './normal.js'
import { coverScaleNode } from './texture-fit.js'

export const uShadowIntensity = uniform(0.86)
export const uShadowSoftness = uniform(0.092)

const SHADOW_STEPS = 12
const MIN_LIGHT_ANGLE = 0.15
const SOFTNESS_GROWTH = 3

export const shadowNode = Fn(([vUv, depth]) => {
  const surfacePosition = vec3(
    positionWorld.xy,
    depth.sub(1).mul(uDisplacementScale),
  )
  const surfaceToLight = uLightPosition.sub(surfacePosition)
  const lightDirection = surfaceToLight.div(surfaceToLight.length().max(0.001))
  const surfaceDepth = smoothDepthNode.sample(vUv).r
  const remainingDepth = surfaceDepth.oneMinus()

  const rayOffset = lightDirection.xy
    .div(lightDirection.z.max(MIN_LIGHT_ANGLE))
    .mul(uDisplacementScale)
    .mul(coverScaleNode())
    .div(modelScale.xy)
    .mul(remainingDepth)

  const maxOcclusion = float(0).toVar()

  Loop(SHADOW_STEPS, ({ i }) => {
    const rayProgress = float(i).add(1).div(SHADOW_STEPS)
    const rayDepth = surfaceDepth.add(remainingDepth.mul(rayProgress))
    const blockerDepth = smoothDepthNode.sample(
      vUv.add(rayOffset.mul(rayProgress)),
    ).r
    const sampleSoftness = uShadowSoftness.mul(
      rayProgress.mul(SOFTNESS_GROWTH).add(1),
    )
    const sampleOcclusion = blockerDepth
      .sub(rayDepth)
      .div(sampleSoftness)
      .clamp(0, 1)

    maxOcclusion.assign(maxOcclusion.max(sampleOcclusion))
  })

  const lightFacingMask = lightDirection.z.greaterThan(0).select(1, 0)

  return maxOcclusion.mul(uShadowIntensity).mul(lightFacingMask).oneMinus()
})

const shadow = gui.addFolder('Shadow').close()
shadow.add(uShadowIntensity, 'value', 0, 1, 0.01).name('shadow intensity')
shadow.add(uShadowSoftness, 'value', 0.002, 0.2, 0.002).name('shadow softness')
