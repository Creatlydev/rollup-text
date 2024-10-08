const loaded = (function () {
  if (document.readyState === 'complete') {
    return Promise.resolve()
  } else {
    return new Promise((resolve) => {
      window.addEventListener('DOMContentLoaded', resolve)
    })
  }
})()

const lettersContainer = {}
let availableLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-!¡¿?|'

export class RollupText extends HTMLElement {
  // Método estático para configurar las letras disponibles
  static configure({ letters }) {
    if (typeof letters !== 'string' || !letters.length) {
      throw new Error(
        'Invalid value for available letters. It should be a non-empty string.'
      )
    }
    availableLetters = letters
  }

  constructor() {
    super()
    this.cachedTransformations = new Map()
    const style = `
      rollup-text {
        --duration: var(--scroll-speed);
        --time-function: var(--animation-function);
        height: 1em;
        line-height: 1em;
        overflow: hidden;
        display: inline-flex;
      }
      .letters {
        text-align: center;
        display: inline-flex;
        flex-direction: column;
        transition: transform var(--duration) var(--time-function);
      }
      .letter {
        height: 1em;
        background: transparent;
      }
    `

    // Inyectar estilos globalmente si no están ya presentes
    if (!document.querySelector('style[data-rollup-text]')) {
      const styleElement = document.createElement('style')
      styleElement.type = 'text/css'
      styleElement.setAttribute('data-rollup-text', '')
      styleElement.textContent = style
      document.head.appendChild(styleElement)
    }
  }

  _getCachedOrComputePosition(fromLetter, toLetter) {
    if (!toLetter) return { targetPos: null, adjustedDuration: null }
    fromLetter = fromLetter.toUpperCase()
    toLetter = toLetter.toUpperCase()
    const cacheKey = `${fromLetter}-${toLetter}-${this.animationCurve}`
    if (this.cachedTransformations.has(cacheKey)) {
      return this.cachedTransformations.get(cacheKey)
    }

    availableLetters = availableLetters.toUpperCase()
    const fromPos = availableLetters.indexOf(fromLetter)
    let toPos = availableLetters.indexOf(toLetter)

    // Cálculo de la duración ajustada
    let adjustedDuration = this._adjustDuration(toPos, fromPos)

    if (this.animationCurve === 'bezier') {
      toPos += 4 // Ajuste para la animación bezier
    }

    // Guardamos tanto la posición como la duración ajustada en el cache global
    const transformationData = { targetPos: toPos, adjustedDuration }
    this.cachedTransformations.set(cacheKey, transformationData)
    return transformationData
  }

  _adjustDuration(toPos, fromPos) {
    // Cálculo de la duración ajustada
    let adjustedDuration = null
    if (this.distanceBasedScroll) {
      const distance = Math.abs(toPos - fromPos)
      const baseSpeed = parseInt(this.scrollSpeed)
      adjustedDuration = (baseSpeed / availableLetters.length) * distance
    }
    return adjustedDuration
  }

