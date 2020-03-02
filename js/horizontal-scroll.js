class Scroll {
    constructor(selector, options) {
        this.selector = selector;
        this.options = {
            ...Scroll.defaults,
            ...options,
            controls: {
                ...Scroll.defaults.controls,
                ...options.controls,
            }
        };

        this.init();
    }

    init() {
        this.initData();
        this.moveContents();
        this.obtainInnerWidth();
        this.registerWheelEvent();
        this.registerButtonEvents();
        this.renderControls();
    }

    initData() {
        this.data = {
            marginLeft: 0,
            clicked: 0
        };
        this.resetMouse();
    }

    resetMouse() {
        this.data.mouse = {};
    }

    createInnerElement() {
        const el = document.createElement('div');
        el.classList.add(this.options.innerClass);

        return el;
    }

    createOuterElement() {
        const el = document.createElement('div');
        el.classList.add(this.options.outerClass);

        return el;
    }

    moveContents() {
        const { selector } = this;
        const outer = this.outer = this.createOuterElement();
        const inner = this.inner = this.createInnerElement();

        inner.append(
            ...selector.childNodes
        );
        outer.append(inner);
        selector.append(outer);
    }

    obtainInnerWidth() {
        const { inner } = this;

        const innerBound = inner.getBoundingClientRect();
        const fsBound = inner.firstElementChild.getBoundingClientRect();
        const lsBound = inner.lastElementChild.getBoundingClientRect();

        const innerWidth = this.innerWidth = lsBound.x + lsBound.width - fsBound.x;
        const maxMarginLeft = this.maxMarginLeft = innerWidth - innerBound.width;
        this.maxMarginLeft = maxMarginLeft < 0 ?
            0:
            maxMarginLeft;
    }

    onWheel(pixels, wheel = true, withAnimation = false) {
        const { marginLeft, lastWheel } = this.data;
        const { maxMarginLeft } = this;

        if (!maxMarginLeft) {
            return;
        }

        let newMarginLeft;

        this.data.lastWheel = Date.now();

        if (pixels < 0) {
            // to right (wheel up)

            newMarginLeft = marginLeft + pixels;

            newMarginLeft = newMarginLeft < 0 ? 
                0:
                newMarginLeft;
        } else {
            // to left (wheel down)

            newMarginLeft = marginLeft + pixels;
            newMarginLeft = newMarginLeft > maxMarginLeft ? 
                maxMarginLeft:
                newMarginLeft;
        }

        if (
            (
                marginLeft === newMarginLeft ||
                Date.now() - lastWheel < this.options.wheelInterval
            ) &&
            wheel
        ) {
            return console.log({
                pixels,
                marginLeft,
                newMarginLeft
            });
        }

        if (this.inner.classList.contains(this.options.animatedClass)) {
            this.inner.classList.remove(this.options.animatedClass);
        }

        if (withAnimation || wheel) {
            this.inner.classList.add(this.options.animatedClass);
        }

        this.data.marginLeft = newMarginLeft;
        this.inner.style.marginLeft = `-${newMarginLeft}px`;
        this.updateControls();
    }

    onMouseDown(e) {
        const { which, pageX } = e;

        if (which !== 1) {
            return;
        }

        this.data.mouse = {
            clicked: 1,
            startX: pageX,
            prevX: pageX,
            x: pageX
        };
        this.data.mouse.prevTime = this.data.mouse.startTime;
    }
    
    onMouseUp(e) {
        const { clicked, x } = this.data.mouse;

        if (!clicked) {
            return;
        }

        const { which, pageX } = e;

        if (which !== 1) {
            return;
        }

        this.data.mouse.clicked = 0;
        this.onWheel(x - pageX, false);
        this.resetMouse();
    }

    onMouseMove({ pageX }) {
        const { clicked, x } = this.data.mouse;

        if (!clicked) {
            return;
        }

        this.data.mouse.prevX = x;

        this.onWheel(this.data.mouse.x - pageX, false);
        this.data.mouse.x = pageX;
    } 

    registerWheelEvent() {
        this.inner.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.onWheel(e.deltaY / this.options.deltaDivider, e)
        });
    }

    checkWhetherControl(el) {
        const { enabled, left, right } = this.options.controls;

        return enabled && el === left || el === right;
    }

    registerButtonEvents() {
        this.inner.addEventListener('mousedown', (e) => {
            if (!this.checkWhetherControl(e.target)) {
                this.onMouseDown(e);
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (!this.checkWhetherControl(e.target)) {
                this.onMouseUp(e);
            }
        });
        document.addEventListener('mousemove', (e) =>
            this.onMouseMove(e)
        );
    }

    registerControlListener(el, type) {
        const delta = type === 'left' ? 
            +`-${this.options.controls.pace}`:
            this.options.controls.pace;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onWheel(delta, false, true);
        });
    }

    updateControlLeft(el) {
        if (this.data.marginLeft > 0) {
            el.classList.remove('none');
        } else {
            el.classList.add('none');
        }
    }

    updateControlRight(el) {
        if (this.data.marginLeft === this.maxMarginLeft) {
            el.classList.add('none');
        } else {
            el.classList.remove('none');
        }
    }

    updateControls() {
        const { enabled, left, right } = this.options.controls;

        if (!enabled) {
            return;
        }

        this.updateControlLeft(left);
        this.updateControlRight(right);
    }

    setUpControl(el, type) {
        const firstChild = el.firstElementChild;
        const selector = firstChild ?
            firstChild:
            el;

        switch (type) {
            case 'left':
                el.classList.add('s-control', this.options.leftControlClass);
                
                this.updateControlLeft(el);

                break;
            case 'right':
                el.classList.add('s-control', this.options.rightControlClass);

                this.updateControlRight(el);

                break;
        }

        this.registerControlListener(el, type);
    }

    setUpControls(left, right) {
        this.setUpControl(left, 'left');
        this.setUpControl(right, 'right');
    }

    renderControlLeft(left) {
        this.outer.prepend(left);
    }

    renderControlRight(right) {
        this.outer.append(right);
    }

    renderControls() {
        const { enabled, left, right } = this.options.controls;

        if (!enabled) {
            return;
        }

        this.setUpControls(left, right);        
        this.renderControlLeft(left);
        this.renderControlRight(right);
    }

    static defaults = {
        outerClass: 's-outer',
        innerClass: 's-inner',
        leftControlClass: 's-control-left',
        rightControlClass: 's-control-right',
        animatedClass: 's-animated',
        deltaDivider: 0.5,
        wheelInterval: 20,
        controls: {
            enabled: false,
            pace: 100
        }
    }
}