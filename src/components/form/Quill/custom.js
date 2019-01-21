import { get, map } from 'lodash'
export const registerImageSrcSet = () => {
  const resizeOpts = [
    { target: 'mobile@4x', width: 1500 },
    { target: 'mobile@3x', width: 1200 },
    { target: 'mobile@2x', width: 800 },
    { target: 'tablet@2x', width: 2700 },
    { target: 'tablet@1x', width: 1000 },
    { target: 'desktop@2x', width: 3000 },
    { target: 'desktop@1x', width: 2000 }
  ]
  return new Promise(resolve => {
    const BlockEmbed = Quill.import('blots/block/embed')
    class ImageSrcSet extends BlockEmbed {
      static create(urlSet) {
        const node = super.create(urlSet)
        const srcsetArr = []
        map(resizeOpts, opt => {
          if (get(opt, 'target') && get(opt, 'width') && get(urlSet, get(opt, 'target'))) {
            srcsetArr.push(`${get(urlSet, get(opt, 'target'))} ${get(opt, 'width')}w`)
          }
        })
        node.src = get(urlSet, 'desktop')
        node.srcset = srcsetArr.join(',')
        return node
      }
    }
    ImageSrcSet.blotName = 'imageSrcSet'
    ImageSrcSet.tagName = 'img'
    Quill.register({ 'formats/imageSrcSet': ImageSrcSet, })
    resolve()    
  })
}

export const registerHr = () => {
  return new Promise(resolve => {
    const BlockEmbed = Quill.import('blots/block/embed')
    class Hr extends BlockEmbed {
      static create(value) {
        const node = super.create(value)
        return node
      }
    }
    Hr.blotName = 'hr'
    Hr.tagName = 'hr'
    Quill.register({ 'formats/hr': Hr, })
    resolve()
  })
}

export const registerEmbed = () => {
  return new Promise(resolve => {
    const BlockEmbed = Quill.import('blots/block/embed')
    class Embbed extends BlockEmbed {
      static create(value) {
        const node = super.create(value)
        node.innerHTML = value
        return node
      }
    }
    Embbed.blotName = 'embed'
    Embbed.tagName = 'div'
    Quill.register({ 'formats/embed': Embbed, })
    resolve()
  })
}

export const registerFigcaption = hintWording => {
  return new Promise(resolve => {
    const Block = Quill.import('blots/block')
    class Figcaption extends Block {
      static create(value) {
        const node = super.create(value)
        node.innerText = hintWording || 'Please enter the description for this image.'
        return node
      }
      static value(node) {
        return node.innerText
      }
    }
    Figcaption.blotName = 'figcaption'
    Figcaption.tagName = 'figcaption'
    Quill.register({ 'formats/figcaption': Figcaption, })  
    resolve()    
  })
}