import {getCookie, loadContent, setCookie, ajax} from "../Dynamic";
import {config} from '../../dynamic.config';
import routes from '../../routes';

export default class Router {

    #history = {};
    #currentRoute = null;

    referer = {};

    events = {
        onLoad:(route)=>{},
        onChange: (route,referer) => {},
    };

    constructor(){
        // const historyJson = getCookie('history');
        //
        // if (!historyJson){
        //     setCookie('history','{}',365);
        //     this.#history = {};
        // } else {
        //     try {
        //         this.#history = JSON.parse(historyJson);
        //     }catch (e){
        //         setCookie('history','{}',365);
        //         this.#history = {};
        //     }
        // }

        this.#init();
    }

    async #init(){
        this.referer = null;

        await this.update();

        this.#events();

        this.events.onLoad(this.#currentRoute);
    }

    #events(){
        window.addEventListener('popstate', (event) => {
            this.update();

            this.#generateReferer();

            setTimeout(()=>{
                if (typeof this.events.onChange === 'function') {
                    this.events.onChange(event.state, this.referer);
                }
            },1)
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('a[router]') || target.closest('a[router]')){
                const a = target.matches('a[router]') ? target : target.closest('a[router]');

                if ( !a.href ) return;

                event.preventDefault();

                this.go(a.href);
            }
        });
    }

    #generateReferer(){
        const id = this.getHistoryLastId();

        this.referer = {
            path : window.location.pathname,
            title : document.title,
            name : null,
            routeName: '',
        };

        if (id){
            this.referer.path = this.#history[id]?.route?.path || this.referer.path;
            this.referer.title = this.#history[id]?.route?.title || this.referer.title;
            this.referer.route = this.#history[id]?.route || null;
            this.referer.routeName = this.#history[id]?.routeName || '';
        }
    }

    #getRoute(url = null,returnRoute = false){

        const path = url ? url : window.location.href;

        if (url && typeof routes[url] === 'object'){
            return returnRoute ? routes[url] : url;
        }

        for (const name in routes){
            const route = routes[name];
            const parsedUrl = this.parseUrl(window.location.origin + route.path,path);
            if (parsedUrl.match){
                routes[name].variables = parsedUrl.variables;
                return returnRoute ? routes[name] : name ;
            }
        }

        if (typeof routes['not-found'] === 'object'){
            return returnRoute ? routes['not-found'] : 'not-found';
        }

        return null;
    }

    getCurrent(){
        return this.#currentRoute;
    }
    
    async update(){
        const routeName = this.#getRoute();

        if (routeName){
            const route = routes[routeName];

            this.#currentRoute = route;

            await loadContent(config.templates.urlpath + route.template);

            document.title = routeName ? route.title : '';
        }
    }

    go(url,force = false){
        if (window.location.href === url && !force){
            return;
        }

        const routeName = this.#getRoute(url);

        if (routeName || !routeName && force) {

            const lastId = this.getHistoryLastId();

            const data = {
                id : lastId + 1,
            };

            const route = routes[routeName] || {};

            if (routeName){
                data.page = route.name;
                data.routeName = routeName;
                data.route = route;
            } else {
                
                if (!this.isURL(url)){
                    throw new Error('Route error: Route can\'t be force changed because ' + url + ' is not right url' );
                    return;
                }
                
                data.page = 'No name';
                route.routeName = '';
                data.route = null;
            }

            this.#generateReferer();

            window.history.pushState(data,routeName ? route.title : data.name,url);

            this.#pushHistory(data);

            this.update();

            setTimeout(()=>{
                if (typeof this.events.onChange === 'function') {
                    this.events.onChange(data,this.referer);
                }
            },1)
        }
    }

    getHistoryLastId(){
        const ids = Object.keys(this.#history);

        return ids.length ? +ids[ids.length - 1] : 0;
    }

    #pushHistory(data){
        const history = this.#history;

        const lastId = this.getHistoryLastId();

        history[lastId + 1] = data;

        this.#history = history;

        // setCookie('history',JSON.stringify(history),1 / 24);
    }

    isURL(str) {
        const urlPattern = new RegExp('^(https?:\\/\\/)?' +
            '((([a-zA-Z\\d]([a-zA-Z\\d-]{0,61}[a-zA-Z\\d])?)\\.)+[a-zA-Z]{2,6}|' +
            '((\\d{1,3}\\.){3}\\d{1,3}))' +
            '(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*' +
            '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?' +
            '(\\#[-a-zA-Z\\d_]*)?$', 'i');

        return urlPattern.test(str);
    }

    parseUrl(template, url) {
        const regexPattern = template.replace(/\{[^\}]+\}/g, '([^\/]+)');

        const regex = new RegExp(`^${regexPattern}$`);

        const match = url.match(regex);

        if (match) {
            const parts = template.match(/\{[^\}]+\}/g);
            const values = {};

            if (parts) {
                parts.forEach((part, index) => {
                    const key = part.replace(/[{}]/g, '');
                    values[key] = match[index + 1];
                });
            }

            return {
                variables: values,
                match: true,
            };
        } else {
            return {
                variables: {},
                match: false,
            };
        }
    }
}
