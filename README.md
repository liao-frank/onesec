<p align="center"><img src="./onesec.png" width="64px"></p>

_Onesec_ is a tool for zero-knowledge position animations in React. After attaching _Onesec_ with the provided HOC, the tool will listen for re-renders and then automatically animate your component from its old position to its new position.

Want to customize the animation? Just change the `transition` CSS with your own duration or timing.


_Onesec_ was inspired by ['List Move Transitions' in Vue](https://vuejs.org/v2/guide/transitions.html#List-Move-Transitions). UI often reflows in unpredictable ways, making it difficult to use vanilla CSS transitions. By tracking positions with JS, we can animate without knowledge of keyframes!

##### Usage
The tool currently only works for class-based components.

```js
import React from 'react'
import attachOnesec from './onesec'

class MyComponent extends React.Component {
  ...
}

export default attachOnesec(MyComponent)
```

```css
.my-component {
  /* Specify the duration and timing that you want! */
  transition: transform 0.15s ease;
}
```
