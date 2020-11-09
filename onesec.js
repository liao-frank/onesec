import React from 'react';
import ReactDOM from 'react-dom';

const attachOnesec = (Component) => {
  if (!isStateful(Component)) {
    throw new Error('Onesec can only be attached to stateful components');
  }
  else {
    return wrapComponent(Component);
  }
};

const isStateful = (Component) => {
  return typeof Component === 'string' || Component.prototype.render;
}

const wrapComponent = (Component) => {
  const OnesecComponent = class extends React.Component {
    constructor(props) {
      super(props);
      this.ref = React.createRef();
      this.prevRect = undefined;
      this.prevScroll = undefined;
      this.componentWillNeedPaint = this.componentWillNeedPaint.bind(this);
      this.componentWillPaint = this.componentWillPaint.bind(this);
    }

    getSnapshotBeforeUpdate() {
      this.componentWillNeedPaint();
      return null;
    }

    componentDidUpdate() {
      this.componentWillPaint();
    }

    componentDidMount() {
      this.componentWillNeedPaint();
    }

    componentWillNeedPaint() {
      const node = this.getCurrentNode();
      if (node) {
        const { nextRect, nextScroll } = this.last(node);
        this.first(nextRect, nextScroll);
      }
    }

    componentWillPaint() {
      const node = this.getCurrentNode();
      if (node) {
        this.play(node, false);
        requestAnimationFrame(() => {
          const { nextRect, nextScroll } = this.last(node);
          this.invert(
            node,
            { prevRect: this.prevRect, prevScroll: this.prevScroll },
            { nextRect, nextScroll }
          );
          requestAnimationFrame(() => {
            this.play(node);
          });
          this.first(nextRect, nextScroll);
        });
      }
    }

    first(nextRect, nextScroll) {
      this.prevRect = nextRect;
      this.prevScroll = nextScroll;
    }

    last(node) {
      return {
        nextRect: node.getBoundingClientRect(),
        nextScroll: {
          x: window.scrollX,
          y: window.scrollY
        }
      };
    }

    invert(node, prev, next) {
      const { prevRect, prevScroll } = prev;
      const { nextRect, nextScroll } = next;
      const topDiff = (prevRect.top + prevScroll.y) - (nextRect.top + nextScroll.y);
      const leftDiff = (prevRect.left + prevScroll.x) - (nextRect.left + nextScroll.x);

      node.style.transition = 'none';
      node.style.transform = `translate(${leftDiff}px, ${topDiff}px)`;
    }

    play(node, transition=true) {
      node.style.transition = transition ? '' : 'none';
      node.style.transform = 'translate(0px, 0px)';
    }

    getCurrentNode() {
      if (this.ref.current) {
        return ReactDOM.findDOMNode(this.ref.current);
      }
    }

    render() {
      return (
        <Component
          ref={this.ref}
          onesec={this.componentWillPaint}
          willOnesec={this.componentWillNeedPaint}
          {...this.props}
        />
      );
    }
  }

  Object.defineProperty(OnesecComponent, 'name', {
    value: 'Onesec' + Component.name
  });
  return OnesecComponent;
}

export default attachOnesec;
