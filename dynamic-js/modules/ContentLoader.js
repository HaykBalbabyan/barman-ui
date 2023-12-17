import {ajax,loadScripts} from "../Dynamic";

export default class ContentLoader{
    #loaded = {};
    #styles = {};

    #app;

    constructor(){
        this.#app = document.querySelector('#app');
    }

    async getContent(file,container = null){
        const that = this;

        if (this.#loaded[file]) {
            await this.#insertContent(this.#loaded[file],file,container);
            return;
        }

        await ajax({
            url: file,
            method: 'get',
            async success(content){
                that.#loaded[file] = content;
                await that.#insertContent(content,file,container);
            }
        })
    }

    #insertContent(HTML,file,container = null){
        const that = this;

        const parser = new DOMParser();
        const doc = parser.parseFromString(HTML, 'text/html');

        const scriptTags = doc.querySelectorAll('script');

        this.#clearStyles(file);

        if (this.#styles[file]){
            for (const src in this.#styles[file]){
                this.#insertStyles(this.#styles[file][src],src,file);
            }
        } else {
            this.#styles[file] = {};

            const styleTags = doc.querySelectorAll('style');

            for (const style of styleTags){
                if (style.getAttribute('src')) {
                    ajax({
                        url: style.getAttribute('src'),
                        success(css) {
                            that.#styles[file][style.getAttribute('src')] = {code: css};
                            that.#insertStyles(that.#styles[file][style.getAttribute('src')], style.getAttribute('src'), file);
                        }
                    })
                } else if(style.textContent) {
                    const key = ('' + Math.random()).replace('0.','');
                    that.#styles[file][key] = {code: style.textContent};
                    that.#insertStyles(that.#styles[file][key], key, file);
                }

                style.remove();
            }
        }


        if (container){
            container.innerHTML = doc.body.innerHTML;
        } else {
            this.#app.innerHTML = doc.body.innerHTML;
        }

        Array.from(scriptTags).map(script => {
            if(script.src && script.src.includes('.js')){
                loadScripts({srcs:[script.src]});
            }else{
                loadScripts({scripts:[script.textContent]});
            }
        });
    }


    #insertStyles(style,src,file){
        const element = document.createElement('style')
        const id = 'style-id-' + (('' + Math.random()).replace('0.',''));

        element.id = id;

        element.textContent = style.code;

        this.#styles[file][src].id = id;

        document.head.append(element)
    }

    #clearStyles(currentFile){
        for (const file in this.#styles){
            if (file !== currentFile && Object.keys(this.#styles[file]).length){
                for (const style of Object.values(this.#styles[file])){
                    const element = document.querySelector('#' + style.id);

                    element.remove();
                }

            }
        }
    }
}