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
            let drinksData = [];

            const cups = elements('.controller-wrapper .drink-for-cup');

            for (const cup of cups){
                drinksData.push(cup.value || 'none');
            }

            that.#start(drinksData);
        });

    }

    #start(drinks){

        ajax({
            url: '/ajax',
            method:'get',
            data: {
                cup1:drinks[0],
                cup2:drinks[1],
                cup3:drinks[2],
                cup4:drinks[3],
            },
            success(response){}
        })
    }
}