  async connectedCallback() {
    await loaded
    this.updateProperties()
    this.startAnimation()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      [
        'text-case',
        'word-interval',
        'animation-curve',
        'words',
        'scroll-speed',
        'distance-based-scroll',
      ].includes(name)
    ) {
      this.updateProperties()
    }
  }

  get textCase() {
    return this.getAttribute('text-case') || 'uppercase'
  }

  set textCase(value) {
    this.setAttribute('text-case', value)
  }

  get wordInterval() {
    const interval = parseInt(this.getAttribute('word-interval'))
    return (
      (isNaN(interval) ? 2000 : Math.max(0, interval)) +
      parseInt(this.scrollSpeed)
    )
  }

  set wordInterval(value) {
    if (value < 0) {
      throw new DOMException('Word interval cannot be negative')
    }
    this.setAttribute('word-interval', String(value))
  }

  get animationCurve() {
    const animationCurve = this.getAttribute('animation-curve') || ''
    return (
      animationCurve ||
      ['bezier', 'linear'].includes(animationCurve.toLowerCase()) ||
      'linear'
    )
  }

  set animationCurve(value) {
    this.setAttribute('animation-curve', value)
  }

  get scrollSpeed() {
    return (this.getAttribute('scroll-speed') || '2000') + 'ms'
  }

  set scrollSpeed(value) {
    this.setAttribute('scroll-speed', value)
  }

  get words() {
    const wordsAttr = this.getAttribute('words')
    try {
      return wordsAttr ? JSON.parse(wordsAttr) : []
    } catch (error) {
      console.error(
        'Invalid words attribute format. It should be a JSON array of strings.'
      )
      return []
    }
  }

  set words(value) {
    this.setAttribute('words', JSON.stringify(value))
  }

  get prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion)').matches
  }

  get distanceBasedScroll() {
    return this.hasAttribute('distance-based-scroll')
  }

  get transformedLetters() {
    return this.textCase === 'lowercase'
      ? availableLetters.toLowerCase()
      : availableLetters.toUpperCase()
  }

  updateProperties() {
    const animationCurves = {
      bezier: 'cubic-bezier(.87,-.8, .03, 1.5)',
      linear: 'linear',
    }

    this.style.setProperty('--scroll-speed', this.scrollSpeed)
    this.style.setProperty('--word-interval', this.wordInterval)
    this.style.setProperty(
      '--animation-function',
      animationCurves[this.animationCurve] || animationCurves.linear
    )
  }

  startAnimation() {
    const words = this.words.length
      ? this.words.map((word) =>
          this.textCase === 'uppercase'
            ? word.toUpperCase()
            : word.toLowerCase()
        )
      : []
    const longestLength = Math.max(...words?.map((word) => word.length)) || 0

    this._createLetterContainers(longestLength)

    const animateLetters = (index = words.length - 1) => {
      if (!words.length || (words.length < 2 && index === 1)) return

      const currentWord = words[index % words.length]
      const nextWord = words[(index + 1) % words.length]

      currentWord?.split('').forEach((letter, i) => {
        const targetLetter = nextWord[i]
        const { targetPos, adjustedDuration } =
          this._getCachedOrComputePosition(letter, targetLetter)
        const letterElement = this.querySelector(`.letters:nth-child(${i + 1})`)

        if (adjustedDuration) {
          letterElement.style.transitionDuration = `${adjustedDuration}ms`
        }
        letterElement.style.transform = `translateY(-${targetPos}em)`

        this._handleWordsVariableLengths(
          i,
          currentWord,
          nextWord,
          longestLength
        )
      })

      requestAnimationFrame(() =>
        setTimeout(() => animateLetters(index + 1), this.wordInterval)
      )
    }
    animateLetters()
  }

  _handleWordsVariableLengths(i, currentWord, nextWord, longestLength) {
    // Handle extra letters for the next word
    if (nextWord[currentWord.length]) {
      for (let i = currentWord.length; i < nextWord.length; i++) {
        let indexLetter = this.transformedLetters.indexOf(nextWord[i])
        indexLetter += this.animationCurve === 'bezier' ? 4 : 0
        const letterElement = this.querySelector(`.letters:nth-child(${i + 1})`)
        letterElement.style.transform = `translateY(-${indexLetter}em)`
      }
    }

    // Hide any extra letters if the next not word[i] or the next word is shorter
    if (!nextWord[i] || nextWord.length < longestLength) {
      const extraLetters = this.querySelectorAll(
        `.letters:nth-child(n+${nextWord.length + 1})`
      )
      extraLetters.forEach((extraLetter) => {
        extraLetter.style.transitionDuration = '200ms'
        extraLetter.style.transform = 'translateY(100%)'
      })
    }
  }

  _createLetterContainers(longestLength) {
    const cacheKey = `${this.textCase}-${this.animationCurve}`
    this.innerHTML = ''
    // Crea un DocumentFragment para todos los contenedores
    const fragmentLettersContainer = document.createDocumentFragment()
    for (let i = 0; i < longestLength; i++) {
      if (lettersContainer[cacheKey]) {
        this.appendChild(lettersContainer[cacheKey].cloneNode(true))
        continue
      }

      const container = document.createElement('div')
      const fragmentContainer = document.createDocumentFragment()
      container.classList.add('letters')
      this.transformedLetters.split('').forEach((letter) => {
        const span = document.createElement('span')
        span.classList.add('letter')
        span.textContent = letter
        fragmentContainer.appendChild(span)
      })
      container.appendChild(fragmentContainer)

      if (this.animationCurve === 'bezier') {
        const prefixLetters = ['Z', 'Y', 'X', 'W']
        const suffixLetters = ['A', 'B', 'C', 'D']
        prefixLetters.forEach((letter) => {
          container.insertAdjacentHTML(
            'afterbegin',
            `<span class="letter">${letter}</span>`
          )
        })
        suffixLetters.forEach((letter) => {
          container.insertAdjacentHTML(
            'beforeend',
            `<span class="letter">${letter}</span>`
          )
        })

        container.style.transform = 'translateY(-4em)'
      }

      fragmentLettersContainer.appendChild(container)
      lettersContainer[cacheKey] = container.cloneNode(true)
    }
    this.appendChild(fragmentLettersContainer)
  }
}

if (!window.customElements.get('rollup-text')) {
  customElements.define('rollup-text', RollupText)
}
