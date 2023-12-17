import {event,router,element,elements,ajax} from "../../../dynamic-js/Dynamic";

export default class Events {
    constructor() {
        this.#addEvents();

        this.#initializeMovements();
    }

    #addEvents(){

        router.events.onLoad = (route) => {
            setTimeout(()=>{
                const loader = document.querySelector('#page-loader-wrapper');

                loader.style.opacity = 0;

                if(element('#rotate-error-wrapper')){
                    element('#rotate-error-wrapper').style.display = '';
                }

                const links = elements('#header .menu a');

                if (links){
                    for (const link of links){
                        if (router.parseUrl(window.location.origin + route.path,link.href).match){
                            link.classList.add('active')
                        }
                    }
                }

                setTimeout(()=>{
                    loader.style.display = 'none';
                },400);
            },500);
        };

        event('contextMenu', document, function (e) {
            e.preventDefault();
        });

        event('touchMove', document ,function(event){
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        event('touchEnd', document, function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    #initializeMovements(){
        const that = this;

        let fb = null,
            rl = null;

        const isTouch = window.matchMedia("(any-hover: none)").matches;

        const startEvent = isTouch ? 'touchStart' : 'mouseDown';
        const endEvent = isTouch ? 'touchEnd' : 'mouseUp';

        event(startEvent,'.controller-wrapper .control-button',function (e, button) {
            if (button?.dataset?.isBrake){
                fb = null;
                rl = null;
            } else {

                const direction = button?.dataset?.direction;

                fb = direction === 'forward' || direction === 'backward' ? direction : fb;
                rl = direction === 'right' || direction === 'left' ? direction : rl;

            }

            element('.temp').textContent = 'Directions: ' + fb + ' ' + rl;

            that.#move(fb,rl)
        });

        event(endEvent, '.controller-wrapper .control-button', function (e, button) {
            const direction = button?.dataset?.direction;

            fb = direction === 'forward' || direction === 'backward' ? null : fb;
            rl = direction === 'right' || direction === 'left' ? null : rl;

            element('.temp').textContent = 'Directions: ' + fb + ' ' + rl;

            that.#move(fb,rl)
        });

        if(!isTouch) {
            console.log(endEvent);
            event(endEvent, '.controller-wrapper', function (e, button) {
                if (button?.dataset?.isBrake) return;

                fb = null;
                rl = null;

                element('.temp').textContent = 'Directions: ' + fb + ' ' + rl;

                that.#move(fb,rl)
            });
        }
    }

    #move(fb,rl){
        const direction = rl || fb;

        const url = !direction ? '/brake' : '/move-' + direction;
        ajax({
            url: url,
            success(response){}
        })
    }
}