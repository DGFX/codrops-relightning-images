import {
  Fn,
  float,
  luminance,
  modelScale,
  uniform,
  vec2,
  vec3,
} from 'three/tsl'
import { gui } from '../../debug.js'
import { smoothDepthNode } from '../depth-map.js'
import { mapNode } from '../textures.js'
import { coverScaleNode } from './texture-fit.js'

export const uDisplacementScale = uniform(4)
export const uNormalScale = uniform(3)
export const uDetailScale = uniform(3)

const DETAIL_GAIN = 4
const DETAIL_LOD = 3
const DETAIL_STEP_TEXELS = 8
const GRADIENT_TEXELS = 3

const depthGradient = Fn(([vUv, step]) => {
  const alongX = vec2(step.x, 0)
  const alongY = vec2(0, step.y)

  const left = smoothDepthNode.sample(vUv.sub(alongX)).r
  const right = smoothDepthNode.sample(vUv.add(alongX)).r
  const bottom = smoothDepthNode.sample(vUv.sub(alongY)).r
  const top = smoothDepthNode.sample(vUv.add(alongY)).r

  return vec2(right.sub(left), top.sub(bottom)).mul(0.5)
})

const detailGradient = Fn(([vUv, step]) => {
  const alongX = vec2(step.x, 0)
  const alongY = vec2(0, step.y)

  const map = (uvNode) => mapNode.sample(uvNode).level(DETAIL_LOD).rgb

  const left = luminance(map(vUv.sub(alongX)))
  const right = luminance(map(vUv.add(alongX)))
  const bottom = luminance(map(vUv.sub(alongY)))
  const top = luminance(map(vUv.add(alongY)))

  return vec2(right.sub(left), top.sub(bottom)).mul(0.5)
})

export const normalNode = Fn(([vUv]) => {
  const step = vec2(GRADIENT_TEXELS).div(vec2(smoothDepthNode.size()))

  const slope = depthGradient(vUv, step)
    .mul(coverScaleNode())
    .div(step.mul(modelScale.xy))
    .mul(uDisplacementScale)
    .mul(uNormalScale)

  const detail = detailGradient(
    vUv,
    vec2(DETAIL_STEP_TEXELS).div(vec2(mapNode.size())),
  )
    .mul(uDetailScale)
    .mul(DETAIL_GAIN)

  const shape = vec3(slope.x.negate(), slope.y.negate(), float(1))

  return shape.add(vec3(detail.x.negate(), detail.y.negate(), 0)).normalize()
})

const normal = gui.addFolder('Normal').close()
normal.add(uDisplacementScale, 'value', 0, 4, 0.005).name('displacement scale')
normal.add(uNormalScale, 'value', 0, 3, 0.01).name('normal scale')
normal.add(uDetailScale, 'value', 0, 10, 0.01).name('normal details')
