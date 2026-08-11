import { texture } from 'three/tsl'
import { SRGBColorSpace, Texture, TextureLoader } from 'three/webgpu'
import { setDepthImage } from './depth-map.js'

export const mapNode = texture(new Texture())
export const depthNode = texture(new Texture())

const loader = new TextureLoader()

async function setMap(url) {
  const map = await loader.loadAsync(url)
  map.colorSpace = SRGBColorSpace
  mapNode.value.dispose()
  mapNode.value = map
}

async function setDepth(url) {
  const map = await loader.loadAsync(url)
  depthNode.value.dispose()
  depthNode.value = map
  setDepthImage(map.image)
}

export function setupTextures({ map, depth }) {
  return Promise.all([setMap(map), setDepth(depth)])
}
