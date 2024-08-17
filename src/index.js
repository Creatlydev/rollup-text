const loaded = (function () {
  if (document.readyState === 'complete') {
    return Promise.resolve()
  } else {
    return new Promise((resolve) => {
      window.addEventListener('load', resolve)
    })
  }
})()

const lettersContainer = {}
const availableLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const cachedTransformations = new Map() // Cache global compartido por todas las instancias

export class RollupText extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <style>
        p, .letters, span {
          box-sizing: border-box;
        }
        :host {
          display: inline-block;
        }
        p {
          --duration: var(--scroll-speed);
          --time-function: var(--animation-function);
          font: inherit;
          height: 1em;
          line-height: 1em;
          color: inherit;
          overflow: hidden;
          margin: inherit;
          display: flex;
          gap: var(--letter-spacing, 10px);
        }
        .letters {
          text-align: center;
          display: inline-flex;
          flex-direction: column;
          transition: transform var(--duration) var(--time-function);
        }

        span {
          width: var(--w-letter, auto);
          height: 1em;
          padding: var(--padding, 0);
          border: var(--border, 1px solid transparent);
        }
      </style>
      <p id="content"></p>
    `
  }

  getCachedOrComputePosition(fromLetter, toLetter, transformedLetters) {
    const cacheKey = `${fromLetter}-${toLetter}-${this.animationCurve}`
    if (cachedTransformations.has(cacheKey)) {
      return cachedTransformations.get(cacheKey)
    }
    const fromPos = transformedLetters.indexOf(fromLetter)
    let toPos = transformedLetters.indexOf(toLetter)

    // Cálculo de la duración ajustada
    let adjustedDuration = null
    if (this.distanceBasedScroll) {
      const distance = Math.abs(toPos - fromPos)
      const baseSpeed = parseInt(this.scrollSpeed)
      adjustedDuration = (baseSpeed / transformedLetters.length) * distance
    }

    if (this.animationCurve === 'bezier') {
      toPos += 4 // Ajuste para la animación bezier
    }

    // Guardamos tanto la posición como la duración ajustada en el cache global
    const transformationData = { targetPos: toPos, adjustedDuration }
    cachedTransformations.set(cacheKey, transformationData)
    return transformationData
  }

  async connectedCallback() {
    await loaded
    this.content = this.shadowRoot.querySelector('#content')
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
    const p = this.shadowRoot.querySelector('p')

    p.style.setProperty('--scroll-speed', this.scrollSpeed)
    p.style.setProperty('--word-interval', this.wordInterval)
    p.style.setProperty(
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

    const transformText = (type) =>
      type === 'lowercase'
        ? availableLetters.toLowerCase()
        : availableLetters.toUpperCase()

    this.createLetterContainers(words)

    const animateLetters = (index = 0) => {
      if (!words.length || (words.length < 2 && index === 1)) return

      const currentWord = words[index % words.length]
      const nextWord = words[(index + 1) % words.length]
      currentWord?.split('').forEach((letter, i) => {
        const targetLetter = nextWord[i]
        const { targetPos, adjustedDuration } = this.getCachedOrComputePosition(
          letter,
          targetLetter,
          this.transformedLetters,
          this.animationCurve
        )

        if (adjustedDuration) {
          this.content.querySelector(
            `.letters:nth-child(${i + 1})`
          ).style.transitionDuration = `${adjustedDuration}ms`
        }
        this.content.querySelector(
          `.letters:nth-child(${i + 1})`
        ).style.transform = `translateY(-${targetPos}em)`
      })

      requestAnimationFrame(() =>
        setTimeout(() => animateLetters(index + 1), this.wordInterval)
      )
    }

    animateLetters()
  }

  createLetterContainers(words) {
    // Crea un DocumentFragment para todos los contenedores
    const fragmentLettersContainer = document.createDocumentFragment()
    this.content.innerHTML = ''
    for (let i = 0; i < (words[0]?.length || 0); i++) {
      const container = document.createElement('div')
      const fragmentContainer = document.createDocumentFragment()
      container.classList.add('letters')
      this.transformedLetters.split('').forEach((letter) => {
        const span = document.createElement('span')
        span.textContent = letter
        fragmentContainer.appendChild(span)
      })
      container.appendChild(fragmentContainer)

      if (this.animationCurve === 'bezier') {
        const prefixLetters = ['Z', 'Y', 'X', 'W']
        const suffixLetters = ['A', 'B', 'C', 'D']
        prefixLetters.forEach((letter) =>
          container.insertAdjacentHTML('afterbegin', `<span>${letter}</span>`)
        )
        suffixLetters.forEach((letter) =>
          container.insertAdjacentHTML('beforeend', `<span>${letter}</span>`)
        )

        container.style.transform = 'translateY(-4em)'
      }

      fragmentLettersContainer.appendChild(container)
      lettersContainer[`${this.textCase}-${this.animationCurve}`] = container
    }
    this.content.appendChild(fragmentLettersContainer)
  }
}

if (!window.customElements.get('rollup-text')) {
  customElements.define('rollup-text', RollupText)
}
