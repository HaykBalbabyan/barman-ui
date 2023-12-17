import Ajax from './modules/Ajax';
import ContentLoader from './modules/ContentLoader';
import ScriptLoader from './modules/ScriptLoader';
import Router from './modules/Router';
import {config} from '../dynamic.config';

export async function ajax(props) {
    return await new Ajax(props).send();
}

export async function loadScripts(scripts){
    return await new ScriptLoader(scripts);
}

const contentLoader = new ContentLoader();

export async function loadContent(file,container){
    await contentLoader.getContent(file,container);
}

export function setCookie(name, value, expirationInDays) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationInDays);

    const cookieValue = encodeURIComponent(value) + '; expires=' + expirationDate.toUTCString() + '; path=/';
    document.cookie = name + '=' + cookieValue;
}

export function getCookie(name) {
    const decodedCookies = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookies.split('; ');

    for (let i = 0; i < cookiesArray.length; i++) {
        const cookieParts = cookiesArray[i].split('=');
        if (cookieParts[0] === name) {
            return cookieParts[1] || '';
        }
    }

    return '';
}

export const router = new Router();

export function event(event,selector,callback,options = {}){
    if (
        typeof callback !== 'function' ||
        typeof event !== 'string' ||
        (
            typeof selector !== 'string' &&
            selector !== document &&
            selector !== window
        )
    ) return;

    event = event.toLowerCase();

    if (event.includes(',')){
        event = event.replace(/\s+/g,'').split(',')
    }

    const handler = typeof selector === 'string' ? document : selector;

    if (Array.isArray(event)){
        for (const evt of event){
            handler.removeEventListener(evt,eventListener,options);
            handler.addEventListener(evt,eventListener,options);
        }
    } else {
        handler.removeEventListener(event, eventListener,options);
        handler.addEventListener(event, eventListener,options);
    }



    function eventListener(e){
        if (selector === document || selector === window){
            const element = selector === document ? document : window;

            callback(e,element); return;
        } else if (e.target.matches(selector) || e.target.closest(selector)){
            const element = e.target.matches(selector) ? e.target : e.target.closest(selector);

            callback(e,element); return;
        }
    }
}

export function element(selector) {
    return document.querySelector(selector);
}

export function elements(selector) {
    return document.querySelectorAll(selector);
}

export class DynamicJS{
    config = {};

    constructor(){
        this.config = config;
    }
}

