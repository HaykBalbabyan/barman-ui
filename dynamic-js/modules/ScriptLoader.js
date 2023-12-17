import {ajax} from '../Dynamic';

export default class ScriptLoader{

    srcs;
    scripts;

    constructor(JavaScript){

        this.srcs = JavaScript?.srcs || [];
        this.scripts = JavaScript?.scripts || [];

        this.#load();

    }

    async #load(){

        if (this.srcs){
            for (const src of this.srcs){
                await this.#loadFile(src);
            }
        }

        if (this.scripts) {
            for (const script of this.scripts){
                await eval(script);
            }
        }
    }

    async #loadFile(src){
        await ajax({
            url: src,
            success(content) {
                eval(content);
            }
        });
    }
}