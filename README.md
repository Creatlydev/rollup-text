<h1 align="center">RollupText 🌟</h1>

<div align="center">
  <img src="https://github.com/Creatlydev/rollup-text/blob/main/public/demo.gif?raw=true" alt="Demostracion de rollup-text">
</div>
<br>

**RollupText** es un componente web interactivo que anima la transición de palabras mediante desplazamiento vertical de letras. Puedes personalizar la animación, los estilos y la velocidad con propiedades personalizadas.

## Instalación 🚀

Para instalar `rollup-text` desde npm, utiliza el siguiente comando:

```bash
npm install rollup-text
```

## Uso 📚

Una vez instalado, puedes usar el componente puedes importar `rollup-text` y usarlo en tu HTML. Aquí tienes un ejemplo básico:

```javascript
import 'rollup-text';
```

```html
<rollup-text 
  class="rollup" 
  words='["DESIGN", "Visual", "colors"]' 
  text-case="uppercase" 
  word-interval="2000"
  scroll-speed="1000"
  animation-curve="bezier"
  distance-based-scroll
>
</rollup-text>
```

## Personalización 🎨

Puedes personalizar el componente utilizando las siguientes atributos:

### Atributos

- **`words`**: Un array de palabras que el componente animará. Las palabras deben tener la misma longitud de letras. No se permiten caracteres ni números, solo letras del abecedario.
  
- **`text-case`**: Define el caso del texto. Puede ser `uppercase` o `lowercase`. 

- **`word-interval`**: Intervalo en milisegundos entre cada cambio de palabra.

- **`scroll-speed`**: Velocidad de desplazamiento de letras en milisegundos .

- **`animation-curve`**: La curva de animación. Puede ser `linear` o `bezier`.

- **`distance-based-scroll`**: Si se especifica este atributo, el scroll se basará en la distancia entre letras, de lo contrario, se utilizará el valor por defecto.

## Ejemplos de Personalización 🎨

Aquí tienes ejemplos de cómo puedes utilizar diferentes configuraciones:

```html
<!-- Ejemplo 1: Herramientas de desarrollo web -->
<rollup-text 
    class="rollup" 
    words='["DESIGN", "Visual", "colors"]' 
    text-case="uppercase" 
    word-interval="2000"
    scroll-speed="1000"
    animation-curve="bezier"
>
</rollup-text>

<rollup-text 
    class="rollup-2" 
    words='["FRAMER", "SKETCH", "ADOBEX"]' 
    text-case="uppercase"
    word-interval="1000"
    scroll-speed="3500"
    animation-curve="linear"
    distance-based-scroll
>
</rollup-text>

<rollup-text 
    class="rollup-3" 
    words='["Design", "Layout", "Visual", "Colors"]'
    text-case="uppercase" 
    word-interval="2000" 
    scroll-speed= "3000"
    animation-curve="bezier"
    distance-based-scroll
>
</rollup-text>

<rollup-text 
    class="rollup-4" 
    words='["Design", "Layout", "Visual", "Colors"]'
    word-interval="3000" 
    animation-curve="linear"
>
</rollup-text>
```