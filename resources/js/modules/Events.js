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

        event('click','.controller-wrapper .send-button .send', function (e,button) {
            let cupsData = [];
            let drinksData = [];

            const cups = elements('.controller-wrapper .drink-for-cup');

            for (const cup of cups){
                if (cup.value){
                    cupsData.push(cup.dataset?.cup);
                    drinksData.push(cup.value);
                }
            }

            that.#start(cupsData,drinksData)

        });

    }

    #start(cups,drinks){
        cups = cups.join(',');
        drinks = drinks.join(',');

        if (cups)

        ajax({
            url: '/ajax',
            method:'get',
            data: {
                cups:cups,
                drinks:drinks,
            },
            success(response){}
        })
    }
}