<h1 align="center" style="color: #09f;">RollupText 🌟</h1>

<div width="100%" align="center">
  <img width="100%" src="https://github.com/Creatlydev/rollup-text/blob/main/public/demo.gif?raw=true" alt="Demostración de RollupText">
</div>
<br>
<hr>
<b>RollupText</b> es un componente web interactivo que anima la transición de palabras mediante el desplazamiento vertical de letras. Puedes personalizar la animación, los estilos y la velocidad con diversas propiedades. Este componente es compatible con palabras de distintas longitudes y permite cualquier tipo de caracteres.

## Instalación 🚀

Para instalar `rollup-text` desde npm, utiliza el siguiente comando:

```bash
npm install rollup-text
```

Después de la instalación, importa el componente en tu proyecto:
```javascript
import { RollupText } from 'rollup-text';
```

También puedes usarlo directamente desde un CDN:
```javascript
import { RollupText } from 'https://cdn.jsdelivr.net/npm/rollup-text@latest/src/index.js';
```

## Configuración de Caracteres 🛠️

Puedes configurar los caracteres que deseas que estén disponibles utilizando el método estático configure. Esto es útil para especificar las letras que quieres que esten disponibles, por ejemplo si solo usaras letras del alfabeto y no numeros puedes configurarlo a tu gusto esto ayudara a no crear caracteres que no se usaran nunca, lo cual ayudara en el performance:
```javascript
// Solo letras del abecedario y unos cuantos caracteres especiales
RollupText.configure({
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#"
});
```

## Uso 📚
Una vez configurado, puedes utilizar el componente en tu HTML. Aquí tienes un ejemplo básico:
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
El componente es altamente personalizable mediante los siguientes atributos:

### Atributos Disponibles
- **`words`**: Un array de palabras que el componente animará. Ahora se permite usar palabras de longitudes diferentes y cualquier tipo de caracteres.

- **`text-case`**: Define el caso del texto. Puede ser uppercase, lowercase, o dejarse vacío para mantener el caso original.

- **`word-interval`**: Intervalo en milisegundos entre cada cambio de palabra.

- **`scroll-speed`**: Velocidad de desplazamiento de las letras en milisegundos.

- **`animation-curve`**: La curva de animación. Puede ser linear o bezier.

- **`distance-based-scroll`**: Si se especifica, el scroll se basará en la distancia entre letras, en lugar de una velocidad fija.


## Código Abierto y Contribuciones 🤝
Este proyecto es de código abierto y cualquier persona es bienvenida a contribuir. Si tienes ideas, mejoras o encuentras algún problema, no dudes en hacer un pull request o abrir un issue🚀