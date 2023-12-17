export default class Ajax{
    #props;
    #sendData;

    constructor(props) {
        this.#props = {
            url: props.url,
            method: (props.method ?? 'get').toUpperCase(),
            data: props.data ?? {},
            success: props.success ?? (() => {
            }),
            error: props.error ?? (() => {
            }),
            beforeSend: props.beforeSend ?? (() => {
            }),
            contentType: props.contentType ?? ''
        };

        this.#sendData = '';

        if (this.#props.data) {
            this.#sendData = this.#objToUrl(this.#props.data);
            this.#props.contentType = this.#props.contentType ? this.#props.contentType : 'application/x-www-form-urlencoded'
        }
    }

    #objToUrl(data, parentKey = '') {
        const params = [];

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const paramKey = parentKey ? `${parentKey}[${key}]` : key;
                if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                    const nestedParams = this.#objToUrl(data[key], paramKey);
                    params.push(nestedParams);
                } else if (Array.isArray(data[key])) {
                    data[key].forEach((item, index) => {
                        if (typeof item === 'object' && !Array.isArray(item)) {
                            const nestedParams = this.#objToUrl(item, `${paramKey}[${index}]`);
                            params.push(nestedParams);
                        } else {
                            params.push(`${paramKey}[]=${encodeURIComponent(item)}`);
                        }
                    });
                } else {
                    params.push(`${paramKey}=${encodeURIComponent(data[key])}`);
                }
            }
        }

        return params.join('&');
    }

    async send(){
        this.#props.beforeSend();

        let response = null;

        const xhr = new XMLHttpRequest();

        this.#props.url += this.#props.method === 'POST' || !this.#sendData ? '' : ('?' + this.#sendData);

        xhr.open(this.#props.method, this.#props.url, true,'','');

        if (this.#props.contentType) {
            xhr.setRequestHeader("Content-Type", this.#props.contentType);
        }

        xhr.send(this.#sendData);

        const that = this;

        xhr.onreadystatechange = await function () {
            if (this.readyState === 4) {
                response = {statusCode: xhr.status, statusText: xhr.statusText};
                try {
                    response.response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response.response = xhr.responseText;
                }

                if (this.status === 200) {
                    that.#props.success(response.response, response)
                } else {
                    that.#props.error(response.response, response)
                }
            }
        };
    }
}