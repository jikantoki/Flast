export const isURL = (input) => {
    const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*|flast-file:\/\/\S.*|file:\/\/\S.*)\S*$/;

    if (pattern.test(input)) {
        return true;
    }
    return pattern.test(`http://${input}`);
}

export const prefixHttp = (url) => {
    url = url.trim();
    return url.includes('://') ? url : `http://${url}`;
}